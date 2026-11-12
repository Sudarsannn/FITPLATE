import { describe, expect, it } from '@jest/globals';

import { researchExercises } from '../data/research';
import { clampKg, clampRpe, countCue, countdownCue, effortWords, repTarget, summarise, swapOptions } from '../services/workoutSession';

describe('rep target', () => {
  it('takes the top of a range and ignores the note after it', () => {
    expect(repTarget('8-12 (wall, incline or knee version)')).toBe(12);
    expect(repTarget('10 per leg, alternating')).toBe(10);
    expect(repTarget('about 15-20 low-impact step jacks (30 s)')).toBe(20);
    expect(repTarget('front plank hold')).toBeNull();
    expect(repTarget(null)).toBeNull();
  });

  it('every researched rep prescription gives a usable target or none', () => {
    for (const e of researchExercises) for (const p of e.prescriptions) {
      const t = repTarget(p.reps);
      expect(t === null || (t > 0 && t <= 100)).toBe(true);
    }
  });
});

describe('cues', () => {
  it('counts the number and finishes at the target', () => {
    expect(countCue(3, 12)).toBe('3');
    expect(countCue(12, 12)).toBe('12. Set done.');
    expect(countCue(5, null)).toBe('5');
    expect(countdownCue(3)).toBe('3');
    expect(countdownCue(0)).toBeNull();
    expect(countdownCue(4)).toBeNull();
  });
});

describe('set results', () => {
  it('summarises reps, volume and average effort', () => {
    const s = summarise([
      { set: 1, reps: 10, weightKg: 20, rpe: 6 },
      { set: 2, reps: 8, weightKg: 22.5, rpe: 8 },
      { set: 3, reps: null, weightKg: null, rpe: null },
    ]);
    expect(s).toEqual({ sets: 3, reps: 18, volumeKg: 380, avgRpe: 7 });
    expect(summarise([])).toEqual({ sets: 0, reps: 0, volumeKg: 0, avgRpe: null });
  });

  it('keeps weight and effort in range and describes effort in words', () => {
    expect(clampKg(-5)).toBe(0);
    expect(clampKg(1000)).toBe(500);
    expect(clampRpe(0)).toBe(1);
    expect(clampRpe(14)).toBe(10);
    expect([3, 5, 7, 9].map(effortWords)).toEqual(['Easy', 'Moderate', 'Hard', 'Very hard']);
    expect(effortWords(null)).toBe('');
  });
});

describe('swap options', () => {
  it('offers same-section, same-type moves that need no more equipment', () => {
    const squat = researchExercises.find((e) => e.id === 'bodyweight-squat')!;
    const opts = swapOptions(squat, researchExercises);
    expect(opts.length).toBeGreaterThan(0);
    expect(opts.length).toBeLessThanOrEqual(4);
    for (const o of opts) {
      expect(o.id).not.toBe(squat.id);
      expect(o.section).toBe(squat.section);
      expect(o.type).toBe(squat.type);
      expect(o.gymAccess.includes('none') || o.gymAccess.length === 0).toBe(true);
    }
  });
});
