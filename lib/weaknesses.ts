// ─── Weakness detection — server only ────────────────────────────────────────
//
// Computes a "struggle score" per pattern from the user's submission history,
// then recommends unsolved problems from the weakest pattern.
// No new tables — reads problem_submissions + problems at query time.

import { getSupabase, getSupabaseUser } from '@/lib/supabase';

export interface RecommendedProblem {
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface WeaknessSpotlight {
  pattern: string;
  failRate: number;
  failCount: number;
  totalAttempts: number;
  recommendedProblems: RecommendedProblem[];
}

interface SubmissionRow {
  problem_slug: string;
  status: string;
  created_at: string;
}

interface ProblemRow {
  slug: string;
  title: string;
  difficulty: string;
  pattern: string;
}

/**
 * Compute the user's weakest pattern and recommend unsolved problems.
 * Returns null if there isn't enough data (< 5 submissions or < 2 failures).
 */
export async function getWeaknessSpotlight(): Promise<WeaknessSpotlight | null> {
  const [user, supabase] = [await getSupabaseUser(), getSupabase()];
  if (!user || !supabase) return null;

  // 1. Fetch all submissions for this user
  const { data: submissions, error: subErr } = await supabase
    .from('problem_submissions')
    .select('problem_slug, status, created_at')
    .eq('user_id', user.id);

  if (subErr || !submissions || submissions.length < 5) return null;
  const rows = submissions as SubmissionRow[];

  // 2. Fetch problem metadata (slug → pattern, title, difficulty)
  const slugs = [...new Set(rows.map(r => r.problem_slug))];
  const { data: problems, error: probErr } = await supabase
    .from('problems')
    .select('slug, title, difficulty, pattern')
    .eq('is_published', true)
    .in('slug', slugs);

  if (probErr || !problems) return null;
  const problemMap = new Map<string, ProblemRow>();
  for (const p of problems as ProblemRow[]) {
    problemMap.set(p.slug, p);
  }

  // 3. Build accepted set (slugs the user has already solved)
  const acceptedSlugs = new Set<string>();
  for (const r of rows) {
    if (r.status === 'accepted') acceptedSlugs.add(r.problem_slug);
  }

  // 4. Group submissions by pattern and compute struggle scores
  const now = Date.now();
  const patternStats = new Map<string, {
    failCount: number;
    totalCount: number;
    recencySum: number;
    failRecencyCount: number;
  }>();

  for (const r of rows) {
    const prob = problemMap.get(r.problem_slug);
    if (!prob) continue;
    const pattern = prob.pattern;

    let stats = patternStats.get(pattern);
    if (!stats) {
      stats = { failCount: 0, totalCount: 0, recencySum: 0, failRecencyCount: 0 };
      patternStats.set(pattern, stats);
    }

    stats.totalCount++;
    const isFail = r.status === 'wrong' || r.status === 'error';
    if (isFail) {
      stats.failCount++;
      const daysSince = (now - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
      stats.recencySum += 1 / (daysSince + 1);
      stats.failRecencyCount++;
    }
  }

  // 5. Score each pattern
  let bestPattern: string | null = null;
  let bestScore = -1;

  for (const [pattern, stats] of patternStats) {
    if (stats.failCount < 2) continue; // Need at least 2 failures for confidence
    const failRate = stats.failCount / stats.totalCount;
    const volume = Math.log(stats.totalCount + 1);
    const recencyBoost = stats.failRecencyCount > 0
      ? stats.recencySum / stats.failRecencyCount
      : 0;
    const score = failRate * volume * recencyBoost;
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  if (!bestPattern) return null;

  const bestStats = patternStats.get(bestPattern)!;

  // 6. Find unsolved problems in this pattern for recommendations
  const { data: recProblems } = await supabase
    .from('problems')
    .select('slug, title, difficulty')
    .eq('is_published', true)
    .eq('pattern', bestPattern)
    .limit(20);

  const recommended: RecommendedProblem[] = [];
  if (recProblems) {
    for (const p of recProblems as ProblemRow[]) {
      if (!acceptedSlugs.has(p.slug)) {
        recommended.push({
          slug: p.slug,
          title: p.title,
          difficulty: p.difficulty as 'Easy' | 'Medium' | 'Hard',
        });
        if (recommended.length >= 3) break;
      }
    }
  }

  // If every problem in this pattern is already solved, skip
  if (recommended.length === 0) return null;

  return {
    pattern: bestPattern,
    failRate: bestStats.failCount / bestStats.totalCount,
    failCount: bestStats.failCount,
    totalAttempts: bestStats.totalCount,
    recommendedProblems: recommended,
  };
}
