import { describe, expect, it } from '@jest/globals';

import { RESUME_WINDOW_MS, usableProgress } from '../services/cookProgress';

describe('usableProgress', () => {
  const p = { step: 3, have: {}, at: 1000 };
  it('offers a recent place inside the dish', () => {
    expect(usableProgress(p, 8, 2000)).toEqual(p);
  });
  it('drops old, overview and out-of-range places', () => {
    expect(usableProgress(p, 8, 1000 + RESUME_WINDOW_MS + 1)).toBeNull();
    expect(usableProgress({ ...p, step: -1 }, 8, 2000)).toBeNull();
    expect(usableProgress({ ...p, step: 8 }, 8, 2000)).toBeNull();
    expect(usableProgress(null, 8, 2000)).toBeNull();
  });
});
