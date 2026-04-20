import Image from 'next/image';
import Link from 'next/link';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default function MobileHeader() {
  return (
    <header
      className="sticky top-0 z-20 h-12 backdrop-blur bg-[#070c17]/80 border-b border-white/[0.06]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-12 px-4 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
          <span className="text-[14px] font-semibold text-white tracking-tight" style={SG}>
            LeetLockin
          </span>
        </Link>
      </div>
    </header>
  );
}
