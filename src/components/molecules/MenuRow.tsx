// src/components/molecules/MenuRow.tsx — nav menu item
import { type ComponentType } from 'react';
import { Card } from '@/components/atoms';
import { IcChevRight } from '@/icons';

export interface MenuRowProps {
  Icon: ComponentType<{ size?: number }>;
  label: string;
  sub: string;
  color: string;
  onClick?: () => void;
}

export function MenuRow({ Icon, label, sub, color, onClick }: MenuRowProps) {
  return (
    <Card onClick={onClick} className="px-3.5 py-3 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '20', color }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-ink">{label}</div>
        <div className="text-xs text-muted mt-0.5">{sub}</div>
      </div>
      <IcChevRight size={16} className="text-subtle" />
    </Card>
  );
}
