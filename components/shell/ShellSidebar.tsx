'use client';

import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { C, SHELL } from '@/lib/ui-tokens';
import { cn } from '@/lib/utils';

type ShellSidebarProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function ShellSidebar({ children, footer, className }: ShellSidebarProps) {
  return (
    <aside
      className={cn('fixed left-0 bottom-0 flex flex-col', className)}
      style={{
        top: SHELL.navHeight,
        width: SHELL.sideWidth,
        background: C.panelBg,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      <ScrollArea className="flex-1">
        <div className="px-4 pt-5 pb-3 space-y-2">{children}</div>
      </ScrollArea>
      {footer && (
        <div
          className="px-4 py-4 space-y-4"
          style={{
            borderTop: `1px solid ${C.border}`,
            background: C.cardBgDark,
          }}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
