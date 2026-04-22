'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const fade: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FinalCTA() {
  return (
    <section className="relative px-6 sm:px-10 pt-44 pb-40 text-center">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="relative max-w-6xl mx-auto"
      >
        <motion.p
          variants={fade}
          className="text-[11px] tracking-[0.28em] uppercase font-semibold mb-8"
          style={{ color: 'var(--ll-accent)' }}
        >
          It’s time.
        </motion.p>

        <motion.h2
          variants={fade}
          className="relative select-none"
          style={{
            fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.038em',
            lineHeight: 0.94,
            fontSize: 'clamp(2.75rem, 9vw, 7rem)',
            fontFeatureSettings: '"ss01", "cv11"',
          }}
        >
          {/* Stop memorizing — subtle vertical ink gradient + letterpress */}
          <span
            className="block"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #334155 0%, #0f172a 40%, #050a18 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              filter:
                'drop-shadow(0 1px 0 rgba(255,255,255,0.55)) drop-shadow(0 2px 18px rgba(15,23,42,0.08))',
            }}
          >
            Stop memorizing.
          </span>
          {/* Lock in — refined multi-stop blue gradient + dimensional glow */}
          <span
            className="block"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #1d4ed8 0%, #3b82f6 45%, #60a5fa 80%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              filter:
                'drop-shadow(0 1px 0 rgba(255,255,255,0.5)) drop-shadow(0 10px 28px rgba(59,130,246,0.32)) drop-shadow(0 2px 6px rgba(29,78,216,0.22))',
            }}
          >
            Lock in.
          </span>
        </motion.h2>

        <motion.p
          variants={fade}
          className="mt-10 text-[16px] leading-relaxed max-w-md mx-auto"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          You don&apos;t need more problems. You need a better system.
        </motion.p>

        <motion.div variants={fade} className="mt-14 flex flex-col items-center gap-5">
          <div className="relative">
            {/* Ambient glow under the CTA so it matches the gravity of the headline */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 blur-2xl opacity-80"
              style={{
                background:
                  'radial-gradient(ellipse 70% 80% at 50% 60%, rgba(59,130,246,0.35), transparent 70%)',
              }}
            />
            <Link
              href="/sign-in"
              className="group relative inline-flex items-center gap-3 pl-8 pr-3 h-14 text-white text-[15px] font-semibold rounded-full transition-all duration-200 active:scale-[0.985]"
              style={{
                fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                letterSpacing: '-0.01em',
                background:
                  'linear-gradient(180deg, #4f95ff 0%, #2563eb 100%)',
                boxShadow:
                  '0 1px 0 0 rgba(255,255,255,0.32) inset, 0 0 0 1px rgba(37,99,235,0.6), 0 2px 4px rgba(15,23,42,0.08), 0 14px 34px -10px rgba(59,130,246,0.65), 0 24px 60px -18px rgba(59,130,246,0.45)',
              }}
            >
              <span>Start learning</span>
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-transform duration-200 group-hover:translate-x-0.5"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M1 7h12m0 0L8 2m5 5L8 12"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
          <p
            className="flex items-center gap-2 text-[12px] font-medium"
            style={{ color: 'var(--ll-ink-subtle)' }}
          >
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.16)' }}
            />
            Free to start · No credit card required
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
