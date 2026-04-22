'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

/* Persistent bottom CTA bar that appears once the user has scrolled past
   the hero and disappears as they approach the footer. Landing-page only
   — mount inside LandingPage.tsx, not in the root layout. */

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;

      // Appear after scrolling past ~80% of the hero, hide as the footer
      // approaches (~1.2 viewport-heights from the bottom of the document).
      const past = y > vh * 0.8;
      const nearFooter = y + vh > docH - vh * 1.2;
      setVisible(past && !nearFooter);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      aria-hidden={!visible}
      className="fixed left-0 right-0 bottom-0 z-40 flex justify-center px-4 pb-4 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 320ms cubic-bezier(0.22,1,0.36,1), transform 320ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div
        className="pointer-events-auto flex items-center gap-3 sm:gap-5 rounded-lg pl-4 pr-2 sm:pl-6 sm:pr-3 py-2 backdrop-blur-md max-w-[calc(100vw-2rem)]"
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid var(--ll-border)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -10px rgba(15,23,42,0.18)',
        }}
      >
        <span
          className="hidden sm:inline text-[13px] font-medium"
          style={{ color: 'var(--ll-ink)' }}
        >
          Ready to lock in?
        </span>
        <span
          className="hidden sm:inline text-[12px]"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          Free to start.
        </span>

        <Link
          href="/sign-in"
          className="group inline-flex items-center gap-2 px-4 sm:px-5 h-9 rounded-md text-[13px] font-semibold text-white transition-all duration-150 active:scale-[0.97]"
          style={{
            background: 'var(--ll-accent)',
            boxShadow:
              '0 1px 0 0 rgba(255,255,255,0.15) inset, 0 1px 2px rgba(15,23,42,0.06), 0 6px 18px -8px rgba(59,130,246,0.55)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--ll-accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--ll-accent)';
          }}
        >
          Start Learning
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="ml-1 w-7 h-7 inline-flex items-center justify-center rounded-md text-[16px] leading-none transition-colors"
          style={{ color: 'var(--ll-ink-subtle)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--ll-bg-subtle)';
            e.currentTarget.style.color = 'var(--ll-ink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--ll-ink-subtle)';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
