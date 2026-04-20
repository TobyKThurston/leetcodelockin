import { NextRequest, NextResponse } from 'next/server';
import { getProblemHiddenTests } from '@/lib/problems-server';
import { getSupabaseUser } from '@/lib/supabase';

// Returns hidden tests for a problem to an authenticated user on Submit.
// POST (not GET) to signal this is a submit-time action and to discourage
// casual prefetching or caching.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const tests = await getProblemHiddenTests(slug);
  return NextResponse.json({ tests });
}
