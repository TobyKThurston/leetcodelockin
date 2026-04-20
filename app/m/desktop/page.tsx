import { Monitor } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export const metadata = {
  title: 'Desktop',
};

export default function MobileDesktopPage() {
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="pt-1">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
          Desktop
        </p>
        <h1 className="mt-1 text-[26px] font-bold text-white tracking-tight" style={SG}>
          Go to desktop
        </h1>
      </div>

      <div className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <Monitor size={22} strokeWidth={2} className="text-blue-300" />
        </div>
        <p className="mt-4 text-[15px] text-slate-200 leading-relaxed" style={SG}>
          Go on desktop to get the most out of LeetLockin.com.
        </p>
      </div>
    </div>
  );
}
