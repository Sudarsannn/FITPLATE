import { useEffect } from 'react';

import { refreshStreakNudge } from '../lib/reminders';
import { useStore } from '../lib/store';

/** Renders nothing. Keeps the single evening streak nudge in step with what has been cooked today (when the person turned it on). */
export function ReminderSync() {
  const { streak, today, settings } = useStore();
  const enabled = !!settings.featureToggles.streakNudges;
  const cookedToday = today.meals.some((m) => (m.how ? m.how === 'cooked' : m.cooked));
  useEffect(() => {
    refreshStreakNudge({ enabled, streak, cookedToday }).catch(() => {});
  }, [enabled, streak, cookedToday]);
  return null;
}
