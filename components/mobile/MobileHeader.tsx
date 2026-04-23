import Image from 'next/image';
import Link from 'next/link';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default function MobileHeader() {
  return (
    <header
      className="sticky top-0 z-20 h-12 backdrop-blur"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: 'rgba(250,251,252,0.8)',
        borderBottom: '1px solid var(--ll-border)',
      }}
    >
      <div className="h-12 px-4 flex items-center">
        <Link href="/?home=1" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
          <span
            className="text-[14px] font-semibold tracking-tight"
            style={{ ...SG, color: 'var(--ll-ink)' }}
          >
            LeetLockin
          </span>
        </Link>
      </div>
    </header>
  );
}
