import { useMemo } from 'react';

import { featureFlags } from '../config/featureFlags';
import { energyTarget, GOAL_PRESETS, microTargets, type EnergyTarget, type MicroTarget } from '../services/targets';
import { researchNutrients } from '../data/research';
import { GOALS, useStore } from './store';

/** The signed-in user's targets (Day 16, flag `personalTargets`). With the flag off, or details missing, the goal presets. */
export function useTargets(): { goal: (typeof GOALS)[keyof typeof GOALS]; energy: EnergyTarget; micros: MicroTarget[] } {
  const { profile, body, sex, privateFlags } = useStore();
  return useMemo(() => {
    const p = { ...body, sex, goal: profile.goal, privateFlags };
    const energy = featureFlags.personalTargets ? energyTarget(p) : { ...GOAL_PRESETS[profile.goal], source: 'preset' as const, note: null, bmr: null };
    return { goal: { ...GOALS[profile.goal], kcal: energy.kcal, protein: energy.protein }, energy, micros: featureFlags.personalTargets ? microTargets(p, researchNutrients) : [] };
  }, [profile.goal, body, sex, privateFlags]);
}
