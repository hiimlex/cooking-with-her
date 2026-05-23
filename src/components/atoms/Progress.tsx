// src/components/atoms/Progress.tsx
export interface ProgressProps {
  value: number;          // 0–100
  color?: string;         // CSS color (defaults to brand purple)
  height?: number;        // px
  className?: string;
}

export function Progress({ value, color = '#7c3aed', height = 8, className = '' }: ProgressProps) {
  return (
    <div
      className={['w-full bg-canvas rounded-full overflow-hidden', className].join(' ')}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
