import type { Dish } from '../models/research';
import type { DietType } from '../models/user';
import type { Survey } from '../models/survey';
import { totalMinutes } from './dishLibrary';
import { fitsSurvey } from './surveyMatch';

/**
 * Late-night craving helper (Day 11 innovation, flag `lateNightHelper`): after 9 pm
 * Today offers up to three quick, lighter researched dishes that fit the person's
 * diet and allergies, as an easy alternative to ordering. Only dishes with both the
 * time and the calories researched qualify.
 */
export const isLateNight = (d: Date) => d.getHours() >= 21 || d.getHours() < 2;

export function lateNightPicks(dishes: readonly Dish[], diet: DietType, survey: Pick<Survey, 'allergies'>, n = 3): Dish[] {
  return dishes
    .filter((d) => {
      const t = totalMinutes(d);
      const kcal = d.nutritionPerServing.kcal;
      return !d.ai && t != null && t <= 25 && kcal != null && kcal < 450 && fitsSurvey(diet, survey, d);
    })
    .sort((a, b) => (b.healthiness?.score ?? 0) - (a.healthiness?.score ?? 0) || (totalMinutes(a) ?? 99) - (totalMinutes(b) ?? 99))
    .slice(0, n);
}
