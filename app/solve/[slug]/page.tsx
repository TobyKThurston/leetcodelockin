import { notFound } from 'next/navigation';
import ProblemPage from '@/components/ProblemPage';
import { getProblemBySlug } from '@/lib/problems-server';

export const metadata = {
  robots: { index: false, follow: false },
};

interface SolveSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SolveSlugPage({ params }: SolveSlugPageProps) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  return <ProblemPage problem={problem} />;
}
