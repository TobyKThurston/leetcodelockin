'use client';

import { useState } from 'react';
import { Check, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MONTHLY_PRICE_LABEL,
  YEARLY_PRICE_LABEL,
  YEARLY_SAVINGS_LABEL,
  YEARLY_PER_MONTH_LABEL,
} from '@/lib/pricing';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const PRO_FEATURES = [
  'Timed 45-minute mock interviews',
  'AI-powered debriefs and readiness scoring',
  'Spaced-repetition review queue',
  'Unlimited AI Socratic tutor',
  'Priority when things get busy',
];

type PlanKey = 'monthly' | 'yearly';

export default function MobileUpgradeCards() {
  const [loading, setLoading] = useState<PlanKey | null>(null);

  async function handleCheckout(plan: PlanKey) {
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          returnPath: window.location.pathname + window.location.search,
        }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Yearly — featured */}
      <div className="relative bg-gradient-to-b from-blue-500/[0.06] to-blue-500/[0.01] ring-1 ring-blue-500/25 rounded-2xl p-5 shadow-[0_0_40px_-15px_rgba(59,130,246,0.25)]">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue-300"
            style={SG}
          >
            Pro Yearly
          </span>
          <span className="inline-flex items-center h-[22px] px-2 rounded-full bg-blue-500/15 border border-blue-500/25 text-[10px] font-semibold text-blue-300 tracking-wide">
            Best value
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[44px] leading-none font-bold text-slate-900 tracking-tight" style={SG}>
            {YEARLY_PRICE_LABEL}
          </span>
          <span className="text-[15px] text-slate-500">/year</span>
        </div>
        <p className="text-[12px] text-slate-500 mt-1">
          That&apos;s <span className="text-slate-700">{YEARLY_PER_MONTH_LABEL}/mo</span> — save {YEARLY_SAVINGS_LABEL}
        </p>

        <ul className="mt-5 space-y-2.5">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={14} strokeWidth={2.5} className="shrink-0 mt-0.5 text-blue-400" />
              <span className="text-[13px] text-slate-700 leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => handleCheckout('yearly')}
          disabled={loading !== null}
          className={cn(
            'mt-5 h-12 w-full rounded-xl bg-white text-slate-200 text-[14px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-[0.98] transition-all',
            loading !== null && 'opacity-70 cursor-not-allowed',
          )}
        >
          {loading === 'yearly' ? (
            <>
              <Loader2 size={15} strokeWidth={2.5} className="animate-spin" />
              Loading
            </>
          ) : (
            'Start yearly'
          )}
        </button>
      </div>

      {/* Monthly */}
      <div className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-5">
        <span
          className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600"
          style={SG}
        >
          Pro Monthly
        </span>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[36px] leading-none font-bold text-slate-900 tracking-tight" style={SG}>
            {MONTHLY_PRICE_LABEL}
          </span>
          <span className="text-[15px] text-slate-500">/month</span>
        </div>
        <p className="text-[12px] text-slate-400 mt-1">Cancel anytime</p>

        <button
          type="button"
          onClick={() => handleCheckout('monthly')}
          disabled={loading !== null}
          className={cn(
            'mt-5 h-12 w-full rounded-xl border border-white/15 bg-slate-50 text-[14px] font-semibold text-slate-900 hover:bg-white/[0.08] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2',
            loading !== null && 'opacity-70 cursor-not-allowed',
          )}
        >
          {loading === 'monthly' ? (
            <>
              <Loader2 size={15} strokeWidth={2.5} className="animate-spin" />
              Loading
            </>
          ) : (
            'Start monthly'
          )}
        </button>
      </div>

      {/* Security line */}
      <p className="text-center text-[11px] text-slate-400 px-2">
        Secured by Stripe. Checkout works on mobile. You can manage or cancel anytime from Settings
        on desktop.
      </p>
    </div>
  );
}
