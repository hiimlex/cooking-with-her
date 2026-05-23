// src/components/molecules/RecipeCard.tsx — square card for home grid
import { useState } from 'react';
import { Card, FoodIcon, Rating } from '@/components/atoms';
import { FOOD_GLYPHS, IcClock, IcHeart } from '@/icons';
import type { Recipe } from '@/types';

export interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const [liked, setLiked] = useState(false);
  const accent = FOOD_GLYPHS[recipe.sprites[0]].color;
  return (
    <Card onClick={onClick} className="p-3.5 relative">
      <button
        onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
        className={[
          'absolute top-3 right-3 z-[2] w-[30px] h-[30px] rounded-full',
          'inline-flex items-center justify-center bg-canvas',
          liked ? 'text-accent' : 'text-subtle',
        ].join(' ')}
      >
        <IcHeart size={15} filled={liked} />
      </button>
      <div
        className="w-full aspect-[1.2/1] rounded-2xl flex items-center justify-center mb-3"
        style={{ background: accent + '18' }}
      >
        <FoodIcon name={recipe.sprites[0]} size={56} />
      </div>
      <div className="text-sm font-extrabold text-ink tracking-[-0.2px] truncate mb-1.5">
        {recipe.name}
      </div>
      <div className="flex items-center gap-2.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <IcClock size={12} /> {recipe.time}m
        </span>
        <Rating value={recipe.rating.toFixed(1)} size={12} />
      </div>
    </Card>
  );
}
