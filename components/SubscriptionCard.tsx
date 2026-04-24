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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handlePortal() {
    setLoading('portal');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setErrorMsg(error ?? 'Something went wrong opening the billing portal');
        setLoading(null);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
      setLoading(null);
    }
  }

  async function handleUpgrade() {
    setLoading('checkout');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'monthly',
          returnPath: window.location.pathname + window.location.search,
        }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setErrorMsg(error ?? 'Could not start checkout');
        setLoading(null);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
      setLoading(null);
    }
  }

  const formattedEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card className="bg-[var(--ll-bg-card)] border-[var(--ll-border)]">
      <CardHeader>
        <CardTitle className="text-slate-900 flex items-center gap-2" style={SG}>
          {isPro ? <Crown size={16} className="text-amber-500" /> : <Zap size={16} className="text-slate-500" />}
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
                  <p className="text-[13px] font-semibold text-slate-900" style={SG}>Pro Plan</p>
                  <p className="text-[12px] text-slate-600 mt-0.5" style={SG}>
                    Unlimited tutor, mock interviews, spaced review
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
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
            {errorMsg && (
              <p className="text-[11.5px] text-red-600 dark:text-red-400" style={SG}>{errorMsg}</p>
            )}
          </>
        ) : (
          <>
            <div className="rounded-lg bg-[var(--ll-bg-subtle)] border border-[var(--ll-border)] px-4 py-3">
              <p className="text-[13px] font-semibold text-slate-900" style={SG}>Free Plan</p>
              <p className="text-[12px] text-slate-600 mt-0.5" style={SG}>
                5 AI tutor messages per week
              </p>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold w-fit"
              onClick={() => handleUpgrade()}
              disabled={loading !== null}
            >
              {loading === 'checkout' ? 'Loading...' : 'Upgrade to Pro'}
            </Button>
            {errorMsg && (
              <p className="text-[11.5px] text-red-600 dark:text-red-400" style={SG}>{errorMsg}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
