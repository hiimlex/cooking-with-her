import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/atoms';
import { RecipeRow, SubHeader } from '@/components/molecules';
import { IcPlus } from '@/icons';
import { getRecipes } from '@/api/recipes';
import { recipeCookability } from '@/utils/cookability';
import type { RecipeDto } from '@/model/recipe';
import type { FoodGlyphId, Difficulty, RecipeTag } from '@/types';

function dtoToRow(dto: RecipeDto) {
  return {
    id:           dto.id,
    name:         dto.name,
    tag:          dto.tag as RecipeTag,
    time:         dto.time,
    difficulty:   dto.difficulty as Difficulty,
    by:           dto.by.personId as 'alex' | 'yuka',
    cookedCount:  dto.cookedCount,
    rating:       dto.rating,
    bg:           dto.bg,
    accent:       dto.accent,
    servings:     dto.servings,
    why:          dto.why,
    nutrition:    dto.nutrition,
    sprites:      dto.sprites.map((s) => s.sprite) as FoodGlyphId[],
    ingredients:  dto.ingredients.map((i) => ({ id: i.ingredient.id, qty: i.qty, unit: i.unit })),
    steps:        dto.steps.map((s) => ({ t: s.title, d: s.desc, mins: s.mins })),
    favorite:     dto.favorite ?? false,
    cookability:  recipeCookability(dto),
  };
}

export function MyRecipesPage() {
  const navigate = useNavigate();

  const { data: dtos = [], isLoading } = useQuery<RecipeDto[]>({
    queryKey: ['recipes'],
    queryFn:  () => getRecipes(),
  });

  const recipes = dtos.map(dtoToRow);

  const sub = isLoading
    ? 'Carregando…'
    : `${recipes.length} salva${recipes.length !== 1 ? 's' : ''} juntos`;

  return (
    <div className="pb-[100px]">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Minhas receitas"
        sub={sub}
        right={
          <Button variant="primary" icon={<IcPlus size={14} />} onClick={() => navigate('/us/recipes/add')}>
            Nova
          </Button>
        }
      />
      <div className="px-[18px] pt-2 flex flex-col gap-2.5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[76px] bg-canvas rounded-2xl animate-pulse" />
            ))
          : recipes.map((r) => (
              <RecipeRow key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />
            ))}
      </div>
    </div>
  );
}
