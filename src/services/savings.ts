import type { Dish } from '../models/research';
import type { DayLog, MealLog } from '../lib/store';

/**
 * Day 14: what cooking at home has saved, for today, the last 7 days and this
 * month. Money counts cooked meals that carry both a make price and an order
 * price (each meal's own record, already scaled to its servings): order minus
 * make, so a dearer home meal counts as a negative. Calories compare the meal
 * with the restaurant version only where the research found published
 * restaurant calories. Pure, so Jest can test it.
 */
export type SavingsPeriod = {
  /** Order price minus make price across the counted meals; can be negative. */
  moneyInr: number;
  /** Cooked meals that had both prices. */
  counted: number;
  /** Cooked meals left out because a price is missing. */
  unpriced: number;
  /** Restaurant calories minus what was eaten; null when no cooked meal had restaurant calories. */
  kcalLess: number | null;
};

export type SavingsSummary = { today: SavingsPeriod; week: SavingsPeriod; month: SavingsPeriod };

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function mealSaving(m: MealLog, dish: Pick<Dish, 'asOrdered'> | undefined): { moneyInr: number | null; kcalLess: number | null } {
  const cooked = m.how ? m.how === 'cooked' : m.cooked;
  if (!cooked) return { moneyInr: null, kcalLess: null };
  const moneyInr = m.costInr != null && m.orderInr != null ? Math.round(m.orderInr - m.costInr) : null;
  const restaurant = dish?.asOrdered?.nutrition?.calories.value;
  const kcalLess = restaurant != null && restaurant > 0 ? Math.round(restaurant * (m.servings ?? 1) - m.kcal) : null;
  return { moneyInr, kcalLess };
}

function period(meals: MealLog[], dishOf: (id: string) => Pick<Dish, 'asOrdered'> | undefined): SavingsPeriod {
  let moneyInr = 0;
  let counted = 0;
  let unpriced = 0;
  let kcal: number | null = null;
  for (const m of meals) {
    const cooked = m.how ? m.how === 'cooked' : m.cooked;
    if (!cooked) continue;
    const s = mealSaving(m, m.dishId ? dishOf(m.dishId) : undefined);
    if (s.moneyInr == null) unpriced += 1;
    else {
      moneyInr += s.moneyInr;
      counted += 1;
    }
    if (s.kcalLess != null) kcal = (kcal ?? 0) + s.kcalLess;
  }
  return { moneyInr, counted, unpriced, kcalLess: kcal };
}

export function savingsSummary(days: Record<string, DayLog | undefined>, dishOf: (id: string) => Pick<Dish, 'asOrdered'> | undefined, now: Date = new Date()): SavingsSummary {
  const todayKey = key(now);
  const weekStart = key(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  const monthStart = `${todayKey.slice(0, 8)}01`;
  const within = (from: string) =>
    Object.keys(days)
      .filter((k) => k >= from && k <= todayKey)
      .flatMap((k) => days[k]?.meals ?? []);
  return { today: period(within(todayKey), dishOf), week: period(within(weekStart), dishOf), month: period(within(monthStart), dishOf) };
}
