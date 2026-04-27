'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronLeft, ChevronRight, RotateCcw, ChevronUp,
  Plus, X, Play, Send,
  FileText, Maximize2, Minimize2,
} from 'lucide-react';
import type { OnMount, BeforeMount, Monaco } from '@monaco-editor/react';
import type { SolveResponse } from '@/lib/types';
import type { ProblemContent, ProblemTest } from '@/lib/problem-types';
import { runTests, ensureWorker } from '@/lib/pyodide-runner';
import UpgradePrompt from '@/components/UpgradePrompt';
import ThemeToggle from '@/components/ThemeToggle';

// Observe the body's `theme-dark` / `theme-light` class so components that
// can't rely on CSS vars (e.g. Monaco, whose colors must be literal hex)
// still re-render when the user flips the theme.
function useAppTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const read = () =>
      setTheme(document.body.classList.contains('theme-dark') ? 'dark' : 'light');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

// ─── Monaco (browser-only) ────────────────────────────────────────────────────

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--ll-bg-elevated)' }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'rgba(59,130,246,0.35)', animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    ),
  }
);

// ─── Design tokens (matches dashboard palette) ────────────────────────────────

const BG_BASE    = 'var(--ll-bg)';             // app canvas
const BG_CHROME  = 'var(--ll-bg-subtle)';       // chrome bars (nav, footer, test-case bar) — one step darker
const BG_PANEL   = 'var(--ll-bg-panel)';        // problem (left) panel — content surface
const BG_EDITOR  = 'var(--ll-bg-code)';         // editor (right) panel — blue-tinted "workspace"
const BORDER     = 'var(--ll-border)';
const BORDER_MED = 'var(--ll-border-strong)';

// ─── Constants ────────────────────────────────────────────────────────────────

