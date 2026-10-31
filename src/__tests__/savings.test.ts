import { describe, expect, it } from '@jest/globals';

import { mealSaving, savingsSummary } from '../services/savings';
import type { DayLog, MealLog } from '../lib/store';

const meal = (o: Partial<MealLog>): MealLog => ({ name: 'x', emoji: '', kcal: 400, protein: 10, fibre: 3, cooked: true, at: 0, how: 'cooked', ...o });
const day = (...meals: MealLog[]): DayLog => ({ meals, exercise: [], water: 0 });
const dishes: Record<string, { asOrdered: { nutrition: { calories: { value: number | null; source: null } } } | null }> = {
  biryani: { asOrdered: { nutrition: { calories: { value: 900, source: null } } } },
  noKcal: { asOrdered: { nutrition: { calories: { value: null, source: null } } } },
};
const dishOf = (id: string) => dishes[id] as never;
const now = new Date(2026, 9, 31, 12); // Sat 31 Oct 2026

describe('savings', () => {
  it('counts order minus make for cooked meals only', () => {
    expect(mealSaving(meal({ costInr: 80, orderInr: 250 }), undefined).moneyInr).toBe(170);
    expect(mealSaving(meal({ how: 'ordered', cooked: false, costInr: 80, orderInr: 250 }), undefined).moneyInr).toBeNull();
    expect(mealSaving(meal({ costInr: 80, orderInr: null }), undefined).moneyInr).toBeNull();
  });
  it('compares calories with the restaurant version, scaled by servings', () => {
    expect(mealSaving(meal({ dishId: 'biryani', kcal: 1000, servings: 2 }), dishes.biryani as never).kcalLess).toBe(800);
    expect(mealSaving(meal({ dishId: 'noKcal' }), dishes.noKcal as never).kcalLess).toBeNull();
  });
  it('adds up today, the last 7 days and this month', () => {
    const days: Record<string, DayLog> = {
      '2026-10-31': day(meal({ costInr: 100, orderInr: 300, dishId: 'biryani', kcal: 500 }), meal({ costInr: 50, orderInr: null })),
      '2026-10-27': day(meal({ costInr: 60, orderInr: 200 })),
      '2026-10-25': day(meal({ costInr: 60, orderInr: 160 })), // 6 days back is 25 Oct, in the week
      '2026-10-24': day(meal({ costInr: 10, orderInr: 110 })), // outside the week, inside the month
      '2026-09-30': day(meal({ costInr: 10, orderInr: 500 })), // last month
      '2026-11-01': day(meal({ costInr: 10, orderInr: 500 })), // future, ignored
    };
    const s = savingsSummary(days, dishOf, now);
    expect(s.today).toEqual({ moneyInr: 200, counted: 1, unpriced: 1, kcalLess: 400 });
    expect(s.week.moneyInr).toBe(200 + 140 + 100);
    expect(s.week.counted).toBe(3);
    expect(s.month.moneyInr).toBe(200 + 140 + 100 + 100);
    expect(s.month.kcalLess).toBe(400);
  });
  it('goes negative when cooking cost more, and shows nothing for no cooked meals', () => {
    const s = savingsSummary({ '2026-10-31': day(meal({ costInr: 300, orderInr: 250 })) }, dishOf, now);
    expect(s.today.moneyInr).toBe(-50);
    expect(savingsSummary({}, dishOf, now).week).toEqual({ moneyInr: 0, counted: 0, unpriced: 0, kcalLess: null });
  });
  it('treats an old log with only the cooked flag as cooked', () => {
    expect(mealSaving(meal({ how: undefined, cooked: true, costInr: 10, orderInr: 60 }), undefined).moneyInr).toBe(50);
  });
});
