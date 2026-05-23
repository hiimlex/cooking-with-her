import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecipes } from '@/api/recipes';
import { getStats } from '@/api/stats';
import { getHistory } from '@/api/history';
import type { Recipe, FoodGlyphId, Difficulty, RecipeTag } from '@/types';
import type { RecipeDto, HistoryEntryDto } from '@/model/recipe';

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function toRecipe(dto: RecipeDto): Recipe {
  return {
    id:          dto.id,
    name:        dto.name,
    tag:         dto.tag as RecipeTag,
    time:        dto.time,
    difficulty:  dto.difficulty as Difficulty,
    by:          dto.by.personId,
    cookedCount: dto.cookedCount,
    rating:      dto.rating,
    bg:          dto.bg,
    accent:      dto.accent,
    servings:    dto.servings,
    why:         dto.why,
    nutrition:   dto.nutrition,
    sprites:     dto.sprites.map((s) => s.sprite) as FoodGlyphId[],
    ingredients: dto.ingredients.map((i) => ({ id: i.ingredient.id, qty: i.qty, unit: i.unit })),
    steps:       dto.steps.map((s) => ({ t: s.title, d: s.desc, mins: s.mins })),
  };
}

export interface MappedHistoryEntry {
  recipeId:     string;
  recipeName:   string;
  recipeSprite: FoodGlyphId;
  by:           'alex' | 'yuka';
  byName:       string;
  rating:       number;
}

function toMappedEntry(dto: HistoryEntryDto): MappedHistoryEntry {
  return {
    recipeId:     dto.recipe.id,
    recipeName:   dto.recipe.name,
    recipeSprite: (dto.recipe.sprites[0]?.sprite ?? 'Tomato') as FoodGlyphId,
    by:           dto.by.personId,
    byName:       dto.by.name,
    rating:       dto.rating,
  };
}

export function useHomeData(filter: string, search: string) {
  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(() => {
    if (filter === 'quick') return { timeMax: 25, search: debouncedSearch || undefined };
    if (filter !== 'all')   return { tag: filter,  search: debouncedSearch || undefined };
    return { search: debouncedSearch || undefined };
  }, [filter, debouncedSearch]);

  const recipesQuery = useQuery({
    queryKey: ['recipes', params],
    queryFn:  () => getRecipes(params),
  });

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn:  getStats,
  });

  const historyQuery = useQuery({
    queryKey: ['history', 'latest'],
    queryFn:  () => getHistory({ limit: 1 }),
  });

  return {
    recipes:     (recipesQuery.data ?? []).map(toRecipe),
    stats:       statsQuery.data ?? null,
    latestEntry: historyQuery.data?.entries[0] ? toMappedEntry(historyQuery.data.entries[0]) : null,
    isLoading:   recipesQuery.isLoading || statsQuery.isLoading || historyQuery.isLoading,
    isError:     recipesQuery.isError   || statsQuery.isError   || historyQuery.isError,
  };
}
