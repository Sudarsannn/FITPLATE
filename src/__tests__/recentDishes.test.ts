import { describe, expect, it } from '@jest/globals';

import { cookAgainIds, pushRecent } from '../services/recentDishes';

describe('recentDishes', () => {
  it('puts the newest first, drops repeats and caps the list', () => {
    expect(pushRecent(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
    expect(pushRecent(['a', 'b'], 'z', 2)).toEqual(['z', 'a']);
  });
  it('lists cooked dishes once, most recent first, ignoring takeaways', () => {
    const days = {
      '2026-10-26': { meals: [{ cooked: true, dishId: 'x', at: 1 }, { cooked: false, dishId: 'y', at: 5 }] },
      '2026-10-27': { meals: [{ cooked: true, dishId: 'z', at: 3 }, { cooked: true, dishId: 'x', at: 4 }, { cooked: true, dishId: null, at: 9 }] },
    };
    expect(cookAgainIds(days)).toEqual(['x', 'z']);
  });
});
