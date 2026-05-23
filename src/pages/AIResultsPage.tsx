// src/pages/AIResultsPage.tsx
import { Button, Card, FoodIcon, Label } from '@/components/atoms';
import { TAG_COLOR } from '@/components/atoms/Label';
import { SubHeader } from '@/components/molecules';
import { FOOD_GLYPHS, IcClock, IcSparkle } from '@/icons';
import type { Recipe } from '@/types';

export interface AIResultsPageProps {
  results: Recipe[];
  onBack?: () => void;
  onRetry?: () => void;
  onOpenRecipe?: (id: string) => void;
}

export function AIResultsPage({ results, onBack, onRetry, onOpenRecipe }: AIResultsPageProps) {
  return (
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={onBack}
        title="3 ideas just for you"
        sub="Tap one to dive in, or shake for new ones."
        right={<Button onClick={onRetry}>Shake ↻</Button>}
      />
      <div className="px-[18px] pt-2 flex flex-col gap-3">
        {results.map((r, i) => (
          <AIResultCard key={r.id} recipe={r} top={i === 0} onClick={() => onOpenRecipe?.(r.id)} />
        ))}
      </div>
    </div>
  );
}

function AIResultCard({ recipe: r, top, onClick }: { recipe: Recipe; top?: boolean; onClick?: () => void }) {
  const accent = FOOD_GLYPHS[r.sprites[0]].color;
  return (
    <Card onClick={onClick} className="p-0 overflow-hidden relative">
      {top && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <Label color="purple" solid><IcSparkle size={10} /> Top pick</Label>
        </div>
      )}
      <div className="flex gap-3.5 p-3.5 items-center">
        <div
          className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '18' }}
        >
          <FoodIcon name={r.sprites[0]} size={44} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-extrabold text-ink tracking-[-0.2px] mb-1">{r.name}</div>
          <div className="flex gap-1.5 mb-1.5">
            <Label color={TAG_COLOR[r.tag] || 'gray'}>{r.tag}</Label>
            <Label color="green"><IcClock size={9} /> {r.time}m · {r.difficulty}</Label>
          </div>
          <div className="text-xs text-muted leading-[1.45] flex gap-1.5 items-start">
            <span className="text-accent flex-shrink-0 mt-0.5"><IcSparkle size={11} /></span>
            <span>{r.why || `You've made this ${r.cookedCount}× — easy win.`}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
