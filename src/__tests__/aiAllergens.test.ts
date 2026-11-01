import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../data/research';
import { cardChips, dishFilterGroups } from '../services/dishLibrary';
import { allergyAllows, fitsSurvey } from '../services/surveyMatch';
import type { Dish } from '../models/research';

const real = researchDishes[0];
const draft = { ...real, id: 'ai-x', allergens: [], tags: [], ai: { createdAt: '', request: '', mode: 'new', basedOn: null, changes: [], sources: [], needsMoreResearch: [], model: '', grounded: true } } as unknown as Dish;

describe('AI dish allergens are unverified (review 2026-10-28 fix 3)', () => {
  it('the allergen filter hides an AI draft whichever allergen is excluded, and keeps it otherwise', () => {
    const group = dishFilterGroups([real, draft, ...researchDishes]).find((g) => g.id === 'allergen')!;
    expect(group.options.length).toBeGreaterThan(0);
    for (const o of group.options) expect(o.test(draft)).toBe(true); // true = matches the excluded allergen = hidden
    expect(group.options.some((o) => o.test(real) === false)).toBe(true);
  });
  it('is never recommended to someone with an allergy, but is to someone with none', () => {
    expect(allergyAllows(['peanut'], draft)).toBe(false);
    expect(allergyAllows([], draft)).toBe(true);
    expect(fitsSurvey('veg', { allergies: ['milk'] as never }, draft)).toBe(false);
  });
  it('carries an "AI draft" chip first', () => {
    expect(cardChips(draft)[0]).toBe('AI draft');
    expect(cardChips(real)).not.toContain('AI draft');
  });
});
