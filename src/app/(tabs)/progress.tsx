import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishRow } from '../../components/DishCard';
import { Bar, CountUp, FadeIn, Glass, SectionHeader } from '../../components/ui';
import { dishes } from '../../data/dishes';
import { addDays, dayKey, dayTotals, FIBRE_TARGET, GOALS, useStore, WATER_TARGET } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function Column({ value, max, color, delay }: { value: number; max: number; color: string; delay: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(delay, withTiming(max ? value / max : 0, { duration: 800, easing: Easing.out(Easing.back(1.2)) }));
  }, [value, max, delay, h]);
  const anim = useAnimatedStyle(() => ({ height: `${Math.min(1, h.value) * 100}%` }));
  return (
    <View style={styles.colTrack}>
      <Animated.View style={[{ width: '100%', borderRadius: 6, backgroundColor: color }, anim]} />
    </View>
  );
}

const BADGES = [
  { id: 'first', emoji: '🍳', title: 'First cook', test: (c: Ctx) => c.cooked >= 1 },
  { id: 'streak3', emoji: '🔥', title: '3-day streak', test: (c: Ctx) => c.streak >= 3 },
  { id: 'saved1k', emoji: '💰', title: '₹1,000 saved', test: (c: Ctx) => c.saved >= 1000 },
  { id: 'saved5k', emoji: '🏦', title: '₹5,000 saved', test: (c: Ctx) => c.saved >= 5000 },
  { id: 'protein', emoji: '💪', title: 'Protein day', test: (c: Ctx) => c.proteinDays >= 1 },
  { id: 'water', emoji: '💧', title: 'Hydrated', test: (c: Ctx) => c.waterDays >= 1 },
  { id: 'mover', emoji: '🏃', title: '5 workouts', test: (c: Ctx) => c.workouts >= 5 },
  { id: 'chef', emoji: '👨‍🍳', title: '10 home meals', test: (c: Ctx) => c.cooked >= 10 },
];
type Ctx = { cooked: number; streak: number; saved: number; proteinDays: number; waterDays: number; workouts: number };

