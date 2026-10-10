import { Platform } from 'react-native';

// Night-before nudge for the tired-corporate user: prep tomorrow's breakfast at 9 pm,
// and a Sunday batch-cook nudge. Local notifications only, no server needed.
export async function setReminders(enabled: boolean) {
  if (Platform.OS === 'web') return false;
  const N = await import('expo-notifications');
  await N.cancelAllScheduledNotificationsAsync();
  if (!enabled) return false;
  const perm = await N.requestPermissionsAsync();
  if (!perm.granted) return false;
  await N.scheduleNotificationAsync({
    content: { title: 'Tomorrow-you says thanks 🥣', body: '5 minutes now = breakfast ready in the morning. Overnight oats or soak the dal?' },
    trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
  });
  await N.scheduleNotificationAsync({
    content: { title: 'Sunday batch-cook 🍲', body: 'One session today covers three weekday lunches. Rajma is on the menu.' },
    trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 11, minute: 0 },
  });
  return true;
}
