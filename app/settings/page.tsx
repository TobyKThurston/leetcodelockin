import { getSupabaseUser } from '@/lib/supabase';
import { getUserSubscription, syncStripeSubscription } from '@/lib/subscription';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import SignOutButton from './SignOutButton';
import ProfileForm from './ProfileForm';
import SettingsNav from './SettingsNav';
import SubscriptionCard from '@/components/SubscriptionCard';

const SG = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default async function SettingsPage() {
  const user = await getSupabaseUser();
  // Sync from Stripe before reading — catches renewals, cancellations, and
  // failed payments even if the webhook never arrived. Swallow errors so a
  // Stripe outage can't take down the settings page.
  if (user) {
    try {
      await syncStripeSubscription(user.id);
    } catch (err) {
      console.error('settings page stripe sync failed:', err);
    }
  }
  const sub = user ? await getUserSubscription(user.id) : null;
  const name = (user?.user_metadata?.full_name as string | undefined) ?? '';
  const email = user?.email ?? '';
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const initial = (name || email || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: 'var(--ll-bg)' }}>
      <SettingsNav />

      {/* Body */}
      <main className="pt-20 pb-16 px-5">
        <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight" style={SG}>
              Settings
            </h1>
            <p className="text-[13px] text-slate-600 mt-1" style={SG}>
              Manage your account and preferences.
            </p>
          </div>

          {/* Profile */}
          <Card className="bg-slate-50/60 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900" style={SG}>
                Profile
              </CardTitle>
              <CardDescription style={SG}>
                Your account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarImage src={avatar} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-slate-200 text-slate-800 text-base font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-slate-900 truncate" style={SG}>
                    {name || 'Unnamed'}
                  </p>
                  <p className="text-[12.5px] text-slate-500 truncate" style={SG}>
                    {email}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <ProfileForm initialName={name} email={email} />
            </CardContent>
          </Card>

          {/* Subscription */}
          <SubscriptionCard
            isPro={sub?.isPro ?? false}
            status={sub?.status ?? 'inactive'}
            currentPeriodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
            cancelAtPeriodEnd={sub?.cancelAtPeriodEnd ?? false}
          />

          {/* Feedback */}
          <Card className="bg-slate-50/60 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900" style={SG}>
                Feedback & suggestions
              </CardTitle>
              <CardDescription style={SG}>
                Found a bug or have an idea? Send it over.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:tobykthurston@gmail.com?subject=LeetCode%20Lockin%20feedback"
                className="inline-flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-900 text-[13px] font-medium px-4 py-2 transition-colors"
                style={SG}
              >
                Send feedback
              </a>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="bg-slate-50/60 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900" style={SG}>
                Account
              </CardTitle>
              <CardDescription style={SG}>
                Sign out or manage your session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignOutButton />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
