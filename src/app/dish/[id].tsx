import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, DishArt, FadeIn, Glass, GradientButton, PressableScale, SectionHeader } from '../../components/ui';
import { costToMake, costToOrder, getDish, scaleQty } from '../../data/dishes';
import { success, thud } from '../../lib/haptics';
import { dayKey, EXERCISES, useStore } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const HERO = 340;

export default function DishScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dish = getDish(id);
  const insets = useSafeAreaInsets();
  const { favourites, toggleFavourite, setPlan, profile } = useStore();
  const [servings, setServings] = useState(dish?.baseServings ?? 2);
  const [added, setAdded] = useState(false);

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [-200, 0, HERO], [-100, 0, HERO * 0.45], Extrapolation.CLAMP) },
      { scale: interpolate(y.value, [-200, 0], [1.5, 1], Extrapolation.CLAMP) },
    ],
  }));
  const barStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [HERO - 140, HERO - 60], [0, 1], Extrapolation.CLAMP) }));

  if (!dish) return <Text style={{ color: colors.text, padding: 40 }}>Dish not found.</Text>;

  const make = costToMake(dish, servings);
  const order = costToOrder(dish, servings);
  const fav = favourites.includes(dish.id);
  const params = { id: dish.id, servings: String(servings) };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.View style={[styles.hero, heroStyle]}>
        <DishArt emoji={dish.emoji} palette={dish.palette} size={'100%'} rounded={0} style={{ height: HERO + 40 }} />
      </Animated.View>

      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: HERO - 40, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.sheet}>
          <FadeIn i={0}>
            <View style={styles.tags}>
              <Text style={styles.tag}>{dish.category}</Text>
              <Text style={styles.tag}>{dish.diet === 'veg' ? '🟢 Veg' : dish.diet === 'egg' ? '🟡 Egg' : '🔴 Non-veg'}</Text>
              {dish.tags.includes('night-before') ? <Text style={styles.tag}>🌙 Prep ahead</Text> : null}
            </View>
            <Text style={[type.hero, { color: colors.text, marginTop: 10 }]}>{dish.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 15, marginTop: 6, lineHeight: 21 }}>{dish.tagline}</Text>
          </FadeIn>

          <FadeIn i={1}>
            <View style={styles.pills}>
              <Pill icon="flame" color={colors.warm} value={`${dish.kcal}`} label="kcal" />
              <Pill icon="barbell" color={colors.violet} value={`${dish.proteinG} g`} label="protein" />
              <Pill icon="time" color={colors.blue} value={`${dish.timeMins}m`} label="time" />
              <Pill icon="speedometer" color={colors.accent} value={dish.difficulty} label="level" />
            </View>
          </FadeIn>

          <FadeIn i={2}>
            <Glass style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '800', flex: 1, fontSize: 16 }}>Cooking for</Text>
                <PressableScale onPress={() => setServings(Math.max(1, servings - 1))} style={styles.step}>
                  <Ionicons name="remove" size={18} color={colors.text} />
                </PressableScale>
                <Animated.Text key={servings} entering={ZoomIn.duration(200)} style={styles.serv}>
                  {servings}
                </Animated.Text>
                <PressableScale onPress={() => setServings(Math.min(8, servings + 1))} style={styles.step}>
                  <Ionicons name="add" size={18} color={colors.text} />
                </PressableScale>
              </View>

              <View style={{ marginTop: 18, gap: 12 }}>
                <View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>🏠 Make at home</Text>
                    <Text style={[styles.cost, { color: colors.accent }]}>₹{make}</Text>
                  </View>
                  <Bar progress={make / order} color={colors.accent} height={12} />
                </View>
                <View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>🛵 Order on Swiggy / Zomato</Text>
                    <Text style={[styles.cost, { color: colors.bad }]}>₹{order}</Text>
                  </View>
                  <Bar progress={1} color={colors.bad} height={12} />
                </View>
              </View>
              <LinearGradient colors={['rgba(61,220,132,0.18)', 'rgba(61,220,132,0.04)']} style={styles.verdict}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>
                  You keep ₹{order - make} ({Math.round(((order - make) / order) * 100)}%) by cooking.
                </Text>
              </LinearGradient>
              <Text style={[type.small, { color: colors.faint, marginTop: 8 }]}>Demo prices are estimates for Mumbai.</Text>
            </Glass>
          </FadeIn>

          <FadeIn i={3}>
            <SectionHeader title="How healthy is it?" />
            <Glass>
              <Compare label="Made by you" score={dish.healthScore} kcal={dish.kcal} color={colors.accent} />
              <Compare label="Typical restaurant" score={dish.restaurantHealthScore} kcal={dish.restaurantKcal} color={colors.warn} />
              {dish.healthNotes.map((n) => (
                <View key={n} style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                  <Text style={{ color: colors.text, flex: 1, lineHeight: 21 }}>{n}</Text>
                </View>
              ))}
            </Glass>
          </FadeIn>

          <FadeIn i={4}>
            <SectionHeader title="Burn one plate off" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {EXERCISES.filter((e) => ['Run', 'Walk', 'Cycle', 'Yoga'].includes(e.type)).map((e) => (
                <View key={e.type} style={styles.burn}>
                  <Text style={{ fontSize: 24 }}>{e.emoji}</Text>
                  <Text style={styles.burnVal}>{Math.round((dish.kcal / (e.met * 70)) * 60)}m</Text>
                  <Text style={[type.small, { color: colors.muted }]}>{e.type.toLowerCase()}</Text>
                </View>
              ))}
            </View>
          </FadeIn>

          <FadeIn i={5}>
            <SectionHeader title="Ingredients" action="Shop" onAction={() => router.push({ pathname: '/shop/[id]', params })} />
            <Glass style={{ paddingVertical: 6 }}>
              {dish.ingredients.map((i, idx) => (
                <View key={i.name} style={[styles.ing, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <Text style={{ color: colors.text, flex: 1, fontSize: 15 }}>{i.name}</Text>
                  <Text style={{ color: colors.muted, fontWeight: '700' }}>
                    {scaleQty(i.qty, dish, servings)} {i.unit}
                  </Text>
                </View>
              ))}
            </Glass>
          </FadeIn>

          <FadeIn i={6}>
            <SectionHeader title="Equipment" />
            {dish.equipment.map((e) => (
              <View key={e.name} style={styles.equip}>
                <Ionicons name="construct-outline" size={18} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{e.name}</Text>
                  {e.alternative ? <Text style={[type.small, { color: colors.muted }]}>Don’t have one? {e.alternative}.</Text> : null}
                </View>
              </View>
            ))}
          </FadeIn>

          <FadeIn i={7}>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
              <GradientButton
                title={added ? '✓ On tonight' : '📅 Plan tonight'}
                variant="glass"
                style={{ flex: 1 }}
                onPress={() => {
                  setPlan(dayKey(), dish.category === 'Breakfast' ? 'breakfast' : 'dinner', dish.id);
                  setAdded(true);
                  success();
                }}
              />
              <GradientButton title="🛒 Ingredients" variant="glass" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/shop/[id]', params })} />
            </View>
          </FadeIn>
        </View>
      </Animated.ScrollView>

      <Animated.View style={[styles.topBar, { paddingTop: insets.top, height: insets.top + 56 }, barStyle]} pointerEvents="none">
        <Text style={[type.h2, { color: colors.text }]} numberOfLines={1}>
          {dish.name}
        </Text>
      </Animated.View>
      <View style={[styles.topBtns, { top: insets.top + 8 }]}>
        <PressableScale onPress={() => router.back()} style={styles.circle}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </PressableScale>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PressableScale
            onPress={() => Share.share({ message: `${dish.emoji} ${dish.name}: ₹${make} to make vs ₹${order} to order. Found on FitPlate.` }).catch(() => {})}
            style={styles.circle}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
          </PressableScale>
          <PressableScale
            onPress={() => {
              thud();
              toggleFavourite(dish.id);
            }}
            haptic={false}
            style={styles.circle}
          >
            <Animated.View key={String(fav)} entering={ZoomIn.springify().damping(8)}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={21} color={fav ? colors.bad : '#fff'} />
            </Animated.View>
          </PressableScale>
        </View>
      </View>

      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <GradientButton
          title={profile.level === 'beginner' ? '▶  Start guided cooking' : '▶  Start cooking'}
          onPress={() => router.push({ pathname: '/cook/[id]', params })}
        />
      </View>
    </View>
  );
}

