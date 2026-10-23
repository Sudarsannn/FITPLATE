import { describe, expect, it } from '@jest/globals';

import { getIngredient, researchDishes } from '../../data/research';
import type { DishIngredient, Ingredient, PriceEstimate } from '../../models/research';
import {
  dishCostToMake,
  inPriceUnits,
  lineCost,
  makeTrend,
  rangeLabel,
  rupees,
  rupeesPer10gProtein,
  savingVsOrder,
  toBase,
} from '../../services/costToMake';
import { BALANCE_HIDE_LABEL, BALANCE_LABEL } from '../../services/dishDetail';
import { DISH_SORTS, headlineOrderPrice, makeCost } from '../../services/dishLibrary';

const price = (min: number, max: number, extra: Partial<PriceEstimate> = {}): PriceEstimate => ({
  priceHistory: [],
  currentEstimate: { min, max, avg: (min + max) / 2 },
  method: 'single',
  trend: 'unknown',
  change30dPct: null,
  lastObserved: '2026-10-04',
  stale: false,
  seasonal: false,
  confirmed: true,
  ...extra,
});
type Priced = Pick<Ingredient, 'id' | 'standardUnit' | 'price'>;
const ing = (id: string, unit: string, p: PriceEstimate | null): Priced => ({ id, standardUnit: unit, price: p });
const line = (name: string, ingredientId: string | null, quantity: number | null, unit: string | null, householdMeasure: string | null = null): DishIngredient => ({
  name,
  ingredientId,
  quantity,
  unit,
  householdMeasure,
});

const DB: Record<string, Priced> = {
  rice: ing('rice', 'kg', price(90, 120)),
  oil: ing('oil', 'l', price(175, 195)),
  ghee: ing('ghee', 'l', price(600, 700)),
  egg: ing('egg', 'dozen', price(84, 96)),
  pav: ing('pav', 'piece', price(5, 6)),
  chilli: ing('chilli', 'kg', price(80, 120)),
  saffron: ing('saffron', 'g', price(300, 400)),
  unpriced: ing('unpriced', 'kg', null),
};
const find = (id: string) => DB[id];

describe('unit conversion', () => {
  it('reads every spec unit into grams, ml or pieces', () => {
    expect(toBase(1, 'kg')).toEqual({ kind: 'mass', amount: 1000 });
    expect(toBase(250, 'g')).toEqual({ kind: 'mass', amount: 250 });
    expect(toBase(1, 'l')).toEqual({ kind: 'volume', amount: 1000 });
    expect(toBase(2, 'tsp')).toEqual({ kind: 'volume', amount: 10 });
    expect(toBase(1, 'tbsp')).toEqual({ kind: 'volume', amount: 15 });
    expect(toBase(0.5, 'cup')).toEqual({ kind: 'volume', amount: 120 });
    expect(toBase(3, 'pieces')).toEqual({ kind: 'count', amount: 3 });
    expect(toBase(3, null)).toEqual({ kind: 'count', amount: 3 });
    expect(toBase(1, 'handful')).toBeNull();
    expect(toBase(null, 'g')).toBeNull();
  });

  it('converts to the price unit, and marks weight ↔ volume as an estimate', () => {
    expect(inPriceUnits({ kind: 'mass', amount: 180 }, 'kg')).toEqual({ units: 0.18, estimated: false });
    expect(inPriceUnits({ kind: 'count', amount: 3 }, 'dozen')).toEqual({ units: 0.25, estimated: false });
    expect(inPriceUnits({ kind: 'mass', amount: 10 }, 'l')).toEqual({ units: 0.01, estimated: true });
    expect(inPriceUnits({ kind: 'volume', amount: 15 }, 'kg')).toEqual({ units: 0.015, estimated: true });
    // Pieces ↔ weight needs a piece weight research hasn't given.
    expect(inPriceUnits({ kind: 'count', amount: 2 }, 'kg')).toBeNull();
    expect(inPriceUnits({ kind: 'mass', amount: 70 }, 'piece')).toBeNull();
    expect(inPriceUnits({ kind: 'mass', amount: 70 }, null)).toBeNull();
  });
});

