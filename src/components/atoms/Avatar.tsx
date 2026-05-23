// src/components/atoms/Avatar.tsx
import type { PersonId } from '@/types';

const data: Record<PersonId, { letter: string; bg: string; fg: string }> = {
  alex: { letter: 'A', bg: '#dde7fa', fg: '#0550ae' },
  yuka: { letter: 'Y', bg: '#fadcdc', fg: '#a40e26' },
  ai:   { letter: '✦', bg: '#efe3fd', fg: '#6639ba' },
};

export interface AvatarProps {
  who: PersonId | 'other';
  size?: number;
  ring?: boolean;
  className?: string;
}

export function Avatar({ who, size = 28, ring, className }: AvatarProps) {
  const d = (who in data) ? data[who as PersonId] : { letter: '?', bg: '#eaeef2', fg: '#59636e' };
  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: d.bg, color: d.fg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, fontWeight: 700, letterSpacing: -0.3,
        flexShrink: 0,
        boxShadow: ring ? `0 0 0 2px ${d.fg}, 0 0 0 4px #fff` : 'none',
      }}
    >
      {d.letter}
    </div>
  );
}
