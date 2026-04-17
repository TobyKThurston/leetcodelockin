import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseUser } from '@/lib/supabase';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const SG = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

type Mode = 'signin' | 'signup';

async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    mode?: Mode;
    error?: string;
    message?: string;
  }>;
}) {
  const user = await getSupabaseUser();
  const { next, mode: modeParam, error, message } = await searchParams;
  // Upgrade flow: if the user was sent here to complete checkout, skip the
  // onboarding questionnaire so they go straight to Stripe after sign-in.
  const bypassOnboarding = next?.startsWith('/checkout') ?? false;
  if (user) {
    const onboarded = await hasCompletedOnboarding();
    redirect(onboarded || bypassOnboarding ? (next ?? '/dashboard') : '/onboarding');
  }

  const mode: Mode = modeParam === 'signup' ? 'signup' : 'signin';
  const nextUrl = next ?? '/dashboard';

  async function signInWithGoogle(formData: FormData) {
    'use server';
    const nextUrl = (formData.get('next') as string) || '/dashboard';
    const headersList = await headers();
    const host = headersList.get('host') ?? 'localhost:3001';
    const proto = headersList.get('x-forwarded-proto') ?? 'http';
    const origin = `${proto}://${host}`;

    const supabase = await getSupabaseServer();
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });

    if (data.url) redirect(data.url);
  }

  async function signInWithPassword(formData: FormData) {
    'use server';
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const nextUrl = (formData.get('next') as string) || '/dashboard';

    if (!email || !password) {
      redirect(
        `/sign-in?mode=signin&error=${encodeURIComponent('Email and password are required.')}&next=${encodeURIComponent(nextUrl)}`
      );
    }

    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(
        `/sign-in?mode=signin&error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextUrl)}`
      );
    }

    const onboarded = await hasCompletedOnboarding();
    const bypassOnboarding = nextUrl.startsWith('/checkout');
    redirect(onboarded || bypassOnboarding ? nextUrl : '/onboarding');
  }

  async function signUpWithPassword(formData: FormData) {
    'use server';
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const nextUrl = (formData.get('next') as string) || '/dashboard';

    if (!email || !password) {
      redirect(
        `/sign-in?mode=signup&error=${encodeURIComponent('Email and password are required.')}&next=${encodeURIComponent(nextUrl)}`
      );
    }
    if (password.length < 6) {
      redirect(
        `/sign-in?mode=signup&error=${encodeURIComponent('Password must be at least 6 characters.')}&next=${encodeURIComponent(nextUrl)}`
      );
    }

    const headersList = await headers();
    const host = headersList.get('host') ?? 'localhost:3001';
    const proto = headersList.get('x-forwarded-proto') ?? 'http';
    const origin = `${proto}://${host}`;

    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });

    if (error) {
      redirect(
        `/sign-in?mode=signup&error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextUrl)}`
      );
    }

    // If email confirmation is enabled, there's no session yet.
    if (!data.session) {
      redirect(
        `/sign-in?mode=signin&message=${encodeURIComponent('Check your email to confirm your account, then sign in.')}&next=${encodeURIComponent(nextUrl)}`
      );
    }

    const bypassOnboarding = nextUrl.startsWith('/checkout');
    redirect(bypassOnboarding ? nextUrl : '/onboarding');
  }

  const isSignIn = mode === 'signin';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ background: '#0b1220' }}
    >
      {/* Moving dot grid — matches landing page */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Ambient glow — blue to match landing */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.09) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block">
            <p
              className="text-[26px] font-bold text-white tracking-tight"
              style={SG}
            >
              LeetLockin
            </p>
          </Link>
          <p className="text-[13px] text-zinc-500 mt-0.5" style={SG}>
            Learn patterns. Crack interviews.
          </p>
        </div>

        <Card className="bg-white/[0.025] border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white" style={SG}>
              {isSignIn ? 'Sign in to continue' : 'Create your account'}
            </CardTitle>
            <CardDescription style={SG}>
              {isSignIn
                ? 'Your progress is saved to your account.'
                : 'Start locking in with a free account.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* Google */}
            <form action={signInWithGoogle}>
              <input type="hidden" name="next" value={nextUrl} />
              <Button
                type="submit"
                variant="outline"
                className="w-full h-10 bg-white/[0.03] text-white hover:bg-white/[0.06] border-white/10"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="mr-1"
                >
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center">
              <Separator className="flex-1 bg-white/10" />
              <span
                className="px-3 text-[11px] uppercase tracking-wider text-zinc-500"
                style={SG}
              >
                or
              </span>
              <Separator className="flex-1 bg-white/10" />
            </div>

            {/* Email / Password */}
            <form
              action={isSignIn ? signInWithPassword : signUpWithPassword}
              className="flex flex-col gap-3"
            >
              <input type="hidden" name="next" value={nextUrl} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-zinc-300" style={SG}>
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-zinc-300" style={SG}>
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  placeholder={isSignIn ? 'Your password' : 'At least 6 characters'}
                  className="h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600"
                />
              </div>

              {error ? (
                <p
                  className="text-[12.5px] text-red-400"
                  role="alert"
                  style={SG}
                >
                  {error}
                </p>
              ) : null}
              {message ? (
                <p
                  className="text-[12.5px] text-emerald-400"
                  role="status"
                  style={SG}
                >
                  {message}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 text-white hover:bg-blue-500 border-transparent font-bold"
              >
                {isSignIn ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center bg-transparent border-t border-white/10">
            <p className="text-[12.5px] text-zinc-500" style={SG}>
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link
                    href={`/sign-in?mode=signup&next=${encodeURIComponent(nextUrl)}`}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    href={`/sign-in?mode=signin&next=${encodeURIComponent(nextUrl)}`}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </Card>

        <Link
          href={`${nextUrl}${nextUrl.includes('?') ? '&' : '?'}guest=1`}
          className="mt-5 block text-center text-[12.5px] text-zinc-500 hover:text-zinc-300 transition-colors"
          style={SG}
        >
          Continue as guest →
        </Link>
        <p
          className="mt-2 text-center text-[11px] text-zinc-700"
          style={SG}
        >
          You can browse everything — sign in to save progress.
        </p>
      </div>
    </div>
  );
}
