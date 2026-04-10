import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/lib/subscription';

export async function POST(req: Request) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { priceId } = (await req.json()) as { priceId?: string };
  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
  }

  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomer(user.id, user.email!);

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings?checkout=success`,
    cancel_url: `${origin}/settings`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
