import { describe, expect, it } from '@jest/globals';

import { getDish, researchConditions, researchDishes, researchNutrients } from '../data/research';
import { dayMicros, limitBand } from '../services/dayNutrition';
import { DOCTOR_LINE, healthContext, remindersDefaultOn, sodiumLimit, waterGlasses } from '../services/healthLimits';
import { GLASS_ML } from '../services/water';

const ctx = (...ids: string[]) => healthContext({ healthIssues: ids }, researchConditions);

describe('health conditions in targets (review 2026-11-06 FIX 1)', () => {
  it('a hypertension user gets the researched 2000 mg sodium limit and the doctor note', () => {
    const c = researchConditions.find((x) => x.id === 'hypertension')!;
    const h = ctx('hypertension');
    expect(h.needsDoctor).toBe(true);
    expect(c.sodiumMgMax).toBe(2000);
    expect(sodiumLimit(h)).toEqual({ mg: 2000, source: 'research' });
    expect(h.sodium?.from).toContain(c.name);
    expect(DOCTOR_LINE).toBe("Follow your doctor's advice");
  });

  it('a fatty-liver user gets no pushed water target and reminders off by default', () => {
    const h = ctx('fatty-liver');
    expect(h.waterCaution).toBe(true);
    expect(remindersDefaultOn(h)).toBe(false);
    expect(waterGlasses(8, GLASS_ML)).toEqual({ glasses: 8, source: 'general' });
  });

  it('a user with no conditions is unchanged', () => {
    for (const none of [[], ['none'], ['prefer-not']]) {
      const h = ctx(...none);
      expect(h).toMatchObject({ needsDoctor: false, waterCaution: false, sodium: null, conditions: [] });
      expect(remindersDefaultOn(h)).toBe(true);
      expect(sodiumLimit(h)).toBeNull();
    }
  });

  it("a doctor's limit replaces the app's number", () => {
    const h = ctx('hypertension');
    expect(sodiumLimit(h, { sodiumMg: 1500 })).toEqual({ mg: 1500, source: 'doctor' });
    expect(waterGlasses(8, GLASS_ML, { waterMl: 1500 })).toEqual({ glasses: 6, source: 'doctor' });
    expect(waterGlasses(8, GLASS_ML, { waterMl: null })).toEqual({ glasses: 8, source: 'general' });
  });

  it('uses the lowest researched sodium limit across conditions, and ignores unknown ids', () => {
    const h = ctx('hypertension', 'fatty-liver', 'no-such-condition');
    expect(h.conditions).toHaveLength(2);
    expect(h.sodium?.mg).toBe(Math.min(...h.conditions.map((c) => c.sodiumMgMax as number)));
  });
});

describe('the sodium bar as a limit', () => {
  const dish = researchDishes.find((d) => (d.microNutrientsEstimate?.values?.sodium ?? 0) > 0);
  const meals = dish ? [{ dishId: dish.id, kcal: 300, protein: 10, fibre: 3 }] : [];
  it('shows intake against the limit, flagged as a limit, and past it is the red band', () => {
    expect(dish).toBeTruthy();
    const bar = dayMicros(meals, getDish, researchNutrients, 'adult_male', { limits: { sodium: 2000 } }).find((b) => b.id === 'sodium')!;
    expect(bar.isLimit).toBe(true);
    expect(bar.target).toBe(2000);
    expect(bar.fraction).toBeCloseTo(bar.amount / 2000, 6);
    expect(limitBand(0.5)).toBe('on-track');
    expect(limitBand(0.9)).toBe('getting-there');
    expect(limitBand(1.2)).toBe('low');
  });
  it('is a goal bar when no limit is given', () => {
    const bar = dayMicros(meals, getDish, researchNutrients, 'adult_male').find((b) => b.id === 'sodium')!;
    expect(bar.isLimit).toBe(false);
  });
});
