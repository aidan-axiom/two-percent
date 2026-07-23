import { useState } from "react";
import type { Recipe } from "../types";

export default function RecipeCard({
  recipe,
  onSave,
  saved,
  onDelete,
}: {
  recipe: Recipe;
  onSave?: () => Promise<void>;
  saved?: boolean;
  onDelete?: () => Promise<void>;
}) {
  const [showSteps, setShowSteps] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <h3>{recipe.title}</h3>
        <span className="time-badges">
          <span className="badge">prep {recipe.prep_time_minutes}m</span>
          <span className="badge">cook {recipe.cook_time_minutes}m</span>
        </span>
      </div>
      <p>{recipe.description}</p>
      <div className="chips">
        {recipe.ingredients_used.map((item) => (
          <span key={item} className="chip used">{item}</span>
        ))}
        {recipe.missing_ingredients.map((item) => (
          <span key={item} className="chip missing">+ {item}</span>
        ))}
      </div>
      <button className="link" onClick={() => setShowSteps(!showSteps)}>
        {showSteps ? "Hide steps" : `Show steps (${recipe.steps.length})`}
      </button>
      {showSteps && (
        <ol className="steps">
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
      <div className="card-actions">
        {onSave && (
          <button disabled={busy || saved} onClick={() => run(onSave)}>
            {saved ? "✓ Saved" : "Save recipe"}
          </button>
        )}
        {onDelete && (
          <button className="link danger" disabled={busy} onClick={() => run(onDelete)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
