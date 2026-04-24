'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Circle, Shuffle } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { LIBRARY, type CategoryDef, type Difficulty } from '@/lib/library';
import AppShell from '@/components/shell/AppShell';
import ShellSidebar from '@/components/shell/ShellSidebar';
import ShellRail from '@/components/shell/ShellRail';
import PageHeader from '@/components/shell/PageHeader';
import { RailHeader, MetricRow, Metric, RAIL_BOX } from '@/components/shell/RailPrimitives';
import { C, SG, MONO_FONT, SHELL } from '@/lib/ui-tokens';
import { cn } from '@/lib/utils';

const NAV_HEIGHT = SHELL.navHeight;
const SCROLL_OFFSET = NAV_HEIGHT + 16;
const categoryAnchor = (id: string) => `cat-${id}`;

// Matches ProblemPage.tsx DIFF_STYLE — Easy green / Medium amber / Hard red.
const DIFF_STYLE: Record<Difficulty, React.CSSProperties> = {
  Easy:   { color: '#047857', border: '1px solid #a7f3d0', background: '#ecfdf5', fontWeight: 600 },
  Medium: { color: '#b45309', border: '1px solid #fde68a', background: '#fffbeb', fontWeight: 600 },
  Hard:   { color: '#b91c1c', border: '1px solid #fecaca', background: '#fef2f2', fontWeight: 600 },
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
        'group w-full text-left rounded-xl px-4 py-3.5 border transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        isViewing && 'bg-white dark:bg-[var(--ll-bg-elevated)] border-blue-400/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(59,130,246,0.25)]',
        !isViewing && complete && 'bg-[var(--ll-bg-card)] border-emerald-500/30 hover:border-emerald-500/50',
        !isViewing && !complete && 'bg-[var(--ll-bg-card)] border-[var(--ll-border)] hover:bg-white dark:hover:bg-[var(--ll-bg-hover)] hover:border-[var(--ll-border-strong)]',
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'font-mono text-[12px] font-bold tabular-nums tracking-wider',
            isViewing && 'text-blue-600 dark:text-blue-400',
            !isViewing && complete && 'text-emerald-600 dark:text-emerald-400',
            !isViewing && !complete && 'text-[var(--ll-ink-subtle)]',
          )}
        >
          {n}
        </span>
        {complete && <CheckCircle2 size={16} strokeWidth={2.25} className="text-emerald-600 dark:text-emerald-400" />}
      </div>
      <p
        className="text-[15px] font-semibold leading-tight mb-1.5 tracking-[-0.005em] text-[var(--ll-ink)]"
        style={SG}
      >
        {category.title}
      </p>
      <p className="text-[13px] leading-snug mb-3 line-clamp-2 text-[var(--ll-ink-muted)]">
        {category.description}
      </p>
      <div>
        <div className="flex justify-between mb-1.5 text-[12px] font-medium text-[var(--ll-ink-muted)]">
          <span>{solvedCount} / {total} solved</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="h-[4px] rounded-full bg-[var(--ll-bg-subtle)] overflow-hidden">
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
    <ShellSidebar
      footer={
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="font-medium text-[var(--ll-ink-muted)]">Mastery</span>
              <span className="font-semibold tabular-nums text-[var(--ll-ink)]">{masteryPct}%</span>
            </div>
            <div className="h-[5px] rounded-full bg-[var(--ll-bg-subtle)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${masteryPct}%`, background: C.blue }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[var(--ll-ink-muted)]">Solved</span>
            <span className="font-medium tabular-nums text-[var(--ll-ink)]">
              {totalSolved} / {totalProblems}
            </span>
          </div>
        </div>
      }
    >
      <p className="text-[12px] font-bold text-[var(--ll-ink-subtle)] tracking-[0.16em] uppercase mb-3 px-1">
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
    </ShellSidebar>
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
        'group flex items-center gap-3.5 px-4 py-3.5 rounded-lg border transition-colors',
        published && 'cursor-pointer',
        !published && 'cursor-not-allowed opacity-50',
        published && solved
          ? 'bg-emerald-500/[0.06] border-emerald-500/30 hover:border-emerald-500/50'
          : published
          ? 'bg-[var(--ll-bg-card)] border-[var(--ll-border)] hover:bg-[var(--ll-bg-hover)] hover:border-[var(--ll-border-strong)]'
          : 'bg-[var(--ll-bg-subtle)] border-[var(--ll-border)]',
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
          <CheckCircle2 size={22} strokeWidth={2.25} className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Circle size={22} strokeWidth={1.75} className="text-[var(--ll-ink-faint)] hover:text-[var(--ll-ink-subtle)] transition-colors" />
        )}
      </button>

      {/* LeetCode number */}
      <span
        className="shrink-0 text-[13px] tabular-nums w-12 text-[var(--ll-ink-subtle)]"
        style={{ fontFamily: MONO_FONT }}
      >
        [{String(number).padStart(2, '0')}]
      </span>

      {/* Title */}
      <span
        className={cn(
          'flex-1 text-[15.5px] font-semibold leading-tight truncate',
          solved ? 'text-[var(--ll-ink-muted)]' : 'text-[var(--ll-ink)]',
        )}
        style={SG}
      >
        {title}
      </span>

      {/* Difficulty */}
      <span
        className="shrink-0 px-2.5 py-1 rounded-md text-[12.5px]"
        style={DIFF_STYLE[difficulty]}
      >
        {difficulty}
      </span>

      {/* Pattern chip */}
      <span
        className="shrink-0 hidden md:inline-block px-2.5 py-1 rounded-md text-[12.5px] font-medium text-[var(--ll-ink-muted)]"
        style={{ border: `1px solid var(--ll-border)`, background: 'var(--ll-bg-subtle)' }}
      >
        {pattern}
      </span>

      {/* Coming soon chip — only when not yet published */}
      {!published && (
        <span
          className="shrink-0 hidden md:inline-block px-2.5 py-1 rounded-md text-[12.5px] font-medium text-[var(--ll-ink-subtle)]"
          style={{ border: `1px solid var(--ll-border)`, background: 'var(--ll-bg-subtle)' }}
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
        className="shrink-0 p-1.5 rounded-md text-[var(--ll-ink-muted)] hover:text-[var(--ll-ink)] hover:bg-[var(--ll-bg-hover)] transition-colors"
        aria-label="Open on LeetCode"
      >
        <ExternalLink size={16} />
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
      <h2 className="text-[22px] font-bold tracking-[-0.015em] mb-2 text-[var(--ll-ink)]" style={SG}>
        {category.title}
      </h2>
      <p className="text-[14px] leading-snug mb-6 text-[var(--ll-ink-muted)]">{category.description}</p>

      {total === 0 ? (
        <div
          className="rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: 'var(--ll-border)', background: 'var(--ll-bg-subtle)' }}
        >
          <p className="text-[14px] text-[var(--ll-ink)]" style={SG}>
            Coming soon.
          </p>
          <p className="text-[12.5px] text-[var(--ll-ink-muted)] mt-1">
            This category is on the roadmap but not yet populated.
          </p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="mb-7">
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="text-[var(--ll-ink-muted)]">
                <span className="font-semibold tabular-nums text-[var(--ll-ink)]">{solved}</span>
                {' '}of{' '}
                <span className="font-semibold tabular-nums text-[var(--ll-ink)]">{total}</span>
                {' '}solved
              </span>
              <span className="tabular-nums text-[var(--ll-ink-muted)]">{pct}%</span>
            </div>
            <div className="h-[5px] rounded-full bg-[var(--ll-bg-subtle)]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? C.emerald : C.blue,
                }}
              />
            </div>
          </div>

          <p className="text-[11.5px] font-bold text-[var(--ll-ink-subtle)] tracking-[0.16em] uppercase mb-3.5">
            Problems
          </p>

          <div className="space-y-2">
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

// ─── LibraryRightRail — uses shared rail primitives ──────────────────────────

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
    <ShellRail>
          {/* 1 — Category Progress (dominant, mirrors sidebar "viewing" card) */}
          <section>
            <RailHeader>Category Progress</RailHeader>
            <div
              className={cn(
                'rounded-xl px-4 py-3.5 border',
                categoryDone
                  ? 'bg-[var(--ll-bg-card)] border-emerald-500/30'
                  : 'bg-blue-500/[0.08] border-blue-400/50',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    'font-mono text-[12px] font-bold tabular-nums tracking-wider',
                    categoryDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400',
                  )}
                >
                  {n}
                </span>
                {categoryDone && (
                  <CheckCircle2 size={16} strokeWidth={2.25} className="text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <p
                className="text-[14.5px] font-semibold leading-tight mb-3 tracking-[-0.005em] text-[var(--ll-ink)]"
                style={SG}
              >
                {category.title}
              </p>
              <div className="flex justify-between mb-1.5 text-[12px] font-medium text-[var(--ll-ink-muted)]">
                <span>{solvedInCategory} / {categoryTotal} solved</span>
                <span className="tabular-nums">{categoryPct}%</span>
              </div>
              <div className="h-[4px] rounded-full bg-[var(--ll-bg-subtle)] overflow-hidden">
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
                'w-full flex items-center justify-center gap-2.5 rounded-xl border transition-colors cursor-pointer',
                'px-4 py-3 text-[13.5px] font-semibold',
                'bg-[var(--ll-bg-card)] border-[var(--ll-border)] text-[var(--ll-ink)]',
                'hover:bg-[var(--ll-bg-hover)] hover:border-[var(--ll-border-strong)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
              )}
              style={SG}
            >
              <Shuffle size={16} className="text-[var(--ll-ink-muted)]" />
              Random problem
            </button>
          </section>
    </ShellRail>
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

  const overallPct = totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100);

  return (
    <AppShell
      activeTab="Library"
      sidebar={
        <LibrarySidebar
          viewingCategoryId={viewingCategoryId}
          solvedByCategory={solvedByCategory}
          totalSolved={totalSolved}
          totalProblems={totalProblems}
          onSelectCategory={handleSelectCategory}
        />
      }
      rail={
        <LibraryRightRail
          category={viewingCategory}
          solvedInCategory={solvedByCategory[viewingCategory.id] ?? 0}
          totalSolved={totalSolved}
          totalProblems={totalProblems}
          onRandomProblem={handleRandomProblem}
        />
      }
    >
      <PageHeader
        eyebrow="Library"
        title="Problem Library"
        subtitle={`${LIBRARY.length} curated categories · ${totalProblems} problems`}
        right={
          <div className="text-right">
            <div className="h-[4px] w-28 rounded-full bg-slate-100 mb-1.5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${overallPct}%`, background: C.blue }}
              />
            </div>
            <p className="text-[11.5px] font-medium tabular-nums" style={{ color: C.textMuted }}>
              {totalSolved} / {totalProblems} solved
            </p>
          </div>
        }
      />
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
    </AppShell>
  );
}
