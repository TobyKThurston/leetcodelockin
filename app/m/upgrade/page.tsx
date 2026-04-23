import { Check, Zap, ArrowRight } from 'lucide-react';
import { getSupabaseUser } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/subscription';
import MobileUpgradeCards from '@/components/mobile/MobileUpgradeCards';
import Link from 'next/link';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export const metadata = {
  title: 'Upgrade to Pro',
};

const LOCKED_FEATURES = [
  {
    title: 'Mock interviews',
    desc: 'Timed 45-minute sessions with AI-powered debriefs',
  },
  {
    title: 'Spaced-repetition review',
    desc: 'Come back to problems right before you forget them',
  },
  {
    title: 'Unlimited AI tutor',
    desc: 'Socratic hints across every block in the curriculum',
  },
];

export default async function MobileUpgradePage() {
  const user = await getSupabaseUser();
  const sub = user ? await getUserSubscription(user.id) : null;

  // Already pro — confirmation view.
  if (sub?.isPro) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="pt-1">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)]">
            Your plan
          </p>
          <h1 className="mt-1 text-[26px] font-bold text-[var(--ll-ink)] tracking-tight" style={SG}>
            You&apos;re Pro
          </h1>
        </div>

        <div
          className="bg-gradient-to-b from-blue-100/60 to-sky-50/30 ring-1 ring-blue-500/25 rounded-2xl p-6"
          style={{
            backgroundColor: 'var(--ll-bg-elevated)',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 30px -20px rgba(59,130,246,0.35)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(37,99,235,0.3)',
            }}
          >
            <Check size={22} strokeWidth={2.5} className="text-blue-600" />
          </div>
          <h2 className="mt-4 text-[18px] font-bold text-[var(--ll-ink)]" style={SG}>
            All features unlocked
          </h2>
          <p className="mt-1.5 text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">
            Mock interviews, AI feedback, review queue, and unlimited tutor are active on your
            account. Everything runs on desktop.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 h-12 px-5 rounded-xl text-[14px] font-semibold w-full inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-white"
            style={{ backgroundColor: 'var(--ll-accent)' }}
          >
            Open desktop site
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
        </div>

        <p className="text-center text-[12px] text-[var(--ll-ink-subtle)]">
          Manage or cancel your subscription in Settings on desktop.
        </p>
      </div>
    );
  }

  // Free — pricing view.
  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Hero */}
      <div className="pt-1">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(217,119,6,0.35)',
            }}
          >
            <Zap size={13} strokeWidth={2.5} className="text-amber-600" />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)]">
            Upgrade
          </p>
        </div>
        <h1 className="mt-2 text-[26px] font-bold text-[var(--ll-ink)] tracking-tight leading-tight" style={SG}>
          Unlock interview mode
        </h1>
        <p className="mt-2 text-[14px] text-[var(--ll-ink-muted)] leading-relaxed">
          Pro unlocks the full interview-prep toolkit on desktop. The free curriculum stays free
          forever.
        </p>
      </div>

      {/* What's locked */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--ll-bg-elevated)',
          border: '1px solid var(--ll-border)',
        }}
      >
        {LOCKED_FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="flex items-start gap-3 px-4 py-4"
            style={i > 0 ? { borderTop: '1px solid var(--ll-border)' } : undefined}
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/25 flex items-center justify-center mt-0.5">
              <Check size={14} strokeWidth={2.5} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[var(--ll-ink)]" style={SG}>
                {f.title}
              </p>
              <p className="mt-0.5 text-[12.5px] text-[var(--ll-ink-muted)] leading-snug">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing cards */}
      <MobileUpgradeCards />

      {/* Free tier reassurance */}
      <div className="text-center">
        <p className="text-[11.5px] text-[var(--ll-ink-subtle)] leading-relaxed max-w-xs mx-auto">
          Not ready? The full curriculum, 212+ problems, and 5 tutor messages stay free forever.
        </p>
      </div>
    </div>
  );
}
