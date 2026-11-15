/**
 * Burn and balance (roadmap Day 27): the numbers that connect food and
 * movement on Today. Calories burned already use MET x weight x hours from the
 * researched MET values (fitness.exerciseKcal); this adds the net figure, walk
 * and run distances from the researched treadmill MET rows, and the weekly
 * activity summary. Everything is an estimate and stays opt-in and gentle:
 * no "you must burn this" language and no target at all for people whose
 * conditions need a doctor's advice.
 */
import type { MetOption } from '../models/exercise';
import { exerciseKcal } from './fitness';

/** WHO 2020 adult guideline: 150 to 300 minutes of moderate activity a week. The low end is the guide shown. */
export const WEEKLY_ACTIVE_MIN_GUIDE = 150;

export { exerciseKcal };

export type Net = { net: number; eaten: number; burnt: number; label: string; detail: string };

const n = (v: number) => Math.round(v).toLocaleString('en-IN');

/** Net energy of the day: eaten minus burnt (negative reads "below"). */
export function netEnergy(eaten: number, burnt: number): Net {
  const net = Math.round(eaten - burnt);
  return {
    net,
    eaten: Math.round(eaten),
    burnt: Math.round(burnt),
    label: `Net ${net < 0 ? '−' : ''}${n(Math.abs(net))} kcal`,
    detail: burnt > 0 ? `${n(eaten)} eaten, ${n(burnt)} burnt` : `${n(eaten)} eaten, nothing burnt yet`,
  };
}

/* ---------- walk and run distances ---------- */

export type DistanceWay = { label: string; kind: 'walk' | 'run'; speedKmh: number; met: number; minutes: number; km: number };

/** "(4.8–5.5 km/h)" or "(about 8.0–8.4 km/h; 12 min/mile)" to the middle of the range. */
export function speedFromActivity(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*km\/h/);
  if (m) return Math.round(((Number(m[1]) + Number(m[2])) / 2) * 10) / 10;
  const one = text.match(/(?:about\s+)?(\d+(?:\.\d+)?)\s*km\/h/);
  return one ? Number(one[1]) : null;
}

/**
 * How far to walk or run to use up `kcal`, from the treadmill rows of the
 * research (Compendium METs with their speed ranges). Gives the first two
 * walking rows and the first running row.
 */
export function distanceWays(kcal: number | null, weightKg: number | null, metOptions: readonly MetOption[]): DistanceWay[] {
  if (kcal == null || kcal <= 0) return [];
  const kg = weightKg && weightKg > 0 ? weightKg : 70;
  const rows = metOptions
    .map((o) => ({ o, speed: speedFromActivity(o.activity) }))
    .filter((r): r is { o: MetOption; speed: number } => r.speed != null && r.o.met > 0);
  const walks = rows.filter((r) => /^walking/i.test(r.o.activity)).slice(0, 2);
  const runs = rows.filter((r) => /^running/i.test(r.o.activity)).slice(0, 1);
  const build = (r: { o: MetOption; speed: number }, kind: 'walk' | 'run', label: string): DistanceWay => {
    const minutes = Math.round((kcal / (r.o.met * kg)) * 60);
    return { label, kind, speedKmh: r.speed, met: r.o.met, minutes, km: Math.round(((r.speed * minutes) / 60) * 10) / 10 };
  };
  return [
    ...walks.map((r, i) => build(r, 'walk', i === 0 ? 'Easy walk' : 'Brisk walk')),
    ...runs.map((r) => build(r, 'run', 'Run')),
  ];
}

/* ---------- weekly activity ---------- */

type DayLike = { meals: readonly { kcal: number }[]; exercise: readonly { minutes: number; kcal: number }[] };
export type ActivityDay = { key: string; kcalIn: number; kcalOut: number; minutes: number };
export type WeeklyActivity = {
  days: ActivityDay[];
  activeDays: number;
  loggedDays: number;
  minutes: number;
  kcalOut: number;
  /** Average of eaten minus burnt over days with a meal logged; null when none. */
  avgNet: number | null;
  /** 0 to 1 of the 150 minute guide. */
  guidePct: number;
};

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The seven days ending today (oldest first), from the day logs. */
export function weeklyActivity(days: Record<string, DayLike>, now: Date = new Date()): WeeklyActivity {
  const rows: ActivityDay[] = Array.from({ length: 7 }, (_, i) => {
    const k = key(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i)));
    const d = days[k];
    return {
      key: k,
      kcalIn: d ? d.meals.reduce((s, m) => s + m.kcal, 0) : 0,
      kcalOut: d ? d.exercise.reduce((s, e) => s + e.kcal, 0) : 0,
      minutes: d ? d.exercise.reduce((s, e) => s + e.minutes, 0) : 0,
    };
  });
  const minutes = rows.reduce((s, r) => s + r.minutes, 0);
  const logged = rows.filter((r) => r.kcalIn > 0);
  return {
    days: rows,
    activeDays: rows.filter((r) => r.minutes > 0).length,
    loggedDays: logged.length,
    minutes,
    kcalOut: rows.reduce((s, r) => s + r.kcalOut, 0),
    avgNet: logged.length ? Math.round(logged.reduce((s, r) => s + r.kcalIn - r.kcalOut, 0) / logged.length) : null,
    guidePct: Math.min(1, minutes / WEEKLY_ACTIVE_MIN_GUIDE),
  };
}

/** One honest line for the card. No guilt, any amount counts. */
export function activityLine(w: WeeklyActivity, showGuide: boolean): string {
  if (w.minutes === 0) return 'No movement logged this week yet. Even a 10 minute walk counts.';
  const base = `${w.minutes} min on ${w.activeDays} day${w.activeDays === 1 ? '' : 's'}`;
  return showGuide ? `${base}. A common guide is ${WEEKLY_ACTIVE_MIN_GUIDE} minutes a week; any amount helps.` : `${base}.`;
}
