import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecipes } from '@/api/recipes';
import { getLatestEntry } from '@/api/history';
import { getMemories } from '@/api/memories';
import { recipeCookability } from '@/utils/cookability';
import type { Recipe, FoodGlyphId, Difficulty, RecipeTag } from '@/types';
import type { RecipeDto } from '@/model/recipe';
import type { LatestEntryDto } from '@/api/history';

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
    id:           dto.id,
    name:         dto.name,
    tag:          dto.tag as RecipeTag,
    time:         dto.time,
    difficulty:   dto.difficulty as Difficulty,
    by:           dto.by.personId,
    cookedCount:  dto.cookedCount,
    rating:       dto.rating,
    bg:           dto.bg,
    accent:       dto.accent,
    servings:     dto.servings,
    why:          dto.why,
    nutrition:    dto.nutrition,
    sprites:      (dto.sprites ?? []).map((s) => s.sprite) as FoodGlyphId[],
    ingredients:  dto.ingredients.map((i) => ({ id: i.ingredient.id, qty: i.qty, unit: i.unit })),
    steps:        (dto.steps ?? []).map((s) => ({ t: s.title, d: s.desc, mins: s.mins })),
    favorite:     dto.favorite ?? false,
    cookability:  recipeCookability(dto),
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

function toMappedEntry(dto: LatestEntryDto): MappedHistoryEntry {
  return {
    recipeId:     dto.recipe.id,
    recipeName:   dto.recipe.name,
    recipeSprite: (dto.recipe.sprites[0]?.sprite ?? 'Tomato') as FoodGlyphId,
    by:           dto.by.personId as 'alex' | 'yuka',
    byName:       dto.by.name,
    rating:       dto.rating,
  };
}

export function useHomeData(filter: string, search: string) {
  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(() => {
    if (filter === 'saved') return { favorite: 'true' as const, search: debouncedSearch || undefined };
    if (filter === 'quick') return { timeMax: 25,               search: debouncedSearch || undefined };
    if (filter !== 'all')   return { tag: filter,               search: debouncedSearch || undefined };
    return { search: debouncedSearch || undefined };
  }, [filter, debouncedSearch]);

  const recipesQuery = useQuery({
    queryKey: ['recipes', params],
    queryFn:  () => getRecipes(params),
  });

  const latestQuery = useQuery({
    queryKey: ['history', 'latest'],
    queryFn:  getLatestEntry,
  });

  const memoriesQuery = useQuery({
    queryKey: ['memories'],
    queryFn:  getMemories,
  });

  const memoryPhotoMap = useMemo<Record<string, string>>(() => {
    const entries = memoriesQuery.data ?? [];
    const map: Record<string, string> = {};
    for (const m of entries) {
      if (m.photoUrl && !map[m.recipeId]) {
        map[m.recipeId] = m.photoUrl;
      }
    }
    return map;
  }, [memoriesQuery.data]);

  return {
    recipes:      (recipesQuery.data ?? []).map(toRecipe),
    latestEntry:  latestQuery.data ? toMappedEntry(latestQuery.data) : null,
    memoryPhotoMap,
    isLoading:    recipesQuery.isLoading || latestQuery.isLoading,
    isError:      recipesQuery.isError   || latestQuery.isError,
  };
}
