'use client';

import { Mic, AlertCircle, Check } from 'lucide-react';
import type { VoiceQuotaResult } from '@/lib/voice-quota';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

interface Props {
  quota: VoiceQuotaResult | null;
  /** 'compact' shows a single line; 'card' shows a bordered panel. */
  variant?: 'compact' | 'card';
}

export default function VoiceQuotaBadge({ quota, variant = 'compact' }: Props) {
  if (!quota) return null;

  const capped = !quota.allowed;
  const lineParts = quotaLine(quota);

  if (variant === 'compact') {
    return (
      <div
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium"
        style={{ ...SG, color: capped ? 'var(--ll-danger-ink)' : 'var(--ll-ink-muted)' }}
        title={lineParts.tooltip}
      >
        {capped ? <AlertCircle size={12} /> : <Mic size={12} />}
        <span>{lineParts.label}</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{
        background: capped ? 'rgba(239,68,68,0.06)' : 'var(--ll-bg-subtle)',
        border: `1px solid ${capped ? 'rgba(239,68,68,0.25)' : 'var(--ll-border)'}`,
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{
          background: capped ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)',
          color: capped ? 'var(--ll-danger-ink)' : '#7c3aed',
        }}
      >
        {capped ? <AlertCircle size={15} /> : quota.used === 0 ? <Mic size={15} /> : <Check size={15} />}
      </div>
      <div className="min-w-0">
        <p
          className="text-[12.5px] font-semibold"
          style={{ ...SG, color: capped ? 'var(--ll-danger-ink)' : 'var(--ll-ink)' }}
        >
          {lineParts.label}
        </p>
        {lineParts.sub && (
          <p className="text-[11.5px] mt-0.5" style={{ ...SG, color: 'var(--ll-ink-muted)' }}>
            {lineParts.sub}
          </p>
        )}
      </div>
    </div>
  );
}

function quotaLine(q: VoiceQuotaResult): { label: string; sub?: string; tooltip: string } {
  if (q.isPro) {
    const label = `${q.used} / ${q.limit} voice mocks this month`;
    const sub = q.allowed
      ? `${q.limit - q.used} remaining in your 30-day window.`
      : 'Monthly cap reached — resets as older sessions roll off.';
    return { label, sub, tooltip: label };
  }
  // Free tier — limit is 1 lifetime trial.
  if (q.used === 0) {
    return {
      label: 'Free trial available (1 voice mock)',
      sub: 'Upgrade to Pro for 10 voice mocks per month.',
      tooltip: 'One free voice mock, then upgrade to Pro for 10/month.',
    };
  }
  return {
    label: 'Free trial used',
    sub: 'Upgrade to Pro for 10 voice mocks per month.',
    tooltip: 'Upgrade to Pro for 10/month.',
  };
}
