'use client';

import { useState } from 'react';
import { Brain, ArrowRight, Code2, Timer, BarChart3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const HOW_IT_WORKS = [
  { step: '01', label: 'Pick your difficulty', desc: 'Easy + Medium or Medium + Hard' },
  { step: '02', label: 'Solve 2 problems in 45 min', desc: 'Full editor, test runner, real pressure' },
  { step: '03', label: 'Get your AI debrief', desc: 'Approach, correctness, time splits, readiness level' },
];

export default function LockedScreen() {
  const [loading, setLoading] = useState(false);

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
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-5">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-500" style={SG}>
            Pro Feature
          </span>

          <h1 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight leading-[1.1]" style={SG}>
            Stop guessing if you&apos;re<br />interview ready.
          </h1>
          <p className="text-[15px] sm:text-[16px] text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Simulate real coding interviews under timed pressure, then get AI-powered feedback that tells you exactly where you stand and what to work on next.
          </p>
        </div>

        {/* ── How it works ─────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-600 mb-5 text-center" style={SG}>
            How it works
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {HOW_IT_WORKS.map((s, i) => (
              <div
                key={s.step}
                className="flex-1 rounded-xl px-5 py-5 relative"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-[32px] font-bold absolute top-4 right-5" style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace', color: 'rgba(255,255,255,0.04)' }}>
                  {s.step}
                </span>
                <p className="text-[14px] font-semibold text-zinc-100 mb-1" style={SG}>{s.label}</p>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{s.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight size={14} className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-zinc-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Pro upgrade banner ───────────────────────────────────── */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Lock size={18} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold text-white mb-1" style={SG}>
                Upgrade to Pro for Mock Interviews
              </h3>
              <p className="text-[12.5px] text-slate-400 leading-relaxed mb-3">
                Timed 45-minute sessions with real problems, AI-powered debriefs on your approach and code quality, and score tracking so you know exactly when you&apos;re ready.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-white text-zinc-900 hover:bg-zinc-100 text-[12px] font-semibold h-7 px-3"
                  onClick={() => handleUpgrade(monthlyPriceId)}
                  disabled={loading || !monthlyPriceId}
                >
                  {loading ? 'Loading...' : '$9/month'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-[12px] font-semibold h-7 px-3"
                  onClick={() => handleUpgrade(yearlyPriceId)}
                  disabled={loading || !yearlyPriceId}
                >
                  $90/year (save $18)
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
