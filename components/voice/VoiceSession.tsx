'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import posthog from 'posthog-js';
import {
  Mic, MicOff, Play, Square, X, PanelRight, PanelRightClose,
  ArrowRight, Loader2, AlertCircle,
} from 'lucide-react';
import type { BeforeMount } from '@monaco-editor/react';
import type { ProblemContent } from '@/lib/problem-types';
import { runTests, ensureWorker } from '@/lib/pyodide-runner';
import AppNav from '@/components/AppNav';
import ThemeToggle from '@/components/ThemeToggle';
import VoiceQuotaBadge from '@/components/voice/VoiceQuotaBadge';
import { getVoiceQuota } from '@/app/interview/actions';
import type { VoiceQuotaResult } from '@/lib/voice-quota';

// Observe the body's `theme-dark` / `theme-light` class so Monaco (whose
// colors must be literal hex) re-renders when the user flips the theme.
function useAppTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const read = () =>
      setTheme(document.body.classList.contains('theme-dark') ? 'dark' : 'light');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// ─── Constants ───────────────────────────────────────────────────────────────

// Hysteresis: a higher threshold must be crossed to START recording (so we
// don't record on room tone), but a lower one marks the utterance as still
// ongoing (so brief pauses inside a sentence don't flush early). Background
// noise typically sits around ~0.008 RMS on a decent laptop mic.
const VAD_START_THRESHOLD   = 0.020;
const VAD_SILENCE_THRESHOLD = 0.005;  // low enough to accumulate silence even
                                      // on mics with non-trivial room tone
const SILENCE_FLUSH_MS      = 900;    // quiet-below-silence-threshold → flush
const MIN_UTTERANCE_MS      = 400;    // drop blips shorter than this
const MAX_UTTERANCE_MS      = 5_000;  // hard cap so recordings always post,
                                      // even under continuous background noise
const BARGE_IN_HOLD_MS      = 250;    // sustained speech to cut off AI TTS
const TICK_MS               = 50;
const SILENCE_TURN_FLUSH_MS = 2500;   // if the user stops speaking for this
                                      // long after a finalized speech segment,
                                      // treat it as "end of thought" and send
                                      // the accumulated text to the LLM.

// ─── Web Speech API types (not in the default TS DOM lib) ────────────────────
interface SpeechRecognitionAlt { transcript: string }
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlt;
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Back-compat for the live-transcription overlay's green-dot "Listening…"
// indicator — we want the dot to light up the moment speech starts, so the
// overlay uses the start threshold.
const VAD_THRESHOLD = VAD_START_THRESHOLD;

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

// ─── Types ───────────────────────────────────────────────────────────────────

interface StartResponse {
  sessionId: string;
  problem: ProblemContent;
  durationSec: number;
  introText: string;
  introAudioBase64: string | null;
  isFreeTrial: boolean;
}

interface Turn {
  role: 'user' | 'ai';
  text: string;
  tSec: number;
}

interface Scorecard {
  scores: {
    correctness: number;
    communication: number;
    complexity: number;
    problemSolving: number;
  };
  summaryParagraph: string;
  quotes: Array<{ text: string; tSec: number; tag: 'strong' | 'weak' }>;
  suggestedNextProblems: Array<{ slug: string; reason: string }>;
}

type Phase = 'intro' | 'starting' | 'active' | 'ending' | 'scorecard' | 'practice' | 'error';
type MicState = 'unrequested' | 'requesting' | 'granted' | 'denied';

interface Props {
  difficulty: 'easy-medium' | 'medium-hard';
  durationMin: 30 | 45;
}

// ─── Monaco themes ───────────────────────────────────────────────────────────
// Monaco requires literal hex colors, so we ship a light and a dark theme and
// switch the `theme` prop based on useAppTheme(). Colors kept in sync with
// ProblemPage.tsx so the voice editor looks identical to the solve-page one.
const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('lc-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword',  foreground: 'cf222e' },
      { token: 'string',   foreground: '0a3069' },
      { token: 'comment',  foreground: '6e7781', fontStyle: 'italic' },
      { token: 'number',   foreground: '0550ae' },
      { token: 'type',     foreground: '953800' },
      { token: 'function', foreground: '8250df' },
    ],
    colors: {
      'editor.background':                  '#eef3ff',
      'editor.foreground':                  '#0f172a',
      'editor.lineHighlightBackground':     '#e6edff',
      'editor.lineHighlightBorder':         '#00000000',
      'editor.selectionBackground':         '#3b82f640',
      'editor.inactiveSelectionBackground': '#94a3b81a',
      'editorLineNumber.foreground':        '#cbd5e1',
      'editorLineNumber.activeForeground':  '#2563eb',
      'editorCursor.foreground':            '#2563eb',
      'editorIndentGuide.background1':      '#e2e8f0',
      'editorIndentGuide.activeBackground1':'#cbd5e1',
      'editorWidget.background':            '#ffffff',
      'editorWidget.border':                '#bfdbfe',
      'editorSuggestWidget.background':     '#ffffff',
      'editorSuggestWidget.border':         '#bfdbfe',
      'editorSuggestWidget.foreground':     '#0f172a',
      'editorSuggestWidget.selectedBackground': '#eff6ff',
      'scrollbarSlider.background':         '#2563eb14',
      'scrollbarSlider.hoverBackground':    '#2563eb26',
      'scrollbarSlider.activeBackground':   '#2563eb40',
    },
  });

  monaco.editor.defineTheme('lc-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword',  foreground: '79b8ff' },
      { token: 'string',   foreground: '9ecbff' },
      { token: 'comment',  foreground: '6a737d', fontStyle: 'italic' },
      { token: 'number',   foreground: 'f8cc7a' },
      { token: 'type',     foreground: 'b392f0' },
      { token: 'function', foreground: 'b392f0' },
    ],
    colors: {
      'editor.background':                  '#0f1729',
      'editor.foreground':                  '#e5e7eb',
      'editor.lineHighlightBackground':     '#131b30',
      'editor.lineHighlightBorder':         '#00000000',
      'editor.selectionBackground':         '#3b82f640',
      'editor.inactiveSelectionBackground': '#ffffff0d',
      'editorLineNumber.foreground':        '#334155',
      'editorLineNumber.activeForeground':  '#94a3b8',
      'editorCursor.foreground':            '#60a5fa',
      'editorIndentGuide.background1':      '#1e293b',
      'editorWidget.background':            '#0f1729',
      'editorSuggestWidget.background':     '#0f1729',
      'editorSuggestWidget.border':         '#1e293b',
      'scrollbarSlider.background':         '#ffffff08',
      'scrollbarSlider.hoverBackground':    '#ffffff0f',
      'scrollbarSlider.activeBackground':   '#ffffff14',
    },
  });
};

