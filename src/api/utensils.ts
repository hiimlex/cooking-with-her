import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';

export interface UtensilDto {
  id:    string;
  name:  string;
  emoji: string;
  have:  boolean;
}

export async function getUtensils(): Promise<UtensilDto[]> {
  const { data } = await http.get<UtensilDto[]>(ENDPOINTS.utensils.list);
  return data;
}

export async function patchUtensil(id: string, patch: { have?: boolean }): Promise<UtensilDto> {
  const { data } = await http.patch<UtensilDto>(ENDPOINTS.utensils.patch(id), patch);
  return data;
}
