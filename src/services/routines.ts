/**
 * Day 23: routines. Prebuilt ones are lists of researched exercises (ids are
 * checked in the tests); your own are saved documents. Duration and calories
 * come from the same plan the workout player runs (workoutPlan.ts), so the
 * "about N min" line matches what you will do.
 */
import { researchExercises } from '../data/research';
import type { Exercise } from '../models/exercise';
import type { Routine, RoutineItem } from '../models/routine';
import { exerciseKcal } from './fitness';
import { moveFit, type Concern, type MoveFit } from './moveSafety';
import { planMinutes, workoutPhases } from './workoutPlan';

/** Walking to the next move and getting set. */
export const TRANSITION_SEC = 20;
const REP_SET_SEC = 45;

export type PrebuiltRoutine = Routine & { id: string; blurb: string };

const mk = (id: string, name: string, blurb: string, ids: string[], days: number[] = []): PrebuiltRoutine => ({ id, name, blurb, items: ids.map((exerciseId) => ({ exerciseId })), days });

export const PREBUILT_ROUTINES: PrebuiltRoutine[] = [
  mk('home-15', '15-minute home, no equipment', 'Warm up, legs, push, core. A mat or a rug is enough.', ['jumping-jacks', 'bodyweight-squat', 'push-up', 'glute-bridge', 'plank-and-side-plank']),
  mk('desk-break', 'Desk-break stretch', 'Quiet, flat-friendly, in work clothes.', ['desk-neck-shoulder-release', 'wrist-forearm-stretch', 'thoracic-rotation-chest-opener', 'cat-cow', 'hip-flexor-stretch']),
  mk('morning-yoga', 'Morning yoga flow', 'Slow and gentle to wake the body up.', ['cat-cow', 'adho-mukha-svanasana', 'bhujangasana-cobra-pose', 'vrikshasana-tree-pose', 'hamstring-stretch', 'balasana-childs-pose']),
  mk('gym-a', 'Beginner gym, day 1: legs', 'Machines first. Start light and keep two reps in hand.', ['leg-press', 'leg-curl', 'leg-extension-machine', 'calf-raise', 'plank-and-side-plank'], [1]),
  mk('gym-b', 'Beginner gym, day 2: push', 'Chest, shoulders and arms on machines.', ['chest-press-machine', 'pec-deck', 'cable-crossover-fly', 'plank-and-side-plank'], [3]),
  mk('gym-c', 'Beginner gym, day 3: pull', 'Back and hips, then an easy finish.', ['lat-pulldown', 'seated-cable-row', 'hip-thrust', 'superman-back-raise', 'stationary-bike'], [5]),
];
// An easy 10-minute bike finish instead of the full researched block.
PREBUILT_ROUTINES[PREBUILT_ROUTINES.length - 1].items[4].minutes = 10;

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const byId = new Map<string, Exercise>(researchExercises.map((e) => [e.id, e]));
export const exerciseById = (id: string): Exercise | undefined => byId.get(id);

/** Items whose exercise is still in the research library (an update may rename one). */
export const liveItems = (r: Pick<Routine, 'items'>): RoutineItem[] => r.items.filter((i) => byId.has(i.exerciseId));

/** Seconds of the plan for one item: its sets, holds and rests as the player runs them. */
export function itemSeconds(item: RoutineItem): number {
  const e = byId.get(item.exerciseId);
  if (!e) return 0;
  return workoutPhases(e, item.minutes).reduce((t, p) => t + (p.seconds ?? REP_SET_SEC), 0);
}

/** Whole minutes for the routine, with a short transition between moves (at least 1 when there is anything to do). */
export function routineMinutes(r: Pick<Routine, 'items'>): number {
  const items = liveItems(r);
  if (!items.length) return 0;
  const sec = items.reduce((t, i) => t + itemSeconds(i), 0) + TRANSITION_SEC * (items.length - 1);
  return Math.max(1, Math.round(sec / 60));
}

/** Estimated kcal: each move's Compendium MET over its working time (rests count as zero), at your weight (70 kg when unknown). */
export function routineKcal(r: Pick<Routine, 'items'>, weightKg: number | null): number {
  let total = 0;
  for (const item of liveItems(r)) {
    const e = byId.get(item.exerciseId)!;
    if (e.met == null) continue;
    const workSec = workoutPhases(e, item.minutes).reduce((t, p) => (p.kind === 'work' ? t + (p.seconds ?? REP_SET_SEC) : t), 0);
    total += exerciseKcal(e.met, workSec / 60, weightKg);
  }
  return Math.round(total);
}

/** One line for the move list: the beginner dose, or the minutes the item is set to. */
export const itemMinutesLabel = (item: RoutineItem): string => {
  const e = byId.get(item.exerciseId);
  return e ? `about ${planMinutes(workoutPhases(e, item.minutes))} min` : '';
};

/** Routines scheduled for a weekday (0 = Sunday), prebuilt and own. */
export function scheduledOn(day: number, own: { id: string; routine: Routine }[]): { id: string; name: string; own: boolean }[] {
  const mine = own.filter((o) => o.routine.days.includes(day)).map((o) => ({ id: o.id, name: o.routine.name, own: true }));
  const pre = PREBUILT_ROUTINES.filter((p) => p.days.includes(day)).map((p) => ({ id: p.id, name: p.name, own: false }));
  return [...mine, ...pre];
}

export const moveItem = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

export const toggleDay = (days: number[], d: number): number[] => (days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort((a, b) => a - b));

/** A prebuilt routine by id, or one of the user's own. */
export function resolveRoutine(id: string, own: { id: string; routine: Routine }[]): { routine: Routine; own: boolean; blurb: string | null } | null {
  const pre = PREBUILT_ROUTINES.find((p) => p.id === id);
  if (pre) return { routine: pre, own: false, blurb: pre.blurb };
  const mine = own.find((o) => o.id === id);
  return mine ? { routine: mine.routine, own: true, blurb: null } : null;
}

/** The query for starting move `at` of a routine in the workout player. */
export function startParams(routineId: string, items: RoutineItem[], at: number): { id: string; routine: string; at: string; minutes?: string } {
  const item = items[at];
  return { id: item.exerciseId, routine: routineId, at: String(at), ...(item.minutes ? { minutes: String(item.minutes) } : {}) };
}

/** Each live item's fit for the user's concerns (research rules), and how many need attention. */
export function routineFits(r: Pick<Routine, 'items'>, concerns: Concern[]): { item: RoutineItem; fit: MoveFit }[] {
  return liveItems(r).map((item) => ({ item, fit: moveFit(byId.get(item.exerciseId)!, concerns) }));
}
