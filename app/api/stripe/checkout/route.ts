import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/lib/subscription';

type Plan = 'monthly' | 'yearly';

export async function POST(req: Request) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: 'Your account has no email on file' }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { plan?: string };
  const plan: Plan = body.plan === 'yearly' ? 'yearly' : 'monthly';

  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY;

  if (!priceId) {
    const envName = plan === 'yearly' ? 'STRIPE_PRICE_ID_YEARLY' : 'STRIPE_PRICE_ID_MONTHLY';
    return NextResponse.json(
      { error: `${envName} is not configured on the server` },
      { status: 500 },
    );
  }

  const origin =
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';

  try {
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      allow_promotion_codes: true,
      success_url: `${origin}/settings?checkout=success`,
      cancel_url: `${origin}/settings`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error';
    console.error('stripe/checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
