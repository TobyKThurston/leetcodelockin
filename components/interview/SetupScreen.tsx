'use client';

import { useState } from 'react';
import { Clock, Zap, ArrowRight } from 'lucide-react';
import type { InterviewDifficulty } from '@/lib/interview';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

interface SetupScreenProps {
  onStart: (difficulty: InterviewDifficulty) => void;
  loading: boolean;
}

const DIFFICULTIES: { id: InterviewDifficulty; label: string; sub: string; tag: string; tagColor: string }[] = [
  {
    id: 'easy-medium',
    label: 'Easy + Medium',
    sub: 'Build confidence and nail the fundamentals',
    tag: 'Recommended',
    tagColor: 'rgba(52,211,153,0.7)',
  },
  {
    id: 'medium-hard',
    label: 'Medium + Hard',
    sub: 'Push yourself with real interview difficulty',
    tag: 'Challenge',
    tagColor: 'rgba(251,191,36,0.7)',
  },
];

export default function SetupScreen({ onStart, loading }: SetupScreenProps) {
  const [selected, setSelected] = useState<InterviewDifficulty>('easy-medium');

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-[26px] font-bold text-white tracking-tight" style={SG}>
            New Mock Interview
          </h1>
          <p className="text-[14px] text-zinc-400">
            Choose your difficulty and start the clock.
          </p>
        </div>

        {/* Difficulty cards */}
        <div className="grid grid-cols-2 gap-3">
          {DIFFICULTIES.map(d => {
            const active = selected === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className="text-left rounded-xl px-5 py-5 transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                  border: active
                    ? '1.5px solid rgba(59,130,246,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: active ? '0 0 20px rgba(59,130,246,0.1)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[15px] font-semibold text-white" style={SG}>{d.label}</span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color: d.tagColor, background: `${d.tagColor}15` }}
                  >
                    {d.tag}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{d.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Rules */}
        <div className="flex items-center justify-center gap-6 text-[12px] text-zinc-500" style={SG}>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-zinc-600" />
            45 minutes, no pause
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={13} className="text-zinc-600" />
            2 problems, submitted together
          </span>
        </div>

        {/* Start button */}
        <div className="flex justify-center">
          <button
            onClick={() => onStart(selected)}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-[15px] font-semibold text-white transition-all hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.25) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 12px 32px -12px rgba(59,130,246,0.75), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            {loading ? 'Setting up…' : 'Start Interview'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
