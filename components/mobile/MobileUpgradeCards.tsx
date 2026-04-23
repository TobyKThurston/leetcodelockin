'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
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
      <div
        className="relative bg-gradient-to-b from-blue-100/60 to-sky-50/30 ring-1 ring-blue-500/30 rounded-2xl p-5"
        style={{
          backgroundColor: 'var(--ll-bg-elevated)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -18px rgba(59,130,246,0.4)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue-700"
            style={SG}
          >
            Pro Yearly
          </span>
          <span className="inline-flex items-center h-[22px] px-2 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-semibold text-blue-700 tracking-wide">
            Best value
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[44px] leading-none font-bold text-[var(--ll-ink)] tracking-tight" style={SG}>
            {YEARLY_PRICE_LABEL}
          </span>
          <span className="text-[15px] text-[var(--ll-ink-subtle)]">/year</span>
        </div>
        <p className="text-[12px] text-[var(--ll-ink-muted)] mt-1">
          That&apos;s <span className="text-[var(--ll-ink)] font-medium">{YEARLY_PER_MONTH_LABEL}/mo</span> — save {YEARLY_SAVINGS_LABEL}
        </p>

        <ul className="mt-5 space-y-2.5">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={14} strokeWidth={2.5} className="shrink-0 mt-0.5 text-blue-600" />
              <span className="text-[13px] text-[var(--ll-ink-muted)] leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => handleCheckout('yearly')}
          disabled={loading !== null}
          className={cn(
            'mt-5 h-12 w-full rounded-xl text-[14px] font-semibold text-white inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all',
            loading !== null && 'opacity-70 cursor-not-allowed',
          )}
          style={{ backgroundColor: 'var(--ll-accent)' }}
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
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'var(--ll-bg-elevated)',
          border: '1px solid var(--ll-border)',
        }}
      >
        <span
          className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-muted)]"
          style={SG}
        >
          Pro Monthly
        </span>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[36px] leading-none font-bold text-[var(--ll-ink)] tracking-tight" style={SG}>
            {MONTHLY_PRICE_LABEL}
          </span>
          <span className="text-[15px] text-[var(--ll-ink-subtle)]">/month</span>
        </div>
        <p className="text-[12px] text-[var(--ll-ink-subtle)] mt-1">Cancel anytime</p>

        <button
          type="button"
          onClick={() => handleCheckout('monthly')}
          disabled={loading !== null}
          className={cn(
            'mt-5 h-12 w-full rounded-xl text-[14px] font-semibold text-[var(--ll-ink)] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2',
            loading !== null && 'opacity-70 cursor-not-allowed',
          )}
          style={{
            backgroundColor: 'var(--ll-bg-subtle)',
            border: '1px solid var(--ll-border-strong)',
          }}
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
      <p className="text-center text-[11px] text-[var(--ll-ink-subtle)] px-2">
        Secured by Stripe. Checkout works on mobile. You can manage or cancel anytime from Settings
        on desktop.
      </p>
    </div>
  );
}
