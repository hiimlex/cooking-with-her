// src/types/index.ts

export type PersonId = 'alex' | 'yuka' | 'ai';

export interface Person {
  name: string;
  color: string;
}

export interface Couple {
  alex: Person;
  yuka: Person;
  ai: Person;
  code: string;
  startedDate: string;
}

export type IngredientCat = 'Produce' | 'Protein' | 'Dairy' | 'Pantry' | 'Spice' | 'Other';

export interface Ingredient {
  id:               string;
  name:             string;
  qty:              number;
  unit:             string;
  cat:              IngredientCat;
  expiry:           number;
  monthlyBuy?:      number;
  alwaysAvailable?: boolean;
}

export interface RecipeIngredient {
  id: string;
  qty: number;
  unit: string;
}

export interface RecipeStep {
  t: string;        // title
  d: string;        // description
  mins: number;
}

export interface Nutrition {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export type RecipeTag = 'Brunch' | 'Lunch' | 'Dinner' | 'Snack' | 'Weekday' | 'AI';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type CookStatus = 'ok' | 'low' | 'unavailable';

export interface Recipe {
  id: string;
  name: string;
  tag: RecipeTag;
  time: number;
  difficulty: Difficulty;
  by: PersonId;
  cookedCount: number;
  rating: number;
  bg: string;
  accent: string;
  servings?: number;
  nutrition?: Nutrition;
  sprites: FoodGlyphId[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  why?: string;
  favorite?: boolean;
  cookability?: CookStatus;
}

export interface Utensil {
  id: string;
  name: string;
  have: boolean;
  emoji: string;
}

export type MealType = 'dinner' | 'free';

export interface HistoryEntry {
  recipeId: string;
  by:       PersonId;
  daysAgo:  number;
  rating:   number;
  note?:    string;
  mealType: MealType;
}

export interface ShoppingEntry {
  id:           string;
  name:         string;
  qty:          string;
  cat:          string;
  done:         boolean;
  by:           PersonId | 'ai' | 'other';
  ingredientId?: string;
}

export interface Suggestion {
  id: string;
  name: string;
  reason: string;
}

export interface Memory {
  id: string;
  recipeId: string;
  by: PersonId;
  date: string;
  bg: string;
}

export interface AITag {
  id: string;
  label: string;
  group: 'time' | 'mood' | 'flavor' | 'mode';
}

export interface Stats {
  totalCooked:   number;
  streak:        number;
  longestStreak: number;
  byAlex:        number;
  byYuka:        number;
  avgRating:     number;
  weekCount:     number;
  weekGoal:      number;
  /** Human-readable date: "Mar 14, 2024" */
  startedDate?:  string;
  topRecipes:    string[];
  cuisineMix:    Array<{ name: string; pct: number; color: string }>;
  /** Cook count per day, keyed by ISO date (YYYY-MM-DD) */
  heatmap:         Record<string, number>;
  /** Recipes cooked per day, keyed by ISO date */
  heatmapRecipes?: Record<string, { id: string; name: string }[]>;
}

// All allowed sprite/food glyph ids — keeps Ingredient.sprite safe.
export type FoodGlyphId =
  | 'Tomato' | 'Carrot' | 'Egg' | 'Pepper' | 'Garlic' | 'Bread'
  | 'Chicken' | 'Fish' | 'Rice' | 'Cheese' | 'Milk' | 'Herb'
  | 'Onion' | 'Lemon' | 'Pasta';

export type LabelColor =
  | 'gray' | 'purple' | 'green' | 'yellow' | 'orange'
  | 'red' | 'blue' | 'pink';
