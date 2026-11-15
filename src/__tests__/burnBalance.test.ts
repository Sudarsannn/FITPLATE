import { describe, expect, it } from '@jest/globals';

import { researchExercises } from '../data/research';
import type { MetOption } from '../models/exercise';
import { activityLine, distanceWays, exerciseKcal, netEnergy, speedFromActivity, weeklyActivity } from '../services/burnBalance';

const treadmill = researchExercises.find((e) => e.id === 'treadmill')!;

describe('calories burned and net', () => {
  it('is MET x kg x hours', () => {
    expect(exerciseKcal(8, 60, 60)).toBe(480);
    expect(exerciseKcal(3.5, 30, 70)).toBe(123);
    expect(exerciseKcal(4, 30)).toBe(140); // default 70 kg
  });
  it('reports net as eaten minus burnt, with a readable line', () => {
    expect(netEnergy(2100, 250)).toMatchObject({ net: 1850, label: 'Net 1,850 kcal', detail: '2,100 eaten, 250 burnt' });
    expect(netEnergy(300, 500).label).toBe('Net −200 kcal');
    expect(netEnergy(0, 0).detail).toBe('0 eaten, nothing burnt yet');
  });
});

describe('walk and run distances from the researched treadmill rows', () => {
  it('reads the middle of a speed range', () => {
    expect(speedFromActivity('Walking, treadmill, 3.0–3.4 mph (4.8–5.5 km/h), 0% grade')).toBe(5.2);
    expect(speedFromActivity('Running, 5.0–5.2 mph (about 8.0–8.4 km/h; 12 min/mile)')).toBe(8.2);
    expect(speedFromActivity('Climbing hills, no load')).toBeNull();
  });
  it('gives easy walk, brisk walk and run with minutes and km', () => {
    const ways = distanceWays(300, 70, treadmill.metOptions);
    expect(ways.map((w) => w.label)).toEqual(['Easy walk', 'Brisk walk', 'Run']);
    const easy = ways[0];
    expect(easy.minutes).toBe(Math.round((300 / (3.8 * 70)) * 60));
    expect(easy.km).toBeCloseTo((easy.speedKmh * easy.minutes) / 60, 1);
    expect(ways[2].minutes).toBeLessThan(ways[0].minutes);
    expect(ways[2].kind).toBe('run');
  });
  it('uses 70 kg without a weight, and nothing without calories', () => {
    expect(distanceWays(300, null, treadmill.metOptions)).toEqual(distanceWays(300, 70, treadmill.metOptions));
    expect(distanceWays(0, 70, treadmill.metOptions)).toEqual([]);
    expect(distanceWays(null, 70, treadmill.metOptions)).toEqual([]);
  });
  it('skips rows without a speed', () => {
    const rows: MetOption[] = [{ code: '1', met: 5, activity: 'Climbing hills' }];
    expect(distanceWays(200, 60, rows)).toEqual([]);
  });
});

describe('weeklyActivity', () => {
  const now = new Date(2026, 10, 15);
  const days = {
    '2026-11-15': { meals: [{ kcal: 600 }, { kcal: 800 }], exercise: [{ minutes: 30, kcal: 150 }] },
    '2026-11-14': { meals: [{ kcal: 1500 }], exercise: [] },
    '2026-11-12': { meals: [], exercise: [{ minutes: 45, kcal: 300 }, { minutes: 15, kcal: 60 }] },
    '2026-11-01': { meals: [{ kcal: 9999 }], exercise: [{ minutes: 999, kcal: 999 }] }, // outside the week
  };
  it('totals the last seven days only', () => {
    const w = weeklyActivity(days, now);
    expect(w.days).toHaveLength(7);
    expect(w.days[0].key).toBe('2026-11-09');
    expect(w.days[6].key).toBe('2026-11-15');
    expect(w.minutes).toBe(90);
    expect(w.activeDays).toBe(2);
    expect(w.kcalOut).toBe(510);
    expect(w.loggedDays).toBe(2);
    expect(w.avgNet).toBe(Math.round(((1400 - 150) + 1500) / 2));
    expect(w.guidePct).toBeCloseTo(0.6, 5);
  });
  it('caps the guide at 100 percent and handles an empty week', () => {
    expect(weeklyActivity({ '2026-11-15': { meals: [], exercise: [{ minutes: 400, kcal: 1 }] } }, now).guidePct).toBe(1);
    const e = weeklyActivity({}, now);
    expect(e).toMatchObject({ minutes: 0, activeDays: 0, avgNet: null, guidePct: 0 });
  });
  it('words the line gently and drops the guide when asked', () => {
    expect(activityLine(weeklyActivity({}, now), true)).toMatch(/Even a 10 minute walk counts/);
    const w = weeklyActivity(days, now);
    expect(activityLine(w, true)).toBe('90 min on 2 days. A common guide is 150 minutes a week; any amount helps.');
    expect(activityLine(w, false)).toBe('90 min on 2 days.');
    expect(activityLine({ ...w, minutes: 10, activeDays: 1 }, false)).toBe('10 min on 1 day.');
  });
});
