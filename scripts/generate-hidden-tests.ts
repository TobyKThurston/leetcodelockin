// ─── Generate hidden_tests via reference-solution oracle ─────────────────────
//
// For every problem that has BOTH (a) a candidate inputs file at
// `content/hidden-tests/<slug>.json` and (b) a reference solution at
// `content/solutions/<slug>.py`, this script:
//
//   1. Loads the candidate inputs:  [{ label, inputJson }, ...]
//   2. For each input, spawns python3 with the reference solution + a small
//      runner that calls `Solution().<methodName>(**json.loads(argv[1]))`
//      and prints `json.dumps(result)`. This is the EXACT pattern used by
//      scripts/verify-problems.ts, so the grader will accept what we emit
//      by construction.
//   3. If Python errors / times out / returns non-JSON, the candidate is
//      DROPPED (never emitted). This is the key safety: we never hand-author
//      an expectedJson — it is whatever the reference solution printed.
//   4. Also runs each problem's defaultTests through the oracle as a sanity
//      check. If a default test fails against its own reference solution,
//      the script halts — the repo is inconsistent for that problem and
//      authoring hidden tests on top would compound the problem.
//   5. Emits a single SQL migration file:
//        supabase/migrations/<timestamp>_seed_hidden_tests.sql
//      One `update public.problems set hidden_tests = '...'::jsonb where
//      slug = '...';` row per problem. Review before applying.
//
// Run with:
//
//     tsx scripts/generate-hidden-tests.ts
//     tsx scripts/generate-hidden-tests.ts --category=arrays-hashing
//     tsx scripts/generate-hidden-tests.ts --slug=two-sum
//     tsx scripts/generate-hidden-tests.ts --out=/tmp/hidden_tests.sql
//
// Requires `python3` on PATH. No network, no Supabase — purely local.

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { ALL_PROBLEMS, problemsByCategory } from '../content/problems';
import { toComparable, normalizeExpected } from '../lib/compare';
import type { ProblemContent } from '../lib/problem-types';

// ─── Arg parsing ─────────────────────────────────────────────────────────────

interface Args {
  category?: string;
  slug?: string;
  out?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (const a of argv) {
    const m = /^--(category|slug|out)=(.+)$/.exec(a);
    if (m) {
      if (m[1] === 'category') out.category = m[2];
      if (m[1] === 'slug') out.slug = m[2];
      if (m[1] === 'out') out.out = m[2];
    }
  }
  return out;
}

function selectProblems(args: Args): ProblemContent[] {
  let pool: ProblemContent[];
  if (args.category) {
    pool = problemsByCategory(args.category);
    if (pool.length === 0) {
      console.error(`No problems in category '${args.category}'.`);
      process.exit(1);
    }
  } else {
    pool = ALL_PROBLEMS;
  }
  if (args.slug) {
    pool = pool.filter(p => p.slug === args.slug);
    if (pool.length === 0) {
      console.error(`No problem with slug '${args.slug}'.`);
      process.exit(1);
    }
  }
  return pool;
}

// ─── Python harness (identical to verify-problems.ts) ────────────────────────

function buildHarness(solutionSrc: string, methodName: string): string {
  return `${solutionSrc}

import sys, json
_payload = json.loads(sys.argv[1])
_method = getattr(Solution(), ${JSON.stringify(methodName)})
_result = _method(**_payload)
sys.stdout.write(json.dumps(_result))
`;
}

interface PyOk { ok: true; stdout: string; }
interface PyErr { ok: false; err: string; }
type PyResult = PyOk | PyErr;

