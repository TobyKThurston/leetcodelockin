import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { getSupabaseUser } from '@/lib/supabase';

export default async function Home() {
  const user = await getSupabaseUser();
  if (user) {
    redirect('/dashboard');
  }
  return <LandingPage />;
}
