import { useState } from "react";
import * as api from "../api";
import type { RecipeSuggestions } from "../types";
import RecipeCard from "./RecipeCard";

interface SuggestError {
  status: number | null;
  message: string;
  ownKey?: boolean;
}

export default function SuggestionsView({
  suggestions,
  onSuggestions,
  onOpenSettings,
}: {
  suggestions: RecipeSuggestions | null;
  onSuggestions: (s: RecipeSuggestions) => void;
  onOpenSettings?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SuggestError | null>(null);
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    try {
      onSuggestions(await api.getSuggestions());
      setSavedTitles(new Set());
    } catch (err) {
      setError({
        status: err instanceof api.ApiError ? err.status : null,
        message:
          err instanceof Error ? err.message : "Could not get suggestions",
        ownKey: err instanceof api.ApiError ? err.ownKey : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  async function save(index: number) {
    if (!suggestions) return;
    const recipe = suggestions.recipes[index];
    await api.saveRecipe(recipe);
    setSavedTitles((prev) => new Set(prev).add(recipe.title));
  }

  const noProviderSetUp = error?.status === 503;
  // the app's built-in key failed — the user can't fix that, but their own key would
  const defaultKeyFailed = error?.status === 502 && error.ownKey === false;
  const showKeyCallout = noProviderSetUp || defaultKeyFailed;

  return (
    <div>
      <div className="suggest-bar">
        <button onClick={fetchSuggestions} disabled={loading}>
          {loading ? "Thinking…" : "Suggest recipes"}
        </button>
        {loading && (
          <span className="hint">
            Taking stock of the fridge — this can take a minute or two.
          </span>
        )}
      </div>
      {error && showKeyCallout && (
        <div className="callout">
          <strong>
            {noProviderSetUp
              ? "No AI provider is set up yet."
              : "The app's built-in AI provider isn't working right now."}
          </strong>
          {defaultKeyFailed && <p className="hint">({error.message})</p>}
          <p>
            Google Gemini offers a free API key — it takes about a minute to
            create one at{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
            >
              aistudio.google.com/apikey
            </a>
            , then paste it in Settings and you're cooking.
          </p>
          {onOpenSettings && (
            <button onClick={onOpenSettings}>Go to Settings</button>
          )}
        </div>
      )}
      {error && !showKeyCallout && (
        <div className="error">
          {error.message}{" "}
          <button className="link" onClick={fetchSuggestions}>
            Retry
          </button>
        </div>
      )}
      {suggestions && !loading && (
        <div className="recipe-grid">
          {suggestions.recipes.map((recipe, i) => (
            <RecipeCard
              key={recipe.title}
              recipe={recipe}
              saved={savedTitles.has(recipe.title)}
              onSave={() => save(i)}
            />
          ))}
        </div>
      )}
      {!suggestions && !loading && !error && (
        <p className="empty">
          Hit "Suggest recipes" and we'll come up with ideas based on your kitchen.
        </p>
      )}
    </div>
  );
}
