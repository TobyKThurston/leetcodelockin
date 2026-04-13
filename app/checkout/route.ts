import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/lib/subscription';

type Plan = 'monthly' | 'yearly';

export async function GET(req: NextRequest) {
  const planParam = req.nextUrl.searchParams.get('plan');
  const plan: Plan = planParam === 'yearly' ? 'yearly' : 'monthly';

  const user = await getSupabaseUser();
  if (!user) {
    const next = `/checkout?plan=${plan}`;
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('next', next);
    return NextResponse.redirect(url);
  }

  if (!user.email) {
    const url = new URL('/settings', req.url);
    url.searchParams.set('error', 'Your account has no email on file');
    return NextResponse.redirect(url);
  }

  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY;

  if (!priceId) {
    const envName = plan === 'yearly' ? 'STRIPE_PRICE_ID_YEARLY' : 'STRIPE_PRICE_ID_MONTHLY';
    const url = new URL('/settings', req.url);
    url.searchParams.set('error', `${envName} is not configured on the server`);
    return NextResponse.redirect(url);
  }

  try {
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);
    const stripe = getStripe();

    const origin = req.nextUrl.origin;
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
      const url = new URL('/settings', req.url);
      url.searchParams.set('error', 'Stripe did not return a checkout URL');
      return NextResponse.redirect(url);
    }

    return NextResponse.redirect(session.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error';
    console.error('GET /checkout error:', message);
    const url = new URL('/settings', req.url);
    url.searchParams.set('error', message);
    return NextResponse.redirect(url);
  }
}
