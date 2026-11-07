import type { HealthCondition } from '../models/nutrient';
import type { DoctorLimits } from '../models/prefs';
import type { Survey } from '../models/survey';

/**
 * Review 2026-11-06 FIX 1: health conditions in targets, water and reminders (SPEC-ADDENDA §8).
 * Limits come only from the researched condition files. Where the research says the limit is a doctor's
 * call (`requiresDoctorInput`), the app shows "Follow your doctor's advice", pushes no higher water
 * target, and lets the user enter the number their doctor gave, which then replaces the app's number.
 */
export const DOCTOR_LINE = "Follow your doctor's advice";

export type HealthContext = {
  conditions: HealthCondition[];
  /** Any chosen condition needs the user's doctor to set the limit. */
  needsDoctor: boolean;
  /** Lowest researched sodium limit across chosen conditions (mg per day), with the condition names it came from. */
  sodium: { mg: number; from: string[] } | null;
  /** No pushed water target, no streak, reminders off by default. */
  waterCaution: boolean;
  /** Names of the chosen conditions, for display next to the note. */
  names: string[];
};

export function healthContext(survey: Pick<Survey, 'healthIssues'>, all: readonly HealthCondition[]): HealthContext {
  const conditions = survey.healthIssues.map((id) => all.find((c) => c.id === id && c.type === 'condition')).filter((c): c is HealthCondition => Boolean(c));
  const needsDoctor = conditions.some((c) => c.requiresDoctorInput);
  const withSodium = conditions.filter((c) => c.sodiumMgMax != null && c.sodiumMgMax > 0);
  const sodium = withSodium.length ? { mg: Math.min(...withSodium.map((c) => c.sodiumMgMax as number)), from: withSodium.map((c) => c.name) } : null;
  return { conditions, needsDoctor, sodium, waterCaution: needsDoctor, names: conditions.map((c) => c.name) };
}

/** The daily sodium limit in force: the doctor's number when given, else the researched one, else none. */
export function sodiumLimit(h: HealthContext, doctor?: DoctorLimits): { mg: number; source: 'doctor' | 'research' } | null {
  if (doctor?.sodiumMg != null && doctor.sodiumMg > 0) return { mg: doctor.sodiumMg, source: 'doctor' };
  return h.sodium ? { mg: h.sodium.mg, source: 'research' } : null;
}

/** Glasses of water to aim for: the doctor's amount when given, otherwise the general default. Never raised for a condition. */
export function waterGlasses(general: number, glassMl: number, doctor?: DoctorLimits): { glasses: number; source: 'doctor' | 'general' } {
  if (doctor?.waterMl != null && doctor.waterMl > 0) return { glasses: Math.max(1, Math.round(doctor.waterMl / glassMl)), source: 'doctor' };
  return { glasses: general, source: 'general' };
}

/** Water reminders start off for everyone with a doctor-led condition (they are never switched on for them). */
export const remindersDefaultOn = (h: HealthContext) => !h.waterCaution;
