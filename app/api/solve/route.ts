import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

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

const SYSTEM_PROMPT = `You are a patient, encouraging coding tutor helping beginners learn algorithmic problem solving for LeetCode.

Your ONLY goal is to help the student understand HOW to think, not just get the answer.

RULES:
- NEVER give away the full solution upfront
- Identify the core algorithmic pattern first
- Give exactly 2-3 progressive hints (vague → specific → very specific)
- If a student attempt is provided, analyze what's right/wrong and guide them
- Keep all responses SHORT — use bullet points, not paragraphs
- Explain the WHY behind each step

HINT GUIDELINES:
- Hint 1: "What kind of problem is this? What data structure might help?" (very abstract, 1-2 sentences)
- Hint 2: "Think about what you need to track... what window/pointer/key makes sense here?" (moderate, 2-3 sentences)
- Hint 3: "Here's the key insight: [specific algorithm move]" (concrete but NOT the full solution)

STEPS: Break the solution into 5-8 short, actionable steps. Each step = one sentence.

CODE: Clean Python with helpful inline comments. Use beginner-friendly variable names.`;

export async function POST(req: NextRequest) {
  try {
    const { problem, attempt } = await req.json();

    if (!problem?.trim()) {
      return NextResponse.json({ error: 'Problem description is required' }, { status: 400 });
    }

    const userPrompt = attempt?.trim()
      ? `Problem:\n${problem}\n\nStudent's attempt:\n${attempt}\n\nAnalyze the attempt and guide the student toward the correct solution.`
      : `Problem:\n${problem}\n\nNo attempt yet — guide the student from scratch.`;

    const { output } = await generateText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      output: Output.object({ schema }),
    });

    return NextResponse.json(output);
  } catch (err) {
    console.error('/api/solve error:', err);
    return NextResponse.json({ error: 'Something went wrong. Check your OPENAI_API_KEY.' }, { status: 500 });
  }
}
