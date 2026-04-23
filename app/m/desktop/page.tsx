import { Monitor } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export const metadata = {
  title: 'Desktop',
};

export default function MobileDesktopPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div
        className="mt-10 rounded-2xl p-8 text-center"
        style={{
          backgroundColor: 'var(--ll-bg-elevated)',
          border: '1px solid var(--ll-border)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <div
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(59,130,246,0.10)',
            border: '1px solid rgba(37,99,235,0.3)',
          }}
        >
          <Monitor size={24} strokeWidth={2} className="text-blue-600" />
        </div>
        <h1
          className="mt-6 text-[22px] font-bold text-[var(--ll-ink)] tracking-tight leading-tight"
          style={SG}
        >
          Go to desktop to get the actual experience.
        </h1>
        <p className="mt-3 text-[14px] text-[var(--ll-ink-muted)] leading-relaxed max-w-xs mx-auto">
          The editor, mock interviews, and full curriculum live on your laptop.
        </p>
      </div>
    </div>
  );
}
