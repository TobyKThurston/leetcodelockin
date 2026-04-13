'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, ArrowRight, Trophy, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import AppNav from '@/components/AppNav';
import LockedScreen from '@/components/interview/LockedScreen';
import SetupScreen from '@/components/interview/SetupScreen';
import HistoryScreen from '@/components/interview/HistoryScreen';
import ReviewScreen from '@/components/interview/ReviewScreen';
import InterviewSidebar from '@/components/interview/InterviewSidebar';
import InterviewRightRail from '@/components/interview/InterviewRightRail';
import ActiveInterview, { type InterviewResults } from '@/components/interview/ActiveInterview';
import {
  startInterviewSession,
  submitInterview,
  saveInterviewFeedback,
  getInterviewHistory,
} from '@/app/interview/actions';
import { getProblemBySlug } from '@/app/interview/client-helpers';
import type { InterviewSession, InterviewDifficulty, InterviewFeedback } from '@/lib/interview';
import type { ProblemContent } from '@/lib/problem-types';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const C = {
  appBg: '#0b1220',
  border: 'rgba(255,255,255,0.06)',
};

type Phase = 'history' | 'setup' | 'active' | 'review';

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
}

function scoreColor(score: number): string {
  if (score >= 8) return 'rgba(52,211,153,0.9)';
  if (score >= 5) return 'rgba(251,191,36,0.9)';
  return 'rgba(248,113,113,0.9)';
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

// ─── Desktop-only welcome panel for the history phase ──────────────────────

function HistoryWelcome({
  sessions,
  pendingFeedbackId,
  feedbackErrorId,
  onNewInterview,
  onViewSession,
}: {
  sessions: InterviewSession[];
  pendingFeedbackId: string | null;
  feedbackErrorId: string | null;
  onNewInterview: () => void;
  onViewSession: (s: InterviewSession) => void;
}) {
  const completed = sessions.filter(s => s.status === 'completed' && s.overallScore != null);
  const avgScore =
    completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completed.length
      : 0;
  const bestScore =
    completed.length > 0 ? Math.max(...completed.map(s => s.overallScore ?? 0)) : 0;

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
            <Trophy size={28} style={{ color: 'rgba(96,165,250,0.8)' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[24px] font-bold text-white tracking-tight" style={SG}>
              Ready to test yourself?
            </h2>
            <p className="text-[14px] text-zinc-400 leading-relaxed">
              Take your first mock interview — 2 problems, 45 minutes, AI feedback after.
            </p>
          </div>
          <button
            onClick={onNewInterview}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.25) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 12px 32px -12px rgba(59,130,246,0.75), 0 0 0 1px rgba(96,165,250,0.35)',
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

  // >= 1 session: landing summary + recent highlights
  const recent = sessions.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-8 pt-10 pb-16">
      {/* Headline */}
      <div className="space-y-2 mb-8">
        <p
          className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase"
          style={SG}
        >
          Mock Interviews
        </p>
        <h1 className="text-[28px] font-bold text-white tracking-tight" style={SG}>
          Next mock interview?
        </h1>
        <p className="text-[14px] text-zinc-400 leading-relaxed max-w-md">
          45 minutes. Two problems. AI debrief after. Pick a past session on the left to review,
          or start a new one.
        </p>
      </div>

      {/* Quick stats + CTA row */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(59,130,246,0.04) 0%, rgba(59,130,246,0.015) 100%)',
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 0 60px -30px rgba(59,130,246,0.35)',
        }}
      >
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1" style={SG}>
                Completed
              </p>
              <p className="text-[26px] font-bold text-white leading-none" style={SG}>
                {completed.length}
              </p>
            </div>
            {completed.length > 0 && (
              <>
                <div className="w-px h-10 bg-white/[0.06]" />
                <div>
                  <p
                    className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1"
                    style={SG}
                  >
                    Avg Score
                  </p>
                  <p
                    className="text-[26px] font-bold leading-none tabular-nums"
                    style={{ ...SG, color: scoreColor(avgScore) }}
                  >
                    {avgScore.toFixed(1)}
                  </p>
                </div>
                <div className="w-px h-10 bg-white/[0.06]" />
                <div>
                  <p
                    className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1"
                    style={SG}
                  >
                    Best
                  </p>
                  <p
                    className="text-[26px] font-bold leading-none tabular-nums"
                    style={{ ...SG, color: scoreColor(bestScore) }}
                  >
                    {bestScore}
                    <span className="text-[16px] text-zinc-600">/10</span>
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onNewInterview}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:brightness-110 active:brightness-95"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.25) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 10px 24px -10px rgba(59,130,246,0.7), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            <Plus size={14} strokeWidth={3} />
            New Interview
          </button>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="space-y-3">
        <p
          className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase px-1"
          style={SG}
        >
          Recent
        </p>
        <div className="space-y-2">
          {recent.map(s => {
            const isPending = s.id === pendingFeedbackId;
            const hasError = s.id === feedbackErrorId;
            return (
              <button
                key={s.id}
                onClick={() => onViewSession(s)}
                className="w-full text-left rounded-xl px-5 py-4 transition-all hover:bg-white/[0.03]"
                style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {isPending ? (
                      <span className="flex items-center justify-center w-9">
                        <Loader2
                          size={16}
                          className="animate-spin"
                          style={{ color: 'rgba(96,165,250,0.85)' }}
                        />
                      </span>
                    ) : hasError ? (
                      <span className="flex items-center justify-center w-9">
                        <AlertCircle
                          size={16}
                          style={{ color: 'rgba(248,113,113,0.85)' }}
                        />
                      </span>
                    ) : s.overallScore != null ? (
                      <span
                        className="text-[18px] font-bold tabular-nums w-9 text-center"
                        style={{ ...MONO, color: scoreColor(s.overallScore) }}
                      >
                        {s.overallScore}
                      </span>
                    ) : (
                      <span
                        className="text-[13px] text-zinc-600 w-9 text-center"
                        style={SG}
                      >
                        —
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[13px] font-medium text-zinc-200"
                          style={SG}
                        >
                          {formatDate(s.createdAt)}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                          style={{
                            color:
                              s.difficulty === 'easy-medium'
                                ? 'rgba(52,211,153,0.75)'
                                : 'rgba(251,191,36,0.75)',
                            background:
                              s.difficulty === 'easy-medium'
                                ? 'rgba(52,211,153,0.07)'
                                : 'rgba(251,191,36,0.07)',
                          }}
                        >
                          {difficultyLabel(s.difficulty)}
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 truncate">
                        {s.problem1Slug.replace(/-/g, ' ')} +{' '}
                        {s.problem2Slug.replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-600 shrink-0">
                    {s.timeUsedMs != null && (
                      <span
                        className="flex items-center gap-1 text-[12px]"
                        style={MONO}
                      >
                        <Clock size={12} />
                        {formatTime(s.timeUsedMs)}
                      </span>
                    )}
                    <ChevronRight size={16} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function InterviewPage({ initialHistory, isPro }: Props) {
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

  // Recover active session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_ACTIVE_SESSION);
    if (!saved) return;
    try {
      const { sessionId, startedAt } = JSON.parse(saved);
      // Check if the session is still in_progress in history
      const session = initialHistory.find(s => s.id === sessionId && s.status === 'in_progress');
      if (session && startedAt) {
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
    if (!session || !session.problem1Code || !session.problem2Code) return;

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
    setPhase('review');
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

  // Selected session id — lights up the matching row in the sidebar.
  const selectedSessionId = useMemo(() => {
    if (phase === 'review' && reviewSession) return reviewSession.id;
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

  // Locked (non-pro) state keeps full-width pricing — no sidebars.
  if (!isPro) {
    return (
      <div className="flex flex-col" style={{ height: '100vh', background: C.appBg }}>
        <AppNav activeTab="Interview" />
        <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingTop: 48 }}>
          <LockedScreen />
        </div>
      </div>
    );
  }

  // Pro: dashboard-style layout with left sidebar + right rail.
  return (
    <div className="min-h-screen" style={{ background: C.appBg }}>
      <AppNav activeTab="Interview" />

      <InterviewSidebar
        sessions={history}
        selectedSessionId={selectedSessionId}
        pendingFeedbackId={pendingFeedbackId}
        feedbackErrorId={feedbackErrorId}
        onSelectSession={handleViewSession}
        onNewInterview={goToSetup}
      />

      <InterviewRightRail sessions={history} currentSession={reviewSession} />

      <main
        className="min-h-screen md:pl-[304px] lg:pr-[304px]"
        style={{
          paddingTop: 48,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {phase === 'setup' ? (
          <div className="flex flex-col min-h-[calc(100vh-48px)]">
            <SetupScreen onStart={handleStart} loading={loading} />
            {error && (
              <p className="text-center text-[13px] text-red-400 pb-6" style={SG}>
                {error}
              </p>
            )}
          </div>
        ) : phase === 'review' && reviewSession ? (
          <div className="flex flex-col min-h-[calc(100vh-48px)]">
            <ReviewScreen
              session={reviewSession}
              onBack={goToHistory}
              onNewInterview={goToSetup}
            />
          </div>
        ) : (
          <>
            {/* Desktop: welcome / summary panel (sidebar shows the list) */}
            <div className="hidden md:block">
              <HistoryWelcome
                sessions={history}
                pendingFeedbackId={pendingFeedbackId}
                feedbackErrorId={feedbackErrorId}
                onNewInterview={goToSetup}
                onViewSession={handleViewSession}
              />
            </div>
            {/* Mobile: full history list fallback (sidebar is hidden) */}
            <div className="md:hidden flex flex-col min-h-[calc(100vh-48px)]">
              <HistoryScreen
                sessions={history}
                pendingFeedbackId={pendingFeedbackId}
                feedbackError={feedbackError}
                onNewInterview={goToSetup}
                onViewSession={handleViewSession}
                onRetryFeedback={handleRetryFeedback}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
