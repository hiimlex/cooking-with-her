import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { OrderBody, OrderQuery } from '@shared/api';

export interface OrderEntry {
  id:        string;
  date:      string;
  note:      string | null;
  createdAt: string;
  coupleId:  string;
}

export type { OrderBody, OrderQuery };

export async function getOrders(params?: OrderQuery): Promise<OrderEntry[]> {
  const { data } = await http.get<OrderEntry[]>(ENDPOINTS.orders.list, { params });
  return data;
}

export async function addOrder(body: OrderBody): Promise<OrderEntry> {
  const { data } = await http.post<OrderEntry>(ENDPOINTS.orders.create, body);
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  await http.delete(ENDPOINTS.orders.delete(id));
}
