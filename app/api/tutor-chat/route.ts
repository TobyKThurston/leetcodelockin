import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getSupabaseUser } from '@/lib/supabase';
import { checkAiRateLimit, recordAiUsage } from '@/lib/subscription';

const SYSTEM_PROMPT = `You are a patient, Socratic coding tutor helping a student solve a LeetCode-style problem.

RULES:
- Never give the full solution upfront — guide with questions and small hints
- Reference the student's current code when relevant
- Keep answers short: 1-4 sentences max, use bullet points when helpful
- When the student is close, celebrate and nudge them over the finish line
- Use plain language; explain the WHY, not just the WHAT

You are a conversational tutor — the student will ask follow-up questions, so stay in the conversation and build on previous turns.`;

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
