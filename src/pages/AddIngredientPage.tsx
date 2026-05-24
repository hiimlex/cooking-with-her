import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Chip, FoodIcon, Input, Label } from '@/components/atoms';
import { FieldGroup, Segmented, SubHeader } from '@/components/molecules';
import { CAT_ICON, FOOD_GLYPHS, IcCheck } from '@/icons';
import { addIngredient } from '@/api/pantry';
import type { IngredientCat } from '@/types';

const ICON_GROUPS: { label: string; cat: IngredientCat }[] = [
  { label: 'Produce', cat: 'Produce' },
  { label: 'Protein', cat: 'Protein' },
  { label: 'Dairy',   cat: 'Dairy'   },
  { label: 'Pantry',  cat: 'Pantry'  },
  { label: 'Spice',   cat: 'Spice'   },
  { label: 'Other',   cat: 'Other'   },
];

const NAME_GUESS: Record<string, IngredientCat> = {
  tomato: 'Produce', onion: 'Produce', garlic: 'Spice',   carrot: 'Produce',
  pepper: 'Produce', lemon: 'Produce', basil:  'Spice',   mint:   'Spice',
  egg:    'Protein', chicken: 'Protein', salmon: 'Protein', fish: 'Protein',
  cheese: 'Dairy',   parmesan: 'Dairy',  milk:  'Dairy',   cream: 'Dairy',
  rice:   'Pantry',  pasta: 'Pantry',    bread: 'Pantry',
};

const UNITS = ['pcs', 'g', 'ml', 'pack'];
const SHELF_LIFE = [2, 5, 7, 14, 30, 90];

export function AddIngredientPage() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [name,       setName]       = useState('');
  const [qty,        setQty]        = useState('');
  const [unit,       setUnit]       = useState<string>('pcs');
  const [cat,        setCat]        = useState<IngredientCat>('Produce');
  const [expiry,     setExpiry]     = useState<number>(7);
  const [monthlyBuy, setMonthlyBuy] = useState('');
  const [hasMonthly, setHasMonthly] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: addIngredient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });

  const handleNameChange = (v: string) => {
    setName(v);
    const match = Object.keys(NAME_GUESS).find((k) => v.toLowerCase().includes(k));
    if (match) setCat(NAME_GUESS[match]);
  };

  const handleSave = async () => {
    if (!name || !qty) return;
    await mutateAsync({
      name, qty: Number(qty), unit, cat, expiry,
      ...(hasMonthly && monthlyBuy ? { monthlyBuy: Number(monthlyBuy) } : {}),
    });
    navigate('/pantry');
  };

  return (
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Add ingredient"
        sub="What did we just put away?"
      />

      {/* Live preview */}
      <div className="px-[18px] pb-[22px]">
        <Card
          className="p-5 flex items-center gap-4"
          style={{ background: FOOD_GLYPHS[CAT_ICON[cat]].color + '12' }}
        >
          <div className="w-[72px] h-[72px] rounded-[20px] bg-card flex items-center justify-center flex-shrink-0">
            <FoodIcon name={CAT_ICON[cat]} size={44} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-extrabold text-ink tracking-[-0.3px] truncate">
              {name || 'Untitled'}
            </div>
            <div className="text-[13px] text-muted mt-0.5">
              {qty || '—'} {unit} · {cat}
            </div>
            <div className="mt-1.5">
              <Label color={expiry <= 3 ? 'red' : expiry <= 7 ? 'yellow' : 'green'}>
                {expiry}d shelf life
              </Label>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-[18px] pb-5 flex flex-col gap-[18px]">
        <FieldGroup label="What is it?">
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Cherry tomatoes"
            autoFocus
          />
        </FieldGroup>

        <FieldGroup label="How much?">
          <div className="flex gap-2">
            <Input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              type="number"
              className="!w-[110px] text-center text-[17px] font-bold"
            />
            <div className="flex-1">
              <Segmented<string>
                full
                value={unit}
                onChange={setUnit}
                options={UNITS}
              />
            </div>
          </div>
        </FieldGroup>

        <FieldGroup label="Category" sub="We'll guess from the name">
          <div className="flex gap-2">
            {ICON_GROUPS.map(({ label, cat: groupCat }) => {
              const icon = CAT_ICON[groupCat];
              const c    = FOOD_GLYPHS[icon].color;
              const sel  = cat === groupCat;
              return (
                <button
                  key={label}
                  onClick={() => setCat(groupCat)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all flex-1"
                  style={{
                    background: sel ? c + '18' : 'var(--c-card, #f5f3ff)',
                    border:     sel ? `1.5px solid ${c}` : '1.5px solid transparent',
                    boxShadow:  sel ? `0 0 0 3px ${c}22` : undefined,
                  }}
                >
                  <FoodIcon name={icon} size={28} />
                  <span className="text-[10px] font-semibold leading-none text-center" style={{ color: sel ? c : undefined }}>{label}</span>
                </button>
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup
          label="Shelf life"
          sub={`We'll warn you when ${name || 'this'} is about to expire`}
        >
          <div className="flex flex-wrap gap-1.5">
            {SHELF_LIFE.map((d) => (
              <Chip key={d} active={expiry === d} onClick={() => setExpiry(d)}>
                {d < 30 ? `${d} days` : `${d / 30} mo`}
              </Chip>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup
          label="Monthly goal"
          sub="Auto-fill how much to buy when adding to shopping list"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasMonthly((v) => !v)}
              className={[
                'w-11 h-6 rounded-full transition-colors flex-shrink-0',
                hasMonthly ? 'bg-accent' : 'bg-subtle',
              ].join(' ')}
            >
              <span
                className={[
                  'block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5',
                  hasMonthly ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
            {hasMonthly && (
              <div className="flex gap-2 flex-1">
                <Input
                  value={monthlyBuy}
                  onChange={(e) => setMonthlyBuy(e.target.value)}
                  placeholder="0"
                  type="number"
                  className="!w-[110px] text-center text-[17px] font-bold"
                />
                <div className="flex items-center px-3 bg-card rounded-2xl text-sm font-semibold text-muted">
                  {unit} / mo
                </div>
              </div>
            )}
          </div>
        </FieldGroup>

        <div className="flex gap-2 mt-1.5">
          <Button onClick={() => navigate(-1 as never)} className="ml-auto" disabled={isPending}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<IcCheck size={14} />}
            disabled={!name || !qty || isPending}
          >
            {isPending ? 'Saving…' : 'Add to pantry'}
          </Button>
        </div>
      </div>
    </div>
  );
}
