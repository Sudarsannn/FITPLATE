import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, ZoomIn } from 'react-native-reanimated';

import { colors } from '../theme';

export type IconName = keyof typeof Ionicons.glyphMap;

/** '#RRGGBB' plus an opacity from 0 to 1 as an rgba() string. */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * The app's replacement for decorative emoji: a line icon on a softly lit,
 * tinted tile. One look everywhere, so screens read as one product.
 */
export function IconBadge({
  name,
  color = colors.accent,
  size = 40,
  radius,
  style,
}: {
  name: IconName;
  color?: string;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const r = radius ?? Math.round(size * 0.32);
  return (
    <View style={[{ width: size, height: size, borderRadius: r, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: alpha(color, 0.28) }, style]}>
      <LinearGradient colors={[alpha(color, 0.30), alpha(color, 0.08)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Ionicons name={name} size={Math.round(size * 0.5)} color={color} />
    </View>
  );
}

/** Where a meal slot sits in the day, as an icon. */
export const SLOT_GLYPH: Record<'breakfast' | 'lunch' | 'snack' | 'dinner', IconName> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  snack: 'cafe-outline',
  dinner: 'moon-outline',
};

/** Completion mark: a check that springs in, with soft rings that drift outward. */
export function Celebrate({ size = 96, color = colors.accent }: { size?: number; color?: string }) {
  const ring = (delay: number) => <Ring key={delay} delay={delay} size={size} color={color} />;
  return (
    <View style={{ width: size * 1.8, height: size * 1.8, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
      {ring(0)}
      {ring(900)}
      <Animated.View entering={ZoomIn.springify().damping(9)} style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <LinearGradient colors={[colors.accent2, color]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <Ionicons name="checkmark" size={size * 0.56} color="#06210F" />
      </Animated.View>
    </View>
  );
}

function Ring({ delay, size, color }: { delay: number; size: number; color: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) }), -1, false));
  }, [delay, p]);
  const anim = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - p.value), transform: [{ scale: 1 + p.value * 0.8 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color }, anim]} />;
}