function runPython(harness: string, inputJson: string): PyResult {
  const res = spawnSync('python3', ['-c', harness, inputJson], {
    encoding: 'utf8',
    timeout: 3_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (res.error) return { ok: false, err: String(res.error) };
  if (res.status !== 0) {
    return { ok: false, err: (res.stderr || '').trim() || `exit ${res.status}` };
  }
  return { ok: true, stdout: res.stdout };
}

// ─── Candidate inputs file: content/hidden-tests/<slug>.json ─────────────────

interface CandidateInput {
  label: string;
  inputJson: string;
}

function loadCandidates(slug: string, hiddenDir: string): CandidateInput[] | null {
  const p = resolve(hiddenDir, `${slug}.json`);
  if (!existsSync(p)) return null;
  const raw = readFileSync(p, 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error(`  ✗ ${slug}: hidden-tests JSON is invalid — ${(e as Error).message}`);
    return [];
  }
  if (!Array.isArray(parsed)) {
    console.error(`  ✗ ${slug}: hidden-tests JSON must be an array`);
    return [];
  }
  const clean: CandidateInput[] = [];
  for (const c of parsed as unknown[]) {
    if (typeof c !== 'object' || c === null) continue;
    const rec = c as Record<string, unknown>;
    if (typeof rec.label !== 'string' || typeof rec.inputJson !== 'string') continue;
    clean.push({ label: rec.label, inputJson: rec.inputJson });
  }
  return clean;
}

// ─── Sanity check: default tests must pass against reference solution ────────

function sanityCheckDefaults(
  p: ProblemContent,
  harness: string,
): string | null {
  for (const t of p.defaultTests) {
    const res = runPython(harness, t.inputJson);
    if (!res.ok) {
      return `default case '${t.label}' errored: ${res.err.split('\n').slice(-2).join(' / ')}`;
    }
    let actualVal: unknown;
    try {
      actualVal = JSON.parse(res.stdout);
    } catch {
      return `default case '${t.label}' produced non-JSON stdout`;
    }
    const actual = toComparable(actualVal, p.resultCompare);
    const expected = normalizeExpected(t.expectedJson, p.resultCompare);
    if (actual !== expected) {
      return `default case '${t.label}' failed oracle: expected=${expected} actual=${actual}`;
    }
  }
  return null;
}

// ─── SQL emission ─────────────────────────────────────────────────────────────

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

// ─── Main ────────────────────────────────────────────────────────────────────

interface PerProblemReport {
  slug: string;
  authored: number;
  accepted: number;
  dropped: Array<{ label: string; reason: string }>;
  sanityError?: string;
  skippedReason?: 'no-solution' | 'no-candidates';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const problems = selectProblems(args);

  const solutionsDir = resolve(process.cwd(), 'content/solutions');
  const hiddenDir    = resolve(process.cwd(), 'content/hidden-tests');

  // Warn if any hidden-test JSON files reference a slug that doesn't exist.
  const knownSlugs = new Set(ALL_PROBLEMS.map(p => p.slug));
  if (existsSync(hiddenDir)) {
    for (const f of readdirSync(hiddenDir)) {
      if (!f.endsWith('.json')) continue;
      const slug = f.replace(/\.json$/, '');
      if (!knownSlugs.has(slug)) {
        console.warn(`⚠ content/hidden-tests/${f} references unknown slug — ignoring`);
      }
    }
  }

  const reports: PerProblemReport[] = [];
  const sqlRows: string[] = [];
  let halt = false;

  for (const p of problems) {
    const report: PerProblemReport = { slug: p.slug, authored: 0, accepted: 0, dropped: [] };

    const solPath = resolve(solutionsDir, `${p.slug}.py`);
    if (!existsSync(solPath)) {
      report.skippedReason = 'no-solution';
      reports.push(report);
      continue;
    }

    const candidates = loadCandidates(p.slug, hiddenDir);
    if (candidates === null) {
      report.skippedReason = 'no-candidates';
      reports.push(report);
      continue;
    }
    report.authored = candidates.length;

    const solSrc = readFileSync(solPath, 'utf8');
    const harness = buildHarness(solSrc, p.methodName);

    // 1. Sanity check defaults first.
    const sanity = sanityCheckDefaults(p, harness);
    if (sanity) {
      report.sanityError = sanity;
      reports.push(report);
      halt = true;
      continue;
    }

    // 2. Run each candidate input through the oracle.
    const accepted: { label: string; inputJson: string; expectedJson: string }[] = [];
    for (const c of candidates) {
      const res = runPython(harness, c.inputJson);
      if (!res.ok) {
        report.dropped.push({ label: c.label, reason: `python error: ${res.err.split('\n').slice(-1)[0]}` });
        continue;
      }
      if (res.stdout.length === 0) {
        report.dropped.push({ label: c.label, reason: 'empty stdout' });
        continue;
      }
      try {
        JSON.parse(res.stdout);
      } catch {
        report.dropped.push({ label: c.label, reason: 'stdout is not JSON' });
        continue;
      }
      accepted.push({
        label: c.label,
        inputJson: c.inputJson,
        expectedJson: res.stdout,
      });
    }
    report.accepted = accepted.length;

    if (accepted.length > 0) {
      const json = JSON.stringify(accepted);
      sqlRows.push(
        `update public.problems set hidden_tests = '${sqlEscape(json)}'::jsonb where slug = '${sqlEscape(p.slug)}';`
      );
    }
    reports.push(report);
  }

  // ─── Report ───────────────────────────────────────────────────────────────
  const withCandidates = reports.filter(r => r.skippedReason !== 'no-candidates');
  const noSolution     = reports.filter(r => r.skippedReason === 'no-solution');
  const noCandidates   = reports.filter(r => r.skippedReason === 'no-candidates');
  const sanityErrored  = reports.filter(r => r.sanityError);
  const droppedSome    = reports.filter(r => r.dropped.length > 0);

  console.log(`\nReviewed ${problems.length} problem(s).`);
  console.log(`  with reference solution + candidates: ${withCandidates.length - noSolution.length}`);
  console.log(`  no reference solution:                ${noSolution.length}`);
  console.log(`  no candidate inputs file:             ${noCandidates.length}`);

  if (noSolution.length > 0) {
    console.log(`\nSkipped (no reference solution):`);
    for (const r of noSolution) console.log(`  - ${r.slug}`);
  }

  if (sanityErrored.length > 0) {
    console.error(`\n✗ ${sanityErrored.length} problem(s) failed the default-test sanity check — halting:`);
    for (const r of sanityErrored) console.error(`  - ${r.slug}: ${r.sanityError}`);
  }

  if (droppedSome.length > 0) {
    console.log(`\nDropped candidate inputs (by problem):`);
    for (const r of droppedSome) {
      console.log(`  ${r.slug} (${r.accepted}/${r.authored} accepted)`);
      for (const d of r.dropped) console.log(`    - ${d.label}: ${d.reason}`);
    }
  }

  if (halt) {
    console.error(`\nHalting due to sanity failures. No SQL emitted.`);
    process.exit(1);
  }

  // ─── Write SQL ────────────────────────────────────────────────────────────
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '');
  const outPath = args.out ?? resolve(process.cwd(), `supabase/migrations/${stamp}_seed_hidden_tests.sql`);

  const header = [
    `-- Auto-generated by scripts/generate-hidden-tests.ts on ${new Date().toISOString()}`,
    `-- ${sqlRows.length} problem(s) populated.`,
    `-- Expected outputs were computed by running content/solutions/<slug>.py on`,
    `-- hand-authored candidate inputs in content/hidden-tests/<slug>.json. No`,
    `-- expected value in this file was hand-typed. Regenerate any time.`,
    `--`,
    `-- Safe to re-run: each UPDATE overwrites the row's hidden_tests column.`,
    ``,
  ].join('\n');

  writeFileSync(outPath, header + sqlRows.join('\n') + '\n', 'utf8');

  console.log(`\n✓ Wrote ${sqlRows.length} UPDATE row(s) to ${outPath}`);
  console.log(`  Review, then apply in Supabase SQL editor (or via supabase db push).`);
}

main();
