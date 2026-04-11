'use server';

import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { computeSkippedBlocks, type OnboardingAnswers } from '@/lib/onboarding-logic';

// ─── Persistence ───────────────────────────────────────────────────────────────

const ONBOARDING_MODULE_ID = 'onboarding';
const CURRICULUM_MODULE_ID = 'curriculum';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const db = getSupabase();
  if (!db) return true; // no DB → don't block
  const user = await getSupabaseUser();
  if (!user) return true; // not signed in → don't block

  // Check explicit onboarding row
  const { data: onboardingRow } = await db
    .from('progress')
    .select('completed')
    .eq('user_id', user.id)
    .eq('module_id', ONBOARDING_MODULE_ID)
    .single();

  if (onboardingRow) return true;

  // Returning user who signed up before onboarding existed:
  // if they have any curriculum progress, treat as onboarded.
  const { data: curriculumRow } = await db
    .from('progress')
    .select('completed')
    .eq('user_id', user.id)
    .eq('module_id', CURRICULUM_MODULE_ID)
    .single();

  if (curriculumRow && Array.isArray(curriculumRow.completed) && curriculumRow.completed.length > 0) {
    return true;
  }

  return false;
}

export async function completeOnboarding(answers: OnboardingAnswers): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  const user = await getSupabaseUser();
  if (!user) return;

  const skipBlockIds = computeSkippedBlocks(answers);

  // 1. Bulk-complete skipped blocks in curriculum progress
  if (skipBlockIds.length > 0) {
    const { data: row } = await db
      .from('progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('module_id', CURRICULUM_MODULE_ID)
      .single();

    const current = new Set<string>(((row?.completed as string[] | null) ?? []));
    for (const id of skipBlockIds) current.add(id);

    await db.from('progress').upsert(
      {
        user_id: user.id,
        module_id: CURRICULUM_MODULE_ID,
        current_lesson: '',
        completed: [...current],
        xp: 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id' },
    );
  }

  // 2. Mark onboarding as done
  await db.from('progress').upsert(
    {
      user_id: user.id,
      module_id: ONBOARDING_MODULE_ID,
      current_lesson: '',
      completed: ['done'],
      xp: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,module_id' },
  );
}
