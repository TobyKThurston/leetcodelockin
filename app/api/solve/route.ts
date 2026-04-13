import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabaseUser } from '@/lib/supabase';
import { checkAiQuota, recordAiUsage } from '@/lib/subscription';
import { INJECTION_GUARD, fenceUserContent } from '@/lib/prompt-safety';
import { logApiError } from '@/lib/log';

const MAX_PROBLEM_LENGTH = 8_000;
const MAX_ATTEMPT_LENGTH = 10_000;

const requestSchema = z.object({
  problem: z.string().min(1).max(MAX_PROBLEM_LENGTH),
  attempt: z.string().max(MAX_ATTEMPT_LENGTH).optional(),
});

const schema = z.object({
  hints: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe('Progressive hints: [0] very abstract, [1] more specific, [2] very concrete'),
  pattern: z.string().describe('The algorithmic pattern name, e.g. "Sliding Window"'),
  steps: z.array(z.string()).describe('Ordered steps to solve the problem'),
  code: z.string().describe('Clean Python solution with inline comments'),
});

const SYSTEM_PROMPT = `You are a technical instructor guiding a student through a data structures and algorithms problem. Your job is to lead them to the solution through precise, professional hints grounded in computer science fundamentals.

TONE:
- Direct, technical, and concise. Use the correct CS vocabulary (invariant, monotonic, amortized, in-place, auxiliary space, etc.).
- No analogies, metaphors, jokes, or pop-culture references.
- No filler phrases ("Great question", "Let's dive in", "Certainly"). Get straight to the substance.
- Address the student as a peer engineer, not a beginner who needs hand-holding.

CODE REVIEW:
If the student shared an attempt, analyze it concretely. Reference the specific variables, loop conditions, or branches that are correct or incorrect. State the exact bug or missing invariant — do not speak in generalities.

PATTERN:
Identify the algorithmic pattern by its standard name (e.g. "Sliding Window", "Monotonic Stack", "Binary Search on Answer", "Topological Sort", "DFS with Memoization"). In 1–2 sentences, justify why the pattern applies in terms of the problem's structure (e.g. "the input is sorted and we need a pair summing to a target, so two pointers achieve O(n) instead of the O(n²) brute force").

HINTS — produce exactly 2 or 3, strictly progressive:
- Hint 1 (classification): Identify the problem class and the relevant data structure or technique. State the target time and space complexity. Do not describe implementation yet.
- Hint 2 (approach): Describe the invariant or state you must maintain, the data structure that supports it, and how the state transitions. Name the operations (push, pop, expand, contract, relax, etc.).
- Hint 3 (mechanics): Spell out the algorithm at the level of pseudocode — loop structure, update rules, termination condition, and edge cases (empty input, single element, duplicates, integer overflow where relevant). Do NOT write the full final code here.

If the student shared an attempt, each hint should also diagnose the specific defect in their code (e.g. "your left pointer never advances when nums[left] + nums[right] < target, so the window is not actually sliding").

STEPS: 5–8 ordered, imperative steps. Each step is one concrete action a student can execute. Include complexity analysis as the final step.

CODE: Idiomatic Python. Use descriptive identifiers (left, right, window_sum, prev_max, not x, y, z). Inline comments should explain WHY a line exists (the invariant being maintained), not WHAT it does syntactically. Include the time and space complexity as a comment at the top of the function.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to use AI hints' }, { status: 401 });
    }

    const quota = await checkAiQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: 'AI limit reached', used: quota.used, limit: quota.limit, isPro: quota.isPro, reason: quota.reason },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { problem, attempt } = parsed.data;

    const problemBlock = fenceUserContent('problem', problem);
    const attemptBlock = attempt?.trim() ? fenceUserContent('attempt', attempt) : '';
    const userPrompt = attemptBlock
      ? `Problem:\n${problemBlock}\n\nStudent's attempt:\n${attemptBlock}\n\nAnalyze the attempt and guide the student toward the correct solution.`
      : `Problem:\n${problemBlock}\n\nNo attempt yet — guide the student from scratch.`;

    const { output } = await generateText({
      model: openai('gpt-4o'),
      system: `${SYSTEM_PROMPT}\n\n${INJECTION_GUARD}`,
      prompt: userPrompt,
      output: Output.object({ schema }),
    });

    await recordAiUsage(user.id, 'solve');
    return NextResponse.json(output);
  } catch (err) {
    logApiError('api/solve', err);
    return NextResponse.json({ error: 'Something went wrong. Check your OPENAI_API_KEY.' }, { status: 500 });
  }
}
