export type Provider = "gemini" | "claude";

export interface User {
  id: number;
  email: string;
  own_key_provider: Provider | null;
  default_provider: Provider | null;
}

export interface Ingredient {
  id: number;
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients_used: string[];
  missing_ingredients: string[];
  steps: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
}

export interface RecipeSuggestions {
  recipes: Recipe[];
}

export interface SavedRecipe {
  id: number;
  title: string;
  payload: Recipe;
  created_at: string;
}
