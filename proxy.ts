import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bucketForPath, isRateLimitExempt } from '@/lib/rate-limit';

// Unauthed API endpoints. Stripe webhook must stay open so Stripe can POST to it;
// it verifies authenticity via signature instead of auth cookie.
const PUBLIC_API_PREFIXES = ['/api/stripe/webhook', '/api/auth/'];

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function rateLimitResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: 'Rate limit exceeded', retryAfter: retryAfterSec },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
  );
}

export default async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res;
  }

  const pathname = req.nextUrl.pathname;
  const isApi = pathname.startsWith('/api/');

  // Public API routes bypass auth entirely (Stripe webhook, OAuth callbacks, etc.).
  if (isApi && isPublicApi(pathname)) {
    return res;
  }

  // IP-level global ceiling, applied to every API request (including unauthed).
  // Skipped for webhook/auth callbacks so Stripe retries and OAuth flows never 429.
  if (isApi && !isRateLimitExempt(pathname)) {
    const ip = clientIp(req);
    const ipCheck = checkRateLimit('IP_GLOBAL', `ip:${ip}`);
    if (!ipCheck.ok) return rateLimitResponse(ipCheck.retryAfterSec);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // API routes: return JSON 401, don't redirect.
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If ?guest=1 is present, stamp a cookie so subsequent navigations pass through.
    if (req.nextUrl.searchParams.get('guest') === '1') {
      const clean = req.nextUrl.clone();
      clean.searchParams.delete('guest');
      const redirect = NextResponse.redirect(clean);
      redirect.cookies.set('guest-browsing', '1', {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
      });
      return redirect;
    }

    // Settings always requires a real session.
    // Other routes require either a session or the guest-browsing cookie.
    const hasGuestCookie = req.cookies.get('guest-browsing')?.value === '1';
    if (!hasGuestCookie || pathname.startsWith('/settings')) {
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/interview/:path*',
    '/library/:path*',
    '/learn/:path*',
    '/onboarding/:path*',
    '/settings/:path*',
    '/solve/:path*',
    '/tutor/:path*',
  ],
};
