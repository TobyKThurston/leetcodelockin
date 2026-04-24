'use client';

import { useState } from 'react';
import { Zap, MessageSquare, Code2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MONTHLY_PRICE_LABEL,
  YEARLY_PRICE_LABEL,
  YEARLY_SAVINGS_LABEL,
} from '@/lib/pricing';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const FEATURES = [
  { icon: MessageSquare, label: 'Unlimited AI tutor chats', desc: 'No cap on hints or explanations' },
  { icon: Code2, label: 'AI code review', desc: 'Get feedback on every solution you write' },
  { icon: Brain, label: 'Mock interview access', desc: 'Timed sessions with AI-powered feedback' },
];

export default function UpgradePrompt({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(plan: 'monthly' | 'yearly') {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          returnPath: window.location.pathname + window.location.search,
        }),
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

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        background: 'rgba(15,23,42,0.04)',
        border: '1px solid rgba(15,23,42,0.08)',
      }}
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Zap size={14} className="text-amber-400" />
          </div>
          <p className="text-[14px] font-semibold text-slate-900" style={SG}>
            Upgrade to Pro
          </p>
        </div>
        <p className="text-[13px] text-slate-400 leading-relaxed">
          You've used{' '}
          <span className="text-slate-200 font-medium">{used}/{limit}</span>{' '}
          free tutor messages this week. Resets in 7 days, or go Pro for unlimited access.
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2">
        {FEATURES.map(f => (
          <div key={f.label} className="flex items-start gap-2.5">
            <f.icon size={14} className="shrink-0 mt-0.5 text-slate-500" />
            <div>
              <p className="text-[12px] font-medium text-slate-300" style={SG}>{f.label}</p>
              <p className="text-[11px] text-slate-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing CTAs */}
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="border-slate-200 text-slate-200 hover:bg-slate-100 text-[12px] font-semibold"
          onClick={() => handleUpgrade('monthly')}
          disabled={loading}
        >
          {loading ? 'Loading...' : `${MONTHLY_PRICE_LABEL}/month`}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-200 text-slate-200 hover:bg-slate-100 text-[12px] font-semibold"
          onClick={() => handleUpgrade('yearly')}
          disabled={loading}
        >
          {YEARLY_PRICE_LABEL}/year (save {YEARLY_SAVINGS_LABEL})
        </Button>
      </div>
    </div>
  );
}
