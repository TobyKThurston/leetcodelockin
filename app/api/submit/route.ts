import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { recordSubmission } from '@/lib/problems-server';
import { generateReviewCards } from '@/lib/review';
import { findPracticeStepsBySlug } from '@/lib/curriculum';
import { setBlockCompleted } from '@/lib/progress';
import { recordActivityForUser } from '@/lib/streaks';
import { getUserSubscription } from '@/lib/subscription';
import { getPostHogClient } from '@/lib/posthog-server';

interface SubmitRequestBody {
  slug: string;
  code: string;
  language?: string;
  status: 'accepted' | 'wrong' | 'error';
  passedCount: number;
  totalCount: number;
}

export async function POST(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SubmitRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { slug, code, status, passedCount, totalCount } = body;
  const language = body.language ?? 'python';

  if (typeof slug !== 'string' || !slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  if (typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }
  if (!['accepted', 'wrong', 'error'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  if (typeof passedCount !== 'number' || typeof totalCount !== 'number') {
    return NextResponse.json({ error: 'Invalid counts' }, { status: 400 });
  }

  await recordSubmission({
    userId: user.id,
    problemSlug: slug,
    code,
    language,
    status,
    passedCount,
    totalCount,
  });

  getPostHogClient().capture({
    distinctId: user.id,
    event: 'problem_submitted',
    properties: {
      slug,
      status,
      passed_count: passedCount,
      total_count: totalCount,
      language,
    },
  });

  // Generate spaced repetition review cards for Pro users on accepted submissions
  if (status === 'accepted') {
    await recordActivityForUser(user.id);

    // Spaced repetition cards are a Pro feature — skip the OpenAI call for free users.
    const { isPro } = await getUserSubscription(user.id);
    if (isPro) {
      await generateReviewCards(user.id, slug, code);
    }

    // Mark any curriculum practice steps that reference this problem as complete.
    // Don't fail the submission response if progress writes hiccup.
    const practiceStepIds = findPracticeStepsBySlug(slug);
    for (const stepId of practiceStepIds) {
      try {
        await setBlockCompleted(stepId, true);
      } catch (err) {
        console.error(`setBlockCompleted(${stepId}) from /api/submit failed:`, err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
