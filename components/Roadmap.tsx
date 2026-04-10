'use client';

import { useEffect, useRef } from 'react';

const stages = [
  {
    n: '01',
    title: 'Python Foundations',
    sub: 'Build the base before anything else.',
    topics: [
      'Variables & types',
      'Loops & conditionals',
      'Functions & scope',
      'Lists, dicts & sets',
      'List comprehensions',
      'Recursion basics',
    ],
  },
  {
    n: '02',
    title: 'Core Data Structures',
    sub: 'Understand the tools before the problems.',
    topics: [
      'Arrays & strings',
      'Hash maps',
      'Stacks & queues',
      'Linked lists',
      'Binary trees',
      'Graphs',
    ],
  },
  {
    n: '03',
    title: 'Pattern Library',
    sub: 'Every LeetCode problem maps to one of these.',
    topics: [
      'Sliding window',
      'Two pointers',
      'BFS & DFS',
      'Binary search',
      'Dynamic programming',
      'Backtracking',
    ],
  },
  {
    n: '04',
    title: 'Interview Ready',
    sub: 'Targeted sets by company and role.',
    topics: [
      'Google · Meta · Amazon',
      'Apple · Microsoft',
      'Startup tracks',
      'Company-specific patterns',
      'Timed mock problems',
      'Behavioral + system design',
    ],
  },
];

type Stage = (typeof stages)[number];

function StageContent({ stage, dir }: { stage: Stage; dir: 'left' | 'right' }) {
  return (
    <>
      <h3
        className={`text-xl font-semibold text-[#e2e8f0] tracking-tight mb-2 ${
          dir === 'left' ? 'text-right' : 'text-left'
        }`}
      >
        {stage.title}
      </h3>
      <p
        className={`text-sm text-slate-600 leading-relaxed mb-6 ${
          dir === 'left' ? 'text-right' : 'text-left'
        }`}
      >
        {stage.sub}
      </p>
      <ul className={`space-y-2.5 ${dir === 'left' ? 'flex flex-col items-end' : ''}`}>
        {stage.topics.map((topic) => (
          <li
            key={topic}
            className={`flex items-center gap-2.5 text-sm text-slate-500 ${
              dir === 'left' ? 'flex-row-reverse' : ''
            }`}
          >
            <span className="w-[3px] h-[3px] rounded-full bg-slate-700 shrink-0" />
            {topic}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Roadmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const contentEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-parallax]')
    );
    const nodeEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-node]')
    );
    const fillEl = container.querySelector<HTMLElement>('[data-fill]');

    let raf = 0;

    const update = () => {
      const wh = window.innerHeight;
      let maxFill = 0;

      contentEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const norm = center / wh; // 0 = top of vp, 1 = bottom of vp

        // Parallax: element 60px lower when entering from bottom, 60px higher when exiting top
        const py = (norm - 0.5) * 80;

        // Opacity: fade zone is top/bottom 22% of viewport
        let op: number;
        if (norm > 1.0) op = 0;
        else if (norm > 0.78) op = (1 - norm) / 0.22;
        else if (norm > 0.22) op = 1;
        else if (norm > 0) op = norm / 0.22;
        else op = 0;
        op = Math.max(0, Math.min(1, op));

        el.style.transform = `translateY(${py}px)`;
        el.style.opacity = String(op);

        // Node activation
        const node = nodeEls[i];
        if (node) {
          const active = op > 0.45;
          node.style.borderColor = active
            ? 'rgba(59,130,246,0.4)'
            : 'rgba(255,255,255,0.06)';
          node.style.background = active ? 'rgba(23,37,84,0.7)' : '#0c1422';
          node.style.boxShadow = active
            ? '0 0 22px rgba(59,130,246,0.18)'
            : 'none';
          const span = node.querySelector<HTMLElement>('span');
          if (span) span.style.color = active ? '#60a5fa' : '#334155';
        }

        if (op > 0.4) {
          maxFill = Math.max(maxFill, ((i + 0.6) / stages.length) * 100);
        }
      });

      if (fillEl) fillEl.style.height = `${maxFill}%`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial call — needs a small delay so layout is settled
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="roadmap" className="relative px-4 sm:px-6 pt-36 pb-0 overflow-hidden" style={{ scrollMarginTop: '80px' }}>
      {/* Top bleed only — bottom stays open so the line continues into LockInCTA */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0b1220] to-transparent pointer-events-none z-10" />

      <div ref={containerRef} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-28">
          <p className="text-[11px] text-slate-600 tracking-[0.2em] uppercase font-medium mb-4">
            Curriculum
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#e2e8f0] tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            From zero to
            <br />
            interview-ready.
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Track */}
          <div className="absolute left-1/2 -translate-x-1/2 top-5 bottom-5 w-px bg-white/[0.05]" />
          {/* Animated fill */}
          <div
            data-fill
            className="absolute left-1/2 -translate-x-1/2 top-5 w-px"
            style={{
              height: '0%',
              background:
                'linear-gradient(to bottom, rgba(59,130,246,0.55), rgba(59,130,246,0.08))',
              transition: 'height 0.35s ease-out',
            }}
          />

          <div className="flex flex-col gap-24">
            {stages.map((stage, i) => {
              const contentLeft = i % 2 !== 0;
              return (
                <div
                  key={stage.n}
                  className="grid grid-cols-[1fr_56px_1fr] items-start"
                >
                  {/* Left cell */}
                  <div className="pr-10 flex justify-end pt-1">
                    {contentLeft && (
                      <div
                        data-parallax
                        style={{ willChange: 'transform, opacity', opacity: 0 }}
                      >
                        <StageContent stage={stage} dir="left" />
                      </div>
                    )}
                  </div>

                  {/* Node */}
                  <div className="flex justify-center pt-1 z-10">
                    <div
                      data-node
                      className="w-10 h-10 rounded-full border flex items-center justify-center"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        background: '#0c1422',
                        transition:
                          'border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease',
                      }}
                    >
                      <span
                        className="text-[11px] font-mono font-bold"
                        style={{
                          color: '#334155',
                          transition: 'color 0.4s ease',
                        }}
                      >
                        {stage.n}
                      </span>
                    </div>
                  </div>

                  {/* Right cell */}
                  <div className="pl-10 pt-1">
                    {!contentLeft && (
                      <div
                        data-parallax
                        style={{ willChange: 'transform, opacity', opacity: 0 }}
                      >
                        <StageContent stage={stage} dir="right" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
