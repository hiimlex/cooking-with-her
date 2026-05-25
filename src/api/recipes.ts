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

export async function toggleFavorite(id: string): Promise<{ id: string; favorite: boolean }> {
  const { data } = await http.patch<{ id: string; favorite: boolean }>(ENDPOINTS.recipes.favorite(id));
  return data;
}

export async function updateRecipe(
  id: string,
  body: {
    name?:        string;
    tag?:         string;
    time?:        number;
    difficulty?:  string;
    why?:         string;
    servings?:    number;
    steps?:       Array<{ title: string; desc: string; mins: number }>;
    ingredients?: Array<{ ingredientId: string; qty: number; unit: string }>;
  },
): Promise<RecipeDto> {
  const { data } = await http.put<RecipeDto>(ENDPOINTS.recipes.update(id), body);
  return data;
}

export async function finishRecipe(
  id: string,
  body: { rating?: number; note?: string; mealType?: 'dinner' | 'free' } = {},
): Promise<void> {
  await http.post(ENDPOINTS.recipes.finish(id), body);
}

export async function saveAIRecipe(recipe: {
  name:        string;
  tag:         string;
  time:        number;
  difficulty:  string;
  bg:          string;
  accent:      string;
  servings:    number;
  why:         string;
  sprites:     string[];
  nutrition:   { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
  ingredients: Array<{ name: string; qty: number; unit: string }>;
  steps:       Array<{ title: string; desc: string; mins: number }>;
}): Promise<RecipeDto> {
  const { data } = await http.post<RecipeDto>(ENDPOINTS.recipes.fromAI, recipe);
  return data;
}