function base64ToBlob(b64: string, mime = 'audio/mpeg'): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function fmtTime(sec: number): string {
  const m = Math.max(0, Math.floor(sec / 60));
  const s = Math.max(0, Math.floor(sec % 60));
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function VoiceSession({ difficulty, durationMin }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [startError, setStartError] = useState<string | null>(null);
  const [session, setSession] = useState<StartResponse | null>(null);
  const [code, setCode] = useState<string>('');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [runResults, setRunResults] = useState<{ passed: number; total: number } | null>(null);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [scorecardError, setScorecardError] = useState<string | null>(null);
  const [micState, setMicState] = useState<MicState>('unrequested');
  // Voice quota for the counter UI. Fetched once on mount and refreshed
  // after a session ends so the scorecard shows the updated count.
  const [voiceQuota, setVoiceQuota] = useState<VoiceQuotaResult | null>(null);
  // Surface the recorder + turn pipeline in the live-transcription overlay
  // so the user can see whether the mic → Whisper → TTS loop is healthy.
  const [isRecording, setIsRecording] = useState(false);
  // Live transcription (Web Speech API) — these populate word-by-word as
  // the user speaks so they see the transcript build in real time.
  const [liveInterim, setLiveInterim] = useState('');
  const [liveFinal, setLiveFinal] = useState('');
  const [turnStatus, setTurnStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'sending' }
    | { kind: 'ok' }
    | { kind: 'empty' }  // route returned 200 but transcribedText was ''
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  const appTheme = useAppTheme();

  // Load the voice quota once on mount so the intro screen can show it.
  useEffect(() => {
    void getVoiceQuota().then(setVoiceQuota).catch(() => { /* ignore — UI hides */ });
  }, []);

  // Audio infra refs (persist across renders, don't cause re-renders)
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const isRecordingRef = useRef(false);
  const speechStartAtRef = useRef(0);
  const silenceAccumRef = useRef(0);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsBargeMsRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const turnAbortRef = useRef<AbortController | null>(null);
  const sessionStartMsRef = useRef(0);
  // Web Speech API refs for live transcription.
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionActiveRef = useRef(false);
  const recognitionShouldRunRef = useRef(false);
  const accumulatedFinalRef = useRef('');
  const lastSpeechAtRef = useRef(0);

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  const stopMic = useCallback(() => {
    if (tickTimerRef.current) { clearInterval(tickTimerRef.current); tickTimerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }
    recorderRef.current = null;
    isRecordingRef.current = false;
    // Tear down live transcription.
    recognitionShouldRunRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
      recognitionActiveRef.current = false;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const stopTts = useCallback(() => {
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = '';
      } catch { /* ignore */ }
      ttsAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMic();
      stopTts();
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (turnAbortRef.current) { turnAbortRef.current.abort(); turnAbortRef.current = null; }
    };
  }, [stopMic, stopTts]);

  // ─── Mic bring-up (pre-session volume meter) ───────────────────────────────

  const initMic = useCallback(async () => {
    if (streamRef.current) return;
    setMicState('requesting');
    setStartError(null);

    // Step 1: get the stream. This is the only step that determines whether
    // permission is actually granted/denied — don't conflate it with audio-
    // pipeline errors, or a harmless AudioContext hiccup ends up showing the
    // scary "Microphone access is blocked" banner.
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (err) {
      const e = err as Error & { name?: string };
      const isDenied =
        e?.name === 'NotAllowedError' ||
        e?.name === 'SecurityError' ||
        e?.message === 'Permission denied';
      if (isDenied) {
        setMicState('denied');
        setStartError('Microphone access was blocked. Allow it in your browser and click the button to retry.');
      } else {
        // Hardware missing, mic in use by another app, unsupported constraints,
        // etc. Keep the state as 'unrequested' so the user can retry without
        // the "blocked" UI and its misleading unblock instructions.
        setMicState('unrequested');
        setStartError(`Could not open your microphone${e?.name ? ` (${e.name})` : ''}. Check that a mic is connected and not in use, then retry.`);
      }
      return;
    }

    streamRef.current = stream;
    // Permission is granted — commit that now, independent of the level meter.
    setMicState('granted');

    // Step 2: set up the level-meter pipeline. Best-effort: if AudioContext
    // creation or resume() fails, the mic is still usable for recording.
    try {
      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume().catch(() => { /* ignore */ });
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      // Volume meter only (no VAD / recording yet — that starts in active phase)
      const buf = new Uint8Array(analyser.fftSize);
      tickTimerRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        setMicLevel(rms);
      }, TICK_MS);
    } catch {
      // No level meter, but the session can still run.
    }
  }, []);

  // Auto-trigger the browser permission prompt as soon as the intro phase
  // mounts. If the user has previously denied, the browser silently rejects
  // without re-prompting — the denied-state UI (with "how to unblock" steps)
  // handles that path. Fresh visitors get the popup without having to click
  // the button first.
  useEffect(() => {
    if (phase !== 'intro') return;
    if (micState !== 'unrequested') return;
    void initMic();
  }, [phase, micState, initMic]);

  // ─── Start session ─────────────────────────────────────────────────────────

  const beginSession = useCallback(async () => {
    setStartError(null);
    setPhase('starting');
    try {
      const res = await fetch('/api/voice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, durationMin }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Could not start session' }));
        setStartError(err.error ?? 'Could not start session');
        setPhase('error');
        return;
      }
      const data = (await res.json()) as StartResponse;
      setSession(data);
      setCode(data.problem.starterCode.python ?? '');
      setElapsedSec(0);
      sessionStartMsRef.current = Date.now();

      // Preload the Pyodide worker in the background so the first Run is fast.
      ensureWorker().catch(() => { /* ignore — user will see it on first Run */ });

      setPhase('active');

      // Play intro audio, then kick off the turn loop.
      if (data.introAudioBase64) {
        playTtsAudio(data.introAudioBase64, () => {
          appendTurn({ role: 'ai', text: data.introText, tSec: 0 });
          startTurnLoop();
        });
      } else {
        // TTS failed server-side — drop straight into the turn loop.
        appendTurn({ role: 'ai', text: data.introText, tSec: 0 });
        startTurnLoop();
      }
    } catch {
      setStartError('Network error starting session. Try again.');
      setPhase('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, durationMin]);

  // ─── Transcript append ─────────────────────────────────────────────────────

  const appendTurn = useCallback((turn: Turn) => {
    setTranscript(prev => [...prev, turn]);
  }, []);

  // ─── TTS playback with barge-in hook ───────────────────────────────────────

  // ─── Live transcription via Web Speech API ──────────────────────────────
  const safeStartRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || recognitionActiveRef.current) return;
    try {
      rec.start();
      recognitionActiveRef.current = true;
    } catch {
      // `.start()` throws if it was already started; the onend handler will
      // flip the flag and retry on the next opportunity.
    }
  }, []);

  const safeStopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || !recognitionActiveRef.current) return;
    try { rec.stop(); } catch { /* ignore */ }
    recognitionActiveRef.current = false;
  }, []);

  const initRecognition = useCallback(() => {
    if (recognitionRef.current) return true;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      if (mutedRef.current) return;
      let interim = '';
      let appended = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? '';
        if (r.isFinal) appended += (appended ? ' ' : '') + t.trim();
        else interim += (interim ? ' ' : '') + t.trim();
      }
      if (appended) {
        accumulatedFinalRef.current = (
          accumulatedFinalRef.current ? accumulatedFinalRef.current + ' ' : ''
        ) + appended;
        setLiveFinal(accumulatedFinalRef.current);
      }
      setLiveInterim(interim);
      if (appended || interim) lastSpeechAtRef.current = Date.now();
    };
    rec.onerror = (e) => {
      // 'no-speech' fires all the time in normal use; others are worth logging.
      if (e.error && e.error !== 'no-speech' && e.error !== 'aborted') {
        try { posthog.capture('voice_recognition_error', { error: e.error }); } catch { /* ignore */ }
      }
    };
    rec.onend = () => {
      recognitionActiveRef.current = false;
      // Continuous mode stops itself periodically (every ~60s on Chrome, or
      // on silence). Restart unless we've been explicitly paused (e.g. for
      // TTS playback) or the session has ended.
      if (recognitionShouldRunRef.current) {
        // Tiny delay to avoid tight loops if start() is failing.
        setTimeout(safeStartRecognition, 100);
      }
    };
    recognitionRef.current = rec;
    return true;
  }, [safeStartRecognition]);

  const playTtsAudio = useCallback((b64: string, onEnd?: () => void) => {
    stopTts();
    const blob = base64ToBlob(b64, 'audio/mpeg');
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    ttsAudioRef.current = audio;
    ttsBargeMsRef.current = 0;
    // Pause live transcription while the interviewer is speaking so we don't
    // accidentally transcribe the TTS output as user speech. The onend /
    // onerror handlers resume it.
    const wasRunning = recognitionShouldRunRef.current;
    if (wasRunning) {
      recognitionShouldRunRef.current = false;
      safeStopRecognition();
    }
    const resumeRecognition = () => {
      if (wasRunning) {
        recognitionShouldRunRef.current = true;
        // Small delay so the TTS audio tail doesn't sneak into the mic.
        setTimeout(safeStartRecognition, 150);
      }
    };
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      resumeRecognition();
      onEnd?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      resumeRecognition();
      onEnd?.();
    };
    audio.play().catch(() => {
      URL.revokeObjectURL(url);
      if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      resumeRecognition();
      onEnd?.();
    });
  }, [stopTts, safeStartRecognition, safeStopRecognition]);

  // ─── Turn loop: VAD + chunked MediaRecorder + POST ─────────────────────────

  const turnLoopRunningRef = useRef(false);
  const codeRef = useRef(code);
  const runResultsRef = useRef(runResults);
  const mutedRef = useRef(muted);
  const transcriptRef = useRef(transcript);
  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => { runResultsRef.current = runResults; }, [runResults]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // ─── Text turn (Web Speech API path) ────────────────────────────────────
  const postTurnText = useCallback(async (userText: string) => {
    if (!session) return;
    const text = userText.trim();
    if (!text) return;
    const elapsed = Math.floor((Date.now() - sessionStartMsRef.current) / 1000);
    // Commit the user turn immediately — it's already been transcribed
    // locally, the server call only needs to produce the interviewer's reply.
    appendTurn({ role: 'user', text, tSec: elapsed });
    setTurnStatus({ kind: 'sending' });

    turnAbortRef.current?.abort();
    const ctrl = new AbortController();
    turnAbortRef.current = ctrl;
    try {
      const res = await fetch('/api/voice/turn-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          sessionId: session.sessionId,
          userText: text,
          codeSnapshot: codeRef.current.slice(0, 10_000),
          transcriptHistory: transcriptRef.current.slice(-20),
          elapsedSec: elapsed,
          testResults: runResultsRef.current,
          problemTitle: session.problem.title,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        const message = errBody.error ?? `Turn failed (${res.status})`;
        setTurnStatus({ kind: 'error', message });
        try { posthog.capture('voice_turn_failed', { status: res.status, message, via: 'text' }); } catch { /* ignore */ }
        return;
      }
      const data = await res.json() as {
        shouldSpeak: boolean;
        aiText: string | null;
        audioBase64: string | null;
      };
      setTurnStatus({ kind: 'ok' });
      if (data.shouldSpeak && data.aiText) {
        appendTurn({ role: 'ai', text: data.aiText, tSec: elapsed });
        if (data.audioBase64) playTtsAudio(data.audioBase64);
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Network error';
      setTurnStatus({ kind: 'error', message });
    }
  }, [session, appendTurn, playTtsAudio]);

  const postTurn = useCallback(async (audioBlob: Blob) => {
    if (!session) return;
    const form = new FormData();
    form.append('session_id', session.sessionId);
    form.append('audio', audioBlob, 'chunk.webm');
    form.append('code_snapshot', codeRef.current.slice(0, 10_000));
    form.append('transcript_history', JSON.stringify(transcriptRef.current.slice(-20)));
    form.append('elapsed_sec', String(Math.floor((Date.now() - sessionStartMsRef.current) / 1000)));
    form.append('test_results', JSON.stringify(runResultsRef.current));
    form.append('problem_title', session.problem.title);

    turnAbortRef.current?.abort();
    const ctrl = new AbortController();
    turnAbortRef.current = ctrl;
    setTurnStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/voice/turn', { method: 'POST', body: form, signal: ctrl.signal });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        const message = errBody.error ?? `Turn failed (${res.status})`;
        setTurnStatus({ kind: 'error', message });
        try { posthog.capture('voice_turn_failed', { status: res.status, message }); } catch { /* ignore */ }
        return;
      }
      const data = await res.json() as {
        transcribedText: string;
        shouldSpeak: boolean;
        aiText: string | null;
        audioBase64: string | null;
      };
      const elapsed = Math.floor((Date.now() - sessionStartMsRef.current) / 1000);
      if (data.transcribedText) {
        appendTurn({ role: 'user', text: data.transcribedText, tSec: elapsed });
        setTurnStatus({ kind: 'ok' });
      } else {
        // Whisper returned empty — mic picked up sound, but no words were
        // recognized (breath, noise, too short, or model didn't hear anything).
        setTurnStatus({ kind: 'empty' });
      }
      if (data.shouldSpeak && data.aiText) {
        appendTurn({ role: 'ai', text: data.aiText, tSec: elapsed });
        if (data.audioBase64) playTtsAudio(data.audioBase64);
      }
    } catch (err) {
      // Abort during a rapid re-post is expected; anything else is a real
      // network/runtime failure we want the user to see.
      if ((err as { name?: string })?.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Network error';
      setTurnStatus({ kind: 'error', message });
      try { posthog.capture('voice_turn_failed', { message }); } catch { /* ignore */ }
    }
  }, [session, appendTurn, playTtsAudio]);

  const startTurnLoop = useCallback(() => {
    if (turnLoopRunningRef.current) return;
    if (!streamRef.current || !analyserRef.current) return;
    turnLoopRunningRef.current = true;

    // Start live transcription if supported. Everything below (VAD, recorder
    // fallback) still runs, but when Web Speech API is available we don't
    // need to send audio to Whisper at all — the recorder fallback only
    // activates when recognition isn't available.
    if (initRecognition()) {
      recognitionShouldRunRef.current = true;
      safeStartRecognition();
    }

    // Recreate the tick interval — the intro-phase one was volume-only.
    if (tickTimerRef.current) { clearInterval(tickTimerRef.current); tickTimerRef.current = null; }

    const buf = new Uint8Array(analyserRef.current.fftSize);

    tickTimerRef.current = window.setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      setMicLevel(rms);

      if (mutedRef.current) return;

      const wasRecording = isRecordingRef.current;
      // Hysteresis: use the higher threshold to start a recording, the lower
      // one to decide "still speaking" while recording. Background noise
      // between the two won't end the utterance OR start a spurious one.
      const talking = wasRecording
        ? rms > VAD_SILENCE_THRESHOLD
        : rms > VAD_START_THRESHOLD;

      // Barge-in: if TTS is playing and user sustains speech, cut TTS off so
      // we can start recording. Crucially we no longer early-return here —
      // that used to prevent the recorder from ever starting while TTS was
      // playing (or stuck in a weird state), which could silently break the
      // entire pipeline.
      if (ttsAudioRef.current && !ttsAudioRef.current.paused) {
        if (talking) {
          ttsBargeMsRef.current += TICK_MS;
          if (ttsBargeMsRef.current >= BARGE_IN_HOLD_MS) {
            stopTts();
            ttsBargeMsRef.current = 0;
          }
        } else {
          ttsBargeMsRef.current = 0;
        }
      }

      // If Web Speech API is active, the live transcription + silence-watch
      // useEffect below drives turn flushes. Skip the MediaRecorder fallback.
      if (recognitionRef.current) return;

      const flushRecording = () => {
        try { recorderRef.current?.stop(); } catch { /* ignore */ }
        // onstop will post the blob. We null refs/flags so the next tick can
        // start a fresh recording immediately if the user keeps talking.
        recorderRef.current = null;
        isRecordingRef.current = false;
        setIsRecording(false);
        silenceAccumRef.current = 0;
      };

      // Hard cap: no matter the VAD state, a recording older than
      // MAX_UTTERANCE_MS gets flushed. Protects against the mic getting
      // stuck above the silence threshold (continuous room tone, fan, etc.)
      // and against any VAD logic edge case trapping the recorder.
      if (isRecordingRef.current && Date.now() - speechStartAtRef.current >= MAX_UTTERANCE_MS) {
        flushRecording();
      }

      // Start a new recording on first speech.
      if (talking) {
        if (!isRecordingRef.current && streamRef.current) {
          try {
            const rec = new MediaRecorder(streamRef.current, {
              mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm',
            });
            const chunks: BlobPart[] = [];
            rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
            rec.onstop = () => {
              const dur = Date.now() - speechStartAtRef.current;
              try {
                posthog.capture('voice_recorder_stop', {
                  duration_ms: dur,
                  chunk_count: chunks.length,
                  mime: rec.mimeType,
                });
              } catch { /* ignore */ }
              if (dur >= MIN_UTTERANCE_MS && chunks.length > 0) {
                const blob = new Blob(chunks, { type: rec.mimeType });
                void postTurn(blob);
              }
            };
            rec.start();
            recorderRef.current = rec;
            isRecordingRef.current = true;
            setIsRecording(true);
            speechStartAtRef.current = Date.now();
            silenceAccumRef.current = 0;
            try { posthog.capture('voice_recorder_start', { mime: rec.mimeType }); } catch { /* ignore */ }
          } catch (recErr) {
            isRecordingRef.current = false;
            setIsRecording(false);
            const message = recErr instanceof Error ? recErr.message : 'MediaRecorder failed';
            setTurnStatus({ kind: 'error', message: `Recorder unavailable: ${message}` });
            try { posthog.capture('voice_recorder_unavailable', { message }); } catch { /* ignore */ }
          }
        } else {
          silenceAccumRef.current = 0;
        }
      } else if (isRecordingRef.current) {
        silenceAccumRef.current += TICK_MS;
        if (silenceAccumRef.current >= SILENCE_FLUSH_MS) {
          flushRecording();
        }
      }
    }, TICK_MS);
  }, [postTurn, stopTts, initRecognition, safeStartRecognition]);

  // Silence-after-final watcher. When the Web Speech API has produced
  // finalized text and the user has been silent for SILENCE_TURN_FLUSH_MS,
  // treat it as "end of thought" and send the accumulated text to the LLM.
  useEffect(() => {
    if (phase !== 'active') return;
    const timer = setInterval(() => {
      const acc = accumulatedFinalRef.current.trim();
      if (!acc) return;
      if (Date.now() - lastSpeechAtRef.current < SILENCE_TURN_FLUSH_MS) return;
      // Don't flush while TTS is playing — we'll catch the text once the
      // interviewer finishes speaking.
      if (ttsAudioRef.current && !ttsAudioRef.current.paused) return;
      accumulatedFinalRef.current = '';
      setLiveFinal('');
      setLiveInterim('');
      void postTurnText(acc);
    }, 400);
    return () => clearInterval(timer);
  }, [phase, postTurnText]);

  // ─── Countdown timer ───────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'active' || !session) return;
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartMsRef.current) / 1000);
      setElapsedSec(elapsed);
      if (elapsed >= session.durationSec) {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        void endSession(elapsed * 1000);
      }
    }, 500);
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session]);

  // ─── Run tests ─────────────────────────────────────────────────────────────

  const onRunTests = useCallback(async () => {
    if (!session) return;
    setRunStatus('running');
    try {
      const { results } = await runTests({
        code: codeRef.current,
        tests: session.problem.defaultTests.map((t, i) => ({
          id: String(i),
          inputJson: t.inputJson,
          expectedJson: t.expectedJson,
        })),
        methodName: session.problem.methodName,
        argKeys: session.problem.argKeys,
        resultCompare: session.problem.resultCompare,
      });
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      setRunResults({ passed, total });
    } catch {
      setRunResults(null);
    } finally {
      setRunStatus('done');
    }
  }, [session]);

  // ─── End session ───────────────────────────────────────────────────────────

  const endSession = useCallback(async (timeUsedMs: number) => {
    if (!session) return;
    setPhase('ending');
    stopMic();
    stopTts();
    turnLoopRunningRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    try {
      const res = await fetch('/api/voice/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          transcript: transcriptRef.current,
          finalCode: codeRef.current,
          runResults: runResultsRef.current,
          timeUsedMs,
        }),
      });
      if (!res.ok) {
        setScorecardError('Could not generate your scorecard. Your session was saved — try the review page later.');
        setPhase('scorecard');
        return;
      }
      const data = (await res.json()) as Scorecard;
      setScorecard(data);
      setPhase('scorecard');

      // Refresh the quota so the scorecard reflects the newly-consumed slot.
      void getVoiceQuota().then(setVoiceQuota).catch(() => { /* ignore */ });

      try {
        posthog.capture('voice_mock_ended', {
          session_id: session.sessionId,
          time_used_ms: timeUsedMs,
          tests_passed: runResultsRef.current?.passed ?? 0,
          tests_total: runResultsRef.current?.total ?? 0,
        });
      } catch { /* ignore */ }
    } catch {
      setScorecardError('Network error generating scorecard. Try refreshing the interview page to see the saved session.');
      setPhase('scorecard');
    }
  }, [session, stopMic, stopTts]);

  const onEndEarly = useCallback(() => {
    const timeUsedMs = Date.now() - sessionStartMsRef.current;
    void endSession(timeUsedMs);
  }, [endSession]);

  // ─── Remaining seconds ─────────────────────────────────────────────────────

  const remainingSec = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, session.durationSec - elapsedSec);
  }, [session, elapsedSec]);

  // ─── Render: phases ────────────────────────────────────────────────────────

  if (phase === 'intro' || phase === 'starting' || phase === 'error') {
    return (
      <IntroPhase
        difficulty={difficulty}
        durationMin={durationMin}
        micLevel={micLevel}
        micState={micState}
        canStart={phase === 'intro' && micState === 'granted' && (voiceQuota?.allowed ?? true)}
        starting={phase === 'starting'}
        error={startError}
        voiceQuota={voiceQuota}
        onRequestMic={initMic}
        onStart={beginSession}
      />
    );
  }

  if (phase === 'ending') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ll-bg)' }}>
        <div className="flex items-center gap-3 text-slate-700 text-[14px]" style={SG}>
          <Loader2 size={18} className="animate-spin text-blue-400" />
          Grading your interview…
        </div>
      </div>
    );
  }

  if (phase === 'scorecard' && session) {
    return (
      <ScorecardPhase
        scorecard={scorecard}
        error={scorecardError}
        isFreeTrial={session.isFreeTrial}
        finalCode={codeRef.current}
        problem={session.problem}
        runResults={runResultsRef.current}
        voiceQuota={voiceQuota}
        onContinueCoding={() => setPhase('practice')}
      />
    );
  }

  // ─── Render: active session ────────────────────────────────────────────────

  if (!session) return null;
  const isPractice = phase === 'practice';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ll-bg)' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: 'var(--ll-bg-panel)', borderBottom: '1px solid rgba(15,23,42,0.08)' }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/interview"
            className="text-[11px] uppercase tracking-[0.16em] text-slate-500 hover:text-slate-700"
            style={SG}
          >
            ← Interview
          </Link>
          <span className="text-[13px] font-semibold text-slate-800" style={SG}>
            {session.problem.title}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
            style={{
              color: 'rgba(147,197,253,0.8)',
              background: 'rgba(59,130,246,0.08)',
              ...SG,
            }}
          >
            Voice mock
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isPractice && (
            <div
              className="px-3 py-1 rounded-md text-[14px] font-semibold tabular-nums"
              style={{
                ...MONO,
                color: remainingSec < 120 ? '#fca5a5' : '#1e293b',
                background: remainingSec < 120 ? 'rgba(239,68,68,0.08)' : 'rgba(15,23,42,0.05)',
                border: '1px solid rgba(15,23,42,0.08)',
              }}
            >
              {fmtTime(remainingSec)}
            </div>
          )}
          {!isPractice && (
            <button
              onClick={() => setMuted(m => !m)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-semibold"
              style={{
                ...SG,
                color: muted ? '#fca5a5' : '#cbd5e1',
                background: muted ? 'rgba(239,68,68,0.08)' : 'rgba(15,23,42,0.05)',
                border: `1px solid ${muted ? 'rgba(239,68,68,0.25)' : 'rgba(15,23,42,0.10)'}`,
              }}
              title={muted ? 'Unmute mic' : 'Mute mic'}
            >
              {muted ? <MicOff size={14} /> : <Mic size={14} />}
              {muted ? 'Muted' : 'Live'}
            </button>
          )}
          {!isPractice && (
            <div
              className="h-1.5 w-20 rounded-full overflow-hidden"
              style={{ background: 'rgba(15,23,42,0.08)' }}
              title="Mic level"
            >
              <div
                className="h-full transition-[width] duration-100"
                style={{
                  width: `${Math.min(100, micLevel * 600)}%`,
                  background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                }}
              />
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={() => setShowTranscript(s => !s)}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-800"
            style={{ border: '1px solid rgba(15,23,42,0.08)' }}
            title="Toggle transcript"
          >
            {showTranscript ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
          </button>
          {!isPractice && (
            <button
              onClick={onEndEarly}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold text-slate-900"
              style={{
                ...SG,
                background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                border: '1px solid rgba(248,113,113,0.35)',
              }}
            >
              <Square size={12} />
              End
            </button>
          )}
        </div>
      </div>

      {/* Body: problem | editor | transcript */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem pane */}
        <div
          className="w-[420px] shrink-0 overflow-y-auto p-6"
          style={{ background: 'var(--ll-bg-panel)', borderRight: '1px solid rgba(15,23,42,0.08)' }}
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-2" style={SG}>
            {session.problem.difficulty} · {session.problem.pattern}
          </div>
          <h2 className="text-[18px] font-bold text-slate-900 mb-4" style={SG}>
            {session.problem.title}
          </h2>
          <div
            className="prose prose-invert prose-sm max-w-none text-slate-700 leading-relaxed"
            style={SG}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {session.problem.descriptionMd}
            </ReactMarkdown>
          </div>

          {session.problem.examples.length > 0 && (
            <div className="mt-6 space-y-3">
              {session.problem.examples.map((ex, i) => (
                <div key={i}>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5"
                    style={{ ...SG, color: 'var(--ll-ink-subtle)' }}
                  >
                    Example {i + 1}
                  </p>
                  <div
                    className="rounded-lg px-3 py-2.5 space-y-1"
                    style={{
                      background: 'var(--ll-bg-subtle)',
                      border: '1px solid var(--ll-border)',
                    }}
                  >
                    <p className="text-[12px] leading-relaxed" style={MONO}>
                      <span style={{ color: 'var(--ll-accent-ink)' }}>Input: </span>
                      <span style={{ color: 'var(--ll-ink)' }}>{ex.input}</span>
                    </p>
                    <p className="text-[12px] leading-relaxed" style={MONO}>
                      <span style={{ color: 'var(--ll-accent-ink)' }}>Output: </span>
                      <span style={{ color: 'var(--ll-ink)' }}>{ex.output}</span>
                    </p>
                    {ex.explanation && (
                      <p className="text-[11.5px] pt-0.5" style={{ ...SG, color: 'var(--ll-ink-subtle)' }}>
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {session.problem.constraints.length > 0 && (
            <div className="mt-6">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ ...SG, color: 'var(--ll-ink-subtle)' }}
              >
                Constraints
              </p>
              <ul className="space-y-1.5">
                {session.problem.constraints.map(c => (
                  <li
                    key={c}
                    className="flex items-start gap-2.5 text-[12px]"
                    style={{ ...MONO, color: 'var(--ll-ink-subtle)' }}
                  >
                    <span
                      className="mt-[7px] w-[3px] h-[3px] rounded-full shrink-0"
                      style={{ background: 'rgba(15,23,42,0.25)' }}
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {session.problem.defaultTests.length > 0 && (
            <div className="mt-6">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ ...SG, color: 'var(--ll-ink-subtle)' }}
              >
                Sample test cases
              </p>
              <div className="space-y-2">
                {session.problem.defaultTests.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 space-y-0.5"
                    style={{
                      background: 'var(--ll-bg-subtle)',
                      border: '1px solid var(--ll-border)',
                    }}
                  >
                    <p
                      className="text-[10.5px] font-semibold uppercase tracking-wider"
                      style={{ ...SG, color: 'var(--ll-ink-subtle)' }}
                    >
                      {t.label || `Test ${i + 1}`}
                    </p>
                    <p className="text-[11.5px] leading-relaxed break-words" style={MONO}>
                      <span style={{ color: 'var(--ll-accent-ink)' }}>in: </span>
                      <span style={{ color: 'var(--ll-ink)' }}>{t.inputJson}</span>
                    </p>
                    <p className="text-[11.5px] leading-relaxed break-words" style={MONO}>
                      <span style={{ color: 'var(--ll-accent-ink)' }}>out: </span>
                      <span style={{ color: 'var(--ll-ink)' }}>{t.expectedJson}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor pane — chrome styled to match /solve */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--ll-bg-code)' }}>
          <div
            className="flex items-center justify-between px-4 shrink-0 backdrop-blur-[4px]"
            style={{
              height: 42,
              borderBottom: '1px solid var(--ll-border)',
              background: 'var(--ll-glass-bg)',
            }}
          >
            <div
              className="flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium"
              style={{
                background: 'var(--ll-accent-soft)',
                border: '1px solid var(--ll-accent-ring)',
                color: 'var(--ll-accent-ink)',
                ...SG,
              }}
            >
              Python
            </div>
            <div className="flex items-center gap-2">
              {runResults && (
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    ...MONO,
                    color: runResults.passed === runResults.total
                      ? 'var(--ll-success-ink)'
                      : 'var(--ll-danger-ink)',
                  }}
                >
                  {runResults.passed} / {runResults.total} passed
                </span>
              )}
              <button
                onClick={onRunTests}
                disabled={runStatus === 'running'}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  ...SG,
                  color: runStatus === 'running' ? 'var(--ll-ink-faint)' : 'var(--ll-ink)',
                  border: '1px solid var(--ll-border-strong)',
                  background: 'var(--ll-bg-hover)',
                }}
              >
                {runStatus === 'running' ? <Loader2 size={12} className="animate-spin" /> : <Play size={11} />}
                {runStatus === 'running' ? 'Running…' : 'Run'}
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              defaultLanguage="python"
              value={code}
              beforeMount={defineTheme}
              onChange={v => setCode(v ?? '')}
              theme={appTheme === 'dark' ? 'lc-dark' : 'lc-light'}
              options={{
                fontSize: 14,
                fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Live transcription overlay — bottom-left, always-on during an
            active voice session so the user can see mic → STT is working. */}
        {!isPractice && (
          <LiveTranscriptionOverlay
            transcript={transcript}
            muted={muted}
            micLevel={micLevel}
            isRecording={isRecording}
            liveInterim={liveInterim}
            liveFinal={liveFinal}
            turnStatus={turnStatus}
          />
        )}

        {/* Transcript drawer */}
        {showTranscript && (
          <div
            className="w-[320px] shrink-0 flex flex-col"
            style={{ background: 'var(--ll-bg-panel)', borderLeft: '1px solid rgba(15,23,42,0.08)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold" style={SG}>Transcript</span>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-slate-500 hover:text-slate-700"
                title="Close transcript"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 && (
                <p className="text-[12px] text-slate-400" style={SG}>Your conversation will appear here.</p>
              )}
              {transcript.map((t, i) => (
                <div key={i}>
                  <p
                    className="text-[10px] uppercase tracking-wider mb-0.5"
                    style={{
                      ...SG,
                      color: t.role === 'ai' ? 'rgba(147,197,253,0.75)' : 'rgba(148,163,184,0.7)',
                    }}
                  >
                    {t.role === 'ai' ? 'Interviewer' : 'You'} · {fmtTime(t.tSec)}
                  </p>
                  <p className="text-[13px] text-slate-800 leading-relaxed" style={SG}>{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live transcription overlay ──────────────────────────────────────────────

type TurnStatus =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'ok' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string };

function LiveTranscriptionOverlay({
  transcript,
  muted,
  micLevel,
  isRecording,
  liveInterim,
  liveFinal,
  turnStatus,
}: {
  transcript: Turn[];
  muted: boolean;
  micLevel: number;
  isRecording: boolean;
  liveInterim: string;
  liveFinal: string;
  turnStatus: TurnStatus;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recent = transcript.slice(-3);
  const livePreview = `${liveFinal}${liveFinal && liveInterim ? ' ' : ''}${liveInterim}`.trim();
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript.length, livePreview]);

  const speaking = !muted && micLevel > VAD_THRESHOLD;
  const hasLive = livePreview.length > 0;
  const statusLabel = muted
    ? 'Mic muted'
    : turnStatus.kind === 'error'
      ? 'Pipeline error'
      : turnStatus.kind === 'sending'
        ? 'Sending to interviewer…'
        : hasLive
          ? 'Transcribing…'
          : isRecording
            ? 'Recording…'
            : turnStatus.kind === 'empty'
              ? 'Heard nothing — try again'
              : speaking
                ? 'Listening…'
                : transcript.length === 0
                  ? 'Waiting for you to speak…'
                  : 'Idle';
  const statusColor = muted
    ? '#fca5a5'
    : turnStatus.kind === 'error'
      ? '#fca5a5'
      : turnStatus.kind === 'sending'
        ? '#60a5fa'
        : hasLive
          ? '#34d399'       // green dot = actively transcribing speech
          : isRecording
            ? '#ef4444'
            : turnStatus.kind === 'empty'
              ? '#fbbf24'
              : speaking
                ? '#34d399'
                : 'rgba(148,163,184,0.85)';

  return (
    <div
      className="fixed bottom-4 left-4 w-[340px] rounded-xl overflow-hidden pointer-events-auto"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(15,23,42,0.10)',
        boxShadow: '0 10px 28px -14px rgba(15,23,42,0.25)',
        zIndex: 30,
      }}
      aria-live="polite"
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: statusColor,
              boxShadow: speaking ? `0 0 8px ${statusColor}` : 'none',
              transition: 'box-shadow 120ms',
            }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ ...SG, color: statusColor }}
          >
            {statusLabel}
          </span>
        </div>
        <span className="text-[10px] text-slate-400" style={SG}>
          Live transcript
        </span>
      </div>
      <div
        ref={scrollRef}
        className="px-3 py-2.5 space-y-2 overflow-y-auto"
        style={{ maxHeight: 200 }}
      >
        {hasLive && (
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.12em] font-semibold mb-0.5"
              style={{ ...SG, color: 'rgba(100,116,139,0.85)' }}
            >
              You (live)
            </p>
            <p className="text-[12.5px] leading-snug" style={SG}>
              <span style={{ color: 'var(--ll-ink)' }}>{liveFinal}</span>
              {liveFinal && liveInterim && ' '}
              <span style={{ color: 'rgba(100,116,139,0.75)', fontStyle: 'italic' }}>
                {liveInterim}
              </span>
            </p>
          </div>
        )}
        {turnStatus.kind === 'error' && (
          <p
            className="text-[11.5px] font-medium leading-snug"
            style={{ ...SG, color: '#b91c1c' }}
          >
            {turnStatus.message}
          </p>
        )}
        {recent.length === 0 && !hasLive && turnStatus.kind !== 'error' ? (
          <p className="text-[12px] text-slate-400 italic" style={SG}>
            Say something — your words will appear here as you speak.
          </p>
        ) : (
          recent.map((t, i) => (
            <div key={`${transcript.length - recent.length + i}`}>
              <p
                className="text-[9px] uppercase tracking-[0.12em] font-semibold mb-0.5"
                style={{
                  ...SG,
                  color: t.role === 'ai' ? 'rgba(59,130,246,0.85)' : 'rgba(100,116,139,0.85)',
                }}
              >
                {t.role === 'ai' ? 'Interviewer' : 'You'}
              </p>
              <p className="text-[12.5px] text-slate-800 leading-snug" style={SG}>
                {t.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Intro phase ─────────────────────────────────────────────────────────────

function IntroPhase({
  difficulty, durationMin, micLevel, micState, canStart, starting, error, voiceQuota, onRequestMic, onStart,
}: {
  difficulty: string;
  durationMin: number;
  micLevel: number;
  micState: MicState;
  canStart: boolean;
  starting: boolean;
  error: string | null;
  voiceQuota: VoiceQuotaResult | null;
  onRequestMic: () => void;
  onStart: () => void;
}) {
  const voiceCapped = voiceQuota ? !voiceQuota.allowed : false;
  const statusLabel =
    micState === 'granted'
      ? (micLevel > 0.001 ? 'Hearing you' : 'Ready')
      : micState === 'requesting'
        ? 'Requesting…'
        : micState === 'denied'
          ? 'Blocked'
          : 'Not enabled';
  const statusColor =
    micState === 'granted' && micLevel > 0.001
      ? '#34d399'
      : micState === 'denied'
        ? '#fca5a5'
        : 'rgba(148,163,184,0.6)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ll-bg)' }}>
      <AppNav activeTab="Interview" />
      <div className="flex-1 flex items-center justify-center p-8" style={{ paddingTop: 48 }}>
        <div className="max-w-md w-full space-y-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold" style={SG}>
              Voice Mock Interview
            </p>
            <h1 className="text-[28px] font-bold text-slate-900 mt-2" style={SG}>
              Let&apos;s run through one problem.
            </h1>
            <p className="text-[14px] text-slate-600 mt-2 leading-relaxed" style={SG}>
              {difficulty === 'easy-medium' ? 'Medium' : 'Hard'} difficulty · {durationMin} minutes.
              Your AI interviewer will stay mostly quiet while you think, and interject when it&apos;s time to push you.
            </p>
          </div>

          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: 'var(--ll-bg-elevated)', border: '1px solid rgba(15,23,42,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-slate-600" style={SG}>Microphone</span>
              <span className="text-[11px] font-semibold" style={{ ...SG, color: statusColor }}>
                {statusLabel}
              </span>
            </div>
            {micState === 'granted' ? (
              <>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.08)' }}>
                  <div
                    className="h-full transition-[width] duration-100"
                    style={{
                      width: `${Math.min(100, micLevel * 600)}%`,
                      background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed" style={SG}>
                  Say a few words — the bar should move.
                </p>
              </>
            ) : (
              <button
                onClick={onRequestMic}
                disabled={micState === 'requesting'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-slate-900 disabled:opacity-60"
                style={{
                  ...SG,
                  background: 'rgba(59,130,246,0.12)',
                  border: '1px solid rgba(96,165,250,0.4)',
                }}
              >
                {micState === 'requesting'
                  ? (<><Loader2 size={13} className="animate-spin" /> Requesting mic…</>)
                  : micState === 'denied'
                    ? (<><Mic size={13} /> Retry microphone access</>)
                    : (<><Mic size={13} /> Enable microphone</>)
                }
              </button>
            )}
          </div>

          {micState === 'denied' ? (
            <div
              className="rounded-lg p-4 space-y-2"
              style={{
                ...SG,
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: '#b91c1c' }}>
                <AlertCircle size={14} className="shrink-0" />
                Microphone access is blocked
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                Your browser is blocking the mic for this site. To unblock:
              </p>
              <ol className="text-[12px] text-slate-700 space-y-1 pl-4 list-decimal leading-relaxed">
                <li>Click the lock (or mic-off) icon next to this page&apos;s URL.</li>
                <li>Set <span style={MONO}>Microphone</span> to <span className="font-semibold text-slate-900">Allow</span>.</li>
                <li>Hit <span className="font-semibold text-slate-900">Retry microphone access</span> above.</li>
              </ol>
            </div>
          ) : error ? (
            <div
              className="flex items-start gap-2 rounded-lg p-3 text-[12px]"
              style={{
                ...SG,
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#b91c1c',
              }}
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <VoiceQuotaBadge quota={voiceQuota} variant="card" />

          <button
            onClick={onStart}
            disabled={!canStart || starting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              ...SG,
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow: '0 10px 24px -12px rgba(59,130,246,0.6)',
            }}
          >
            {starting
              ? (<><Loader2 size={14} className="animate-spin" /> Starting…</>)
              : voiceCapped
                ? 'Voice cap reached'
                : (<>Begin Interview <ArrowRight size={15} /></>)}
          </button>

          <p className="text-[11px] text-slate-400 text-center" style={SG}>
            {voiceCapped
              ? 'Monthly cap reached \u2014 older sessions will roll off your 30-day window.'
              : micState === 'granted'
                ? 'You\u2019ll hear a short intro, then your problem will appear.'
                : 'Enable your mic to continue.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Scorecard phase ─────────────────────────────────────────────────────────

function ScorecardPhase({
  scorecard, error, isFreeTrial, finalCode, problem, runResults, voiceQuota, onContinueCoding,
}: {
  scorecard: Scorecard | null;
  error: string | null;
  isFreeTrial: boolean;
  finalCode: string;
  problem: ProblemContent;
  runResults: { passed: number; total: number } | null;
  voiceQuota: VoiceQuotaResult | null;
  onContinueCoding: () => void;
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--ll-bg)' }}>
      <AppNav activeTab="Interview" />
      <div className="max-w-3xl mx-auto space-y-6 py-10 px-6" style={{ paddingTop: 76 }}>
        {isFreeTrial && (
          <div
            className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(180deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)',
              border: '1px solid rgba(59,130,246,0.28)',
            }}
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-blue-300 font-semibold" style={SG}>
                Free trial used
              </p>
              <p className="text-[13px] text-slate-800 mt-0.5" style={SG}>
                That was your free voice mock. Upgrade to Pro for 10 more every month.
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-900 shrink-0"
              style={{
                ...SG,
                background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
                border: '1px solid rgba(147,197,253,0.55)',
              }}
            >
              Upgrade
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold" style={SG}>
            Interview complete
          </p>
          <h1 className="text-[26px] font-bold text-slate-900 mt-1" style={SG}>{problem.title} — debrief</h1>
          <div className="mt-3">
            <VoiceQuotaBadge quota={voiceQuota} variant="compact" />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl p-5 text-[13px]" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#b91c1c', ...SG }}>
            {error}
          </div>
        ) : scorecard ? (
          <>
            <ScoreGrid scores={scorecard.scores} />
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--ll-bg-elevated)', border: '1px solid rgba(15,23,42,0.08)' }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2" style={SG}>Summary</p>
              <p className="text-[14px] text-slate-800 leading-relaxed" style={SG}>{scorecard.summaryParagraph}</p>
            </div>
            {scorecard.quotes.length > 0 && (
              <div
                className="rounded-xl p-5 space-y-3"
                style={{ background: 'var(--ll-bg-elevated)', border: '1px solid rgba(15,23,42,0.08)' }}
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold" style={SG}>Moments from the session</p>
                {scorecard.quotes.map((q, i) => (
                  <div
                    key={i}
                    className="pl-3"
                    style={{
                      borderLeft: `2px solid ${q.tag === 'strong' ? 'rgba(52,211,153,0.55)' : 'rgba(251,191,36,0.55)'}`,
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                      style={{
                        ...SG,
                        color: q.tag === 'strong' ? 'rgba(52,211,153,0.85)' : 'rgba(251,191,36,0.85)',
                      }}
                    >
                      {q.tag === 'strong' ? 'Strong' : 'Watch out'} · {fmtTime(q.tSec)}
                    </p>
                    <p className="text-[13px] text-slate-700 italic leading-relaxed" style={SG}>“{q.text}”</p>
                  </div>
                ))}
              </div>
            )}
            {scorecard.suggestedNextProblems.length > 0 && (
              <div
                className="rounded-xl p-5 space-y-3"
                style={{ background: 'var(--ll-bg-elevated)', border: '1px solid rgba(15,23,42,0.08)' }}
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold" style={SG}>Work on these next</p>
                {scorecard.suggestedNextProblems.map(s => (
                  <Link
                    key={s.slug}
                    href={`/solve/${s.slug}`}
                    className="block rounded-lg px-3 py-2 transition-colors hover:bg-slate-50/70"
                    style={{ border: '1px solid rgba(15,23,42,0.05)' }}
                  >
                    <p className="text-[13px] font-semibold text-slate-900 capitalize" style={SG}>
                      {s.slug.replace(/-/g, ' ')}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5" style={SG}>{s.reason}</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl p-5 text-[13px] text-slate-600" style={{ background: 'var(--ll-bg-elevated)', border: '1px solid rgba(15,23,42,0.08)', ...SG }}>
            Generating your scorecard…
          </div>
        )}

        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--ll-bg-elevated)', border: '1px solid rgba(15,23,42,0.08)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold" style={SG}>Your final code</p>
            {runResults && (
              <span
                className="text-[11px] font-semibold"
                style={{
                  ...MONO,
                  color: runResults.passed === runResults.total ? '#34d399' : '#fca5a5',
                }}
              >
                {runResults.passed} / {runResults.total} passed at time-up
              </span>
            )}
          </div>
          <pre
            className="text-[12px] leading-relaxed overflow-x-auto rounded-lg p-3"
            style={{ ...MONO, background: 'var(--ll-bg-panel)', color: '#1e293b', border: '1px solid rgba(15,23,42,0.05)' }}
          >
            {finalCode || '# (no code written)'}
          </pre>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/interview"
            className="flex-1 text-center px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-800"
            style={{
              ...SG,
              background: 'rgba(15,23,42,0.05)',
              border: '1px solid rgba(15,23,42,0.10)',
            }}
          >
            Back to Interview
          </Link>
          <button
            onClick={onContinueCoding}
            className="flex-1 text-center px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-800"
            style={{
              ...SG,
              background: 'rgba(15,23,42,0.05)',
              border: '1px solid rgba(15,23,42,0.10)',
            }}
          >
            Keep coding (no AI)
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreGrid({ scores }: { scores: Scorecard['scores'] }) {
  const axes: Array<{ key: keyof Scorecard['scores']; label: string }> = [
    { key: 'correctness', label: 'Correctness' },
    { key: 'communication', label: 'Communication' },
    { key: 'complexity', label: 'Complexity' },
    { key: 'problemSolving', label: 'Problem solving' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {axes.map(a => {
        const v = scores[a.key];
        return (
          <div
            key={a.key}
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--ll-bg-elevated)', border: '1px solid rgba(15,23,42,0.08)' }}
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold" style={SG}>
              {a.label}
            </p>
            <p className="text-[22px] font-bold text-slate-900 mt-1 tabular-nums" style={{ ...SG, color: v >= 4 ? '#34d399' : v >= 3 ? '#1e293b' : '#fca5a5' }}>
              {v}
              <span className="text-[12px] text-slate-400 font-normal" style={SG}> / 5</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
