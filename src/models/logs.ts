import type { DateKey } from './common';

/**
 * Logs the user creates. Each one is a document in its own subcollection of
 * `users/{uid}` and refers to research content by id only.
 * `demoSample` marks the demo's made-up sample week, so it is never copied
 * into a real account.
 */
type LogBase = {
  /** Epoch ms of the moment logged. */
  timestamp: number;
  dateKey: DateKey;
  demoSample?: boolean;
};

export type MealSource = 'dish' | 'quick' | 'custom';

export type MealLog = LogBase & {
  name: string;
  emoji: string;
  /** Research dish id when the meal is a FitPlate dish; null for quick or custom meals. */
  dishId: string | null;
  source: MealSource;
  kcal: number;
  proteinG: number;
  fibreG: number;
  /** True when cooked at home. */
  cooked: boolean;
};

/** One document per day (id `water-YYYY-MM-DD`), so +/- taps update one counter. */
export type WaterLog = LogBase & {
  glasses: number;
};

export type SupplementLog = LogBase & {
  name: string;
  /** Research nutrient id (e.g. "vitamin-d") when known. */
  nutrientId: string | null;
  dose: number | null;
  unit: string | null;
};

export type WorkoutLog = LogBase & {
  type: string;
  /** Research exercise id once the exercise library exists (Day 21). */
  exerciseId: string | null;
  minutes: number;
  /** Estimate (MET × weight × hours). */
  kcal: number;
};

/** Saved dish (id = dishId). */
export type Favourite = { dishId: string };

/** One document per planned day (id = dateKey). */
export type MealPlanDay = {
  dateKey: DateKey;
  slots: Partial<Record<'breakfast' | 'lunch' | 'dinner', string>>;
};

/** Money saved by cooking instead of ordering. */
export type SavingEntry = {
  timestamp: number;
  amountInr: number;
  dishId: string | null;
  note: string | null;
};
