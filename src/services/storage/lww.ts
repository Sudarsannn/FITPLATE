import type { BaseDoc } from '../../models/common';

/**
 * Last-write-wins merge (SPEC-ADDENDA §5). The newer `updatedAt` wins; on a
 * tie the remote copy wins, because the cloud is the source of truth for a
 * signed-in user.
 */
export function pickNewer<T extends BaseDoc>(local: T | undefined, remote: T | undefined): T | undefined {
  if (!local) return remote;
  if (!remote) return local;
  return local.updatedAt > remote.updatedAt ? local : remote;
}

/** Merge two id → doc maps; returns the merged map and which side each change must go to. */
export function mergeCollections<T extends BaseDoc>(local: Record<string, T>, remote: Record<string, T>) {
  const merged: Record<string, T> = {};
  const pushToRemote: T[] = [];
  const pullToLocal: T[] = [];
  for (const id of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const winner = pickNewer(local[id], remote[id])!;
    merged[id] = winner;
    if (!sameDoc(winner, remote[id])) pushToRemote.push(winner);
    if (!sameDoc(winner, local[id])) pullToLocal.push(winner);
  }
  return { merged, pushToRemote, pullToLocal };
}

// Copies of one document match when their write stamp and content match; this
// keeps a sync from rewriting documents that are already in step.
function sameDoc(a: BaseDoc, b: BaseDoc | undefined): boolean {
  return !!b && a.updatedAt === b.updatedAt && JSON.stringify(a) === JSON.stringify(b);
}
