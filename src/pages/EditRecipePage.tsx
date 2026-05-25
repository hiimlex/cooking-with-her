import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { RecipeForm } from '@/components/organisms';
import { IcCheck, IcSparkle } from '@/icons';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { updateRecipe } from '@/api/recipes';
import { useRecipeForm } from '@/hooks/useRecipeForm';
import type { Difficulty, RecipeTag } from '@/types';

export function EditRecipePage() {
  const navigate    = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { recipe, isLoading } = useRecipeDetail(id);
  const form = useRecipeForm();

  useEffect(() => {
    if (!recipe) return;
    form.reset({
      name:        recipe.name,
      tag:         recipe.tag as RecipeTag,
      time:        recipe.time,
      diff:        recipe.difficulty as Difficulty,
      servings:    recipe.servings ?? 2,
      why:         recipe.why ?? '',
      steps:       recipe.steps.map((s) => ({ title: s.title, desc: s.desc, mins: s.mins })),
      ingredients: recipe.ingredients.map((i) => ({
        ingredientId: i.ingredient.id,
        name:         i.ingredient.name,
        qty:          i.qty,
        unit:         i.unit,
        optional:     i.optional,
      })),
    });
  }, [recipe?.id]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateRecipe(id, {
        name:        form.name,
        tag:         form.tag,
        time:        form.time,
        difficulty:  form.diff,
        servings:    form.servings,
        why:         form.why,
        steps:       form.steps,
        ingredients: form.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          qty:          i.qty,
          unit:         i.unit,
          optional:     i.optional ?? false,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      navigate(`/recipe/${id}`, { replace: true });
    },
  });

  if (isLoading) {
    return (
      <div className="pb-[110px] bg-bg min-h-full">
        <div className="pt-[54px] px-[18px]">
          <div className="h-8 w-40 bg-canvas rounded-xl animate-pulse mb-4" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-canvas rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="bg-bg min-h-full flex flex-col">

      <div className="sticky top-0 z-20 bg-bg flex-shrink-0">
        <SubHeader
          onBack={() => navigate(-1 as never)}
          title="Editar receita"
          sub={recipe.name}
          right={
            <div className="flex items-center gap-2">
              <Button
                variant="soft"
                size="sm"
                icon={<IcSparkle size={12} />}
                onClick={form.handleImprove}
                disabled={!form.name.trim() || form.improving}
              >
                {form.improving ? 'Pensando…' : 'Melhorar com IA'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={!form.name.trim() || saveMutation.isPending}
                icon={<IcCheck size={14} />}
              >
                {saveMutation.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          }
        />
        {form.improveErr && (
          <div className="mx-[18px] mb-2 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {form.improveErr}
          </div>
        )}
      </div>

      <div className="px-[18px] pt-2 pb-[110px] flex flex-col gap-[18px]">
        <RecipeForm form={form} />
        {saveMutation.isError && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Erro ao salvar. Tente de novo.
          </div>
        )}
      </div>
    </div>
  );
}
