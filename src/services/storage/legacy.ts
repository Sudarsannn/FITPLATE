import type { BaseDoc, Doc } from '../../models/common';
import type { Favourite, MealLog, MealPlanDay, SavingEntry, WaterLog, WorkoutLog } from '../../models/logs';
import { DEFAULT_PROFILE, type UserProfile } from '../../models/user';
import type { DayLog, Profile } from '../../lib/store';
import { PROFILE_ID } from './remote';
import { SCHEMAS } from './schemas';

/** The demo's single blob, saved under AsyncStorage key `fitplate.state.v2`. */
export const LEGACY_KEY = 'fitplate.state.v2';

export type LegacyState = {
  profile: Profile;
  days: Record<string, DayLog>;
  moneySaved: number;
  favourites: string[];
  plan: Record<string, Partial<Record<'breakfast' | 'lunch' | 'dinner', string>>>;
};

/** The demo seeds this much "saved by cooking" with its sample week. */
export const DEMO_SAMPLE_SAVED_INR = 2860;

export type LegacyDocs = {
  profile: Doc<UserProfile>;
  mealLogs: Doc<MealLog>[];
  waterLogs: Doc<WaterLog>[];
  workoutLogs: Doc<WorkoutLog>[];
  favourites: Doc<Favourite>[];
  mealPlans: Doc<MealPlanDay>[];
  savings: Doc<SavingEntry>[];
};

/**
 * Sample entries are seeded at whole hours (meals) or at 0 (workouts); real
 * taps use Date.now(), which almost never lands on an exact minute. This is
 * how the made-up sample week is told apart from the user's own logs.
 */
export const isSampleMealTime = (at: number) => at % 60_000 === 0;
export const isSampleWorkoutTime = (at: number) => at === 0;

/**
 * Turn the demo blob into versioned documents with stable ids, so running it
 * twice gives the same documents. Pure: no storage access.
 */
export function fromLegacyState(state: LegacyState, now: number): LegacyDocs {
  const base = (id: string, collection: keyof typeof SCHEMAS, createdAt = now): BaseDoc => ({
    id,
    createdAt,
    updatedAt: now,
    schemaVersion: SCHEMAS[collection].version,
    deleted: false,
  });
  const p = state.profile;
  const profile: Doc<UserProfile> = {
    ...DEFAULT_PROFILE,
    name: p.name ?? '',
    goal: p.goal ?? DEFAULT_PROFILE.goal,
    dietType: p.diet ?? DEFAULT_PROFILE.dietType,
    cookingLevel: p.level ?? DEFAULT_PROFILE.cookingLevel,
    breakfastReminder: p.breakfastReminder ?? DEFAULT_PROFILE.breakfastReminder,
    onboarded: p.onboarded ?? false,
    ...base(PROFILE_ID, 'profile'),
  };

  const mealLogs: Doc<MealLog>[] = [];
  const waterLogs: Doc<WaterLog>[] = [];
  const workoutLogs: Doc<WorkoutLog>[] = [];
  let sampleSeen = false;
  for (const [dateKey, day] of Object.entries(state.days ?? {})) {
    let realActivity = false;
    (day.meals ?? []).forEach((m, i) => {
      const demoSample = isSampleMealTime(m.at);
      sampleSeen ||= demoSample;
      realActivity ||= !demoSample;
      mealLogs.push({
        ...base(`meal-${dateKey}-${m.at}-${i}`, 'mealLogs', m.at || now),
        timestamp: m.at,
        dateKey,
        name: m.name,
        emoji: m.emoji,
        // The demo log keeps no dish id; Day 13 meal logging records it.
        dishId: null,
        source: m.cooked ? 'dish' : 'quick',
        kcal: m.kcal,
        proteinG: m.protein,
        fibreG: m.fibre,
        cooked: m.cooked,
        ...(demoSample ? { demoSample } : {}),
      });
    });
    (day.exercise ?? []).forEach((e, i) => {
      const demoSample = isSampleWorkoutTime(e.at);
      sampleSeen ||= demoSample;
      realActivity ||= !demoSample;
      workoutLogs.push({
        ...base(`workout-${dateKey}-${e.at}-${i}`, 'workoutLogs', e.at || now),
        timestamp: e.at,
        dateKey,
        type: e.type,
        exerciseId: null,
        minutes: e.minutes,
        kcal: e.kcal,
        ...(demoSample ? { demoSample } : {}),
      });
    });
    if (day.water > 0) {
      // Water has no timestamp; a day is sample when every other entry that day is.
      const demoSample = !realActivity && (day.meals ?? []).length + (day.exercise ?? []).length > 0;
      waterLogs.push({
        ...base(`water-${dateKey}`, 'waterLogs'),
        timestamp: now,
        dateKey,
        glasses: day.water,
        ...(demoSample ? { demoSample } : {}),
      });
    }
  }

  const favourites = (state.favourites ?? []).map((dishId) => ({ ...base(dishId, 'favourites'), dishId }));
  const mealPlans = Object.entries(state.plan ?? {}).map(([dateKey, slots]) => ({ ...base(dateKey, 'mealPlans'), dateKey, slots }));

  // The demo keeps one running total; the seeded sample amount is not the user's money.
  const real = sampleSeen ? Math.max(0, state.moneySaved - DEMO_SAMPLE_SAVED_INR) : state.moneySaved;
  const savings: Doc<SavingEntry>[] =
    real > 0 ? [{ ...base('legacy-total', 'savings'), timestamp: now, amountInr: real, dishId: null, note: 'Carried over from the demo total' }] : [];

  return { profile, mealLogs, waterLogs, workoutLogs, favourites, mealPlans, savings };
}
