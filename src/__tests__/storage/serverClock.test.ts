import { describe, expect, it } from '@jest/globals';

import type { RemoteAdapter } from '../../services/storage/remote';
import { clockDocPath, createServerClock, measureClockOffset } from '../../services/storage/serverClock';

const adapterWith = (serverNow?: RemoteAdapter['serverNow']): RemoteAdapter => ({
  getCollection: async () => [],
  getDoc: async () => null,
  setMany: async () => {},
  deleteMany: async () => {},
  serverNow,
});

describe('server clock', () => {
  it('adds the measured offset to the device clock', () => {
    const clock = createServerClock(() => 1000);
    expect(clock.now()).toBe(1000);
    clock.setOffset(250);
    expect(clock.now()).toBe(1250);
  });

  it('ignores offsets that are not believable', () => {
    const clock = createServerClock(() => 0);
    clock.setOffset(30 * 24 * 3600_000);
    expect(clock.offset).toBe(0);
    clock.setOffset(Number.NaN);
    expect(clock.offset).toBe(0);
  });

  it('measures server minus device time, allowing for the round trip', async () => {
    let t = 10_000;
    const base = () => (t += 100);
    const paths: string[] = [];
    const offset = await measureClockOffset(
      adapterWith(async (p) => {
        paths.push(p);
        return 70_150;
      }),
      'u1',
      base,
    );
    // before = 10_100, after = 10_200 → midpoint 10_150.
    expect(offset).toBe(60_000);
    expect(paths).toEqual([clockDocPath('u1')]);
  });

  it('gives null when the adapter has no server time or the cloud is down', async () => {
    expect(await measureClockOffset(adapterWith(undefined), 'u1')).toBeNull();
    expect(
      await measureClockOffset(
        adapterWith(async () => {
          throw new Error('offline');
        }),
        'u1',
      ),
    ).toBeNull();
  });
});
