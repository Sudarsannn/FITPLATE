import { describe, expect, it } from '@jest/globals';

import { getDish, getIngredient, researchDishes, researchIngredients } from '../../data/research';
import { validateDish, validateIngredient } from '../../services/data/buildItems';
import { ALLERGEN_IDS } from '../../models/research';

// Loads every bundled research JSON through the generated indexes, the same way the app will.
describe('bundled research data', () => {
  it('has dishes and ingredients', () => {
    expect(researchDishes.length).toBeGreaterThan(0);
    expect(researchIngredients.length).toBeGreaterThan(0);
  });

  it.each(researchDishes.map((d) => [d.id, d] as const))('dish %s validates', (_id, dish) => {
    expect(validateDish(dish)).toEqual([]);
    expect(dish.servings).toBe(1);
    expect(dish.versions.length).toBeGreaterThan(0);
    for (const a of dish.allergens) expect(ALLERGEN_IDS).toContain(a);
    // As-ordered and as-cooked nutrition are separate fields, never filled from each other.
    if (dish.asOrdered?.nutrition) expect(dish.asOrdered.nutrition.calories.value).not.toBe(dish.nutritionPerServing.kcal);
    const cur = dish.orderPrice?.currentEstimate;
    if (cur) expect(cur.min <= cur.avg && cur.avg <= cur.max).toBe(true);
  });

  it.each(researchIngredients.map((i) => [i.id, i] as const))('ingredient %s validates', (_id, ing) => {
    expect(validateIngredient(ing)).toEqual([]);
    expect(ing.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('every linked ingredient id exists', () => {
    for (const dish of researchDishes) {
      for (const line of dish.ingredients) if (line.ingredientId) expect(getIngredient(line.ingredientId)).toBeDefined();
    }
  });

  it('looks dishes up by id', () => {
    const first = researchDishes[0];
    expect(getDish(first.id)).toBe(first);
  });
});
