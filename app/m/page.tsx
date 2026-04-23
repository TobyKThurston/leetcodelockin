import Link from 'next/link';
import { ArrowRight, Layers, Monitor, Zap } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const OPTIONS = [
  {
    href: '/m/upgrade',
    eyebrow: 'Upgrade',
    title: 'Upgrade to Pro',
    desc: 'Unlock mock interviews, spaced review, and unlimited AI tutor.',
    Icon: Zap,
    iconColor: 'text-amber-300',
    iconBg: 'rgba(251,191,36,0.1)',
    iconBorder: 'rgba(251,191,36,0.25)',
    ring: 'ring-amber-400/25',
    glow: '0 0 40px -15px rgba(251,191,36,0.35)',
    bg: 'from-amber-500/[0.06] to-amber-500/[0.01]',
  },
  {
    href: '/m/cards',
    eyebrow: 'Review',
    title: 'Review cards',
    desc: 'Flip through Big-O, patterns, and core concepts on the go.',
    Icon: Layers,
    iconColor: 'text-blue-300',
    iconBg: 'rgba(147,197,253,0.1)',
    iconBorder: 'rgba(147,197,253,0.22)',
    ring: 'ring-blue-400/25',
    glow: '0 0 40px -15px rgba(59,130,246,0.3)',
    bg: 'from-blue-500/[0.06] to-blue-500/[0.01]',
  },
  {
    href: '/m/desktop',
    eyebrow: 'Desktop',
    title: 'Go to desktop',
    desc: 'The real experience — editor, interviews, curriculum — lives on your laptop.',
    Icon: Monitor,
    iconColor: 'text-slate-200',
    iconBg: 'rgba(148,163,184,0.08)',
    iconBorder: 'rgba(148,163,184,0.2)',
    ring: 'ring-white/10',
    glow: '0 0 32px -18px rgba(148,163,184,0.4)',
    bg: 'from-white/[0.03] to-white/[0.01]',
  },
] as const;

export default function MobileHomePage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="pt-2">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
          LeetLockin · Mobile
        </p>
        <h1
          className="mt-1.5 text-[28px] font-bold text-white tracking-tight leading-tight"
          style={SG}
        >
          Pick one.
        </h1>
        <p className="mt-2 text-[14px] text-slate-400 leading-relaxed">
          Mobile keeps it simple. For the full editor and mock interviews, grab your laptop.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ href, eyebrow, title, desc, Icon, iconColor, iconBg, iconBorder, ring, glow, bg }) => (
          <Link
            key={href}
            href={href}
            className={`group block bg-gradient-to-b ${bg} ring-1 ${ring} rounded-2xl p-5 active:scale-[0.98] transition-all`}
            style={{ boxShadow: glow }}
          >
            <div className="flex items-start gap-4">
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
              >
                <Icon size={20} strokeWidth={2} className={iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500">
                  {eyebrow}
                </p>
                <h2 className="mt-1 text-[17px] font-bold text-white leading-tight" style={SG}>
                  {title}
                </h2>
                <p className="mt-1 text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight
                size={18}
                strokeWidth={2}
                className="shrink-0 mt-2 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
