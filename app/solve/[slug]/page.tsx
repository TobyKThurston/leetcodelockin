import { notFound, redirect } from 'next/navigation';
import ProblemPage from '@/components/ProblemPage';
import { getSupabaseUser } from '@/lib/supabase';
import { getProblemBySlug } from '@/lib/problems-server';

interface SolveSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SolveSlugPage({ params }: SolveSlugPageProps) {
  const user = await getSupabaseUser();
  if (!user) {
    const { slug } = await params;
    redirect(`/sign-in?next=/solve/${slug}`);
  }

  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  return <ProblemPage problem={problem} />;
}
