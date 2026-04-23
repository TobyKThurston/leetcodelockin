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
    iconColor: 'text-amber-600',
    iconBg: 'rgba(251,191,36,0.12)',
    iconBorder: 'rgba(217,119,6,0.35)',
    ring: 'ring-amber-500/30',
    glow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 30px -20px rgba(217,119,6,0.35)',
    bg: 'from-amber-100/60 to-amber-50/30',
  },
  {
    href: '/m/cards',
    eyebrow: 'Review',
    title: 'Review cards',
    desc: 'Flip through Big-O, patterns, and core concepts on the go.',
    Icon: Layers,
    iconColor: 'text-blue-600',
    iconBg: 'rgba(59,130,246,0.10)',
    iconBorder: 'rgba(37,99,235,0.3)',
    ring: 'ring-blue-500/25',
    glow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 30px -20px rgba(59,130,246,0.35)',
    bg: 'from-blue-100/60 to-sky-50/30',
  },
  {
    href: '/m/desktop',
    eyebrow: 'Desktop',
    title: 'Go to desktop',
    desc: 'The real experience — editor, interviews, curriculum — lives on your laptop.',
    Icon: Monitor,
    iconColor: 'text-slate-700',
    iconBg: 'rgba(100,116,139,0.10)',
    iconBorder: 'rgba(71,85,105,0.25)',
    ring: 'ring-[var(--ll-border-strong)]',
    glow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -18px rgba(71,85,105,0.3)',
    bg: 'from-slate-100/60 to-white/40',
  },
] as const;

export default function MobileHomePage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="pt-2">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)]">
          LeetLockin · Mobile
        </p>
        <h1
          className="mt-1.5 text-[28px] font-bold text-[var(--ll-ink)] tracking-tight leading-tight"
          style={SG}
        >
          Pick one.
        </h1>
        <p className="mt-2 text-[14px] text-[var(--ll-ink-muted)] leading-relaxed">
          Mobile keeps it simple. For the full editor and mock interviews, grab your laptop.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ href, eyebrow, title, desc, Icon, iconColor, iconBg, iconBorder, ring, glow, bg }) => (
          <Link
            key={href}
            href={href}
            className={`group block bg-gradient-to-b ${bg} ring-1 ${ring} rounded-2xl p-5 active:scale-[0.98] transition-all`}
            style={{ boxShadow: glow, backgroundColor: 'var(--ll-bg-elevated)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
              >
                <Icon size={20} strokeWidth={2} className={iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--ll-ink-subtle)]">
                  {eyebrow}
                </p>
                <h2 className="mt-1 text-[17px] font-bold text-[var(--ll-ink)] leading-tight" style={SG}>
                  {title}
                </h2>
                <p className="mt-1 text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">{desc}</p>
              </div>
              <ArrowRight
                size={18}
                strokeWidth={2}
                className="shrink-0 mt-2 text-[var(--ll-ink-subtle)] group-hover:text-[var(--ll-ink)] group-hover:translate-x-0.5 transition-all"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
