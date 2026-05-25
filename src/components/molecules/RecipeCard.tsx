import { Card, FoodIcon, Rating } from '@/components/atoms';
import { FOOD_GLYPHS, IcAlert, IcClock, IcHeart } from '@/icons';
import type { Recipe } from '@/types';

export interface RecipeCardProps {
  recipe:       Recipe;
  memoryPhoto?: string;
  onClick?:     () => void;
  onFavorite?:  () => void;
}

export function RecipeCard({ recipe, memoryPhoto, onClick, onFavorite }: RecipeCardProps) {
  const accent      = FOOD_GLYPHS[recipe.sprites[0]].color;
  const favorited   = recipe.favorite ?? false;
  const cookability = recipe.cookability ?? 'ok';
  const unavailable = cookability === 'unavailable';
  const low         = cookability === 'low';

  return (
    <Card onClick={onClick} className="p-3.5 relative">
      {/* Favorite */}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
        className={[
          'absolute top-3 right-3 z-[2] w-[30px] h-[30px] rounded-full',
          'inline-flex items-center justify-center transition-colors',
          memoryPhoto ? 'bg-black/30 text-white' : 'bg-canvas',
          !memoryPhoto && (favorited ? 'text-accent' : 'text-subtle'),
        ].join(' ')}
        aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <IcHeart size={15} filled={favorited} />
      </button>

      {/* Image area */}
      <div
        className={[
          'w-full aspect-[1.2/1] rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden',
          unavailable ? 'opacity-50' : '',
        ].join(' ')}
        style={{ background: accent + '18' }}
      >
        {memoryPhoto ? (
          <img
            src={memoryPhoto}
            alt={recipe.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <FoodIcon name={recipe.sprites[0]} size={56} />
        )}

        {/* Cookability badge */}
        {(unavailable || low) && (
          <div
            className={[
              'absolute bottom-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold z-[1]',
              unavailable
                ? 'bg-red-500 text-white'
                : 'bg-amber-400 text-amber-900',
            ].join(' ')}
          >
            <IcAlert size={9} />
            {unavailable ? 'Falta ingrediente' : 'Estoque baixo'}
          </div>
        )}
      </div>

      {/* Text */}
      <div
        className={[
          'text-sm font-extrabold tracking-[-0.2px] truncate mb-1.5',
          unavailable ? 'text-muted' : 'text-ink',
        ].join(' ')}
      >
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
