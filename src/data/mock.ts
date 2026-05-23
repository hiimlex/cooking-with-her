// src/data/mock.ts — mock data
import type {
  Couple, Ingredient, Utensil, Recipe, HistoryEntry, ShoppingEntry,
  Suggestion, Memory, AITag, Stats,
} from '@/types';

export const COUPLE: Couple = {
  alex: { name: 'Alex', color: '#3b82f6' },
  yuka: { name: 'Yuka', color: '#ef4444' },
  ai:   { name: 'Nonna', color: '#7c3aed' },
  code: 'mochi',
  startedDate: 'Mar 14, 2024',
};

export const INGREDIENTS: Ingredient[] = [
  { id: 'tomato',  name: 'Tomato',         qty: 6,    unit: 'pcs',  cat: 'Produce', sprite: 'Tomato',  expiry: 4 },
  { id: 'onion',   name: 'Onion',          qty: 3,    unit: 'pcs',  cat: 'Produce', sprite: 'Onion',   expiry: 14 },
  { id: 'garlic',  name: 'Garlic',         qty: 1,    unit: 'head', cat: 'Produce', sprite: 'Garlic',  expiry: 21 },
  { id: 'carrot',  name: 'Carrots',        qty: 4,    unit: 'pcs',  cat: 'Produce', sprite: 'Carrot',  expiry: 9 },
  { id: 'pepper',  name: 'Bell Pepper',    qty: 2,    unit: 'pcs',  cat: 'Produce', sprite: 'Pepper',  expiry: 5 },
  { id: 'lemon',   name: 'Lemon',          qty: 2,    unit: 'pcs',  cat: 'Produce', sprite: 'Lemon',   expiry: 10 },
  { id: 'basil',   name: 'Fresh Basil',    qty: 1,    unit: 'pack', cat: 'Produce', sprite: 'Herb',    expiry: 3 },
  { id: 'egg',     name: 'Eggs',           qty: 8,    unit: 'pcs',  cat: 'Protein', sprite: 'Egg',     expiry: 12 },
  { id: 'chicken', name: 'Chicken breast', qty: 500,  unit: 'g',    cat: 'Protein', sprite: 'Chicken', expiry: 2 },
  { id: 'salmon',  name: 'Salmon fillet',  qty: 300,  unit: 'g',    cat: 'Protein', sprite: 'Fish',    expiry: 1 },
  { id: 'cheese',  name: 'Parmesan',       qty: 120,  unit: 'g',    cat: 'Dairy',   sprite: 'Cheese',  expiry: 30 },
  { id: 'milk',    name: 'Whole milk',     qty: 1,    unit: 'L',    cat: 'Dairy',   sprite: 'Milk',    expiry: 6 },
  { id: 'rice',    name: 'Jasmine rice',   qty: 800,  unit: 'g',    cat: 'Pantry',  sprite: 'Rice',    expiry: 180 },
  { id: 'pasta',   name: 'Spaghetti',      qty: 400,  unit: 'g',    cat: 'Pantry',  sprite: 'Pasta',   expiry: 365 },
  { id: 'bread',   name: 'Sourdough',      qty: 1,    unit: 'loaf', cat: 'Pantry',  sprite: 'Bread',   expiry: 4 },
];

export const UTENSILS: Utensil[] = [
  { id: 'pan',     name: 'Non-stick pan',    have: true,  emoji: '🍳' },
  { id: 'pot',     name: 'Medium pot',       have: true,  emoji: '🥘' },
  { id: 'oven',    name: 'Oven',             have: true,  emoji: '♨️' },
  { id: 'sheet',   name: 'Baking sheet',     have: true,  emoji: '🍪' },
  { id: 'knife',   name: 'Chef knife',       have: true,  emoji: '🔪' },
  { id: 'board',   name: 'Cutting board',    have: true,  emoji: '🪵' },
  { id: 'blender', name: 'Blender',          have: true,  emoji: '🌀' },
  { id: 'whisk',   name: 'Whisk',            have: true,  emoji: '➰' },
  { id: 'scale',   name: 'Kitchen scale',    have: false, emoji: '⚖️' },
  { id: 'thermo',  name: 'Meat thermometer', have: false, emoji: '🌡️' },
  { id: 'wok',     name: 'Wok',              have: true,  emoji: '🥢' },
  { id: 'grater',  name: 'Box grater',       have: true,  emoji: '🧀' },
];

