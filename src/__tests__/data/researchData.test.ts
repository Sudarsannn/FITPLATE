import { describe, expect, it } from '@jest/globals';

import {
  familyOf,
  getDish,
  getIngredient,
  ingredientAliases,
  researchDishes,
  researchExercises,
  researchFitnessGuides,
  researchIngredients,
  researchLinks,
  researchNutrients,
} from '../../data/research';
import { validateDish, validateIngredient } from '../../services/data/buildItems';
import { validateGuidance } from '../../services/data/exerciseImporter';
import { validateNutrient } from '../../services/data/nutrientImporter';
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

  it('every dish has tags, and diet tags only from checked data', () => {
    for (const dish of researchDishes) {
      expect(dish.tags.length).toBeGreaterThan(0);
      if (dish.tags.includes('Gluten-free')) expect(dish.dietClaims).toContain('glutenFree');
      if (dish.tags.includes('Vegan')) expect(dish.dietClaims).toContain('vegan');
      if (dish.tags.includes('Jain')) expect(dish.fasting?.jain.status).toBe('yes');
      expect(dish.tags.filter((t) => t.startsWith('Contains ')).length).toBe(dish.allergens.length);
      for (const sibling of familyOf(dish)) expect(sibling.familyId).toBe(dish.familyId);
    }
  });

  it('nutrients validate and no prescription dose is a plain preset', () => {
    expect(researchNutrients.length).toBeGreaterThan(0);
    for (const n of researchNutrients) {
      expect(validateNutrient(n)).toEqual([]);
      const ul = n.upperLimit?.value;
      for (const p of n.logPresets) if (ul != null && p.mainAmount != null && p.mainAmount > ul) expect(p.prescriptionDose).toBe(true);
    }
  });

  it('exercises carry a MET and tags; guides validate', () => {
    for (const e of researchExercises) {
      expect(e.met).not.toBeNull();
      expect(e.tags.length).toBeGreaterThan(0);
    }
    for (const g of researchFitnessGuides) expect(validateGuidance(g)).toEqual([]);
  });

  it('aliases and links point at bundled items', () => {
    for (const id of Object.values(ingredientAliases)) expect(getIngredient(id)).toBeDefined();
    for (const list of Object.values(researchLinks.goodSourceDishes)) for (const g of list) if (g.dishId) expect(getDish(g.dishId)).toBeDefined();
    for (const id of Object.keys(researchLinks.microTable)) expect(getIngredient(id)).toBeDefined();
  });

  it('looks dishes up by id', () => {
    const first = researchDishes[0];
    expect(getDish(first.id)).toBe(first);
  });
});
