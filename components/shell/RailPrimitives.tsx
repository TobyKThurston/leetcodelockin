import type { ReactNode } from 'react';

export function RailHeader({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
      {children}
    </p>
  );
}

export function MetricRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between text-[11.5px]">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function Metric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <div className="text-[18px] leading-none font-semibold text-slate-100 tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5">{label}</div>
    </div>
  );
}

export const RAIL_BOX =
  'rounded-lg px-3 py-2.5 bg-slate-800/40 border border-slate-700/60';
