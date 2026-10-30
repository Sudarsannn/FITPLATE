/**
 * My Meals: groups the whole meal history by date and by time of day, and
 * works out the money colour for each meal. Pure, so Jest can test it.
 *   green  = cooked at home: what you saved against ordering
 *   red    = ordered: what you paid over cooking it
 *   orange = logged only: what cooking could have saved
 * Prices come from the meal's own record when it has them, else from the
 * dish's researched make and order prices for one serving.
 */
import type { Dish } from '../models/research';
import type { DayLog, MealLog } from '../lib/store';

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type MealHowKind = 'cooked' | 'ordered' | 'logged';

export const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner'];
export const SLOT_LABEL: Record<MealSlot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snacks', dinner: 'Dinner' };

/** Time of day: 4:00–10:59 breakfast, 11:00–15:59 lunch, 16:00–18:59 snacks, otherwise dinner. */
export function slotOf(at: number): MealSlot {
  const h = new Date(at).getHours();
  if (h >= 4 && h < 11) return 'breakfast';
  if (h >= 11 && h < 16) return 'lunch';
  if (h >= 16 && h < 19) return 'snack';
  return 'dinner';
}

export const howOf = (m: Pick<MealLog, 'how' | 'cooked'>): MealHowKind => m.how ?? (m.cooked ? 'cooked' : 'logged');

export const HOW_LABEL: Record<MealHowKind, string> = { cooked: 'Cooked at home', ordered: 'Ordered', logged: 'Logged' };

export type Money = { kind: MealHowKind; rupees: number; label: string } | null;

/** The saving (or extra spend) for one meal, or null when the prices aren't known. */
export function mealMoney(m: MealLog, dish: Pick<Dish, 'orderPrice'> | undefined, makePerServing: number | null, orderPerServing: number | null): Money {
  const how = howOf(m);
  const per = m.servings && m.servings > 0 ? m.servings : 1;
  const make = m.costInr ?? (makePerServing != null ? makePerServing * per : null);
  const order = m.orderInr ?? (orderPerServing != null ? orderPerServing * per : null);
  if (make == null || order == null) return null;
  const diff = Math.round(order - make);
  if (how === 'cooked') return { kind: how, rupees: diff, label: diff >= 0 ? `Saved ₹${diff}` : `₹${-diff} more than ordering` };
  if (how === 'ordered') return { kind: how, rupees: diff, label: diff > 0 ? `₹${diff} over cooking` : 'About the same as cooking' };
  return { kind: how, rupees: diff, label: diff > 0 ? `Could save ₹${diff}` : 'Cooking costs about the same' };
}

export const MONEY_COLOR: Record<MealHowKind, 'accent' | 'bad' | 'warn'> = { cooked: 'accent', ordered: 'bad', logged: 'warn' };

export type MealRow = MealLog & { dateKey: string; slot: MealSlot };
export type DayGroup = { dateKey: string; slots: { slot: MealSlot; meals: MealRow[] }[]; kcal: number; count: number };

/** Every meal in `days`, newest day first; inside a day by time of day, then by time. */
export function groupMeals(days: Record<string, DayLog>): DayGroup[] {
  return Object.keys(days)
    .filter((k) => days[k].meals.length > 0)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((dateKey) => dayGroup(dateKey, days[dateKey]));
}

export function dayGroup(dateKey: string, day: DayLog | undefined): DayGroup {
  const rows: MealRow[] = (day?.meals ?? []).map((m) => ({ ...m, dateKey, slot: slotOf(m.at) }));
  const slots = SLOT_ORDER.map((slot) => ({ slot, meals: rows.filter((r) => r.slot === slot).sort((a, b) => a.at - b.at) })).filter((s) => s.meals.length);
  return { dateKey, slots, kcal: rows.reduce((t, r) => t + r.kcal, 0), count: rows.length };
}

/** Find a meal by its id across all days. */
export function findMeal(days: Record<string, DayLog>, id: string): MealRow | null {
  for (const dateKey of Object.keys(days)) {
    const m = days[dateKey].meals.find((x) => x.id === id);
    if (m) return { ...m, dateKey, slot: slotOf(m.at) };
  }
  return null;
}

/** "Today", "Yesterday", else "Mon 21 Oct". */
export function dayLabel(dateKey: string, today: string, yesterday: string): string {
  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  const [y, mo, d] = dateKey.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export const timeLabel = (at: number) => new Date(at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

/** Numbers of a logged meal that change with the portion size. */
export type PortionFields = { kcal: number; proteinG: number; fibreG: number; costInr?: number | null; orderInr?: number | null; servings?: number };

/**
 * The patch that turns a logged meal into `servings` portions (Day 13). Everything is scaled from
 * the meal's own numbers, so editing 1 to 2 doubles it and back to 1 restores it. Prices stay null when unknown.
 */
export function portionPatch(m: PortionFields, servings: number): PortionFields & { servings: number } {
  const next = Math.min(20, Math.max(0.5, Math.round(servings * 2) / 2));
  const f = next / (m.servings ?? 1);
  const scale = (v: number | null | undefined) => (v == null ? v : Math.round(v * f));
  return { kcal: Math.round(m.kcal * f), proteinG: Math.round(m.proteinG * f), fibreG: Math.round(m.fibreG * f), costInr: scale(m.costInr), orderInr: scale(m.orderInr), servings: next };
}
