'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ─── Word slam with ripple ─────────────────────────────────────────────────────

function WordSlam({ word, delay, gradient }: { word: string; delay: number; gradient?: boolean }) {
  return (
    <span className="relative inline-block mx-2 sm:mx-3">
      <span
        className="animate-slam-in"
        style={{
          animationDelay: `${delay}ms`,
          display: 'block',
          ...(gradient
            ? {
                backgroundImage: 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 40%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }
            : { color: '#e5e7eb' }),
        }}
      >
        {word}
      </span>
      <span
        className="absolute inset-0 rounded-sm animate-ripple-wave pointer-events-none"
        style={{ animationDelay: `${delay + 320}ms` }}
      />
    </span>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4 sm:px-6">
      {/* Moving dot grid */}
      <div
        className="absolute inset-0 animate-grid-drift pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Nav crown glow — top edge only, barely there */}
      <div
        className="absolute top-0 left-0 right-0 h-[480px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% -10%, rgba(59,130,246,0.09) 0%, transparent 70%)',
        }}
      />

      {/* Radial glow — centered mid-section */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0b1220] to-transparent pointer-events-none" />

      <div className="relative max-w-4xl mx-auto w-full pt-20">
        <h1
          className="text-white select-none"
          style={{
            fontFamily: 'var(--font-space-grotesk), "Inter Tight", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            fontSize: 'clamp(3.5rem, 11vw, 8.5rem)',
            textShadow: '0 1px 0 rgba(255,255,255,0.06), 0 -1px 2px rgba(0,0,0,0.6)',
          }}
        >
          {/* Line 1 */}
          <div className="flex items-center justify-center">
            <WordSlam word="LEETCODE" delay={0} />
          </div>
          {/* Line 2 — gradient */}
          <div className="flex items-center justify-center mt-1">
            <WordSlam word="LOCK" delay={200} gradient />
            <WordSlam word="IN" delay={400} gradient />
          </div>
        </h1>

        {/* Tagline */}
        <p
          className="mt-8 text-lg text-zinc-400 animate-fade-up"
          style={{ animationDelay: '750ms' }}
        >
          Stop memorizing solutions.{' '}
          <span className="text-zinc-500">Learn how to think through them.</span>
        </p>

        {/* CTAs */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: '900ms' }}
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 active:scale-[0.97] transition-all duration-150"
          >
            Start Learning
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-100" />
          </Link>

          <a
            href="#how-it-works"
            className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            How it works →
          </a>
        </div>

        <p
          className="mt-4 text-xs text-zinc-700 animate-fade-up"
          style={{ animationDelay: '1000ms' }}
        >
          Free to start · No account needed
        </p>
      </div>
    </section>
  );
}
