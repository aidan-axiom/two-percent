import { useState, type FormEvent } from "react";
import * as api from "../api";
import type { Ingredient } from "../types";

const COMMON_UNITS = [
  "count", "g", "kg", "oz", "lb", "ml", "l", "cups", "tbsp", "tsp",
  "cloves", "cans", "slices", "bunch", "bottle",
];

export default function IngredientForm({
  onAdded,
}: {
  onAdded: (ingredient: Ingredient) => void;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const created = await api.createIngredient({
        name: name.trim(),
        quantity: quantity ? Number(quantity) : null,
        unit: unit.trim() || null,
      });
      onAdded(created);
      setName("");
      setQuantity("");
      setUnit("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add ingredient");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ingredient-form" onSubmit={handleSubmit}>
      <input
        placeholder="Ingredient (e.g. eggs)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Qty"
        min="0"
        step="any"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input
        list="units"
        placeholder="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />
      <datalist id="units">
        {COMMON_UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <button type="submit" disabled={busy || !name.trim()}>
        Add
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
