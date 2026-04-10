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
} from '@/lib/problem-types';

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
  return dbRowToProblemContent(data as ProblemRow);
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
