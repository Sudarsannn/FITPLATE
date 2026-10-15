import { describe, expect, it } from '@jest/globals';

import {
  activeCount,
  allowedSlips,
  editDistance,
  normalise,
  optionCounts,
  passesFilters,
  runSearch,
  scoreDoc,
  sortItems,
  soundAlike,
  toggle,
  wordMatch,
  type FilterGroup,
  type SearchDoc,
  type SortOption,
} from '../../services/search';

type Item = { id: string; name: string; tags: string[]; kcal: number | null; extra?: string[] };
const ITEMS: Item[] = [
  { id: 'a', name: 'Chicken Biryani', tags: ['Non-veg', 'Lunch'], kcal: 660, extra: ['Basmati rice', 'Chicken'] },
  { id: 'b', name: 'Veg Biryani', tags: ['Veg', 'Lunch', 'Jain option'], kcal: 480, extra: ['Basmati rice', 'Carrot'] },
  { id: 'c', name: 'Poha', tags: ['Veg', 'Breakfast', 'Contains peanut'], kcal: 390, extra: ['Flattened rice (poha)', 'Peanuts'] },
  { id: 'd', name: 'Palak Paneer', tags: ['Veg', 'Dinner', 'Contains milk'], kcal: null, extra: ['Spinach (palak)', 'Paneer'] },
];
const doc = (i: Item): SearchDoc => ({ id: i.id, name: i.name, tags: i.tags, extra: i.extra });
const GROUPS: FilterGroup<Item>[] = [
  {
    id: 'diet',
    label: 'Diet',
    mode: 'any',
    options: [
      { id: 'veg', label: 'Veg', test: (i) => i.tags.includes('Veg') },
      { id: 'non-veg', label: 'Non-veg', test: (i) => i.tags.includes('Non-veg') },
    ],
  },
  { id: 'meal', label: 'Meal', mode: 'any', options: ['Breakfast', 'Lunch', 'Dinner'].map((m) => ({ id: m, label: m, test: (i: Item) => i.tags.includes(m) })) },
  {
    id: 'allergen',
    label: 'Leave out',
    mode: 'exclude',
    options: [
      { id: 'peanut', label: 'Peanut', test: (i) => i.tags.includes('Contains peanut') },
      { id: 'milk', label: 'Milk', test: (i) => i.tags.includes('Contains milk') },
    ],
  },
];
const byId = (a: Item, b: Item) => a.id.localeCompare(b.id);
const ids = (r: { item: Item }[]) => r.map((x) => x.item.id);

describe('text matching', () => {
  it('normalises case, accents and punctuation', () => {
    expect(normalise('  Chole (Chana-Masala)! ')).toBe('chole chana masala');
    expect(normalise('Crème brûlée')).toBe('creme brulee');
  });

  it('measures spelling slips, including swapped letters', () => {
    expect(editDistance('biryani', 'biryani')).toBe(0);
    expect(editDistance('biryani', 'biriyani')).toBe(1);
    expect(editDistance('brhiyani', 'biryani')).toBe(3);
    expect(editDistance('paneer', 'panir')).toBe(2);
    expect(editDistance('abc', 'abcdefgh', 2)).toBe(3);
    expect(editDistance('ab', 'ba')).toBe(1);
  });

  it('folds common Indian spelling variants', () => {
    expect(soundAlike('brhiyani')).toBe('briyani');
    expect(soundAlike('paneer')).toBe(soundAlike('panir'));
    expect(soundAlike('dhal')).toBe('dal');
    expect(soundAlike('kawa')).toBe('kava');
  });

  it('allows more slips in longer words and none in short ones', () => {
    expect(allowedSlips('dal')).toBe(0);
    expect(allowedSlips('poha')).toBe(1);
    expect(allowedSlips('biryani')).toBe(2);
    expect(wordMatch('dal', 'dhal')).toBe(0);
    expect(wordMatch('bir', 'biryani')).toBe(0.85);
    expect(wordMatch('ryan', 'biryani')).toBe(0.6);
    expect(wordMatch('brhiyani', 'biryani')).toBe(0.5);
  });

  it('needs every query word to match somewhere', () => {
    expect(scoreDoc(doc(ITEMS[0]), 'chicken rice')).toBeGreaterThan(0);
    expect(scoreDoc(doc(ITEMS[2]), 'chicken rice')).toBe(0);
    expect(scoreDoc(doc(ITEMS[0]), '')).toBe(1);
    expect(scoreDoc(doc(ITEMS[0]), '  ')).toBe(1);
  });

  it('ranks name hits above ingredient hits', () => {
    const r = runSearch(ITEMS, { toDoc: doc, query: 'palak', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(r)).toEqual(['d']);
    const rice = runSearch(ITEMS, { toDoc: doc, query: 'poha', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(rice)[0]).toBe('c');
  });

  it('finds biryani from a misspelling and matches tags', () => {
    const r = runSearch(ITEMS, { toDoc: doc, query: 'brhiyani', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(r).sort()).toEqual(['a', 'b']);
    const jain = runSearch(ITEMS, { toDoc: doc, query: 'jain', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(jain)).toEqual(['b']);
  });
});

describe('filters', () => {
  it('ORs inside a group and ANDs across groups', () => {
    const sel = { diet: ['veg'], meal: ['Lunch', 'Breakfast'] };
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, sel)).map((i) => i.id)).toEqual(['b', 'c']);
  });

  it('excludes items with a chosen allergen', () => {
    const sel = { allergen: ['peanut', 'milk'] };
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, sel)).map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('ignores empty groups and unknown option ids', () => {
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, { diet: [], meal: ['Nope'] })).length).toBe(0);
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, { diet: [] })).length).toBe(4);
  });

  it('toggles chips and counts them', () => {
    let s = toggle({}, 'diet', 'veg');
    s = toggle(s, 'meal', 'Lunch');
    expect(activeCount(s)).toBe(2);
    s = toggle(s, 'diet', 'veg');
    expect(s.diet).toEqual([]);
    expect(activeCount(s)).toBe(1);
  });

  it('counts what each chip would leave, given the other groups', () => {
    const c = optionCounts(ITEMS, GROUPS, { diet: ['veg'] });
    expect(c['diet:non-veg']).toBe(1); // other diet chips ignore the diet group's own choice
    expect(c['meal:Lunch']).toBe(1);
    expect(c['allergen:peanut']).toBe(2); // veg dishes left after leaving out peanut
  });
});

describe('sort', () => {
  const lowKcal: SortOption<Item> = { id: 'kcal', label: 'Lowest calories', value: (i) => i.kcal, direction: 'asc' };
  it('sorts by value and puts missing values last', () => {
    expect(sortItems(ITEMS, lowKcal, byId).map((i) => i.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(sortItems(ITEMS, { ...lowKcal, direction: 'desc' }, byId).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('applies the sort after search and filters', () => {
    const r = runSearch(ITEMS, { toDoc: doc, query: 'rice', groups: GROUPS, selection: {}, sort: lowKcal, tieBreak: byId });
    expect(ids(r)).toEqual(['c', 'b', 'a']);
  });
});
