'use client';

import { useState } from 'react';
import { Clock, Brain, TrendingUp, Zap, ArrowRight, Code2, Timer, BarChart3, Sparkles, Check } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const FEATURES = [
  {
    icon: Timer,
    label: 'Timed pressure',
    desc: '45-minute countdown with 2 real problems — just like the actual interview.',
    color: '#60a5fa',
  },
  {
    icon: Brain,
    label: 'AI-powered debrief',
    desc: 'Get a detailed breakdown of your approach, code quality, and time management after every session.',
    color: '#a78bfa',
  },
  {
    icon: BarChart3,
    label: 'Track your arc',
    desc: 'Watch your scores climb over time. Know exactly when you\'re ready to apply.',
    color: '#34d399',
  },
  {
    icon: Code2,
    label: 'Real problems, smart selection',
    desc: 'Problems rotate based on what you\'ve seen and solved — no repeats, always fresh.',
    color: '#fbbf24',
  },
];

const HOW_IT_WORKS = [
  { step: '01', label: 'Pick your difficulty', desc: 'Easy + Medium or Medium + Hard' },
  { step: '02', label: 'Solve 2 problems in 45 min', desc: 'Full editor, test runner, real pressure' },
  { step: '03', label: 'Get your AI debrief', desc: 'Approach, correctness, time splits, readiness level' },
];

const SCORE_BARS = [4, 5, 6, 5, 7, 6, 8, 7, 9, 8];

export default function LockedScreen() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(period: 'monthly' | 'yearly') {
    const priceId = period === 'monthly'
      ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '')
      : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY ?? '');
    if (!priceId) return;
    setLoading(period);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Sparkles size={12} />
            Pro Feature
          </div>

          <h1 className="text-[32px] sm:text-[40px] font-bold text-white tracking-tight leading-[1.1]" style={SG}>
            Stop guessing if you&apos;re<br />interview ready.
          </h1>
          <p className="text-[15px] sm:text-[16px] text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Simulate real coding interviews under timed pressure, then get AI-powered feedback that tells you exactly where you stand and what to work on next.
          </p>
        </div>

        {/* ── Score preview ────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-6 py-6 sm:px-8"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1" style={SG}>Your trajectory</p>
              <p className="text-[13px] text-zinc-400">See exactly how fast you&apos;re improving</p>
            </div>
            <div className="text-right">
              <p className="text-[28px] font-bold text-emerald-400" style={MONO}>9.2</p>
              <p className="text-[11px] text-zinc-500">latest score</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-16">
            {SCORE_BARS.map((score, i) => {
              const h = Math.max(8, (score / 10) * 64);
              const isLast = i === SCORE_BARS.length - 1;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-md transition-all"
                  style={{
                    height: h,
                    background: isLast
                      ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                      : `rgba(${score >= 7 ? '52,211,153' : score >= 5 ? '251,191,36' : '248,113,113'}, ${0.25 + (i / SCORE_BARS.length) * 0.35})`,
                    boxShadow: isLast ? '0 0 12px rgba(52,211,153,0.4)' : 'none',
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600" style={MONO}>
            <span>Session 1</span>
            <span>Session 10</span>
          </div>
        </div>

        {/* ── Features grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.label}
              className="rounded-xl px-5 py-5 space-y-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}
              >
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-zinc-100 mb-1" style={SG}>{f.label}</p>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
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
                <span className="text-[32px] font-bold absolute top-4 right-5" style={{ ...MONO, color: 'rgba(255,255,255,0.04)' }}>
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

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-6 py-8 sm:px-10 text-center space-y-6"
          style={{
            background: 'linear-gradient(180deg, rgba(139,92,246,0.06) 0%, rgba(59,130,246,0.04) 100%)',
            border: '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <div className="space-y-2">
            <h2 className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight" style={SG}>
              Ready to find out where you stand?
            </h2>
            <p className="text-[14px] text-zinc-400 max-w-md mx-auto">
              Unlock mock interviews, unlimited AI tutoring, and everything else in Pro.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleCheckout('yearly')}
              disabled={loading !== null}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{
                background: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
                border: '1px solid rgba(196,181,253,0.5)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 16px 40px -12px rgba(139,92,246,0.5), 0 0 0 1px rgba(167,139,250,0.3)',
                ...SG,
              }}
            >
              {loading === 'yearly' ? 'Loading...' : (
                <>
                  Go Pro — $7.50/mo
                  <ArrowRight size={15} />
                </>
              )}
            </button>
            <button
              onClick={() => handleCheckout('monthly')}
              disabled={loading !== null}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-200 hover:bg-white/[0.03] disabled:opacity-50"
              style={{ border: '1px solid rgba(255,255,255,0.06)', ...SG }}
            >
              {loading === 'monthly' ? 'Loading...' : 'or $9/month'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-5 text-[12px] text-zinc-500">
            <span className="flex items-center gap-1.5"><Check size={13} className="text-zinc-600" />Cancel anytime</span>
            <span className="flex items-center gap-1.5"><Zap size={13} className="text-zinc-600" />Instant access</span>
          </div>
        </div>

      </div>
    </div>
  );
}
