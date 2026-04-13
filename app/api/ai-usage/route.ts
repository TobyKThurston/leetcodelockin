import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import {
  getUserSubscription,
  getLifetimeAiUsage,
  getDailyAiUsage,
} from '@/lib/subscription';

// Read-only endpoint — must NOT go through checkAiRateLimit, which would
// consume a burst-throttle slot just for checking your own counter.
const FREE_LIFETIME_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;

export async function GET() {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { isPro } = await getUserSubscription(user.id);
  if (isPro) {
    const used = await getDailyAiUsage(user.id);
    return NextResponse.json({ used, limit: PRO_DAILY_LIMIT, isPro: true });
  }
  const used = await getLifetimeAiUsage(user.id);
  return NextResponse.json({ used, limit: FREE_LIFETIME_LIMIT, isPro: false });
}
