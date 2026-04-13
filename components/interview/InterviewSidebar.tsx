'use client';

import { Plus, Loader2, AlertCircle } from 'lucide-react';
import type { InterviewSession } from '@/lib/interview';
import { cn } from '@/lib/utils';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const C = {
  panelBg: '#070c17',
  cardBgDark: '#070c17',
  border: 'rgba(255,255,255,0.06)',
  blue: '#3b82f6',
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
        'w-full text-left rounded-lg px-3 py-2.5 transition-all border',
        isActive
          ? 'bg-blue-500/[0.08] border-blue-400/45'
          : 'bg-white/[0.015] border-white/[0.045] hover:bg-white/[0.035]',
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {isPending ? (
          <Loader2 size={12} className="animate-spin" style={{ color: 'rgba(96,165,250,0.85)' }} />
        ) : hasError ? (
          <AlertCircle size={12} style={{ color: 'rgba(248,113,113,0.85)' }} />
        ) : score != null ? (
          <span
            className="text-[13px] font-bold tabular-nums leading-none"
            style={{ color: scoreColor(score), ...MONO }}
          >
            {score}
          </span>
        ) : (
          <span className="text-[11px] text-slate-600 leading-none" style={MONO}>
            —
          </span>
        )}
        <span className="text-[10.5px] text-slate-500 font-medium" style={SG}>
          {formatDate(session.createdAt)}
        </span>
        <span
          className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
          style={{
            color: isEasyMed ? 'rgba(52,211,153,0.85)' : 'rgba(251,191,36,0.85)',
            background: isEasyMed ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
            ...SG,
          }}
        >
          {isEasyMed ? 'E+M' : 'M+H'}
        </span>
      </div>
      <p className="text-[11.5px] text-slate-300 leading-tight truncate" style={SG}>
        {session.problem1Slug.replace(/-/g, ' ')}
      </p>
      <p className="text-[11.5px] text-slate-500 leading-tight truncate" style={SG}>
        + {session.problem2Slug.replace(/-/g, ' ')}
      </p>
    </button>
  );
}

interface InterviewSidebarProps {
  sessions: InterviewSession[];
  selectedSessionId: string | null;
  pendingFeedbackId: string | null;
  feedbackErrorId: string | null;
  onSelectSession: (session: InterviewSession) => void;
  onNewInterview: () => void;
}

export default function InterviewSidebar({
  sessions,
  selectedSessionId,
  pendingFeedbackId,
  feedbackErrorId,
  onSelectSession,
  onNewInterview,
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
      {/* Header row with label + New button */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <p
          className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase px-1"
          style={SG}
        >
          Mock Interviews
        </p>
        <button
          onClick={onNewInterview}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-white transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
            border: '1px solid rgba(147,197,253,0.55)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.22) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 6px 14px -8px rgba(59,130,246,0.7)',
            ...SG,
          }}
        >
          <Plus size={11} strokeWidth={3} />
          New
        </button>
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
