'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { X, Eye, Check, RotateCcw, Brain, Code2, Timer, Zap, CheckCircle2, BookOpen, Lock, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
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

// ─── Quick Review fundamentals (always available) ───────────────────────────

type QuickCardType = 'big_o' | 'pattern' | 'code_reading';

const QUICK_TYPE_META = {
  big_o:        { icon: Timer,        label: 'Big-O',        color: C.amber },
  pattern:      { icon: Brain,        label: 'Pattern',      color: C.emerald },
  code_reading: { icon: Code2,        label: 'Code Reading', color: C.blue },
} as const;

interface QuickCard {
  id: string;
  type: QuickCardType;
  title: string;
  question: string;
  answer: string;
  code?: string;
}

const QUICK_CARDS: QuickCard[] = [
  {
    id: 'qr-bigo-1',
    type: 'big_o',
    title: 'Array Operations',
    question: 'What is the time complexity of:\n• Accessing an element by index\n• Searching for an element (unsorted)\n• Inserting at the end\n• Inserting at the beginning',
    answer: '• Access by index: O(1)\n• Search (unsorted): O(n)\n• Insert at end: O(1) amortized\n• Insert at beginning: O(n) — must shift all elements',
  },
  {
    id: 'qr-bigo-2',
    type: 'big_o',
    title: 'Hash Map Operations',
    question: 'What is the average and worst-case time complexity for:\n• Insert\n• Lookup\n• Delete\n\nWhen does worst case happen?',
    answer: '• Insert: O(1) average, O(n) worst\n• Lookup: O(1) average, O(n) worst\n• Delete: O(1) average, O(n) worst\n\nWorst case happens with hash collisions — all keys map to the same bucket, degenerating into a linked list.',
  },
  {
    id: 'qr-bigo-3',
    type: 'big_o',
    title: 'Sorting Complexity',
    question: 'What is the time and space complexity of these sorting algorithms?\n• Merge Sort\n• Quick Sort\n• Heap Sort\n• Python\'s built-in sort (Timsort)',
    answer: '• Merge Sort: O(n log n) time, O(n) space\n• Quick Sort: O(n log n) avg, O(n²) worst, O(log n) space\n• Heap Sort: O(n log n) time, O(1) space\n• Timsort: O(n log n) time, O(n) space — hybrid of merge + insertion sort, optimized for real-world data',
  },
  {
    id: 'qr-bigo-4',
    type: 'big_o',
    title: 'Binary Search Tree',
    question: 'What is the time complexity for search, insert, and delete in:\n• A balanced BST\n• A skewed (unbalanced) BST\n\nWhat about a heap — can you search in O(log n)?',
    answer: '• Balanced BST: O(log n) for all three\n• Skewed BST: O(n) — degenerates into a linked list\n\nA heap does NOT support O(log n) search — only O(n). Heaps are optimized for min/max extraction, not arbitrary search.',
  },
  {
    id: 'qr-pattern-1',
    type: 'pattern',
    title: 'Two Pointers',
    question: 'When should you use the Two Pointers pattern?\n\nGive two classic problem types that use it.',
    answer: 'Use Two Pointers when you have a sorted array (or linked list) and need to find pairs or subarrays meeting a condition.\n\nClassic examples:\n1. Two Sum II (sorted array) — one pointer at start, one at end, move inward\n2. Remove Duplicates — slow pointer for write position, fast pointer to scan',
  },
  {
    id: 'qr-pattern-2',
    type: 'pattern',
    title: 'Sliding Window',
    question: 'What defines a Sliding Window problem? How do you decide between a fixed-size vs. variable-size window?',
    answer: 'Sliding Window problems ask about contiguous subarrays/substrings with some constraint (max sum, unique chars, etc.).\n\n• Fixed-size: "Find max sum of k consecutive elements" — window size is given\n• Variable-size: "Smallest subarray with sum ≥ target" — expand right to satisfy, shrink left to minimize\n\nKey insight: instead of recalculating from scratch, slide the window by adding/removing one element at a time → O(n).',
  },
  {
    id: 'qr-pattern-3',
    type: 'pattern',
    title: 'BFS vs DFS',
    question: 'When would you choose BFS over DFS (and vice versa)? What data structure does each use?',
    answer: 'BFS (queue): Best for shortest path in unweighted graphs, level-order traversal. Explores neighbors first.\n\nDFS (stack/recursion): Best for exploring all paths, detecting cycles, topological sort, backtracking. Uses less memory on wide graphs.\n\nRule of thumb: BFS for "shortest/minimum steps", DFS for "all possibilities/paths".',
  },
  {
    id: 'qr-pattern-4',
    type: 'pattern',
    title: 'Dynamic Programming',
    question: 'What two properties must a problem have for DP to apply? What\'s the difference between top-down and bottom-up?',
    answer: '1. Optimal substructure — optimal solution builds on optimal sub-solutions\n2. Overlapping subproblems — same subproblems are solved repeatedly\n\nTop-down (memoization): recursive + cache. Write the natural recursion, add a memo dict.\nBottom-up (tabulation): iterative, fill a table from base cases up. Usually more space-efficient.\n\nStart with top-down (easier to think about), convert to bottom-up if needed for performance.',
  },
  {
    id: 'qr-code-1',
    type: 'code_reading',
    title: 'What does this code do?',
    question: 'Read the code and determine what it returns for nums = [2, 7, 11, 15] and target = 9.',
    code: 'def solve(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        comp = target - n\n        if comp in seen:\n            return [seen[comp], i]\n        seen[n] = i\n    return []',
    answer: 'This is the classic Two Sum solution using a hash map.\n\nWalkthrough with [2, 7, 11, 15], target=9:\n• i=0, n=2: comp=7, not in seen → seen={2:0}\n• i=1, n=7: comp=2, 2 IS in seen → return [0, 1]\n\nReturns [0, 1] — indices of 2 and 7 which sum to 9.\nTime: O(n), Space: O(n)',
  },
  {
    id: 'qr-code-2',
    type: 'code_reading',
    title: 'What does this code do?',
    question: 'What pattern does this implement? What does it return for s = "abcabcbb"?',
    code: 'def solve(s):\n    seen = set()\n    l = ans = 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        ans = max(ans, r - l + 1)\n    return ans',
    answer: 'This is the Sliding Window pattern — finds the length of the longest substring without repeating characters.\n\nFor "abcabcbb":\n• Window expands: "a", "ab", "abc"\n• \'a\' repeats → shrink from left: "bca", "bcab" → shrink: "cab", "cabc" → shrink: "abc"\n• Best window was length 3: "abc"\n\nReturns 3. Time: O(n), Space: O(min(n, alphabet))',
  },
  {
    id: 'qr-code-3',
    type: 'code_reading',
    title: 'What does this code do?',
    question: 'What is the time complexity? What does it return for [3, 2, 1, 5, 6, 4] and k = 2?',
    code: 'import heapq\n\ndef solve(nums, k):\n    heap = []\n    for n in nums:\n        heapq.heappush(heap, n)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return heap[0]',
    answer: 'This finds the kth largest element using a min-heap of size k.\n\nThe heap always keeps the k largest values seen so far. The smallest of those k (the root) is the kth largest overall.\n\nFor [3,2,1,5,6,4], k=2:\n• After all pushes/pops: heap = [5, 6]\n• heap[0] = 5 (2nd largest)\n\nReturns 5. Time: O(n log k), Space: O(k)',
  },
  {
    id: 'qr-bigo-5',
    type: 'big_o',
    title: 'Graph Algorithms',
    question: 'What is the time complexity of:\n• BFS / DFS on an adjacency list\n• Dijkstra\'s with a min-heap\n• Detecting a cycle in a directed graph',
    answer: '• BFS / DFS: O(V + E) — visit every vertex and edge once\n• Dijkstra\'s (min-heap): O((V + E) log V)\n• Cycle detection (DFS): O(V + E) — track visiting/visited states\n\nV = vertices, E = edges. Adjacency matrix would be O(V²) for BFS/DFS.',
  },
  {
    id: 'qr-pattern-5',
    type: 'pattern',
    title: 'Stack Problems',
    question: 'Name three common problem types that use a stack. What makes a problem a "stack problem"?',
    answer: 'Stack problems involve matching, nesting, or maintaining monotonic order:\n\n1. Valid Parentheses — match opening/closing brackets\n2. Monotonic Stack — next greater/smaller element, largest rectangle in histogram\n3. Expression Evaluation — parse infix/postfix expressions\n\nKey signal: you need to process items in LIFO order, or need to look back at "the most recent unresolved item".',
  },
];

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

