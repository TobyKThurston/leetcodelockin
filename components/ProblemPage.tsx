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

// ─── Monaco (browser-only) ────────────────────────────────────────────────────

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0f1729' }}>
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

const BG_BASE    = '#0b1220';  // appBg    — matches dashboard
const BG_PANEL   = '#070c17';  // panelBg  — matches dashboard nav/sidebar/rail
const BG_EDITOR  = '#0f1729';  // cardBg   — matches dashboard cards
const BORDER     = 'rgba(255,255,255,0.06)';
const BORDER_MED = 'rgba(255,255,255,0.1)';

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

type FailSource = 'visible' | 'hidden';

type SubmitResultState =
  | {
      kind: 'accepted';
      runtimeMs: number;
      passedCount: number;
      totalCount: number;
      isFirst: boolean;
    }
  | {
      kind: 'wrong';
      source: FailSource;
      label: string;
      inputJson: string;
      expectedJson: string;
      actual: string;
      runtimeMs: number;
      passedCount: number;
      totalCount: number;
    }
  | {
      kind: 'runtime_error';
      source: FailSource;
      label: string;
      inputJson: string;
      error: string;
      errorLine?: number;
      runtimeMs: number;
    };

type RunStatus = 'idle' | 'running' | 'accepted' | 'wrong' | 'runtime_error';

function deriveStatus(running: boolean, results: TestResult[]): RunStatus {
  if (running) return 'running';
  if (results.length === 0) return 'idle';
  if (results.some(r => r.error)) return 'runtime_error';
  if (results.every(r => r.passed)) return 'accepted';
  return 'wrong';
}

