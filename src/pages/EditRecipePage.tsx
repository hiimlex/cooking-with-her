import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/components/atoms';
import { TextArea } from '@/components/atoms/Input';
import { FieldGroup, IngredientPicker, Segmented, SubHeader } from '@/components/molecules';
import { IcCheck, IcPlus, IcSparkle, IcX } from '@/icons';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { updateRecipe } from '@/api/recipes';
import { improveStepsAI } from '@/api/ai';
import type { Difficulty, RecipeTag } from '@/types';
import type { PickedIngredient } from '@/components/molecules/IngredientPicker';

interface StepDraft {
  title: string;
  desc:  string;
  mins:  number;
}

export function EditRecipePage() {
  const navigate     = useNavigate();
  const { id = '' }  = useParams<{ id: string }>();
  const queryClient  = useQueryClient();
  const { recipe, isLoading } = useRecipeDetail(id);

  const [name,        setName]        = useState('');
  const [tag,         setTag]         = useState<RecipeTag>('Dinner');
  const [time,        setTime]        = useState(30);
  const [diff,        setDiff]        = useState<Difficulty>('Easy');
  const [servings,    setServings]    = useState(2);
  const [why,         setWhy]         = useState('');
  const [steps,       setSteps]       = useState<StepDraft[]>([]);
  const [ingredients, setIngredients] = useState<PickedIngredient[]>([]);
  const [improving,   setImproving]   = useState(false);
  const [improveErr,  setImproveErr]  = useState('');

  useEffect(() => {
    if (!recipe) return;
    setName(recipe.name);
    setTag(recipe.tag as RecipeTag);
    setTime(recipe.time);
    setDiff(recipe.difficulty as Difficulty);
    setServings(recipe.servings ?? 2);
    setWhy(recipe.why ?? '');
    setSteps(
      recipe.steps.map((s) => ({ title: s.title, desc: s.desc, mins: s.mins })),
    );
    setIngredients(
      recipe.ingredients.map((i) => ({
        ingredientId: i.ingredient.id,
        name:         i.ingredient.name,
        qty:          i.qty,
        unit:         i.unit,
        optional:     i.optional,
      })),
    );
  }, [recipe?.id]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateRecipe(id, {
        name, tag, time, difficulty: diff, servings, why, steps,
        ingredients: ingredients.map((i) => ({
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

  const handleImprove = async () => {
    if (!name.trim()) return;
    setImproving(true);
    setImproveErr('');
    try {
      const improved = await improveStepsAI(name, {
        steps:       steps.length > 0 ? steps : undefined,
        ingredients: ingredients.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit })),
        tag,
        time,
        difficulty:  diff,
        servings,
      });
      setSteps(improved);
    } catch {
      setImproveErr('A Nonna não conseguiu melhorar agora. Tente de novo.');
    } finally {
      setImproving(false);
    }
  };

  const updateStep = (i: number, field: keyof StepDraft, value: string | number) => {
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addStep = () =>
    setSteps((prev) => [...prev, { title: `Passo ${prev.length + 1}`, desc: '', mins: 5 }]);

  const removeStep = (i: number) =>
    setSteps((prev) => prev.filter((_, idx) => idx !== i));

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
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Editar receita"
        sub={recipe.name}
        right={
          <Button
            variant="primary"
            onClick={() => saveMutation.mutate()}
            disabled={!name.trim() || saveMutation.isPending}
            icon={<IcCheck size={14} />}
          >
            {saveMutation.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        }
      />

      <div className="px-[18px] pt-2 pb-5 flex flex-col gap-[18px]">
        <FieldGroup label="Nome da receita">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Macarrão da Yuka"
          />
        </FieldGroup>

        <FieldGroup label="Tipo de refeição">
          <Segmented<RecipeTag>
            full value={tag} onChange={setTag}
            options={[
              { value: 'Brunch', label: 'Brunch' },
              { value: 'Lunch',  label: 'Almoço' },
              { value: 'Dinner', label: 'Jantar' },
              { value: 'Snack',  label: 'Lanche' },
            ]}
          />
        </FieldGroup>

        <FieldGroup label="Quanto tempo?">
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

        <FieldGroup label="Dificuldade">
          <Segmented<Difficulty>
            full value={diff} onChange={setDiff}
            options={[
              { value: 'Easy',   label: 'Fácil'   },
              { value: 'Medium', label: 'Médio'   },
              { value: 'Hard',   label: 'Difícil' },
            ]}
          />
        </FieldGroup>

        <FieldGroup label="Porções">
          <Segmented<number>
            full value={servings} onChange={setServings}
            options={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 4, label: '4' },
              { value: 6, label: '6' },
            ]}
          />
        </FieldGroup>

        <FieldGroup label="Por que essa receita?" sub="Opcional — uma frase sobre ela">
          <TextArea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Uma receita fácil e reconfortante…"
            rows={2}
          />
        </FieldGroup>

        <FieldGroup label="Ingredientes" sub="Busque na sua despensa">
          <IngredientPicker value={ingredients} onChange={setIngredients} />
        </FieldGroup>

        <FieldGroup
          label="Passos do preparo"
          right={
            <Button
              variant="soft"
              size="sm"
              icon={<IcSparkle size={12} />}
              onClick={handleImprove}
              disabled={improving || !name.trim()}
            >
              {improving ? 'Pensando…' : 'Melhorar com IA'}
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-canvas rounded-2xl p-3.5 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-xl bg-accent-tint text-accent flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                    {i + 1}
                  </div>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(i, 'title', e.target.value)}
                    placeholder="Título do passo"
                    className="flex-1 text-sm font-semibold"
                  />
                  <button
                    onClick={() => removeStep(i)}
                    className="w-6 h-6 rounded-xl flex items-center justify-center text-subtle hover:text-danger transition-colors flex-shrink-0"
                  >
                    <IcX size={13} />
                  </button>
                </div>
                <TextArea
                  value={step.desc}
                  onChange={(e) => updateStep(i, 'desc', e.target.value)}
                  placeholder="Descrição do passo…"
                  rows={2}
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Tempo estimado:</span>
                  <Input
                    value={String(step.mins)}
                    onChange={(e) => updateStep(i, 'mins', Number(e.target.value) || 0)}
                    placeholder="5"
                    className="w-16 text-sm text-center"
                  />
                  <span className="text-xs text-muted">min</span>
                </div>
              </div>
            ))}

            <button
              onClick={addStep}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-canvas text-muted text-sm font-semibold hover:border-accent hover:text-accent transition-colors"
            >
              <IcPlus size={14} />
              Adicionar passo
            </button>

            {improveErr && (
              <div className="text-xs text-red-500">{improveErr}</div>
            )}
          </div>
        </FieldGroup>

        {saveMutation.isError && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Erro ao salvar. Tente de novo.
          </div>
        )}
      </div>
    </div>
  );
}
