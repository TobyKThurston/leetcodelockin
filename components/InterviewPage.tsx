'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { Plus, ArrowRight, Trophy, Clock, RotateCcw, Loader2, AlertCircle, Mic, Eye } from 'lucide-react';
import AppNav from '@/components/AppNav';
import AppShell from '@/components/shell/AppShell';
import PageHeader from '@/components/shell/PageHeader';
import LockedScreen from '@/components/interview/LockedScreen';
import SetupScreen from '@/components/interview/SetupScreen';
import HistoryScreen from '@/components/interview/HistoryScreen';
import ReviewScreen from '@/components/interview/ReviewScreen';
import InterviewSidebar from '@/components/interview/InterviewSidebar';
import InterviewRightRail from '@/components/interview/InterviewRightRail';
import ActiveInterview, { type InterviewResults } from '@/components/interview/ActiveInterview';
import VoiceDebriefView from '@/components/voice/VoiceDebriefView';
import {
  startInterviewSession,
  submitInterview,
  saveInterviewFeedback,
  getInterviewHistory,
} from '@/app/interview/actions';
import { getProblemBySlug } from '@/app/interview/client-helpers';
import type { InterviewSession, InterviewDifficulty, InterviewFeedback } from '@/lib/interview';
import type { ProblemContent } from '@/lib/problem-types';
import type { VoiceQuotaResult } from '@/lib/voice-quota';
import { C, SG } from '@/lib/ui-tokens';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

type Phase = 'history' | 'setup' | 'active' | 'review' | 'voice-review';

// localStorage keys for crash recovery
const LS_ACTIVE_SESSION = 'zl-interview-active';

interface ActiveState {
  session: InterviewSession;
  problems: [ProblemContent, ProblemContent];
  startedAt: number;
}

