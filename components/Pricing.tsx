'use client';

import { useState } from 'react';
import posthog from 'posthog-js';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MONTHLY_PRICE_LABEL,
  YEARLY_PER_MONTH_LABEL,
  YEARLY_SAVINGS_PCT_LABEL,
  YEARLY_PRICE_LABEL,
} from '@/lib/pricing';

const SG: React.CSSProperties = { fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif' };

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
  'Streak freezes so a missed day doesn’t reset you',
];

type Cycle = 'monthly' | 'yearly';

export default function Pricing() {
  const [cycle, setCycle] = useState<Cycle>('yearly');
  const [loading, setLoading] = useState(false);

  function handleCheckout() {
    setLoading(true);
    posthog.capture('checkout_started', { plan: cycle, source: 'pricing_page' });
    const from = window.location.pathname + window.location.search + window.location.hash;
    const qs = new URLSearchParams({ plan: cycle, from });
    window.location.href = `/checkout?${qs.toString()}`;
  }

  const proPrice = cycle === 'yearly' ? YEARLY_PER_MONTH_LABEL : MONTHLY_PRICE_LABEL;
  const proFootnote =
    cycle === 'yearly'
      ? `Billed ${YEARLY_PRICE_LABEL}/year · cancel anytime`
      : 'Billed monthly · cancel anytime';

  return (
    <section id="pricing" className="px-6 sm:px-10 py-32">
      <div className="max-w-4xl mx-auto">

        <div className="text-center">
          <p
            className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
            style={{ color: 'var(--ll-accent)' }}
          >
            Pricing
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{ ...SG, color: 'var(--ll-ink)' }}
          >
            Free to learn. Pro to master.
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: 'var(--ll-ink-muted)' }}>
            Start free. Upgrade when you want unlimited tutoring and mocks.
          </p>
        </div>

        <div className="flex justify-center mt-10">
          <CycleToggle value={cycle} onChange={setCycle} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10 items-stretch">

          <PlanCard>
            <PlanLabel>Free</PlanLabel>
            <PriceRow price="$0" suffix="/forever" />
            <FootnoteText>No credit card required</FootnoteText>
            <FeatureList features={FREE_FEATURES} />
            <PlanCTA href="/sign-in">Get started free</PlanCTA>
          </PlanCard>

          <PlanCard featured>
            <div className="flex items-center justify-between">
              <PlanLabel accent>Pro</PlanLabel>
              <AnimatePresence>
                {cycle === 'yearly' && (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                    style={{
                      color: 'var(--ll-accent)',
                      background: 'rgba(59,130,246,0.10)',
                      border: '1px solid rgba(59,130,246,0.30)',
                    }}
                  >
                    Save {YEARLY_SAVINGS_PCT_LABEL}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <AnimatedPrice price={proPrice} suffix="/mo" cycle={cycle} />
            <FootnoteText>{proFootnote}</FootnoteText>
            <FeatureList features={PRO_FEATURES} highlight />

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-12 rounded-md text-[13px] font-semibold transition-all duration-150 active:scale-[0.99] disabled:opacity-60"
              style={{
                background: 'var(--ll-accent)',
                color: 'white',
                boxShadow:
                  '0 1px 0 0 rgba(255,255,255,0.15) inset, 0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -10px rgba(59,130,246,0.55)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--ll-accent-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--ll-accent)';
              }}
            >
              {loading ? 'Loading…' : `Start Pro ${cycle === 'yearly' ? 'yearly' : 'monthly'}`}
            </button>
          </PlanCard>
        </div>

        <p className="text-center text-[12px] mt-10" style={{ color: 'var(--ll-ink-subtle)' }}>
          Cancel anytime from Settings. Curriculum stays free even after you cancel.
        </p>

      </div>
    </section>
  );
}

/* ─── Toggle ────────────────────────────────────────────────────────── */

function CycleToggle({ value, onChange }: { value: Cycle; onChange: (v: Cycle) => void }) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as Cycle)}
      aria-label="Billing cycle"
    >
      <TabsList
        className="h-11 rounded-full p-1 gap-1 bg-[var(--ll-bg-subtle)] border border-[var(--ll-border)]"
      >
        <TabsTrigger
          value="monthly"
          className="h-9 px-5 rounded-full text-[13px] font-medium text-[var(--ll-ink-muted)] border-transparent data-active:bg-[var(--ll-bg-elevated)] data-active:text-[var(--ll-ink)] data-active:shadow-sm hover:text-[var(--ll-ink)]"
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className="h-9 px-5 rounded-full text-[13px] font-medium text-[var(--ll-ink-muted)] border-transparent data-active:bg-[var(--ll-bg-elevated)] data-active:text-[var(--ll-ink)] data-active:shadow-sm hover:text-[var(--ll-ink)]"
        >
          Yearly
          <span
            className="ml-1 text-[10px] font-semibold"
            style={{ color: value === 'yearly' ? 'var(--ll-accent)' : 'var(--ll-ink-subtle)' }}
          >
            −{YEARLY_SAVINGS_PCT_LABEL}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

/* ─── Card primitives ──────────────────────────────────────────────── */

function PlanCard({
  children,
  featured = false,
}: {
  children: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className="relative rounded-lg p-8 sm:p-10 flex flex-col gap-6 transition-all duration-300"
      style={{
        background: 'var(--ll-bg-elevated)',
        border: featured ? '1px solid var(--ll-accent)' : '1px solid var(--ll-border)',
        boxShadow: featured
          ? '0 1px 2px rgba(15,23,42,0.04), 0 24px 60px -28px rgba(59,130,246,0.40), 0 0 0 4px rgba(59,130,246,0.04)'
          : '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      {children}
    </div>
  );
}

function PlanLabel({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="text-[12px] font-semibold tracking-[0.18em] uppercase"
      style={{ ...SG, color: accent ? 'var(--ll-accent)' : 'var(--ll-ink-muted)' }}
    >
      {children}
    </span>
  );
}

function PriceRow({ price, suffix }: { price: string; suffix: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[56px] leading-none font-bold" style={{ ...SG, color: 'var(--ll-ink)' }}>
        {price}
      </span>
      <span className="text-base" style={{ color: 'var(--ll-ink-muted)' }}>{suffix}</span>
    </div>
  );
}

function AnimatedPrice({
  price,
  suffix,
  cycle,
}: {
  price: string;
  suffix: string;
  cycle: Cycle;
}) {
  return (
    <div className="flex items-baseline gap-1.5 h-[56px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={cycle}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="text-[56px] leading-none font-bold tabular-nums"
          style={{ ...SG, color: 'var(--ll-ink)' }}
        >
          {price}
        </motion.span>
      </AnimatePresence>
      <span className="text-base" style={{ color: 'var(--ll-ink-muted)' }}>{suffix}</span>
    </div>
  );
}

function FootnoteText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] -mt-3" style={{ color: 'var(--ll-ink-subtle)' }}>
      {children}
    </p>
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
    <ul className="space-y-3 flex-1">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <Check
            className="size-4 shrink-0 mt-0.5"
            style={{ color: highlight ? 'var(--ll-accent)' : 'var(--ll-ink-subtle)' }}
            strokeWidth={2.5}
          />
          <span className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink)' }}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PlanCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-full h-12 rounded-md text-[13px] font-semibold inline-flex items-center justify-center transition-colors"
      style={{
        background: 'transparent',
        color: 'var(--ll-ink)',
        border: '1px solid var(--ll-border-strong)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--ll-bg-subtle)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </a>
  );
}
