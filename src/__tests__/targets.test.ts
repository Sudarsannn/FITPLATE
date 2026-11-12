import { describe, expect, it } from '@jest/globals';

import { researchHydration, researchNutrients } from '../data/research';
import { WATER_FORMULA, energyTarget, GOAL_PRESETS, goalTargets, microTargets, restingEnergy, targetGroupFor, waterTarget, type TargetProfile } from '../services/targets';

const base: TargetProfile = { age: 30, sex: 'male', heightCm: 175, weightKg: 75, activityLevel: 'moderate', goal: 'maintain' };

describe('energyTarget', () => {
  it('matches Mifflin-St Jeor worked by hand (man, 30, 175 cm, 75 kg)', () => {
    expect(restingEnergy('male', 75, 175, 30)).toBe(1698.75);
    expect(restingEnergy('female', 60, 160, 30)).toBe(1289);
  });
  it('maintain: BMR x activity, rounded to 10', () => {
    // 1698.75 x 1.55 = 2633.0625 -> 2630
    expect(energyTarget(base)).toMatchObject({ kcal: 2630, protein: 62, source: 'formula', bmr: 1699 });
  });
  it('moves with the goal', () => {
    expect(energyTarget({ ...base, goal: 'lose' }).kcal).toBe(2130);
    expect(energyTarget({ ...base, goal: 'muscle' }).protein).toBe(120);
    expect(energyTarget({ ...base, goal: 'gain' }).kcal).toBe(3030);
  });
  it('never goes under the plain-eating floor', () => {
    const t = energyTarget({ age: 50, sex: 'female', heightCm: 150, weightKg: 45, activityLevel: 'sedentary', goal: 'lose' });
    expect(t.kcal).toBe(1200);
  });
  it('uses the preset, with a reason, when details are missing, under 18, or pregnant or breastfeeding', () => {
    expect(energyTarget({ ...base, age: null })).toMatchObject({ source: 'preset', kcal: GOAL_PRESETS.maintain.kcal });
    expect(energyTarget({ ...base, age: 16 }).note).toMatch(/under 18/i);
    expect(energyTarget({ ...base, sex: 'female', privateFlags: { pregnant: true } })).toMatchObject({ source: 'preset', kcal: GOAL_PRESETS.maintain.kcal });
    expect(energyTarget({ ...base, sex: 'other' }).note).toMatch(/sex/i);
    expect(goalTargets({ ...base, age: null })).toEqual(GOAL_PRESETS.maintain);
  });
});

describe('microTargets (researched ICMR-NIN rows only)', () => {
  const find = (p: TargetProfile, id: string) => microTargets(p, researchNutrients).find((m) => m.id === id);
  it('picks the researched row for the group', () => {
    const iron = researchNutrients.find((n) => n.id === 'iron')!;
    const male = iron.targets.find((t) => t.group === 'adult_male_moderate')!;
    const female = iron.targets.find((t) => t.group === 'adult_female_moderate')!;
    expect(find(base, 'iron')?.value).toBe(male.rda ?? male.ai);
    expect(find({ ...base, sex: 'female' }, 'iron')?.value).toBe(female.rda ?? female.ai);
  });
  it('uses the pregnancy row when the private flag is on', () => {
    const iron = researchNutrients.find((n) => n.id === 'iron')!;
    expect(targetGroupFor({ ...base, sex: 'female', privateFlags: { pregnant: true } })).toBe('pregnant');
    expect(find({ ...base, sex: 'female', privateFlags: { pregnant: true } }, 'iron')?.value).toBe(iron.targets.find((t) => t.group === 'pregnant')!.rda);
  });
  it('gives no target when the sex is unknown', () => {
    expect(microTargets({ ...base, sex: 'other' }, researchNutrients).every((m) => m.value == null)).toBe(true);
  });
  it('never invents: every value equals a researched figure', () => {
    for (const m of microTargets(base, researchNutrients)) {
      const n = researchNutrients.find((x) => x.id === m.id)!;
      const figures = [...n.targets.flatMap((t) => [t.rda, t.ai]), ...Object.values(n.appDefaultTarget ?? {})];
      if (m.value != null) expect(figures).toContain(m.value);
    }
  });
});

describe('waterTarget', () => {
  const hyd = researchHydration.find((h) => h.id === 'water-daily-requirement')!;

  it('is the labelled default without the research or a profile', () => {
    expect(waterTarget()).toMatchObject({ glasses: 8, researched: false });
    expect(waterTarget({ sex: 'male', weightKg: 70, privateFlags: {} }, null)).toMatchObject({ glasses: 8, researched: false });
  });

  it('uses the same numbers as the researched formula', () => {
    const f = hyd.defaultTargetFormula;
    for (const n of [2500, 2000, 400, 300, 700, 20, 50]) expect(f).toContain(String(n));
    expect(f).toMatch(/male 65 kg, female 55 kg/);
    expect(WATER_FORMULA.baseMl).toEqual({ male: 2500, female: 2000, unknown: 2500 });
  });

  it('adjusts for sex, weight, pregnancy and breastfeeding within the researched limits', () => {
    const at = (sex: 'male' | 'female' | 'other' | null, weightKg: number | null, privateFlags = {}) => waterTarget({ sex, weightKg, privateFlags }, hyd);
    expect(at('male', 65).glasses).toBe(10); // 2500 ml
    expect(at('female', 55).glasses).toBe(8); // 2000 ml
    expect(at('female', 55).researched).toBe(true);
    expect(at('male', 95).glasses).toBe(12); // +400 ml cap: 2900
    expect(at('female', 40, {}).glasses).toBeLessThan(8); // -300 ml
    expect(at('female', 55, { pregnant: true }).glasses).toBe(9); // 2300
    expect(at('female', 55, { lactating: true }).glasses).toBe(11); // 2700
    expect(at(null, null).glasses).toBe(10);
    expect(at('male', 300).glasses).toBeLessThanOrEqual(Math.round(hyd.maxMl! / 250));
  });
});
