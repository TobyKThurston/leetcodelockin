// ─── Problems barrel ─────────────────────────────────────────────────────────
//
// Concatenates every per-category `ProblemContent[]` array into a single
// `ALL_PROBLEMS` export consumed by `scripts/seed-problems.ts` and
// `scripts/verify-problems.ts`.
//
// A handful of slugs appear in multiple NeetCode-150 categories by design
// (e.g. top-k-frequent-elements in arrays-hashing AND heap-priority-queue).
// We dedupe by slug so each row is only seeded once — first occurrence wins,
// which places each shared problem in its "primary" category file.

import type { ProblemContent } from '../../lib/problem-types';

import { ARRAYS_HASHING_PROBLEMS } from './arrays-hashing';
import { TWO_POINTERS_PROBLEMS } from './two-pointers';
import { SLIDING_WINDOW_PROBLEMS } from './sliding-window';
import { STACK_PROBLEMS } from './stack';
import { BINARY_SEARCH_PROBLEMS } from './binary-search';
import { LINKED_LIST_PROBLEMS } from './linked-list';
import { TREES_PROBLEMS } from './trees';
import { TRIES_PROBLEMS } from './tries';
import { HEAP_PRIORITY_QUEUE_PROBLEMS } from './heap-priority-queue';
import { BACKTRACKING_PROBLEMS } from './backtracking';
import { GRAPHS_PROBLEMS } from './graphs';
import { ADVANCED_GRAPHS_PROBLEMS } from './advanced-graphs';
import { DP_1D_PROBLEMS } from './dp-1d';
import { DP_2D_PROBLEMS } from './dp-2d';
import { GREEDY_PROBLEMS } from './greedy';
import { INTERVALS_PROBLEMS } from './intervals';
import { MATH_GEOMETRY_PROBLEMS } from './math-geometry';
import { BIT_MANIPULATION_PROBLEMS } from './bit-manipulation';

const CATEGORY_GROUPS: { id: string; problems: ProblemContent[] }[] = [
  { id: 'arrays-hashing',      problems: ARRAYS_HASHING_PROBLEMS },
  { id: 'two-pointers',        problems: TWO_POINTERS_PROBLEMS },
  { id: 'sliding-window',      problems: SLIDING_WINDOW_PROBLEMS },
  { id: 'stack',               problems: STACK_PROBLEMS },
  { id: 'binary-search',       problems: BINARY_SEARCH_PROBLEMS },
  { id: 'linked-list',         problems: LINKED_LIST_PROBLEMS },
  { id: 'trees',               problems: TREES_PROBLEMS },
  { id: 'tries',               problems: TRIES_PROBLEMS },
  { id: 'heap-priority-queue', problems: HEAP_PRIORITY_QUEUE_PROBLEMS },
  { id: 'backtracking',        problems: BACKTRACKING_PROBLEMS },
  { id: 'graphs',              problems: GRAPHS_PROBLEMS },
  { id: 'advanced-graphs',     problems: ADVANCED_GRAPHS_PROBLEMS },
  { id: 'dp-1d',               problems: DP_1D_PROBLEMS },
  { id: 'dp-2d',               problems: DP_2D_PROBLEMS },
  { id: 'greedy',              problems: GREEDY_PROBLEMS },
  { id: 'intervals',           problems: INTERVALS_PROBLEMS },
  { id: 'math-geometry',       problems: MATH_GEOMETRY_PROBLEMS },
  { id: 'bit-manipulation',    problems: BIT_MANIPULATION_PROBLEMS },
];

function dedupeBySlug(problems: ProblemContent[]): ProblemContent[] {
  const seen = new Set<string>();
  const out: ProblemContent[] = [];
  for (const p of problems) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
  }
  return out;
}

/** Flat list of every authored problem, deduped by slug. */
export const ALL_PROBLEMS: ProblemContent[] = dedupeBySlug(
  CATEGORY_GROUPS.flatMap(g => g.problems),
);

/** Filter helper used by scripts/verify-problems.ts for --category flag. */
export function problemsByCategory(categoryId: string): ProblemContent[] {
  const group = CATEGORY_GROUPS.find(g => g.id === categoryId);
  return group ? dedupeBySlug(group.problems) : [];
}

export { CATEGORY_GROUPS };
