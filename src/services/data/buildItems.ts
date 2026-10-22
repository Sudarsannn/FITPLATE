/**
 * Turns all research versions of one item into the app record (spec C.4):
 * normalise → cross-link → merge (section D) → validate. Rebuilding from every
 * version each run keeps output deterministic and idempotent: the same
 * ledger always gives the same JSON.
 */
import type { Dish, Ingredient, Macros, NutrientPer100, PriceEstimate, SourcedValue } from '../../models/research';
import type { DishVersion } from './dishImporter';
import type { IngredientVersion } from './ingredientImporter';
import { mergeOfficial, mergeStable, recipeChangedMaterially, unionList, type OfficialVersion } from './merge';
import { slugify, splitName } from './markdown';
import { checkPrice, type PriceCheckInput } from './priceChecks';
import { computePriceEstimate, SEASONAL_PRODUCE, type PriceObservation } from './priceTrend';
import { dishTags } from './tags';

const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);

/**
 * Drops the engine's extra fields into notes, and keeps a narrowed range
 * inside what research actually observed: rounding a ±15% band can reach
 * below the lowest price any source showed (idli: ₹70–100 → ₹60–90).
 */
function stripEngine(result: ReturnType<typeof computePriceEstimate>, observations: PriceObservation[]): { estimate: PriceEstimate; notes: string[] } {
  const { flags, notes, ...estimate } = result;
  const cur = estimate.currentEstimate;
  if (cur && observations.length > 0) {
    const lo = Math.min(...observations.map((o) => o.min));
    const hi = Math.max(...observations.map((o) => o.max));
    const min = Math.max(cur.min, lo);
    const max = Math.min(cur.max, hi);
    if (min <= cur.avg && cur.avg <= max && (min !== cur.min || max !== cur.max)) {
      notes.push(`range clamped to observed prices: ${cur.min}–${cur.max} → ${min}–${max}`);
      estimate.currentEstimate = { ...cur, min, max };
    }
  }
  return { estimate, notes: [...flags.map((f) => `price flag: ${f}`), ...notes] };
}

/**
 * Review 2026-10-15 FIX 2: checks the newest researched range (the one the
 * estimate follows) and stores the result on the merged price. Reasons go to
 * needs-review so the DATA SYNC REPORT lists them.
 */
function attachPriceCheck(
  estimate: PriceEstimate,
  newest: (PriceCheckInput & { statedAvg: number | null }) | null,
  date: string,
  review: string[],
): PriceEstimate {
  if (!newest) return estimate;
  const check = checkPrice({ ...newest, avg: newest.statedAvg });
  for (const n of check.checkNotes) review.push(`price not confirmed (${date}): ${n}`);
  return { ...estimate, ...check };
}

function mergeMacros(versions: { date: string; macros: Macros | null }[], label: string, notes: string[]): { value: Macros; method: string } {
  const out = {} as Macros;
  let method = 'none';
  for (const key of ['kcal', 'proteinG', 'carbsG', 'fatG', 'fibreG'] as const) {
    const merged = mergeStable(versions.map((v) => ({ date: v.date, value: v.macros?.[key] ?? null })));
    out[key] = merged.value;
    if (key === 'kcal') method = merged.method;
    for (const n of merged.notes) notes.push(`${label}.${key}: ${n}`);
  }
  return { value: out, method };
}

// ---------------------------------------------------------------- ingredients

/** Lookup from any spelling (English name, alias) to a canonical ingredient id. */
export type IngredientIndex = {
  byKey: Map<string, string>;
  ids: string[];
  /** Day 8: the part of each name before its first comma ("Tamarind, seedless block" → tamarind); '' when two items share it. */
  heads?: Map<string, string>;
  /** Day 8: every item that claims an alias, kept even when the alias is shared. */
  claims?: Map<string, Set<string>>;
};

