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
    <div
      className="theme-light min-h-[100dvh] overflow-x-hidden"
      style={{
        color: 'var(--ll-ink)',
        backgroundColor: 'var(--ll-bg)',
        backgroundImage: [
          'radial-gradient(ellipse 55% 45% at 78% 8%, rgba(59,130,246,0.12), transparent 70%)',
          'radial-gradient(ellipse 50% 40% at 12% 18%, rgba(56,189,248,0.10), transparent 70%)',
          'radial-gradient(ellipse 70% 50% at 50% 95%, rgba(59,130,246,0.06), transparent 72%)',
        ].join(', '),
        backgroundAttachment: 'fixed, fixed, fixed',
      }}
    >
      <div className="relative max-w-xl mx-auto px-4 pt-10 pb-12 space-y-6">
        {/* Header eyebrow */}
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)] text-center">
          You&apos;re signed in
        </p>

        {/* Hero card */}
        <div
          className="relative rounded-2xl p-6"
          style={{
            backgroundColor: 'var(--ll-bg-elevated)',
            border: '1px solid var(--ll-border)',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 20px 50px -25px rgba(59,130,246,0.35)',
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
            style={{
              background: 'rgba(59,130,246,0.10)',
              border: '1px solid rgba(37,99,235,0.3)',
            }}
          >
            <Monitor size={24} strokeWidth={2} className="text-blue-600" />
          </div>

          <h1
            className="mt-5 text-[24px] font-bold text-[var(--ll-ink)] tracking-tight text-center leading-tight"
            style={SG}
          >
            Built for your laptop
          </h1>
          <p className="mt-2 text-[14px] text-[var(--ll-ink-muted)] leading-relaxed text-center max-w-sm mx-auto">
            LeetLockin is a real coding environment — editor, split-screen, mock interviews.
            For the full thing, open this on your laptop.
          </p>

          {/* Feature list */}
          <ul className="mt-6 space-y-3">
            {DESKTOP_FEATURES.map(({ Icon, label }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon size={15} strokeWidth={2} className="shrink-0 mt-0.5 text-blue-600" />
                <span className="text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">{label}</span>
              </li>
            ))}
          </ul>

          {/* Primary actions */}
          <div className="mt-6 space-y-2.5">
            <a
              href={smsHref}
              className="h-12 px-5 rounded-xl text-[14px] font-semibold text-white w-full inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ backgroundColor: 'var(--ll-accent)' }}
            >
              <MessageSquare size={16} strokeWidth={2.5} />
              Text link to myself
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="h-12 px-5 rounded-xl text-[14px] font-semibold w-full inline-flex items-center justify-center gap-2 text-[var(--ll-ink)] hover:bg-[var(--ll-bg-subtle)] active:scale-[0.98] transition-all"
              style={{
                backgroundColor: 'var(--ll-bg-elevated)',
                border: '1px solid var(--ll-border-strong)',
              }}
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={2.5} className="text-emerald-600" />
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

          <p className="mt-4 text-[11px] text-[var(--ll-ink-subtle)] text-center break-all">{siteUrl}</p>
        </div>

        {/* Secondary — keep browsing on mobile */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'var(--ll-bg-elevated)',
            border: '1px solid var(--ll-border)',
          }}
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--ll-ink-subtle)]">
            Still here?
          </p>
          <h2 className="mt-1.5 text-[15px] font-semibold text-[var(--ll-ink)]" style={SG}>
            Keep studying on your phone
          </h2>
          <p className="mt-1.5 text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">
            Read lessons, flip through flashcards, and track progress. The full editor will
            be waiting when you get to your laptop.
          </p>
          <Link
            href="/m"
            className="mt-4 h-11 px-4 rounded-lg text-[13px] font-semibold text-[var(--ll-ink)] hover:bg-[var(--ll-bg-subtle)] inline-flex items-center justify-center gap-1.5 w-full transition-colors"
            style={{
              backgroundColor: 'var(--ll-bg-elevated)',
              border: '1px solid var(--ll-border)',
            }}
          >
            Continue on mobile
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
