import { Platform } from 'react-native';

import type { Leftover } from '../models/prefs';
import { reminderAt } from '../services/leftovers';
import { WORKDAYS, waterReminderTimes } from '../services/water';

// Night-before nudge for the tired-corporate user: prep tomorrow's breakfast at 9 pm,
// and a Sunday batch-cook nudge. Local notifications only, no server needed.
export async function setReminders(enabled: boolean) {
  if (Platform.OS === 'web') return false;
  const N = await import('expo-notifications');
  // Leave the leftover reminders alone; they are scheduled one by one below.
  for (const n of await N.getAllScheduledNotificationsAsync()) if (!n.identifier.startsWith('leftover-') && !n.identifier.startsWith('water-')) await N.cancelScheduledNotificationAsync(n.identifier);
  if (!enabled) return false;
  const perm = await N.requestPermissionsAsync();
  if (!perm.granted) return false;
  await N.scheduleNotificationAsync({
    content: { title: 'Tomorrow-you says thanks', body: '5 minutes now = breakfast ready in the morning. Overnight oats or soak the dal?' },
    trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
  });
  await N.scheduleNotificationAsync({
    content: { title: 'Sunday batch-cook', body: 'One session today covers three weekday lunches. Rajma is on the menu.' },
    trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 11, minute: 0 },
  });
  return true;
}

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

/** Day 17: workday water nudges outside quiet hours. Local notifications on the phone app only; turning it off cancels them. */
export async function setWaterReminders(enabled: boolean): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const N = await import('expo-notifications');
    for (const n of await N.getAllScheduledNotificationsAsync()) if (n.identifier.startsWith('water-')) await N.cancelScheduledNotificationAsync(n.identifier);
    if (!enabled) return false;
    const perm = await N.getPermissionsAsync();
    if (!perm.granted && !(await N.requestPermissionsAsync()).granted) return false;
    for (const day of WORKDAYS)
      for (const t of waterReminderTimes())
        await N.scheduleNotificationAsync({
          identifier: `water-${day}-${t.hour}-${t.minute}`,
          content: { title: 'Water break', body: 'A glass of water now keeps the afternoon slump away.' },
          trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: day, hour: t.hour, minute: t.minute },
        });
    return true;
  } catch {
    return false;
  }
}
