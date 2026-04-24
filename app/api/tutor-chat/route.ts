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

const SYSTEM_PROMPT = `You're a tutor helping a student work through a coding problem. Calm, direct, a little warm. Not stiff, not performative. Think of a good TA in office hours: concise, specific, respects the student's time.

You can see their current code on every turn. Use it. Point at their actual variables and lines. Generic advice is the failure mode, specific observations are the goal.

Voice:
- Short. 1 to 3 sentences by default. A quick list only when you're laying out distinct options.
- Plain sentences, normal capitalization. Conversational but precise.
- Ask the question that moves them forward, not the one that sounds clever. "What's in your set after the first pass?" over "Consider the invariant."
- When they're close, say so plainly and point at the one thing left.
- When they're looping on the same confusion, change angles: a tiny example, a different framing, or ask what they think is wrong.

Don't:
- Don't use em dashes. Use commas, periods, or parentheses.
- Don't do filler openers ("Great question", "Let's dive in", "Absolutely").
- Don't use bold headers or markdown theatre. Just talk.
- Don't give the solution. Lead them to it. If they push, give the next concrete step, not the whole path.

Momentum:
- Build on the previous turn. Don't restart.
- If their code changed, acknowledge it briefly and move.
- End each reply with one concrete thing to try or check next.`;

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
