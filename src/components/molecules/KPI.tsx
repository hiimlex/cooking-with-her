// src/components/molecules/KPI.tsx — dashboard KPI card
import { type ComponentType } from 'react';

export interface KPIProps {
  label: string;
  value: string | number;
  sub: string;
  color: string;       // icon fg
  tint: string;        // icon bg
  Icon: ComponentType<{ size?: number; filled?: boolean }>;
  filled?: boolean;
}

export function KPI({ label, value, sub, color, tint, Icon, filled }: KPIProps) {
  return (
    <div className="bg-card rounded-2xl p-3.5">
      <div
        className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center mb-2.5"
        style={{ background: tint, color }}
      >
        <Icon size={15} filled={filled} />
      </div>
      <div className="text-[26px] font-extrabold tracking-[-0.8px] leading-none text-ink tabular-nums">
        {value}
      </div>
      <div className="text-xs text-muted mt-1 font-semibold">{label}</div>
      <div className="text-[11px] text-subtle mt-0.5">{sub}</div>
    </div>
  );
}
