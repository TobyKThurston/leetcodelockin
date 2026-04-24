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
    <div className="min-h-dvh text-slate-900" style={{ background: 'var(--ll-bg)' }}>
      {/* Soft Stripe-style gradient accent at top */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(59,130,246,0.14), transparent 70%), radial-gradient(ellipse 55% 45% at 80% 8%, rgba(56,189,248,0.10), transparent 70%)',
        }}
      />
      <OnboardingFlow />
    </div>
  );
}
