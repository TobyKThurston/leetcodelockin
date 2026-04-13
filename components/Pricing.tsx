'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MONTHLY_PRICE_LABEL,
  YEARLY_PRICE_LABEL,
  YEARLY_SAVINGS_LABEL,
  YEARLY_PER_MONTH_LABEL,
} from '@/lib/pricing';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const FREE_FEATURES = [
  '4 learning paths, 37 skill blocks',
  'Full problem library (212+ problems)',
  'Python code editor + execution',
  'Progress tracking across paths',
  '5 AI tutor messages (lifetime)',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited AI Socratic tutor',
  'Unlimited AI chat follow-ups',
  'Priority when things get busy',
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  function handleCheckout(plan: 'monthly' | 'yearly') {
    setLoading(plan);
    // /checkout handles auth itself: signed-in users go straight to Stripe,
    // signed-out users bounce through /sign-in?next=/checkout?plan=X and skip
    // the onboarding questionnaire on return.
    window.location.href = `/checkout?plan=${plan}`;
  }

  return (
    <section id="pricing" className="px-4 sm:px-6 py-28">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600 mb-4">
            Pricing
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={SG}
          >
            Free to learn. Pro to master.
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            All content is free forever. Pro unlocks unlimited AI tutoring.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 items-stretch">
          {/* Free */}
          <Card className="bg-white/[0.02] ring-white/[0.06] rounded-2xl py-0 gap-0">
            <CardHeader className="px-8 pt-8 pb-0">
              <span
                className="text-[13px] font-semibold tracking-wider uppercase text-slate-400"
                style={SG}
              >
                Free
              </span>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-bold text-white" style={SG}>
                  $0
                </span>
                <span className="text-lg text-slate-500">/forever</span>
              </div>
              <p className="text-[13px] text-slate-600 mt-1.5">No credit card required</p>
            </CardHeader>
            <CardContent className="px-8 pt-8 flex-1">
              <FeatureList features={FREE_FEATURES} />
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-8 bg-transparent border-0">
              <a
                href="/sign-in"
                className={cn(
                  'w-full h-12 rounded-xl text-[13px] font-semibold border border-white/15 bg-white/5 text-white hover:bg-white/10',
                  'inline-flex items-center justify-center transition-colors',
                )}
              >
                Get started free
              </a>
            </CardFooter>
          </Card>

          {/* Pro Monthly */}
          <Card className="bg-white/[0.02] ring-white/[0.06] rounded-2xl py-0 gap-0">
            <CardHeader className="px-8 pt-8 pb-0">
              <span
                className="text-[13px] font-semibold tracking-wider uppercase text-slate-400"
                style={SG}
              >
                Pro Monthly
              </span>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-bold text-white" style={SG}>
                  {MONTHLY_PRICE_LABEL}
                </span>
                <span className="text-lg text-slate-500">/month</span>
              </div>
              <p className="text-[13px] text-slate-600 mt-1.5">Cancel anytime</p>
            </CardHeader>
            <CardContent className="px-8 pt-8 flex-1">
              <FeatureList features={PRO_FEATURES} />
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-8 bg-transparent border-0">
              <Button
                className="w-full h-12 rounded-xl text-[13px] font-semibold border border-white/15 bg-white/5 text-white hover:bg-white/10"
                variant="outline"
                onClick={() => handleCheckout('monthly')}
                disabled={loading !== null}
              >
                {loading === 'monthly' ? 'Loading...' : 'Start monthly'}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Yearly */}
          <Card className="relative bg-gradient-to-b from-blue-500/[0.05] to-blue-500/[0.01] ring-blue-500/20 rounded-2xl py-0 gap-0 shadow-[0_0_40px_-15px_rgba(59,130,246,0.2)]">
            <CardHeader className="px-8 pt-8 pb-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-[13px] font-semibold tracking-wider uppercase text-blue-400"
                  style={SG}
                >
                  Pro Yearly
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                  Save {YEARLY_SAVINGS_LABEL}
                </span>
              </div>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-bold text-white" style={SG}>
                  {YEARLY_PRICE_LABEL}
                </span>
                <span className="text-lg text-slate-500">/year</span>
              </div>
              <p className="text-[13px] text-slate-500 mt-1.5">
                That&apos;s <span className="text-slate-300">{YEARLY_PER_MONTH_LABEL}/mo</span>
              </p>
            </CardHeader>
            <CardContent className="px-8 pt-8 flex-1">
              <FeatureList features={PRO_FEATURES} highlight />
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-8 bg-transparent border-0">
              <Button
                className="w-full h-12 rounded-xl text-[13px] font-semibold border border-white/15 bg-white/5 text-white hover:bg-white/10"
                variant="outline"
                onClick={() => handleCheckout('yearly')}
                disabled={loading !== null}
              >
                {loading === 'yearly' ? 'Loading...' : 'Start yearly'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-[12px] text-slate-600 mt-8">
          All content is free. Pro only gates AI tutor usage.
        </p>
      </div>
    </section>
  );
}

function FeatureList({
  features,
  highlight = false,
}: {
  features: string[];
  highlight?: boolean;
}) {
  return (
    <ul className="space-y-3.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <Check
            className={cn(
              'size-4 shrink-0 mt-0.5',
              highlight ? 'text-blue-400' : 'text-slate-500',
            )}
            strokeWidth={2.5}
          />
          <span className="text-[13px] text-slate-300 leading-relaxed">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
