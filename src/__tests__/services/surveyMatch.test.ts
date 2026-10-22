import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../../data/research';
import { migrateDoc } from '../../services/storage/repository';
import { SCHEMAS } from '../../services/storage/schemas';
import { allergyAllows, dietAllows, fitsSurvey, likedCuisine, workoutFit } from '../../services/surveyMatch';
import { DEFAULT_SURVEY } from '../../models/survey';
import type { BaseDoc } from '../../models/common';

const dish = (dietType: 'veg' | 'egg' | 'non-veg' | null, tags: string[] = [], allergens: string[] = []) => ({ dietType, tags, allergens, cuisine: null }) as never;

describe('dietAllows', () => {
  it('keeps the old three diets as they were', () => {
    expect(dietAllows('veg', dish('egg'))).toBe(false);
    expect(dietAllows('egg', dish('egg'))).toBe(true);
    expect(dietAllows('non-veg', dish('non-veg'))).toBe(true);
  });

  it('matches Jain and Vegan only by researched tags', () => {
    expect(dietAllows('jain', dish('veg'))).toBe(false);
    expect(dietAllows('jain', dish('veg', ['Jain option']))).toBe(true);
    expect(dietAllows('vegan', dish('veg', ['Vegan']))).toBe(true);
    expect(dietAllows('vegan', dish('veg', ['Veg']))).toBe(false);
  });

  it('lets pescatarians have veg, egg and tagged fish dishes', () => {
    expect(dietAllows('pescatarian', dish('non-veg'))).toBe(false);
    expect(dietAllows('pescatarian', dish('non-veg', ['Pescatarian']))).toBe(true);
  });

  it('finds real dishes for every diet in the bundled research', () => {
    for (const d of ['veg', 'egg', 'non-veg', 'jain', 'vegan', 'pescatarian', 'no-onion-garlic'] as const) {
      expect(researchDishes.some((x) => dietAllows(d, x))).toBe(true);
    }
  });
});

describe('allergies and cuisines', () => {
  it('drops dishes containing a chosen allergen', () => {
    expect(allergyAllows(['peanut'], dish('veg', [], ['peanut']))).toBe(false);
    expect(fitsSurvey('veg', { allergies: ['milk'] }, dish('veg', [], ['peanut']))).toBe(true);
  });

  it('matches liked cuisines in the cuisine line or tags', () => {
    expect(likedCuisine(['South Indian'], dish('veg', ['South Indian']))).toBe(true);
    expect(likedCuisine([], dish('veg', ['South Indian']))).toBe(false);
  });
});

it('migrates a v1 profile by adding empty survey answers', () => {
  const v1 = { id: 'profile', createdAt: 1, updatedAt: 1, schemaVersion: 1, deleted: false, name: 'A' } as BaseDoc;
  const v2 = migrateDoc<BaseDoc & { survey: unknown }>(SCHEMAS.profile, v1);
  expect(v2.schemaVersion).toBe(2);
  expect(v2.survey).toEqual(DEFAULT_SURVEY);
});

it('ranks moves that fit the Training answers higher', () => {
  const s = { trainWhere: ['home' as const], workoutTypes: ['Yoga and stretching'] };
  expect(workoutFit(s, { section: 'yoga_stretch', type: 'yoga_asana' })).toBe(3);
  expect(workoutFit(s, { section: 'gym', type: 'cardio' })).toBe(0);
  expect(workoutFit({ trainWhere: [], workoutTypes: [] }, { section: 'home', type: 'strength' })).toBe(0);
});
