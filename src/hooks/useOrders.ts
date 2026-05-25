import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addOrder, deleteOrder, getOrders } from '@/api/orders';
import type { OrderQuery } from '@/api/orders';

export function useOrders(params?: OrderQuery) {
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', params],
    queryFn:  () => getOrders(params),
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: addOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  return { orders, isLoading, addMutation, deleteMutation };
}
