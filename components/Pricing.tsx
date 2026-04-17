'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MONTHLY_PRICE_LABEL,
  YEARLY_PRICE_LABEL,
  YEARLY_FULL_LABEL,
  YEARLY_SAVINGS_LABEL,
  YEARLY_SAVINGS_PCT_LABEL,
  YEARLY_PER_MONTH_LABEL,
} from '@/lib/pricing';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const FREE_FEATURES = [
  'Full curriculum (4 paths, 37 blocks)',
  'Full problem library (212+ problems)',
  'Python code editor + execution',
  'Progress tracking and streaks',
  '5 AI tutor messages per week',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited AI Socratic tutor',
  'Mock interviews with AI debrief',
  'Spaced-repetition flashcards from your solutions',
  'Streak freezes so a missed day doesn\u2019t reset you',
];

export default function Pricing({ showFaq = false }: { showFaq?: boolean } = {}) {
  const [loading, setLoading] = useState<string | null>(null);

  function handleCheckout(plan: 'monthly' | 'yearly') {
    setLoading(plan);
    // /checkout handles auth itself: signed-in users go straight to Stripe,
    // signed-out users bounce through /sign-in?next=/checkout?plan=X and skip
    // the onboarding questionnaire on return. `from` is echoed into Stripe's
    // cancel_url so "Back" returns here instead of /settings.
    const from = window.location.pathname + window.location.search + window.location.hash;
    const qs = new URLSearchParams({ plan, from });
    window.location.href = `/checkout?${qs.toString()}`;
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
            All curriculum stays free. Pro adds unlimited AI tutoring, mock interviews, and spaced-repetition review.
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
                  Save {YEARLY_SAVINGS_PCT_LABEL}
                </span>
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-lg text-slate-600 line-through" style={SG}>
                  {YEARLY_FULL_LABEL}
                </span>
                <span className="text-5xl font-bold text-white" style={SG}>
                  {YEARLY_PRICE_LABEL}
                </span>
                <span className="text-lg text-slate-500">/year</span>
              </div>
              <p className="text-[13px] text-slate-500 mt-1.5">
                That&apos;s <span className="text-slate-300">{YEARLY_PER_MONTH_LABEL}/mo</span> &middot; save {YEARLY_SAVINGS_LABEL}
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
          Cancel anytime from Settings. Curriculum stays free even after you cancel.
        </p>

        {showFaq && (
          <div className="max-w-3xl mx-auto mt-20">
            <h3
              className="text-center text-[18px] font-bold text-white tracking-tight mb-6"
              style={SG}
            >
              Common questions
            </h3>
            <dl className="space-y-3">
              {FAQ_ITEMS.map(item => (
                <div
                  key={item.q}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-5 py-4"
                >
                  <dt className="text-[14px] font-semibold text-white" style={SG}>
                    {item.q}
                  </dt>
                  <dd className="text-[13px] text-slate-400 leading-relaxed mt-1.5">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Is the curriculum really free?',
    a: 'Yes. All 4 paths, 37 skill blocks, and 212+ problems are free forever. Pro adds AI tutoring, mock interviews with debriefs, and spaced-repetition flashcards from your solutions.',
  },
  {
    q: 'What\u2019s the difference between Free and Pro day-to-day?',
    a: 'Free gets you 5 AI tutor messages per week and the full curriculum. Pro gives you unlimited AI tutoring, timed mock interviews with AI feedback, personalized review cards generated from problems you\u2019ve solved, and streak freezes.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. One click from Settings, no email or call required. You keep Pro until the end of your billing period and the curriculum stays free after.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'If Pro isn\u2019t working for you in the first 14 days, email hello@leetlockin.com and we\u2019ll refund you. No questions.',
  },
];

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
