/**
 * What a day's meals add up to, nutrient by nutrient, for the colour-coded
 * bars on Today. Macros come from each logged research dish's recipe
 * nutrition (or the meal's own logged numbers); vitamins and minerals come
 * from the dish's partial micronutrient estimate. Targets come only from
 * research: the nutrient topics' ICMR-NIN "app default target" for adults,
 * plus the goal's calories and protein. A nutrient with no researched target
 * shows the amount without a bar.
 */
import type { Nutrient } from '../models/nutrient';
import type { Dish } from '../models/research';
import { nutrientLabel } from './dishDetail';
import { PROFILE_TO_NUTRIENT } from './data/crossLinks';

export type MealInput = { dishId?: string | null; kcal: number; protein: number; fibre: number };

export type Macros = { kcal: number; protein: number; carbs: number | null; fat: number | null; fibre: number };

/** Red under 50%, amber 50–89%, green 90% and up. */
export type Band = 'low' | 'getting-there' | 'on-track';

export function band(fraction: number): Band {
  if (fraction >= 0.9) return 'on-track';
  if (fraction >= 0.5) return 'getting-there';
  return 'low';
}

export type MicroBar = {
  id: string;
  label: string;
  unit: string;
  amount: number;
  target: number | null;
  /** 0–1+, null when there's no researched target. */
  fraction: number | null;
  band: Band | null;
  kind: 'vitamin' | 'mineral' | 'other';
};

const UNIT_BY_ID: Record<string, string> = Object.fromEntries(Object.values(PROFILE_TO_NUTRIENT).map((v) => [v!.id, v!.unit]));
const MINERALS = new Set(['iron', 'calcium', 'magnesium', 'potassium', 'zinc', 'sodium', 'phosphorus', 'selenium', 'copper', 'manganese', 'iodine']);
const VITAMINS = new Set(['vitamin-a', 'vitamin-c', 'vitamin-d', 'vitamin-e', 'vitamin-k', 'thiamine', 'riboflavin', 'niacin', 'pantothenic-acid', 'vitamin-b6', 'biotin', 'folate', 'vitamin-b12']);

/** Macros for the day. Carbs and fat only count meals that are research dishes; null when none are. */
export function dayMacros(meals: MealInput[], dish: (id: string) => Dish | undefined): Macros {
  let carbs: number | null = null;
  let fat: number | null = null;
  for (const m of meals) {
    const d = m.dishId ? dish(m.dishId) : undefined;
    if (!d) continue;
    if (d.nutritionPerServing.carbsG != null) carbs = (carbs ?? 0) + d.nutritionPerServing.carbsG;
    if (d.nutritionPerServing.fatG != null) fat = (fat ?? 0) + d.nutritionPerServing.fatG;
  }
  return {
    kcal: meals.reduce((s, m) => s + m.kcal, 0),
    protein: meals.reduce((s, m) => s + m.protein, 0),
    carbs: carbs == null ? null : Math.round(carbs),
    fat: fat == null ? null : Math.round(fat),
    fibre: meals.reduce((s, m) => s + m.fibre, 0),
  };
}

export type TargetGroup = 'adult_male' | 'adult_female';

/** Sums the micronutrient estimates of the day's research dishes and sets each against its researched target. */
export function dayMicros(meals: MealInput[], dish: (id: string) => Dish | undefined, nutrients: readonly Nutrient[], group: TargetGroup): MicroBar[] {
  const totals: Record<string, number> = {};
  for (const m of meals) {
    const d = m.dishId ? dish(m.dishId) : undefined;
    for (const [id, v] of Object.entries(d?.microNutrientsEstimate?.values ?? {})) {
      if (v != null) totals[id] = (totals[id] ?? 0) + v;
    }
  }
  const byId = new Map(nutrients.map((n) => [n.id, n]));
  const ids = new Set([...Object.keys(totals), ...nutrients.map((n) => n.id)]);
  const bars: MicroBar[] = [];
  for (const id of ids) {
    if (id === 'cholesterol') continue;
    const n = byId.get(id);
    const target = n?.appDefaultTarget?.[group] ?? null;
    const amount = totals[id] ?? 0;
    const fraction = target ? amount / target : null;
    bars.push({
      id,
      label: shortName(n?.name ?? nutrientLabel(id)),
      unit: n?.unit ?? UNIT_BY_ID[id] ?? '',
      amount,
      target,
      fraction,
      band: fraction == null ? null : band(fraction),
      kind: n?.type ?? (VITAMINS.has(id) ? 'vitamin' : MINERALS.has(id) ? 'mineral' : 'other'),
    });
  }
  return bars.sort((a, b) => kindOrder(a.kind) - kindOrder(b.kind) || (a.target == null ? 1 : 0) - (b.target == null ? 1 : 0) || a.label.localeCompare(b.label));
}

const kindOrder = (k: MicroBar['kind']) => (k === 'vitamin' ? 0 : k === 'mineral' ? 1 : 2);

/** "Vitamin B12 (cobalamin; …)" → "Vitamin B12"; "Biotin (Vitamin B7)" stays readable as "Biotin (B7)". */
export function shortName(name: string): string {
  const m = name.match(/^([^(]+?)\s*\((Vitamin\s+)?(B\d+)\)$/i);
  if (m) return `${m[1].trim()} (${m[3]})`;
  return name.replace(/\s*\(.*$/, '').trim();
}

/** "12.3 mg" style amount for a bar. */
export function amountLabel(v: number, unit: string): string {
  const r = v >= 100 ? Math.round(v) : v >= 10 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100;
  return `${r}${unit ? ` ${unit}` : ''}`;
}
