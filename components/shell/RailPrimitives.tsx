import type { ReactNode } from 'react';

export function RailHeader({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[11px] font-bold tracking-[0.16em] uppercase mb-3 px-1"
      style={{ color: 'var(--ll-ink-subtle)' }}
    >
      {children}
    </p>
  );
}

export function MetricRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span style={{ color: 'var(--ll-ink-subtle)' }}>{label}</span>
      <span className="font-medium tabular-nums" style={{ color: 'var(--ll-ink)' }}>
        {value}
      </span>
    </div>
  );
}

export function Metric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <div
        className="text-[19px] leading-none font-semibold tabular-nums"
        style={{ color: 'var(--ll-ink-strong)' }}
      >
        {value}
      </div>
      <div className="text-[11px] mt-1.5" style={{ color: 'var(--ll-ink-subtle)' }}>
        {label}
      </div>
    </div>
  );
}

// Regular rail card — tinted, easy on the eyes. White is reserved for hero/active surfaces.
export const RAIL_BOX =
  'rounded-lg px-3 py-2.5 bg-[var(--ll-bg-card)] border border-[var(--ll-border)]';
