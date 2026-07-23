import { useEffect, useRef, useState } from "react";
import { DEMO_INGREDIENTS, DEMO_RECIPES } from "../demoData";
import RecipeCard from "./RecipeCard";

type Stage = "kitchen" | "loading" | "results";

export default function Demo({ onGetStarted }: { onGetStarted?: () => void }) {
  const [stage, setStage] = useState<Stage>("kitchen");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function runDemo() {
    setStage("loading");
    timer.current = window.setTimeout(() => setStage("results"), 1800);
  }

  return (
    <div className="demo">
      <div className="demo-intro">
        <h2>How it works</h2>
        <p>
          Tell 2% what's in your kitchen, and it comes up with real recipes
          that make the most of what you already have. Here's a sample kitchen:
        </p>
      </div>

      <div className="demo-step">
        <span className="step-number">1</span>
        <div>
          <h3>Your kitchen</h3>
          <div className="chips">
            {DEMO_INGREDIENTS.map((ingredient) => (
              <span key={ingredient.name} className="chip used">
                {ingredient.amount
                  ? `${ingredient.amount} ${ingredient.name}`
                  : ingredient.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="demo-step">
        <span className="step-number">2</span>
        <div>
          <h3>Ask for ideas</h3>
          {stage === "kitchen" && (
            <button onClick={runDemo}>Suggest recipes</button>
          )}
          {stage === "loading" && (
            <p className="hint">Thinking about what you could cook…</p>
          )}
          {stage === "results" && (
            <p className="hint">
              Done! The AI looked at the sample kitchen and came back with
              these:
            </p>
          )}
        </div>
      </div>

      {stage === "results" && (
        <div className="demo-step">
          <span className="step-number">3</span>
          <div className="demo-results">
            <h3>Cook something great</h3>
            <div className="recipe-grid">
              {DEMO_RECIPES.map((recipe) => (
                <RecipeCard key={recipe.title} recipe={recipe} />
              ))}
            </div>
            <p className="hint">
              Green chips are things already in the kitchen; amber chips are
              the few extras a recipe needs. (These are sample results — your
              suggestions are generated live from your own ingredients.)
            </p>
            {onGetStarted && (
              <button onClick={onGetStarted}>
                Get started with your own kitchen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
