import { redirect } from 'next/navigation';
import { getSupabaseUser } from '@/lib/supabase';
import MobileShell from '@/components/mobile/MobileShell';

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const user = await getSupabaseUser();
  if (!user) {
    redirect('/sign-in?next=/m');
  }
  return <MobileShell>{children}</MobileShell>;
}
