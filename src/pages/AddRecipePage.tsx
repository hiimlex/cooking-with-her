import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { RecipeForm } from '@/components/organisms';
import { IcCheck, IcSparkle } from '@/icons';
import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import { addIngredient } from '@/api/pantry';
import { BG_PRESETS, AC_PRESETS, useRecipeForm } from '@/hooks/useRecipeForm';

export function AddRecipePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const form        = useRecipeForm();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const pendingCreations = form.ingredients.filter(
        (i) => i.notInPantry && !i.ingredientId,
      );
      const created = await Promise.all(
        pendingCreations.map((i) =>
          addIngredient({
            name:   i.name,
            qty:    0,
            unit:   i.unit,
            cat:    (i.cat as any) ?? 'Other',
            expiry: 30,
          }),
        ),
      );
      const createdMap = Object.fromEntries(created.map((c) => [c.name, c.id]));
      const resolvedIngredients = form.ingredients
        .map((i) => {
          const id = i.notInPantry
            ? (createdMap[i.name] ?? i.ingredientId)
            : i.ingredientId;
          return { ingredientId: id, qty: i.qty, unit: i.unit, optional: i.optional ?? false };
        })
        .filter((i) => Boolean(i.ingredientId));

      return http.post(ENDPOINTS.recipes.create, {
        name:        form.name,
        tag:         form.tag,
        time:        form.time,
        difficulty:  form.diff,
        servings:    form.servings,
        why:         form.why,
        bg:          BG_PRESETS[form.bgIdx],
        accent:      AC_PRESETS[form.bgIdx],
        sprites:     [],
        steps:       form.steps,
        ingredients: resolvedIngredients,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      navigate('/us/recipes', { replace: true });
    },
  });

  return (
    <div className="bg-bg min-h-full flex flex-col">

      <div className="sticky top-0 z-20 bg-bg flex-shrink-0">
        <SubHeader
          onBack={() => navigate(-1 as never)}
          title="Nova receita"
          sub="Salva algo que fizeram juntos"
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
        <RecipeForm form={form} showColorPicker />
        {saveMutation.isError && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Erro ao salvar. Tente de novo.
          </div>
        )}
      </div>
    </div>
  );
}
