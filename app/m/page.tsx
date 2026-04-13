import Link from 'next/link';
import { ArrowRight, BookOpen, Layers, Flame } from 'lucide-react';
import { CURRICULUM, isLesson } from '@/lib/curriculum';
import { getCompletedBlocks } from '@/lib/progress';
import { getStreakData } from '@/lib/streaks';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

function collectAllBlockIds() {
  const ids: string[] = [];
  for (const path of CURRICULUM) {
    for (const block of path.blocks) ids.push(block.id);
  }
  return ids;
}

function findNextBlock(completed: Set<string>) {
  for (const path of CURRICULUM) {
    for (const block of path.blocks) {
      if (!completed.has(block.id) && isLesson(block)) {
        return { path, block };
      }
    }
    for (const block of path.blocks) {
      if (!completed.has(block.id)) {
        return { path, block };
      }
    }
  }
  return null;
}

export default async function MobileHomePage() {
  const [completedList, streak] = await Promise.all([
    getCompletedBlocks(),
    getStreakData(),
  ]);

  const completed = new Set(completedList);
  const allIds = collectAllBlockIds();
  const totalBlocks = allIds.length;
  const doneBlocks = allIds.filter((id) => completed.has(id)).length;
  const pct = totalBlocks > 0 ? Math.round((doneBlocks / totalBlocks) * 100) : 0;

  const next = findNextBlock(completed);
  const currentPath = next?.path ?? CURRICULUM[0];
  const pathTotal = currentPath.blocks.length;
  const pathDone = currentPath.blocks.filter((b) => completed.has(b.id)).length;
  const pathPct = pathTotal > 0 ? Math.round((pathDone / pathTotal) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Greeting */}
      <div className="pt-1">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
          Your progress
        </p>
        <h1 className="mt-1 text-[26px] font-bold text-white tracking-tight" style={SG}>
          Welcome back
        </h1>
      </div>

      {/* Hero progress card */}
      <div className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(59,130,246,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
            Overall
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[56px] leading-none font-bold text-white tracking-tight" style={SG}>
              {pct}
            </span>
            <span className="text-2xl text-slate-500 font-semibold">%</span>
          </div>
          <p className="mt-1 text-[13px] text-slate-500">
            {doneBlocks} of {totalBlocks} blocks complete
          </p>

          {/* Progress bar */}
          <div className="mt-5 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Secondary stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] p-3.5">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-500">
                Current path
              </p>
              <p className="mt-1 text-[13px] font-semibold text-white leading-snug" style={SG}>
                {currentPath.title}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {pathDone}/{pathTotal} · {pathPct}%
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] p-3.5">
              <div className="flex items-center gap-1.5">
                <Flame size={11} strokeWidth={2.5} className="text-amber-400" />
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-500">
                  Streak
                </p>
              </div>
              <p className="mt-1 text-[13px] font-semibold text-white" style={SG}>
                {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {streak.todayActive ? 'Active today' : 'Not active today'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Up next card */}
      {next && (
        <div className="bg-gradient-to-b from-blue-500/[0.05] to-blue-500/[0.01] ring-1 ring-blue-500/20 rounded-2xl p-5 shadow-[0_0_40px_-15px_rgba(59,130,246,0.2)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue-300/90">
                Up next
              </p>
              <h3
                className="mt-1.5 text-[17px] font-bold text-white leading-tight"
                style={SG}
              >
                {next.block.title}
              </h3>
              {isLesson(next.block) && (
                <p className="mt-1 text-[13px] text-slate-400 leading-relaxed line-clamp-2">
                  {next.block.subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {isLesson(next.block) && (
              <Link
                href={`/m/learn/${next.block.id}`}
                className="h-12 px-5 rounded-xl bg-white text-zinc-900 text-[14px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-[0.98] transition-all"
              >
                Read on mobile
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            )}
            <a
              href={`/dashboard?block=${next.block.id}`}
              className="h-11 px-5 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              Open in desktop editor
            </a>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-3">
          Study on the go
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/m/cards"
            className="group bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.04] active:scale-[0.98] transition-all min-h-[120px] flex flex-col justify-between"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(147,197,253,0.08)',
                border: '1px solid rgba(147,197,253,0.15)',
              }}
            >
              <Layers size={17} strokeWidth={2} className="text-blue-300" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white" style={SG}>
                Flashcards
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Quick-review Big-O, patterns</p>
            </div>
          </Link>

          <Link
            href="/m/learn"
            className="group bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.04] active:scale-[0.98] transition-all min-h-[120px] flex flex-col justify-between"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(251,191,36,0.07)',
                border: '1px solid rgba(251,191,36,0.15)',
              }}
            >
              <BookOpen size={17} strokeWidth={2} className="text-amber-300" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white" style={SG}>
                Lessons
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Read the curriculum</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Desktop nudge */}
      <div className="bg-white/[0.015] ring-1 ring-white/[0.05] rounded-2xl p-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
          On your laptop
        </p>
        <p className="mt-2 text-[13px] text-slate-400 leading-relaxed">
          LeetLockin&apos;s full editor, mock interviews, and spaced review live on desktop. This
          mobile view is for lessons and flashcards on the go.
        </p>
        <a
          href="/dashboard"
          className="mt-4 h-11 px-4 rounded-lg border border-white/10 bg-white/[0.03] text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] inline-flex items-center justify-center gap-2 transition-colors"
        >
          Open desktop site
          <ArrowRight size={14} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}
