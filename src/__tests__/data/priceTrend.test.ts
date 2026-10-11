import { describe, expect, it } from '@jest/globals';

import { computePriceEstimate, SEASONAL_PRODUCE, type PriceObservation } from '../../services/data/priceTrend';

const TODAY = '2026-10-01';
const ING = { today: TODAY, seasonal: false, kind: 'ingredient' } as const;
const DISH = { today: TODAY, seasonal: false, kind: 'dish' } as const;

function daysAgo(n: number): string {
  return new Date(Date.parse(`${TODAY}T00:00:00Z`) - n * 86400000).toISOString().slice(0, 10);
}

/** One synthetic observation `ago` days before TODAY, with a ±10 range around avg. */
function obs(ago: number, avg: number, extra: Partial<PriceObservation> = {}): PriceObservation {
  return { date: daysAgo(ago), min: avg - 10, max: avg + 10, avg, confidence: 'High', sourceFile: `r-${ago}.md`, ...extra };
}

describe('computePriceEstimate', () => {
  it('flat series → stable WMA', () => {
    const r = computePriceEstimate([120, 90, 60, 30, 0].map((d) => obs(d, 100)), ING);
    expect(r.trend).toBe('stable');
    expect(r.method).toBe('wma');
    expect(r.currentEstimate).toEqual({ min: 90, max: 110, avg: 100 });
    expect(r.change30dPct).toBe(0);
    expect(r.flags).toEqual([]);
    expect(r.stale).toBe(false);
  });

  it('steady rise → rising, uses the latest observation without extrapolating', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 110), obs(60, 120), obs(30, 130), obs(0, 140)], ING);
    expect(r.trend).toBe('rising');
    expect(r.method).toBe('latest-trend');
    expect(r.currentEstimate).toEqual({ min: 130, max: 150, avg: 140 });
    // Slope 10/30d relative to WMA 131.6.
    expect(r.change30dPct).toBe(7.6);
  });

  it('steady fall → falling, latest observation', () => {
    const r = computePriceEstimate([obs(120, 140), obs(90, 130), obs(60, 120), obs(30, 110), obs(0, 100)], ING);
    expect(r.trend).toBe('falling');
    expect(r.method).toBe('latest-trend');
    expect(r.currentEstimate).toEqual({ min: 90, max: 110, avg: 100 });
    expect(r.change30dPct).toBe(-9.2);
  });

  it('a gentle rise below 5%/30d stays stable', () => {
    const r = computePriceEstimate([obs(90, 100), obs(60, 101), obs(30, 102), obs(0, 103)], ING);
    expect(r.trend).toBe('stable');
    expect(r.method).toBe('wma');
  });

  it('single spike → spike-blend halfway between previous estimate and latest', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 100), obs(60, 100), obs(30, 100), obs(0, 200)], ING);
    expect(r.trend).toBe('stable');
    expect(r.method).toBe('spike-blend');
    expect(r.flags).toContain('possible-spike');
    expect(r.currentEstimate).toEqual({ min: 140, max: 160, avg: 150 });
    expect(r.notes.join(' ')).toMatch(/spike/i);
  });

  it('a jump with only two observations is still treated as a spike', () => {
    const r = computePriceEstimate([obs(30, 50), obs(0, 80)], ING);
    expect(r.trend).toBe('unknown');
    expect(r.method).toBe('spike-blend');
    expect(r.currentEstimate?.avg).toBe(65);
  });

  it('spike then confirmation at the same level → no longer a spike, estimate moves to the new level', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 100), obs(60, 100), obs(30, 200), obs(0, 200)], ING);
    expect(r.method).not.toBe('spike-blend');
    expect(r.flags).not.toContain('possible-spike');
    expect(r.currentEstimate!.avg).toBeGreaterThan(150);
  });

  it('spike then a higher confirmation → rising, latest observation', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 100), obs(60, 100), obs(30, 150), obs(0, 170)], ING);
    expect(r.trend).toBe('rising');
    expect(r.method).toBe('latest-trend');
    expect(r.currentEstimate!.avg).toBe(170);
  });

  it('irregular spacing: weights follow real ages measured from today', () => {
    // 90 days apart → the older point has 1/8 the weight, whatever the absolute dates.
    const recent = computePriceEstimate([obs(90, 50), obs(0, 60)], ING);
    const older = computePriceEstimate([obs(120, 50), obs(30, 60)], ING);
    expect(recent.method).toBe('wma');
    expect(recent.currentEstimate!.avg).toBe(59); // (50×0.125 + 60) / 1.125 = 58.9
    expect(older.currentEstimate!.avg).toBe(59);
  });

  it('irregular spacing: the trend slope uses real dates, not positions', () => {
    // Same values, but packed into 2 days → a much steeper slope per 30 days.
    const spread = computePriceEstimate([obs(90, 100), obs(60, 102), obs(30, 104)], { ...ING, today: daysAgo(30) });
    const packed = computePriceEstimate([obs(2, 100), obs(1, 102), obs(0, 104)], ING);
    expect(spread.trend).toBe('stable');
    expect(packed.trend).toBe('rising');
    expect(packed.change30dPct!).toBeGreaterThan(spread.change30dPct!);
  });

  it('low-confidence and old-format points weigh half', () => {
    const normal = computePriceEstimate([obs(0, 50, { sourceFile: 'a.md' }), obs(0, 60, { sourceFile: 'b.md' })], ING);
    const lowConf = computePriceEstimate([obs(0, 50, { sourceFile: 'a.md' }), obs(0, 60, { sourceFile: 'b.md', confidence: 'Low' })], ING);
    const oldFmt = computePriceEstimate([obs(0, 50, { sourceFile: 'a.md' }), obs(0, 60, { sourceFile: 'b.md', lowQuality: true })], ING);
    expect(normal.currentEstimate!.avg).toBe(55);
    expect(lowConf.currentEstimate!.avg).toBe(53); // (50 + 60×0.5) / 1.5 = 53.3
    expect(oldFmt.currentEstimate!.avg).toBe(53);
  });

  it('a single observation → method single, trend unknown, avg defaults to the midpoint', () => {
    const r = computePriceEstimate([{ date: TODAY, min: 40, max: 50, avg: null, confidence: null, sourceFile: 'one.md' }], ING);
    expect(r.method).toBe('single');
    expect(r.trend).toBe('unknown');
    expect(r.change30dPct).toBeNull();
    expect(r.currentEstimate).toEqual({ min: 40, max: 50, avg: 45 });
    expect(r.priceHistory).toEqual([{ date: TODAY, min: 40, max: 50, avg: 45, confidence: null, sourceFile: 'one.md' }]);
    expect(r.lastObserved).toBe(TODAY);
  });

  it('sorts history by date and reports the latest date', () => {
    const r = computePriceEstimate([obs(0, 100), obs(60, 100), obs(30, 100)], ING);
    expect(r.priceHistory.map((p) => p.date)).toEqual([daysAgo(60), daysAgo(30), TODAY]);
    expect(r.lastObserved).toBe(TODAY);
  });

  it('marks stale only when the latest observation is more than 45 days old', () => {
    const stale = computePriceEstimate([obs(46, 100)], ING);
    expect(stale.stale).toBe(true);
    expect(stale.flags).toContain('stale');
    const fresh = computePriceEstimate([obs(45, 100)], ING);
    expect(fresh.stale).toBe(false);
    expect(fresh.flags).not.toContain('stale');
  });

  it('narrows a range wider than 30% of avg to ±15%', () => {
    const r = computePriceEstimate([obs(0, 100, { min: 50, max: 150 })], ING);
    expect(r.currentEstimate).toEqual({ min: 85, max: 115, avg: 100 });
    expect(r.flags).toContain('narrowed');
    expect(r.notes.join(' ')).toMatch(/narrowed/);
  });

  it('keeps min ≤ avg ≤ max', () => {
    const r = computePriceEstimate([obs(0, 90, { min: 80, max: 88 })], ING);
    expect(r.currentEstimate).toEqual({ min: 80, max: 90, avg: 90 });
    expect(r.flags).toEqual([]);
  });

  it('rounds ingredients to ₹1 under ₹100 and ₹5 otherwise; dishes to ₹10', () => {
    expect(computePriceEstimate([obs(0, 42.4, { min: 40.2, max: 44.6 })], ING).currentEstimate).toEqual({ min: 40, max: 45, avg: 42 });
    expect(computePriceEstimate([obs(0, 123, { min: 112, max: 131 })], ING).currentEstimate).toEqual({ min: 110, max: 130, avg: 125 });
    expect(computePriceEstimate([obs(0, 184, { min: 166, max: 202 })], DISH).currentEstimate).toEqual({ min: 170, max: 200, avg: 180 });
  });

  it('ignores duplicate observations (same date and source file) but keeps other sources on the same date', () => {
    const r = computePriceEstimate([obs(0, 100), obs(0, 100)], ING);
    expect(r.priceHistory).toHaveLength(1);
    expect(r.method).toBe('single');
    expect(r.notes.join(' ')).toMatch(/duplicate/i);
    const two = computePriceEstimate([obs(0, 100), obs(0, 100, { sourceFile: 'other.md' })], ING);
    expect(two.priceHistory).toHaveLength(2);
  });

  it('passes seasonal through and exports the seasonal produce ids', () => {
    expect(computePriceEstimate([obs(0, 40)], { ...ING, seasonal: true }).seasonal).toBe(true);
    expect(computePriceEstimate([obs(0, 40)], ING).seasonal).toBe(false);
    for (const id of ['onion', 'tomato', 'potato', 'green-chilli', 'coriander-leaves', 'lemon']) {
      expect(SEASONAL_PRODUCE.has(id)).toBe(true);
    }
    expect(SEASONAL_PRODUCE.has('rice')).toBe(false);
  });

  it('throws on bad input', () => {
    expect(() => computePriceEstimate([], ING)).toThrow(/no observations/);
    expect(() => computePriceEstimate([obs(0, 100, { min: NaN })], ING)).toThrow(/finite/);
    expect(() => computePriceEstimate([obs(0, 100, { avg: Infinity })], ING)).toThrow(/finite/);
    expect(() => computePriceEstimate([obs(0, 100, { max: -1, min: -5 })], ING)).toThrow(/finite/);
    expect(() => computePriceEstimate([obs(0, 100, { min: 120, max: 110 })], ING)).toThrow(/min/);
    expect(() => computePriceEstimate([obs(0, 100, { date: '01/10/2026' })], ING)).toThrow(/YYYY-MM-DD/);
    expect(() => computePriceEstimate([obs(0, 100, { date: '2026-13-45' })], ING)).toThrow(/date/);
    expect(() => computePriceEstimate([obs(0, 100)], { ...ING, today: 'today' })).toThrow(/today/);
  });
});
