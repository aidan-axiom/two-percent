import type { Recipe } from "./types";

export interface DemoIngredient {
  name: string;
  amount: string;
}

export const DEMO_INGREDIENTS: DemoIngredient[] = [
  { name: "chicken thighs", amount: "4" },
  { name: "rice", amount: "2 cups" },
  { name: "eggs", amount: "6" },
  { name: "soy sauce", amount: "" },
  { name: "garlic", amount: "5 cloves" },
  { name: "frozen peas", amount: "1 bag" },
  { name: "cheddar", amount: "8 oz" },
  { name: "tortillas", amount: "6" },
  { name: "onion", amount: "2" },
];

export const DEMO_RECIPES: Recipe[] = [
  {
    title: "Garlic Chicken Fried Rice",
    description:
      "A one-pan classic that turns leftover rice into dinner. Crispy chicken, plenty of garlic, and peas for color.",
    ingredients_used: ["chicken thighs", "rice", "eggs", "soy sauce", "garlic", "frozen peas", "onion"],
    missing_ingredients: ["scallions (optional)"],
    steps: [
      "Cook the rice ahead of time and let it cool (day-old rice works best).",
      "Cube the chicken thighs, season with salt and pepper, and sear in a hot pan until golden. Set aside.",
      "Scramble the eggs in the same pan and set aside with the chicken.",
      "Sauté diced onion and minced garlic, then add the rice and press it flat to crisp.",
      "Stir in soy sauce, peas, chicken, and eggs. Toss over high heat for 2 minutes.",
    ],
    prep_time_minutes: 15,
    cook_time_minutes: 20,
  },
  {
    title: "Crispy Chicken Quesadillas",
    description:
      "Golden tortillas stuffed with seasoned chicken, melted cheddar, and caramelized onion.",
    ingredients_used: ["chicken thighs", "tortillas", "cheddar", "onion", "garlic"],
    missing_ingredients: ["salsa or hot sauce"],
    steps: [
      "Shred or dice the chicken and cook with garlic, salt, and pepper.",
      "Slowly caramelize sliced onion in a little oil.",
      "Layer cheddar, chicken, and onion on half of each tortilla and fold.",
      "Toast in a dry pan 2–3 minutes per side until crisp and melty.",
      "Cut into wedges and serve with salsa.",
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
  },
  {
    title: "Egg Drop Soup with Peas",
    description:
      "A light, fast soup from pantry basics — silky egg ribbons in a garlicky broth.",
    ingredients_used: ["eggs", "garlic", "frozen peas", "soy sauce"],
    missing_ingredients: ["chicken stock", "cornstarch"],
    steps: [
      "Bring stock to a simmer with minced garlic and a splash of soy sauce.",
      "Thicken slightly with a cornstarch slurry.",
      "Slowly pour in beaten eggs while stirring to form ribbons.",
      "Add peas, simmer 1 minute, and season to taste.",
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 10,
  },
];
