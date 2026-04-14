import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { syncStripeSubscription } from '@/lib/subscription';

// Stripe redirects here after successful checkout. We synchronously sync the
// user's subscription from Stripe → Supabase so Pro status is applied even if
// the webhook hasn't arrived (or isn't wired up at all). Webhooks continue to
// handle renewals, cancellations, and failed payments.
export async function GET(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in?next=/settings', req.url));
  }

  try {
    await syncStripeSubscription(user.id);
  } catch (err) {
    console.error('checkout/complete sync error:', err);
  }

  return NextResponse.redirect(new URL('/settings?checkout=success', req.url));
}
