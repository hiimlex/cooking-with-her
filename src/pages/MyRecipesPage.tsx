// src/pages/MyRecipesPage.tsx
import { Button } from '@/components/atoms';
import { RecipeRow, SubHeader } from '@/components/molecules';
import { IcPlus } from '@/icons';
import { RECIPES } from '@/data/mock';

export interface MyRecipesPageProps {
  onBack?: () => void;
  onOpen?: (id: string) => void;
  onAdd?: () => void;
}

export function MyRecipesPage({ onBack, onOpen, onAdd }: MyRecipesPageProps) {
  return (
    <div className="pb-[100px]">
      <SubHeader
        onBack={onBack}
        title="My recipes 📖"
        sub={`${RECIPES.length} saved together`}
        right={
          <Button variant="primary" icon={<IcPlus size={14} />} onClick={onAdd}>New</Button>
        }
      />
      <div className="px-[18px] pt-2 flex flex-col gap-2.5">
        {RECIPES.map((r) => (
          <RecipeRow key={r.id} recipe={r} onClick={() => onOpen?.(r.id)} />
        ))}
      </div>
    </div>
  );
}
