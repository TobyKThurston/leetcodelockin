import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

// In the dahlia API, current_period_end lives on SubscriptionItem, not Subscription
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  if (!item?.current_period_end) return null;
  return new Date(item.current_period_end * 1000).toISOString();
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode !== 'subscription' || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.toString() ?? '';

      await sb.from('subscriptions').upsert(
        {
          user_id: subscription.metadata.supabase_user_id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id ?? null,
          current_period_end: getPeriodEnd(subscription),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await sb
        .from('subscriptions')
        .update({
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id ?? null,
          current_period_end: getPeriodEnd(subscription),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await sb
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const subDetail = invoice.parent?.subscription_details;
      const subId = subDetail
        ? (typeof subDetail.subscription === 'string'
            ? subDetail.subscription
            : subDetail.subscription?.id)
        : null;
      if (subId) {
        await sb
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
