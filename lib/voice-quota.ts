// ─── Voice mock interview quota ──────────────────────────────────────────────
//
// Free tier: 1 voice mock ever (lifetime).
// Pro tier: 10 voice mocks per 30-day rolling window.
//
// Quota is consumed at /api/voice/start (one voice_usage row per start), NOT
// per turn. /api/voice/turn does not touch this module — a single session can
// make hundreds of per-turn calls without further quota deduction.

import { getSupabase } from './supabase';
import { getUserSubscription } from './subscription';

const PRO_MONTHLY_LIMIT = 10;
const FREE_LIFETIME_LIMIT = 1;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface VoiceQuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  isPro: boolean;
  reason?: 'pro_monthly' | 'free_lifetime' | 'no_db';
}

export async function checkVoiceQuota(userId: string): Promise<VoiceQuotaResult> {
  const sb = getSupabase();
  if (!sb) {
    return { allowed: false, used: 0, limit: 0, isPro: false, reason: 'no_db' };
  }

  const { isPro } = await getUserSubscription(userId);

  if (isPro) {
    const since = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
    const { count, error } = await sb
      .from('voice_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since);
    if (error) {
      console.error('checkVoiceQuota (pro) error:', error);
      return { allowed: true, used: 0, limit: PRO_MONTHLY_LIMIT, isPro: true };
    }
    const used = count ?? 0;
    return {
      allowed: used < PRO_MONTHLY_LIMIT,
      used,
      limit: PRO_MONTHLY_LIMIT,
      isPro: true,
      reason: used < PRO_MONTHLY_LIMIT ? undefined : 'pro_monthly',
    };
  }

  const { count, error } = await sb
    .from('voice_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) {
    console.error('checkVoiceQuota (free) error:', error);
    return { allowed: true, used: 0, limit: FREE_LIFETIME_LIMIT, isPro: false };
  }
  const used = count ?? 0;
  return {
    allowed: used < FREE_LIFETIME_LIMIT,
    used,
    limit: FREE_LIFETIME_LIMIT,
    isPro: false,
    reason: used < FREE_LIFETIME_LIMIT ? undefined : 'free_lifetime',
  };
}

export async function recordVoiceUsage(
  userId: string,
  sessionId: string | null,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from('voice_usage')
    .insert({ user_id: userId, session_id: sessionId });
  if (error) {
    console.error('recordVoiceUsage error:', { userId, sessionId, error });
  }
}
