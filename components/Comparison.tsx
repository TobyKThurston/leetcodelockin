'use client';

import { Check, Minus } from 'lucide-react';

const SG: React.CSSProperties = {
  fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
};

const ROWS: { feature: string; lc: boolean; nc: boolean; ll: boolean }[] = [
  { feature: 'AI Socratic tutor', lc: true, nc: true, ll: true },
  { feature: 'Pattern-first curriculum', lc: false, nc: true, ll: true },
  { feature: 'AI voice mock interview + debrief', lc: false, nc: false, ll: true },
  { feature: 'Spaced repetition from your solved problems', lc: false, nc: false, ll: true },
];

const HIGHLIGHT_BG = 'rgba(59,130,246,0.06)';

export default function Comparison() {
  return (
    <section className="px-6 sm:px-10 py-32" style={{ scrollMarginTop: '80px' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4"
            style={{ color: 'var(--ll-accent)' }}
          >
            Why LeetLockin
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{ ...SG, color: 'var(--ll-ink)' }}
          >
            Everything they do.
            <br className="hidden sm:block" />{' '}
            Plus what they skipped.
          </h2>
        </div>

        <div
          className="rounded-xl overflow-hidden border"
          style={{
            borderColor: 'var(--ll-border)',
            background: 'var(--ll-bg-elevated)',
          }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-[1.4fr_1fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr_1fr] text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.18em] uppercase"
            style={{
              borderBottom: '1px solid var(--ll-border)',
              color: 'var(--ll-ink-subtle)',
            }}
          >
            <div className="px-4 py-3.5">Feature</div>
            <div className="px-2 py-3.5 text-center">LeetCode</div>
            <div className="px-2 py-3.5 text-center">NeetCode</div>
            <div
              className="px-2 py-3.5 text-center"
              style={{ color: 'var(--ll-accent)', background: HIGHLIGHT_BG }}
            >
              LeetLockin
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((r, i) => {
            const last = i === ROWS.length - 1;
            const cellBorder = last ? 'none' : '1px solid var(--ll-border)';
            return (
              <div
                key={r.feature}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr_1fr] items-stretch text-[14px]"
              >
                <div
                  className="px-4 py-4"
                  style={{
                    color: 'var(--ll-ink)',
                    borderBottom: cellBorder,
                  }}
                >
                  {r.feature}
                </div>
                <Cell on={r.lc} border={cellBorder} />
                <Cell on={r.nc} border={cellBorder} />
                <Cell on={r.ll} border={cellBorder} highlight />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Cell({
  on,
  border,
  highlight = false,
}: {
  on: boolean;
  border: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center px-2 py-4"
      style={{
        background: highlight ? HIGHLIGHT_BG : 'transparent',
        borderBottom: border,
      }}
    >
      {on ? (
        <Check
          size={18}
          strokeWidth={2.5}
          style={{ color: highlight ? 'var(--ll-accent)' : 'var(--ll-ink)' }}
        />
      ) : (
        <Minus
          size={18}
          strokeWidth={2}
          style={{ color: 'var(--ll-ink-subtle)', opacity: 0.45 }}
        />
      )}
    </div>
  );
}
