import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getSupabaseUser } from '@/lib/supabase';
import { checkAiRateLimit, recordAiUsage } from '@/lib/subscription';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to use AI chat' }, { status: 401 });
    }

    const rateLimit = await checkAiRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Daily limit reached', used: rateLimit.used, limit: rateLimit.limit, isPro: false },
        { status: 429 },
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const problemContext: string = typeof body.problem === 'string' ? body.problem : '';
    const codeContext: string = typeof body.code === 'string' ? body.code : '';

    if (messages.length === 0) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 });
    }

    const contextPrefix = [
      problemContext && `PROBLEM:\n${problemContext}`,
      codeContext && `STUDENT'S CURRENT CODE:\n\`\`\`python\n${codeContext}\n\`\`\``,
    ]
      .filter(Boolean)
      .join('\n\n');

    const modelMessages = [
      ...(contextPrefix
        ? ([{ role: 'system' as const, content: contextPrefix }])
        : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
    });

    await recordAiUsage(user.id, 'tutor-chat');
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('/api/tutor-chat error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Check your OPENAI_API_KEY.' },
      { status: 500 }
    );
  }
}
