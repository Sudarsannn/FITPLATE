import { describe, expect, it } from '@jest/globals';

import { getDish, researchDishes, researchNutrients } from '../data/research';
import { dayMicros } from '../services/dayNutrition';
import { doseUnits, limitStatus, supplementTotals, toMainUnit } from '../services/supplements';

const nut = (id: string) => researchNutrients.find((n) => n.id === id)!;

describe('unit conversion (researched factors only)', () => {
  it('converts vitamin D IU to micrograms with the research factor (400 IU = 10 µg)', () => {
    expect(toMainUnit(nut('vitamin-d'), 400, 'IU')).toBeCloseTo(10, 6);
    expect(toMainUnit(nut('vitamin-d'), 10, 'µg')).toBe(10);
    expect(toMainUnit(nut('vitamin-d'), 10, 'mcg')).toBe(10);
  });
  it('refuses a unit with no researched factor', () => {
    expect(toMainUnit(nut('vitamin-d'), 5, 'cups')).toBeNull();
    expect(toMainUnit(nut('vitamin-d'), -1, 'µg')).toBeNull();
  });
  it('offers the main unit first, then researched alternatives', () => {
    expect(doseUnits(nut('vitamin-d'))[0]).toBe('µg');
    expect(doseUnits(nut('vitamin-d'))).toContain('IU');
  });
  it('sums doses per nutrient and reports what it could not convert', () => {
    const r = supplementTotals(
      [
        { nutrientId: 'vitamin-d', amount: 400, unit: 'IU' },
        { nutrientId: 'vitamin-d', amount: 5, unit: 'µg' },
        { nutrientId: 'vitamin-d', amount: 1, unit: 'spoon' },
      ],
      researchNutrients,
    );
    expect(r.totals['vitamin-d']).toBeCloseTo(15, 6);
    expect(r.skipped).toHaveLength(1);
  });
});

describe('upper limits', () => {
  it('compares food plus supplements for a food-and-supplement limit (vitamin D 100 µg)', () => {
    expect(limitStatus(nut('vitamin-d'), 8, 25)).toMatchObject({ level: 'ok', limit: 100, basis: 'food+supplements' });
    expect(limitStatus(nut('vitamin-d'), 60, 50).level).toBe('over');
    expect(limitStatus(nut('vitamin-d'), 40, 45).level).toBe('near');
  });
  it('compares the supplement alone for a supplements-only limit (niacin 35 mg)', () => {
    expect(limitStatus(nut('niacin'), 500, 30)).toMatchObject({ level: 'near', basis: 'supplements' });
    expect(limitStatus(nut('niacin'), 500, 40).level).toBe('over');
  });
  it('warns about nothing without a supplement, and never invents a limit', () => {
    expect(limitStatus(nut('vitamin-d'), 150, 0).level).toBe('ok');
    expect(limitStatus(nut('thiamine'), 1, 500)).toMatchObject({ level: 'none', limit: null });
  });
});

describe('a sample day', () => {
  const dish = researchDishes.find((d) => (d.microNutrientsEstimate?.values?.['vitamin-c'] ?? 0) > 0)!;
  const meals = [{ dishId: dish.id, kcal: 400, protein: 15, fibre: 5 }];
  const food = dish.microNutrientsEstimate!.values['vitamin-c'] as number;
  const target = nut('vitamin-c').appDefaultTarget.adult_male as number;
  it('shows food alone as amount / target', () => {
    const bar = dayMicros(meals, getDish, researchNutrients, 'adult_male').find((b) => b.id === 'vitamin-c')!;
    expect(bar.amount).toBeCloseTo(food, 6);
    expect(bar.fraction).toBeCloseTo(food / target, 6);
    expect(bar.fromSupplements).toBe(0);
  });
  it('adds a supplement on top and keeps it separate', () => {
    const bar = dayMicros(meals, getDish, researchNutrients, 'adult_male', { supplements: { 'vitamin-c': 100 } }).find((b) => b.id === 'vitamin-c')!;
    expect(bar.amount).toBeCloseTo(food + 100, 6);
    expect(bar.fraction).toBeCloseTo((food + 100) / target, 6);
    expect(bar.fromSupplements).toBe(100);
  });
  it('uses a personal target when given, and none when the id maps to null', () => {
    const personal = dayMicros(meals, getDish, researchNutrients, 'adult_male', { targets: { 'vitamin-c': 200 } }).find((b) => b.id === 'vitamin-c')!;
    expect(personal.fraction).toBeCloseTo(food / 200, 6);
    const none = dayMicros(meals, getDish, researchNutrients, 'adult_male', { targets: { 'vitamin-c': null } }).find((b) => b.id === 'vitamin-c')!;
    expect(none.fraction).toBeNull();
  });
});
