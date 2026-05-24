import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, FoodTile, Input, Label } from '@/components/atoms';
import { ScreenHeader, Section, ShoppingItem } from '@/components/molecules';
import { IcPlus, IcSparkle, IcX, CAT_ICON } from '@/icons';
import { useShoppingList } from '@/hooks/useShoppingList';
import { getPantry } from '@/api/pantry';
import type { Ingredient } from '@/types';

export function ShoppingPage() {
  const { items, suggestions, isLoading, isAdding, add, toggle, remove, clearDone } = useShoppingList();
  const [newItem, setNewItem] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await add({ name: newItem.trim(), qty: '1 pc', cat: 'Other' });
    setNewItem('');
    setDropdownOpen(false);
  };

  const handleAddSugg = (name: string) =>
    add({ name, qty: '', cat: 'AI' });

  const buyQty = (ing: Ingredient): { amount: number; label: string } => {
    if (ing.monthlyBuy) {
      const remaining = ing.monthlyBuy - ing.qty;
      const amount    = remaining > 0 ? remaining : ing.monthlyBuy;
      const label     = remaining > 0 ? `${amount} ${ing.unit} left for month` : `${amount} ${ing.unit} restock`;
      return { amount, label };
    }
    return { amount: ing.qty, label: `${ing.qty} ${ing.unit} · ${ing.cat}` };
  };

  const handleSelectIngredient = (ing: Ingredient) => {
    const { amount } = buyQty(ing);
    add({ name: ing.name, qty: `${amount} ${ing.unit}`.trim(), cat: ing.cat });
    setNewItem('');
    setDropdownOpen(false);
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
        title="Shopping"
        sub={isLoading ? 'Loading…' : `${open.length} to buy · synced live`}
        right={
          <Label color="green" className="h-6 px-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-success"
              style={{ animation: 'pulseDot 1.5s infinite' }}
            />
            Live
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
              placeholder="What did we forget?"
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
                        {ing.monthlyBuy}{ing.unit}/mo
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
          >Add</Button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-[18px]">
          <Section title="Nonna suggests" count={suggestions.length} padded={false} />
          <Card soft className="p-3 mt-3 bg-accent-tint">
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-card rounded-2xl px-3 py-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-tint text-accent flex items-center justify-center">
                    <IcSparkle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-ink">{s.name}</div>
                    <div className="text-[11px] text-muted mt-0.5">{s.reason}</div>
                  </div>
                  <Button variant="soft" size="sm" onClick={() => handleAddSugg(s.name)} icon={<IcPlus size={12} />}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* To buy */}
      <div className="px-[18px] pt-5">
        <Section title="To buy" count={open.length} padded={false} />
        <div className="mt-3 flex flex-col gap-2">
          {!isLoading && open.length === 0 && (
            <Card className="p-6 text-center">
              <div className="text-[13px] text-muted">Nothing to buy. Pantry is happy.</div>
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
            <Section title="In the basket ✓" count={done.length} padded={false} />
            <Button variant="soft" size="sm" icon={<IcX size={12} />} onClick={() => clearDone()}>
              Clear
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
