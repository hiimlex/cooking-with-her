import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { RecipesQuery } from '@shared/api';
import type { RecipeDto } from '@/model/recipe';

export async function getRecipes(params?: RecipesQuery): Promise<RecipeDto[]> {
  const { data } = await http.get<RecipeDto[]>(ENDPOINTS.recipes.list, { params });
  return data;
}

export async function getRecipe(id: string): Promise<RecipeDto> {
  const { data } = await http.get<RecipeDto>(ENDPOINTS.recipes.get(id));
  return data;
}
