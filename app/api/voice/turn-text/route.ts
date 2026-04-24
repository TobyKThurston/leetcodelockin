import { NextRequest, NextResponse } from 'next/server';
import {
  generateText,
  Output,
  experimental_generateSpeech as generateSpeech,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { TURN_POLICY_SYSTEM } from '@/lib/voice-prompts';
import { fenceUserContent } from '@/lib/prompt-safety';
import { logApiError } from '@/lib/log';

// Text-first turn handler: skips Whisper entirely. The client transcribes the
// user's speech locally via the browser's Web Speech API and posts the text
// here. Same policy LLM + TTS pipeline as /api/voice/turn, but much lower
// latency (no audio upload, no Whisper round-trip) and no Whisper spend.
export const maxDuration = 30;

const MAX_CODE = 10_000;
const MAX_HISTORY_CHARS = 12_000;
const MAX_USER_TEXT = 2_000;

const policySchema = z.object({
  shouldSpeak: z.boolean(),
  reason: z.enum(['direct_question', 'silence_60s', 'silence_3m', 'tests_passed', 'time_warning', 'none']),
  text: z.string().max(400),
});

const bodySchema = z.object({
  sessionId: z.string().min(1),
  userText: z.string().min(1).max(MAX_USER_TEXT),
  codeSnapshot: z.string().max(MAX_CODE).optional().default(''),
  transcriptHistory: z.array(z.object({
    role: z.enum(['user', 'ai']),
    text: z.string(),
    tSec: z.number(),
  })).optional().default([]),
  elapsedSec: z.number().int().min(0).max(60 * 60).optional().default(0),
  testResults: z.object({
    passed: z.number(),
    total: z.number(),
  }).nullable().optional().default(null),
  problemTitle: z.string().max(200).optional().default(''),
});

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

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { sessionId, userText, codeSnapshot, transcriptHistory, elapsedSec, testResults, problemTitle } = parsed.data;
    const cleanUserText = userText.trim();
    if (!cleanUserText) {
      return NextResponse.json({
        shouldSpeak: false,
        reason: 'none',
        aiText: null,
        audioBase64: null,
      });
    }

    const { data: session, error: sErr } = await db
      .from('mock_interviews')
      .select('id, user_id, mode, status')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (sErr || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.mode !== 'voice') {
      return NextResponse.json({ error: 'Not a voice session' }, { status: 400 });
    }
    if (session.status !== 'in_progress') {
      return NextResponse.json({ error: 'Session not active' }, { status: 409 });
    }

    const history = JSON.stringify(transcriptHistory).slice(-MAX_HISTORY_CHARS);
    const testResultsLine = testResults
      ? `last run: ${testResults.passed}/${testResults.total} tests passed`
      : 'no recent tests';

    const userPrompt =
      `Elapsed session time: ${Math.floor(elapsedSec / 60)}m${elapsedSec % 60}s.\n` +
      `Problem: ${fenceUserContent('problem_title', problemTitle)}\n\n` +
      `Test state: ${testResultsLine}\n\n` +
      `Current code:\n${fenceUserContent('code', codeSnapshot || '# (no code yet)')}\n\n` +
      `Transcript history (JSON array of {role, text, tSec}):\n${fenceUserContent('history', history)}\n\n` +
      `The candidate just said:\n${fenceUserContent('utterance', cleanUserText)}\n\n` +
      `Decide whether to speak on this turn.`;

    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      system: TURN_POLICY_SYSTEM,
      prompt: userPrompt,
      output: Output.object({ schema: policySchema }),
    });

    let audioBase64: string | null = null;
    const shouldSpeak = output.shouldSpeak && output.text.trim().length > 0;
    if (shouldSpeak) {
      try {
        const speech = await generateSpeech({
          model: openai.speech('tts-1'),
          text: output.text,
          voice: 'alloy',
          outputFormat: 'mp3',
        });
        audioBase64 = Buffer.from(speech.audio.uint8Array).toString('base64');
      } catch (ttsErr) {
        logApiError('api/voice/turn-text/tts', ttsErr);
      }
    }

    return NextResponse.json({
      shouldSpeak,
      reason: output.reason,
      aiText: shouldSpeak ? output.text : null,
      audioBase64,
    });
  } catch (err) {
    logApiError('api/voice/turn-text', err);
    return NextResponse.json({ error: 'Turn failed' }, { status: 500 });
  }
}
