import { describe, expect, it } from '@jest/globals';

import type { Doc } from '../../models/common';
import type { MealLog } from '../../models/logs';
import { createLocalDocStore } from '../../services/storage/docStore';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { createRepository, migrateDoc, type DocSchema } from '../../services/storage/repository';
import { SCHEMAS } from '../../services/storage/schemas';
import { fakeClock } from './fakes';

const meal = (over: Partial<MealLog> = {}): MealLog => ({
  timestamp: 1,
  dateKey: '2026-10-10',
  name: 'Poha',
  emoji: '🍚',
  dishId: 'poha',
  source: 'dish',
  kcal: 300,
  proteinG: 8,
  fibreG: 3,
  cooked: true,
  ...over,
});

function setup() {
  const kv = memoryKeyValueStore();
  const clock = fakeClock();
  let n = 0;
  const store = createLocalDocStore(kv, 'guest');
  const repo = createRepository<MealLog>(store, SCHEMAS.mealLogs, { now: clock.now, newId: () => `id${++n}` });
  return { kv, clock, store, repo };
}

describe('repository', () => {
  it('saves and loads a document with the common fields', async () => {
    const { repo, clock } = setup();
    const saved = await repo.create(meal());
    expect(saved).toMatchObject({ id: 'id1', createdAt: clock.now(), updatedAt: clock.now(), schemaVersion: 1, deleted: false, name: 'Poha' });
    expect(await repo.get('id1')).toEqual(saved);
  });

  it('keeps a caller-chosen id', async () => {
    const { repo } = setup();
    expect((await repo.create({ ...meal(), id: 'water-2026-10-10' })).id).toBe('water-2026-10-10');
  });

  it('updates fields and moves updatedAt forward', async () => {
    const { repo, clock } = setup();
    const saved = await repo.create(meal());
    clock.tick(5000);
    const updated = await repo.update(saved.id, { kcal: 350 });
    expect(updated?.kcal).toBe(350);
    expect(updated!.updatedAt).toBeGreaterThan(saved.updatedAt);
    expect(updated!.createdAt).toBe(saved.createdAt);
  });

  it('updatedAt always increases, even if the clock has not moved', async () => {
    const { repo } = setup();
    const saved = await repo.create(meal());
    const updated = await repo.update(saved.id, { kcal: 1 });
    expect(updated!.updatedAt).toBe(saved.updatedAt + 1);
  });

  it('soft deletes: hidden from reads but kept for other devices', async () => {
    const { repo, store } = setup();
    const saved = await repo.create(meal());
    expect(await repo.remove(saved.id)).toBe(true);
    expect(await repo.get(saved.id)).toBeNull();
    expect(await repo.list()).toEqual([]);
    expect((await store.getAll<Doc<MealLog>>('mealLogs'))[saved.id].deleted).toBe(true);
    expect(await repo.remove(saved.id)).toBe(false);
    expect(await repo.update(saved.id, { kcal: 1 })).toBeNull();
  });

  it('lists with a filter, oldest first', async () => {
    const { repo, clock } = setup();
    await repo.create(meal({ dateKey: '2026-10-09' }));
    clock.tick();
    await repo.create(meal({ dateKey: '2026-10-10', name: 'Upma' }));
    clock.tick();
    await repo.create(meal({ dateKey: '2026-10-10', name: 'Dal' }));
    expect((await repo.list((d) => d.dateKey === '2026-10-10')).map((d) => d.name)).toEqual(['Upma', 'Dal']);
  });

  it('upsert creates once, then updates the same document', async () => {
    const { repo } = setup();
    await repo.upsert('m1', meal());
    await repo.upsert('m1', meal({ kcal: 999 }));
    const all = await repo.list();
    expect(all).toHaveLength(1);
    expect(all[0].kcal).toBe(999);
  });

  it('migrates older documents when read and saves the upgraded copy', async () => {
    const { store, clock } = setup();
    const v2: DocSchema = {
      collection: 'mealLogs',
      version: 2,
      migrations: { 1: (d) => ({ ...d, source: d.cooked ? 'dish' : 'quick' }) },
    };
    await store.putMany('mealLogs', [{ id: 'old', createdAt: 1, updatedAt: 1, schemaVersion: 1, deleted: false, cooked: false } as never]);
    const repo = createRepository<MealLog>(store, v2, { now: clock.now });
    expect(await repo.get('old')).toMatchObject({ schemaVersion: 2, source: 'quick' });
    expect((await store.getAll<Doc<MealLog>>('mealLogs')).old).toMatchObject({ schemaVersion: 2 });
  });

  it('refuses to guess when a migration step is missing', () => {
    const schema: DocSchema = { collection: 'x', version: 3, migrations: { 1: (d) => d } };
    expect(() => migrateDoc(schema, { id: 'a', createdAt: 0, updatedAt: 0, schemaVersion: 1, deleted: false })).toThrow('no migration from version 2');
  });

  it('two quick saves to the device never overwrite each other', async () => {
    const { repo } = setup();
    await Promise.all([repo.create(meal({ name: 'A' })), repo.create(meal({ name: 'B' }))]);
    expect((await repo.list()).map((d) => d.name).sort()).toEqual(['A', 'B']);
  });
});
