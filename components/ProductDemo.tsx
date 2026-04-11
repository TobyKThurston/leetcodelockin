'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

const CODE = `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            return [seen[comp], i]
        seen[num] = i`;

type Phase = 'typing' | 'idle' | 'submitting' | 'accepted';

export default function ProductDemo() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [charIndex, setCharIndex] = useState(0);
  const [hintsVisible, setHintsVisible] = useState(0);
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // Check if already in viewport before setting up observer
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const typed = CODE.slice(0, charIndex);
  const lines = typed.split('\n');

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (charIndex >= CODE.length) {
        t = setTimeout(() => setPhase('idle'), 700);
      } else {
        t = setTimeout(() => setCharIndex((c) => c + 1), 26);
      }
    } else if (phase === 'idle') {
      t = setTimeout(() => setPhase('submitting'), 900);
    } else if (phase === 'submitting') {
      t = setTimeout(() => setPhase('accepted'), 1300);
    } else if (phase === 'accepted') {
      const h1 = setTimeout(() => setHintsVisible(1), 350);
      const h2 = setTimeout(() => setHintsVisible(2), 750);
      const h3 = setTimeout(() => setHintsVisible(3), 1150);
      const loop = setTimeout(() => {
        setPhase('typing');
        setCharIndex(0);
        setHintsVisible(0);
      }, 8000);
      return () => [h1, h2, h3, loop].forEach(clearTimeout);
    }

    return () => clearTimeout(t);
  }, [phase, charIndex]);

  const submitLabel =
    phase === 'accepted' ? 'Accepted' : phase === 'submitting' ? 'Running\u2026' : 'Submit';

  return (
    <section className="relative flex flex-col items-center bg-[#0b1220] px-4 sm:px-6 pt-8 sm:pt-12 pb-0">
      {/* Mockup — peeks into the viewport, fades in on scroll */}
      <div
        ref={wrapperRef}
        className="w-full max-w-6xl rounded-t-2xl overflow-hidden shadow-[0_-10px_80px_rgba(99,102,241,0.18),0_0_200px_rgba(59,130,246,0.08)] border border-b-0 border-white/[0.08]"
        style={{
          background: '#0a0e1a',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Chrome bar */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05]"
          style={{ background: '#080c16' }}
        >
          <div className="flex gap-1.5">
            {['#1e2736', '#1e2736', '#1e2736'].map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-[12px] text-slate-600 font-mono px-4 py-1 rounded-md bg-[#0d1117]">
              leetlockin.com/tutor
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]" style={{ minHeight: 560 }}>
          {/* Left — problem + editor */}
          <div className="flex flex-col border-r border-white/[0.05]">
            {/* Problem header */}
            <div className="px-7 py-5 border-b border-white/[0.04]">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium tracking-wide">
                  Easy
                </span>
                <span className="text-[13px] font-semibold text-slate-300 tracking-tight">
                  1. Two Sum
                </span>
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed max-w-lg">
                Given an array of integers <code className="text-slate-500 font-mono">nums</code> and
                an integer <code className="text-slate-500 font-mono">target</code>, return indices of
                the two numbers that add up to target.
              </p>
            </div>

            {/* Code editor */}
            <div className="flex-1 px-7 py-6 font-mono text-[13.5px] leading-[1.85]">
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="w-5 shrink-0 text-right text-[#222d3d] mr-6 select-none text-[12px] leading-[1.85]">
                    {i + 1}
                  </span>
                  <span className="text-slate-400 whitespace-pre">
                    {line}
                    {i === lines.length - 1 && phase === 'typing' && (
                      <span className="animate-cursor-blink inline-block w-[2px] h-[14px] bg-blue-400 ml-[1px] align-middle" />
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Submit bar */}
            <div className="px-7 py-4 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-slate-700 font-mono">Python 3</span>
              <button
                className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-400 ${
                  phase === 'accepted'
                    ? 'bg-green-500/10 text-green-400 border-green-500/25'
                    : phase === 'submitting'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : phase === 'idle'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-transparent text-slate-600 border-white/[0.06]'
                }`}
              >
                {phase === 'accepted' && <Check className="w-3 h-3" />}
                {phase === 'submitting' && (
                  <span className="block w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                )}
                {submitLabel}
              </button>
            </div>
          </div>

          {/* Right — tutor panel */}
          <div className="flex flex-col px-6 py-6 gap-3">
            <p className="text-[10px] font-semibold text-slate-700 tracking-[0.18em] uppercase mb-1">
              LeetLockin Tutor
            </p>

            {/* Pattern card */}
            <div
              className="rounded-xl border border-white/[0.04] p-5 space-y-1.5"
              style={{
                background: '#0d1117',
                opacity: hintsVisible >= 1 ? 1 : 0,
                transform: hintsVisible >= 1 ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <p className="text-[10px] text-blue-400/60 tracking-[0.15em] uppercase font-medium">Pattern</p>
              <p className="text-[14px] text-slate-200 font-semibold">Hash Map</p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Store each complement as a key. One pass, look up before you insert.
              </p>
            </div>

            {/* Complexity card */}
            <div
              className="rounded-xl border border-white/[0.04] p-5 space-y-1.5"
              style={{
                background: '#0d1117',
                opacity: hintsVisible >= 2 ? 1 : 0,
                transform: hintsVisible >= 2 ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <p className="text-[10px] text-slate-600 tracking-[0.15em] uppercase font-medium">Complexity</p>
              <p className="text-[14px] text-slate-200 font-semibold">O(n) time · O(n) space</p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Optimal. Single pass through the array.
              </p>
            </div>

            {/* Verdict */}
            <div
              className="rounded-xl border border-green-500/20 p-5"
              style={{
                background: 'rgba(16,185,129,0.04)',
                opacity: hintsVisible >= 3 ? 1 : 0,
                transform: hintsVisible >= 3 ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-3.5 h-3.5 text-green-400" />
                <p className="text-[13px] text-green-400 font-semibold">Accepted</p>
              </div>
              <p className="text-[11px] text-slate-600">Runtime: 52ms · Beats 98.4% of submissions</p>
            </div>

            {/* Spacer + tagline */}
            <div className="mt-auto pt-4 border-t border-white/[0.04]">
              <p className="text-[11px] text-slate-700 leading-relaxed">
                You arrived at the answer yourself.<br />
                That&apos;s what makes it stick.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
