import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors, type } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const MACRO_COLORS = { protein: colors.violet, carbs: colors.warn, fat: colors.warm } as const;

type MacroGrams = { proteinG: number | null; carbsG: number | null; fatG: number | null };

/** Share of a serving's energy from protein, carbs and fat (4, 4 and 9 kcal a gram). Null unless all three are known. */
export function macroShares(m: MacroGrams): { protein: number; carbs: number; fat: number } | null {
  if (m.proteinG == null || m.carbsG == null || m.fatG == null) return null;
  const p = m.proteinG * 4;
  const c = m.carbsG * 4;
  const f = m.fatG * 9;
  const total = p + c + f;
  return total > 0 ? { protein: p / total, carbs: c / total, fat: f / total } : null;
}

/** A thin stacked bar of the energy split. Draws nothing when a macro is missing. */
export function MacroSplitBar({ macros, height = 6 }: { macros: MacroGrams; height?: number }) {
  const s = macroShares(macros);
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [w]);
  const anim = useAnimatedStyle(() => ({ opacity: w.value, transform: [{ scaleX: 0.4 + w.value * 0.6 }] }));
  if (!s) return null;
  return (
    <Animated.View style={[{ flexDirection: 'row', height, borderRadius: height, overflow: 'hidden', gap: 2 }, anim]} accessibilityLabel={`Energy from protein ${Math.round(s.protein * 100)} percent, carbs ${Math.round(s.carbs * 100)} percent, fat ${Math.round(s.fat * 100)} percent`}>
      <View style={{ flex: s.protein, backgroundColor: MACRO_COLORS.protein }} />
      <View style={{ flex: s.carbs, backgroundColor: MACRO_COLORS.carbs }} />
      <View style={{ flex: s.fat, backgroundColor: MACRO_COLORS.fat }} />
    </Animated.View>
  );
}

function Segment({ r, c, start, len, stroke, size, color, p }: { r: number; c: number; start: number; len: number; stroke: number; size: number; color: string; p: { value: number } }) {
  const props = useAnimatedProps(() => ({ strokeDasharray: `${Math.max(0, len * p.value - 2)} ${c}`, strokeDashoffset: -start * p.value }));
  return <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none" animatedProps={props} />;
}

/** Donut of where a serving's energy comes from, with grams beside it. */
export function MacroDonut({ macros, kcal, size = 120 }: { macros: MacroGrams; kcal: number | null; size?: number }) {
  const s = macroShares(macros);
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [p]);
  if (!s) return null;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const parts = [
    { key: 'protein', label: 'Protein', g: macros.proteinG!, share: s.protein, color: MACRO_COLORS.protein },
    { key: 'carbs', label: 'Carbs', g: macros.carbsG!, share: s.carbs, color: MACRO_COLORS.carbs },
    { key: 'fat', label: 'Fat', g: macros.fatG!, share: s.fat, color: MACRO_COLORS.fat },
  ];
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((t, x) => t + x.share * c, 0));
  return (
    <View style={styles.donutRow}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
          {parts.map((x, i) => (
            <Segment key={x.key} r={r} c={c} start={starts[i]} len={x.share * c} stroke={stroke} size={size} color={x.color} p={p} />
          ))}
        </Svg>
        <Text style={styles.donutNum}>{kcal != null ? Math.round(kcal) : '–'}</Text>
        <Text style={[type.small, { color: colors.muted }]}>kcal</Text>
      </View>
      <View style={{ flex: 1, gap: 10 }}>
        {parts.map((x) => (
          <View key={x.key} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: x.color }]} />
            <Text style={styles.legendLabel}>{x.label}</Text>
            <Text style={styles.legendG}>{Math.round(x.g)} g</Text>
            <Text style={styles.legendPct}>{Math.round(x.share * 100)}%</Text>
          </View>
        ))}
        <Text style={[type.small, { color: colors.faint }]}>Share of the serving&apos;s energy</Text>
      </View>
    </View>
  );
}

function Column({ i, ratio, hot, color }: { i: number; ratio: number; hot: boolean; color: string }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(i * 70, withTiming(Math.max(0.04, Math.min(1, ratio)), { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [i, ratio, h]);
  const anim = useAnimatedStyle(() => ({ height: `${h.value * 100}%` }));
  return (
    <View style={styles.colTrack}>
      <Animated.View style={[styles.colFill, anim, !hot && { opacity: 0.5 }]}>
        <LinearGradient colors={hot ? [colors.accent2, color] : [color, color]} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

/** Seven small columns against a goal line. `values` and `labels` are oldest first; the last one is today. */
export function WeekBars({ values, labels, goal, color = colors.accent, height = 84 }: { values: number[]; labels: string[]; goal?: number; color?: string; height?: number }) {
  const max = Math.max(goal ?? 0, ...values, 1) * 1.1;
  return (
    <View>
      <View style={{ height, flexDirection: 'row', gap: 8 }}>
        {values.map((v, i) => (
          <Column key={i} i={i} ratio={v / max} hot={i === values.length - 1} color={color} />
        ))}
        {goal ? <View pointerEvents="none" style={[styles.goalLine, { bottom: `${(goal / max) * 100}%` }]} /> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        {labels.map((l, i) => (
          <Text key={i} style={[styles.dayLabel, i === labels.length - 1 && { color: colors.text }]}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  donutNum: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: colors.text, fontWeight: '700', flex: 1 },
  legendG: { color: colors.text, fontWeight: '800' },
  legendPct: { color: colors.muted, width: 40, textAlign: 'right', fontVariant: ['tabular-nums'] },
  colTrack: { flex: 1, justifyContent: 'flex-end', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  colFill: { width: '100%', borderRadius: 8, overflow: 'hidden' },
  goalLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.3)' },
  dayLabel: { flex: 1, textAlign: 'center', color: colors.muted, fontSize: 11, fontWeight: '700' },
});
