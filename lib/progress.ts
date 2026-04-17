'use server';

import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { recordActivity } from '@/lib/streaks';

export interface ModuleProgress {
  current_lesson: string;
  completed: string[];
  xp: number;
}

// The curriculum-level dashboard progress (which blocks are complete across all
// paths) is stored in the same `progress` table using this reserved module_id.
const CURRICULUM_MODULE_ID = 'curriculum';

// ─── Per-module lesson progress (learn pages) ───────────────────────────────

export async function getProgress(moduleId: string): Promise<ModuleProgress | null> {
  const db = getSupabase();
  if (!db) return null;
  const user = await getSupabaseUser();
  if (!user) return null;

  const { data, error } = await db
    .from('progress')
    .select('current_lesson, completed, xp')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single();

  if (error || !data) return null;
  return data as ModuleProgress;
}

export async function saveProgress(
  moduleId: string,
  currentLesson: string,
  completed: string[],
  xp: number
): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  const user = await getSupabaseUser();
  if (!user) return;

  await db.from('progress').upsert(
    {
      user_id: user.id,
      module_id: moduleId,
      current_lesson: currentLesson,
      completed,
      xp,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,module_id' }
  );
}

// ─── Curriculum-level block progress (dashboard) ────────────────────────────

export async function getCompletedBlocks(): Promise<string[]> {
  const db = getSupabase();
  if (!db) return [];
  const user = await getSupabaseUser();
  if (!user) return [];

  const { data, error } = await db
    .from('progress')
    .select('completed')
    .eq('user_id', user.id)
    .eq('module_id', CURRICULUM_MODULE_ID)
    .single();

  if (error || !data) return [];
  return (data.completed as string[] | null) ?? [];
}

export async function setBlockCompleted(blockId: string, complete: boolean): Promise<string[]> {
  const db = getSupabase();
  if (!db) return [];
  const user = await getSupabaseUser();
  if (!user) return [];

  const { data: row, error: readErr } = await db
    .from('progress')
    .select('completed')
    .eq('user_id', user.id)
    .eq('module_id', CURRICULUM_MODULE_ID)
    .maybeSingle();

  if (readErr) {
    throw new Error(`setBlockCompleted read failed: ${readErr.message}`);
  }

  const current = new Set<string>(((row?.completed as string[] | null) ?? []));
  if (complete) {
    current.add(blockId);
    await recordActivity();
  } else {
    current.delete(blockId);
  }
  const next = [...current];

  const { error: writeErr } = await db.from('progress').upsert(
    {
      user_id: user.id,
      module_id: CURRICULUM_MODULE_ID,
      current_lesson: '',
      completed: next,
      xp: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,module_id' }
  );

  if (writeErr) {
    throw new Error(`setBlockCompleted write failed: ${writeErr.message}`);
  }

  return next;
}
