// ─── Problem content types ────────────────────────────────────────────────────
//
// Shared shape used by ProblemPage, the dynamic /solve/[slug] route, and the
// client-side Pyodide runner harness. Mirrors the `problems` table in Supabase
// but expressed in camelCase for TS ergonomics.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ResultCompare = 'exact' | 'sorted_array' | 'set';

export interface SolutionApproach {
  approach: string;
  intuition: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemTest {
  label: string;
  inputJson: string;
  expectedJson: string;
}

export interface ProblemContent {
  slug: string;
  lcNumber: number;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  tags: string[];
  descriptionMd: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: { python: string };
  methodName: string;
  argKeys: string[];
  defaultTests: ProblemTest[];
  resultCompare: ResultCompare;
  solutions?: SolutionApproach[];
}

// Raw snake_case row shape returned by Supabase.
// Server-only fields (like `hidden_tests`) must never be copied into
// ProblemContent by `dbRowToProblemContent` — the ProblemContent object is
// serialized into the SSR payload for /solve/[slug] and ships to the client.
export interface ProblemRow {
  slug: string;
  lc_number: number;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  tags: string[];
  description_md: string;
  examples: ProblemExample[];
  constraints: string[];
  starter_code: { python: string };
  method_name: string;
  arg_keys: string[];
  default_tests: ProblemTest[];
  hidden_tests?: ProblemTest[];
  result_compare: ResultCompare;
  is_published: boolean;
}

export function dbRowToProblemContent(row: ProblemRow): ProblemContent {
  return {
    slug:          row.slug,
    lcNumber:      row.lc_number,
    title:         row.title,
    difficulty:    row.difficulty,
    pattern:       row.pattern,
    tags:          row.tags ?? [],
    descriptionMd: row.description_md,
    examples:      row.examples ?? [],
    constraints:   row.constraints ?? [],
    starterCode:   row.starter_code,
    methodName:    row.method_name,
    argKeys:       row.arg_keys ?? [],
    defaultTests:  row.default_tests ?? [],
    resultCompare: row.result_compare,
  };
}
