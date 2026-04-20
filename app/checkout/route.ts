import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/lib/subscription';
import { safeReturnPath } from '@/lib/safe-return-path';
import { getPostHogClient } from '@/lib/posthog-server';

type Plan = 'monthly' | 'yearly';

// Resolve "where to send the user if anything goes wrong or they cancel".
// Prefer the explicit `from` query param (set by the client), fall back to the
// Referer header, then /settings as a last resort.
function resolveReturnPath(req: NextRequest): string {
  const fromParam = safeReturnPath(req.nextUrl.searchParams.get('from'));
  if (fromParam) return fromParam;

  const referer = req.headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.origin === req.nextUrl.origin && url.pathname !== '/checkout') {
        return url.pathname + url.search;
      }
    } catch {
      // fall through
    }
  }

  return '/settings';
}

export async function GET(req: NextRequest) {
  const planParam = req.nextUrl.searchParams.get('plan');
  const plan: Plan = planParam === 'yearly' ? 'yearly' : 'monthly';
  const returnPath = resolveReturnPath(req);

  const user = await getSupabaseUser();
  if (!user) {
    // Preserve the return path across the sign-in bounce so we still know
    // where to send them after auth + checkout.
    const next = `/checkout?plan=${plan}&from=${encodeURIComponent(returnPath)}`;
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('next', next);
    return NextResponse.redirect(url);
  }

  if (!user.email) {
    const url = new URL(returnPath, req.url);
    url.searchParams.set('error', 'Your account has no email on file');
    return NextResponse.redirect(url);
  }

  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY;

  if (!priceId) {
    const envName = plan === 'yearly' ? 'STRIPE_PRICE_ID_YEARLY' : 'STRIPE_PRICE_ID_MONTHLY';
    const url = new URL(returnPath, req.url);
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
      success_url: `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    if (!session.url) {
      const url = new URL(returnPath, req.url);
      url.searchParams.set('error', 'Stripe did not return a checkout URL');
      return NextResponse.redirect(url);
    }

    getPostHogClient().capture({
      distinctId: user.id,
      event: 'checkout_initiated',
      properties: { plan, price_id: priceId },
    });

    return NextResponse.redirect(session.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error';
    console.error('GET /checkout error:', message);
    const url = new URL(returnPath, req.url);
    url.searchParams.set('error', message);
    return NextResponse.redirect(url);
  }
}
