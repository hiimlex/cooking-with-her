// src/pages/AddIngredientPage.tsx
import { useState } from 'react';
import { Button, Card, Chip, FoodIcon, Input, Label } from '@/components/atoms';
import { FieldGroup, Segmented, SubHeader } from '@/components/molecules';
import { FOOD_GLYPHS, IcCheck } from '@/icons';
import type { FoodGlyphId, IngredientCat } from '@/types';

export interface AddIngredientPageProps {
  onBack?: () => void;
  onSave?: () => void;
}

const SPRITE_GUESS: Record<string, FoodGlyphId> = {
  tomato:'Tomato', onion:'Onion', garlic:'Garlic', carrot:'Carrot', pepper:'Pepper',
  lemon:'Lemon', basil:'Herb', mint:'Herb', parsley:'Herb',
  egg:'Egg', chicken:'Chicken', salmon:'Fish', fish:'Fish',
  cheese:'Cheese', parmesan:'Cheese', milk:'Milk', cream:'Milk',
  rice:'Rice', pasta:'Pasta', bread:'Bread',
};

const CATEGORIES: IngredientCat[] = ['Produce', 'Protein', 'Dairy', 'Pantry', 'Spice', 'Other'];
const UNITS = ['pcs', 'g', 'ml', 'pack'];
const SHELF_LIFE = [2, 5, 7, 14, 30, 90];

export function AddIngredientPage({ onBack, onSave }: AddIngredientPageProps) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<string>('pcs');
  const [cat, setCat] = useState<IngredientCat>('Produce');
  const [sprite, setSprite] = useState<FoodGlyphId>('Tomato');
  const [expiry, setExpiry] = useState<number>(7);

  const handleNameChange = (v: string) => {
    setName(v);
    const match = Object.keys(SPRITE_GUESS).find((k) => v.toLowerCase().includes(k));
    if (match) setSprite(SPRITE_GUESS[match]);
  };

  return (
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={onBack}
        title="Add ingredient"
        sub="What did we just put away?"
      />

      {/* Live preview */}
      <div className="px-[18px] pb-[22px]">
        <Card
          className="p-5 flex items-center gap-4"
          style={{ background: FOOD_GLYPHS[sprite].color + '12' }}
        >
          <div className="w-[72px] h-[72px] rounded-[20px] bg-card flex items-center justify-center flex-shrink-0">
            <FoodIcon name={sprite} size={44} />
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

        <FieldGroup label="Category">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Pick an icon" sub="Or we'll guess from the name">
          <div className="grid grid-cols-6 gap-2 p-3 bg-card rounded-3xl">
            {(Object.keys(FOOD_GLYPHS) as FoodGlyphId[]).map((s) => {
              const c = FOOD_GLYPHS[s].color;
              const sel = sprite === s;
              return (
                <button
                  key={s}
                  onClick={() => setSprite(s)}
                  className="rounded-2xl p-2 flex items-center justify-center aspect-square transition-colors"
                  style={{
                    background: sel ? c + '22' : 'transparent',
                    border: sel ? `1.5px solid ${c}` : '1.5px solid transparent',
                  }}
                >
                  <FoodIcon name={s} size={26} />
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

        <div className="flex gap-2 mt-1.5">
          <Button onClick={onBack} className="ml-auto">Cancel</Button>
          <Button
            variant="primary"
            onClick={onSave}
            icon={<IcCheck size={14} />}
            disabled={!name || !qty}
          >
            Add to pantry
          </Button>
        </div>
      </div>
    </div>
  );
}
