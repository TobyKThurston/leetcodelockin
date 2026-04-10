'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { X, Eye, Check, RotateCcw, Brain, Code2, Timer, Zap, CheckCircle2 } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ReviewCard, KeyLinesContent, ApproachContent, ComplexityContent } from '@/lib/review';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO = 'var(--font-geist-mono), ui-monospace, monospace';

// ─── Palette — identical to Library / Dashboard ──────────────────────────────
const C = {
  appBg:      '#0b1220',
  panelBg:    '#070c17',
  cardBg:     '#0f1729',
  cardBgDark: '#070c17',
  border:     'rgba(255,255,255,0.06)',
  text:       '#e5e7eb',
  textSub:    '#cbd5e1',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  blue:       '#3b82f6',
  emerald:    '#10b981',
  amber:      '#f59e0b',
  red:        '#ef4444',
};

const CARD_TYPE_META = {
  key_lines:  { icon: Code2,  label: 'Key Lines',  color: C.blue },
  approach:   { icon: Brain,  label: 'Approach',    color: C.emerald },
  complexity: { icon: Timer,  label: 'Complexity',  color: C.amber },
} as const;

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

// ─── Shared rail primitives (same as Library / Dashboard) ────────────────────

function RailHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
      {children}
    </p>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11.5px]">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-medium tabular-nums">{value}</span>
    </div>
  );
}

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

const RAIL_BOX =
  'rounded-lg px-3 py-2.5 bg-slate-800/40 border border-slate-700/60';

// ─── Code display with optional blanks ───────────────────────────────────────

function CodeBlock({
  code,
  blankIndices,
  revealed,
  originalLines,
}: {
  code: string;
  blankIndices?: number[];
  revealed: boolean;
  originalLines?: string[];
}) {
  const lines = code.split('\n');
  const blanks = new Set(blankIndices ?? []);

  return (
    <pre
      className="rounded-lg p-4 text-[12px] leading-[1.6] overflow-x-auto"
      style={{ background: 'rgba(0,0,0,0.4)', fontFamily: MONO }}
    >
      {lines.map((line, i) => {
        const isBlanked = blanks.has(i);
        if (isBlanked && !revealed) {
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[11px] font-medium">
                {'_'.repeat(Math.max(line.trim().length, 12))} ← recall this line
              </span>
            </div>
          );
        }
        if (isBlanked && revealed) {
          const blankIdx = blankIndices!.indexOf(i);
          const original = originalLines?.[blankIdx] ?? line;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
              <span className="bg-emerald-500/15 text-emerald-300 px-1 rounded">
                {original}
              </span>
            </div>
          );
        }
        return (
          <div key={i} className="flex">
            <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
            <span className="text-slate-300">{line || ' '}</span>
          </div>
        );
      })}
    </pre>
  );
}

// ─── Card front/back renderers ───────────────────────────────────────────────

function KeyLinesFront({ card }: { card: ReviewCard }) {
  const content = card.content as KeyLinesContent;
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-slate-400">
        Fill in the blanked-out lines from your solution:
      </p>
      <CodeBlock
        code={card.codeSnapshot}
        blankIndices={content.blank_indices}
        revealed={false}
      />
    </div>
  );
}

function KeyLinesBack({ card }: { card: ReviewCard }) {
  const content = card.content as KeyLinesContent;
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-emerald-400 font-medium">Here are the key lines:</p>
      <CodeBlock
        code={card.codeSnapshot}
        blankIndices={content.blank_indices}
        revealed={true}
        originalLines={content.original_lines}
      />
    </div>
  );
}

function ApproachFront({ card }: { card: ReviewCard }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-slate-400">
        What pattern and approach did you use to solve this problem?
      </p>
      <p className="text-[13px] text-slate-500 italic">
        Think about the algorithmic pattern, key data structures, and your step-by-step approach before revealing.
      </p>
    </div>
  );
}

function ApproachBack({ card }: { card: ReviewCard }) {
  const content = card.content as ApproachContent;
  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Pattern</span>
        <p className="text-[14px] text-white font-semibold mt-1" style={SG}>{content.pattern}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Approach</span>
        <p className="text-[13px] text-slate-300 leading-relaxed mt-1">{content.explanation}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Your Code</span>
        <CodeBlock code={card.codeSnapshot} revealed={true} />
      </div>
    </div>
  );
}

function ComplexityFront({ card }: { card: ReviewCard }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-slate-400">
        What is the time and space complexity of your solution?
      </p>
      <CodeBlock code={card.codeSnapshot} revealed={true} />
    </div>
  );
}

