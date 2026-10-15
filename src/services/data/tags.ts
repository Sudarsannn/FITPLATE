/**
 * Tag engine (SPEC-ADDENDA §9). Computes a dish's search and chip tags at
 * import time from data that has already been checked. A tag appears only when
 * the data supports it; nothing here is guessed.
 *
 * - Vegan / Gluten-free / Dairy-free: only from a research claim that the
 *   Day 04 allergen check kept. "No gluten detected" is never "Gluten-free".
 * - Jain / Navratri / Ekadashi: only from a validated fasting line of "yes".
 *   A Jain "with changes" line, or a researched Jain variant, gives "Jain option".
 * - Contains …: from the allergen list (derived plus what research declared).
 * - Nutrition tags use the dish research's own thresholds (PATCH 04 A):
 *   High protein ≥ 15 g, High fibre ≥ 6 g, Low calorie ≤ 300 kcal per serving.
 * - Time bands use prep + cook minutes: Under 15 / 30 / 60 min.
 */
import type { Dish, DishVariant } from '../../models/research';
import { ALLERGEN_LABELS } from './allergens';

export const TAG = {
  veg: 'Veg',
  egg: 'Egg',
  nonVeg: 'Non-veg',
  vegan: 'Vegan',
  jain: 'Jain',
  jainOption: 'Jain option',
  veganOption: 'Vegan option',
  glutenFree: 'Gluten-free',
  glutenFreeOption: 'Gluten-free option',
  dairyFree: 'Dairy-free',
  dairyFreeOption: 'Dairy-free option',
  vegOption: 'Veg option',
  pescatarian: 'Pescatarian',
  sattvik: 'No onion-garlic',
  navratri: 'Navratri / vrat',
  ekadashi: 'Ekadashi',
  ramadan: 'Ramadan sehri / iftar',
  fastingFriendly: 'Fasting-friendly',
  highProtein: 'High protein',
  highFibre: 'High fibre',
  lowCalorie: 'Low calorie',
} as const;

/** Thresholds from dish research PROMPT_PATCH_04 (A), per 1 serving. */
export const NUTRITION_THRESHOLDS = { highProteinG: 15, highFibreG: 6, lowCalorieKcal: 300 } as const;

export function containsTag(label: string): string {
  return `Contains ${label.toLowerCase()}`;
}

/** Onion and garlic, for checking a researched "no onion / no garlic" Yes against the recipe. */
const ONION_GARLIC = /\b(onions?|kanda|pyaz|spring onion|shallots?|garlic|lahsun|lehsun)\b/i;
/** Meat and poultry, for checking a researched "Pescatarian: Yes". Fish and seafood are fine. */
const MEAT = /\b(chicken|mutton|goat|lamb|beef|pork|keema|meat)\b/i;
/** Fish and seafood, for showing the Pescatarian chip. */
const SEAFOOD = /\b(fish|prawns?|shrimps?|crabs?|squid|mussels?|clams?|lobster|surmai|pomfret|bangda|mackerel|rohu|hilsa|tuna|salmon|sardines?|anchov(y|ies))\b/i;

