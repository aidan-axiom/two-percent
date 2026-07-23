import type {
  Ingredient,
  Provider,
  Recipe,
  RecipeSuggestions,
  SavedRecipe,
  User,
} from "./types";

const BASE = "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  /** For suggestion failures: whether the failing key was the user's own. */
  ownKey?: boolean;
  constructor(status: number, message: string, ownKey?: boolean) {
    super(message);
    this.status = status;
    this.ownKey = ownKey;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = 8000,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal: AbortSignal.timeout(timeoutMs),
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    if (detail && typeof detail === "object") {
      throw new ApiError(
        res.status,
        detail.message ?? res.statusText,
        detail.own_key,
      );
    }
    throw new ApiError(res.status, detail ?? res.statusText);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// Auth
export const register = (email: string, password: string) =>
  request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
export const login = (email: string, password: string) =>
  request<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
export const logout = () => request<void>("/auth/logout", { method: "POST" });
export const getMe = () => request<User>("/auth/me");
export const setApiKey = (provider: Provider, apiKey: string) =>
  request<User>("/auth/me/api-key", {
    method: "PUT",
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
export const removeApiKey = () =>
  request<User>("/auth/me/api-key", { method: "DELETE" });

// Ingredients
export const listIngredients = () => request<Ingredient[]>("/ingredients/");
export const createIngredient = (body: {
  name: string;
  quantity?: number | null;
  unit?: string | null;
}) =>
  request<Ingredient>("/ingredients/", {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateIngredient = (
  id: number,
  body: { name?: string; quantity?: number | null; unit?: string | null },
) =>
  request<Ingredient>(`/ingredients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
export const deleteIngredient = (id: number) =>
  request<void>(`/ingredients/${id}`, { method: "DELETE" });

// Suggestions — Claude call can take minutes; use a long timeout
export const getSuggestions = () =>
  request<RecipeSuggestions>("/suggestions/", { method: "POST" }, 240_000);

// Saved recipes
export const listSavedRecipes = () => request<SavedRecipe[]>("/recipes/");
export const saveRecipe = (recipe: Recipe) =>
  request<SavedRecipe>("/recipes/", {
    method: "POST",
    body: JSON.stringify(recipe),
  });
export const deleteSavedRecipe = (id: number) =>
  request<void>(`/recipes/${id}`, { method: "DELETE" });
