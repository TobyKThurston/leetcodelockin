'use client';

import { useState, useEffect, useRef } from 'react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

interface InterviewTimerProps {
  deadlineMs: number;
  onExpired: () => void;
}

export default function InterviewTimer({ deadlineMs, onExpired }: InterviewTimerProps) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadlineMs - Date.now()));
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    let rafId: number;
    function tick() {
      const left = Math.max(0, deadlineMs - Date.now());
      setRemainingMs(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpired();
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [deadlineMs, onExpired]);

  const totalSec = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Color transitions: white > amber < 10min > red < 3min
  let color = 'rgba(255,255,255,0.9)';
  let glow = 'none';
  if (totalSec <= 180) {
    color = 'rgba(248,113,113,0.95)';
    glow = '0 0 12px rgba(239,68,68,0.4)';
  } else if (totalSec <= 600) {
    color = 'rgba(251,191,36,0.9)';
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
