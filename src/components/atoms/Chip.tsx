// src/components/atoms/Chip.tsx
import type { ReactNode } from 'react';

export interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, active, onClick, className = '' }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center px-4 py-2 rounded-full',
        'text-[13px] font-semibold whitespace-nowrap transition-colors',
        active ? 'bg-ink text-white' : 'bg-card text-ink hover:bg-canvas',
        className,
      ].join(' ')}
    >{children}</button>
  );
}
