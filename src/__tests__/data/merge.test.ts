import { describe, expect, it } from '@jest/globals';

import { adoptWhole, mergeOfficial, mergeStable, recipeChangedMaterially, unionList } from '../../services/data/merge';

describe('mergeStable', () => {
  it('returns none when every version is null or there are none', () => {
    expect(mergeStable([])).toEqual({ value: null, method: 'none', excludedDates: [], notes: [] });
    expect(mergeStable([{ date: '2026-01-01', value: null }]).method).toBe('none');
  });

  it('uses a single value as is, rounded to 1 decimal', () => {
    expect(mergeStable([{ date: '2026-01-01', value: 312.46 }, { date: '2026-02-01', value: null }])).toEqual({
      value: 312.5,
      method: 'single',
      excludedDates: [],
      notes: [],
    });
  });

  it('averages two close versions', () => {
    const r = mergeStable([{ date: '2026-01-01', value: 300 }, { date: '2026-02-01', value: 330 }]);
    expect(r).toEqual({ value: 315, method: 'mean-2', excludedDates: [], notes: [] });
  });

  it('keeps the newer of two versions that differ by more than 25%', () => {
    const r = mergeStable([{ date: '2026-02-01', value: 500 }, { date: '2026-01-01', value: 300 }]);
    expect(r.value).toBe(500);
    expect(r.excludedDates).toEqual(['2026-01-01']);
    expect(r.notes).toHaveLength(1);
  });

  it('takes the median of the last 3 and drops older versions', () => {
    const r = mergeStable([
      { date: '2025-01-01', value: 900 },
      { date: '2026-01-01', value: 300 },
      { date: '2026-03-01', value: 320 },
      { date: '2026-02-01', value: 310 },
    ]);
    expect(r).toEqual({ value: 310, method: 'median-3', excludedDates: [], notes: [] });
  });

  it('excludes an outlier more than 25% from the median of the others and notes it', () => {
    const r = mergeStable([
      { date: '2026-01-01', value: 300 },
      { date: '2026-02-01', value: 600 },
      { date: '2026-03-01', value: 310 },
    ]);
    expect(r.value).toBe(305);
    expect(r.method).toBe('median-3');
    expect(r.excludedDates).toEqual(['2026-02-01']);
    expect(r.notes[0]).toMatch(/outlier/i);
  });

  it('handles zero values without dividing by zero', () => {
    expect(mergeStable([{ date: '2026-01-01', value: 0 }, { date: '2026-02-01', value: 0 }]).value).toBe(0);
    expect(mergeStable([{ date: '2026-01-01', value: 0 }, { date: '2026-02-01', value: 2 }]).value).toBe(2);
  });

  it('throws on non-finite values', () => {
    expect(() => mergeStable([{ date: '2026-01-01', value: NaN }])).toThrow(/finite/);
    expect(() => mergeStable([{ date: '2026-01-01', value: Infinity }])).toThrow(/finite/);
  });
});

describe('mergeOfficial', () => {
  const v = (value: number | null, citesOfficial: boolean, date = '2026-02-01') => ({ value, citesOfficial, date });

  it('keeps equal values and takes the non-null side', () => {
    expect(mergeOfficial(v(40, true, '2026-01-01'), v(40, false))).toEqual({ value: 40, needsReview: false, note: null });
    expect(mergeOfficial(null, v(40, false))).toEqual({ value: 40, needsReview: false, note: null });
    expect(mergeOfficial(v(null, true, '2026-01-01'), v(40, false)).value).toBe(40);
    expect(mergeOfficial(v(40, false, '2026-01-01'), v(null, true)).value).toBe(40);
    expect(mergeOfficial(null, v(null, false)).value).toBeNull();
  });

  it('keeps the version that cites the official table, never an average', () => {
    const newerCites = mergeOfficial(v(40, false, '2026-01-01'), v(46, true));
    expect(newerCites).toMatchObject({ value: 46, needsReview: false });
    expect(newerCites.note).toMatch(/official/);
    expect(mergeOfficial(v(40, true, '2026-01-01'), v(46, false))).toMatchObject({ value: 40, needsReview: false });
  });

  it('keeps the previous value and flags review when citation cannot settle it', () => {
    expect(mergeOfficial(v(40, true, '2026-01-01'), v(46, true))).toMatchObject({ value: 40, needsReview: true });
    expect(mergeOfficial(v(40, false, '2026-01-01'), v(46, false))).toMatchObject({ value: 40, needsReview: true });
  });

  it('keeps the lower value for safety limits and still flags review', () => {
    expect(mergeOfficial(v(45, true, '2026-01-01'), v(40, false), { safetyLimit: true })).toMatchObject({ value: 40, needsReview: true });
    expect(mergeOfficial(v(40, false, '2026-01-01'), v(45, true), { safetyLimit: true })).toMatchObject({ value: 40, needsReview: true });
  });

  it('throws on non-finite values', () => {
    expect(() => mergeOfficial(v(NaN, true), v(40, true))).toThrow(/finite/);
    expect(() => mergeOfficial(null, v(Infinity, true))).toThrow(/finite/);
  });
});

