import { describe, expect, it } from '@jest/globals';

import { memoryKeyValueStore } from '../../services/storage/kv';
import { createStorageService, fullKey, type StorageKey } from '../../services/storage/storageService';

type Settings = { units: 'metric'; glassesTarget: number };

const v2: StorageKey<Settings> = {
  name: 'settings',
  version: 2,
  fallback: () => ({ units: 'metric', glassesTarget: 8 }),
  migrate: (data, from) => {
    const old = data as { target?: number };
    expect(from).toBe(1);
    return { units: 'metric', glassesTarget: old.target ?? 8 };
  },
};

describe('storage service', () => {
  it('returns the fallback when nothing is stored', async () => {
    const s = createStorageService(memoryKeyValueStore());
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 8 });
  });

  it('writes a versioned envelope and reads it back', async () => {
    const kv = memoryKeyValueStore();
    const s = createStorageService(kv);
    await s.write(v2, { units: 'metric', glassesTarget: 10 });
    expect(JSON.parse(kv.dump()['fitplate.settings.v2'])).toEqual({ version: 2, data: { units: 'metric', glassesTarget: 10 } });
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 10 });
  });

  it('migrates an older version forward and saves the upgraded copy', async () => {
    const kv = memoryKeyValueStore({ [fullKey({ name: 'settings', version: 1 })]: JSON.stringify({ version: 1, data: { target: 12 } }) });
    const s = createStorageService(kv);
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 12 });
    expect(kv.dump()['fitplate.settings.v2']).toBeDefined();
  });

  it('ignores corrupt values instead of crashing', async () => {
    const s = createStorageService(memoryKeyValueStore({ 'fitplate.settings.v2': '{not json' }));
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 8 });
  });

  it('exports and resets only FitPlate keys', async () => {
    const kv = memoryKeyValueStore({ 'other.app': 'x', 'fitplate.a.v1': JSON.stringify({ version: 1, data: 1 }), 'fitplate.b.v1': 'raw' });
    const s = createStorageService(kv);
    expect(Object.keys(await s.exportAll()).sort()).toEqual(['fitplate.a.v1', 'fitplate.b.v1']);
    expect(await s.resetAll()).toBe(2);
    expect(kv.dump()).toEqual({ 'other.app': 'x' });
  });
});
