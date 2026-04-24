import { Monitor } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export const metadata = {
  title: 'Desktop',
};

export default function MobileDesktopPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mt-10 bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-8 text-center">
        <div
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <Monitor size={24} strokeWidth={2} className="text-blue-300" />
        </div>
        <h1
          className="mt-6 text-[22px] font-bold text-slate-900 tracking-tight leading-tight"
          style={SG}
        >
          Go to desktop to get the actual experience.
        </h1>
        <p className="mt-3 text-[14px] text-slate-600 leading-relaxed max-w-xs mx-auto">
          The editor, mock interviews, and full curriculum live on your laptop.
        </p>
      </div>
    </div>
  );
}
