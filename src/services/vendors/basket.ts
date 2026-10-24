import type { Dish, Ingredient } from '../../models/research';
import type { ShoppingItem, ShoppingList } from '../../models/prefs';
import type { VendorProduct } from './types';

/**
 * Priority plan P3a: the consolidated ingredient checklist. Pure functions,
 * so the screen and the tests share them.
 */

/** Grams (or ml) in one unit, for the units recipes use; null when it can't be known. */
const UNIT_GRAMS: Record<string, number> = { g: 1, gm: 1, gram: 1, grams: 1, kg: 1000, ml: 1, l: 1000, litre: 1000, liter: 1000, tsp: 5, tbsp: 15, cup: 240 };

export function toGrams(quantity: number | null, unit: string | null): number | null {
  if (quantity == null || !unit) return null;
  const g = UNIT_GRAMS[unit.trim().toLowerCase()];
  return g ? quantity * g : null;
}

export const normaliseName = (s: string) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Stable key for an ingredient: its research id, else its normalised name. */
export const ingredientKey = (ingredientId: string | null, name: string) => ingredientId ?? `name:${normaliseName(name)}`;

/** Units folded into one base so "1 kg" and "200 g" add up; spoons stay apart (a spoon of spice isn't 5 g). */
const BASE_UNIT: Record<string, { unit: string; factor: number }> = {
  g: { unit: 'g', factor: 1 },
  gm: { unit: 'g', factor: 1 },
  gram: { unit: 'g', factor: 1 },
  grams: { unit: 'g', factor: 1 },
  kg: { unit: 'g', factor: 1000 },
  ml: { unit: 'ml', factor: 1 },
  l: { unit: 'ml', factor: 1000 },
  litre: { unit: 'ml', factor: 1000 },
  liter: { unit: 'ml', factor: 1000 },
  cup: { unit: 'ml', factor: 240 },
};

export function baseAmount(quantity: number, unit: string | null): { quantity: number; unit: string | null } {
  const u = unit?.trim().toLowerCase() ?? null;
  const b = u ? BASE_UNIT[u] : undefined;
  return b ? { quantity: quantity * b.factor, unit: b.unit } : { quantity, unit: u };
}

/** "1500 g" → "1.5 kg", "750 ml" → "750 ml", "2 small" → "2 small", null unit → "2". */
export function amountLabel(quantity: number, unit: string | null): string {
  if (unit === 'g' && quantity >= 1000) return `${round(quantity / 1000)} kg`;
  if (unit === 'ml' && quantity >= 1000) return `${round(quantity / 1000)} l`;
  return `${round(quantity)}${unit ? ` ${unit}` : ''}`;
}

/** One recipe amount, folded and labelled: 1200 g → "1.2 kg". */
export function recipeAmountLabel(quantity: number, unit: string | null): string {
  const a = baseAmount(quantity, unit);
  return amountLabel(a.quantity, a.unit);
}

/** Everything a list line needs: "1.2 kg + 2 small", or "as needed" when no dish gives an amount. */
export function itemAmountLabel(item: Pick<ShoppingItem, 'quantity' | 'unit' | 'more'>): string {
  const parts = [item.quantity != null ? amountLabel(item.quantity, item.unit) : null, ...(item.more ?? []).map((m) => amountLabel(m.quantity, m.unit))].filter(Boolean);
  return parts.length ? parts.join(' + ') : 'as needed';
}

/**
 * Union of the ingredients of the chosen dishes, scaled to servings (Day 9).
 * The same ingredient in two dishes becomes one line. Amounts add up after
 * folding units to a base (kg into g, l and cups into ml); amounts in units
 * that can't be added ("2 small" next to "150 g") are kept beside the main
 * one in `more`, never dropped. Lines with no amount ("to taste") add none.
 * Water and lines without a name are left out.
 */
