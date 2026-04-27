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

  // Color transitions: ink-strong > amber < 10min > red < 3min > red (overtime).
  // Default uses a theme-aware token so the timer stays readable on both the
  // pale interview chrome and the dark-mode chrome.
  let color = 'var(--ll-ink-strong)';
  let glow = 'none';
  if (overtime) {
    color = 'var(--ll-danger-ink)';
    glow = '0 0 16px rgba(239,68,68,0.55)';
  } else if (totalSec <= 180) {
    color = 'var(--ll-danger-ink)';
    glow = '0 0 12px rgba(239,68,68,0.4)';
  } else if (totalSec <= 600) {
    color = 'var(--ll-warning-ink)';
    glow = '0 0 8px rgba(245,158,11,0.25)';
  }

  return (
    <div className="flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span
        className="text-[15px] font-bold tabular-nums tracking-tight"
        style={{ ...MONO, color, textShadow: glow }}
      >
        {display}
      </span>
    </div>
  );
}
