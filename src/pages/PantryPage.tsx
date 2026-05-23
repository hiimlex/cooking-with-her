// src/pages/PantryPage.tsx
import { useMemo, useState } from 'react';
import { Button, Card, Chip, FoodIcon, Input, Label } from '@/components/atoms';
import { ScreenHeader, Section } from '@/components/molecules';
import { FOOD_GLYPHS, IcPlus, IcSearch } from '@/icons';
import { INGREDIENTS } from '@/data/mock';
import type { IngredientCat } from '@/types';

export interface PantryPageProps {
  onAdd?: () => void;
}

const CATS: Array<'All' | IngredientCat> = ['All', 'Produce', 'Protein', 'Dairy', 'Pantry'];

export function PantryPage({ onAdd }: PantryPageProps) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<'All' | IngredientCat>('All');

  const filtered = useMemo(
    () =>
      INGREDIENTS.filter(
        (i) =>
          (cat === 'All' || i.cat === cat) &&
          i.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [cat, search],
  );
  const expiring = INGREDIENTS.filter((i) => i.expiry <= 4).sort((a, b) => a.expiry - b.expiry);

  return (
    <div>
      <ScreenHeader
        title="Pantry"
        sub={`${INGREDIENTS.length} items · ${expiring.length} expiring soon`}
        right={
          <Button variant="primary" size="md" icon={<IcPlus size={14} />} onClick={onAdd}>
            Add
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
            placeholder="Search ingredients…"
            className="pl-[38px]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 px-[18px] pb-3.5 overflow-x-auto no-scrollbar">
        {CATS.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
        ))}
      </div>

      {/* Use soon */}
      {expiring.length > 0 && cat === 'All' && !search && (
        <>
          <Section title="Use soon ⏰" count={expiring.length} kicker="don't waste" />
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-[18px] pt-3 pb-[18px]">
            {expiring.map((i) => {
              const urgent = i.expiry <= 1;
              const accent = FOOD_GLYPHS[i.sprite].color;
              return (
                <div
                  key={i.id}
                  className="flex-shrink-0 w-[130px] p-3.5 bg-card rounded-3xl flex flex-col items-center gap-2 relative"
                >
                  <div className="absolute top-2 right-2">
                    <Label color={urgent ? 'red' : 'yellow'}>
                      {urgent ? 'today!' : `${i.expiry}d`}
                    </Label>
                  </div>
                  <div
                    className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center"
                    style={{ background: accent + '18' }}
                  >
                    <FoodIcon name={i.sprite} size={36} />
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
        <Section title={cat === 'All' ? 'Everything' : cat} count={filtered.length} padded={false} />
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {filtered.map((i) => {
            const accent = FOOD_GLYPHS[i.sprite].color;
            return (
              <Card key={i.id} className="p-3 flex items-center gap-2.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: accent + '18' }}
                >
                  <FoodIcon name={i.sprite} size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-ink tracking-[-0.1px] truncate">
                    {i.name}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {i.qty} {i.unit}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
}
