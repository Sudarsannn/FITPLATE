import { describe, expect, it } from '@jest/globals';

import { addLeftover, addMealLeftover, fridgeDays, leftoverStatus, reminderAt, removeLeftover } from '../services/leftovers';

const D = 86_400_000;
const at = new Date(2026, 9, 31, 20, 0).getTime();

describe('leftovers', () => {
  it('reads fridge days from the storage note', () => {
    expect(fridgeDays('Fridge: 2-3 days in an airtight box. Freezer: 1 month.')).toBe(2);
    expect(fridgeDays('Freezes for 30 days; in the fridge keep 3 days.')).toBe(3);
    expect(fridgeDays('Best eaten fresh.')).toBe(1);
    expect(fridgeDays('Keep covered.')).toBe(2);
    expect(fridgeDays(null)).toBe(2);
    expect(fridgeDays('Fridge 20 days')).toBe(7);
  });
  it('replaces an earlier entry for the same dish and removes on finish', () => {
    const dish = { id: 'poha', name: 'Poha', storage: 'Fridge 1 day', leftoverRemix: 'Poha cutlets' };
    const one = addLeftover([], dish, at);
    const two = addLeftover(one, { ...dish, storage: 'Fridge 3 days' }, at + D);
    expect(two).toHaveLength(1);
    expect(two[0].useByDays).toBe(3);
    expect(removeLeftover(two, 'poha')).toEqual([]);
  });
  it('counts calendar days and sorts the soonest first', () => {
    const list = [
      { dishId: 'a', name: 'A', storedAt: at, useByDays: 3, remix: null },
      { dishId: 'b', name: 'B', storedAt: at - D, useByDays: 1, remix: null },
      { dishId: 'c', name: 'C', storedAt: at - 2 * D, useByDays: 1, remix: null },
      { dishId: 'old', name: 'Old', storedAt: at - 10 * D, useByDays: 2, remix: null },
      { dishId: 'gone', name: 'Gone', storedAt: at - 3 * D, useByDays: 1, remix: null },
    ];
    const s = leftoverStatus(list, at + 3600_000);
    expect(s.map((x) => [x.dishId, x.daysLeft, x.state])).toEqual([['c', -1, 'past'], ['b', 0, 'today'], ['a', 3, 'ok']]);
  });
});

describe('leftovers from any meal (1 Nov 2026)', () => {
  it('keeps a non-dish meal for 1 day under its own key and replaces a repeat', () => {
    const a = addMealLeftover([], { id: 'm1', name: 'Restaurant paneer' }, at, 'ordered');
    expect(a[0]).toMatchObject({ dishId: 'meal:m1', useByDays: 1, source: 'ordered', remix: null });
    expect(addMealLeftover(a, { id: 'm1', name: 'Restaurant paneer' }, at + D)).toHaveLength(1);
  });
  it('remembers where the dish came from', () => {
    expect(addLeftover([], { id: 'poha', name: 'Poha', storage: 'Fridge 2 days', leftoverRemix: null }, at, 'cooked')[0].source).toBe('cooked');
  });
  it('reminds at 9:00 on the use-by day, and not at all once that time has passed', () => {
    const l = { storedAt: new Date(2026, 10, 1, 20, 0).getTime(), useByDays: 2 };
    expect(reminderAt(l, new Date(2026, 10, 1, 21, 0).getTime())).toEqual(new Date(2026, 10, 3, 9, 0, 0));
    expect(reminderAt(l, new Date(2026, 10, 3, 10, 0).getTime())).toBeNull();
  });
});
