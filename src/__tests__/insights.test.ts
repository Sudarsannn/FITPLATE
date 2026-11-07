import { describe, expect, it } from '@jest/globals';

import { getDish, researchDishes, researchNutrients } from '../data/research';
import { suggestionsFor, weeklyCoverage } from '../services/insights';

const nut = (id: string) => researchNutrients.find((n) => n.id === id)!;
const withMicro = (id: string) => researchDishes.filter((d) => (d.microNutrientsEstimate?.values?.[id] ?? 0) > 0);
const meal = (dishId: string) => ({ dishId, kcal: 300, protein: 10, fibre: 3 });
const keys = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'];

describe('weeklyCoverage', () => {
  const dish = withMicro('vitamin-c')[0];
  it('says "not enough to tell" with no FitPlate dish in the week', () => {
    const r = weeklyCoverage({ d0: { meals: [{ kcal: 500, protein: 10, fibre: 2 }] } }, keys, getDish, researchNutrients, 'adult_male');
    expect(r).toEqual({ daysCounted: 0, rows: [], gaps: [] });
  });
  it('averages over counted days only and lists the lowest first', () => {
    const r = weeklyCoverage({ d0: { meals: [meal(dish.id)] }, d1: { meals: [meal(dish.id)] } }, keys, getDish, researchNutrients, 'adult_male');
    expect(r.daysCounted).toBe(2);
    const c = r.rows.find((x) => x.id === 'vitamin-c')!;
    expect(c.avg).toBeCloseTo(dish.microNutrientsEstimate!.values['vitamin-c'] as number, 6);
    expect(r.rows.map((x) => x.fraction)).toEqual([...r.rows.map((x) => x.fraction)].sort((a, b) => a - b));
    expect(r.rows.some((x) => x.id === 'sodium')).toBe(false);
    expect(r.gaps.length).toBeLessThanOrEqual(3);
  });
  it('puts higher-risk nutrients first among the gaps', () => {
    const w = weeklyCoverage({ d0: { meals: [meal(dish.id)] } }, keys, getDish, researchNutrients, 'adult_male');
    const w8 = (r: string | null) => (r === 'high' ? 0 : r === 'moderate' ? 1 : 2);
    expect(w.gaps.map((g) => w8(g.risk))).toEqual([...w.gaps.map((g) => w8(g.risk))].sort((a, b) => a - b));
  });
  it('counts supplements on the day they were taken', () => {
    const plain = weeklyCoverage({ d0: { meals: [meal(dish.id)] } }, keys, getDish, researchNutrients, 'adult_male');
    const boosted = weeklyCoverage({ d0: { meals: [meal(dish.id)] } }, keys, getDish, researchNutrients, 'adult_male', { supplementsByDay: { d0: { 'vitamin-c': 100 } } });
    expect(boosted.rows.find((x) => x.id === 'vitamin-c')!.avg).toBeCloseTo(plain.rows.find((x) => x.id === 'vitamin-c')!.avg + 100, 6);
  });
  it('the gaps change with what was eaten', () => {
    const [a, b] = [withMicro('iron')[0], withMicro('vitamin-c').find((d) => d.id !== withMicro('iron')[0].id) ?? withMicro('vitamin-c')[0]];
    const wa = weeklyCoverage({ d0: { meals: [meal(a.id)] } }, keys, getDish, researchNutrients, 'adult_male');
    const wb = weeklyCoverage({ d0: { meals: [meal(b.id)] } }, keys, getDish, researchNutrients, 'adult_male');
    if (a.id !== b.id) expect(wa.gaps.map((g) => g.id).join()).not.toBe(wb.gaps.map((g) => g.id).join());
  });
});

describe('suggestionsFor', () => {
  const iron = nut('iron');
  const target = iron.appDefaultTarget.adult_male as number;
  it('ranks dishes by their share of the target, only above 15%', () => {
    const s = suggestionsFor(iron, target, researchDishes);
    expect(s.dishes.length).toBeGreaterThan(0);
    for (const d of s.dishes) expect(d.shareOfTarget).toBeGreaterThanOrEqual(0.15);
    expect(s.dishes.map((d) => d.shareOfTarget)).toEqual([...s.dishes.map((d) => d.shareOfTarget)].sort((a, b) => b - a));
  });
  it('keeps to the diet filter and to vegetarian foods when asked', () => {
    const none = suggestionsFor(iron, target, researchDishes, { fits: () => false });
    expect(none.dishes).toEqual([]);
    const veg = suggestionsFor(iron, target, researchDishes, { vegOnly: true, max: 20 });
    expect(veg.foods.every((f) => !/liver|mutton|chicken|fish/i.test(f.food))).toBe(true);
  });
  it('carries the researched absorption notes and differs by nutrient', () => {
    const s = suggestionsFor(iron, target, researchDishes);
    expect(s.boosters.length).toBeGreaterThan(0);
    expect(s.blockers.length).toBeGreaterThan(0);
    const c = nut('vitamin-c');
    const sc = suggestionsFor(c, c.appDefaultTarget.adult_male as number, researchDishes);
    expect(sc.dishes.map((d) => d.dish.id).join()).not.toBe(s.dishes.map((d) => d.dish.id).join());
  });
});