describe('line cost', () => {
  it('prices a matched ingredient as a range', () => {
    const c = lineCost(line('Basmati rice', 'rice', 100, 'g'), DB.rice);
    expect(c).toMatchObject({ status: 'priced', min: 9, max: 12, avg: 10.5, note: null, confirmed: true });
  });

  it('marks an unmatched or unpriced ingredient "price coming soon"', () => {
    expect(lineCost(line('Soy sauce', null, 10, 'ml'), undefined)).toMatchObject({ status: 'coming-soon', note: 'price coming soon', avg: null });
    expect(lineCost(line('Thing', 'unpriced', 10, 'g'), DB.unpriced)?.status).toBe('coming-soon');
    expect(lineCost(line('Green chilli', 'chilli', 1, null, '1 piece'), DB.chilli)?.status).toBe('coming-soon');
  });

  it('labels a weight-for-volume line (est.)', () => {
    const c = lineCost(line('Ghee', 'ghee', 10, 'g'), DB.ghee);
    expect(c?.status).toBe('estimated');
    expect(c?.note).toMatch(/^\(est\.\)/);
    expect(c?.avg).toBeCloseTo(6.5);
  });

  it('treats water as free, a pinch as too little to count, and bare headings as nothing', () => {
    expect(lineCost(line('Water, for soaking', null, 200, 'ml'), undefined)).toMatchObject({ status: 'free', note: 'no cost' });
    expect(lineCost(line('Asafoetida (hing)', 'chilli', null, null, 'a pinch'), DB.chilli)?.status).toBe('pinch');
    expect(lineCost(line('Marinade', null, null, null), undefined)).toBeNull();
  });

  it('carries an unconfirmed ingredient price through as unconfirmed', () => {
    const shaky = ing('shaky', 'kg', price(10, 20, { confirmed: false }));
    expect(lineCost(line('Shaky', 'shaky', 100, 'g'), shaky)?.confirmed).toBe(false);
  });
});

describe('dish cost to make', () => {
  const full = {
    ingredients: [
      line('Basmati rice', 'rice', 100, 'g'),
      line('Sunflower oil', 'oil', 10, 'ml'),
      line('Egg (anda)', 'egg', 3, null, '3 eggs'),
      line('Pav', 'pav', 2, null, '2 pav'),
      line('Water', null, 250, 'ml'),
      line('For the tadka', null, null, null),
    ],
  };

  it('sums a per-serving range and knows when it is complete', () => {
    const c = dishCostToMake(full, find);
    // rice 9–12, oil 1.75–1.95, eggs 21–24, pav 10–12
    expect(c).toMatchObject({ min: 42, max: 50, avg: 46, pricedLines: 4, countedLines: 4, complete: true, estimated: false, unconfirmed: 0, missing: [] });
    expect(c?.lines).toHaveLength(5);
    expect(rangeLabel(c!)).toBe('₹42–50');
  });

  it('is partial when an ingredient has no price, and lists it', () => {
    const c = dishCostToMake({ ingredients: [...full.ingredients, line('Soy sauce', null, 10, 'ml')] }, find);
    expect(c?.complete).toBe(false);
    expect(c?.missing).toEqual(['Soy sauce']);
    expect(c?.countedLines).toBe(5);
  });

  it('returns null when nothing can be priced', () => {
    expect(dishCostToMake({ ingredients: [line('Soy sauce', null, 10, 'ml')] }, find)).toBeNull();
    expect(dishCostToMake({ ingredients: [] }, find)).toBeNull();
  });

  it('gives a make-cost trend only when most of the cost has a known trend', () => {
    const rising = ing('r', 'kg', price(100, 100, { trend: 'rising', change30dPct: 12 }));
    const flat = ing('f', 'kg', price(100, 100, { trend: 'stable', change30dPct: 1 }));
    const unknown = ing('u', 'kg', price(100, 100));
    expect(makeTrend([{ avg: 30, ingredient: rising }, { avg: 10, ingredient: flat }])).toEqual({ trend: 'rising', change30dPct: 9.3 });
    expect(makeTrend([{ avg: 10, ingredient: rising }, { avg: 30, ingredient: unknown }])).toBeNull();
    expect(makeTrend([{ avg: 10, ingredient: flat }])).toEqual({ trend: 'stable', change30dPct: 1 });
    expect(makeTrend([])).toBeNull();
  });
});

