import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { getProblemBySlug, getPublishedSlugs } from '@/lib/problems-server';
import { VOICE_SCORECARD_SYSTEM } from '@/lib/voice-prompts';
import { fenceUserContent } from '@/lib/prompt-safety';
import { logApiError } from '@/lib/log';

// Scorecard generation uses gpt-4o and can take 15-30s.
export const maxDuration = 60;

const MAX_CODE = 10_000;
const MAX_TRANSCRIPT_CHARS = 40_000;

const requestSchema = z.object({
  sessionId: z.string().min(1),
  transcript: z
    .array(
      z.object({
        role: z.enum(['user', 'ai']),
        text: z.string().max(2_000),
        tSec: z.number().min(0).max(60 * 60),
      }),
    )
    .max(400),
  finalCode: z.string().max(MAX_CODE),
  runResults: z
    .object({ passed: z.number().int().min(0).max(1_000), total: z.number().int().min(0).max(1_000) })
    .nullable(),
  timeUsedMs: z.number().min(0).max(60 * 60 * 1_000),
});

const scorecardSchema = z.object({
  scores: z.object({
    correctness: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5),
    complexity: z.number().int().min(1).max(5),
    problemSolving: z.number().int().min(1).max(5),
  }),
  summaryParagraph: z.string().min(20).max(1_200),
  quotes: z
    .array(
      z.object({
        text: z.string().max(500),
        tSec: z.number().min(0),
        tag: z.enum(['strong', 'weak']),
      }),
    )
    .min(1)
    .max(4),
  suggestedNextProblems: z
    .array(z.object({ slug: z.string().max(200), reason: z.string().max(300) }))
    .max(3),
});

export type VoiceScorecard = z.infer<typeof scorecardSchema>;

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }
    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
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
    const { sessionId, transcript, finalCode, runResults, timeUsedMs } = parsed.data;

    const { data: session, error: sErr } = await db
      .from('mock_interviews')
      .select('id, user_id, mode, status, problem1_slug, difficulty')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (sErr || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.mode !== 'voice') {
      return NextResponse.json({ error: 'Not a voice session' }, { status: 400 });
    }

    const problem = await getProblemBySlug(session.problem1_slug);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 500 });
    }

    const publishedSlugs = await getPublishedSlugs();
    const candidateSlugsForRecs = [...publishedSlugs].slice(0, 200); // cap prompt size

    const transcriptJson = JSON.stringify(transcript).slice(0, MAX_TRANSCRIPT_CHARS);

    const userPrompt =
      `Difficulty tier: ${session.difficulty}\n` +
      `Duration used: ${Math.round(timeUsedMs / 60_000)} minutes\n` +
      `Test results at time-up: ${runResults ? `${runResults.passed}/${runResults.total}` : 'no tests run'}\n\n` +
      `Problem:\n${fenceUserContent('problem', `${problem.title}\n\n${problem.descriptionMd}`)}\n\n` +
      `Candidate's final code:\n${fenceUserContent('code', finalCode || '# (no code written)')}\n\n` +
      `Full transcript (JSON array of {role, text, tSec}):\n${fenceUserContent('transcript', transcriptJson)}\n\n` +
      `Curriculum slugs to pick suggestedNextProblems from:\n${fenceUserContent('slugs', candidateSlugsForRecs.join(', '))}\n\n` +
      `Write the scorecard now. Ground every claim in something that actually happened in the transcript or code.`;

    const { output } = await generateText({
      model: openai('gpt-4o'),
      system: VOICE_SCORECARD_SYSTEM,
      prompt: userPrompt,
      output: Output.object({ schema: scorecardSchema }),
    });

    // Filter any hallucinated slugs the model invented.
    const pubSet = new Set(publishedSlugs);
    const cleanedRecs = output.suggestedNextProblems.filter(r => pubSet.has(r.slug));

    const finalScorecard: VoiceScorecard = {
      ...output,
      suggestedNextProblems: cleanedRecs,
    };

    const { error: updateErr } = await db
      .from('mock_interviews')
      .update({
        problem1_code: finalCode,
        problem1_results: runResults,
        time_used_ms: timeUsedMs,
        completed_at: new Date().toISOString(),
        status: 'completed',
        voice_scorecard: finalScorecard,
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);
    if (updateErr) {
      logApiError('api/voice/end/update', updateErr);
    }

    return NextResponse.json(finalScorecard);
  } catch (err) {
    logApiError('api/voice/end', err);
    return NextResponse.json({ error: 'Scorecard failed' }, { status: 500 });
  }
}
