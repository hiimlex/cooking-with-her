// src/components/atoms/Card.tsx
import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  soft?: boolean;        // canvas background instead of white
}

export function Card({ children, soft, className = '', ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={[
        'rounded-3xl',
        soft ? 'bg-canvas' : 'bg-card',
        rest.onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >{children}</div>
  );
}
