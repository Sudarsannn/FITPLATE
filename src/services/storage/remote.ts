import type { BaseDoc } from '../../models/common';
import type { DocStore } from './docStore';

/** The profile lives on the user document itself, `users/{uid}`. */
export const PROFILE_COLLECTION = 'profile';
export const PROFILE_ID = 'profile';

/**
 * The few Firestore operations the app needs, by document path. The real
 * implementation is in firestoreRemote.ts; tests pass a fake, so they never
 * touch the real project.
 */
export type RemoteAdapter = {
  /** All documents of a collection path, or the single document at a doc path. */
  getCollection(path: string): Promise<BaseDoc[]>;
  getDoc(path: string): Promise<BaseDoc | null>;
  /** Write documents in batches (Firestore batches hold at most 500 writes). */
  setMany(writes: { path: string; data: BaseDoc }[]): Promise<void>;
};

export const userDocPath = (uid: string) => `users/${uid}`;
export const collectionPath = (uid: string, collection: string) => `users/${uid}/${collection}`;

export function docPath(uid: string, collection: string, id: string): string {
  return collection === PROFILE_COLLECTION ? userDocPath(uid) : `${collectionPath(uid, collection)}/${id}`;
}

/** A DocStore view of one signed-in user's Firestore data. */
export function createRemoteDocStore(adapter: RemoteAdapter, uid: string): DocStore {
  if (!uid) throw new Error('A signed-in user id is required for the cloud store.');
  return {
    async getAll<T extends BaseDoc>(collection: string) {
      const docs =
        collection === PROFILE_COLLECTION
          ? [await adapter.getDoc(userDocPath(uid))].filter((d): d is BaseDoc => d !== null)
          : await adapter.getCollection(collectionPath(uid, collection));
      return Object.fromEntries(docs.map((d) => [d.id, d as T]));
    },
    async putMany<T extends BaseDoc>(collection: string, docs: T[]) {
      if (docs.length === 0) return;
      await adapter.setMany(docs.map((d) => ({ path: docPath(uid, collection, d.id), data: d })));
    },
  };
}
