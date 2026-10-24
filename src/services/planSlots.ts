/**
 * Which researched dishes suit which meal, from what the research says people
 * eat them for (Dish.mealType, most typical first). Used by auto-plan and the picker.
 */
import type { Dish } from '../models/research';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

/** The plan entry that stands for "lunch is at the office canteen". Not a dish id. */
export const CAFETERIA_PLATE = 'cafeteria-plate';

/** 0 = the dish's most typical meal, higher = less typical, null = not eaten at this meal. Dishes with no meal type fit nothing, except that main dishes may be lunch or dinner. */
export function slotRank(d: Pick<Dish, 'mealType'>, slot: MealSlot): number | null {
  const types = d.mealType.map((m) => m.toLowerCase());
  const at = types.findIndex((m) => m.includes(slot));
  if (at >= 0) return at;
  if (types.length === 0 && slot !== 'breakfast') return 5; // untagged: only as a late fallback for lunch and dinner
  return null;
}

/** Dishes for a slot: typical ones first, then (if there are none) anything that is not clearly another meal. Order within a rank is kept. */
export function dishesForSlot<T extends Pick<Dish, 'mealType'>>(ranked: T[], slot: MealSlot): T[] {
  const fit = ranked.map((d) => ({ d, r: slotRank(d, slot) })).filter((x): x is { d: T; r: number } => x.r != null);
  const sorted = fit.map((x, i) => ({ ...x, i })).sort((a, b) => a.r - b.r || a.i - b.i).map((x) => x.d);
  if (sorted.length) return sorted;
  return ranked.filter((d) => slot === 'breakfast' ? false : !d.mealType.some((m) => /breakfast|snack/i.test(m)));
}

/** The picker order: dishes for this slot first (most typical first), the rest after. */
export function pickerOrder<T extends Pick<Dish, 'mealType'>>(dishes: T[], slot: MealSlot): T[] {
  const idx = new Map(dishes.map((d, i) => [d, i]));
  const key = (d: T) => slotRank(d, slot) ?? 99;
  return [...dishes].sort((a, b) => key(a) - key(b) || (idx.get(a) ?? 0) - (idx.get(b) ?? 0));
}

/** Weekday lunch is eaten at the office when the user says so; weekends are always planned. */
export const isOfficeDay = (date: Date) => date.getDay() !== 0 && date.getDay() !== 6;

/**
 * The dishes to batch-cook for the next `days` days: whatever the plan has on those days that the
 * shopping list covers, each once with the number of times it appears as its servings.
 * Falls back to the first dishes of the list when the plan has none of them. Cafeteria plates are not dishes.
 */
export function mealPrepDishes(plan: Record<string, Partial<Record<string, string>>>, dayKeys: string[], listDishIds: string[], days: number, maxDishes = 6): { id: string; servings: number }[] {
  const inList = new Set(listDishIds);
  const counts = new Map<string, number>();
  for (const k of dayKeys.slice(0, Math.max(1, days))) {
    for (const slot of ['breakfast', 'lunch', 'dinner']) {
      const id = plan[k]?.[slot];
      if (id && id !== CAFETERIA_PLATE && inList.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  const picked = [...counts.entries()].map(([id, servings]) => ({ id, servings })).slice(0, maxDishes);
  if (picked.length) return picked;
  return [...new Set(listDishIds)].slice(0, Math.min(maxDishes, Math.max(1, days) * 2)).map((id) => ({ id, servings: 1 }));
}

/** The first dish of the earliest planned day (breakfast, then lunch, then dinner) that the list covers; null if none. */
export function firstDishOfDay(plan: Record<string, Partial<Record<string, string>>>, dayKeys: string[], listDishIds: string[]): string | null {
  const inList = new Set(listDishIds);
  for (const k of dayKeys) {
    for (const slot of ['breakfast', 'lunch', 'dinner']) {
      const id = plan[k]?.[slot];
      if (id && id !== CAFETERIA_PLATE && inList.has(id)) return id;
    }
  }
  return null;
}
