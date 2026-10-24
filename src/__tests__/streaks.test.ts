import { describe, expect, it } from '@jest/globals';

import { cookedDays, currentStreak, inStreak, longestStreak, monthGrid } from '../services/streaks';

const set = (...k: string[]) => new Set(k);

describe('streaks', () => {
  it('counts back from today, or from yesterday when today is empty', () => {
    expect(currentStreak(set('2026-10-22', '2026-10-23', '2026-10-24'), '2026-10-24')).toBe(3);
    expect(currentStreak(set('2026-10-22', '2026-10-23'), '2026-10-24')).toBe(2);
    expect(currentStreak(set('2026-10-21'), '2026-10-24')).toBe(0);
  });
  it('works across a month end', () => {
    expect(currentStreak(set('2026-09-30', '2026-10-01', '2026-10-02'), '2026-10-02')).toBe(3);
  });
  it('finds the best run and marks streak days', () => {
    const c = set('2026-10-01', '2026-10-02', '2026-10-03', '2026-10-10', '2026-10-15', '2026-10-16');
    expect(longestStreak(c)).toBe(3);
    expect(inStreak(c, '2026-10-02')).toBe(true);
    expect(inStreak(c, '2026-10-10')).toBe(false);
  });
  it('builds the month grid', () => {
    const g = monthGrid(2026, 9, set('2026-10-01', '2026-10-02', '2026-10-10'), '2026-10-24');
    expect(g.every((w) => w.length === 7)).toBe(true);
    const flat = g.flat().filter(Boolean);
    expect(flat).toHaveLength(31);
    expect(flat[0]).toMatchObject({ day: 1, state: 'streak' });
    expect(flat[9]).toMatchObject({ day: 10, state: 'cooked' });
    expect(flat[23]).toMatchObject({ today: true });
    expect(flat[25]).toMatchObject({ future: true });
  });
  it('reads cooked days from the day logs', () => {
    expect([...cookedDays({ a: { meals: [{ cooked: true }] }, b: { meals: [{ cooked: false }] } })]).toEqual(['a']);
  });
});
