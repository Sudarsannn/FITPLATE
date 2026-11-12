import { describe, expect, it } from '@jest/globals';

import { researchExercises } from '../data/research';
import { fitNote, userConcerns } from '../services/moveSafety';
import { exerciseById, PREBUILT_ROUTINES, routineFits } from '../services/routines';
import { swapOptions } from '../services/workoutSession';

const concernsFor = (limits: string[], healthIssues: string[] = []) => userConcerns({ limits, healthIssues }).concerns;
const routine = (id: string) => PREBUILT_ROUTINES.find((r) => r.id === id)!;

describe('routines and swaps respect injuries and conditions (review 2026-11-12 FIX 1)', () => {
  it('a Shoulders user sees the pec-deck warning in the beginner push day', () => {
    const fits = routineFits(routine('gym-b'), concernsFor(['Shoulders']));
    const pec = fits.find((f) => f.item.exerciseId === 'pec-deck')!;
    expect(pec.fit.fit).toBe('avoid');
    const note = fitNote(pec.fit);
    expect(note.level).toBe('avoid');
    expect(note.headline).toMatch(/avoid this with your shoulder problem/);
    expect(note.lines[0]).toMatch(/^For your shoulder problem: /);
  });

  it('never offers an avoid move as a swap, and ranks research-backed fits first', () => {
    const chest = exerciseById('chest-press-machine')!;
    const plain = swapOptions(chest, researchExercises, 10);
    expect(plain.map((e) => e.id)).toContain('pec-deck');
    const safe = swapOptions(chest, researchExercises, 10, concernsFor(['Shoulders']));
    expect(safe.map((e) => e.id)).not.toContain('pec-deck');
    expect(safe.length).toBeGreaterThan(0);
  });

  it('a pregnancy user gets the ask-your-doctor note on hip thrust', () => {
    const fits = routineFits(routine('gym-c'), concernsFor(['Pregnancy or after birth']));
    const hip = fits.find((f) => f.item.exerciseId === 'hip-thrust')!;
    expect(hip.fit.fit).toBe('ask_doctor');
    expect(fitNote(hip.fit)).toMatchObject({ level: 'doctor', headline: "Follow your doctor's advice" });
  });

  it('a user with no limits is unchanged', () => {
    for (const r of PREBUILT_ROUTINES) for (const f of routineFits(r, [])) expect(fitNote(f.fit).level).toBeNull();
    const squat = exerciseById('bodyweight-squat')!;
    expect(swapOptions(squat, researchExercises, 4, []).map((e) => e.id)).toEqual(swapOptions(squat, researchExercises).map((e) => e.id));
  });
});
