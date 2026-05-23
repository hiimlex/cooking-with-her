import { http } from '@/lib/http';
import type { RecipeDto } from '@/model/recipe';

export async function getRecipes(params?: { tag?: string; search?: string; difficulty?: string; timeMax?: number }): Promise<RecipeDto[]> {
  const { data } = await http.get<RecipeDto[]>('/recipes', { params });
  return data;
}
