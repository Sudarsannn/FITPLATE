import type { AllergenId } from '../models/research';
import type { Budget, Experience, ExtraGoal, TrainWhere } from '../models/survey';
import type { ActivityLevel, DietType } from '../models/user';

/** Labels for the profile survey's choices (SPEC-ADDENDA §8). Diet and condition rules come from research, not from here. */
export type Choice<T extends string> = { id: T; label: string; emoji?: string; sub?: string };

export const DIETS: Choice<DietType>[] = [
  { id: 'veg', label: 'Vegetarian', emoji: '🥦' },
  { id: 'egg', label: 'Eggetarian', emoji: '🥚', sub: 'Vegetarian plus eggs' },
  { id: 'non-veg', label: 'Non-vegetarian', emoji: '🍗' },
  { id: 'jain', label: 'Jain', emoji: '🙏', sub: 'Dishes research marks Jain, or with a Jain version' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱', sub: 'Dishes research marks vegan, or with a vegan version' },
  { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟', sub: 'Vegetarian, eggs and fish' },
  { id: 'no-onion-garlic', label: 'No onion or garlic', emoji: '🧄', sub: 'Dishes research marks no onion-garlic' },
];

export const EXTRA_GOALS: Choice<ExtraGoal>[] = [
  { id: 'eat-cheaper', label: 'Spend less on food', emoji: '💰' },
  { id: 'less-ordering', label: 'Order in less', emoji: '🛵' },
  { id: 'cook-more', label: 'Cook more at home', emoji: '🍳' },
  { id: 'more-energy', label: 'More energy in the day', emoji: '⚡' },
  { id: 'better-digestion', label: 'Better digestion', emoji: '🌿' },
  { id: 'regular-meals', label: 'Eat at regular times', emoji: '⏰' },
  { id: 'better-sleep', label: 'Sleep better', emoji: '🌙' },
  { id: 'eat-for-condition', label: 'Eat for a health condition', emoji: '🩺' },
];

export const ALLERGIES: Choice<AllergenId>[] = [
  { id: 'peanut', label: 'Peanuts' },
  { id: 'treeNut', label: 'Tree nuts' },
  { id: 'milk', label: 'Milk and dairy' },
  { id: 'egg', label: 'Egg' },
  { id: 'gluten', label: 'Gluten (wheat)' },
  { id: 'soy', label: 'Soy' },
  { id: 'sesame', label: 'Sesame' },
  { id: 'mustard', label: 'Mustard' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
];

export const ACTIVITY: Choice<ActivityLevel>[] = [
  { id: 'sedentary', label: 'Mostly sitting', sub: 'Desk job, little walking' },
  { id: 'light', label: 'Lightly active', sub: 'Some walking most days' },
  { id: 'moderate', label: 'Moderately active', sub: 'On my feet a lot, or workouts 3× a week' },
  { id: 'active', label: 'Active', sub: 'Hard workouts most days' },
  { id: 'very-active', label: 'Very active', sub: 'Physical job or training twice a day' },
];

/** Matched against each dish's cuisine line and tags. */
export const CUISINES = ['North Indian', 'South Indian', 'Punjabi', 'Gujarati', 'Maharashtrian', 'Bengali', 'Goan', 'Kerala', 'Hyderabadi', 'Mughlai', 'Kashmiri', 'Indo-Chinese', 'Street food'];

export const BUDGETS: Choice<Budget>[] = [
  { id: 'under-100', label: 'Under ₹100' },
  { id: '100-200', label: '₹100–200' },
  { id: '200-350', label: '₹200–350' },
  { id: '350-plus', label: '₹350+' },
];

export const KITCHEN = ['Pressure cooker', 'Kadai', 'Tawa', 'Non-stick pan', 'Mixer-grinder', 'Induction', 'Microwave', 'Oven / OTG', 'Air fryer', 'Blender'];

export const TRAIN_WHERE: Choice<TrainWhere>[] = [
  { id: 'home', label: 'At home', emoji: '🏠' },
  { id: 'gym', label: 'At a gym', emoji: '🏋️' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌳' },
];

export const EXPERIENCE: Choice<Experience>[] = [
  { id: 'new', label: 'New to it', sub: 'Show me everything' },
  { id: 'some', label: 'Some experience', sub: 'I know the basics' },
  { id: 'regular', label: 'I train regularly', sub: 'Just the plan' },
];

export const WORKOUT_GEAR = ['Nothing', 'Yoga mat', 'Dumbbells', 'Resistance bands', 'Kettlebell', 'Pull-up bar', 'Skipping rope', 'Cycle'];

export const WORKOUT_TYPES = ['Walking or running', 'Home workouts', 'Yoga and stretching', 'Weights and machines', 'Cardio machines', 'Sports'];

export const LIMITS = ['Knees', 'Lower back', 'Shoulders', 'Neck', 'Wrists', 'Ankles', 'Pregnancy or after birth'];

export const SESSION_MIN = [10, 20, 30, 45, 60];

const by = <T extends string>(list: Choice<T>[]) => Object.fromEntries(list.map((c) => [c.id, c.label])) as Record<T, string>;
export const DIET_LABEL = by(DIETS);
export const GOAL_LABEL = by(EXTRA_GOALS);
export const ALLERGY_LABEL = by(ALLERGIES);
export const ACTIVITY_LABEL = by(ACTIVITY);
export const BUDGET_LABEL = by(BUDGETS);
export const WHERE_LABEL = by(TRAIN_WHERE);
export const EXPERIENCE_LABEL = by(EXPERIENCE);
