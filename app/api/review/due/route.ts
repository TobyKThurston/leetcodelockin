import { NextResponse } from 'next/server';
import { getSupabaseUser, getSupabase } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/subscription';
import type { ReviewCard } from '@/lib/review';

export async function GET() {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { isPro } = await getUserSubscription(user.id);
  if (!isPro) {
    return NextResponse.json({ cards: [], isPro: false, totalDue: 0 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ cards: [], isPro: true, totalDue: 0 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Get total due count
  const { count } = await sb
    .from('review_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('dismissed', false)
    .lte('next_review', today);

  // Get up to 20 cards with problem details
  const { data: rows } = await sb
    .from('review_cards')
    .select('id, problem_slug, card_type, content, code_snapshot, review_count, interval_days, next_review')
    .eq('user_id', user.id)
    .eq('dismissed', false)
    .lte('next_review', today)
    .order('next_review', { ascending: true })
    .limit(20);

  if (!rows || rows.length === 0) {
    return NextResponse.json({ cards: [], isPro: true, totalDue: count ?? 0 });
  }

  // Fetch problem details for all unique slugs
  const slugs = [...new Set(rows.map(r => r.problem_slug))];
  const { data: problems } = await sb
    .from('problems')
    .select('slug, title, difficulty, pattern')
    .in('slug', slugs);

  const problemMap = new Map(
    (problems ?? []).map(p => [p.slug, p]),
  );

  const cards: ReviewCard[] = rows.map(r => {
    const p = problemMap.get(r.problem_slug);
    return {
      id: r.id,
      problemSlug: r.problem_slug,
      problemTitle: p?.title ?? r.problem_slug,
      difficulty: p?.difficulty ?? 'Medium',
      pattern: p?.pattern ?? '',
      cardType: r.card_type as ReviewCard['cardType'],
      content: r.content as ReviewCard['content'],
      codeSnapshot: r.code_snapshot,
      reviewCount: r.review_count,
      intervalDays: r.interval_days,
      nextReview: r.next_review,
    };
  });

  return NextResponse.json({ cards, isPro: true, totalDue: count ?? 0 });
}
