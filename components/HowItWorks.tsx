'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

/* ───────────────── Data structure visualizations ─────────────────
   All three visualizations are scroll-driven. Each one reads a
   `--progress` CSS custom property (0 → 1) that is set by the
   scroll handler on the nearest `[data-step]` ancestor. The values
   are mapped to transforms / opacity via inline calc() expressions,
   so the animations scrub forward and back with the scrollbar.
────────────────────────────────────────────────────────────────── */

function SlidingWindowViz() {
  const values = [3, 1, 4, 1, 5, 9, 2, 6];
  return (
    <div className="relative inline-block animate-viz-enter">
      <div className="flex gap-1.5">
        {values.map((v, i) => (
          <div
            key={i}
            className="w-11 h-11 rounded-md flex items-center justify-center font-mono text-sm"
            style={{
              color: 'var(--ll-ink)',
              background: 'var(--ll-bg-elevated)',
              border: '1px solid var(--ll-border)',
            }}
          >
            {v}
          </div>
        ))}
      </div>
      {/* Sliding window overlay: slides from cell 0 to cell 5 as progress goes 0 → 1.
          Cell step = cell width (2.75rem) + gap (0.375rem) = 3.125rem. Max offset = 5 steps. */}
      <div
        className="absolute top-0 left-0 h-11 pointer-events-none"
        style={{
          width: 'calc(3 * 2.75rem + 2 * 0.375rem)',
          border: '2px solid var(--ll-accent)',
          borderRadius: '0.5rem',
          background: 'rgba(59,130,246,0.10)',
          boxShadow: '0 0 18px rgba(59,130,246,0.18)',
          transform: 'translateX(calc(var(--progress, 0) * 15.625rem))',
          willChange: 'transform',
        }}
      />
      <p className="mt-4 text-[10px] uppercase tracking-[0.18em] font-mono" style={{ color: 'var(--ll-ink-subtle)' }}>
        Sliding window
      </p>
    </div>
  );
}

function TwoPointersViz() {
  const values = [1, 3, 5, 7, 9, 11, 13, 15];
  return (
    <div className="relative inline-block animate-viz-enter">
      <div className="flex gap-1.5">
        {values.map((v, i) => (
          <div
            key={i}
            className="w-11 h-11 rounded-md flex items-center justify-center font-mono text-sm"
            style={{
              color: 'var(--ll-ink)',
              background: 'var(--ll-bg-elevated)',
              border: '1px solid var(--ll-border)',
            }}
          >
            {v}
          </div>
        ))}
      </div>
      {/* L pointer: moves from cell 0 → cell 3 as progress goes 0 → 1.
          Each step = 3.125rem (cell width + gap). 3 steps = 9.375rem. */}
      <div
        className="absolute top-11 mt-1 left-0 pointer-events-none"
        style={{
          width: '2.75rem',
          transform: 'translateX(calc(var(--progress, 0) * 9.375rem))',
          opacity: 'clamp(0, calc(var(--progress, 0) * 8), 1)',
          willChange: 'transform, opacity',
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderBottom: '9px solid var(--ll-accent)',
            }}
          />
          <span className="text-[12px] font-mono font-bold mt-1" style={{ color: 'var(--ll-accent)' }}>L</span>
        </div>
      </div>
      {/* R pointer: moves from cell 7 → cell 4 as progress goes 0 → 1.
          Starts at 7 * 3.125rem = 21.875rem, moves back 9.375rem. */}
      <div
        className="absolute top-11 mt-1 left-0 pointer-events-none"
        style={{
          width: '2.75rem',
          transform: 'translateX(calc(21.875rem - var(--progress, 0) * 9.375rem))',
          opacity: 'clamp(0, calc(var(--progress, 0) * 8), 1)',
          willChange: 'transform, opacity',
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderBottom: '9px solid #a5b4fc',
            }}
          />
          <span className="text-[12px] font-mono font-bold mt-1" style={{ color: '#a5b4fc' }}>R</span>
        </div>
      </div>
      <p className="mt-12 text-[10px] uppercase tracking-[0.18em] font-mono" style={{ color: 'var(--ll-ink-subtle)' }}>
        Two pointers
      </p>
    </div>
  );
}

