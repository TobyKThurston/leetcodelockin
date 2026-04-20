import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { checkAiQuota, getUserSubscription, recordAiUsage } from '@/lib/subscription';
import { INJECTION_GUARD, fenceUserContent } from '@/lib/prompt-safety';
import { logApiError } from '@/lib/log';

const MAX_CODE_LENGTH = 10_000;
const MAX_DESCRIPTION_LENGTH = 8_000;

const requestSchema = z.object({
  problems: z
    .array(
      z.object({
        slug: z.string().max(200),
        title: z.string().max(200),
        difficulty: z.string().max(40),
        pattern: z.string().max(200),
        descriptionMd: z.string().max(MAX_DESCRIPTION_LENGTH),
      }),
    )
    .length(2),
  submissions: z
    .array(
      z.object({
        code: z.string().max(MAX_CODE_LENGTH).optional().default(''),
        testsPassed: z.number().int().min(0).max(1000).optional().default(0),
        testsTotal: z.number().int().min(0).max(1000).optional().default(0),
        timeSpentMs: z.number().min(0).max(1000 * 60 * 60 * 6).optional().default(0),
      }),
    )
    .length(2),
  totalTimeMs: z.number().min(0).max(1000 * 60 * 60 * 6),
  difficulty: z.enum(['easy-medium', 'medium-hard']),
});

export const maxDuration = 60;

const feedbackSchema = z.object({
  overallScore: z.number().min(1).max(10).describe('Overall interview performance 1-10'),
  timeManagement: z.object({
    score: z.number().min(1).max(10),
    commentary: z.string().describe('Brief assessment of how they used their time'),
  }),
  problems: z.array(
    z.object({
      slug: z.string(),
      approachScore: z.number().min(1).max(10).describe('How well they identified the right approach'),
      codeQualityScore: z.number().min(1).max(10).describe('Code readability, naming, structure'),
      correctness: z.enum(['fully_correct', 'partially_correct', 'incorrect', 'no_attempt']),
      patternIdentified: z.boolean().describe('Did they recognize the underlying pattern?'),
      strengths: z.array(z.string()).max(3).describe('What they did well on this problem'),
      improvements: z.array(z.string()).max(3).describe('Specific things to improve'),
      optimalApproach: z.string().describe('Brief description of the best approach'),
    }),
  ),
  overallStrengths: z.array(z.string()).min(1).max(3),
  overallImprovements: z.array(z.string()).min(1).max(3),
  interviewReadiness: z.enum(['not_ready', 'needs_practice', 'almost_ready', 'interview_ready']),
  tip: z.string().describe('One actionable tip for their next mock interview'),
});

const SYSTEM_PROMPT = `You are a senior technical interviewer at a top tech company, reviewing a candidate's mock interview performance. You just watched them solve 2 coding problems under a 45-minute time limit.

YOUR ROLE:
- Evaluate like a real interviewer — approach and correctness both matter
- Reward working solutions. A correct, reasonable solution is a strong signal.
- Feedback must be ACTIONABLE: point to things the candidate could actually do differently (time/space complexity, specific variable naming, a redundant loop, a cleaner idiom, edge case they missed). NEVER give vague criticisms or warnings for things outside their control.
- Do NOT dock points for things you cannot verify from the code alone (e.g. "communication", "explained their thinking"). You only see the code — judge the code.

SCORING GUIDE (1-10) — be generous when they got it right:
- 10: Passed all tests with a clean, optimal solution. No meaningful improvements.
- 9: Passed all tests with a solid solution. Maybe one small optimization or style nit.
- 8: Passed all tests, but the approach is noticeably suboptimal OR the code has real readability issues.
- 7: Mostly correct (passed most tests) with a good approach.
- 5-6: Partial solution, right direction but significant gaps.
- 3-4: Wrong approach or major bugs. Missed the core pattern.
- 1-2: Little to no meaningful progress.

HARD RULES:
- If they passed ALL test cases on a problem, approachScore and codeQualityScore must each be at least 8. Use 9 or 10 unless there is a concrete, nameable issue.
- If they passed ALL test cases on BOTH problems, overallScore must be at least 9.
- "improvements" entries must be concrete and code-specific — e.g. "You used a nested loop for the lookup; a hash map would drop it from O(n²) to O(n)" — NOT vague warnings like "be careful with edge cases" or "consider communication".
- If there is genuinely nothing to improve, return an empty improvements array. Do not invent problems.

READINESS LEVELS:
- interview_ready: Passed both problems cleanly, or consistently scoring 8+
- almost_ready: Strong fundamentals with one or two specific gaps
- needs_practice: Understands basics but struggles with patterns or time
- not_ready: Needs more fundamental practice before timed interviews

Be specific — reference their actual code. If you can't point to a line or a concrete change, don't write the critique.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { isPro } = await getUserSubscription(user.id);
    if (!isPro) {
      // Non-pro users get feedback on their one free mock.
      const db = getSupabase();
      const { count } = db
        ? await db
          .from('mock_interviews')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
        : { count: 0 };
      if ((count ?? 0) > 1) {
        return NextResponse.json({ error: 'Mock interview feedback is a Pro feature' }, { status: 403 });
      }
    }

    const quota = await checkAiQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: 'AI limit reached', used: quota.used, limit: quota.limit, reason: quota.reason },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { problems, submissions, totalTimeMs, difficulty } = parsed.data;

    const userPrompt = `Mock interview: ${difficulty} difficulty, ${Math.round(totalTimeMs / 60000)} minutes used out of 45.

${problems
  .map(
    (p: { title: string; difficulty: string; pattern: string; descriptionMd: string }, i: number) => `
--- PROBLEM ${i + 1}: ${p.title} (${p.difficulty}) ---
Pattern: ${p.pattern}
Description:
${fenceUserContent('description', p.descriptionMd)}

Candidate's code:
${fenceUserContent('code', submissions[i]?.code || '# No code submitted')}

Test results: ${submissions[i]?.testsPassed ?? 0}/${submissions[i]?.testsTotal ?? 0} passed
Time spent on this problem: ~${Math.round((submissions[i]?.timeSpentMs ?? 0) / 60000)} minutes
`,
  )
  .join('\n')}

Evaluate this candidate's performance across both problems.`;

    const { output } = await generateText({
      model: openai('gpt-4o'),
      system: `${SYSTEM_PROMPT}\n\n${INJECTION_GUARD}`,
      prompt: userPrompt,
      output: Output.object({ schema: feedbackSchema }),
    });

    await recordAiUsage(user.id, 'interview-feedback');
    return NextResponse.json(output);
  } catch (err) {
    logApiError('api/interview-feedback', err);
    return NextResponse.json({ error: 'Something went wrong generating feedback.' }, { status: 500 });
  }
}
