'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, GitBranch, X, Plus } from 'lucide-react';

const CODE = `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            return [seen[comp], i]
        seen[num] = i`;

type Phase = 'typing' | 'idle' | 'submitting' | 'accepted';

/* Syntax-highlighted line renderer. Colors loosely mirror the
   "GitHub Dark" Python palette so the editor reads as a real IDE. */
const PY_KEYWORDS = new Set(['def', 'return', 'for', 'in', 'if', 'else', 'elif', 'while', 'import', 'from', 'class', 'is', 'not', 'and', 'or', 'lambda', 'with', 'as']);
const PY_BUILTINS = new Set(['enumerate', 'len', 'range', 'print', 'list', 'dict', 'set', 'tuple', 'int', 'str', 'sum', 'min', 'max', 'sorted', 'map', 'filter']);

const C = {
  text: '#cbd5e1',
  keyword: '#c084fc',
  builtin: '#7dd3fc',
  fn: '#93c5fd',
  param: '#e2e8f0',
  string: '#86efac',
  number: '#fb923c',
  comment: '#475569',
  punctuation: '#94a3b8',
};

function HighlightedLine({ text }: { text: string }) {
  // Tokenize: comments, strings, numbers, identifiers, punctuation, whitespace, other
  const pattern = /(#[^\n]*)|('(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|(\s+)|([(){}\[\],:.])|(\S)/g;
  const parts: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    const [, comment, string, number, ident, ws, punct, other] = match;
    if (comment) {
      parts.push(<span key={key++} style={{ color: C.comment }}>{comment}</span>);
    } else if (string) {
      parts.push(<span key={key++} style={{ color: C.string }}>{string}</span>);
    } else if (number) {
      parts.push(<span key={key++} style={{ color: C.number }}>{number}</span>);
    } else if (ident) {
      const next = text[match.index + ident.length];
      if (PY_KEYWORDS.has(ident)) {
        parts.push(<span key={key++} style={{ color: C.keyword }}>{ident}</span>);
      } else if (PY_BUILTINS.has(ident)) {
        parts.push(<span key={key++} style={{ color: C.builtin }}>{ident}</span>);
      } else if (next === '(') {
        parts.push(<span key={key++} style={{ color: C.fn }}>{ident}</span>);
      } else {
        parts.push(<span key={key++} style={{ color: C.text }}>{ident}</span>);
      }
    } else if (ws) {
      parts.push(<span key={key++}>{ws}</span>);
    } else if (punct) {
      parts.push(<span key={key++} style={{ color: C.punctuation }}>{punct}</span>);
    } else if (other) {
      parts.push(<span key={key++}>{other}</span>);
    }
  }
  return <>{parts}</>;
}

