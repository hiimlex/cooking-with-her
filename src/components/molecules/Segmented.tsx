// src/components/molecules/Segmented.tsx — pill-shaped tab/radio
import type { ReactNode } from 'react';

export interface SegmentedOption<T> {
  value: T;
  label: ReactNode;
}

export interface SegmentedProps<T extends string | number> {
  value: T;
  options: Array<T | SegmentedOption<T>>;
  onChange: (v: T) => void;
  full?: boolean;
  className?: string;
}

export function Segmented<T extends string | number>({
  value, options, onChange, full, className = '',
}: SegmentedProps<T>) {
  return (
    <div className={[
      'inline-flex bg-canvas rounded-full p-1',
      full ? 'w-full' : '',
      className,
    ].join(' ')}>
      {options.map((o) => {
        const v = (typeof o === 'object' ? o.value : o) as T;
        const l = (typeof o === 'object' ? o.label : o) as ReactNode;
        const isActive = value === v;
        return (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className={[
              'flex-1 px-3 py-1.5 rounded-full text-[13px] transition-colors',
              isActive ? 'bg-card text-ink font-bold' : 'bg-transparent text-muted font-medium',
            ].join(' ')}
          >{l}</button>
        );
      })}
    </div>
  );
}
