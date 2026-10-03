import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import { tap } from '../lib/haptics';
import { colors, gradients, radius, type } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Springy press feedback used by every tappable surface. */
export function PressableScale({
  children,
  onPress,
  style,
  disabled,
  haptic = true,
  scaleTo = 0.96,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  haptic?: boolean;
  scaleTo?: number;
}) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => s.set(withSpring(scaleTo, { damping: 18, stiffness: 400 }))}
      onPressOut={() => s.set(withSpring(1, { damping: 14, stiffness: 300 }))}
      onPress={() => {
        if (haptic) tap();
        onPress?.();
      }}
      style={[anim, style, disabled && { opacity: 0.5 }]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'warm' | 'glass';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <View style={styles.btnInner}>
      {icon}
      <Text style={[styles.btnText, { color: variant === 'glass' ? colors.text : '#06210F' }]}>{title}</Text>
    </View>
  );
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={[styles.btn, style]}>
      {variant === 'glass' ? (
        <View style={[styles.btnFill, styles.glassBtn]}>{content}</View>
      ) : (
        <LinearGradient
          colors={variant === 'warm' ? gradients.warm : gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnFill}
        >
          {content}
        </LinearGradient>
      )}
    </PressableScale>
  );
}

/** Frosted card. Real blur on iOS/web, tinted glass on Android. */
export function Glass({ children, style, intensity = 30 }: { children: ReactNode; style?: StyleProp<ViewStyle>; intensity?: number }) {
  return (
    <View style={[styles.glass, style]}>
      {Platform.OS !== 'android' ? (
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

/** Staggered entrance for lists and sections. */
export function FadeIn({ children, i = 0, style }: { children: ReactNode; i?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.delay(60 + i * 70).duration(520).springify().damping(18)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Animated progress ring. */
export function Ring({
  size = 120,
  stroke = 12,
  progress,
  colorsFrom = '#B4F461',
  colorsTo = '#16A34A',
  children,
}: {
  size?: number;
  stroke?: number;
  progress: number;
  colorsFrom?: string;
  colorsTo?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [progress, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colorsFrom} />
            <Stop offset="1" stopColor={colorsTo} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}

/** Animated bar used for progress and nutrients. */
export function Bar({ progress, color = colors.accent, height = 8 }: { progress: number; color?: string; height?: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, w]);
  const anim = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, anim]} />
    </View>
  );
}

/** Number that counts up when it changes. */
export function CountUp({ value, prefix = '', style, duration = 1000 }: { value: number; prefix?: string; style?: StyleProp<any>; duration?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = Date.now();
    const a = from.current;
    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(a + (value - a) * e));
      if (t < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <Text style={style}>
      {prefix}
      {shown.toLocaleString('en-IN')}
    </Text>
  );
}

/** Gradient tile with the dish emoji, used wherever a photo would go. */
export function DishArt({
  emoji,
  palette,
  size = 72,
  rounded = radius.md,
  style,
}: {
  emoji: string;
  palette: readonly [string, string];
  size?: number | '100%';
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const n = typeof size === 'number' ? size : 220;
  return (
    <LinearGradient
      colors={[palette[0], palette[1]]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[{ width: size, height: size === '100%' ? undefined : size, borderRadius: rounded, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}
    >
      <View style={[styles.artGlow, { width: n * 0.9, height: n * 0.9, borderRadius: n }]} />
      <Text style={{ fontSize: n * 0.5 }}>{emoji}</Text>
    </LinearGradient>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <PressableScale onPress={onPress} style={[styles.chip, active && styles.chipOn]} scaleTo={0.92}>
      <Text style={[styles.chipText, active && { color: '#06210F' }]}>{label}</Text>
    </PressableScale>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={[type.h2, { color: colors.text }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Stat({ label, value, hint, color = colors.text }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>{label}</Text>
      {hint ? <Text style={[type.small, { color: colors.accent }]}>{hint}</Text> : null}
    </View>
  );
}

/** Muted, looping, cover-fit background video. */
export function VideoBackground({ source, dim = 0.35 }: { source: number; dim?: number }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />
    </View>
  );
}

/** Soft breathing glow, used behind heroes. */
export function Glow({ color = colors.accent, size = 260, style }: { color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(0.35);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.7, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  const core = size * 0.35;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: core,
          height: core,
          borderRadius: core,
          backgroundColor: color,
          boxShadow: `0px 0px ${Math.round(size * 0.5)}px ${Math.round(size * 0.3)}px ${color}`,
        },
        anim,
        style,
      ]}
    />
  );
}

export const styles = StyleSheet.create({
  btn: { borderRadius: radius.pill, overflow: 'hidden' },
  btnFill: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: radius.pill },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: colors.border },
  glass: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: 'rgba(20,26,23,0.55)' },
  card: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: colors.cardSolid },
  artGlow: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.22)', top: '-25%', left: '-20%' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 },
});
