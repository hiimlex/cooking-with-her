// src/components/molecules/RecipeRow.tsx — horizontal row card for lists
import { Avatar, Card, FoodIcon, Label, Rating } from '@/components/atoms';
import { TAG_COLOR } from '@/components/atoms/Label';
import { FOOD_GLYPHS, IcClock } from '@/icons';
import type { Recipe } from '@/types';

export interface RecipeRowProps {
  recipe:   Recipe;
  onClick?: () => void;
}

export function RecipeRow({ recipe, onClick }: RecipeRowProps) {
  const accent      = FOOD_GLYPHS[recipe.sprites[0]].color;
  const cookability = recipe.cookability ?? 'ok';
  const unavailable = cookability === 'unavailable';
  const low         = cookability === 'low';

  return (
    <Card onClick={onClick} className="p-3 flex gap-3.5 items-center">
      <div
        className={[
          'w-[60px] h-[60px] rounded-2xl flex items-center justify-center flex-shrink-0',
          unavailable ? 'opacity-50' : '',
        ].join(' ')}
        style={{ background: accent + '18' }}
      >
        <FoodIcon name={recipe.sprites[0]} size={36} />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={[
            'text-[15px] font-extrabold tracking-[-0.2px] truncate mb-1',
            unavailable ? 'text-muted' : 'text-ink',
          ].join(' ')}
        >
          {recipe.name}
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted">
          <Label color={TAG_COLOR[recipe.tag] || 'gray'}>{recipe.tag}</Label>
          <span className="inline-flex items-center gap-1">
            <IcClock size={12} /> {recipe.time}m
          </span>
          <Rating value={recipe.rating.toFixed(1)} size={12} />
          {unavailable && <Label color="red">Falta ingrediente</Label>}
          {low         && <Label color="yellow">Estoque baixo</Label>}
        </div>
      </div>

      <Avatar who={recipe.by} size={22} />
    </Card>
  );
}
