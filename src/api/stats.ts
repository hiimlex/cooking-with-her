import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { Stats } from '@/types';

export async function getStats(): Promise<Stats> {
  const { data } = await http.get<Stats>(ENDPOINTS.stats.get);
  return data;
}
