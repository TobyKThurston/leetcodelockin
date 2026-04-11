'use client';

import Link from 'next/link';
import { Lock, Clock, Brain, TrendingUp } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const FEATURES = [
  { icon: Clock, label: '45-min timed sessions', desc: 'Real interview pressure with countdown' },
  { icon: Brain, label: 'AI post-interview feedback', desc: 'Detailed analysis of your approach and code' },
  { icon: TrendingUp, label: 'Track improvement', desc: 'See your scores trend upward over time' },
];

export default function LockedScreen() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <Lock size={28} style={{ color: 'rgba(196,181,253,0.8)' }} />
        </div>

        <div className="space-y-3">
          <h1 className="text-[24px] font-bold text-white tracking-tight" style={SG}>
            Mock Interviews
          </h1>
          <p className="text-[14px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Simulate real coding interviews with timed problem sets and AI-powered feedback on your approach.
          </p>
        </div>

        <div className="space-y-3 text-left">
          {FEATURES.map(f => (
            <div
              key={f.label}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <f.icon size={18} className="shrink-0 mt-0.5" style={{ color: 'rgba(139,92,246,0.7)' }} />
              <div>
                <p className="text-[13px] font-medium text-zinc-200" style={SG}>{f.label}</p>
                <p className="text-[12px] text-zinc-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
            border: '1px solid rgba(196,181,253,0.5)',
            boxShadow: '0 12px 32px -12px rgba(139,92,246,0.6), 0 0 0 1px rgba(167,139,250,0.3)',
            ...SG,
          }}
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
