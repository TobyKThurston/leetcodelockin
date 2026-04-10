import { NextRequest, NextResponse } from 'next/server';

interface TestCaseInput {
  id: string;
  inputJson: string;
  expectedJson: string;
}

interface CaseResult {
  caseId: string;
  passed: boolean;
  actual: string;
  error?: string;
}

const HARNESS = `
# ---- runner ----
import json as _j, sys as _s
_ts = _j.loads(_s.stdin.read())
_rs = []
for _t in _ts:
    try:
        _r = Solution().twoSum(_t["nums"], _t["target"])
        _rs.append({"ok": True, "val": _r})
    except Exception as _e:
        _rs.append({"ok": False, "err": str(_e)})
print(_j.dumps(_rs))
`;

function normalizeResult(val: unknown): string {
  if (!Array.isArray(val)) return JSON.stringify(val);
  return JSON.stringify([...val].sort((a, b) => a - b));
}

function normalizeExpected(expectedJson: string): string {
  try {
    const parsed = JSON.parse(expectedJson);
    return normalizeResult(parsed);
  } catch {
    return expectedJson;
  }
}

export async function POST(req: NextRequest) {
  let body: { code: string; tests: TestCaseInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { code, tests } = body;
  if (!code || !Array.isArray(tests) || tests.length === 0) {
    return NextResponse.json({ error: 'Missing code or tests' }, { status: 400 });
  }

  // Validate all inputJson fields parse correctly
  const parsedInputs: unknown[] = [];
  for (const t of tests) {
    try {
      parsedInputs.push(JSON.parse(t.inputJson));
    } catch {
      return NextResponse.json(
        { error: `Invalid JSON in test case ${t.id}: ${t.inputJson}` },
        { status: 400 }
      );
    }
  }

  const stdin = JSON.stringify(parsedInputs);
  const fullCode = code + '\n' + HARNESS;

  let pistonRes: Response;
  try {
    pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        version: '3.10.0',
        files: [{ name: 'solution.py', content: fullCode }],
        stdin,
        run_timeout: 10000,
      }),
    });
  } catch {
    return NextResponse.json({ error: 'Code execution service unreachable' }, { status: 502 });
  }

  if (!pistonRes.ok) {
    return NextResponse.json({ error: 'Code execution service error' }, { status: 502 });
  }

  const pistonData = await pistonRes.json();
  const stderr: string = pistonData?.run?.stderr ?? '';
  const stdout: string = pistonData?.run?.stdout ?? '';

  if (stderr && !stdout) {
    // Syntax/runtime error before any output
    const shortErr = stderr.split('\n').filter(Boolean).slice(-3).join('\n');
    const results: CaseResult[] = tests.map(t => ({
      caseId: t.id,
      passed: false,
      actual: '',
      error: shortErr,
    }));
    return NextResponse.json({ results });
  }

  let rawResults: Array<{ ok: boolean; val?: unknown; err?: string }>;
  try {
    rawResults = JSON.parse(stdout.trim());
  } catch {
    // stdout isn't valid JSON — likely a print in user code or unexpected output
    const errorMsg = stderr
      ? stderr.split('\n').filter(Boolean).slice(-3).join('\n')
      : `Unexpected output: ${stdout.slice(0, 200)}`;
    const results: CaseResult[] = tests.map(t => ({
      caseId: t.id,
      passed: false,
      actual: '',
      error: errorMsg,
    }));
    return NextResponse.json({ results });
  }

  const results: CaseResult[] = tests.map((t, i) => {
    const raw = rawResults[i];
    if (!raw) {
      return { caseId: t.id, passed: false, actual: '', error: 'No output for this case' };
    }
    if (!raw.ok) {
      return { caseId: t.id, passed: false, actual: '', error: raw.err ?? 'Runtime error' };
    }
    const actual = normalizeResult(raw.val);
    const expected = normalizeExpected(t.expectedJson);
    return {
      caseId: t.id,
      passed: actual === expected,
      actual: JSON.stringify(raw.val),
    };
  });

  return NextResponse.json({ results });
}
