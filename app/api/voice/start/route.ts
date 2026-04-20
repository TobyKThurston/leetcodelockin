import { NextRequest, NextResponse } from 'next/server';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import {
  pickVoiceInterviewProblem,
  type InterviewDifficulty,
} from '@/lib/interview';
import {
  getProblemBySlug,
  getPublishedSlugs,
  getUserSolvedSlugs,
} from '@/lib/problems-server';
import { checkVoiceQuota, recordVoiceUsage } from '@/lib/voice-quota';
import { INTERVIEWER_INTRO_TEXT } from '@/lib/voice-prompts';
import { getPostHogClient } from '@/lib/posthog-server';
import { logApiError } from '@/lib/log';

const requestSchema = z.object({
  difficulty: z.enum(['easy-medium', 'medium-hard']),
  durationMin: z.union([z.literal(30), z.literal(45)]),
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    if (process.env.VOICE_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Voice mock is temporarily unavailable.' },
        { status: 503 },
      );
    }

    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const quota = await checkVoiceQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            quota.reason === 'free_lifetime'
              ? "You've used your free voice mock. Upgrade to Pro for more."
              : "You've hit your monthly voice mock cap.",
          isPro: quota.isPro,
          used: quota.used,
          limit: quota.limit,
          reason: quota.reason,
        },
        { status: 403 },
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
    const { difficulty, durationMin } = parsed.data as {
      difficulty: InterviewDifficulty;
      durationMin: 30 | 45;
    };

    const [publishedSlugs, solvedSlugs, recentHistory] = await Promise.all([
      getPublishedSlugs(),
      getUserSolvedSlugs(user.id),
      db
        .from('mock_interviews')
        .select('problem1_slug, problem2_slug')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .then(r => r.data ?? []),
    ]);

    const recentSlugs = recentHistory.flatMap((r: Record<string, unknown>) =>
      [r.problem1_slug, r.problem2_slug].filter((v): v is string => typeof v === 'string' && v.length > 0),
    );

    const picked = pickVoiceInterviewProblem(difficulty, solvedSlugs, recentSlugs, publishedSlugs);
    const problem = await getProblemBySlug(picked.slug);
    if (!problem) {
      return NextResponse.json({ error: 'Could not load picked problem' }, { status: 500 });
    }
    // Never ship solutions to a voice mock client — this would defeat the
    // interview. getProblemBySlug merges them in server-side for /solve; we
    // strip them here.
    delete problem.solutions;

    const { data: inserted, error: insertError } = await db
      .from('mock_interviews')
      .insert({
        user_id: user.id,
        difficulty,
        mode: 'voice',
        problem1_slug: picked.slug,
        problem2_slug: null,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      logApiError('api/voice/start/insert', insertError);
      return NextResponse.json({ error: 'Failed to create voice session' }, { status: 500 });
    }

    const sessionId = inserted.id as string;

    // Consume quota at start, not end, so refreshing / abandoning still burns
    // the slot. Prevents a user from starting 10 sessions and cheaply burning
    // OpenAI $ while the cap appears untouched.
    await recordVoiceUsage(user.id, sessionId);

    getPostHogClient().capture({
      distinctId: user.id,
      event: 'voice_mock_started',
      properties: {
        session_id: sessionId,
        difficulty,
        duration_min: durationMin,
        problem_slug: picked.slug,
        is_pro: quota.isPro,
      },
    });

    // Generate the scripted intro audio server-side so the client can play it
    // immediately on receiving the session payload. ~1s extra latency on /start,
    // but saves a second round trip.
    let introAudioBase64: string | null = null;
    try {
      const speech = await generateSpeech({
        model: openai.speech('tts-1'),
        text: INTERVIEWER_INTRO_TEXT,
        voice: 'alloy',
        outputFormat: 'mp3',
      });
      introAudioBase64 = Buffer.from(speech.audio.uint8Array).toString('base64');
    } catch (ttsErr) {
      logApiError('api/voice/start/tts', ttsErr);
    }

    return NextResponse.json({
      sessionId,
      problem,
      durationSec: durationMin * 60,
      introText: INTERVIEWER_INTRO_TEXT,
      introAudioBase64,
      isFreeTrial: !quota.isPro,
    });
  } catch (err) {
    logApiError('api/voice/start', err);
    return NextResponse.json({ error: 'Something went wrong starting the session' }, { status: 500 });
  }
}
