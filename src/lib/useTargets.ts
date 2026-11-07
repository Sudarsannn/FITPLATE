import { useMemo } from 'react';

import { featureFlags } from '../config/featureFlags';
import { waterTarget, energyTarget, GOAL_PRESETS, microTargets, type EnergyTarget, type MicroTarget } from '../services/targets';
import { researchConditions, researchNutrients } from '../data/research';
import { healthContext, sodiumLimit, waterGlasses, type HealthContext } from '../services/healthLimits';
import { GLASS_ML } from '../services/water';
import { GOALS, useStore } from './store';

/** The signed-in user's targets (Day 16, flag `personalTargets`). With the flag off, or details missing, the goal presets. */
export function useTargets(): { goal: (typeof GOALS)[keyof typeof GOALS]; energy: EnergyTarget; micros: MicroTarget[]; health: HealthContext; sodium: ReturnType<typeof sodiumLimit>; water: ReturnType<typeof waterGlasses> } {
  const { profile, body, sex, privateFlags, settings } = useStore();
  return useMemo(() => {
    const p = { ...body, sex, goal: profile.goal, privateFlags };
    const energy = featureFlags.personalTargets ? energyTarget(p) : { ...GOAL_PRESETS[profile.goal], source: 'preset' as const, note: null, bmr: null };
    const health = healthContext(profile.survey, researchConditions);
    const doctor = settings.doctorLimits;
    return {
      health,
      sodium: sodiumLimit(health, doctor),
      water: waterGlasses(waterTarget().glasses, GLASS_ML, doctor),
      goal: { ...GOALS[profile.goal], kcal: energy.kcal, protein: energy.protein }, energy, micros: featureFlags.personalTargets ? microTargets(p, researchNutrients) : [] };
  }, [profile.goal, profile.survey, body, sex, privateFlags, settings.doctorLimits]);
}
