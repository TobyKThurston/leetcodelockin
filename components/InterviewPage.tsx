'use client';

import { useState, useCallback, useEffect } from 'react';
import AppNav from '@/components/AppNav';
import LockedScreen from '@/components/interview/LockedScreen';
import SetupScreen from '@/components/interview/SetupScreen';
import HistoryScreen from '@/components/interview/HistoryScreen';
import ReviewScreen from '@/components/interview/ReviewScreen';
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

const BG_BASE = '#0b1220';

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
    // Card handles pending + error states inline — don't navigate away from history.
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

  const goToSetup = useCallback(() => setPhase('setup'), []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Active interview takes over the whole screen (no AppNav)
  if (phase === 'active' && activeState) {
    return (
      <ActiveInterview
        problems={activeState.problems}
        startedAt={activeState.startedAt}
        onSubmit={handleSubmitInterview}
      />
    );
  }

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: BG_BASE }}>
      <AppNav activeTab="Interview" />
      <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingTop: 48 }}>
        {!isPro ? (
          <LockedScreen />
        ) : phase === 'setup' ? (
          <>
            <SetupScreen onStart={handleStart} loading={loading} />
            {error && (
              <p className="text-center text-[13px] text-red-400 pb-4">{error}</p>
            )}
          </>
        ) : phase === 'review' && reviewSession ? (
          <ReviewScreen
            session={reviewSession}
            onBack={goToHistory}
            onNewInterview={goToSetup}
          />
        ) : (
          <HistoryScreen
            sessions={history}
            pendingFeedbackId={pendingFeedbackId}
            feedbackError={feedbackError}
            onNewInterview={goToSetup}
            onViewSession={handleViewSession}
            onRetryFeedback={handleRetryFeedback}
          />
        )}
      </div>
    </div>
  );
}
