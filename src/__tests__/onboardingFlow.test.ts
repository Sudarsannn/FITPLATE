import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../data/research';
import { DEFAULT_SURVEY } from '../models/survey';
import { LATER_PAGES, profileGaps, QUICK_PAGES } from '../services/onboardingFlow';

// Mirrors SURVEY_PAGES in SurveyFlow (importing it would pull the UI into Jest).
const SURVEY_PAGES = ['name', 'goals', 'health', 'body', 'diet', 'food', 'kitchen', 'training'];
const none = { age: null, heightCm: null, weightKg: null };

describe('quick setup', () => {
  it('is six pages or fewer, all real survey pages', () => {
    expect(QUICK_PAGES.length).toBeLessThanOrEqual(6);
    for (const p of QUICK_PAGES) expect(SURVEY_PAGES).toContain(p);
  });
  it('the pages left for later are the rest of the survey', () => {
    expect([...QUICK_PAGES, ...LATER_PAGES].sort()).toEqual([...SURVEY_PAGES].sort());
  });
});

describe('profile gaps', () => {
  it('lists everything for a brand new profile, health first', () => {
    const g = profileGaps({ survey: DEFAULT_SURVEY, body: none, equipmentOwned: [] });
    expect(g.map((x) => x.page)).toEqual(['health', 'body', 'training', 'kitchen', 'food']);
  });
  it('is empty once everything is answered', () => {
    const survey = { ...DEFAULT_SURVEY, healthIssues: ['none'], trainWhere: ['home' as const], mealsPerDay: 3 };
    expect(profileGaps({ survey, body: { age: 30, heightCm: 170, weightKg: 70 }, equipmentOwned: ['tawa'] })).toEqual([]);
  });
  it('"prefer not to say" counts as answered', () => {
    const g = profileGaps({ survey: { ...DEFAULT_SURVEY, healthIssues: ['prefer-not'] }, body: none, equipmentOwned: [] });
    expect(g.some((x) => x.page === 'health')).toBe(false);
  });
  it('a partly filled body still asks', () => {
    const g = profileGaps({ survey: { ...DEFAULT_SURVEY, healthIssues: ['none'] }, body: { age: 30, heightCm: null, weightKg: 70 }, equipmentOwned: [] });
    expect(g.some((x) => x.page === 'body')).toBe(true);
  });
});

describe('bundled dish nutrition (review 18 Nov FIX 1)', () => {
  it('every dish has protein x 4 at or below its calories', () => {
    const bad = researchDishes.filter((d) => d.nutritionPerServing.proteinG != null && d.nutritionPerServing.kcal != null && d.nutritionPerServing.proteinG * 4 > d.nutritionPerServing.kcal).map((d) => d.id);
    expect(bad).toEqual([]);
  });
  it('no dish carries the 54 g protein reference value', () => {
    expect(researchDishes.filter((d) => d.nutritionPerServing.proteinG === 54 && d.nutritionPerServing.fibreG === 30).map((d) => d.id)).toEqual([]);
  });
});
