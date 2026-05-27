// Shared endpoint contracts — paths, query params, and request bodies.
// Both server and client reference this file so the same strings and
// request shapes are never duplicated or allowed to drift.
//
// Response DTOs live on each side: server/src/routes/* and src/model/*.

// ─── Primitive unions ──────────────────────────────────────────────────────

export type PersonId      = 'alex' | 'yuka';
export type IngredientCat = 'Produce' | 'Protein' | 'Dairy' | 'Pantry' | 'Spice' | 'Other';
export type RecipeTag     = 'Brunch' | 'Lunch' | 'Dinner' | 'Snack' | 'Weekday' | 'AI';
export type Difficulty    = 'Easy' | 'Medium' | 'Hard';
export type MealType      = 'dinner' | 'free';
export type SortOrder     = 'asc' | 'desc';
export type PantrySort    = 'expiry' | 'name' | 'qty';

// ─── Endpoint paths ────────────────────────────────────────────────────────

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me:    '/auth/me',
  },
  pantry: {
    list:   '/pantry',
    create: '/pantry',
    update: (id: string) => `/pantry/${id}`,
    delete: (id: string) => `/pantry/${id}`,
  },
  recipes: {
    list:   '/recipes',
    get:    (id: string) => `/recipes/${id}`,
    create: '/recipes',
    fromAI: '/recipes/from-ai',
    update: (id: string) => `/recipes/${id}`,
    delete: (id: string) => `/recipes/${id}`,
    cook:     (id: string) => `/recipes/${id}/cook`,
    finish:   (id: string) => `/recipes/${id}/finish`,
    favorite: (id: string) => `/recipes/${id}/favorite`,
  },
  shopping: {
    list:      '/shopping',
    create:    '/shopping',
    toggle:    (id: string) => `/shopping/${id}/toggle`,
    delete:    (id: string) => `/shopping/${id}`,
    clearDone: '/shopping/done',
    checkout:  '/shopping/checkout',
  },
  history: {
    list:   '/history',
    latest: '/history/latest',
  },
  stats: {
    get: '/stats',
  },
  ai: {
    generate:        '/ai/generate',
    tags:            '/ai/tags',
    improveSteps:    '/ai/improve-steps',
    improveRecipe:   '/ai/improve-recipe',
    ingredientSync:  '/ai/ingredient-sync',
  },
  utensils: {
    list:   '/utensils',
    create: '/utensils',
    patch:  (id: string) => `/utensils/${id}`,
  },
  memories: {
    list:        '/memories',
    create:      '/memories',
    uploadPhoto: '/memories/upload-photo',
    delete:      (id: string) => `/memories/${id}`,
  },
  orders: {
    list:   '/orders',
    create: '/orders',
    delete: (id: string) => `/orders/${id}`,
  },
} as const;

// ─── Query params ──────────────────────────────────────────────────────────

export interface PantryQuery {
  cat?:          IngredientCat;
  search?:       string;
  /** Convenience shorthand — equivalent to expiryMax=4 */
  expiringSoon?: 'true' | 'false';
  /** Return only ingredients with expiry <= this value */
  expiryMax?:    string;
  sortBy?:       PantrySort;
  sortOrder?:    SortOrder;
}

export interface RecipesQuery {
  tag?:        string;
  search?:     string;
  difficulty?: string;
  /** Axios serializes numbers to strings; server receives as string and uses parseInt */
  timeMax?:    number;
  favorite?:   'true';
}

export interface HistoryQuery {
  /** Axios serializes numbers to strings; server receives as string and uses parseInt */
  limit?:    number;
  offset?:   number;
  personId?: PersonId;
}

// ─── Request bodies ────────────────────────────────────────────────────────

export interface LoginBody {
  code: string;
  who:  PersonId;
}

export interface IngredientBody {
  name:             string;
  qty:              number;
  unit:             string;
  cat:              IngredientCat;
  expiry:           number;
  monthlyBuy?:      number;
  alwaysAvailable?: boolean;
}

export interface RecipeBody {
  name:       string;
  tag:        RecipeTag;
  time:       number;
  difficulty: Difficulty;
  bg:         string;
  accent:     string;
  servings?:  number;
  why?:       string;
  sprites?:   string[];
  nutrition?: { kcal: number; protein: number; carbs: number; fat: number; fiber?: number };
  steps?:     Array<{ order: number; title: string; desc: string; mins: number }>;
}

export interface CookBody {
  rating:    number;
  note?:     string;
  mealType?: MealType;
  /** ISO date string — omit to default to now() on the server */
  cookedAt?: string;
}

export interface ShoppingItemBody {
  name:          string;
  qty:           string;
  cat:           string;
  ingredientId?: string;
}

export interface CheckoutBody {
  items: Array<{ ingredientId: string; purchasedQty: number }>;
}

export interface AIGenerateBody {
  prompt:         string;
  timeMinutes:    number;
  tags:           string[];
  useWhatWeHave?: boolean;
}

export interface MemoryBody {
  recipeId:  string;
  /** ISO date string */
  date:      string;
  bg:        string;
  photoUrl?: string;
}

export interface UtensilBody {
  name:  string;
  emoji: string;
  have?: boolean;
}

export interface UtensilPatch {
  have?:  boolean;
  name?:  string;
  emoji?: string;
}

export interface OrderQuery {
  from?: string;
  to?:   string;
}

export interface OrderBody {
  date:  string;
  note?: string;
}
