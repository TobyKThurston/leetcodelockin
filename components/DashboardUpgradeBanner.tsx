'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const DISMISSED_KEY = 'lc-dashboard-upgrade-dismissed';
const MIN_SOLVED = 3;

// Upgrade prompt for engaged free users on the dashboard. Gated on actual
// problem-solving (>= 3 accepted submissions, sourced from /api/solved-slugs
// which reads problem_submissions — onboarding skips write to `progress`, not
// `problem_submissions`, so they're correctly excluded). Hidden for Pro users
// and dismissed users. The point is to surface Pro features when users are
// already invested, not as a first impression that gets dismiss-on-sight.
export default function DashboardUpgradeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY) === '1') return;
    Promise.all([
      fetch('/api/ai-usage').then(r => (r.ok ? r.json() : null)),
      fetch('/api/solved-slugs').then(r => (r.ok ? r.json() : null)),
    ])
      .then(([usage, solved]) => {
        const isFree = usage && usage.isPro === false;
        const solvedCount = Array.isArray(solved?.slugs) ? solved.slugs.length : 0;
        if (isFree && solvedCount >= MIN_SOLVED) setShow(true);
      })
      .catch(() => { /* signed-out users 401 — banner stays hidden */ });
  }, []);

  if (!show) return null;

  function dismiss() {
    setShow(false);
    try { sessionStorage.setItem(DISMISSED_KEY, '1'); } catch {}
  }

  return (
    <div
      className="rounded-xl border border-blue-400/25 px-4 py-3 mb-4 flex items-center gap-3"
      style={{
        background: 'linear-gradient(90deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white" style={SG}>
          Unlock mock interviews + spaced-repetition review
        </p>
        <p className="text-[11.5px] text-slate-400 leading-snug">
          Pro adds timed AI interviews, personalized flashcards from your solutions, and unlimited tutor messages.
        </p>
      </div>
      <a
        href="/checkout?plan=yearly&from=/dashboard"
        className="shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-md text-[12px] font-semibold text-white bg-blue-500 hover:bg-blue-400 border border-blue-400/60 transition-colors"
        style={SG}
      >
        See Pro
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-slate-500 hover:text-white transition-colors p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
