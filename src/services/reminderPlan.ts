import { inQuietHours } from './water';

/**
 * Day 33: the one plan behind every reminder. Pure, so Jest can check it without a phone.
 * Defaults suit a 9-to-7 workday. Nothing is ever planned inside quiet hours (9 pm to 8 am),
 * every category can be off, and nothing is scheduled until the person turns it on
 * (so the phone's permission question always follows a tap, never a surprise).
 * Weekday numbers are Expo's: 1 = Sunday ... 7 = Saturday.
 */
export type ReminderCategory = 'water' | 'meals' | 'workouts' | 'cookPrep';
export const CATEGORY_LABEL: Record<ReminderCategory, string> = { water: 'Water', meals: 'Meal logging', workouts: 'Workouts', cookPrep: 'Cook prep' };
export const WORKDAYS = [2, 3, 4, 5, 6];

export type ReminderPrefs = {
  water: boolean;
  meals: boolean;
  workouts: boolean;
  cookPrep: boolean;
  streakNudges: boolean;
  workStart: number;
  workEnd: number;
};

export const DEFAULT_HOURS = { workStart: 9, workEnd: 19 };
export const DEFAULT_PREFS: ReminderPrefs = { water: false, meals: false, workouts: false, cookPrep: false, streakNudges: false, ...DEFAULT_HOURS };

export type Planned = { id: string; category: ReminderCategory; title: string; body: string; weekday: number | null; hour: number; minute: number };

const clampHours = (start: number, end: number) => {
  const s = Math.min(Math.max(Math.round(start), 5), 12);
  const e = Math.min(Math.max(Math.round(end), s + 6), 21);
  return { s, e };
};

const toMin = (h: number, m = 0) => h * 60 + m;
const at = (min: number) => ({ hour: Math.floor(min / 60), minute: min % 60 });

/** Water breaks through the workday: the first an hour and a half after it starts, then every two and a half hours, the last at least an hour before it ends. */
export function waterTimes(workStart = DEFAULT_HOURS.workStart, workEnd = DEFAULT_HOURS.workEnd): { hour: number; minute: number }[] {
  const { s, e } = clampHours(workStart, workEnd);
  const out: { hour: number; minute: number }[] = [];
  for (let m = toMin(s) + 90; m <= toMin(e) - 60; m += 150) {
    const t = at(m);
    if (!inQuietHours(t.hour)) out.push(t);
  }
  return out;
}

export const lunchTime = (workStart = DEFAULT_HOURS.workStart) => at(toMin(clampHours(workStart, 19).s) + 255);
/** Night-before cook prep, early enough to stay clear of quiet hours. */
export const PREP_TIME = { hour: 20, minute: 30 };
export const DINNER_LOG_TIME = { hour: 20, minute: 0 };
export const STREAK_NUDGE_TIME = { hour: 20, minute: 30 };

/** `scheduled`: for each weekday 0 (Sunday) to 6, the names of the routines on the person's plan. */
export function planReminders(p: ReminderPrefs, scheduled: Record<number, string[]> = {}): Planned[] {
  const out: Planned[] = [];
  const { s, e } = clampHours(p.workStart, p.workEnd);
  if (p.water)
    for (const day of WORKDAYS)
      for (const t of waterTimes(s, e)) out.push({ id: `rem-water-${day}-${t.hour}-${t.minute}`, category: 'water', title: 'Water break', body: 'A glass of water now keeps the afternoon slump away.', weekday: day, ...t });
  if (p.meals) {
    const l = lunchTime(s);
    for (const day of WORKDAYS) {
      out.push({ id: `rem-meals-lunch-${day}`, category: 'meals', title: 'Lunch time', body: 'Logging it takes ten seconds. Skip it if you are busy.', weekday: day, ...l });
      out.push({ id: `rem-meals-dinner-${day}`, category: 'meals', title: 'Dinner check-in', body: 'What did you eat today? A quick log keeps your week honest.', weekday: day, ...DINNER_LOG_TIME });
    }
  }
  if (p.workouts)
    for (let d = 0; d < 7; d++) {
      const names = scheduled[d] ?? [];
      if (!names.length) continue;
      const t = at(toMin(e) - 30);
      out.push({ id: `rem-workouts-${d + 1}`, category: 'workouts', title: 'Today on your plan', body: `${names[0]}${names.length > 1 ? ` and ${names.length - 1} more` : ''}. Any amount counts.`, weekday: d + 1, ...t });
    }
  if (p.cookPrep) {
    out.push({ id: 'rem-prep-night', category: 'cookPrep', title: 'Tomorrow-you says thanks', body: '5 minutes now = breakfast ready in the morning. Overnight oats or soak the dal?', weekday: null, ...PREP_TIME });
    out.push({ id: 'rem-prep-sunday', category: 'cookPrep', title: 'Sunday batch-cook', body: 'One session today covers three weekday lunches.', weekday: 1, hour: 11, minute: 0 });
  }
  return out;
}

export const inQuiet = (x: { hour: number }) => inQuietHours(x.hour);

/**
 * One gentle evening nudge, only when it can help: a streak of 2 or more days at risk, nothing cooked today yet,
 * the person turned nudges on, and the time has not passed. Never more than one a day.
 */
export function shouldStreakNudge(i: { enabled: boolean; streak: number; cookedToday: boolean; now: Date }): boolean {
  if (!i.enabled || i.streak < 2 || i.cookedToday) return false;
  return toMin(i.now.getHours(), i.now.getMinutes()) < toMin(STREAK_NUDGE_TIME.hour, STREAK_NUDGE_TIME.minute);
}

export function streakNudgeDate(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), STREAK_NUDGE_TIME.hour, STREAK_NUDGE_TIME.minute);
}

const hh = (n: { hour: number; minute: number }) => `${n.hour > 12 ? n.hour - 12 : n.hour}:${String(n.minute).padStart(2, '0')} ${n.hour >= 12 ? 'pm' : 'am'}`;

/** One line per category for the settings screen. */
export function describe(c: ReminderCategory, p: ReminderPrefs): string {
  if (c === 'water') return `Weekdays at ${waterTimes(p.workStart, p.workEnd).map(hh).join(', ')}.`;
  if (c === 'meals') return `Weekdays: lunch at ${hh(lunchTime(p.workStart))} and a dinner check-in at ${hh(DINNER_LOG_TIME)}.`;
  if (c === 'workouts') return 'On days you have a routine planned, 30 minutes before your workday window ends. Nothing on other days.';
  return `Night-before prep at ${hh(PREP_TIME)}, and a Sunday batch-cook nudge at 11:00 am.`;
}
