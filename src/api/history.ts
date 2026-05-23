import { http } from '@/lib/http';
import type { HistoryEntryDto } from '@/model/recipe';

interface HistoryResponse {
  entries: HistoryEntryDto[];
  total: number;
}

export async function getHistory(params?: { limit?: number; offset?: number; personId?: string }): Promise<HistoryResponse> {
  const { data } = await http.get<HistoryResponse>('/history', { params });
  return data;
}
