// src/components/atoms/Toggle.tsx
export interface ToggleProps {
  on: boolean;
  onChange?: (next: boolean) => void;
  className?: string;
}

export function Toggle({ on, onChange, className = '' }: ToggleProps) {
  return (
    <button
      onClick={() => onChange?.(!on)}
      className={[
        'inline-flex items-center w-[42px] h-[26px] rounded-full p-[3px]',
        'transition-colors flex-shrink-0',
        on ? 'bg-accent' : 'bg-sunken',
        className,
      ].join(' ')}
      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-[20px] h-[20px] rounded-full bg-white transition-transform"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          transform: `translateX(${on ? 16 : 0}px)`,
        }}
      />
    </button>
  );
}
