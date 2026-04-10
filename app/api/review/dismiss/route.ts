import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser, getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { cardId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.cardId) {
    return NextResponse.json({ error: 'Missing cardId' }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  await sb
    .from('review_cards')
    .update({ dismissed: true })
    .eq('id', body.cardId)
    .eq('user_id', user.id);

  return NextResponse.json({ ok: true });
}
