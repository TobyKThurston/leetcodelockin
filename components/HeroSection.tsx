'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 sm:px-10 pt-32 sm:pt-40 pb-20">
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
          pattern by pattern — with a structured curriculum built to compound.
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

        {/* Product preview */}
        <div
          className="mt-20 animate-fade-up"
          style={{ animationDelay: '720ms' }}
        >
          <CodePreview />
        </div>
      </div>
    </section>
  );
}

// ─── Code preview mockup ──────────────────────────────────────────────────────

function CodePreview() {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0f1c]/80 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0) 40%)',
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="ml-4 flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-[4px] bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-400">
            two_sum.py
          </div>
          <div className="px-2.5 py-1 rounded-[4px] text-[11px] font-mono text-slate-600">
            notes.md
          </div>
        </div>
        <div className="ml-auto text-[11px] font-mono text-slate-600 tracking-wider">
          PATTERN · HASH MAP
        </div>
      </div>

      {/* Code body */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_280px]">
        <pre className="px-5 py-5 text-[13px] leading-[1.7] font-mono overflow-x-auto">
          <CodeLine n={1} tokens={[['def ', 'text-blue-400'], ['two_sum', 'text-emerald-300'], ['(nums, target):', 'text-slate-300']]} />
          <CodeLine n={2} tokens={[['    seen ', 'text-slate-300'], ['= ', 'text-slate-500'], ['{}', 'text-slate-300']]} />
          <CodeLine n={3} tokens={[['    ', ''], ['for ', 'text-blue-400'], ['i, num ', 'text-slate-300'], ['in ', 'text-blue-400'], ['enumerate', 'text-emerald-300'], ['(nums):', 'text-slate-300']]} />
          <CodeLine n={4} tokens={[['        complement ', 'text-slate-300'], ['= ', 'text-slate-500'], ['target - num', 'text-slate-300']]} />
          <CodeLine n={5} tokens={[['        ', ''], ['if ', 'text-blue-400'], ['complement ', 'text-slate-300'], ['in ', 'text-blue-400'], ['seen:', 'text-slate-300']]} />
          <CodeLine n={6} tokens={[['            ', ''], ['return ', 'text-blue-400'], ['[seen[complement], i]', 'text-slate-300']]} />
          <CodeLine n={7} tokens={[['        seen[num] ', 'text-slate-300'], ['= ', 'text-slate-500'], ['i', 'text-slate-300']]} />
          <CodeLine n={8} tokens={[['    ', ''], ['return ', 'text-blue-400'], ['[]', 'text-slate-300']]} />
        </pre>

        <div className="hidden md:block w-px bg-white/[0.06]" />

        {/* Hint panel */}
        <div className="hidden md:flex flex-col gap-3 p-5 border-t md:border-t-0 border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-500">
              Hint · 2 of 4
            </span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-slate-300">
            What if you could remember every number you&apos;ve already seen,
            and check if its partner exists in constant time?
          </p>
          <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/[0.05]">
            <div className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full w-1/2 bg-blue-400/70" />
            </div>
            <span className="text-[10px] font-mono text-slate-500">50%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeLine({ n, tokens }: { n: number; tokens: [string, string][] }) {
  return (
    <div className="flex">
      <span className="inline-block w-6 text-right pr-3 text-slate-700 select-none">
        {n}
      </span>
      <span>
        {tokens.map(([text, cls], i) => (
          <span key={i} className={cls}>
            {text}
          </span>
        ))}
      </span>
    </div>
  );
}