function HashMapViz() {
  // Each row becomes visible when scroll progress crosses its threshold.
  const entries: { k: string; v: string; t: number }[] = [
    { k: "'apple'",  v: '3', t: 0.05 },
    { k: "'banana'", v: '1', t: 0.25 },
    { k: "'cherry'", v: '5', t: 0.45 },
    { k: "'date'",   v: '2', t: 0.65 },
  ];
  return (
    <div className="inline-block animate-viz-enter">
      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <div
            key={e.k}
            className="flex items-center gap-2 font-mono text-sm"
            style={
              {
                '--row-threshold': String(e.t),
                opacity:
                  'clamp(0, calc((var(--progress, 0) - var(--row-threshold, 0)) * 7), 1)',
                willChange: 'opacity',
              } as CSSProperties
            }
          >
            <div
              className="px-3 py-1.5 rounded-md text-right"
              style={{
                color: 'var(--ll-ink)',
                background: 'var(--ll-bg-elevated)',
                border: '1px solid var(--ll-border)',
                width: '104px',
              }}
            >
              {e.k}
            </div>
            <span style={{ color: 'var(--ll-accent)' }}>→</span>
            <div
              className="px-3 py-1.5 rounded-md text-center"
              style={{
                color: 'var(--ll-accent)',
                background: 'rgba(59,130,246,0.10)',
                border: '1px solid rgba(59,130,246,0.40)',
                width: '44px',
              }}
            >
              {e.v}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-[0.18em] font-mono" style={{ color: 'var(--ll-ink-subtle)' }}>
        Hash map
      </p>
    </div>
  );
}

const VIZ_COMPONENTS = [SlidingWindowViz, TwoPointersViz, HashMapViz] as const;

const steps = [
  {
    n: '01',
    title: 'Learn the Pattern',
    body: 'Before you touch a problem, you learn the framework behind it. Sliding window. Two pointers. Hash maps. Understand why each pattern exists and when to reach for it.',
  },
  {
    n: '02',
    title: 'Solve with Guidance',
    body: 'Progressive hints move your thinking forward: broad to specific to concrete. You arrive at the answer yourself. That\'s what makes it actually stick.',
  },
  {
    n: '03',
    title: 'Master the Pattern',
    body: 'Track which patterns you\'ve internalized. Problems stop feeling random and start feeling familiar. One pattern unlocks dozens of problems.',
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const els = Array.from(
      container.querySelectorAll<HTMLElement>('[data-step]')
    );

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let raf = 0;

    const update = () => {
      const wh = window.innerHeight;

      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const norm = center / wh;

        const py = (norm - 0.5) * 70;

        let op: number;
        if (norm > 1) op = 0;
        else if (norm > 0.78) op = (1 - norm) / 0.22;
        else if (norm > 0.22) op = 1;
        else if (norm > 0) op = norm / 0.22;
        else op = 0;
        op = Math.max(0, Math.min(1, op));

        // Scroll-driven animation progress (0 → 1) as the step rises from
        // the bottom of the viewport (norm ≈ 0.9) to the middle (norm ≈ 0.5).
        // Reaches 1 by the time the step is at reading position and stays there.
        let progress: number;
        if (norm > 0.9) progress = 0;
        else if (norm > 0.5) progress = (0.9 - norm) / 0.4;
        else progress = 1;
        progress = Math.max(0, Math.min(1, progress));

        el.style.transform = `translateY(${py}px)`;
        el.style.opacity = String(op);
        el.style.setProperty(
          '--progress',
          prefersReducedMotion ? '1' : progress.toFixed(4)
        );
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Run immediately to catch elements already in viewport
    update();
    // Run again after a frame to handle any layout shifts from hydration
    raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="how-it-works" className="relative px-6 sm:px-10 py-32" style={{ scrollMarginTop: '80px' }}>
      <div ref={containerRef} className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-32">
          <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-4" style={{ color: 'var(--ll-accent)' }}>
            How It Works
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{ color: 'var(--ll-ink)', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif' }}
          >
            A system, not a<br />pile of problems.
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-36">
          {steps.map((step, i) => {
            const Viz = VIZ_COMPONENTS[i];
            return (
              <div
                key={step.n}
                data-step
                style={{ willChange: 'transform, opacity', opacity: 0 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? 'md:[direction:rtl]' : ''
                }`}
              >
                {/* Visualization */}
                <div className={`flex ${i % 2 === 1 ? 'md:[direction:ltr] md:justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col gap-5">
                    <span
                      className="font-mono text-[11px] tracking-[0.2em] uppercase"
                      style={{ color: 'var(--ll-ink-subtle)' }}
                    >
                      Step {step.n}
                    </span>
                    <Viz />
                  </div>
                </div>

                {/* Content */}
                <div className={i % 2 === 1 ? 'md:[direction:ltr]' : ''}>
                  <h3
                    className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight"
                    style={{ color: 'var(--ll-ink)', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
