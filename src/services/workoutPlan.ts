/**
 * The guided workout player's script (22 Oct 2026): the beginner
 * prescription from the fitness research turned into work and rest phases.
 * Timed sets (holds, cardio blocks) count down; rep sets wait for "Done".
 * A target in minutes (from "See ways to balance this") stretches a single
 * timed cardio block to that length; it never adds sets the research didn't
 * prescribe.
 */
import type { Exercise } from '../models/exercise';
import { prescriptionFor, suggestedMinutes } from './fitness';

export type WorkoutPhase =
  | { kind: 'work'; set: number; sets: number; seconds: number | null; reps: string | null }
  | { kind: 'rest'; seconds: number; nextSet: number };

/** Rough time for one set of reps, used only for the "about N min" line. */
const REP_SET_SEC = 45;

export function workoutPhases(e: Pick<Exercise, 'prescriptions' | 'searchTags' | 'type'>, targetMinutes?: number | null): WorkoutPhase[] {
  const p = prescriptionFor(e);
  const target = targetMinutes && targetMinutes > 0 ? Math.round(targetMinutes) : null;
  if (!p || (!p.timeSec && !p.reps)) {
    return [{ kind: 'work', set: 1, sets: 1, seconds: (target ?? suggestedMinutes(e)) * 60, reps: null }];
  }
  const sets = Math.max(1, p.sets ?? 1);
  const reps = p.reps ? p.reps.split(/[,(;]/)[0].trim() || null : null;
  let seconds = p.timeSec ?? null;
  // One continuous cardio block: the balance target sets its length.
  if (target && sets === 1 && seconds && e.type === 'cardio') seconds = target * 60;
  const out: WorkoutPhase[] = [];
  for (let s = 1; s <= sets; s++) {
    out.push({ kind: 'work', set: s, sets, seconds, reps });
    if (s < sets && p.restSec) out.push({ kind: 'rest', seconds: p.restSec, nextSet: s + 1 });
  }
  return out;
}

/** About how long the plan takes, in whole minutes (at least 1). */
export function planMinutes(phases: readonly WorkoutPhase[]): number {
  const sec = phases.reduce((t, ph) => t + (ph.seconds ?? REP_SET_SEC), 0);
  return Math.max(1, Math.round(sec / 60));
}

/** "1:05" for a countdown. */
export function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
