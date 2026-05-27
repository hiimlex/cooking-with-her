import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/atoms';
import { IcPlus, IcX } from '@/icons';
import { getPantry } from '@/api/pantry';
import { UNITS, isDiscreteUnit, stepForUnit, defaultQtyForUnit, formatQtyForUnit } from '@/utils/units';
import type { Ingredient } from '@/types';

export interface PickedIngredient {
  ingredientId:    string;   // '' = ingrediente fora do estoque (ainda não cadastrado)
  name:            string;
  qty:             number;
  unit:            string;
  optional?:       boolean;  // true = não obrigatório na receita
  notInPantry?:    boolean;  // true = AI sugeriu mas não existe no estoque
  cat?:            string;   // usado ao criar o item no estoque
  alwaysAvailable?: boolean; // true = tempero/básico que não desconta do estoque
}

interface Props {
  value:    PickedIngredient[];
  onChange: (v: PickedIngredient[]) => void;
}

function clampQty(qty: number, max: number, unit: string): number {
  const step = stepForUnit(unit);
  const raw  = Math.max(0, Math.min(qty, max));
  const prec = step < 1 ? 10 : 1;
  return Math.round(raw * prec) / prec;
}

const PRODUCE_EXCEPTIONS = ['batata', 'cenoura'];

function isFreeFormIngredient(ing: Ingredient | PickedIngredient): boolean {
  if (ing.cat !== 'Produce') return false;
  return !PRODUCE_EXCEPTIONS.some((ex) => ing.name.toLowerCase().includes(ex));
}

function hasUnlimitedStock(ing: Ingredient | PickedIngredient): boolean {
  if ('alwaysAvailable' in ing && ing.alwaysAvailable) return true;
  return isFreeFormIngredient(ing);
}

