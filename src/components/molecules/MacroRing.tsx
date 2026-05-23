// src/components/molecules/MacroRing.tsx — donut chart of macros
import type { Nutrition } from '@/types';

export interface MacroRingProps {
  nutrition: Nutrition;
  size?: number;
}

export function MacroRing({ nutrition, size = 72 }: MacroRingProps) {
  const p = nutrition.protein, c = nutrition.carbs, f = nutrition.fat;
  const total = p + c + f;
  const r = 28;
  const C = 2 * Math.PI * r;
  const arcs = [
    { value: p, color: '#7c3aed' },
    { value: c, color: '#f59e0b' },
    { value: f, color: '#ff7eb9' },
  ];
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f3eefe" strokeWidth="8" />
      {arcs.map((a, i) => {
        const dash = (a.value / total) * C;
        const el = (
          <circle
            key={i}
            cx="36" cy="36" r={r} fill="none"
            stroke={a.color} strokeWidth="8" strokeLinecap="butt"
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-offset}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}
