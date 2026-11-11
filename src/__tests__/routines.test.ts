import { describe, expect, it } from '@jest/globals';

import { DAY_LABELS, exerciseById, itemSeconds, liveItems, moveItem, PREBUILT_ROUTINES, routineKcal, routineMinutes, scheduledOn, toggleDay } from '../services/routines';
import { exerciseKcal } from '../services/fitness';

describe('prebuilt routines', () => {
  it('only name exercises that are in the research library', () => {
    for (const r of PREBUILT_ROUTINES) {
      expect(r.items.length).toBeGreaterThanOrEqual(4);
      for (const i of r.items) expect(exerciseById(i.exerciseId)).toBeDefined();
      expect(liveItems(r)).toHaveLength(r.items.length);
    }
  });

  it('the 15-minute home routine takes about 15 minutes and needs no equipment', () => {
    const home = PREBUILT_ROUTINES.find((r) => r.id === 'home-15')!;
    expect(routineMinutes(home)).toBeGreaterThanOrEqual(11);
    expect(routineMinutes(home)).toBeLessThanOrEqual(19);
    for (const i of home.items) {
      const e = exerciseById(i.exerciseId)!;
      expect(e.gymAccess.includes('none') || e.gymAccess.length === 0).toBe(true);
    }
  });

  it('the desk-break routine is quiet and flat-friendly', () => {
    const desk = PREBUILT_ROUTINES.find((r) => r.id === 'desk-break')!;
    for (const i of desk.items) expect(exerciseById(i.exerciseId)!.flatFriendly).toBe(true);
    expect(routineMinutes(desk)).toBeLessThanOrEqual(15);
  });

  it('the beginner gym plan is three days on Mon, Wed and Fri', () => {
    expect(PREBUILT_ROUTINES.filter((r) => r.id.startsWith('gym-')).flatMap((r) => r.days)).toEqual([1, 3, 5]);
  });
});

describe('duration and calories', () => {
  const plank = { exerciseId: 'plank-and-side-plank' };

  it('adds each move\'s sets, holds and rests plus 20 s between moves', () => {
    const one = itemSeconds(plank);
    expect(one).toBeGreaterThan(60);
    const two = { items: [plank, plank] };
    expect(routineMinutes(two)).toBe(Math.round((one * 2 + 20) / 60));
    expect(routineMinutes({ items: [] })).toBe(0);
  });

  it('skips moves that were removed from the library', () => {
    expect(routineMinutes({ items: [{ exerciseId: 'gone' }] })).toBe(0);
    expect(routineKcal({ items: [{ exerciseId: 'gone' }] }, 70)).toBe(0);
  });

  it('counts MET over working time only, scaled by body weight', () => {
    const r = { items: [plank] };
    const e = exerciseById('plank-and-side-plank')!;
    // 3 sets x 30 s hold = 90 s of work; rests do not count.
    expect(routineKcal(r, 70)).toBe(exerciseKcal(e.met!, 1.5, 70));
    expect(routineKcal(r, 90)).toBeGreaterThan(routineKcal(r, 60));
    expect(routineKcal(r, null)).toBe(routineKcal(r, 70));
  });

  it('a cardio block stretches to the chosen minutes', () => {
    const bike = { exerciseId: 'stationary-bike', minutes: 30 };
    expect(routineMinutes({ items: [bike] })).toBe(30);
    expect(routineKcal({ items: [bike] }, 70)).toBeGreaterThan(routineKcal({ items: [{ exerciseId: 'stationary-bike' }] }, 70));
  });
});

describe('schedule and editing helpers', () => {
  it('lists routines on their chosen days', () => {
    const own = [{ id: 'r1', routine: { name: 'Mine', items: [], days: [2, 4] } }];
    expect(scheduledOn(2, own).map((r) => r.name)).toEqual(['Mine']);
    expect(scheduledOn(1, own).map((r) => r.name)).toEqual(['Beginner gym, day 1: legs']);
    expect(scheduledOn(0, own)).toEqual([]);
    expect(DAY_LABELS).toHaveLength(7);
  });

  it('toggles days in order and moves items', () => {
    expect(toggleDay([3], 1)).toEqual([1, 3]);
    expect(toggleDay([1, 3], 1)).toEqual([3]);
    expect(moveItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
  });
});
