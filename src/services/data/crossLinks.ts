/**
 * Cross-linking the research streams (spec section F, roadmap Day 5).
 * Pure functions over already-built items; the runner writes the results to
 * src/data/research/ingredients/aliases.json and src/data/research/links.json.
 *
 * Never guesses: a name that doesn't resolve through the alias map stays
 * unmatched and is listed in the DATA SYNC REPORT.
 */
import type { Dish, Ingredient, NutrientPer100 } from '../../models/research';
import { buildIngredientIndex, linkIngredient, type IngredientIndex } from './buildItems';
import { slugify, splitName } from './markdown';

// ---------------------------------------------------------------- F1 alias map

export type AliasMap = Record<string, string>;

/**
 * Brackets in dish lines also hold notes ("optional", "for the stir-fry",
 * "e.g. Amul", "25% fat"). Only short, plain names are learned as aliases.
 */
const NOT_A_NAME = /\b(optional|for|e|g|eg|or|and|any|about|approx|fat|chopped|sliced|diced|petals|store|bought|homemade|amul|mdh|everest|tata|catch|brand|see|step|plus|extra|to|taste|dry|dried|fresh|frozen|refined|cut|into|squares|cubes|pieces|pureed|puree|split|whole|ground|grated|minced|crushed|soaked|boiled|cooked|raw|ripe|thin|thick|peeled|deseeded|finely|roughly|halved|julienned|large|medium)\b/;

export function looksLikeName(alias: string): boolean {
  const key = slugify(alias);
  return key.length >= 3 && !/\d/.test(key) && key.split('-').length <= 3 && !NOT_A_NAME.test(key.replace(/-/g, ' '));
}

/**
 * Spelling → canonical id, from the ingredient files (names, Indian names) and
 * from dish files: when a dish line links by its English name, its bracketed
 * Indian names ("Cumin seeds (jeera)") become aliases too. An alias that two
 * ingredients claim is dropped, since it identifies neither.
 */
