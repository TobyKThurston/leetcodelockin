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

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// ─── Constants ───────────────────────────────────────────────────────────────

const VAD_THRESHOLD = 0.025;       // RMS above this = user is speaking
const SILENCE_FLUSH_MS = 900;      // 900ms of quiet ends a user utterance
const MIN_UTTERANCE_MS = 400;      // drop blips shorter than this
const BARGE_IN_HOLD_MS = 250;      // sustained speech to cut off AI TTS
const TICK_MS = 50;

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

// ─── Monaco theme ────────────────────────────────────────────────────────────

const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('lc-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '79b8ff' },
      { token: 'string', foreground: '9ecbff' },
      { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
      { token: 'number', foreground: 'f8cc7a' },
      { token: 'type', foreground: 'b392f0' },
      { token: 'function', foreground: 'b392f0' },
    ],
    colors: {
      'editor.background': 'var(--ll-bg-elevated)',
      'editor.foreground': '#1e293b',
      'editor.lineHighlightBackground': '#f1f5f9',
      'editor.selectionBackground': '#3b82f640',
      'editorLineNumber.foreground': '#334155',
      'editorLineNumber.activeForeground': '#94a3b8',
      'editorCursor.foreground': '#60a5fa',
      'editor.inactiveSelectionBackground': '#ffffff0d',
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

  // Desktop gate
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const on = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
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

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  const stopMic = useCallback(() => {
    if (tickTimerRef.current) { clearInterval(tickTimerRef.current); tickTimerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }
    recorderRef.current = null;
    isRecordingRef.current = false;
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const audioCtx = new AudioContext();
      // Browsers create AudioContext in a suspended state when there's no
      // prior user gesture (e.g. after a router.push navigation). A suspended
      // context feeds the analyser zeros, so micLevel stays flat even though
      // the mic is granted. Resume explicitly.
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume().catch(() => { /* ignore — UI will retry */ });
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      streamRef.current = stream;
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      setMicState('granted');

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
    } catch (err) {
      const e = err as Error & { name?: string };
      setMicState('denied');
      setStartError(
        e?.name === 'NotAllowedError' || e?.message === 'Permission denied'
          ? 'Microphone access was blocked. Allow it in your browser and click the button to retry.'
          : 'Could not open your microphone. Check your system settings and retry.',
      );
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

  const playTtsAudio = useCallback((b64: string, onEnd?: () => void) => {
    stopTts();
    const blob = base64ToBlob(b64, 'audio/mpeg');
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    ttsAudioRef.current = audio;
    ttsBargeMsRef.current = 0;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      onEnd?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      onEnd?.();
    };
    audio.play().catch(() => {
      URL.revokeObjectURL(url);
      if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      onEnd?.();
    });
  }, [stopTts]);

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
    try {
      const res = await fetch('/api/voice/turn', { method: 'POST', body: form, signal: ctrl.signal });
      if (!res.ok) return;
      const data = await res.json() as {
        transcribedText: string;
        shouldSpeak: boolean;
        aiText: string | null;
        audioBase64: string | null;
      };
      const elapsed = Math.floor((Date.now() - sessionStartMsRef.current) / 1000);
      if (data.transcribedText) appendTurn({ role: 'user', text: data.transcribedText, tSec: elapsed });
      if (data.shouldSpeak && data.aiText) {
        appendTurn({ role: 'ai', text: data.aiText, tSec: elapsed });
        if (data.audioBase64) playTtsAudio(data.audioBase64);
      }
    } catch {
      // Network error / abort. Degrade silently; the session continues.
    }
  }, [session, appendTurn, playTtsAudio]);

  const startTurnLoop = useCallback(() => {
    if (turnLoopRunningRef.current) return;
    if (!streamRef.current || !analyserRef.current) return;
    turnLoopRunningRef.current = true;

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

      const talking = rms > VAD_THRESHOLD;

      // Barge-in: if TTS is playing and user sustains speech, cut TTS.
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
        // Don't record while TTS is playing (avoids echo double-listen).
        return;
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
              if (dur >= MIN_UTTERANCE_MS && chunks.length > 0) {
                const blob = new Blob(chunks, { type: rec.mimeType });
                void postTurn(blob);
              }
            };
            rec.start();
            recorderRef.current = rec;
            isRecordingRef.current = true;
            speechStartAtRef.current = Date.now();
            silenceAccumRef.current = 0;
          } catch {
            isRecordingRef.current = false;
          }
        } else {
          silenceAccumRef.current = 0;
        }
      } else if (isRecordingRef.current) {
        silenceAccumRef.current += TICK_MS;
        if (silenceAccumRef.current >= SILENCE_FLUSH_MS) {
          try { recorderRef.current?.stop(); } catch { /* ignore */ }
          recorderRef.current = null;
          isRecordingRef.current = false;
          silenceAccumRef.current = 0;
        }
      }
    }, TICK_MS);
  }, [postTurn, stopTts]);

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

  // ─── Render: desktop gate ──────────────────────────────────────────────────

  if (!isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--ll-bg)' }}>
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-[22px] font-bold text-slate-900" style={SG}>Desktop only</h1>
          <p className="text-[14px] text-slate-600 leading-relaxed" style={SG}>
            Voice mock interviews need a real keyboard and a stable mic. Open this page on your laptop or desktop to begin.
          </p>
        </div>
      </div>
    );
  }

  // ─── Render: phases ────────────────────────────────────────────────────────

  if (phase === 'intro' || phase === 'starting' || phase === 'error') {
    return (
      <IntroPhase
        difficulty={difficulty}
        durationMin={durationMin}
        micLevel={micLevel}
        micState={micState}
        canStart={phase === 'intro' && micState === 'granted'}
        starting={phase === 'starting'}
        error={startError}
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
        </div>

        {/* Editor pane */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-4 py-2" style={{ background: 'var(--ll-bg-elevated)', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
            <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold" style={SG}>Python</span>
            <div className="flex items-center gap-2">
              {runResults && (
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    ...MONO,
                    color: runResults.passed === runResults.total ? '#34d399' : '#fca5a5',
                  }}
                >
                  {runResults.passed} / {runResults.total} passed
                </span>
              )}
              <button
                onClick={onRunTests}
                disabled={runStatus === 'running'}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-semibold text-slate-900 disabled:opacity-60"
                style={{
                  ...SG,
                  background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
                  border: '1px solid rgba(147,197,253,0.35)',
                }}
              >
                {runStatus === 'running' ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                Run tests
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
              theme="lc-dark"
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

// ─── Intro phase ─────────────────────────────────────────────────────────────

function IntroPhase({
  difficulty, durationMin, micLevel, micState, canStart, starting, error, onRequestMic, onStart,
}: {
  difficulty: string;
  durationMin: number;
  micLevel: number;
  micState: MicState;
  canStart: boolean;
  starting: boolean;
  error: string | null;
  onRequestMic: () => void;
  onStart: () => void;
}) {
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
            {starting ? (<><Loader2 size={14} className="animate-spin" /> Starting…</>) : (<>Begin Interview <ArrowRight size={15} /></>)}
          </button>

          <p className="text-[11px] text-slate-400 text-center" style={SG}>
            {micState === 'granted'
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
  scorecard, error, isFreeTrial, finalCode, problem, runResults, onContinueCoding,
}: {
  scorecard: Scorecard | null;
  error: string | null;
  isFreeTrial: boolean;
  finalCode: string;
  problem: ProblemContent;
  runResults: { passed: number; total: number } | null;
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
