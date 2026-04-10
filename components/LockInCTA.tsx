'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

const chips = [
  { label: 'Hash Map',          x: -270, y: -90,  speed: 1.2 },
  { label: 'Arrays',            x: -210, y:  70,  speed: 0.9 },
  { label: 'Linked List',       x:  255, y: -70,  speed: 1.1 },
  { label: 'Binary Tree',       x:  185, y:  95,  speed: 0.8 },
  { label: 'Stack & Queue',     x: -155, y: -165, speed: 1.4 },
  { label: 'Graphs',            x:  120, y: -155, speed: 1.3 },
  { label: 'Sliding Window',    x: -285, y:  165, speed: 0.75 },
  { label: 'Two Pointers',      x:  265, y:  160, speed: 1.0 },
  { label: 'BFS & DFS',         x:   65, y:  190, speed: 0.85 },
  { label: 'Dynamic Prog.',     x:  -50, y: -200, speed: 1.5 },
  { label: 'Backtracking',      x:  -95, y:  200, speed: 0.7 },
  { label: 'Binary Search',     x:  175, y: -170, speed: 1.15 },
];

export default function LockInCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    const btn = btnRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!section || !wrap || !inner || !btn || !svg || !path) return;

    const chipEls = Array.from(
      section.querySelectorAll<HTMLElement>('[data-chip]')
    );

    const setup = () => {
      const { width: w, height: h } = btn.getBoundingClientRect();
      const rx = 18;
      const cx = w / 2;

      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const d = [
        `M ${cx},0.5`,
        `H ${w - rx}`,
        `Q ${w},0.5 ${w},${rx}`,
        `V ${h - rx}`,
        `Q ${w},${h} ${w - rx},${h}`,
        `H ${rx}`,
        `Q 0,${h} 0,${h - rx}`,
        `V ${rx}`,
        `Q 0,0.5 ${rx},0.5`,
        `H ${cx}`,
      ].join(' ');

      path.setAttribute('d', d);
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
      return len;
    };

    let perimeter = setup();
    let triggered = false;
    let raf = 0;

    const update = () => {
      const wh = window.innerHeight;
      const rect = wrap.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const norm = center / wh;

      // Clamp py so button doesn't fly off when footer is visible
      const py = Math.max(-40, (norm - 0.5) * 80);

      // Only fade IN from bottom — stay fully visible once entered so footer can naturally cover it
      let op: number;
      if (norm > 1) op = 0;
      else if (norm > 0.78) op = (1 - norm) / 0.22;
      else op = 1;
      op = Math.max(0, Math.min(1, op));

      // Button + SVG parallax
      inner.style.transform = `translateY(${py}px)`;
      inner.style.opacity = String(op);

      // Chips — each speed creates depth layering effect
      chipEls.forEach((el, i) => {
        const chip = chips[i];
        if (!chip) return;
        const chipPy = (norm - 0.5) * 130 * chip.speed;
        el.style.transform = `translate(-50%, calc(-50% + ${chipPy}px))`;
        el.style.opacity = String(Math.min(op * 0.7, 0.7));
      });

      if (!triggered && op > 0.55) {
        triggered = true;
        path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)';
        path.style.strokeDashoffset = '0';
      }
      if (triggered && op < 0.15) {
        triggered = false;
        path.style.transition = 'stroke-dashoffset 0.2s ease';
        path.style.strokeDashoffset = String(perimeter);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const onResize = () => { perimeter = setup(); triggered = false; };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Floating DSA chips — absolutely positioned around button center */}
      {chips.map((chip, i) => (
        <div
          key={chip.label}
          data-chip={i}
          className="absolute pointer-events-none"
          style={{
            left: `calc(50% + ${chip.x}px)`,
            top: `calc(50% + ${chip.y}px)`,
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        >
          <span
            className="block px-3 py-1.5 rounded-full text-[11px] font-mono font-medium tracking-wide whitespace-nowrap"
            style={{
              color: 'rgba(148,163,184,0.55)',
              background: 'rgba(11,18,32,0.7)',
              border: '1px solid rgba(59,130,246,0.14)',
            }}
          >
            {chip.label}
          </span>
        </div>
      ))}

      {/* Measurement anchor — never moves */}
      <div ref={wrapRef}>
        {/* Parallax group — button + SVG move together */}
        <div
          ref={innerRef}
          className="relative"
          style={{ willChange: 'transform, opacity', opacity: 0 }}
        >
          <svg
            ref={svgRef}
            className="pointer-events-none"
            style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
          >
            <path
              ref={pathRef}
              fill="none"
              stroke="rgba(59,130,246,0.55)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>

          <Link
            ref={btnRef}
            href="/tutor"
            className="relative flex items-center justify-center rounded-2xl px-16 py-7"
            style={{
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#e2e8f0',
              background: 'rgba(15,28,60,0.5)',
              border: '1px solid rgba(59,130,246,0.06)',
            }}
          >
            Start
          </Link>
        </div>
      </div>

      <p className="mt-8 text-[11px] text-slate-700">
        Free to start &middot; No account needed
      </p>
    </section>
  );
}
