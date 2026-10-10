import type { BaseDoc } from '../../models/common';
import type { DocStore } from './docStore';
import { mergeCollections } from './lww';
import { COLLECTIONS } from './schemas';

/**
 * One-tap "copy my device data into my account" after a guest signs in
 * (SPEC-ADDENDA §5). Demo sample entries are never copied. Where both sides
 * have a document, the newer one wins. Returns how many documents were copied.
 */
export async function copyGuestToAccount(guest: DocStore, account: DocStore, collections: readonly string[] = COLLECTIONS): Promise<number> {
  let copied = 0;
  for (const c of collections) {
    const mine = Object.fromEntries(
      Object.entries(await guest.getAll<BaseDoc & { demoSample?: boolean }>(c)).filter(([, d]) => !d.demoSample),
    );
    const theirs = await account.getAll<BaseDoc>(c);
    const { pushToRemote } = mergeCollections(mine, theirs);
    if (pushToRemote.length) await account.putMany(c, pushToRemote);
    copied += pushToRemote.length;
  }
  return copied;
}
