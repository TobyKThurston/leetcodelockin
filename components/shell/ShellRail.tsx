'use client';

import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { C, SHELL } from '@/lib/ui-tokens';

type ShellRailProps = {
  children: ReactNode;
};

export default function ShellRail({ children }: ShellRailProps) {
  return (
    <aside
      className="hidden lg:flex fixed right-0 flex-col"
      style={{
        top: SHELL.navHeight,
        bottom: 0,
        width: SHELL.sideWidth,
        background: C.panelBg,
        borderLeft: `1px solid ${C.border}`,
      }}
    >
      <ScrollArea className="flex-1">
        <div className="px-4 pt-5 pb-[96px] space-y-5">{children}</div>
      </ScrollArea>
    </aside>
  );
}
