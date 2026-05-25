import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { MemoryBody } from '@shared/api';

export interface MemoryDto {
  id:       string;
  recipeId: string;
  byId:     string;
  date:     string;
  bg:       string;
  photoUrl: string | null;
  recipe:   { id: string; name: string; sprites: { sprite: string }[] };
  by:       { id: string; personId: string; name: string };
}

export async function getMemories(): Promise<MemoryDto[]> {
  const { data } = await http.get<MemoryDto[]>(ENDPOINTS.memories.list);
  return data;
}

export async function createMemory(body: MemoryBody): Promise<MemoryDto> {
  const { data } = await http.post<MemoryDto>(ENDPOINTS.memories.create, body);
  return data;
}
