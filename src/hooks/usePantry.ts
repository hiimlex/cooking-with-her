import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPantry, addIngredient, deleteIngredient, type IngredientBody } from '@/api/pantry';
import type { Ingredient, IngredientCat } from '@/types';

export function usePantry() {
  const [cat,          setCat]          = useState<'All' | IngredientCat>('All');
  const [search,       setSearch]       = useState('');
  const [showZero,     setShowZero]     = useState(false);
  const [debSearch,    setDebSearch]    = useState('');
  const debTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qc = useQueryClient();

  // Debounce search for backend query
  useEffect(() => {
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => setDebSearch(search), 280);
    return () => { if (debTimer.current) clearTimeout(debTimer.current); };
  }, [search]);

  // Full pantry — used for counts and expiring section
  const { data: allData, isLoading, isError } = useQuery<Ingredient[]>({
    queryKey: ['pantry'],
    queryFn:  () => getPantry(),
  });

  // Search results from backend when search is active
  const { data: searchData, isFetching: isSearching } = useQuery<Ingredient[]>({
    queryKey: ['pantry-search', debSearch, cat !== 'All' ? cat : ''],
    queryFn:  () => getPantry({
      search: debSearch,
      ...(cat !== 'All' ? { cat } : {}),
    }),
    enabled:   debSearch.trim().length > 0,
    staleTime: 10_000,
  });

  const ingredients = allData ?? [];

  const filtered = useMemo(() => {
    let list: Ingredient[];

    if (debSearch.trim().length > 0) {
      // Use backend search results, filtered by cat if needed (backend already filters)
      list = searchData ?? [];
    } else {
      // Local filter when no search
      list = ingredients.filter(
        (i) => cat === 'All' || i.cat === cat,
      );
    }

    // Apply qty=0 filter on top
    if (showZero) list = list.filter((i) => i.qty === 0);

    return list;
  }, [ingredients, searchData, debSearch, cat, showZero]);

  const expiring = useMemo(
    () => ingredients.filter((i) => i.expiry <= 4).sort((a, b) => a.expiry - b.expiry),
    [ingredients],
  );

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['pantry'] });
    qc.invalidateQueries({ queryKey: ['recipes'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const addMutation = useMutation({
    mutationFn: (payload: IngredientBody) => addIngredient(payload),
    onSuccess:  invalidateAll,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteIngredient(id),
    onSuccess:  invalidateAll,
  });

  return {
    ingredients,
    filtered,
    expiring,
    isLoading,
    isSearching,
    isError,
    cat,          setCat,
    search,       setSearch,
    showZero,     setShowZero,
    add:          addMutation.mutateAsync,
    isAdding:     addMutation.isPending,
    remove:       removeMutation.mutate,
  };
}
