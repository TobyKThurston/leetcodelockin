'use server';

import { getSupabase, getSupabaseUser } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/subscription';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayActive: boolean;
  freezesRemaining: number;
  streakAtRisk: boolean;
  isPro: boolean;
}

export interface HeatmapDay {
  date: string;   // 'YYYY-MM-DD'
  count: number;
  frozen: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Record activity ────────────────────────────────────────────────────────

/** Increment today's action count. No-ops for guests / unauthenticated. */
export async function recordActivity(): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  const user = await getSupabaseUser();
  if (!user) return;

  const today = todayUTC();

  // Try to increment existing row first
  const { data: existing } = await db
    .from('daily_activity')
    .select('id, actions')
    .eq('user_id', user.id)
    .eq('activity_date', today)
    .single();

  if (existing) {
    await db
      .from('daily_activity')
      .update({ actions: existing.actions + 1, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await db.from('daily_activity').insert({
      user_id: user.id,
      activity_date: today,
      actions: 1,
    });
  }
}

/** Version that takes an explicit userId (for use in API routes). */
export async function recordActivityForUser(userId: string): Promise<void> {
  const db = getSupabase();
  if (!db) return;

  const today = todayUTC();

  const { data: existing } = await db
    .from('daily_activity')
    .select('id, actions')
    .eq('user_id', userId)
    .eq('activity_date', today)
    .single();

  if (existing) {
    await db
      .from('daily_activity')
      .update({ actions: existing.actions + 1, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await db.from('daily_activity').insert({
      user_id: userId,
      activity_date: today,
      actions: 1,
    });
  }
}

// ─── Streak computation ─────────────────────────────────────────────────────

export async function getStreakData(): Promise<StreakData> {
  const empty: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    todayActive: false,
    freezesRemaining: 0,
    streakAtRisk: false,
    isPro: false,
  };

  const db = getSupabase();
  if (!db) return empty;
  const user = await getSupabaseUser();
  if (!user) return empty;

  // Fetch last 90 days of activity
  const since = addDays(todayUTC(), -90);
  const { data: rows } = await db
    .from('daily_activity')
    .select('activity_date, actions, streak_frozen')
    .eq('user_id', user.id)
    .gte('activity_date', since)
    .order('activity_date', { ascending: false });

  const dayMap = new Map<string, { actions: number; frozen: boolean }>();
  for (const r of rows ?? []) {
    dayMap.set(r.activity_date, { actions: r.actions, frozen: r.streak_frozen });
  }

  const today = todayUTC();
  const todayEntry = dayMap.get(today);
  const todayActive = (todayEntry?.actions ?? 0) > 0;

  // Walk backward from today to compute current streak
  let currentStreak = 0;
  let cursor = today;
  for (let i = 0; i < 91; i++) {
    const entry = dayMap.get(cursor);
    if (entry && (entry.actions > 0 || entry.frozen)) {
      currentStreak++;
    } else if (i === 0) {
      // Today has no activity yet — check if yesterday continues the streak
      // Don't break, just skip today
    } else {
      break;
    }
    cursor = addDays(cursor, -1);
  }

  // If today isn't active but yesterday was, the streak is still "alive" (just not yet extended today)
  // Recompute starting from yesterday if today is empty
  if (!todayActive && currentStreak === 0) {
    cursor = addDays(today, -1);
    for (let i = 0; i < 90; i++) {
      const entry = dayMap.get(cursor);
      if (entry && (entry.actions > 0 || entry.frozen)) {
        currentStreak++;
      } else {
        break;
      }
      cursor = addDays(cursor, -1);
    }
  }

  // Longest streak over the 90-day window
  let longestStreak = 0;
  let runLength = 0;
  for (let i = 0; i <= 90; i++) {
    const d = addDays(today, -i);
    const entry = dayMap.get(d);
    if (entry && (entry.actions > 0 || entry.frozen)) {
      runLength++;
      if (runLength > longestStreak) longestStreak = runLength;
    } else {
      runLength = 0;
    }
  }

  // Pro status + freeze info
  const { isPro } = await getUserSubscription(user.id);
  let freezesRemaining = 0;
  if (isPro) {
    const currentMonth = today.slice(0, 7); // 'YYYY-MM'
    const { data: freezeRow } = await db
      .from('streak_freezes')
      .select('total, used')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single();

    freezesRemaining = freezeRow ? freezeRow.total - freezeRow.used : 2;
  }

  // Streak at risk: user has a streak, yesterday has no activity, today has no activity
  const yesterday = addDays(today, -1);
  const yesterdayEntry = dayMap.get(yesterday);
  const yesterdayActive = yesterdayEntry ? (yesterdayEntry.actions > 0 || yesterdayEntry.frozen) : false;
  const streakAtRisk = currentStreak > 0 && !yesterdayActive && !todayActive;

  return {
    currentStreak,
    longestStreak,
    todayActive,
    freezesRemaining,
    streakAtRisk,
    isPro,
  };
}

// ─── Heatmap data ───────────────────────────────────────────────────────────

export async function getHeatmapData(weeks = 7): Promise<HeatmapDay[]> {
  const db = getSupabase();
  if (!db) return [];
  const user = await getSupabaseUser();
  if (!user) return [];

  const today = todayUTC();
  const since = addDays(today, -(weeks * 7));

  const { data: rows } = await db
    .from('daily_activity')
    .select('activity_date, actions, streak_frozen')
    .eq('user_id', user.id)
    .gte('activity_date', since)
    .lte('activity_date', today)
    .order('activity_date', { ascending: true });

  return (rows ?? []).map(r => ({
    date: r.activity_date,
    count: r.actions,
    frozen: r.streak_frozen,
  }));
}

// ─── Streak freeze ──────────────────────────────────────────────────────────

export async function useStreakFreeze(): Promise<{ ok: boolean; freezesRemaining: number }> {
  const db = getSupabase();
  if (!db) return { ok: false, freezesRemaining: 0 };
  const user = await getSupabaseUser();
  if (!user) return { ok: false, freezesRemaining: 0 };

  // Must be Pro
  const { isPro } = await getUserSubscription(user.id);
  if (!isPro) return { ok: false, freezesRemaining: 0 };

  const today = todayUTC();
  const yesterday = addDays(today, -1);
  const currentMonth = today.slice(0, 7);

  // Check yesterday doesn't already have activity
  const { data: yRow } = await db
    .from('daily_activity')
    .select('id, actions, streak_frozen')
    .eq('user_id', user.id)
    .eq('activity_date', yesterday)
    .single();

  if (yRow && (yRow.actions > 0 || yRow.streak_frozen)) {
    // Yesterday already covered — no freeze needed
    return { ok: false, freezesRemaining: 0 };
  }

  // Check freeze allowance
  const { data: freezeRow } = await db
    .from('streak_freezes')
    .select('id, total, used')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .single();

  const total = freezeRow?.total ?? 2;
  const used = freezeRow?.used ?? 0;
  if (used >= total) return { ok: false, freezesRemaining: 0 };

  // Apply freeze to yesterday
  if (yRow) {
    await db
      .from('daily_activity')
      .update({ streak_frozen: true, updated_at: new Date().toISOString() })
      .eq('id', yRow.id);
  } else {
    await db.from('daily_activity').insert({
      user_id: user.id,
      activity_date: yesterday,
      actions: 0,
      streak_frozen: true,
    });
  }

  // Update freeze count
  if (freezeRow) {
    await db
      .from('streak_freezes')
      .update({ used: used + 1 })
      .eq('id', freezeRow.id);
  } else {
    await db.from('streak_freezes').insert({
      user_id: user.id,
      month: currentMonth,
      total: 2,
      used: 1,
    });
  }

  return { ok: true, freezesRemaining: total - (used + 1) };
}
