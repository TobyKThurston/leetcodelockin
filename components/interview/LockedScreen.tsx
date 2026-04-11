'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Brain, Timer, Lock, ArrowRight, ArrowDown, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Animated counter ────────────────────────────────────────────────────────

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) { setValue(target); return; }
    let start = 0;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, prefersReduced]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

// ─── Section wrapper with scroll reveal ──────────────────────────────────────

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  { title: 'Choose your challenge', desc: 'Easy+Medium to build confidence, or Medium+Hard for the real thing.' },
  { title: 'Code under pressure', desc: '45 minutes. 2 problems. Full editor with test runner. No pauses.' },
  { title: 'Get your AI debrief', desc: 'Approach analysis, time splits, code quality score, and a clear readiness verdict.' },
];

const STATS = [
  { value: 2400, suffix: '+', label: 'Mock interviews completed' },
  { value: 87, suffix: '%', label: 'Said they felt more confident' },
  { value: 45, suffix: ' min', label: 'Real interview pace' },
];

// ─── Main component ─────────────────────────────────────────────────────────

export default function LockedScreen() {
  const [loading, setLoading] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  async function handleUpgrade(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '';
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY ?? '';

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-24">

        {/* ── 1. Hero ───────────────────────────────────────────────── */}
        <div className="text-center space-y-6 relative">
          {/* Blue glow */}
          <div
            className="absolute inset-0 -top-32 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 55% 45% at 50% 10%, rgba(59,130,246,0.06) 0%, transparent 70%)',
            }}
          />

          <div className="relative">
            <Badge
              className="mb-4 inline-flex bg-blue-500/10 text-blue-400 border-blue-500/20 text-[11px] font-semibold tracking-wide uppercase animate-fade-up"
              style={{ ...SG, animationDelay: '0ms' }}
            >
              Mock Interviews
            </Badge>

            <h1
              className="text-[32px] sm:text-[44px] font-bold text-white tracking-tight leading-[1.08] animate-slam-in"
              style={{ ...SG, animationDelay: '80ms' }}
            >
              Know you&apos;re ready<br />before the interview starts.
            </h1>

            <p
              className="text-[15px] sm:text-[16px] text-zinc-400 leading-relaxed max-w-lg mx-auto mt-5 animate-fade-up"
              style={{ animationDelay: '200ms' }}
            >
              Timed 45-minute coding interviews with AI-powered debriefs.<br className="hidden sm:block" />
              No more guessing.
            </p>

            <div className="mt-8 animate-fade-up" style={{ animationDelay: '400ms' }}>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold px-6 h-10 gap-2 transition-all"
                style={SG}
                onClick={() => pricingRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Unlock Mock Interviews
                <ArrowDown size={15} />
              </Button>
            </div>
          </div>
        </div>

        {/* ── 2. Interview Preview ──────────────────────────────────── */}
        <Reveal>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 0 60px -20px rgba(59,130,246,0.12)',
            }}
          >
            {/* Mock interview UI */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
              {/* Editor mock */}
              <div className="p-5 space-y-3" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                  <span className="text-[11px] text-zinc-600 ml-2" style={MONO}>solution.py</span>
                </div>
                {[85, 60, 75, 45, 90, 30, 70, 55].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-700 w-4 text-right" style={MONO}>{i + 1}</span>
                    <Skeleton className="h-3 rounded-sm bg-white/[0.03]" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>

              {/* Right panel mock */}
              <div className="p-5 space-y-5 hidden lg:block">
                {/* Timer */}
                <div className="text-center">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1" style={SG}>Time Remaining</p>
                  <p className="text-[28px] font-bold text-white tabular-nums" style={MONO}>38:42</p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
                {/* Score preview */}
                <div className="text-center">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2" style={SG}>AI Readiness Score</p>
                  <div
                    className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-bold"
                    style={{ border: '2px solid rgba(52,211,153,0.4)', color: 'rgba(52,211,153,0.9)', ...MONO }}
                  >
                    8.5
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
                {/* Feedback snippet */}
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2" style={SG}>AI Feedback</p>
                  <Skeleton className="h-2.5 w-full rounded-sm bg-white/[0.03] mb-2" />
                  <Skeleton className="h-2.5 w-4/5 rounded-sm bg-white/[0.03] mb-2" />
                  <Skeleton className="h-2.5 w-3/5 rounded-sm bg-white/[0.03]" />
                </div>
              </div>
            </div>

            {/* Locked overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#0b1220]/70 backdrop-blur-[2px]">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <Lock size={18} className="text-zinc-400" />
                </div>
                <p className="text-[13px] font-medium text-zinc-300" style={SG}>Available with Pro</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── 3. Social Proof Stats ─────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-0">
                <div className="text-center px-8 sm:px-10">
                  <p className="text-[30px] sm:text-[34px] font-bold text-white" style={MONO}>
                    <CountUp target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-[12px] text-zinc-500 mt-1">{s.label}</p>
                </div>
                {i < STATS.length - 1 && (
                  <Separator orientation="vertical" className="hidden sm:block h-10 bg-white/[0.06]" />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── 4. How It Works — Vertical Timeline ───────────────────── */}
        <Reveal>
          <div className="max-w-xl mx-auto">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-600 mb-8 text-center" style={SG}>
              How it works
            </p>

            <div className="space-y-0">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.12}>
                  <div className="flex gap-5">
                    {/* Timeline column */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                        style={{
                          background: 'rgba(59,130,246,0.08)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          color: 'rgba(96,165,250,0.9)',
                          boxShadow: '0 0 16px -4px rgba(59,130,246,0.15)',
                          ...MONO,
                        }}
                      >
                        {i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className="w-px flex-1 my-2"
                          style={{ background: 'rgba(59,130,246,0.12)', minHeight: 32 }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={i < STEPS.length - 1 ? 'pb-8' : 'pb-0'}>
                      <p className="text-[15px] font-semibold text-white" style={SG}>{step.title}</p>
                      <p className="text-[13px] text-zinc-500 leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── 5. Pricing CTA ────────────────────────────────────────── */}
        <Reveal>
          <div ref={pricingRef} className="text-center space-y-8">
            <div className="space-y-3">
              <h2 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight" style={SG}>
                Start interviewing with confidence
              </h2>
              <p className="text-[14px] text-zinc-400">
                Join engineers who stopped guessing and started preparing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {/* Monthly */}
              <div
                className="rounded-xl px-5 py-6 text-center"
                style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider mb-3" style={SG}>Monthly</p>
                <p className="text-[32px] font-bold text-white mb-1" style={MONO}>
                  $9<span className="text-[14px] text-zinc-500 font-normal">/mo</span>
                </p>
                <p className="text-[12px] text-zinc-600 mb-5">Cancel anytime</p>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-zinc-300 hover:bg-white/[0.04] text-[13px] font-semibold h-9"
                  style={SG}
                  onClick={() => handleUpgrade(monthlyPriceId)}
                  disabled={loading || !monthlyPriceId}
                >
                  {loading ? 'Loading...' : 'Get started'}
                </Button>
              </div>

              {/* Yearly — highlighted */}
              <div
                className="rounded-xl px-5 py-6 text-center relative"
                style={{
                  background: 'linear-gradient(180deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.01) 100%)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  boxShadow: '0 0 40px -15px rgba(59,130,246,0.15)',
                }}
              >
                <Badge
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500/15 text-blue-400 border-blue-500/25 text-[10px] font-semibold"
                  style={SG}
                >
                  Save $18
                </Badge>
                <p className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider mb-3" style={SG}>Yearly</p>
                <p className="text-[32px] font-bold text-white mb-1" style={MONO}>
                  $90<span className="text-[14px] text-zinc-500 font-normal">/yr</span>
                </p>
                <p className="text-[12px] text-zinc-500 mb-5">$7.50/mo — best value</p>
                <Button
                  className="w-full text-[13px] font-semibold h-9 text-white gap-1.5"
                  style={{
                    background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
                    border: '1px solid rgba(147,197,253,0.4)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 12px 30px -10px rgba(59,130,246,0.5)',
                    ...SG,
                  }}
                  onClick={() => handleUpgrade(yearlyPriceId)}
                  disabled={loading || !yearlyPriceId}
                >
                  {loading ? 'Loading...' : 'Get started'}
                  {!loading && <ArrowRight size={14} />}
                </Button>
              </div>
            </div>

            {/* Trust line */}
            <div className="flex items-center justify-center gap-4 text-[12px] text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Check size={12} className="text-zinc-600" />
                7-day money-back guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={12} className="text-zinc-600" />
                Cancel anytime
              </span>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
