// Shared comparison helpers used by the client-side Pyodide runner to decide
// whether a test case's `actual` output matches its `expectedJson`.
//
// Three comparison modes (mirrors the `ResultCompare` union in problem-types):
//   - exact         → deep equality via JSON.stringify
//   - sorted_array  → order-insensitive array comparison (numeric or lex sort)
//   - set           → duplicates-insensitive array comparison

import type { ResultCompare } from './problem-types';

export function toComparable(val: unknown, mode: ResultCompare): string {
  switch (mode) {
    case 'sorted_array': {
      if (!Array.isArray(val)) return JSON.stringify(val);
      const allNums = val.every(v => typeof v === 'number');
      const copy = [...val];
      copy.sort(allNums
        ? (a, b) => (a as number) - (b as number)
        : (a, b) => String(a).localeCompare(String(b)));
      return JSON.stringify(copy);
    }
    case 'set': {
      if (!Array.isArray(val)) return JSON.stringify(val);
      const unique = Array.from(new Set(val.map(v => JSON.stringify(v))));
      unique.sort();
      return JSON.stringify(unique);
    }
    case 'exact':
    default:
      return JSON.stringify(val);
  }
}

export function normalizeExpected(expectedJson: string, mode: ResultCompare): string {
  try {
    const parsed = JSON.parse(expectedJson);
    return toComparable(parsed, mode);
  } catch {
    return expectedJson;
  }
}
