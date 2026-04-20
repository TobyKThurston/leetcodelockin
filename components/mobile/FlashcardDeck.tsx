'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shuffle, ChevronLeft, ChevronRight, Eye, Settings2 } from 'lucide-react';
import {
  ALL_TOPICS,
  TOPIC_LABEL,
  getCardTopic,
  type QuickCard,
  type QuickCardTopic,
  type QuickCardType,
} from '@/lib/quick-review-cards';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const FILTERS_KEY = 'zl-flashcard-filters';

const ALL_TYPES: QuickCardType[] = ['big_o', 'pattern', 'code_reading'];

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

const TYPE_LABEL: Record<QuickCardType, string> = {
  big_o: 'Big-O',
  pattern: 'Pattern',
  code_reading: 'Code reading',
};

const TYPE_ACCENT: Record<QuickCardType, string> = {
  big_o: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  pattern: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  code_reading: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};

const TOPIC_ACCENT_ON = 'text-indigo-200 bg-indigo-500/10 border-indigo-400/30';
const CHIP_OFF = 'text-slate-500 bg-white/[0.02] border-white/5';

type PersistedFilters = { types?: string[]; topics?: string[] };

function readPersistedFilters(): {
  types: Set<QuickCardType>;
  topics: Set<QuickCardTopic>;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FILTERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedFilters;
    const types = new Set<QuickCardType>(
      (parsed.types ?? ALL_TYPES).filter((t): t is QuickCardType =>
        ALL_TYPES.includes(t as QuickCardType),
      ),
    );
    const topics = new Set<QuickCardTopic>(
      (parsed.topics ?? ALL_TOPICS).filter((t): t is QuickCardTopic =>
        ALL_TOPICS.includes(t as QuickCardTopic),
      ),
    );
    return { types, topics };
  } catch {
    return null;
  }
}

