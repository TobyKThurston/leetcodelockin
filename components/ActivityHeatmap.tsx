'use client';

import type { HeatmapDay } from '@/lib/streaks';

interface Props {
  data: HeatmapDay[];
  weeks?: number;
}

function getColor(count: number, frozen: boolean): string {
  if (frozen) return 'rgba(59,130,246,0.2)';
  if (count >= 6) return '#10b981';
  if (count >= 3) return 'rgba(16,185,129,0.5)';
  if (count >= 1) return 'rgba(16,185,129,0.25)';
  return 'rgba(255,255,255,0.04)';
}

function getBorder(frozen: boolean): string | undefined {
  return frozen ? '1px solid rgba(59,130,246,0.3)' : undefined;
}

const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''];

export default function ActivityHeatmap({ data, weeks = 7 }: Props) {
  // Build a lookup map from date string to day data
  const dayMap = new Map<string, HeatmapDay>();
  for (const d of data) dayMap.set(d.date, d);

  // Compute date grid: columns = weeks, rows = Mon(0)..Sun(6)
  // Last column ends on today, first column starts (weeks-1)*7 + daysIntoWeek days ago
  const today = new Date();
  const todayDay = (today.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  const totalDays = weeks * 7;

  // Start date: go back enough to fill the grid ending today
  const startOffset = -(totalDays - 1 - (6 - todayDay));
  const cells: Array<{ date: string; count: number; frozen: boolean } | null> = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + startOffset + i);
    const ds = d.toISOString().slice(0, 10);

    // Only show cells up to today
    if (d > today) {
      cells.push(null);
    } else {
      const entry = dayMap.get(ds);
      cells.push({
        date: ds,
        count: entry?.count ?? 0,
        frozen: entry?.frozen ?? false,
      });
    }
  }

  // Arrange into columns (weeks) with 7 rows each
  const columns: typeof cells[] = [];
  for (let w = 0; w < weeks; w++) {
    const col: typeof cells = [];
    for (let d = 0; d < 7; d++) {
      col.push(cells[w * 7 + d]);
    }
    columns.push(col);
  }

  return (
    <div className="flex gap-0.5">
      {/* Day labels */}
      <div className="flex flex-col gap-0.5 mr-1 pt-0">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-[8px] text-slate-600 leading-none flex items-center justify-end"
            style={{ width: 10, height: 12 }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      {columns.map((col, w) => (
        <div key={w} className="flex flex-col gap-0.5">
          {col.map((cell, d) => (
            <div
              key={d}
              title={cell ? `${cell.date}: ${cell.count} action${cell.count !== 1 ? 's' : ''}${cell.frozen ? ' (frozen)' : ''}` : ''}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: cell ? getColor(cell.count, cell.frozen) : 'transparent',
                border: cell ? getBorder(cell.frozen) : undefined,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
