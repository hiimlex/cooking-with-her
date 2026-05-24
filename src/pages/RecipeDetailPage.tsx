import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, FoodIcon, Label, Rating } from '@/components/atoms';
import { Callout, DetailStat } from '@/components/molecules';
import { NutritionCard } from '@/components/organisms';
import { CAT_ICON, FOOD_GLYPHS, IcChevLeft, IcChevRight, IcClock, IcHeart } from '@/icons';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import type { FoodGlyphId, IngredientCat } from '@/types';

export function RecipeDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { recipe, pantry, isLoading } = useRecipeDetail(id);
  const [tab, setTab]   = useState<'details' | 'recipe'>('details');
  const [liked, setLiked] = useState(false);

  if (isLoading) {
    return (
      <div className="pb-[110px] bg-bg min-h-full">
        <div className="pt-[54px] px-[18px] flex items-center justify-between">
          <div className="w-[42px] h-[42px] rounded-full bg-canvas animate-pulse" />
          <div className="w-[42px] h-[42px] rounded-full bg-canvas animate-pulse" />
        </div>
        <div className="mx-[18px] my-[18px] h-[200px] bg-canvas rounded-[24px] animate-pulse" />
        <div className="px-[18px]">
          <div className="h-8 w-48 bg-canvas rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-32 bg-canvas rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  const pantryMap = Object.fromEntries(pantry.map((i) => [i.id, i.qty]));
  const missing   = recipe.ingredients.filter((ing) => (pantryMap[ing.ingredient.id] ?? 0) === 0);
  const sprite0   = (recipe.sprites[0]?.sprite ?? 'Tomato') as FoodGlyphId;
  const accent    = FOOD_GLYPHS[sprite0]?.color ?? recipe.accent;

  return (
    <div className="pb-[110px] bg-bg min-h-full relative">
      {/* Top bar */}
      <div className="pt-[54px] px-[18px] flex items-center justify-between">
        <button
          onClick={() => navigate(-1 as never)}
          className="glass-soft w-[42px] h-[42px] rounded-full inline-flex items-center justify-center text-ink"
        >
          <IcChevLeft size={18} />
        </button>
        <button
          onClick={() => setLiked((v) => !v)}
          className={[
            'w-[42px] h-[42px] rounded-full inline-flex items-center justify-center',
            liked ? 'bg-accent text-white' : 'glass-soft text-ink',
          ].join(' ')}
        >
          <IcHeart size={16} filled={liked} />
        </button>
      </div>

      {/* Hero */}
      <div
        className="mx-[18px] my-[18px] py-6 rounded-[24px] flex items-center justify-center"
        style={{ background: accent + '15' }}
      >
        <FoodIcon name={sprite0} size={140} />
      </div>

      {/* Title block */}
      <div className="px-[18px] pb-[18px]">
        <h1 className="m-0 text-[30px] font-extrabold text-ink tracking-[-0.7px] leading-[1.05]">
          {recipe.name}
        </h1>
        <div className="mt-2.5 flex items-center gap-3.5 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1">
            <IcClock size={14} className="text-accent" />
            <b className="text-ink">{recipe.time} min</b>
          </span>
          <Rating value={recipe.rating.toFixed(1)} count={recipe.cookedCount} size={13} />
          <span className="text-muted">by {recipe.by.name}</span>
        </div>
      </div>

      {/* Ingredients row */}
      <div className="px-[18px] pb-[22px]">
        <h2 className="m-0 mb-3.5 text-lg font-extrabold text-ink tracking-[-0.3px]">Ingredients</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {recipe.ingredients.map((ing) => {
            const cat    = ing.ingredient.cat as IngredientCat;
            const icon   = CAT_ICON[cat] ?? 'Tomato';
            const c      = FOOD_GLYPHS[icon]?.color ?? '#888';
            const enough = (pantryMap[ing.ingredient.id] ?? 0) >= ing.qty;
            return (
              <div key={ing.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                <div
                  className={[
                    'w-14 h-14 rounded-full flex items-center justify-center relative',
                    enough ? '' : 'opacity-50',
                  ].join(' ')}
                  style={{ background: c + '20' }}
                >
                  <FoodIcon name={icon} size={34} />
                  {!enough && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-danger text-white flex items-center justify-center text-[11px] font-extrabold">
                      !
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-muted font-semibold text-center truncate w-full">
                  {ing.ingredient.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {missing.length > 0 && (
          <div className="mt-3">
            <Callout tone="attention" title={`${missing.length} ingredient${missing.length > 1 ? 's' : ''} missing`}>
              Tap shopping list to add, or ask Nonna for swaps.
            </Callout>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-[18px]">
        <div className="flex gap-6 border-b border-canvas">
          {(['details', 'recipe'] as const).map((tk) => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={[
                '-mb-px py-2.5 text-[15px] font-bold capitalize transition-colors',
                tab === tk
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted border-b-2 border-transparent',
              ].join(' ')}
            >
              {tk}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'details' ? (
        <div className="px-[18px] pt-[18px]">
          {recipe.why && (
            <p className="m-0 mb-[18px] text-sm text-muted leading-[1.6]">{recipe.why}</p>
          )}
          <div className="grid grid-cols-3 gap-2.5">
            <DetailStat label="Time"       value={`${recipe.time}m`} />
            <DetailStat label="Difficulty" value={recipe.difficulty} />
            <DetailStat label="Servings"   value={recipe.servings ?? 2} />
          </div>

          {recipe.nutrition && (
            <NutritionCard nutrition={{
              kcal:    recipe.nutrition.kcal,
              protein: recipe.nutrition.protein,
              carbs:   recipe.nutrition.carbs,
              fat:     recipe.nutrition.fat,
              fiber:   recipe.nutrition.fiber,
            }} />
          )}

          {recipe.cookedCount > 0 && (
            <div className="mt-[18px]">
              <Card className="p-3 flex items-center gap-3">
                <div className="flex-1 text-[13px] text-muted">
                  Cooked together <b className="text-ink">{recipe.cookedCount}×</b>
                </div>
                <Rating value={recipe.rating.toFixed(1)} size={13} />
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="px-[18px] pt-[18px] flex flex-col gap-2.5">
          {recipe.steps.map((s, i) => (
            <div key={s.id} className="flex gap-3.5 py-1">
              <div className="w-8 h-8 rounded-2xl bg-accent-tint text-accent flex items-center justify-center text-sm font-extrabold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="text-sm font-bold text-ink">{s.title}</div>
                  <span className="text-xs text-subtle font-semibold">{s.mins}m</span>
                </div>
                <div className="text-[13px] text-muted leading-[1.5]">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky cook CTA */}
      <div
        className="absolute left-0 right-0 bottom-0 z-25 px-[18px] pt-3.5 pb-7"
        style={{
          background:          'linear-gradient(180deg, rgba(250,248,255,0) 0%, rgba(250,248,255,0.85) 30%, rgba(250,248,255,1) 100%)',
          backdropFilter:      'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
        }}
      >
        <Button variant="primary" size="lg" full onClick={() => navigate(`/cook/${recipe.id}`)}>
          Let's cook it <IcChevRight size={16} />
        </Button>
      </div>
    </div>
  );
}
