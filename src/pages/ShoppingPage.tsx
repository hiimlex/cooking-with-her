// src/pages/ShoppingPage.tsx
import { useState } from 'react';
import { Button, Card, Input, Label } from '@/components/atoms';
import { ScreenHeader, Section, ShoppingItem } from '@/components/molecules';
import { IcPlus, IcSparkle } from '@/icons';
import { SHOPPING, SUGGESTIONS } from '@/data/mock';
import type { ShoppingEntry } from '@/types';

export function ShoppingPage() {
  const [items, setItems] = useState<ShoppingEntry[]>(SHOPPING);
  const [newItem, setNewItem] = useState('');

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  const toggle = (id: string) =>
    setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const add = () => {
    if (!newItem.trim()) return;
    setItems([
      { id: 'n' + Date.now(), name: newItem, qty: '1 pc', cat: 'Other', done: false, by: 'yuka' },
      ...items,
    ]);
    setNewItem('');
  };

  const addSugg = (s: { name: string }) => {
    setItems([
      { id: 'n' + Date.now(), name: s.name, qty: '', cat: 'AI', done: false, by: 'ai' },
      ...items,
    ]);
  };

  return (
    <div>
      <ScreenHeader
        title="Shopping 🛒"
        sub={`${open.length} to buy · synced with Alex`}
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
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="What did we forget?"
            className="flex-1"
          />
          <Button
            variant="primary"
            onClick={add}
            disabled={!newItem.trim()}
            icon={<IcPlus size={14} />}
          >Add</Button>
        </div>
      </div>

      {/* AI suggestions */}
      <div className="px-[18px]">
        <Section title="Nonna suggests ✨" count={SUGGESTIONS.length} padded={false} />
        <Card soft className="p-3 mt-3 bg-accent-tint">
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-card rounded-2xl px-3 py-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent-tint text-accent flex items-center justify-center">
                  <IcSparkle size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink">{s.name}</div>
                  <div className="text-[11px] text-muted mt-0.5">{s.reason}</div>
                </div>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => addSugg(s)}
                  icon={<IcPlus size={12} />}
                >Add</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Open */}
      <div className="px-[18px] pt-5">
        <Section title="To buy" count={open.length} padded={false} />
        <div className="mt-3 flex flex-col gap-2">
          {open.length === 0 && (
            <Card className="p-6 text-center">
              <div className="text-[28px] mb-1">🥬</div>
              <div className="text-[13px] text-muted">Nothing to buy. Pantry is happy.</div>
            </Card>
          )}
          {open.map((i) => (
            <ShoppingItem key={i.id} item={i} onToggle={() => toggle(i.id)} />
          ))}
        </div>
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div className="px-[18px] pt-5">
          <Section title="In the basket ✓" count={done.length} padded={false} />
          <div className="mt-3 flex flex-col gap-2">
            {done.map((i) => (
              <ShoppingItem key={i.id} item={i} onToggle={() => toggle(i.id)} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
