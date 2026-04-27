'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { X, Eye, Check, RotateCcw, Brain, Code2, Timer, CheckCircle2, BookOpen, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import AppNav from '@/components/AppNav';
import AppShell from '@/components/shell/AppShell';
import ShellSidebar from '@/components/shell/ShellSidebar';
import ShellRail from '@/components/shell/ShellRail';
import PageHeader from '@/components/shell/PageHeader';
import MainSurface from '@/components/shell/MainSurface';
import { RailHeader, MetricRow, Metric, RAIL_BOX } from '@/components/shell/RailPrimitives';
import { C, SG } from '@/lib/ui-tokens';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReviewCard, KeyLinesContent, ApproachContent, ComplexityContent } from '@/lib/review';
import { QUICK_CARDS } from '@/lib/quick-review-cards';
import type { QuickCard } from '@/lib/quick-review-cards';
import {
  MONTHLY_PRICE_LABEL,
  YEARLY_PRICE_LABEL,
  YEARLY_SAVINGS_LABEL,
  YEARLY_PER_MONTH_LABEL,
} from '@/lib/pricing';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';

const BATCH_SIZE = 10;
const FREE_LIMIT = 10;
const FREE_USED_KEY = 'zl-free-review-used';

// Local color aliases — keep Review's extra accents out of ui-tokens.
const REVIEW_COLORS = {
  amber: '#f59e0b',
  red:   '#ef4444',
};

const CARD_TYPE_META = {
  key_lines:  { icon: Code2,  label: 'Key Lines',  color: C.blue },
  approach:   { icon: Brain,  label: 'Approach',    color: C.emerald },
  complexity: { icon: Timer,  label: 'Complexity',  color: REVIEW_COLORS.amber },
} as const;

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

const QUICK_TYPE_META = {
  big_o:        { icon: Timer,        label: 'Big-O',        color: REVIEW_COLORS.amber },
  pattern:      { icon: Brain,        label: 'Pattern',      color: C.emerald },
  code_reading: { icon: Code2,        label: 'Code Reading', color: C.blue },
} as const;

// Rail primitives (RailHeader, MetricRow, Metric, RAIL_BOX) live in @/components/shell/RailPrimitives

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
      className="rounded-lg p-4 text-[13px] leading-[1.7] overflow-x-auto border border-[var(--ll-border)]"
      style={{ background: 'var(--ll-bg-code)', fontFamily: MONO }}
    >
      {lines.map((line, i) => {
        const isBlanked = blanks.has(i);
        if (isBlanked && !revealed) {
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
              <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[11px] font-medium">
                {'_'.repeat(Math.max(line.trim().length, 12))} -- recall this line
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
              <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1 rounded">
                {original}
              </span>
            </div>
          );
        }
        return (
          <div key={i} className="flex">
            <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
            <span className="text-slate-700">{line || ' '}</span>
          </div>
        );
      })}
    </pre>
  );
}

// ─── Card front/back renderers (SR mode) ────────────────────────────────────

// Rendered on the front of every card so students have concrete context
// before recalling — title alone doesn't jog the memory.
function ProblemRecap({ recap }: { recap: string | undefined }) {
  if (!recap) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
      <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
        The problem
      </span>
      <p className="text-[13.5px] text-slate-700 leading-relaxed mt-1">{recap}</p>
    </div>
  );
}

