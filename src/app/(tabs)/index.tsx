import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishCardTall } from '../../components/DishCard';
import { IconBadge } from '../../components/Icon';
import { WeekBars } from '../../components/viz';
import { MealsOfDay } from '../../components/meals/MealsByDay';
import { MacroLines, MicroSummary } from '../../components/TodaySummary';
import { CountUp, FadeIn, Glass, Glow, PressableScale, Ring, SectionHeader } from '../../components/ui';
import { dishLibraryHref, profileHref } from '../../config/tabs';
import { select, success } from '../../lib/haptics';
import { addDays, dayKey, dayTotals, FIBRE_TARGET, GOALS, recommend, useStore, WATER_TARGET } from '../../lib/store';
import { BALANCE_LABEL } from '../../services/dishDetail';
import { dayGroup } from '../../services/meals';
import { colors, gradients, radius, type } from '../../theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function QuickAction({ icon, label, tint, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; tint: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.qa} scaleTo={0.93} accessibilityLabel={label}>
      <View style={[styles.qaIcon, { backgroundColor: tint + '22' }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </PressableScale>
  );
}

const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** The last seven days of calories eaten against the goal; opens Progress. */
function WeekCard({ days, goalKcal }: { days: Record<string, { meals: { kcal: number }[] }>; goalKcal: number }) {
  const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6));
  const values = week.map((d) => (days[dayKey(d)]?.meals ?? []).reduce((t, m) => t + m.kcal, 0));
  const logged = values.filter((v) => v > 0).length;
  return (
    <PressableScale onPress={() => router.push({ pathname: '/track', params: { view: 'progress' } })} scaleTo={0.98} accessibilityLabel="This week. Open progress">
      <Glass style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <Text style={[type.h2, { color: colors.text }]}>This week</Text>
          <Text style={[type.small, { color: colors.muted }]}>{logged === 0 ? 'Log a meal to start' : `${logged} of 7 days logged`}</Text>
        </View>
        <WeekBars values={values} labels={week.map((d) => DAY_LETTER[d.getDay()])} goal={goalKcal} />
      </Glass>
    </PressableScale>
  );
}

