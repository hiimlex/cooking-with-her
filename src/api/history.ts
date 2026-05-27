import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { HistoryQuery } from '@shared/api';
import type { HistoryResponse } from '@/model/recipe';

export async function getHistory(params?: HistoryQuery): Promise<HistoryResponse> {
  const { data } = await http.get<HistoryResponse>(ENDPOINTS.history.list, { params });
  return data;
}

export interface LatestEntryDto {
  id:       string;
  cookedAt: string;
  rating:   number;
  mealType: string;
  recipe: {
    id:      string;
    name:    string;
    sprites: Array<{ sprite: string }>;
  };
  by: { personId: string; name: string };
}

export async function getLatestEntry(): Promise<LatestEntryDto | null> {
  const { data } = await http.get<LatestEntryDto | null>(ENDPOINTS.history.latest);
  return data;
}
