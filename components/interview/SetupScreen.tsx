'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Zap, Mic, MicOff, ArrowRight } from 'lucide-react';
import type { InterviewDifficulty } from '@/lib/interview';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

type Format = 'silent' | 'voice';
type Duration = 30 | 45;

interface SetupScreenProps {
  onStart: (difficulty: InterviewDifficulty) => void;
  loading: boolean;
}

const DIFFICULTIES: { id: InterviewDifficulty; label: string; sub: string; tag: string; tagColor: string; tagBg: string }[] = [
  {
    id: 'easy-medium',
    label: 'Easy + Medium',
    sub: 'Build confidence and nail the fundamentals',
    tag: 'Recommended',
    tagColor: 'var(--ll-success-ink)',
    tagBg: 'var(--ll-success-soft)',
  },
  {
    id: 'medium-hard',
    label: 'Medium + Hard',
    sub: 'Push yourself with real interview difficulty',
    tag: 'Challenge',
    tagColor: 'var(--ll-warning-ink)',
    tagBg: 'var(--ll-warning-soft)',
  },
];

const DURATIONS: { v: Duration; label: string; sub: string }[] = [
  { v: 30, label: '30 min', sub: 'phone screen' },
  { v: 45, label: '45 min', sub: 'onsite round' },
];

export default function SetupScreen({ onStart, loading }: SetupScreenProps) {
  const router = useRouter();
  const [format, setFormat] = useState<Format>('silent');
  const [selected, setSelected] = useState<InterviewDifficulty>('easy-medium');
  const [duration, setDuration] = useState<Duration>(30);

  const handleStart = () => {
    if (format === 'voice') {
      router.push(`/interview/voice?difficulty=${selected}&duration=${duration}&auto=1`);
      return;
    }
    onStart(selected);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-10">
      <div className="max-w-lg w-full space-y-7">
        <div className="text-center space-y-2">
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight" style={SG}>
            New Mock Interview
          </h1>
          <p className="text-[14px] text-slate-600" style={SG}>
            Pick a format, difficulty, and start the clock.
          </p>
        </div>

        {/* Format picker */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2" style={SG}>
            Format
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              {
                v: 'silent' as const,
                icon: <MicOff size={14} />,
                label: 'Silent',
                sub: '2 problems · 45 min · no audio',
              },
              {
                v: 'voice' as const,
                icon: <Mic size={14} />,
                label: 'Voice',
                sub: '1 problem · live AI interviewer',
                tag: 'New',
                tagColor: '#6d28d9',
                tagBg: 'rgba(168,85,247,0.15)',
                activeColor: 'rgba(168,85,247,0.45)',
                activeBg: 'rgba(168,85,247,0.08)',
                activeGlow: '0 0 20px rgba(168,85,247,0.1)',
              },
            ]).map(f => {
              const active = format === f.v;
              const accent = f.v === 'voice'
                ? { color: 'rgba(216,180,254,0.95)', bg: 'rgba(168,85,247,0.45)', glow: 'rgba(168,85,247,0.1)', activeBg: 'rgba(168,85,247,0.08)' }
                : { color: 'rgba(147,197,253,0.95)', bg: 'rgba(59,130,246,0.4)', glow: 'rgba(59,130,246,0.1)', activeBg: 'rgba(59,130,246,0.06)' };
              return (
                <button
                  key={f.v}
                  onClick={() => setFormat(f.v)}
                  className="text-left rounded-xl px-5 py-4 transition-all"
                  style={{
                    background: active ? accent.activeBg : 'var(--ll-bg-card)',
                    border: active
                      ? `1.5px solid ${accent.bg}`
                      : '1px solid var(--ll-border)',
                    boxShadow: active ? `0 0 20px ${accent.glow}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: active ? accent.color : 'var(--ll-ink-muted)' }}>{f.icon}</span>
                    <span className="text-[14px] font-semibold text-slate-900" style={SG}>{f.label}</span>
                    {'tag' in f && f.tag && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
                        style={{ ...SG, color: f.tagColor, background: f.tagBg }}
                      >
                        {f.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed" style={SG}>{f.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2" style={SG}>
            Difficulty
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTIES.map(d => {
              const active = selected === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className="text-left rounded-xl px-5 py-4 transition-all"
                  style={{
                    background: active ? 'rgba(59,130,246,0.08)' : 'var(--ll-bg-card)',
                    border: active
                      ? '1.5px solid rgba(59,130,246,0.4)'
                      : '1px solid var(--ll-border)',
                    boxShadow: active ? '0 0 20px rgba(59,130,246,0.1)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-slate-900" style={SG}>
                      {format === 'voice'
                        ? (d.id === 'easy-medium' ? 'Medium' : 'Hard')
                        : d.label}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: d.tagColor, background: d.tagBg }}
                    >
                      {d.tag}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed" style={SG}>
                    {format === 'voice'
                      ? (d.id === 'easy-medium' ? 'Standard onsite difficulty' : 'Senior-level challenge')
                      : d.sub}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration (voice only) */}
        {format === 'voice' && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2" style={SG}>
              Duration
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DURATIONS.map(d => {
                const active = duration === d.v;
                return (
                  <button
                    key={d.v}
                    onClick={() => setDuration(d.v)}
                    className="text-center rounded-xl px-5 py-3 transition-all"
                    style={{
                      background: active ? 'rgba(168,85,247,0.10)' : 'var(--ll-bg-card)',
                      border: active
                        ? '1.5px solid rgba(168,85,247,0.45)'
                        : '1px solid var(--ll-border)',
                    }}
                  >
                    <span className="text-[14px] font-semibold text-slate-900" style={SG}>{d.label}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5" style={SG}>{d.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="flex items-center justify-center gap-6 text-[12px] text-slate-500" style={SG}>
          {format === 'voice' ? (
            <>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-600" />
                {duration} minutes
              </span>
              <span className="flex items-center gap-1.5">
                <Mic size={13} className="text-slate-600" />
                Live AI interviewer
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-600" />
                45 minutes, no pause
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-slate-600" />
                2 problems, submitted together
              </span>
            </>
          )}
        </div>

        {/* Start button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-[15px] font-semibold text-white transition-all hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(15,23,42,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 12px 32px -12px rgba(59,130,246,0.75), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            {loading ? 'Setting up…' : (format === 'voice' ? 'Continue to mic check' : 'Start Interview')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
