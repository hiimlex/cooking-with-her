// src/components/templates/PhoneFrame.tsx — 402x874 iPhone-ish frame for previews
import type { ReactNode } from 'react';

export interface PhoneFrameProps {
  children: ReactNode;
  label?: string;
}

export function PhoneFrame({ children, label }: PhoneFrameProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <div className="text-[11px] text-muted font-bold uppercase tracking-[1.2px]">
          {label}
        </div>
      )}
      <div
        className="bg-ink rounded-[44px] p-1.5"
        style={{ boxShadow: '0 12px 28px rgba(30,23,48,0.18)' }}
      >
        <div
          className="relative bg-bg rounded-[36px] overflow-hidden"
          style={{ width: 402, height: 874 }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[110px] h-[34px] bg-ink rounded-full z-50" />
          <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
