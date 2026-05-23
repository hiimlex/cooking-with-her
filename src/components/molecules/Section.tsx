// src/components/molecules/Section.tsx — section header
import type { ReactNode } from 'react';

export interface SectionProps {
  title: string;
  count?: number | string;
  kicker?: string;
  action?: ReactNode;
  padded?: boolean;
  className?: string;
}

export function Section({
  title, count, kicker, action, padded = true, className = '',
}: SectionProps) {
  return (
    <div className={[
      'flex items-center justify-between',
      padded ? 'px-[18px]' : '',
      'mt-1 mb-3',
      className,
    ].join(' ')}>
      <div className="min-w-0">
        <h2 className="m-0 text-[19px] font-extrabold text-ink tracking-[-0.4px] flex items-baseline gap-1.5">
          {title}
          {count !== undefined && (
            <span className="text-sm text-subtle font-semibold">{count}</span>
          )}
        </h2>
        {kicker && <div className="text-xs text-muted mt-0.5">{kicker}</div>}
      </div>
      {action}
    </div>
  );
}
