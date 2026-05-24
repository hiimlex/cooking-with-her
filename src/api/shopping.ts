import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { ShoppingItemBody } from '@shared/api';
import type { PersonId, ShoppingEntry, Suggestion } from '@/types';

interface ShoppingEntryDto {
  id:   string;
  name: string;
  qty:  string;
  cat:  string;
  done: boolean;
  by:   { personId: string } | null;
}

export interface ShoppingSnapshot {
  items:       ShoppingEntry[];
  suggestions: Suggestion[];
}

export function toEntry(dto: ShoppingEntryDto): ShoppingEntry {
  return {
    id:   dto.id,
    name: dto.name,
    qty:  dto.qty,
    cat:  dto.cat,
    done: dto.done,
    by:   dto.cat === 'AI' ? 'ai' : (dto.by?.personId as PersonId) ?? 'other',
  };
}

export async function getShoppingList(): Promise<ShoppingSnapshot> {
  const { data } = await http.get<{ items: ShoppingEntryDto[]; suggestions: Suggestion[] }>(
    ENDPOINTS.shopping.list,
  );
  return { items: data.items.map(toEntry), suggestions: data.suggestions };
}

export async function addShoppingItem(payload: ShoppingItemBody): Promise<ShoppingEntry> {
  const { data } = await http.post<ShoppingEntryDto>(ENDPOINTS.shopping.create, payload);
  return toEntry(data);
}

export async function toggleShoppingItem(id: string): Promise<ShoppingEntry> {
  const { data } = await http.patch<ShoppingEntryDto>(ENDPOINTS.shopping.toggle(id));
  return toEntry(data);
}

export async function deleteShoppingItem(id: string): Promise<void> {
  await http.delete(ENDPOINTS.shopping.delete(id));
}

export async function clearDoneItems(): Promise<void> {
  await http.delete(ENDPOINTS.shopping.clearDone);
}
