'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { InterviewSession, InterviewReadiness } from '@/lib/interview';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };
const BORDER = 'rgba(15,23,42,0.08)';

function scoreColor(score: number): string {
  if (score >= 8) return 'rgba(52,211,153,0.9)';
  if (score >= 5) return 'rgba(251,191,36,0.9)';
  return 'rgba(248,113,113,0.9)';
}

const READINESS_STYLE: Record<InterviewReadiness, { color: string; bg: string; label: string }> = {
  interview_ready: { color: '#047857', bg: 'rgba(52,211,153,0.08)', label: 'Interview Ready' },
  almost_ready:    { color: '#b45309', bg: 'rgba(251,191,36,0.08)', label: 'Almost Ready' },
  needs_practice:  { color: 'rgba(251,146,60,0.9)', bg: 'rgba(251,146,60,0.08)', label: 'Needs Practice' },
  not_ready:       { color: '#b91c1c', bg: 'rgba(248,113,113,0.08)', label: 'Not Ready' },
};

const CORRECTNESS_LABEL: Record<string, { color: string; text: string }> = {
  fully_correct:    { color: '#047857', text: 'Correct' },
  partially_correct:{ color: '#b45309', text: 'Partial' },
  incorrect:        { color: '#b91c1c', text: 'Incorrect' },
  no_attempt:       { color: 'rgba(113,113,122,0.7)', text: 'No Attempt' },
};

interface ReviewScreenProps {
  session: InterviewSession;
  onBack: () => void;
  onNewInterview: () => void;
}

