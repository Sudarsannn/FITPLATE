import type { Nutrient } from '../models/nutrient';

/**
 * Day 18: supplements counted next to food, with the researched upper limits.
 * Amounts convert to the nutrient's main unit only with factors the research found (same unit, `altUnits`);
 * a unit with no factor is refused, never guessed. Food amounts are the dishes' partial estimates.
 */
export type Dose = { nutrientId: string; amount: number; unit: string };

export const NEAR_LIMIT = 0.8;

const norm = (u: string) => u.trim().toLowerCase().replace('mcg', 'µg').replace('μ', 'µ');

/** Units the logging screen offers for a nutrient: its main unit and every alt unit with a researched factor. */
export function doseUnits(n: Pick<Nutrient, 'unit' | 'altUnits'>): string[] {
  const alts = n.altUnits.filter((a) => a.toMainUnitFactor > 0).map((a) => a.unit);
  return [n.unit, ...alts.filter((u) => norm(u) !== norm(n.unit))];
}

/** The amount in the nutrient's main unit, or null when the unit has no researched factor. */
export function toMainUnit(n: Pick<Nutrient, 'unit' | 'altUnits'>, amount: number, unit: string): number | null {
  if (!(amount >= 0)) return null;
  if (norm(unit) === norm(n.unit)) return amount;
  const alt = n.altUnits.find((a) => norm(a.unit) === norm(unit) && a.toMainUnitFactor > 0);
  return alt ? amount * alt.toMainUnitFactor : null;
}

/** Totals per nutrient id, in main units, from logged doses. Doses that cannot be converted are skipped and reported. */
export function supplementTotals(doses: Dose[], nutrients: readonly Nutrient[]): { totals: Record<string, number>; skipped: Dose[] } {
  const byId = new Map(nutrients.map((n) => [n.id, n]));
  const totals: Record<string, number> = {};
  const skipped: Dose[] = [];
  for (const d of doses) {
    const n = byId.get(d.nutrientId);
    const v = n ? toMainUnit(n, d.amount, d.unit) : null;
    if (v == null) skipped.push(d);
    else totals[d.nutrientId] = (totals[d.nutrientId] ?? 0) + v;
  }
  return { totals, skipped };
}

export type LimitStatus = { level: 'none' | 'ok' | 'near' | 'over'; limit: number | null; used: number; fraction: number | null; basis: 'food+supplements' | 'supplements' | null };

/**
 * Where intake sits against the researched upper limit. A limit that applies to "supplements only" is compared
 * with the supplement amount alone; one that applies to food and supplements is compared with the total.
 * No researched limit means level 'none' (the app never invents one).
 */
export function limitStatus(n: Pick<Nutrient, 'upperLimit'>, foodAmount: number, supplementAmount: number): LimitStatus {
  const ul = n.upperLimit;
  if (!ul || ul.value == null || ul.value <= 0) return { level: 'none', limit: null, used: supplementAmount, fraction: null, basis: null };
  const supplementsOnly = ul.appliesTo === 'supplements_only';
  const used = supplementsOnly ? supplementAmount : foodAmount + supplementAmount;
  const fraction = used / ul.value;
  // With food-and-supplement limits, only warn when a supplement is in the mix: food alone is not the user's choice here.
  const level = supplementAmount <= 0 ? 'ok' : fraction > 1 ? 'over' : fraction >= NEAR_LIMIT ? 'near' : 'ok';
  return { level, limit: ul.value, used, fraction, basis: supplementsOnly ? 'supplements' : 'food+supplements' };
}

export const LIMIT_NOTE = 'Not medical advice. Upper limits are for healthy adults. If a doctor gave you a different dose, follow your doctor.';
