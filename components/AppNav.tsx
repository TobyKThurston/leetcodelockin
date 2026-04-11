'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const C = {
  panelBg: '#070c17',
  border:  'rgba(255,255,255,0.06)',
};

type UserSummary = { name?: string; image?: string };

// Module-level cache so that navigating between authed pages renders the nav
// with the user populated from the very first render. Without this, each page
// mounted its own nav starting from `null`, then the async fetch would push
// the center tabs sideways as the user avatar/name popped in.
let cachedUser: UserSummary | null = null;
let inflight: Promise<UserSummary | null> | null = null;

/** Clear the module-level user cache (call on sign-out). */
export function clearUserCache() {
  cachedUser = null;
  inflight = null;
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
  { label: 'Progress',  href: '/progress'   },
  { label: 'Interview', href: '/interview'  },
  { label: 'Review',    href: '/review'     },
  { label: 'Settings',  href: '/settings'   },
];

export default function AppNav({ activeTab }: { activeTab: AppNavTab }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSummary | null>(cachedUser);
  const [checked, setChecked] = useState(cachedUser !== null);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser().then(u => {
      if (!cancelled) {
        if (u) setUser(u);
        setChecked(true);
      }
    });
    fetch('/api/ai-usage')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled && d) setIsPro(d.isPro); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const hasName = !!user?.name;
  const isGuest = checked && !user;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}` }}
    >
      <div className="w-full flex items-center gap-3 px-5 h-12">
        <Link
          href="/?home=1"
          className="flex items-center gap-1.5 font-bold text-[15px] tracking-tight text-white mr-auto whitespace-nowrap"
          style={SG}
        >
          <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
          LeetLockin
        </Link>
        <nav className="flex items-center gap-0.5">
          {TABS.map(tab => {
            const active = tab.label === activeTab;
            const classes = cn(
              'text-[12px] px-3',
              active ? 'text-white font-medium' : 'text-slate-400 hover:text-slate-200',
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
          {isPro === false && !isGuest && (
            <button
              onClick={async () => {
                const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '';
                if (!priceId) return;
                const res = await fetch('/api/stripe/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ priceId }),
                });
                const { url } = await res.json();
                if (url) window.location.href = url;
              }}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <Zap size={12} />
              Get Pro
            </button>
          )}
          {isGuest ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[12px] font-medium text-slate-200 border-slate-700 bg-transparent hover:bg-slate-800 hover:text-white"
              nativeButton={false}
              render={<Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} />}
            >
              Sign in
            </Button>
          ) : (
            <>
              <Avatar size="sm" className="size-7">
                <AvatarImage src={user?.image} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-[11px] font-semibold bg-slate-700 text-slate-200">
                  {initial}
                </AvatarFallback>
              </Avatar>
              {/* Always rendered so the layout doesn't reflow when the name arrives.
                  `visibility: hidden` preserves the intrinsic width of the text. */}
              <span
                aria-hidden={!hasName}
                className="hidden sm:inline text-[12px] text-slate-300 font-medium max-w-[160px] truncate"
                style={{ ...SG, visibility: hasName ? 'visible' : 'hidden' }}
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
