import type { BaseDoc } from '../../models/common';
import type { KeyValueStore } from './kv';
import { KEY_PREFIX } from './storageService';

/**
 * Where user documents live. A collection is a flat id → document map.
 * Deleted documents are kept (soft delete), so `getAll` returns them too.
 */
export type DocStore = {
  getAll<T extends BaseDoc>(collection: string): Promise<Record<string, T>>;
  putMany<T extends BaseDoc>(collection: string, docs: T[]): Promise<void>;
};

/** Device key for one owner's collection. Owner is "guest" or a Firebase uid. */
export const docsKey = (owner: string, collection: string) => `${KEY_PREFIX}docs.${owner}.${collection}.v1`;
export const ownerPrefix = (owner: string) => `${KEY_PREFIX}docs.${owner}.`;

/**
 * AsyncStorage-backed store: the only store for guests, and the offline cache
 * for signed-in users. One key per collection keeps reads to one call.
 */
export function createLocalDocStore(kv: KeyValueStore, owner: string): DocStore {
  // Serialise writes per collection, so two quick saves never overwrite each other.
  const queues = new Map<string, Promise<void>>();

  async function getAll<T extends BaseDoc>(collection: string): Promise<Record<string, T>> {
    const raw = await kv.getItem(docsKey(owner, collection));
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, T>;
    } catch {
      return {};
    }
  }

  function putMany<T extends BaseDoc>(collection: string, docs: T[]): Promise<void> {
    const prev = queues.get(collection) ?? Promise.resolve();
    const next = prev.then(async () => {
      const all = await getAll<T>(collection);
      for (const d of docs) all[d.id] = d;
      await kv.setItem(docsKey(owner, collection), JSON.stringify(all));
    });
    queues.set(collection, next.catch(() => {}));
    return next;
  }

  return { getAll, putMany };
}
