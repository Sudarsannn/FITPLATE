import { describe, expect, it } from '@jest/globals';

import { researchExercises } from '../data/research';
import { byNumber, exerciseDoc, exerciseFilterGroups } from '../services/exerciseLibrary';
import { runSearch, type Selection } from '../services/search';

const groups = exerciseFilterGroups(researchExercises);
const search = (query: string, selection: Selection = {}) =>
  runSearch(researchExercises, { toDoc: exerciseDoc, query, groups, selection, sort: 'relevance', tieBreak: byNumber }).map((r) => r.item);

describe('exercise library', () => {
  it('shows every imported exercise with no query and no filters', () => {
    expect(search('')).toHaveLength(researchExercises.length);
  });

  it('only offers chips that match something', () => {
    expect(groups.length).toBeGreaterThanOrEqual(3);
    for (const g of groups) for (const o of g.options) expect(researchExercises.some(o.test)).toBe(true);
  });

  it('finds by name, spelling slip and muscle', () => {
    expect(search('plank').some((e) => /plank/i.test(e.name))).toBe(true);
    expect(search('pushup').some((e) => /push-up/i.test(e.name))).toBe(true);
    expect(search('quadriceps').length).toBeGreaterThan(0);
    expect(search('xyzzyq')).toEqual([]);
  });

  it('no-equipment filter drops machines and barbells', () => {
    const none = search('', { gear: ['none'] });
    expect(none.length).toBeGreaterThan(0);
    expect(none.length).toBeLessThan(researchExercises.length);
    expect(none.some((e) => /leg press|barbell back squat/i.test(e.name))).toBe(false);
  });

  it('chips in one group combine with any, groups combine with all', () => {
    const lower = search('', { muscle: ['lower'] });
    const upper = search('', { muscle: ['upper'] });
    expect(search('', { muscle: ['lower', 'upper'] })).toHaveLength(new Set([...lower, ...upper]).size);
    const both = search('', { muscle: ['lower'], gear: ['none'] });
    expect(both.every((e) => lower.includes(e))).toBe(true);
    expect(both.length).toBeLessThanOrEqual(lower.length);
  });

  it('flat-friendly and time filters keep only matching items', () => {
    const flat = search('', { home: ['flat'] });
    expect(flat.every((e) => e.flatFriendly === true)).toBe(true);
    const short = search('', { time: ['u5'] });
    expect(short.every((e) => (e.searchTags?.typicalMinutes ?? 99) < 5)).toBe(true);
  });
});
