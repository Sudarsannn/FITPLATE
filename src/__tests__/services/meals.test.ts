import { describe, expect, it } from '@jest/globals';

import type { DayLog, MealLog } from '../../lib/store';
import { dayGroup, groupMeals, howOf, mealMoney, slotOf } from '../../services/meals';

const at = (h: number, day = 20) => new Date(2026, 9, day, h, 15).getTime();
const meal = (over: Partial<MealLog>): MealLog => ({ name: 'Dal', emoji: '🍛', kcal: 300, protein: 12, fibre: 6, cooked: false, at: at(13), ...over });

describe('meals', () => {
  it('buckets by time of day', () => {
    expect([8, 12, 17, 21, 2].map((h) => slotOf(at(h)))).toEqual(['breakfast', 'lunch', 'snack', 'dinner', 'dinner']);
  });

  it('reads older logs without `how`', () => {
    expect(howOf({ cooked: true })).toBe('cooked');
    expect(howOf({ cooked: false })).toBe('logged');
    expect(howOf({ cooked: false, how: 'ordered' })).toBe('ordered');
  });

  it('colours the money by how the meal happened', () => {
    expect(mealMoney(meal({ how: 'cooked', costInr: 40, orderInr: 120, cooked: true }), undefined, null, null)).toMatchObject({ kind: 'cooked', rupees: 80, label: 'Saved ₹80' });
    expect(mealMoney(meal({ how: 'ordered', orderInr: 150 }), undefined, 50, 120)).toMatchObject({ kind: 'ordered', rupees: 100 });
    expect(mealMoney(meal({}), undefined, 40, 100)).toMatchObject({ kind: 'logged', rupees: 60, label: 'Could save ₹60' });
    expect(mealMoney(meal({}), undefined, null, 100)).toBeNull();
  });

  it('groups newest day first, by time of day, skipping empty days', () => {
    const days: Record<string, DayLog> = {
      '2026-10-19': { meals: [meal({ at: at(9, 19) })], exercise: [], water: 0 },
      '2026-10-20': { meals: [meal({ at: at(20) }), meal({ at: at(8), name: 'Poha' })], exercise: [], water: 0 },
      '2026-10-21': { meals: [], exercise: [], water: 2 },
    };
    const g = groupMeals(days);
    expect(g.map((d) => d.dateKey)).toEqual(['2026-10-20', '2026-10-19']);
    expect(g[0].slots.map((s) => s.slot)).toEqual(['breakfast', 'dinner']);
    expect(dayGroup('2026-10-20', days['2026-10-20']).kcal).toBe(600);
  });
});
