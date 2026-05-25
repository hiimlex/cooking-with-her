// src/components/molecules/FieldGroup.tsx — form field wrapper
import type { ReactNode } from 'react';

export interface FieldGroupProps {
  label: string;
  sub?: string;
  right?: ReactNode;
  children: ReactNode;
}

export function FieldGroup({ label, sub, right, children }: FieldGroupProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-bold text-ink tracking-[-0.1px]">
          {label}
        </label>
        {right}
      </div>
      {sub
        ? <div className="text-xs text-muted mb-2">{sub}</div>
        : <div className="h-2" />}
      {children}
    </div>
  );
}