function ComplexityBack({ card }: { card: ReviewCard }) {
  const content = card.content as ComplexityContent;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Time</span>
          <p className="text-[18px] text-white font-bold mt-1" style={{ fontFamily: MONO }}>{content.time}</p>
        </div>
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Space</span>
          <p className="text-[18px] text-white font-bold mt-1" style={{ fontFamily: MONO }}>{content.space}</p>
        </div>
      </div>
      <p className="text-[13px] text-slate-400 leading-relaxed">{content.reasoning}</p>
    </div>
  );
}

// ─── Sidebar card — one row per review card in the queue ─────────────────────

function SidebarCardRow({
  card, isActive, isReviewed, onClick,
}: {
  card: ReviewCard;
  isActive: boolean;
  isReviewed: boolean;
  onClick: () => void;
}) {
  const meta = CARD_TYPE_META[card.cardType];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        isActive && 'bg-blue-500/[0.08] border-blue-400/50',
        !isActive && isReviewed && 'bg-slate-800/30 border-emerald-500/25 hover:border-emerald-500/40',
        !isActive && !isReviewed && 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600/70',
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ background: `${meta.color}15`, color: meta.color }}
        >
          <Icon size={10} />
          {meta.label}
        </div>
        {isReviewed && <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />}
      </div>
      <p
        className={cn(
          'text-[12.5px] font-semibold leading-tight mb-0.5 tracking-[-0.005em] truncate',
          isActive && 'text-white',
          !isActive && isReviewed && 'text-slate-300',
          !isActive && !isReviewed && 'text-slate-200',
        )}
        style={SG}
      >
        {card.problemTitle}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-medium"
          style={{ color: DIFFICULTY_COLOR[card.difficulty] ?? C.textMuted }}
        >
          {card.difficulty}
        </span>
        {card.pattern && (
          <span className="text-[10px] text-slate-500">{card.pattern}</span>
        )}
      </div>
    </button>
  );
}

// ─── Left Sidebar ────────────────────────────────────────────────────────────

