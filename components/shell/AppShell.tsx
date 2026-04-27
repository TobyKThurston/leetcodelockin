'use client';

import type { ReactNode } from 'react';
import AppNav, { type AppNavTab } from '@/components/AppNav';
import { SHELL } from '@/lib/ui-tokens';
import { cn } from '@/lib/utils';

type AppShellProps = {
  activeTab: AppNavTab;
  sidebar?: ReactNode;
  rail?: ReactNode;
  children: ReactNode;
  /** Opt out of the centered container (e.g. Dashboard's zigzag needs full width). */
  unconstrained?: boolean;
  /** Extra classes on the main element. */
  mainClassName?: string;
};

export default function AppShell({
  activeTab,
  sidebar,
  rail,
  children,
  unconstrained = false,
  mainClassName,
}: AppShellProps) {
  return (
    <div className="min-h-screen ll-app-mesh">
      <AppNav activeTab={activeTab} />
      {sidebar}
      {rail}
      <main
        style={{
          paddingTop: SHELL.navHeight,
        }}
        className={cn(
          'min-h-screen overflow-x-auto pb-24',
          'md:pl-[304px]',
          rail ? 'lg:pr-[304px]' : undefined,
          mainClassName,
        )}
      >
        {unconstrained ? (
          children
        ) : (
          <div className="w-full max-w-[720px] lg:max-w-none py-8 px-4 sm:px-8 lg:px-12">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
