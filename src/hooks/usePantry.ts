import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPantry, addIngredient, deleteIngredient, type IngredientBody } from '@/api/pantry';
import type { Ingredient, IngredientCat } from '@/types';

export function usePantry() {
  const [cat, setCat]       = useState<'All' | IngredientCat>('All');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<Ingredient[]>({
    queryKey: ['pantry'],
    queryFn:  () => getPantry(),
  });

  const ingredients = data ?? [];

  const filtered = useMemo(
    () =>
      ingredients.filter(
        (i) =>
          (cat === 'All' || i.cat === cat) &&
          i.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [ingredients, cat, search],
  );

  const expiring = useMemo(
    () =>
      ingredients
        .filter((i) => i.expiry <= 4)
        .sort((a, b) => a.expiry - b.expiry),
    [ingredients],
  );

  const addMutation = useMutation({
    mutationFn: (payload: IngredientBody) => addIngredient(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteIngredient(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });

  return {
    ingredients,
    filtered,
    expiring,
    isLoading,
    isError,
    cat,
    setCat,
    search,
    setSearch,
    add:      addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    remove:   removeMutation.mutate,
  };
}
