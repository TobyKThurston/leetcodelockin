'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 sm:px-10 pt-32 sm:pt-44 pb-0">
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% -5%, rgba(59,130,246,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto w-full">
        {/* Top row: headline left, actions right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16">
          {/* Left — headline */}
          <div className="max-w-2xl">
            <h1
              className="text-white select-none uppercase"
              style={{
                fontFamily: 'var(--font-space-grotesk), "Inter Tight", sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                fontSize: 'clamp(3.5rem, 11vw, 8.5rem)',
                textShadow: '0 1px 0 rgba(255,255,255,0.06), 0 -1px 2px rgba(0,0,0,0.6)',
              }}
            >
              <span className="block animate-slam-in" style={{ animationDelay: '0ms', color: '#e5e7eb' }}>
                LEETCODE
              </span>
              <span
                className="block animate-slam-in"
                style={{
                  animationDelay: '200ms',
                  backgroundImage: 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 40%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                LOCK IN
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="mt-5 text-base sm:text-lg text-slate-400 max-w-md leading-relaxed animate-fade-up"
              style={{ animationDelay: '500ms' }}
            >
              Stop memorizing solutions. Learn how to think through every problem, pattern by pattern.
            </p>
          </div>

          {/* Right — actions */}
          <div
            className="flex flex-col items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: '650ms' }}
          >
            <Link
              href="/sign-in"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-zinc-900 text-[15px] font-semibold rounded-lg hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150"
            >
              Start Learning
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform duration-100" />
            </Link>

            <a
              href="#how-it-works"
              className="text-[15px] text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap"
            >
              How it works →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
