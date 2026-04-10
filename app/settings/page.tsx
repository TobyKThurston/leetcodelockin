import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getSupabaseUser } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
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

const SG = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export default async function SettingsPage() {
  const user = await getSupabaseUser();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? '';
  const email = user?.email ?? '';
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const initial = (name || email || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: '#0b1220' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: '#070c17', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-full flex items-center gap-3 px-5 h-12">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-[12.5px] text-slate-400 hover:text-slate-200"
            style={SG}
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
          <span
            className="ml-2 text-[13px] font-medium text-white"
            style={SG}
          >
            Settings
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="pt-20 pb-16 px-5">
        <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight" style={SG}>
              Settings
            </h1>
            <p className="text-[13px] text-slate-400 mt-1" style={SG}>
              Manage your account and preferences.
            </p>
          </div>

          {/* Profile */}
          <Card className="bg-white/[0.025] border-white/10">
            <CardHeader>
              <CardTitle className="text-white" style={SG}>
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
                  <AvatarFallback className="bg-slate-700 text-slate-200 text-base font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-white truncate" style={SG}>
                    {name || 'Unnamed'}
                  </p>
                  <p className="text-[12.5px] text-slate-500 truncate" style={SG}>
                    {email}
                  </p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <ProfileForm initialName={name} email={email} />
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-white/[0.025] border-white/10">
            <CardHeader>
              <CardTitle className="text-white" style={SG}>
                Preferences
              </CardTitle>
              <CardDescription style={SG}>
                Appearance and study preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] text-white" style={SG}>Theme</p>
                  <p className="text-[12px] text-slate-500" style={SG}>Dark mode is currently the only option.</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-[12px]">
                  Dark
                </Button>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] text-white" style={SG}>Language</p>
                  <p className="text-[12px] text-slate-500" style={SG}>Interface language for lessons and UI.</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-[12px]">
                  English
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="bg-white/[0.025] border-white/10">
            <CardHeader>
              <CardTitle className="text-white" style={SG}>
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
