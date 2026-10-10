import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { BaseDoc } from '../../models/common';
import { createLocalDocStore } from '../../services/storage/docStore';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { mergeCollections, pickNewer } from '../../services/storage/lww';
import { createRemoteDocStore, docPath } from '../../services/storage/remote';
import { createSyncedDocStore } from '../../services/storage/syncedStore';
import { fakeFirestore } from './fakes';

const doc = (id: string, updatedAt: number, extra: Record<string, unknown> = {}): BaseDoc & Record<string, unknown> => ({
  id,
  createdAt: 1,
  updatedAt,
  schemaVersion: 1,
  deleted: false,
  ...extra,
});

function setup() {
  const kv = memoryKeyValueStore();
  const fs = fakeFirestore();
  const local = createLocalDocStore(kv, 'u1');
  const remote = createRemoteDocStore(fs.adapter, 'u1');
  const errors: unknown[] = [];
  const store = createSyncedDocStore({ local, remote, kv, owner: 'u1', debounceMs: 1000, onError: (e) => errors.push(e) });
  return { kv, fs, local, remote, store, errors };
}

describe('last write wins', () => {
  it('keeps the newer copy, and the cloud copy on a tie', () => {
    const a = doc('x', 5);
    const b = doc('x', 9);
    expect(pickNewer(a, b)).toBe(b);
    expect(pickNewer(b, a)).toBe(b);
    const tieLocal = doc('x', 7, { v: 'local' });
    const tieRemote = doc('x', 7, { v: 'remote' });
    expect(pickNewer(tieLocal, tieRemote)).toBe(tieRemote);
    expect(pickNewer(undefined, a)).toBe(a);
  });

  it('says which side each merged document must go to, and skips identical ones', () => {
    const same = doc('same', 3);
    const { merged, pushToRemote, pullToLocal } = mergeCollections(
      { onlyLocal: doc('onlyLocal', 1), newerLocal: doc('newerLocal', 9), same },
      { onlyRemote: doc('onlyRemote', 1), newerLocal: doc('newerLocal', 2), same: { ...same } },
    );
    expect(Object.keys(merged).sort()).toEqual(['newerLocal', 'onlyLocal', 'onlyRemote', 'same']);
    expect(pushToRemote.map((d) => d.id).sort()).toEqual(['newerLocal', 'onlyLocal']);
    expect(pullToLocal.map((d) => d.id)).toEqual(['onlyRemote']);
  });

  it('a deletion on one device wins over an older edit on another', () => {
    const { merged } = mergeCollections({ m: doc('m', 5, { kcal: 1 }) }, { m: doc('m', 8, { deleted: true }) });
    expect(merged.m.deleted).toBe(true);
  });
});

describe('cloud paths', () => {
  it('maps the profile to users/{uid} and other collections under it', () => {
    expect(docPath('u1', 'profile', 'profile')).toBe('users/u1');
    expect(docPath('u1', 'mealLogs', 'abc')).toBe('users/u1/mealLogs/abc');
  });

  it('needs a user id', () => {
    expect(() => createRemoteDocStore(fakeFirestore().adapter, '')).toThrow();
  });

  it('reads the profile document and a subcollection', async () => {
    const fs = fakeFirestore();
    const remote = createRemoteDocStore(fs.adapter, 'u1');
    await remote.putMany('profile', [doc('profile', 1, { name: 'S' })]);
    await remote.putMany('mealLogs', [doc('a', 1), doc('b', 1)]);
    expect(Object.keys(await remote.getAll('profile'))).toEqual(['profile']);
    expect(Object.keys(await remote.getAll('mealLogs')).sort()).toEqual(['a', 'b']);
    expect(await remote.getAll('waterLogs')).toEqual({});
  });
});

describe('synced store (device first, then cloud)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves on the device at once and batches cloud writes after the debounce', async () => {
    const { store, fs } = setup();
    await store.putMany('waterLogs', [doc('water-1', 1, { glasses: 1 })]);
    await store.putMany('waterLogs', [doc('water-1', 2, { glasses: 2 })]);
    await store.putMany('waterLogs', [doc('water-1', 3, { glasses: 3 })]);
    expect(await store.getAll('waterLogs')).toMatchObject({ 'water-1': { glasses: 3 } });
    expect(fs.state.writes).toBe(0);
    expect(await store.pending()).toBe(1);
    expect(await store.flush()).toBe(1);
    expect(fs.state.batches).toBe(1);
    expect(fs.docs.get('users/u1/waterLogs/water-1')).toMatchObject({ glasses: 3 });
    expect(await store.pending()).toBe(0);
  });

  it('keeps writes queued while offline and sends them when back online', async () => {
    const { store, fs, errors } = setup();
    fs.state.offline = true;
    await store.putMany('mealLogs', [doc('m1', 1)]);
    expect(await store.flush()).toBe(0);
    expect(errors).toHaveLength(1);
    expect(await store.pending()).toBe(1);
    fs.state.offline = false;
    expect(await store.flush()).toBe(1);
    expect(fs.docs.has('users/u1/mealLogs/m1')).toBe(true);
  });

  it('the outbox survives an app restart (it is stored on the device)', async () => {
    const { kv, fs, local, remote } = setup();
    fs.state.offline = true;
    const first = createSyncedDocStore({ local, remote, kv, owner: 'u1', onError: () => {} });
    await first.putMany('mealLogs', [doc('m1', 1)]);
    await first.flush();
    fs.state.offline = false;
    const afterRestart = createSyncedDocStore({ local, remote, kv, owner: 'u1' });
    expect(await afterRestart.pending()).toBe(1);
    expect(await afterRestart.flush()).toBe(1);
  });

  it('pull brings cloud changes down and pushes newer device changes up', async () => {
    const { store, fs, local } = setup();
    await local.putMany('mealLogs', [doc('fromPhone', 9)]);
    fs.docs.set('users/u1/mealLogs/fromLaptop', doc('fromLaptop', 5));
    await store.pull('mealLogs');
    expect(Object.keys(await store.getAll('mealLogs')).sort()).toEqual(['fromLaptop', 'fromPhone']);
    expect(fs.docs.has('users/u1/mealLogs/fromPhone')).toBe(true);
  });

  it('the debounce timer flushes on its own', async () => {
    const { store, fs } = setup();
    await store.putMany('mealLogs', [doc('m1', 1)]);
    await jest.advanceTimersByTimeAsync(1000);
    expect(fs.docs.has('users/u1/mealLogs/m1')).toBe(true);
  });
});
