import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms';
import { RecipeRow, SubHeader } from '@/components/molecules';
import { IcPlus } from '@/icons';
import { RECIPES } from '@/data/mock';

export function MyRecipesPage() {
  const navigate = useNavigate();
  return (
    <div className="pb-[100px]">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="My recipes"
        sub={`${RECIPES.length} saved together`}
        right={
          <Button variant="primary" icon={<IcPlus size={14} />} onClick={() => navigate('/us/recipes/add')}>New</Button>
        }
      />
      <div className="px-[18px] pt-2 flex flex-col gap-2.5">
        {RECIPES.map((r) => (
          <RecipeRow key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />
        ))}
      </div>
    </div>
  );
}
