// src/components/molecules/Badge.tsx — achievement card
import { Progress } from '@/components/atoms';

export interface BadgeProps {
  title: string;
  sub: string;
  emoji?: string;
  earned?: boolean;
  progress?: number;
  max?: number;
}

export function Badge({ title, sub, emoji, earned, progress, max }: BadgeProps) {
  return (
    <div className={[
      'rounded-3xl p-3.5',
      earned ? 'bg-card opacity-100' : 'bg-canvas opacity-85',
    ].join(' ')}>
      {emoji && (
        <div
          className={[
            'w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] mb-2.5',
            earned ? 'bg-accent-tint' : 'bg-sunken grayscale-[0.6]',
          ].join(' ')}
        >{emoji}</div>
      )}
      <div className="text-[13px] font-bold text-ink">{title}</div>
      <div className="text-[11px] text-muted mt-0.5">{sub}</div>
      {progress !== undefined && max !== undefined && (
        <div className="mt-2">
          <Progress value={(progress / max) * 100} height={5} />
          <div className="text-[11px] text-muted mt-1 font-semibold">{progress} / {max}</div>
        </div>
      )}
    </div>
  );
}
