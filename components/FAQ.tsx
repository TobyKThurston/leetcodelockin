'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'Is it actually free?',
    a: 'Yes. No credit card, no account, no paywall. You can start solving problems right now.',
  },
  {
    q: 'Do I need to know Python?',
    a: 'Basic Python helps, but the curriculum starts from the foundations. If you know variables, loops, and functions in any language, you\'re ready.',
  },
  {
    q: 'How is this different from just grinding LeetCode?',
    a: 'LeetCode gives you problems. Lock In gives you patterns. Instead of memorizing solutions one by one, you learn the underlying framework that makes dozens of problems feel the same.',
  },
  {
    q: 'What if I get completely stuck?',
    a: 'The hint system is tiered — broad, then specific, then concrete. You\'ll never be left staring at a blank screen. Every hint moves your thinking forward without just giving you the answer.',
  },
  {
    q: 'How long until I\'m interview-ready?',
    a: 'Realistically, 10–14 weeks of consistent daily practice. The curriculum is structured as a 12-week track from Python basics to company-targeted problem sets.',
  },
  {
    q: 'Which companies does the curriculum target?',
    a: 'Google, Meta, Amazon, Apple, and Microsoft are the primary tracks. There\'s also a startup track and a general software engineering track for broader prep.',
  },
  {
    q: 'I already know some patterns. Is this still useful?',
    a: 'Yes. The library covers edge cases and variations most self-studiers miss. The interview-ready stage also covers behavioral prep and system design, which patterns alone won\'t cover.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative px-4 sm:px-6 py-28" style={{ scrollMarginTop: '80px' }}>
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] text-slate-700 tracking-[0.22em] uppercase font-medium mb-3">
            FAQ
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#e2e8f0] tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Questions answered.
          </h2>
        </div>

        {/* Accordion */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            const isLast = i === faqs.length - 1;
            return (
              <div
                key={i}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  background: isOpen ? 'rgba(59,130,246,0.03)' : 'transparent',
                  transition: 'background 0.3s ease',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left group"
                >
                  <span
                    className="text-[13.5px] font-medium transition-colors duration-200"
                    style={{
                      color: isOpen ? '#e2e8f0' : 'rgba(148,163,184,0.8)',
                      fontFamily: 'var(--font-space-grotesk), sans-serif',
                    }}
                  >
                    {faq.q}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="shrink-0"
                    style={{
                      color: isOpen ? 'rgba(59,130,246,0.8)' : 'rgba(71,85,105,0.8)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), color 0.2s ease',
                    }}
                  >
                    <path
                      d="M2 4L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? 200 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  <p className="px-6 pb-5 text-[13px] text-slate-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
