import type { RemoteAdapter } from './remote';

/** Where the clock check writes (owner-only, like the rest of `users/{uid}`). */
export const clockDocPath = (uid: string) => `users/${uid}/meta/clock`;

// A phone clock more than a week off is broken in a way an offset can't fix; ignore it.
const MAX_OFFSET_MS = 7 * 24 * 3600_000;

/**
 * Priority plan P2 (5.3): "the latest change wins, using the server's clock".
 * Every document carries `updatedAt`; this clock adds the measured difference
 * between this device and Firestore's clock, so a phone that runs a few
 * minutes fast can't win every conflict against the laptop.
 */
export function createServerClock(base: () => number = Date.now) {
  let offset = 0;
  return {
    now: () => base() + offset,
    get offset() {
      return offset;
    },
    setOffset(ms: number) {
      offset = Number.isFinite(ms) && Math.abs(ms) <= MAX_OFFSET_MS ? Math.round(ms) : 0;
    },
  };
}

export type ServerClock = ReturnType<typeof createServerClock>;

/**
 * Measure server time minus device time with one write and one read
 * (half the round trip is taken as the network delay). Null when the
 * adapter can't tell or the cloud is unreachable.
 */
export async function measureClockOffset(adapter: RemoteAdapter, uid: string, base: () => number = Date.now): Promise<number | null> {
  if (!adapter.serverNow || !uid) return null;
  try {
    const before = base();
    const server = await adapter.serverNow(clockDocPath(uid));
    const after = base();
    return server - (before + after) / 2;
  } catch {
    return null;
  }
}
