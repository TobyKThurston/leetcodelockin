import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MainSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export default function MainSurface({ children, className }: MainSurfaceProps) {
  return (
    <div
      className={cn('rounded-2xl border', className)}
      style={{
        background: 'var(--ll-bg-card)',
        borderColor: 'var(--ll-border)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </div>
  );
}
