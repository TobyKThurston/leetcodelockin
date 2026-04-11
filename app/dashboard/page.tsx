import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardPage from '@/components/DashboardPage';
import { getCompletedBlocks } from '@/lib/progress';
import { getStreakData, getHeatmapData } from '@/lib/streaks';
import { getWeaknessSpotlight } from '@/lib/weaknesses';
import { getSupabaseUser } from '@/lib/supabase';
import { hasCompletedOnboarding } from '@/lib/onboarding';

export default async function Page() {
  // Guest users bypass onboarding entirely.
  const cookieStore = await cookies();
  const isGuest = cookieStore.get('guest-browsing')?.value === '1';
  if (!isGuest) {
    const user = await getSupabaseUser();
    if (user) {
      const onboarded = await hasCompletedOnboarding();
      if (!onboarded) redirect('/onboarding');
    }
  }

  const [initialCompleted, streakData, heatmapData, weaknessSpotlight] = await Promise.all([
    getCompletedBlocks(),
    getStreakData(),
    getHeatmapData(7),
    getWeaknessSpotlight(),
  ]);
  return (
    <DashboardPage
      initialCompleted={initialCompleted}
      streakData={streakData}
      heatmapData={heatmapData}
      weaknessSpotlight={weaknessSpotlight}
    />
  );
}
