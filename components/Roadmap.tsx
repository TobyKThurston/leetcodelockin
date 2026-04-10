'use client';

import { useEffect, useRef, useState } from 'react';

/* ───────────────────────────────────────────────────────────────────
   Curriculum section.
   - Left sidebar is sticky and holds the index + progress meter.
   - Right column is a stack of tall phase panels that scroll normally.
   - Each panel has its own `localProgress` (0 → 1 as it passes through
     the reading zone) so visuals can drive scroll-linked animations
     (sliding window slides, counter counts up, etc.).
─────────────────────────────────────────────────────────────────── */

type PhaseVisualProps = { localProgress: number };

const phases = [
  {
    n: '01',
    title: 'Python Foundations',
    tagline: 'Fluency in the language you solve in.',
  },
  {
    n: '02',
    title: 'Core Data Structures',
    tagline: 'The toolkit every problem is built from.',
  },
  {
    n: '03',
    title: 'Pattern Library',
    tagline: 'Recognize the shape of any problem.',
  },
  {
    n: '04',
    title: 'Interview Ready',
    tagline: 'Timed mocks. Company-specific sets.',
  },
];

/* ───────── Phase visuals ───────── */

/**
 * Skill Coverage radar — shared between phases 1, 2, and 4.
 * `growth` is a 0→1 value that drives the polygon's expansion across the whole
 * Curriculum section, so phase 1 starts it as a tiny speck and phase 4 finishes
 * it near the outer hexagon.
 */
