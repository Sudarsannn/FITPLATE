import type { Dish } from '../models/research';
import type { PantryItem } from '../models/prefs';
import { ingredientKey } from './vendors/basket';

/**
 * Day 14 innovation (flag `fridgeRescue`): "What can I cook with what I have?"
 * Looks at the kitchen inventory and ranks researched dishes by how many of
 * their main ingredients are already there (seasonings and cooking fats like salt and oil
 * are ignored). Pure, so Jest can test it.
 */
export type RescueMatch = { dish: Dish; have: string[]; missing: string[] };

/** Seasonings and cooking fats: always assumed at hand. Rice, dal and flour are NOT ignored, they are often the base of the dish. */
const SEASONING = /\b(spice|masala|oil|fat|condiment|sweetener|sugar|salt|seasoning)s?\b/i;
const SEASONING_NAME = /^(salt|sugar|oil|ghee|turmeric|chilli powder|red chilli powder|cumin|jeera|mustard seeds|garam masala|hing|asafoetida|water)\b/i;

const has = (pantry: Record<string, PantryItem>, key: string) => {
  const p = pantry[key];
  return !!p && p.quantity !== 0;
};

const isSeasoning = (i: { ingredientId: string | null; name: string }, category?: (id: string) => string | null) => {
  const c = i.ingredientId ? category?.(i.ingredientId) : null;
  return SEASONING_NAME.test(i.name.trim()) || /\b(oil|ghee|salt|water)\b/i.test(i.name.split('(')[0]) || (c != null && SEASONING.test(c));
};

export function fridgeRescue(
  dishes: readonly Dish[],
  pantry: Record<string, PantryItem>,
  opts: { category?: (ingredientId: string) => string | null; fits?: (d: Dish) => boolean; limit?: number } = {},
): RescueMatch[] {
  const out: RescueMatch[] = [];
  for (const dish of dishes) {
    if (dish.ai || (opts.fits && !opts.fits(dish))) continue;
    const main = dish.ingredients.filter((i) => !isSeasoning(i, opts.category));
    if (main.length < 2) continue;
    const have: string[] = [];
    const missing: string[] = [];
    for (const i of main) (has(pantry, ingredientKey(i.ingredientId, i.name)) ? have : missing).push(i.name);
    if (have.length < 2) continue;
    out.push({ dish, have, missing });
  }
  return out.sort((a, b) => a.missing.length - b.missing.length || b.have.length - a.have.length || a.dish.name.localeCompare(b.dish.name)).slice(0, opts.limit ?? 8);
}
