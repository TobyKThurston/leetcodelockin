'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

type UserSummary = { name?: string; image?: string };

// Module-level cache so that navigating between authed pages renders the nav
// with the user populated from the very first render. Without this, each page
// mounted its own nav starting from `null`, then the async fetch would push
// the center tabs sideways as the user avatar/name popped in.
let cachedUser: UserSummary | null = null;
let inflight: Promise<UserSummary | null> | null = null;
let cachedIsPro: boolean | null = null;
let proInflight: Promise<boolean | null> | null = null;

/** Clear the module-level user cache (call on sign-out). */
export function clearUserCache() {
  cachedUser = null;
  inflight = null;
  cachedIsPro = null;
  proInflight = null;
}

function fetchIsPro(): Promise<boolean | null> {
  if (proInflight) return proInflight;
  proInflight = fetch('/api/ai-usage')
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      if (d && typeof d.isPro === 'boolean') {
        cachedIsPro = d.isPro;
        return d.isPro;
      }
      return null;
    })
    .catch(() => null);
  return proInflight;
}

function fetchCurrentUser(): Promise<UserSummary | null> {
  if (inflight) return inflight;
  const supabase = createSupabaseBrowser();
  inflight = supabase.auth.getUser().then(({ data }) => {
    const u = data.user;
    if (!u) return null;
    const summary: UserSummary = {
      name: (u.user_metadata?.full_name as string | undefined) ?? u.email ?? undefined,
      image: u.user_metadata?.avatar_url as string | undefined,
    };
    cachedUser = summary;
    return summary;
  });
  return inflight;
}

export type AppNavTab = 'Path' | 'Library' | 'Progress' | 'Interview' | 'Review' | 'Settings';

const TABS: { label: AppNavTab; href: string }[] = [
  { label: 'Path',      href: '/dashboard'  },
  { label: 'Library',   href: '/library'    },
  { label: 'Interview', href: '/interview'  },
  { label: 'Review',    href: '/review'     },
  { label: 'Progress',  href: '/progress'   },
  { label: 'Settings',  href: '/settings'   },
];

export default function AppNav({ activeTab }: { activeTab: AppNavTab }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSummary | null>(cachedUser);
  const [checked, setChecked] = useState(cachedUser !== null);
  const [isPro, setIsPro] = useState<boolean | null>(cachedIsPro);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser().then(u => {
      if (!cancelled) {
        if (u) setUser(u);
        setChecked(true);
      }
    });
    fetchIsPro().then(v => {
      if (!cancelled && v !== null) setIsPro(v);
    });
    return () => { cancelled = true; };
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const hasName = !!user?.name;
  const isGuest = checked && !user;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[10px]"
      style={{
        background: 'var(--ll-nav-bg)',
        borderBottom: '1px solid var(--ll-border)',
      }}
    >
      <div className="w-full relative flex items-center gap-3 px-5 h-12">
        <Link
          href="/?home=1"
          className="flex items-center gap-1.5 font-bold text-[15px] tracking-tight whitespace-nowrap"
          style={{ ...SG, color: 'var(--ll-ink-strong)' }}
        >
          <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
          LeetLockin
        </Link>
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5">
          {TABS.map(tab => {
            const active = tab.label === activeTab;
            const classes = cn(
              'text-[12px] px-3 transition-colors',
              active
                ? 'font-semibold text-[color:var(--ll-ink-strong)]'
                : 'text-[color:var(--ll-ink-muted)] hover:text-[color:var(--ll-ink)]',
            );
            return (
              <Button
                key={tab.label}
                variant="ghost"
                size="sm"
                className={classes}
                nativeButton={false}
                render={<Link href={tab.href} />}
              >
                {tab.label}
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isPro === null && !isGuest && checked && (
            <Skeleton className="h-7 w-[72px] rounded-[min(var(--radius-md),12px)]" />
          )}
          {isPro === false && !isGuest && (
            <Button
              variant="outline"
              size="sm"
              className="text-[12px] font-medium"
              style={{
                color: 'var(--ll-ink)',
                borderColor: 'var(--ll-border-strong)',
                background: 'var(--ll-bg-elevated)',
              }}
              onClick={async () => {
                const res = await fetch('/api/stripe/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    plan: 'monthly',
                    returnPath: window.location.pathname + window.location.search,
                  }),
                });
                const { url } = await res.json();
                if (url) window.location.href = url;
              }}
            >
              <Zap size={12} style={{ color: 'var(--ll-accent)' }} />
              Get Pro
            </Button>
          )}
          {isGuest ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[12px] font-medium"
              style={{
                color: 'var(--ll-ink)',
                borderColor: 'var(--ll-border-strong)',
                background: 'var(--ll-bg-elevated)',
              }}
              nativeButton={false}
              render={<Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} />}
            >
              Sign in
            </Button>
          ) : (
            <>
              <Avatar size="sm" className="size-7">
                <AvatarImage src={user?.image} referrerPolicy="no-referrer" />
                <AvatarFallback
                  className="text-[11px] font-semibold"
                  style={{ background: 'var(--ll-accent-soft)', color: 'var(--ll-accent-ink)' }}
                >
                  {initial}
                </AvatarFallback>
              </Avatar>
              {/* Always rendered so the layout doesn't reflow when the name arrives.
                  `visibility: hidden` preserves the intrinsic width of the text. */}
              <span
                aria-hidden={!hasName}
                className="hidden sm:inline text-[12px] font-medium max-w-[160px] truncate"
                style={{ ...SG, color: 'var(--ll-ink)', visibility: hasName ? 'visible' : 'hidden' }}
              >
                {user?.name ?? 'Loading user'}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