// ─── Pro upgrade banner (inline, not a full-page takeover) ──────────────────

function ProGateBanner() {
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
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Lock size={18} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-white mb-1" style={SG}>
            Upgrade to Pro for Spaced Repetition
          </h3>
          <p className="text-[12.5px] text-slate-400 leading-relaxed mb-3">
            When you solve problems, Pro automatically generates personalized flashcards
            from your accepted solutions. Cards are scheduled using spaced repetition — you review
            them at increasing intervals to build long-term recall.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-white text-zinc-900 hover:bg-zinc-100 text-[12px] font-semibold h-7 px-3"
              onClick={() => handleUpgrade(monthlyPriceId)}
              disabled={loading || !monthlyPriceId}
            >
              {loading ? 'Loading...' : '$9/month'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-[12px] font-semibold h-7 px-3"
              onClick={() => handleUpgrade(yearlyPriceId)}
              disabled={loading || !yearlyPriceId}
            >
              $90/year (save $18)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Review card front / back ─────────────────────────────────────────

function QuickCardFront({ card }: { card: QuickCard }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-line">
        {card.question}
      </p>
      {card.code && (
        <pre
          className="rounded-lg p-4 text-[12px] leading-[1.6] overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.4)', fontFamily: MONO }}
        >
          {card.code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
              <span className="text-slate-300">{line || ' '}</span>
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}

function QuickCardBack({ card }: { card: QuickCard }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-line">
        {card.answer}
      </p>
    </div>
  );
}

// ─── Quick Review sidebar row ───────────────────────────────────────────────

function QuickSidebarRow({
  card, isActive, isReviewed, onClick,
}: {
  card: QuickCard;
  isActive: boolean;
  isReviewed: boolean;
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
          'text-[12.5px] font-semibold leading-tight tracking-[-0.005em] truncate',
          isActive && 'text-white',
          !isActive && isReviewed && 'text-slate-300',
          !isActive && !isReviewed && 'text-slate-200',
        )}
        style={SG}
      >
        {card.title}
      </p>
    </button>
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

// ─── Quick Review Left Sidebar ──────────────────────────────────────────────

function QuickReviewSidebar({
  cards, currentIdx, reviewedSet, onSelectCard, srDueCount, mode,
}: {
  cards: QuickCard[];
  currentIdx: number;
  reviewedSet: Set<number>;
  onSelectCard: (idx: number) => void;
  srDueCount: number;
  mode: 'quick' | 'sr';
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
            {mode === 'sr' ? 'Due for Review' : 'Quick Review'}
          </p>
          {cards.map((card, idx) => (
            <QuickSidebarRow
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
          {srDueCount > 0 && mode === 'quick' && (
            <div className="flex justify-between text-[11.5px]">
              <span className="text-slate-500">SR cards due</span>
              <span className="text-amber-400 font-medium tabular-nums">{srDueCount}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Quick Review Right Rail ────────────────────────────────────────────────

function QuickReviewRightRail({
  card, reviewedCount, totalCards, isPro, srDueCount, sessionMessage,
}: {
  card: QuickCard | undefined;
  reviewedCount: number;
  totalCards: number;
  isPro: boolean;
  srDueCount: number;
  sessionMessage: string | null;
}) {
  const remaining = totalCards - reviewedCount;

  const typeCounts = useMemo(() => {
    const counts = { big_o: 0, pattern: 0, code_reading: 0 };
    for (const c of QUICK_CARDS) counts[c.type]++;
    return counts;
  }, []);

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
                    const meta = QUICK_TYPE_META[card.type];
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
                </div>
                <p
                  className="text-[12.5px] font-semibold leading-tight text-white tracking-[-0.005em]"
                  style={SG}
                >
                  {card.title}
                </p>
              </div>
            </section>
          )}

          {/* Session Progress */}
          <section>
            <RailHeader>Session Progress</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-2 gap-3')}>
              <Metric value={String(reviewedCount)} label="reviewed" />
              <Metric value={String(remaining)} label="remaining" />
            </div>
          </section>

          {/* How Spaced Repetition Works */}
          <section>
            <RailHeader>How It Works</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2.5')}>
              <div className="flex items-start gap-2">
                <Sparkles size={12} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">Solve problems</span> — when your solution is accepted, AI generates personalized flashcards
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Brain size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">Spaced repetition</span> — cards appear at increasing intervals (1d → 2d → 4d → ...) so you review right before you forget
                </p>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap size={12} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">Quick Review</span> — fundamentals like Big-O and patterns are always available to sharpen your foundations
                </p>
              </div>
              {!isPro && (
                <div className="flex items-start gap-2 pt-1 border-t" style={{ borderColor: C.border }}>
                  <Zap size={12} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    Spaced repetition cards require <span className="font-semibold text-amber-300">Pro</span>
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Card Types breakdown */}
          <section>
            <RailHeader>Quick Review Topics</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              {(['big_o', 'pattern', 'code_reading'] as const).map(type => {
                const meta = QUICK_TYPE_META[type];
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

          {/* SR status */}
          {isPro && (
            <section>
              <RailHeader>Spaced Repetition</RailHeader>
              <div className={cn(RAIL_BOX, 'space-y-2')}>
                <MetricRow label="Cards due" value={String(srDueCount)} />
                {sessionMessage && (
                  <p className="text-[10.5px] text-slate-500 leading-relaxed pt-1">{sessionMessage}</p>
                )}
              </div>
            </section>
          )}

        </div>
      </ScrollArea>
    </aside>
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
  const [quickIdx, setQuickIdx] = useState(0);
  const [quickRevealed, setQuickRevealed] = useState(false);
  const [quickReviewedSet, setQuickReviewedSet] = useState<Set<number>>(new Set());

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

  function handleQuickNext() {
    setQuickReviewedSet(prev => new Set(prev).add(quickIdx));
    setQuickRevealed(false);
    if (quickIdx < QUICK_CARDS.length - 1) {
      setQuickIdx(i => i + 1);
    }
  }

  // ─── Sign-in state ────────────────────────────────────────────────────────

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
      <div className="min-h-screen text-slate-200" style={{ background: C.appBg }}>
        <AppNav activeTab="Review" />
        <ReviewSidebar
          cards={srCards}
          currentIdx={srCurrentIdx}
          reviewedSet={srReviewedSet}
          onSelectCard={(idx) => { setSrCurrentIdx(idx); setSrRevealed(false); }}
        />
        <ReviewRightRail
          card={card}
          cards={srCards}
          reviewedCount={srReviewed}
          totalDue={totalDue}
          forgotCount={srForgot}
          gotItCount={srGotIt}
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
                      {srCurrentIdx + 1} of {srCards.length}
                    </span>
                    <div className="flex-1 h-[3px] rounded-full bg-slate-800 overflow-hidden">
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Quick Review mode (no SR cards due, or not Pro) ──────────────────────

  const quickCard = QUICK_CARDS[quickIdx];
  const quickMeta = quickCard ? QUICK_TYPE_META[quickCard.type] : null;
  const QuickIcon = quickMeta?.icon ?? Brain;

  const sessionMessage = isPro
    ? (srReviewed > 0
      ? `You reviewed ${srReviewed} spaced repetition card${srReviewed === 1 ? '' : 's'} this session.`
      : 'No spaced repetition cards due right now. Solve problems to generate them!')
    : null;

  return (
    <div className="min-h-screen text-slate-200" style={{ background: C.appBg }}>
      <AppNav activeTab="Review" />
      <QuickReviewSidebar
        cards={QUICK_CARDS}
        currentIdx={quickIdx}
        reviewedSet={quickReviewedSet}
        onSelectCard={(idx) => { setQuickIdx(idx); setQuickRevealed(false); }}
        srDueCount={totalDue}
        mode="quick"
      />
      <QuickReviewRightRail
        card={quickCard}
        reviewedCount={quickReviewedSet.size}
        totalCards={QUICK_CARDS.length}
        isPro={isPro}
        srDueCount={totalDue}
        sessionMessage={sessionMessage}
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

            {/* Pro upgrade banner for non-pro users */}
            {!isPro && <ProGateBanner />}

            {/* Session complete banner */}
            {isPro && srReviewed > 0 && srCards.length === 0 && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 mb-6 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[13px] text-white font-semibold" style={SG}>All caught up!</p>
                  <p className="text-[12px] text-slate-400">
                    You reviewed {srReviewed} spaced repetition card{srReviewed === 1 ? '' : 's'} this session. Keep sharp with the fundamentals below.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Review heading */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-400" />
                <h1 className="text-[16px] font-bold text-white" style={SG}>Quick Review</h1>
              </div>
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500">
                Fundamentals &amp; Concepts
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[12px] text-slate-500 font-medium tabular-nums">
                {quickIdx + 1} of {QUICK_CARDS.length}
              </span>
              <div className="flex-1 h-[3px] rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((quickIdx + 1) / QUICK_CARDS.length) * 100}%` }}
                />
              </div>
              {quickReviewedSet.size > 0 && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {quickReviewedSet.size} reviewed
                </span>
              )}
            </div>

            {/* Quick card */}
            {quickCard && quickMeta ? (
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
                      style={{ background: `${quickMeta.color}15`, color: quickMeta.color }}
                    >
                      <QuickIcon size={12} />
                      {quickMeta.label}
                    </div>
                  </div>
                </div>

                {/* Card title */}
                <div className="px-5 pt-4 pb-2">
                  <h2 className="text-[16px] font-bold text-white" style={SG}>
                    {quickCard.title}
                  </h2>
                </div>

                {/* Card content */}
                <div className="px-5 pb-5">
                  {!quickRevealed ? (
                    <QuickCardFront card={quickCard} />
                  ) : (
                    <QuickCardBack card={quickCard} />
                  )}
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-center gap-3 px-5 py-4 border-t"
                  style={{ borderColor: C.border }}
                >
                  {!quickRevealed ? (
                    <Button
                      onClick={() => setQuickRevealed(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-6"
                    >
                      <Eye size={14} className="mr-2" />
                      Reveal Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={handleQuickNext}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold px-6"
                    >
                      {quickIdx < QUICK_CARDS.length - 1 ? (
                        <>
                          Next Card
                          <ArrowRight size={14} className="ml-2" />
                        </>
                      ) : (
                        <>
                          <Check size={14} className="mr-2" />
                          Done
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </main>
    </div>
  );
}
