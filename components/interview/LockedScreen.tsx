'use client';

import { useState, useRef } from 'react';
import {
  Lock, ArrowDown, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MONTHLY_PRICE_LABEL,
  YEARLY_PRICE_LABEL,
  YEARLY_SAVINGS_LABEL,
  YEARLY_PER_MONTH_LABEL,
} from '@/lib/pricing';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };
const PRO_FEATURES = [
  'Timed 45-minute mock interviews',
  'AI-powered debriefs & readiness score',
  'Approach analysis & time splits',
  'Unlimited AI Socratic tutor',
  'Priority when things get busy',
];

// ─── Main component ─────────────────────────────────────────────────────────

export default function LockedScreen() {
  const [loading, setLoading] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  async function handleUpgrade(plan: 'monthly' | 'yearly') {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

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
        <>
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
        </>

        {/* ── 3. Pricing ─────────────────────────────────────────── */}
        <div ref={pricingRef} className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight" style={SG}>
              Start interviewing with confidence
            </h2>
            <p className="text-[14px] text-slate-500">
              Unlock mock interviews and unlimited AI tutoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Pro Monthly */}
            <Card className="bg-white/[0.02] ring-white/[0.06] rounded-2xl py-0 gap-0">
              <CardHeader className="px-8 pt-8 pb-0">
                <span className="text-[13px] font-semibold tracking-wider uppercase text-slate-400" style={SG}>
                  Pro Monthly
                </span>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold text-white" style={SG}>{MONTHLY_PRICE_LABEL}</span>
                  <span className="text-lg text-slate-500">/month</span>
                </div>
                <p className="text-[13px] text-slate-600 mt-1.5">Cancel anytime</p>
              </CardHeader>
              <CardContent className="px-8 pt-8 flex-1">
                <ul className="space-y-3.5">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="size-4 shrink-0 mt-0.5 text-slate-500" strokeWidth={2.5} />
                      <span className="text-[13px] text-slate-300 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-8 pb-8 pt-8 bg-transparent border-0">
                <Button
                  className="w-full h-12 rounded-xl text-[13px] font-semibold border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  variant="outline"
                  onClick={() => handleUpgrade('monthly')}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Start monthly'}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Yearly */}
            <Card className="relative bg-gradient-to-b from-blue-500/[0.05] to-blue-500/[0.01] ring-blue-500/20 rounded-2xl py-0 gap-0 shadow-[0_0_40px_-15px_rgba(59,130,246,0.2)]">
              <CardHeader className="px-8 pt-8 pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold tracking-wider uppercase text-blue-400" style={SG}>
                    Pro Yearly
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                    Save {YEARLY_SAVINGS_LABEL}
                  </span>
                </div>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold text-white" style={SG}>{YEARLY_PRICE_LABEL}</span>
                  <span className="text-lg text-slate-500">/year</span>
                </div>
                <p className="text-[13px] text-slate-500 mt-1.5">
                  That&apos;s <span className="text-slate-300">{YEARLY_PER_MONTH_LABEL}/mo</span>
                </p>
              </CardHeader>
              <CardContent className="px-8 pt-8 flex-1">
                <ul className="space-y-3.5">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="size-4 shrink-0 mt-0.5 text-blue-400" strokeWidth={2.5} />
                      <span className="text-[13px] text-slate-300 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-8 pb-8 pt-8 bg-transparent border-0">
                <Button
                  className="w-full h-12 rounded-xl text-[13px] font-semibold border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  variant="outline"
                  onClick={() => handleUpgrade('yearly')}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Start yearly'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <p className="text-center text-[12px] text-slate-600">
            All content is free. Pro unlocks mock interviews and unlimited AI tutoring.
          </p>
        </div>

      </div>
    </div>
  );
}
