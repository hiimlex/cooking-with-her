import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, FoodIcon, Label, Rating } from '@/components/atoms';
import { Callout, DetailStat } from '@/components/molecules';
import { NutritionCard } from '@/components/organisms';
import { CAT_ICON, FOOD_GLYPHS, IcChevLeft, IcChevRight, IcClock, IcHeart, IcPencil, IcSparkle } from '@/icons';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { improveStepsAI } from '@/api/ai';
import { toggleFavorite, updateRecipe } from '@/api/recipes';
import { diffPT } from '@/utils/labels';
import { formatQtyForUnit } from '@/utils/units';
import type { FoodGlyphId, IngredientCat } from '@/types';

export function RecipeDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { recipe, pantry, isLoading } = useRecipeDetail(id);
  const [tab,           setTab]           = useState<'details' | 'recipe'>('details');
  const [liked,         setLiked]         = useState(false);
  const [improvedSteps, setImprovedSteps] = useState<Array<{ title: string; desc: string; mins: number }> | null>(null);

  useEffect(() => {
    if (recipe) setLiked(recipe.favorite ?? false);
  }, [recipe?.id, recipe?.favorite]);

  const favMutation = useMutation({
    mutationFn: () => toggleFavorite(id),
    onMutate: () => setLiked((v) => !v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => setLiked((v) => !v),
  });

  const improveMutation = useMutation({
    mutationFn: () => improveStepsAI(recipe!.name, {
      steps:      recipe!.steps.map((s) => ({ title: s.title, desc: s.desc, mins: s.mins })),
      ingredients: recipe!.ingredients.map((ri) => ({
        name: ri.ingredient.name,
        qty:  ri.qty,
        unit: ri.unit,
      })),
      tag:        recipe!.tag,
      time:       recipe!.time,
      difficulty: recipe!.difficulty,
      servings:   recipe!.servings,
    }),
    onSuccess: (steps) => setImprovedSteps(steps),
  });

  const applyStepsMutation = useMutation({
    mutationFn: () => updateRecipe(id, { steps: improvedSteps! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      setImprovedSteps(null);
    },
  });

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
  const missing   = recipe.ingredients.filter(
    (ing) => !ing.optional && !ing.ingredient.alwaysAvailable && (pantryMap[ing.ingredient.id] ?? 0) === 0,
  );
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/recipe/${id}/edit`)}
            className="glass-soft w-[42px] h-[42px] rounded-full inline-flex items-center justify-center text-ink"
          >
            <IcPencil size={16} />
          </button>
          <button
            onClick={() => favMutation.mutate()}
            disabled={favMutation.isPending}
            className={[
              'w-[42px] h-[42px] rounded-full inline-flex items-center justify-center transition-colors',
              liked ? 'bg-accent text-white' : 'glass-soft text-ink',
            ].join(' ')}
          >
            <IcHeart size={16} filled={liked} />
          </button>
        </div>
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
          <span className="text-muted">por {recipe.by.name}</span>
        </div>
      </div>

      {/* Ingredients row */}
      <div className="px-[18px] pb-[22px]">
        <h2 className="m-0 mb-3.5 text-lg font-extrabold text-ink tracking-[-0.3px]">Ingredientes</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {recipe.ingredients.map((ing) => {
            const cat         = ing.ingredient.cat as IngredientCat;
            const icon        = CAT_ICON[cat] ?? 'Tomato';
            const c           = FOOD_GLYPHS[icon]?.color ?? '#888';
            const alwaysAvail = ing.ingredient.alwaysAvailable;
            const enough      = alwaysAvail || (pantryMap[ing.ingredient.id] ?? 0) >= ing.qty;
            const isOptional  = ing.optional;
            return (
              <div key={ing.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                <div
                  className={[
                    'w-14 h-14 rounded-full flex items-center justify-center relative',
                    enough ? '' : isOptional ? 'opacity-40' : 'opacity-50',
                  ].join(' ')}
                  style={{ background: c + '20' }}
                >
                  <FoodIcon name={icon} size={34} />
                  {!enough && !isOptional && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-danger text-white flex items-center justify-center text-[11px] font-extrabold">
                      !
                    </div>
                  )}
                  {isOptional && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-canvas border border-canvas text-muted flex items-center justify-center text-[8px] font-extrabold">
                      opc
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-ink font-semibold text-center truncate w-full leading-tight">
                  {ing.ingredient.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-muted text-center leading-tight -mt-0.5">
                  {formatQtyForUnit(ing.qty, ing.unit)} {ing.unit}
                </div>
              </div>
            );
          })}
        </div>

        {missing.length > 0 && (
          <div className="mt-3">
            <Callout tone="attention" title={`${missing.length} ingrediente${missing.length > 1 ? 's' : ''} faltando`}>
              Adicione na lista de compras ou peça à Nonna uma substituição.
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
              {tk === 'details' ? 'Detalhes' : 'Preparo'}
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
            <DetailStat label="Tempo"       value={`${recipe.time}m`} />
            <DetailStat label="Dificuldade" value={diffPT(recipe.difficulty)} />
            <DetailStat label="Porções"     value={recipe.servings ?? 2} />
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
                  Cozinharam juntos <b className="text-ink">{recipe.cookedCount}×</b>
                </div>
                <Rating value={recipe.rating.toFixed(1)} size={13} />
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="px-[18px] pt-[18px] flex flex-col gap-2.5">

          {/* Improve with AI banner or button */}
          {improvedSteps ? (
            <div className="rounded-2xl border-2 border-accent bg-accent-tint px-4 py-3 flex flex-col gap-2.5 mb-1">
              <div className="flex items-center gap-2 text-sm font-bold text-accent">
                <IcSparkle size={14} />
                Nonna melhorou os passos — quer aplicar?
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => applyStepsMutation.mutate()}
                  disabled={applyStepsMutation.isPending}
                >
                  {applyStepsMutation.isPending ? 'Salvando…' : 'Aplicar'}
                </Button>
                <Button size="sm" onClick={() => setImprovedSteps(null)}>
                  Descartar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end mb-1">
              <Button
                variant="soft"
                size="sm"
                icon={<IcSparkle size={12} />}
                onClick={() => improveMutation.mutate()}
                disabled={improveMutation.isPending || recipe.steps.length === 0}
              >
                {improveMutation.isPending ? 'Perguntando à Nonna…' : 'Melhorar com IA'}
              </Button>
            </div>
          )}

          {improveMutation.isError && (
            <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600 mb-1">
              A Nonna não conseguiu melhorar agora. Tente de novo.
            </div>
          )}

          {/* Steps list — show improved preview or current */}
          {(() => {
            const displaySteps = improvedSteps ?? recipe.steps.map((s) => ({ ...s }));
            const totalMins    = displaySteps.reduce((sum, s) => sum + (s.mins ?? 0), 0);
            return (
              <>
                {totalMins > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] text-muted font-semibold mb-0.5 px-0.5">
                    <IcClock size={12} className="text-accent" />
                    Tempo total dos passos: <span className="text-ink">{totalMins} min</span>
                  </div>
                )}

                <div className="flex flex-col">
                  {displaySteps.map((s, i) => {
                    const isLast = i === displaySteps.length - 1;
                    return (
                      <div key={i} className="flex gap-3">
                        {/* Timeline column */}
                        <div className="flex flex-col items-center flex-shrink-0 w-8">
                          <div className={[
                            'w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-extrabold flex-shrink-0',
                            improvedSteps
                              ? 'bg-accent text-white'
                              : 'bg-accent-tint text-accent',
                          ].join(' ')}>
                            {i + 1}
                          </div>
                          {!isLast && (
                            <div className="w-[2px] flex-1 my-1 rounded-full bg-canvas min-h-[12px]" />
                          )}
                        </div>

                        {/* Content card */}
                        <div className={[
                          'flex-1 min-w-0 mb-3 rounded-2xl px-3.5 py-3',
                          improvedSteps ? 'bg-accent-tint' : 'bg-canvas',
                        ].join(' ')}>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="text-sm font-bold text-ink leading-tight">{s.title}</div>
                            <span className={[
                              'flex-shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-xl',
                              improvedSteps
                                ? 'bg-accent/15 text-accent'
                                : 'bg-card text-muted',
                            ].join(' ')}>
                              {s.mins}m
                            </span>
                          </div>
                          <div className="text-[13px] text-muted leading-[1.55]">{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Sticky CTA */}
      <div
        className="absolute left-0 right-0 bottom-0 z-25 px-[18px] pt-3.5 pb-7"
        style={{
          background:           'linear-gradient(180deg, transparent 0%, var(--c-bg) 40%)',
          backdropFilter:       'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <Button variant="primary" size="lg" full onClick={() => navigate(`/cook/${recipe.id}`)}>
          Vamos cozinhar <IcChevRight size={16} />
        </Button>
      </div>
    </div>
  );
}
