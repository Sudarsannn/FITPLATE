import { waterTarget } from './targets';

/**
 * Day 17: water tracker logic. One "glass" is the app's own counting unit (about 250 ml); the daily
 * target comes from the targets engine (the researched formula replaces the 8-glass default when the
 * hydration research arrives). Only plain water is counted. Other drinks wait for the researched
 * "counts toward hydration" table, so nothing here guesses a hydration percentage.
 */
export const GLASS_ML = 250;

export type Preset = { id: string; label: string; glasses: number };
export const PRESETS: Preset[] = [
  { id: 'glass', label: 'Glass', glasses: 1 },
  { id: 'bottle', label: 'Bottle 500 ml', glasses: 2 },
  { id: 'litre', label: 'Litre', glasses: 4 },
];

export const targetGlasses = (): number => waterTarget().glasses;
export const glassesToMl = (g: number) => g * GLASS_ML;
export const litres = (g: number) => `${Math.round((g * GLASS_ML) / 100) / 10} L`;

export type WaterDay = { key: string; glasses: number; met: boolean };

/** The last `n` days ending at `endKey`, oldest first. `keyFor(i)` returns the date key i days before the end. */
export function waterHistory(days: Record<string, { water: number }>, keys: string[], target: number): WaterDay[] {
  return keys.map((key) => ({ key, glasses: days[key]?.water ?? 0, met: (days[key]?.water ?? 0) >= target }));
}

/**
 * Days in a row that met the target. Today only counts once it is met; until then the streak runs up to
 * yesterday, so it is not lost at breakfast. `keys` is newest first (today, yesterday, ...).
 */
export function waterStreak(days: Record<string, { water: number }>, keysNewestFirst: string[], target: number): number {
  let streak = 0;
  for (let i = 0; i < keysNewestFirst.length; i++) {
    if ((days[keysNewestFirst[i]]?.water ?? 0) >= target) streak++;
    else if (i > 0) break;
  }
  return streak;
}

// ---------------------------------------------------------------- reminders

/** Quiet hours: no reminder from 21:00 to 08:00. */
export const QUIET = { startHour: 21, endHour: 8 };
/** Workdays only (Expo weekday numbers: 1 = Sunday ... 7 = Saturday). */
export const WORKDAYS = [2, 3, 4, 5, 6];
const BASE_TIMES: { hour: number; minute: number }[] = [
  { hour: 8, minute: 30 },
  { hour: 10, minute: 30 },
  { hour: 13, minute: 30 },
  { hour: 16, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 21, minute: 30 },
];

export const inQuietHours = (hour: number) => hour >= QUIET.startHour || hour < QUIET.endHour;
export const waterReminderTimes = () => BASE_TIMES.filter((t) => !inQuietHours(t.hour));
