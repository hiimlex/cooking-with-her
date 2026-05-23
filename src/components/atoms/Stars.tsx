// src/components/atoms/Stars.tsx — star rating display
import { IcStar } from '@/icons';

export interface StarsProps {
  value?: number;
  max?: number;
  size?: number;
}

export function Stars({ value = 0, max = 5, size = 14 }: StarsProps) {
  return (
    <span className="inline-flex gap-[1.5px] text-attention">
      {Array.from({ length: max }).map((_, i) => (
        <IcStar key={i} size={size} filled={i < value} />
      ))}
    </span>
  );
}

// Inline "★ 4.7 (12)" rating
export interface RatingProps {
  value: number | string;
  count?: number;
  size?: number;
}

export function Rating({ value, count, size = 14 }: RatingProps) {
  return (
    <span className="inline-flex items-center gap-1 text-ink">
      <IcStar size={size} filled className="text-attention" />
      <span style={{ fontSize: size - 1 }} className="font-bold">{value}</span>
      {count !== undefined && (
        <span style={{ fontSize: size - 2 }} className="font-medium text-subtle">
          ({count})
        </span>
      )}
    </span>
  );
}
