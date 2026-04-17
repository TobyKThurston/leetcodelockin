import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import {
  getUserSubscription,
  getWeeklyAiUsage,
  getDailyAiUsage,
} from '@/lib/subscription';

// Read-only usage counter. Abuse throttling lives in proxy.ts (READ_BURST bucket).
const FREE_WEEKLY_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;

export async function GET() {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { isPro } = await getUserSubscription(user.id);
  if (isPro) {
    const used = await getDailyAiUsage(user.id);
    return NextResponse.json({ used, limit: PRO_DAILY_LIMIT, isPro: true, period: 'daily' });
  }
  const used = await getWeeklyAiUsage(user.id);
  return NextResponse.json({ used, limit: FREE_WEEKLY_LIMIT, isPro: false, period: 'weekly' });
}
