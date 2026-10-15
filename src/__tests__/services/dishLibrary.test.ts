import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../../data/research';
import type { Dish } from '../../models/research';
import { byNumber, cardChips, dishDoc, dishFilterGroups, DISH_SORTS, headlineOrderPrice, orderPriceNote, totalMinutes } from '../../services/dishLibrary';
import { runSearch, type Selection } from '../../services/search';

const groups = dishFilterGroups(researchDishes);
const search = (query: string, selection: Selection = {}, sortId?: string) =>
  runSearch(researchDishes, {
    toDoc: dishDoc,
    query,
    groups,
    selection,
    sort: DISH_SORTS.find((s) => s.id === sortId) ?? 'relevance',
    tieBreak: byNumber,
  }).map((r) => r.item);

describe('dish library on the bundled research dishes', () => {
  it('lists every dish with no query and no filters', () => {
    expect(search('')).toHaveLength(researchDishes.length);
    expect(researchDishes.length).toBeGreaterThanOrEqual(20);
  });

  it('finds dishes by name, misspelling, Indian ingredient name and tag', () => {
    expect(search('biryani')[0].name).toMatch(/Biryani/);
    expect(search('brhiyani').some((d) => /Biryani/.test(d.name))).toBe(true);
    expect(search('poha')[0].id).toBe('001-poha');
    expect(search('palak').some((d) => d.id === '017-palak-paneer')).toBe(true);
    expect(search('jeera').some((d) => d.id === '019-jeera-rice')).toBe(true);
    expect(search('xyzzy')).toEqual([]);
  });

  it('builds filter groups from the data and every chip matches at least one dish', () => {
    const ids = groups.map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['diet', 'allergen', 'meal', 'time', 'level', 'nutrition', 'kcal', 'cuisine']));
    for (const g of groups.filter((x) => x.id !== 'diet')) {
      for (const o of g.options) expect(researchDishes.some(o.test)).toBe(true);
    }
  });

  it('filters veg + breakfast and leaves out peanut dishes', () => {
    const r = search('', { diet: ['veg'], meal: ['breakfast'], allergen: ['peanut'] });
    expect(r.length).toBeGreaterThan(0);
    for (const d of r) {
      expect(d.dietType).toBe('veg');
      expect(d.mealType).toContain('breakfast');
      expect(d.allergens).not.toContain('peanut');
    }
  });

  it('time chips include faster dishes too', () => {
    for (const d of search('', { time: ['under-30'] })) expect(totalMinutes(d)!).toBeLessThanOrEqual(30);
    expect(search('', { time: ['under-60'] }).length).toBeGreaterThanOrEqual(search('', { time: ['under-30'] }).length);
  });

  it('sorts quickest first and highest protein first, missing values last', () => {
    const q = search('', {}, 'quickest');
    for (let i = 1; i < q.length; i++) {
      const a = totalMinutes(q[i - 1]);
      const b = totalMinutes(q[i]);
      if (a != null && b != null) expect(a).toBeLessThanOrEqual(b);
    }
    const p = search('', {}, 'highest-protein').map((d) => d.nutritionPerServing.proteinG ?? -1);
    expect(p[0]).toBe(Math.max(...p));
  });

  it('shows diet chips before allergens, three at most', () => {
    const poha = researchDishes.find((d) => d.id === '001-poha')!;
    expect(cardChips(poha)).toEqual(['Veg', 'Contains peanut', 'Contains mustard']);
  });
});

describe('order price headline', () => {
  const base = researchDishes[0];
  const withPrice = (over: Partial<NonNullable<Dish['orderPrice']>>): Dish => ({ ...base, orderPrice: { ...base.orderPrice!, ...over } });

  it('shows the average and range of a confirmed price, never the top as headline', () => {
    const d = withPrice({ currentEstimate: { min: 120, max: 150, avg: 130 }, confirmed: true, listingCount: 6 } as never);
    expect(headlineOrderPrice(d)).toMatchObject({ avg: 130, min: 120, max: 150 });
    expect(orderPriceNote(d)).toBeNull();
  });

  it('hides an unconfirmed price and says why', () => {
    const d = withPrice({ confirmed: false, checkNotes: ['the average is outside the range'] } as never);
    expect(headlineOrderPrice(d)).toBeNull();
    expect(orderPriceNote(d)).toMatch(/average is outside/);
  });

  it('notes thin evidence under 5 listings', () => {
    const d = withPrice({ confirmed: true, listingCount: 3 } as never);
    expect(orderPriceNote(d)).toBe('Based on 3 listings.');
  });
});
