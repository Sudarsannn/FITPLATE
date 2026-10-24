import { describe, expect, it } from '@jest/globals';

import { CAFETERIA_PLATE, dishesForSlot, firstDishOfDay, mealPrepDishes, isOfficeDay, pickerOrder, slotRank } from '../services/planSlots';

const d = (name: string, mealType: string[]) => ({ name, mealType });

describe('plan slots', () => {
  const poha = d('poha', ['breakfast']);
  const biryani = d('biryani', ['lunch', 'dinner']);
  const khichdi = d('khichdi', ['dinner', 'lunch']);
  const bare = d('bare', []);

  it('ranks by how typical the meal is', () => {
    expect(slotRank(biryani, 'lunch')).toBe(0);
    expect(slotRank(khichdi, 'lunch')).toBe(1);
    expect(slotRank(poha, 'dinner')).toBeNull();
    expect(slotRank(bare, 'breakfast')).toBeNull();
  });

  it('puts the typical dish first and keeps breakfast dishes out of lunch', () => {
    expect(dishesForSlot([khichdi, biryani, poha], 'lunch').map((x) => x.name)).toEqual(['biryani', 'khichdi']);
    expect(dishesForSlot([khichdi, biryani, poha], 'breakfast').map((x) => x.name)).toEqual(['poha']);
  });

  it('orders the picker without dropping anything', () => {
    expect(pickerOrder([poha, khichdi, biryani], 'dinner').map((x) => x.name)).toEqual(['khichdi', 'biryani', 'poha']);
  });

  it('knows office days', () => {
    expect(isOfficeDay(new Date('2026-10-26'))).toBe(true); // Monday
    expect(isOfficeDay(new Date('2026-10-25'))).toBe(false); // Sunday
  });
});

describe('meal prep and first dish', () => {
  const plan = { d1: { breakfast: 'a', lunch: CAFETERIA_PLATE, dinner: 'b' }, d2: { breakfast: 'a', dinner: 'c' }, d3: { dinner: 'd' } };
  it('collects two days of planned dishes with counts', () => {
    expect(mealPrepDishes(plan, ['d1', 'd2', 'd3'], ['a', 'b', 'c', 'd'], 2)).toEqual([{ id: 'a', servings: 2 }, { id: 'b', servings: 1 }, { id: 'c', servings: 1 }]);
  });
  it('falls back to the list when the plan has none', () => {
    expect(mealPrepDishes({}, ['d1'], ['a', 'b', 'c', 'd', 'e'], 2)).toHaveLength(4);
  });
  it('finds the first dish of the day', () => {
    expect(firstDishOfDay(plan, ['d1', 'd2'], ['a', 'b'])).toBe('a');
    expect(firstDishOfDay({ d1: { lunch: CAFETERIA_PLATE, dinner: 'b' } }, ['d1'], ['b'])).toBe('b');
    expect(firstDishOfDay(plan, ['d1'], ['z'])).toBeNull();
  });
});
