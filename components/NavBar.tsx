'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar({ flush }: { flush?: boolean } = {}) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed ${flush ? 'top-0' : 'top-4'} left-0 right-0 z-50 flex justify-center px-4`}>
      <div
        className={`
          flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          rounded-2xl border backdrop-blur-md
          ${compact
            ? 'w-full max-w-lg px-4 py-2 bg-white/[0.05] border-white/[0.1] shadow-lg shadow-black/40'
            : 'w-full max-w-2xl px-5 py-3 bg-white/[0.03] border-white/[0.07] shadow-xl shadow-black/30'
          }
        `}
      >
        <div className="flex items-center mr-auto">
          <span
            className={`font-semibold tracking-tight text-white transition-all duration-500 ${
              compact ? 'text-sm' : 'text-[15px]'
            }`}
          >
            LeetLockin
          </span>
        </div>

        <nav
          className={`hidden md:flex items-center gap-5 text-zinc-400 transition-all duration-500 ${
            compact ? 'text-[12px]' : 'text-[13px]'
          }`}
        >
          <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <Link
          href="/dashboard"
          className={`ml-auto bg-white text-zinc-900 rounded-lg font-semibold hover:bg-zinc-100 transition-all duration-500 ${
            compact ? 'text-[11px] px-3 py-1.5' : 'text-xs px-4 py-2'
          }`}
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
