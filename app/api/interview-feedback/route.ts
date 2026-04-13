import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabaseUser } from '@/lib/supabase';
import { checkAiRateLimit, getUserSubscription, recordAiUsage } from '@/lib/subscription';

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
  difficulty: z.enum(['easy', 'medium', 'hard']),
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
- Evaluate like a real interviewer — approach matters as much as correctness
- Be honest but encouraging. Point out real weaknesses without being harsh.
- Focus on: Did they identify the right pattern? Was their approach systematic? Is their code clean?
- Consider time management — did they allocate time well across both problems?

SCORING GUIDE (1-10):
- 9-10: Would definitely hire. Clean, optimal solution with clear communication
- 7-8: Likely hire. Good approach, minor issues
- 5-6: Borderline. Right direction but significant gaps
- 3-4: Unlikely hire. Missed the core pattern or major code issues
- 1-2: Not ready. No meaningful progress

READINESS LEVELS:
- interview_ready: Consistently scoring 7+ across problems
- almost_ready: Shows strong fundamentals but has specific gaps to address
- needs_practice: Understands basics but struggles under time pressure or with patterns
- not_ready: Needs more fundamental practice before timed interviews

Be specific in your feedback — reference their actual code and approach, not generic advice.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { isPro } = await getUserSubscription(user.id);
    if (!isPro) {
      return NextResponse.json({ error: 'Mock interview feedback is a Pro feature' }, { status: 403 });
    }

    const rateLimit = await checkAiRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'AI limit reached', used: rateLimit.used, limit: rateLimit.limit, reason: rateLimit.reason },
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
Description: ${p.descriptionMd}

Candidate's code:
\`\`\`python
${submissions[i]?.code || '# No code submitted'}
\`\`\`

Test results: ${submissions[i]?.testsPassed ?? 0}/${submissions[i]?.testsTotal ?? 0} passed
Time spent on this problem: ~${Math.round((submissions[i]?.timeSpentMs ?? 0) / 60000)} minutes
`,
  )
  .join('\n')}

Evaluate this candidate's performance across both problems.`;

    const { output } = await generateText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      output: Output.object({ schema: feedbackSchema }),
    });

    await recordAiUsage(user.id, 'interview-feedback');
    return NextResponse.json(output);
  } catch (err) {
    console.error('/api/interview-feedback error:', err);
    return NextResponse.json({ error: 'Something went wrong generating feedback.' }, { status: 500 });
  }
}
