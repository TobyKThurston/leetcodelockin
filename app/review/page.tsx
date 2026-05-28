import { getSupabaseUser } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/subscription';
import ReviewPageClient from '@/components/ReviewPage';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await getSupabaseUser();
  const sub = user ? await getUserSubscription(user.id) : { isPro: false };
  return <ReviewPageClient isPro={sub.isPro} isSignedIn={!!user} />;
}
