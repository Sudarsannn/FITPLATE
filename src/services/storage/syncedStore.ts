import type { BaseDoc } from '../../models/common';
import type { DocStore } from './docStore';
import type { KeyValueStore } from './kv';
import { mergeCollections } from './lww';
import { KEY_PREFIX } from './storageService';

type Outbox = Record<string, string[]>; // collection → ids waiting to reach the cloud

export const outboxKey = (owner: string) => `${KEY_PREFIX}outbox.${owner}.v1`;

export type SyncedDocStore = DocStore & {
  /** Push every queued write now. Resolves to the number of documents sent. */
  flush(): Promise<number>;
  /** Merge one collection with the cloud (last write wins) and update both sides. */
  pull(collection: string): Promise<void>;
  /** Documents still waiting to reach the cloud. */
  pending(): Promise<number>;
};

/**
 * Local-first store for a signed-in user. Every write lands on the device
 * first (so it works offline and shows at once), joins an outbox, and is sent
 * to Firestore in one batch after `debounceMs`. If the cloud write fails
 * (offline, rules not set up), the outbox keeps the ids and the next flush
 * retries. Batching and debouncing keep a busy day far below the Spark
 * free tier (about 20,000 writes a day).
 */
export function createSyncedDocStore(opts: {
  local: DocStore;
  remote: DocStore;
  kv: KeyValueStore;
  owner: string;
  debounceMs?: number;
  onError?: (e: unknown) => void;
}): SyncedDocStore {
  const { local, remote, kv, owner, debounceMs = 1500, onError } = opts;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let flushing: Promise<number> | null = null;
  // Outbox reads and writes run one at a time so a save and a flush never lose each other's ids.
  let outboxLock: Promise<unknown> = Promise.resolve();
  function withOutbox<R>(fn: (o: Outbox) => Promise<R> | R): Promise<R> {
    const run = outboxLock.then(async () => {
      const o = await readOutbox();
      const r = await fn(o);
      await writeOutbox(o);
      return r;
    });
    outboxLock = run.catch(() => {});
    return run;
  }

  async function readOutbox(): Promise<Outbox> {
    const raw = await kv.getItem(outboxKey(owner));
    try {
      return raw ? (JSON.parse(raw) as Outbox) : {};
    } catch {
      return {};
    }
  }

  async function writeOutbox(o: Outbox) {
    const empty = Object.values(o).every((ids) => ids.length === 0);
    if (empty) await kv.removeItem(outboxKey(owner));
    else await kv.setItem(outboxKey(owner), JSON.stringify(o));
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      flush().catch((e) => onError?.(e));
    }, debounceMs);
  }

  async function putMany<T extends BaseDoc>(collection: string, docs: T[]) {
    if (docs.length === 0) return;
    await local.putMany(collection, docs);
    await withOutbox((o) => {
      o[collection] = Array.from(new Set([...(o[collection] ?? []), ...docs.map((d) => d.id)]));
    });
    schedule();
  }

  async function doFlush(): Promise<number> {
    const o = await withOutbox((snapshot) => ({ ...snapshot }));
    let sent = 0;
    for (const [collection, ids] of Object.entries(o)) {
      if (ids.length === 0) continue;
      const all = await local.getAll(collection);
      const docs = ids.map((id) => all[id]).filter((d): d is BaseDoc => d !== undefined);
      try {
        await remote.putMany(collection, docs);
      } catch (e) {
        onError?.(e);
        continue; // keep these ids for the next try
      }
      sent += docs.length;
      // A document changed again while this batch was in flight stays queued.
      const now = await local.getAll(collection);
      const sentAt = new Map(docs.map((d) => [d.id, d.updatedAt]));
      await withOutbox((latest) => {
        latest[collection] = (latest[collection] ?? []).filter((id) => !sentAt.has(id) || now[id]?.updatedAt !== sentAt.get(id));
      });
    }
    return sent;
  }

  function flush(): Promise<number> {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // One flush at a time; a second caller waits for the running one, then runs again.
    const run = (flushing ?? Promise.resolve(0)).then(() => doFlush());
    flushing = run.finally(() => {
      if (flushing === run) flushing = null;
    });
    return run;
  }

  async function pull(collection: string) {
    const [l, r] = await Promise.all([local.getAll(collection), remote.getAll(collection)]);
    const { pushToRemote, pullToLocal } = mergeCollections(l, r);
    if (pullToLocal.length) await local.putMany(collection, pullToLocal);
    if (pushToRemote.length) await remote.putMany(collection, pushToRemote);
  }

  async function pending() {
    return Object.values(await readOutbox()).reduce((n, ids) => n + ids.length, 0);
  }

  return { getAll: local.getAll, putMany, flush, pull, pending };
}
