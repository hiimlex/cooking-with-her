import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, API_BASE } from '@/lib/http';
import {
  getShoppingList,
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearDoneItems,
  toEntry,
  type ShoppingSnapshot,
} from '@/api/shopping';
import type { ShoppingItemBody } from '@shared/api';

const QK = ['shopping'] as const;

export function useShoppingList() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<ShoppingSnapshot>({
    queryKey: QK,
    queryFn:  getShoppingList,
  });

  useEffect(() => {
    let es: EventSource | null = null;
    let active = true;

    http.post<{ ticket: string }>('/shopping/events/ticket')
      .then(({ data }) => {
        if (!active) return;
        es = new EventSource(`${API_BASE}/shopping/events?ticket=${data.ticket}`);
        es.onmessage = (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data) as { type: string; items: any[]; suggestions: any[] };
            if (payload.type === 'update') {
              qc.setQueryData<ShoppingSnapshot>(QK, {
                items:       payload.items.map(toEntry),
                suggestions: payload.suggestions,
              });
            }
          } catch { /* ignore malformed frames */ }
        };
      })
      .catch(() => { /* SSE is best-effort */ });

    return () => { active = false; es?.close(); };
  }, [qc]);

  const invalidate = () => qc.invalidateQueries({ queryKey: QK });

  const addMutation    = useMutation({ mutationFn: (p: ShoppingItemBody) => addShoppingItem(p), onSuccess: invalidate });
  const toggleMutation = useMutation({ mutationFn: toggleShoppingItem, onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: deleteShoppingItem, onSuccess: invalidate });
  const clearMutation  = useMutation({ mutationFn: clearDoneItems,     onSuccess: invalidate });

  return {
    items:       data?.items       ?? [],
    suggestions: data?.suggestions ?? [],
    isLoading,
    isAdding:    addMutation.isPending,
    add:         addMutation.mutateAsync,
    toggle:      toggleMutation.mutate,
    remove:      deleteMutation.mutate,
    clearDone:   clearMutation.mutate,
  };
}
