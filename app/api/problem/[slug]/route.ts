import { NextRequest, NextResponse } from 'next/server';
import { getProblemBySlug } from '@/lib/problems-server';
import { getSupabaseUser } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(problem);
}
