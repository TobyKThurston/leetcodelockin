'use client';

import { motion, type Variants } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQS } from '@/lib/faqs';

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
              href="mailto:support@leetlockin.com"
              className="underline decoration-[var(--ll-border-strong)] underline-offset-4 transition-colors hover:text-[var(--ll-ink)] hover:decoration-[var(--ll-accent)]"
              style={{ color: 'var(--ll-ink)' }}
            >
              support@leetlockin.com
            </a>
            .
          </motion.p>
        </div>

        {/* Editorial accordion — no card, hairline dividers on the section ground */}
        <motion.div variants={item} className="mt-16 text-left">
          <Accordion>
            {FAQS.map(({ q, a }, i) => (
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
