'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SANS: React.CSSProperties = {
  fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 sm:px-10 pt-28 sm:pt-32 pb-6">
      {/* Soft hero gradient mesh */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(59,130,246,0.14) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(56,189,248,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto w-full text-center">
        {/* Soft pulsing glow behind LOCK IN — gives the headline depth */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '38%',
            left: '50%',
            width: '70%',
            height: '52%',
            background:
              'radial-gradient(ellipse 50% 55% at 50% 50%, rgba(59,130,246,0.30), rgba(56,189,248,0.18) 40%, transparent 75%)',
            filter: 'blur(48px)',
            animation: 'hero-glow-pulse 6s ease-in-out infinite',
          }}
        />

        {/* Big branded headline */}
        <h1
          className="relative select-none uppercase"
          style={{
            ...SANS,
            fontWeight: 700,
            letterSpacing: '-0.028em',
            lineHeight: 0.92,
            fontSize: 'clamp(3.5rem, 11.5vw, 9rem)',
            fontFeatureSettings: '"ss01", "cv11"',
          }}
        >
          {/* LEETCODE — dimensional ink with a crisp top highlight */}
          <span
            className="block animate-slam-in"
            style={{
              animationDelay: '0ms',
              backgroundImage:
                'linear-gradient(180deg, #334155 0%, #0f172a 38%, #050a18 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              filter:
                'drop-shadow(0 1px 0 rgba(255,255,255,0.6)) drop-shadow(0 2px 20px rgba(15,23,42,0.08))',
            }}
          >
            LEETCODE
          </span>

          {/* LOCK IN — refined 3-stop gradient with dimensional glow */}
          <span
            className="block animate-slam-in"
            style={{
              animationDelay: '180ms',
              backgroundImage:
                'linear-gradient(178deg, #1d4ed8 0%, #3b82f6 48%, #7dd3fc 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              filter:
                'drop-shadow(0 1px 0 rgba(255,255,255,0.55)) drop-shadow(0 10px 28px rgba(59,130,246,0.32)) drop-shadow(0 2px 6px rgba(29,78,216,0.22))',
            }}
          >
            LOCK IN
          </span>
        </h1>

        {/* Subhead */}
        <p
          className="mt-6 max-w-2xl mx-auto text-[15px] sm:text-base leading-relaxed text-balance animate-fade-up"
          style={{ ...SANS, color: 'var(--ll-ink-muted)', animationDelay: '420ms' }}
        >
          Stop memorizing solutions. Learn how to think through every problem, pattern by pattern.
        </p>

        {/* CTAs */}
        <div
          className="mt-7 flex flex-wrap items-center justify-center gap-3 animate-fade-up"
          style={{ animationDelay: '560ms' }}
        >
          <Link
            href="/sign-in"
            className="group inline-flex items-center gap-2 px-5 h-11 rounded-md text-[14px] font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{
              ...SANS,
              background: 'var(--ll-accent)',
              boxShadow:
                '0 1px 0 0 rgba(255,255,255,0.15) inset, 0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -10px rgba(59,130,246,0.55)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ll-accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--ll-accent)';
            }}
          >
            Start Learning
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="#curriculum"
            className="inline-flex items-center px-5 h-11 rounded-md text-[14px] font-medium transition-colors"
            style={{
              ...SANS,
              background: 'var(--ll-bg-elevated)',
              color: 'var(--ll-ink)',
              border: '1px solid var(--ll-border-strong)',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ll-bg-subtle)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--ll-bg-elevated)';
            }}
          >
            View Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
