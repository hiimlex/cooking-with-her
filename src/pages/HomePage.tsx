import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Card, Chip, FoodIcon, Input, Rating } from '@/components/atoms';
import { RecipeCard, Section } from '@/components/molecules';
import { IcChevRight, IcHeart, IcSearch, IcSparkle, IcX } from '@/icons';
import { FOOD_GLYPHS } from '@/icons';
import { useHomeData } from '@/hooks/useHomeData';
import { useOrders } from '@/hooks/useOrders';
import { toggleFavorite } from '@/api/recipes';

const FILTERS = [
  { id: 'all',     label: 'Todas'    },
  { id: 'saved',   label: 'Salvas' },
  { id: 'quick',   label: 'Rápidas'  },
  { id: 'Dinner',  label: 'Jantar'   },
  { id: 'Brunch',  label: 'Brunch'   },
  { id: 'Lunch',   label: 'Almoço'   },
];

export function HomePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderNote, setOrderNote] = useState('');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { orders: todayOrders, addMutation: addOrder, deleteMutation: deleteOrder } = useOrders({ from: today, to: today });
  const todayOrder = todayOrders[0] ?? null;

  const handleSaveOrder = async () => {
    await addOrder.mutateAsync({ date: today, note: orderNote.trim() || undefined });
    setShowOrderForm(false);
    setOrderNote('');
  };

  const { recipes: allRecipes, latestEntry, memoryPhotoMap, isLoading } = useHomeData(filter, search);

  // Na home, esconde receitas que não podem ser feitas (ingrediente obrigatório em falta)
  const recipes = allRecipes.filter((r) => r.cookability !== 'unavailable');

  const favMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  });

  const entryAccent = latestEntry
    ? FOOD_GLYPHS[latestEntry.recipeSprite]?.color ?? '#888'
    : '#888';

  const sectionTitle = filter === 'saved' ? 'Salvas' : 'Populares';

  return (
    <div>
      {/* Header */}
      <div className="pt-[54px] px-[18px] pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="min-w-0">
            <div className="text-[13px] text-muted">Oi, Alex & Yuka</div>
            <h1 className="m-0 mt-0.5 text-[26px] font-extrabold text-ink tracking-[-0.6px]">
              O que cozinhamos hoje?
            </h1>
          </div>
          <div className="flex">
            <div className="-mr-2.5"><Avatar who="alex" size={36} ring /></div>
            <Avatar who="yuka" size={36} ring />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-[18px] pb-[18px]">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            <IcSearch size={16} />
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar receita perfeita"
            className="pl-[42px]"
          />
        </div>
      </div>

      {/* Ask Nonna */}
      <div className="px-[18px] pb-[22px]">
        <button
          onClick={() => navigate('/ai')}
          className="w-full text-left bg-accent text-white rounded-[20px] px-[18px] py-4 flex items-center gap-3.5"
        >
          <div
            className="w-[42px] h-[42px] rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            <IcSparkle size={20} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold opacity-85">Ask Nonna</div>
            <div className="text-[17px] font-extrabold tracking-[-0.3px]">O que cozinhamos hoje?</div>
          </div>
          <IcChevRight size={18} />
        </button>
      </div>

      {/* Pedi fora hoje */}
      <div className="px-[18px] pb-[18px]">
        {todayOrder ? (
          <div className="flex items-center gap-3 rounded-[20px] px-[18px] py-3.5 border" style={{ background: '#fffbeb', borderColor: '#fcd34d' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7' }}>
              <span className="text-base font-bold" style={{ color: '#d97706' }}>!</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold" style={{ color: '#92400e' }}>Pedimos fora hoje</div>
              {todayOrder.note && (
                <div className="text-xs truncate" style={{ color: '#b45309' }}>{todayOrder.note}</div>
              )}
            </div>
            <button
              onClick={() => deleteOrder.mutate(todayOrder.id)}
              className="text-subtle hover:text-danger transition-colors flex-shrink-0"
            >
              <IcX size={14} />
            </button>
          </div>
        ) : showOrderForm ? (
          <div className="rounded-[20px] px-[18px] py-4 flex flex-col gap-3 bg-canvas">
            <div className="text-sm font-bold text-ink">Pedi fora hoje</div>
            <Input
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="O que pediu? (opcional)"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveOrder()}
            />
            <div className="flex gap-2">
              <Button onClick={() => { setShowOrderForm(false); setOrderNote(''); }}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveOrder}
                disabled={addOrder.isPending}
                className="flex-1"
              >
                {addOrder.isPending ? 'Salvando…' : 'Registrar'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowOrderForm(true)}
            className="w-full text-left rounded-[20px] px-[18px] py-3.5 flex items-center gap-3 bg-canvas"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-subtle/30">
              <span className="text-sm font-extrabold text-muted">?</span>
            </div>
            <span className="flex-1 text-sm font-semibold text-muted">Pediu fora hoje?</span>
            <IcChevRight size={16} className="text-subtle" />
          </button>
        )}
      </div>

      {/* Yesterday's cook */}
      {isLoading && !latestEntry ? (
        <div className="px-[18px] pb-[18px]">
          <div className="h-4 w-24 bg-canvas rounded-lg animate-pulse mb-3" />
          <div className="h-[76px] bg-canvas rounded-3xl animate-pulse" />
        </div>
      ) : latestEntry && (
        <div className="px-[18px] pb-[18px]">
          <Section title="Última vez" padded={false} />
          <div className="mt-3">
            <Card onClick={() => navigate(`/recipe/${latestEntry.recipeId}`)} className="p-3.5 flex items-center gap-3.5">
              <div
                className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: entryAccent + '18' }}
              >
                <FoodIcon name={latestEntry.recipeSprite} size={36} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold text-ink tracking-[-0.2px] mb-1">
                  {latestEntry.recipeName}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Avatar who={latestEntry.by} size={16} />
                    {latestEntry.byName}
                  </span>
                  <span className="w-[3px] h-[3px] rounded-full bg-subtle" />
                  <Rating value={latestEntry.rating.toFixed(1)} size={12} />
                </div>
              </div>
              <IcChevRight size={16} className="text-subtle" />
            </Card>
          </div>
        </div>
      )}

      {/* Category */}
      <div className="px-[18px] pb-3">
        <Section title="Categoria" padded={false} />
      </div>
      <div className="flex gap-2 px-[18px] pb-[18px] overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="px-[18px] pb-1">
        <Section
          title={sectionTitle}
          count={recipes.length}
          padded={false}
          kicker={
            allRecipes.length > recipes.length
              ? `${allRecipes.length - recipes.length} indisponível`
              : undefined
          }
        />
      </div>

      {isLoading ? (
        <div className="px-[18px] pt-3 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden bg-canvas animate-pulse">
              <div className="w-full aspect-[1.2/1]" />
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-3.5 rounded-lg bg-card w-4/5" />
                <div className="h-3 rounded-lg bg-card w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 && filter === 'saved' ? (
        <div className="px-[18px] pt-6 flex flex-col items-center gap-2 text-center">
          <IcHeart size={28} className="text-subtle" />
          <div className="text-sm font-semibold text-ink">Nenhuma receita salva ainda</div>
          <div className="text-xs text-muted">Toque no coração em qualquer receita para salvar aqui.</div>
        </div>
      ) : (
        <div className="px-[18px] pt-3 grid grid-cols-2 gap-3">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              memoryPhoto={memoryPhotoMap[r.id]}
              onClick={() => navigate(`/recipe/${r.id}`)}
              onFavorite={() => favMutation.mutate(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
