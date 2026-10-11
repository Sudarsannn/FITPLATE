import type { BaseDoc } from '../../models/common';
import type { RemoteAdapter } from '../../services/storage/remote';

/**
 * A mocked Firestore: documents by path, in memory. Tests never touch the
 * real project. `offline = true` makes every call fail like a lost network.
 */
export function fakeFirestore() {
  const docs = new Map<string, BaseDoc>();
  const state = { offline: false, batches: 0, writes: 0, deleteBatches: 0, deletes: 0 };
  const check = () => {
    if (state.offline) throw new Error('unavailable: offline');
  };
  const adapter: RemoteAdapter = {
    async getCollection(path) {
      check();
      const prefix = `${path}/`;
      return [...docs.entries()].filter(([p]) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/')).map(([, d]) => d);
    },
    async getDoc(path) {
      check();
      return docs.get(path) ?? null;
    },
    async setMany(writes) {
      check();
      state.batches += 1;
      state.writes += writes.length;
      for (const w of writes) docs.set(w.path, structuredClone(w.data));
    },
    async deleteMany(paths) {
      check();
      // Like the real adapter: one commit per 500 deletes.
      for (let i = 0; i < paths.length; i += 500) {
        const chunk = paths.slice(i, i + 500);
        state.deleteBatches += 1;
        state.deletes += chunk.length;
        for (const p of chunk) docs.delete(p);
      }
    },
  };
  return { adapter, docs, state };
}

/** A clock the test moves by hand. */
export function fakeClock(start = 1_760_000_000_000) {
  let t = start;
  return { now: () => t, tick: (ms = 1000) => (t += ms) };
}
