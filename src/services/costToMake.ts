/**
 * Day 8: the cost-to-make engine. Works out what one serving of a research
 * dish costs to cook from each ingredient's current_estimate (spec section E)
 * and the canonical ingredient ids linked on Day 5.
 *
 * Rules (PROMPT.md Day 8):
 *   - Units: g, kg, ml, l, pieces, tsp, tbsp, cup. Spoon and cup sizes are
 *     measuring definitions (5 / 15 / 240 ml), not research data.
 *   - Weight ↔ volume needs a density. Research has published none yet, so a
 *     crossing is costed at 1 g per ml and the line is marked "(est.)".
 *   - Pieces ↔ weight needs a piece weight research hasn't given, so those
 *     lines read "price coming soon", like unmatched ingredients.
 *   - The result is a RANGE (sum of the minimums to sum of the maximums).
 *   - Saving versus ordering, in ₹ and %, only when every ingredient is
 *     priced and the order price passed its checks (review 2026-10-15 FIX 2).
 * Pure functions, so every rule is unit-tested.
 */
import type { Dish, DishIngredient, Ingredient } from '../models/research';

type UnitKind = 'mass' | 'volume' | 'count';

/** Unit → kind and size in its base (g, ml or 1 piece). */
const UNITS: Record<string, { kind: UnitKind; base: number }> = {
  g: { kind: 'mass', base: 1 },
  gm: { kind: 'mass', base: 1 },
  gram: { kind: 'mass', base: 1 },
  grams: { kind: 'mass', base: 1 },
  kg: { kind: 'mass', base: 1000 },
  ml: { kind: 'volume', base: 1 },
  l: { kind: 'volume', base: 1000 },
  litre: { kind: 'volume', base: 1000 },
  liter: { kind: 'volume', base: 1000 },
  tsp: { kind: 'volume', base: 5 },
  tbsp: { kind: 'volume', base: 15 },
  cup: { kind: 'volume', base: 240 },
  cups: { kind: 'volume', base: 240 },
  piece: { kind: 'count', base: 1 },
  pieces: { kind: 'count', base: 1 },
  pc: { kind: 'count', base: 1 },
  pcs: { kind: 'count', base: 1 },
  small: { kind: 'count', base: 1 },
  medium: { kind: 'count', base: 1 },
  large: { kind: 'count', base: 1 },
  leaf: { kind: 'count', base: 1 },
  leaves: { kind: 'count', base: 1 },
  dozen: { kind: 'count', base: 12 },
};

/** Grams per ml when research gives no density; always shown as "(est.)". */
export const ASSUMED_G_PER_ML = 1;

export type Amount = { kind: UnitKind; amount: number };

/**
 * A quantity in its base unit. A number with no unit is a count ("3" eggs,
 * "2" pav), which is how the dish tables write whole items.
 */
export function toBase(quantity: number | null, unit: string | null): Amount | null {
  if (quantity == null || !(quantity >= 0)) return null;
  if (!unit || !unit.trim()) return { kind: 'count', amount: quantity };
  const u = UNITS[unit.trim().toLowerCase()];
  return u ? { kind: u.kind, amount: quantity * u.base } : null;
}

/**
 * How many price units a dish amount is, e.g. 180 g of an ingredient priced
 * per kg is 0.18. `estimated` when weight and volume had to be crossed.
 */
export function inPriceUnits(amount: Amount, priceUnit: string | null): { units: number; estimated: boolean } | null {
  const p = priceUnit ? UNITS[priceUnit.trim().toLowerCase()] : undefined;
  if (!p) return null;
  if (amount.kind === p.kind) return { units: amount.amount / p.base, estimated: false };
  if (amount.kind === 'count' || p.kind === 'count') return null;
  const grams = amount.kind === 'mass' ? amount.amount : amount.amount * ASSUMED_G_PER_ML;
  const inPriceKind = p.kind === 'mass' ? grams : grams / ASSUMED_G_PER_ML;
  return { units: inPriceKind / p.base, estimated: true };
}

export type CostStatus = 'priced' | 'estimated' | 'free' | 'pinch' | 'coming-soon';

export type CostLine = {
  name: string;
  ingredientId: string | null;
  status: CostStatus;
  /** ₹ for this line, unrounded; null unless priced or estimated. */
  min: number | null;
  max: number | null;
  avg: number | null;
  /** Shown beside the line: "(est.) 1 g per ml", "price coming soon", "no cost". */
  note: string | null;
  /** The ingredient's price passed the listing checks. */
  confirmed: boolean;
};

const WATER = /^(warm |cold |hot |ice cubes \+ cold )?water\b/i;
const PINCH = /\bpinch\b/i;

type PricedIngredient = Pick<Ingredient, 'id' | 'standardUnit' | 'price'>;

/** One ingredient line's cost, or why there isn't one. Section headings (no amount at all) return null. */
export function lineCost(line: DishIngredient, ingredient: PricedIngredient | undefined): CostLine | null {
  const base = { name: line.name, ingredientId: line.ingredientId, min: null, max: null, avg: null, confirmed: false };
  if (line.quantity == null && !line.unit && !line.householdMeasure) return null;
  if (!line.ingredientId && WATER.test(line.name.trim())) return { ...base, status: 'free', note: 'no cost' };
  if (line.quantity == null && PINCH.test(line.householdMeasure ?? '')) return { ...base, status: 'pinch', note: 'a pinch, too little to count' };
  const est = ingredient?.price?.currentEstimate;
  if (!ingredient || !est) return { ...base, status: 'coming-soon', note: 'price coming soon' };
  const amount = toBase(line.quantity, line.unit);
  const units = amount ? inPriceUnits(amount, ingredient.standardUnit) : null;
  if (!units) return { ...base, status: 'coming-soon', note: 'price coming soon' };
  return {
    ...base,
    status: units.estimated ? 'estimated' : 'priced',
    min: est.min * units.units,
    max: est.max * units.units,
    avg: est.avg * units.units,
    note: units.estimated ? `(est.) counted at ${ASSUMED_G_PER_ML} g per ml` : null,
    confirmed: ingredient.price?.confirmed !== false,
  };
}

