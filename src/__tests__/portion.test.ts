import { describe, expect, it } from '@jest/globals';

import { portionPatch } from '../services/meals';

describe('portionPatch', () => {
  const meal = { kcal: 300, proteinG: 10, fibreG: 4, costInr: 40, orderInr: 150, servings: 1 };
  it('scales every number with the portion', () => {
    expect(portionPatch(meal, 2)).toEqual({ kcal: 600, proteinG: 20, fibreG: 8, costInr: 80, orderInr: 300, servings: 2 });
  });
  it('restores the original when changed back, and treats a missing portion as 1', () => {
    const twice = portionPatch(meal, 2);
    expect(portionPatch(twice, 1)).toEqual({ ...meal, servings: 1 });
    expect(portionPatch({ kcal: 200, proteinG: 8, fibreG: 2 }, 1.5)).toEqual({ kcal: 300, proteinG: 12, fibreG: 3, costInr: undefined, orderInr: undefined, servings: 1.5 });
  });
  it('keeps unknown prices unknown and stays between half a serving and twenty', () => {
    expect(portionPatch({ ...meal, costInr: null, orderInr: null }, 2)).toMatchObject({ costInr: null, orderInr: null });
    expect(portionPatch(meal, 0).servings).toBe(0.5);
    expect(portionPatch(meal, 99).servings).toBe(20);
  });
});
