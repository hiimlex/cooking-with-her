// src/pages/UtensilsPage.tsx
import { useState } from 'react';
import { Card, Toggle } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { UTENSILS } from '@/data/mock';

export interface UtensilsPageProps {
  onBack?: () => void;
}

export function UtensilsPage({ onBack }: UtensilsPageProps) {
  const [items, setItems] = useState(UTENSILS);
  const have = items.filter((u) => u.have).length;
  const toggle = (id: string) =>
    setItems(items.map((u) => (u.id === id ? { ...u, have: !u.have } : u)));

  return (
    <div className="pb-[100px]">
      <SubHeader
        onBack={onBack}
        title="Our utensils 🔪"
        sub={`${have} of ${items.length} ready · we'll match recipes to what you have`}
      />
      <div className="px-[18px] pt-2 flex flex-col gap-2">
        {items.map((u) => (
          <Card key={u.id} className="px-3.5 py-3 flex items-center gap-3">
            <div
              className={[
                'w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0',
                u.have ? 'bg-lab-green-bg opacity-100' : 'bg-canvas opacity-50',
              ].join(' ')}
            >{u.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-ink">{u.name}</div>
              <div className="text-xs text-muted mt-0.5">
                {u.have ? 'Ready in your kitchen' : 'Add when you get one'}
              </div>
            </div>
            <Toggle on={u.have} onChange={() => toggle(u.id)} />
          </Card>
        ))}
      </div>
    </div>
  );
}
