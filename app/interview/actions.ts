'use server';

import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/subscription';
import { getPublishedSlugs, getUserSolvedSlugs } from '@/lib/problems-server';
import { checkVoiceQuota, type VoiceQuotaResult } from '@/lib/voice-quota';
import {
  pickInterviewProblems,
  dbRowToInterviewSession,
  type InterviewDifficulty,
  type InterviewSession,
  type InterviewFeedback,
} from '@/lib/interview';

// ─── Voice quota (for the counter UI) ─────────────────────────────────────────

export async function getVoiceQuota(): Promise<VoiceQuotaResult> {
  const user = await getSupabaseUser();
  if (!user) return { allowed: false, used: 0, limit: 0, isPro: false, reason: 'no_db' };
  return checkVoiceQuota(user.id);
}

// ─── Read history ────────────────────────────────────────────────────────────

export async function getInterviewHistory(): Promise<InterviewSession[]> {
  const db = getSupabase();
  if (!db) return [];
  const user = await getSupabaseUser();
  if (!user) return [];

  const { data, error } = await db
    .from('mock_interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map(dbRowToInterviewSession);
}

// ─── Start a new session ─────────────────────────────────────────────────────

export async function startInterviewSession(
  difficulty: InterviewDifficulty,
): Promise<{ session: InterviewSession; error?: never } | { session?: never; error: string }> {
  const db = getSupabase();
  if (!db) return { error: 'Database unavailable' };
  const user = await getSupabaseUser();
  if (!user) return { error: 'Not authenticated' };

  // Non-pro users get one free mock so they know what they're paying for.
  const { isPro } = await getUserSubscription(user.id);
  if (!isPro) {
    const { count } = await db
      .from('mock_interviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if ((count ?? 0) >= 1) return { error: 'Pro subscription required' };
  }

  // Gather context for problem selection
  const [publishedSlugs, solvedSlugs, recentHistory] = await Promise.all([
    getPublishedSlugs(),
    getUserSolvedSlugs(user.id),
    db
      .from('mock_interviews')
      .select('problem1_slug, problem2_slug')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(r => r.data ?? []),
  ]);

  const recentSlugs = recentHistory.flatMap((r: Record<string, unknown>) => [
    r.problem1_slug as string,
    r.problem2_slug as string,
  ]);

  const [p1, p2] = pickInterviewProblems(difficulty, solvedSlugs, recentSlugs, publishedSlugs);

  const { data, error } = await db
    .from('mock_interviews')
    .insert({
      user_id: user.id,
      difficulty,
      problem1_slug: p1.slug,
      problem2_slug: p2.slug,
    })
    .select('*')
    .single();

  if (error || !data) return { error: 'Failed to create interview session' };
  return { session: dbRowToInterviewSession(data) };
}

// ─── Submit interview ────────────────────────────────────────────────────────

export interface SubmitInterviewArgs {
  sessionId: string;
  problem1Code: string;
  problem2Code: string;
  problem1Results: { passed: number; total: number } | null;
  problem2Results: { passed: number; total: number } | null;
  timeUsedMs: number;
}

export async function submitInterview(
  args: SubmitInterviewArgs,
): Promise<{ session: InterviewSession; error?: never } | { session?: never; error: string }> {
  const db = getSupabase();
  if (!db) return { error: 'Database unavailable' };
  const user = await getSupabaseUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await db
    .from('mock_interviews')
    .update({
      problem1_code: args.problem1Code,
      problem2_code: args.problem2Code,
      problem1_results: args.problem1Results,
      problem2_results: args.problem2Results,
      time_used_ms: args.timeUsedMs,
      completed_at: new Date().toISOString(),
      status: 'completed',
    })
    .eq('id', args.sessionId)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error || !data) return { error: 'Failed to submit interview' };
  return { session: dbRowToInterviewSession(data) };
}

// ─── Save AI feedback ────────────────────────────────────────────────────────

export async function saveInterviewFeedback(
  sessionId: string,
  feedback: InterviewFeedback,
): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  const user = await getSupabaseUser();
  if (!user) return;

  await db
    .from('mock_interviews')
    .update({
      feedback,
      overall_score: feedback.overallScore,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id);
}

// ─── Check pro status ────────────────────────────────────────────────────────

export async function checkInterviewAccess(): Promise<{ isPro: boolean; freeUsed: boolean }> {
  const user = await getSupabaseUser();
  if (!user) return { isPro: false, freeUsed: false };
  const { isPro } = await getUserSubscription(user.id);
  if (isPro) return { isPro: true, freeUsed: false };

  const db = getSupabase();
  if (!db) return { isPro: false, freeUsed: false };
  // Only completed sessions count — mid-interview refreshes should resume, not lock.
  const { count } = await db
    .from('mock_interviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');
  return { isPro: false, freeUsed: (count ?? 0) >= 1 };
}