export function buildShoppingItems(chosen: { dish: Pick<Dish, 'id' | 'ingredients'>; servings: number }[]): ShoppingItem[] {
  const byKey = new Map<string, { item: ShoppingItem; amounts: Map<string, number> }>();
  for (const { dish, servings } of chosen) {
    for (const ing of dish.ingredients) {
      if (!ing.name || /^water\b/i.test(ing.name.trim())) continue;
      const key = ingredientKey(ing.ingredientId, ing.name);
      let entry = byKey.get(key);
      if (!entry) {
        entry = { item: { key, ingredientId: ing.ingredientId, name: cleanName(ing.name), quantity: null, unit: null, dishIds: [], included: true, checked: false, variant: null }, amounts: new Map() };
        byKey.set(key, entry);
      }
      if (!entry.item.dishIds.includes(dish.id)) entry.item.dishIds.push(dish.id);
      if (ing.quantity == null) continue;
      const a = baseAmount(ing.quantity * servings, ing.unit);
      const u = a.unit ?? '';
      entry.amounts.set(u, (entry.amounts.get(u) ?? 0) + a.quantity);
    }
  }
  return [...byKey.values()].map(({ item, amounts }) => {
    // The unit seen first leads; insertion order keeps the recipe's own order.
    const [first, ...rest] = [...amounts.entries()].map(([unit, q]) => ({ quantity: round(q), unit: unit || null }));
    const out: ShoppingItem = { ...item, quantity: first?.quantity ?? null, unit: first?.unit ?? null };
    if (rest.length) out.more = rest;
    return out;
  });
}

const round = (n: number) => Math.round(n * 10) / 10;
const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim();

/** A new shopping list for these dishes. */
export function newShoppingList(chosen: { dish: Pick<Dish, 'id' | 'name' | 'ingredients'>; servings: number }[], brandChoice: Record<string, string> = {}): ShoppingList {
  const items = buildShoppingItems(chosen).map((i) => ({ ...i, variant: brandChoice[i.key] ?? null }));
  return {
    title: chosen.map((c) => c.dish.name).join(' + ') || 'Shopping list',
    dishIds: chosen.map((c) => c.dish.id),
    servings: Object.fromEntries(chosen.map((c) => [c.dish.id, c.servings])),
    items,
    status: 'open',
    boughtVia: null,
    orderedAt: null,
  };
}

/**
 * What a dish costs to make, from the researched ingredient prices
 * (per 100 g / 100 ml). Ingredients without a price or a weighable amount are
 * left out and counted in `coveragePct`.
 */
export function costToMake(dish: Pick<Dish, 'ingredients'>, servings: number, ingredients: Map<string, Pick<Ingredient, 'per100Estimate'>>): { inr: number; coveragePct: number } | null {
  let total = 0;
  let priced = 0;
  let counted = 0;
  for (const ing of dish.ingredients) {
    if (/^water\b/i.test(ing.name.trim())) continue;
    counted += 1;
    const grams = toGrams(ing.quantity, ing.unit);
    const per100 = ing.ingredientId ? ingredients.get(ing.ingredientId)?.per100Estimate?.avg : undefined;
    if (grams == null || per100 == null) continue;
    total += (grams / 100) * per100 * servings;
    priced += 1;
  }
  if (priced === 0) return null;
  return { inr: Math.max(1, Math.round(total)), coveragePct: Math.round((priced / counted) * 100) };
}

/** One brand / pack the user can pick under an ingredient. */
export type VariantOption = {
  /** FitPlate's own label, saved in settings.brandChoice: "Tata Sampann · 500 g". */
  label: string;
  brand: string;
  pack: string;
  priceInr: number | null;
  pricePer100: number | null;
  /** Where the option came from. */
  source: 'research' | 'demo' | 'vendor';
  links: { zepto: string | null; instamart: string | null; blinkit: string | null };
  /** Vendor SKU (live Instamart only; never stored). */
  skuId?: string;
  inStock?: boolean;
};

export const variantLabel = (brand: string, pack: string) => `${brand} · ${pack}`;

/** Grams in a pack label like "500 g", "1 kg", "1 l", "200ml". */
export function packGrams(pack: string | null): number | null {
  if (!pack) return null;
  const m = pack.toLowerCase().replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|ml|l|litre|liter)\b/);
  if (!m) return null;
  return toGrams(Number(m[1]), m[2]);
}

export const per100 = (price: number | null, grams: number | null) => (price != null && grams ? Math.round((price / grams) * 100 * 10) / 10 : null);

/** Index of the cheapest option per 100 g, or -1 when it can't be compared. */
export function cheapestPer100(options: Pick<VariantOption, 'pricePer100'>[]): number {
  let best = -1;
  options.forEach((o, i) => {
    if (o.pricePer100 == null) return;
    if (best === -1 || o.pricePer100 < (options[best].pricePer100 as number)) best = i;
  });
  return options.filter((o) => o.pricePer100 != null).length > 1 ? best : -1;
}

