import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStats } from '@/api/stats';
import { getHistory } from '@/api/history';
import type { HistoryEntryDto } from '@/model/recipe';

export type HistoryFilter = 'all' | 'alex' | 'yuka';

function isoDay(iso: string) {
  return iso.split('T')[0];
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  === 1) return 'Yesterday';
  if (days  < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function dayLabel(iso: string): string {
  const day   = isoDay(iso);
  const today = isoDay(new Date().toISOString());
  const yest  = isoDay(new Date(Date.now() - 86_400_000).toISOString());
  if (day === today) return 'Today';
  if (day === yest)  return 'Yesterday';
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diff < 7)  return date.toLocaleDateString('en', { weekday: 'long' });
  if (diff < 31) return date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function useStatsData() {
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn:  getStats,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['history', 50],
    queryFn:  () => getHistory({ limit: 50 }),
  });

  const allEntries: HistoryEntryDto[] = historyData?.entries ?? [];

  const entries = useMemo(
    () => filter === 'all'
      ? allEntries
      : allEntries.filter((e) => e.by.personId === filter),
    [allEntries, filter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, HistoryEntryDto[]>();
    for (const e of entries) {
      const label = dayLabel(e.cookedAt);
      const group = map.get(label) ?? [];
      group.push(e);
      map.set(label, group);
    }
    return [...map.entries()];
  }, [entries]);

  const recipeMap = useMemo(() => {
    const map = new Map<string, {
      recipe: HistoryEntryDto['recipe'];
      count: number;
      totalRating: number;
    }>();
    for (const e of allEntries) {
      const r = map.get(e.recipeId);
      if (r) { r.count++; r.totalRating += e.rating; }
      else map.set(e.recipeId, { recipe: e.recipe, count: 1, totalRating: e.rating });
    }
    return map;
  }, [allEntries]);

  const topRecipes = useMemo(
    () => [...recipeMap.values()].sort((a, b) => b.count - a.count).slice(0, 3),
    [recipeMap],
  );

  const uniqueRecipesCount = recipeMap.size;

  return {
    stats,
    entries,
    grouped,
    topRecipes,
    uniqueRecipesCount,
    total: historyData?.total ?? 0,
    isLoading: statsLoading || historyLoading,
    filter,
    setFilter,
  };
}
