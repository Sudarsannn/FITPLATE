import type { DateKey } from './common';
import { DEFAULT_SURVEY, type Survey } from './survey';

export type Goal = 'lose' | 'maintain' | 'gain' | 'muscle';
/** 'jain', 'vegan', 'pescatarian' and 'no-onion-garlic' match dishes by their researched diet tags. */
export type DietType = 'veg' | 'egg' | 'non-veg' | 'jain' | 'vegan' | 'pescatarian' | 'no-onion-garlic';
export type CookingLevel = 'beginner' | 'expert';
export type Sex = 'female' | 'male' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';

/**
 * The user's profile, stored at `users/{uid}` (one document, id "profile").
 * Body fields are null until the user enters them (Day 16 targets engine);
 * nothing is guessed.
 */
export type UserProfile = {
  name: string;
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal;
  dietType: DietType;
  cookingLevel: CookingLevel;
  equipmentOwned: string[];
  gymAccess: boolean | null;
  breakfastReminder: boolean;
  onboarded: boolean;
  /** Optional private flags (e.g. a health condition). Never shown outside the app. */
  privateFlags: Record<string, boolean>;
  /** Day the onboarding finished, when known. */
  onboardedOn: DateKey | null;
  /** Profile survey answers (schema v2). */
  survey: Survey;
};

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  goal: 'lose',
  dietType: 'non-veg',
  cookingLevel: 'beginner',
  equipmentOwned: [],
  gymAccess: null,
  breakfastReminder: true,
  onboarded: false,
  privateFlags: {},
  onboardedOn: null,
  survey: DEFAULT_SURVEY,
};
