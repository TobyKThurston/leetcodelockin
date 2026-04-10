// ─── Verify authored problems against reference solutions ───────────────────
//
// For every problem in `content/problems` (or a single category if
// `--category=<id>` is passed), this script:
//
//   1. Loads the canonical Python solution from `content/solutions/<slug>.py`.
//   2. For each defaultTest, spawns `python3` with a small harness that
//      instantiates Solution, calls the method with the parsed inputJson, and
//      prints `json.dumps(result)` to stdout.
//   3. Normalises both the actual stdout and the authored expectedJson via the
//      same `normalizeExpected` / `toComparable` helpers used by the runtime
//      grader in `lib/compare.ts`, so the verifier accepts exactly what the
//      production grader would.
//   4. Fails loudly with a per-case error and exits non-zero if anything
//      mismatches. No mismatches → exits 0.
//
// Run with:
//
//     npm run db:verify:problems
//     npm run db:verify:problems -- --category=arrays-hashing
//     npm run db:verify:problems -- --slug=two-sum
//
// Requires `python3` on PATH. No network, no Supabase — purely local.

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { ALL_PROBLEMS, problemsByCategory } from '../content/problems';
import { toComparable, normalizeExpected } from '../lib/compare';
import type { ProblemContent } from '../lib/problem-types';

// ─── Arg parsing ─────────────────────────────────────────────────────────────

interface Args {
  category?: string;
  slug?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (const a of argv) {
    const m = /^--(category|slug)=(.+)$/.exec(a);
    if (m) {
      if (m[1] === 'category') out.category = m[2];
      if (m[1] === 'slug') out.slug = m[2];
    }
  }
  return out;
}

// ─── Problem selection ───────────────────────────────────────────────────────

function selectProblems(args: Args): ProblemContent[] {
  let pool: ProblemContent[];
  if (args.category) {
    pool = problemsByCategory(args.category);
    if (pool.length === 0) {
      console.error(`No authored problems in category '${args.category}'.`);
      process.exit(1);
    }
  } else {
    pool = ALL_PROBLEMS;
  }
  if (args.slug) {
    pool = pool.filter(p => p.slug === args.slug);
    if (pool.length === 0) {
      console.error(`No authored problem with slug '${args.slug}'.`);
      process.exit(1);
    }
  }
  return pool;
}

// ─── Python harness ──────────────────────────────────────────────────────────
//
// We inject the reference solution source, then a tiny runner that reads the
// test input from argv[1] (a single JSON blob keyed by argKeys), invokes
// `Solution().<methodName>(**kwargs)`, and prints `json.dumps(result)`.
//
// argKeys is preserved as an ordered list but we call with **kwargs so
// argument order in the Python method signature doesn't need to match.

function buildHarness(solutionSrc: string, methodName: string): string {
  return `${solutionSrc}

import sys, json
_payload = json.loads(sys.argv[1])
_method = getattr(Solution(), ${JSON.stringify(methodName)})
_result = _method(**_payload)
sys.stdout.write(json.dumps(_result))
`;
}

function runPython(harness: string, inputJson: string): { ok: true; stdout: string } | { ok: false; err: string } {
  const res = spawnSync('python3', ['-c', harness, inputJson], {
    encoding: 'utf8',
    timeout: 15_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (res.error) return { ok: false, err: String(res.error) };
  if (res.status !== 0) {
    return { ok: false, err: (res.stderr || '').trim() || `exit ${res.status}` };
  }
  return { ok: true, stdout: res.stdout };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv.slice(2));
  const problems = selectProblems(args);

  const solutionsDir = resolve(process.cwd(), 'content/solutions');

  let totalCases = 0;
  let failures: string[] = [];
  let missingSolutions: string[] = [];

  for (const p of problems) {
    const solPath = resolve(solutionsDir, `${p.slug}.py`);
    if (!existsSync(solPath)) {
      missingSolutions.push(p.slug);
      continue;
    }
    const solSrc = readFileSync(solPath, 'utf8');
    const harness = buildHarness(solSrc, p.methodName);

    for (const t of p.defaultTests) {
      totalCases += 1;
      const res = runPython(harness, t.inputJson);
      if (!res.ok) {
        failures.push(
          `  ✗ ${p.slug} [${t.label}] — python error:\n    ${res.err.split('\n').slice(-4).join('\n    ')}`,
        );
        continue;
      }
      let actualVal: unknown;
      try {
        actualVal = JSON.parse(res.stdout);
      } catch {
        failures.push(
          `  ✗ ${p.slug} [${t.label}] — solution stdout not JSON: ${res.stdout.slice(0, 200)}`,
        );
        continue;
      }
      const actual = toComparable(actualVal, p.resultCompare);
      const expected = normalizeExpected(t.expectedJson, p.resultCompare);
      if (actual !== expected) {
        failures.push(
          `  ✗ ${p.slug} [${t.label}]\n    expected: ${expected}\n    actual:   ${actual}`,
        );
      }
    }
  }

  console.log(`Verified ${problems.length} problem(s), ${totalCases} test case(s).`);

  if (missingSolutions.length > 0) {
    console.error(`\nMissing reference solutions for ${missingSolutions.length} slug(s):`);
    for (const slug of missingSolutions) console.error(`  ✗ content/solutions/${slug}.py`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} failing case(s):`);
    for (const f of failures) console.error(f);
  }

  if (missingSolutions.length > 0 || failures.length > 0) {
    process.exit(1);
  }

  console.log('All test cases match their reference solutions ✓');
}

main();
