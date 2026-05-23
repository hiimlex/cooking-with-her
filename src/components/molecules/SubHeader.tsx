// src/components/molecules/SubHeader.tsx — sub-screen header with back arrow
import type { ReactNode } from 'react';
import { IcChevLeft } from '@/icons';

export interface SubHeaderProps {
  onBack?: () => void;
  title: string;
  sub?: string;
  right?: ReactNode;
  breadcrumb?: ReactNode;
}

export function SubHeader({ onBack, title, sub, right, breadcrumb }: SubHeaderProps) {
  return (
    <div className="px-[18px] pt-[56px] pb-[14px]">
      <button
        onClick={onBack}
        className="bg-card w-10 h-10 rounded-full inline-flex items-center justify-center text-ink mb-3.5"
      >
        <IcChevLeft size={18} />
      </button>
      <div className="flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0">
          {breadcrumb && <div className="text-xs text-muted mb-1">{breadcrumb}</div>}
          <h1 className="m-0 text-[26px] font-extrabold text-ink tracking-[-0.6px] leading-[1.1]">
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
