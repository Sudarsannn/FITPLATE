import { describe, expect, it } from '@jest/globals';

import { fridgeRescue } from '../services/fridgeRescue';
import type { Dish } from '../models/research';

const ing = (id: string, name = id) => ({ ingredientId: id, name, quantity: 1, unit: 'g', householdMeasure: null });
const dish = (id: string, names: string[], o: Partial<Dish> = {}): Dish => ({ id, name: id, ingredients: names.map((n) => ing(n)), ...o }) as unknown as Dish;
const have = (...ids: string[]) => Object.fromEntries(ids.map((i) => [i, { name: i, ingredientId: i, quantity: 100, unit: 'g', updatedAt: 0 }]));
const category = (id: string) => (id === 'salt' ? 'Spices' : id === 'oil' ? 'Oils and fats' : id === 'rice' ? 'Grains' : 'Vegetables');

describe('fridge rescue', () => {
  const dishes = [dish('curry', ['onion', 'tomato', 'paneer', 'salt']), dish('salad', ['onion', 'tomato']), dish('rice', ['rice', 'peas', 'oil']), dish('ai', ['onion', 'tomato'], { ai: true } as never)];
  it('ranks by fewest missing and ignores staples, AI dishes and weak matches', () => {
    const r = fridgeRescue(dishes, have('onion', 'tomato'), { category });
    expect(r.map((m) => m.dish.id)).toEqual(['salad', 'curry']);
    expect(r[1].missing).toEqual(['paneer']);
    expect(r[0].missing).toEqual([]);
  });
  it('keeps rice and dal as main ingredients but ignores salt and oil', () => {
    const r = fridgeRescue(dishes, have('rice', 'peas'), { category });
    expect(r.map((m) => m.dish.id)).toEqual(['rice']);
    expect(r[0].missing).toEqual([]);
  });
  it('needs at least two ingredients in the kitchen and skips used-up items', () => {
    expect(fridgeRescue(dishes, have('onion'), { category })).toEqual([]);
    expect(fridgeRescue(dishes, { ...have('onion'), tomato: { name: 'tomato', ingredientId: 'tomato', quantity: 0, unit: 'g', updatedAt: 0 } }, { category })).toEqual([]);
  });
  it('honours the diet filter and the limit', () => {
    const r = fridgeRescue(dishes, have('onion', 'tomato', 'paneer'), { category, fits: (d) => d.id !== 'salad', limit: 1 });
    expect(r.map((m) => m.dish.id)).toEqual(['curry']);
  });
});

describe('fridge rescue seasonings by name', () => {
  it('ignores salt and oil by name even when the category is odd', () => {
    const d = { id: 'x', name: 'x', ingredients: [ing('a'), ing('b'), { ...ing('salt-id'), name: 'Salt (namak)' }] } as unknown as Dish;
    const r = fridgeRescue([d], have('a', 'b'), { category: () => 'Staples' });
    expect(r[0].missing).toEqual([]);
  });
});

describe('fridge rescue fats and water', () => {
  it('ignores any oil, ghee or water line', () => {
    const named = (n: string) => ({ ...ing(n), name: n });
    const d = { id: 'y', name: 'y', ingredients: [named('a'), named('b'), named('Groundnut oil (or any neutral cooking oil, or ghee)'), named('Reserved pasta water')] } as unknown as Dish;
    expect(fridgeRescue([d], have('a', 'b'), { category: () => 'Other' })[0].missing).toEqual([]);
  });
});
