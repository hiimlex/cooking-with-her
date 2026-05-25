import { useCallback, useState } from 'react';
import { improveRecipeAI } from '@/api/ai';
import type { Difficulty, RecipeTag } from '@/types';
import type { PickedIngredient } from '@/components/molecules/IngredientPicker';

export interface StepDraft {
  title: string;
  desc:  string;
  mins:  number;
}

export interface RecipeFormValues {
  name:        string;
  tag:         RecipeTag;
  time:        number;
  diff:        Difficulty;
  servings:    number;
  why:         string;
  ingredients: PickedIngredient[];
  steps:       StepDraft[];
  bgIdx:       number;
}

export interface UseRecipeFormReturn {
  name:           string;
  tag:            RecipeTag;
  time:           number;
  showCustomTime: boolean;
  diff:           Difficulty;
  servings:       number;
  why:            string;
  ingredients:    PickedIngredient[];
  steps:          StepDraft[];
  bgIdx:          number;
  isCustomTime:   boolean;

  setName:           (v: string) => void;
  setTag:            (v: RecipeTag) => void;
  setTime:           (v: number) => void;
  setShowCustomTime: (v: boolean) => void;
  setDiff:           (v: Difficulty) => void;
  setServings:       (v: number) => void;
  setWhy:            (v: string) => void;
  setIngredients:    (v: PickedIngredient[]) => void;
  setBgIdx:          (v: number) => void;

  updateStep: (i: number, field: keyof StepDraft, value: string | number) => void;
  addStep:    () => void;
  removeStep: (i: number) => void;

  reset: (values: Partial<RecipeFormValues>) => void;

  handleImprove: () => Promise<void>;
  improving:     boolean;
  improveErr:    string;
}

export const BG_PRESETS  = ['#FFF3CD', '#D1FAE5', '#DBEAFE', '#FCE7F3', '#EDE9FE', '#FEE2E2'];
export const AC_PRESETS  = ['#E8A000', '#059669', '#2563EB', '#DB2777', '#7C3AED', '#DC2626'];
export const TIME_PRESETS = [15, 30, 45, 60] as const;

export function useRecipeForm(initial?: Partial<RecipeFormValues>): UseRecipeFormReturn {
  const [name,           setName]           = useState(initial?.name        ?? '');
  const [tag,            setTag]            = useState<RecipeTag>(initial?.tag         ?? 'Dinner');
  const [time,           setTime]           = useState(initial?.time        ?? 30);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [diff,           setDiff]           = useState<Difficulty>(initial?.diff        ?? 'Easy');
  const [servings,       setServings]       = useState(initial?.servings    ?? 2);
  const [why,            setWhy]            = useState(initial?.why         ?? '');
  const [ingredients,    setIngredients]    = useState<PickedIngredient[]>(initial?.ingredients ?? []);
  const [steps,          setSteps]          = useState<StepDraft[]>(
    initial?.steps ?? [{ title: 'Preparar ingredientes', desc: '', mins: 5 }],
  );
  const [bgIdx,      setBgIdx]      = useState(initial?.bgIdx ?? 0);
  const [improving,  setImproving]  = useState(false);
  const [improveErr, setImproveErr] = useState('');

  const isCustomTime = !(TIME_PRESETS as readonly number[]).includes(time);

  const reset = useCallback((values: Partial<RecipeFormValues>) => {
    if (values.name        !== undefined) setName(values.name);
    if (values.tag         !== undefined) setTag(values.tag);
    if (values.time        !== undefined) {
      setTime(values.time);
      setShowCustomTime(!(TIME_PRESETS as readonly number[]).includes(values.time));
    }
    if (values.diff        !== undefined) setDiff(values.diff);
    if (values.servings    !== undefined) setServings(values.servings);
    if (values.why         !== undefined) setWhy(values.why);
    if (values.ingredients !== undefined) setIngredients(values.ingredients);
    if (values.steps       !== undefined) setSteps(values.steps);
    if (values.bgIdx       !== undefined) setBgIdx(values.bgIdx);
  }, []);

  const updateStep = useCallback(
    (i: number, field: keyof StepDraft, value: string | number) =>
      setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))),
    [],
  );

  const addStep = useCallback(
    () => setSteps((prev) => [...prev, { title: `Passo ${prev.length + 1}`, desc: '', mins: 5 }]),
    [],
  );

  const removeStep = useCallback(
    (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i)),
    [],
  );

  const handleImprove = useCallback(async () => {
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
      setIngredients(
        improved.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId ?? '',
          name:         ing.name,
          qty:          ing.stockQty != null ? Math.min(ing.qty, ing.stockQty) : ing.qty,
          unit:         ing.unit,
          notInPantry:  ing.notInPantry,
        })),
      );
      setSteps(improved.steps.map((s) => ({ title: s.title, desc: s.desc, mins: s.mins })));
    } catch {
      setImproveErr('A Nonna não conseguiu melhorar agora. Tente de novo.');
    } finally {
      setImproving(false);
    }
  }, [name]);

  return {
    name, tag, time, showCustomTime, diff, servings, why, ingredients, steps, bgIdx,
    isCustomTime,
    setName, setTag, setTime, setShowCustomTime, setDiff, setServings, setWhy,
    setIngredients, setBgIdx,
    updateStep, addStep, removeStep,
    reset,
    handleImprove, improving, improveErr,
  };
}
