// ─── Seed authored problems into Supabase ────────────────────────────────────
//
// Reads the hand-authored `ALL_PROBLEMS` array from `content/problems` (a
// barrel that concatenates every per-category file) and upserts each row into
// the `problems` table using the service-role client.
//
// Idempotent — re-running is safe and will overwrite rows with whatever is in
// the source files. Run with:
//
//     npm run db:seed:problems
//
// (which resolves to `dotenv -e .env.local -- tsx scripts/seed-problems.ts`)

import { createClient } from '@supabase/supabase-js';
import { ALL_PROBLEMS } from '../content/problems';
import type { ProblemContent } from '../lib/problem-types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Did you run with `dotenv -e .env.local --` or set them in the shell?');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function toRow(p: ProblemContent) {
  return {
    slug:           p.slug,
    lc_number:      p.lcNumber,
    title:          p.title,
    difficulty:     p.difficulty,
    pattern:        p.pattern,
    tags:           p.tags,
    description_md: p.descriptionMd,
    examples:       p.examples,
    constraints:    p.constraints,
    starter_code:   p.starterCode,
    method_name:    p.methodName,
    arg_keys:       p.argKeys,
    default_tests:  p.defaultTests,
    result_compare: p.resultCompare,
    is_published:   true,
    updated_at:     new Date().toISOString(),
  };
}

async function main() {
  console.log(`Seeding ${ALL_PROBLEMS.length} problems…`);

  const rows = ALL_PROBLEMS.map(toRow);
  const { data, error } = await supabase
    .from('problems')
    .upsert(rows, { onConflict: 'slug' })
    .select('slug');

  if (error) {
    console.error('Upsert failed:', error);
    process.exit(1);
  }

  console.log(`Upserted ${data?.length ?? 0} rows:`);
  for (const row of data ?? []) {
    console.log(`  ✓ ${(row as { slug: string }).slug}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
