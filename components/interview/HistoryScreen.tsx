'use client';

import { useState } from 'react';
import { Trophy, Clock, ChevronRight, ArrowRight, Plus, AlertCircle, RotateCw, Loader2, CheckCircle2 } from 'lucide-react';
import type { InterviewSession } from '@/lib/interview';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const BORDER = 'rgba(15,23,42,0.08)';

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

interface HistoryScreenProps {
  sessions: InterviewSession[];
  pendingFeedbackId?: string | null;
  feedbackError?: { sessionId: string; message: string } | null;
  onNewInterview: () => void;
  onViewSession: (session: InterviewSession) => void;
  onRetryFeedback?: (sessionId: string) => void;
}

export default function HistoryScreen({
  sessions,
  pendingFeedbackId,
  feedbackError,
  onNewInterview,
  onViewSession,
  onRetryFeedback,
}: HistoryScreenProps) {
  const [errorDialogSessionId, setErrorDialogSessionId] = useState<string | null>(null);
  const dialogSession = errorDialogSessionId
    ? sessions.find(s => s.id === errorDialogSessionId) ?? null
    : null;
  const dialogErrorMessage = dialogSession && feedbackError?.sessionId === dialogSession.id
    ? feedbackError.message
    : null;

  const completed = sessions.filter(s => s.status === 'completed' && s.overallScore != null);
  const avgScore = completed.length > 0
    ? completed.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completed.length
    : 0;
  const bestScore = completed.length > 0
    ? Math.max(...completed.map(s => s.overallScore ?? 0))
    : 0;
  const last10 = completed.slice(0, 10).reverse();

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Trophy size={28} style={{ color: '#1d4ed8' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[22px] font-bold text-slate-900 tracking-tight" style={SG}>
              Ready to test yourself?
            </h2>
            <p className="text-[14px] text-slate-400 leading-relaxed">
              Take your first mock interview — 2 problems, 45 minutes, AI feedback after.
            </p>
          </div>
          <button
            onClick={onNewInterview}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-slate-900 transition-all hover:brightness-110"
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
    <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight" style={SG}>
            Mock Interviews
          </h1>
          <button
            onClick={onNewInterview}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-900 transition-all hover:brightness-110 active:brightness-95"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(15,23,42,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 10px 24px -10px rgba(59,130,246,0.7), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            <Plus size={14} />
            New Interview
          </button>
        </div>

        {/* Stats row */}
        {completed.length > 0 && (
          <div
            className="grid grid-cols-3 gap-4 rounded-xl px-5 py-4"
            style={{ background: 'rgba(15,23,42,0.04)', border: `1px solid ${BORDER}` }}
          >
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1" style={SG}>Completed</p>
              <p className="text-[20px] font-bold text-slate-900" style={SG}>{completed.length}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1" style={SG}>Avg Score</p>
              <p className="text-[20px] font-bold" style={{ ...SG, color: scoreColor(avgScore) }}>
                {avgScore.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1" style={SG}>Best</p>
              <p className="text-[20px] font-bold" style={{ ...SG, color: scoreColor(bestScore) }}>
                {bestScore}/10
              </p>
            </div>

            {/* Trend sparkline */}
            {last10.length >= 2 && (
              <div className="col-span-3 pt-2">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2" style={SG}>Last {last10.length} scores</p>
                <div className="flex items-end gap-1.5 h-8">
                  {last10.map((s, i) => {
                    const score = s.overallScore ?? 0;
                    const h = Math.max(4, (score / 10) * 32);
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{ height: h, background: scoreColor(score), opacity: 0.7 }}
                        title={`${score}/10`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session list */}
        <div className="space-y-2">
          {sessions.map(s => {
            const isPending = s.id === pendingFeedbackId;
            const hasError = feedbackError?.sessionId === s.id;
            const r1 = s.problem1Results;
            const r2 = s.problem2Results;
            const passedAll =
              !!r1 && !!r2 && r1.total > 0 && r2.total > 0 &&
              r1.passed === r1.total && r2.passed === r2.total;

            const handleClick = () => {
              if (isPending) return;
              if (hasError) {
                setErrorDialogSessionId(s.id);
                return;
              }
              onViewSession(s);
            };

            return (
              <button
                key={s.id}
                onClick={handleClick}
                className={`w-full text-left rounded-xl px-5 py-4 transition-all ${isPending ? 'cursor-default' : 'hover:bg-slate-50/50'}`}
                style={{ background: 'rgba(15,23,42,0.03)', border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {isPending ? (
                      <span
                        className="flex items-center justify-center w-10"
                        aria-label="Analyzing"
                      >
                        <Loader2 size={18} className="animate-spin" style={{ color: '#1d4ed8' }} />
                      </span>
                    ) : hasError ? (
                      <span className="flex items-center justify-center w-10">
                        {passedAll ? (
                          <CheckCircle2 size={18} style={{ color: '#047857' }} />
                        ) : (
                          <AlertCircle size={18} style={{ color: '#b91c1c' }} />
                        )}
                      </span>
                    ) : s.overallScore != null ? (
                      <span
                        className="text-[18px] font-bold tabular-nums w-10 text-center"
                        style={{ ...MONO, color: scoreColor(s.overallScore) }}
                      >
                        {s.overallScore}
                      </span>
                    ) : (
                      <span className="text-[13px] text-slate-600 w-10 text-center" style={SG}>
                        {s.status === 'in_progress' ? '…' : '—'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-slate-200" style={SG}>
                          {formatDate(s.createdAt)}
                        </span>
                        <span
                          className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            color: s.difficulty === 'easy-medium' ? 'rgba(52,211,153,0.7)' : 'rgba(251,191,36,0.7)',
                            background: s.difficulty === 'easy-medium' ? 'rgba(52,211,153,0.07)' : 'rgba(251,191,36,0.07)',
                          }}
                        >
                          {difficultyLabel(s.difficulty)}
                        </span>
                        {isPending && (
                          <Badge
                            className="bg-blue-500/10 text-blue-300 border-blue-500/25 text-[10px] font-semibold tracking-wide uppercase"
                            style={SG}
                          >
                            Analyzing
                          </Badge>
                        )}
                        {hasError && passedAll && (
                          <Badge
                            className="bg-emerald-500/10 text-emerald-300 border-emerald-500/25 text-[10px] font-semibold tracking-wide uppercase"
                            style={SG}
                          >
                            All tests passed
                          </Badge>
                        )}
                        {hasError && !passedAll && (
                          <Badge
                            className="bg-red-500/10 text-red-300 border-red-500/25 text-[10px] font-semibold tracking-wide uppercase"
                            style={SG}
                          >
                            Analysis failed
                          </Badge>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                        {s.problem1Slug.replace(/-/g, ' ')} + {s.problem2Slug.replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 shrink-0">
                    {s.timeUsedMs != null && (
                      <span className="flex items-center gap-1 text-[12px]" style={MONO}>
                        <Clock size={12} />
                        {formatTime(s.timeUsedMs)}
                      </span>
                    )}
                    {!isPending && <ChevronRight size={16} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback error popup — small, keeps history visible behind */}
      <Dialog
        open={!!dialogSession}
        onOpenChange={(open) => {
          if (!open) setErrorDialogSessionId(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={SG}>
              <AlertCircle size={16} style={{ color: '#b91c1c' }} />
              Analysis unavailable
            </DialogTitle>
            <DialogDescription className="text-[13px] text-slate-400 leading-relaxed">
              {dialogErrorMessage ?? 'We couldn\u2019t generate feedback for this session. Your code and results are still saved.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="h-9 text-[13px]"
              style={SG}
              onClick={() => setErrorDialogSessionId(null)}
            >
              Close
            </Button>
            {onRetryFeedback && dialogSession && (
              <Button
                className="h-9 text-[13px] bg-blue-600 hover:bg-blue-500 text-slate-900 gap-1.5"
                style={SG}
                onClick={() => {
                  const id = dialogSession.id;
                  setErrorDialogSessionId(null);
                  onRetryFeedback(id);
                }}
              >
                <RotateCw size={13} />
                Retry analysis
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
