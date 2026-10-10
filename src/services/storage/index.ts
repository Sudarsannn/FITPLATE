import type { Favourite, MealLog, MealPlanDay, SavingEntry, SupplementLog, WaterLog, WorkoutLog } from '../../models/logs';
import type { UserProfile } from '../../models/user';
import { createLocalDocStore, ownerPrefix, type DocStore } from './docStore';
import type { KeyValueStore } from './kv';
import { createRemoteDocStore, PROFILE_ID, type RemoteAdapter } from './remote';
import { createRepository, type RepoDeps } from './repository';
import { SCHEMAS } from './schemas';
import { createStorageService } from './storageService';
import { createSyncedDocStore, outboxKey, type SyncedDocStore } from './syncedStore';

export { copyGuestToAccount } from './guest';
export { fromLegacyState, LEGACY_KEY, type LegacyState } from './legacy';
export { PROFILE_ID } from './remote';
export { COLLECTIONS, SCHEMAS } from './schemas';

export const GUEST_OWNER = 'guest';

/** All repositories for one user, over one DocStore. */
export function createRepositories(store: DocStore, deps: RepoDeps = {}) {
  return {
    profile: createRepository<UserProfile>(store, SCHEMAS.profile, deps),
    mealLogs: createRepository<MealLog>(store, SCHEMAS.mealLogs, deps),
    waterLogs: createRepository<WaterLog>(store, SCHEMAS.waterLogs, deps),
    supplementLogs: createRepository<SupplementLog>(store, SCHEMAS.supplementLogs, deps),
    workoutLogs: createRepository<WorkoutLog>(store, SCHEMAS.workoutLogs, deps),
    favourites: createRepository<Favourite>(store, SCHEMAS.favourites, deps),
    mealPlans: createRepository<MealPlanDay>(store, SCHEMAS.mealPlans, deps),
    savings: createRepository<SavingEntry>(store, SCHEMAS.savings, deps),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

/**
 * The user data layer for whoever is using the app.
 * - Guest (no uid, or no cloud): device storage only.
 * - Signed in with the cloud available: device first, synced to `users/{uid}` in Firestore.
 */
export function openUserData(opts: { kv: KeyValueStore; uid: string | null; remote: RemoteAdapter | null; deps?: RepoDeps; onSyncError?: (e: unknown) => void }) {
  const owner = opts.uid ?? GUEST_OWNER;
  const local = createLocalDocStore(opts.kv, owner);
  const synced: SyncedDocStore | null =
    opts.uid && opts.remote
      ? createSyncedDocStore({ local, remote: createRemoteDocStore(opts.remote, opts.uid), kv: opts.kv, owner, onError: opts.onSyncError })
      : null;
  const store = synced ?? local;
  const storage = createStorageService(opts.kv);

  return {
    owner,
    cloud: synced !== null,
    repos: createRepositories(store, opts.deps),
    /** Merge every collection with the cloud. No-op for guests. */
    async syncAll() {
      if (!synced) return;
      await synced.flush();
      for (const c of Object.values(SCHEMAS)) await synced.pull(c.collection);
    },
    flush: () => synced?.flush() ?? Promise.resolve(0),
    pending: () => synced?.pending() ?? Promise.resolve(0),
    exportAll: storage.exportAll,
    /** Sign-out: the cloud keeps the data; this device forgets it. */
    async clearDevice() {
      await storage.resetAll(ownerPrefix(owner));
      await opts.kv.removeItem(outboxKey(owner));
    },
    profileId: PROFILE_ID,
  };
}

export type UserData = ReturnType<typeof openUserData>;