interface Props {
  initialHistory: InterviewSession[];
  isPro: boolean;
  voiceQuota: VoiceQuotaResult;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function difficultyLabel(d: string): string {
  return d === 'easy-medium' ? 'Easy + Med' : 'Med + Hard';
}

// ─── Desktop-only history / redo panel for the history phase ──────────────

function HistoryWelcome({
  sessions,
  pendingFeedbackId,
  feedbackErrorId,
  onNewInterview,
  onView,
  onRedo,
  redoLoadingId,
}: {
  sessions: InterviewSession[];
  pendingFeedbackId: string | null;
  feedbackErrorId: string | null;
  onNewInterview: () => void;
  onView: (session: InterviewSession) => void;
  onRedo: (sessionId: string, difficulty: InterviewDifficulty, mode: 'voice' | 'silent') => void;
  redoLoadingId: string | null;
}) {
  const completed = sessions.filter(s => s.status === 'completed' && s.overallScore != null);

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-48px)] px-8">
        <div className="max-w-md text-center space-y-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <Trophy size={28} style={{ color: '#1d4ed8' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[24px] font-bold text-slate-900 tracking-tight" style={SG}>
              Ready to test yourself?
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed" style={SG}>
              Take your first mock interview — 2 problems, 45 minutes, AI debrief after.
            </p>
          </div>
          <button
            onClick={onNewInterview}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(15,23,42,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 12px 32px -12px rgba(59,130,246,0.75), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            Take your first mock
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Mock Interviews"
        title="Next mock interview?"
        subtitle="Pick your format on the next screen — silent two-problem round or voice mock with a live AI interviewer."
      />

      {/* Primary CTA card */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(59,130,246,0.04) 0%, rgba(59,130,246,0.015) 100%)',
          border: '1px solid rgba(59,130,246,0.18)',
          boxShadow: '0 0 60px -30px rgba(59,130,246,0.35)',
        }}
      >
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p
              className="text-[11px] text-slate-500 uppercase tracking-[0.12em] font-semibold mb-1.5"
              style={SG}
            >
              Fresh Interview
            </p>
            <p className="text-[15px] text-slate-800 font-medium" style={SG}>
              Randomized problems from your unlocked set.
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5" style={SG}>
              You pick the difficulty. We pick the problems.
            </p>
          </div>
          <button
            onClick={onNewInterview}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110 active:brightness-95"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(15,23,42,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 10px 24px -10px rgba(59,130,246,0.7), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            <Plus size={14} strokeWidth={3} />
            New Interview
          </button>
        </div>
      </div>

      {/* History list — each row is a "Redo" action */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p
            className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase"
            style={SG}
          >
            History
          </p>
          <p className="text-[10px] text-slate-600" style={SG}>
            Click a row to open the debrief · Redo button launches a fresh session
          </p>
        </div>
        <div className="space-y-2">
          {sessions.map(s => {
            const isPending = s.id === pendingFeedbackId;
            const hasError = s.id === feedbackErrorId;
            const isLoading = s.id === redoLoadingId;
            const isEasyMed = s.difficulty === 'easy-medium';
            const isVoice = s.mode === 'voice';

            return (
              <div
                key={s.id}
                className="group relative rounded-xl px-5 py-4 transition-all hover:bg-slate-50 aria-disabled:opacity-60"
                style={{
                  background: 'var(--ll-bg-elevated)',
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => onView(s)}
                    className="flex items-center gap-4 min-w-0 flex-1 text-left"
                    title="Open debrief"
                  >
                    {/* Difficulty accent */}
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{
                        background: isEasyMed
                          ? 'rgba(52,211,153,0.55)'
                          : 'rgba(251,191,36,0.55)',
                      }}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span
                          className="text-[13px] font-semibold text-slate-800"
                          style={SG}
                        >
                          {formatDate(s.createdAt)}
                        </span>
                        {isVoice ? (
                          <span
                            className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                            style={{
                              color: 'rgb(168,85,247)',
                              background: 'rgba(168,85,247,0.12)',
                              border: '1px solid rgba(168,85,247,0.3)',
                              ...SG,
                            }}
                          >
                            <Mic size={9} strokeWidth={2.5} />
                            Voice
                          </span>
                        ) : (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                            style={{
                              color: 'var(--ll-ink-muted)',
                              background: 'var(--ll-bg-subtle)',
                              border: '1px solid var(--ll-border)',
                              ...SG,
                            }}
                          >
                            Silent
                          </span>
                        )}
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                          style={{
                            color: isEasyMed
                              ? 'rgba(52,211,153,0.75)'
                              : 'rgba(251,191,36,0.75)',
                            background: isEasyMed
                              ? 'rgba(52,211,153,0.07)'
                              : 'rgba(251,191,36,0.07)',
                            ...SG,
                          }}
                        >
                          {isVoice
                            ? (isEasyMed ? 'Easy' : 'Hard')
                            : difficultyLabel(s.difficulty)}
                        </span>
                        {isPending && (
                          <span
                            className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold uppercase tracking-wider"
                            style={SG}
                          >
                            <Loader2 size={10} className="animate-spin" />
                            Analyzing
                          </span>
                        )}
                        {hasError && (
                          <span
                            className="flex items-center gap-1 text-[10px] text-red-400 font-semibold uppercase tracking-wider"
                            style={SG}
                          >
                            <AlertCircle size={10} />
                            Analysis failed
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 truncate" style={SG}>
                        {s.problem2Slug
                          ? `${s.problem1Slug.replace(/-/g, ' ')} + ${s.problem2Slug.replace(/-/g, ' ')}`
                          : s.problem1Slug.replace(/-/g, ' ')}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 shrink-0">
                    {s.timeUsedMs != null && (
                      <span
                        className="flex items-center gap-1 text-[12px] text-slate-500"
                        style={MONO}
                      >
                        <Clock size={12} />
                        {formatTime(s.timeUsedMs)}
                      </span>
                    )}
                    <button
                      onClick={() => onView(s)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 border border-slate-200 bg-slate-50/70 transition-all hover:text-slate-900 hover:bg-blue-500/10 hover:border-blue-400/30"
                      style={SG}
                      title="Open debrief"
                    >
                      <Eye size={11} strokeWidth={2.5} />
                      View
                    </button>
                    <button
                      onClick={() => onRedo(s.id, s.difficulty, isVoice ? 'voice' : 'silent')}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 border border-slate-200 bg-slate-50/70 transition-all hover:text-slate-900 hover:bg-blue-500/10 hover:border-blue-400/30 disabled:opacity-60 disabled:cursor-wait"
                      style={SG}
                      title={isVoice ? 'Start another voice mock' : 'Redo at same difficulty'}
                    >
                      {isLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <RotateCcw size={11} strokeWidth={2.5} />
                      )}
                      Redo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function InterviewPage({ initialHistory, isPro, voiceQuota }: Props) {
  const [phase, setPhase] = useState<Phase>(initialHistory.length > 0 ? 'history' : 'setup');
  const [history, setHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active interview state
  const [activeState, setActiveState] = useState<ActiveState | null>(null);

  // Review state
  const [reviewSession, setReviewSession] = useState<InterviewSession | null>(null);

  // Feedback generation state — tracked per-session, shown inline on the history card.
  const [pendingFeedbackId, setPendingFeedbackId] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<{ sessionId: string; message: string } | null>(null);

  // Redo-in-flight id — shows a spinner on the row being redone.
  const [redoLoadingId, setRedoLoadingId] = useState<string | null>(null);

  // Recover active session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_ACTIVE_SESSION);
    if (!saved) return;
    try {
      const { sessionId, startedAt } = JSON.parse(saved);
      // Check if the session is still in_progress in history. Voice mocks
      // don't use this localStorage key, so any in-progress voice row with a
      // null problem2Slug should be ignored here.
      const session = initialHistory.find(s => s.id === sessionId && s.status === 'in_progress');
      if (session && startedAt && session.problem2Slug) {
        // Re-fetch problems and resume
        Promise.all([
          getProblemBySlug(session.problem1Slug),
          getProblemBySlug(session.problem2Slug),
        ]).then(([p1, p2]) => {
          if (p1 && p2) {
            setActiveState({ session, problems: [p1, p2], startedAt });
            setPhase('active');
          } else {
            localStorage.removeItem(LS_ACTIVE_SESSION);
          }
        }).catch(() => {
          localStorage.removeItem(LS_ACTIVE_SESSION);
        });
      } else {
        localStorage.removeItem(LS_ACTIVE_SESSION);
      }
    } catch {
      localStorage.removeItem(LS_ACTIVE_SESSION);
    }
  }, [initialHistory]);

  // ─── Start interview ────────────────────────────────────────────────────────

  const handleStart = useCallback(async (difficulty: InterviewDifficulty) => {
    setLoading(true);
    setError(null);
    try {
      const result = await startInterviewSession(difficulty);
      if (result.error || !result.session) {
        setError(result.error ?? 'Failed to start interview');
        return;
      }

      const session = result.session;
      // startInterviewSession always returns a silent mock (two slugs); this
      // guard is belt-and-suspenders for the type system.
      if (!session.problem2Slug) {
        setError('Failed to start interview (missing second problem). Please try again.');
        return;
      }
      const [p1, p2] = await Promise.all([
        getProblemBySlug(session.problem1Slug),
        getProblemBySlug(session.problem2Slug),
      ]);

      if (!p1 || !p2) {
        setError('Failed to load interview problems. Please try again.');
        return;
      }

      const startedAt = Date.now();

      // Save to localStorage for crash recovery
      localStorage.setItem(LS_ACTIVE_SESSION, JSON.stringify({ sessionId: session.id, startedAt }));

      posthog.capture('interview_started', {
        difficulty,
        problem1_slug: session.problem1Slug,
        problem2_slug: session.problem2Slug,
      });
      setActiveState({ session, problems: [p1, p2], startedAt });
      setPhase('active');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Background feedback fetch ──────────────────────────────────────────────

  const runFeedbackFetch = useCallback(async (
    sessionId: string,
    problems: [ProblemContent, ProblemContent],
    results: InterviewResults,
    difficulty: InterviewDifficulty,
  ) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55_000);

    try {
      const res = await fetch('/api/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          problems: problems.map(p => ({
            slug: p.slug,
            title: p.title,
            difficulty: p.difficulty,
            pattern: p.pattern,
            descriptionMd: p.descriptionMd,
          })),
          submissions: [
            {
              code: results.problem1Code,
              testsPassed: results.problem1Results?.passed ?? 0,
              testsTotal: results.problem1Results?.total ?? 0,
              timeSpentMs: results.timeUsedMs / 2,
            },
            {
              code: results.problem2Code,
              testsPassed: results.problem2Results?.passed ?? 0,
              testsTotal: results.problem2Results?.total ?? 0,
              timeSpentMs: results.timeUsedMs / 2,
            },
          ],
          totalTimeMs: results.timeUsedMs,
          difficulty,
        }),
      });

      if (res.ok) {
        const feedback = await res.json() as InterviewFeedback;
        await saveInterviewFeedback(sessionId, feedback);
        setHistory(prev => prev.map(s =>
          s.id === sessionId
            ? { ...s, feedback, overallScore: feedback.overallScore }
            : s,
        ));
        setReviewSession(prev => prev && prev.id === sessionId
          ? { ...prev, feedback, overallScore: feedback.overallScore }
          : prev,
        );
        setFeedbackError(prev => prev?.sessionId === sessionId ? null : prev);
      } else if (res.status === 429) {
        setFeedbackError({ sessionId, message: 'Daily AI limit reached. Try again tomorrow.' });
      } else {
        setFeedbackError({ sessionId, message: 'Feedback failed to generate. Try again.' });
      }
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      setFeedbackError({
        sessionId,
        message: isAbort ? 'Feedback timed out. Try again.' : 'Feedback failed to generate. Try again.',
      });
    } finally {
      clearTimeout(timer);
      setPendingFeedbackId(prev => prev === sessionId ? null : prev);
    }
  }, []);

  // ─── Submit interview ───────────────────────────────────────────────────────

  const handleSubmitInterview = useCallback(async (results: InterviewResults) => {
    if (!activeState) return;

    localStorage.removeItem(LS_ACTIVE_SESSION);

    const submitResult = await submitInterview({
      sessionId: activeState.session.id,
      problem1Code: results.problem1Code,
      problem2Code: results.problem2Code,
      problem1Results: results.problem1Results,
      problem2Results: results.problem2Results,
      timeUsedMs: results.timeUsedMs,
    });

    const session = submitResult.session ?? {
      ...activeState.session,
      problem1Code: results.problem1Code,
      problem2Code: results.problem2Code,
      problem1Results: results.problem1Results,
      problem2Results: results.problem2Results,
      timeUsedMs: results.timeUsedMs,
      status: 'completed',
    };

    // Optimistically put the new session at the top of history and land there.
    setHistory(prev => {
      const without = prev.filter(s => s.id !== session.id);
      return [session, ...without];
    });
    setFeedbackError(prev => prev?.sessionId === session.id ? null : prev);
    setPendingFeedbackId(session.id);
    setPhase('history');

    const problems = activeState.problems;
    const difficulty = activeState.session.difficulty;
    setActiveState(null);

    // Kick off feedback generation in the background — does not block the UI.
    void runFeedbackFetch(session.id, problems, results, difficulty);

    // Reconcile with server history in the background, preserving pending state.
    getInterviewHistory().then(serverHistory => {
      setHistory(prev => {
        const pendingLocal = prev.find(s => s.id === session.id);
        return serverHistory.map(s =>
          s.id === session.id && pendingLocal && !s.feedback
            ? { ...s, ...pendingLocal, feedback: pendingLocal.feedback ?? s.feedback }
            : s,
        );
      });
    }).catch(() => { /* non-fatal */ });
  }, [activeState, runFeedbackFetch]);

  // ─── Retry feedback from history card ──────────────────────────────────────

  const handleRetryFeedback = useCallback(async (sessionId: string) => {
    const session = history.find(s => s.id === sessionId);
    // Silent interviews only — voice sessions have a scorecard, not this
    // two-problem feedback path.
    if (!session || !session.problem1Code || !session.problem2Code || !session.problem2Slug) return;

    const [p1, p2] = await Promise.all([
      getProblemBySlug(session.problem1Slug),
      getProblemBySlug(session.problem2Slug),
    ]);
    if (!p1 || !p2) {
      setFeedbackError({ sessionId, message: 'Could not load problems to retry. Refresh and try again.' });
      return;
    }

    setFeedbackError(prev => prev?.sessionId === sessionId ? null : prev);
    setPendingFeedbackId(sessionId);

    void runFeedbackFetch(
      sessionId,
      [p1, p2],
      {
        problem1Code: session.problem1Code,
        problem2Code: session.problem2Code,
        problem1Results: session.problem1Results,
        problem2Results: session.problem2Results,
        timeUsedMs: session.timeUsedMs ?? 0,
      },
      session.difficulty,
    );
  }, [history, runFeedbackFetch]);

  // ─── View past session ──────────────────────────────────────────────────────

  const handleViewSession = useCallback((session: InterviewSession) => {
    // Pending and error states are surfaced in the right rail / dialog — don't navigate.
    if (session.id === pendingFeedbackId) return;
    if (feedbackError?.sessionId === session.id) return;

    setReviewSession(session);
    // Voice mocks have their own scorecard view with a different schema;
    // silent mocks get the two-problem ReviewScreen.
    setPhase(session.mode === 'voice' ? 'voice-review' : 'review');
  }, [pendingFeedbackId, feedbackError]);

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const goToHistory = useCallback(() => {
    setPhase(history.length > 0 ? 'history' : 'setup');
    setReviewSession(null);
  }, [history]);

  const goToSetup = useCallback(() => {
    setReviewSession(null);
    setPhase('setup');
  }, []);

  const router = useRouter();
  // Redo an interview at the same difficulty — kicks straight into an active
  // session. Voice rows route to /interview/voice so they restart in the
  // correct flow; silent rows reuse handleStart which creates a new
  // two-problem silent session.
  const handleRedo = useCallback(
    async (sessionId: string, difficulty: InterviewDifficulty, mode: 'voice' | 'silent') => {
      setRedoLoadingId(sessionId);
      setReviewSession(null);
      try {
        if (mode === 'voice') {
          router.push(`/interview/voice?difficulty=${difficulty}&duration=30&auto=1`);
        } else {
          await handleStart(difficulty);
        }
      } finally {
        setRedoLoadingId(null);
      }
    },
    [handleStart, router],
  );

  // Non-pro who already used their free mock: clicking "new interview" or
  // "redo" shows the paywall instead of attempting to start another.
  const [showPaywall, setShowPaywall] = useState(false);
  const guardedGoToSetup = useCallback(() => {
    if (!isPro && history.length > 0) { setShowPaywall(true); return; }
    goToSetup();
  }, [isPro, history.length, goToSetup]);
  const guardedRedo = useCallback(
    (sessionId: string, difficulty: InterviewDifficulty, mode: 'voice' | 'silent') => {
      if (!isPro && history.length > 0) { setShowPaywall(true); return; }
      return handleRedo(sessionId, difficulty, mode);
    },
    [isPro, history.length, handleRedo],
  );

  // Selected session id — lights up the matching row in the sidebar.
  const selectedSessionId = useMemo(() => {
    if ((phase === 'review' || phase === 'voice-review') && reviewSession) return reviewSession.id;
    return null;
  }, [phase, reviewSession]);

  const feedbackErrorId = feedbackError?.sessionId ?? null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Active interview takes over the whole screen (no AppNav, no sidebars)
  if (phase === 'active' && activeState) {
    return (
      <ActiveInterview
        problems={activeState.problems}
        startedAt={activeState.startedAt}
        onSubmit={handleSubmitInterview}
      />
    );
  }

  // Non-pro who already used their free mock clicks "new interview" / "redo":
  // show the paywall. Otherwise they fall through to the normal layout so they
  // can still review their one completed session and its feedback.
  if (showPaywall) {
    return (
      <div className="flex flex-col" style={{ height: '100vh', background: C.appBg }}>
        <AppNav activeTab="Interview" />
        <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingTop: 48 }}>
          <LockedScreen postFree />
        </div>
      </div>
    );
  }

  // Pro: dashboard-style layout with left sidebar + right rail.
  return (
    <AppShell
      activeTab="Interview"
      sidebar={
        <InterviewSidebar
          sessions={history}
          selectedSessionId={selectedSessionId}
          pendingFeedbackId={pendingFeedbackId}
          feedbackErrorId={feedbackErrorId}
          onSelectSession={handleViewSession}
        />
      }
      rail={<InterviewRightRail sessions={history} currentSession={reviewSession} />}
    >
      {phase === 'setup' ? (
        <div className="flex flex-col">
          <SetupScreen onStart={handleStart} loading={loading} voiceQuota={voiceQuota} />
          {error && (
            <p className="text-center text-[13px] text-red-400 pb-6" style={SG}>
              {error}
            </p>
          )}
        </div>
      ) : phase === 'review' && reviewSession ? (
        <div className="flex flex-col">
          <ReviewScreen
            session={reviewSession}
            onBack={goToHistory}
            onNewInterview={guardedGoToSetup}
          />
        </div>
      ) : phase === 'voice-review' && reviewSession ? (
        <div className="flex flex-col">
          <VoiceDebriefView session={reviewSession} onBack={goToHistory} />
        </div>
      ) : (
        <>
          {/* Desktop: history + redo panel (sidebar is for analysis) */}
          <div className="hidden md:block">
            <HistoryWelcome
              sessions={history}
              pendingFeedbackId={pendingFeedbackId}
              feedbackErrorId={feedbackErrorId}
              onNewInterview={guardedGoToSetup}
              onView={handleViewSession}
              onRedo={guardedRedo}
              redoLoadingId={redoLoadingId}
            />
          </div>
          {/* Mobile: full history list fallback (sidebar is hidden) */}
          <div className="md:hidden flex flex-col">
            <HistoryScreen
              sessions={history}
              pendingFeedbackId={pendingFeedbackId}
              feedbackError={feedbackError}
              onNewInterview={guardedGoToSetup}
              onViewSession={handleViewSession}
              onRetryFeedback={handleRetryFeedback}
            />
          </div>
        </>
      )}
    </AppShell>
  );
}
