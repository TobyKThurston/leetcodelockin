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
  const [reviewFeedback, setReviewFeedback] = useState<InterviewFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

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

    const session = submitResult.session ?? activeState.session;
    setReviewSession(session);
    setPhase('review');
    setActiveState(null);

    // Generate AI feedback
    setLoadingFeedback(true);
    setReviewFeedback(null);
    try {
      const res = await fetch('/api/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problems: activeState.problems.map(p => ({
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
              timeSpentMs: results.timeUsedMs / 2, // approximate
            },
            {
              code: results.problem2Code,
              testsPassed: results.problem2Results?.passed ?? 0,
              testsTotal: results.problem2Results?.total ?? 0,
              timeSpentMs: results.timeUsedMs / 2,
            },
          ],
          totalTimeMs: results.timeUsedMs,
          difficulty: activeState.session.difficulty,
        }),
      });

      if (res.ok) {
        const feedback = await res.json() as InterviewFeedback;
        setReviewFeedback(feedback);
        // Save feedback to database
        await saveInterviewFeedback(session.id, feedback);
        // Update the session in review state
        setReviewSession(prev => prev ? { ...prev, feedback, overallScore: feedback.overallScore } : prev);
      }
    } catch {
      // Feedback generation failed — still show review without it
    } finally {
      setLoadingFeedback(false);
    }

    // Refresh history
    const updatedHistory = await getInterviewHistory();
    setHistory(updatedHistory);
  }, [activeState]);

  // ─── View past session ──────────────────────────────────────────────────────

  const handleViewSession = useCallback((session: InterviewSession) => {
    setReviewSession(session);
    setReviewFeedback(session.feedback);
    setLoadingFeedback(false);
    setPhase('review');
  }, []);

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const goToHistory = useCallback(() => {
    setPhase(history.length > 0 ? 'history' : 'setup');
    setReviewSession(null);
    setReviewFeedback(null);
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
            feedback={reviewFeedback}
            loadingFeedback={loadingFeedback}
            onBack={goToHistory}
            onNewInterview={goToSetup}
          />
        ) : (
          <HistoryScreen
            sessions={history}
            onNewInterview={goToSetup}
            onViewSession={handleViewSession}
          />
        )}
      </div>
    </div>
  );
}
