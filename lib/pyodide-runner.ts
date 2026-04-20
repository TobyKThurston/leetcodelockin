// Client-side Python runner. Wraps `/public/pyodide-worker.js` and exposes a
// single `runTests()` function with the exact same response shape the old
// `/api/run` route returned, so `ProblemPage` doesn't need to care where
// execution happens.
//
// Design notes:
//  - Singleton Worker, lazily created on first call.
//  - Runs are serialized via a promise chain so a rapid Run/Submit double-tap
//    can't cross wires. The Python runtime is single-threaded anyway.
//  - 10s timeout enforced by `worker.terminate()` — the runaway worker is
//    discarded and the next call rebuilds a fresh one.

import type { ResultCompare } from './problem-types';
import { toComparable, normalizeExpected } from './compare';

const RUN_TIMEOUT_MS = 10_000;

export interface RunnerTest {
  id: string;
  inputJson: string;
  expectedJson: string;
}

export interface RunnerResult {
  caseId: string;
  passed: boolean;
  actual: string;
  error?: string;
  errorLine?: number;
  stdout?: string;
}

interface RunArgs {
  code: string;
  tests: RunnerTest[];
  methodName: string;
  argKeys: string[];
  resultCompare: ResultCompare;
}

interface RawCaseResult {
  ok: boolean;
  val?: unknown;
  err?: string;
  line?: number;
  stdout?: string;
}

// ─── Worker lifecycle ─────────────────────────────────────────────────────────

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;

function resetWorker() {
  if (worker) {
    try { worker.terminate(); } catch { /* ignore */ }
  }
  worker = null;
  readyPromise = null;
}

/** Ensure the worker exists and Pyodide has finished loading. Idempotent. */
export function ensureWorker(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('ensureWorker called outside the browser'));
  }
  if (readyPromise) return readyPromise;

  worker = new Worker('/pyodide-worker.js');
  const w = worker;

  readyPromise = new Promise<void>((resolve, reject) => {
    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg?.type === 'ready') {
        w.removeEventListener('message', onMessage);
        resolve();
      } else if (msg?.type === 'error') {
        w.removeEventListener('message', onMessage);
        reject(new Error(msg.message ?? 'Runtime init failed'));
      }
    };
    w.addEventListener('message', onMessage);
    w.postMessage({ type: 'init' });
  });

  // If init fails, discard so the next call rebuilds from scratch.
  readyPromise.catch(() => { resetWorker(); });
  return readyPromise;
}

// ─── Run serialization ────────────────────────────────────────────────────────

let runQueue: Promise<unknown> = Promise.resolve();

function failAll(tests: RunnerTest[], message: string): RunnerResult[] {
  return tests.map(t => ({ caseId: t.id, passed: false, actual: '', error: message }));
}

/** Run the student's `code` against `tests` in the sandboxed Python worker. */
export function runTests(args: RunArgs): Promise<{ results: RunnerResult[] }> {
  const next = runQueue
    .catch(() => { /* swallow — one failed run shouldn't block the next */ })
    .then(() => runTestsInternal(args));
  runQueue = next.catch(() => { /* ignore for queue chaining */ });
  return next;
}

async function runTestsInternal({
  code, tests, methodName, argKeys, resultCompare,
}: RunArgs): Promise<{ results: RunnerResult[] }> {
  // Same input-JSON guard the old server route used — reject early with a
  // clear, per-invocation error instead of letting a KeyError bubble up from
  // inside the harness.
  const parsedInputs: unknown[] = [];
  for (const t of tests) {
    try {
      parsedInputs.push(JSON.parse(t.inputJson));
    } catch {
      return { results: failAll(tests, `Invalid JSON in test case: ${t.inputJson}`) };
    }
  }

  try {
    await ensureWorker();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Runtime init failed';
    return { results: failAll(tests, msg) };
  }
  const w = worker;
  if (!w) {
    return { results: failAll(tests, 'Runtime unavailable') };
  }

  const testsJson = JSON.stringify(parsedInputs);

  type RunReply = { type: 'result'; resultJson: string } | { type: 'error'; message: string };
  const runPromise = new Promise<RunReply>((resolve) => {
    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg?.type === 'result' || msg?.type === 'error') {
        w.removeEventListener('message', onMessage);
        resolve(msg);
      }
    };
    w.addEventListener('message', onMessage);
    w.postMessage({ type: 'run', code, testsJson, methodName, argKeys });
  });

  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<'timeout'>((resolve) => {
    timeoutHandle = setTimeout(() => resolve('timeout'), RUN_TIMEOUT_MS);
  });

  const raced = await Promise.race<RunReply | 'timeout'>([runPromise, timeoutPromise]);
  if (timeoutHandle) clearTimeout(timeoutHandle);

  if (raced === 'timeout') {
    // Kill the runaway worker — the next call will rebuild a fresh one.
    resetWorker();
    return { results: failAll(tests, `Time limit exceeded (${RUN_TIMEOUT_MS / 1000}s)`) };
  }

  if (raced.type === 'error') {
    // Student code failed before the harness could run (SyntaxError, etc.).
    // Attach the full message to every case so the UI shows it.
    return { results: failAll(tests, raced.message) };
  }

  let rawResults: RawCaseResult[];
  try {
    rawResults = JSON.parse(raced.resultJson);
  } catch {
    return { results: failAll(tests, 'Unexpected runner output') };
  }

  const results: RunnerResult[] = tests.map((t, i) => {
    const raw = rawResults[i];
    if (!raw) {
      return { caseId: t.id, passed: false, actual: '', error: 'No output for this case' };
    }
    const stdout = raw.stdout || undefined;
    if (!raw.ok) {
      return {
        caseId: t.id,
        passed: false,
        actual: '',
        error: raw.err ?? 'Runtime error',
        errorLine: raw.line && raw.line > 0 ? raw.line : undefined,
        stdout,
      };
    }
    const actual   = toComparable(raw.val, resultCompare);
    const expected = normalizeExpected(t.expectedJson, resultCompare);
    return {
      caseId: t.id,
      passed: actual === expected,
      actual: JSON.stringify(raw.val),
      stdout,
    };
  });
  return { results };
}
