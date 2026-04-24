// ─── Mock Interview helpers ──────────────────────────────────────────────────

import { LIBRARY, type ProblemDef, type Difficulty } from './library';

export type InterviewMode = 'silent' | 'voice';

export type InterviewDifficulty = 'easy-medium' | 'medium-hard';

export type InterviewStatus = 'in_progress' | 'completed' | 'abandoned';

export type InterviewReadiness =
  | 'not_ready'
  | 'needs_practice'
  | 'almost_ready'
  | 'interview_ready';

export type Correctness =
  | 'fully_correct'
  | 'partially_correct'
  | 'incorrect'
  | 'no_attempt';

export interface ProblemFeedback {
  slug: string;
  approachScore: number;
  codeQualityScore: number;
  correctness: Correctness;
  patternIdentified: boolean;
  strengths: string[];
  improvements: string[];
  optimalApproach: string;
}

export interface InterviewFeedback {
  overallScore: number;
  timeManagement: { score: number; commentary: string };
  problems: ProblemFeedback[];
  overallStrengths: string[];
  overallImprovements: string[];
  interviewReadiness: InterviewReadiness;
  tip: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  problem1Slug: string;
  // Voice mock interviews only use problem1; silent mocks use both. Null on
  // voice rows means "single-problem voice session".
  problem2Slug: string | null;
  problem1Code: string | null;
  problem2Code: string | null;
  problem1Results: { passed: number; total: number } | null;
  problem2Results: { passed: number; total: number } | null;
  startedAt: string;
  completedAt: string | null;
  timeUsedMs: number | null;
  feedback: InterviewFeedback | null;
  overallScore: number | null;
  createdAt: string;
}

// ─── Problem selection ───────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick two problems for a mock interview.
 *
 * - `easy-medium`: 1 Easy + 1 Medium
 * - `medium-hard`: 1 Medium + 1 Hard
 *
 * Avoids problems from the last 5 interviews and prefers unsolved problems.
 * Tries to pick from different categories for breadth.
 */
export function pickInterviewProblems(
  difficulty: InterviewDifficulty,
  solvedSlugs: Set<string>,
  recentInterviewSlugs: string[],
  publishedSlugs: Set<string>,
): [ProblemDef, ProblemDef] {
  // Flatten & deduplicate by slug, filtered to published only
  const seen = new Set<string>();
  const all: (ProblemDef & { categoryId: string })[] = [];
  for (const cat of LIBRARY) {
    for (const p of cat.problems) {
      if (!seen.has(p.slug) && publishedSlugs.has(p.slug)) {
        seen.add(p.slug);
        all.push({ ...p, categoryId: cat.id });
      }
    }
  }

  const recentSet = new Set(recentInterviewSlugs);

  const pools: Record<Difficulty, (ProblemDef & { categoryId: string })[]> = {
    Easy: [],
    Medium: [],
    Hard: [],
  };
  for (const p of all) {
    pools[p.difficulty].push(p);
  }

  const [diff1, diff2]: [Difficulty, Difficulty] =
    difficulty === 'easy-medium' ? ['Easy', 'Medium'] : ['Medium', 'Hard'];

  function pickOne(
    pool: (ProblemDef & { categoryId: string })[],
    excludeSlugs: Set<string>,
    excludeCategory?: string,
  ): ProblemDef & { categoryId: string } {
    // Prefer: not recent, not solved, different category
    let candidates = pool.filter(
      p => !recentSet.has(p.slug) && !excludeSlugs.has(p.slug),
    );
    if (excludeCategory) {
      const diffCat = candidates.filter(p => p.categoryId !== excludeCategory);
      if (diffCat.length > 0) candidates = diffCat;
    }
    // Prefer unsolved
    const unsolved = candidates.filter(p => !solvedSlugs.has(p.slug));
    if (unsolved.length > 0) candidates = unsolved;
    // Fallback: allow recent if needed
    if (candidates.length === 0) {
      candidates = pool.filter(p => !excludeSlugs.has(p.slug));
    }
    if (candidates.length === 0) {
      candidates = pool;
    }
    return shuffle(candidates)[0];
  }

  const p1 = pickOne(pools[diff1], new Set());
  const p2 = pickOne(pools[diff2], new Set([p1.slug]), p1.categoryId);

  return [p1, p2];
}

/**
 * Pick ONE problem for a voice mock (1-problem format).
 *
 * Voice mocks are always a single problem at the HARDER tier of the picker:
 *   - easy-medium → Medium
 *   - medium-hard → Hard
 *
 * This keeps the existing difficulty selector meaningful (harder label = harder
 * problem) without the 2-problem pacing. Avoids recent + solved; falls back to
 * any problem if the preferred pool is exhausted.
 */
export function pickVoiceInterviewProblem(
  difficulty: InterviewDifficulty,
  solvedSlugs: Set<string>,
  recentInterviewSlugs: string[],
  publishedSlugs: Set<string>,
): ProblemDef {
  const seen = new Set<string>();
  const all: (ProblemDef & { categoryId: string })[] = [];
  for (const cat of LIBRARY) {
    for (const p of cat.problems) {
      if (!seen.has(p.slug) && publishedSlugs.has(p.slug)) {
        seen.add(p.slug);
        all.push({ ...p, categoryId: cat.id });
      }
    }
  }

  const target: Difficulty = difficulty === 'easy-medium' ? 'Medium' : 'Hard';
  const pool = all.filter(p => p.difficulty === target);
  const recentSet = new Set(recentInterviewSlugs);

  // Prefer not-recent AND not-solved.
  let candidates = pool.filter(p => !recentSet.has(p.slug) && !solvedSlugs.has(p.slug));
  if (candidates.length === 0) candidates = pool.filter(p => !recentSet.has(p.slug));
  if (candidates.length === 0) candidates = pool;
  if (candidates.length === 0) candidates = all; // last-resort: any published problem

  return shuffle(candidates)[0];
}

// ─── Supabase row conversion ─────────────────────────────────────────────────

export function dbRowToInterviewSession(row: Record<string, unknown>): InterviewSession {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    difficulty: row.difficulty as InterviewDifficulty,
    status: row.status as InterviewStatus,
    problem1Slug: row.problem1_slug as string,
    problem2Slug: (row.problem2_slug as string | null) ?? null,
    problem1Code: (row.problem1_code as string) ?? null,
    problem2Code: (row.problem2_code as string) ?? null,
    problem1Results: (row.problem1_results as { passed: number; total: number }) ?? null,
    problem2Results: (row.problem2_results as { passed: number; total: number }) ?? null,
    startedAt: row.started_at as string,
    completedAt: (row.completed_at as string) ?? null,
    timeUsedMs: (row.time_used_ms as number) ?? null,
    feedback: (row.feedback as InterviewFeedback) ?? null,
    overallScore: (row.overall_score as number) ?? null,
    createdAt: row.created_at as string,
  };
}

export const INTERVIEW_DURATION_MS = 45 * 60 * 1000;