export type MakeTrend = { trend: 'rising' | 'falling' | 'stable'; change30dPct: number | null };

export type DishCost = {
  lines: CostLine[];
  /** ₹ per serving, rounded; sums of the priced and estimated lines. */
  min: number;
  max: number;
  avg: number;
  /** Lines that count toward completeness (not free water, pinches or headings). */
  countedLines: number;
  pricedLines: number;
  missing: string[];
  /** Every counted line has a price. */
  complete: boolean;
  /** Some line crossed weight and volume. */
  estimated: boolean;
  /** Priced lines whose ingredient price isn't confirmed by 3 listings yet. */
  unconfirmed: number;
  trend: MakeTrend | null;
};

/** Same threshold as the price trend engine (spec section E). */
const TREND_PCT = 5;

/**
 * The make-cost trend: each priced line's ingredient trend weighted by its
 * share of the cost. Null until lines worth at least half the cost have a
 * known trend, so one rising spice can't move the whole dish.
 */
export function makeTrend(lines: { avg: number | null; ingredient: PricedIngredient | undefined }[]): MakeTrend | null {
  let total = 0;
  let known = 0;
  let weighted = 0;
  let withPct = 0;
  for (const l of lines) {
    if (l.avg == null || l.avg <= 0) continue;
    total += l.avg;
    const p = l.ingredient?.price;
    if (!p || p.trend === 'unknown') continue;
    known += l.avg;
    if (p.change30dPct != null) {
      weighted += p.change30dPct * l.avg;
      withPct += l.avg;
    }
  }
  if (total === 0 || known / total < 0.5) return null;
  const pct = withPct > 0 ? Math.round((weighted / withPct) * 10) / 10 : null;
  const trend = pct == null || Math.abs(pct) < TREND_PCT ? 'stable' : pct > 0 ? 'rising' : 'falling';
  return { trend, change30dPct: pct };
}

/** Cost to make one serving. Null when not a single line could be priced. */
export function dishCostToMake(dish: Pick<Dish, 'ingredients'>, ingredients: (id: string) => PricedIngredient | undefined): DishCost | null {
  const rows = dish.ingredients
    .map((line) => {
      const ingredient = line.ingredientId ? ingredients(line.ingredientId) : undefined;
      return { cost: lineCost(line, ingredient), ingredient };
    })
    .filter((r): r is { cost: CostLine; ingredient: PricedIngredient | undefined } => r.cost != null);
  const lines = rows.map((r) => r.cost);
  const priced = lines.filter((l) => l.status === 'priced' || l.status === 'estimated');
  if (priced.length === 0) return null;
  const counted = lines.filter((l) => l.status !== 'free' && l.status !== 'pinch');
  const missing = lines.filter((l) => l.status === 'coming-soon').map((l) => l.name);
  const sum = (k: 'min' | 'max' | 'avg') => priced.reduce((s, l) => s + (l[k] ?? 0), 0);
  return {
    lines,
    min: Math.round(sum('min')),
    max: Math.round(sum('max')),
    avg: Math.round(sum('avg')),
    countedLines: counted.length,
    pricedLines: priced.length,
    missing,
    complete: missing.length === 0,
    estimated: priced.some((l) => l.status === 'estimated'),
    unconfirmed: priced.filter((l) => !l.confirmed).length,
    trend: makeTrend(rows.map((r) => ({ avg: r.cost.avg, ingredient: r.ingredient }))),
  };
}

export type Saving = { rupees: number; pct: number };

/**
 * Saving versus ordering, from the averages: ₹ and % of the order price.
 * Negative when cooking costs more. Null unless the cost is complete and the
 * order price is a confirmed headline.
 */
export function savingVsOrder(cost: DishCost | null, order: { avg: number } | null): Saving | null {
  if (!cost?.complete || !order || order.avg <= 0) return null;
  const rupees = order.avg - cost.avg;
  return { rupees, pct: Math.round((rupees / order.avg) * 100) };
}

/** "₹42" or "under ₹1" for a line. */
export function rupees(v: number | null): string {
  if (v == null) return '';
  return v < 1 ? 'under ₹1' : `₹${Math.round(v)}`;
}

/** "₹38–46" (or one figure when the range is flat). */
export function rangeLabel(c: Pick<DishCost, 'min' | 'max'>): string {
  return c.min === c.max ? `₹${c.min}` : `₹${c.min}–${c.max}`;
}

/**
 * Innovation (Day 08, review idea 4): rupees per 10 g of protein from the
 * home-cooked recipe. Only for complete costs, so a missing item can't make a
 * dish look cheaper than it is.
 */
export function rupeesPer10gProtein(cost: DishCost | null, proteinG: number | null): number | null {
  if (!cost?.complete || proteinG == null || proteinG < 1) return null;
  return Math.round((cost.avg / proteinG) * 10 * 10) / 10;
}