export function buildIngredientIndex(items: { id: string; name: string; aliases: string[] }[]): IngredientIndex {
  const byKey = new Map<string, string>();
  for (const item of items) {
    byKey.set(item.id, item.id);
    byKey.set(slugify(item.name), item.id);
    for (const alias of item.aliases) {
      const key = slugify(alias);
      // An alias shared by two ingredients (e.g. "chawal") identifies neither.
      if (byKey.has(key) && byKey.get(key) !== item.id) byKey.set(key, '');
      else if (!byKey.has(key)) byKey.set(key, item.id);
    }
  }
  const heads = new Map<string, string>();
  const claims = new Map<string, Set<string>>();
  for (const item of items) {
    const head = slugify(item.name.split(',')[0]);
    heads.set(head, heads.has(head) && heads.get(head) !== item.id ? '' : item.id);
    for (const alias of item.aliases) {
      const key = slugify(alias);
      claims.set(key, (claims.get(key) ?? new Set<string>()).add(item.id));
    }
  }
  return { byKey, ids: items.map((i) => i.id), heads, claims };
}

/**
 * Best-effort link from a dish's ingredient line to a canonical id: exact
 * English name, then a bracketed alias, then a whole-word prefix ("lemon
 * juice" → lemon). Unmatched lines stay null; Day 5 adds the full alias map.
 */
export const NEUTRAL_OIL_ID = 'cooking-oil-refined-sunflower-groundnut';
const NEUTRAL_OIL_LINE = /\boil\b/i;
const OTHER_FAT = /\b(mustard|sesame|gingelly|til|coconut|olive|ghee|butter|chilli|chili)\b/i;

export function linkIngredient(name: string, index: IngredientIndex): string | null {
  // Day 8: the whole line, brackets included, can be an ingredient's exact id
  // ("Chicken (curry cut, bone-in, skinless)"); that is a match, not a guess.
  const whole = slugify(name);
  if (index.ids.includes(whole)) return whole;
  // Day 8: "Groundnut oil (or any neutral cooking oil)", "Vegetable oil" and
  // the like are what the ingredient research prices as one item, refined
  // sunflower / groundnut oil. Lines naming a different fat keep their own link.
  if (NEUTRAL_OIL_LINE.test(name) && !OTHER_FAT.test(name) && index.ids.includes(NEUTRAL_OIL_ID)) return NEUTRAL_OIL_ID;
  const { english, aliases } = splitName(name);
  const key = slugify(english);
  const direct = index.byKey.get(key);
  if (direct) return direct;
  for (const alias of aliases) {
    const hit = index.byKey.get(slugify(alias));
    if (hit) return hit;
  }
  // "Tamarind (imli)": "imli" is shared, but only "Tamarind, seedless block"
  // is plain "Tamarind" before its comma AND claims "imli". Both must agree.
  const head = index.heads?.get(key);
  if (head && aliases.some((a) => index.claims?.get(slugify(a))?.has(head))) return head;
  const prefixes = index.ids.filter((id) => key.startsWith(id + '-')).sort((a, b) => b.length - a.length);
  if (prefixes.length > 0) return prefixes[0];
  const longer = index.ids.filter((id) => id.startsWith(key + '-'));
  return longer.length === 1 ? longer[0] : null;
}

function per100From(estimate: PriceEstimate | null, unit: string | null): Ingredient['per100Estimate'] {
  const cur = estimate?.currentEstimate;
  if (!cur) return null;
  const factor = unit === 'kg' || unit === 'l' ? 0.1 : unit === 'g' || unit === 'ml' ? 100 : null;
  if (factor == null) return null;
  const r = (v: number) => Math.round(v * factor * 100) / 100;
  return { min: r(cur.min), max: r(cur.max), avg: r(cur.avg) };
}

const OFFICIAL = /\b(IFCT|USDA|FDC|ICMR|NIN)\b/i;