function Pill({ icon, color, value, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: string; label: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.pillVal}>{value}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function Compare({ label, score, kcal, color }: { label: string; score: number; kcal: number; color: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color }}>
          {score}/10 · {kcal} kcal
        </Text>
      </View>
      <Bar progress={score / 10} color={color} height={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO + 40 },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, minHeight: 800 },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { color: colors.text, fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.card, overflow: 'hidden' },
  pills: { flexDirection: 'row', gap: 8, marginTop: 18 },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 2 },
  pillVal: { color: colors.text, fontWeight: '900', fontSize: 16 },
  step: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  serv: { color: colors.text, fontSize: 22, fontWeight: '900', width: 44, textAlign: 'center' },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  costLabel: { color: colors.muted, fontWeight: '600' },
  cost: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  verdict: { marginTop: 16, padding: 14, borderRadius: radius.md },
  burn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  burnVal: { color: colors.warm, fontSize: 18, fontWeight: '900', marginTop: 4 },
  ing: { flexDirection: 'row', paddingVertical: 12 },
  equip: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 10 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(7,9,10,0.95)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 110, borderBottomWidth: 1, borderBottomColor: colors.border },
  topBtns: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  circle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 12, backgroundColor: 'rgba(7,9,10,0.92)', borderTopWidth: 1, borderTopColor: colors.border },
});
