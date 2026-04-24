import type { CSSProperties } from 'react';

// Light-mode palette (matches .theme-light tokens in app/globals.css).
// Keys mirror the old dark-mode shape so the shell primitives pick up the new
// values without a broad rename.
// Theme-reactive tokens. Values are CSS var() refs so inline styles
// automatically switch when the body gets .theme-dark.
export const C: Record<string, string> = {
  // Surfaces
  appBg:         'var(--ll-bg)',
  panelBg:       'var(--ll-bg-panel)',
  cardBg:        'var(--ll-bg-elevated)',
  cardBgDark:    'var(--ll-bg-subtle)',

  // Borders
  border:        'var(--ll-border)',
  borderMid:     'var(--ll-border-strong)',

  // Ink
  text:          'var(--ll-ink)',
  textSub:       'var(--ll-ink-muted)',
  textMuted:     'var(--ll-ink-subtle)',
  textDim:       'var(--ll-ink-faint)',

  // Accent — blue
  blue:          'var(--ll-accent)',
  blueDim:       'var(--ll-accent-soft)',
  blueBorder:    'var(--ll-accent-ring)',

  // Semantic — success
  emerald:       'var(--ll-success)',
  emeraldDim:    'var(--ll-success-soft)',
  emeraldBorder: 'var(--ll-success-border)',
};

export const SG: CSSProperties = {
  fontFamily: 'var(--font-space-grotesk), sans-serif',
};

export const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

// Subtle grid wash on light surfaces — dark lines at low opacity.
export const GRID_BG: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
};

export const SHELL = {
  navHeight: 48,
  sideWidth: 304,
} as const;
