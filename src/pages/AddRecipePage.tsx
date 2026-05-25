import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/components/atoms';
import { TextArea } from '@/components/atoms/Input';
import { FieldGroup, IngredientPicker, Segmented, SubHeader } from '@/components/molecules';
import { IcCheck, IcPlus, IcSparkle, IcX } from '@/icons';
import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import { improveRecipeAI } from '@/api/ai';
import { addIngredient } from '@/api/pantry';
import type { Difficulty, RecipeTag } from '@/types';
import type { PickedIngredient } from '@/components/molecules/IngredientPicker';

interface StepDraft {
  title: string;
  desc:  string;
  mins:  number;
}

const BG_PRESETS = ['#FFF3CD', '#D1FAE5', '#DBEAFE', '#FCE7F3', '#EDE9FE', '#FEE2E2'];
const AC_PRESETS = ['#E8A000', '#059669', '#2563EB', '#DB2777', '#7C3AED', '#DC2626'];
const TIME_PRESETS = [15, 30, 45, 60] as const;

export function AddRecipePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [name,           setName]           = useState('');
  const [tag,            setTag]            = useState<RecipeTag>('Dinner');
  const [time,           setTime]           = useState(30);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [diff,           setDiff]           = useState<Difficulty>('Easy');
  const [servings,       setServings]       = useState(2);
  const [why,            setWhy]            = useState('');
  const [ingredients,    setIngredients]    = useState<PickedIngredient[]>([]);
  const [steps,          setSteps]          = useState<StepDraft[]>([
    { title: 'Preparar ingredientes', desc: '', mins: 5 },
  ]);
  const [bgIdx,     setBgIdx]     = useState(0);
  const [improving, setImproving] = useState(false);
  const [improveErr, setImproveErr] = useState('');

  const isCustomTime = !(TIME_PRESETS as readonly number[]).includes(time);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const pendingCreations = ingredients.filter(
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
      const resolvedIngredients = ingredients
        .map((i) => {
          const id = i.notInPantry
            ? (createdMap[i.name] ?? i.ingredientId)
            : i.ingredientId;
          return { ingredientId: id, qty: i.qty, unit: i.unit, optional: i.optional ?? false };
        })
        .filter((i) => Boolean(i.ingredientId));

      return http.post(ENDPOINTS.recipes.create, {
        name, tag, time, difficulty: diff, servings, why,
        bg: BG_PRESETS[bgIdx], accent: AC_PRESETS[bgIdx],
        sprites: [], steps, ingredients: resolvedIngredients,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      navigate('/us/recipes', { replace: true });
    },
  });

  const updateStep = (i: number, field: keyof StepDraft, value: string | number) =>
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const addStep = () =>
    setSteps((prev) => [...prev, { title: `Passo ${prev.length + 1}`, desc: '', mins: 5 }]);

  const removeStep = (i: number) =>
    setSteps((prev) => prev.filter((_, idx) => idx !== i));

  const handleImprove = async () => {
    if (!name.trim()) return;
    setImproving(true);
    setImproveErr('');
    try {
      const improved = await improveRecipeAI(name.trim());
      if (improved.tag)        setTag(improved.tag as RecipeTag);
      if (improved.time) {
        setTime(improved.time);
        if (!(TIME_PRESETS as readonly number[]).includes(improved.time)) {
          setShowCustomTime(true);
        }
      }
      if (improved.difficulty) setDiff(improved.difficulty as Difficulty);
      if (improved.servings)   setServings(improved.servings);
      if (improved.why)        setWhy(improved.why);
      const picked: PickedIngredient[] = improved.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId ?? '',
        name:         ing.name,
        qty:          ing.stockQty != null ? Math.min(ing.qty, ing.stockQty) : ing.qty,
        unit:         ing.unit,
        notInPantry:  ing.notInPantry,
      }));
      setIngredients(picked);
      setSteps(improved.steps.map((s) => ({ title: s.title, desc: s.desc, mins: s.mins })));
    } catch {
      setImproveErr('A Nonna não conseguiu melhorar agora. Tente de novo.');
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="bg-bg min-h-full flex flex-col">

      {/* ── Sticky header ─────────────────────────────────────────────── */}
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
                onClick={handleImprove}
                disabled={!name.trim() || improving}
              >
                {improving ? 'Pensando…' : 'Melhorar com IA'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={!name.trim() || saveMutation.isPending}
                icon={<IcCheck size={14} />}
              >
                {saveMutation.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          }
        />
        {improveErr && (
          <div className="mx-[18px] mb-2 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {improveErr}
          </div>
        )}
      </div>

      {/* ── Scrollable form content ────────────────────────────────────── */}
      <div className="px-[18px] pt-2 pb-[110px] flex flex-col gap-[18px]">

        {/* Name */}
        <FieldGroup label="Nome da receita">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Macarrão da Yuka"
          />
        </FieldGroup>

        {/* Tag */}
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

        {/* Time — presets + custom */}
        <FieldGroup label="Quanto tempo?">
          <div className="flex gap-1.5">
            {TIME_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTime(t); setShowCustomTime(false); }}
                className={[
                  'flex-1 px-2 py-1.5 rounded-full text-[13px] font-bold transition-colors',
                  time === t && !isCustomTime
                    ? 'bg-card text-ink shadow-sm'
                    : 'bg-canvas text-muted',
                ].join(' ')}
              >
                {t < 60 ? `${t}m` : '1h+'}
              </button>
            ))}
            {/* Custom time toggle */}
            <button
              type="button"
              onClick={() => setShowCustomTime(true)}
              className={[
                'flex-1 px-2 py-1.5 rounded-full text-[13px] font-bold transition-colors',
                isCustomTime || showCustomTime
                  ? 'bg-card text-ink shadow-sm'
                  : 'bg-canvas text-muted',
              ].join(' ')}
            >
              {isCustomTime ? `${time}m` : '…'}
            </button>
          </div>

          {(showCustomTime || isCustomTime) && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min={1}
                max={480}
                value={time}
                onChange={(e) => setTime(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 text-center rounded-xl border border-canvas bg-card text-ink text-sm py-1.5 focus:outline-none focus:border-accent"
              />
              <span className="text-sm text-muted">min</span>
            </div>
          )}
        </FieldGroup>

        {/* Difficulty */}
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

        {/* Servings */}
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

        {/* Color theme */}
        <FieldGroup label="Cor da receita">
          <div className="flex gap-2">
            {BG_PRESETS.map((bg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBgIdx(i)}
                className="w-8 h-8 rounded-2xl border-2 transition-all"
                style={{
                  background:  bg,
                  borderColor: bgIdx === i ? AC_PRESETS[i] : 'transparent',
                }}
              />
            ))}
          </div>
        </FieldGroup>

        {/* Why */}
        <FieldGroup label="Por que essa receita?" sub="Opcional">
          <TextArea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Uma receita fácil e reconfortante…"
            rows={2}
          />
        </FieldGroup>

        {/* Ingredients */}
        <FieldGroup
          label="Ingredientes"
          sub={improving ? 'Aguardando a Nonna…' : 'Busque na despensa ou use a IA'}
        >
          <IngredientPicker value={ingredients} onChange={setIngredients} />
        </FieldGroup>

        {/* Steps */}
        <FieldGroup label="Passos do preparo">
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <div key={i} className="bg-canvas rounded-2xl p-3.5 flex flex-col gap-2.5">
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
                    type="button"
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
              type="button"
              onClick={addStep}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-canvas text-muted text-sm font-semibold hover:border-accent hover:text-accent transition-colors"
            >
              <IcPlus size={14} />
              Adicionar passo
            </button>
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
