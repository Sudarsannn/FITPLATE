import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishCardTall } from '../../components/DishCard';
import { Bar, CountUp, FadeIn, Glass, Glow, PressableScale, Ring, SectionHeader } from '../../components/ui';
import { dishes } from '../../data/dishes';
import { select, success } from '../../lib/haptics';
import { dayTotals, FIBRE_TARGET, GOALS, recommend, useStore, WATER_TARGET } from '../../lib/store';
import { colors, gradients, radius, type } from '../../theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function QuickAction({ icon, label, tint, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; tint: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.qa} scaleTo={0.93}>
      <View style={[styles.qaIcon, { backgroundColor: tint + '22' }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </PressableScale>
  );
}

export default function Today() {
  const s = useStore();
  const { profile, today, moneySaved, streak } = s;
  const goal = GOALS[profile.goal];
  const t = dayTotals(today);
  const left = goal.kcal - t.kcalIn + t.kcalOut;
  const picks = recommend(profile).slice(0, 6);
  const evening = new Date().getHours() >= 17;
  const breakfasts = dishes.filter((d) => (evening ? d.tags.includes('night-before') : d.tags.includes('zero-energy')));

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
                <Text style={[type.h1, { color: colors.text }]}>{profile.name || 'there'} 👋</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={styles.streak}>
                  <Text style={{ fontSize: 15 }}>🔥</Text>
                  <Text style={styles.streakText}>{streak}</Text>
                </View>
                <PressableScale onPress={() => router.push('/profile')} style={styles.avatar}>
                  <Text style={styles.avatarText}>{(profile.name || 'F')[0].toUpperCase()}</Text>
                </PressableScale>
              </View>
            </View>
          </FadeIn>

          <FadeIn i={1}>
            <Glass style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                <Ring size={136} stroke={13} progress={t.kcalIn / (goal.kcal + t.kcalOut)}>
                  <CountUp value={Math.max(0, left)} style={styles.ringNum} />
                  <Text style={styles.ringLabel}>kcal left</Text>
                </Ring>
                <View style={{ flex: 1, gap: 12 }}>
                  <View style={styles.kv}>
                    <Ionicons name="restaurant" size={15} color={colors.accent} />
                    <Text style={styles.kvLabel}>Eaten</Text>
                    <Text style={styles.kvVal}>{t.kcalIn}</Text>
                  </View>
                  <View style={styles.kv}>
                    <Ionicons name="flame" size={15} color={colors.warm} />
                    <Text style={styles.kvLabel}>Burnt</Text>
                    <Text style={styles.kvVal}>{t.kcalOut}</Text>
                  </View>
                  <View style={styles.kv}>
                    <Ionicons name="flag" size={15} color={colors.blue} />
                    <Text style={styles.kvLabel}>Goal</Text>
                    <Text style={styles.kvVal}>{goal.kcal}</Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 18 }}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nutRow}>
                    <Text style={styles.nutLabel}>Protein</Text>
                    <Text style={styles.nutVal}>
                      {t.protein}/{goal.protein} g
                    </Text>
                  </View>
                  <Bar progress={t.protein / goal.protein} color={colors.violet} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nutRow}>
                    <Text style={styles.nutLabel}>Fibre</Text>
                    <Text style={styles.nutVal}>
                      {t.fibre}/{FIBRE_TARGET} g
                    </Text>
                  </View>
                  <Bar progress={t.fibre / FIBRE_TARGET} color={colors.accent2} />
                </View>
              </View>
            </Glass>
          </FadeIn>

          <FadeIn i={2}>
            <PressableScale
              scaleTo={0.98}
              onPress={() => {
                success();
                Share.share({ message: `I've saved ₹${moneySaved.toLocaleString('en-IN')} by cooking instead of ordering, with FitPlate 🍽️💪` }).catch(() => {});
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
              <QuickAction icon="barbell" label="Workout" tint={colors.violet} onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise' } })} />
              <QuickAction icon="cart" label="Groceries" tint={colors.accent} onPress={() => router.push('/grocery')} />
              <QuickAction icon="search" label="Find dish" tint={colors.blue} onPress={() => router.push('/discover')} />
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
            <SectionHeader title={`Picked for you · ${goal.label.toLowerCase()}`} action="See all" onAction={() => router.push('/discover')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18 }} decelerationRate="fast" snapToInterval={214}>
              {picks.map((d) => (
                <DishCardTall key={d.id} dish={d} />
              ))}
            </ScrollView>
          </FadeIn>

          <FadeIn i={6}>
            <SectionHeader title={evening ? '🌙 Prep tonight, eat tomorrow' : '⚡ Zero-energy breakfasts'} />
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
                {today.meals.map((m, i) => (
                  <View key={`m${i}`} style={styles.logRow}>
                    <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logName}>{m.name}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>{m.cooked ? 'Cooked at home' : 'Logged'} · {m.protein} g protein</Text>
                    </View>
                    <Text style={styles.logKcal}>+{m.kcal}</Text>
                  </View>
                ))}
                {today.exercise.map((e, i) => (
                  <View key={`e${i}`} style={styles.logRow}>
                    <Text style={{ fontSize: 22 }}>🏃</Text>
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
  ringNum: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  ringLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '600' },
  kv: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kvLabel: { color: colors.muted, flex: 1, fontSize: 14 },
  kvVal: { color: colors.text, fontWeight: '800', fontSize: 16 },
  nutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nutLabel: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  nutVal: { color: colors.text, fontSize: 12.5, fontWeight: '700' },
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
