// src/pages/MemoriesPage.tsx
import { Avatar, Card, FoodIcon } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { FOOD_GLYPHS } from '@/icons';
import { COUPLE, MEMORIES, RECIPES } from '@/data/mock';

export interface MemoriesPageProps {
  onBack?: () => void;
}

export function MemoriesPage({ onBack }: MemoriesPageProps) {
  return (
    <div className="pb-[100px]">
      <SubHeader
        onBack={onBack}
        title="Memories 📷"
        sub={`${MEMORIES.length} cooks photographed this month`}
      />
      <div className="px-[18px] pt-2">
        <div className="grid grid-cols-2 gap-2.5">
          {MEMORIES.map((m) => {
            const r = RECIPES.find((x) => x.id === m.recipeId);
            if (!r) return null;
            const accent = FOOD_GLYPHS[r.sprites[0]].color;
            return (
              <Card key={m.id} className="p-0 overflow-hidden">
                <div
                  className="aspect-square flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${accent}30 0%, ${accent}15 100%)`,
                  }}
                >
                  <FoodIcon name={r.sprites[0]} size={64} />
                  <div className="absolute top-2 left-2 bg-white/90 rounded-full pl-1 pr-2 py-0.5 flex items-center gap-1 text-[11px] font-bold text-ink">
                    <Avatar who={m.by} size={18} />
                    {COUPLE[m.by].name}
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <div className="text-[13px] font-bold text-ink truncate">{r.name}</div>
                  <div className="text-[11px] text-muted mt-0.5">{m.date}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