export function buildAliasMap(ingredients: Pick<Ingredient, 'id' | 'name' | 'aliases'>[], dishes: Pick<Dish, 'ingredients'>[]): { aliases: AliasMap; learned: { alias: string; id: string }[]; ambiguous: string[] } {
  const owners = new Map<string, Set<string>>();
  const claim = (raw: string, id: string) => {
    const key = slugify(raw);
    if (!key) return;
    (owners.get(key) ?? owners.set(key, new Set()).get(key)!).add(id);
  };
  for (const i of ingredients) {
    claim(i.id, i.id);
    claim(i.name, i.id);
    for (const a of i.aliases) claim(a, i.id);
  }
  const fromFiles = new Set(owners.keys());
  const index = buildIngredientIndex(ingredients);
  const learned: { alias: string; id: string }[] = [];
  for (const d of dishes) {
    for (const line of d.ingredients) {
      const { english, aliases } = splitName(line.name);
      // Only a direct English-name hit is trusted enough to teach new aliases.
      const id = index.byKey.get(slugify(english));
      if (!id) continue;
      for (const a of aliases) {
        const key = slugify(a);
        if (!key || fromFiles.has(key) || !looksLikeName(a)) continue;
        if (!owners.has(key)) learned.push({ alias: key, id });
        claim(a, id);
      }
    }
  }
  const aliases: AliasMap = {};
  const ambiguous: string[] = [];
  for (const [key, ids] of [...owners.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (ids.size === 1) aliases[key] = [...ids][0];
    else ambiguous.push(`${key} (${[...ids].sort().join(', ')})`);
  }
  const unique = learned.filter((l) => aliases[l.alias] === l.id);
  return { aliases, learned: unique, ambiguous };
}

/** An IngredientIndex that also knows the learned aliases. */
export function indexWithAliases(ingredients: Pick<Ingredient, 'id' | 'name' | 'aliases'>[], aliases: AliasMap): IngredientIndex {
  const index = buildIngredientIndex(ingredients);
  for (const [key, id] of Object.entries(aliases)) if (!index.byKey.has(key)) index.byKey.set(key, id);
  return index;
}

export type LinkStats = { lines: number; linked: number; priced: number; unmatched: { dishId: string; name: string }[] };

export function linkStats(dishes: Pick<Dish, 'id' | 'ingredients'>[], ingredients: Pick<Ingredient, 'id' | 'price'>[]): LinkStats {
  const priced = new Set(ingredients.filter((i) => i.price?.currentEstimate).map((i) => i.id));
  const stats: LinkStats = { lines: 0, linked: 0, priced: 0, unmatched: [] };
  for (const d of dishes) {
    for (const line of d.ingredients) {
      stats.lines++;
      if (line.ingredientId) {
        stats.linked++;
        if (priced.has(line.ingredientId)) stats.priced++;
      } else if (!/^water\b/i.test(line.name) && !(line.quantity == null && /^[A-Za-z]+$/.test(line.name.trim()))) {
        // Water isn't bought, and one-word rows with no quantity ("Marinade", "Dough") are table sub-headings.
        stats.unmatched.push({ dishId: d.id, name: line.name });
      }
    }
  }
  return stats;
}

// ---------------------------------------------------------------- F3 micronutrients

/** Nutrient-stream ids for the fields of the ingredient profile (SPEC-ADDENDA §2). */
export const PROFILE_TO_NUTRIENT: Partial<Record<keyof Omit<NutrientPer100, 'basis'>, { id: string; unit: string }>> = {
  ironMg: { id: 'iron', unit: 'mg' },
  calciumMg: { id: 'calcium', unit: 'mg' },
  potassiumMg: { id: 'potassium', unit: 'mg' },
  magnesiumMg: { id: 'magnesium', unit: 'mg' },
  zincMg: { id: 'zinc', unit: 'mg' },
  sodiumMg: { id: 'sodium', unit: 'mg' },
  vitaminCMg: { id: 'vitamin-c', unit: 'mg' },
  vitaminAUgRae: { id: 'vitamin-a', unit: 'µg' },
  folateUgDfe: { id: 'folate', unit: 'µg' },
  cholesterolMg: { id: 'cholesterol', unit: 'mg' },
  phosphorusMg: { id: 'phosphorus', unit: 'mg' },
  seleniumUg: { id: 'selenium', unit: 'µg' },
  copperMg: { id: 'copper', unit: 'mg' },
  manganeseMg: { id: 'manganese', unit: 'mg' },
  iodineUg: { id: 'iodine', unit: 'µg' },
  vitaminDUg: { id: 'vitamin-d', unit: 'µg' },
  vitaminEMg: { id: 'vitamin-e', unit: 'mg' },
  vitaminKUg: { id: 'vitamin-k', unit: 'µg' },
  thiaminMg: { id: 'thiamine', unit: 'mg' },
  riboflavinMg: { id: 'riboflavin', unit: 'mg' },
  niacinMg: { id: 'niacin', unit: 'mg' },
  vitaminB6Mg: { id: 'vitamin-b6', unit: 'mg' },
  vitaminB12Ug: { id: 'vitamin-b12', unit: 'µg' },
};

export type MicroCell = { per100: number; unit: string; source: string };
/** ingredientId → nutrientId → value per 100 g (or 100 ml). */
export type MicroTable = Record<string, Record<string, MicroCell>>;

/** The minimum a nutrient topic needs to give for cross-linking. */
export type NutrientSourceInput = {
  id: string;
  unit: string;
  topFoodSources: { food: string; per100g: number | null }[];
};

/**
 * Builds the ingredient micronutrient table. The ingredient research profile
 * (IFCT / USDA, per ingredient) wins; a nutrient topic's food-source table
 * fills a gap only when its food name resolves to an ingredient id.
 */
export function buildMicroTable(ingredients: Pick<Ingredient, 'id' | 'nutritionPer100g'>[], nutrients: NutrientSourceInput[], index: IngredientIndex): { table: MicroTable; fromNutrientStream: number; unmatchedFoods: string[] } {
  const table: MicroTable = {};
  for (const ing of ingredients) {
    const p = ing.nutritionPer100g;
    if (!p) continue;
    for (const [field, target] of Object.entries(PROFILE_TO_NUTRIENT) as [keyof Omit<NutrientPer100, 'basis'>, { id: string; unit: string }][]) {
      const sv = p[field];
      if (sv?.value == null) continue;
      (table[ing.id] ??= {})[target.id] = { per100: sv.value, unit: target.unit, source: `ingredient research (${sv.source ?? 'source not given'})` };
    }
  }
  let fromNutrientStream = 0;
  const unmatchedFoods = new Set<string>();
  for (const n of nutrients) {
    for (const f of n.topFoodSources) {
      if (f.per100g == null) continue;
      const id = linkIngredient(f.food, index);
      if (!id) {
        unmatchedFoods.add(f.food);
        continue;
      }
      const row = (table[id] ??= {});
      if (row[n.id]) continue;
      row[n.id] = { per100: f.per100g, unit: n.unit, source: `nutrient research (${n.id} food sources)` };
      fromNutrientStream++;
    }
  }
  return { table, fromNutrientStream, unmatchedFoods: [...unmatchedFoods].sort() };
}

const GRAMS: Record<string, number> = { g: 1, kg: 1000, ml: 1, l: 1000 };

/**
 * Estimated micronutrients per serving from ingredient quantities. Only lines
 * measured in g / kg / ml / l count (household units need Day 8's converter
 * and research densities). Coverage is the share of that measured weight
 * whose ingredient has any micronutrient data; under 100% it's a partial estimate.
 */
export function dishMicros(dish: Pick<Dish, 'ingredients'>, table: MicroTable): Dish['microNutrientsEstimate'] {
  let measured = 0;
  let covered = 0;
  const values: Record<string, number> = {};
  for (const line of dish.ingredients) {
    const factor = line.unit ? GRAMS[line.unit] : undefined;
    if (line.quantity == null || factor == null) continue;
    const grams = line.quantity * factor;
    measured += grams;
    const row = line.ingredientId ? table[line.ingredientId] : undefined;
    if (!row || Object.keys(row).length === 0) continue;
    covered += grams;
    for (const [nid, cell] of Object.entries(row)) values[nid] = (values[nid] ?? 0) + (cell.per100 * grams) / 100;
  }
  if (measured === 0 || covered === 0) return null;
  const rounded: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(values).sort(([a], [b]) => a.localeCompare(b))) rounded[k] = Math.round(v * 10) / 10;
  const coveragePct = Math.round((covered / measured) * 100);
  return { values: rounded, coveragePct, basis: coveragePct < 100 ? 'partial estimate from ingredient quantities' : 'estimate from ingredient quantities' };
}