function mergeNutrient(versions: IngredientVersion[], notes: string[], review: string[]): NutrientPer100 | null {
  const withProfile = versions.filter((v) => v.nutritionPer100g);
  if (withProfile.length === 0) return null;
  const latest = withProfile[withProfile.length - 1].nutritionPer100g as NutrientPer100;
  const out = { basis: latest.basis } as NutrientPer100;
  for (const key of Object.keys(latest).filter((k) => k !== 'basis') as (keyof Omit<NutrientPer100, 'basis'>)[]) {
    type Held = OfficialVersion & { sv: SourcedValue };
    let prev = null as Held | null;
    for (const v of withProfile) {
      const sv = (v.nutritionPer100g as NutrientPer100)[key];
      const next: Held = { value: sv.value, citesOfficial: OFFICIAL.test(sv.source ?? ''), date: v.date, sv };
      const merged = mergeOfficial(prev, next);
      if (merged.note) notes.push(`nutritionPer100g.${key}: ${merged.note}`);
      if (merged.needsReview) review.push(`nutritionPer100g.${key} conflict`);
      // mergeOfficial returns one of the two values; keep that version's source with it.
      const held: Held = prev !== null && merged.value === prev.value && merged.value !== next.value ? prev : next;
      prev = { ...held, value: merged.value };
    }
    out[key] = prev?.sv ?? { value: null, source: null, confidence: null };
  }
  return out;
}

export function buildIngredient(all: IngredientVersion[], today: string): Ingredient & { needsReview: string[] } {
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const notes: string[] = [];
  const review: string[] = [];
  const mergeMethod: Record<string, string> = {};

  const seasonal = SEASONAL_PRODUCE.has(latest.id);
  const observations: PriceObservation[] = versions
    .filter((v) => v.price)
    .map((v) => ({ date: v.date, min: v.price!.min, max: v.price!.max, avg: v.price!.avg, confidence: v.confidence, sourceFile: v.file }));
  let price: PriceEstimate | null = null;
  if (observations.length > 0) {
    const { estimate, notes: n } = stripEngine(computePriceEstimate(observations, { today, seasonal, kind: 'ingredient' }), observations);
    const newest = [...versions].reverse().find((v) => v.price);
    price = attachPriceCheck(estimate, newest?.price ?? null, newest?.date ?? '', review);
    notes.push(...n);
    mergeMethod.price = `price engine (${estimate.method})`;
  }
  const newest = <K extends keyof IngredientVersion>(key: K): IngredientVersion[K] | null => {
    for (let i = versions.length - 1; i >= 0; i--) if (versions[i][key] != null) return versions[i][key];
    return null;
  };
  const macros = mergeMacros(versions.map((v) => ({ date: v.date, macros: v.macrosPer100 })), 'macrosPer100Estimate', notes);
  mergeMethod.macrosPer100Estimate = `stable (${macros.method})`;
  const nutritionPer100g = mergeNutrient(versions, notes, review);
  if (nutritionPer100g) mergeMethod.nutritionPer100g = 'official (D3)';
  mergeMethod.aliases = 'union';
  mergeMethod.substitutes = 'union';
  mergeMethod.storage = 'newest';
  mergeMethod.usedIn = 'newest';

  for (const v of versions) for (const n of v.notes) notes.push(`${v.date}: ${n}`);
  const unit = newest('standardUnit') as string | null;

  return {
    id: latest.id,
    name: latest.name,
    aliases: unionList(...versions.map((v) => v.aliases)),
    category: newest('category') as string | null,
    standardUnit: unit,
    price,
    per100Estimate: per100From(price, unit),
    seasonal,
    nutritionPer100g,
    macrosPer100Estimate: Object.values(macros.value).some((x) => x != null) ? macros.value : null,
    storage: newest('storage') as string | null,
    substitutes: unionList(...versions.map((v) => v.substitutes)),
    usedIn: latest.usedIn ?? [],
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod,
    mergeNotes: notes,
    needsReview: review,
  };
}

// ---------------------------------------------------------------- dishes