export const RECIPES: Recipe[] = [
  {
    id: 'shakshuka', name: 'Sunday Shakshuka', tag: 'Brunch', time: 25, difficulty: 'Easy',
    by: 'alex', cookedCount: 7, rating: 5, bg: '#FFB3B3', accent: '#E63946', servings: 2,
    nutrition: { kcal: 380, protein: 22, carbs: 18, fat: 24, fiber: 5 },
    sprites: ['Tomato', 'Onion', 'Egg', 'Pepper'],
    ingredients: [
      { id: 'tomato', qty: 4, unit: 'pcs' },
      { id: 'onion',  qty: 1, unit: 'pc' },
      { id: 'garlic', qty: 3, unit: 'cloves' },
      { id: 'pepper', qty: 1, unit: 'pc' },
      { id: 'egg',    qty: 4, unit: 'pcs' },
      { id: 'basil',  qty: 1, unit: 'sprig' },
    ],
    steps: [
      { t: 'Chop the vegetables', d: 'Dice onion, mince garlic, chop bell pepper into small cubes.', mins: 5 },
      { t: 'Sauté the base', d: 'Heat olive oil in the pan. Add onion + pepper, cook 4 min. Add garlic, 30 sec.', mins: 5 },
      { t: 'Build the sauce', d: 'Add crushed tomatoes, paprika, cumin, salt. Simmer 8 minutes until thick.', mins: 8 },
      { t: 'Crack the eggs', d: 'Make wells in the sauce. Crack one egg into each well. Cover and cook.', mins: 6 },
      { t: 'Finish & serve', d: 'Top with basil, crumbled feta if you have it. Serve with bread.', mins: 1 },
    ],
  },
  {
    id: 'salmon', name: 'Lemon Butter Salmon', tag: 'Dinner', time: 20, difficulty: 'Easy',
    by: 'yuka', cookedCount: 12, rating: 5, bg: '#FFD9B3', accent: '#FF8C42', servings: 2,
    nutrition: { kcal: 460, protein: 38, carbs: 4, fat: 32, fiber: 1 },
    sprites: ['Fish', 'Lemon', 'Garlic', 'Herb'],
    ingredients: [
      { id: 'salmon', qty: 300, unit: 'g' },
      { id: 'lemon',  qty: 1,   unit: 'pc' },
      { id: 'garlic', qty: 2,   unit: 'cloves' },
      { id: 'basil',  qty: 1,   unit: 'sprig' },
    ],
    steps: [
      { t: 'Pat dry & season', d: 'Pat salmon dry. Season both sides with salt and pepper.', mins: 2 },
      { t: 'Sear skin down', d: "Pan on high. 4 min skin side, don't move it. Crispy is the goal.", mins: 5 },
      { t: 'Flip & butter', d: 'Flip. Add butter, garlic, lemon slices. Baste 3 min.', mins: 4 },
      { t: 'Rest', d: 'Plate it. Spoon pan butter over. Rest 2 minutes.', mins: 2 },
    ],
  },
  {
    id: 'carbonara', name: 'Real Carbonara', tag: 'Dinner', time: 30, difficulty: 'Medium',
    by: 'alex', cookedCount: 9, rating: 4, bg: '#FFE8A3', accent: '#FFD93D', servings: 2,
    nutrition: { kcal: 620, protein: 28, carbs: 68, fat: 26, fiber: 3 },
    sprites: ['Pasta', 'Egg', 'Cheese'],
    ingredients: [
      { id: 'pasta',  qty: 200, unit: 'g' },
      { id: 'egg',    qty: 3,   unit: 'yolks' },
      { id: 'cheese', qty: 80,  unit: 'g' },
    ],
    steps: [
      { t: 'Salt the water', d: 'Boil big pot of water. Salt it like the sea.', mins: 8 },
      { t: 'Whisk yolks + cheese', d: 'In a bowl, whisk 3 yolks, grated parmesan, lots of black pepper.', mins: 3 },
      { t: 'Crisp the guanciale', d: 'Render fat slowly over medium heat until golden and crispy.', mins: 7 },
      { t: 'Cook pasta', d: 'Pasta in boiling water. Save 1 cup pasta water before draining.', mins: 9 },
      { t: 'Off heat, combine', d: 'Pan OFF heat. Toss pasta with fat, then yolks + splash of water. Glossy, not scrambled.', mins: 3 },
    ],
  },
  {
    id: 'stirfry', name: 'Garlic Chicken Stir-fry', tag: 'Weekday', time: 18, difficulty: 'Easy',
    by: 'yuka', cookedCount: 14, rating: 4, bg: '#C8E6C8', accent: '#4FA34F', servings: 2,
    nutrition: { kcal: 520, protein: 42, carbs: 48, fat: 14, fiber: 6 },
    sprites: ['Chicken', 'Pepper', 'Carrot', 'Rice'],
    ingredients: [
      { id: 'chicken', qty: 400, unit: 'g' },
      { id: 'pepper',  qty: 1,   unit: 'pc' },
      { id: 'carrot',  qty: 2,   unit: 'pcs' },
      { id: 'garlic',  qty: 4,   unit: 'cloves' },
      { id: 'rice',    qty: 200, unit: 'g' },
    ],
    steps: [
      { t: 'Cook the rice', d: "Rice + water 1:1.5 ratio. Boil → simmer 15 min covered. Don't peek.", mins: 18 },
      { t: 'Slice everything', d: 'Chicken in thin strips. Carrots and pepper in matchsticks.', mins: 5 },
      { t: 'Sear the chicken', d: 'Wok screaming hot. Chicken in batches, golden edges. Remove.', mins: 4 },
      { t: 'Veggies + sauce', d: 'Veggies 2 min crisp. Garlic 30s. Soy + sesame + chicken back in.', mins: 3 },
    ],
  },
  {
    id: 'tomatosoup', name: 'Cozy Tomato Soup', tag: 'Lunch', time: 35, difficulty: 'Easy',
    by: 'alex', cookedCount: 5, rating: 5, bg: '#FFC1B3', accent: '#E63946', servings: 2,
    nutrition: { kcal: 280, protein: 8, carbs: 26, fat: 16, fiber: 7 },
    sprites: ['Tomato', 'Onion', 'Garlic', 'Herb'],
    ingredients: [
      { id: 'tomato', qty: 8,   unit: 'pcs' },
      { id: 'onion',  qty: 1,   unit: 'pc' },
      { id: 'garlic', qty: 3,   unit: 'cloves' },
      { id: 'milk',   qty: 200, unit: 'ml' },
      { id: 'basil',  qty: 1,   unit: 'sprig' },
    ],
    steps: [
      { t: 'Roast tomatoes', d: 'Halve tomatoes, olive oil, salt. 200°C oven, 25 min.', mins: 25 },
      { t: 'Soften aromatics', d: 'Onion + garlic in pot, 5 min. Add roasted tomatoes.', mins: 5 },
      { t: 'Blend smooth', d: 'Blend with stock until silky. Stir in milk. Taste, salt.', mins: 5 },
    ],
  },
  {
    id: 'fishtaco', name: 'Crispy Fish Tacos', tag: 'Dinner', time: 25, difficulty: 'Medium',
    by: 'yuka', cookedCount: 3, rating: 5, bg: '#B3DAFF', accent: '#5B9DFF', servings: 2,
    nutrition: { kcal: 540, protein: 32, carbs: 44, fat: 26, fiber: 5 },
    sprites: ['Fish', 'Lemon', 'Pepper'],
    ingredients: [
      { id: 'salmon', qty: 300, unit: 'g' },
      { id: 'lemon',  qty: 1,   unit: 'pc' },
      { id: 'pepper', qty: 1,   unit: 'pc' },
    ],
    steps: [
      { t: 'Slaw', d: 'Cabbage, lime, salt, jalapeño. Squeeze and let sit.', mins: 5 },
      { t: 'Fry the fish', d: 'Cornstarch + chili. Hot oil. Fry 3 min per side until shattering crisp.', mins: 8 },
      { t: 'Char tortillas', d: 'Naked flame, 30 sec each side. Slight burn = flavor.', mins: 3 },
      { t: 'Build', d: 'Tortilla → slaw → fish → crema → lime. Eat immediately.', mins: 2 },
    ],
  },
];

