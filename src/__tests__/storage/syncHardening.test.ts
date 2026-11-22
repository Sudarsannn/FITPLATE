import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { BaseDoc } from '../../models/common';
import { deleteAllUserData } from '../../services/storage/deleteUser';
import { createLocalDocStore } from '../../services/storage/docStore';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { createRemoteDocStore } from '../../services/storage/remote';
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

/** One phone or laptop: its own device storage, the same cloud. */
function device(fs: ReturnType<typeof fakeFirestore>) {
  const kv = memoryKeyValueStore();
  const local = createLocalDocStore(kv, 'u1');
  const remote = createRemoteDocStore(fs.adapter, 'u1');
  const errors: unknown[] = [];
  const store = createSyncedDocStore({ local, remote, kv, owner: 'u1', debounceMs: 1000, onError: (e) => errors.push(e) });
  return { store, errors };
}

describe('two devices', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('edits made offline on both devices settle on the newer one after both reconnect', async () => {
    const fs = fakeFirestore();
    const phone = device(fs);
    const laptop = device(fs);
    await phone.store.putMany('waterLogs', [doc('w', 1, { glasses: 1 })]);
    await phone.store.flush();
    await laptop.store.pull('waterLogs');

    fs.state.offline = true;
    await phone.store.putMany('waterLogs', [doc('w', 10, { glasses: 4 })]);
    await laptop.store.putMany('waterLogs', [doc('w', 20, { glasses: 6 })]);
    await phone.store.flush();
    await laptop.store.flush();
    fs.state.offline = false;

    await phone.store.flush();
    await laptop.store.flush();
    await phone.store.pull('waterLogs');
    await laptop.store.pull('waterLogs');
    expect((await phone.store.getAll('waterLogs')).w).toMatchObject({ glasses: 6 });
    expect((await laptop.store.getAll('waterLogs')).w).toMatchObject({ glasses: 6 });
    expect(fs.docs.get('users/u1/waterLogs/w')).toMatchObject({ glasses: 6 });
  });

  it('an older offline edit does not overwrite a newer cloud copy', async () => {
    const fs = fakeFirestore();
    const phone = device(fs);
    fs.state.offline = true;
    await phone.store.putMany('mealLogs', [doc('m', 5, { kcal: 100 })]);
    await phone.store.flush(); // fails: offline
    // meanwhile the laptop saved a newer version
    fs.docs.set('users/u1/mealLogs/m', doc('m', 50, { kcal: 500 }));
    fs.state.offline = false;
    await phone.store.flush();
    expect(fs.docs.get('users/u1/mealLogs/m')).toMatchObject({ kcal: 500 });
    expect((await phone.store.getAll('mealLogs')).m).toMatchObject({ kcal: 500 });
    await phone.store.flush(); // the pulled copy is re-sent once, harmlessly, then the queue is empty
    expect(await phone.store.pending()).toBe(0);
    expect(fs.docs.get('users/u1/mealLogs/m')).toMatchObject({ kcal: 500 });
  });

  it('a deletion made on one device reaches the other', async () => {
    const fs = fakeFirestore();
    const phone = device(fs);
    const laptop = device(fs);
    await phone.store.putMany('mealLogs', [doc('m', 1)]);
    await phone.store.flush();
    await laptop.store.pull('mealLogs');
    await laptop.store.putMany('mealLogs', [doc('m', 9, { deleted: true })]);
    await laptop.store.flush();
    await phone.store.pull('mealLogs');
    expect((await phone.store.getAll('mealLogs')).m.deleted).toBe(true);
  });
});

describe('a flush that fails part way', () => {
  it('keeps everything queued, reports the error, and a retry sends it all once', async () => {
    jest.useRealTimers();
    const fs = fakeFirestore();
    const { store, errors } = device(fs);
    await store.putMany('mealLogs', [doc('a', 1), doc('b', 2)]);
    fs.state.offline = true;
    expect(await store.flush()).toBe(0);
    expect(errors).toHaveLength(1);
    expect(await store.pending()).toBe(2);
    fs.state.offline = false;
    expect(await store.flush()).toBe(2);
    expect(await store.pending()).toBe(0);
    expect(await store.flush()).toBe(0);
    expect(fs.docs.has('users/u1/mealLogs/a') && fs.docs.has('users/u1/mealLogs/b')).toBe(true);
  });
});

describe('delete all cloud data', () => {
  it('removes every document and the profile, and leaves another user alone', async () => {
    const fs = fakeFirestore();
    fs.docs.set('users/u1', doc('u1', 1));
    fs.docs.set('users/u1/mealLogs/m', doc('m', 1));
    fs.docs.set('users/u1/waterLogs/w', doc('w', 1));
    fs.docs.set('users/u2/mealLogs/other', doc('other', 1));
    await deleteAllUserData(fs.adapter, 'u1');
    expect([...fs.docs.keys()].filter((k) => k.startsWith('users/u1'))).toEqual([]);
    expect(fs.docs.has('users/u2/mealLogs/other')).toBe(true);
  });

  it('changes nothing when offline, so a retry can finish the job', async () => {
    const fs = fakeFirestore();
    fs.docs.set('users/u1', doc('u1', 1));
    fs.docs.set('users/u1/mealLogs/m', doc('m', 1));
    fs.state.offline = true;
    await expect(deleteAllUserData(fs.adapter, 'u1')).rejects.toThrow();
    fs.state.offline = false;
    expect(fs.docs.has('users/u1/mealLogs/m')).toBe(true);
    expect(fs.docs.has('users/u1')).toBe(true);
  });
});
