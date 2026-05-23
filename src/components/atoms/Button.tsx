// src/components/atoms/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'default' | 'primary' | 'soft' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-card text-ink hover:bg-canvas',
  primary: 'bg-accent text-white hover:bg-accent-em',
  soft:    'bg-accent-tint text-accent hover:bg-canvas',
  ghost:   'bg-transparent text-ink hover:bg-canvas',
  danger:  'bg-lab-red-bg text-lab-red-fg',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-full gap-1.5',
  md: 'h-10 px-4 text-sm rounded-full gap-1.5',
  lg: 'h-[52px] px-5 text-base rounded-full gap-2',
};

export function Button({
  children, icon, variant = 'default', size = 'md', full,
  className = '', disabled, ...rest
}: ButtonProps) {
  const cls = [
    'inline-flex items-center justify-center font-semibold whitespace-nowrap',
    'transition-transform active:scale-[0.97]',
    sizeClasses[size],
    variantClasses[variant],
    full ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].join(' ');
  return (
    <button className={cls} disabled={disabled} {...rest}>
      {icon}{children}
    </button>
  );
}
