import { describe, expect, it } from '@jest/globals';

import { GLASS_ML, glassesToMl, inQuietHours, litres, PRESETS, waterHistory, waterReminderTimes, waterStreak, WORKDAYS } from '../services/water';

const days = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { water: v }]));

describe('water maths', () => {
  it('counts a glass as 250 ml', () => {
    expect(glassesToMl(4)).toBe(1000);
    expect(GLASS_ML).toBe(250);
    expect(litres(8)).toBe('2 L');
    expect(PRESETS.map((p) => p.glasses * GLASS_ML)).toEqual([250, 500, 1000]);
  });
  it('builds the week oldest first, with met days marked', () => {
    const w = waterHistory(days({ a: 8, b: 3 }), ['a', 'b', 'c'], 8);
    expect(w).toEqual([
      { key: 'a', glasses: 8, met: true },
      { key: 'b', glasses: 3, met: false },
      { key: 'c', glasses: 0, met: false },
    ]);
  });
});

describe('waterStreak', () => {
  const keys = ['t', 'y', 'd2', 'd3', 'd4'];
  it('counts consecutive met days, today included once met', () => {
    expect(waterStreak(days({ t: 8, y: 9, d2: 8, d3: 2 }), keys, 8)).toBe(3);
  });
  it('does not lose the streak while today is unmet', () => {
    expect(waterStreak(days({ t: 2, y: 8, d2: 8 }), keys, 8)).toBe(2);
  });
  it('breaks on a missed earlier day, and is 0 with nothing', () => {
    expect(waterStreak(days({ t: 8, y: 1, d2: 8 }), keys, 8)).toBe(1);
    expect(waterStreak({}, keys, 8)).toBe(0);
  });
});

describe('reminders', () => {
  it('never schedules inside quiet hours', () => {
    expect(waterReminderTimes().every((t) => !inQuietHours(t.hour))).toBe(true);
    expect(waterReminderTimes()).toHaveLength(5);
    expect(inQuietHours(21)).toBe(true);
    expect(inQuietHours(7)).toBe(true);
    expect(inQuietHours(8)).toBe(false);
  });
  it('is weekdays only (Expo weekdays 2 to 6)', () => {
    expect(WORKDAYS).toEqual([2, 3, 4, 5, 6]);
  });
});
