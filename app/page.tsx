import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { getSupabaseUser } from '@/lib/supabase';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ home?: string }>;
}) {
  const { home } = await searchParams;
  const user = await getSupabaseUser();
  // Signed-in users normally bounce to /dashboard, but if they explicitly
  // navigated here via the nav logo (`/?home=1`), show them the landing page.
  if (user && home !== '1') {
    redirect('/dashboard');
  }
  return <LandingPage />;
}
