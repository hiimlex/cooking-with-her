// src/components/molecules/StickerStat.tsx — small colored stat tile
import type { ReactNode } from 'react';

export interface StickerStatProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  from: string;
  to: string;
  fg: string;
  className?: string;
}

export function StickerStat({ icon, value, label, from, to, fg, className = '' }: StickerStatProps) {
  return (
    <div
      className={['flex-1 rounded-2xl px-3 py-2.5 min-w-0', className].join(' ')}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`, color: fg }}
    >
      <div className="flex items-center gap-1 mb-0.5">{icon}</div>
      <div className="text-[20px] font-extrabold tracking-[-0.6px] leading-none" style={{ color: fg }}>
        {value}
      </div>
      <div className="text-[11px] font-semibold mt-0.5 opacity-85">{label}</div>
    </div>
  );
}
