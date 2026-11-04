import type { Nutrient, TargetGroup } from '../models/nutrient';
import type { ActivityLevel, Goal, UserProfile } from '../models/user';

/**
 * Day 16: the targets engine. Everything here is a pure function of the profile and the bundled research.
 *
 * CALORIES. Resting energy uses the Mifflin-St Jeor equation (Mifflin MD et al., Am J Clin Nutr 1990;51:241-247):
 *   men   = 10 x kg + 6.25 x cm - 5 x age + 5
 *   women = 10 x kg + 6.25 x cm - 5 x age - 161
 * multiplied by a common activity factor (1.2 sedentary, 1.375 light, 1.55 moderate, 1.725 active, 1.9 very active).
 * The goal then moves it: lose -500, gain +400, muscle +250 kcal, with a floor of 1500 (men) / 1200 (women) so a
 * "lose" target never drops below a plain-eating minimum. These are FitPlate defaults, labelled as estimates in the app.
 * The research streams carry no energy-requirement table yet; when they do, switch the source here.
 * Under 18, "other" sex, pregnancy and breastfeeding: no formula is applied. The preset goal numbers are kept
 * and the screen says to ask a doctor or dietitian (the app never guesses extra calories for pregnancy).
 *
 * PROTEIN. grams per kg of body weight by goal: 0.83 (lose, maintain; the ICMR-NIN adult RDA, secondary and unverified),
 * 1.0 (gain) and 1.6 (muscle), capped by the same floor of the preset when weight is missing.
 *
 * MICRONUTRIENTS come only from the researched `targets` rows (ICMR-NIN) of each nutrient topic, picked by
 * sex, activity, age 60+ and the private pregnancy / breastfeeding flags. A nutrient with no row has no target.
 *
 * WATER. The hydration research (formula from weight, sex, activity) has not arrived yet, so the engine returns the
 * app default (8 glasses) with `researched: false`. Day 17 plugs the researched formula in here.
 */
export type GoalPreset = { kcal: number; protein: number };
export const GOAL_PRESETS: Record<Goal, GoalPreset> = {
  lose: { kcal: 1800, protein: 90 },
  maintain: { kcal: 2200, protein: 70 },
  gain: { kcal: 2600, protein: 90 },
  muscle: { kcal: 2400, protein: 120 },
};

export const ACTIVITY_FACTOR: Record<ActivityLevel, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, 'very-active': 1.9 };
export const GOAL_KCAL_SHIFT: Record<Goal, number> = { lose: -500, maintain: 0, gain: 400, muscle: 250 };
export const PROTEIN_PER_KG: Record<Goal, number> = { lose: 0.83, maintain: 0.83, gain: 1.0, muscle: 1.6 };
const KCAL_FLOOR = { male: 1500, female: 1200 } as const;

export type TargetProfile = Pick<UserProfile, 'age' | 'sex' | 'heightCm' | 'weightKg' | 'activityLevel' | 'goal'> & { privateFlags?: Record<string, boolean> };

export type EnergyTarget = {
  kcal: number;
  protein: number;
  /** 'formula' when computed from the body fields; 'preset' when something was missing or a doctor's advice is needed. */
  source: 'formula' | 'preset';
  /** Why the preset was used, or a caution to show. */
  note: string | null;
  bmr: number | null;
};

export const isPregnant = (p: Pick<TargetProfile, 'privateFlags'>) => Boolean(p.privateFlags?.pregnant);
export const isLactating = (p: Pick<TargetProfile, 'privateFlags'>) => Boolean(p.privateFlags?.lactating);

export function restingEnergy(sex: 'male' | 'female', kg: number, cm: number, age: number): number {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
}

