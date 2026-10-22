import type { AllergenId } from './research';

/**
 * The profile survey's answers (SPEC-ADDENDA §8, built on demand 22 Oct 2026).
 * Stored on the profile document under `survey`. Every answer is optional:
 * empty arrays and nulls mean "not answered", never a guess.
 */
export type ExtraGoal = 'eat-cheaper' | 'cook-more' | 'more-energy' | 'better-digestion' | 'eat-for-condition' | 'less-ordering' | 'regular-meals' | 'better-sleep';
export type Budget = 'under-100' | '100-200' | '200-350' | '350-plus';
export type TrainWhere = 'home' | 'gym' | 'outdoors';
export type Experience = 'new' | 'some' | 'regular';

export type Survey = {
  /** Goals besides the main one (the main one is `UserProfile.goal`). */
  goals: ExtraGoal[];
  /** Health-condition research ids, or 'none' / 'prefer-not'. Private. */
  healthIssues: string[];
  /** Anything else, in the user's words. Private. */
  healthOther: string;
  allergies: AllergenId[];
  mealsPerDay: number | null;
  cuisines: string[];
  dislikes: string;
  budgetPerMeal: Budget | null;
  trainWhere: TrainWhere[];
  workoutEquipment: string[];
  experience: Experience | null;
  daysPerWeek: number | null;
  sessionMin: number | null;
  workoutTypes: string[];
  /** Body areas to go easy on, or 'none'. */
  limits: string[];
  limitsOther: string;
};

export const DEFAULT_SURVEY: Survey = {
  goals: [],
  healthIssues: [],
  healthOther: '',
  allergies: [],
  mealsPerDay: null,
  cuisines: [],
  dislikes: '',
  budgetPerMeal: null,
  trainWhere: [],
  workoutEquipment: [],
  experience: null,
  daysPerWeek: null,
  sessionMin: null,
  workoutTypes: [],
  limits: [],
  limitsOther: '',
};

/** Fills any missing answer with its default (older profiles, partial cloud copies). */
export function withSurveyDefaults(s: Partial<Survey> | null | undefined): Survey {
  return { ...DEFAULT_SURVEY, ...(s ?? {}) };
}