describe('unionList', () => {
  it('unions, trims and dedupes case-insensitively, keeping the first spelling and order', () => {
    expect(unionList(['IFCT 2017', ' Swiggy '], ['ifct 2017', 'Zomato', 'swiggy'], ['BigBasket'])).toEqual([
      'IFCT 2017',
      'Swiggy',
      'Zomato',
      'BigBasket',
    ]);
  });

  it('skips null/undefined lists and blank items', () => {
    expect(unionList(null, undefined, ['', '  ', 'a'])).toEqual(['a']);
    expect(unionList()).toEqual([]);
  });
});

describe('adoptWhole', () => {
  const prev = { value: 'v1', sources: 3, notFound: 1 };

  it('adopts the newest when there is no previous version', () => {
    expect(adoptWhole(null, { value: 'v2', sources: 0, notFound: 5 })).toEqual({ value: 'v2', adopted: 'next', note: null });
  });

  it('adopts the newest when at least as complete', () => {
    expect(adoptWhole(prev, { value: 'v2', sources: 3, notFound: 1 })).toEqual({ value: 'v2', adopted: 'next', note: null });
    expect(adoptWhole(prev, { value: 'v2', sources: 5, notFound: 0 }).adopted).toBe('next');
  });

  it('keeps the previous version with a note when the newest is less complete', () => {
    const fewer = adoptWhole(prev, { value: 'v2', sources: 2, notFound: 1 });
    expect(fewer).toMatchObject({ value: 'v1', adopted: 'prev' });
    expect(fewer.note).toMatch(/fewer sources/);
    const both = adoptWhole(prev, { value: 'v2', sources: 2, notFound: 3 });
    expect(both.note).toMatch(/fewer sources.*Not found/);
  });

  it('throws on invalid counts', () => {
    expect(() => adoptWhole(prev, { value: 'v2', sources: -1, notFound: 0 })).toThrow(/sources/);
    expect(() => adoptWhole({ ...prev, notFound: 1.5 }, { value: 'v2', sources: 1, notFound: 0 })).toThrow(/notFound/);
  });
});

describe('recipeChangedMaterially', () => {
  const base = [
    { ingredientId: 'rice', name: 'Rice', quantity: 100 },
    { ingredientId: null, name: 'Curry Leaves', quantity: 5 },
  ];

  it('is false for the same recipe, including name spelling and small quantity changes', () => {
    expect(recipeChangedMaterially(base, base)).toBe(false);
    expect(
      recipeChangedMaterially(base, [
        { ingredientId: 'rice', name: 'Raw rice', quantity: 115 },
        { ingredientId: null, name: ' curry leaves ', quantity: 5 },
      ]),
    ).toBe(false);
  });

  it('is true when an ingredient is added or removed', () => {
    expect(recipeChangedMaterially(base, [...base, { ingredientId: 'ghee', name: 'Ghee', quantity: 5 }])).toBe(true);
    expect(recipeChangedMaterially(base, base.slice(0, 1))).toBe(true);
    expect(recipeChangedMaterially(base, [base[0], { ingredientId: 'ghee', name: 'Ghee', quantity: 5 }])).toBe(true);
  });

  it('is true when a quantity changes by more than 15%', () => {
    expect(recipeChangedMaterially(base, [{ ...base[0], quantity: 116 }, base[1]])).toBe(true);
    expect(recipeChangedMaterially(base, [{ ...base[0], quantity: 84 }, base[1]])).toBe(true);
  });

  it('sums repeated ingredients and ignores unknown quantities', () => {
    const split = [
      { ingredientId: 'rice', name: 'Rice', quantity: 60 },
      { ingredientId: 'rice', name: 'Rice', quantity: 40 },
      base[1],
    ];
    expect(recipeChangedMaterially(base, split)).toBe(false);
    expect(recipeChangedMaterially(base, [{ ...base[0], quantity: null }, base[1]])).toBe(false);
  });

  it('throws on bad lines', () => {
    expect(() => recipeChangedMaterially([{ ingredientId: null, name: '  ', quantity: 1 }], base)).toThrow(/ingredientId/);
    expect(() => recipeChangedMaterially([{ ...base[0], quantity: NaN }], base)).toThrow(/finite/);
  });
});
