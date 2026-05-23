// src/components/atoms/Input.tsx
import { type InputHTMLAttributes, forwardRef } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...rest }, ref) => (
  <input
    ref={ref}
    className={[
      'w-full bg-card rounded-2xl px-4 py-3.5 text-[15px] text-ink',
      'placeholder:text-subtle',
      'outline-none focus:ring-4 focus:ring-accent-tint focus:bg-white',
      'transition-shadow',
      className,
    ].join(' ')}
    {...rest}
  />
));
Input.displayName = 'Input';

export const TextArea = ({ className = '', ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={[
      'w-full bg-card rounded-2xl px-4 py-3.5 text-[15px] text-ink leading-[1.5]',
      'placeholder:text-subtle',
      'outline-none focus:ring-4 focus:ring-accent-tint focus:bg-white',
      'transition-shadow resize-y',
      className,
    ].join(' ')}
    {...rest}
  />
);
