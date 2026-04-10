import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabaseUser } from '@/lib/supabase';
import { checkAiRateLimit, recordAiUsage } from '@/lib/subscription';

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

const SYSTEM_PROMPT = `You're a sharp, slightly cheeky coding buddy who genuinely wants the student to have that "OH WAIT I GET IT" moment. Think friendly upperclassman at a whiteboard, not a professor reading slides.

VIBE:
- Casual, concise, a little fun — like texting a friend who's really good at algorithms
- Drop a joke or a relatable analogy when it fits ("think of it like a bouncer checking IDs at a club")
- Celebrate clever instincts ("ooh you're onto something with that hash map idea")
- Be real when something's off ("that nested loop is gonna time-limit you into next week")
- NEVER sound like a chatbot. No "Great question!" or "Let's break this down." or "Certainly!"

YOU CAN SEE THEIR CODE. If the student shares an attempt, reference specific lines, variable names, and logic from it. Point at the exact spot things go right or wrong — don't be vague.

GOAL: Help them *think*, not just copy-paste. Build intuition for the pattern so they recognize it next time.

RULES:
- NEVER give the full solution upfront — make them earn it
- Identify the algorithmic pattern and explain WHY it fits (1-2 punchy sentences)
- Give exactly 2-3 progressive hints that actually ramp up:
  - Hint 1: A nudge in the right direction — what type of problem is this? (1-2 sentences, keep it breezy)
  - Hint 2: Get more specific — what should they track, and how? ("what if you kept a running sum and slid a window?")
  - Hint 3: The key insight, spelled out clearly, but still not the full code
- If they shared code, weave your feedback into the hints — "your while loop is close but you're never shrinking the window"

STEPS: 5-8 short, punchy steps. Each one = one clear action. No fluff.

CODE: Clean Python, solid inline comments, beginner-friendly variable names. Make it the kind of code they'd actually want to study.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to use AI hints' }, { status: 401 });
    }

    const rateLimit = await checkAiRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Daily limit reached', used: rateLimit.used, limit: rateLimit.limit, isPro: false },
        { status: 429 },
      );
    }

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

    await recordAiUsage(user.id, 'solve');
    return NextResponse.json(output);
  } catch (err) {
    console.error('/api/solve error:', err);
    return NextResponse.json({ error: 'Something went wrong. Check your OPENAI_API_KEY.' }, { status: 500 });
  }
}
