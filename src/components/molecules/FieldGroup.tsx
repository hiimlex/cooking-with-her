// src/components/molecules/FieldGroup.tsx — form field wrapper
import type { ReactNode } from 'react';

export interface FieldGroupProps {
  label: string;
  sub?: string;
  children: ReactNode;
}

export function FieldGroup({ label, sub, children }: FieldGroupProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-ink mb-1 tracking-[-0.1px]">
        {label}
      </label>
      {sub
        ? <div className="text-xs text-muted mb-2">{sub}</div>
        : <div className="h-2" />}
      {children}
    </div>
  );
}