export default function ProductDemo() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [charIndex, setCharIndex] = useState(0);
  const [hintsVisible, setHintsVisible] = useState(0);
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const typed = CODE.slice(0, charIndex);
  const lines = typed.split('\n');

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (charIndex >= CODE.length) {
        t = setTimeout(() => setPhase('idle'), 700);
      } else {
        t = setTimeout(() => setCharIndex((c) => c + 1), 26);
      }
    } else if (phase === 'idle') {
      t = setTimeout(() => setPhase('submitting'), 900);
    } else if (phase === 'submitting') {
      t = setTimeout(() => setPhase('accepted'), 1300);
    } else if (phase === 'accepted') {
      const h1 = setTimeout(() => setHintsVisible(1), 350);
      const h2 = setTimeout(() => setHintsVisible(2), 750);
      const h3 = setTimeout(() => setHintsVisible(3), 1150);
      const loop = setTimeout(() => {
        setPhase('typing');
        setCharIndex(0);
        setHintsVisible(0);
      }, 8000);
      return () => [h1, h2, h3, loop].forEach(clearTimeout);
    }

    return () => clearTimeout(t);
  }, [phase, charIndex]);

  const hintProgress = `${Math.min(hintsVisible, 3)} / 3`;

  return (
    <section className="relative flex flex-col items-center px-6 sm:px-10 pt-2 sm:pt-4 pb-0">
      {/* Soft halo behind the mockup so it lifts off the page */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: '10%',
          width: 'min(1100px, 95%)',
          height: '420px',
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(59,130,246,0.18), transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Mockup — peeks through the bottom of the section */}
      <div
        ref={wrapperRef}
        className="relative w-full max-w-6xl rounded-t-xl overflow-hidden border border-b-0 border-[var(--ll-border)]"
        style={{
          background: '#0a0e1a',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow:
            '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 -10px 80px rgba(59,130,246,0.10), 0 30px 80px -30px rgba(15,23,42,0.45)',
        }}
      >
        {/* Top chrome — traffic lights + URL */}
        <div
          className="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.05]"
          style={{ background: '#080c16' }}
        >
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: '#1e2736' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#1e2736' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#1e2736' }} />
          </div>
          <div className="flex-1 flex justify-center">
            <span
              className="text-[12px] font-mono px-4 py-0.5 rounded-md flex items-center gap-2"
              style={{ background: '#0d1117', color: '#5a6478' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
              leetlockin.com/tutor/two-sum
            </span>
          </div>
          <div
            className="text-[10px] font-mono flex items-center gap-1.5"
            style={{ color: '#475569' }}
          >
            <GitBranch className="w-3 h-3" />
            main
          </div>
        </div>

        {/* File tab bar — IDE-style */}
        <div
          className="flex items-stretch border-b border-white/[0.05] text-[12px] font-mono"
          style={{ background: '#0a0e1a' }}
        >
          <div
            className="flex items-center gap-2.5 px-4 py-2 border-r border-white/[0.05]"
            style={{ background: '#0d1218', color: '#cbd5e1' }}
          >
            <span style={{ color: '#7dd3fc' }}>●</span>
            two_sum.py
            <X className="w-3 h-3 opacity-40 ml-1" />
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 border-r border-white/[0.05]" style={{ color: '#475569' }}>
            tests.py
            <X className="w-3 h-3 opacity-30" />
          </div>
          <div className="flex items-center px-3" style={{ color: '#475569' }}>
            <Plus className="w-3 h-3" />
          </div>
          <div className="ml-auto flex items-center pr-4 gap-3 text-[10px]" style={{ color: '#475569' }}>
            <span>UTF-8</span>
            <span>Python 3.12</span>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]" style={{ minHeight: 540 }}>
          {/* Left — problem + editor */}
          <div className="flex flex-col border-r border-white/[0.05]">
            {/* Problem header */}
            <div className="px-7 py-5 border-b border-white/[0.04]">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-[0.1em]"
                  style={{
                    background: 'rgba(59,130,246,0.10)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59,130,246,0.25)',
                  }}
                >
                  Easy
                </span>
                <span className="text-[13px] font-semibold tracking-tight" style={{ color: '#e2e8f0' }}>
                  1. Two Sum
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-mono"
                  style={{
                    background: 'rgba(168,85,247,0.10)',
                    color: '#c084fc',
                    border: '1px solid rgba(168,85,247,0.20)',
                  }}
                >
                  pattern: hash-map
                </span>
              </div>
              <p className="text-[12px] leading-relaxed max-w-lg" style={{ color: '#64748b' }}>
                Given an array of integers <code className="font-mono" style={{ color: '#94a3b8' }}>nums</code> and
                an integer <code className="font-mono" style={{ color: '#94a3b8' }}>target</code>, return indices of
                the two numbers that add up to target.
              </p>
            </div>

            {/* Code editor */}
            <div className="flex-1 px-2 py-6 font-mono text-[13.5px] leading-[1.85]">
              {lines.map((line, i) => {
                const isCurrent = i === lines.length - 1;
                return (
                  <div key={i} className="flex hover:bg-white/[0.015]">
                    <span
                      className="w-10 shrink-0 text-right pr-4 select-none text-[11.5px] leading-[1.85]"
                      style={{ color: isCurrent && phase === 'typing' ? '#64748b' : '#2a3548' }}
                    >
                      {i + 1}
                    </span>
                    <span className="whitespace-pre">
                      <HighlightedLine text={line} />
                      {isCurrent && phase === 'typing' && (
                        <span
                          className="animate-cursor-blink inline-block w-[2px] h-[14px] ml-[1px] align-middle"
                          style={{ background: '#60a5fa' }}
                        />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Submit bar */}
            <div className="px-7 py-3 border-t border-white/[0.04] flex items-center justify-between" style={{ background: '#080c16' }}>
              <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: '#475569' }}>
                <span className="flex items-center gap-1">
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px]"
                    style={{ background: '#0d1218', border: '1px solid #1e2736', color: '#94a3b8' }}
                  >⌘
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px]"
                    style={{ background: '#0d1218', border: '1px solid #1e2736', color: '#94a3b8' }}
                  >↵
                  </span>
                  to run
                </span>
                <span>·</span>
                <span>Ln {lines.length}, Col {(lines[lines.length - 1] ?? '').length + 1}</span>
              </div>
              <button
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[12px] font-semibold border transition-all duration-300 ${
                  phase === 'accepted'
                    ? 'border-green-500/30'
                    : phase === 'submitting'
                    ? 'border-blue-500/30'
                    : phase === 'idle'
                    ? 'border-blue-500/40'
                    : 'border-white/[0.06]'
                }`}
                style={{
                  background:
                    phase === 'accepted'
                      ? 'rgba(34,197,94,0.10)'
                      : phase === 'submitting'
                      ? 'rgba(59,130,246,0.10)'
                      : phase === 'idle'
                      ? '#3b82f6'
                      : 'transparent',
                  color:
                    phase === 'accepted'
                      ? '#4ade80'
                      : phase === 'submitting'
                      ? '#60a5fa'
                      : phase === 'idle'
                      ? '#ffffff'
                      : '#64748b',
                }}
              >
                {phase === 'accepted' && <Check className="w-3 h-3" />}
                {phase === 'submitting' && (
                  <span className="block w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                )}
                {phase === 'accepted' ? 'Accepted' : phase === 'submitting' ? 'Running…' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Right — tutor thread */}
          <div className="flex flex-col px-5 py-5 gap-0" style={{ background: '#080c16' }}>
            {/* Compact header — no icon, just text */}
            <div className="flex items-baseline justify-between pb-4 mb-1 border-b border-white/[0.04]">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[10px] font-mono tracking-[0.22em] uppercase"
                  style={{ color: '#94a3b8' }}
                >
                  Tutor
                </span>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: '#334155' }}
                >
                  /
                </span>
                <span
                  className="text-[10px] font-mono tabular-nums"
                  style={{ color: '#475569' }}
                >
                  {hintProgress}
                </span>
              </div>
              <span
                className="text-[10px] font-mono flex items-center gap-1.5"
                style={{ color: phase === 'submitting' ? '#60a5fa' : '#22c55e' }}
              >
                <span
                  className={`block w-1.5 h-1.5 rounded-full ${phase === 'submitting' ? 'animate-pulse' : ''}`}
                  style={{ background: phase === 'submitting' ? '#60a5fa' : '#22c55e' }}
                />
                {phase === 'submitting' ? 'analyzing' : phase === 'accepted' ? 'idle' : 'ready'}
              </span>
            </div>

            {/* Thread — vertical rail on left, messages stacked */}
            <div className="relative pl-6 flex flex-col gap-5">
              {/* Vertical connector rail */}
              <div
                className="absolute top-2 bottom-12 left-[5px] w-px"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))' }}
              />

              <ThreadMessage
                index="01"
                label="Pattern"
                title="Hash map"
                body="Store each complement as a key. One pass — look up before you insert."
                visible={hintsVisible >= 1}
                accentColor="#fbbf24"
              />

              <ThreadMessage
                index="02"
                label="Complexity"
                title="O(n) time · O(n) space"
                body="Optimal. Single pass through the array, constant-time lookups."
                visible={hintsVisible >= 2}
                accentColor="#60a5fa"
              />

              {/* Verdict — final message, special treatment */}
              <div
                className="relative"
                style={{
                  opacity: hintsVisible >= 3 ? 1 : 0,
                  transform: hintsVisible >= 3 ? 'translateY(0)' : 'translateY(14px)',
                  transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {/* Filled-in node on the rail */}
                <div
                  className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full"
                  style={{
                    background: '#22c55e',
                    boxShadow: '0 0 0 3px rgba(34,197,94,0.15), 0 0 16px rgba(34,197,94,0.4)',
                  }}
                />
                <div className="flex items-baseline justify-between mb-2">
                  <span
                    className="text-[10px] font-mono tracking-[0.22em] uppercase"
                    style={{ color: '#22c55e' }}
                  >
                    Verdict
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: '#22c55e' }}>
                    +1 streak
                  </span>
                </div>
                <p
                  className="text-[15px] font-semibold mb-3"
                  style={{ color: '#86efac' }}
                >
                  Accepted
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono tabular-nums" style={{ color: '#64748b' }}>
                  <span>52<span style={{ color: '#334155' }}>ms</span></span>
                  <span style={{ color: '#1e2736' }}>·</span>
                  <span>14.2<span style={{ color: '#334155' }}>MB</span></span>
                  <span style={{ color: '#1e2736' }}>·</span>
                  <span>
                    beats <span style={{ color: '#86efac' }}>98.4%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer tagline */}
            <div className="mt-auto pt-5">
              <p className="text-[11px] leading-relaxed italic" style={{ color: '#475569' }}>
                You arrived at the answer yourself.<br />
                That&apos;s what makes it stick.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreadMessage({
  index,
  label,
  title,
  body,
  visible,
  accentColor,
}: {
  index: string;
  label: string;
  title: string;
  body: string;
  visible: boolean;
  accentColor: string;
}) {
  return (
    <div
      className="relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Node on the rail */}
      <div
        className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full"
        style={{
          background: '#080c16',
          border: `1.5px solid ${accentColor}`,
        }}
      />
      <div className="flex items-baseline justify-between mb-1">
        <span
          className="text-[10px] font-mono tracking-[0.22em] uppercase"
          style={{ color: accentColor }}
        >
          {label}
        </span>
        <span
          className="text-[10px] font-mono tabular-nums"
          style={{ color: '#334155' }}
        >
          {index}
        </span>
      </div>
      <p
        className="text-[14px] font-semibold mb-1"
        style={{ color: '#e2e8f0' }}
      >
        {title}
      </p>
      <p
        className="text-[11.5px] leading-[1.55]"
        style={{ color: '#64748b' }}
      >
        {body}
      </p>
    </div>
  );
}
