/**
 * Day 24: the pure parts of the guided workout player: the rep target read from
 * the research text, per-set results (reps, weight, effort), the end summary,
 * and which moves can stand in for another. Kept out of the screen so Jest can
 * test it.
 */
import type { Exercise } from '../models/exercise';
import type { WorkoutSet } from '../models/logs';

/** "8-12 (wall or knee version)" → 12; "10 per leg" → 10; text with no number → null. The top of a range, so "Done" is never offered early. */
export function repTarget(reps: string | null | undefined): number | null {
  const m = reps ? /(\d+)\s*(?:-|–|to)?\s*(\d+)?/.exec(reps) : null;
  if (!m) return null;
  const top = m[2] ? Number(m[2]) : Number(m[1]);
  return top > 0 && top <= 100 ? top : null;
}

/** What to say for a count: the number, then a short finish at the target. */
export const countCue = (n: number, target: number | null): string => (target !== null && n >= target ? `${n}. Set done.` : String(n));

/** Last three seconds of a timed phase are counted aloud. */
export const countdownCue = (secondsLeft: number): string | null => (secondsLeft >= 1 && secondsLeft <= 3 ? String(secondsLeft) : null);

export const KG_STEP = 2.5;
export const clampKg = (kg: number): number => Math.min(500, Math.max(0, Math.round(kg * 2) / 2));
export const clampRpe = (n: number): number => Math.min(10, Math.max(1, Math.round(n)));

export type SessionSummary = { sets: number; reps: number; volumeKg: number; avgRpe: number | null };

export function summarise(sets: readonly WorkoutSet[]): SessionSummary {
  const reps = sets.reduce((t, s) => t + (s.reps ?? 0), 0);
  const volumeKg = Math.round(sets.reduce((t, s) => t + (s.reps ?? 0) * (s.weightKg ?? 0), 0));
  const rpes = sets.map((s) => s.rpe).filter((x): x is number => x != null);
  const avgRpe = rpes.length ? Math.round((rpes.reduce((t, x) => t + x, 0) / rpes.length) * 10) / 10 : null;
  return { sets: sets.length, reps, volumeKg, avgRpe };
}

/** Plain words for how hard it felt. */
export function effortWords(rpe: number | null): string {
  if (rpe == null) return '';
  if (rpe <= 4) return 'Easy';
  if (rpe <= 6) return 'Moderate';
  if (rpe <= 8) return 'Hard';
  return 'Very hard';
}

const ACCESS_RANK = ['none', 'home_equipment', 'basic_gym', 'full_gym'];
const rank = (e: Pick<Exercise, 'gymAccess'>): number => {
  const r = e.gymAccess.map((a) => ACCESS_RANK.indexOf(a)).filter((i) => i >= 0);
  return r.length ? Math.min(...r) : 0;
};

/** Up to `n` moves that can stand in: same section and type, a shared muscle region, and no more equipment than the original. */
export function swapOptions(e: Exercise, all: readonly Exercise[], n = 4): Exercise[] {
  const regions = e.searchTags?.bodyRegion ?? [];
  const muscles = new Set(e.musclesPrimary.map((m) => m.toLowerCase()));
  return all
    .filter((x) => x.id !== e.id && x.section === e.section && x.type === e.type && rank(x) <= Math.max(rank(e), 0))
    .map((x) => {
      const shared = (x.searchTags?.bodyRegion ?? []).filter((r) => regions.includes(r)).length;
      const same = x.musclesPrimary.filter((m) => muscles.has(m.toLowerCase())).length;
      return { x, score: shared * 2 + same };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || (a.x.number ?? 999) - (b.x.number ?? 999))
    .slice(0, n)
    .map((s) => s.x);
}
