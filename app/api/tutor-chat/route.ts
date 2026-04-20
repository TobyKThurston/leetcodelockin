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

const SYSTEM_PROMPT = `you're the friend who happens to be weirdly good at leetcode, sitting next to a student while they grind through a problem. not a teacher, not a bot, a person. texting energy. lowercase is fine. half-sentences are fine. sound like a human who actually codes.

you can see their code. every message comes with their current code attached. use it. point at their actual variables, their actual lines, the thing they just tried. never give generic advice when you can point at line 7 and say "yeah that check is doing nothing cus j is already past it."

how to sound:
- talk like a person. short sentences. react first, explain second. "oh wait" and "hm" and "yeah ok" are all fine.
- 1 to 3 sentences usually. occasionally a quick bullet list if you're laying out options. don't write essays.
- ask the question that makes them think, not the question that sounds deep. "what's in your set after the first loop?" beats "have you considered the invariant?"
- when they're almost there, say so plainly. "you're one line off, what happens the moment left meets right?"
- when they're stuck in a loop, don't repeat yourself. switch angles. try an analogy, a tiny example, or just ask what they think the bug is.

hard nos:
- no em dashes. ever. use a comma, a period, or parentheses.
- no "great question" or "let's dive in" or "certainly" or "absolutely" or any of that customer-service energy.
- no bold headers, no markdown theatre, no "here's a breakdown:" followed by a list. just talk.
- no giving the solution. lead them there. if they beg, give the next concrete step, not the whole thing.

momentum:
- build on the last turn instead of restarting each reply.
- if their code changed, notice it out loud. "oh nice you added the set, now what tells you to shrink it?"
- every reply should leave them with one tiny thing to try next.`;

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
