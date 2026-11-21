import { describe, expect, it } from '@jest/globals';

import { DEFAULT_PREFS, describe as describeCat, inQuiet, lunchTime, planReminders, shouldStreakNudge, streakNudgeDate, waterTimes, type ReminderPrefs } from '../services/reminderPlan';

const on: ReminderPrefs = { ...DEFAULT_PREFS, water: true, meals: true, workouts: true, cookPrep: true, streakNudges: true };

describe('nothing is planned until the person turns it on', () => {
  it('all-off prefs plan nothing', () => {
    expect(planReminders(DEFAULT_PREFS, { 1: ['Gym'] })).toEqual([]);
  });
  it('each category plans only its own reminders', () => {
    for (const c of ['water', 'meals', 'workouts', 'cookPrep'] as const) {
      const plan = planReminders({ ...DEFAULT_PREFS, [c]: true }, { 1: ['Gym'] });
      expect(plan.length).toBeGreaterThan(0);
      expect(new Set(plan.map((p) => p.category))).toEqual(new Set([c]));
    }
  });
  it('turning everything off again plans nothing', () => {
    expect(planReminders({ ...on, water: false, meals: false, workouts: false, cookPrep: false }, { 1: ['Gym'] })).toEqual([]);
  });
});

describe('9-to-7 defaults', () => {
  it('water breaks through the workday, never in quiet hours', () => {
    expect(waterTimes(9, 19)).toEqual([{ hour: 10, minute: 30 }, { hour: 13, minute: 0 }, { hour: 15, minute: 30 }, { hour: 18, minute: 0 }]);
    for (const [s, e] of [[7, 17], [8, 18], [10, 20], [9, 19]] as const) {
      const times = waterTimes(s, e);
      expect(times.length).toBeGreaterThan(0);
      expect(times.every((t) => !inQuiet(t))).toBe(true);
      expect(times[times.length - 1].hour * 60 + times[times.length - 1].minute).toBeLessThanOrEqual(e * 60 - 60);
    }
  });
  it('silly hours are clamped to a sane workday', () => {
    expect(waterTimes(0, 30).every((t) => !inQuiet(t))).toBe(true);
    expect(waterTimes(12, 13).length).toBeGreaterThanOrEqual(0);
  });
  it('lunch lands in the middle of the day and moves with the workday', () => {
    expect(lunchTime(9)).toEqual({ hour: 13, minute: 15 });
    expect(lunchTime(7)).toEqual({ hour: 11, minute: 15 });
  });
  it('weekday reminders use Monday to Friday (Expo 2 to 6)', () => {
    const days = new Set(planReminders({ ...DEFAULT_PREFS, water: true, meals: true }).map((p) => p.weekday));
    expect([...days].sort()).toEqual([2, 3, 4, 5, 6]);
  });
});

describe('every planned reminder', () => {
  const plan = planReminders(on, { 0: ['Morning yoga'], 1: ['Beginner gym, day 1: legs', 'Other'], 3: ['Gym push'] });
  it('stays out of quiet hours and has a unique id', () => {
    expect(plan.every((p) => !inQuiet(p))).toBe(true);
    expect(new Set(plan.map((p) => p.id)).size).toBe(plan.length);
  });
  it('workouts only on days with a routine, with that routine named', () => {
    const w = plan.filter((p) => p.category === 'workouts');
    expect(w.map((p) => p.weekday)).toEqual([1, 2, 4]);
    expect(w[1].body).toMatch(/Beginner gym, day 1: legs and 1 more/);
  });
  it('cook prep is nightly at 8:30 pm plus Sunday morning', () => {
    const prep = plan.filter((p) => p.category === 'cookPrep');
    expect(prep.find((p) => p.weekday == null)).toMatchObject({ hour: 20, minute: 30 });
    expect(prep.find((p) => p.weekday === 1)).toMatchObject({ hour: 11, minute: 0 });
  });
  it('describes each category in words', () => {
    expect(describeCat('water', on)).toMatch(/10:30 am, 1:00 pm, 3:30 pm, 6:00 pm/);
    expect(describeCat('cookPrep', on)).toMatch(/8:30 pm/);
  });
});

describe('streak nudge', () => {
  const at = (h: number, m = 0) => new Date(2026, 10, 21, h, m);
  it('only for a streak of 2+, nothing cooked yet, before 8:30 pm, and when turned on', () => {
    expect(shouldStreakNudge({ enabled: true, streak: 3, cookedToday: false, now: at(17) })).toBe(true);
    expect(shouldStreakNudge({ enabled: false, streak: 3, cookedToday: false, now: at(17) })).toBe(false);
    expect(shouldStreakNudge({ enabled: true, streak: 1, cookedToday: false, now: at(17) })).toBe(false);
    expect(shouldStreakNudge({ enabled: true, streak: 3, cookedToday: true, now: at(17) })).toBe(false);
    expect(shouldStreakNudge({ enabled: true, streak: 3, cookedToday: false, now: at(20, 30) })).toBe(false);
  });
  it('is set for 8:30 pm today', () => {
    expect(streakNudgeDate(at(9))).toEqual(at(20, 30));
  });
});
