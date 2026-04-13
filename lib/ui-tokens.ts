import type { CSSProperties } from 'react';

export const C: Record<string, string> = {
  appBg:      '#0b1220',
  panelBg:    '#070c17',
  cardBg:     '#0f1729',
  cardBgDark: '#070c17',
  border:     'rgba(255,255,255,0.06)',
  borderMid:  'rgba(255,255,255,0.1)',
  text:       '#e5e7eb',
  textSub:    '#cbd5e1',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  blue:       '#3b82f6',
  blueDim:    'rgba(59,130,246,0.12)',
  blueBorder: 'rgba(96,165,250,0.4)',
  emerald:    '#10b981',
  emeraldDim: 'rgba(16,185,129,0.1)',
  emeraldBorder: 'rgba(16,185,129,0.32)',
};

export const SG: CSSProperties = {
  fontFamily: 'var(--font-space-grotesk), sans-serif',
};

export const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

export const GRID_BG: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
};

export const SHELL = {
  navHeight: 48,
  sideWidth: 304,
} as const;
