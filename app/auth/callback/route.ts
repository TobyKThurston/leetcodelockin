import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { hasCompletedOnboarding, markOnboardedMobile } from '@/lib/onboarding';

function detectMobile(ua: string): boolean {
  return /android|iphone|ipod|webos|blackberry|iemobile|opera mini/i.test(ua);
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = req.nextUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  const isMobile = detectMobile(req.headers.get('user-agent') ?? '');

  if (isMobile) {
    // Skip the desktop onboarding questionnaire for mobile signups so
    // downstream gates don't bounce them back to /onboarding.
    await markOnboardedMobile();

    // First-time mobile signups land on the handoff screen; returning
    // sessions skip straight to /m. A persistent cookie gates "first time."
    const hasSeenHandoff = req.cookies.get('ll_seen_handoff')?.value === '1';
    const target = hasSeenHandoff ? '/m' : '/welcome-mobile';
    const res = NextResponse.redirect(new URL(target, req.url));
    if (!hasSeenHandoff) {
      res.cookies.set('ll_seen_handoff', '1', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return res;
  }

  // Desktop flow unchanged, except upgrade flow skips the onboarding
  // questionnaire so clicking "Upgrade" on the landing page takes the user
  // straight to Stripe after sign-in.
  const bypassOnboarding = next.startsWith('/checkout');
  const onboarded = await hasCompletedOnboarding();
  if (!onboarded && !bypassOnboarding) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }
  return NextResponse.redirect(new URL(next, req.url));
}
