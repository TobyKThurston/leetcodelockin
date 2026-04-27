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

export interface KeyLinesContent {
  blank_indices: number[];
  original_lines: string[];
}

export interface ApproachContent {
  pattern: string;
  explanation: string;
}

export interface ComplexityContent {
  time: string;
  space: string;
  reasoning: string;
}

// ─── AI schema ───────────────────────────────────────────────────────────────

const reviewAiSchema = z.object({
  key_lines: z.object({
    blank_indices: z
      .array(z.number())
      .min(1)
      .max(1)
      .describe('0-based line index of the single most critical logic line in the solution'),
  }),
  approach: z.object({
    pattern: z.string().describe('Algorithmic pattern name, e.g. "Sliding Window"'),
    explanation: z.string().describe('2-3 sentence explanation of the approach'),
  }),
  complexity: z.object({
    time: z.string().describe('Big-O time complexity, e.g. "O(n)"'),
    space: z.string().describe('Big-O space complexity, e.g. "O(1)"'),
    reasoning: z.string().describe('One sentence justifying the complexity'),
  }),
});

const SYSTEM_PROMPT = `You are an expert algorithm instructor creating spaced repetition flashcards from a student's accepted solution.

Given the problem description and the student's accepted Python code, generate review card content:

1. KEY LINES: Identify the SINGLE most critical line of logic — the one line that represents the core algorithmic insight. Return its 0-based line index as a single-element array. Skip blank lines, imports, and boilerplate. Focus on the line where the actual algorithm happens.

2. APPROACH: Name the algorithmic pattern and give a concise 2-3 sentence explanation of the approach. Write it as what someone should recall, not a tutorial.

3. COMPLEXITY: State the time and space complexity in Big-O notation with a brief justification.

Be precise with line indices — count carefully from line 0.`;

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

  // Build content for key_lines card
  const blankIndices = output.key_lines.blank_indices.filter(i => i >= 0 && i < codeLines.length);
  const keyLinesContent: KeyLinesContent = {
    blank_indices: blankIndices,
    original_lines: blankIndices.map(i => codeLines[i]),
  };

  const cardRows = [
    { card_type: 'key_lines', content: keyLinesContent },
    { card_type: 'approach', content: output.approach },
    { card_type: 'complexity', content: output.complexity },
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
