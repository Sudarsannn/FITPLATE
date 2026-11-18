import { useMemo, useState } from 'react';

import { researchNutrients } from '../data/research';
import { makeCost } from '../services/dishLibrary';
import { weeklyCoverage } from '../services/insights';
import { userConcerns } from '../services/moveSafety';
import { cookAgainIds } from '../services/recentDishes';
import type { Budget } from '../models/survey';
import { recommendMeals, recommendWorkout, type Slot } from '../services/recommend';
import { supplementTotals } from '../services/supplements';
import { addDays, dayKey, dayTotals, useStore } from './store';
import { useResearchDishes } from './useResearch';
import { useTargets } from './useTargets';

export type RecommendOptions = { slot?: Slot; maxMinutes?: number | null; budget?: Budget | null | undefined };

/** Day 30: gathers what the engine needs from the person's logs, profile and targets. */
export function useRecommend(opts: RecommendOptions = {}) {
  const { today, days, profile, equipmentOwned, bodyWeightKg, routines, sex, supplements } = useStore();
  const { goal, micros, health } = useTargets();
  const dishes = useResearchDishes();
  const [now] = useState(() => new Date());

  return useMemo(() => {
    const keys = Array.from({ length: 7 }, (_, i) => dayKey(addDays(now, -i)));
    const byDay: Record<string, { nutrientId: string; amount: number; unit: string }[]> = {};
    for (const s of supplements) if (s.nutrientId && s.dose != null && s.unit) (byDay[s.dateKey] ??= []).push({ nutrientId: s.nutrientId, amount: s.dose, unit: s.unit });
    const supplementsByDay = Object.fromEntries(Object.entries(byDay).map(([k, d]) => [k, supplementTotals(d, researchNutrients).totals]));
    const targetMap = sex ? Object.fromEntries(micros.map((m) => [m.id, m.value])) : undefined;
    const week = weeklyCoverage(days, keys, (id) => dishes.find((d) => d.id === id), researchNutrients, sex === 'female' ? 'adult_female' : 'adult_male', { targets: targetMap, supplementsByDay });
    const gaps = week.gaps.map((g) => ({ id: g.id, name: g.name, target: g.target }));
    const totals = dayTotals(today);
    const meals = recommendMeals({
      dishes,
      hour: now.getHours(),
      slot: opts.slot,
      goal: profile.goal,
      kcalTarget: health.needsDoctor ? null : goal.kcal,
      proteinTarget: goal.protein,
      eatenKcal: totals.kcalIn,
      eatenProtein: totals.protein,
      mealsLoggedToday: today.meals.length,
      diet: profile.diet,
      survey: profile.survey,
      level: profile.level,
      equipmentOwned,
      maxMinutes: opts.maxMinutes ?? null,
      budget: opts.budget,
      gaps,
      recentIds: cookAgainIds(days, 6),
      costOf: (d) => makeCost(d)?.avg ?? null,
    });
    const recent = [1, 2].map((n) => (days[dayKey(addDays(now, -n))]?.exercise ?? []).reduce((s, e) => s + e.minutes, 0));
    const workout = recommendWorkout(
      {
        survey: profile.survey,
        concerns: userConcerns(profile.survey).concerns,
        needsDoctor: health.needsDoctor,
        hour: now.getHours(),
        weekday: now.getDay(),
        minutesToday: today.exercise.reduce((s, e) => s + e.minutes, 0),
        recentMinutes: recent,
        ownRoutines: routines.map((r) => ({ id: r.id, routine: r })),
      },
      bodyWeightKg,
    );
    return { meals, workout, gaps, kcalLeft: health.needsDoctor ? null : Math.max(0, goal.kcal - totals.kcalIn), proteinLeft: Math.max(0, goal.protein - totals.protein) };
  }, [now, dishes, days, today, profile, equipmentOwned, bodyWeightKg, routines, sex, supplements, goal, micros, health, opts.slot, opts.maxMinutes, opts.budget]);
}
