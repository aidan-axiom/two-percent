import { useEffect, useState } from "react";
import * as api from "../api";
import type { SavedRecipe } from "../types";
import RecipeCard from "./RecipeCard";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState<SavedRecipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listSavedRecipes()
      .then(setRecipes)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load"),
      );
  }, []);

  async function remove(id: number) {
    await api.deleteSavedRecipe(id);
    setRecipes((prev) => prev?.filter((r) => r.id !== id) ?? null);
  }

  if (error) return <div className="error">{error}</div>;
  if (recipes === null) return <p className="empty">Loading…</p>;
  if (recipes.length === 0)
    return (
      <p className="empty">
        No saved recipes yet — save ones you like from the Suggestions tab.
      </p>
    );

  return (
    <div className="recipe-grid">
      {recipes.map((saved) => (
        <RecipeCard
          key={saved.id}
          recipe={saved.payload}
          onDelete={() => remove(saved.id)}
        />
      ))}
    </div>
  );
}
