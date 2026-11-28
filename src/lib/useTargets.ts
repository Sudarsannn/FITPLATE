import { useMemo } from 'react';

import { featureFlags } from '../config/featureFlags';
import { waterTarget, energyTarget, GOAL_PRESETS, microTargets, type EnergyTarget, type MicroTarget } from '../services/targets';
import { researchConditions, researchHydration, researchNutrients } from '../data/research';
import { healthContext, sodiumLimit, waterGlasses, type HealthContext } from '../services/healthLimits';
import { GLASS_ML } from '../services/water';
import { dayKey, GOALS, useStore } from './store';

/** The signed-in user's targets (Day 16, flag `personalTargets`). With the flag off, or details missing, the goal presets. */
export function useTargets(): { goal: (typeof GOALS)[keyof typeof GOALS]; energy: EnergyTarget; micros: MicroTarget[]; health: HealthContext; sodium: ReturnType<typeof sodiumLimit>; water: ReturnType<typeof waterGlasses>; waterInfo: ReturnType<typeof waterTarget> } {
  const { profile, body, sex, privateFlags, settings, today } = useStore();
  const workoutMinToday = today.exercise.reduce((n, e) => n + (e.minutes > 0 ? e.minutes : 0), 0);
  return useMemo(() => {
    const p = { ...body, sex, goal: profile.goal, privateFlags };
    const energy = featureFlags.personalTargets ? energyTarget(p) : { ...GOAL_PRESETS[profile.goal], source: 'preset' as const, note: null, bmr: null };
    const health = healthContext(profile.survey, researchConditions);
    const doctor = settings.doctorLimits;
    // A hot day only counts on its own date, and never for people whose doctor sets their water.
    // Workout minutes raise the target only for people without a doctor-led condition, like the heat add.
    const workoutMin = health.waterCaution ? null : workoutMinToday;
    const heat = !health.waterCaution && settings.heatDay?.date === dayKey(new Date()) ? settings.heatDay.band : null;
    const waterInfo = waterTarget({ ...p, age: body.age }, researchHydration.find((h) => h.id === 'water-daily-requirement') ?? researchHydration[0] ?? null, heat, workoutMin);
    return {
      health,
      sodium: sodiumLimit(health, doctor),
      water: waterGlasses(waterInfo.glasses, GLASS_ML, doctor),
      waterInfo,
      goal: { ...GOALS[profile.goal], kcal: energy.kcal, protein: energy.protein }, energy, micros: featureFlags.personalTargets ? microTargets(p, researchNutrients) : [] };
  }, [profile.goal, profile.survey, body, sex, privateFlags, settings.doctorLimits, settings.heatDay, workoutMinToday]);
}
