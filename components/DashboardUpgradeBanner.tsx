'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const DISMISSED_KEY = 'lc-dashboard-upgrade-dismissed';

// Always-visible upgrade prompt for free users on the dashboard. Hidden for Pro
// users, hidden for the rest of the session once dismissed. The whole point is
// to surface Pro features (mock interviews, spaced rep) before users hit the
// AI quota wall — it's the first place free users land that even mentions them.
export default function DashboardUpgradeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY) === '1') return;
    fetch('/api/ai-usage')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data && data.isPro === false) setShow(true);
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
      <div
        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: 'rgba(59,130,246,0.15)' }}
      >
        <Sparkles size={14} className="text-blue-300" />
      </div>
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
