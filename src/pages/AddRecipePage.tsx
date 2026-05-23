// src/pages/AddRecipePage.tsx
import { useState } from 'react';
import { Button, Chip } from '@/components/atoms';
import { TextArea } from '@/components/atoms/Input';
import { Input } from '@/components/atoms';
import { FieldGroup, Segmented, SubHeader } from '@/components/molecules';
import { IcCheck, IcImage, IcSparkle } from '@/icons';
import { INGREDIENTS } from '@/data/mock';
import type { Difficulty, RecipeTag } from '@/types';

export interface AddRecipePageProps {
  onBack?: () => void;
  onSave?: () => void;
}

export function AddRecipePage({ onBack, onSave }: AddRecipePageProps) {
  const [name, setName] = useState('');
  const [time, setTime] = useState<number>(30);
  const [diff, setDiff] = useState<Difficulty>('Easy');
  const [tag, setTag] = useState<RecipeTag>('Dinner');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleIng = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  return (
    <div className="pb-[100px] bg-bg min-h-full">
      <SubHeader
        onBack={onBack}
        title="New recipe ✏️"
        sub="Save something you made (or want to try)"
      />
      <div className="px-[18px] pt-2 pb-5 flex flex-col gap-[18px]">
        <FieldGroup label="Recipe name">
          <Input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Yuka's miso pasta" />
        </FieldGroup>

        <FieldGroup label="Meal type">
          <Segmented<RecipeTag>
            full value={tag} onChange={setTag}
            options={['Brunch', 'Lunch', 'Dinner', 'Snack']}
          />
        </FieldGroup>

        <FieldGroup label="Time">
          <Segmented<number>
            full value={time} onChange={setTime}
            options={[
              { value: 15, label: '15m' },
              { value: 30, label: '30m' },
              { value: 45, label: '45m' },
              { value: 60, label: '1h+' },
            ]}
          />
        </FieldGroup>

        <FieldGroup label="Difficulty">
          <Segmented<Difficulty>
            full value={diff} onChange={setDiff}
            options={['Easy', 'Medium', 'Hard']}
          />
        </FieldGroup>

        <FieldGroup label="Ingredients" sub="Tap from your pantry, or write new ones">
          <div className="flex flex-wrap gap-1.5">
            {INGREDIENTS.slice(0, 12).map((i) => (
              <Chip key={i.id} active={selected.has(i.id)} onClick={() => toggleIng(i.id)}>
                {i.name}
              </Chip>
            ))}
            <Chip>+ Custom…</Chip>
          </div>
        </FieldGroup>

        <FieldGroup label="The steps" sub="Write each step, or scan handwriting">
          <TextArea placeholder={"1. Chop the onions…\n2. ..."} rows={4} />
          <div className="flex gap-1.5 mt-2">
            <Button variant="soft" size="sm" icon={<IcImage size={12} />}>Scan handwritten</Button>
            <Button variant="soft" size="sm" icon={<IcSparkle size={12} />}>Polish with AI</Button>
          </div>
        </FieldGroup>

        <div className="flex gap-2 mt-1.5">
          <Button onClick={onBack} className="ml-auto">Cancel</Button>
          <Button variant="primary" onClick={onSave} icon={<IcCheck size={14} />}>
            Save recipe
          </Button>
        </div>
      </div>
    </div>
  );
}
