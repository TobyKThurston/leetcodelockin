'use client';

import { useEffect, useRef } from 'react';

const cards = [
  {
    label: 'Pattern recognition',
    parts: ['I know ', 'sliding window', '\u2026 but I never see it in the moment.'],
  },
  {
    label: 'Generalization',
    parts: ['I understand ', 'Two Sum', ', but I can\u2019t apply it to new problems.'],
  },
  {
    label: 'Independence',
    parts: ['I can solve it after seeing the answer, but not on my own.'],
  },
  {
    label: 'Starting point',
    parts: ['I don\u2019t know which ', 'data structure', ' to start with.'],
  },
];

export default function PainCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll<HTMLElement>('.pain-card');
    if (!els) return;

    const observers: IntersectionObserver[] = [];

    els.forEach((el, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add('is-visible'), i * 110);
            observer.disconnect();
          }
        },
        { threshold: 0.12 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const left = [cards[0], cards[2]];
  const right = [cards[1], cards[3]];

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start">
      {/* Left column */}
      <div className="space-y-4">
        {left.map((card, i) => (
          <CardItem key={card.label} card={card} />
        ))}
      </div>
      {/* Right column — offset down for stagger */}
      <div className="space-y-4 md:pt-10">
        {right.map((card, i) => (
          <CardItem key={card.label} card={card} />
        ))}
      </div>
    </div>
  );
}

function CardItem({ card }: { card: (typeof cards)[number] }) {
  return (
    <div
      className="pain-card group rounded-xl border border-white/[0.04] px-7 py-6 hover:border-white/[0.09] hover:-translate-y-[2px] transition-[border-color,transform] duration-200"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)',
      }}
    >
      <p className="text-[11px] text-slate-600 tracking-widest uppercase font-medium mb-3">
        {card.label}
      </p>
      <p className="text-[1rem] text-slate-400 leading-relaxed">
        {card.parts.map((chunk, j) =>
          j % 2 === 1 ? (
            <span key={j} className="text-[#cbd5e1] font-medium">{chunk}</span>
          ) : (
            chunk
          )
        )}
      </p>
    </div>
  );
}
