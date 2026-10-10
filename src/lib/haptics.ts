import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const on = Platform.OS !== 'web';

export const tap = () => on && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
export const thud = () => on && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
export const success = () => on && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
export const select = () => on && Haptics.selectionAsync().catch(() => {});
