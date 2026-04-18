'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';


const card: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 24, filter: 'blur(12px)' },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.09,
      delayChildren: 0.25,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FinalCTA() {
  return (
    <section className="relative px-4 sm:px-6 py-28 text-center">

      <motion.div
        variants={card}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="relative max-w-2xl mx-auto rounded-2xl border border-white/[0.1] bg-white/[0.05] backdrop-blur-md shadow-xl shadow-black/30 px-6 sm:px-10 py-12 sm:py-14"
      >
        <motion.p
          variants={item}
          className="text-[11px] text-blue-400/70 tracking-[0.22em] uppercase font-medium mb-6"
        >
          Ready to lock in?
        </motion.p>

        <motion.h2
          variants={item}
          className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]"
        >
          <span className="text-white">Stop memorizing.</span>
          <br />
          <span className="text-white">Start understanding.</span>
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-5 text-[15px] text-slate-400 leading-relaxed max-w-md mx-auto"
        >
          You don&apos;t need more problems. You need a better system.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/sign-in"
            className="group relative inline-flex items-center gap-2.5 px-9 py-4 text-white text-[15px] font-semibold rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 ring-1 ring-inset ring-white/15 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-150 active:scale-[0.97]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
            />
            Start Learning
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-100">→</span>
          </Link>
          <p className="text-[12px] text-slate-500">
            Free to start · No credit card required
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
