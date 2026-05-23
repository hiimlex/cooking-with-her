// src/pages/RecipeDetailPage.tsx
import { useState } from 'react';
import { Avatar, Button, Card, FoodIcon, Label, Rating } from '@/components/atoms';
import { Callout, DetailStat } from '@/components/molecules';
import { NutritionCard } from '@/components/organisms';
import { FOOD_GLYPHS, IcChevLeft, IcChevRight, IcClock, IcHeart } from '@/icons';
import { COUPLE, INGREDIENTS, RECIPES } from '@/data/mock';
import type { Recipe } from '@/types';

const BLURBS: Record<string, string> = {
  shakshuka:  "Eggs poached in a spiced tomato sauce — a Sunday brunch classic. Make it bubbly, serve with crusty bread, eat from the pan.",
  salmon:     "A 20-minute weeknight star. Crispy-skin salmon basted in browned butter, garlic, and lemon. Tastes restaurant-fancy.",
  carbonara:  "The real Roman way — no cream, ever. Just eggs, cheese, fat, and pasta water emulsified into a silky sauce. Off heat, always.",
  stirfry:    "The fastest dinner you'll ever make. Sear hot, sear fast. Sauce hits the screaming wok and turns into glaze in 30 seconds.",
  tomatosoup: "Roasted tomatoes blitzed silky with cream and basil — a cozy hug in bowl form. Pairs with grilled cheese, obviously.",
  fishtaco:   "Crispy fried fish, sharp slaw, charred tortillas. Squeeze of lime, eat immediately while the fish is still shattering-crisp.",
};

export interface RecipeDetailPageProps {
  recipeId?: string;
  onBack?: () => void;
  onCook?: (id: string) => void;
}

export function RecipeDetailPage({
  recipeId = 'salmon', onBack, onCook,
}: RecipeDetailPageProps) {
  const r: Recipe | undefined = RECIPES.find((x) => x.id === recipeId);
  const [tab, setTab] = useState<'details' | 'recipe'>('details');
  const [liked, setLiked] = useState(false);

  if (!r) return null;

  const haveMap = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i.qty]));
  const missing = r.ingredients.filter((ing) => (haveMap[ing.id] || 0) === 0);
  const accent = FOOD_GLYPHS[r.sprites[0]].color;

  return (
    <div className="pb-[110px] bg-bg min-h-full relative">
      {/* Top bar — glass */}
      <div className="pt-[54px] px-[18px] flex items-center justify-between">
        <button
          onClick={onBack}
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
        className="mx-[18px] my-[18px] py-6 rounded-[24px] flex items-center justify-center relative"
        style={{ background: accent + '15' }}
      >
        <FoodIcon name={r.sprites[0]} size={140} />
      </div>

      {/* Title block */}
      <div className="px-[18px] pb-[18px]">
        <h1 className="m-0 text-[30px] font-extrabold text-ink tracking-[-0.7px] leading-[1.05]">
          {r.name}
        </h1>
        <div className="mt-2.5 flex items-center gap-3.5 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1">
            <IcClock size={14} className="text-accent" />
            <b className="text-ink">{r.time} min</b>
          </span>
          <Rating value={r.rating.toFixed(1)} count={r.cookedCount} size={13} />
          <span className="inline-flex items-center gap-1">
            <Avatar who={r.by} size={18} />
            <span>by {COUPLE[r.by].name}</span>
          </span>
        </div>
      </div>

      {/* Ingredients (circle row) */}
      <div className="px-[18px] pb-[22px]">
        <h2 className="m-0 mb-3.5 text-lg font-extrabold text-ink tracking-[-0.3px]">Ingredients</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {r.ingredients.map((ing) => {
            const def = INGREDIENTS.find((x) => x.id === ing.id);
            const enough = (haveMap[ing.id] || 0) >= ing.qty;
            const c = FOOD_GLYPHS[def?.sprite || 'Bread'].color;
            return (
              <div key={ing.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                <div
                  className={[
                    'w-14 h-14 rounded-full flex items-center justify-center relative',
                    enough ? '' : 'opacity-50',
                  ].join(' ')}
                  style={{ background: c + '20' }}
                >
                  <FoodIcon name={def?.sprite || 'Bread'} size={34} />
                  {!enough && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-danger text-white flex items-center justify-center text-[11px] font-extrabold">
                      !
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-muted font-semibold text-center truncate w-full">
                  {def?.name?.split(' ')[0] || ing.id}
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
          <p className="m-0 text-sm text-muted leading-[1.6]">
            {BLURBS[r.id] ?? `A ${r.difficulty.toLowerCase()} ${r.tag.toLowerCase()} you've made ${r.cookedCount} times.`}
          </p>
          <div className="mt-[18px] grid grid-cols-3 gap-2.5">
            <DetailStat label="Time" value={`${r.time}m`} />
            <DetailStat label="Difficulty" value={r.difficulty} />
            <DetailStat label="Servings" value={r.servings ?? 2} />
          </div>

          {r.nutrition && <NutritionCard nutrition={r.nutrition} />}
        </div>
      ) : (
        <div className="px-[18px] pt-[18px] flex flex-col gap-2.5">
          {r.steps.map((s, i) => (
            <div key={i} className="flex gap-3.5 py-1">
              <div className="w-8 h-8 rounded-2xl bg-accent-tint text-accent flex items-center justify-center text-sm font-extrabold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="text-sm font-bold text-ink">{s.t}</div>
                  <span className="text-xs text-subtle font-semibold">{s.mins}m</span>
                </div>
                <div className="text-[13px] text-muted leading-[1.5]">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky cook CTA — glass */}
      <div
        className="absolute left-0 right-0 bottom-0 z-25 px-[18px] pt-3.5 pb-7"
        style={{
          background: 'linear-gradient(180deg, rgba(250,248,255,0) 0%, rgba(250,248,255,0.85) 30%, rgba(250,248,255,1) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <Button variant="primary" size="lg" full onClick={() => onCook?.(r.id)}>
          Let's cook it <IcChevRight size={16} />
        </Button>
      </div>
    </div>
  );
}