/** Energy from the same table route, to compare with the dish file's own kcal (SPEC-ADDENDA §2: flag > 25%). */
export function dishKcalFromIngredients(dish: Pick<Dish, 'ingredients'>, ingredients: Map<string, Pick<Ingredient, 'nutritionPer100g'>>): { kcal: number; coveragePct: number } | null {
  let measured = 0;
  let covered = 0;
  let kcal = 0;
  for (const line of dish.ingredients) {
    const factor = line.unit ? GRAMS[line.unit] : undefined;
    if (line.quantity == null || factor == null) continue;
    const grams = line.quantity * factor;
    measured += grams;
    const e = line.ingredientId ? ingredients.get(line.ingredientId)?.nutritionPer100g?.energyKcal.value : null;
    if (e == null) continue;
    covered += grams;
    kcal += (e * grams) / 100;
  }
  if (covered === 0) return null;
  return { kcal: Math.round(kcal), coveragePct: Math.round((covered / measured) * 100) };
}

// ---------------------------------------------------------------- F4–F7 link tables

export type GoodSourceInput = { id: string; goodSourceDishes: { dishNumber: number; dishName: string }[] };

/** nutrientId → dishes research names as good sources; inApp tells which are bundled yet. */
export function goodSourceLinks(nutrients: GoodSourceInput[], dishes: Pick<Dish, 'id' | 'number'>[]) {
  const byNumber = new Map(dishes.map((d) => [d.number, d.id]));
  const byNutrient: Record<string, { dishNumber: number; dishName: string; dishId: string | null }[]> = {};
  const byDish: Record<string, string[]> = {};
  for (const n of nutrients) {
    byNutrient[n.id] = n.goodSourceDishes.map((g) => ({ ...g, dishId: byNumber.get(g.dishNumber) ?? null }));
    for (const g of byNutrient[n.id]) if (g.dishId) (byDish[g.dishId] ??= []).push(n.id);
  }
  for (const k of Object.keys(byDish)) byDish[k].sort();
  return { byNutrient, byDish };
}

export type UsedInMismatch = { ingredientId: string; dishNumber: number; ingredientFile: string; dishTable: string };

/**
 * F7: compares an ingredient file's "Used in" quantity with the dish's own
 * table. Both in g/ml and more than 15% apart (the recipe-change threshold) → listed.
 */
export function usedInMismatches(ingredients: Pick<Ingredient, 'id' | 'usedIn'>[], dishes: Pick<Dish, 'number' | 'ingredients'>[]): UsedInMismatch[] {
  const byNumber = new Map(dishes.map((d) => [d.number, d]));
  const out: UsedInMismatch[] = [];
  for (const ing of ingredients) {
    for (const u of ing.usedIn) {
      const dish = byNumber.get(u.dishNumber);
      if (!dish || u.quantity == null || !u.unit) continue;
      const line = dish.ingredients.find((l) => l.ingredientId === ing.id);
      if (!line || line.quantity == null || !line.unit) continue;
      const a = u.quantity * (GRAMS[u.unit] ?? NaN);
      const b = line.quantity * (GRAMS[line.unit] ?? NaN);
      if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) continue;
      if (Math.abs(a - b) / b > 0.15) out.push({ ingredientId: ing.id, dishNumber: u.dishNumber, ingredientFile: `${u.quantity} ${u.unit}`, dishTable: `${line.quantity} ${line.unit}` });
    }
  }
  return out;
}