function ReviewSidebar({
  cards, currentIdx, reviewedSet, onSelectCard,
}: {
  cards: ReviewCard[];
  currentIdx: number;
  reviewedSet: Set<number>;
  onSelectCard: (idx: number) => void;
}) {
  const totalCards = cards.length;
  const reviewedCount = reviewedSet.size;
  const pct = totalCards === 0 ? 0 : Math.round((reviewedCount / totalCards) * 100);

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
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="px-4 pt-5 pb-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
            Due for Review
          </p>
          {cards.map((card, idx) => (
            <SidebarCardRow
              key={card.id}
              card={card}
              isActive={idx === currentIdx}
              isReviewed={reviewedSet.has(idx)}
              onClick={() => onSelectCard(idx)}
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
              <span className="text-slate-500 font-medium">Session</span>
              <span className="text-slate-300 font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: C.blue }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Reviewed</span>
            <span className="text-slate-400 font-medium tabular-nums">
              {reviewedCount} / {totalCards}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Right Rail ──────────────────────────────────────────────────────────────

function ReviewRightRail({
  card, cards, reviewedCount, totalDue, forgotCount, gotItCount,
}: {
  card: ReviewCard | undefined;
  cards: ReviewCard[];
  reviewedCount: number;
  totalDue: number;
  forgotCount: number;
  gotItCount: number;
}) {
  const remaining = cards.length - reviewedCount;
  const accuracy = reviewedCount === 0 ? 0 : Math.round((gotItCount / reviewedCount) * 100);

  // Count card types in queue
  const typeCounts = useMemo(() => {
    const counts = { key_lines: 0, approach: 0, complexity: 0 };
    for (const c of cards) counts[c.cardType]++;
    return counts;
  }, [cards]);

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

          {/* 1 — Current Card (mirrors category/path progress box) */}
          {card && (
            <section>
              <RailHeader>Current Card</RailHeader>
              <div
                className={cn(
                  'rounded-lg px-3 py-2.5 border',
                  'bg-blue-500/[0.08] border-blue-400/50',
                )}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {(() => {
                    const meta = CARD_TYPE_META[card.cardType];
                    const Icon = meta.icon;
                    return (
                      <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: `${meta.color}15`, color: meta.color }}
                      >
                        <Icon size={10} />
                        {meta.label}
                      </div>
                    );
                  })()}
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: DIFFICULTY_COLOR[card.difficulty] ?? C.textMuted }}
                  >
                    {card.difficulty}
                  </span>
                </div>
                <p
                  className="text-[12.5px] font-semibold leading-tight text-white tracking-[-0.005em]"
                  style={SG}
                >
                  {card.problemTitle}
                </p>
                {card.pattern && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{card.pattern}</p>
                )}
                {card.reviewCount > 0 && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Reviewed {card.reviewCount}× before
                  </p>
                )}
              </div>
            </section>
          )}

          {/* 2 — Session Progress (3-col metric grid) */}
          <section>
            <RailHeader>Session Progress</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={String(reviewedCount)} label="reviewed" />
              <Metric value={String(remaining)} label="left" />
              <Metric value={`${accuracy}%`} label="accuracy" />
            </div>
          </section>

          {/* 3 — Results (MetricRows) */}
          <section>
            <RailHeader>Results</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              <MetricRow label="Got it" value={String(gotItCount)} />
              <MetricRow label="Forgot" value={String(forgotCount)} />
              <MetricRow label="Total due" value={String(totalDue)} />
            </div>
          </section>

          {/* 4 — Card Types (breakdown of queue) */}
          <section>
            <RailHeader>Queue Breakdown</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              {(['key_lines', 'approach', 'complexity'] as const).map(type => {
                const meta = CARD_TYPE_META[type];
                return (
                  <div key={type} className="flex items-center justify-between text-[11.5px]">
                    <div className="flex items-center gap-1.5">
                      <meta.icon size={11} style={{ color: meta.color }} />
                      <span className="text-slate-500">{meta.label}</span>
                    </div>
                    <span className="text-slate-300 font-medium tabular-nums">
                      {typeCounts[type]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── Upgrade prompt (reuses existing style) ──────────────────────────────────

function ReviewUpgradePrompt() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '';
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY ?? '';

  return (
    <div className="max-w-lg mx-auto mt-24 text-center space-y-6">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-8 space-y-4">
        <Brain size={32} className="text-amber-400 mx-auto" />
        <h2 className="text-[18px] font-bold text-white" style={SG}>
          Spaced Repetition Review
        </h2>
        <p className="text-[14px] text-slate-300 leading-relaxed">
          Reinforce what you&apos;ve learned with AI-generated flashcards from your accepted solutions.
          Review key code lines, approaches, and complexity — all on a smart schedule.
        </p>
        <p className="text-[13px] text-amber-300 font-medium">
          <Zap size={14} className="inline mr-1" />
          This is a Pro feature
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <Button
            size="sm"
            className="bg-white text-zinc-900 hover:bg-zinc-100 text-[12px] font-semibold"
            onClick={() => handleUpgrade(monthlyPriceId)}
            disabled={loading || !monthlyPriceId}
          >
            {loading ? 'Loading...' : '$9/month'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-[12px] font-semibold"
            onClick={() => handleUpgrade(yearlyPriceId)}
            disabled={loading || !yearlyPriceId}
          >
            $90/year (save $18)
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty / sign-in / upgrade states (centered, no sidebars) ───────────────

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: C.appBg }}>
      <AppNav activeTab="Review" />
      <main className="pt-12">
        {children}
      </main>
    </div>
  );
}

// ─── Main review page ────────────────────────────────────────────────────────

export default function ReviewPageClient({
  isPro,
  isSignedIn,
}: {
  isPro: boolean;
  isSignedIn: boolean;
}) {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [totalDue, setTotalDue] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [reviewedSet, setReviewedSet] = useState<Set<number>>(new Set());
  const [gotItCount, setGotItCount] = useState(0);
  const [forgotCount, setForgotCount] = useState(0);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/review/due');
      const data = await res.json();
      setCards(data.cards ?? []);
      setTotalDue(data.totalDue ?? 0);
    } catch {
      setCards([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isPro && isSignedIn) fetchCards();
    else setLoading(false);
  }, [isPro, isSignedIn, fetchCards]);

  async function handleResult(result: 'got_it' | 'forgot') {
    const card = cards[currentIdx];
    if (!card) return;

    await fetch('/api/review/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id, result }),
    });

    setReviewed(r => r + 1);
    setReviewedSet(prev => new Set(prev).add(currentIdx));
    if (result === 'got_it') setGotItCount(c => c + 1);
    else setForgotCount(c => c + 1);
    setRevealed(false);

    if (currentIdx < cards.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      // All done — remove reviewed cards
      setCards([]);
    }
  }

  async function handleDismiss() {
    const card = cards[currentIdx];
    if (!card) return;

    await fetch('/api/review/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id }),
    });

    const next = cards.filter((_, i) => i !== currentIdx);
    setCards(next);
    if (currentIdx >= next.length) setCurrentIdx(Math.max(0, next.length - 1));
    setRevealed(false);
  }

  // ─── Non-review states (no 3-col layout) ──────────────────────────────────

  if (!isSignedIn) {
    return (
      <CenteredMessage>
        <div className="max-w-lg mx-auto mt-24 text-center space-y-4">
          <Brain size={32} className="text-slate-500 mx-auto" />
          <h2 className="text-[18px] font-bold text-white" style={SG}>Sign in to review</h2>
          <p className="text-[13px] text-slate-400">
            Spaced repetition review requires an account to track your progress.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-slate-700 text-slate-200"
            nativeButton={false}
            render={<Link href="/sign-in?next=/review" />}
          >
            Sign in
          </Button>
        </div>
      </CenteredMessage>
    );
  }

  if (!isPro) {
    return (
      <CenteredMessage>
        <ReviewUpgradePrompt />
      </CenteredMessage>
    );
  }

  if (loading) {
    return (
      <CenteredMessage>
        <div className="flex items-center justify-center mt-32">
          <div className="animate-pulse text-[13px] text-slate-500">Loading review cards...</div>
        </div>
      </CenteredMessage>
    );
  }

  if (cards.length === 0) {
    return (
      <CenteredMessage>
        <div className="max-w-lg mx-auto mt-24 text-center space-y-4">
          <Check size={32} className="text-emerald-400 mx-auto" />
          <h2 className="text-[18px] font-bold text-white" style={SG}>
            {reviewed > 0 ? 'All caught up!' : 'No cards due'}
          </h2>
          <p className="text-[13px] text-slate-400">
            {reviewed > 0
              ? `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'} this session. Nice work!`
              : 'Solve some problems and review cards will appear here based on your spaced repetition schedule.'
            }
          </p>
        </div>
      </CenteredMessage>
    );
  }

  // ─── 3-column review layout ───────────────────────────────────────────────

  const card = cards[currentIdx];
  const meta = card ? CARD_TYPE_META[card.cardType] : null;
  const Icon = meta?.icon ?? Brain;

  return (
    <div className="min-h-screen text-slate-200" style={{ background: C.appBg }}>
      <AppNav activeTab="Review" />
      <ReviewSidebar
        cards={cards}
        currentIdx={currentIdx}
        reviewedSet={reviewedSet}
        onSelectCard={(idx) => { setCurrentIdx(idx); setRevealed(false); }}
      />
      <ReviewRightRail
        card={card}
        cards={cards}
        reviewedCount={reviewed}
        totalDue={totalDue}
        forgotCount={forgotCount}
        gotItCount={gotItCount}
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
          <div className="max-w-3xl mx-auto px-8 pt-10">
            {card && meta ? (
              <>
                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[12px] text-slate-500 font-medium tabular-nums">
                    {currentIdx + 1} of {cards.length}
                  </span>
                  <div className="flex-1 h-[3px] rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
                    />
                  </div>
                  {reviewed > 0 && (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {reviewed} reviewed
                    </span>
                  )}
                </div>

                {/* Card */}
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ background: C.cardBg, borderColor: C.border }}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between px-5 py-3 border-b"
                    style={{ borderColor: C.border }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                        style={{ background: `${meta.color}15`, color: meta.color }}
                      >
                        <Icon size={12} />
                        {meta.label}
                      </div>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: DIFFICULTY_COLOR[card.difficulty] ?? C.textMuted }}
                      >
                        {card.difficulty}
                      </span>
                      {card.reviewCount > 0 && (
                        <span className="text-[10px] text-slate-600">
                          reviewed {card.reviewCount}×
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-slate-600 hover:text-slate-400 transition-colors p-1"
                      title="Dismiss this card"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Problem title */}
                  <div className="px-5 pt-4 pb-2">
                    <h2 className="text-[16px] font-bold text-white" style={SG}>
                      {card.problemTitle}
                    </h2>
                    {card.pattern && (
                      <span className="text-[11px] text-slate-500 font-medium">{card.pattern}</span>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="px-5 pb-5">
                    {!revealed ? (
                      <>
                        {card.cardType === 'key_lines' && <KeyLinesFront card={card} />}
                        {card.cardType === 'approach' && <ApproachFront card={card} />}
                        {card.cardType === 'complexity' && <ComplexityFront card={card} />}
                      </>
                    ) : (
                      <>
                        {card.cardType === 'key_lines' && <KeyLinesBack card={card} />}
                        {card.cardType === 'approach' && <ApproachBack card={card} />}
                        {card.cardType === 'complexity' && <ComplexityBack card={card} />}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center justify-center gap-3 px-5 py-4 border-t"
                    style={{ borderColor: C.border }}
                  >
                    {!revealed ? (
                      <Button
                        onClick={() => setRevealed(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-6"
                      >
                        <Eye size={14} className="mr-2" />
                        Reveal Answer
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleResult('forgot')}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-[13px] font-semibold px-5"
                        >
                          <RotateCcw size={14} className="mr-2" />
                          Forgot
                        </Button>
                        <Button
                          onClick={() => handleResult('got_it')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold px-5"
                        >
                          <Check size={14} className="mr-2" />
                          Got it
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
