'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 sm:px-10 pt-32 sm:pt-40 pb-4">
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 30% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto w-full">
        {/* Headline */}
        <h1
          className="text-white select-none uppercase"
          style={{
            fontFamily: 'var(--font-space-grotesk), "Inter Tight", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 0.92,
            fontSize: 'clamp(3rem, 9.5vw, 7.5rem)',
          }}
        >
          <span
            className="block animate-slam-in text-zinc-100"
            style={{ animationDelay: '0ms' }}
          >
            LEETCODE
          </span>
          <span
            className="block animate-slam-in text-blue-400"
            style={{ animationDelay: '180ms' }}
          >
            LOCK IN
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="mt-6 max-w-xl text-[15px] sm:text-base leading-relaxed text-slate-400/90 animate-fade-up"
          style={{ animationDelay: '420ms' }}
        >
          Stop memorizing solutions. Learn how to think through every problem,
          pattern by pattern.
        </p>

        {/* CTAs */}
        <div
          className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up"
          style={{ animationDelay: '560ms' }}
        >
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-11 px-5 rounded-md bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 gap-2',
            )}
          >
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="#curriculum"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'h-11 px-5 rounded-md text-sm font-medium text-slate-200',
              'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:text-white',
              'backdrop-blur-sm dark:bg-white/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]',
            )}
          >
            View Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
