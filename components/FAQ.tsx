'use client';

import { motion, type Variants } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const container: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const faqs = [
  {
    q: 'How is LeetLockin different from LeetCode?',
    a: 'LeetCode is a problem bank. LeetLockin is a curriculum. You learn patterns like Two Pointers, Sliding Window, and Dynamic Programming first, then practice problems grouped by that pattern. Every solve reinforces a transferable skill instead of memorizing a one-off answer.',
  },
  {
    q: 'What do I get on the free plan?',
    a: 'The full curriculum. All 4 paths, 200+ problems, in-browser Python execution, and progress tracking are free. Free includes 5 AI hints per week. Pro removes the cap and adds mock interviews, spaced repetition, and streak freezes.',
  },
  {
    q: 'Do I need to know Python before I start?',
    a: 'No. Path 1 is Python Foundations. It covers variables, loops, functions, lists, dictionaries, and sets before you touch your first problem. If you already know Python, skip ahead to Core Data Structures.',
  },
  {
    q: 'Does the AI just hand me the answer?',
    a: 'No. Hints are progressive. First, a nudge about which pattern applies. Next, a pointer to the specific technique. Only if you ask again do you see the mechanics. The goal is to close your gap, not replace your thinking.',
  },
  {
    q: 'Does this prep me for top tech companies?',
    a: 'Yes. The Pattern Library covers every template you see in FAANG-style interviews, including BFS, DFS, Backtracking, Dynamic Programming, Heaps, and Tries. The Interview Ready path drills timed problem solving, communication, and clean code writing.',
  },
  {
    q: 'Can I cancel Pro anytime?',
    a: 'Yes. Cancel from your dashboard in one click. You keep Pro access until the end of your current billing period, then drop to the free plan. No emails, no friction.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative px-6 sm:px-10 pb-32" style={{ scrollMarginTop: '80px' }}>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="relative max-w-3xl mx-auto"
      >
        {/* Eyebrow + headline — centered, editorial */}
        <div className="text-center">
          <motion.p
            variants={item}
            className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-4"
            style={{ color: 'var(--ll-accent)' }}
          >
            Questions
          </motion.p>

          <motion.h2
            variants={item}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{ color: 'var(--ll-ink)' }}
          >
            Everything else worth knowing
          </motion.h2>

          <motion.p
            variants={item}
            className="mt-4 text-[15px] leading-relaxed max-w-md mx-auto"
            style={{ color: 'var(--ll-ink-muted)' }}
          >
            If it is not here, email us at{' '}
            <a
              href="mailto:tobykthurston@gmail.com"
              className="underline decoration-[var(--ll-border-strong)] underline-offset-4 transition-colors hover:text-[var(--ll-ink)] hover:decoration-[var(--ll-accent)]"
              style={{ color: 'var(--ll-ink)' }}
            >
              tobykthurston@gmail.com
            </a>
            .
          </motion.p>
        </div>

        {/* Editorial accordion — no card, hairline dividers on the section ground */}
        <motion.div variants={item} className="mt-16 text-left">
          <Accordion>
            {faqs.map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="group border-t border-[var(--ll-border)] last:border-b last:border-b-[var(--ll-border)]"
              >
                <AccordionTrigger
                  className="py-6 text-[16px] sm:text-[17px] font-medium tracking-tight hover:no-underline transition-colors hover:text-[var(--ll-accent)]"
                  style={{ color: 'var(--ll-ink)' }}
                >
                  <span className="flex items-baseline gap-4">
                    <span
                      className="text-[11px] tabular-nums font-mono font-medium tracking-wider shrink-0"
                      style={{ color: 'var(--ll-ink-subtle)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent
                  className="pb-7 pl-[2.25rem] pr-8 text-[14.5px] leading-[1.7]"
                  style={{ color: 'var(--ll-ink-muted)' }}
                >
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>
    </section>
  );
}
