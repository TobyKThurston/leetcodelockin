'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Mode = 'light' | 'dark';
const STORAGE_KEY = 'll-theme';

function applyTheme(mode: Mode) {
  const body = document.body;
  body.classList.toggle('theme-light', mode === 'light');
  body.classList.toggle('theme-dark', mode === 'dark');
  document.documentElement.classList.toggle('dark', mode === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', mode === 'dark' ? '#0b1220' : '#f3f6fb');
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Mode | null) ?? 'light';
    setMode(stored);
    applyTheme(stored);
  }, []);

  function toggle() {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="relative inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors"
      style={{
        color: 'var(--ll-ink-muted)',
        background: 'transparent',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--ll-bg-hover)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--ll-ink)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--ll-ink-muted)';
      }}
    >
      {/* Keep both icons in DOM so swap is seamless and layout doesn't shift pre-hydration. */}
      <Sun
        size={14}
        strokeWidth={2}
        className="absolute transition-all duration-200"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(-90deg) scale(0.6)' : 'rotate(0) scale(1)',
        }}
      />
      <Moon
        size={14}
        strokeWidth={2}
        className="absolute transition-all duration-200"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0.6)',
        }}
      />
    </button>
  );
}
