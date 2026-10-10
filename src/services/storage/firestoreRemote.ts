import { getApp, getApps } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import type { BaseDoc } from '../../models/common';
import type { RemoteAdapter } from './remote';

// Firestore's own batch limit.
const MAX_BATCH = 500;

let db: Firestore | null = null;

/**
 * Firestore on the Firebase JS SDK (all platforms, SPEC-ADDENDA §5). The web
 * build keeps a persistent offline cache in IndexedDB; native uses the memory
 * cache, and the app's AsyncStorage copy covers offline there.
 * Returns null when Firebase is not set up (no .env keys), so callers fall
 * back to device storage.
 */
export function getDb(): Firestore | null {
  if (db) return db;
  if (!getApps().length) return null;
  db = initializeFirestore(getApp(), {
    localCache: Platform.OS === 'web' ? persistentLocalCache({ tabManager: persistentMultipleTabManager() }) : memoryLocalCache(),
    ignoreUndefinedProperties: true,
  });
  return db;
}

export function createFirestoreAdapter(firestore: Firestore): RemoteAdapter {
  return {
    async getCollection(path) {
      const snap = await getDocs(collection(firestore, path));
      return snap.docs.map((d) => d.data() as BaseDoc);
    },
    async getDoc(path) {
      const snap = await getDoc(doc(firestore, path));
      return snap.exists() ? (snap.data() as BaseDoc) : null;
    },
    async setMany(writes) {
      for (let i = 0; i < writes.length; i += MAX_BATCH) {
        const batch = writeBatch(firestore);
        for (const w of writes.slice(i, i + MAX_BATCH)) batch.set(doc(firestore, w.path), w.data);
        await batch.commit();
      }
    },
  };
}
