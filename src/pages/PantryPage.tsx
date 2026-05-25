import { useNavigate } from 'react-router-dom';
import { Button, Card, Chip, FoodIcon, Input, Label } from '@/components/atoms';
import { ScreenHeader, Section } from '@/components/molecules';
import { CAT_ICON, FOOD_GLYPHS, IcPencil, IcPlus, IcSearch } from '@/icons';
import { usePantry } from '@/hooks/usePantry';
import type { IngredientCat } from '@/types';

type CatFilter = 'All' | IngredientCat;
const CATS: CatFilter[] = ['All', 'Produce', 'Protein', 'Dairy', 'Pantry', 'Spice', 'Other'];
const CAT_LABEL: Record<CatFilter, string> = {
  All:     'Tudo',
  Produce: 'Hortifruti',
  Protein: 'Proteína',
  Dairy:   'Laticínio',
  Pantry:  'Despensa',
  Spice:   'Tempero',
  Other:   'Outro',
};

export function PantryPage() {
  const navigate = useNavigate();
  const {
    ingredients, filtered, expiring, isLoading, isSearching,
    cat, setCat, search, setSearch, showZero, setShowZero,
  } = usePantry();

  return (
    <div>
      <ScreenHeader
        title="Despensa"
        sub={
          isLoading
            ? 'Carregando…'
            : `${ingredients.length} itens · ${expiring.length} vencendo em breve`
        }
        right={
          <Button variant="primary" size="md" icon={<IcPlus size={14} />} onClick={() => navigate('/pantry/add')}>
            Adicionar
          </Button>
        }
      />

      {/* Search */}
      <div className="px-[18px] pt-1 pb-3">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            <IcSearch size={15} />
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ingredientes…"
            className="pl-[38px]"
          />
        </div>
      </div>

      {/* Categories + Zerados filter */}
      <div className="flex gap-1.5 px-[18px] pb-3.5 overflow-x-auto no-scrollbar">
        {CATS.map((c) => (
          <Chip key={c} active={cat === c && !showZero} onClick={() => { setCat(c); setShowZero(false); }}>
            {CAT_LABEL[c]}
          </Chip>
        ))}
        <Chip active={showZero} onClick={() => setShowZero((v) => !v)}>
          Zerados
        </Chip>
      </div>

      {/* Use soon */}
      {expiring.length > 0 && cat === 'All' && !search && !showZero && (
        <>
          <Section title="Usar em breve" count={expiring.length} kicker="não desperdice" />
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-[18px] pt-3 pb-[18px]">
            {expiring.map((i) => {
              const urgent = i.expiry <= 1;
              const accent = FOOD_GLYPHS[CAT_ICON[i.cat]].color;
              return (
                <div
                  key={i.id}
                  className="flex-shrink-0 w-[130px] p-3.5 bg-card rounded-3xl flex flex-col items-center gap-2 relative"
                >
                  <div className="absolute top-2 right-2">
                    <Label color={urgent ? 'red' : 'yellow'}>
                      {urgent ? 'hoje!' : `${i.expiry}d`}
                    </Label>
                  </div>
                  <div
                    className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center"
                    style={{ background: accent + '18' }}
                  >
                    <FoodIcon name={CAT_ICON[i.cat]} size={36} />
                  </div>
                  <div className="text-[13px] font-bold text-ink text-center tracking-[-0.1px]">
                    {i.name}
                  </div>
                  <div className="text-[11px] text-muted font-semibold">
                    {i.qty} {i.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Grid */}
      <div className="px-[18px]">
        <Section
          title={showZero ? 'Zerados' : CAT_LABEL[cat]}
          count={filtered.length}
          padded={false}
          kicker={isSearching ? 'buscando…' : undefined}
        />

        {(isLoading || isSearching) && (
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-[68px] bg-card rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !isSearching && filtered.length === 0 && (
          <div className="text-center text-muted text-[13px] py-10">
            {search
              ? `Nenhum ingrediente com "${search}"`
              : showZero
              ? 'Nenhum ingrediente com estoque zerado.'
              : 'Nenhum ingrediente ainda — adicione!'}
          </div>
        )}

        {!isLoading && !isSearching && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 mt-3 pb-6">
            {filtered.map((i) => {
              const accent  = FOOD_GLYPHS[CAT_ICON[i.cat]].color;
              const isEmpty = i.qty === 0;
              return (
                <Card key={i.id} className="p-3 flex items-center gap-2.5 relative group">
                  <div
                    className={[
                      'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
                      isEmpty ? 'opacity-40' : '',
                    ].join(' ')}
                    style={{ background: accent + '18' }}
                  >
                    <FoodIcon name={CAT_ICON[i.cat]} size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-ink tracking-[-0.1px] truncate">
                      {i.name}
                    </div>
                    <div className={[
                      'text-[11px] mt-0.5 font-semibold',
                      isEmpty && !i.alwaysAvailable ? 'text-amber-500' : 'text-muted',
                    ].join(' ')}>
                      {i.alwaysAvailable
                        ? '∞ sempre disponível'
                        : isEmpty
                        ? 'sem estoque'
                        : `${i.qty} ${i.unit}`}
                    </div>
                  </div>

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => navigate(`/pantry/edit/${i.id}`)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-canvas flex items-center justify-center text-subtle hover:text-accent hover:bg-accent-tint transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Editar ingrediente"
                  >
                    <IcPencil size={11} />
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
