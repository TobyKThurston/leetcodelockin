// ─── Server-only: spaced repetition review card generation ──────────────────
//
// Called after an accepted submission (for Pro users) to generate flashcard
// content via AI. Also exports helpers for the /api/review/* routes.

import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabase } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/subscription';
import { recordAiUsage } from '@/lib/subscription';
import { INJECTION_GUARD, fenceUserContent } from '@/lib/prompt-safety';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReviewCard {
  id: string;
  problemSlug: string;
  problemTitle: string;
  difficulty: string;
  pattern: string;
  cardType: 'key_lines' | 'approach' | 'complexity';
  content: KeyLinesContent | ApproachContent | ComplexityContent;
  codeSnapshot: string;
  reviewCount: number;
  intervalDays: number;
  nextReview: string;
}

// Shared across all three cards for the same problem — renders on the front of
// every card so the student has concrete context before trying to recall.
export interface ProblemContext {
  problem_recap: string;
}

export interface KeyLinesContent extends ProblemContext {
  blank_indices: number[];
  original_lines: string[];
  line_hints: string[];
}

export interface ApproachContent extends ProblemContext {
  pattern: string;
  key_insight: string;
  steps: string[];
  gotcha: string;
}

export interface ComplexityContent extends ProblemContext {
  time: string;
  space: string;
  time_reasoning: string;
  space_reasoning: string;
}

// ─── AI schema ───────────────────────────────────────────────────────────────

const reviewAiSchema = z.object({
  problem_recap: z
    .string()
    .describe(
      'A 1-2 sentence recap of what the problem asks, written so a student who saw the problem weeks ago can recognize it. Include the core input/output in plain language and a tiny concrete example if it fits (e.g. "nums=[2,7,11,15], target=9 → [0,1]"). Do NOT restate the title; give the substance.',
    ),
  key_lines: z.object({
    blank_indices: z
      .array(z.number())
      .min(1)
      .max(4)
      .describe('0-based line indices of the 1-4 most critical logic lines in the solution'),
    line_hints: z
      .array(z.string())
      .describe(
        'One short hint per blanked line, in the same order as blank_indices. Each hint should nudge toward the line without giving it away — e.g. "update the running max" or "shrink the window from the left". Keep each hint under 60 characters.',
      ),
  }),
  approach: z.object({
    pattern: z.string().describe('Algorithmic pattern name, e.g. "Sliding Window"'),
    key_insight: z
      .string()
      .describe(
        'One sentence: the single observation that makes this pattern work for this problem. This is what you want to remember weeks from now.',
      ),
    steps: z
      .array(z.string())
      .min(2)
      .max(5)
      .describe(
        '2-5 short bullet steps describing the mechanics of the approach, in order. Each step is one sentence. Concrete, not abstract.',
      ),
    gotcha: z
      .string()
      .describe(
        'One sentence: the most common edge case, off-by-one, or subtle trap in this solution. If genuinely no gotcha, describe the termination/base case instead.',
      ),
  }),
  complexity: z.object({
    time: z.string().describe('Big-O time complexity, e.g. "O(n)"'),
    space: z.string().describe('Big-O space complexity, e.g. "O(1)"'),
    time_reasoning: z
      .string()
      .describe(
        'One sentence justifying the time complexity — name the dominant operation and why it runs that many times.',
      ),
    space_reasoning: z
      .string()
      .describe(
        'One sentence justifying the space complexity — what data structure or call stack dominates, and how it scales with input.',
      ),
  }),
});

const SYSTEM_PROMPT = `You are an expert algorithm instructor creating spaced repetition flashcards from a student's accepted solution.

Cards are reviewed weeks later, when the student only remembers the problem title vaguely. Your content is what jogs their memory — be concrete, specific, and thorough enough to be useful, but phrased as prompts to recall rather than tutorials.

Given the problem description and the student's accepted Python code, generate:

1. PROBLEM RECAP: A 1-2 sentence description of what the problem asks, in plain language, with a tiny concrete example if it fits. This appears on the FRONT of every card so the student knows which problem this is before recalling anything. Do not restate the title — describe the substance.

2. KEY LINES: Identify the 1-4 most critical lines of logic — the lines that represent the core algorithmic insight. Return their 0-based line indices (counting from the first line of the code). Skip blank lines, imports, and boilerplate. For each blanked line, give a short hint (under 60 chars) that nudges toward it without spoiling it — e.g. "update the running max", "shrink the window from the left". Hints should be in the same order as blank_indices.

3. APPROACH: Name the pattern, then give:
   - key_insight: the single observation that makes this work (the "aha")
   - steps: 2-5 concrete bullet steps describing the mechanics in order
   - gotcha: the most common trap, edge case, or off-by-one to watch for

4. COMPLEXITY: Big-O time and space, each with its own one-sentence justification that names the dominant operation or data structure.

Be precise with line indices — count carefully from line 0. Favor concrete language over jargon.`;

// ─── Core generation ─────────────────────────────────────────────────────────

export async function generateReviewCards(
  userId: string,
  slug: string,
  code: string,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  // Only Pro users get review cards
  const { isPro } = await getUserSubscription(userId);
  if (!isPro) return;

  // Check if all 3 cards already exist (idempotent)
  const { count } = await sb
    .from('review_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('problem_slug', slug);

  if ((count ?? 0) >= 3) return;

  // Fetch problem details for the AI prompt
  const { data: problem } = await sb
    .from('problems')
    .select('title, description_md, pattern')
    .eq('slug', slug)
    .single();

  if (!problem) return;

  const { output } = await generateText({
    model: openai('gpt-4o'),
    system: `${SYSTEM_PROMPT}\n\n${INJECTION_GUARD}`,
    prompt: `Problem: ${problem.title}\n\n${fenceUserContent('description', problem.description_md)}\n\nStudent's accepted solution:\n${fenceUserContent('code', code)}`,
    output: Output.object({ schema: reviewAiSchema }),
  });

  if (!output) return;

  await recordAiUsage(userId, 'review-generate');

  const codeLines = code.split('\n');
  const recap = output.problem_recap;

  // Build content for key_lines card — filter line indices and keep hints aligned
  const rawHints = output.key_lines.line_hints ?? [];
  const kept: Array<{ idx: number; hint: string }> = [];
  output.key_lines.blank_indices.forEach((idx, i) => {
    if (idx >= 0 && idx < codeLines.length) {
      kept.push({ idx, hint: rawHints[i] ?? '' });
    }
  });
  const keyLinesContent: KeyLinesContent = {
    problem_recap: recap,
    blank_indices: kept.map(k => k.idx),
    original_lines: kept.map(k => codeLines[k.idx]),
    line_hints: kept.map(k => k.hint),
  };

  const approachContent: ApproachContent = {
    problem_recap: recap,
    ...output.approach,
  };

  const complexityContent: ComplexityContent = {
    problem_recap: recap,
    ...output.complexity,
  };

  const cardRows = [
    { card_type: 'key_lines', content: keyLinesContent },
    { card_type: 'approach', content: approachContent },
    { card_type: 'complexity', content: complexityContent },
  ];

  for (const row of cardRows) {
    await sb.from('review_cards').upsert(
      {
        user_id: userId,
        problem_slug: slug,
        card_type: row.card_type,
        content: row.content,
        code_snapshot: code,
        interval_days: 1,
        next_review: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        review_count: 0,
        dismissed: false,
      },
      { onConflict: 'user_id,problem_slug,card_type' },
    );
  }
}
