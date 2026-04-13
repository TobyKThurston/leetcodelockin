'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Lock, Target } from 'lucide-react';
import { CURRICULUM, isLesson, isPractice } from '@/lib/curriculum';
import { cn } from '@/lib/utils';
import AppShell from '@/components/shell/AppShell';
import ShellSidebar from '@/components/shell/ShellSidebar';
import ShellRail from '@/components/shell/ShellRail';
import { RailHeader, MetricRow, RAIL_BOX } from '@/components/shell/RailPrimitives';
import { C, SG } from '@/lib/ui-tokens';
import {
  ProgressView,
  computePathStatuses,
  type PathStatus,
} from '@/components/DashboardPage';

// ─── Left Sidebar — per-path progress ────────────────────────────────────────

function ProgressSidebar({
  pathStatuses, completedIds, onNavigateToPath,
}: {
  pathStatuses: Record<string, PathStatus>;
  completedIds: Set<string>;
  onNavigateToPath: (pathId: string) => void;
}) {
  const totalBlocks   = CURRICULUM.reduce((s, p) => s + p.blocks.length, 0);
  const totalComplete = completedIds.size;
  const masteryPct    = Math.round((totalComplete / totalBlocks) * 100);

  return (
    <ShellSidebar
      footer={
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500 font-medium">Mastery</span>
              <span className="text-slate-300 font-semibold tabular-nums">{masteryPct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${masteryPct}%`, background: C.blue }}
              />
            </div>
          </div>
          {([
            ['Blocks',   `${totalComplete} / ${totalBlocks}`],
            ['Paths',    `${CURRICULUM.filter(p => pathStatuses[p.id] === 'complete').length} / ${CURRICULUM.length}`],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between text-[11.5px]">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-400 font-medium tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      }
    >
      <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
        Path Progress
      </p>
      {CURRICULUM.map(path => {
        const status = pathStatuses[path.id] ?? 'locked';
        const locked   = status === 'locked';
        const complete = status === 'complete';
        const blocksComplete = path.blocks.filter(b => completedIds.has(b.id)).length;
        const pct = Math.round((blocksComplete / path.blocks.length) * 100);
        const n   = String(path.order).padStart(2, '0');

        return (
          <button
            key={path.id}
            type="button"
            onClick={locked ? undefined : () => onNavigateToPath(path.id)}
            disabled={locked}
            className={cn(
              'group w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
              locked && 'cursor-default opacity-45 bg-slate-900/30 border-slate-800/40',
              !locked && 'cursor-pointer',
              complete && 'bg-slate-800/30 border-emerald-500/25 hover:border-emerald-500/40',
              !complete && !locked && 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600/70',
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={cn(
                  'font-mono text-[10px] font-bold tabular-nums tracking-wider',
                  locked && 'text-slate-700',
                  complete && 'text-emerald-400/70',
                  !complete && !locked && 'text-slate-500',
                )}
              >
                {n}
              </span>
              {locked && <Lock size={10} className="text-slate-700" />}
              {!locked && complete && <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />}
            </div>
            <p
              className={cn(
                'text-[12.5px] font-semibold leading-tight mb-0.5 tracking-[-0.005em]',
                locked && 'text-slate-600',
                complete && 'text-slate-300',
                !complete && !locked && 'text-slate-200',
              )}
              style={SG}
            >
              {path.title}
            </p>
            <p
              className={cn(
                'text-[10.5px] leading-snug mb-2.5',
                locked && 'text-slate-800',
                complete && 'text-slate-500',
                !complete && !locked && 'text-slate-400',
              )}
            >
              {path.description}
            </p>
            {!locked && (
              <div>
                <div
                  className={cn(
                    'flex justify-between mb-1 text-[9.5px] font-medium',
                    complete && 'text-slate-500',
                    !complete && 'text-slate-400',
                  )}
                >
                  <span>{blocksComplete} / {path.blocks.length} blocks</span>
                  <span className="tabular-nums">{pct}%</span>
                </div>
                <div className="h-[2px] rounded-full bg-slate-900/60 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      complete ? 'bg-emerald-500' : 'bg-blue-500',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </button>
        );
      })}
    </ShellSidebar>
  );
}

// ─── Right Rail — milestones & recent activity ───────────────────────────────

interface Milestone {
  label: string;
  reached: boolean;
}

function ProgressRightRail({
  pathStatuses, completedIds,
}: {
  pathStatuses: Record<string, PathStatus>;
  completedIds: Set<string>;
}) {
  const totalBlocks   = CURRICULUM.reduce((s, p) => s + p.blocks.length, 0);
  const totalComplete = completedIds.size;
  const pathsComplete = CURRICULUM.filter(p => pathStatuses[p.id] === 'complete').length;

  const completedBlocks = CURRICULUM.flatMap(p => p.blocks).filter(b => completedIds.has(b.id));
  const lessonsComplete  = completedBlocks.filter(isLesson).reduce((s, b) => s + b.lessonCount, 0);
  const problemsComplete = completedBlocks.filter(isLesson).reduce((s, b) => s + b.problemCount, 0)
    + completedBlocks.filter(isPractice).length;

  const skillCount = new Set(
    completedBlocks.filter(isLesson).flatMap(b => b.skills),
  ).size;

  const milestones: Milestone[] = [
    { label: 'Complete first block',     reached: totalComplete >= 1 },
    { label: 'Complete 5 blocks',        reached: totalComplete >= 5 },
    { label: 'Complete 10 blocks',       reached: totalComplete >= 10 },
    { label: 'Finish first path',        reached: pathsComplete >= 1 },
    { label: 'Master 10 skills',         reached: skillCount >= 10 },
    { label: 'Complete half the blocks',  reached: totalComplete >= Math.ceil(totalBlocks / 2) },
    { label: 'Finish all paths',         reached: pathsComplete === CURRICULUM.length },
  ];

  const reached  = milestones.filter(m => m.reached);
  const upcoming = milestones.filter(m => !m.reached);

  const recentCompleted = CURRICULUM
    .flatMap(p => p.blocks
      .filter(b => completedIds.has(b.id))
      .map(b => ({ block: b, pathTitle: p.title }))
    )
    .slice(-5)
    .reverse();

  return (
    <ShellRail>
          {/* 1 — Summary */}
          <section>
            <RailHeader>Summary</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              <MetricRow label="Lessons done"  value={String(lessonsComplete)} />
              <MetricRow label="Problems done"  value={String(problemsComplete)} />
              <MetricRow label="Skills learned" value={String(skillCount)} />
              <MetricRow label="Paths complete" value={`${pathsComplete} / ${CURRICULUM.length}`} />
            </div>
          </section>

          {/* 2 — Milestones */}
          <section>
            <RailHeader>Milestones</RailHeader>
            <div className="space-y-1.5">
              {reached.map(m => (
                <div
                  key={m.label}
                  className={cn(RAIL_BOX, 'flex items-center gap-2.5')}
                >
                  <CheckCircle2 size={13} strokeWidth={2.25} className="text-emerald-400 shrink-0" />
                  <span className="text-[11.5px] text-slate-300 font-medium">{m.label}</span>
                </div>
              ))}
              {upcoming.slice(0, 3).map(m => (
                <div
                  key={m.label}
                  className={cn(RAIL_BOX, 'flex items-center gap-2.5 opacity-50')}
                >
                  <Target size={13} strokeWidth={2} className="text-slate-600 shrink-0" />
                  <span className="text-[11.5px] text-slate-500 font-medium">{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 3 — Recent Completions */}
          {recentCompleted.length > 0 && (
            <section>
              <RailHeader>Recent Completions</RailHeader>
              <div className="space-y-1.5">
                {recentCompleted.map(({ block, pathTitle }) => {
                  const n = String(block.order).padStart(2, '0');
                  return (
                    <div
                      key={block.id}
                      className={cn(RAIL_BOX, 'flex items-start gap-2.5')}
                    >
                      <span className="font-mono text-[10px] font-bold tabular-nums tracking-wider text-emerald-400/70 mt-0.5 shrink-0">
                        {n}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-[12px] font-semibold leading-tight text-slate-200 tracking-[-0.005em] truncate"
                          style={SG}
                        >
                          {block.title}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                          {pathTitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
    </ShellRail>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProgressPageClient({ initialCompleted }: { initialCompleted: string[] }) {
  const router = useRouter();
  const completedIds = new Set(initialCompleted);
  const pathStatuses = computePathStatuses(completedIds);

  const handleNavigateToPath = () => {
    router.push('/dashboard');
  };

  const handleResumeBlock = () => {
    router.push('/dashboard');
  };

  return (
    <AppShell
      activeTab="Progress"
      unconstrained
      sidebar={
        <ProgressSidebar
          pathStatuses={pathStatuses}
          completedIds={completedIds}
          onNavigateToPath={handleNavigateToPath}
        />
      }
      rail={
        <ProgressRightRail
          pathStatuses={pathStatuses}
          completedIds={completedIds}
        />
      }
    >
      <ProgressView
        pathStatuses={pathStatuses}
        completedIds={completedIds}
        onNavigateToPath={handleNavigateToPath}
        onResumeBlock={handleResumeBlock}
      />
    </AppShell>
  );
}
