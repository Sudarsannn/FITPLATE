import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../data/research';
import { parsePlainQuery, passesPlain } from '../services/plainSearch';

describe('parsePlainQuery', () => {
  it('lifts time, diet and exclusions out of "15 min no onion veg"', () => {
    expect(parsePlainQuery('15 min no onion veg')).toMatchObject({ rest: '', maxMinutes: 15, diet: 'veg', exclude: ['onion'] });
  });
  it('keeps ordinary words for the normal search', () => {
    expect(parsePlainQuery('paneer under 30 minutes').rest).toBe('paneer');
    expect(parsePlainQuery('paneer under 30 minutes').maxMinutes).toBe(30);
  });
  it('reads lists of exclusions and non-veg', () => {
    const p = parsePlainQuery('non veg without onion and garlic');
    expect(p.diet).toBe('non-veg');
    expect(p.exclude).toEqual(['onion', 'garlic']);
  });
  it('changes nothing when no phrase is present', () => {
    const p = parsePlainQuery('biryani');
    expect(p).toMatchObject({ rest: 'biryani', maxMinutes: null, diet: null, exclude: [], understood: [] });
  });
});

describe('passesPlain', () => {
  it('only passes dishes that fit every understood phrase', () => {
    const p = parsePlainQuery('veg no onion 60 min');
    for (const d of researchDishes.filter((x) => passesPlain(x, p))) {
      expect(d.dietType).toBe('veg');
      expect(d.ingredients.some((i) => /\bonions?\b/i.test(i.name))).toBe(false);
    }
  });
});
