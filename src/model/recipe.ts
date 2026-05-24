export interface RecipeSpriteDto {
  id:     string;
  sprite: string;
}

export interface NutritionDto {
  kcal:    number;
  protein: number;
  carbs:   number;
  fat:     number;
  fiber?:  number;
}

export interface RecipeStepDto {
  id:    string;
  order: number;
  title: string;
  desc:  string;
  mins:  number;
}

export interface RecipeIngredientDto {
  id:   string;
  qty:  number;
  unit: string;
  ingredient: {
    id:     string;
    name:   string;
    qty:    number;
    unit:   string;
    cat:    string;
    sprite: string;
    expiry: number;
  };
}

export interface RecipeUserDto {
  id:       string;
  personId: 'alex' | 'yuka';
  name:     string;
  color:    string;
}

export interface RecipeDto {
  id:          string;
  name:        string;
  tag:         string;
  time:        number;
  difficulty:  string;
  cookedCount: number;
  rating:      number;
  bg:          string;
  accent:      string;
  servings?:   number;
  why?:        string;
  isAI:        boolean;
  by:          RecipeUserDto;
  sprites:     RecipeSpriteDto[];
  nutrition?:  NutritionDto;
  steps:       RecipeStepDto[];
  ingredients: RecipeIngredientDto[];
}

export interface HistoryEntryDto {
  id:       string;
  cookedAt: string;
  rating:   number;
  note?:    string;
  recipeId: string;
  recipe: {
    id:      string;
    name:    string;
    sprites: RecipeSpriteDto[];
    bg:      string;
    accent:  string;
  };
  by: RecipeUserDto;
}

export interface HistoryResponse {
  entries: HistoryEntryDto[];
  total:   number;
}
