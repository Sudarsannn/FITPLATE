import { useCallback, useMemo } from 'react';

import { useStore } from './store';
import { useTargets } from './useTargets';
import { PREBUILT_ROUTINES } from '../services/routines';
import { applyReminders, type ApplyResult } from './reminders';
import { DEFAULT_HOURS, type ReminderPrefs } from '../services/reminderPlan';

/** Day 33: the person's reminder choices (kept in the existing settings and profile), and one way to change them. */
export function useReminders() {
  const { settings, updateSettings, profile, updateProfile, routines } = useStore();
  const { health } = useTargets();
  const t = settings.featureToggles;
  const prefs: ReminderPrefs = useMemo(
    () => ({
      water: !!t.waterReminders,
      meals: !!t.mealReminders,
      workouts: !!t.workoutReminders,
      cookPrep: profile.breakfastReminder,
      streakNudges: !!t.streakNudges,
      workStart: settings.reminderHours?.start ?? DEFAULT_HOURS.workStart,
      workEnd: settings.reminderHours?.end ?? DEFAULT_HOURS.workEnd,
    }),
    [t, profile.breakfastReminder, settings.reminderHours],
  );
  const scheduled = useMemo(() => {
    const out: Record<number, string[]> = {};
    for (const r of PREBUILT_ROUTINES) for (const d of r.days) (out[d] ??= []).push(r.name);
    for (const r of routines) for (const d of r.days) (out[d] ??= []).push(r.name);
    return out;
  }, [routines]);

  /** Saves the change, then (re)schedules. Returns what the phone did. */
  const change = useCallback(
    async (patch: Partial<ReminderPrefs>): Promise<ApplyResult> => {
      const next = { ...prefs, ...patch };
      const toggles = { ...settings.featureToggles, waterReminders: next.water, mealReminders: next.meals, workoutReminders: next.workouts, streakNudges: next.streakNudges };
      updateSettings({ featureToggles: toggles, reminderHours: { start: next.workStart, end: next.workEnd } });
      if (next.cookPrep !== prefs.cookPrep) updateProfile({ breakfastReminder: next.cookPrep });
      return applyReminders(next, scheduled);
    },
    [prefs, scheduled, settings.featureToggles, updateSettings, updateProfile],
  );
  /** Turns every category off in one go. */
  const allOff = useCallback(() => change({ water: false, meals: false, workouts: false, cookPrep: false, streakNudges: false }), [change]);
  return { prefs, change, allOff, waterCaution: health.waterCaution };
}
