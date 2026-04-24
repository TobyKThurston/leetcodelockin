import type { ReactNode } from 'react';
import { C, SG } from '@/lib/ui-tokens';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8 flex items-end justify-between gap-8', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p
            className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2"
            style={{ color: C.textMuted }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="text-[24px] font-semibold"
          style={{ ...SG, color: C.text, letterSpacing: '-0.02em' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13.5px] mt-1.5 leading-snug" style={{ color: C.textSub }}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="shrink-0 pb-0.5">{right}</div>}
    </div>
  );
}
