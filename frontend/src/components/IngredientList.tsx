import { useState } from "react";
import * as api from "../api";
import type { Ingredient } from "../types";

function formatAmount(ingredient: Ingredient): string {
  if (ingredient.quantity == null) return "";
  return `${ingredient.quantity} ${ingredient.unit ?? ""}`.trim();
}

export default function IngredientList({
  ingredients,
  onChanged,
  onDeleted,
}: {
  ingredients: Ingredient[];
  onChanged: (ingredient: Ingredient) => void;
  onDeleted: (id: number) => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (ingredients.length === 0) {
    return (
      <p className="empty">
        Your kitchen is empty — add some ingredients to get started.
      </p>
    );
  }

  function startEdit(ingredient: Ingredient) {
    setEditingId(ingredient.id);
    setEditQuantity(ingredient.quantity?.toString() ?? "");
    setEditUnit(ingredient.unit ?? "");
    setError(null);
  }

  async function saveEdit(id: number) {
    try {
      const updated = await api.updateIngredient(id, {
        quantity: editQuantity ? Number(editQuantity) : null,
        unit: editUnit.trim() || null,
      });
      onChanged(updated);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function remove(id: number) {
    try {
      await api.deleteIngredient(id);
      onDeleted(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <ul className="ingredient-list">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            <span className="ingredient-name">{ingredient.name}</span>
            {editingId === ingredient.id ? (
              <span className="edit-controls">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  placeholder="Qty"
                />
                <input
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  placeholder="Unit"
                />
                <button onClick={() => saveEdit(ingredient.id)}>Save</button>
                <button className="link" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </span>
            ) : (
              <span className="row-controls">
                <span className="amount">{formatAmount(ingredient)}</span>
                <button className="link" onClick={() => startEdit(ingredient)}>
                  Edit
                </button>
                <button className="link danger" onClick={() => remove(ingredient.id)}>
                  Remove
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
