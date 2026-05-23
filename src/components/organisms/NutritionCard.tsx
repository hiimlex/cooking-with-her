// src/components/organisms/NutritionCard.tsx — kcal + macros donut + tiles
import { Card } from '@/components/atoms';
import { Macro, MacroRing } from '@/components/molecules';
// avoid circular: Macro/MacroRing live in molecules barrel but used as composites here
import type { Nutrition } from '@/types';

export interface NutritionCardProps {
  nutrition: Nutrition;
  perServing?: boolean;
}

export function NutritionCard({ nutrition, perServing = true }: NutritionCardProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-3 mt-5">
        <h3 className="m-0 text-base font-extrabold text-ink tracking-[-0.3px]">Nutrition</h3>
        <span className="text-[11px] text-subtle font-semibold">
          {perServing ? 'per serving · approx.' : 'approx.'}
        </span>
      </div>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <div className="text-[32px] font-extrabold text-ink tracking-[-0.8px] leading-none">
              {nutrition.kcal}
            </div>
            <div className="text-xs text-muted font-semibold mt-0.5">kcal</div>
          </div>
          <MacroRing nutrition={nutrition} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Macro label="Protein"  grams={nutrition.protein} color="#7c3aed" />
          <Macro label="Carbs"    grams={nutrition.carbs}   color="#f59e0b" />
          <Macro label="Fat"      grams={nutrition.fat}     color="#ff7eb9" />
        </div>
        {nutrition.fiber !== undefined && (
          <div className="mt-2.5 pt-2.5 border-t border-dashed border-canvas flex justify-between text-xs text-muted">
            <span>Fiber</span>
            <span className="font-bold text-ink">{nutrition.fiber}g</span>
          </div>
        )}
      </Card>
    </>
  );
}