// `embedded` is set by the Track tab, which draws its own top inset and switcher.
export function ProgressScreen({ embedded = false }: { embedded?: boolean }) {
  const { days, profile, moneySaved, streak } = useStore();
  const goal = GOALS[profile.goal];
  const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6));
  const logs = week.map((d) => days[dayKey(d)]);
  const totals = logs.map((l) => (l ? dayTotals(l) : { kcalIn: 0, kcalOut: 0, protein: 0, fibre: 0 }));
  const logged = totals.filter((t) => t.kcalIn > 0);
  const avg = (k: keyof (typeof totals)[number]) => (logged.length ? Math.round(logged.reduce((s, t) => s + t[k], 0) / logged.length) : 0);
  const max = Math.max(goal.kcal * 1.2, ...totals.map((t) => t.kcalIn));

  const allMeals = Object.values(days).flatMap((d) => d.meals);
  const cooked = allMeals.filter((m) => m.cooked).length;
  const ctx: Ctx = {
    cooked,
    streak,
    saved: moneySaved,
    proteinDays: Object.values(days).filter((d) => dayTotals(d).protein >= goal.protein * 0.9).length,
    waterDays: Object.values(days).filter((d) => d.water >= WATER_TARGET).length,
    workouts: Object.values(days).reduce((s, d) => s + d.exercise.length, 0),
  };
  const homeShare = allMeals.length ? Math.round((cooked / allMeals.length) * 100) : 0;

  // Weekly nutrition report: suggest dishes that close the biggest gap.
  const proteinGap = avg('protein') / goal.protein;
  const fibreGap = avg('fibre') / FIBRE_TARGET;
  const gap = proteinGap < fibreGap ? 'protein' : 'fibre';
  const fixers = [...dishes].sort((a, b) => (gap === 'protein' ? b.proteinG - a.proteinG : b.fibreG - a.fibreG)).slice(0, 2);

  return (
    <SafeAreaView edges={embedded ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Progress</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Your last 7 days.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <Glass style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.h2, { color: colors.text }]}>Calories</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Legend color={colors.accent} label="In" />
                <Legend color={colors.warm} label="Burnt" />
              </View>
            </View>
            <View style={styles.chart}>
              <View style={[styles.goalLine, { bottom: `${(goal.kcal / max) * 100}%` }]}>
                <Text style={styles.goalText}>goal {goal.kcal}</Text>
              </View>
              {totals.map((t, i) => (
                <View key={i} style={styles.colWrap}>
                  <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', gap: 3, alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Column value={t.kcalIn} max={max} color={colors.accent} delay={i * 60} />
                    <Column value={t.kcalOut} max={max} color={colors.warm} delay={i * 60 + 30} />
                  </View>
                  <Text style={[styles.colLabel, i === 6 && { color: colors.text }]}>{DAY[week[i].getDay()]}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <Mini label="avg eaten" value={`${avg('kcalIn')}`} />
              <Mini label="avg burnt" value={`${avg('kcalOut')}`} />
              <Mini label="home-cooked" value={`${homeShare}%`} color={colors.accent} />
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={[type.h2, { color: colors.text }]}>Weekly nutrition report</Text>
            <View style={{ gap: 14, marginTop: 14 }}>
              <Nutrient label="Protein" value={avg('protein')} target={goal.protein} unit="g" color={colors.violet} />
              <Nutrient label="Fibre" value={avg('fibre')} target={FIBRE_TARGET} unit="g" color={colors.accent2} />
            </View>
            <Text style={{ color: colors.text, marginTop: 16, fontWeight: '700' }}>
              {gap === 'protein' ? '💪 You were lowest on protein.' : '🥦 You were lowest on fibre.'} These close the gap:
            </Text>
            <View style={{ marginTop: 10 }}>
              {fixers.map((d) => (
                <DishRow key={d.id} dish={d} right={<Text style={{ color: colors.accent, fontWeight: '900' }}>{gap === 'protein' ? `${d.proteinG} g` : `${d.fibreG} g`}</Text>} />
              ))}
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={3}>
          <Glass style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: colors.muted }]}>Total saved by cooking</Text>
              <CountUp value={moneySaved} prefix="₹" style={{ color: colors.warn, fontSize: 32, fontWeight: '900', letterSpacing: -1 }} />
            </View>
            <Text style={{ fontSize: 46 }}>💰</Text>
          </Glass>
        </FadeIn>

        <FadeIn i={4}>
          <SectionHeader title="Achievements" />
          <View style={styles.badges}>
            {BADGES.map((b) => {
              const on = b.test(ctx);
              return (
                <View key={b.id} style={[styles.badge, !on && { opacity: 0.35 }]}>
                  <View style={[styles.badgeIcon, on && styles.badgeIconOn]}>
                    <Text style={{ fontSize: 26 }}>{on ? b.emoji : '🔒'}</Text>
                  </View>
                  <Text style={styles.badgeText}>{b.title}</Text>
                </View>
              );
            })}
          </View>
        </FadeIn>

        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 18 }]} onPress={() => router.push('/profile')}>
          Demo data is pre-filled for the last 6 days. Reset it in Profile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={[type.small, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function Mini({ label, value, color = colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color, fontSize: 18, fontWeight: '900' }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function Nutrient({ label, value, target, unit, color }: { label: string; value: number; target: number; unit: string; color: string }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: colors.muted }}>
          avg {value}
          {unit} / {target}
          {unit} a day
        </Text>
      </View>
      <Bar progress={value / target} color={color} height={10} />
    </View>
  );
}

export default function Progress() {
  return <ProgressScreen />;
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', height: 170, marginTop: 18, gap: 8 },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.25)', marginBottom: 18 },
  goalText: { position: 'absolute', right: 0, top: -16, color: colors.muted, fontSize: 10 },
  colWrap: { flex: 1, alignItems: 'center' },
  colTrack: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  colLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  badge: { width: '23%', alignItems: 'center' },
  badgeIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badgeIconOn: { backgroundColor: 'rgba(255,181,71,0.15)', borderColor: 'rgba(255,181,71,0.5)', borderRadius: radius.pill },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 6 },
});
