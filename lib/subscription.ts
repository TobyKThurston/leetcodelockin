import { getSupabase } from './supabase';
import { getStripe } from './stripe';

const FREE_LIFETIME_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;
const BURST_WINDOW_MS = 60_000;
const BURST_MAX = 10;

export interface SubscriptionInfo {
  isPro: boolean;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  limit: number;
  isPro: boolean;
  reason?: 'lifetime' | 'daily' | 'burst';
}

// ─── Subscription status ─────────────────────────────────────────────────────

export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  const sb = getSupabase();
  if (!sb) return { isPro: false, status: 'inactive', currentPeriodEnd: null, cancelAtPeriodEnd: false };

  const { data } = await sb
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .single();

  if (!data) return { isPro: false, status: 'inactive', currentPeriodEnd: null, cancelAtPeriodEnd: false };

  // Pro status requires an explicit, non-null future period_end.
  // Null or past timestamps count as expired, so a corrupted row can't grant perpetual Pro.
  const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null;
  const isPro =
    (data.status === 'active' || data.status === 'trialing') &&
    periodEnd !== null &&
    periodEnd > new Date();

  return {
    isPro,
    status: data.status,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  };
}

// ─── AI usage tracking ───────────────────────────────────────────────────────

export async function getLifetimeAiUsage(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;

  const { count, error } = await sb
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('getLifetimeAiUsage error:', error);
    return 0;
  }
  return count ?? 0;
}

export async function getDailyAiUsage(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;

  // Range query works whether used_at is a `date` or `timestamptz` column.
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const { count, error } = await sb
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('used_at', startOfDay.toISOString())
    .lt('used_at', endOfDay.toISOString());

  if (error) {
    console.error('getDailyAiUsage error:', error);
    return 0;
  }
  return count ?? 0;
}

export async function recordAiUsage(userId: string, endpoint: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { error } = await sb.from('ai_usage').insert({ user_id: userId, endpoint });
  if (error) {
    console.error('recordAiUsage error:', { userId, endpoint, error });
  }
}

// ─── Burst throttle (in-memory token bucket per user) ──────────────────────
// Coarse protection against scripts that try to drain quota in one second.
// In-memory state only — state is per serverless instance, not a durable SLA.
// The durable cap is the daily/lifetime count above; this just slows drains.

const burstHits = new Map<string, number[]>();

function checkBurst(userId: string): boolean {
  const now = Date.now();
  const cutoff = now - BURST_WINDOW_MS;
  const recent = (burstHits.get(userId) ?? []).filter((t) => t > cutoff);
  if (recent.length >= BURST_MAX) {
    burstHits.set(userId, recent);
    return false;
  }
  recent.push(now);
  burstHits.set(userId, recent);
  if (burstHits.size > 1000) {
    for (const [k, v] of burstHits) {
      const kept = v.filter((t) => t > cutoff);
      if (kept.length === 0) burstHits.delete(k);
      else burstHits.set(k, kept);
    }
  }
  return true;
}

// ─── Rate limiting ───────────────────────────────────────────────────────────

export async function checkAiRateLimit(userId: string): Promise<RateLimitResult> {
  const { isPro } = await getUserSubscription(userId);

  if (!checkBurst(userId)) {
    return {
      allowed: false,
      used: BURST_MAX,
      limit: BURST_MAX,
      isPro,
      reason: 'burst',
    };
  }

  if (isPro) {
    const used = await getDailyAiUsage(userId);
    return {
      allowed: used < PRO_DAILY_LIMIT,
      used,
      limit: PRO_DAILY_LIMIT,
      isPro: true,
      reason: used < PRO_DAILY_LIMIT ? undefined : 'daily',
    };
  }

  const used = await getLifetimeAiUsage(userId);
  return {
    allowed: used < FREE_LIFETIME_LIMIT,
    used,
    limit: FREE_LIFETIME_LIMIT,
    isPro: false,
    reason: used < FREE_LIFETIME_LIMIT ? undefined : 'lifetime',
  };
}

// ─── Stripe customer management ──────────────────────────────────────────────

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const sb = getSupabase();
  const stripe = getStripe();

  if (sb) {
    const { data } = await sb
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (data?.stripe_customer_id) return data.stripe_customer_id;
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  // Upsert a placeholder row so we don't create duplicates
  if (sb) {
    await sb.from('subscriptions').upsert(
      { user_id: userId, stripe_customer_id: customer.id, status: 'inactive' },
      { onConflict: 'user_id' },
    );
  }

  return customer.id;
}
