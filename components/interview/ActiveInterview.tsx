'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import posthog from 'posthog-js';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronLeft, ChevronRight, ChevronUp,
  Plus, X, Play, RotateCcw, Send, Maximize2, Minimize2, AlertTriangle,
} from 'lucide-react';
import type { OnMount, BeforeMount, Monaco } from '@monaco-editor/react';
import type { ProblemContent } from '@/lib/problem-types';
import { runTests, ensureWorker } from '@/lib/pyodide-runner';
import { INTERVIEW_DURATION_MS } from '@/lib/interview';
import InterviewTimer from './InterviewTimer';
import ThemeToggle from '@/components/ThemeToggle';

// Observe the body's `theme-dark` / `theme-light` class so Monaco (whose
// colors must be literal hex) re-renders when the user flips the theme.
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

// ─── Monaco (browser-only) ──────────────────────────────────────────────────

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
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
});

// ─── Design tokens ─────────────────────────────────────────────────��────────

const BG_BASE    = 'var(--ll-bg)';
const BG_CHROME  = 'var(--ll-bg-panel)';      // chrome bars (timer, toolbar, footer) — darker
const BG_PANEL   = 'var(--ll-bg-card)';       // content surfaces (question pane, modal) — lighter
const BG_EDITOR  = 'var(--ll-bg-elevated)';
const BORDER    = 'var(--ll-border)';
const BORDER_MED = 'var(--ll-border-strong)';

const SG: React.CSSProperties   = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

