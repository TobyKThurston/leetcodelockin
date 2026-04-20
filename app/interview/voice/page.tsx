'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import VoiceSession from '@/components/voice/VoiceSession';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

type Difficulty = 'easy-medium' | 'medium-hard';
type Duration = 30 | 45;

export default function VoiceInterviewPage() {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy-medium');
  const [duration, setDuration] = useState<Duration>(30);

  if (started) {
    return <VoiceSession difficulty={difficulty} durationMin={duration} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0b1220' }}>
      <div className="max-w-md w-full space-y-6">
        <div>
          <Link
            href="/interview"
            className="text-[11px] uppercase tracking-[0.16em] text-slate-500 hover:text-slate-300 font-semibold"
            style={SG}
          >
            ← Interview
          </Link>
          <h1 className="text-[28px] font-bold text-white mt-3" style={SG}>
            Voice mock interview
          </h1>
          <p className="text-[14px] text-slate-400 mt-2 leading-relaxed" style={SG}>
            One problem, live voice interviewer, graded debrief. Think aloud like a real interview — your AI interviewer will stay quiet while you work, and push you when it&apos;s time.
          </p>
        </div>

        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2" style={SG}>
              Difficulty
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: 'easy-medium' as const, label: 'Medium', sub: 'easy–medium tier' },
                { v: 'medium-hard' as const, label: 'Hard', sub: 'medium–hard tier' },
              ]).map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setDifficulty(opt.v)}
                  className="text-left rounded-lg px-3 py-2 transition-all"
                  style={{
                    background: difficulty === opt.v ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${difficulty === opt.v ? 'rgba(96,165,250,0.55)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <p className="text-[14px] font-semibold text-white" style={SG}>{opt.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5" style={SG}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2" style={SG}>
              Duration
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([30, 45] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="text-center rounded-lg px-3 py-2 transition-all"
                  style={{
                    background: duration === d ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${duration === d ? 'rgba(96,165,250,0.55)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <p className="text-[14px] font-semibold text-white" style={SG}>{d} min</p>
                  <p className="text-[11px] text-slate-500 mt-0.5" style={SG}>
                    {d === 30 ? 'phone screen' : 'onsite round'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold text-white"
          style={{
            ...SG,
            background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
            border: '1px solid rgba(147,197,253,0.55)',
            boxShadow: '0 10px 24px -12px rgba(59,130,246,0.6)',
          }}
        >
          Continue
          <ArrowRight size={15} />
        </button>

        <p className="text-[11px] text-slate-600 text-center leading-relaxed" style={SG}>
          Desktop only · Free users get one trial · Pro users get 10 per month
        </p>
      </div>
    </div>
  );
}