function SkillRadar({ growth }: { growth: number }) {
  const axes = ['Arrays', 'Graphs', 'DP', 'Trees', 'Strings', 'Math'];
  // Near-zero starts so phase 1 actually looks empty
  const startValues = [0.05, 0.04, 0.03, 0.04, 0.06, 0.04];
  const endValues = [0.94, 0.86, 0.82, 0.90, 0.96, 0.84];
  const values = axes.map(
    (_, i) => startValues[i] + (endValues[i] - startValues[i]) * growth
  );

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const R = 100;

  // Start at top (-90°) and walk clockwise around the hexagon
  const angleAt = (i: number) =>
    -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;

  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angleAt(i)) * r,
    y: cy + Math.sin(angleAt(i)) * r,
  });

  const polygonPath = (radiusAt: (i: number) => number) =>
    axes
      .map((_, i) => {
        const p = point(i, radiusAt(i));
        return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  const ringLevels = [0.25, 0.5, 0.75, 1.0];
  const fillPath = polygonPath((i) => R * values[i]);

  return (
    <div className="w-full max-w-md">
      <p className="text-[9px] font-mono tracking-[0.18em] uppercase text-slate-600 mb-2 text-center">
        Skill Coverage
      </p>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
        {/* Reference rings */}
        {ringLevels.map((level) => (
          <path
            key={level}
            d={polygonPath(() => R * level)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Spokes */}
        {axes.map((_, i) => {
          const p = point(i, R);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled skill polygon */}
        <path
          d={fillPath}
          fill="rgba(59,130,246,0.18)"
          stroke="rgba(96,165,250,0.95)"
          strokeWidth="1.5"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(96,165,250,0.4))',
          }}
        />

        {/* Vertex dots */}
        {values.map((v, i) => {
          const p = point(i, R * v);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="rgba(96,165,250,0.95)"
            />
          );
        })}

        {/* Axis labels */}
        {axes.map((label, i) => {
          const p = point(i, R + 20);
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              fill="rgba(148,163,184,0.8)"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function PythonVisual({ localProgress }: PhaseVisualProps) {
  // Phase 1: 0.00 → 0.25
  return <SkillRadar growth={localProgress * 0.25} />;
}

function DataStructuresVisual({ localProgress }: PhaseVisualProps) {
  // Phase 2: 0.25 → 0.50
  return <SkillRadar growth={0.25 + localProgress * 0.25} />;
}

function PatternVisual({ localProgress }: PhaseVisualProps) {
  // Phase 3: 0.50 → 0.75
  return <SkillRadar growth={0.5 + localProgress * 0.25} />;
}

function InterviewVisual({ localProgress }: PhaseVisualProps) {
  // Phase 4: 0.75 → 1.00
  return <SkillRadar growth={0.75 + localProgress * 0.25} />;
}

const VISUALS: Array<(props: PhaseVisualProps) => React.JSX.Element> = [
  PythonVisual,
  DataStructuresVisual,
  PatternVisual,
  InterviewVisual,
];

/* ───────── Main component ───────── */

export default function Roadmap() {
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);
  const [progresses, setProgresses] = useState<number[]>(() =>
    Array(phases.length).fill(0)
  );

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;

      // Per-panel local progress. 0 when the panel top sits at 80% of the
      // viewport, 1 when it sits at 20%. That's the "reading zone" where a
      // panel goes from "just entering" to "fully settled".
      const nextProgresses = panelRefs.current.map((el) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const local = (vh * 0.8 - rect.top) / (vh * 0.6);
        return Math.max(0, Math.min(1, local));
      });
      setProgresses(nextProgresses);

      // Active panel: the last one whose top has crossed the 40% line.
      let bestIdx = 0;
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh * 0.4) bestIdx = i;
      });
      setActive(bestIdx);
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToPhase = (i: number) => {
    panelRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Smooth fill for the sidebar progress bar
  const overallProgress = Math.max(
    0,
    Math.min(1, (active + (progresses[active] ?? 0)) / phases.length)
  );

  return (
    <section
      id="roadmap"
      className="relative px-4 sm:px-6 pt-32 pb-32"
      style={{ scrollMarginTop: '80px' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
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

        {/* Body: sticky sidebar + scrolling panels */}
        <div className="grid md:grid-cols-[240px_1fr] md:gap-20">
          {/* ─── Left: sticky sidebar ─────────────────────────── */}
          <aside className="hidden md:block">
            <div className="sticky top-28">
              <p className="text-[10px] font-mono font-semibold tracking-[0.22em] uppercase text-slate-700 mb-6">
                Curriculum Index
              </p>

              <nav className="flex flex-col mb-10">
                {phases.map((phase, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={phase.n}
                      type="button"
                      onClick={() => scrollToPhase(i)}
                      className="group relative text-left pl-4 py-2.5 cursor-pointer"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-px transition-all duration-500 ease-out"
                        style={{
                          height: isActive ? '72%' : '0%',
                          background: 'rgba(96,165,250,0.9)',
                          boxShadow: isActive
                            ? '0 0 10px rgba(96,165,250,0.55)'
                            : 'none',
                        }}
                      />
                      <div className="flex items-baseline gap-3">
                        <span
                          className="font-mono text-[10px] tabular-nums transition-colors duration-500"
                          style={{ color: isActive ? '#60a5fa' : '#334155' }}
                        >
                          {phase.n}
                        </span>
                        <span
                          className="text-[13px] font-medium tracking-tight transition-colors duration-500 group-hover:text-slate-300"
                          style={{
                            color: isActive
                              ? '#e2e8f0'
                              : 'rgba(100,116,139,0.9)',
                          }}
                        >
                          {phase.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Progress meter */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-slate-700">
                    Phase
                  </p>
                  <p className="text-[10px] font-mono tabular-nums text-slate-600">
                    {String(active + 1).padStart(2, '0')}
                    <span className="text-slate-800"> / </span>
                    {String(phases.length).padStart(2, '0')}
                  </p>
                </div>
                <div
                  className="relative h-px w-full"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${overallProgress * 100}%`,
                      background:
                        'linear-gradient(to right, rgba(59,130,246,0.55), rgba(96,165,250,0.95))',
                      boxShadow: '0 0 8px rgba(96,165,250,0.4)',
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ─── Right: scrolling phase panels ────────────────── */}
          <div className="flex flex-col gap-32 md:gap-48">
            {phases.map((phase, i) => {
              const Viz = VISUALS[i];
              return (
                <article
                  key={phase.n}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className="min-h-[60vh] flex flex-col justify-center"
                >
                  <p className="text-[10px] font-mono font-semibold tracking-[0.22em] uppercase text-slate-600 mb-4">
                    Phase {phase.n}
                  </p>
                  <h3
                    className="text-3xl sm:text-4xl font-bold text-[#e2e8f0] tracking-tight mb-3"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                  >
                    {phase.title}
                  </h3>
                  <p className="text-[14px] text-slate-500 leading-relaxed mb-10 max-w-md">
                    {phase.tagline}
                  </p>
                  <div className="flex justify-start">
                    <Viz localProgress={progresses[i] ?? 0} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
