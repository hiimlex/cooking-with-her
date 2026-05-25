import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { AIGenerateBody } from '@shared/api';

// ─── Generated recipe shape (returned pela Nonna, não persistida) ─────────────

export interface GeneratedIngredient {
  name: string;
  qty:  number;
  unit: string;
}

export interface GeneratedStep {
  title: string;
  desc:  string;
  mins:  number;
}

export interface GeneratedRecipe {
  name:        string;
  tag:         string;
  time:        number;
  difficulty:  string;
  servings:    number;
  why:         string;
  bg:          string;
  accent:      string;
  sprites:     string[];
  nutrition:   { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
  ingredients: GeneratedIngredient[];
  steps:       GeneratedStep[];
}

export interface AIContext {
  pantryItems:   number;
  expiringItems: number;
}

export interface AIResult {
  mode:    'generated';
  recipe:  GeneratedRecipe;
  context: AIContext;
}

// ─── API call ──────────────────────────────────────────────────────────────

export async function generateAI(body: AIGenerateBody): Promise<AIResult> {
  const { data } = await http.post<AIResult>(ENDPOINTS.ai.generate, body);
  return data;
}

// ─── Improve full recipe ───────────────────────────────────────────────────

export interface ImprovedRecipeIngredient {
  name:         string;
  qty:          number;
  unit:         string;
  ingredientId: string | null;
  stockQty:     number | null;
  notInPantry:  boolean;
}

export interface ImprovedRecipe {
  tag:         string;
  time:        number;
  difficulty:  string;
  servings:    number;
  why:         string;
  ingredients: ImprovedRecipeIngredient[];
  steps:       Array<{ title: string; desc: string; mins: number }>;
}

export async function improveRecipeAI(recipeName: string): Promise<ImprovedRecipe> {
  const { data } = await http.post<{ recipe: ImprovedRecipe }>(
    ENDPOINTS.ai.improveRecipe,
    { recipeName },
  );
  return data.recipe;
}

export interface ImprovedStep {
  title: string;
  desc:  string;
  mins:  number;
}

export interface ImproveStepsContext {
  steps?:       ImprovedStep[];
  ingredients?: Array<{ name: string; qty: number; unit: string }>;
  tag?:         string;
  time?:        number;
  difficulty?:  string;
  servings?:    number;
}

export async function improveStepsAI(
  recipeName: string,
  context: ImproveStepsContext,
): Promise<ImprovedStep[]> {
  const { data } = await http.post<{ steps: ImprovedStep[] }>(
    ENDPOINTS.ai.improveSteps,
    { recipeName, ...context },
  );
  return data.steps;
}
