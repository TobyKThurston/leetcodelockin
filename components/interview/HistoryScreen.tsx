'use client';

import { Trophy, Clock, ArrowRight, Plus } from 'lucide-react';
import type { InterviewSession } from '@/lib/interview';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const BORDER = 'rgba(255,255,255,0.06)';

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
  onNewInterview: () => void;
  onViewSession: (session: InterviewSession) => void;
}

export default function HistoryScreen({ sessions, onNewInterview, onViewSession }: HistoryScreenProps) {
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
            <Trophy size={28} style={{ color: 'rgba(96,165,250,0.8)' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[22px] font-bold text-white tracking-tight" style={SG}>
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
              boxShadow: '0 12px 32px -12px rgba(59,130,246,0.65), 0 0 0 1px rgba(96,165,250,0.35)',
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
          <h1 className="text-[22px] font-bold text-white tracking-tight" style={SG}>
            Mock Interviews
          </h1>
          <button
            onClick={onNewInterview}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors hover:brightness-110"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
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
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}` }}
          >
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1" style={SG}>Completed</p>
              <p className="text-[20px] font-bold text-white" style={SG}>{completed.length}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1" style={SG}>Avg Score</p>
              <p className="text-[20px] font-bold" style={{ ...SG, color: scoreColor(avgScore) }}>
                {avgScore.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1" style={SG}>Best</p>
              <p className="text-[20px] font-bold" style={{ ...SG, color: scoreColor(bestScore) }}>
                {bestScore}/10
              </p>
            </div>

            {/* Trend sparkline */}
            {last10.length >= 2 && (
              <div className="col-span-3 pt-2">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2" style={SG}>Last {last10.length} scores</p>
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
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => onViewSession(s)}
              className="w-full text-left rounded-xl px-5 py-4 transition-all hover:bg-white/[0.02]"
              style={{ background: 'rgba(255,255,255,0.015)', border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {s.overallScore != null ? (
                    <span
                      className="text-[18px] font-bold tabular-nums w-10 text-center"
                      style={{ ...MONO, color: scoreColor(s.overallScore) }}
                    >
                      {s.overallScore}
                    </span>
                  ) : (
                    <span className="text-[13px] text-zinc-600 w-10 text-center" style={SG}>
                      {s.status === 'in_progress' ? '…' : '—'}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-200" style={SG}>
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
                    </div>
                    <p className="text-[12px] text-zinc-500 mt-0.5">
                      {s.problem1Slug.replace(/-/g, ' ')} + {s.problem2Slug.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-600">
                  {s.timeUsedMs != null && (
                    <span className="flex items-center gap-1 text-[12px]" style={MONO}>
                      <Clock size={12} />
                      {formatTime(s.timeUsedMs)}
                    </span>
                  )}
                  <ArrowRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