function KeyLinesFront({ card }: { card: ReviewCard }) {
  const content = card.content as KeyLinesContent;
  return (
    <div className="space-y-3">
      <ProblemRecap recap={content.problem_recap} />
      <p className="text-[14px] text-slate-600">
        Fill in the blanked-out lines from your solution:
      </p>
      <CodeBlock
        code={card.codeSnapshot}
        blankIndices={content.blank_indices}
        revealed={false}
      />
      {content.line_hints?.some(h => h) && (
        <div>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Hints</span>
          <ul className="mt-1.5 space-y-1">
            {content.blank_indices.map((lineIdx, i) => {
              const hint = content.line_hints?.[i];
              if (!hint) return null;
              return (
                <li key={lineIdx} className="flex gap-2 text-[12.5px] text-slate-600 leading-relaxed">
                  <span className="text-slate-400 tabular-nums shrink-0" style={{ fontFamily: MONO }}>
                    L{lineIdx + 1}
                  </span>
                  <span>{hint}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function KeyLinesBack({ card }: { card: ReviewCard }) {
  const content = card.content as KeyLinesContent;
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-emerald-400 font-medium">Here are the key lines:</p>
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
  const content = card.content as ApproachContent;
  return (
    <div className="space-y-3">
      <ProblemRecap recap={content.problem_recap} />
      <p className="text-[14px] text-slate-600">
        What pattern and approach did you use here?
      </p>
      <p className="text-[13px] text-slate-500 italic">
        Think about the key insight, the steps, and any edge case to watch out for — then reveal.
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
        <p className="text-[15px] text-slate-900 font-semibold mt-1" style={SG}>{content.pattern}</p>
      </div>
      {content.key_insight && (
        <div>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Key insight</span>
          <p className="text-[14px] text-slate-700 leading-relaxed mt-1">{content.key_insight}</p>
        </div>
      )}
      {content.steps && content.steps.length > 0 && (
        <div>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Steps</span>
          <ol className="mt-1.5 space-y-1.5">
            {content.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] text-slate-700 leading-relaxed">
                <span className="shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-center tabular-nums mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {content.gotcha && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2.5">
          <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase">Watch out</span>
          <p className="text-[13.5px] text-slate-700 leading-relaxed mt-1">{content.gotcha}</p>
        </div>
      )}
      <div>
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Your Code</span>
        <CodeBlock code={card.codeSnapshot} revealed={true} />
      </div>
    </div>
  );
}

function ComplexityFront({ card }: { card: ReviewCard }) {
  const content = card.content as ComplexityContent;
  return (
    <div className="space-y-3">
      <ProblemRecap recap={content.problem_recap} />
      <p className="text-[14px] text-slate-600">
        What is the time and space complexity of your solution?
      </p>
      <CodeBlock code={card.codeSnapshot} revealed={true} />
    </div>
  );
}

function ComplexityBack({ card }: { card: ReviewCard }) {
  const content = card.content as ComplexityContent;
  // Back-compat: older cards may have had a single `reasoning` field.
  const legacyReasoning = (content as unknown as { reasoning?: string }).reasoning;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Time</span>
          <p className="text-[20px] text-slate-900 font-bold mt-1" style={{ fontFamily: MONO }}>{content.time}</p>
          {content.time_reasoning && (
            <p className="text-[12.5px] text-slate-600 leading-relaxed mt-1.5">{content.time_reasoning}</p>
          )}
        </div>
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Space</span>
          <p className="text-[20px] text-slate-900 font-bold mt-1" style={{ fontFamily: MONO }}>{content.space}</p>
          {content.space_reasoning && (
            <p className="text-[12.5px] text-slate-600 leading-relaxed mt-1.5">{content.space_reasoning}</p>
          )}
        </div>
      </div>
      {!content.time_reasoning && !content.space_reasoning && legacyReasoning && (
        <p className="text-[14px] text-slate-600 leading-relaxed">{legacyReasoning}</p>
      )}
    </div>
  );
}

// ─── Interactive Quick Card Components ──────────────────────────────────────

function MCQCard({
  card,
  onAnswer,
}: {
  card: QuickCard;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === card.correctChoice;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    onAnswer(idx === card.correctChoice!);
  }

  return (
    <div className="space-y-5">
      <p className="text-[15px] text-slate-800 leading-relaxed">
        {card.question}
      </p>

      {card.code && (
        <pre
          className="rounded-lg p-5 text-[13px] leading-[1.7] overflow-x-auto border border-[var(--ll-border)]"
          style={{ background: 'var(--ll-bg-code)', fontFamily: MONO }}
        >
          {card.code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-slate-600 select-none w-6 text-right mr-3">{i + 1}</span>
              <span className="text-slate-700">{line || ' '}</span>
            </div>
          ))}
        </pre>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {card.choices!.map((choice, idx) => {
          const isThis = selected === idx;
          const isCorrectChoice = idx === card.correctChoice;

          let borderColor = 'border-slate-200';
          let bg = 'bg-white';
          let textColor = 'text-slate-800';
          let labelColor = 'text-slate-500';
          let labelBg = 'bg-slate-100';

          if (answered && isCorrectChoice) {
            borderColor = 'border-emerald-500/50';
            bg = 'bg-emerald-500/[0.08]';
            textColor = 'text-emerald-300';
            labelColor = 'text-emerald-400';
            labelBg = 'bg-emerald-500/20';
          } else if (answered && isThis && !isCorrect) {
            borderColor = 'border-red-500/50';
            bg = 'bg-red-500/[0.08]';
            textColor = 'text-red-300';
            labelColor = 'text-red-400';
            labelBg = 'bg-red-500/20';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={cn(
                'w-full text-left rounded-lg px-4 py-3.5 border transition-all duration-150',
                'flex items-center gap-3',
                borderColor, bg,
                !answered && 'hover:bg-slate-200/50 hover:border-slate-300/80 cursor-pointer',
                answered && 'cursor-default',
              )}
            >
              <span className={cn(
                'shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-bold',
                labelBg, labelColor,
              )}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className={cn('text-[14px] font-medium', textColor)}>
                {choice}
              </span>
              {answered && isCorrectChoice && (
                <Check size={16} className="ml-auto text-emerald-400 shrink-0" />
              )}
              {answered && isThis && !isCorrect && (
                <X size={16} className="ml-auto text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={cn(
            'rounded-lg p-4 border text-[14px] leading-relaxed',
            isCorrect
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-slate-700'
              : 'bg-red-500/[0.06] border-red-500/20 text-slate-700',
          )}
        >
          <p className={cn(
            'text-[12px] font-bold uppercase tracking-wider mb-2',
            isCorrect ? 'text-emerald-400' : 'text-red-400',
          )}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </p>
          <p className="whitespace-pre-line">{card.answer}</p>
        </div>
      )}
    </div>
  );
}

function TypeAnswerCard({
  card,
  onAnswer,
}: {
  card: QuickCard;
  onAnswer: (correct: boolean) => void;
}) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCorrect = submitted && card.acceptableAnswers?.some(
    a => a.trim().toLowerCase() === input.trim().toLowerCase()
  );

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (submitted || !input.trim()) return;
    setSubmitted(true);
    const correct = card.acceptableAnswers?.some(
      a => a.trim().toLowerCase() === input.trim().toLowerCase()
    ) ?? false;
    onAnswer(correct);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-5">
      <p className="text-[15px] text-slate-800 leading-relaxed">
        {card.question}
      </p>

      {card.code && (
        <pre
          className="rounded-lg p-5 text-[13px] leading-[1.7] overflow-x-auto border border-[var(--ll-border)]"
          style={{ background: 'var(--ll-bg-code)', fontFamily: MONO }}
        >
          {card.code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-slate-600 select-none w-6 text-right mr-3">{i + 1}</span>
              <span className="text-slate-700">{line || ' '}</span>
            </div>
          ))}
        </pre>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-[12px] text-slate-500 font-medium">
          {card.typePrompt ?? 'Type your answer'}
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={submitted}
            placeholder="Your answer..."
            className={cn(
              'flex-1 rounded-lg px-4 py-3 text-[15px] font-medium border outline-none transition-colors',
              'bg-slate-100/70 text-slate-900 placeholder:text-slate-600',
              !submitted && 'border-slate-200 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20',
              submitted && isCorrect && 'border-emerald-500/50 bg-emerald-500/[0.06]',
              submitted && !isCorrect && 'border-red-500/50 bg-red-500/[0.06]',
            )}
            style={{ fontFamily: MONO }}
          />
          {!submitted && (
            <Button
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-5 shrink-0"
            >
              Check
            </Button>
          )}
        </div>
      </form>

      {submitted && (
        <div
          className={cn(
            'rounded-lg p-4 border text-[14px] leading-relaxed',
            isCorrect
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-slate-700'
              : 'bg-red-500/[0.06] border-red-500/20 text-slate-700',
          )}
        >
          <p className={cn(
            'text-[12px] font-bold uppercase tracking-wider mb-2',
            isCorrect ? 'text-emerald-400' : 'text-red-400',
          )}>
            {isCorrect ? 'Correct' : `Not quite -- the answer is ${card.acceptableAnswers?.[0]}`}
          </p>
          <p className="whitespace-pre-line">{card.answer}</p>
        </div>
      )}
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
        !isActive && isReviewed && 'bg-slate-50 border-emerald-500/25 hover:border-emerald-500/40',
        !isActive && !isReviewed && 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300',
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
          isActive && 'text-slate-900',
          !isActive && isReviewed && 'text-slate-700',
          !isActive && !isReviewed && 'text-slate-800',
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

// ─── Left Sidebar (SR mode) ─────────────────────────────────────────────────

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
    <ShellSidebar
      className="hidden md:flex"
      footer={
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500 font-medium">Session</span>
              <span className="text-slate-700 font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: C.blue }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Reviewed</span>
            <span className="text-slate-600 font-medium tabular-nums">
              {reviewedCount} / {totalCards}
            </span>
          </div>
        </div>
      }
    >
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
    </ShellSidebar>
  );
}

// ─── Right Rail (SR mode only) ──────────────────────────────────────────────

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

  const typeCounts = useMemo(() => {
    const counts = { key_lines: 0, approach: 0, complexity: 0 };
    for (const c of cards) counts[c.cardType]++;
    return counts;
  }, [cards]);

  return (
    <ShellRail>
          {/* Current Card */}
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
                  className="text-[12.5px] font-semibold leading-tight text-slate-900 tracking-[-0.005em]"
                  style={SG}
                >
                  {card.problemTitle}
                </p>
                {card.pattern && (
                  <p className="text-[10px] text-slate-600 mt-0.5">{card.pattern}</p>
                )}
                {card.reviewCount > 0 && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Reviewed {card.reviewCount}x before
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Session Progress */}
          <section>
            <RailHeader>Session Progress</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={String(reviewedCount)} label="reviewed" />
              <Metric value={String(remaining)} label="left" />
              <Metric value={`${accuracy}%`} label="accuracy" />
            </div>
          </section>

          {/* Results */}
          <section>
            <RailHeader>Results</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              <MetricRow label="Got it" value={String(gotItCount)} />
              <MetricRow label="Forgot" value={String(forgotCount)} />
              <MetricRow label="Total due" value={String(totalDue)} />
            </div>
          </section>

          {/* Card Types */}
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
                    <span className="text-slate-700 font-medium tabular-nums">
                      {typeCounts[type]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
    </ShellRail>
  );
}

// ─── Pro upgrade modal ──────────────────────────────────────────────────────

const PRO_FEATURES = [
  'Unlimited Quick Review questions',
  'Spaced repetition from your solutions',
  'Unlimited AI Socratic tutor',
  'Unlimited AI chat follow-ups',
];

function ProUpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleCheckout(plan: 'monthly' | 'yearly') {
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          returnPath: window.location.pathname + window.location.search,
        }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Pro"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(3,7,18,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl"
        style={{
          background: 'var(--ll-bg)',
          border: '1px solid rgba(15,23,42,0.10)',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-6 sm:px-8 pt-8 pb-7">
          <div className="text-center mb-6">
            <p
              className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-2"
              style={SG}
            >
              Upgrade to Pro
            </p>
            <h2
              className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight"
              style={SG}
            >
              You&apos;ve reached the free limit
            </h2>
            <p className="mt-2 text-slate-500 text-[13px] max-w-md mx-auto leading-relaxed">
              Free plan covers the first {BATCH_SIZE} Quick Review questions. Go Pro for unlimited review plus personalized spaced repetition from your solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <Card className="bg-slate-50/50 ring-white/[0.06] rounded-xl py-0 gap-0">
              <CardHeader className="px-5 pt-5 pb-0">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600" style={SG}>
                  Pro Monthly
                </span>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-slate-900 leading-none" style={SG}>{MONTHLY_PRICE_LABEL}</span>
                  <span className="text-[13px] text-slate-500">/month</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Cancel anytime</p>
              </CardHeader>
              <CardContent className="px-5 pt-4 flex-1">
                <ul className="space-y-1.5">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="size-3 shrink-0 mt-0.5 text-slate-500" strokeWidth={2.5} />
                      <span className="text-[11.5px] text-slate-700 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-5 pb-5 pt-4 bg-transparent border-0">
                <Button
                  className="w-full h-10 rounded-lg text-[12.5px] font-semibold border border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100"
                  variant="outline"
                  onClick={() => handleCheckout('monthly')}
                  disabled={loading !== null}
                >
                  {loading === 'monthly' ? 'Loading...' : 'Start monthly'}
                </Button>
              </CardFooter>
            </Card>

            <Card className="relative bg-gradient-to-b from-blue-500/[0.05] to-blue-500/[0.01] ring-blue-500/20 rounded-xl py-0 gap-0 shadow-[0_0_40px_-15px_rgba(59,130,246,0.2)]">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400" style={SG}>
                    Pro Yearly
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                    Save {YEARLY_SAVINGS_LABEL}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-slate-900 leading-none" style={SG}>{YEARLY_PRICE_LABEL}</span>
                  <span className="text-[13px] text-slate-500">/year</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  That&apos;s <span className="text-slate-700">{YEARLY_PER_MONTH_LABEL}/mo</span>
                </p>
              </CardHeader>
              <CardContent className="px-5 pt-4 flex-1">
                <ul className="space-y-1.5">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="size-3 shrink-0 mt-0.5 text-blue-400" strokeWidth={2.5} />
                      <span className="text-[11.5px] text-slate-700 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-5 pb-5 pt-4 bg-transparent border-0">
                <Button
                  className="w-full h-10 rounded-lg text-[12.5px] font-semibold border border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100"
                  variant="outline"
                  onClick={() => handleCheckout('yearly')}
                  disabled={loading !== null}
                >
                  {loading === 'yearly' ? 'Loading...' : 'Start yearly'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Review sidebar row ───────────────────────────────────────────────

function QuickSidebarRow({
  card, isActive, isReviewed, result, onClick,
}: {
  card: QuickCard;
  isActive: boolean;
  isReviewed: boolean;
  result?: 'correct' | 'incorrect';
  onClick: () => void;
}) {
  const meta = QUICK_TYPE_META[card.type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        isActive && 'bg-blue-500/[0.08] border-blue-400/50',
        !isActive && isReviewed && result === 'correct' && 'bg-slate-50 border-emerald-500/25 hover:border-emerald-500/40',
        !isActive && isReviewed && result === 'incorrect' && 'bg-slate-50 border-red-500/25 hover:border-red-500/40',
        !isActive && !isReviewed && 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300',
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
        {isReviewed && result === 'correct' && <Check size={12} strokeWidth={2.25} className="text-emerald-400" />}
        {isReviewed && result === 'incorrect' && <X size={12} strokeWidth={2.25} className="text-red-400" />}
      </div>
      <p
        className={cn(
          'text-[12.5px] font-semibold leading-tight tracking-[-0.005em] truncate',
          isActive && 'text-slate-900',
          !isActive && isReviewed && 'text-slate-700',
          !isActive && !isReviewed && 'text-slate-800',
        )}
        style={SG}
      >
        {card.title}
      </p>
    </button>
  );
}

// ─── Quick Review Right Rail ────────────────────────────────────────────────

function QuickReviewRightRail({
  reviewedCount, totalCards, correctCount, isPro, srDueCount, srReviewed,
}: {
  reviewedCount: number;
  totalCards: number;
  correctCount: number;
  isPro: boolean;
  srDueCount: number;
  srReviewed: number;
}) {
  const remaining = totalCards - reviewedCount;

  return (
    <ShellRail>
          {/* Session Score */}
          <section>
            <RailHeader>Session Score</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={String(correctCount)} label="correct" />
              <Metric value={String(reviewedCount - correctCount)} label="wrong" />
              <Metric value={String(remaining)} label="remaining" />
            </div>
          </section>

          {/* Spaced Repetition -- the key feature */}
          <section>
            <RailHeader>Spaced Repetition</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-3')}>
              {isPro ? (
                <>
                  <div className="space-y-2">
                    <MetricRow label="Cards due now" value={String(srDueCount)} />
                    {srReviewed > 0 && (
                      <MetricRow label="Reviewed this session" value={String(srReviewed)} />
                    )}
                  </div>
                  {srDueCount === 0 && (
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t" style={{ borderColor: C.border }}>
                      No cards due right now. As you solve more problems, personalized review cards are generated from your accepted solutions and scheduled at increasing intervals.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    Pro generates personalized flashcards every time you solve a problem. Cards come back at increasing intervals so you review right before you forget.
                  </p>
                  <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[11px] text-slate-500">Day 1: first review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[11px] text-slate-500">Day 2: second review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[11px] text-slate-500">Day 4, 8, 16, 30...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* How it works */}
          <section>
            <RailHeader>How Review Works</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-3')}>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    <span className="text-slate-700 font-medium">Quick Review</span> -- random fundamentals to test Big-O, patterns, and code reading
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    <span className="text-slate-700 font-medium">Solve problems</span> -- AI generates flashcards from your accepted code
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    <span className="text-slate-700 font-medium">Spaced repetition</span> -- your cards come back at optimized intervals so you never forget
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Coming up */}
          <section>
            <RailHeader>Coming Up</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2.5')}>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                The more problems you solve, the more personalized this page becomes. Instead of random fundamentals, you will review:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Code2 size={11} className="text-blue-400 shrink-0" />
                  <span className="text-[11px] text-slate-700">Key lines from your solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain size={11} className="text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-slate-700">Patterns and approaches you used</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer size={11} className="text-amber-400 shrink-0" />
                  <span className="text-[11px] text-slate-700">Time and space complexity</span>
                </div>
              </div>
            </div>
          </section>
    </ShellRail>
  );
}

// ─── Empty / sign-in / upgrade states ───────────────────────────────────────

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

// ─── Quick Review Left Sidebar ──────────────────────────────────────────────

function QuickReviewSidebar({
  cards, currentIdx, reviewedSet, results, onSelectCard, srDueCount, mode, isPro,
}: {
  cards: QuickCard[];
  currentIdx: number;
  reviewedSet: Set<number>;
  results: Map<number, 'correct' | 'incorrect'>;
  onSelectCard: (idx: number) => void;
  srDueCount: number;
  mode: 'quick' | 'sr';
  isPro: boolean;
}) {
  const totalCards = cards.length;
  const reviewedCount = reviewedSet.size;
  const correctCount = Array.from(results.values()).filter(r => r === 'correct').length;
  const pct = totalCards === 0 ? 0 : Math.round((reviewedCount / totalCards) * 100);

  return (
    <ShellSidebar
      className="hidden md:flex"
      footer={
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500 font-medium">Session</span>
              <span className="text-slate-700 font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: C.blue }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Score</span>
            <span className="text-slate-600 font-medium tabular-nums">
              {correctCount} / {reviewedCount} correct
            </span>
          </div>
          {srDueCount > 0 && mode === 'quick' && (
            <div className="flex justify-between text-[11.5px]">
              <span className="text-slate-500">SR cards due</span>
              <span className="text-amber-400 font-medium tabular-nums">{srDueCount}</span>
            </div>
          )}
        </div>
      }
    >
      <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-1 px-1">
        {mode === 'sr' ? 'Due for Review' : 'Quick Review'}
      </p>
      <div className="px-1 pb-2">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {isPro
            ? 'These are random fundamentals. As you solve more problems, your review cards will be based on your actual solutions.'
            : 'Random fundamentals to sharpen your foundations. Upgrade to Pro to get personalized cards from problems you solve.'}
        </p>
      </div>
      {cards.map((card, idx) => (
        <QuickSidebarRow
          key={card.id}
          card={card}
          isActive={idx === currentIdx}
          isReviewed={reviewedSet.has(idx)}
          result={results.get(idx)}
          onClick={() => onSelectCard(idx)}
        />
      ))}
    </ShellSidebar>
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
  // ── SR card state ──
  const [srCards, setSrCards] = useState<ReviewCard[]>([]);
  const [srLoading, setSrLoading] = useState(true);
  const [srCurrentIdx, setSrCurrentIdx] = useState(0);
  const [srRevealed, setSrRevealed] = useState(false);
  const [totalDue, setTotalDue] = useState(0);
  const [srReviewed, setSrReviewed] = useState(0);
  const [srReviewedSet, setSrReviewedSet] = useState<Set<number>>(new Set());
  const [srGotIt, setSrGotIt] = useState(0);
  const [srForgot, setSrForgot] = useState(0);

  // ── Quick review state ──
  // Shuffle ALL cards once on mount
  const shuffledAllCards = useMemo(() => {
    const arr = [...QUICK_CARDS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);
  // Batch pagination: show BATCH_SIZE cards at a time
  const [batchStart, setBatchStart] = useState(0);
  const currentBatch = useMemo(
    () => shuffledAllCards.slice(batchStart, batchStart + BATCH_SIZE),
    [shuffledAllCards, batchStart],
  );
  const totalBatches = Math.ceil(shuffledAllCards.length / BATCH_SIZE);
  const currentBatchNum = Math.floor(batchStart / BATCH_SIZE) + 1;
  const hasMoreBatches = batchStart + BATCH_SIZE < shuffledAllCards.length;

  const [quickIdx, setQuickIdx] = useState(0);
  const [quickReviewedSet, setQuickReviewedSet] = useState<Set<number>>(new Set());
  const [quickResults, setQuickResults] = useState<Map<number, 'correct' | 'incorrect'>>(new Map());
  // Key to force remount of interactive cards when switching
  const [cardKey, setCardKey] = useState(0);
  // Track cumulative stats across batches
  const [cumulativeCorrect, setCumulativeCorrect] = useState(0);
  const [cumulativeTotal, setCumulativeTotal] = useState(0);

  // Pro upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const autoOpenedUpgradeRef = useRef(false);

  // Lifetime free usage (persisted in localStorage)
  const [freeUsed, setFreeUsed] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = parseInt(localStorage.getItem(FREE_USED_KEY) ?? '0', 10);
    if (!Number.isNaN(v)) setFreeUsed(v);
  }, []);
  const freeLimitReached = !isPro && freeUsed >= FREE_LIMIT;

  // Are we in SR mode (have due cards) or quick review mode?
  const mode = srCards.length > 0 ? 'sr' : 'quick';

  const fetchCards = useCallback(async () => {
    setSrLoading(true);
    try {
      const res = await fetch('/api/review/due');
      const data = await res.json();
      setSrCards(data.cards ?? []);
      setTotalDue(data.totalDue ?? 0);
    } catch {
      setSrCards([]);
    }
    setSrLoading(false);
  }, []);

  useEffect(() => {
    if (isPro && isSignedIn) fetchCards();
    else setSrLoading(false);
  }, [isPro, isSignedIn, fetchCards]);

  // Auto-open upgrade modal once per page load when the free limit is reached
  useEffect(() => {
    if (freeLimitReached && !autoOpenedUpgradeRef.current) {
      autoOpenedUpgradeRef.current = true;
      setShowUpgradeModal(true);
    }
  }, [freeLimitReached]);

  async function handleSrResult(result: 'got_it' | 'forgot') {
    const card = srCards[srCurrentIdx];
    if (!card) return;

    await fetch('/api/review/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id, result }),
    });

    setSrReviewed(r => r + 1);
    setSrReviewedSet(prev => new Set(prev).add(srCurrentIdx));
    if (result === 'got_it') setSrGotIt(c => c + 1);
    else setSrForgot(c => c + 1);
    setSrRevealed(false);

    if (srCurrentIdx < srCards.length - 1) {
      setSrCurrentIdx(i => i + 1);
    } else {
      setSrCards([]);
    }
  }

  async function handleDismiss() {
    const card = srCards[srCurrentIdx];
    if (!card) return;

    await fetch('/api/review/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id }),
    });

    const next = srCards.filter((_, i) => i !== srCurrentIdx);
    setSrCards(next);
    if (srCurrentIdx >= next.length) setSrCurrentIdx(Math.max(0, next.length - 1));
    setSrRevealed(false);
  }

  function handleQuickAnswer(correct: boolean) {
    const alreadyAnswered = quickReviewedSet.has(quickIdx);
    setQuickReviewedSet(prev => new Set(prev).add(quickIdx));
    setQuickResults(prev => {
      const next = new Map(prev);
      next.set(quickIdx, correct ? 'correct' : 'incorrect');
      return next;
    });
    if (!isPro && !alreadyAnswered) {
      setFreeUsed(prev => {
        const next = prev + 1;
        try { localStorage.setItem(FREE_USED_KEY, String(next)); } catch {}
        return next;
      });
    }
  }

  function handleQuickNext() {
    if (quickIdx < currentBatch.length - 1) {
      setQuickIdx(i => i + 1);
      setCardKey(k => k + 1);
    }
  }

  function handleNextBatch() {
    // Save cumulative stats before resetting batch state
    const batchCorrect = Array.from(quickResults.values()).filter(r => r === 'correct').length;
    setCumulativeCorrect(c => c + batchCorrect);
    setCumulativeTotal(c => c + quickReviewedSet.size);
    // Advance to next batch
    setBatchStart(s => s + BATCH_SIZE);
    setQuickIdx(0);
    setQuickReviewedSet(new Set());
    setQuickResults(new Map());
    setCardKey(k => k + 1);
  }

  function handleQuickSelectCard(idx: number) {
    setQuickIdx(idx);
    setCardKey(k => k + 1);
  }

  // ─── Sign-in state ────────────────────────────────────────────────────────

  if (!isSignedIn) {
    return (
      <CenteredMessage>
        <div className="max-w-lg mx-auto mt-24 text-center space-y-4">
          <Brain size={32} className="text-slate-500 mx-auto" />
          <h2 className="text-[18px] font-bold text-slate-900" style={SG}>Sign in to review</h2>
          <p className="text-[13px] text-slate-600">
            Spaced repetition review requires an account to track your progress.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-slate-200 text-slate-800"
            nativeButton={false}
            render={<Link href="/sign-in?next=/review" />}
          >
            Sign in
          </Button>
        </div>
      </CenteredMessage>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isPro && srLoading) {
    return (
      <CenteredMessage>
        <div className="flex items-center justify-center mt-32">
          <div className="animate-pulse text-[13px] text-slate-500">Loading review cards...</div>
        </div>
      </CenteredMessage>
    );
  }

  // ─── SR mode: 3-column layout with spaced repetition cards ────────────────

  if (mode === 'sr' && isPro) {
    const card = srCards[srCurrentIdx];
    const meta = card ? CARD_TYPE_META[card.cardType] : null;
    const Icon = meta?.icon ?? Brain;

    return (
      <AppShell
        activeTab="Review"
        sidebar={
          <ReviewSidebar
            cards={srCards}
            currentIdx={srCurrentIdx}
            reviewedSet={srReviewedSet}
            onSelectCard={(idx) => { setSrCurrentIdx(idx); setSrRevealed(false); }}
          />
        }
        rail={
          <ReviewRightRail
            card={card}
            cards={srCards}
            reviewedCount={srReviewed}
            totalDue={totalDue}
            forgotCount={srForgot}
            gotItCount={srGotIt}
          />
        }
      >
        <PageHeader
          eyebrow="Review"
          title="Spaced Repetition"
          subtitle={
            srCards.length > 0
              ? `Card ${srCurrentIdx + 1} of ${srCards.length} due now.`
              : 'No cards due right now.'
          }
        />
        <MainSurface className="px-6 py-6 sm:px-8 sm:py-8">
              {card && meta ? (
                <>
                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[12px] text-slate-500 font-medium tabular-nums">
                      {srCurrentIdx + 1} of {srCards.length}
                    </span>
                    <div className="flex-1 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((srCurrentIdx + 1) / srCards.length) * 100}%` }}
                      />
                    </div>
                    {srReviewed > 0 && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {srReviewed} reviewed
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
                            reviewed {card.reviewCount}x
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-slate-600 hover:text-slate-600 transition-colors p-1"
                        title="Dismiss this card"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Problem title */}
                    <div className="px-5 pt-4 pb-2">
                      <h2 className="text-[16px] font-bold text-slate-900" style={SG}>
                        {card.problemTitle}
                      </h2>
                      {card.pattern && (
                        <span className="text-[11px] text-slate-500 font-medium">{card.pattern}</span>
                      )}
                    </div>

                    {/* Card content */}
                    <div className="px-5 pb-5">
                      {!srRevealed ? (
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
                      {!srRevealed ? (
                        <Button
                          onClick={() => setSrRevealed(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-6"
                        >
                          <Eye size={14} className="mr-2" />
                          Reveal Answer
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleSrResult('forgot')}
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-[13px] font-semibold px-5"
                          >
                            <RotateCcw size={14} className="mr-2" />
                            Forgot
                          </Button>
                          <Button
                            onClick={() => handleSrResult('got_it')}
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
        </MainSurface>
      </AppShell>
    );
  }

  // ─── Quick Review mode (no SR cards due, or not Pro) ──────────────────────

  const quickCard = currentBatch[quickIdx];
  const quickMeta = quickCard ? QUICK_TYPE_META[quickCard.type] : null;
  const QuickIcon = quickMeta?.icon ?? Brain;
  const isCurrentAnswered = quickReviewedSet.has(quickIdx);

  return (
    <>
    <AppShell
      activeTab="Review"
      sidebar={
        <QuickReviewSidebar
          cards={currentBatch}
          currentIdx={quickIdx}
          reviewedSet={quickReviewedSet}
          results={quickResults}
          onSelectCard={handleQuickSelectCard}
          srDueCount={totalDue}
          mode="quick"
          isPro={isPro}
        />
      }
      rail={
        <QuickReviewRightRail
          reviewedCount={quickReviewedSet.size}
          totalCards={currentBatch.length}
          correctCount={Array.from(quickResults.values()).filter(r => r === 'correct').length}
          isPro={isPro}
          srDueCount={totalDue}
          srReviewed={srReviewed}
        />
      }
    >
          {/* Session complete banner */}
          {isPro && srReviewed > 0 && srCards.length === 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-[13px] text-slate-900 font-semibold" style={SG}>All caught up</p>
                <p className="text-[12px] text-slate-600">
                  You reviewed {srReviewed} spaced repetition card{srReviewed === 1 ? '' : 's'} this session. Keep sharp with the fundamentals below.
                </p>
              </div>
            </div>
          )}

          {/* Quick Review heading */}
          <PageHeader
            eyebrow={`Round ${currentBatchNum} of ${totalBatches}`}
            title="Quick Review"
            subtitle={`${BATCH_SIZE} questions per round. Answer them all to unlock the next round.`}
          />

          <MainSurface className="px-6 py-6 sm:px-8 sm:py-8">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[12px] text-slate-500 font-medium tabular-nums">
              {quickIdx + 1} / {currentBatch.length}
            </span>
            <div className="flex-1 h-[3px] rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((quickIdx + 1) / currentBatch.length) * 100}%` }}
              />
            </div>
            {quickReviewedSet.size > 0 && (() => {
              const correct = Array.from(quickResults.values()).filter(r => r === 'correct').length;
              return (
                <span className="text-[11px] text-slate-600 font-medium tabular-nums">
                  {correct}/{quickReviewedSet.size} correct
                </span>
              );
            })()}
          </div>

          {/* Free-tier lock panel */}
          {freeLimitReached ? (
            <div
              className="rounded-xl border overflow-hidden px-8 py-12 text-center"
              style={{ background: C.cardBg, borderColor: C.border }}
            >
              <div
                className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <Lock size={18} className="text-blue-400" />
              </div>
              <h2 className="text-[20px] font-bold text-slate-900 mb-2" style={SG}>
                Free limit reached
              </h2>
              <p className="text-[13px] text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                You&apos;ve used all {FREE_LIMIT} free Quick Review questions. Upgrade to Pro for unlimited practice and personalized spaced repetition from the problems you solve.
              </p>
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold px-6 h-10"
              >
                Upgrade to Pro
                <ArrowRight size={15} className="ml-2" />
              </Button>
            </div>
          ) : quickCard && quickMeta ? (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: C.cardBg, borderColor: C.border }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-6 py-3.5 border-b"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                    style={{ background: `${quickMeta.color}15`, color: quickMeta.color }}
                  >
                    <QuickIcon size={12} />
                    {quickMeta.label}
                  </div>
                </div>
                {isCurrentAnswered && (
                  <span className={cn(
                    'text-[11px] font-semibold',
                    quickResults.get(quickIdx) === 'correct' ? 'text-emerald-400' : 'text-red-400',
                  )}>
                    {quickResults.get(quickIdx) === 'correct' ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              {/* Card title */}
              <div className="px-6 pt-5 pb-1">
                <h2 className="text-[18px] font-bold text-slate-900" style={SG}>
                  {quickCard.title}
                </h2>
              </div>

              {/* Card content -- interactive */}
              <div className="px-6 pb-6 pt-3">
                {quickCard.interaction === 'mcq' && (
                  <MCQCard key={cardKey} card={quickCard} onAnswer={handleQuickAnswer} />
                )}
                {quickCard.interaction === 'type_answer' && (
                  <TypeAnswerCard key={cardKey} card={quickCard} onAnswer={handleQuickAnswer} />
                )}
              </div>

              {/* Next button -- only after answering */}
              {isCurrentAnswered && quickIdx < currentBatch.length - 1 && (
                <div
                  className="flex items-center justify-center px-4 sm:px-6 py-4 border-t"
                  style={{ borderColor: C.border }}
                >
                  <Button
                    onClick={handleQuickNext}
                    className="w-full sm:w-auto h-12 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white text-[15px] sm:text-[14px] font-semibold px-8 shadow-lg shadow-blue-600/20"
                  >
                    Next Question
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}

              {/* Batch completion state */}
              {isCurrentAnswered && quickIdx === currentBatch.length - 1 && (
                <div
                  className="flex flex-col items-center justify-center px-6 py-6 border-t gap-3"
                  style={{ borderColor: C.border }}
                >
                  <p className="text-[15px] font-semibold text-slate-900" style={SG}>
                    Round {currentBatchNum} complete
                  </p>
                  <p className="text-[13px] text-slate-600">
                    {Array.from(quickResults.values()).filter(r => r === 'correct').length} / {currentBatch.length} correct this round.
                    {cumulativeTotal > 0 && (
                      <> Session total: {cumulativeCorrect + Array.from(quickResults.values()).filter(r => r === 'correct').length} / {cumulativeTotal + quickReviewedSet.size} correct.</>
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {hasMoreBatches && isPro && (
                      <Button
                        onClick={handleNextBatch}
                        className="w-full sm:w-auto h-12 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white text-[15px] sm:text-[14px] font-semibold px-6 shadow-lg shadow-blue-600/20"
                      >
                        Next {Math.min(BATCH_SIZE, shuffledAllCards.length - batchStart - BATCH_SIZE)} questions
                        <ArrowRight size={15} className="ml-2" />
                      </Button>
                    )}
                    {hasMoreBatches && !isPro && (
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full sm:w-auto h-12 sm:h-10 bg-blue-600 hover:bg-blue-500 text-white text-[15px] sm:text-[14px] font-semibold px-6 shadow-lg shadow-blue-600/20"
                      >
                        <Lock size={13} className="mr-2" />
                        Unlock more with Pro
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setBatchStart(0);
                        setQuickIdx(0);
                        setQuickReviewedSet(new Set());
                        setQuickResults(new Map());
                        setCumulativeCorrect(0);
                        setCumulativeTotal(0);
                        setCardKey(k => k + 1);
                        autoOpenedUpgradeRef.current = false;
                      }}
                      variant="outline"
                      className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-100 text-[13px]"
                    >
                      <RotateCcw size={13} className="mr-2" />
                      Start Over
                    </Button>
                  </div>
                  {!hasMoreBatches && (
                    <p className="text-[12px] text-slate-500">
                      You&apos;ve completed all {shuffledAllCards.length} questions. Start over to review again.
                    </p>
                  )}
                  {hasMoreBatches && !isPro && (
                    <p className="text-[12px] text-slate-500 text-center max-w-sm">
                      Free plan covers the first {BATCH_SIZE} questions. Go Pro for unlimited review.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}
          </MainSurface>
    </AppShell>
    <ProUpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}
