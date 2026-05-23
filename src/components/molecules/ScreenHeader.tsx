// src/components/molecules/ScreenHeader.tsx — top of a tab screen
import type { ReactNode } from 'react';

export interface ScreenHeaderProps {
  title: string;
  kicker?: string;
  sub?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, kicker, sub, right }: ScreenHeaderProps) {
  return (
    <div className="px-[18px] pt-[64px] pb-[14px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {kicker && (
            <div className="text-[11px] font-bold text-accent uppercase tracking-[0.6px] mb-1">
              {kicker}
            </div>
          )}
          <h1 className="m-0 text-[28px] font-extrabold text-ink tracking-[-0.8px] leading-[1.05]">
            {title}
          </h1>
          {sub && (
            <p className="m-0 mt-1.5 text-[13px] text-muted leading-[1.45]">{sub}</p>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}
