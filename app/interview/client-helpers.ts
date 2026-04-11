// Client-side helper to fetch problem content by slug.
// Used during interview session start and crash recovery.

import type { ProblemContent } from '@/lib/problem-types';

export async function getProblemBySlug(slug: string): Promise<ProblemContent | null> {
  try {
    const res = await fetch(`/api/problem/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
