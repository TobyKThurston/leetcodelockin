import { NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/supabase';
import { getUserSolvedSlugs } from '@/lib/problems-server';

export async function GET() {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ slugs: [] });
  }

  const solved = await getUserSolvedSlugs(user.id);
  return NextResponse.json({ slugs: [...solved] });
}
