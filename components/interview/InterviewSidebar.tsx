'use client';

import { Loader2, AlertCircle, History as HistoryIcon, Mic } from 'lucide-react';
import { type InterviewSession, getSessionRating } from '@/lib/interview';
import { cn } from '@/lib/utils';
import ShellSidebar from '@/components/shell/ShellSidebar';
import { SG } from '@/lib/ui-tokens';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

function scoreColor(score: number): string {
  if (score >= 8) return 'rgba(52,211,153,0.9)';
  if (score >= 5) return 'rgba(251,191,36,0.9)';
  return 'rgba(248,113,113,0.9)';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SessionRow({
  session,
  isActive,
  isPending,
  hasError,
  onClick,
}: {
  session: InterviewSession;
  isActive: boolean;
  isPending: boolean;
  hasError: boolean;
  onClick: () => void;
}) {
  // Combined rating works for both voice (avg of 4 dims) and silent
  // (feedback.overallScore). Returned value is already 1-10.
  const score = getSessionRating(session);
  const isEasyMed = session.difficulty === 'easy-medium';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg px-3 py-2.5 transition-colors duration-150 border flex items-center gap-3',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        isActive &&
          'bg-white dark:bg-[var(--ll-bg-elevated)] border-blue-400/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(59,130,246,0.25)]',
        !isActive &&
          'bg-[var(--ll-bg-card)] border-[var(--ll-border)] hover:bg-white dark:hover:bg-[var(--ll-bg-hover)] hover:border-[var(--ll-border-strong)]',
      )}
    >
      {/* Score badge */}
      <div className="w-9 shrink-0 flex items-center justify-center">
        {isPending ? (
          <Loader2
            size={16}
            className="animate-spin"
            style={{ color: 'rgba(96,165,250,0.85)' }}
          />
        ) : hasError ? (
          <AlertCircle size={16} style={{ color: 'rgba(248,113,113,0.85)' }} />
        ) : score != null ? (
          <span
            className="text-[20px] font-bold tabular-nums leading-none"
            style={{ color: scoreColor(score), ...MONO }}
          >
            {score}
          </span>
        ) : (
          <span className="text-[14px] text-[var(--ll-ink-subtle)] leading-none" style={MONO}>
            —
          </span>
        )}
      </div>

      {/* Date + mode + difficulty */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p
            className="text-[12px] text-[var(--ll-ink)] font-medium leading-tight"
            style={SG}
          >
            {formatDate(session.createdAt)}
          </p>
          {session.mode === 'voice' && (
            <Mic
              size={10}
              strokeWidth={2.5}
              style={{ color: 'rgb(168,85,247)' }}
              aria-label="Voice mock"
            />
          )}
        </div>
        <p
          className="text-[10px] text-[var(--ll-ink-muted)] leading-tight mt-0.5"
          style={SG}
        >
          {session.mode === 'voice'
            ? (isEasyMed ? 'Voice · Easy' : 'Voice · Hard')
            : (isEasyMed ? 'Easy + Med' : 'Med + Hard')}
        </p>
      </div>

      {/* Difficulty accent bar */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{
          background: isEasyMed ? 'rgba(16,185,129,0.7)' : 'rgba(234,179,8,0.7)',
        }}
      />
    </button>
  );
}

interface InterviewSidebarProps {
  sessions: InterviewSession[];
  selectedSessionId: string | null;
  pendingFeedbackId: string | null;
  feedbackErrorId: string | null;
  onSelectSession: (session: InterviewSession) => void;
}

export default function InterviewSidebar({
  sessions,
  selectedSessionId,
  pendingFeedbackId,
  feedbackErrorId,
  onSelectSession,
}: InterviewSidebarProps) {
  // Footer stats include both voice and silent — getSessionRating returns
  // the right combined rating regardless of mode.
  const rated = sessions
    .filter(s => s.status === 'completed')
    .map(s => getSessionRating(s))
    .filter((r): r is number => r != null);
  const completed = { length: rated.length };
  const avgScore = rated.length > 0 ? rated.reduce((a, b) => a + b, 0) / rated.length : 0;
  const bestScore = rated.length > 0 ? Math.max(...rated) : 0;

  return (
    <ShellSidebar
      className="hidden md:flex"
      footer={
        <div className="space-y-2.5">
          <div className="flex justify-between text-[11.5px]">
            <span className="text-[var(--ll-ink-muted)] font-medium">Completed</span>
            <span className="text-[var(--ll-ink)] font-semibold tabular-nums">{completed.length}</span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-[var(--ll-ink-muted)] font-medium">Avg score</span>
            <span
              className="font-semibold tabular-nums"
              style={{
                color: completed.length > 0 ? scoreColor(avgScore) : 'var(--ll-ink-faint)',
              }}
            >
              {completed.length > 0 ? avgScore.toFixed(1) : '—'}
            </span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-[var(--ll-ink-muted)] font-medium">Best</span>
            <span
              className="font-semibold tabular-nums"
              style={{
                color: completed.length > 0 ? scoreColor(bestScore) : 'var(--ll-ink-faint)',
              }}
            >
              {completed.length > 0 ? `${bestScore}/10` : '—'}
            </span>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <HistoryIcon size={11} className="text-[var(--ll-ink-subtle)]" strokeWidth={2.5} />
        <p
          className="text-[10px] font-bold text-[var(--ll-ink-subtle)] tracking-[0.16em] uppercase"
          style={SG}
        >
          History
        </p>
      </div>
      <div className="space-y-1.5">
        {sessions.length === 0 ? (
          <p
            className="text-[11.5px] text-[var(--ll-ink-muted)] leading-relaxed px-1 py-6 text-center"
            style={SG}
          >
            No mock interviews yet.
            <br />
            Start your first one.
          </p>
        ) : (
          sessions.map(s => (
            <SessionRow
              key={s.id}
              session={s}
              isActive={s.id === selectedSessionId}
              isPending={s.id === pendingFeedbackId}
              hasError={s.id === feedbackErrorId}
              onClick={() => onSelectSession(s)}
            />
          ))
        )}
      </div>
    </ShellSidebar>
  );
}
