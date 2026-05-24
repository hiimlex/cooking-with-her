import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { IngredientBody, PantryQuery } from '@shared/api';
import type { Ingredient, IngredientCat } from '@/types';

export type { IngredientBody, PantryQuery };

interface IngredientDto {
  id:          string;
  name:        string;
  qty:         number;
  unit:        string;
  cat:         string;
  expiry:      number;
  monthlyBuy?: number | null;
}

function toIngredient(dto: IngredientDto): Ingredient {
  return {
    id:          dto.id,
    name:        dto.name,
    qty:         dto.qty,
    unit:        dto.unit,
    cat:         dto.cat as IngredientCat,
    expiry:      dto.expiry,
    monthlyBuy:  dto.monthlyBuy ?? undefined,
  };
}

export async function getPantry(params?: PantryQuery): Promise<Ingredient[]> {
  const { data } = await http.get<IngredientDto[]>(ENDPOINTS.pantry.list, { params });
  return data.map(toIngredient);
}

export async function addIngredient(payload: IngredientBody): Promise<Ingredient> {
  const { data } = await http.post<IngredientDto>(ENDPOINTS.pantry.create, payload);
  return toIngredient(data);
}

export async function updateIngredient(id: string, payload: Partial<IngredientBody>): Promise<Ingredient> {
  const { data } = await http.put<IngredientDto>(ENDPOINTS.pantry.update(id), payload);
  return toIngredient(data);
}

export async function deleteIngredient(id: string): Promise<void> {
  await http.delete(ENDPOINTS.pantry.delete(id));
}
