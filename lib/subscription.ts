import { getSupabase } from './supabase';
import { getStripe } from './stripe';

const FREE_DAILY_LIMIT = 3;

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

  const isPro =
    (data.status === 'active' || data.status === 'trialing') &&
    (data.current_period_end ? new Date(data.current_period_end) > new Date() : true);

  return {
    isPro,
    status: data.status,
    currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  };
}

// ─── AI usage tracking ───────────────────────────────────────────────────────

export async function getDailyAiUsage(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { count } = await sb
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('used_at', today);

  return count ?? 0;
}

export async function recordAiUsage(userId: string, endpoint: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  await sb.from('ai_usage').insert({ user_id: userId, endpoint });
}

// ─── Rate limiting ───────────────────────────────────────────────────────────

export async function checkAiRateLimit(userId: string): Promise<RateLimitResult> {
  const { isPro } = await getUserSubscription(userId);

  if (isPro) {
    return { allowed: true, used: 0, limit: Infinity, isPro: true };
  }

  const used = await getDailyAiUsage(userId);
  return {
    allowed: used < FREE_DAILY_LIMIT,
    used,
    limit: FREE_DAILY_LIMIT,
    isPro: false,
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
