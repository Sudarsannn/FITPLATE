import type { Survey } from '../models/survey';

/**
 * Day 31: quick setup. First run asks six short pages, every one skippable, in the order that matters most for a
 * useful Today screen: name, goal, diet, body (for exact targets), kitchen and cooking level, and where you train.
 * Health conditions and food habits are asked afterwards from a "Finish your profile" card on Today, so nobody
 * is held at the door, but nothing safety-related is forgotten. Pure, so Jest can test it.
 */
export const QUICK_PAGES = ['name', 'goals', 'diet', 'body', 'kitchen', 'training'] as const;
export const LATER_PAGES = ['health', 'food'] as const;

export type GapPage = 'health' | 'food' | 'body' | 'training' | 'kitchen';
export type ProfileGap = { page: GapPage; label: string; why: string };

type BodyLike = { age: number | null; heightCm: number | null; weightKg: number | null };

/** What is still unanswered, safety first. Empty once the person has answered or chosen "none" / "prefer not to say". */
export function profileGaps(input: { survey: Pick<Survey, 'healthIssues' | 'mealsPerDay' | 'cuisines' | 'budgetPerMeal' | 'trainWhere'>; body: BodyLike; equipmentOwned: readonly string[] }): ProfileGap[] {
  const out: ProfileGap[] = [];
  const s = input.survey;
  if (s.healthIssues.length === 0) out.push({ page: 'health', label: 'Health conditions', why: 'So advice on food and exercise stays safe for you' });
  const b = input.body;
  if (b.age == null || b.heightCm == null || b.weightKg == null) out.push({ page: 'body', label: 'Age, height and weight', why: 'For calorie and protein targets that fit you' });
  if (s.trainWhere.length === 0) out.push({ page: 'training', label: 'Where you train', why: 'So the workout of the day suits you' });
  if (input.equipmentOwned.length === 0) out.push({ page: 'kitchen', label: 'Your kitchen', why: 'So dishes need only what you have' });
  if (s.mealsPerDay == null && s.cuisines.length === 0 && s.budgetPerMeal == null) out.push({ page: 'food', label: 'Food habits and budget', why: 'So suggestions match your taste and wallet' });
  return out;
}
