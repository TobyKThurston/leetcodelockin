'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, ArrowRight } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default function ReviewDueWidget() {
  const [dueCount, setDueCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/review/due')
      .then(r => r.json())
      .then(data => {
        if (data.isPro && data.totalDue > 0) {
          setDueCount(data.totalDue);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || dueCount === 0) return null;

  return (
    <section>
      <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
        Review Due
      </p>
      <Link
        href="/review"
        className="block w-full text-left rounded-lg px-3 py-3 border transition-colors bg-amber-500/[0.06] border-amber-500/25 hover:bg-amber-500/10 hover:border-amber-500/40"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Brain size={14} className="text-amber-400" />
          <span className="text-[12.5px] font-semibold text-white" style={SG}>
            {dueCount} card{dueCount === 1 ? '' : 's'} due
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Review your solved problems to strengthen recall
        </p>
        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-amber-400 font-medium">
          <ArrowRight size={10} strokeWidth={2} />
          <span>Start review</span>
        </div>
      </Link>
    </section>
  );
}