export default function ReviewScreen({
  session, onBack, onNewInterview,
}: ReviewScreenProps) {
  const [expandedCode, setExpandedCode] = useState<number | null>(null);
  const feedback = session.feedback;

  if (!feedback) {
    const hasCode = Boolean(session.problem1Code?.trim() || session.problem2Code?.trim());
    const { headline, detail } = !hasCode
      ? {
          headline: 'No code to review.',
          detail: 'This session ended without any code written for either problem, so there\u2019s nothing to give feedback on. Start a new interview and take a crack at it.',
        }
      : session.status === 'abandoned'
      ? {
          headline: 'Session was abandoned.',
          detail: 'This interview was ended early before feedback could be generated. You can still view your code from history, or start a fresh interview.',
        }
      : session.status === 'in_progress'
      ? {
          headline: 'Interview still in progress.',
          detail: 'Feedback is generated once the session is submitted. Resume it from your history to finish up.',
        }
      : {
          headline: 'Feedback generation failed.',
          detail: 'Something went wrong while grading this session. Head back to your history \u2014 you can retry generation from the card.',
        };

    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <p className="text-[15px] text-[var(--ll-ink)]" style={SG}>
            {headline}
          </p>
          <p className="text-[12px] text-[var(--ll-ink-muted)] leading-relaxed">
            {detail}
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--ll-ink)] transition-colors hover:text-slate-900 dark:hover:text-white"
            style={{ border: `1px solid ${BORDER}`, ...SG }}
          >
            <ArrowLeft size={13} />
            Back to history
          </button>
        </div>
      </div>
    );
  }

  const readiness = READINESS_STYLE[feedback.interviewReadiness];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
          style={SG}
        >
          <ArrowLeft size={13} />
          Back to history
        </button>

        {/* Score header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-[0.12em]"
              style={{
                ...SG,
                color: 'var(--ll-ink-muted)',
                background: 'var(--ll-bg-subtle)',
                border: '1px solid var(--ll-border)',
              }}
            >
              Silent debrief
            </span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase tracking-wider" style={SG}>Overall Score</p>
          <p
            className="text-[56px] font-bold tabular-nums leading-none"
            style={{ ...MONO, color: scoreColor(feedback.overallScore) }}
          >
            {feedback.overallScore}
            <span className="text-[20px] text-slate-600">/10</span>
          </p>
          <span
            className="inline-block px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{ color: readiness.color, background: readiness.bg, ...SG }}
          >
            {readiness.label}
          </span>
        </div>

        {/* Time management */}
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: 'rgba(15,23,42,0.04)', border: `1px solid ${BORDER}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] text-slate-500 uppercase tracking-wider" style={SG}>Time Management</p>
            <span className="text-[14px] font-bold tabular-nums" style={{ ...MONO, color: scoreColor(feedback.timeManagement.score) }}>
              {feedback.timeManagement.score}/10
            </span>
          </div>
          <p className="text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">{feedback.timeManagement.commentary}</p>
        </div>

        {/* Overall strengths & improvements */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl px-5 py-4" style={{ background: 'rgba(52,211,153,0.03)', border: '1px solid rgba(52,211,153,0.1)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#047857', ...SG }}>
              Strengths
            </p>
            <ul className="space-y-2">
              {feedback.overallStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--ll-ink)] leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(52,211,153,0.6)' }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl px-5 py-4" style={{ background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.1)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#b45309', ...SG }}>
              To Improve
            </p>
            <ul className="space-y-2">
              {feedback.overallImprovements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--ll-ink)] leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(251,191,36,0.6)' }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-problem feedback */}
        {feedback.problems.map((pf, idx) => {
          const slug = idx === 0 ? session.problem1Slug : session.problem2Slug;
          const code = idx === 0 ? session.problem1Code : session.problem2Code;
          const correctness = CORRECTNESS_LABEL[pf.correctness] ?? CORRECTNESS_LABEL.no_attempt;
          const isExpanded = expandedCode === idx;

          return (
            <div
              key={idx}
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(15,23,42,0.04)', border: `1px solid ${BORDER}` }}
            >
              <div className="px-5 py-4 space-y-4">
                {/* Problem header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-600 uppercase tracking-wider" style={SG}>
                      Problem {idx + 1}
                    </span>
                    <span className="text-[14px] font-medium text-[var(--ll-ink)]" style={SG}>
                      {(slug ?? '').replace(/-/g, ' ')}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded"
                    style={{ color: correctness.color, background: `${correctness.color}12` }}
                  >
                    {correctness.text}
                  </span>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1" style={SG}>Approach</p>
                    <p className="text-[16px] font-bold tabular-nums" style={{ ...MONO, color: scoreColor(pf.approachScore) }}>
                      {pf.approachScore}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1" style={SG}>Code Quality</p>
                    <p className="text-[16px] font-bold tabular-nums" style={{ ...MONO, color: scoreColor(pf.codeQualityScore) }}>
                      {pf.codeQualityScore}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1" style={SG}>Pattern</p>
                    <p className="text-[13px] font-medium" style={{ color: pf.patternIdentified ? 'rgba(52,211,153,0.8)' : 'rgba(248,113,113,0.8)' }}>
                      {pf.patternIdentified ? 'Identified' : 'Missed'}
                    </p>
                  </div>
                </div>

                {/* Optimal approach */}
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1" style={SG}>Optimal Approach</p>
                  <p className="text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">{pf.optimalApproach}</p>
                </div>

                {/* Strengths & improvements */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5" style={SG}>Strengths</p>
                    {pf.strengths.map((s, i) => (
                      <p key={i} className="text-[12px] text-[var(--ll-ink-muted)] leading-relaxed">• {s}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5" style={SG}>Improve</p>
                    {pf.improvements.map((s, i) => (
                      <p key={i} className="text-[12px] text-[var(--ll-ink-muted)] leading-relaxed">• {s}</p>
                    ))}
                  </div>
                </div>

                {/* View code / solution links */}
                <div className="flex items-center gap-3 pt-1">
                  {code && (
                    <button
                      onClick={() => setExpandedCode(isExpanded ? null : idx)}
                      className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
                      style={SG}
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {isExpanded ? 'Hide code' : 'View your code'}
                    </button>
                  )}
                  <a
                    href={`/solve/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[12px] text-blue-700 dark:text-blue-400/70 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
                    style={SG}
                  >
                    View solution
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              {/* Expanded code */}
              {isExpanded && code && (
                <div style={{ borderTop: `1px solid ${BORDER}` }}>
                  <pre
                    className="px-5 py-4 text-[12px] text-[var(--ll-ink)] overflow-x-auto leading-relaxed"
                    style={{ ...MONO, background: 'var(--ll-bg-code)' }}
                  >
                    {code}
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {/* Tip */}
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <p className="text-[11px] text-blue-700 dark:text-blue-400/60 uppercase tracking-wider mb-2" style={SG}>Tip for next time</p>
          <p className="text-[14px] text-[var(--ll-ink)] leading-relaxed" style={SG}>{feedback.tip}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pb-8">
          <button
            onClick={onBack}
            className="px-5 py-2 rounded-lg text-[13px] font-medium text-[var(--ll-ink-muted)] transition-colors hover:text-[var(--ll-ink)]"
            style={{ border: `1px solid ${BORDER}`, ...SG }}
          >
            Back to History
          </button>
          <button
            onClick={onNewInterview}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold text-slate-900 transition-all hover:brightness-110 active:brightness-95"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(15,23,42,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 10px 24px -10px rgba(59,130,246,0.7), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            New Interview
          </button>
        </div>
      </div>
    </div>
  );
}