function MiniStat({ icon, color, label, value }: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; value: number }) {
  return (
    <View style={styles.mini}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={styles.miniVal}>{value.toLocaleString('en-IN')}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

export default function Today() {
  const s = useStore();
  const { profile, today, moneySaved, streak, user, sex } = s;
  const goal = GOALS[profile.goal];
  const t = dayTotals(today);
  const left = goal.kcal - t.kcalIn + t.kcalOut;
  const picks = recommend(profile).slice(0, 6);
  const evening = new Date().getHours() >= 17;
  const breakfasts = recommend(profile)
    .filter((d) => d.mealType.includes('breakfast'))
    .slice(0, 8);

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const headerBg = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, 60], [0, 1], Extrapolation.CLAMP) }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Glow color={colors.accentDark} size={420} style={{ top: -120, left: -60 }} />
      <Glow color="#3a1d0a" size={360} style={{ top: 40, right: -120 }} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={[styles.headerBg, headerBg]} pointerEvents="none" />
        <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <FadeIn i={0}>
            <View style={styles.header}>
              <View>
                <Text style={[type.small, { color: colors.muted }]}>{greeting()}</Text>
                <Text style={[type.h1, { color: colors.text }]}>{profile.name || 'there'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={styles.streak}>
                  <Ionicons name="flame" size={16} color={colors.warm} />
                  <Text style={styles.streakText}>{streak}</Text>
                </View>
                <PressableScale onPress={() => router.push(profileHref())} style={styles.avatar} accessibilityLabel="Open your profile">
                  {user?.photo ? (
                    <Image source={{ uri: user.photo }} referrerPolicy="no-referrer" style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>{(profile.name || 'F')[0].toUpperCase()}</Text>
                  )}
                </PressableScale>
              </View>
            </View>
          </FadeIn>

          <FadeIn i={1}>
            <Glass style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                <Ring size={128} stroke={12} progress={t.kcalIn / (goal.kcal + t.kcalOut)}>
                  <CountUp value={Math.max(0, left)} style={styles.ringNum} />
                  <Text style={styles.ringLabel}>{left < 0 ? 'kcal over' : 'kcal left'}</Text>
                </Ring>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <MacroLines today={today} goal={goal} fibreTarget={FIBRE_TARGET} />
                </View>
              </View>
              <View style={styles.kcalRow}>
                <MiniStat icon="restaurant" color={colors.accent} label="Eaten" value={t.kcalIn} />
                <PressableScale onPress={() => router.push('/move')} scaleTo={0.95} style={{ flex: 1 }} accessibilityLabel="Burnt. Open Move">
                  <MiniStat icon="flame" color={colors.warm} label="Burnt" value={t.kcalOut} />
                </PressableScale>
                <MiniStat icon="flag" color={colors.blue} label="Goal" value={goal.kcal} />
              </View>
              {left < 0 ? (
                <PressableScale onPress={() => router.push({ pathname: '/balance', params: { kcal: String(-left) } })} style={styles.balance} scaleTo={0.98} accessibilityLabel={BALANCE_LABEL}>
                  <Ionicons name="walk" size={16} color={colors.warm} />
                  <Text style={styles.balanceText}>{BALANCE_LABEL}</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.muted} />
                </PressableScale>
              ) : null}
              <View style={styles.divider} />
              <MicroSummary today={today} sex={sex} profile={profile} />
            </Glass>
          </FadeIn>

          <PressableScale onPress={() => router.push('/analyse')} scaleTo={0.98} style={[styles.balance, { marginTop: 12 }]} accessibilityLabel="Analyse my Swiggy Checkout">
            <Ionicons name="cart" size={16} color={colors.warm} />
            <Text style={[styles.balanceText, { fontWeight: '800' }]}>Analyse my Swiggy Checkout</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.muted} />
          </PressableScale>

          <FadeIn i={2}>
            <WeekCard days={s.days} goalKcal={goal.kcal} />
          </FadeIn>

          <FadeIn i={2}>
            <PressableScale
              scaleTo={0.98}
              onPress={() => {
                success();
                Share.share({ message: `I've saved ₹${moneySaved.toLocaleString('en-IN')} by cooking instead of ordering, with FitPlate` }).catch(() => {});
              }}
              style={{ marginTop: 14 }}
            >
              <LinearGradient colors={gradients.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.money}>
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { color: 'rgba(0,0,0,0.6)' }]}>Saved by cooking</Text>
                  <CountUp value={moneySaved} prefix="₹" style={styles.moneyNum} duration={1400} />
                  <Text style={styles.moneySub}>That’s {Math.floor(moneySaved / 350)} restaurant meals’ worth</Text>
                </View>
                <View style={styles.shareBtn}>
                  <Ionicons name="share-social" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </PressableScale>
          </FadeIn>

          <FadeIn i={3}>
            <View style={styles.qaRow}>
              <QuickAction icon="fast-food" label="Log meal" tint={colors.warm} onPress={() => router.push({ pathname: '/log', params: { tab: 'meal' } })} />
              <QuickAction icon="barbell" label="Workout" tint={colors.violet} onPress={() => router.push('/move')} />
              <QuickAction icon="cart" label="Groceries" tint={colors.accent} onPress={() => router.push('/basket')} />
              <QuickAction icon="search" label="Find dish" tint={colors.blue} onPress={() => router.push(dishLibraryHref())} />
            </View>
          </FadeIn>

          <FadeIn i={4}>
            <Glass style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[type.h2, { color: colors.text }]}>Water</Text>
                  <Text style={[type.small, { color: colors.muted }]}>
                    {today.water} of {WATER_TARGET} glasses
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <PressableScale onPress={() => s.addWater(-1)} style={styles.round}>
                    <Ionicons name="remove" size={18} color={colors.text} />
                  </PressableScale>
                  <PressableScale onPress={() => s.addWater(1)} style={[styles.round, { backgroundColor: colors.blue }]}>
                    <Ionicons name="add" size={18} color="#04202b" />
                  </PressableScale>
                </View>
              </View>
              <View style={styles.glasses}>
                {Array.from({ length: WATER_TARGET }).map((_, i) => (
                  <PressableScale
                    key={i}
                    haptic={false}
                    onPress={() => {
                      select();
                      s.addWater(i + 1 - today.water);
                    }}
                    scaleTo={0.85}
                  >
                    <Ionicons name={i < today.water ? 'water' : 'water-outline'} size={26} color={i < today.water ? colors.blue : colors.faint} />
                  </PressableScale>
                ))}
              </View>
            </Glass>
          </FadeIn>

          <FadeIn i={5}>
            <SectionHeader title={`Picked for you · ${goal.label.toLowerCase()}`} action="See all" onAction={() => router.push(dishLibraryHref())} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18 }} decelerationRate="fast" snapToInterval={214}>
              {picks.map((d) => (
                <DishCardTall key={d.id} dish={d} />
              ))}
            </ScrollView>
          </FadeIn>

          <FadeIn i={6}>
            <SectionHeader title={evening ? "Tomorrow's breakfast" : 'Breakfast ideas'} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18 }}>
              {breakfasts.map((d) => (
                <DishCardTall key={d.id} dish={d} width={160} />
              ))}
            </ScrollView>
          </FadeIn>

          <FadeIn i={7}>
            <SectionHeader title="Today's log" action="Add" onAction={() => router.push('/log')} />
            {today.meals.length + today.exercise.length === 0 ? (
              <Glass>
                <Text style={{ color: colors.muted, textAlign: 'center' }}>Nothing logged yet. Tap + to add a meal, a workout or water.</Text>
              </Glass>
            ) : (
              <Glass style={{ paddingVertical: 6 }}>
                {today.meals.length ? <MealsOfDay group={dayGroup(dayKey(), today)} /> : null}
                {today.exercise.map((e, i) => (
                  <View key={`e${i}`} style={styles.logRow}>
                    <IconBadge name="barbell-outline" color={colors.warm} size={38} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logName}>{e.type}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>{e.minutes} min</Text>
                    </View>
                    <Text style={[styles.logKcal, { color: colors.warm }]}>−{e.kcal}</Text>
                  </View>
                ))}
              </Glass>
            )}
          </FadeIn>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,138,61,0.15)', borderWidth: 1, borderColor: 'rgba(255,138,61,0.35)' },
  streakText: { color: colors.warm, fontWeight: '900', fontSize: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.accent },
  avatarText: { color: colors.text, fontWeight: '900', fontSize: 16 },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  ringNum: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  ringLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '600' },
  kcalRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  mini: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.card },
  miniVal: { color: colors.text, fontWeight: '900', fontSize: 13.5 },
  miniLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '600' },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 12, minHeight: 42, borderRadius: radius.pill, backgroundColor: 'rgba(255,138,61,0.10)', borderWidth: 1, borderColor: 'rgba(255,138,61,0.28)' },
  balanceText: { color: colors.text, fontWeight: '800', fontSize: 13.5, flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  money: { borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center' },
  moneyNum: { color: '#1a0a00', fontSize: 36, fontWeight: '900', letterSpacing: -1, marginTop: 2 },
  moneySub: { color: 'rgba(26,10,0,0.75)', fontSize: 13, fontWeight: '600' },
  shareBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  qaRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  qa: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  qaIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  qaLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  round: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  glasses: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  logName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  logKcal: { color: colors.accent, fontWeight: '900', fontSize: 15 },
});
