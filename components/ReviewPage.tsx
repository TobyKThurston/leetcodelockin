'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Eye, Check, RotateCcw, Brain, Code2, Timer, Zap } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReviewCard, KeyLinesContent, ApproachContent, ComplexityContent } from '@/lib/review';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO = 'var(--font-geist-mono), ui-monospace, monospace';

const C = {
  appBg:    '#0b1220',
  panelBg:  '#070c17',
  cardBg:   '#0f1729',
  border:   'rgba(255,255,255,0.06)',
  text:     '#e5e7eb',
  textSub:  '#cbd5e1',
  textMuted:'#94a3b8',
  textDim:  '#64748b',
  blue:     '#3b82f6',
  emerald:  '#10b981',
  amber:    '#f59e0b',
  red:      '#ef4444',
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

  const card = cards[currentIdx];
  const meta = card ? CARD_TYPE_META[card.cardType] : null;
  const Icon = meta?.icon ?? Brain;

  return (
    <div className="min-h-screen" style={{ background: C.appBg }}>
      <AppNav activeTab="Review" />
      <main className="pt-12">
        {!isSignedIn ? (
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
        ) : !isPro ? (
          <ReviewUpgradePrompt />
        ) : loading ? (
          <div className="flex items-center justify-center mt-32">
            <div className="animate-pulse text-[13px] text-slate-500">Loading review cards...</div>
          </div>
        ) : cards.length === 0 ? (
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
        ) : card && meta ? (
          <div className="max-w-2xl mx-auto px-4 pt-8">
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
          </div>
        ) : null}
      </main>
    </div>
  );
}
