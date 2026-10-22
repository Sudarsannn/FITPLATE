/**
 * Helpers for the Move tab and the exercise page: everything comes from the
 * fitness research (Compendium METs, prescriptions, steps). Calories are
 * estimates: MET × body weight × hours.
 */
import type { Exercise, ExerciseSection, Prescription } from '../models/exercise';

/** kcal = MET × body weight (kg) × hours; 70 kg when no weight is known. */
export const exerciseKcal = (met: number, minutes: number, weightKg: number | null = null) => Math.round((met * (weightKg ?? 70) * minutes) / 60);

export const SECTION_LABEL: Record<ExerciseSection, string> = { home: 'Home', yoga_stretch: 'Yoga & stretch', gym: 'Gym' };
export const SECTION_ICON: Record<ExerciseSection, 'home-outline' | 'leaf-outline' | 'barbell-outline'> = {
  home: 'home-outline',
  yoga_stretch: 'leaf-outline',
  gym: 'barbell-outline',
};

/** Estimated kcal for 10 minutes; null when the research has no MET. */
export const kcalPer10 = (e: Pick<Exercise, 'met'>, weightKg: number | null): number | null => (e.met == null ? null : exerciseKcal(e.met, 10, weightKg));

/** The prescription for the user's level, else the first one. */
export function prescriptionFor(e: Pick<Exercise, 'prescriptions'>, level: Prescription['level'] = 'beginner'): Prescription | null {
  return e.prescriptions.find((p) => p.level === level) ?? e.prescriptions[0] ?? null;
}

const secs = (s: number) => (s >= 60 && s % 60 === 0 ? `${s / 60} min` : s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);

/** Short dose line: "2 × 8-12 · rest 75 s", "Hold 30 s × 3", "15 min". Long research text is cut to its first clause. */
export function doseLabel(p: Prescription | null): string | null {
  if (!p) return null;
  const reps = p.reps ? p.reps.split(/[,(;]/)[0].trim() : null;
  const parts: string[] = [];
  if (p.sets && reps) parts.push(`${p.sets} × ${reps}`);
  else if (reps) parts.push(reps);
  else if (p.timeSec) parts.push(p.sets && p.sets > 1 ? `${p.sets} × ${secs(p.timeSec)}` : secs(p.timeSec));
  if (p.restSec) parts.push(`rest ${secs(p.restSec)}`);
  return parts.length ? parts.join(' · ') : null;
}

/** Minutes to suggest when logging: the research's typical minutes, else the prescribed time, else 10. */
export function suggestedMinutes(e: Pick<Exercise, 'searchTags' | 'prescriptions'>): number {
  const typical = e.searchTags?.typicalMinutes;
  if (typical) return typical;
  const p = e.prescriptions[0];
  if (p?.timeSec && p.timeSec >= 300) return Math.round(p.timeSec / 60);
  return 10;
}

export function bySection<T extends Pick<Exercise, 'section'>>(list: readonly T[]): Record<ExerciseSection, T[]> {
  const out: Record<ExerciseSection, T[]> = { home: [], yoga_stretch: [], gym: [] };
  for (const e of list) if (e.section) out[e.section].push(e);
  return out;
}

/** "Push-up (with knee and incline versions)" → "Push-up": the research name without its bracketed detail. */
export const shortExerciseName = (name: string) => name.replace(/\s*\(.*\)\s*$/, '').trim() || name;

/** "quadriceps (rectus femoris, …)" → "Quadriceps"; first two muscles. */
export function musclesLine(e: Pick<Exercise, 'musclesPrimary'>): string {
  return e.musclesPrimary
    .slice(0, 2)
    .map((m) => m.replace(/\s*\(.*$/, '').trim())
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .join(', ');
}
