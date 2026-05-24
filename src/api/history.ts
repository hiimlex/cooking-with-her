import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { HistoryQuery } from '@shared/api';
import type { HistoryResponse } from '@/model/recipe';

export async function getHistory(params?: HistoryQuery): Promise<HistoryResponse> {
  const { data } = await http.get<HistoryResponse>(ENDPOINTS.history.list, { params });
  return data;
}
