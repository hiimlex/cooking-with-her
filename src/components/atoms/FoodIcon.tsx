// src/components/atoms/FoodIcon.tsx
import { FOOD_GLYPHS } from '@/icons';
import type { FoodGlyphId } from '@/types';

export interface FoodIconProps {
  name: FoodGlyphId;
  size?: number;
  color?: string;
  className?: string;
}

export function FoodIcon({ name, size = 24, color, className }: FoodIconProps) {
  const g = FOOD_GLYPHS[name];
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke={color || g.color} strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d={g.d} />
    </svg>
  );
}

export interface FoodTileProps extends FoodIconProps {
  tileSize?: number;
  radius?: number;
}

export function FoodTile({ name, tileSize = 40, radius = 8, className }: FoodTileProps) {
  const g = FOOD_GLYPHS[name];
  return (
    <div
      className={className}
      style={{
        width: tileSize, height: tileSize, borderRadius: radius,
        background: g.color + '1f', // ~12% tint
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      <FoodIcon name={name} size={tileSize * 0.55} />
    </div>
  );
}