export function energyTarget(p: TargetProfile): EnergyTarget {
  const preset = GOAL_PRESETS[p.goal];
  const fallback = (note: string): EnergyTarget => ({ ...preset, source: 'preset', note, bmr: null });
  if (isPregnant(p) || isLactating(p)) return fallback('Pregnancy and breastfeeding change how much you need. Ask your doctor or dietitian for your numbers; this is a general starting point only.');
  if (p.sex !== 'male' && p.sex !== 'female') return fallback('Add your sex under About you to personalise this.');
  if (p.age == null || p.heightCm == null || p.weightKg == null || p.activityLevel == null) return fallback('Add your age, height, weight and activity under About you to personalise this.');
  if (p.age < 18) return fallback('The formula is for adults. Ask a doctor or dietitian for numbers for under 18s.');
  const bmr = restingEnergy(p.sex, p.weightKg, p.heightCm, p.age);
  const kcal = Math.max(KCAL_FLOOR[p.sex], Math.round(((bmr * ACTIVITY_FACTOR[p.activityLevel] + GOAL_KCAL_SHIFT[p.goal]) / 10)) * 10);
  const protein = Math.round(p.weightKg * PROTEIN_PER_KG[p.goal]);
  return { kcal, protein, source: 'formula', note: null, bmr: Math.round(bmr) };
}

/** The two numbers the Today and Progress screens use. */
export function goalTargets(p: TargetProfile): GoalPreset {
  const e = energyTarget(p);
  return { kcal: e.kcal, protein: e.protein };
}

// ------------------------------------------------------------------ micronutrients

/** Which researched ICMR-NIN row applies. */
export function targetGroupFor(p: TargetProfile): TargetGroup | null {
  if (isPregnant(p)) return 'pregnant';
  if (isLactating(p)) return 'lactating';
  if (p.sex !== 'male' && p.sex !== 'female') return null;
  if (p.age != null && p.age >= 60) return 'age_60_plus';
  const band = p.activityLevel === 'active' || p.activityLevel === 'very-active' ? 'heavy' : p.activityLevel === 'sedentary' ? 'sedentary' : 'moderate';
  return `adult_${p.sex}_${band}` as TargetGroup;
}

export type MicroTarget = { id: string; name: string; unit: string; value: number | null; group: string; source: string };

export function microTargets(p: TargetProfile, nutrients: readonly Nutrient[]): MicroTarget[] {
  const group = targetGroupFor(p);
  const adult = p.sex === 'male' || p.sex === 'female' ? (`adult_${p.sex}` as const) : null;
  return nutrients
    .filter((n) => n.type === 'vitamin' || n.type === 'mineral')
    .map((n) => {
      const adultRows = adult ? n.targets.filter((t) => t.group.startsWith(adult)) : [];
      const row = group ? n.targets.find((t) => t.group === group && (t.rda ?? t.ai) != null) ?? (group === 'age_60_plus' ? adultRows.find((t) => (t.rda ?? t.ai) != null) : undefined) : undefined;
      const fromRow = row ? (row.rda ?? row.ai) : null;
      // The topic's own "app default" for the broad group is the fallback when the exact row is blank.
      const defKey = isPregnant(p) ? 'pregnant' : isLactating(p) ? 'lactating' : p.age != null && p.age >= 60 ? 'age_60_plus' : adult;
      const value = fromRow ?? (defKey ? (n.appDefaultTarget?.[defKey as keyof NonNullable<Nutrient['appDefaultTarget']>] ?? null) : null);
      return { id: n.id, name: n.name.replace(/\s*\(.*$/, ''), unit: n.unit, value, group: group ?? 'unknown', source: row?.source ?? 'topic default (ICMR-NIN, secondary)' };
    });
}

// ------------------------------------------------------------------ water

export type WaterTarget = { glasses: number; researched: boolean; note: string };
export const DEFAULT_WATER_GLASSES = 8;

export function waterTarget(): WaterTarget {
  return { glasses: DEFAULT_WATER_GLASSES, researched: false, note: 'A general default. A target for your weight and activity arrives with the water research.' };
}
