import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { getSupabaseUser } from '@/lib/supabase';
import { checkAiQuota, recordAiUsage } from '@/lib/subscription';
import { INJECTION_GUARD, fenceUserContent, sanitizeUserText } from '@/lib/prompt-safety';
import { logApiError } from '@/lib/log';
import { getPostHogClient } from '@/lib/posthog-server';

const MAX_CODE_LENGTH = 10_000;
const MAX_PROBLEM_LENGTH = 8_000;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_MESSAGES = 40;

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
  problem: z.string().max(MAX_PROBLEM_LENGTH).optional().default(''),
  code: z.string().max(MAX_CODE_LENGTH).optional().default(''),
});

const SYSTEM_PROMPT = `You're a chill but sharp coding buddy helping a student work through a LeetCode problem in real time. Think pair-programming energy, not lecture hall.

IMPORTANT — YOU CAN SEE THEIR CODE. The student's current code is provided to you with every message. Reference their actual variable names, logic, and lines. Say things like "your left pointer never moves" or "that dict lookup on line 5 is smart" — be specific, not generic.

VIBE:
- Casual, witty, encouraging — like a friend who's annoyingly good at algorithms
- Keep it tight: 1-4 sentences, bullet points when useful
- Ask Socratic questions that actually make them think ("what happens to your window when you hit a duplicate?")
- When they're close, hype them up and give them the last nudge ("you're literally one line away, look at what happens when left catches up to right")
- When they're stuck, don't just repeat the hint — try a different angle or analogy
- NEVER sound robotic. No "Great question!" No "Let's explore this." No "Certainly!"

RULES:
- Never give the full solution — guide them there
- Build on previous turns, don't repeat yourself
- If they changed their code since last message, notice it and react ("nice, you added the set — now think about when to remove from it")
- Keep the momentum going — every response should leave them with a clear next thing to try`;

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to use AI chat' }, { status: 401 });
    }

    const quota = await checkAiQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: 'AI limit reached', used: quota.used, limit: quota.limit, isPro: quota.isPro, reason: quota.reason },
        { status: 429 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = requestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { messages, problem: problemContext, code: codeContext } = parsed.data;

    const contextPrefix = [
      problemContext && `PROBLEM:\n${fenceUserContent('problem', problemContext)}`,
      codeContext && `STUDENT'S CURRENT CODE:\n${fenceUserContent('code', codeContext)}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const sanitizedMessages = messages.map((m) =>
      m.role === 'user'
        ? { role: 'user' as const, content: fenceUserContent('message', m.content) }
        : { role: m.role, content: sanitizeUserText(m.content) },
    );

    const modelMessages = [
      ...(contextPrefix
        ? ([{ role: 'system' as const, content: contextPrefix }])
        : []),
      ...sanitizedMessages,
    ];

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: `${SYSTEM_PROMPT}\n\n${INJECTION_GUARD}`,
      messages: modelMessages,
    });

    await recordAiUsage(user.id, 'tutor-chat');
    getPostHogClient().capture({
      distinctId: user.id,
      event: 'tutor_message_sent',
      properties: {
        message_count: messages.length,
      },
    });
    return NextResponse.json({ reply: text });
  } catch (err) {
    logApiError('api/tutor-chat', err);
    return NextResponse.json(
      { error: 'Something went wrong. Check your OPENAI_API_KEY.' },
      { status: 500 }
    );
  }
}
