import { getSupabase } from './supabase';
import { getStripe } from './stripe';

const FREE_LIFETIME_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;

export interface SubscriptionInfo {
  isPro: boolean;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  isPro: boolean;
  reason?: 'lifetime' | 'daily';
}

// ─── Subscription status ─────────────────────────────────────────────────────

export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  const sb = getSupabase();
  if (!sb) return { isPro: false, status: 'inactive', currentPeriodEnd: null, cancelAtPeriodEnd: false };

  const { data } = await sb
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .maybeSingle();

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

// ─── AI quota check (business cap) ───────────────────────────────────────────
// Burst/abuse throttling lives in proxy.ts via lib/rate-limit.ts.
// This function only enforces the billable cap: lifetime for free, daily for Pro.

export async function checkAiQuota(userId: string): Promise<QuotaResult> {
  const { isPro } = await getUserSubscription(userId);

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
      .maybeSingle();

    if (data?.stripe_customer_id) {
      // Verify the stored customer still exists in the current Stripe mode.
      // A test-mode customer saved while the server used test keys will 404
      // once the keys are flipped to live (and vice versa). In that case we
      // fall through and create a fresh customer in the current mode.
      try {
        const existing = await stripe.customers.retrieve(data.stripe_customer_id);
        if (!existing.deleted) return existing.id;
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code !== 'resource_missing') throw err;
      }
    }
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
