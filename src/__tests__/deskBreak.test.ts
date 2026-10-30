import { describe, expect, it } from '@jest/globals';

import { deskBreakExercise, isDeskHours } from '../services/deskBreak';

describe('desk break', () => {
  it('runs on weekdays from 10 to 18', () => {
    expect(isDeskHours(new Date(2026, 9, 30, 11))).toBe(true); // Friday
    expect(isDeskHours(new Date(2026, 9, 30, 18))).toBe(false);
    expect(isDeskHours(new Date(2026, 9, 30, 9, 59))).toBe(false);
    expect(isDeskHours(new Date(2026, 9, 31, 11))).toBe(false); // Saturday
  });
  it('prefers the researched desk stretch, else a beginner stretch', () => {
    const list = [
      { id: 'a', section: 'gym', level: 'beginner' },
      { id: 'b', section: 'yoga_stretch', level: 'beginner' },
      { id: 'desk-neck-shoulder-release', section: 'yoga_stretch', level: 'beginner' },
    ] as never[];
    expect(deskBreakExercise(list)?.id).toBe('desk-neck-shoulder-release');
    expect(deskBreakExercise(list.slice(0, 2))?.id).toBe('b');
    expect(deskBreakExercise([])).toBeUndefined();
  });
});
