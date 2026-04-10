'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default function UpgradePrompt({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(priceId: string) {
    setLoading(true);
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
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '';
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY ?? '';

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-amber-400" />
        <p className="text-[14px] font-semibold text-white" style={SG}>
          Daily limit reached
        </p>
      </div>
      <p className="text-[13px] text-slate-300 leading-relaxed">
        You&apos;ve used all{' '}
        <span className="font-semibold text-white">{used}/{limit}</span>{' '}
        free AI requests today. Upgrade to Pro for unlimited hints and chat.
      </p>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="bg-white text-zinc-900 hover:bg-zinc-100 text-[12px] font-semibold"
          onClick={() => handleUpgrade(monthlyPriceId)}
          disabled={loading || !monthlyPriceId}
        >
          {loading ? 'Loading...' : '$9/month'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-[12px] font-semibold"
          onClick={() => handleUpgrade(yearlyPriceId)}
          disabled={loading || !yearlyPriceId}
        >
          $90/year (save $18)
        </Button>
      </div>
    </div>
  );
}
