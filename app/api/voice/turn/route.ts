import { NextRequest, NextResponse } from 'next/server';
import {
  generateText,
  Output,
  experimental_transcribe as transcribe,
  experimental_generateSpeech as generateSpeech,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { TURN_POLICY_SYSTEM } from '@/lib/voice-prompts';
import { fenceUserContent } from '@/lib/prompt-safety';
import { logApiError } from '@/lib/log';

// Max per-turn latency budget: Whisper (~1.5s) + gpt-4o-mini (~1s) + TTS (~1s).
export const maxDuration = 45;

const MAX_CODE = 10_000;
const MAX_HISTORY_CHARS = 12_000;

const policySchema = z.object({
  shouldSpeak: z.boolean(),
  reason: z.enum(['direct_question', 'silence_60s', 'silence_3m', 'tests_passed', 'time_warning', 'none']),
  text: z.string().max(400),
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

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form body' }, { status: 400 });
    }

    const sessionId = form.get('session_id');
    const audio = form.get('audio');
    const codeSnapshot = (form.get('code_snapshot') as string | null) ?? '';
    const historyRaw = (form.get('transcript_history') as string | null) ?? '[]';
    const elapsedSecStr = (form.get('elapsed_sec') as string | null) ?? '0';
    const testResultsRaw = (form.get('test_results') as string | null) ?? 'null';
    const problemTitle = (form.get('problem_title') as string | null) ?? '';

    if (typeof sessionId !== 'string' || !sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }
    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: 'audio blob required' }, { status: 400 });
    }
    if (codeSnapshot.length > MAX_CODE) {
      return NextResponse.json({ error: 'code snapshot too large' }, { status: 413 });
    }

    const { data: session, error: sErr } = await db
      .from('mock_interviews')
      .select('id, user_id, mode, status, problem1_slug')
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

    // 1) Transcribe the new audio chunk.
    const audioBytes = new Uint8Array(await audio.arrayBuffer());
    const { text: userText } = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: audioBytes,
    });
    const cleanUserText = (userText ?? '').trim();

    // If Whisper returned nothing (silence), no-op — don't drive the LLM.
    if (!cleanUserText) {
      return NextResponse.json({
        transcribedText: '',
        shouldSpeak: false,
        reason: 'none',
        aiText: null,
        audioBase64: null,
      });
    }

    // 2) Build the prompt. History + code + run results + latest user turn.
    let history = '[]';
    try {
      const parsedHistory = JSON.parse(historyRaw);
      if (Array.isArray(parsedHistory)) {
        const trimmed = JSON.stringify(parsedHistory).slice(-MAX_HISTORY_CHARS);
        history = trimmed;
      }
    } catch {
      // ignore malformed history
    }

    let testResultsLine = 'no recent tests';
    try {
      const r = JSON.parse(testResultsRaw) as { passed: number; total: number } | null;
      if (r && typeof r.passed === 'number' && typeof r.total === 'number') {
        testResultsLine = `last run: ${r.passed}/${r.total} tests passed`;
      }
    } catch {
      // ignore
    }

    const elapsedSec = Math.max(0, Math.min(parseInt(elapsedSecStr, 10) || 0, 60 * 60));

    const userPrompt =
      `Elapsed session time: ${Math.floor(elapsedSec / 60)}m${elapsedSec % 60}s.\n` +
      `Problem: ${fenceUserContent('problem_title', problemTitle)}\n\n` +
      `Test state: ${testResultsLine}\n\n` +
      `Current code:\n${fenceUserContent('code', codeSnapshot || '# (no code yet)')}\n\n` +
      `Transcript history (JSON array of {role, text, tSec}):\n${fenceUserContent('history', history)}\n\n` +
      `The candidate just said:\n${fenceUserContent('utterance', cleanUserText)}\n\n` +
      `Decide whether to speak on this turn.`;

    // 3) Policy + reply in a single mini call.
    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      system: TURN_POLICY_SYSTEM,
      prompt: userPrompt,
      output: Output.object({ schema: policySchema }),
    });

    // 4) TTS only when we've decided to speak.
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
        const buf = speech.audio.uint8Array;
        audioBase64 = Buffer.from(buf).toString('base64');
      } catch (ttsErr) {
        logApiError('api/voice/turn/tts', ttsErr);
      }
    }

    return NextResponse.json({
      transcribedText: cleanUserText,
      shouldSpeak,
      reason: output.reason,
      aiText: shouldSpeak ? output.text : null,
      audioBase64,
    });
  } catch (err) {
    logApiError('api/voice/turn', err);
    return NextResponse.json({ error: 'Turn failed' }, { status: 500 });
  }
}