function title(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** "South Indian (Tamil Nadu; also …)" → "South Indian". */
export function cuisineTag(cuisine: string | null): string | null {
  if (!cuisine) return null;
  const short = cuisine.replace(/\(.*$/, '').split(/[/;,]/)[0].trim();
  return short.length > 0 && short.length <= 30 ? short : null;
}

export function timeBand(prepMin: number | null, cookMin: number | null): string | null {
  if (prepMin == null && cookMin == null) return null;
  const total = (prepMin ?? 0) + (cookMin ?? 0);
  if (total <= 0) return null;
  if (total <= 15) return 'Under 15 min';
  if (total <= 30) return 'Under 30 min';
  if (total <= 60) return 'Under 60 min';
  return null;
}

function hasVariant(variants: DishVariant[], category: RegExp): boolean {
  return variants.some((v) => v.status === 'variant' && category.test(v.category));
}

type TagInput = Pick<
  Dish,
  'dietType' | 'dietClaims' | 'fasting' | 'allergens' | 'mealType' | 'cuisine' | 'difficulty' | 'prepMin' | 'cookMin' | 'nutritionPerServing' | 'dietTags' | 'variants' | 'ingredients'
>;

export type TagResult = { tags: string[]; review: string[] };

/** All tags for one dish, in display order: diet first, then allergens, meal, cuisine, time, nutrition. */
export function dishTags(d: TagInput): TagResult {
  const tags: string[] = [];
  const review: string[] = [];
  const add = (t: string | null) => {
    if (t && !tags.includes(t)) tags.push(t);
  };
  const names = d.ingredients.map((i) => i.name);

  add(d.dietType === 'veg' ? TAG.veg : d.dietType === 'egg' ? TAG.egg : d.dietType === 'non-veg' ? TAG.nonVeg : null);
  if (d.dietClaims.includes('vegan')) add(TAG.vegan);
  if (d.fasting?.jain.status === 'yes') add(TAG.jain);
  else if (d.fasting?.jain.status === 'with-changes' || hasVariant(d.variants, /jain/i)) add(TAG.jainOption);
  if (!d.dietClaims.includes('vegan') && hasVariant(d.variants, /vegan/i)) add(TAG.veganOption);
  if (d.dietClaims.includes('glutenFree')) add(TAG.glutenFree);
  else if (hasVariant(d.variants, /gluten/i)) add(TAG.glutenFreeOption);
  if (d.dietClaims.includes('dairyFree')) add(TAG.dairyFree);
  else if (hasVariant(d.variants, /dairy/i)) add(TAG.dairyFreeOption);
  if (d.dietType !== 'veg' && hasVariant(d.variants, /^veg/i)) add(TAG.vegOption);

  // Other researched diet types (§8), each checked against the recipe before it becomes a tag.
  if (d.dietTags?.sattvik.status === 'yes') {
    if (names.some((n) => ONION_GARLIC.test(n))) review.push('"No onion / no garlic: Yes" but the recipe has onion or garlic; tag not shown');
    else add(TAG.sattvik);
  }
  if (d.dietTags?.pescatarian.status === 'yes') {
    if (names.some((n) => MEAT.test(n))) review.push('"Pescatarian: Yes" but the recipe has meat or poultry; tag not shown');
    // The chip only on dishes with fish or seafood (review 2026-10-15, fix 3): on every veg
    // dish it would crowd the title. Veg dishes still match a Pescatarian filter in search.
    else if (names.some((n) => SEAFOOD.test(n))) add(TAG.pescatarian);
  }

  const nav = d.fasting?.navratri.status === 'yes';
  const eka = d.fasting?.ekadashi.status === 'yes';
  if (nav) add(TAG.navratri);
  if (eka) add(TAG.ekadashi);
  if (d.fasting?.ramadan.status === 'yes') add(TAG.ramadan);
  if (nav || eka) add(TAG.fastingFriendly);

  for (const a of d.allergens) add(containsTag(ALLERGEN_LABELS[a]));

  for (const m of d.mealType) add(title(m));
  add(cuisineTag(d.cuisine));
  add(timeBand(d.prepMin, d.cookMin));
  if (d.difficulty) add(d.difficulty);

  const n = d.nutritionPerServing;
  if (n.proteinG != null && n.proteinG >= NUTRITION_THRESHOLDS.highProteinG) add(TAG.highProtein);
  if (n.fibreG != null && n.fibreG >= NUTRITION_THRESHOLDS.highFibreG) add(TAG.highFibre);
  if (n.kcal != null && n.kcal <= NUTRITION_THRESHOLDS.lowCalorieKcal) add(TAG.lowCalorie);

  return { tags, review };
}

// ---------------------------------------------------------------- families

/**
 * Words that name a diet or protein version of the same dish. "Chicken
 * Biryani" and "Veg Biryani" share the key "biryani"; "Masala Dosa" and
 * "Rava Dosa" do not, because rava and masala change the dish itself.
 */
const VERSION_WORDS = /^(chicken|mutton|lamb|goat|egg|fish|prawns?|shrimp|veg|vegetable|jain|vegan|paneer|soya|tofu|mushroom)\b\s*/i;

export function familyKey(name: string): string {
  let base = name.replace(/\(.*?\)/g, '').trim();
  let prev = '';
  while (prev !== base) {
    prev = base;
    base = base.replace(VERSION_WORDS, '');
  }
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type FamilyLink = { familyId: string; dishIds: string[]; how: 'name' | 'research-variant' };

/**
 * Groups dishes into variant families. Dishes whose names differ only by a
 * version word share a group; a research link ("Vegetarian variant: Veg Fried
 * Rice (FitPlate dish 10)") joins the two dishes' groups. Groups that share a
 * dish are merged (union-find), so every dish lands in exactly one family,
 * named after its lowest-numbered dish (review 2026-10-15, fix 3). A family
 * needs at least two dishes. Name matches are listed in the DATA SYNC REPORT.
 */
export function assignFamilies(dishes: Pick<Dish, 'id' | 'number' | 'name' | 'variants'>[]): { familyOf: Map<string, string>; links: FamilyLink[] } {
  const byNumber = new Map(dishes.map((d) => [d.number, d]));
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression keeps later lookups flat.
    let cur = id;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(rb, ra);
  };
  for (const d of dishes) parent.set(d.id, d.id);

  const byKey = new Map<string, string>();
  for (const d of dishes) {
    const key = familyKey(d.name);
    if (!key) continue;
    const first = byKey.get(key);
    if (first) union(first, d.id);
    else byKey.set(key, d.id);
  }
  const researchLinked = new Set<string>();
  for (const d of dishes) {
    for (const v of d.variants) {
      const other = v.linkedDishNumber != null ? byNumber.get(v.linkedDishNumber) : undefined;
      if (other && other.id !== d.id) {
        union(d.id, other.id);
        researchLinked.add(d.id);
        researchLinked.add(other.id);
      }
    }
  }

  const groups = new Map<string, Pick<Dish, 'id' | 'number' | 'name' | 'variants'>[]>();
  for (const d of dishes) {
    const root = find(d.id);
    groups.set(root, [...(groups.get(root) ?? []), d]);
  }
  const familyOf = new Map<string, string>();
  const links: FamilyLink[] = [];
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const lowest = members.reduce((a, b) => (b.number < a.number ? b : a));
    const familyId = familyKey(lowest.name) || lowest.id;
    const ids = members.map((m) => m.id).sort();
    for (const id of ids) familyOf.set(id, familyId);
    links.push({ familyId, dishIds: ids, how: ids.some((id) => researchLinked.has(id)) ? 'research-variant' : 'name' });
  }
  links.sort((a, b) => a.familyId.localeCompare(b.familyId));
  return { familyOf, links };
}
