import { describe, expect, it } from '@jest/globals';

import { clock, secondsLeft } from '../../services/ai/job';

describe('ai job timing', () => {
  it('counts down but never reaches zero while running', () => {
    expect(secondsLeft('matching', 0)).toBeGreaterThan(40);
    expect(secondsLeft('writing', 35)).toBeLessThan(secondsLeft('matching', 0));
    expect(secondsLeft('saving', 400)).toBeGreaterThanOrEqual(5);
  });
  it('formats a clock', () => {
    expect(clock(65)).toBe('1:05');
    expect(clock(0)).toBe('0:00');
  });
});
