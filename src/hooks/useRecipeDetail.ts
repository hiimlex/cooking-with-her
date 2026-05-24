import { useQuery } from '@tanstack/react-query';
import { getRecipe } from '@/api/recipes';
import { getPantry } from '@/api/pantry';
import type { RecipeDto } from '@/model/recipe';
import type { Ingredient } from '@/types';

export interface RecipeDetailData {
  recipe:    RecipeDto | null;
  pantry:    Ingredient[];
  isLoading: boolean;
  isError:   boolean;
}

export function useRecipeDetail(id: string): RecipeDetailData {
  const recipeQuery = useQuery({
    queryKey: ['recipe', id],
    queryFn:  () => getRecipe(id),
    enabled:  !!id,
  });

  const pantryQuery = useQuery<Ingredient[]>({
    queryKey: ['pantry'],
    queryFn:  () => getPantry(),
  });

  return {
    recipe:    recipeQuery.data ?? null,
    pantry:    pantryQuery.data ?? [],
    isLoading: recipeQuery.isLoading || pantryQuery.isLoading,
    isError:   recipeQuery.isError,
  };
}
