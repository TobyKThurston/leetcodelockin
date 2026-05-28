'use client';

import { useState, useEffect } from 'react';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

interface InterviewTimerProps {
  deadlineMs: number;
}

export default function InterviewTimer({ deadlineMs }: InterviewTimerProps) {
  const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now());

  useEffect(() => {
    let rafId: number;
    function tick() {
      setRemainingMs(deadlineMs - Date.now());
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [deadlineMs]);

  const overtime = remainingMs < 0;
  const absMs = Math.abs(remainingMs);
  const totalSec = Math.ceil(absMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const display = `${overtime ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Color transitions: bright white > amber < 10min > red < 3min > red (overtime)
  let color = '#ffffff';
  let glow = '0 0 10px rgba(96,165,250,0.45)';
  let pillBg = 'rgba(96,165,250,0.1)';
  let pillBorder = 'rgba(96,165,250,0.3)';
  if (overtime) {
    color = '#fca5a5';
    glow = '0 0 16px rgba(239,68,68,0.6)';
    pillBg = 'rgba(239,68,68,0.12)';
    pillBorder = 'rgba(248,113,113,0.4)';
  } else if (totalSec <= 180) {
    color = '#fca5a5';
    glow = '0 0 14px rgba(239,68,68,0.5)';
    pillBg = 'rgba(239,68,68,0.1)';
    pillBorder = 'rgba(248,113,113,0.35)';
  } else if (totalSec <= 600) {
    color = '#fcd34d';
    glow = '0 0 12px rgba(245,158,11,0.4)';
    pillBg = 'rgba(245,158,11,0.1)';
    pillBorder = 'rgba(251,191,36,0.35)';
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-lg"
      style={{ background: pillBg, border: `1px solid ${pillBorder}` }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span
        className="text-[16px] font-bold tabular-nums tracking-tight"
        style={{ ...MONO, color, textShadow: glow }}
      >
        {display}
      </span>
    </div>
  );
}
