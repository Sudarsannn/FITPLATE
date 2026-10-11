/**
 * Research content bundled with the app (generated per-item JSON; see
 * scripts/research/run.js). The app reads it only when the researchData
 * flag is on (Day 6); until then the demo dishes in src/data/dishes.ts stay.
 */
import type { Dish, Ingredient } from '../../models/research';
import { items as dishItems } from './dishes';
import { items as ingredientItems } from './ingredients';

export const researchDishes: readonly Dish[] = dishItems;
export const researchIngredients: readonly Ingredient[] = ingredientItems;

const dishById = new Map(dishItems.map((d) => [d.id, d]));
const ingredientById = new Map(ingredientItems.map((i) => [i.id, i]));

export function getDish(id: string): Dish | undefined {
  return dishById.get(id);
}

export function getIngredient(id: string): Ingredient | undefined {
  return ingredientById.get(id);
}
