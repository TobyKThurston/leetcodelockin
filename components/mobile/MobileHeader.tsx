import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default function MobileHeader() {
  return (
    <header
      className="sticky top-0 z-20 h-12 backdrop-blur bg-[#070c17]/80 border-b border-white/[0.06]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-12 px-4 flex items-center justify-between">
        <Link href="/m" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
          <span className="text-[14px] font-semibold text-white tracking-tight" style={SG}>
            LeetLockin
          </span>
        </Link>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          Desktop
          <ArrowUpRight size={13} strokeWidth={2} />
        </a>
      </div>
    </header>
  );
}
