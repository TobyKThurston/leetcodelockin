// ─── Server-only helpers for the problems table ──────────────────────────────
//
// Never import this file from a client component — it uses the service role
// Supabase client. Wrapping the dynamic /solve/[slug] route and the /api/submit
// handler.

import { getSupabase } from '@/lib/supabase';
import {
  dbRowToProblemContent,
  type ProblemContent,
  type ProblemRow,
  type ProblemTest,
  type SolutionApproach,
} from '@/lib/problem-types';
import { ALL_PROBLEMS } from '@/content/problems';

const SOLUTIONS_BY_SLUG: Map<string, SolutionApproach[]> = new Map(
  ALL_PROBLEMS
    .filter(p => p.solutions && p.solutions.length > 0)
    .map(p => [p.slug, p.solutions as SolutionApproach[]]),
);

export async function getProblemBySlug(slug: string): Promise<ProblemContent | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return null;
  const problem = dbRowToProblemContent(data as ProblemRow);
  const solutions = SOLUTIONS_BY_SLUG.get(slug);
  if (solutions) problem.solutions = solutions;
  return problem;
}

/**
 * Server-only fetch of hidden test cases for a problem. The returned array is
 * exposed to the client *only* through the auth-gated /api/hidden-tests/[slug]
 * route and never serialized into the /solve/[slug] SSR payload. Falls back to
 * an empty array if the column is missing or no hidden tests are defined.
 */
export async function getProblemHiddenTests(slug: string): Promise<ProblemTest[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('problems')
    .select('hidden_tests')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return [];
  const tests = (data as { hidden_tests?: ProblemTest[] }).hidden_tests;
  return Array.isArray(tests) ? tests : [];
}

export async function getPublishedSlugs(): Promise<Set<string>> {
  const supabase = getSupabase();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from('problems')
    .select('slug')
    .eq('is_published', true);

  if (error || !data) return new Set();
  return new Set(data.map(row => (row as { slug: string }).slug));
}

export async function getUserSolvedSlugs(userId: string): Promise<Set<string>> {
  const supabase = getSupabase();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from('problem_submissions')
    .select('problem_slug')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  if (error || !data) return new Set();
  return new Set(data.map(row => (row as { problem_slug: string }).problem_slug));
}

export interface SubmissionRecord {
  userId: string;
  problemSlug: string;
  code: string;
  language: string;
  status: 'accepted' | 'wrong' | 'error';
  passedCount: number;
  totalCount: number;
}

export async function recordSubmission(args: SubmissionRecord): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from('problem_submissions').insert({
    user_id:       args.userId,
    problem_slug:  args.problemSlug,
    code:          args.code,
    language:      args.language,
    status:        args.status,
    passed_count:  args.passedCount,
    total_count:   args.totalCount,
  });
}
