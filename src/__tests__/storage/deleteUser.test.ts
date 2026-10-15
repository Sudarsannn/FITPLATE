import { describe, expect, it } from '@jest/globals';

import type { BaseDoc } from '../../models/common';
import { openUserData } from '../../services/storage';
import { deleteAllUserData } from '../../services/storage/deleteUser';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { createRemoteDocStore } from '../../services/storage/remote';
import { COLLECTIONS } from '../../services/storage/schemas';
import { deleteMyData, guestCopyAskedKey } from '../../services/userSession';
import { fakeFirestore } from './fakes';

const doc = (id: string, extra: Record<string, unknown> = {}): BaseDoc & Record<string, unknown> => ({
  id,
  createdAt: 1,
  updatedAt: 1,
  schemaVersion: 1,
  deleted: false,
  ...extra,
});

/** Puts a profile and two documents in every other collection for this uid. */
async function seed(fs: ReturnType<typeof fakeFirestore>, uid: string) {
  const remote = createRemoteDocStore(fs.adapter, uid);
  for (const c of COLLECTIONS) {
    await remote.putMany(c, c === 'profile' ? [doc('profile', { name: uid })] : [doc(`${c}-a`), doc(`${c}-b`)]);
  }
}

const pathsOf = (fs: ReturnType<typeof fakeFirestore>, uid: string) =>
  [...fs.docs.keys()].filter((p) => p === `users/${uid}` || p.startsWith(`users/${uid}/`));

describe('deleteAllUserData (mocked Firestore)', () => {
  it('deletes the profile and every subcollection document of that user only', async () => {
    const fs = fakeFirestore();
    await seed(fs, 'u1');
    await seed(fs, 'u2');
    // Seeding covers every collection in SCHEMAS: the profile plus two docs in each of the others.
    expect(pathsOf(fs, 'u1')).toHaveLength(1 + (COLLECTIONS.length - 1) * 2);
    const u2Before = new Map([...fs.docs].filter(([p]) => p.startsWith('users/u2')));

    const sent = await deleteAllUserData(fs.adapter, 'u1');

    // + 1 for the clock check document (serverClock.ts).
    expect(sent).toBe(1 + (COLLECTIONS.length - 1) * 2 + 1);
    expect(pathsOf(fs, 'u1')).toEqual([]);
    expect(new Map([...fs.docs].filter(([p]) => p.startsWith('users/u2')))).toEqual(u2Before);
    expect(pathsOf(fs, 'u2')).toHaveLength(u2Before.size);
  });

  it('works when the user has no data at all', async () => {
    const fs = fakeFirestore();
    await seed(fs, 'u2');
    await deleteAllUserData(fs.adapter, 'u1');
    expect(pathsOf(fs, 'u2')).toHaveLength(1 + (COLLECTIONS.length - 1) * 2);
  });

  it('sends more than 500 deletes in batches of at most 500', async () => {
    const fs = fakeFirestore();
    const remote = createRemoteDocStore(fs.adapter, 'u1');
    await remote.putMany('profile', [doc('profile')]);
    await remote.putMany('mealLogs', Array.from({ length: 1203 }, (_, i) => doc(`m${i}`)));
    await remote.putMany('waterLogs', [doc('w1')]);

    await deleteAllUserData(fs.adapter, 'u1');

    expect(pathsOf(fs, 'u1')).toEqual([]);
    expect(fs.state.deletes).toBe(1203 + 1 + 1 + 1);
    // 1204 subcollection docs → 3 batches (500 + 500 + 204), then the user document.
    expect(fs.state.deleteBatches).toBe(4);
  });

  it('throws when offline and deletes nothing', async () => {
    const fs = fakeFirestore();
    await seed(fs, 'u1');
    const before = new Map(fs.docs);
    fs.state.offline = true;
    await expect(deleteAllUserData(fs.adapter, 'u1')).rejects.toThrow('offline');
    expect(fs.docs).toEqual(before);
    expect(fs.state.deleteBatches).toBe(0);
  });

  it('needs a user id', async () => {
    await expect(deleteAllUserData(fakeFirestore().adapter, '')).rejects.toThrow();
  });
});

describe('deleteMyData (cloud and device)', () => {
  async function signedIn() {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    let t = 1_760_000_000_000;
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter, deps: { now: () => (t += 1000) } });
    await data.repos.profile.upsert('profile', { name: 'Asha' } as never);
    await data.repos.mealLogs.create({ name: 'Poha' } as never);
    await data.repos.waterLogs.upsert('water-2026-10-11', { glasses: 3 } as never);
    await data.flush();
    // Another user's cloud data and this device's guest data must survive.
    await seed(fs, 'u2');
    await kv.setItem('fitplate.docs.guest.mealLogs.v1', '{"keep":true}');
    await kv.setItem(guestCopyAskedKey('u1'), 'skipped');
    return { kv, fs, data };
  }

  it('deletes the cloud copy, then forgets the account on this device', async () => {
    const { kv, fs, data } = await signedIn();
    // A change still waiting in the outbox is sent first, then deleted with the rest.
    await data.repos.mealLogs.create({ name: 'Dosa' } as never);
    expect(await data.pending()).toBe(1);

    await deleteMyData(data, fs.adapter, 'u1', kv);

    expect(pathsOf(fs, 'u1')).toEqual([]);
    expect(pathsOf(fs, 'u2').length).toBeGreaterThan(0);
    const keys = Object.keys(kv.dump());
    expect(keys.filter((k) => k.includes('u1'))).toEqual([]);
    expect(await data.pending()).toBe(0);
    expect(kv.dump()['fitplate.docs.guest.mealLogs.v1']).toBe('{"keep":true}');
  });

  it('offline: throws and changes nothing on the device or in the cloud', async () => {
    const { kv, fs, data } = await signedIn();
    const device = kv.dump();
    const cloud = new Map(fs.docs);
    fs.state.offline = true;

    await expect(deleteMyData(data, fs.adapter, 'u1', kv)).rejects.toThrow();

    expect(kv.dump()).toEqual(device);
    expect(fs.docs).toEqual(cloud);
  });

  it('gives up with an error when the cloud never answers', async () => {
    const { kv, fs, data } = await signedIn();
    const device = kv.dump();
    const hanging = { ...fs.adapter, getCollection: () => new Promise<BaseDoc[]>(() => {}) };
    await expect(deleteMyData(data, hanging, 'u1', kv, { timeoutMs: 20 })).rejects.toThrow('unavailable');
    expect(kv.dump()).toEqual(device);
  });

  it('does nothing for a device-only store', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    await seed(fs, 'u1');
    const data = openUserData({ kv, uid: null, remote: null });
    expect(await deleteMyData(data, fs.adapter, 'u1', kv)).toBe(0);
    expect(pathsOf(fs, 'u1').length).toBeGreaterThan(0);
  });
});
