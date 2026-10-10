import { addDays, dayKey, type DayLog } from '../lib/store';

export type WeekActivity = { sessions: number; minutes: number; kcal: number; activeDays: number };

/** Workouts logged in the last 7 days, today included. Used by the Move tab. */
export function lastSevenDaysActivity(days: Record<string, DayLog | undefined>, now: Date = new Date()): WeekActivity {
  const out: WeekActivity = { sessions: 0, minutes: 0, kcal: 0, activeDays: 0 };
  for (let i = 0; i < 7; i++) {
    const log = days[dayKey(addDays(now, -i))];
    if (!log || log.exercise.length === 0) continue;
    out.activeDays += 1;
    for (const e of log.exercise) {
      out.sessions += 1;
      out.minutes += e.minutes;
      out.kcal += e.kcal;
    }
  }
  return out;
}
