import { describe, expect, it } from '@jest/globals';

import { cleanAllergens, loadExcludedAllergens, rememberedFiltersKey, saveExcludedAllergens } from '../../services/rememberedFilters';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { ownerPrefix } from '../../services/storage/docStore';

describe('remembered allergen filter', () => {
  it('saves and loads per owner, under the owner prefix that Delete my data clears', async () => {
    const kv = memoryKeyValueStore();
    await saveExcludedAllergens(kv, 'guest', ['peanut', 'milk']);
    expect(await loadExcludedAllergens(kv, 'guest')).toEqual(['peanut', 'milk']);
    expect(await loadExcludedAllergens(kv, 'uid-1')).toEqual([]);
    expect(rememberedFiltersKey('guest').startsWith(ownerPrefix('guest'))).toBe(true);
  });

  it('removes the key when nothing is left out', async () => {
    const kv = memoryKeyValueStore();
    await saveExcludedAllergens(kv, 'guest', ['peanut']);
    await saveExcludedAllergens(kv, 'guest', []);
    expect(kv.dump()).toEqual({});
  });

  it('drops unknown ids and duplicates, and survives damaged values', async () => {
    expect(cleanAllergens(['peanut', 'peanut', 'chocolate', 3])).toEqual(['peanut']);
    expect(cleanAllergens('peanut')).toEqual([]);
    const kv = memoryKeyValueStore({ [rememberedFiltersKey('guest')]: '{not json' });
    expect(await loadExcludedAllergens(kv, 'guest')).toEqual([]);
    const old = memoryKeyValueStore({ [rememberedFiltersKey('guest')]: JSON.stringify({ version: 9, excludeAllergens: ['milk'] }) });
    expect(await loadExcludedAllergens(old, 'guest')).toEqual([]);
  });

  it('never throws when storage fails', async () => {
    const broken = { ...memoryKeyValueStore(), getItem: async () => Promise.reject(new Error('x')), setItem: async () => Promise.reject(new Error('x')) };
    expect(await loadExcludedAllergens(broken, 'guest')).toEqual([]);
    await expect(saveExcludedAllergens(broken, 'guest', ['milk'])).resolves.toBeUndefined();
  });
});
