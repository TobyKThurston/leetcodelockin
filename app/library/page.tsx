'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Circle, Shuffle } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { LIBRARY, type CategoryDef, type Difficulty } from '@/lib/library';
import AppNav from '@/components/AppNav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const NAV_HEIGHT = 48;
const SCROLL_OFFSET = NAV_HEIGHT + 16;
const categoryAnchor = (id: string) => `cat-${id}`;

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

// ─── Palette — identical to DashboardPage ────────────────────────────────────
const C = {
  appBg:      '#0b1220',
  panelBg:    '#070c17',
  cardBg:     '#0f1729',
  cardBgDark: '#070c17',
  border:     'rgba(255,255,255,0.06)',
  borderMid:  'rgba(255,255,255,0.1)',
  text:       '#e5e7eb',
  textSub:    '#cbd5e1',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  blue:       '#3b82f6',
  blueDim:    'rgba(59,130,246,0.12)',
  blueBorder: 'rgba(96,165,250,0.4)',
  emerald:    '#10b981',
  emeraldDim: 'rgba(16,185,129,0.1)',
  emeraldBorder: 'rgba(16,185,129,0.32)',
};

// Matches ProblemPage.tsx DIFF_STYLE — Easy green / Medium amber / Hard red.
const DIFF_STYLE: Record<Difficulty, React.CSSProperties> = {
  Easy:   { color: 'rgba(52,211,153,0.9)',  border: '1px solid rgba(52,211,153,0.2)',   background: 'rgba(16,185,129,0.07)'  },
  Medium: { color: 'rgba(251,191,36,0.9)',  border: '1px solid rgba(251,191,36,0.2)',   background: 'rgba(245,158,11,0.07)'  },
  Hard:   { color: 'rgba(248,113,113,0.9)', border: '1px solid rgba(248,113,113,0.2)',  background: 'rgba(239,68,68,0.07)'   },
};

const SOLVED_STORAGE_KEY = 'zl-lib-solved';

// ─── SidebarCategoryCard ──────────────────────────────────────────────────────
// Mirrors SidebarPathCard — 2-digit order, title, description, optional bar.

function SidebarCategoryCard({
  category, solvedCount, isViewing, onClick,
}: {
  category: CategoryDef;
  solvedCount: number;
  isViewing: boolean;
  onClick: () => void;
}) {
  const total    = category.problems.length;
  const complete = total > 0 && solvedCount === total;
  const pct      = total === 0 ? 0 : Math.round((solvedCount / total) * 100);
  const n        = String(category.order).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        isViewing && 'bg-blue-500/[0.08] border-blue-400/50',
        !isViewing && complete && 'bg-slate-800/30 border-emerald-500/25 hover:border-emerald-500/40',
        !isViewing && !complete && 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600/70',
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            'font-mono text-[10px] font-bold tabular-nums tracking-wider',
            isViewing && 'text-blue-300',
            !isViewing && complete && 'text-emerald-400/70',
            !isViewing && !complete && 'text-slate-500',
          )}
        >
          {n}
        </span>
        {complete && <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />}
      </div>
      <p
        className={cn(
          'text-[12.5px] font-semibold leading-tight mb-0.5 tracking-[-0.005em]',
          isViewing && 'text-white',
          !isViewing && complete && 'text-slate-300',
          !isViewing && !complete && 'text-slate-200',
        )}
        style={SG}
      >
        {category.title}
      </p>
      <p
        className={cn(
          'text-[10.5px] leading-snug mb-2.5',
          isViewing && 'text-slate-300',
          !isViewing && complete && 'text-slate-500',
          !isViewing && !complete && 'text-slate-400',
        )}
      >
        {category.description}
      </p>
      <div>
        <div
          className={cn(
            'flex justify-between mb-1 text-[9.5px] font-medium',
            isViewing && 'text-slate-300',
            !isViewing && complete && 'text-slate-500',
            !isViewing && !complete && 'text-slate-400',
          )}
        >
          <span>{solvedCount} / {total} solved</span>
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
    </button>
  );
}

