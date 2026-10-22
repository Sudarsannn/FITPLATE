import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { getDish, researchLinks, researchNutrients } from '../data/research';
import { allowedDishes, type DayLog, type Profile } from '../lib/store';
import { band, dayMacros, dayMicros, type Band, type MicroBar } from '../services/dayNutrition';
import { colors, radius } from '../theme';
import { BAND_COLOR } from './NutritionCard';
import { Bar, PressableScale } from './ui';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Thin macro line: label, a 5 px bar against the target, and the amount. */
function MacroLine({ label, amount, target, unit, color }: { label: string; amount: number; target: number; unit: string; color: string }) {
  const f = target ? amount / target : 0;
  return (
    <View style={styles.line}>
      <View style={styles.lineHead}>
        <Text style={styles.lineLabel}>{label}</Text>
        <Text style={styles.lineVal}>
          {Math.round(amount)}
          <Text style={styles.lineOf}>
            /{target} {unit}
          </Text>
        </Text>
      </View>
      <Bar progress={f} color={f >= 0.9 ? colors.accent : color} height={5} />
    </View>
  );
}

/** One line split by where the calories came from (protein and carbs 4 kcal/g, fat 9). */
function EnergyMix({ protein, carbs, fat }: { protein: number; carbs: number | null; fat: number | null }) {
  const p = protein * 4;
  const c = (carbs ?? 0) * 4;
  const f = (fat ?? 0) * 9;
  const total = p + c + f;
  const parts = [
    { key: 'P', kcal: p, color: colors.violet },
    { key: 'C', kcal: c, color: colors.blue },
    { key: 'F', kcal: f, color: colors.warm },
  ];
  return (
    <View style={styles.line}>
      <View style={styles.lineHead}>
        <Text style={styles.lineLabel}>Energy</Text>
        <Text style={styles.lineOf} numberOfLines={1}>
          {total && carbs != null
            ? parts.map((x) => (
                <Text key={x.key}>
                  <Text style={{ color: x.color, fontWeight: '900' }}> {x.key}</Text>
                  {Math.round((x.kcal / total) * 100)}%
                </Text>
              ))
            : 'log a dish'}
        </Text>
      </View>
      <View style={styles.mix}>{total && carbs != null ? parts.map((x) => (x.kcal ? <View key={x.key} style={{ flex: x.kcal, backgroundColor: x.color }} /> : null)) : null}</View>
    </View>
  );
}

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${cx + r * Math.cos(rad(a0))} ${cy + r * Math.sin(rad(a0))} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(rad(a1))} ${cy + r * Math.sin(rad(a1))}`;
}

function Segment({ cx, r, a0, sweep, bar, i, stroke }: { cx: number; r: number; a0: number; sweep: number; bar: MicroBar; i: number; stroke: number }) {
  const f = Math.min(1, bar.fraction ?? 0);
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(120 + i * 45, withTiming(f, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [f, i, p]);
  // The fill grows along the segment: dash = sweep length × fraction.
  const len = (Math.PI * 2 * r * sweep) / 360;
  const props = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - p.value) }));
  return (
    <>
      <Path d={arc(cx, cx, r, a0, a0 + sweep)} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
      {f > 0 ? <AnimatedPath d={arc(cx, cx, r, a0, a0 + sweep)} stroke={BAND_COLOR[bar.band ?? band(f)]} strokeWidth={stroke} strokeDasharray={`${len} ${len}`} fill="none" animatedProps={props} /> : null}
    </>
  );
}

/** A ring cut into one segment per nutrient with a researched target; each segment fills and colours by how close today is. */
export function MicroWheel({ bars, size = 118, children }: { bars: MicroBar[]; size?: number; children?: React.ReactNode }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const n = Math.max(1, bars.length);
  const gap = n > 1 ? 4 : 0;
  const sweep = 360 / n - gap;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {bars.length ? (
          bars.map((b, i) => <Segment key={b.id} cx={size / 2} r={r} a0={i * (360 / n) + gap / 2} sweep={sweep} bar={b} i={i} stroke={stroke} />)
        ) : (
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        )}
      </Svg>
      {children}
    </View>
  );
}

const BAND_WORD: Record<Band, string> = { 'on-track': 'on track', 'getting-there': 'getting there', low: 'low' };

/** Today's macros at a glance: protein and fibre as thin lines, the calorie mix as one split line. */
export function MacroLines({ today, goal, fibreTarget }: { today: DayLog; goal: { protein: number }; fibreTarget: number }) {
  const m = dayMacros(today.meals, getDish);
  return (
    <View>
      <MacroLine label="Protein" amount={m.protein} target={goal.protein} unit="g" color={colors.violet} />
      <MacroLine label="Fibre" amount={m.fibre} target={fibreTarget} unit="g" color={colors.accent2} />
      <EnergyMix protein={m.protein} carbs={m.carbs} fat={m.fat} />
    </View>
  );
}

/**
 * The vitamin wheel (22 Oct 2026): one segment per vitamin with a researched
 * target, a count on track, and one gentle next step. The full bars live in
 * Track → Nutrition; tapping goes there.
 */
export function MicroSummary({ today, sex, profile }: { today: DayLog; sex: 'male' | 'female' | null; profile: Profile }) {
  const micros = dayMicros(today.meals, getDish, researchNutrients, sex === 'female' ? 'adult_female' : 'adult_male').filter((b) => b.fraction != null && b.kind !== 'other');
  const logged = today.meals.some((x) => x.dishId && getDish(x.dishId));
  const count = (k: Band) => micros.filter((b) => b.band === k).length;
  const onTrack = count('on-track');

  // The lowest-filled nutrient, and a dish (fitting the diet) that research lists as a good source of it.
  const lowest = logged ? [...micros].sort((a, b) => (a.fraction ?? 0) - (b.fraction ?? 0))[0] : undefined;
  const allowed = new Set(allowedDishes(profile).map((d) => d.id));
  const fix = lowest ? (researchLinks.goodSourceDishes[lowest.id] ?? []).find((d) => d.dishId && allowed.has(d.dishId)) : undefined;

  return (
    <View>
      <PressableScale onPress={() => router.push({ pathname: '/track', params: { view: 'nutrition' } })} scaleTo={0.98} style={styles.microRow} accessibilityLabel={`Vitamins: ${onTrack} of ${micros.length} on track. Open the full breakdown`}>
        <MicroWheel bars={micros}>
          <Text style={styles.wheelNum}>
            {onTrack}
            <Text style={styles.wheelOf}>/{micros.length}</Text>
          </Text>
          <Text style={styles.wheelLabel}>on track</Text>
        </MicroWheel>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.microTitle}>Vitamins</Text>
          {logged ? (
            <View style={{ gap: 4, marginTop: 6 }}>
              {(['on-track', 'getting-there', 'low'] as Band[]).map((k) => (
                <View key={k} style={styles.legend}>
                  <View style={[styles.dot, { backgroundColor: BAND_COLOR[k] }]} />
                  <Text style={styles.legendText}>
                    <Text style={styles.legendNum}>{count(k)}</Text> {BAND_WORD[k]}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>Each segment is a vitamin. They fill as you log FitPlate dishes, which carry researched estimates.</Text>
          )}
          <View style={styles.more}>
            <Text style={styles.moreText}>Full breakdown</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.accent} />
          </View>
        </View>
      </PressableScale>

      {!logged ? (
        <PressableScale onPress={() => router.push({ pathname: '/log', params: { tab: 'meal' } })} style={styles.nudge} scaleTo={0.98}>
          <Ionicons name="add-circle" size={18} color={colors.accent} />
          <Text style={styles.nudgeText}>Log a meal to fill your wheel</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </PressableScale>
      ) : fix && lowest && (lowest.fraction ?? 0) < 0.9 ? (
        <PressableScale onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: fix.dishId! } })} style={styles.nudge} scaleTo={0.98} accessibilityLabel={`Low on ${lowest.label}. Try ${fix.dishName}`}>
          <Text style={{ fontSize: 16 }}>💡</Text>
          <Text style={styles.nudgeText} numberOfLines={2}>
            Low on {lowest.label}? <Text style={{ color: colors.accent }}>{fix.dishName}</Text> is a good source
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  line: { marginBottom: 10 },
  lineHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, gap: 6 },
  lineLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  lineVal: { color: colors.text, fontSize: 12.5, fontWeight: '800' },
  lineOf: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  mix: { flexDirection: 'row', height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
  microRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  wheelNum: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  wheelOf: { color: colors.muted, fontSize: 15, fontWeight: '700' },
  wheelLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: -2 },
  microTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.muted, fontSize: 12.5 },
  legendNum: { color: colors.text, fontWeight: '900' },
  empty: { color: colors.muted, fontSize: 12.5, lineHeight: 17, marginTop: 4 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 8 },
  moreText: { color: colors.accent, fontWeight: '800', fontSize: 12.5 },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingHorizontal: 12, minHeight: 44, borderRadius: radius.md, backgroundColor: 'rgba(61,220,132,0.08)', borderWidth: 1, borderColor: 'rgba(61,220,132,0.18)' },
  nudgeText: { color: colors.text, fontSize: 13, fontWeight: '700', flex: 1 },
});
