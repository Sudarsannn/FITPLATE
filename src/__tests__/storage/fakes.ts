import type { BaseDoc } from '../../models/common';
import type { RemoteAdapter } from '../../services/storage/remote';

/**
 * A mocked Firestore: documents by path, in memory. Tests never touch the
 * real project. `offline = true` makes every call fail like a lost network.
 */
export function fakeFirestore() {
  const docs = new Map<string, BaseDoc>();
  const state = { offline: false, batches: 0, writes: 0 };
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
  };
  return { adapter, docs, state };
}

/** A clock the test moves by hand. */
export function fakeClock(start = 1_760_000_000_000) {
  let t = start;
  return { now: () => t, tick: (ms = 1000) => (t += ms) };
}
