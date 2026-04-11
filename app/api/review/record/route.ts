import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser, getSupabase } from '@/lib/supabase';
import { recordActivityForUser } from '@/lib/streaks';

export async function POST(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { cardId: string; result: 'got_it' | 'forgot' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.cardId || !['got_it', 'forgot'].includes(body.result)) {
    return NextResponse.json({ error: 'Invalid cardId or result' }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  // Fetch the card and verify ownership
  const { data: card } = await sb
    .from('review_cards')
    .select('id, user_id, interval_days, review_count')
    .eq('id', body.cardId)
    .single();

  if (!card || card.user_id !== user.id) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  const newInterval = body.result === 'got_it'
    ? Math.min(card.interval_days * 2, 30)
    : 1;

  const today = new Date().toISOString().slice(0, 10);
  const nextDate = new Date(Date.now() + newInterval * 86400000).toISOString().slice(0, 10);

  await sb
    .from('review_cards')
    .update({
      interval_days: newInterval,
      next_review: nextDate,
      review_count: card.review_count + 1,
      last_reviewed: today,
    })
    .eq('id', body.cardId);

  await recordActivityForUser(user.id);

  return NextResponse.json({ ok: true, nextReview: nextDate });
}
