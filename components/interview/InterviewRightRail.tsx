'use client';

import { Trophy, Clock, Target } from 'lucide-react';
import type { InterviewSession } from '@/lib/interview';
import { cn } from '@/lib/utils';
import ShellRail from '@/components/shell/ShellRail';
import { RailHeader, RAIL_BOX } from '@/components/shell/RailPrimitives';
import { SG } from '@/lib/ui-tokens';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

function scoreColor(score: number): string {
  if (score >= 8) return 'rgba(52,211,153,0.9)';
  if (score >= 5) return 'rgba(251,191,36,0.9)';
  return 'rgba(248,113,113,0.9)';
}

function formatTime(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Metric({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div>
      <div
        className="text-[18px] leading-none font-semibold tabular-nums"
        style={{ color: color ?? '#e2e8f0', ...MONO }}
      >
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5" style={SG}>
        {label}
      </div>
    </div>
  );
}

interface InterviewRightRailProps {
  sessions: InterviewSession[];
  currentSession: InterviewSession | null;
}

export default function InterviewRightRail({
  sessions,
  currentSession,
}: InterviewRightRailProps) {
  const completed = sessions.filter(s => s.status === 'completed' && s.overallScore != null);
  const avgScore =
    completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completed.length
      : 0;
  const bestScore =
    completed.length > 0 ? Math.max(...completed.map(s => s.overallScore ?? 0)) : 0;

  // Trend sparkline — last 10 completed, chronological (oldest → newest).
  const last10 = completed.slice(0, 10).reverse();

  // Difficulty mix across all sessions.
  const easyMedCount = sessions.filter(s => s.difficulty === 'easy-medium').length;
  const medHardCount = sessions.filter(s => s.difficulty === 'medium-hard').length;

  // Avg time — only for completed with known timeUsedMs.
  const timedSessions = completed.filter(s => s.timeUsedMs != null);
  const avgTimeMs =
    timedSessions.length > 0
      ? timedSessions.reduce((sum, s) => sum + (s.timeUsedMs ?? 0), 0) / timedSessions.length
      : 0;

  return (
    <ShellRail>
          {/* Current Session */}
          {currentSession && (
            <section>
              <RailHeader>Viewing</RailHeader>
              <div className="rounded-lg border px-3 py-2.5 bg-blue-500/[0.08] border-blue-400/45">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] text-slate-400 font-medium" style={SG}>
                    {formatDate(currentSession.createdAt)}
                  </span>
                  {currentSession.overallScore != null && (
                    <span
                      className="text-[22px] font-bold tabular-nums leading-none"
                      style={{ color: scoreColor(currentSession.overallScore), ...MONO }}
                    >
                      {currentSession.overallScore}
                    </span>
                  )}
                </div>
                <p
                  className="text-[11.5px] font-semibold text-slate-100 leading-tight truncate"
                  style={SG}
                >
                  {currentSession.problem1Slug.replace(/-/g, ' ')}
                </p>
                {currentSession.problem2Slug && (
                  <p
                    className="text-[11.5px] text-slate-400 leading-tight truncate mt-0.5"
                    style={SG}
                  >
                    + {currentSession.problem2Slug.replace(/-/g, ' ')}
                  </p>
                )}
                {currentSession.timeUsedMs != null && (
                  <div
                    className="flex items-center gap-1 mt-2 text-[10.5px] text-slate-500"
                    style={MONO}
                  >
                    <Clock size={10} />
                    {formatTime(currentSession.timeUsedMs)}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Performance overview */}
          <section>
            <RailHeader>Performance</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={String(completed.length)} label="mocks" />
              <Metric
                value={completed.length > 0 ? avgScore.toFixed(1) : '—'}
                label="avg"
                color={completed.length > 0 ? scoreColor(avgScore) : undefined}
              />
              <Metric
                value={completed.length > 0 ? `${bestScore}` : '—'}
                label="best"
                color={completed.length > 0 ? scoreColor(bestScore) : undefined}
              />
            </div>
          </section>

          {/* Trend sparkline */}
          {last10.length >= 2 && (
            <section>
              <RailHeader>Last {last10.length} scores</RailHeader>
              <div className={cn(RAIL_BOX, 'py-3')}>
                <div className="flex items-end gap-1.5 h-9">
                  {last10.map((s, i) => {
                    const score = s.overallScore ?? 0;
                    const h = Math.max(4, (score / 10) * 32);
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: h,
                          background: scoreColor(score),
                          opacity: 0.75,
                        }}
                        title={`${score}/10`}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Difficulty Mix */}
          {sessions.length > 0 && (
            <section>
              <RailHeader>Difficulty mix</RailHeader>
              <div className={cn(RAIL_BOX, 'space-y-2')}>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="flex items-center gap-1.5">
                    <Target size={11} style={{ color: 'rgba(52,211,153,0.85)' }} />
                    <span className="text-slate-500">Easy + Med</span>
                  </span>
                  <span className="text-slate-300 font-medium tabular-nums">{easyMedCount}</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="flex items-center gap-1.5">
                    <Trophy size={11} style={{ color: 'rgba(251,191,36,0.85)' }} />
                    <span className="text-slate-500">Med + Hard</span>
                  </span>
                  <span className="text-slate-300 font-medium tabular-nums">{medHardCount}</span>
                </div>
              </div>
            </section>
          )}

          {/* Avg time */}
          {timedSessions.length > 0 && (
            <section>
              <RailHeader>Timing</RailHeader>
              <div className={cn(RAIL_BOX, 'space-y-2')}>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500">Avg time</span>
                  <span className="text-slate-300 font-medium tabular-nums" style={MONO}>
                    {formatTime(avgTimeMs)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500">Session limit</span>
                  <span className="text-slate-500 tabular-nums" style={MONO}>
                    45:00
                  </span>
                </div>
              </div>
            </section>
          )}
    </ShellRail>
  );
}
