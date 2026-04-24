'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Mic, Clock } from 'lucide-react';
import type { InterviewSession, VoiceScorecard } from '@/lib/interview';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function fmtMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function fmtSec(sec: number): string {
  const m = Math.max(0, Math.floor(sec / 60));
  const s = Math.max(0, Math.floor(sec % 60));
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VoiceDebriefView({
  session,
  onBack,
}: {
  session: InterviewSession;
  onBack: () => void;
}) {
  const scorecard: VoiceScorecard | null = session.voiceScorecard;
  const title = prettifySlug(session.problem1Slug);

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto w-full space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors"
        style={{ ...SG, color: 'var(--ll-ink-muted)' }}
      >
        <ArrowLeft size={13} />
        Back to history
      </button>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-[0.12em]"
            style={{
              ...SG,
              color: 'rgb(168,85,247)',
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
          >
            <Mic size={10} strokeWidth={2.5} />
            Voice debrief
          </span>
          {session.timeUsedMs != null && (
            <span
              className="inline-flex items-center gap-1 text-[11px]"
              style={{ ...MONO, color: 'var(--ll-ink-muted)' }}
            >
              <Clock size={11} />
              {fmtMs(session.timeUsedMs)}
            </span>
          )}
        </div>
        <h1 className="text-[26px] font-bold tracking-tight" style={{ ...SG, color: 'var(--ll-ink)' }}>
          {title}
        </h1>
      </div>

      {scorecard ? (
        <>
          <ScoreGrid scores={scorecard.scores} />

          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--ll-bg-elevated)', border: '1px solid var(--ll-border)' }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.14em] font-semibold mb-2"
              style={{ ...SG, color: 'var(--ll-ink-muted)' }}
            >
              Summary
            </p>
            <p className="text-[14px] leading-relaxed" style={{ ...SG, color: 'var(--ll-ink)' }}>
              {scorecard.summaryParagraph}
            </p>
          </div>

          {scorecard.quotes.length > 0 && (
            <div
              className="rounded-xl p-5 space-y-3"
              style={{ background: 'var(--ll-bg-elevated)', border: '1px solid var(--ll-border)' }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.14em] font-semibold"
                style={{ ...SG, color: 'var(--ll-ink-muted)' }}
              >
                Moments from the session
              </p>
              {scorecard.quotes.map((q, i) => (
                <div
                  key={i}
                  className="pl-3"
                  style={{
                    borderLeft: `2px solid ${
                      q.tag === 'strong' ? 'rgba(52,211,153,0.55)' : 'rgba(251,191,36,0.55)'
                    }`,
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                    style={{
                      ...SG,
                      color: q.tag === 'strong' ? 'rgba(52,211,153,0.95)' : 'rgba(251,191,36,0.95)',
                    }}
                  >
                    {q.tag === 'strong' ? 'Strong' : 'Watch out'} · {fmtSec(q.tSec)}
                  </p>
                  <p className="text-[13px] italic leading-relaxed" style={{ ...SG, color: 'var(--ll-ink)' }}>
                    “{q.text}”
                  </p>
                </div>
              ))}
            </div>
          )}

          {scorecard.suggestedNextProblems.length > 0 && (
            <div
              className="rounded-xl p-5 space-y-3"
              style={{ background: 'var(--ll-bg-elevated)', border: '1px solid var(--ll-border)' }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.14em] font-semibold"
                style={{ ...SG, color: 'var(--ll-ink-muted)' }}
              >
                Work on these next
              </p>
              {scorecard.suggestedNextProblems.map(s => (
                <Link
                  key={s.slug}
                  href={`/solve/${s.slug}`}
                  className="block rounded-lg px-3 py-2 transition-colors"
                  style={{ border: '1px solid var(--ll-border)' }}
                >
                  <p
                    className="text-[13px] font-semibold capitalize"
                    style={{ ...SG, color: 'var(--ll-ink)' }}
                  >
                    {prettifySlug(s.slug)}
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ ...SG, color: 'var(--ll-ink-muted)' }}
                  >
                    {s.reason}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div
          className="rounded-xl p-5 text-[13px]"
          style={{
            background: 'var(--ll-bg-elevated)',
            border: '1px solid var(--ll-border)',
            color: 'var(--ll-ink-muted)',
            ...SG,
          }}
        >
          No scorecard was generated for this session. The session ended before the debrief was saved.
        </div>
      )}

      {session.problem1Code && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--ll-bg-elevated)', border: '1px solid var(--ll-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[11px] uppercase tracking-[0.14em] font-semibold"
              style={{ ...SG, color: 'var(--ll-ink-muted)' }}
            >
              Final code
            </p>
            {session.problem1Results && (
              <span
                className="text-[11px] font-semibold"
                style={{
                  ...MONO,
                  color:
                    session.problem1Results.passed === session.problem1Results.total
                      ? 'var(--ll-success-ink)'
                      : 'var(--ll-danger-ink)',
                }}
              >
                {session.problem1Results.passed} / {session.problem1Results.total} passed
              </span>
            )}
          </div>
          <pre
            className="text-[12px] leading-relaxed overflow-x-auto rounded-lg p-3"
            style={{
              ...MONO,
              background: 'var(--ll-bg-panel)',
              color: 'var(--ll-ink)',
              border: '1px solid var(--ll-border)',
            }}
          >
            {session.problem1Code}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link
          href={`/interview/voice?difficulty=${session.difficulty}&duration=30&auto=1`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-900"
          style={{
            ...SG,
            background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
            border: '1px solid rgba(147,197,253,0.55)',
            boxShadow: '0 10px 24px -12px rgba(59,130,246,0.6)',
          }}
        >
          Do another voice mock
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function ScoreGrid({ scores }: { scores: VoiceScorecard['scores'] }) {
  const axes: Array<{ key: keyof VoiceScorecard['scores']; label: string }> = [
    { key: 'correctness', label: 'Correctness' },
    { key: 'communication', label: 'Communication' },
    { key: 'complexity', label: 'Complexity' },
    { key: 'problemSolving', label: 'Problem solving' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {axes.map(a => {
        const v = scores[a.key];
        const color =
          v >= 8 ? 'var(--ll-success-ink)' : v >= 5 ? 'var(--ll-ink)' : 'var(--ll-danger-ink)';
        return (
          <div
            key={a.key}
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--ll-bg-elevated)', border: '1px solid var(--ll-border)' }}
          >
            <p
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ ...SG, color: 'var(--ll-ink-muted)' }}
            >
              {a.label}
            </p>
            <p
              className="text-[22px] font-bold mt-1 tabular-nums"
              style={{ ...SG, color }}
            >
              {v}
              <span
                className="text-[12px] font-normal"
                style={{ ...SG, color: 'var(--ll-ink-muted)' }}
              >
                {' '}/ 10
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
