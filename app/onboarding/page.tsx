import { redirect } from 'next/navigation';
import { getSupabaseUser } from '@/lib/supabase';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import OnboardingFlow from '@/components/OnboardingFlow';

export default async function OnboardingPage() {
  const user = await getSupabaseUser();
  if (!user) redirect('/sign-in?next=/onboarding');

  const done = await hasCompletedOnboarding();
  if (done) redirect('/dashboard');

  return (
    <div className="min-h-dvh bg-[#0b1220] text-white">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(59,130,246,0.25), transparent)',
        }}
      />
      <OnboardingFlow />
    </div>
  );
}