const SG: React.CSSProperties   = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const LANGUAGES = [
  { id: 'python', label: 'Python', monacoId: 'python' },
] as const;
type LangId = (typeof LANGUAGES)[number]['id'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface TestCase {
  id: string;
  label: string;
  inputJson: string;
  expectedJson: string;
  custom: boolean;
}

interface TestResult {
  caseId: string;
  passed: boolean;
  actual: string;
  error?: string;
  errorLine?: number;
  stdout?: string;
}

type PanelTab = 'cases' | 'console' | 'errors';

type HiddenFailState = {
  label: string;
  inputJson: string;
  expectedJson: string;
  actual: string;
  error?: string;
  errorLine?: number;
};

type AcceptedToastState = {
  runtimeMs: number;
  passedCount: number;
  totalCount: number;
  isFirst: boolean;
};

type RunStatus = 'idle' | 'running' | 'accepted' | 'wrong' | 'runtime_error';

function deriveStatus(running: boolean, results: TestResult[], hiddenFailed: boolean): RunStatus {
  if (running) return 'running';
  if (hiddenFailed) return 'wrong';
  if (results.length === 0) return 'idle';
  if (results.some(r => r.error)) return 'runtime_error';
  if (results.every(r => r.passed)) return 'accepted';
  return 'wrong';
}

const STATUS_STYLE: Record<RunStatus, { label: string; color: string; bg: string; border: string }> = {
  idle:          { label: 'Ready',         color: 'rgba(148,163,184,0.8)', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.18)' },
  running:       { label: 'Running…',      color: 'var(--ll-warning-ink)',  bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.2)' },
  accepted:      { label: 'Accepted',      color: 'var(--ll-success-ink)',  bg: 'rgba(16,185,129,0.07)',  border: 'rgba(52,211,153,0.22)' },
  wrong:         { label: 'Wrong Answer',  color: 'rgba(251,146,60,0.95)', bg: 'rgba(249,115,22,0.07)',  border: 'rgba(251,146,60,0.22)' },
  runtime_error: { label: 'Runtime Error', color: 'var(--ll-danger-ink)', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(248,113,113,0.22)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Matched to dashboard's emerald completion / amber medium / red hard palette
const DIFF_STYLE: Record<string, React.CSSProperties> = {
  Easy:   { color: 'var(--ll-success-ink)',  border: '1px solid rgba(52,211,153,0.2)',   background: 'rgba(16,185,129,0.07)'  },
  Medium: { color: 'var(--ll-warning-ink)',  border: '1px solid rgba(251,191,36,0.2)',   background: 'rgba(245,158,11,0.07)'  },
  Hard:   { color: 'var(--ll-danger-ink)', border: '1px solid rgba(248,113,113,0.2)',  background: 'rgba(239,68,68,0.07)'   },
};

const DIFF_LABEL_COLOR: Record<string, string> = {
  Easy:   'rgba(52,211,153,0.7)',
  Medium: 'rgba(251,191,36,0.7)',
  Hard:   'rgba(248,113,113,0.7)',
};

let _customCounter = 0;
function newCustomId() { return `custom-${++_customCounter}`; }

function testsFromProblem(problem: ProblemContent): TestCase[] {
  return problem.defaultTests.map((t, i) => ({
    id: `default-${i + 1}`,
    label: t.label || `Case ${i + 1}`,
    inputJson: t.inputJson,
    expectedJson: t.expectedJson,
    custom: false,
  }));
}

// ─── Top Nav (glass — matches DashboardNav) ───────────────────────────────────

function TopNav({ problem, solved }: { problem: ProblemContent; solved: boolean }) {
  const searchParams = useSearchParams();
  const backHref = searchParams.get('from') === 'dashboard' ? '/dashboard' : '/library';
  const backLabel = searchParams.get('from') === 'dashboard' ? 'Dashboard' : 'Library';
  return (
    <header
      className="flex items-center gap-3 px-5 shrink-0"
      style={{
        height: 48,
        background: BG_CHROME,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-1.5 font-semibold text-[15px] tracking-tight text-slate-900 mr-0" style={SG}>
        <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
        LeetLockin
      </Link>

      <div className="w-px h-4 mx-1" style={{ background: BORDER_MED }} />

      {/* Back */}
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
        style={SG}
      >
        <ChevronLeft size={13} />
        {backLabel}
      </Link>

      <div className="w-px h-4 mx-1" style={{ background: BORDER }} />

      {/* Problem breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-slate-800" style={SG}>
          {problem.title}
        </span>
        <span
          className="ml-0.5 text-[11px] font-medium"
          style={{ color: DIFF_LABEL_COLOR[problem.difficulty] ?? '#9ca3af' }}
        >
          {problem.difficulty}
        </span>
        {solved && (
          <span
            className="ml-1 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold tracking-wide"
            style={{
              color: 'var(--ll-success-ink)',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              ...SG,
            }}
            title="You've solved this problem"
          >
            <span style={{ fontSize: 10 }}>✓</span> Solved
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-1">
        <button
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-600 transition-colors"
          title="Previous problem"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-600 transition-colors"
          title="Next problem"
        >
          <ChevronRight size={14} />
        </button>
        <div className="w-px h-4 mx-1" style={{ background: BORDER }} />
        <ThemeToggle />
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold text-slate-700 shrink-0"
          style={{ background: 'var(--ll-bg-hover)', border: `1px solid ${BORDER_MED}` }}
        >
          T
        </div>
      </div>
    </header>
  );
}

// ─── Markdown renderer (tuned to dark palette) ────────────────────────────────

const MARKDOWN_COMPONENTS = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-[13.5px] leading-[1.75] mb-3 last:mb-0" style={{ color: 'var(--ll-ink)' }} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold" style={{ color: 'var(--ll-ink-strong)' }} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="not-italic" style={{ color: 'var(--ll-ink)' }} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="px-1.5 py-0.5 rounded text-[12.5px]"
      style={{ background: 'var(--ll-bg-subtle)', color: 'var(--ll-ink-strong)', ...MONO }}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc list-outside pl-5 mb-3 space-y-1 text-[13.5px] leading-[1.65]" style={{ color: 'var(--ll-ink)' }} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-outside pl-5 mb-3 space-y-1 text-[13.5px] leading-[1.65]" style={{ color: 'var(--ll-ink)' }} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--ll-ink)' }} />
  ),
};

// ─── Problem Panel ────────────────────────────────────────────────────────────

function QuestionTab({ problem }: { problem: ProblemContent }) {
  return (
    <div
      className="px-6 py-5 space-y-5 overflow-y-auto flex-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}
    >
      {/* Title + badges */}
      <div>
        <h1 className="text-[19px] font-semibold text-slate-900 mb-3" style={{ ...SG, letterSpacing: '-0.02em' }}>
          {problem.title}{' '}
          <span className="text-slate-600 font-normal text-[14px]">(LC #{problem.lcNumber})</span>
        </h1>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[11.5px] font-medium" style={DIFF_STYLE[problem.difficulty]}>
            {problem.difficulty}
          </span>
          {problem.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[11.5px] font-medium"
              style={{ color: 'var(--ll-ink-subtle)', border: `1px solid ${BORDER}`, background: 'transparent' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Description (markdown) */}
      <div>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {problem.descriptionMd}
        </ReactMarkdown>
      </div>

      {/* Examples */}
      <div className="space-y-4">
        {problem.examples.map((ex, i) => (
          <div key={i}>
            <p className="text-[12px] font-semibold text-slate-600 mb-2 uppercase tracking-[0.08em]" style={SG}>
              Example {i + 1}
            </p>
            <div
              className="rounded-lg px-4 py-3 space-y-1.5"
              style={{
                background: 'var(--ll-bg-subtle)',
                border: `1px solid ${BORDER}`,
                backdropFilter: 'blur(4px)',
              }}
            >
              <p className="text-[12.5px]" style={MONO}>
                <span style={{ color: 'var(--ll-accent-ink)' }}>Input: </span>
                <span style={{ color: 'var(--ll-ink)' }}>{ex.input}</span>
              </p>
              <p className="text-[12.5px]" style={MONO}>
                <span style={{ color: 'var(--ll-accent-ink)' }}>Output: </span>
                <span style={{ color: 'var(--ll-ink)' }}>{ex.output}</span>
              </p>
              {ex.explanation && (
                <p className="text-[11.5px] text-slate-600 pt-0.5">{ex.explanation}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div>
        <p className="text-[10px] font-semibold text-slate-600 tracking-[0.12em] uppercase mb-2.5" style={SG}>
          Constraints
        </p>
        <ul className="space-y-1.5">
          {problem.constraints.map(c => (
            <li key={c} className="flex items-start gap-2.5 text-[12.5px] text-slate-500" style={MONO}>
              <span className="mt-[7px] w-[3px] h-[3px] rounded-full shrink-0" style={{ background: 'rgba(15,23,42,0.12)' }} />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HintsTab({ code, problem }: { code: string; problem: ProblemContent }) {
  const [response, setResponse]     = useState<SolveResponse | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<{ used: number; limit: number } | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSteps, setShowSteps]   = useState(false);
  const [showCode, setShowCode]     = useState(false);

  async function getHints() {
    setLoading(true);
    setError(null);
    setRateLimited(null);
    setResponse(null);
    setHintsShown(1);
    setShowSteps(false);
    setShowCode(false);
    try {
      const exampleText = problem.examples
        .map((ex, i) => `Example ${i + 1}: Input: ${ex.input} → Output: ${ex.output}`)
        .join('\n');
      const problemDescription = `${problem.title}\n\n${problem.descriptionMd}\n\n${exampleText}`;
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problemDescription, attempt: code.trim() }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateLimited({ used: data.used ?? 3, limit: data.limit ?? 3 });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 py-5 overflow-y-auto flex-1 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}>
      {!response && !loading && (
        <div className="flex flex-col items-center justify-center py-14 text-center space-y-5">
          <div>
            <p className="text-[14px] font-semibold text-slate-200 mb-1 tracking-tight" style={SG}>Stuck? Get a nudge.</p>
            <p className="text-[12px] text-slate-500 max-w-[260px] leading-relaxed">
              {code.trim()
                ? 'Hints will be based on the code you have right now — the more you write, the better the hints.'
                : 'Write some code first and hints will be tailored to your approach. Or generate hints from scratch to get started.'}
            </p>
          </div>
          <button
            onClick={getHints}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-900 transition-all hover:brightness-110 active:brightness-95"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(15,23,42,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 12px 32px -12px rgba(59,130,246,0.75), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            {code.trim() ? 'Analyze my code' : 'Get hints'}
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-600 text-center animate-pulse" style={SG}>
            {code.trim() ? 'Reading your code…' : 'Generating hints…'}
          </p>
          {[1,2,3].map(i => (
            <div key={i} className="rounded-lg px-4 py-3 space-y-2" style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}` }}>
              <div className="h-2 w-14 rounded-full animate-pulse" style={{ background: 'var(--ll-bg-tinted)' }} />
              <div className="h-2.5 w-full rounded-full animate-pulse" style={{ background: 'var(--ll-bg-hover)' }} />
              <div className="h-2.5 w-4/5 rounded-full animate-pulse" style={{ background: 'var(--ll-bg-hover)' }} />
            </div>
          ))}
        </div>
      )}

      {rateLimited && (
        <UpgradePrompt used={rateLimited.used} limit={rateLimited.limit} />
      )}

      {error && (
        <div className="rounded-lg px-4 py-3 text-[13px] text-red-400" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
          {error}
        </div>
      )}

      {response && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-600">Pattern</span>
            <span
              className="px-2 py-0.5 rounded text-[11px] font-medium"
              style={{ color: 'rgba(147,197,253,0.85)', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
            >
              {response.pattern}
            </span>
          </div>

          {response.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}` }}>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em] mb-1.5">
                Hint {i + 1}{i === 0 ? ' — Think broadly' : i === 1 ? ' — More specific' : ' — Key insight'}
              </p>
              <p className="text-[13px] text-slate-400 leading-relaxed">{hint}</p>
            </div>
          ))}

          {hintsShown < response.hints.length && (
            <button
              onClick={() => setHintsShown(h => h + 1)}
              className="w-full py-2 rounded-lg text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
              style={{ border: `1px solid ${BORDER}`, background: 'var(--ll-bg-subtle)' }}
            >
              Next hint ({hintsShown}/{response.hints.length})
            </button>
          )}

          {hintsShown >= response.hints.length && (
            <>
              <button
                onClick={() => setShowSteps(s => !s)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-[12px] font-medium text-slate-400 hover:text-slate-800 transition-colors"
                style={{ border: `1px solid ${BORDER}`, background: 'var(--ll-bg-subtle)' }}
              >
                <span>Step-by-step approach</span>
                <ChevronUp size={13} className={showSteps ? '' : 'rotate-180'} />
              </button>
              {showSteps && (
                <ol className="space-y-2 list-none">
                  {response.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] text-slate-400">
                      <span className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5" style={{ background: 'var(--ll-bg-hover)', color: 'var(--ll-ink-muted)' }}>
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}

              <button
                onClick={() => setShowCode(s => !s)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-[12px] font-medium text-slate-400 hover:text-slate-800 transition-colors"
                style={{ border: `1px solid ${BORDER}`, background: 'var(--ll-bg-subtle)' }}
              >
                <span>View solution</span>
                <ChevronUp size={13} className={showCode ? '' : 'rotate-180'} />
              </button>
              {showCode && (
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER_MED}`, background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center px-4 py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <span className="text-[11px] text-slate-600" style={MONO}>python</span>
                  </div>
                  <pre className="px-4 py-3 text-[13px] text-slate-300 overflow-x-auto leading-relaxed" style={MONO}>{response.code}</pre>
                </div>
              )}
            </>
          )}

          <button onClick={getHints} className="text-[11px] text-slate-700 hover:text-slate-500 transition-colors flex items-center gap-1">
            <RotateCcw size={10} /> Re-analyze with current code
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Solution Tab (tab content) ──────────────────────────────────────────────

function SolutionTab({ problem }: { problem: ProblemContent }) {
  const approaches = problem.solutions ?? [];
  const [expandedIdx, setExpandedIdx] = useState<number>(0);

  if (approaches.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-[13px]" style={{ ...SG, color: 'var(--ll-ink-muted)' }}>Solutions coming soon.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
      {approaches.map((sol, i) => {
        const isOpen = expandedIdx === i;
        return (
          <div
            key={i}
            className="rounded-lg overflow-hidden transition-shadow"
            style={{
              border: `1px solid ${isOpen ? 'var(--ll-accent-ring)' : BORDER_MED}`,
              background: 'var(--ll-bg-elevated)',
              boxShadow: isOpen ? 'var(--ll-shadow-md)' : 'var(--ll-shadow-sm)',
            }}
          >
            <button
              onClick={() => setExpandedIdx(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ borderBottom: isOpen ? `1px solid ${BORDER}` : 'none' }}
            >
              <span className="flex items-center gap-2.5 text-[13px] font-semibold" style={{ ...SG, color: 'var(--ll-ink-strong)' }}>
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
                  style={{ background: 'var(--ll-accent-soft)', color: 'var(--ll-accent-ink)' }}
                >
                  {i + 1}
                </span>
                {sol.approach}
              </span>
              <ChevronUp
                size={14}
                className={`transition-transform ${isOpen ? '' : 'rotate-180'}`}
                style={{ color: 'var(--ll-ink-muted)' }}
              />
            </button>

            {isOpen && (
              <div className="px-4 py-4 space-y-4">
                {/* Intuition */}
                <div className="text-[13px] leading-relaxed" style={{ ...SG, color: 'var(--ll-ink)' }}>
                  {sol.intuition}
                </div>

                {/* Code block */}
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER_MED}`, background: 'var(--ll-bg-code)' }}>
                  <div className="flex items-center px-4 py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <span className="text-[11px]" style={{ ...MONO, color: 'var(--ll-ink-muted)' }}>python</span>
                  </div>
                  <pre className="px-4 py-3 text-[13px] overflow-x-auto leading-relaxed" style={{ ...MONO, color: 'var(--ll-ink-strong)' }}>{sol.code}</pre>
                </div>

                {/* Complexity badges */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 font-medium" style={{ background: 'var(--ll-accent-soft)', color: 'var(--ll-accent-ink)', border: '1px solid var(--ll-accent-ring)', ...SG }}>
                    Time: {sol.timeComplexity}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 font-medium" style={{ background: 'rgba(168,85,247,0.12)', color: 'var(--ll-ink-strong)', border: '1px solid rgba(168,85,247,0.35)', ...SG }}>
                    Space: {sol.spaceComplexity}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type LeftTab = 'question' | 'solution' | 'tutor';

interface ProblemPanelProps {
  problem: ProblemContent;
  code: string;
  width: number;
  fullscreen: boolean;
  activeTab: LeftTab;
  onTabChange: (t: LeftTab) => void;
  onToggleFullscreen: () => void;
}

function ProblemPanel({
  problem, code, width, fullscreen, activeTab, onTabChange, onToggleFullscreen,
}: ProblemPanelProps) {
  const TABS: { id: LeftTab; label: string; icon?: React.ReactNode }[] = [
    { id: 'question', label: 'Question', icon: <FileText size={12} /> },
    ...(problem.solutions && problem.solutions.length > 0 ? [{ id: 'solution' as LeftTab, label: 'Solution' }] : []),
    { id: 'tutor',    label: 'Tutor' },
  ];

  return (
    <div
      className={fullscreen ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col shrink-0'}
      style={fullscreen
        ? { background: BG_PANEL }
        : { width, minWidth: 280, background: BG_PANEL }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center shrink-0"
        style={{ height: 42, borderBottom: `1px solid ${BORDER}`, background: BG_PANEL }}
      >
        <div className="flex items-center h-full">
          {TABS.map(t => {
            const isActive = t.id === activeTab;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className="flex items-center gap-1.5 h-full px-4 text-[12.5px] font-medium transition-colors relative"
                style={{
                  color: isActive ? 'var(--ll-ink-strong)' : 'var(--ll-ink-muted)',
                  background: isActive ? 'var(--ll-bg-hover)' : 'transparent',
                  ...SG,
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink-muted)'; }}
              >
                {t.icon}
                {t.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t"
                    style={{ background: 'var(--ll-accent)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="ml-auto pr-2">
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'question' && <QuestionTab problem={problem} />}
        {activeTab === 'solution' && <SolutionTab problem={problem} />}
        {/* Tutor stays mounted so chat history persists when switching tabs; refresh clears it. */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ display: activeTab === 'tutor' ? 'flex' : 'none' }}
        >
          <TutorTab code={code} problem={problem} />
        </div>
      </div>
    </div>
  );
}

// ─── Horizontal Resizer ───────────────────────────────────────────────────────

interface HorizontalResizerProps {
  onDrag: (deltaX: number) => void;
}

function HorizontalResizer({ onDrag }: HorizontalResizerProps) {
  const [hover, setHover]       = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    let prev = 0;
    const onMove = (e: MouseEvent) => {
      if (prev === 0) { prev = e.clientX; return; }
      onDrag(e.clientX - prev);
      prev = e.clientX;
    };
    const onUp = () => {
      setDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, onDrag]);

  return (
    <div
      onMouseDown={() => {
        setDragging(true);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="shrink-0 relative"
      style={{
        width: 5,
        cursor: 'col-resize',
        background: hover || dragging ? 'rgba(59,130,246,0.35)' : BORDER,
        transition: 'background 0.15s',
      }}
    />
  );
}

// ─── Vertical Resizer ─────────────────────────────────────────────────────────

interface VerticalResizerProps {
  onDrag: (deltaY: number) => void;
}

function VerticalResizer({ onDrag }: VerticalResizerProps) {
  const [hover, setHover]       = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    let prev = 0;
    const onMove = (e: MouseEvent) => {
      if (prev === 0) { prev = e.clientY; return; }
      onDrag(e.clientY - prev);
      prev = e.clientY;
    };
    const onUp = () => {
      setDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, onDrag]);

  return (
    <div
      onMouseDown={() => {
        setDragging(true);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'row-resize';
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="shrink-0"
      style={{
        height: 5,
        cursor: 'row-resize',
        background: hover || dragging ? 'rgba(59,130,246,0.35)' : BORDER,
        transition: 'background 0.15s',
      }}
    />
  );
}

// ─── Editor Panel ─────────────────────────────────────────────────────────────

// Monaco theme colors must be literal hex (#RRGGBB or #RRGGBBAA) — CSS variables
// and rgba() strings are silently dropped. We define one theme for each app
// theme and switch the `theme` prop on MonacoEditor when the user toggles.
const defineTheme: BeforeMount = (monaco) => {
  // Light — GitHub-style palette matching the app's Stripe/Linear aesthetic.
  monaco.editor.defineTheme('lc-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword',  foreground: 'cf222e' },
      { token: 'string',   foreground: '0a3069' },
      { token: 'comment',  foreground: '6e7781', fontStyle: 'italic' },
      { token: 'number',   foreground: '0550ae' },
      { token: 'type',     foreground: '953800' },
      { token: 'function', foreground: '8250df' },
    ],
    colors: {
      'editor.background':                  '#d3deef',
      'editor.foreground':                  '#0f172a',
      'editor.lineHighlightBackground':     '#c2d1e8',
      'editor.lineHighlightBorder':         '#00000000',
      'editor.selectionBackground':         '#3b82f640',
      'editor.inactiveSelectionBackground': '#94a3b81a',
      'editorLineNumber.foreground':        '#cbd5e1',
      'editorLineNumber.activeForeground':  '#2563eb',
      'editorCursor.foreground':            '#2563eb',
      'editorIndentGuide.background1':      '#e2e8f0',
      'editorIndentGuide.activeBackground1':'#cbd5e1',
      'editorWidget.background':            '#ffffff',
      'editorWidget.border':                '#bfdbfe',
      'editorSuggestWidget.background':     '#ffffff',
      'editorSuggestWidget.border':         '#bfdbfe',
      'editorSuggestWidget.foreground':     '#0f172a',
      'editorSuggestWidget.selectedBackground': '#eff6ff',
      'scrollbarSlider.background':         '#2563eb14',
      'scrollbarSlider.hoverBackground':    '#2563eb26',
      'scrollbarSlider.activeBackground':   '#2563eb40',
      'editorError.foreground':             '#dc2626',
      'editorWarning.foreground':           '#d97706',
    },
  });

  // Dark — navy-blue workspace matching the dashboard palette.
  monaco.editor.defineTheme('lc-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword',  foreground: '79b8ff' },
      { token: 'string',   foreground: '9ecbff' },
      { token: 'comment',  foreground: '6a737d', fontStyle: 'italic' },
      { token: 'number',   foreground: 'f8cc7a' },
      { token: 'type',     foreground: 'b392f0' },
      { token: 'function', foreground: 'b392f0' },
    ],
    colors: {
      'editor.background':                  '#0f1729',
      'editor.foreground':                  '#e5e7eb',
      'editor.lineHighlightBackground':     '#131b30',
      'editor.lineHighlightBorder':         '#00000000',
      'editor.selectionBackground':         '#3b82f640',
      'editor.inactiveSelectionBackground': '#ffffff0d',
      'editorLineNumber.foreground':        '#334155',
      'editorLineNumber.activeForeground':  '#94a3b8',
      'editorCursor.foreground':            '#60a5fa',
      'editorIndentGuide.background1':      '#1e293b',
      'editorWidget.background':            '#0f1729',
      'editorSuggestWidget.background':     '#0f1729',
      'editorSuggestWidget.border':         '#1e293b',
      'scrollbarSlider.background':         '#ffffff08',
      'scrollbarSlider.hoverBackground':    '#ffffff0f',
      'scrollbarSlider.activeBackground':   '#ffffff14',
      'editorError.foreground':             '#f87171',
      'editorWarning.foreground':           '#fbbf24',
    },
  });
};

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'Geist Mono', 'Cascadia Code', 'Fira Code', ui-monospace, monospace",
  fontLigatures: true,
  lineHeight: 20,
  // Opt out of Monaco's experimental EditContext input path — it breaks
  // keyboard input/cursor movement on some Chromium builds. Falls back to
  // the classic hidden-textarea input which is stable everywhere.
  editContext:          false,
  minimap:              { enabled: false },
  stickyScroll:         { enabled: false },
  scrollBeyondLastLine: false,
  padding:              { top: 16, bottom: 16 },
  renderLineHighlight:  'line'    as const,
  lineNumbers:          'on'      as const,
  glyphMargin:          true,  // needed for error gutter icons
  folding:              false,
  lineDecorationsWidth: 8,
  lineNumbersMinChars:  3,
  overviewRulerLanes:   0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder:  false,
  renderWhitespace:     'none'    as const,
  contextmenu:          true,
  quickSuggestions:     { other: true, comments: false, strings: false },
  tabSize:              4,
  insertSpaces:         true,
  wordWrap:             'off'     as const,
  scrollbar: {
    verticalScrollbarSize:   5,
    horizontalScrollbarSize: 5,
  },
} as const;

interface EditorPanelProps {
  code: string;
  lang: LangId;
  running: boolean;
  results: TestResult[];
  fullscreen: boolean;
  onCodeChange:  (v: string) => void;
  onLangChange:  (l: LangId) => void;
  onReset:       () => void;
  onRun:         () => void;
  onSubmit:      () => void;
  onToggleFullscreen: () => void;
  verdict:       'accepted' | 'wrong' | null;
  solved:        boolean;
  children:      React.ReactNode;
}

// Fallback for errors that don't come with a structured `errorLine` — e.g.
// worker/runtime failures whose message still mentions "line N" somewhere.
function parseErrorLine(msg: string): number {
  const m = msg.match(/line (\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

function EditorPanel({
  code, lang, running, results, fullscreen,
  onCodeChange, onLangChange, onReset,
  onRun, onSubmit, onToggleFullscreen, verdict, solved, children,
}: EditorPanelProps) {
  const onRunRef  = useRef(onRun);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const appTheme  = useAppTheme();
  const monacoTheme = appTheme === 'dark' ? 'lc-dark' : 'lc-light';
  // Matches the Monaco `editor.background` so the surrounding frame doesn't
  // flicker a different shade when the editor remounts on theme change.
  const editorFrameBg = appTheme === 'dark' ? '#0f1729' : BG_EDITOR;
  useEffect(() => { onRunRef.current = onRun; });

  // Sync Monaco error markers on each run result
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    const seenLines = new Set<number>();
    const markers: {
      startLineNumber: number; startColumn: number;
      endLineNumber: number;   endColumn: number;
      message: string;         severity: number;
    }[] = [];

    const lineCount = model.getLineCount();
    for (const r of results) {
      if (!r.error) continue;
      const line = r.errorLine ?? parseErrorLine(r.error);
      if (line < 1 || line > lineCount || seenLines.has(line)) continue;
      seenLines.add(line);
      const label = r.error.trim().split('\n').filter(Boolean).pop() ?? r.error;
      markers.push({
        startLineNumber: line,
        startColumn:     1,
        endLineNumber:   line,
        endColumn:       model.getLineMaxColumn(line),
        message:         label,
        severity:        monaco.MarkerSeverity.Error,
      });
    }

    monaco.editor.setModelMarkers(model, 'lc-runner', markers);
  }, [results]);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => onRunRef.current()
    );
    editor.focus();
  }, []);

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden ll-code-surface">
      {/* Subtle left-edge accent rail — signals the "workspace" side */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-[2px] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.08) 40%, transparent 100%)',
        }}
      />
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 shrink-0 backdrop-blur-[4px]"
        style={{
          height: 42,
          borderBottom: `1px solid ${BORDER}`,
          background: 'var(--ll-glass-bg)',
        }}
      >
        <div className="relative flex items-center">
          <select
            value={lang}
            onChange={e => onLangChange(e.target.value as LangId)}
            className="appearance-none pl-2.5 pr-7 py-1 rounded-md text-[12px] font-medium cursor-pointer focus:outline-none transition-colors"
            style={{
              background: 'var(--ll-accent-soft)',
              border: `1px solid var(--ll-accent-ring)`,
              color: 'var(--ll-accent-ink)',
              ...SG,
            }}
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id} style={{ background: 'var(--ll-bg-elevated)' }}>
                {l.label}
              </option>
            ))}
          </select>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="absolute right-2 pointer-events-none" style={{ color: 'var(--ll-accent-ink)' }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="hidden sm:flex items-center gap-1 text-[11px] select-none" style={{ color: 'var(--ll-ink-muted)' }}>
            <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}`, color: 'var(--ll-ink)', ...MONO }}>⌘</kbd>
            <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}`, color: 'var(--ll-ink)', ...MONO }}>↵</kbd>
            <span className="ml-0.5" style={SG}>Run</span>
          </span>

          <button
            onClick={onReset}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--ll-ink-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink-muted)'; }}
            title="Reset to starter code"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--ll-ink-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink-muted)'; }}
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
          >
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Monaco */}
      <div className="flex-1 overflow-hidden" style={{ background: editorFrameBg }}>
        <MonacoEditor
          height="100%"
          language={LANGUAGES.find(l => l.id === lang)?.monacoId ?? 'python'}
          value={code}
          theme={monacoTheme}
          options={EDITOR_OPTIONS}
          beforeMount={defineTheme}
          onMount={handleMount}
          onChange={v => onCodeChange(v ?? '')}
        />
      </div>

      {/* Test panel slot */}
      {children}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{
          height: 52,
          borderTop: `1px solid ${BORDER}`,
          background: BG_CHROME,
        }}
      >
        {/* Verdict */}
        <div className="text-[12px]" style={SG}>
          {verdict === 'wrong' ? (
            <span className="font-medium text-red-400">✗ Wrong Answer</span>
          ) : verdict === 'accepted' || solved ? (
            <span className="font-medium" style={{ color: 'var(--ll-success-ink)' }}>
              ✓ Solved
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              color: running ? 'var(--ll-ink-faint)' : 'var(--ll-ink)',
              border: `1px solid ${BORDER_MED}`,
              background: 'var(--ll-bg-hover)',
            }}
            onMouseEnter={e => { if (!running) (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-tinted)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-hover)'; }}
          >
            <Play size={11} />
            {running ? 'Running…' : 'Run'}
          </button>
          <button
            onClick={onSubmit}
            disabled={running}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-[13px] font-semibold text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-400"
            style={{
              border: '1px solid rgba(96,165,250,0.6)',
              boxShadow: verdict === 'accepted'
                ? 'none'
                : '0 10px 30px -10px rgba(59,130,246,0.7), 0 0 0 1px rgba(96,165,250,0.35)',
            }}
          >
            <Send size={11} />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Test Case Panel ──────────────────────────────────────────────────────────

interface TestCasePanelProps {
  open: boolean;
  height:          number;
  onResize:        (deltaY: number) => void;
  onToggle:        () => void;
  tests:           TestCase[];
  results:         TestResult[];
  activeId:        string;
  running:         boolean;
  activeTab:       PanelTab;
  onTabChange:     (tab: PanelTab) => void;
  onSelectCase:    (id: string) => void;
  onAddCase:       () => void;
  onDeleteCase:    (id: string) => void;
  onUpdateInput:   (id: string, val: string) => void;
  onUpdateExpected:(id: string, val: string) => void;
  hiddenFail:      HiddenFailState | null;
}

function caseStatusColor(caseId: string, results: TestResult[]) {
  const r = results.find(r => r.caseId === caseId);
  if (!r) return 'rgba(15,23,42,0.14)';
  return r.passed ? 'rgba(52,211,153,0.75)' : 'rgba(248,113,113,0.75)';
}

function StatusPill({ status, passed, total }: { status: RunStatus; passed: number; total: number }) {
  const s = STATUS_STYLE[status];
  const showCount = status !== 'idle' && status !== 'running';
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-[3px] rounded-md"
        style={{ ...SG, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
      >
        {status === 'running' && (
          <span className="w-[5px] h-[5px] rounded-full animate-pulse" style={{ background: s.color }} />
        )}
        {s.label}
      </span>
      {showCount && (
        <span className="text-[11.5px]" style={{ ...SG, color: 'var(--ll-ink-faint)' }}>
          {passed}/{total} passed
        </span>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className="relative text-[11.5px] font-medium transition-colors"
      style={{
        ...SG,
        height: 28,
        padding: '0 10px',
        color: active ? 'var(--ll-accent-ink)' : 'var(--ll-ink-muted)',
        borderBottom: active ? '1px solid var(--ll-accent)' : '1px solid transparent',
        marginBottom: -1,
      }}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {typeof badge === 'number' && badge > 0 && (
          <span
            className="text-[10px] font-semibold px-1.5 rounded-full"
            style={{
              background: 'rgba(248,113,113,0.14)',
              color: 'var(--ll-danger-ink)',
              lineHeight: '15px',
            }}
          >
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

function CasesView({
  tests, results, activeId, onSelectCase, onAddCase, onDeleteCase, onUpdateInput, onUpdateExpected,
}: Pick<TestCasePanelProps,
  'tests' | 'results' | 'activeId' | 'onSelectCase' | 'onAddCase' | 'onDeleteCase' | 'onUpdateInput' | 'onUpdateExpected'
>) {
  const activeTest   = tests.find(t => t.id === activeId) ?? tests[0];
  const activeResult = results.find(r => r.caseId === activeId);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div
        className="flex items-center shrink-0 overflow-x-auto"
        style={{ height: 36, paddingLeft: 12, paddingRight: 8, gap: 4, borderBottom: `1px solid ${BORDER}`, scrollbarWidth: 'none' }}
      >
        {tests.map(t => {
          const dot      = caseStatusColor(t.id, results);
          const isActive = t.id === activeId;
          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelectCase(t.id)}
              className="flex items-center gap-1.5 shrink-0 select-none transition-colors"
              style={{
                height: 26,
                paddingLeft: 9,
                paddingRight: t.custom ? 4 : 9,
                borderRadius: 6,
                cursor: 'pointer',
                background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                border:     isActive ? '1px solid rgba(59,130,246,0.18)' : '1px solid transparent',
              }}
              onClick={() => onSelectCase(t.id)}
            >
              <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: dot }} />
              <span className="text-[12px] font-medium" style={{ ...SG, color: isActive ? 'var(--ll-accent-ink)' : 'var(--ll-ink-muted)' }}>
                {t.label}
              </span>
              {t.custom && (
                <button
                  className="ml-0.5 p-0.5 rounded hover:bg-slate-100 transition-colors"
                  style={{ color: 'var(--ll-ink-subtle)' }}
                  onClick={e => { e.stopPropagation(); onDeleteCase(t.id); }}
                  aria-label="Delete case"
                >
                  <X size={9} />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={onAddCase}
          className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded transition-colors ml-1 hover:bg-slate-100"
          style={{ color: 'var(--ll-ink-subtle)' }}
          aria-label="Add custom test case"
        >
          <Plus size={11} />
        </button>
      </div>

      {activeTest && (
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--ll-ink-subtle)' }}>Input</p>
            <textarea
              value={activeTest.inputJson}
              onChange={e => onUpdateInput(activeTest.id, e.target.value)}
              spellCheck={false}
              rows={2}
              className="w-full resize-none rounded-md px-2.5 py-1.5 text-[12px] outline-none transition-colors"
              style={{
                background: 'var(--ll-bg-subtle)',
                border: `1px solid ${BORDER}`,
                color: 'var(--ll-ink)',
                ...MONO,
              }}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--ll-ink-subtle)' }}>Expected</p>
            {activeTest.custom ? (
              <input
                type="text"
                value={activeTest.expectedJson}
                onChange={e => onUpdateExpected(activeTest.id, e.target.value)}
                placeholder="e.g. [0,1]"
                className="w-full rounded-md px-2.5 py-1.5 text-[12px] outline-none"
                style={{
                  background: 'var(--ll-bg-subtle)',
                  border: `1px solid ${BORDER}`,
                  color: 'var(--ll-ink)',
                  ...MONO,
                }}
              />
            ) : (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px]"
                style={{ background: 'var(--ll-bg-hover)', color: 'var(--ll-accent-ink)', ...MONO }}
              >
                {activeTest.expectedJson || '—'}
              </span>
            )}
          </div>

          {activeResult && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--ll-ink-subtle)' }}>
                {activeResult.error ? 'Error' : 'Output'}
              </p>
              {activeResult.error ? (
                <pre
                  className="text-[11px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                  style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', color: 'var(--ll-danger-ink)', ...MONO }}
                >
                  {activeResult.error}
                </pre>
              ) : (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px]"
                  style={{
                    background: activeResult.passed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${activeResult.passed ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)'}`,
                    color: activeResult.passed ? 'rgba(52,211,153,0.9)' : 'rgba(248,113,113,0.9)',
                    ...MONO,
                  }}
                >
                  {activeResult.actual || '—'}
                </span>
              )}
            </div>
          )}

          {activeResult?.stdout && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--ll-ink-subtle)' }}>
                Stdout
              </p>
              <pre
                className="text-[11px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}`, color: 'var(--ll-ink-muted)', ...MONO }}
              >
                {activeResult.stdout}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConsoleView({ tests, results }: { tests: TestCase[]; results: TestResult[] }) {
  const entries = tests
    .map(t => {
      const r = results.find(rr => rr.caseId === t.id);
      const out = r?.stdout ?? '';
      return { id: t.id, label: t.label, out, hasResult: Boolean(r) };
    })
    .filter(e => e.out.length > 0);

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <p className="text-[12px]" style={{ ...SG, color: 'var(--ll-ink)' }}>
          No output — use <span style={MONO}>print()</span> inside your function to log values, then run.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-3"
      style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}
    >
      <pre className="text-[11.5px] leading-relaxed whitespace-pre-wrap" style={{ ...MONO, color: 'var(--ll-ink)' }}>
        {entries.map((e, i) => (
          <span key={e.id}>
            <span style={{ color: 'var(--ll-ink)' }}>
              {i > 0 ? '\n' : ''}── {e.label} ──{'\n'}
            </span>
            {e.out.endsWith('\n') ? e.out : e.out + '\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}

type ErrorRow = {
  key: string;
  kind: 'runtime' | 'wrong';
  source: 'visible' | 'hidden';
  label: string;
  inputJson: string;
  expectedJson: string;
  actual: string;
  error?: string;
  errorLine?: number;
  onClick?: () => void;
};

function ErrorsView({
  tests, results, hiddenFail, onJumpToCase,
}: {
  tests: TestCase[];
  results: TestResult[];
  hiddenFail: HiddenFailState | null;
  onJumpToCase: (id: string) => void;
}) {
  const rows: ErrorRow[] = [];
  for (const r of results) {
    if (r.passed) continue;
    const t = tests.find(tt => tt.id === r.caseId);
    if (!t) continue;
    rows.push({
      key: r.caseId,
      kind: r.error ? 'runtime' : 'wrong',
      source: 'visible',
      label: t.label,
      inputJson: t.inputJson,
      expectedJson: t.expectedJson,
      actual: r.actual,
      error: r.error,
      errorLine: r.errorLine,
      onClick: () => onJumpToCase(r.caseId),
    });
  }
  if (hiddenFail) {
    rows.push({
      key: 'hidden-fail',
      kind: hiddenFail.error ? 'runtime' : 'wrong',
      source: 'hidden',
      label: hiddenFail.label,
      inputJson: hiddenFail.inputJson,
      expectedJson: hiddenFail.expectedJson,
      actual: hiddenFail.actual,
      error: hiddenFail.error,
      errorLine: hiddenFail.errorLine,
    });
  }

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <p className="text-[12px]" style={{ ...SG, color: 'var(--ll-ink-faint)' }}>
          No failing cases.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}
    >
      {rows.map(row => <ErrorRowCard key={row.key} row={row} />)}
    </div>
  );
}

function ErrorRowCard({ row }: { row: ErrorRow }) {
  const isRuntime = row.kind === 'runtime';
  const accentInk = isRuntime ? 'rgba(248,113,113,0.95)' : 'rgba(251,146,60,0.95)';
  const accentBg  = isRuntime ? 'rgba(239,68,68,0.06)'  : 'rgba(249,115,22,0.06)';
  const accentBorder = isRuntime ? 'rgba(248,113,113,0.22)' : 'rgba(251,146,60,0.26)';
  const Tag: 'button' | 'div' = row.onClick ? 'button' : 'div';
  const clickable = Boolean(row.onClick);

  return (
    <Tag
      {...(row.onClick ? { onClick: row.onClick, type: 'button' as const } : {})}
      className="block w-full text-left rounded-lg overflow-hidden transition-colors"
      style={{
        background: 'var(--ll-bg-panel)',
        border: `1px solid ${accentBorder}`,
        cursor: clickable ? 'pointer' : 'default',
      }}
      onMouseEnter={clickable ? (e => { (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-hover)'; }) : undefined}
      onMouseLeave={clickable ? (e => { (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-panel)'; }) : undefined}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: accentBg, borderBottom: `1px solid ${accentBorder}` }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[2px] rounded"
          style={{ ...SG, color: accentInk, background: 'rgba(255,255,255,0.55)' }}
        >
          {isRuntime ? 'Runtime Error' : 'Wrong Answer'}
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-[2px] rounded"
          style={{
            ...SG,
            color: row.source === 'hidden' ? 'rgba(139,92,246,0.95)' : 'rgba(100,116,139,0.9)',
            background: row.source === 'hidden' ? 'rgba(139,92,246,0.12)' : 'rgba(100,116,139,0.12)',
          }}
        >
          {row.source === 'hidden' ? 'Hidden Test' : 'Visible Test'}
        </span>
        <span className="text-[12.5px] font-semibold truncate" style={{ ...SG, color: 'var(--ll-ink)' }}>
          {row.label}
        </span>
        {row.errorLine && row.errorLine > 0 && (
          <span className="ml-auto text-[10.5px]" style={{ ...SG, color: 'var(--ll-ink-faint)' }}>
            Line {row.errorLine}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <ErrorField label="Input" value={row.inputJson} tone="neutral" />
        {isRuntime ? (
          <ErrorField label="Traceback" value={row.error ?? ''} tone="danger" multiline />
        ) : (
          <>
            <ErrorField label="Expected" value={row.expectedJson || '—'} tone="ok" />
            <ErrorField label="Your output" value={row.actual || 'None'} tone="danger" />
          </>
        )}
      </div>
    </Tag>
  );
}

function ErrorField({
  label, value, tone, multiline,
}: {
  label: string;
  value: string;
  tone: 'neutral' | 'ok' | 'danger';
  multiline?: boolean;
}) {
  const toneInk =
    tone === 'ok'     ? 'var(--ll-accent-ink)'
    : tone === 'danger' ? 'var(--ll-danger-ink)'
    :                     'var(--ll-ink)';
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5"
        style={{ ...SG, color: 'var(--ll-ink-subtle)' }}
      >
        {label}
      </p>
      <pre
        className={`text-[11.5px] leading-relaxed rounded-md px-3 py-2 ${multiline ? 'whitespace-pre-wrap' : 'whitespace-pre-wrap break-all'}`}
        style={{
          ...MONO,
          background: 'var(--ll-bg-subtle)',
          border: `1px solid ${BORDER}`,
          color: toneInk,
          maxHeight: multiline ? 180 : undefined,
          overflow: multiline ? 'auto' : undefined,
        }}
      >
        {value}
      </pre>
    </div>
  );
}

function TestCasePanel({
  open, height, onResize, onToggle, tests, results, activeId, running,
  activeTab, onTabChange,
  onSelectCase, onAddCase, onDeleteCase, onUpdateInput, onUpdateExpected,
  hiddenFail,
}: TestCasePanelProps) {
  const tab = activeTab;
  const setTab = onTabChange;
  const passCount = results.filter(r => r.passed).length;
  const status    = deriveStatus(running, results, hiddenFail !== null);
  const errorCount = results.filter(r => !r.passed).length + (hiddenFail ? 1 : 0);
  const totalCount = tests.length + (hiddenFail ? 1 : 0);

  const jumpToCase = useCallback((id: string) => {
    onSelectCase(id);
    setTab('cases');
  }, [onSelectCase, setTab]);

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{ background: BG_CHROME }}
    >
      {open ? (
        <VerticalResizer onDrag={(dy) => onResize(-dy)} />
      ) : (
        <div style={{ height: 1, background: BORDER }} />
      )}

      <div className="flex items-center justify-between px-4" style={{ height: 38 }}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-[12px] font-medium transition-colors"
          style={{ color: open ? 'var(--ll-ink)' : 'var(--ll-ink-muted)', ...SG }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = open ? 'var(--ll-ink)' : 'var(--ll-ink-muted)'; }}
        >
          <ChevronUp size={12} className={open ? '' : 'rotate-180'} style={{ transition: 'transform 0.18s' }} />
          Test Cases
        </button>

        <StatusPill status={status} passed={passCount} total={totalCount} />
      </div>

      {open && (
        <div style={{ height, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
          <div
            className="flex items-center shrink-0"
            style={{ paddingLeft: 8, paddingRight: 8, borderBottom: `1px solid ${BORDER}`, gap: 2 }}
          >
            <TabButton label="Test Cases" active={tab === 'cases'}   onClick={() => setTab('cases')} />
            <TabButton label="Console"    active={tab === 'console'} onClick={() => setTab('console')} />
            <TabButton label="Errors"     active={tab === 'errors'}  onClick={() => setTab('errors')} badge={errorCount} />
          </div>

          {tab === 'cases' && (
            <CasesView
              tests={tests}
              results={results}
              activeId={activeId}
              onSelectCase={onSelectCase}
              onAddCase={onAddCase}
              onDeleteCase={onDeleteCase}
              onUpdateInput={onUpdateInput}
              onUpdateExpected={onUpdateExpected}
            />
          )}
          {tab === 'console' && <ConsoleView tests={tests} results={results} />}
          {tab === 'errors'  && <ErrorsView  tests={tests} results={results} hiddenFail={hiddenFail} onJumpToCase={jumpToCase} />}
        </div>
      )}
    </div>
  );
}

// ─── Tutor Chat (tab content) ────────────────────────────────────────────────

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

function TutorChat({ code, problem }: { code: string; problem: ProblemContent }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        "I can see your code and the problem already, so just tell me what's tripping you up. Stuck on the approach, failing a test, edge case you're unsure about, whatever it is. I won't give you the answer, but I'll get you there.",
    },
  ]);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<{ used: number; limit: number } | null>(null);
  const scrollRef             = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setError(null);
    const next: ChatMsg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setSending(true);
    try {
      const exampleText = problem.examples
        .map((ex, i) => `Example ${i + 1}: Input: ${ex.input} → Output: ${ex.output}`)
        .join('\n');
      const problemDescription = `${problem.title}\n\n${problem.descriptionMd}\n\n${exampleText}`;
      const res = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          problem: problemDescription,
          code,
        }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateLimited({ used: data.used ?? 3, limit: data.limit ?? 3 });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className="rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap"
              style={{
                maxWidth: '85%',
                background:
                  m.role === 'user'
                    ? 'var(--ll-accent-soft)'
                    : 'var(--ll-bg-hover)',
                border: `1px solid ${
                  m.role === 'user'
                    ? 'var(--ll-accent-ring)'
                    : BORDER
                }`,
                color: m.role === 'user' ? 'var(--ll-accent-ink)' : 'var(--ll-ink)',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div
              className="rounded-lg px-3 py-2"
              style={{ background: 'var(--ll-bg-hover)', border: `1px solid ${BORDER}` }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      background: 'rgba(196,181,253,0.6)',
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {rateLimited && (
          <div className="px-1">
            <UpgradePrompt used={rateLimited.used} limit={rateLimited.limit} />
          </div>
        )}
        {error && (
          <div
            className="rounded-lg px-3 py-2 text-[12px] text-red-400"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}
          >
            {error}
          </div>
        )}
      </div>

      <div
        className="shrink-0 p-3"
        style={{ borderTop: `1px solid ${BORDER}`, background: 'var(--ll-bg-subtle)' }}
      >
        <div
          className="flex items-end gap-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--ll-bg-hover)', border: `1px solid ${BORDER_MED}` }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask the tutor anything…"
            className="flex-1 bg-transparent resize-none outline-none text-[13px] placeholder:text-slate-500 leading-relaxed"
            style={{ maxHeight: 120, color: 'var(--ll-ink)' }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="shrink-0 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'var(--ll-accent-soft)',
              border: '1px solid var(--ll-accent-ring)',
              color: 'var(--ll-accent-ink)',
            }}
            aria-label="Send"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tutor Tab wrapper — chat on top (2/3), hints on bottom (1/3) ────────────

function TutorTab({ code, problem }: { code: string; problem: ProblemContent }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-col min-h-0" style={{ flex: '2 1 0%' }}>
        <TutorChat code={code} problem={problem} />
      </div>
      <div
        className="flex flex-col min-h-0"
        style={{ flex: '1 1 0%', borderTop: `1px solid ${BORDER}`, background: 'var(--ll-bg-subtle)' }}
      >
        <HintsTab code={code} problem={problem} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface ProblemPageProps {
  problem: ProblemContent;
}

export default function ProblemPage({ problem }: ProblemPageProps) {
  const lsKey = `lc-code-${problem.slug}`;
  const starterPython = problem.starterCode.python;

  const initialTests = useMemo(() => testsFromProblem(problem), [problem]);
  const initialActiveId = initialTests[0]?.id ?? 'default-1';

  const [lang, setLang]           = useState<LangId>('python');
  const [code, setCode]           = useState(starterPython);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab]   = useState<PanelTab>('cases');
  const [tests, setTests]         = useState<TestCase[]>(initialTests);
  const [results, setResults]     = useState<TestResult[]>([]);
  const [activeId, setActiveId]   = useState(initialActiveId);
  const [running, setRunning]     = useState(false);
  const [verdict, setVerdict]     = useState<'accepted' | 'wrong' | null>(null);
  const [hiddenFail, setHiddenFail]   = useState<HiddenFailState | null>(null);
  const [acceptedToast, setAcceptedToast] = useState<AcceptedToastState | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [solved, setSolved]       = useState(false);

  // Fetch whether this problem has already been solved so the editor shows
  // a persistent "Solved" badge across reloads, not just the run-time verdict.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/solved-slugs')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data?.slugs) return;
        if (data.slugs.includes(problem.slug)) setSolved(true);
      })
      .catch(() => { /* best-effort */ });
    return () => { cancelled = true; };
  }, [problem.slug]);

  // Resizable layout
  const [leftWidth, setLeftWidth]   = useState(560);
  const [testHeight, setTestHeight] = useState(220);

  // Left panel tabs + per-panel fullscreen
  const [leftTab, setLeftTab]       = useState<LeftTab>('question');
  const [fullscreen, setFullscreen] = useState<'left' | 'editor' | null>(null);

  const openLeftTab = useCallback((t: LeftTab) => {
    setLeftTab(t);
    setFullscreen(fs => (fs === 'editor' ? null : fs));
  }, []);

  const onLeftResize = useCallback((dx: number) => {
    setLeftWidth(w => {
      const next = w + dx;
      const max  = typeof window !== 'undefined' ? Math.max(280, window.innerWidth - 360) : 1200;
      return Math.max(280, Math.min(max, next));
    });
  }, []);

  // Keep leftWidth within bounds when the browser window is resized — otherwise a
  // wide session's leftWidth can push the editor off-screen when the window shrinks.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clamp = () => {
      setLeftWidth(w => {
        const max = Math.max(280, window.innerWidth - 360);
        return Math.min(Math.max(280, w), max);
      });
    };
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, []);

  const onTestResize = useCallback((dy: number) => {
    setTestHeight(h => {
      const next = h + dy;
      const max  = typeof window !== 'undefined' ? window.innerHeight - 250 : 700;
      return Math.max(120, Math.min(max, next));
    });
  }, []);

  // Hydrate draft code from localStorage.
  useEffect(() => {
    const saved = localStorage.getItem(lsKey);
    if (saved) setCode(saved);
  }, [lsKey]);

  // Pre-warm the Pyodide worker while the user is reading the problem, so the
  // first "Run" click is instant instead of paying the ~2s runtime cold start.
  useEffect(() => {
    ensureWorker().catch(() => { /* best-effort; real errors surface on run */ });
  }, []);

  function handleCodeChange(val: string) {
    setCode(val);
    localStorage.setItem(lsKey, val);
  }

  function handleLangChange(l: LangId) {
    setLang(l);
    // Single-language for now; kept for future expansion.
    setCode(starterPython);
  }

  function handleReset() {
    setCode(starterPython);
    localStorage.setItem(lsKey, starterPython);
  }

  function recordSubmission(status: 'accepted' | 'wrong', passedCount: number, totalCount: number) {
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: problem.slug, code, language: lang,
        status, passedCount, totalCount,
      }),
    }).catch(() => { /* best-effort */ });
  }

  async function execTests(showVerdict: boolean) {
    setRunning(true);
    setVerdict(null);
    setHiddenFail(null);
    setAcceptedToast(null);
    if (showVerdict) setSubmitting(true);
    const startedAt = Date.now();
    try {
      const { results: visibleResults } = await runTests({
        code,
        tests,
        methodName:    problem.methodName,
        argKeys:       problem.argKeys,
        resultCompare: problem.resultCompare,
      });
      setResults(visibleResults);
      setPanelOpen(true);
      const firstVisibleFail = visibleResults.find(r => !r.passed);
      if (firstVisibleFail) setActiveId(firstVisibleFail.caseId);
      else setActiveId(tests[0]?.id ?? initialActiveId);

      const visibleAccepted = visibleResults.length > 0 && visibleResults.every(r => r.passed);

      // Plain Run: no modal, no submission recording, no hidden tests.
      if (!showVerdict) return;

      // Submit — always fetch and run hidden tests, regardless of visible outcome.
      let hiddenDefs: ProblemTest[] = [];
      let hiddenLoadError: string | null = null;
      try {
        const res = await fetch(`/api/hidden-tests/${problem.slug}`, { method: 'POST' });
        if (!res.ok) {
          hiddenLoadError =
            res.status === 401
              ? 'Sign in to run hidden tests.'
              : `Hidden tests unavailable (HTTP ${res.status}).`;
          console.warn('[submit] hidden-tests fetch failed', { slug: problem.slug, status: res.status });
        } else {
          const data = await res.json();
          if (Array.isArray(data?.tests)) hiddenDefs = data.tests as ProblemTest[];
          if (hiddenDefs.length === 0) {
            hiddenLoadError = 'Hidden tests are missing for this problem. Run the seed migrations.';
            console.warn('[submit] hidden-tests returned empty', { slug: problem.slug, data });
          }
        }
      } catch (err) {
        hiddenLoadError = 'Network error fetching hidden tests.';
        console.warn('[submit] hidden-tests fetch threw', err);
      }

      let hiddenResults: { caseId: string; passed: boolean; actual: string; error?: string; errorLine?: number; stdout?: string }[] = [];
      if (hiddenDefs.length > 0) {
        const hiddenRunnerTests = hiddenDefs.map((t, i) => ({
          id: `hidden-${i + 1}`,
          inputJson: t.inputJson,
          expectedJson: t.expectedJson,
        }));
        const { results } = await runTests({
          code,
          tests: hiddenRunnerTests,
          methodName:    problem.methodName,
          argKeys:       problem.argKeys,
          resultCompare: problem.resultCompare,
        });
        hiddenResults = results;
      }

      const runtimeMs = Date.now() - startedAt;
      const hiddenFailIdx = hiddenResults.findIndex(r => !r.passed);
      const hiddenPassedCount = hiddenResults.filter(r => r.passed).length;
      const visiblePassedCount = visibleResults.filter(r => r.passed).length;
      const totalCount  = visibleResults.length + hiddenResults.length;
      const passedCount = visiblePassedCount + hiddenPassedCount;

      const isFirst = (() => {
        try {
          if (localStorage.getItem('lc-solved-once') === '1') return false;
          localStorage.setItem('lc-solved-once', '1');
          return true;
        } catch { return false; }
      })();

      // Show the hidden failure if there is one (it's the most "submit-specific"
      // feedback). Otherwise fall back to the first visible failure.
      if (hiddenFailIdx >= 0) {
        setVerdict('wrong');
        const fail = hiddenResults[hiddenFailIdx];
        const failDef = hiddenDefs[hiddenFailIdx];
        const label = failDef.label || `Hidden ${hiddenFailIdx + 1}`;
        setHiddenFail({
          label,
          inputJson: failDef.inputJson,
          expectedJson: failDef.expectedJson,
          actual: fail.actual,
          error: fail.error,
          errorLine: fail.errorLine,
        });
        setPanelOpen(true);
        setPanelTab('errors');
        recordSubmission('wrong', passedCount, totalCount);
      } else if (!visibleAccepted) {
        setVerdict('wrong');
        if (firstVisibleFail) setActiveId(firstVisibleFail.caseId);
        setPanelTab('errors');
        recordSubmission('wrong', passedCount, totalCount);
      } else if (hiddenLoadError) {
        // Do not Accept on visible-only when hidden tests should exist.
        setVerdict('wrong');
        setHiddenFail({
          label: 'Hidden tests could not be loaded',
          inputJson: '—',
          expectedJson: '—',
          actual: '—',
          error: hiddenLoadError,
        });
        setPanelOpen(true);
        setPanelTab('errors');
        recordSubmission('wrong', passedCount, totalCount);
      } else {
        setVerdict('accepted');
        setSolved(true);
        setAcceptedToast({ runtimeMs, passedCount, totalCount, isFirst });
        recordSubmission('accepted', passedCount, totalCount);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Runner error';
      setResults(tests.map(t => ({ caseId: t.id, passed: false, actual: '', error: message })));
      setPanelOpen(true);
      if (showVerdict) setVerdict('wrong');
    } finally {
      setRunning(false);
      setSubmitting(false);
    }
  }

  function addCustomCase() {
    const id = newCustomId();
    setTests(prev => [...prev, { id, label: 'Custom', inputJson: '{}', expectedJson: '', custom: true }]);
    setActiveId(id);
    setPanelOpen(true);
  }

  function deleteCase(id: string) {
    setTests(prev => prev.filter(t => t.id !== id));
    setResults(prev => prev.filter(r => r.caseId !== id));
    setActiveId(initialActiveId);
  }

  function updateInput(id: string, val: string) {
    setTests(prev => prev.map(t => t.id === id ? { ...t, inputJson: val } : t));
    setResults(prev => prev.filter(r => r.caseId !== id));
  }

  function updateExpected(id: string, val: string) {
    setTests(prev => prev.map(t => t.id === id ? { ...t, expectedJson: val } : t));
    setResults(prev => prev.filter(r => r.caseId !== id));
  }

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: BG_BASE, overflow: 'hidden' }}>
      <TopNav problem={problem} solved={solved} />

      <div className="flex flex-1 overflow-hidden relative">
        {fullscreen !== 'editor' && (
          <ProblemPanel
            problem={problem}
            code={code}
            width={leftWidth}
            fullscreen={fullscreen === 'left'}
            activeTab={leftTab}
            onTabChange={setLeftTab}
            onToggleFullscreen={() =>
              setFullscreen(fs => (fs === 'left' ? null : 'left'))
            }
          />
        )}

        {fullscreen === null && <HorizontalResizer onDrag={onLeftResize} />}

        {fullscreen !== 'left' && (
          <EditorPanel
            code={code}
            lang={lang}
            running={running}
            results={results}
            fullscreen={fullscreen === 'editor'}
            onCodeChange={handleCodeChange}
            onLangChange={handleLangChange}
            onReset={handleReset}
            onRun={() => execTests(false)}
            onSubmit={() => execTests(true)}
            onToggleFullscreen={() =>
              setFullscreen(fs => (fs === 'editor' ? null : 'editor'))
            }
            verdict={verdict}
            solved={solved}
          >
            <TestCasePanel
              open={panelOpen}
              height={testHeight}
              onResize={onTestResize}
              onToggle={() => setPanelOpen(o => !o)}
              tests={tests}
              results={results}
              activeId={activeId}
              running={running}
              activeTab={panelTab}
              onTabChange={setPanelTab}
              onSelectCase={setActiveId}
              onAddCase={addCustomCase}
              onDeleteCase={deleteCase}
              onUpdateInput={updateInput}
              onUpdateExpected={updateExpected}
              hiddenFail={hiddenFail}
            />
          </EditorPanel>
        )}
      </div>

      {submitting && <SubmittingToast />}

      {acceptedToast && (
        <AcceptedToast
          state={acceptedToast}
          onExpire={() => setAcceptedToast(null)}
        />
      )}
    </div>
  );
}

// ─── Submitting toast ────────────────────────────────────────────────────────
// Shown while a Submit is in flight. Same top-center slot as AcceptedToast
// so a clean hand-off happens when the run completes. Non-blocking.

function SubmittingToast() {
  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-live="polite"
      style={{ top: 80 }}
    >
      <div
        className="flex items-center gap-4 pl-5 pr-7 py-4 rounded-2xl"
        style={{
          background: 'rgba(15,23,41,0.97)',
          border: '1px solid rgba(96,165,250,0.4)',
          boxShadow:
            '0 30px 80px -20px rgba(59,130,246,0.5), 0 0 0 1px rgba(15,23,42,0.06), 0 0 40px rgba(59,130,246,0.15)',
          animation: 'lc-toast-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className="shrink-0 rounded-full"
          style={{
            width: 28,
            height: 28,
            border: '3px solid rgba(96,165,250,0.25)',
            borderTopColor: 'rgba(96,165,250,1)',
            animation: 'lc-spin 0.75s linear infinite',
          }}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-[17px] font-bold tracking-tight" style={{ ...SG, color: 'rgba(147,197,253,1)' }}>
            Submitting…
          </span>
          <span className="mt-0.5 text-[12px]" style={{ ...SG, color: 'rgba(203,213,225,0.78)' }}>
            Running hidden tests
          </span>
        </div>
      </div>

      <style>{`
        @keyframes lc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Accepted toast ──────────────────────────────────────────────────────────
// Small auto-dismissing notification shown when Submit passes every test.
// No close button, no backdrop — it slides out on its own after a few seconds.

function AcceptedToast({
  state,
  onExpire,
}: {
  state: AcceptedToastState;
  onExpire: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onExpire, 2000);
    return () => clearTimeout(id);
  }, [onExpire]);

  const headline = state.isFirst ? 'First solve!' : 'Accepted';

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-live="polite"
      style={{ top: 80 }}
    >
      <div
        className="flex items-center gap-5 pl-6 pr-8 py-5 rounded-2xl"
        style={{
          background: 'rgba(15,23,41,0.97)',
          border: '1px solid rgba(52,211,153,0.4)',
          boxShadow:
            '0 40px 90px -20px rgba(16,185,129,0.55), 0 0 0 1px rgba(15,23,42,0.06), 0 0 48px rgba(16,185,129,0.18)',
          animation:
            'lc-toast-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), lc-toast-out 0.25s ease-in forwards 1.7s',
        }}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: 'rgba(16,185,129,0.18)',
            border: '1px solid rgba(52,211,153,0.35)',
          }}
        >
          <span style={{ color: 'rgba(52,211,153,1)', fontSize: 32, lineHeight: 1, fontWeight: 700 }}>✓</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[22px] font-bold tracking-tight" style={{ ...SG, color: 'rgba(52,211,153,1)' }}>
            {headline}
          </span>
          <span className="mt-1 text-[13.5px]" style={{ ...SG, color: 'rgba(203,213,225,0.85)' }}>
            {state.passedCount}/{state.totalCount} cases passed · {state.runtimeMs} ms
          </span>
        </div>
      </div>

      <style>{`
        @keyframes lc-toast-in {
          0%   { opacity: 0; transform: translateY(-10px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lc-toast-out {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(0.98); }
        }
      `}</style>
    </div>
  );
}