export function IngredientPicker({ value, onChange }: Props) {
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dropOpen,        setDropOpen]        = useState(false);
  const [drafts,          setDrafts]          = useState<Record<string, string>>({});
  const closeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 280);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  const { data: searchResults = [], isFetching } = useQuery<Ingredient[]>({
    queryKey: ['pantry-search', debouncedSearch],
    queryFn:  () => getPantry({ search: debouncedSearch }),
    enabled:  debouncedSearch.trim().length > 0,
    staleTime: 10_000,
  });

  const { data: pantryAll = [] } = useQuery<Ingredient[]>({
    queryKey: ['pantry'],
    queryFn:  () => getPantry(),
    staleTime: 30_000,
  });
  const pantryStockMap = Object.fromEntries(pantryAll.map((i) => [i.id, i.qty]));

  const selectedIds = new Set(value.map((v) => v.ingredientId).filter(Boolean));

  const matches = debouncedSearch.trim().length > 0
    ? searchResults.filter((i) => !selectedIds.has(i.id))
    : [];

  const addIngredient = (ing: Ingredient) => {
    const freeForm   = isFreeFormIngredient(ing);
    const unlimitedStock = hasUnlimitedStock(ing);
    const stock      = unlimitedStock ? Infinity : ing.qty;
    const qty        = freeForm ? 1 : clampQty(defaultQtyForUnit(ing.unit), stock, ing.unit);
    onChange([
      ...value,
      { ingredientId: ing.id, name: ing.name, qty, unit: ing.unit, cat: ing.cat, notInPantry: false, alwaysAvailable: ing.alwaysAvailable },
    ]);
    setSearch('');
    setDebouncedSearch('');
    setDropOpen(false);
  };

  const handleQtyChange = (key: string, raw: string) => {
    setDrafts((d) => ({ ...d, [key]: raw }));
  };

  const handleQtyBlur = (key: string) => {
    const ing   = value.find((v) => (v.ingredientId || v.name) === key);
    const draft = drafts[key];
    if (!ing || draft === undefined) return;

    const stock = (ing.notInPantry || ing.alwaysAvailable) ? Infinity : (pantryStockMap[ing.ingredientId] ?? Infinity);
    const qty   = clampQty(parseFloat(draft) || 0, stock, ing.unit);

    onChange(value.map((v) => (v.ingredientId || v.name) === key ? { ...v, qty } : v));
    setDrafts((d) => { const next = { ...d }; delete next[key]; return next; });
  };

  const handleUnitChange = (key: string, unit: string) => {
    onChange(value.map((v) => (v.ingredientId || v.name) === key ? { ...v, unit } : v));
  };

  const toggleOptional = (key: string) => {
    onChange(value.map((v) =>
      (v.ingredientId || v.name) === key ? { ...v, optional: !(v.optional ?? false) } : v,
    ));
  };

  const remove = (key: string) => {
    onChange(value.filter((v) => (v.ingredientId || v.name) !== key));
    setDrafts((d) => { const next = { ...d }; delete next[key]; return next; });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Search */}
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setDropOpen(true); }}
          onFocus={() => setDropOpen(true)}
          onBlur={() => { closeTimer.current = setTimeout(() => setDropOpen(false), 150); }}
          placeholder="Buscar ingrediente da despensa…"
        />

        {dropOpen && debouncedSearch.trim().length > 0 && (
          <div
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-card rounded-2xl shadow-lg overflow-hidden"
            onMouseDown={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
          >
            {isFetching && (
              <div className="px-3.5 py-3 text-xs text-muted text-center">Buscando…</div>
            )}
            {!isFetching && matches.length === 0 && (
              <div className="px-3.5 py-3 text-xs text-muted text-center">
                Nenhum ingrediente encontrado
              </div>
            )}
            {!isFetching && matches.map((ing) => (
              <button
                key={ing.id}
                type="button"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-canvas transition-colors text-left"
                onClick={() => addIngredient(ing)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{ing.name}</div>
                  <div className="text-[11px] text-muted">
                    {formatQtyForUnit(ing.qty, ing.unit)} {ing.unit} em estoque
                  </div>
                </div>
                <IcPlus size={14} className="text-accent flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected list */}
      {value.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {value.map((ing) => {
            const key         = ing.ingredientId || ing.name;
            const notInPantry = ing.notInPantry ?? false;
            const freeForm    = isFreeFormIngredient(ing);
            const stock       = (notInPantry || hasUnlimitedStock(ing)) ? Infinity : (pantryStockMap[ing.ingredientId] ?? Infinity);
            const step        = stepForUnit(ing.unit);
            const discrete    = isDiscreteUnit(ing.unit);
            const draftVal    = drafts[key];
            const displayVal  = draftVal !== undefined ? draftVal : formatQtyForUnit(ing.qty, ing.unit);
            const parsedQty   = draftVal !== undefined ? (parseFloat(draftVal) || 0) : ing.qty;
            const overStock   = !notInPantry && !freeForm && !ing.alwaysAvailable && parsedQty > stock;
            const atMax       = !notInPantry && !freeForm && !ing.alwaysAvailable && stock !== Infinity && ing.qty >= stock && draftVal === undefined;

            return (
              <div
                key={key}
                className={[
                  'flex items-center gap-2 rounded-2xl px-3 py-2.5 transition-colors',
                  notInPantry
                    ? 'bg-amber-50 border border-amber-200'
                    : overStock
                    ? 'bg-red-50'
                    : 'bg-canvas',
                ].join(' ')}
              >
                {/* Name + stock info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-ink truncate">
                      {ing.name}
                    </span>
                    {freeForm ? (
                      <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 border border-green-300 text-green-700">
                        livre
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleOptional(key)}
                        title={ing.optional ? 'Tornar obrigatório' : 'Marcar como opcional'}
                        className={[
                          'flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors',
                          ing.optional
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : 'bg-transparent border-canvas text-subtle hover:border-muted hover:text-muted',
                        ].join(' ')}
                      >
                        opc
                      </button>
                    )}
                  </div>
                  {notInPantry ? (
                    <span className="text-[10px] font-semibold text-amber-600">
                      Fora do estoque — será criado ao salvar
                    </span>
                  ) : freeForm ? (
                    <span className="text-[10px] font-semibold text-green-700">
                      Não desconta do estoque ao cozinhar
                    </span>
                  ) : stock !== Infinity ? (
                    <span className={[
                      'text-[10px] font-semibold',
                      overStock ? 'text-danger' : atMax ? 'text-accent' : 'text-subtle',
                    ].join(' ')}>
                      {overStock
                        ? `máx ${formatQtyForUnit(stock, ing.unit)} ${ing.unit}`
                        : `estoque: ${formatQtyForUnit(stock, ing.unit)} ${ing.unit}`}
                    </span>
                  ) : null}
                </div>

                {/* Unit selector + qty input — hidden for free-form produce (a gosto) */}
                {freeForm ? (
                  <span className="text-[11px] font-semibold text-green-700 flex-shrink-0 px-2">
                    a gosto
                  </span>
                ) : (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <select
                    value={ing.unit}
                    onChange={(e) => handleUnitChange(key, e.target.value)}
                    className="text-[11px] font-semibold text-muted bg-card border border-canvas rounded-lg px-1.5 py-1 focus:outline-none focus:border-accent appearance-none cursor-pointer"
                    style={{ maxWidth: '72px' }}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <input
                    type={discrete ? 'number' : 'text'}
                    inputMode={discrete ? 'numeric' : 'decimal'}
                    min={0}
                    max={!notInPantry && stock !== Infinity ? stock : undefined}
                    step={step}
                    value={displayVal}
                    onChange={(e) => handleQtyChange(key, e.target.value)}
                    onBlur={() => handleQtyBlur(key)}
                    placeholder={discrete ? '1' : '0.0'}
                    className={[
                      'w-[60px] text-sm text-center rounded-xl px-2 py-1 border focus:outline-none transition-colors flex-shrink-0',
                      notInPantry
                        ? 'bg-amber-50 border-amber-300 text-amber-800 focus:border-amber-400'
                        : overStock
                        ? 'bg-red-100 border-red-300 text-red-700 focus:border-red-400'
                        : atMax
                        ? 'bg-accent-tint border-accent text-accent focus:border-accent'
                        : 'bg-card border-canvas text-ink focus:border-accent',
                    ].join(' ')}
                  />
                </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(key)}
                  className="text-subtle hover:text-danger transition-colors flex-shrink-0 pl-0.5"
                >
                  <IcX size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {value.length === 0 && (
        <div className="text-[12px] text-subtle text-center py-2">
          Nenhum ingrediente adicionado
        </div>
      )}
    </div>
  );
}
