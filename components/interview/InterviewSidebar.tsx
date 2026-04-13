'use client';

import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import type { InterviewSession } from '@/lib/interview';
import { cn } from '@/lib/utils';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const C = {
  panelBg: '#070c17',
  cardBgDark: '#070c17',
  border: 'rgba(255,255,255,0.06)',
};

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
  const score = session.overallScore;
  const isEasyMed = session.difficulty === 'easy-medium';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg px-3 py-2.5 transition-all border flex items-center gap-3',
        isActive
          ? 'bg-blue-500/[0.08] border-blue-400/45'
          : 'bg-white/[0.015] border-white/[0.05] hover:bg-white/[0.035]',
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
          <span className="text-[14px] text-slate-600 leading-none" style={MONO}>
            —
          </span>
        )}
      </div>

      {/* Date + difficulty */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-slate-300 font-medium leading-tight" style={SG}>
          {formatDate(session.createdAt)}
        </p>
        <p className="text-[10px] text-slate-500 leading-tight mt-0.5" style={SG}>
          {isEasyMed ? 'Easy + Med' : 'Med + Hard'}
        </p>
      </div>

      {/* Difficulty accent bar */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{
          background: isEasyMed ? 'rgba(52,211,153,0.55)' : 'rgba(251,191,36,0.55)',
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
  const completed = sessions.filter(s => s.status === 'completed' && s.overallScore != null);
  const avgScore =
    completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completed.length
      : 0;
  const bestScore =
    completed.length > 0 ? Math.max(...completed.map(s => s.overallScore ?? 0)) : 0;

  return (
    <aside
      className="fixed left-0 bottom-0 hidden md:flex flex-col"
      style={{
        top: 48,
        width: 304,
        background: C.panelBg,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-2">
        <BarChart3 size={11} className="text-slate-600" strokeWidth={2.5} />
        <p
          className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase"
          style={SG}
        >
          Debriefs
        </p>
      </div>

      {/* Session list */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.border} transparent` }}
      >
        <div className="px-4 pb-3 space-y-1.5">
          {sessions.length === 0 ? (
            <p
              className="text-[11.5px] text-slate-600 leading-relaxed px-1 py-6 text-center"
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
      </div>

      {/* Stats subpanel */}
      <div
        className="px-4 py-4 space-y-2.5"
        style={{ borderTop: `1px solid ${C.border}`, background: C.cardBgDark }}
      >
        <div className="flex justify-between text-[11.5px]">
          <span className="text-slate-500 font-medium">Completed</span>
          <span className="text-slate-300 font-semibold tabular-nums">{completed.length}</span>
        </div>
        <div className="flex justify-between text-[11.5px]">
          <span className="text-slate-500 font-medium">Avg score</span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: completed.length > 0 ? scoreColor(avgScore) : 'rgba(148,163,184,0.6)',
            }}
          >
            {completed.length > 0 ? avgScore.toFixed(1) : '—'}
          </span>
        </div>
        <div className="flex justify-between text-[11.5px]">
          <span className="text-slate-500 font-medium">Best</span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: completed.length > 0 ? scoreColor(bestScore) : 'rgba(148,163,184,0.6)',
            }}
          >
            {completed.length > 0 ? `${bestScore}/10` : '—'}
          </span>
        </div>
      </div>
    </aside>
  );
}
