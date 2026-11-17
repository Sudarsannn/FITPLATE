import { describe, expect, it } from '@jest/globals';

import { researchIngredients } from '../data/research';
import { buildBuckets, changePct, coveragePct, daySaved, notes, periodKeys, priceRow, priceRows, priceSummary, runLength, seriesStats, streakRows, type DayLike } from '../services/trends';

const NOW = new Date(2026, 10, 17); // 17 Nov 2026
const day = (over: Partial<DayLike> = {}): DayLike => ({ meals: [], exercise: [], water: 0, ...over });
const meal = (kcal: number, protein: number, extra: Partial<DayLike['meals'][number]> = {}) => ({ kcal, protein, ...extra });

describe('period keys and buckets', () => {
  it('week is 7 days ending today, oldest first', () => {
    const k = periodKeys('week', NOW);
    expect(k).toHaveLength(7);
    expect(k[0]).toBe('2026-11-11');
    expect(k[6]).toBe('2026-11-17');
  });
  it('the previous period ends the day before this one starts', () => {
    expect(periodKeys('week', NOW, 1)[6]).toBe('2026-11-10');
    expect(periodKeys('month', NOW)).toHaveLength(30);
  });
  it('3 months is 13 weekly buckets', () => {
    expect(buildBuckets({}, 'quarter', NOW)).toHaveLength(13);
  });
  it('leaves days with nothing logged as gaps, not zeros', () => {
    const b = buildBuckets({ '2026-11-17': day({ meals: [meal(500, 20)] }) }, 'week', NOW);
    expect(b[6].kcalIn).toBe(500);
    expect(b[0].kcalIn).toBeNull();
    expect(b[0].protein).toBeNull();
    expect(seriesStats(b, 'kcalIn').average).toBe(500);
  });
  it('averages a weekly bucket over logged days only', () => {
    const days = { '2026-11-17': day({ meals: [meal(600, 30)] }), '2026-11-16': day({ meals: [meal(400, 10)] }) };
    const last = buildBuckets(days, 'quarter', NOW).at(-1)!;
    expect(last.kcalIn).toBe(500);
    expect(last.protein).toBe(20);
    expect(last.loggedDays).toBe(2);
  });
  it('sums workout minutes and counts water only on days it was logged', () => {
    const days = { '2026-11-17': day({ exercise: [{ minutes: 30, kcal: 200 }, { minutes: 15, kcal: 90 }], water: 6 }), '2026-11-16': day({ water: 0 }) };
    const b = buildBuckets(days, 'week', NOW);
    expect(b[6].workoutMin).toBe(45);
    expect(b[6].water).toBe(6);
    expect(b[5].water).toBeNull();
  });
});

describe('money saved', () => {
  it('counts cooked meals with both prices, and a dearer home meal as negative', () => {
    const d = day({ meals: [meal(1, 1, { how: 'cooked', costInr: 60, orderInr: 220 }), meal(1, 1, { how: 'cooked', costInr: 300, orderInr: 250 }), meal(1, 1, { how: 'ordered', costInr: 10, orderInr: 500 }), meal(1, 1, { how: 'cooked', costInr: 50 })] });
    expect(daySaved(d)).toBe(160 - 50);
    expect(daySaved(undefined)).toBe(0);
  });
});

describe('stats and change', () => {
  it('finds the best bucket and ignores zero totals', () => {
    const days = { '2026-11-15': day({ exercise: [{ minutes: 20, kcal: 100 }] }), '2026-11-17': day({ exercise: [{ minutes: 50, kcal: 300 }] }) };
    const s = seriesStats(buildBuckets(days, 'week', NOW), 'workoutMin');
    expect(s.total).toBe(70);
    expect(s.best?.value).toBe(50);
    expect(s.withData).toBe(2);
  });
  it('changePct is null without both sides', () => {
    expect(changePct(110, 100)).toBe(10);
    expect(changePct(null, 100)).toBeNull();
    expect(changePct(5, 0)).toBeNull();
  });
  it('coverage is the mean of capped fractions', () => {
    expect(coveragePct([{ fraction: 0.5 }, { fraction: 2 }])).toBe(75);
    expect(coveragePct([])).toBeNull();
  });
});