export default function FlashcardDeck({ cards }: { cards: QuickCard[] }) {
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [enabledTypes, setEnabledTypes] = useState<Set<QuickCardType>>(
    () => new Set(ALL_TYPES),
  );
  const [enabledTopics, setEnabledTopics] = useState<Set<QuickCardTopic>>(
    () => new Set(ALL_TOPICS),
  );

  useEffect(() => {
    const persisted = readPersistedFilters();
    if (persisted) {
      setEnabledTypes(persisted.types);
      setEnabledTopics(persisted.topics);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        FILTERS_KEY,
        JSON.stringify({
          types: Array.from(enabledTypes),
          topics: Array.from(enabledTopics),
        }),
      );
    } catch {
      // localStorage can throw (quota, private mode) — safe to ignore
    }
  }, [enabledTypes, enabledTopics]);

  const deck = useMemo(() => {
    const filtered = cards.filter(
      (c) => enabledTypes.has(c.type) && enabledTopics.has(getCardTopic(c)),
    );
    return seed === 0 ? filtered : shuffle(filtered, seed);
  }, [cards, enabledTypes, enabledTopics, seed]);

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
    setSelected(null);
  }, [deck.length]);

  const card = deck[index];

  function goNext() {
    if (deck.length === 0) return;
    setIndex((i) => (i + 1) % deck.length);
    setRevealed(false);
    setSelected(null);
  }
  function goPrev() {
    if (deck.length === 0) return;
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

  function toggleType(t: QuickCardType) {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }
  function toggleTopic(t: QuickCardTopic) {
    setEnabledTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }
  function resetFilters() {
    setEnabledTypes(new Set(ALL_TYPES));
    setEnabledTopics(new Set(ALL_TOPICS));
  }

  const totalCount = cards.length;
  const matchingCount = deck.length;

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06] inline-flex items-center justify-center transition-colors"
            aria-label="Filter cards"
          >
            <Settings2 size={15} strokeWidth={2.25} />
          </button>
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
      </div>

      {/* Counter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
            style={{
              width: matchingCount === 0 ? '0%' : `${((index + 1) / matchingCount) * 100}%`,
            }}
          />
        </div>
        <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
          {matchingCount === 0 ? '0 / 0' : `${index + 1} / ${matchingCount}`}
        </span>
      </div>

      {/* Empty state (no cards match filters) */}
      {!card && (
        <article className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-6 min-h-[380px] flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
            No cards match
          </p>
          <h2
            className="mt-3 text-[18px] font-bold text-white leading-tight"
            style={SG}
          >
            Every card is filtered out
          </h2>
          <p className="mt-2 text-[13px] text-slate-400 max-w-xs">
            Turn a question format or topic back on to see cards here.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="h-10 px-4 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] font-semibold text-slate-200 hover:bg-white/[0.06] transition-all"
            >
              Adjust filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 px-4 rounded-xl bg-white text-zinc-900 text-[13px] font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all"
            >
              Reset all
            </button>
          </div>
        </article>
      )}

      {/* Card */}
      {card && (
        <article className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-5 min-h-[380px] flex flex-col">
          {/* Type + topic badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center h-[22px] px-2 rounded-full border text-[10px] font-semibold tracking-wide uppercase',
                TYPE_ACCENT[card.type],
              )}
            >
              {TYPE_LABEL[card.type]}
            </span>
            <span
              className={cn(
                'inline-flex items-center h-[22px] px-2 rounded-full border text-[10px] font-semibold tracking-wide uppercase',
                TOPIC_ACCENT_ON,
              )}
            >
              {TOPIC_LABEL[getCardTopic(card)]}
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
      )}

      {/* Nav */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={!card}
          className="flex-1 h-12 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 transition-all"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!card}
          className="flex-1 h-12 rounded-xl bg-white text-zinc-900 text-[13px] font-semibold hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 transition-all"
        >
          Next
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      <FilterDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        enabledTypes={enabledTypes}
        enabledTopics={enabledTopics}
        onToggleType={toggleType}
        onToggleTopic={toggleTopic}
        onReset={resetFilters}
        matching={matchingCount}
        total={totalCount}
      />
    </div>
  );
}

function FilterDialog({
  open,
  onOpenChange,
  enabledTypes,
  enabledTopics,
  onToggleType,
  onToggleTopic,
  onReset,
  matching,
  total,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabledTypes: Set<QuickCardType>;
  enabledTopics: Set<QuickCardTopic>;
  onToggleType: (t: QuickCardType) => void;
  onToggleTopic: (t: QuickCardTopic) => void;
  onReset: () => void;
  matching: number;
  total: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-md bg-[#0b1220] text-slate-200 ring-white/10',
          'max-h-[85vh] overflow-y-auto',
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-[16px] text-white" style={SG}>
            Card filters
          </DialogTitle>
          <p className="text-[12px] text-slate-400">
            Choose the formats and topics you want to see in this deck.
          </p>
        </DialogHeader>

        <section className="mt-1 space-y-2.5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500">
            Question format
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((t) => {
              const on = enabledTypes.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onToggleType(t)}
                  aria-pressed={on}
                  className={cn(
                    'h-9 px-3 rounded-full border text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    on ? TYPE_ACCENT[t] : CHIP_OFF,
                  )}
                >
                  {TYPE_LABEL[t]}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-4 space-y-2.5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500">
            Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_TOPICS.map((t) => {
              const on = enabledTopics.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onToggleTopic(t)}
                  aria-pressed={on}
                  className={cn(
                    'h-9 px-3 rounded-full border text-[11px] font-semibold tracking-wide transition-colors',
                    on ? TOPIC_ACCENT_ON : CHIP_OFF,
                  )}
                >
                  {TOPIC_LABEL[t]}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <span className="text-[12px] text-slate-400 tabular-nums">
            <span className="text-white font-semibold">{matching}</span>
            <span className="text-slate-500"> of {total} cards</span>
          </span>
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