export const HISTORY: HistoryEntry[] = [
  { recipeId: 'stirfry',    by: 'yuka', daysAgo: 0, rating: 5, note: 'Best one yet ⭐ extra garlic was the move' },
  { recipeId: 'salmon',     by: 'alex', daysAgo: 1, rating: 4, note: 'Slightly overcooked but ok' },
  { recipeId: 'shakshuka',  by: 'alex', daysAgo: 2, rating: 5 },
  { recipeId: 'carbonara',  by: 'yuka', daysAgo: 3, rating: 5, note: 'Yolks were perfect this time!' },
  { recipeId: 'stirfry',    by: 'alex', daysAgo: 4, rating: 4 },
  { recipeId: 'tomatosoup', by: 'yuka', daysAgo: 5, rating: 5, note: 'cozy 🫶' },
  { recipeId: 'shakshuka',  by: 'yuka', daysAgo: 6, rating: 5 },
];

export const SHOPPING: ShoppingEntry[] = [
  { id: 's1', name: 'Avocados',     qty: '3 pcs',   cat: 'Produce', done: false, by: 'yuka' },
  { id: 's2', name: 'Cilantro',     qty: '1 bunch', cat: 'Produce', done: false, by: 'yuka' },
  { id: 's3', name: 'Tortillas',    qty: '1 pack',  cat: 'Pantry',  done: true,  by: 'alex' },
  { id: 's4', name: 'Greek yogurt', qty: '500g',    cat: 'Dairy',   done: false, by: 'alex' },
  { id: 's5', name: 'Black beans',  qty: '2 cans',  cat: 'Pantry',  done: false, by: 'alex' },
];

