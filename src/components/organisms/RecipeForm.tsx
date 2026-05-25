import { Input } from '@/components/atoms';
import { TextArea } from '@/components/atoms/Input';
import { FieldGroup, IngredientPicker, Segmented } from '@/components/molecules';
import { IcPlus, IcX } from '@/icons';
import {
  BG_PRESETS,
  AC_PRESETS,
  TIME_PRESETS,
  type UseRecipeFormReturn,
  type StepDraft,
} from '@/hooks/useRecipeForm';
import type { Difficulty, RecipeTag } from '@/types';

interface RecipeFormProps {
  form:             UseRecipeFormReturn;
  showColorPicker?: boolean;
}

export function RecipeForm({ form, showColorPicker = false }: RecipeFormProps) {
  const {
    name, setName,
    tag, setTag,
    time, setTime, showCustomTime, setShowCustomTime, isCustomTime,
    diff, setDiff,
    servings, setServings,
    why, setWhy,
    ingredients, setIngredients,
    steps,
    bgIdx, setBgIdx,
    updateStep, addStep, removeStep,
    improving,
  } = form;

  return (
    <>
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

      {/* Color theme — add mode only */}
      {showColorPicker && (
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
      )}

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
          {steps.map((step: StepDraft, i: number) => (
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
    </>
  );
}
