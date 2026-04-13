'use client';

import { useMemo, useState } from 'react';
import { Shuffle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { QuickCard } from '@/lib/quick-review-cards';
import { cn } from '@/lib/utils';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed + 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const TYPE_LABEL: Record<QuickCard['type'], string> = {
  big_o: 'Big-O',
  pattern: 'Pattern',
  code_reading: 'Code reading',
};

const TYPE_ACCENT: Record<QuickCard['type'], string> = {
  big_o: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  pattern: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  code_reading: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};

export default function FlashcardDeck({ cards }: { cards: QuickCard[] }) {
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => (seed === 0 ? cards : shuffle(cards, seed)), [cards, seed]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const card = deck[index];

  function goNext() {
    setIndex((i) => (i + 1) % deck.length);
    setRevealed(false);
    setSelected(null);
  }
  function goPrev() {
    setIndex((i) => (i - 1 + deck.length) % deck.length);
    setRevealed(false);
    setSelected(null);
  }
  function reshuffle() {
    setSeed((s) => s + 1);
    setIndex(0);
    setRevealed(false);
    setSelected(null);
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
            Flashcards
          </p>
          <h1 className="mt-1 text-[22px] font-bold text-white tracking-tight" style={SG}>
            Quick review
          </h1>
        </div>
        <button
          type="button"
          onClick={reshuffle}
          className="h-10 px-3 rounded-lg border border-white/10 bg-white/[0.03] text-[12px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] inline-flex items-center gap-1.5 transition-colors"
          aria-label="Shuffle"
        >
          <Shuffle size={13} strokeWidth={2.5} />
          Shuffle
        </button>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
            style={{ width: `${((index + 1) / deck.length) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
          {index + 1} / {deck.length}
        </span>
      </div>

      {/* Card */}
      <article className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-5 min-h-[380px] flex flex-col">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center h-[22px] px-2 rounded-full border text-[10px] font-semibold tracking-wide uppercase',
              TYPE_ACCENT[card.type],
            )}
          >
            {TYPE_LABEL[card.type]}
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-4 text-[17px] font-bold text-white leading-tight" style={SG}>
          {card.title}
        </h2>

        {/* Question */}
        <p className="mt-2.5 text-[14px] text-slate-300 leading-relaxed">{card.question}</p>

        {/* Code block */}
        {card.code && (
          <pre
            className="mt-4 bg-black/40 ring-1 ring-white/[0.05] rounded-xl p-3 overflow-x-auto text-[12px] leading-relaxed text-slate-300"
            style={MONO}
          >
            {card.code}
          </pre>
        )}

        {/* MCQ choices */}
        {card.interaction === 'mcq' && card.choices && (
          <ul className="mt-5 space-y-2">
            {card.choices.map((choice, i) => {
              const isCorrect = card.correctChoice === i;
              const isPicked = selected === i;
              const show = selected !== null;
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={show}
                    onClick={() => {
                      setSelected(i);
                      setRevealed(true);
                    }}
                    className={cn(
                      'w-full text-left px-4 h-12 rounded-xl border text-[13px] font-medium transition-all',
                      !show && 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06] active:scale-[0.99]',
                      show && isCorrect && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
                      show && !isCorrect && isPicked && 'border-rose-500/40 bg-rose-500/10 text-rose-200',
                      show && !isCorrect && !isPicked && 'border-white/5 bg-white/[0.02] text-slate-500',
                    )}
                  >
                    {choice}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Reveal / type interactions share the same "reveal" UI on mobile */}
        {card.interaction !== 'mcq' && !revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-auto h-12 px-5 rounded-xl border border-white/15 bg-white/5 text-[14px] font-semibold text-white hover:bg-white/10 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
          >
            <Eye size={15} strokeWidth={2} />
            Tap to reveal
          </button>
        )}

        {/* Answer reveal */}
        {revealed && (
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500">
              Answer
            </p>
            <p className="mt-2 text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
              {card.answer}
            </p>
          </div>
        )}
      </article>

      {/* Nav */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="flex-1 h-12 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition-all"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex-1 h-12 rounded-xl bg-white text-zinc-900 text-[13px] font-semibold hover:bg-zinc-100 active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition-all"
        >
          Next
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
