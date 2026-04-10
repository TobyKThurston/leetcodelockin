'use client';

import { useState } from 'react';
import { Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

interface SubscriptionCardProps {
  isPro: boolean;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionCard({
  isPro,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePortal() {
    setLoading('portal');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('Portal error:', error);
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  async function handleUpgrade(priceId: string) {
    setLoading('checkout');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('Checkout error:', error);
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '';

  const formattedEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card className="bg-white/[0.025] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2" style={SG}>
          {isPro ? <Crown size={16} className="text-amber-400" /> : <Zap size={16} className="text-slate-500" />}
          Subscription
        </CardTitle>
        <CardDescription style={SG}>
          {isPro ? 'You\'re on the Pro plan.' : 'You\'re on the Free plan.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isPro ? (
          <>
            <div className="rounded-lg bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-white" style={SG}>Pro Plan</p>
                  <p className="text-[12px] text-slate-400 mt-0.5" style={SG}>
                    Unlimited AI tutor access
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {status === 'active' ? 'Active' : status}
                </span>
              </div>
              {formattedEnd && (
                <p className="text-[11.5px] text-slate-500 mt-2" style={SG}>
                  {cancelAtPeriodEnd
                    ? `Cancels on ${formattedEnd}`
                    : `Renews on ${formattedEnd}`}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[12px] w-fit"
              onClick={handlePortal}
              disabled={loading !== null}
            >
              {loading === 'portal' ? 'Loading...' : 'Manage subscription'}
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/60 px-4 py-3">
              <p className="text-[13px] font-semibold text-white" style={SG}>Free Plan</p>
              <p className="text-[12px] text-slate-400 mt-0.5" style={SG}>
                3 AI tutor requests per day
              </p>
            </div>
            <Button
              size="sm"
              className="bg-white text-zinc-900 hover:bg-zinc-100 text-[12px] font-semibold w-fit"
              onClick={() => handleUpgrade(monthlyPriceId)}
              disabled={loading !== null || !monthlyPriceId}
            >
              {loading === 'checkout' ? 'Loading...' : 'Upgrade to Pro — $9/month'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
