/**
 * Cooking several dishes at once. Each researched step is read as one of four
 * kinds, and a greedy scheduler lays every dish's steps on one timeline for
 * one pair of hands and N burners (gas or induction):
 *   hands          chopping, measuring, mixing: needs you, no burner
 *   burner-hands   sautéing, frying, stirring: you and a burner
 *   burner-passive pressure cooking, simmering, boiling: a burner for the whole
 *                  step, you only for its first minute
 *   wait           heat off, resting, soaking: nobody needed
 * The kind comes from the step's own words, so it is a guide, not a promise;
 * the screen says so. Pure, so Jest can test it.
 */
import type { Dish, DishStep } from '../models/research';

export type StepKind = 'hands' | 'burner-hands' | 'burner-passive' | 'wait';

/** A step that is itself a wait: it starts with "let", "rest", "soak" … or turns the heat off and waits. */
const WAIT = /^(let |rest\b|soak|marinat|set aside|leave |allow |cool|chill|wait|ferment|proof|stand\b)|^turn off the (heat|flame|gas)\b[^.]*\b(let|wait|rest|leave)\b/i;
const PASSIVE = /\b(whistles?|pressure cook|simmer|boil|steam|bring to a|cook (on|until|for|covered)|bubbl)/i;
const HEAT = /\b(heat|saut[eé]|fry|roast|toast|temper|sizzle|crackle|cook|sear|grill)|add .* (oil|ghee|butter)/i;

export function stepKind(step: Pick<DishStep, 'text' | 'title' | 'timerSec'>): StepKind {
  const t = `${step.title ?? ''} ${step.text}`.trim();
  if (WAIT.test(step.text.trim())) return 'wait';
  if (/^turn off the (heat|flame|gas)/i.test(step.text.trim())) return 'hands';
  if (PASSIVE.test(t) && (step.timerSec ?? 0) >= 240) return 'burner-passive';
  if (HEAT.test(t)) return 'burner-hands';
  return 'hands';
}

export type Plan = {
  dishId: string;
  dishName: string;
  stepIndex: number;
  title: string;
  text: string;
  kind: StepKind;
  startSec: number;
  endSec: number;
  /** 1-based burner, null when none is used. */
  burner: number | null;
  timerSec: number | null;
};

const DEFAULT_SEC: Record<StepKind, number> = { hands: 120, 'burner-hands': 120, 'burner-passive': 300, wait: 120 };
const stepSec = (s: DishStep, kind: StepKind) => Math.max(5, s.timerSec ?? DEFAULT_SEC[kind]);
const HANDS_FIRST_SEC = 60;

export type DishInput = Pick<Dish, 'id' | 'name' | 'steps'>;

/** All the dishes' steps on one timeline. Steps of one dish stay in order. */
export function schedule(dishes: DishInput[], burners: number): { plan: Plan[]; totalSec: number; oneByOneSec: number } {
  const nBurners = Math.max(1, Math.min(6, Math.round(burners)));
  const items = dishes.map((d) => d.steps.map((s) => ({ s, kind: stepKind(s), sec: stepSec(s, stepKind(s)) })));
  const cursor = dishes.map(() => 0);
  const readyAt = dishes.map(() => 0);
  const lastBurner: (number | null)[] = dishes.map(() => null);
  const burnerFree = Array.from({ length: nBurners }, () => 0);
  let handsFree = 0;
  const plan: Plan[] = [];

  const remaining = (di: number) => items[di].slice(cursor[di]).reduce((t, x) => t + x.sec, 0);

  for (;;) {
    let best: { di: number; start: number; burner: number | null } | null = null;
    for (let di = 0; di < dishes.length; di++) {
      const it = items[di][cursor[di]];
      if (!it) continue;
      const needsBurner = it.kind === 'burner-hands' || it.kind === 'burner-passive';
      const needsHands = it.kind !== 'wait';
      let start = readyAt[di];
      if (needsHands) start = Math.max(start, handsFree);
      let burner: number | null = null;
      if (needsBurner) {
        // Prefer the burner this dish already uses, else the one free soonest.
        const own = lastBurner[di];
        const free = burnerFree.map((t, i) => ({ t, i })).sort((a, b) => a.t - b.t || a.i - b.i);
        const pick = own != null && burnerFree[own] <= Math.max(start, free[0].t) ? own : free[0].i;
        burner = pick;
        start = Math.max(start, burnerFree[pick]);
      }
      if (!best || start < best.start || (start === best.start && remaining(di) > remaining(best.di))) best = { di, start, burner };
    }
    if (!best) break;
    const { di, start, burner } = best;
    const it = items[di][cursor[di]];
    const end = start + it.sec;
    if (it.kind !== 'wait') handsFree = it.kind === 'burner-passive' ? start + Math.min(HANDS_FIRST_SEC, it.sec) : end;
    if (burner != null) {
      burnerFree[burner] = end;
      lastBurner[di] = burner;
    }
    readyAt[di] = end;
    plan.push({ dishId: dishes[di].id, dishName: dishes[di].name, stepIndex: cursor[di], title: it.s.title ?? '', text: it.s.text, kind: it.kind, startSec: start, endSec: end, burner: burner == null ? null : burner + 1, timerSec: it.s.timerSec });
    cursor[di]++;
  }
  const totalSec = plan.reduce((t, p) => Math.max(t, p.endSec), 0);
  const oneByOneSec = items.reduce((t, list) => t + list.reduce((a, x) => a + x.sec, 0), 0);
  return { plan: plan.sort((a, b) => a.startSec - b.startSec || a.dishName.localeCompare(b.dishName)), totalSec, oneByOneSec };
}

/** "12 min", "1 h 05 min". */
export function span(sec: number): string {
  const m = Math.max(1, Math.round(sec / 60));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

/** What else is running on the stove while this step happens. */
export function alongside(plan: Plan[], at: Plan): Plan[] {
  return plan.filter((p) => p !== at && p.burner != null && p.startSec < at.endSec && p.endSec > at.startSec && p.endSec > at.startSec);
}
