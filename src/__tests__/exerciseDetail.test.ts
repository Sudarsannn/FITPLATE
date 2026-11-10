import { describe, expect, it } from '@jest/globals';

import { researchExercises } from '../data/research';
import { cautionLabel, cautionRows, checkpointRows, planRows, shotList } from '../services/exerciseDetail';

describe('exercise detail sections', () => {
  it('every imported exercise renders each section from its data', () => {
    for (const e of researchExercises) {
      expect(planRows(e).length).toBeGreaterThan(0);
      expect(checkpointRows(e).length).toBeGreaterThan(0);
      expect(shotList(e).length).toBeGreaterThan(0);
      expect(e.steps.length + e.setupSteps.length).toBeGreaterThan(0);
    }
  });

  it('lists plans easiest level first and writes the dose out', () => {
    const rows = planRows({ prescriptions: [
      { level: 'advanced', goal: 'strength', sets: 4, reps: '3-5', timeSec: null, restSec: 180, tempo: null, perWeek: 2 },
      { level: 'beginner', goal: 'fat_loss', sets: 2, reps: '10', timeSec: null, restSec: 60, tempo: null, perWeek: 3 },
    ] });
    expect(rows.map((r) => r.level)).toEqual(['Beginner', 'Advanced']);
    expect(rows[0].goal).toBe('Fat loss');
    expect(rows[0].dose).toMatch(/2/);
  });

  it('puts skip and ask-your-doctor cautions first and never calls an unknown status fine', () => {
    const rows = cautionRows({ conditionCautions: [
      { condition: 'a', status: 'ok', change: '', source: '' },
      { condition: 'b', status: 'avoid', change: 'no', source: '' },
      { condition: 'c', status: null, change: '', source: '' },
    ] });
    expect(rows.map((r) => r.condition)).toEqual(['b', 'c', 'a']);
    expect(cautionLabel(rows[1])).toBe('Ask your doctor');
  });
});