describe('saving versus ordering', () => {
  const c = dishCostToMake({ ingredients: [line('Rice', 'rice', 400, 'g')] }, find)!;

  it('gives ₹ and % only for a complete cost and a confirmed order price', () => {
    expect(savingVsOrder(c, { avg: 120 })).toEqual({ rupees: 78, pct: 65 });
    expect(savingVsOrder(c, { avg: 30 })).toEqual({ rupees: -12, pct: -40 });
    expect(savingVsOrder(c, null)).toBeNull();
    expect(savingVsOrder({ ...c, complete: false }, { avg: 120 })).toBeNull();
    expect(savingVsOrder(null, { avg: 120 })).toBeNull();
  });

  it('works out ₹ per 10 g protein for complete costs only', () => {
    expect(rupeesPer10gProtein(c, 12)).toBe(35);
    expect(rupeesPer10gProtein({ ...c, complete: false }, 12)).toBeNull();
    expect(rupeesPer10gProtein(c, null)).toBeNull();
    expect(rupeesPer10gProtein(c, 0.5)).toBeNull();
  });

  it('formats small line costs', () => {
    expect(rupees(0.4)).toBe('under ₹1');
    expect(rupees(12.6)).toBe('₹13');
    expect(rupees(null)).toBe('');
  });
});

describe('bundled dishes (Day 8 done-when)', () => {
  it('costs every dish without throwing, and shows cost and saving for fully priced dishes', () => {
    let complete = 0;
    let withSaving = 0;
    for (const d of researchDishes) {
      const c = dishCostToMake(d, getIngredient);
      if (!c) continue;
      expect(c.min).toBeLessThanOrEqual(c.avg);
      expect(c.avg).toBeLessThanOrEqual(c.max);
      if (c.complete) complete += 1;
      if (savingVsOrder(c, headlineOrderPrice(d))) withSaving += 1;
    }
    expect(complete).toBeGreaterThan(0);
    expect(withSaving).toBeGreaterThan(0);
  });

  it('sorts by cheapest to cook with partial costs last', () => {
    const sort = DISH_SORTS.find((s) => s.id === 'make-cost')!;
    const partial = researchDishes.find((d) => makeCost(d) && !makeCost(d)!.complete)!;
    expect(sort.value(partial)).toBeNull();
    expect(DISH_SORTS.some((s) => s.id === 'most-saved')).toBe(true);
    expect(DISH_SORTS.some((s) => s.id === 'protein-per-rupee')).toBe(true);
  });

  it('innovation: sorts by kcal saved vs the restaurant, only where the restaurant published calories', () => {
    const sort = DISH_SORTS.find((s) => s.id === 'kcal-saved')!;
    const withGap = researchDishes.filter((d) => sort.value(d) != null);
    expect(withGap.length).toBeGreaterThan(0);
    for (const d of withGap) expect(d.asOrdered?.nutrition?.calories.value).toBeGreaterThan(d.nutritionPerServing.kcal ?? Infinity);
  });
});

describe('review 2026-10-21 FIX 2', () => {
  it('keeps the opt-in balance button neutral', () => {
    expect(BALANCE_LABEL).not.toMatch(/burn/i);
    expect(BALANCE_HIDE_LABEL).not.toMatch(/burn/i);
  });
});
