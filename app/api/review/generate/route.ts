import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { generateReviewCards } from '@/lib/review';
import { getUserSubscription } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { isPro } = await getUserSubscription(user.id);
  if (!isPro) {
    return NextResponse.json({ error: 'Spaced repetition is a Pro feature' }, { status: 403 });
  }

  let body: { slug: string; code: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.slug || !body.code) {
    return NextResponse.json({ error: 'Missing slug or code' }, { status: 400 });
  }

  try {
    await generateReviewCards(user.id, body.slug, body.code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('/api/review/generate error:', err);
    return NextResponse.json({ error: 'Failed to generate review cards' }, { status: 500 });
  }
}