// ─── LibrarySidebar ───────────────────────────────────────────────────────────

function LibrarySidebar({
  viewingCategoryId, solvedByCategory, totalSolved, totalProblems, onSelectCategory,
}: {
  viewingCategoryId: string;
  solvedByCategory: Record<string, number>;
  totalSolved: number;
  totalProblems: number;
  onSelectCategory: (id: string) => void;
}) {
  const masteryPct = totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100);

  return (
    <aside
      className="fixed left-0 bottom-0 flex flex-col"
      style={{
        top: 48,
        width: 304,
        background: C.panelBg,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="px-4 pt-5 pb-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
            Categories
          </p>
          {LIBRARY.map(category => (
            <SidebarCategoryCard
              key={category.id}
              category={category}
              solvedCount={solvedByCategory[category.id] ?? 0}
              isViewing={category.id === viewingCategoryId}
              onClick={() => onSelectCategory(category.id)}
            />
          ))}
        </div>
      </div>

      {/* Stats subpanel */}
      <div
        className="px-4 py-4 space-y-4"
        style={{ borderTop: `1px solid ${C.border}`, background: C.cardBgDark }}
      >
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
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Solved</span>
            <span className="text-slate-400 font-medium tabular-nums">
              {totalSolved} / {totalProblems}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── ProblemRow ───────────────────────────────────────────────────────────────

function ProblemRow({
  number, title, difficulty, pattern, leetcodeUrl, solved, published, onToggleSolved, onOpen,
}: {
  number: number;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  leetcodeUrl: string;
  solved: boolean;
  published: boolean;
  onToggleSolved: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={published ? onOpen : undefined}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors',
        published && 'cursor-pointer',
        !published && 'cursor-not-allowed opacity-50',
        published && solved
          ? 'bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/40'
          : published
          ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/70'
          : 'bg-slate-800/20 border-slate-800/60',
      )}
    >
      {/* Solved checkbox */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggleSolved(); }}
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        aria-label={solved ? 'Mark unsolved' : 'Mark solved'}
      >
        {solved ? (
          <CheckCircle2 size={18} strokeWidth={2.25} className="text-emerald-400" />
        ) : (
          <Circle size={18} strokeWidth={1.75} className="text-slate-600 hover:text-slate-400 transition-colors" />
        )}
      </button>

      {/* LeetCode number */}
      <span
        className="shrink-0 text-[11px] text-slate-500 tabular-nums w-10"
        style={{ fontFamily: MONO_FONT }}
      >
        [{String(number).padStart(2, '0')}]
      </span>

      {/* Title */}
      <span
        className={cn(
          'flex-1 text-[13px] font-semibold leading-tight truncate',
          solved ? 'text-slate-300' : 'text-slate-100',
        )}
        style={SG}
      >
        {title}
      </span>

      {/* Difficulty */}
      <span
        className="shrink-0 px-2 py-0.5 rounded-md text-[10.5px] font-medium"
        style={DIFF_STYLE[difficulty]}
      >
        {difficulty}
      </span>

      {/* Pattern chip */}
      <span
        className="shrink-0 hidden md:inline-block px-2 py-0.5 rounded-md text-[10.5px] text-slate-400"
        style={{ border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.015)' }}
      >
        {pattern}
      </span>

      {/* Coming soon chip — only when not yet published */}
      {!published && (
        <span
          className="shrink-0 hidden md:inline-block px-2 py-0.5 rounded-md text-[10.5px] text-slate-500"
          style={{ border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.015)' }}
        >
          Coming soon
        </span>
      )}

      {/* External link */}
      <a
        href={leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 text-slate-600 hover:text-slate-300 transition-colors p-1"
        aria-label="Open on LeetCode"
      >
        <ExternalLink size={13} />
      </a>
    </div>
  );
}

// ─── CategorySection ──────────────────────────────────────────────────────────

function CategorySection({
  category, solvedIds, publishedSlugs, onToggleSolved, onOpenProblem,
}: {
  category: CategoryDef;
  solvedIds: Set<string>;
  publishedSlugs: Set<string>;
  onToggleSolved: (slug: string) => void;
  onOpenProblem: (slug: string) => void;
}) {
  const total = category.problems.length;
  const solved = category.problems.filter(p => solvedIds.has(p.slug)).length;
  const pct = total === 0 ? 0 : Math.round((solved / total) * 100);

  return (
    <section
      id={categoryAnchor(category.id)}
      data-category-id={category.id}
      className="scroll-mt-20 pt-10 pb-12 border-b last:border-b-0"
      style={{ borderColor: C.border }}
    >
      <h2 className="text-[24px] font-semibold text-white tracking-[-0.015em] mb-2" style={SG}>
        {category.title}
      </h2>
      <p className="text-[13px] text-slate-400 mb-5">{category.description}</p>

      {total === 0 ? (
        <div
          className="rounded-lg border border-dashed p-8 text-center"
          style={{ borderColor: C.border, background: 'rgba(255,255,255,0.015)' }}
        >
          <p className="text-[13px] text-slate-400" style={SG}>
            Coming soon.
          </p>
          <p className="text-[11.5px] text-slate-600 mt-1">
            This category is on the roadmap but not yet populated.
          </p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="mb-6">
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500">
                <span className="text-slate-300 font-semibold tabular-nums">{solved}</span>
                {' '}of{' '}
                <span className="text-slate-300 font-semibold tabular-nums">{total}</span>
                {' '}solved
              </span>
              <span className="text-slate-400 tabular-nums">{pct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? C.emerald : C.blue,
                }}
              />
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3">
            Problems
          </p>

          <div className="space-y-1.5">
            {category.problems.map(problem => (
              <ProblemRow
                key={problem.slug}
                number={problem.number}
                title={problem.title}
                difficulty={problem.difficulty}
                pattern={problem.pattern}
                leetcodeUrl={problem.leetcodeUrl}
                solved={solvedIds.has(problem.slug)}
                published={publishedSlugs.has(problem.slug)}
                onToggleSolved={() => onToggleSolved(problem.slug)}
                onOpen={() => onOpenProblem(problem.slug)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ─── LibraryRightRail — matches DashboardPage RightRail exactly ──────────────

// Section header — matches the sidebar "Categories" label and dashboard rail.
function RailHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
      {children}
    </p>
  );
}

// Row with label on the left and value on the right — dashboard MetricRow.
function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11.5px]">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-medium tabular-nums">{value}</span>
    </div>
  );
}

// Big number stacked over small label — dashboard Metric.
function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[18px] leading-none font-semibold text-slate-100 tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5">{label}</div>
    </div>
  );
}

// Shared box style: matches an inactive SidebarCategoryCard (and dashboard RAIL_BOX).
const RAIL_BOX =
  'rounded-lg px-3 py-2.5 bg-slate-800/40 border border-slate-700/60';

function LibraryRightRail({
  category, solvedInCategory, totalSolved, totalProblems, onRandomProblem,
}: {
  category: CategoryDef;
  solvedInCategory: number;
  totalSolved: number;
  totalProblems: number;
  onRandomProblem: () => void;
}) {
  const categoryTotal = category.problems.length;
  const categoryPct   = categoryTotal === 0 ? 0 : Math.round((solvedInCategory / categoryTotal) * 100);
  const categoryDone  = categoryTotal > 0 && solvedInCategory === categoryTotal;

  const overallPct  = totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100);
  const remaining   = totalProblems - totalSolved;

  // Mocked values — kept deterministic so they don't jitter, matching dashboard.
  const streakDays   = 0;
  const solvedToday  = 0;

  const n = String(category.order).padStart(2, '0');

  return (
    <aside
      className="hidden lg:flex fixed right-0 flex-col"
      style={{
        top: 48,
        bottom: 0,
        width: 304,
        background: C.panelBg,
        borderLeft: `1px solid ${C.border}`,
      }}
    >
      <ScrollArea className="flex-1">
        <div className="px-4 pt-5 pb-5 space-y-5">

          {/* 1 — Category Progress (dominant, mirrors sidebar "viewing" card) */}
          <section>
            <RailHeader>Category Progress</RailHeader>
            <div
              className={cn(
                'rounded-lg px-3 py-2.5 border',
                categoryDone
                  ? 'bg-slate-800/30 border-emerald-500/25'
                  : 'bg-blue-500/[0.08] border-blue-400/50',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold tabular-nums tracking-wider',
                    categoryDone ? 'text-emerald-400/70' : 'text-blue-300',
                  )}
                >
                  {n}
                </span>
                {categoryDone && (
                  <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />
                )}
              </div>
              <p
                className="text-[12.5px] font-semibold leading-tight mb-2.5 tracking-[-0.005em] text-white"
                style={SG}
              >
                {category.title}
              </p>
              <div className="flex justify-between mb-1 text-[9.5px] font-medium text-slate-300">
                <span>{solvedInCategory} / {categoryTotal} solved</span>
                <span className="tabular-nums">{categoryPct}%</span>
              </div>
              <div className="h-[2px] rounded-full bg-slate-900/60 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    categoryDone ? 'bg-emerald-500' : 'bg-blue-500',
                  )}
                  style={{ width: `${categoryPct}%` }}
                />
              </div>
            </div>
          </section>

          {/* 2 — Overall Mastery (3-col metric grid like Performance) */}
          <section>
            <RailHeader>Mastery</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={`${overallPct}%`} label="done" />
              <Metric value={String(totalSolved)} label="solved" />
              <Metric value={String(remaining)} label="left" />
            </div>
          </section>

          {/* 3 — Today (Focus Signal style MetricRows) */}
          <section>
            <RailHeader>Today</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              <MetricRow label="Streak"        value={`${streakDays} days`} />
              <MetricRow label="Solved Today"  value={String(solvedToday)} />
              <MetricRow label="In Category"   value={`${solvedInCategory} / ${categoryTotal}`} />
            </div>
          </section>

          {/* 4 — Random Problem */}
          <section>
            <RailHeader>Feeling Lucky</RailHeader>
            <button
              type="button"
              onClick={onRandomProblem}
              className={cn(
                RAIL_BOX,
                'w-full flex items-center gap-2.5 transition-colors',
                'hover:bg-slate-700/40 hover:border-slate-600/60 cursor-pointer',
              )}
            >
              <Shuffle size={14} className="text-slate-400" />
              <span className="text-[12px] font-medium text-slate-300" style={SG}>
                Random problem
              </span>
            </button>
          </section>

        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── LibraryPage ──────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter();

  const [viewingCategoryId, setViewingCategoryId] = useState<string>(LIBRARY[0].id);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [publishedSlugs, setPublishedSlugs] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const suppressObserverUntil = useRef(0);

  // Hydrate solved set from localStorage on mount.
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(SOLVED_STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSolvedIds(new Set(parsed.filter((x): x is string => typeof x === 'string')));
      }
    } catch {
      // Ignore malformed storage payloads.
    }
    setHydrated(true);
  }, []);

  // Fetch the published-problem allow-list and the user's accepted submissions
  // from Supabase. Both queries respect RLS — published rows are public, and
  // submissions are user-scoped.
  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowser();

    (async () => {
      const { data: publishedRows } = await supabase
        .from('problems')
        .select('slug')
        .eq('is_published', true);
      if (!cancelled && publishedRows) {
        setPublishedSlugs(new Set(publishedRows.map(r => (r as { slug: string }).slug)));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: solvedRows } = await supabase
        .from('problem_submissions')
        .select('problem_slug')
        .eq('user_id', user.id)
        .eq('status', 'accepted');
      if (!cancelled && solvedRows) {
        setSolvedIds(prev => {
          const merged = new Set(prev);
          for (const row of solvedRows) {
            merged.add((row as { problem_slug: string }).problem_slug);
          }
          return merged;
        });
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Persist solved set to localStorage.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SOLVED_STORAGE_KEY, JSON.stringify(Array.from(solvedIds)));
    } catch {
      // Storage may be full or disabled; ignore.
    }
  }, [solvedIds, hydrated]);

  // Track which category section is currently in view, so the sidebar and
  // right rail stay in sync with scroll position.
  useEffect(() => {
    const sections = LIBRARY
      .map(c => document.getElementById(categoryAnchor(c.id)))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        // Ignore observer callbacks that fire while a programmatic scroll is
        // still settling, so the clicked category stays highlighted.
        if (Date.now() < suppressObserverUntil.current) return;

        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        const topMost = visible[0];
        if (topMost) {
          const id = (topMost.target as HTMLElement).dataset.categoryId;
          if (id) setViewingCategoryId(id);
        }
      },
      {
        // Activation zone: a thin band just below the nav bar.
        rootMargin: `-${NAV_HEIGHT + 24}px 0px -70% 0px`,
        threshold: 0,
      },
    );

    sections.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const viewingCategory = useMemo(
    () => LIBRARY.find(c => c.id === viewingCategoryId) ?? LIBRARY[0],
    [viewingCategoryId],
  );

  const solvedByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const category of LIBRARY) {
      map[category.id] = category.problems.filter(p => solvedIds.has(p.slug)).length;
    }
    return map;
  }, [solvedIds]);

  const totalProblems = useMemo(
    () => LIBRARY.reduce((sum, c) => sum + c.problems.length, 0),
    [],
  );
  const totalSolved = useMemo(
    () => LIBRARY.reduce((sum, c) => sum + (solvedByCategory[c.id] ?? 0), 0),
    [solvedByCategory],
  );

  const toggleSolved = useCallback((slug: string) => {
    setSolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  }, []);

  const openProblem = useCallback((slug: string) => {
    router.push(`/solve/${encodeURIComponent(slug)}`);
  }, [router]);

  const handleRandomProblem = useCallback(() => {
    // Collect all unsolved, published problems across all categories.
    const pool: string[] = [];
    for (const cat of LIBRARY) {
      for (const p of cat.problems) {
        if (publishedSlugs.has(p.slug) && !solvedIds.has(p.slug)) pool.push(p.slug);
      }
    }
    if (pool.length === 0) return;
    const slug = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/solve/${encodeURIComponent(slug)}`);
  }, [publishedSlugs, solvedIds, router]);

  const handleSelectCategory = useCallback((id: string) => {
    setViewingCategoryId(id);
    const el = document.getElementById(categoryAnchor(id));
    if (!el) return;
    // Pause the IntersectionObserver briefly so the clicked category wins.
    suppressObserverUntil.current = Date.now() + 700;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen text-slate-200" style={{ background: C.appBg }}>
      <AppNav activeTab="Library" />
      <LibrarySidebar
        viewingCategoryId={viewingCategoryId}
        solvedByCategory={solvedByCategory}
        totalSolved={totalSolved}
        totalProblems={totalProblems}
        onSelectCategory={handleSelectCategory}
      />
      <LibraryRightRail
        category={viewingCategory}
        solvedInCategory={solvedByCategory[viewingCategory.id] ?? 0}
        totalSolved={totalSolved}
        totalProblems={totalProblems}
        onRandomProblem={handleRandomProblem}
      />
      <main
        className="min-h-screen"
        style={{
          paddingTop: 48,
          paddingLeft: 304,
          paddingRight: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div className="lg:pr-[304px]">
          <div className="max-w-3xl mx-auto px-8">
            {LIBRARY.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                solvedIds={solvedIds}
                publishedSlugs={publishedSlugs}
                onToggleSolved={toggleSolved}
                onOpenProblem={openProblem}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
