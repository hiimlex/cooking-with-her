import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, FoodTile, Input, Label } from '@/components/atoms';
import { ScreenHeader, Section, ShoppingItem } from '@/components/molecules';
import { IcPlus, IcX, CAT_ICON } from '@/icons';
import { useShoppingList } from '@/hooks/useShoppingList';
import { getPantry } from '@/api/pantry';
import type { Ingredient } from '@/types';

export function ShoppingPage() {
  const { items, isLoading, isAdding, add, toggle, remove, clearDone } = useShoppingList();
  const [newItem, setNewItem] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: pantryItems = [] } = useQuery<Ingredient[]>({
    queryKey: ['pantry'],
    queryFn:  () => getPantry(),
  });

  const matches = newItem.trim().length > 0
    ? pantryItems.filter((i) => i.name.toLowerCase().includes(newItem.toLowerCase())).slice(0, 6)
    : [];

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  // Pantry items with qty=0 not already queued in the shopping list
  const queuedNames = new Set(open.map((i) => i.name.toLowerCase()));
  const outOfStock  = pantryItems.filter(
    (i) => i.qty === 0 && !queuedNames.has(i.name.toLowerCase()),
  );

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await add({ name: newItem.trim(), qty: '1 pc', cat: 'Other' });
    setNewItem('');
    setDropdownOpen(false);
  };

  const buyQty = (ing: Ingredient): { amount: number; label: string } => {
    if (ing.monthlyBuy) {
      const remaining = ing.monthlyBuy - ing.qty;
      const amount    = remaining > 0 ? remaining : ing.monthlyBuy;
      const label     = remaining > 0 ? `${amount} ${ing.unit} restam no mês` : `${amount} ${ing.unit} repor`;
      return { amount, label };
    }
    return { amount: 1, label: `repor ${ing.unit}` };
  };

  const handleSelectIngredient = (ing: Ingredient) => {
    const { amount } = buyQty(ing);
    add({ name: ing.name, qty: `${amount} ${ing.unit}`.trim(), cat: ing.cat });
    setNewItem('');
    setDropdownOpen(false);
  };

  const handleAddOutOfStock = async (ing: Ingredient) => {
    setAddingId(ing.id);
    try {
      const { amount } = buyQty(ing);
      await add({
        name:         ing.name,
        qty:          `${amount} ${ing.unit}`.trim(),
        cat:          ing.cat,
        ingredientId: ing.id,
      });
    } finally {
      setAddingId(null);
    }
  };

  const handleInputBlur = () => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  const handleDropdownMouseDown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <div>
      <ScreenHeader
        title="Compras"
        sub={isLoading ? 'Carregando…' : `${open.length} para comprar · ao vivo`}
        right={
          <Label color="green" className="h-6 px-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-success"
              style={{ animation: 'pulseDot 1.5s infinite' }}
            />
            Ao vivo
          </Label>
        }
      />

      {/* Quick add */}
      <div className="px-[18px] pt-1 pb-3.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={newItem}
              onChange={(e) => { setNewItem(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={handleInputBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="O que esquecemos?"
            />
            {dropdownOpen && matches.length > 0 && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-card rounded-2xl shadow-lg overflow-hidden"
                onMouseDown={handleDropdownMouseDown}
              >
                {matches.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-canvas transition-colors text-left"
                    onClick={() => handleSelectIngredient(ing)}
                  >
                    <FoodTile name={CAT_ICON[ing.cat]} tileSize={32} radius={8} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink truncate">{ing.name}</div>
                      <div className="text-[11px] text-muted">{buyQty(ing).label}</div>
                    </div>
                    {ing.monthlyBuy && (
                      <span className="text-[10px] font-bold text-accent bg-accent-tint px-1.5 py-0.5 rounded-lg flex-shrink-0">
                        {ing.monthlyBuy}{ing.unit}/mês
                      </span>
                    )}
                    <IcPlus size={14} className="text-muted flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!newItem.trim() || isAdding}
            icon={<IcPlus size={14} />}
          >Adicionar</Button>
        </div>
      </div>

      {/* Out of stock — from pantry with qty=0 */}
      {outOfStock.length > 0 && (
        <div className="px-[18px] pt-1 pb-5">
          <Section
            title="Fora do estoque"
            count={outOfStock.length}
            kicker="despensa zerada"
            padded={false}
          />
          <div className="mt-3 flex flex-col gap-2">
            {outOfStock.map((ing) => {
              const { amount } = buyQty(ing);
              const isThis     = addingId === ing.id;
              return (
                <div
                  key={ing.id}
                  className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5"
                >
                  <FoodTile name={CAT_ICON[ing.cat]} tileSize={36} radius={10} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-ink truncate">{ing.name}</div>
                    <div className="text-[11px] text-amber-700 font-semibold">
                      {amount} {ing.unit} · sem estoque
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isThis}
                    onClick={() => handleAddOutOfStock(ing)}
                    className="flex items-center gap-1 text-[12px] font-bold text-accent bg-accent-tint px-2.5 py-1.5 rounded-xl hover:bg-accent hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <IcPlus size={11} />
                    {isThis ? '…' : 'Lista'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* To buy */}
      <div className="px-[18px] pt-1">
        <Section title="Para comprar" count={open.length} padded={false} />
        <div className="mt-3 flex flex-col gap-2">
          {isLoading && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[54px] bg-canvas rounded-2xl animate-pulse" />
              ))}
            </>
          )}
          {!isLoading && open.length === 0 && (
            <Card className="p-6 text-center">
              <div className="text-[13px] text-muted">Nada para comprar. Despensa feliz.</div>
            </Card>
          )}
          {open.map((i) => (
            <ShoppingItem key={i.id} item={i} onToggle={() => toggle(i.id)} onRemove={() => remove(i.id)} />
          ))}
        </div>
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div className="px-[18px] pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <Section title="No carrinho" count={done.length} padded={false} />
            <Button variant="soft" size="sm" icon={<IcX size={12} />} onClick={() => clearDone()}>
              Limpar
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {done.map((i) => (
              <ShoppingItem key={i.id} item={i} onToggle={() => toggle(i.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
