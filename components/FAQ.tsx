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
    <section id="faq" className="relative px-4 sm:px-6 pb-28 text-center" style={{ scrollMarginTop: '80px' }}>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="relative max-w-2xl mx-auto"
      >
        <motion.p
          variants={item}
          className="text-[11px] text-blue-400/70 tracking-[0.22em] uppercase font-medium mb-4"
        >
          Questions
        </motion.p>

        <motion.h2
          variants={item}
          className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] text-white"
        >
          Everything else worth knowing
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-4 text-[14px] text-slate-400 leading-relaxed max-w-md mx-auto"
        >
          If it is not here, email us at tobykthurston@gmail.com.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 rounded-2xl border border-white/[0.1] bg-white/[0.05] backdrop-blur-md shadow-xl shadow-black/30 px-5 sm:px-7 py-1 text-left"
        >
          <Accordion>
            {faqs.map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-white/[0.08] last:border-b-0"
              >
                <AccordionTrigger className="py-5 text-[15px] font-medium text-white hover:no-underline hover:opacity-90 [&>svg]:text-slate-400">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 pr-8 text-[14px] leading-relaxed text-slate-400">
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
