'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Monitor,
  MessageSquare,
  Copy,
  Check,
  ArrowRight,
  Code2,
  Timer,
  BookOpen,
} from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const DESKTOP_FEATURES = [
  { Icon: Code2,  label: 'Full Python editor with shortcuts and splitting' },
  { Icon: Timer,  label: 'Timed mock interviews with AI debriefs' },
  { Icon: BookOpen, label: 'Structured curriculum across 4 learning paths' },
];

export default function MobileHandoffScreen({ siteUrl }: { siteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be blocked — silent fail is fine, user still has Text option.
    }
  }

  const smsBody = `Here's that LeetLockin link — open it on your laptop: ${siteUrl}`;
  const smsHref = `sms:?&body=${encodeURIComponent(smsBody)}`;

  return (
    <div className="min-h-[100dvh] bg-[#070c17] text-white overflow-x-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59,130,246,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-xl mx-auto px-4 pt-10 pb-12 space-y-6">
        {/* Header eyebrow */}
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 text-center">
          You&apos;re signed in
        </p>

        {/* Hero card */}
        <div className="relative bg-gradient-to-b from-blue-500/[0.05] to-blue-500/[0.01] ring-1 ring-blue-500/20 rounded-2xl p-6 shadow-[0_0_60px_-20px_rgba(59,130,246,0.35)]">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
            style={{
              background: 'rgba(59,130,246,0.10)',
              border: '1px solid rgba(59,130,246,0.25)',
            }}
          >
            <Monitor size={24} strokeWidth={2} className="text-blue-300" />
          </div>

          <h1
            className="mt-5 text-[24px] font-bold text-white tracking-tight text-center leading-tight"
            style={SG}
          >
            Built for your laptop
          </h1>
          <p className="mt-2 text-[14px] text-slate-400 leading-relaxed text-center max-w-sm mx-auto">
            LeetLockin is a real coding environment — editor, split-screen, mock interviews.
            For the full thing, open this on your laptop.
          </p>

          {/* Feature list */}
          <ul className="mt-6 space-y-3">
            {DESKTOP_FEATURES.map(({ Icon, label }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon size={15} strokeWidth={2} className="shrink-0 mt-0.5 text-blue-300/80" />
                <span className="text-[13px] text-slate-300 leading-relaxed">{label}</span>
              </li>
            ))}
          </ul>

          {/* Primary actions */}
          <div className="mt-6 space-y-2.5">
            <a
              href={smsHref}
              className="h-12 px-5 rounded-xl bg-white text-zinc-900 text-[14px] font-semibold w-full inline-flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-[0.98] transition-all"
            >
              <MessageSquare size={16} strokeWidth={2.5} />
              Text link to myself
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="h-12 px-5 rounded-xl border border-white/15 bg-white/5 text-[14px] font-semibold w-full inline-flex items-center justify-center gap-2 text-white hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={2.5} className="text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} strokeWidth={2} />
                  Copy desktop link
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-[11px] text-slate-600 text-center break-all">{siteUrl}</p>
        </div>

        {/* Secondary — keep browsing on mobile */}
        <div className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
            Still here?
          </p>
          <h2 className="mt-1.5 text-[15px] font-semibold text-white" style={SG}>
            Keep studying on your phone
          </h2>
          <p className="mt-1.5 text-[13px] text-slate-400 leading-relaxed">
            Read lessons, flip through flashcards, and track progress. The full editor will
            be waiting when you get to your laptop.
          </p>
          <Link
            href="/m"
            className="mt-4 h-11 px-4 rounded-lg border border-white/10 bg-white/[0.03] text-[13px] font-semibold text-slate-200 hover:text-white hover:bg-white/[0.06] inline-flex items-center justify-center gap-1.5 w-full transition-colors"
          >
            Continue on mobile
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
