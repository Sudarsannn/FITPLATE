/**
 * How survey answers pick dishes (22 Oct 2026). Diet rules come only from the
 * research: the dish's `dietType` and its researched diet tags ("Jain",
 * "Jain option", "Vegan", "Vegan option", "Pescatarian", "No onion-garlic").
 * "… option" means research gives a version for that diet, which the dish
 * page shows under "Other versions". Allergies drop any dish whose ingredients
 * contain the allergen (`allergens`, worked out from the recipe).
 */
import type { DietType } from '../models/user';
import type { AllergenId, Dish } from '../models/research';
import type { Exercise } from '../models/exercise';
import type { Survey } from '../models/survey';

type DishLike = Pick<Dish, 'dietType' | 'tags' | 'allergens' | 'cuisine'>;

const has = (d: DishLike, ...tags: string[]) => tags.some((t) => d.tags.includes(t));

export function dietAllows(diet: DietType, d: DishLike): boolean {
  switch (diet) {
    case 'non-veg':
      return true;
    case 'egg':
      return d.dietType === 'veg' || d.dietType === 'egg';
    case 'veg':
      return d.dietType === 'veg';
    case 'jain':
      return has(d, 'Jain', 'Jain option');
    case 'vegan':
      return has(d, 'Vegan', 'Vegan option');
    case 'pescatarian':
      return d.dietType === 'veg' || d.dietType === 'egg' || has(d, 'Pescatarian');
    case 'no-onion-garlic':
      return has(d, 'No onion-garlic');
  }
}

export function allergyAllows(allergies: readonly AllergenId[], d: DishLike): boolean {
  return !allergies.some((a) => d.allergens.includes(a));
}

/** Diet and allergies together: what FitPlate recommends. Browsing still shows everything. */
export function fitsSurvey(diet: DietType, survey: Pick<Survey, 'allergies'>, d: DishLike): boolean {
  return dietAllows(diet, d) && allergyAllows(survey.allergies, d);
}

/** A dish whose cuisine or tags mention one of the liked cuisines. */
export function likedCuisine(cuisines: readonly string[], d: DishLike): boolean {
  if (!cuisines.length) return false;
  const text = `${d.cuisine ?? ''} ${d.tags.join(' ')}`.toLowerCase();
  return cuisines.some((c) => text.includes(c.toLowerCase()));
}

type MoveLike = Pick<Exercise, 'section' | 'type'>;

/** How well a researched move fits the Training answers: 0 = no signal, higher = better fit. */
export function workoutFit(survey: Pick<Survey, 'trainWhere' | 'workoutTypes'>, e: MoveLike): number {
  let score = 0;
  const where = survey.trainWhere;
  if (where.includes('home') && (e.section === 'home' || e.section === 'yoga_stretch')) score += 2;
  if (where.includes('gym') && e.section === 'gym') score += 2;
  const t = survey.workoutTypes;
  if (t.includes('Home workouts') && e.section === 'home') score += 1;
  if (t.includes('Yoga and stretching') && e.section === 'yoga_stretch') score += 1;
  if (t.includes('Weights and machines') && e.section === 'gym' && e.type === 'strength') score += 1;
  if (t.includes('Cardio machines') && e.section === 'gym' && e.type === 'cardio') score += 1;
  if (t.includes('Walking or running') && e.type === 'cardio') score += 1;
  return score;
}