export function buildDish(all: DishVersion[], today: string, index: IngredientIndex): Dish {
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const notes: string[] = [];
  const priceReview: string[] = [];
  const mergeMethod: Record<string, string> = {};

  const nutrition = mergeMacros(versions.map((v) => ({ date: v.date, macros: v.nutrition })), 'nutritionPerServing', notes);
  mergeMethod.nutritionPerServing = `stable (${nutrition.method})`;

  const observations: PriceObservation[] = versions
    .filter((v) => v.orderPrice)
    .map((v) => ({ date: v.date, min: v.orderPrice!.min, max: v.orderPrice!.max, avg: v.orderPrice!.avg, confidence: null, sourceFile: v.file }));
  let orderPrice: PriceEstimate | null = null;
  if (observations.length > 0) {
    const { estimate, notes: n } = stripEngine(computePriceEstimate(observations, { today, seasonal: false, kind: 'dish' }), observations);
    const newest = [...versions].reverse().find((v) => v.orderPrice);
    orderPrice = attachPriceCheck(estimate, newest?.orderPrice ?? null, newest?.date ?? '', priceReview);
    notes.push(...n);
    mergeMethod.orderPrice = `price engine (${estimate.method})`;
  }

  if (versions.length > 1) {
    const prev = versions[versions.length - 2];
    const line = (v: DishVersion) => v.ingredients.map((i) => ({ ingredientId: linkIngredient(i.name, index), name: i.name, quantity: i.quantity }));
    if (recipeChangedMaterially(line(prev), line(latest))) notes.push(`recipe changed materially between ${prev.date} and ${latest.date}; newest recipe used`);
  }
  mergeMethod.ingredients = 'newest';
  mergeMethod.steps = 'newest';
  mergeMethod.healthiness = 'newest';
  mergeMethod.researchRating = 'newest';
  mergeMethod.sources = 'union';
  for (const v of versions) for (const n of v.notes) notes.push(`${v.date}: ${n}`);

  // As-ordered values are published numbers: keep the newest block; its price is the order price.
  const asOrdered = [...versions].reverse().find((v) => v.asOrdered)?.asOrdered ?? null;

  const dish: Dish = {
    id: latest.id,
    number: latest.number,
    name: latest.name,
    cuisine: latest.cuisine,
    dietType: latest.dietType,
    mealType: latest.mealType,
    difficulty: latest.difficulty,
    prepMin: latest.prepMin,
    cookMin: latest.cookMin,
    servings: 1,
    ingredients: latest.ingredients.map((i) => ({ ...i, ingredientId: linkIngredient(i.name, index) })),
    equipment: latest.equipment,
    steps: latest.steps,
    nutritionPerServing: nutrition.value,
    microNutrientsEstimate: null,
    asOrdered: asOrdered ? { ...asOrdered, price: orderPrice } : null,
    orderPrice,
    healthiness: latest.healthiness,
    researchRating: latest.researchRating,
    storage: latest.storage,
    leftoverRemix: latest.leftoverRemix,
    burnOff: latest.burnOff,
    sources: unionList(...versions.map((v) => v.sources)),
    allergens: latest.allergens,
    dietClaims: latest.dietClaims,
    fasting: latest.fasting,
    dietTags: latest.dietTags,
    tags: [],
    description: latest.description,
    // Set across all dishes by assignFamilies() in the runner; one dish alone can't know its family.
    familyId: null,
    variants: latest.variants,
    needsReview: [...latest.needsReview, ...priceReview],
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod,
    mergeNotes: notes,
  };
  const tagged = dishTags(dish);
  dish.tags = tagged.tags;
  dish.needsReview.push(...tagged.review);
  mergeMethod.tags = 'tag engine (tags.ts) on the merged dish';
  return dish;
}

/** Light validation before a record is written; problems block the write and go in the report. */
export function validateDish(d: Dish): string[] {
  const errs: string[] = [];
  if (!d.name) errs.push('no name');
  if (d.ingredients.length === 0) errs.push('no ingredients parsed');
  if (d.steps.length === 0) errs.push('no steps parsed');
  if (d.nutritionPerServing.kcal == null) errs.push('no calories parsed');
  if (d.steps.some((s, i) => s.n !== i + 1)) errs.push('steps not numbered 1..n');
  return errs;
}

export function validateIngredient(i: Ingredient): string[] {
  const errs: string[] = [];
  if (!i.name) errs.push('no name');
  if (!i.price) errs.push('no price parsed');
  const cur = i.price?.currentEstimate;
  if (cur && !(cur.min <= cur.avg && cur.avg <= cur.max)) errs.push('price estimate out of order');
  return errs;
}
