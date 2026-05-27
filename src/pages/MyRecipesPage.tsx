import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip, Input } from '@/components/atoms';
import { RecipeRow, SubHeader } from '@/components/molecules';
import { IcPlus, IcSearch } from '@/icons';
import { getRecipes } from '@/api/recipes';
import { getMemories } from '@/api/memories';
import { recipeCookability } from '@/utils/cookability';
import type { RecipeDto } from '@/model/recipe';
import type { FoodGlyphId, Difficulty, RecipeTag } from '@/types';

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const FILTERS = [
  { id: 'all',    label: 'Todas'   },
  { id: 'saved',  label: 'Salvas'  },
  { id: 'quick',  label: 'Rápidas' },
  { id: 'Dinner', label: 'Jantar'  },
  { id: 'Brunch', label: 'Brunch'  },
  { id: 'Lunch',  label: 'Almoço'  },
];

function dtoToRow(dto: RecipeDto) {
  return {
    id:           dto.id,
    name:         dto.name,
    tag:          dto.tag as RecipeTag,
    time:         dto.time,
    difficulty:   dto.difficulty as Difficulty,
    by:           dto.by.personId as 'alex' | 'yuka',
    cookedCount:  dto.cookedCount,
    rating:       dto.rating,
    bg:           dto.bg,
    accent:       dto.accent,
    servings:     dto.servings,
    why:          dto.why,
    nutrition:    dto.nutrition,
    sprites:      (dto.sprites ?? []).map((s) => s.sprite) as FoodGlyphId[],
    ingredients:  dto.ingredients.map((i) => ({ id: i.ingredient.id, qty: i.qty, unit: i.unit })),
    steps:        (dto.steps ?? []).map((s) => ({ t: s.title, d: s.desc, mins: s.mins })),
    favorite:     dto.favorite ?? false,
    cookability:  recipeCookability(dto),
  };
}

export function MyRecipesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(() => {
    const q: Record<string, unknown> = {};
    if (debouncedSearch)      q.search   = debouncedSearch;
    if (filter === 'saved')   q.favorite = 'true';
    if (filter === 'quick')   q.timeMax  = 25;
    if (filter !== 'all' && filter !== 'saved' && filter !== 'quick') q.tag = filter;
    return Object.keys(q).length > 0 ? q : undefined;
  }, [debouncedSearch, filter]);

  const { data: dtos = [], isLoading: recipesLoading } = useQuery<RecipeDto[]>({
    queryKey: ['recipes', params],
    queryFn:  () => getRecipes(params as any),
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn:  getMemories,
  });

  const memoryPhotoMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const m of memories) {
      if (m.photoUrl && !map[m.recipeId]) {
        map[m.recipeId] = m.photoUrl;
      }
    }
    return map;
  }, [memories]);

  const recipes = dtos.map(dtoToRow);

  const sub = recipesLoading
    ? 'Carregando…'
    : `${recipes.length} salva${recipes.length !== 1 ? 's' : ''} juntos`;

  return (
    <div className="pb-[100px]">

      <div className="sticky top-0 z-20 bg-bg">
        <SubHeader
          onBack={() => navigate(-1 as never)}
          title="Minhas receitas"
          sub={sub}
          right={
            <Button variant="primary" icon={<IcPlus size={14} />} onClick={() => navigate('/us/recipes/add')}>
              Nova
            </Button>
          }
        />

        <div className="px-[18px] pt-1 pb-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
              <IcSearch size={16} />
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receita…"
              className="pl-[42px]"
            />
          </div>
        </div>

        <div className="flex gap-2 px-[18px] pb-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="px-[18px] flex flex-col gap-2.5 pt-1">
        {recipesLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[76px] bg-canvas rounded-2xl animate-pulse" />
            ))
          : recipes.length === 0
          ? (
            <div className="pt-10 text-center text-sm text-muted">
              Nenhuma receita encontrada
            </div>
          )
          : recipes.map((r) => (
              <RecipeRow
                key={r.id}
                recipe={r}
                memoryPhoto={memoryPhotoMap[r.id]}
                onClick={() => navigate(`/recipe/${r.id}`)}
              />
            ))}
      </div>
    </div>
  );
}
