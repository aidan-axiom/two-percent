import { useEffect, useState } from "react";
import * as api from "../api";
import type { Ingredient } from "../types";
import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";

export default function Kitchen() {
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listIngredients()
      .then(setIngredients)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load"),
      );
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (ingredients === null) return <p className="empty">Loading…</p>;

  const sorted = (items: Ingredient[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <IngredientForm
        onAdded={(ingredient) =>
          setIngredients((prev) => sorted([...(prev ?? []), ingredient]))
        }
      />
      <IngredientList
        ingredients={ingredients}
        onChanged={(updated) =>
          setIngredients((prev) =>
            sorted(
              (prev ?? []).map((i) => (i.id === updated.id ? updated : i)),
            ),
          )
        }
        onDeleted={(id) =>
          setIngredients((prev) => (prev ?? []).filter((i) => i.id !== id))
        }
      />
    </div>
  );
}
