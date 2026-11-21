import { Platform } from 'react-native';

import type { Leftover } from '../models/prefs';
import { reminderAt } from '../services/leftovers';
import { planReminders, shouldStreakNudge, streakNudgeDate, type ReminderPrefs } from '../services/reminderPlan';

const reminderId = (dishId: string) => `leftover-${dishId}`;

/** A phone notification at 9:00 on the leftover's use-by day (iPhone and Android app only; asks permission the first time). Fails quietly. */
export async function scheduleLeftoverReminder(l: Leftover, now = Date.now()): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const at = reminderAt(l, now);
    if (!at) return false;
    const N = await import('expo-notifications');
    const perm = await N.getPermissionsAsync();
    if (!perm.granted && !(await N.requestPermissionsAsync()).granted) return false;
    await N.scheduleNotificationAsync({
      identifier: reminderId(l.dishId),
      content: { title: 'Leftovers to use today', body: `${l.name}: today is the last safe day. Eat it, or throw it out tomorrow.` },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: at },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelLeftoverReminder(dishId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const N = await import('expo-notifications');
    await N.cancelScheduledNotificationAsync(reminderId(dishId));
  } catch {
    // nothing scheduled
  }
}

export type ApplyResult = 'scheduled' | 'off' | 'unsupported' | 'denied';

/**
 * Day 33: schedules everything in the plan and cancels what is no longer wanted (leftover reminders are left alone).
 * Local notifications on the phone app only. With every category off it just cancels, and needs no permission.
 */
export async function applyReminders(prefs: ReminderPrefs, scheduled: Record<number, string[]>): Promise<ApplyResult> {
  if (Platform.OS === 'web') return 'unsupported';
  try {
    const N = await import('expo-notifications');
    for (const n of await N.getAllScheduledNotificationsAsync()) {
      if (n.identifier.startsWith('leftover-')) continue;
      if (n.identifier === STREAK_ID && prefs.streakNudges) continue;
      await N.cancelScheduledNotificationAsync(n.identifier);
    }
    const plan = planReminders(prefs, scheduled);
    if (!plan.length && !prefs.streakNudges) return 'off';
    const perm = await N.getPermissionsAsync();
    if (!perm.granted && !(await N.requestPermissionsAsync()).granted) return 'denied';
    for (const r of plan)
      await N.scheduleNotificationAsync({
        identifier: r.id,
        content: { title: r.title, body: r.body },
        trigger:
          r.weekday == null
            ? { type: N.SchedulableTriggerInputTypes.DAILY, hour: r.hour, minute: r.minute }
            : { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: r.weekday, hour: r.hour, minute: r.minute },
      });
    return plan.length || prefs.streakNudges ? 'scheduled' : 'off';
  } catch {
    return 'unsupported';
  }
}

const STREAK_ID = 'rem-streak';

/** Keeps today's single streak nudge in step with what has been cooked. Called when Today opens and when meals change. Fails quietly. */
export async function refreshStreakNudge(i: { enabled: boolean; streak: number; cookedToday: boolean; now?: Date }): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const now = i.now ?? new Date();
    const N = await import('expo-notifications');
    await N.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
    if (!shouldStreakNudge({ ...i, now })) return;
    const perm = await N.getPermissionsAsync();
    if (!perm.granted) return;
    await N.scheduleNotificationAsync({
      identifier: STREAK_ID,
      content: { title: `Your ${i.streak} day streak`, body: 'One home-cooked meal today keeps it going. Even something quick counts.' },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: streakNudgeDate(now) },
    });
  } catch {
    // nothing to do
  }
}