describe('streaks', () => {
  const days: Record<string, DayLike> = {
    '2026-11-17': day({ meals: [meal(1, 1, { how: 'cooked' })], water: 9 }),
    '2026-11-16': day({ meals: [meal(1, 1, { cooked: true })], water: 9, exercise: [{ minutes: 5, kcal: 20 }] }),
    '2026-11-14': day({ meals: [meal(1, 1, { cooked: true })] }),
  };
  it('counts back from today and stops at a gap', () => {
    expect(runLength(days, '2026-11-17', (d) => d.meals.length > 0)).toBe(2);
  });
  it('an empty today does not break the run', () => {
    expect(runLength(days, '2026-11-18', (d) => d.meals.length > 0)).toBe(2);
  });
  it('hides the water streak when there is no target', () => {
    expect(streakRows(days, '2026-11-17', null).map((r) => r.id)).not.toContain('water');
    expect(streakRows(days, '2026-11-17', 8).find((r) => r.id === 'water')?.days).toBe(2);
    expect(streakRows({}, '2026-11-17', 8).every((r) => r.days === 0)).toBe(true);
  });
});

describe('plain-words notes', () => {
  it('says nothing from empty data', () => {
    expect(notes(buildBuckets({}, 'week', NOW), buildBuckets({}, 'week', NOW, 1), 'week', 80)).toEqual([]);
  });
  it('names the best protein day only with 2+ logged days, and reports saved money', () => {
    const days = {
      '2026-11-17': day({ meals: [meal(500, 90, { how: 'cooked', costInr: 50, orderInr: 200 })] }),
      '2026-11-16': day({ meals: [meal(500, 40)] }),
      '2026-11-15': day({ meals: [meal(500, 85)] }),
    };
    const out = notes(buildBuckets(days, 'week', NOW), buildBuckets({}, 'week', NOW, 1), 'week', 80);
    expect(out.some((l) => l.includes('Tuesday') && l.includes('90 g'))).toBe(true);
    expect(out.some((l) => l.includes('2 of 3'))).toBe(true);
    expect(out.some((l) => l.includes('₹150'))).toBe(true);
    expect(out.some((l) => l.includes('percent on the period before'))).toBe(false);
  });
});

const ing = (id: string, avgs: number[], extra: object = {}) => ({
  id,
  name: id,
  aliases: [],
  standardUnit: 'kg',
  seasonal: false,
  price: { priceHistory: avgs.map((a, i) => ({ date: `2026-10-0${i + 1}`, min: a - 5, max: a + 5, avg: a, confidence: null, sourceFile: 'x' })), trend: 'unknown', stale: false, ...extra } as never,
});

describe('price trends', () => {
  it('single reading has no change and a one-reading verdict', () => {
    const r = priceRow(ing('a', [50]))!;
    expect(r.changePct).toBeNull();
    expect(r.verdict).toBe('one-reading');
  });
  it('judges the latest against the ingredient\'s own earlier average', () => {
    expect(priceRow(ing('a', [60, 40, 40]))!.verdict).toBe('cheaper');
    expect(priceRow(ing('a', [40, 40, 50]))!.verdict).toBe('dearer');
    expect(priceRow(ing('a', [50, 52, 51]))!.verdict).toBe('usual');
    expect(priceRow(ing('a', [100, 80]))!.changePct).toBe(-20);
  });
  it('returns null with no priced history', () => {
    expect(priceRow({ ...ing('a', []), price: null })).toBeNull();
    expect(priceRow(ing('a', [0]))).toBeNull();
  });
  it('searches, filters and sorts', () => {
    const items = [ing('onion', [40, 60]), ing('tomato', [60, 30]), ing('rice', [90, 91]), ing('one', [10])];
    expect(priceRows(items).map((r) => r.id)).toEqual(['onion', 'tomato', 'rice']);
    expect(priceRows(items, { sort: 'cheaper-first' })[0].id).toBe('tomato');
    expect(priceRows(items, { sort: 'dearer-first' })[0].id).toBe('onion');
    expect(priceRows(items, { query: 'ton' }).map((r) => r.id)).toEqual([]);
    expect(priceRows(items, { query: 'tom' }).map((r) => r.id)).toEqual(['tomato']);
    expect(priceRows(items, { filter: 'cheaper' }).map((r) => r.id)).toEqual(['tomato']);
    expect(priceRows(items, { trendsOnly: false }).map((r) => r.id)).toContain('one');
  });
  it('summarises the real research library without throwing', () => {
    const s = priceSummary(researchIngredients);
    expect(s.withTrend + s.oneReading).toBeGreaterThan(100);
    expect(priceRows(researchIngredients).every((r) => r.points.length >= 2)).toBe(true);
  });
});
