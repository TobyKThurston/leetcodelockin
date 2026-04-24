'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Zap, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/m/upgrade', label: 'Upgrade', Icon: Zap },
  { href: '/m/cards',   label: 'Cards',   Icon: Layers },
  { href: '/m/desktop', label: 'Desktop', Icon: Monitor },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

export default function BottomTabBar() {
  const pathname = usePathname() ?? '/m';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur bg-white/90 border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-3 h-16">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          const isUpgrade = href === '/m/upgrade';
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors',
                  active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                  className={cn(
                    active && isUpgrade && 'text-amber-400',
                    !active && isUpgrade && 'text-amber-500/60',
                  )}
                />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
