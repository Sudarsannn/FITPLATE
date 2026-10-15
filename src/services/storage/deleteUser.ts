import { collectionPath, docPath, PROFILE_COLLECTION, userDocPath, type RemoteAdapter } from './remote';
import { SCHEMAS } from './schemas';
import { clockDocPath } from './serverClock';

/**
 * "Delete my data": hard-deletes everything FitPlate saved in the cloud for
 * one user, that is every document of every collection in SCHEMAS under
 * `users/{uid}`, then the user document itself (which holds the profile).
 * Deletes go out in batches of at most 500 (the adapter splits them).
 *
 * The user document goes last, so if the network drops half-way the profile
 * is still there and the user can simply try again. Any failure (offline,
 * rules) is thrown to the caller, which then changes nothing on the device.
 * Returns the number of deletes sent (the user document included).
 */
export async function deleteAllUserData(adapter: RemoteAdapter, uid: string): Promise<number> {
  if (!uid) throw new Error('A signed-in user id is required to delete cloud data.');
  const paths: string[] = [];
  for (const { collection } of Object.values(SCHEMAS)) {
    if (collection === PROFILE_COLLECTION) continue;
    // From the server: offline this throws at once, before anything is deleted.
    const docs = await adapter.getCollection(collectionPath(uid, collection), { fromServer: true });
    for (const d of docs) paths.push(docPath(uid, collection, d.id));
  }
  // The clock check document (serverClock.ts) is not a user collection but lives under users/{uid} too.
  paths.push(clockDocPath(uid));
  if (paths.length) await adapter.deleteMany(paths);
  await adapter.deleteMany([userDocPath(uid)]);
  return paths.length + 1;
}
