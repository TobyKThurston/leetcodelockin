'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronLeft, ChevronRight, ChevronUp,
  Plus, X, Play, RotateCcw, Send, Maximize2, Minimize2, Home, AlertTriangle,
} from 'lucide-react';
import type { OnMount, BeforeMount, Monaco } from '@monaco-editor/react';
import type { ProblemContent } from '@/lib/problem-types';
import { runTests, ensureWorker } from '@/lib/pyodide-runner';
import { INTERVIEW_DURATION_MS } from '@/lib/interview';
import InterviewTimer from './InterviewTimer';

// ─── Monaco (browser-only) ──────────────────────────────────────────────────

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
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
});

// ─── Design tokens ─────────────────────────────────────────────────��────────

const BG_BASE   = '#0b1220';
const BG_PANEL  = '#070c17';
const BG_EDITOR = '#0f1729';
const BORDER    = 'rgba(255,255,255,0.06)';
const BORDER_MED = 'rgba(255,255,255,0.1)';

const SG: React.CSSProperties   = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' };

const DIFF_STYLE: Record<string, React.CSSProperties> = {
  Easy:   { color: 'rgba(52,211,153,0.9)',  border: '1px solid rgba(52,211,153,0.2)',  background: 'rgba(16,185,129,0.07)' },
  Medium: { color: 'rgba(251,191,36,0.9)',  border: '1px solid rgba(251,191,36,0.2)',  background: 'rgba(245,158,11,0.07)' },
  Hard:   { color: 'rgba(248,113,113,0.9)', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(239,68,68,0.07)' },
};

// ─── Monaco theme ───────────────────────────────────────────────────────────

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
      'editor.background':               '#0f1729',
      'editor.foreground':               '#e5e7eb',
      'editor.lineHighlightBackground':  '#131b30',
      'editor.selectionBackground':      'rgba(59,130,246,0.25)',
      'editorLineNumber.foreground':     '#334155',
      'editorLineNumber.activeForeground':'#94a3b8',
      'editorCursor.foreground':         '#60a5fa',
      'editor.inactiveSelectionBackground': 'rgba(255,255,255,0.05)',
      'editorIndentGuide.background1':   '#1e293b',
      'editorWidget.background':         '#0f1729',
      'editorSuggestWidget.background':  '#0f1729',
      'editorSuggestWidget.border':      '#1e293b',
      'scrollbarSlider.background':      'rgba(255,255,255,0.03)',
      'scrollbarSlider.hoverBackground': 'rgba(255,255,255,0.06)',
      'scrollbarSlider.activeBackground':'rgba(255,255,255,0.08)',
    },
  });
};

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'Geist Mono', 'Cascadia Code', 'Fira Code', ui-monospace, monospace",
  fontLigatures: true,
  lineHeight: 20,
  minimap:              { enabled: false },
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
  p:      (props: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props} className="text-[13.5px] leading-[1.75] text-zinc-400 mb-3 last:mb-0" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong {...props} className="font-semibold text-slate-100" />,
  em:     (props: React.HTMLAttributes<HTMLElement>) => <em {...props} className="not-italic text-slate-200" />,
  code:   (props: React.HTMLAttributes<HTMLElement>) => <code {...props} className="px-1.5 py-0.5 rounded text-[12.5px]" style={{ background: 'rgba(255,255,255,0.07)', color: '#c9d1d9', ...MONO }} />,
  ul:     (props: React.HTMLAttributes<HTMLUListElement>) => <ul {...props} className="list-disc list-outside pl-5 mb-3 space-y-1 text-[13.5px] leading-[1.65] text-zinc-400" />,
  ol:     (props: React.OlHTMLAttributes<HTMLOListElement>) => <ol {...props} className="list-decimal list-outside pl-5 mb-3 space-y-1 text-[13.5px] leading-[1.65] text-zinc-400" />,
  li:     (props: React.LiHTMLAttributes<HTMLLIElement>) => <li {...props} className="text-[13.5px] leading-[1.6] text-zinc-400" />,
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
    onSubmit({
      problem1Code: codes[0],
      problem2Code: codes[1],
      problem1Results: r1.length > 0 ? { passed: r1.filter(r => r.passed).length, total: r1.length } : null,
      problem2Results: r2.length > 0 ? { passed: r2.filter(r => r.passed).length, total: r2.length } : null,
      timeUsedMs: now - startedAt,
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
    for (const r of results) {
      if (!r.error) continue;
      const m = r.error.match(/line (\d+)/i);
      const line = m ? parseInt(m[1], 10) : 0;
      if (line < 1 || seen.has(line)) continue;
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
    <div className="flex flex-col" style={{ height: '100vh', background: BG_BASE, overflow: 'hidden' }}>
      {/* Timer bar */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{ height: 48, background: BG_PANEL, borderBottom: `1px solid ${BORDER}` }}
      >
        {/* Left: Home + Problem tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:brightness-125"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${BORDER_MED}`,
              color: '#8ea0b7',
            }}
            title="Return home"
            aria-label="Return home"
          >
            <Home size={14} />
          </button>
          <div className="w-px h-5" style={{ background: BORDER }} />
          {problems.map((p, i) => {
            const active = i === currentIdx;
            return (
              <button
                key={i}
                onClick={() => switchProblem(i as 0 | 1)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                  color: active ? '#c9d1d9' : '#3f4f63',
                  ...SG,
                }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold" style={{
                  background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#93c5fd' : '#3f4f63',
                }}>
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

        {/* Timer */}
        <InterviewTimer deadlineMs={deadlineMs} />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
            border: '1px solid rgba(147,197,253,0.55)',
            boxShadow: '0 8px 24px -8px rgba(59,130,246,0.5)',
            ...SG,
          }}
        >
          <Send size={12} />
          Submit Interview
        </button>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: problem description */}
        {fullscreen !== 'editor' && (
          <div
            className={fullscreen === 'left' ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col shrink-0'}
            style={fullscreen === 'left' ? { background: BG_PANEL } : { width: leftWidth, minWidth: 280, background: BG_PANEL }}
          >
            {/* Tab bar — Question only (no hints/solution/tutor) */}
            <div
              className="flex items-center justify-between shrink-0 px-4"
              style={{ height: 42, borderBottom: `1px solid ${BORDER}`, background: BG_PANEL }}
            >
              <span className="text-[12.5px] font-medium" style={{ color: '#c9d1d9', ...SG }}>
                Question
              </span>
              <button
                onClick={() => setFullscreen(fs => fs === 'left' ? null : 'left')}
                className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-300 transition-colors"
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
                <h1 className="text-[19px] font-semibold text-white mb-3" style={{ ...SG, letterSpacing: '-0.02em' }}>
                  {problem.title}{' '}
                  <span className="text-zinc-600 font-normal text-[14px]">(LC #{problem.lcNumber})</span>
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
                    <p className="text-[12px] font-semibold text-zinc-400 mb-2 uppercase tracking-[0.08em]" style={SG}>
                      Example {i + 1}
                    </p>
                    <div
                      className="rounded-lg px-4 py-3 space-y-1.5"
                      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}` }}
                    >
                      <p className="text-[12.5px]" style={MONO}>
                        <span style={{ color: 'rgba(96,165,250,0.7)' }}>Input: </span>
                        <span style={{ color: '#c9d1d9' }}>{ex.input}</span>
                      </p>
                      <p className="text-[12.5px]" style={MONO}>
                        <span style={{ color: 'rgba(96,165,250,0.7)' }}>Output: </span>
                        <span style={{ color: '#c9d1d9' }}>{ex.output}</span>
                      </p>
                      {ex.explanation && <p className="text-[11.5px] text-zinc-600 pt-0.5">{ex.explanation}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[10px] font-semibold text-zinc-600 tracking-[0.12em] uppercase mb-2.5" style={SG}>Constraints</p>
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
              style={{ height: 42, borderBottom: `1px solid ${BORDER}`, background: BG_PANEL }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-zinc-400" style={SG}>Python</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-700 select-none">
                  <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, ...MONO }}>⌘</kbd>
                  <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, ...MONO }}>↵</kbd>
                  <span className="ml-0.5" style={SG}>Run</span>
                </span>
                <button
                  onClick={() => setCode(problem.starterCode.python)}
                  className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-700 hover:text-zinc-400 transition-colors"
                  title="Reset to starter code"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setFullscreen(fs => fs === 'editor' ? null : 'editor')}
                  className="p-1.5 rounded hover:bg-white/[0.05] text-zinc-700 hover:text-zinc-400 transition-colors"
                >
                  {fullscreen === 'editor' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
            </div>

            {/* Monaco editor */}
            <div className="flex-1 overflow-hidden" style={{ background: BG_EDITOR }}>
              <MonacoEditor
                height="100%"
                language="python"
                value={code}
                theme="lc-dark"
                options={EDITOR_OPTIONS}
                beforeMount={defineTheme}
                onMount={handleMount}
                onChange={v => setCode(v ?? '')}
              />
            </div>

            {/* Test panel */}
            <div className="shrink-0 flex flex-col" style={{ background: BG_PANEL }}>
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
                  style={{ color: panelOpen ? '#a8b3c7' : '#3f4f63', ...SG }}
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
                      const dot = !r ? 'rgba(255,255,255,0.12)' : r.passed ? 'rgba(52,211,153,0.75)' : 'rgba(248,113,113,0.75)';
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
                            background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                            border: isActive ? '1px solid rgba(59,130,246,0.18)' : '1px solid transparent',
                          }}
                        >
                          <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: dot }} />
                          <span className="text-[12px] font-medium" style={{ ...SG, color: isActive ? '#c9d1d9' : '#3a4a5c' }}>{t.label}</span>
                          {t.custom && (
                            <button className="ml-0.5 p-0.5 rounded hover:bg-white/10" style={{ color: '#3a4a5c' }} onClick={e => { e.stopPropagation(); deleteCase(t.id); }}>
                              <X size={9} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button onClick={addCustomCase} className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded hover:bg-white/[0.04] ml-1" style={{ color: '#3a4a5c' }}>
                      <Plus size={11} />
                    </button>
                  </div>

                  {/* Case body */}
                  {activeTest && (
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5" style={{ scrollbarWidth: 'thin', scrollbarColor: `${BORDER} transparent` }}>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>Input</p>
                        <textarea
                          value={activeTest.inputJson}
                          onChange={e => updateTestInput(activeTest.id, e.target.value)}
                          spellCheck={false}
                          rows={2}
                          className="w-full resize-none rounded-md px-2.5 py-1.5 text-[12px] outline-none"
                          style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, color: '#c9d1d9', ...MONO }}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>Expected</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px]" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(96,165,250,0.7)', ...MONO }}>
                          {activeTest.expectedJson || '—'}
                        </span>
                      </div>
                      {activeResult && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#3a4a5c' }}>Output</p>
                          {activeResult.error ? (
                            <pre className="text-[11px] leading-relaxed rounded-md px-2.5 py-2 whitespace-pre-wrap" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(248,113,113,0.9)', ...MONO }}>
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
              style={{ height: 48, borderTop: `1px solid ${BORDER}`, background: BG_PANEL }}
            >
              <button
                onClick={execTests}
                disabled={running}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: running ? '#3f4f63' : '#a8b3c7', border: `1px solid ${BORDER_MED}`, background: 'rgba(255,255,255,0.03)' }}
              >
                <Play size={11} />
                {running ? 'Running…' : 'Run Tests'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showExitConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
                <AlertTriangle size={16} style={{ color: 'rgba(248,113,113,0.9)' }} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white mb-1" style={SG}>
                  Leave interview?
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#8ea0b7', ...SG }}>
                  Your progress on both problems will be lost. This can&apos;t be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${BORDER_MED}`,
                  color: '#a8b3c7',
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
