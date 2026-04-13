import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/lib/subscription';

export async function POST(req: Request) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { plan?: string };
  const plan = body.plan === 'yearly' ? 'yearly' : 'monthly';

  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY ?? process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    const envName = plan === 'yearly' ? 'STRIPE_PRICE_ID_YEARLY' : 'STRIPE_PRICE_ID_MONTHLY';
    return NextResponse.json(
      { error: `${envName} is not configured on the server` },
      { status: 500 },
    );
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
