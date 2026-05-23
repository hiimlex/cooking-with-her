import { http } from '@/lib/http';
import type { Stats } from '@/types';

export async function getStats(): Promise<Stats> {
  const { data } = await http.get<Stats>('/stats');
  return data;
}