export const SUGGESTIONS: Suggestion[] = [
  { id: 'ss1', name: 'Pasta',     reason: 'Almost out — 3 carbonaras left' },
  { id: 'ss2', name: 'Olive oil', reason: 'Used in 5 of your recipes' },
  { id: 'ss3', name: 'Lime',      reason: 'For the fish tacos you saved' },
  { id: 'ss4', name: 'Yogurt',    reason: 'You buy this every 2 weeks' },
];

export const MEMORIES: Memory[] = [
  { id: 'm1', recipeId: 'carbonara',  by: 'yuka', date: 'Tue, May 19', bg: '#FFE8A3' },
  { id: 'm2', recipeId: 'salmon',     by: 'alex', date: 'Sun, May 17', bg: '#FFD9B3' },
  { id: 'm3', recipeId: 'shakshuka',  by: 'alex', date: 'Sat, May 16', bg: '#FFB3B3' },
  { id: 'm4', recipeId: 'stirfry',    by: 'yuka', date: 'Wed, May 13', bg: '#C8E6C8' },
  { id: 'm5', recipeId: 'fishtaco',   by: 'yuka', date: 'Mon, May 11', bg: '#B3DAFF' },
  { id: 'm6', recipeId: 'tomatosoup', by: 'alex', date: 'Sun, May 10', bg: '#FFC1B3' },
];

export const AI_TAGS: AITag[] = [
  { id: 'quick',     label: '⚡ Quick (≤20 min)', group: 'time' },
  { id: 'lazy',      label: '🛋️ Lazy Sunday',     group: 'mood' },
  { id: 'date',      label: '🍷 Date night',      group: 'mood' },
  { id: 'comfort',   label: '🫶 Comfort food',    group: 'mood' },
  { id: 'healthy',   label: '🥗 Light & healthy', group: 'mood' },
  { id: 'spicy',     label: '🌶️ Spicy',           group: 'flavor' },
  { id: 'usepantry', label: '🥕 Use what we have', group: 'mode' },
  { id: 'creative',  label: '✨ Surprise us',     group: 'mode' },
];

export const STATS: Stats = {
  totalCooked: 47,
  streak: 12,
  longestStreak: 18,
  byAlex: 22,
  byYuka: 25,
  avgRating: 4.7,
  weekCount: 5,
  weekGoal: 6,
  topRecipes: ['stirfry', 'salmon', 'carbonara'],
  cuisineMix: [
    { name: 'Italian',  pct: 30, color: '#7c3aed' },
    { name: 'Asian',    pct: 28, color: '#f59e0b' },
    { name: 'Comfort',  pct: 22, color: '#ff7eb9' },
    { name: 'Mediter.', pct: 12, color: '#22c55e' },
    { name: 'Other',    pct: 8,  color: '#3b82f6' },
  ],
};
