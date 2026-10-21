import { describe, expect, it } from '@jest/globals';

import { getDish, researchDishes, researchLinks } from '../../data/research';
import type { Dish } from '../../models/research';
import {
  burnWays,
  caloriesSaved,
  DEFAULT_WEIGHT_KG,
  durationLabel,
  hasPublishedOrdered,
  microRows,
  nutrientLabel,
  nutritionRows,
  quickFacts,
  researchUpdatesLine,
  shortDate,
  splitEquipment,
  splitSource,
  trendArrow,
} from '../../services/dishDetail';

const base = getDish('001-poha') as Dish;
const withOrdered = (calories: number | null, protein: number | null = null): Dish => ({
  ...base,
  asOrdered: {
    price: null,
    nutrition: {
      calories: { value: calories, source: calories != null ? 'Swiggy menu' : null },
      protein: { value: protein, source: protein != null ? 'Zomato menu' : null },
      carbs: { value: null, source: null },
      fat: { value: null, source: null },
      fibre: { value: null, source: null },
    },
    restaurantsSampled: 5,
    platforms: ['Swiggy'],
  },
});

describe('dish detail helpers', () => {
  it('maps price trends to arrows and leaves unknown blank', () => {
    expect(trendArrow('rising')?.arrow).toBe('↑');
    expect(trendArrow('falling')?.arrow).toBe('↓');
    expect(trendArrow('stable')?.arrow).toBe('→');
    expect(trendArrow('unknown')).toBeNull();
    expect(trendArrow(undefined)).toBeNull();
  });

  it('formats dates and the research-updates line', () => {
    expect(shortDate('2026-10-04')).toBe('4 Oct 2026');
    expect(shortDate(null)).toBeNull();
    const d = { versions: [{ date: '2026-10-10', file: 'b' }, { date: '2026-10-04', file: 'a' }] };
    expect(researchUpdatesLine(d)).toBe('Based on 2 research updates, last updated 10 Oct 2026.');
    expect(researchUpdatesLine({ versions: [{ date: '2026-10-04', file: 'a' }] })).toBe('Based on 1 research update, last updated 4 Oct 2026.');
    expect(researchUpdatesLine({ versions: [] })).toMatch(/coming soon/i);
  });

  it('shows "Coming soon" for missing quick facts', () => {
    const facts = quickFacts({ ...base, prepMin: null, cookMin: null, difficulty: null, cuisine: null });
    expect(facts.filter((f) => f.value === 'Coming soon').map((f) => f.label)).toEqual(['Prep', 'Cook', 'Total', 'Difficulty', 'Cuisine']);
    expect(quickFacts({ ...base, prepMin: 10, cookMin: 15 }).find((f) => f.label === 'Total')?.value).toBe('25 min');
  });

  it('keeps as-ordered beside as-cooked and never fills one from the other', () => {
    const rows = nutritionRows(withOrdered(650));
    expect(rows[0]).toMatchObject({ label: 'Calories', ordered: '650 kcal', orderedSource: 'Swiggy menu' });
    expect(rows[1].ordered).toBe('Not published');
    expect(rows[1].cooked).not.toBe('Not published');
    // No as-ordered research at all: the column is hidden, not "Not published".
    expect(nutritionRows({ ...base, asOrdered: null }).every((r) => r.ordered === null)).toBe(true);
    expect(hasPublishedOrdered(withOrdered(null))).toBe(false);
    expect(hasPublishedOrdered(withOrdered(650))).toBe(true);
  });

  it('counts calories saved only when both values exist and ordering is higher', () => {
    const cooked = base.nutritionPerServing.kcal as number;
    expect(caloriesSaved(withOrdered(cooked + 200))).toBe(200);
    expect(caloriesSaved(withOrdered(cooked - 50))).toBeNull();
    expect(caloriesSaved(withOrdered(null))).toBeNull();
    expect(caloriesSaved({ ...withOrdered(700), nutritionPerServing: { ...base.nutritionPerServing, kcal: null } })).toBeNull();
  });

  it('lists the partial micronutrient estimate with units', () => {
    const m = microRows({ ...base, microNutrientsEstimate: { values: { iron: 2.345, 'vitamin-a': 58.5, potassium: 824.2, zinc: null }, coveragePct: 41, basis: 'x' } });
    expect(m?.coveragePct).toBe(41);
    expect(m?.rows.map((r) => `${r.label}: ${r.value}`)).toEqual(['Iron: 2.3 mg', 'Potassium: 824 mg', 'Vitamin A: 58.5 µg']);
    expect(microRows({ ...base, microNutrientsEstimate: null })).toBeNull();
    expect(nutrientLabel('vitamin-b6')).toBe('Vitamin B6');
  });

  it('splits equipment notes and source links', () => {
    expect(splitEquipment('Kadai, about 20 cm (a wide pan works too)')).toEqual({ item: 'Kadai, about 20 cm', note: 'a wide pan works too' });
    expect(splitEquipment('Chopping board and knife')).toEqual({ item: 'Chopping board and knife', note: null });
    expect(splitSource('Ranveer Brar, Goan Fish Curry: https://ranveerbrar.com/recipes/goan-fish-curry/')).toEqual({
      label: 'Ranveer Brar, Goan Fish Curry',
      url: 'https://ranveerbrar.com/recipes/goan-fish-curry/',
    });
    expect(splitSource('IFCT 2017 table')).toEqual({ label: 'IFCT 2017 table', url: null });
  });

  it('works out burn-off minutes from MET and weight, quickest first, without light stretches', () => {
    const mets = [
      { exerciseId: 'treadmill', name: 'Treadmill', met: 4.8 },
      { exerciseId: 'bike', name: 'Bike', met: 5.8 },
      { exerciseId: 'stretch', name: 'Stretch', met: 2.3 },
    ];
    const ways = burnWays(420, null, mets);
    // 420 kcal ÷ (5.8 × 70) × 60 ≈ 62 min; treadmill ≈ 75 min.
    expect(ways).toEqual([
      { exerciseId: 'bike', name: 'Bike', minutes: 62 },
      { exerciseId: 'treadmill', name: 'Treadmill', minutes: 75 },
    ]);
    expect(burnWays(420, 2 * DEFAULT_WEIGHT_KG, mets)[0].minutes).toBe(31);
    expect(burnWays(null, 70, mets)).toEqual([]);
    expect(durationLabel(45)).toBe('45 min');
    expect(durationLabel(80)).toBe('1 h 20 min');
    expect(durationLabel(120)).toBe('2 h');
  });

  it('renders every bundled dish without throwing', () => {
    for (const d of researchDishes) {
      expect(nutritionRows(d)).toHaveLength(5);
      expect(quickFacts(d).length).toBeGreaterThan(0);
      expect(researchUpdatesLine(d)).toMatch(/research update/);
      microRows(d);
      burnWays(d.nutritionPerServing.kcal, null, researchLinks.met);
      d.sources.forEach(splitSource);
      d.equipment.forEach(splitEquipment);
    }
  });
});
