import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { checkAiRateLimit } from '@/lib/subscription';

export async function GET() {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { used, limit, isPro } = await checkAiRateLimit(user.id);
  return NextResponse.json({ used, limit, isPro });
}
