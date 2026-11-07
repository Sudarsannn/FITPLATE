import type { Nutrient } from '../models/nutrient';
import type { Dish } from '../models/research';
import { band, dayMicros, type Band, type MealInput, type MicroOptions } from './dayNutrition';

/**
 * Day 19: nutrition insights. Everything comes from the researched data: the dishes' partial micronutrient
 * estimates, the nutrient topics' food sources and absorption notes. A day only counts when it has at
 * least one FitPlate dish logged (other meals carry no vitamin estimate), so a quiet week is "not enough
 * to tell", never a list of false gaps.
 */
export type DayMeals = { meals: (MealInput & { dishId?: string | null })[] };

export type Coverage = {
  id: string;
  name: string;
  unit: string;
  /** Average per counted day, in the nutrient's main unit. */
  avg: number;
  target: number;
  fraction: number;
  band: Band;
  /** The research's deficiency risk for Indian diets; gaps in higher-risk nutrients come first. */
  risk: Nutrient['deficiencyRiskIndia'];
};

const RISK_WEIGHT = { high: 0, moderate: 1, low: 2 } as const;
const riskWeight = (r: Nutrient['deficiencyRiskIndia']) => (r ? RISK_WEIGHT[r] : 2);

export type WeekCoverage = { daysCounted: number; rows: Coverage[]; gaps: Coverage[] };

/** Limit-type nutrients (salt) are not "gaps": more is not better. */
const NOT_A_GOAL = new Set(['sodium', 'chloride']);

export function weeklyCoverage(
  days: Record<string, DayMeals | undefined>,
  keys: string[],
  dish: (id: string) => Dish | undefined,
  nutrients: readonly Nutrient[],
  group: 'adult_male' | 'adult_female',
  opts: MicroOptions & { supplementsByDay?: Record<string, Record<string, number>> } = {},
): WeekCoverage {
  const sums = new Map<string, { name: string; unit: string; amount: number; fraction: number; target: number }>();
  let daysCounted = 0;
  for (const key of keys) {
    const meals = days[key]?.meals ?? [];
    if (!meals.some((m) => m.dishId && dish(m.dishId))) continue;
    daysCounted++;
    const bars = dayMicros(meals, dish, nutrients, group, { targets: opts.targets, supplements: opts.supplementsByDay?.[key] });
    for (const b of bars) {
      if (b.kind === 'other' || b.isLimit || NOT_A_GOAL.has(b.id) || b.target == null || b.fraction == null) continue;
      const cur = sums.get(b.id) ?? { name: b.label, unit: b.unit, amount: 0, fraction: 0, target: b.target };
      cur.amount += b.amount;
      cur.fraction += b.fraction;
      sums.set(b.id, cur);
    }
  }
  if (daysCounted === 0) return { daysCounted, rows: [], gaps: [] };
  const byId = new Map(nutrients.map((n) => [n.id, n]));
  const rows = [...sums.entries()]
    .map(([id, v]) => {
      const fraction = v.fraction / daysCounted;
      return { id, name: v.name, unit: v.unit, avg: v.amount / daysCounted, target: v.target, fraction, band: band(fraction), risk: byId.get(id)?.deficiencyRiskIndia ?? null } satisfies Coverage;
    })
    .sort((a, b) => a.fraction - b.fraction || a.name.localeCompare(b.name));
  return { daysCounted, rows, gaps: rows
      .filter((r) => r.band !== 'on-track')
      .sort((a, b) => riskWeight(a.risk) - riskWeight(b.risk) || a.fraction - b.fraction || a.name.localeCompare(b.name))
      .slice(0, 3),
  };
}

export type DishIdea = { dish: Dish; perServing: number; shareOfTarget: number };
export type FoodIdea = { food: string; serving: string; perServing: number; shareOfTarget: number };
export type Suggestions = { dishes: DishIdea[]; foods: FoodIdea[]; boosters: string[]; blockers: string[]; riskIndia: Nutrient['deficiencyRiskIndia'] };

/**
 * Tasty-first ideas for one gap: FitPlate dishes that carry it (best per serving first, only those giving at
 * least 15% of the target), then Indian foods from the topic's researched source list, then the topic's
 * absorption notes. `fits` keeps dishes to the user's diet and allergies; `vegOnly` keeps foods vegetarian.
 */
export function suggestionsFor(n: Nutrient, target: number, dishes: readonly Dish[], opts: { fits?: (d: Dish) => boolean; vegOnly?: boolean; max?: number } = {}): Suggestions {
  const max = opts.max ?? 3;
  const dishIdeas = dishes
    .filter((d) => (opts.fits ? opts.fits(d) : true))
    .map((d) => ({ dish: d, perServing: d.microNutrientsEstimate?.values?.[n.id] ?? 0 }))
    .filter((x) => x.perServing > 0 && x.perServing / target >= 0.15)
    .map((x) => ({ ...x, shareOfTarget: x.perServing / target }))
    .sort((a, b) => b.shareOfTarget - a.shareOfTarget || a.dish.number - b.dish.number)
    .slice(0, max);
  const foods = n.topFoodSources
    .filter((f) => f.perServing != null && f.perServing > 0 && (!opts.vegOnly || f.veg !== false))
    .map((f) => ({ food: f.food.replace(/\s*\([^)]*\)\s*$/, ''), serving: f.servingLabel.replace(/\s*\(est\.\)/, ''), perServing: f.perServing as number, shareOfTarget: (f.perServing as number) / target }))
    .sort((a, b) => b.shareOfTarget - a.shareOfTarget)
    .slice(0, max);
  return { dishes: dishIdeas, foods, boosters: n.absorptionBoosters.slice(0, 2), blockers: n.absorptionBlockers.slice(0, 2), riskIndia: n.deficiencyRiskIndia };
}

export const INSIGHTS_NOTE = 'Not medical advice. These are partial estimates from the dishes you log, not a blood test. If you worry about a deficiency, ask a doctor.';