const STATUS_STYLE: Record<RunStatus, { label: string; color: string; bg: string; border: string }> = {
  idle:          { label: 'Ready',         color: 'rgba(148,163,184,0.8)', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.18)' },
  running:       { label: 'Running…',      color: 'rgba(251,191,36,0.9)',  bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.2)' },
  accepted:      { label: 'Accepted',      color: 'rgba(52,211,153,0.9)',  bg: 'rgba(16,185,129,0.07)',  border: 'rgba(52,211,153,0.22)' },
  wrong:         { label: 'Wrong Answer',  color: 'rgba(251,146,60,0.95)', bg: 'rgba(249,115,22,0.07)',  border: 'rgba(251,146,60,0.22)' },
  runtime_error: { label: 'Runtime Error', color: 'rgba(248,113,113,0.9)', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(248,113,113,0.22)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Matched to dashboard's emerald completion / amber medium / red hard palette
const DIFF_STYLE: Record<string, React.CSSProperties> = {
  Easy:   { color: 'rgba(52,211,153,0.9)',  border: '1px solid rgba(52,211,153,0.2)',   background: 'rgba(16,185,129,0.07)'  },
  Medium: { color: 'rgba(251,191,36,0.9)',  border: '1px solid rgba(251,191,36,0.2)',   background: 'rgba(245,158,11,0.07)'  },
  Hard:   { color: 'rgba(248,113,113,0.9)', border: '1px solid rgba(248,113,113,0.2)',  background: 'rgba(239,68,68,0.07)'   },
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
        background: BG_PANEL,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-1.5 font-semibold text-[15px] tracking-tight text-white mr-0" style={SG}>
        <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
        LeetLockin
      </Link>

      <div className="w-px h-4 mx-1" style={{ background: BORDER_MED }} />

      {/* Back */}
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
        style={SG}
      >
        <ChevronLeft size={13} />
        {backLabel}
      </Link>

      <div className="w-px h-4 mx-1" style={{ background: BORDER }} />

      {/* Problem breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-zinc-200" style={SG}>
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
              color: 'rgba(52,211,153,0.95)',
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
          className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-400 transition-colors"
          title="Previous problem"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-400 transition-colors"
          title="Next problem"
        >
          <ChevronRight size={14} />
        </button>
        <div className="w-px h-4 mx-1" style={{ background: BORDER }} />
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold text-slate-300 shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER_MED}` }}
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
    <p {...props} className="text-[13.5px] leading-[1.75] text-zinc-400 mb-3 last:mb-0" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-slate-100" />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="not-italic text-slate-200" />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="px-1.5 py-0.5 rounded text-[12.5px]"
      style={{ background: 'rgba(255,255,255,0.07)', color: '#c9d1d9', ...MONO }}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc list-outside pl-5 mb-3 space-y-1 text-[13.5px] leading-[1.65] text-zinc-400" />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-outside pl-5 mb-3 space-y-1 text-[13.5px] leading-[1.65] text-zinc-400" />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="text-[13.5px] leading-[1.6] text-zinc-400" />
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
        <h1 className="text-[19px] font-semibold text-white mb-3" style={{ ...SG, letterSpacing: '-0.02em' }}>
          {problem.title}{' '}
          <span className="text-zinc-600 font-normal text-[14px]">(LC #{problem.lcNumber})</span>
        </h1>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[11.5px] font-medium" style={DIFF_STYLE[problem.difficulty]}>
            {problem.difficulty}
          </span>
          {problem.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[11.5px] font-medium"
              style={{ color: 'rgba(255,255,255,0.25)', border: `1px solid ${BORDER}`, background: 'transparent' }}
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
            <p className="text-[12px] font-semibold text-zinc-400 mb-2 uppercase tracking-[0.08em]" style={SG}>
              Example {i + 1}
            </p>
            <div
              className="rounded-lg px-4 py-3 space-y-1.5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BORDER}`,
                backdropFilter: 'blur(4px)',
              }}
            >
              <p className="text-[12.5px]" style={MONO}>
                <span style={{ color: 'rgba(96,165,250,0.7)' }}>Input: </span>
                <span style={{ color: '#c9d1d9' }}>{ex.input}</span>
              </p>
              <p className="text-[12.5px]" style={MONO}>
                <span style={{ color: 'rgba(96,165,250,0.7)' }}>Output: </span>
                <span style={{ color: '#c9d1d9' }}>{ex.output}</span>
              </p>
              {ex.explanation && (
                <p className="text-[11.5px] text-zinc-600 pt-0.5">{ex.explanation}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-600 tracking-[0.12em] uppercase mb-2.5" style={SG}>
          Constraints
        </p>
        <ul className="space-y-1.5">
          {problem.constraints.map(c => (
            <li key={c} className="flex items-start gap-2.5 text-[12.5px] text-zinc-500" style={MONO}>
              <span className="mt-[7px] w-[3px] h-[3px] rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
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
            <p className="text-[14px] font-semibold text-zinc-200 mb-1 tracking-tight" style={SG}>Stuck? Get a nudge.</p>
            <p className="text-[12px] text-zinc-500 max-w-[260px] leading-relaxed">
              {code.trim()
                ? 'Hints will be based on the code you have right now — the more you write, the better the hints.'
                : 'Write some code first and hints will be tailored to your approach. Or generate hints from scratch to get started.'}
            </p>
          </div>
          <button
            onClick={getHints}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-110 active:brightness-95"
            style={{
              background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
              border: '1px solid rgba(147,197,253,0.55)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.25) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 12px 32px -12px rgba(59,130,246,0.75), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            {code.trim() ? 'Analyze my code' : 'Get hints'}
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <p className="text-[11px] text-zinc-600 text-center animate-pulse" style={SG}>
            {code.trim() ? 'Reading your code…' : 'Generating hints…'}
          </p>
          {[1,2,3].map(i => (
            <div key={i} className="rounded-lg px-4 py-3 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}` }}>
              <div className="h-2 w-14 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-2.5 w-full rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="h-2.5 w-4/5 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
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
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-600">Pattern</span>
            <span
              className="px-2 py-0.5 rounded text-[11px] font-medium"
              style={{ color: 'rgba(147,197,253,0.85)', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
            >
              {response.pattern}
            </span>
          </div>

          {response.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}` }}>
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.1em] mb-1.5">
                Hint {i + 1}{i === 0 ? ' — Think broadly' : i === 1 ? ' — More specific' : ' — Key insight'}
              </p>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{hint}</p>
            </div>
          ))}

          {hintsShown < response.hints.length && (
            <button
              onClick={() => setHintsShown(h => h + 1)}
              className="w-full py-2 rounded-lg text-[12px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}
            >
              Next hint ({hintsShown}/{response.hints.length})
            </button>
          )}

          {hintsShown >= response.hints.length && (
            <>
              <button
                onClick={() => setShowSteps(s => !s)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-[12px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}
              >
                <span>Step-by-step approach</span>
                <ChevronUp size={13} className={showSteps ? '' : 'rotate-180'} />
              </button>
              {showSteps && (
                <ol className="space-y-2 list-none">
                  {response.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] text-zinc-400">
                      <span className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}

              <button
                onClick={() => setShowCode(s => !s)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-[12px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}
              >
                <span>View solution</span>
                <ChevronUp size={13} className={showCode ? '' : 'rotate-180'} />
              </button>
              {showCode && (
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER_MED}`, background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center px-4 py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <span className="text-[11px] text-zinc-600" style={MONO}>python</span>
                  </div>
                  <pre className="px-4 py-3 text-[13px] text-zinc-300 overflow-x-auto leading-relaxed" style={MONO}>{response.code}</pre>
                </div>
              )}
            </>
          )}

          <button onClick={getHints} className="text-[11px] text-zinc-700 hover:text-zinc-500 transition-colors flex items-center gap-1">
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
        <p className="text-[13px] text-zinc-600" style={SG}>Solutions coming soon.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
      {approaches.map((sol, i) => {
        const isOpen = expandedIdx === i;
        return (
          <div key={i} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.015)' }}>
            <button
              onClick={() => setExpandedIdx(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ borderBottom: isOpen ? `1px solid ${BORDER}` : 'none' }}
            >
              <span className="text-[13px] font-semibold text-zinc-200" style={SG}>
                {i + 1}. {sol.approach}
              </span>
              <ChevronUp size={14} className={`text-zinc-500 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
            </button>

            {isOpen && (
              <div className="px-4 py-4 space-y-4">
                {/* Intuition */}
                <div className="text-[13px] text-zinc-400 leading-relaxed" style={SG}>
                  {sol.intuition}
                </div>

                {/* Code block */}
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER_MED}`, background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center px-4 py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <span className="text-[11px] text-zinc-600" style={MONO}>python</span>
                  </div>
                  <pre className="px-4 py-3 text-[13px] text-zinc-300 overflow-x-auto leading-relaxed" style={MONO}>{sol.code}</pre>
                </div>

                {/* Complexity badges */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1" style={{ background: 'rgba(96,165,250,0.1)', color: 'rgba(96,165,250,0.8)', ...SG }}>
                    Time: {sol.timeComplexity}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1" style={{ background: 'rgba(168,85,247,0.1)', color: 'rgba(168,85,247,0.8)', ...SG }}>
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
                  color: isActive ? '#c9d1d9' : '#3f4f63',
                  background: isActive ? 'rgba(255,255,255,0.02)' : 'transparent',
                  ...SG,
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#8b95a7'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#3f4f63'; }}
              >
                {t.icon}
                {t.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t"
                    style={{ background: 'rgba(96,165,250,0.7)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="ml-auto pr-2">
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-300 transition-colors"
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
        {activeTab === 'tutor'    && <TutorTab code={code} problem={problem} />}
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

// Monaco theme matching the dashboard navy palette
const defineTheme: BeforeMount = (monaco) => {
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
      // Monaco theme colors must be hex (#RRGGBB or #RRGGBBAA) — rgba()
      // strings silently fall back to pure red, painting the selection red.
      'editor.background':                '#0f1729',
      'editor.foreground':                '#e5e7eb',
      'editor.lineHighlightBackground':   '#131b30',
      'editor.selectionBackground':       '#3b82f640',
      'editorLineNumber.foreground':      '#334155',
      'editorLineNumber.activeForeground':'#94a3b8',
      'editorCursor.foreground':          '#60a5fa',
      'editor.inactiveSelectionBackground': '#ffffff0d',
      'editorIndentGuide.background1':    '#1e293b',
      'editorWidget.background':          '#0f1729',
      'editorSuggestWidget.background':   '#0f1729',
      'editorSuggestWidget.border':       '#1e293b',
      'scrollbarSlider.background':       '#ffffff08',
      'scrollbarSlider.hoverBackground':  '#ffffff0f',
      'scrollbarSlider.activeBackground': '#ffffff14',
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
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: BG_BASE }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: 42,
          borderBottom: `1px solid ${BORDER}`,
          background: BG_PANEL,
        }}
      >
        <div className="relative flex items-center">
          <select
            value={lang}
            onChange={e => onLangChange(e.target.value as LangId)}
            className="appearance-none pl-2.5 pr-7 py-1 rounded-md text-[12px] font-medium text-zinc-300 cursor-pointer focus:outline-none transition-colors hover:bg-white/[0.05]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER_MED}`,
              ...SG,
            }}
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id} style={{ background: '#0f1729' }}>
                {l.label}
              </option>
            ))}
          </select>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="absolute right-2 pointer-events-none" style={{ color: '#3f4f63' }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-700 select-none">
            <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, ...MONO }}>⌘</kbd>
            <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, ...MONO }}>↵</kbd>
            <span className="ml-0.5" style={SG}>Run</span>
          </span>

          <button
            onClick={onReset}
            className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-700 hover:text-zinc-400 transition-colors"
            title="Reset to starter code"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-700 hover:text-zinc-400 transition-colors"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
          >
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Monaco */}
      <div className="flex-1 overflow-hidden" style={{ background: BG_EDITOR }}>
        <MonacoEditor
          height="100%"
          language={LANGUAGES.find(l => l.id === lang)?.monacoId ?? 'python'}
          value={code}
          theme="lc-dark"
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
          background: BG_PANEL,
        }}
      >
        {/* Verdict */}
        <div className="text-[12px]" style={SG}>
          {verdict === 'wrong' ? (
            <span className="font-medium text-red-400">✗ Wrong Answer</span>
          ) : verdict === 'accepted' || solved ? (
            <span className="font-medium" style={{ color: 'rgba(52,211,153,0.9)' }}>
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
              color: running ? '#3f4f63' : '#a8b3c7',
              border: `1px solid ${BORDER_MED}`,
              background: 'rgba(255,255,255,0.03)',
            }}
            onMouseEnter={e => { if (!running) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <Play size={11} />
            {running ? 'Running…' : 'Run'}
          </button>
          <button
            onClick={onSubmit}
            disabled={running}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-400"
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
}

function caseStatusColor(caseId: string, results: TestResult[]) {
  const r = results.find(r => r.caseId === caseId);
  if (!r) return 'rgba(255,255,255,0.12)';
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
        <span className="text-[11.5px]" style={{ ...SG, color: '#6b7a8f' }}>
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
        color: active ? '#c9d1d9' : '#4a5a6e',
        borderBottom: active ? '1px solid rgba(96,165,250,0.7)' : '1px solid transparent',
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
              color: 'rgba(248,113,113,0.95)',
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
              <span className="text-[12px] font-medium" style={{ ...SG, color: isActive ? '#c9d1d9' : '#3a4a5c' }}>
                {t.label}
              </span>
              {t.custom && (
                <button
                  className="ml-0.5 p-0.5 rounded hover:bg-white/10 transition-colors"
                  style={{ color: '#3a4a5c' }}
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
          className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded transition-colors ml-1 hover:bg-white/[0.04]"
          style={{ color: '#3a4a5c' }}
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>Input</p>
            <textarea
              value={activeTest.inputJson}
              onChange={e => onUpdateInput(activeTest.id, e.target.value)}
              spellCheck={false}
              rows={2}
              className="w-full resize-none rounded-md px-2.5 py-1.5 text-[12px] outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BORDER}`,
                color: '#c9d1d9',
                ...MONO,
              }}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>Expected</p>
            {activeTest.custom ? (
              <input
                type="text"
                value={activeTest.expectedJson}
                onChange={e => onUpdateExpected(activeTest.id, e.target.value)}
                placeholder="e.g. [0,1]"
                className="w-full rounded-md px-2.5 py-1.5 text-[12px] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${BORDER}`,
                  color: '#c9d1d9',
                  ...MONO,
                }}
              />
            ) : (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px]"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(96,165,250,0.7)', ...MONO }}
              >
                {activeTest.expectedJson || '—'}
              </span>
            )}
          </div>

          {activeResult && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>
                {activeResult.error ? 'Error' : 'Output'}
              </p>
              {activeResult.error ? (
                <pre
                  className="text-[11px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                  style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(248,113,113,0.9)', ...MONO }}
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>
                Stdout
              </p>
              <pre
                className="text-[11px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, color: '#a8b3c7', ...MONO }}
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
        <p className="text-[12px]" style={{ ...SG, color: '#4a5a6e' }}>
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
      <pre className="text-[11.5px] leading-relaxed whitespace-pre-wrap" style={{ ...MONO, color: '#c9d1d9' }}>
        {entries.map((e, i) => (
          <span key={e.id}>
            <span style={{ color: '#4a5a6e' }}>
              {i > 0 ? '\n' : ''}── {e.label} ──{'\n'}
            </span>
            {e.out.endsWith('\n') ? e.out : e.out + '\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}

function ErrorsView({
  tests, results, onJumpToCase,
}: {
  tests: TestCase[];
  results: TestResult[];
  onJumpToCase: (id: string) => void;
}) {
  const rows = results
    .map(r => {
      if (r.passed) return null;
      const t = tests.find(tt => tt.id === r.caseId);
      if (!t) return null;
      const isRuntime = Boolean(r.error);
      return { r, t, isRuntime };
    })
    .filter((x): x is { r: TestResult; t: TestCase; isRuntime: boolean } => x !== null);

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <p className="text-[12px]" style={{ ...SG, color: '#4a5a6e' }}>
          No failing cases.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
      style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}
    >
      {rows.map(({ r, t, isRuntime }) => (
        <button
          key={r.caseId}
          onClick={() => onJumpToCase(r.caseId)}
          className="w-full text-left rounded-md px-3 py-2 transition-colors"
          style={{
            background: isRuntime ? 'rgba(239,68,68,0.04)' : 'rgba(249,115,22,0.04)',
            border: `1px solid ${isRuntime ? 'rgba(248,113,113,0.18)' : 'rgba(251,146,60,0.2)'}`,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = isRuntime
              ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = isRuntime
              ? 'rgba(239,68,68,0.04)' : 'rgba(249,115,22,0.04)';
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-[1px] rounded"
              style={{
                ...SG,
                color: isRuntime ? 'rgba(248,113,113,0.95)' : 'rgba(251,146,60,0.95)',
                background: isRuntime ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
              }}
            >
              {isRuntime ? 'Runtime Error' : 'Wrong Answer'}
            </span>
            <span className="text-[12px] font-medium" style={{ ...SG, color: '#c9d1d9' }}>
              {t.label}
            </span>
            {r.errorLine && r.errorLine > 0 && (
              <span className="text-[10.5px]" style={{ ...SG, color: '#6b7a8f' }}>
                Line {r.errorLine}
              </span>
            )}
          </div>
          {isRuntime ? (
            <pre className="text-[11px] leading-snug whitespace-pre-wrap" style={{ ...MONO, color: 'rgba(248,113,113,0.9)' }}>
              {r.error}
            </pre>
          ) : (
            <div className="text-[11px] leading-snug space-y-0.5" style={MONO}>
              <div style={{ color: '#6b7a8f' }}>
                Expected: <span style={{ color: 'rgba(96,165,250,0.85)' }}>{t.expectedJson || '—'}</span>
              </div>
              <div style={{ color: '#6b7a8f' }}>
                Got: <span style={{ color: 'rgba(248,113,113,0.9)' }}>{r.actual || 'None'}</span>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function TestCasePanel({
  open, height, onResize, onToggle, tests, results, activeId, running,
  activeTab, onTabChange,
  onSelectCase, onAddCase, onDeleteCase, onUpdateInput, onUpdateExpected,
}: TestCasePanelProps) {
  const tab = activeTab;
  const setTab = onTabChange;
  const passCount = results.filter(r => r.passed).length;
  const status    = deriveStatus(running, results);
  const errorCount = results.filter(r => !r.passed).length;

  const jumpToCase = useCallback((id: string) => {
    onSelectCase(id);
    setTab('cases');
  }, [onSelectCase, setTab]);

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{ background: BG_PANEL }}
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
          style={{ color: open ? '#a8b3c7' : '#3f4f63', ...SG }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#a8b3c7'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = open ? '#a8b3c7' : '#3f4f63'; }}
        >
          <ChevronUp size={12} className={open ? '' : 'rotate-180'} style={{ transition: 'transform 0.18s' }} />
          Test Cases
        </button>

        <StatusPill status={status} passed={passCount} total={tests.length} />
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
          {tab === 'errors'  && <ErrorsView  tests={tests} results={results} onJumpToCase={jumpToCase} />}
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
        "hey, what's tripping you up on this one? throw me anything. stuck on the pattern, can't figure out why your code's blowing up on test 3, worried about some weird edge case, whatever. i won't spoil the answer but i'll nudge you til it clicks.",
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
                    ? 'rgba(59,130,246,0.12)'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${
                  m.role === 'user'
                    ? 'rgba(59,130,246,0.25)'
                    : BORDER
                }`,
                color: m.role === 'user' ? '#dbeafe' : '#c9d1d9',
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
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}
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
        style={{ borderTop: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.015)' }}
      >
        <div
          className="flex items-end gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER_MED}` }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask the tutor anything…"
            className="flex-1 bg-transparent resize-none outline-none text-[13px] text-zinc-200 placeholder:text-zinc-600 leading-relaxed"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="shrink-0 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: 'rgba(196,181,253,0.95)',
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
        style={{ flex: '1 1 0%', borderTop: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.015)' }}
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
  const [submitResult, setSubmitResult] = useState<SubmitResultState | null>(null);
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

      // Plain Run: no modal, no submission recording.
      if (!showVerdict) return;

      // Submit path — failed on a visible case: surface via errors tab, no modal.
      if (!visibleAccepted) {
        setVerdict('wrong');
        const fail = firstVisibleFail!;
        const passedCount = visibleResults.filter(r => r.passed).length;
        setActiveId(fail.caseId);
        setPanelTab('errors');
        recordSubmission('wrong', passedCount, visibleResults.length);
        return;
      }

      // All visible passed — fetch the hidden test set and run it.
      let hiddenDefs: ProblemTest[] = [];
      try {
        const res = await fetch(`/api/hidden-tests/${problem.slug}`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.tests)) hiddenDefs = data.tests as ProblemTest[];
        }
      } catch {
        // Network blip — fall through as if there were no hidden tests.
      }

      const isFirst = (() => {
        try {
          if (localStorage.getItem('lc-solved-once') === '1') return false;
          localStorage.setItem('lc-solved-once', '1');
          return true;
        } catch { return false; }
      })();

      if (hiddenDefs.length === 0) {
        // No hidden tests authored — accept based on visible alone.
        const runtimeMs = Date.now() - startedAt;
        setVerdict('accepted');
        setSolved(true);
        setSubmitResult({
          kind: 'accepted', runtimeMs,
          passedCount: visibleResults.length, totalCount: visibleResults.length,
          isFirst,
        });
        recordSubmission('accepted', visibleResults.length, visibleResults.length);
        return;
      }

      const hiddenRunnerTests = hiddenDefs.map((t, i) => ({
        id: `hidden-${i + 1}`,
        inputJson: t.inputJson,
        expectedJson: t.expectedJson,
      }));
      const { results: hiddenResults } = await runTests({
        code,
        tests: hiddenRunnerTests,
        methodName:    problem.methodName,
        argKeys:       problem.argKeys,
        resultCompare: problem.resultCompare,
      });
      const runtimeMs = Date.now() - startedAt;
      const hiddenFailIdx = hiddenResults.findIndex(r => !r.passed);
      const hiddenPassedCount = hiddenResults.filter(r => r.passed).length;
      const totalCount  = visibleResults.length + hiddenResults.length;
      const passedCount = visibleResults.length + hiddenPassedCount;

      if (hiddenFailIdx >= 0) {
        setVerdict('wrong');
        const fail = hiddenResults[hiddenFailIdx];
        const failDef = hiddenDefs[hiddenFailIdx];
        const label = failDef.label || `Hidden ${hiddenFailIdx + 1}`;
        const syntheticId = `hidden-fail-${hiddenFailIdx + 1}`;
        const syntheticTest: TestCase = {
          id: syntheticId,
          label,
          inputJson: failDef.inputJson,
          expectedJson: failDef.expectedJson,
          custom: false,
        };
        const syntheticResult: TestResult = {
          caseId: syntheticId,
          passed: false,
          actual: fail.actual,
          error: fail.error,
          errorLine: fail.errorLine,
          stdout: fail.stdout,
        };
        setTests(prev => [...prev.filter(t => t.id !== syntheticId), syntheticTest]);
        setResults(prev => [...prev.filter(r => r.caseId !== syntheticId), syntheticResult]);
        setActiveId(syntheticId);
        setPanelTab('errors');
        recordSubmission('wrong', passedCount, totalCount);
      } else {
        setVerdict('accepted');
        setSolved(true);
        setSubmitResult({
          kind: 'accepted', runtimeMs, passedCount, totalCount, isFirst,
        });
        recordSubmission('accepted', passedCount, totalCount);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Runner error';
      setResults(tests.map(t => ({ caseId: t.id, passed: false, actual: '', error: message })));
      setPanelOpen(true);
      if (showVerdict) setVerdict('wrong');
    } finally {
      setRunning(false);
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
            />
          </EditorPanel>
        )}
      </div>

      {submitResult && (
        <SubmitResultModal
          state={submitResult}
          onDismiss={() => setSubmitResult(null)}
        />
      )}
    </div>
  );
}

// ─── Submit result modal ──────────────────────────────────────────────────────
// LeetCode-style popup shown after Submit. Three states:
//   • Accepted          — green header, runtime + pass count, close button
//   • Wrong Answer      — red header, failing case's Input / Expected / Got
//   • Runtime Error     — red header, failing case's Input + traceback
// Source ('visible' vs 'hidden') is surfaced as a chip so the user can tell
// whether the failure is on a test they can see or one of the hidden ones.

function SubmitResultModal({
  state,
  onDismiss,
}: {
  state: SubmitResultState;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const isAccepted = state.kind === 'accepted';
  const accent = isAccepted
    ? { bg: 'rgba(16,185,129,0.14)', glyph: 'rgba(52,211,153,1)', border: 'rgba(52,211,153,0.4)', shadow: 'rgba(16,185,129,0.45)' }
    : { bg: 'rgba(239,68,68,0.14)',  glyph: 'rgba(248,113,113,1)', border: 'rgba(248,113,113,0.4)', shadow: 'rgba(239,68,68,0.45)' };

  const headline =
    state.kind === 'accepted'      ? 'Accepted'
    : state.kind === 'wrong'       ? 'Wrong Answer'
    :                                'Runtime Error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onDismiss}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-[480px] rounded-2xl"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(15, 23, 41, 0.98)',
          border: `1px solid ${accent.border}`,
          boxShadow: `0 24px 70px -16px ${accent.shadow}, 0 0 0 1px rgba(255,255,255,0.03)`,
          animation: 'lc-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
              style={{ background: accent.bg }}
            >
              <span style={{ color: accent.glyph, fontSize: 20, lineHeight: 1 }}>
                {isAccepted ? '✓' : '✕'}
              </span>
            </div>
            <div>
              <p className="text-[17px] font-bold tracking-tight" style={{ ...SG, color: accent.glyph }}>
                {headline}
              </p>
              <p className="mt-0.5 text-[12px]" style={{ ...SG, color: '#6b7a8f' }}>
                {state.kind === 'accepted'
                  ? (state.isFirst
                      ? `First solve. ${state.passedCount}/${state.totalCount} testcases passed · ${state.runtimeMs} ms`
                      : `${state.passedCount}/${state.totalCount} testcases passed · ${state.runtimeMs} ms`)
                  : state.kind === 'wrong'
                    ? `${state.passedCount}/${state.totalCount} testcases passed · ${state.runtimeMs} ms`
                    : `Crashed after ${state.runtimeMs} ms`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="shrink-0 -mt-1 -mr-2 p-1.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: '#6b7a8f' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        {state.kind !== 'accepted' && (
          <div className="px-6 pb-5 space-y-3" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-[1px] rounded"
                style={{
                  ...SG,
                  color: state.source === 'hidden' ? 'rgba(167,139,250,0.95)' : 'rgba(148,163,184,0.9)',
                  background: state.source === 'hidden' ? 'rgba(139,92,246,0.1)' : 'rgba(148,163,184,0.08)',
                }}
              >
                {state.source === 'hidden' ? 'Hidden Test' : 'Visible Test'}
              </span>
              <span className="text-[12px] font-medium" style={{ ...SG, color: '#c9d1d9' }}>
                {state.label}
              </span>
              {state.kind === 'runtime_error' && state.errorLine && state.errorLine > 0 && (
                <span className="text-[10.5px]" style={{ ...SG, color: '#6b7a8f' }}>
                  Line {state.errorLine}
                </span>
              )}
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>
                Input
              </p>
              <pre
                className="text-[11.5px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, color: '#c9d1d9', ...MONO }}
              >
                {state.inputJson}
              </pre>
            </div>

            {state.kind === 'wrong' ? (
              <>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>
                    Expected
                  </p>
                  <pre
                    className="text-[11.5px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                    style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(52,211,153,0.18)', color: 'rgba(52,211,153,0.95)', ...MONO }}
                  >
                    {state.expectedJson || '—'}
                  </pre>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>
                    Got
                  </p>
                  <pre
                    className="text-[11.5px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(248,113,113,0.2)', color: 'rgba(248,113,113,0.95)', ...MONO }}
                  >
                    {state.actual}
                  </pre>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>
                  Error
                </p>
                <pre
                  className="text-[11.5px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(248,113,113,0.2)', color: 'rgba(248,113,113,0.95)', ...MONO }}
                >
                  {state.error}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-end gap-2" style={{ paddingTop: state.kind === 'accepted' ? 4 : 0 }}>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-md transition-colors"
            style={{
              ...SG,
              background: isAccepted ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
              color:       isAccepted ? 'rgba(52,211,153,0.95)' : '#c9d1d9',
              border: `1px solid ${isAccepted ? 'rgba(52,211,153,0.3)' : BORDER_MED}`,
            }}
          >
            {isAccepted ? 'Keep going' : 'Back to editor'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes lc-pop {
          0%   { opacity: 0; transform: translateY(-8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
