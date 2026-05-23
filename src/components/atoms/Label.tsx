// src/components/atoms/Label.tsx — small pill label (issue-style)
import type { ReactNode } from 'react';
import type { LabelColor } from '@/types';

export interface LabelProps {
  children: ReactNode;
  color?: LabelColor;
  solid?: boolean;
  className?: string;
}

const palettes: Record<LabelColor, [string, string]> = {
  gray:   ['bg-lab-gray-bg',   'text-lab-gray-fg'],
  purple: ['bg-lab-purple-bg', 'text-lab-purple-fg'],
  green:  ['bg-lab-green-bg',  'text-lab-green-fg'],
  yellow: ['bg-lab-yellow-bg', 'text-lab-yellow-fg'],
  orange: ['bg-lab-orange-bg', 'text-lab-orange-fg'],
  red:    ['bg-lab-red-bg',    'text-lab-red-fg'],
  blue:   ['bg-lab-blue-bg',   'text-lab-blue-fg'],
  pink:   ['bg-lab-pink-bg',   'text-lab-pink-fg'],
};

export function Label({ children, color = 'gray', solid, className = '' }: LabelProps) {
  const [bg, fg] = palettes[color];
  const cls = solid
    ? `bg-lab-${color}-fg text-white`.replace('bg-lab-gray-fg', 'bg-muted')
    : `${bg} ${fg}`;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full',
        'text-[11px] font-semibold leading-none',
        cls, className,
      ].join(' ')}
    >{children}</span>
  );
}

export const TAG_COLOR: Record<string, LabelColor> = {
  Brunch: 'orange', Lunch: 'blue', Dinner: 'purple', Snack: 'pink',
  Weekday: 'green', AI: 'purple',
};
