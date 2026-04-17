import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

// In the dahlia API, current_period_end lives on SubscriptionItem, not Subscription.
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  if (!item?.current_period_end) return null;
  return new Date(item.current_period_end * 1000).toISOString();
}

async function resolveUserId(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  if (session.client_reference_id) return session.client_reference_id;

  const fromSub = subscription.metadata?.supabase_user_id;
  if (fromSub) return fromSub;

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.supabase_user_id) {
      return customer.metadata.supabase_user_id;
    }
  }
  return null;
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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency: Stripe retries on 5xx. Claim this event id via unique insert;
  // if the handler fails we roll the claim back so retries can reprocess.
  const { error: insertErr } = await sb
    .from('stripe_webhook_events')
    .insert({ id: event.id });
  if (insertErr) {
    if ('code' in insertErr && insertErr.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error('stripe_webhook_events insert error:', insertErr);
    return NextResponse.json({ error: 'dedup insert failed' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id ?? '';

        const userId = await resolveUserId(stripe, session, subscription);
        if (!userId) {
          console.error('checkout.session.completed: could not resolve supabase user id', {
            sessionId: session.id,
            subscriptionId,
            customerId,
          });
          // Return 200 so Stripe stops retrying — there's nothing to do without a user id.
          break;
        }

        await sb.from('subscriptions').upsert(
          {
            user_id: userId,
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
          ? typeof subDetail.subscription === 'string'
            ? subDetail.subscription
            : subDetail.subscription?.id
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`webhook handler failed for ${event.type}:`, message);
    // Release the dedup claim so Stripe's retry can reprocess this event.
    const { error: delErr } = await sb
      .from('stripe_webhook_events')
      .delete()
      .eq('id', event.id);
    if (delErr) {
      console.error('stripe_webhook_events rollback failed:', delErr);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