// Matches /solve (ProblemPage) so difficulty badges read identically.
const DIFF_STYLE: Record<string, React.CSSProperties> = {
  Easy:   { color: 'var(--ll-success-ink)', border: '1px solid rgba(52,211,153,0.2)',  background: 'rgba(16,185,129,0.07)' },
  Medium: { color: 'var(--ll-warning-ink)', border: '1px solid rgba(251,191,36,0.2)',  background: 'rgba(245,158,11,0.07)' },
  Hard:   { color: 'var(--ll-danger-ink)',  border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(239,68,68,0.07)' },
};

// ─── Monaco theme ───────────────────────────────────────────────────────────

const defineTheme: BeforeMount = (monaco) => {
  // Light theme — readable syntax colors on the card background.
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
      'editor.background':                  '#f3f6fc',
      'editor.foreground':                  '#0f172a',
      'editor.lineHighlightBackground':     '#e7edf8',
      'editor.lineHighlightBorder':         '#00000000',
      'editor.selectionBackground':         '#3b82f640',
      'editor.inactiveSelectionBackground': '#94a3b81a',
      'editorLineNumber.foreground':        '#94a3b8',
      'editorLineNumber.activeForeground':  '#2563eb',
      'editorCursor.foreground':            '#2563eb',
      'editorIndentGuide.background1':      '#dfe7f4',
      'editorIndentGuide.activeBackground1':'#94a3b8',
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

  // Dark theme — same navy-blue workspace as /solve.
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
  renderLineHighlight:  'line'  as const,
  lineNumbers:          'on'    as const,
  glyphMargin:          true,
  folding:              false,
  lineDecorationsWidth: 8,
  lineNumbersMinChars:  3,
  overviewRulerLanes:   0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder:  false,
  renderWhitespace:     'none'  as const,
  contextmenu:          true,
  quickSuggestions:     { other: true, comments: false, strings: false },
  tabSize:              4,
  insertSpaces:         true,
  wordWrap:             'off'   as const,
  scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
} as const;

// ─── Markdown components ────────────────────────────────────────────────────

const MD_COMPONENTS = {
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

// ─── Types ──────────────────────────────────────────────────────────────────

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
}

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

// ─── Props ──────────────────────────────────────────────────────────────────

export interface InterviewResults {
  problem1Results: { passed: number; total: number } | null;
  problem2Results: { passed: number; total: number } | null;
  problem1Code: string;
  problem2Code: string;
  timeUsedMs: number;
}

interface ActiveInterviewProps {
  problems: [ProblemContent, ProblemContent];
  startedAt: number;
  onSubmit: (results: InterviewResults) => void;
}

export default function ActiveInterview({ problems, startedAt, onSubmit }: ActiveInterviewProps) {
  const router = useRouter();
  const appTheme = useAppTheme();
  const monacoTheme = appTheme === 'dark' ? 'lc-dark' : 'lc-light';
  // Match the editor frame to Monaco's literal hex so there's no flicker when
  // the editor remounts on theme change.
  const editorFrameBg = appTheme === 'dark' ? '#0f1729' : '#f3f6fc';
  const deadlineMs = startedAt + INTERVIEW_DURATION_MS;

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitHome = useCallback(() => {
    try { localStorage.removeItem('zl-interview-active'); } catch {}
    router.push('/');
  }, [router]);

  // Current problem index
  const [currentIdx, setCurrentIdx] = useState<0 | 1>(0);
  const problem = problems[currentIdx];

  // Per-problem code
  const [codes, setCodes] = useState<[string, string]>([
    problems[0].starterCode.python,
    problems[1].starterCode.python,
  ]);

  // Per-problem test state
  const initialTests = useMemo(() => [
    testsFromProblem(problems[0]),
    testsFromProblem(problems[1]),
  ] as [TestCase[], TestCase[]], [problems]);

  const [allTests, setAllTests] = useState<[TestCase[], TestCase[]]>(initialTests);
  const [allResults, setAllResults] = useState<[TestResult[], TestResult[]]>([[], []]);
  const [running, setRunning] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTestId, setActiveTestId] = useState(initialTests[0][0]?.id ?? 'default-1');

  // Track time spent per problem
  const switchTimeRef = useRef(Date.now());
  const timeSpentRef = useRef<[number, number]>([0, 0]);

  // Layout
  const [leftWidth, setLeftWidth] = useState(520);
  const [testHeight, setTestHeight] = useState(200);
  const [fullscreen, setFullscreen] = useState<'left' | 'editor' | null>(null);

  // Pre-warm Pyodide
  useEffect(() => {
    ensureWorker().catch(() => {});
  }, []);

  // Resize clamping
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clamp = () => {
      setLeftWidth(w => Math.min(Math.max(280, w), Math.max(280, window.innerWidth - 360)));
    };
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, []);

  const code = codes[currentIdx];
  const tests = allTests[currentIdx];
  const results = allResults[currentIdx];

  function setCode(val: string) {
    setCodes(prev => {
      const next = [...prev] as [string, string];
      next[currentIdx] = val;
      return next;
    });
  }

  function switchProblem(idx: 0 | 1) {
    if (idx === currentIdx) return;
    // Record time spent on current problem
    const now = Date.now();
    timeSpentRef.current[currentIdx] += now - switchTimeRef.current;
    switchTimeRef.current = now;
    setCurrentIdx(idx);
    setActiveTestId(allTests[idx][0]?.id ?? 'default-1');
    setPanelOpen(false);
  }

  async function execTests() {
    setRunning(true);
    try {
      const { results: newResults } = await runTests({
        code,
        tests,
        methodName: problem.methodName,
        argKeys: problem.argKeys,
        resultCompare: problem.resultCompare,
      });
      setAllResults(prev => {
        const next = [...prev] as [TestResult[], TestResult[]];
        next[currentIdx] = newResults;
        return next;
      });
      setPanelOpen(true);
      const firstFail = newResults.find(r => !r.passed);
      if (firstFail) setActiveTestId(firstFail.caseId);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Runner error';
      const errResults = tests.map(t => ({ caseId: t.id, passed: false, actual: '', error: message }));
      setAllResults(prev => {
        const next = [...prev] as [TestResult[], TestResult[]];
        next[currentIdx] = errResults;
        return next;
      });
      setPanelOpen(true);
    } finally {
      setRunning(false);
    }
  }

  const handleSubmit = useCallback(() => {
    // Record final time on current problem
    const now = Date.now();
    timeSpentRef.current[currentIdx] += now - switchTimeRef.current;

    const r1 = allResults[0];
    const r2 = allResults[1];
    const p1Results = r1.length > 0 ? { passed: r1.filter(r => r.passed).length, total: r1.length } : null;
    const p2Results = r2.length > 0 ? { passed: r2.filter(r => r.passed).length, total: r2.length } : null;
    const timeUsedMs = now - startedAt;

    posthog.capture('interview_submitted', {
      time_used_ms: timeUsedMs,
      problem1_passed: p1Results?.passed ?? null,
      problem1_total: p1Results?.total ?? null,
      problem2_passed: p2Results?.passed ?? null,
      problem2_total: p2Results?.total ?? null,
    });

    onSubmit({
      problem1Code: codes[0],
      problem2Code: codes[1],
      problem1Results: p1Results,
      problem2Results: p2Results,
      timeUsedMs,
    });
  }, [codes, allResults, currentIdx, startedAt, onSubmit]);

  // Editor refs
  const onRunRef = useRef(execTests);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  useEffect(() => { onRunRef.current = execTests; });

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => onRunRef.current(),
    );
    editor.focus();
  }, []);

  // Sync error markers
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;
    const markers: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; message: string; severity: number }[] = [];
    const seen = new Set<number>();
    const lineCount = model.getLineCount();
    for (const r of results) {
      if (!r.error) continue;
      let line = r.errorLine ?? 0;
      if (!line) {
        const m = r.error.match(/line (\d+)/i);
        line = m ? parseInt(m[1], 10) : 0;
      }
      if (line < 1 || line > lineCount || seen.has(line)) continue;
      seen.add(line);
      markers.push({
        startLineNumber: line, startColumn: 1,
        endLineNumber: line, endColumn: model.getLineMaxColumn(line),
        message: r.error.trim().split('\n').filter(Boolean).pop() ?? r.error,
        severity: monaco.MarkerSeverity.Error,
      });
    }
    monaco.editor.setModelMarkers(model, 'lc-runner', markers);
  }, [results]);

  // Resizers
  const onLeftResize = useCallback((dx: number) => {
    setLeftWidth(w => {
      const max = typeof window !== 'undefined' ? Math.max(280, window.innerWidth - 360) : 1200;
      return Math.max(280, Math.min(max, w + dx));
    });
  }, []);

  const onTestResize = useCallback((dy: number) => {
    setTestHeight(h => {
      const max = typeof window !== 'undefined' ? window.innerHeight - 250 : 700;
      return Math.max(120, Math.min(max, h + dy));
    });
  }, []);

  function addCustomCase() {
    const id = newCustomId();
    setAllTests(prev => {
      const next = [...prev] as [TestCase[], TestCase[]];
      next[currentIdx] = [...next[currentIdx], { id, label: 'Custom', inputJson: '{}', expectedJson: '', custom: true }];
      return next;
    });
    setActiveTestId(id);
    setPanelOpen(true);
  }

  function deleteCase(id: string) {
    setAllTests(prev => {
      const next = [...prev] as [TestCase[], TestCase[]];
      next[currentIdx] = next[currentIdx].filter(t => t.id !== id);
      return next;
    });
    setActiveTestId(tests[0]?.id ?? 'default-1');
  }

  function updateTestInput(id: string, val: string) {
    setAllTests(prev => {
      const next = [...prev] as [TestCase[], TestCase[]];
      next[currentIdx] = next[currentIdx].map(t => t.id === id ? { ...t, inputJson: val } : t);
      return next;
    });
  }

  function updateTestExpected(id: string, val: string) {
    setAllTests(prev => {
      const next = [...prev] as [TestCase[], TestCase[]];
      next[currentIdx] = next[currentIdx].map(t => t.id === id ? { ...t, expectedJson: val } : t);
      return next;
    });
  }

  const activeTest = tests.find(t => t.id === activeTestId) ?? tests[0];
  const activeResult = results.find(r => r.caseId === activeTestId);
  const passCount = results.filter(r => r.passed).length;

  return (
    <div className="interview-surfaces flex flex-col" style={{ height: '100vh', background: BG_BASE, overflow: 'hidden' }}>
      {/* Timer bar */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{ height: 48, background: BG_CHROME, borderBottom: `1px solid ${BORDER}` }}
      >
        {/* Left: LeetLockin brand + Problem tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 font-bold text-[15px] tracking-tight whitespace-nowrap transition-opacity hover:opacity-80"
            style={{ ...SG, color: 'var(--ll-ink-strong)' }}
            title="Return home"
            aria-label="Return home"
          >
            <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
            LeetLockin
          </button>
          <div className="w-px h-5 mx-1" style={{ background: BORDER }} />
          {problems.map((p, i) => {
            const active = i === currentIdx;
            return (
              <button
                key={i}
                onClick={() => switchProblem(i as 0 | 1)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors"
                style={{
                  background: active ? 'var(--ll-bg-hover)' : 'transparent',
                  border: active ? `1px solid ${BORDER_MED}` : '1px solid transparent',
                  color: active ? 'var(--ll-ink-strong)' : 'var(--ll-ink-muted)',
                  ...SG,
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{
                    background: active ? 'var(--ll-accent-soft)' : 'var(--ll-bg-subtle)',
                    color: active ? 'var(--ll-accent-ink)' : 'var(--ll-ink-subtle)',
                  }}
                >
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{p.title}</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={DIFF_STYLE[p.difficulty]}
                >
                  {p.difficulty}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timer + right controls */}
        <div className="flex items-center gap-3">
          <InterviewTimer deadlineMs={deadlineMs} />
          <div className="w-px h-5" style={{ background: BORDER }} />
          <ThemeToggle />
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-colors bg-blue-500 hover:bg-blue-400"
            style={{
              border: '1px solid rgba(96,165,250,0.6)',
              boxShadow: '0 10px 30px -10px rgba(59,130,246,0.7), 0 0 0 1px rgba(96,165,250,0.35)',
              ...SG,
            }}
          >
            <Send size={11} />
            Submit Interview
          </button>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: problem description */}
        {fullscreen !== 'editor' && (
          <div
            className={fullscreen === 'left' ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col shrink-0'}
            style={fullscreen === 'left' ? { background: BG_PANEL } : { width: leftWidth, minWidth: 280, background: BG_PANEL }}
          >
            {/* Tab bar — Question only (no hints/solution/tutor). Styled as an
                active tab pill to match /solve's Question/Solution/Tutor bar. */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{ height: 42, borderBottom: `1px solid ${BORDER}`, background: BG_PANEL }}
            >
              <div className="flex items-center h-full">
                <div
                  className="flex items-center gap-1.5 h-full px-4 text-[12.5px] font-medium"
                  style={{
                    color: 'var(--ll-ink-strong)',
                    background: 'var(--ll-bg-hover)',
                    ...SG,
                  }}
                >
                  Question
                </div>
              </div>
              <button
                onClick={() => setFullscreen(fs => fs === 'left' ? null : 'left')}
                className="p-1.5 mr-2 rounded transition-colors"
                style={{ color: 'var(--ll-ink-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {fullscreen === 'left' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>

            {/* Question content */}
            <div
              className="px-6 py-5 space-y-5 overflow-y-auto flex-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}
            >
              <div>
                <h1 className="text-[19px] font-semibold text-slate-900 mb-3" style={{ ...SG, letterSpacing: '-0.02em' }}>
                  {problem.title}{' '}
                  <span className="text-slate-600 font-normal text-[14px]">(LC #{problem.lcNumber})</span>
                </h1>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[11.5px] font-medium" style={DIFF_STYLE[problem.difficulty]}>
                    {problem.difficulty}
                  </span>
                  {/* No tags shown during interview */}
                </div>
              </div>

              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                {problem.descriptionMd}
              </ReactMarkdown>

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

              <div>
                <p className="text-[10px] font-semibold text-slate-600 tracking-[0.12em] uppercase mb-2.5" style={SG}>Constraints</p>
                <ul className="space-y-1.5">
                  {problem.constraints.map(c => (
                    <li key={c} className="flex items-start gap-2.5 text-[12.5px] text-slate-500" style={MONO}>
                      <span className="mt-[7px] w-[3px] h-[3px] rounded-full shrink-0" style={{ background: 'var(--ll-ink-dim)' }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal resizer */}
        {fullscreen === null && <HorizontalResizer onDrag={onLeftResize} />}

        {/* Right: editor + test panel */}
        {fullscreen !== 'left' && (
          <div className="flex flex-col flex-1 overflow-hidden" style={{ background: BG_BASE }}>
            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-4 shrink-0"
              style={{ height: 42, borderBottom: `1px solid ${BORDER}`, background: BG_CHROME }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium"
                  style={{
                    background: 'var(--ll-accent-soft)',
                    border: '1px solid var(--ll-accent-ring)',
                    color: 'var(--ll-accent-ink)',
                    ...SG,
                  }}
                >
                  Python
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:flex items-center gap-1 text-[11px] select-none" style={{ color: 'var(--ll-ink-muted)' }}>
                  <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}`, color: 'var(--ll-ink)', ...MONO }}>⌘</kbd>
                  <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}`, color: 'var(--ll-ink)', ...MONO }}>↵</kbd>
                  <span className="ml-0.5" style={SG}>Run</span>
                </span>
                <button
                  onClick={() => setCode(problem.starterCode.python)}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: 'var(--ll-ink-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink-muted)'; }}
                  title="Reset to starter code"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setFullscreen(fs => fs === 'editor' ? null : 'editor')}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: 'var(--ll-ink-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ll-bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink-muted)'; }}
                  title={fullscreen === 'editor' ? 'Exit fullscreen' : 'Fullscreen editor'}
                >
                  {fullscreen === 'editor' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
            </div>

            {/* Monaco editor */}
            <div className="flex-1 overflow-hidden" style={{ background: editorFrameBg }}>
              <MonacoEditor
                height="100%"
                language="python"
                value={code}
                theme={monacoTheme}
                options={EDITOR_OPTIONS}
                beforeMount={defineTheme}
                onMount={handleMount}
                onChange={v => setCode(v ?? '')}
              />
            </div>

            {/* Test panel */}
            <div className="shrink-0 flex flex-col" style={{ background: BG_CHROME }}>
              {panelOpen ? (
                <VerticalResizer onDrag={(dy) => onTestResize(-dy)} />
              ) : (
                <div style={{ height: 1, background: BORDER }} />
              )}

              {/* Test header */}
              <div className="flex items-center justify-between px-4" style={{ height: 38 }}>
                <button
                  onClick={() => setPanelOpen(o => !o)}
                  className="flex items-center gap-2 text-[12px] font-medium transition-colors"
                  style={{ color: panelOpen ? 'var(--ll-ink)' : 'var(--ll-ink-muted)', ...SG }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ll-ink)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = panelOpen ? 'var(--ll-ink)' : 'var(--ll-ink-muted)'; }}
                >
                  <ChevronUp size={12} className={panelOpen ? '' : 'rotate-180'} style={{ transition: 'transform 0.18s' }} />
                  Test Cases
                </button>
                {results.length > 0 && !running && (
                  <span className="text-[11.5px] font-medium" style={{ ...SG, color: passCount === tests.length ? 'rgba(52,211,153,0.8)' : 'rgba(248,113,113,0.8)' }}>
                    {passCount}/{tests.length} passed
                  </span>
                )}
                {running && (
                  <span className="text-[11.5px] animate-pulse" style={{ ...SG, color: 'rgba(59,130,246,0.6)' }}>Running…</span>
                )}
              </div>

              {panelOpen && (
                <div style={{ height: testHeight, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
                  {/* Case tabs */}
                  <div
                    className="flex items-center shrink-0 overflow-x-auto"
                    style={{ height: 36, paddingLeft: 12, paddingRight: 8, gap: 4, borderBottom: `1px solid ${BORDER}`, scrollbarWidth: 'none' }}
                  >
                    {tests.map(t => {
                      const r = results.find(r => r.caseId === t.id);
                      const dot = !r ? 'var(--ll-ink-dim)' : r.passed ? 'rgba(52,211,153,0.75)' : 'rgba(248,113,113,0.75)';
                      const isActive = t.id === activeTestId;
                      return (
                        <div
                          key={t.id}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && setActiveTestId(t.id)}
                          onClick={() => setActiveTestId(t.id)}
                          className="flex items-center gap-1.5 shrink-0 select-none transition-colors"
                          style={{
                            height: 26, paddingLeft: 9, paddingRight: t.custom ? 4 : 9, borderRadius: 6, cursor: 'pointer',
                            background: isActive ? 'var(--ll-bg-hover)' : 'transparent',
                            border: isActive ? `1px solid ${BORDER_MED}` : '1px solid transparent',
                          }}
                        >
                          <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: dot }} />
                          <span className="text-[12px] font-medium" style={{ ...SG, color: isActive ? 'var(--ll-ink-strong)' : 'var(--ll-ink-muted)' }}>{t.label}</span>
                          {t.custom && (
                            <button className="ml-0.5 p-0.5 rounded hover:bg-slate-100" style={{ color: 'var(--ll-ink-subtle)' }} onClick={e => { e.stopPropagation(); deleteCase(t.id); }}>
                              <X size={9} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button onClick={addCustomCase} className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded hover:bg-slate-100 ml-1" style={{ color: 'var(--ll-ink-subtle)' }}>
                      <Plus size={11} />
                    </button>
                  </div>

                  {/* Case body */}
                  {activeTest && (
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5" style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--ll-ink-subtle)' }}>Input</p>
                        <textarea
                          value={activeTest.inputJson}
                          onChange={e => updateTestInput(activeTest.id, e.target.value)}
                          spellCheck={false}
                          rows={2}
                          className="w-full resize-none rounded-md px-2.5 py-1.5 text-[12px] outline-none"
                          style={{ background: 'var(--ll-bg-subtle)', border: `1px solid ${BORDER}`, color: 'var(--ll-ink)', ...MONO }}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--ll-ink-subtle)' }}>Expected</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px]" style={{ background: 'var(--ll-bg-subtle)', color: 'var(--ll-accent-ink)', ...MONO }}>
                          {activeTest.expectedJson || '—'}
                        </span>
                      </div>
                      {activeResult && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--ll-ink-subtle)' }}>Output</p>
                          {activeResult.error ? (
                            <pre className="text-[11px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', color: '#b91c1c', ...MONO }}>
                              {activeResult.error}
                            </pre>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px]" style={{
                              background: activeResult.passed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                              border: `1px solid ${activeResult.passed ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)'}`,
                              color: activeResult.passed ? 'rgba(52,211,153,0.9)' : 'rgba(248,113,113,0.9)',
                              ...MONO,
                            }}>
                              {activeResult.actual || '—'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer: Run only (no Submit — that's in the top bar) */}
            <div
              className="flex items-center justify-end px-5 shrink-0"
              style={{ height: 48, borderTop: `1px solid ${BORDER}`, background: BG_CHROME }}
            >
              <button
                onClick={execTests}
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
            </div>
          </div>
        )}
      </div>

      {showExitConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm mx-4 rounded-xl p-6"
            style={{ background: BG_PANEL, border: `1px solid ${BORDER_MED}` }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                <AlertTriangle size={16} style={{ color: '#b91c1c' }} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1" style={SG}>
                  Leave interview?
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#64748b', ...SG }}>
                  Your progress on both problems will be lost. This can&apos;t be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                style={{
                  background: 'var(--ll-bg-hover)',
                  border: `1px solid ${BORDER_MED}`,
                  color: 'var(--ll-ink)',
                  ...SG,
                }}
              >
                Keep going
              </button>
              <button
                onClick={handleExitHome}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(180deg, rgba(248,113,113,0.9) 0%, rgba(239,68,68,0.9) 100%)',
                  border: '1px solid rgba(248,113,113,0.5)',
                  ...SG,
                }}
              >
                Leave and lose progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resizer components ─────────────────────────────────────────────────────

function HorizontalResizer({ onDrag }: { onDrag: (dx: number) => void }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return;
    let prev = 0;
    const onMove = (e: MouseEvent) => { if (prev === 0) { prev = e.clientX; return; } onDrag(e.clientX - prev); prev = e.clientX; };
    const onUp = () => { setActive(false); document.body.style.userSelect = ''; document.body.style.cursor = ''; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [active, onDrag]);
  return (
    <div
      onMouseDown={() => { setActive(true); document.body.style.userSelect = 'none'; document.body.style.cursor = 'col-resize'; }}
      className="shrink-0 relative"
      style={{ width: 5, cursor: 'col-resize', background: active ? 'rgba(59,130,246,0.35)' : BORDER, transition: 'background 0.15s' }}
    />
  );
}

function VerticalResizer({ onDrag }: { onDrag: (dy: number) => void }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return;
    let prev = 0;
    const onMove = (e: MouseEvent) => { if (prev === 0) { prev = e.clientY; return; } onDrag(e.clientY - prev); prev = e.clientY; };
    const onUp = () => { setActive(false); document.body.style.userSelect = ''; document.body.style.cursor = ''; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [active, onDrag]);
  return (
    <div
      onMouseDown={() => { setActive(true); document.body.style.userSelect = 'none'; document.body.style.cursor = 'row-resize'; }}
      className="shrink-0"
      style={{ height: 5, cursor: 'row-resize', background: active ? 'rgba(59,130,246,0.35)' : BORDER, transition: 'background 0.15s' }}
    />
  );
}
