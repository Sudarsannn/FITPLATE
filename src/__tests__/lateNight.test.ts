import { describe, expect, it } from '@jest/globals';

import { isLateNight, lateNightPicks } from '../services/lateNight';
import type { Dish } from '../models/research';

const dish = (id: string, o: Partial<Dish> & { kcal?: number | null }): Dish =>
  ({ id, name: id, prepMin: 5, cookMin: 10, dietType: 'veg', tags: [], allergens: [], cuisine: null, nutritionPerServing: { kcal: o.kcal === undefined ? 300 : o.kcal }, healthiness: null, ...o }) as unknown as Dish;

describe('late-night helper', () => {
  it('is on from 9 pm to 2 am', () => {
    expect(isLateNight(new Date(2026, 9, 29, 21, 0))).toBe(true);
    expect(isLateNight(new Date(2026, 9, 29, 1, 59))).toBe(true);
    expect(isLateNight(new Date(2026, 9, 29, 14, 0))).toBe(false);
  });
  it('picks quick, light dishes that fit the diet and allergies, healthiest first', () => {
    const list = [
      dish('slow', { prepMin: 20, cookMin: 30 }),
      dish('heavy', { kcal: 700 }),
      dish('unknown', { kcal: null }),
      dish('meat', { dietType: 'non-veg' }),
      dish('nuts', { allergens: ['peanut'] as never }),
      dish('ok-a', { healthiness: { score: 6, restaurantScore: null, reasons: [] } }),
      dish('ok-b', { healthiness: { score: 8, restaurantScore: null, reasons: [] } }),
      dish('ai', { ai: true } as never),
    ];
    expect(lateNightPicks(list, 'veg', { allergies: ['peanut'] as never }).map((d) => d.id)).toEqual(['ok-b', 'ok-a']);
  });
});