/**
 * Offline options for an ingredient: the researched "typical" option from the
 * price estimate (the demo's made-up brand prices were removed on 22 Oct 2026).
 * Research `links` (ingredient research PATCH: vendor product links) are used
 * when present; otherwise links are null and the app says so.
 */
export function offlineVariants(item: Pick<ShoppingItem, 'name' | 'ingredientId'>, ingredient: (Pick<Ingredient, 'per100Estimate' | 'standardUnit' | 'name'> & { links?: Partial<VariantOption['links']> }) | undefined): VariantOption[] {
  const out: VariantOption[] = [];
  const est = ingredient?.per100Estimate;
  if (est) {
    const unit = ingredient?.standardUnit === 'l' ? 'l' : 'kg';
    const pack = unit === 'l' ? '1 l' : '1 kg';
    if (!out.some((o) => o.pack === pack && o.brand === 'Typical (any brand)')) {
      out.push({
        label: variantLabel('Typical (any brand)', pack),
        brand: 'Typical (any brand)',
        pack,
        priceInr: Math.round(est.avg * 10),
        pricePer100: est.avg,
        source: 'research',
        links: { zepto: ingredient?.links?.zepto ?? null, instamart: ingredient?.links?.instamart ?? null, blinkit: ingredient?.links?.blinkit ?? null },
      });
    }
  }
  if (out.length === 0) out.push({ label: variantLabel('Any brand', 'as needed'), brand: 'Any brand', pack: 'as needed', priceInr: null, pricePer100: null, source: 'research', links: { zepto: null, instamart: null, blinkit: null } });
  return out;
}

/** The option to pre-select: the user's saved choice, else their usual vendor item, else the first. */
export function preselect(options: VariantOption[], saved: string | null | undefined, goTo: string[] = []): number {
  if (saved) {
    const i = options.findIndex((o) => o.label === saved);
    if (i >= 0) return i;
  }
  const usual = options.findIndex((o) => goTo.some((g) => normaliseName(g).includes(normaliseName(o.brand))));
  return usual >= 0 ? usual : 0;
}

/** Pick the product for a list item: the saved brand / pack, else the same brand, else the best value in stock. */
export function pickProduct(item: Pick<ShoppingItem, 'variant'>, products: VendorProduct[]): VendorProduct | null {
  const inStock = products.filter((p) => p.inStock);
  if (item.variant) {
    const [brand, pack] = item.variant.split(' · ');
    const exact = inStock.find((p) => normaliseName(p.brand ?? p.name) === normaliseName(brand) && (!pack || normaliseName(p.packSize ?? '') === normaliseName(pack)));
    if (exact) return exact;
    const sameBrand = inStock.find((p) => normaliseName(p.brand ?? p.name) === normaliseName(brand));
    if (sameBrand) return sameBrand;
  }
  const priced = inStock.filter((p) => p.pricePer100 != null).sort((a, b) => (a.pricePer100 as number) - (b.pricePer100 as number));
  return priced[0] ?? inStock[0] ?? products[0] ?? null;
}


/**
 * Day 9 "pantry staple" tag: dry, long-keeping goods most kitchens already
 * stock, read from the ingredient research's own category (spices, pulses,
 * grains, flours, oils, condiments, sweeteners, nuts). Never hidden, only
 * tagged so people check the shelf before buying.
 */
const PANTRY = /\b(spice|masala|pulse|lentil|dal|grain|rice|flour|oil|fat|condiment|sweetener|sugar|salt|nut|seed|packaged)\b/i;
export function isPantryStaple(ingredient: { category: string | null } | undefined, name: string): boolean {
  if (ingredient?.category) return PANTRY.test(ingredient.category);
  return /^(salt|sugar|oil|turmeric|chilli powder|red chilli powder|cumin|mustard seeds|garam masala|hing|asafoetida)\b/i.test(name.trim());
}

/** The list as plain text for WhatsApp or notes: ticked items marked, skipped ones left out. */
export function shoppingListText(list: Pick<ShoppingList, 'title' | 'items'>, opts: { estimateInr?: number | null } = {}): string {
  const lines = list.items.filter((i) => i.included).map((i) => `${i.checked ? '✓' : '☐'} ${i.name}: ${itemAmountLabel(i)}${i.variant ? ` (${i.variant})` : ''}`);
  const total = opts.estimateInr ? [``, `Estimated ingredients: about ₹${opts.estimateInr} (FitPlate research prices)`] : [];
  return [list.title, '', ...lines, ...total, '', 'Made with FitPlate'].join('\n');
}
