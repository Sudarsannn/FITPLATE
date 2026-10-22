import { describe, expect, it } from '@jest/globals';

import type { Prescription } from '../../models/exercise';
import { clock, planMinutes, workoutPhases } from '../../services/workoutPlan';

const rx = (p: Partial<Prescription>): Prescription => ({ level: 'beginner', goal: null, sets: null, reps: null, timeSec: null, restSec: null, tempo: null, perWeek: null, ...p });

describe('workoutPhases', () => {
  it('turns rep sets into work phases with rests between', () => {
    const ph = workoutPhases({ type: 'strength', searchTags: null, prescriptions: [rx({ sets: 2, reps: '8-12 (wall, incline)', restSec: 75 })] });
    expect(ph).toEqual([
      { kind: 'work', set: 1, sets: 2, seconds: null, reps: '8-12' },
      { kind: 'rest', seconds: 75, nextSet: 2 },
      { kind: 'work', set: 2, sets: 2, seconds: null, reps: '8-12' },
    ]);
  });

  it('stretches one cardio block to the balance target', () => {
    const ph = workoutPhases({ type: 'cardio', searchTags: null, prescriptions: [rx({ sets: 1, timeSec: 900 })] }, 25);
    expect(ph).toEqual([{ kind: 'work', set: 1, sets: 1, seconds: 1500, reps: null }]);
  });

  it('does not add sets for strength moves when a target is given', () => {
    const ph = workoutPhases({ type: 'strength', searchTags: null, prescriptions: [rx({ sets: 3, timeSec: 30, restSec: 45 })] }, 40);
    expect(ph.filter((p) => p.kind === 'work')).toHaveLength(3);
    expect(planMinutes(ph)).toBe(3);
  });

  it('falls back to one timed block without a prescription', () => {
    expect(workoutPhases({ type: 'cardio', searchTags: null, prescriptions: [] })).toEqual([{ kind: 'work', set: 1, sets: 1, seconds: 600, reps: null }]);
  });
});

it('formats a countdown', () => {
  expect(clock(65)).toBe('1:05');
  expect(clock(-3)).toBe('0:00');
});
