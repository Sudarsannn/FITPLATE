import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Timer-finished alarm: three buzzes on a phone, three beeps in the browser. Fails quietly. */
export function ringAlarm(): void {
  if (Platform.OS !== 'web') {
    for (let n = 0; n < 3; n++) setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}), n * 700);
    return;
  }
  try {
    const Ctx = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    for (let n = 0; n < 3; n++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.value = 0.15;
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + n * 0.6);
      o.stop(ctx.currentTime + n * 0.6 + 0.3);
    }
  } catch {
    // Autoplay can be blocked; the ring and text still show the timer finished.
  }
}
