import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn, FadeOut, SlideInDown, SlideOutDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishRow } from '../../components/DishCard';
import { FadeIn, Glass, GradientButton, PressableScale } from '../../components/ui';
import { costToMake, costToOrder, getDish } from '../../data/dishes';
import { success } from '../../lib/haptics';
import { addDays, allowedDishes, dayKey, recommend, useStore, type Slot } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const SLOTS: { slot: Slot; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { slot: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { slot: 'lunch', label: 'Lunch', icon: 'briefcase-outline' },
  { slot: 'dinner', label: 'Dinner', icon: 'moon-outline' },
];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Plan() {
  const { plan, setPlan, profile } = useStore();
  const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const [sel, setSel] = useState(0);
  const [picking, setPicking] = useState<Slot | null>(null);
  const key = dayKey(week[sel]);
  const day = plan[key] ?? {};

  const planned = week.flatMap((d) => Object.values(plan[dayKey(d)] ?? {}).map((id) => getDish(id!)!)).filter(Boolean);
  const weekCost = planned.reduce((s, d) => s + costToMake(d, 1), 0);
  const weekSave = planned.reduce((s, d) => s + costToOrder(d, 1) - costToMake(d, 1), 0);

  const autoPlan = () => {
    const ranked = recommend(profile);
    const bf = ranked.filter((d) => d.category === 'Breakfast');
    const mains = ranked.filter((d) => d.category === 'Main');
    week.forEach((d, i) => {
      const k = dayKey(d);
      const existing = plan[k] ?? {};
      if (!existing.breakfast && bf.length) setPlan(k, 'breakfast', bf[i % bf.length].id);
      // Lunch on weekdays is usually the office canteen, so only plan weekend lunches.
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      if (!existing.lunch && weekend && mains.length) setPlan(k, 'lunch', mains[(i + 1) % mains.length].id);
      if (!existing.dinner && mains.length) setPlan(k, 'dinner', mains[i % mains.length].id);
    });
    success();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Meal plan</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Plan once, shop once, stop deciding at 9 pm.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginTop: 16 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
            {week.map((d, i) => {
              const count = Object.keys(plan[dayKey(d)] ?? {}).length;
              const on = i === sel;
              return (
                <PressableScale key={i} onPress={() => setSel(i)} style={[styles.day, on && styles.dayOn]} scaleTo={0.9}>
                  <Text style={[styles.dayName, on && { color: '#06210F' }]}>{i === 0 ? 'Today' : DAY[d.getDay()]}</Text>
                  <Text style={[styles.dayNum, on && { color: '#06210F' }]}>{d.getDate()}</Text>
                  <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
                    {[0, 1, 2].map((j) => (
                      <View key={j} style={[styles.dot, { backgroundColor: j < count ? (on ? '#06210F' : colors.accent) : on ? 'rgba(0,0,0,0.2)' : colors.faint }]} />
                    ))}
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>
        </FadeIn>

        <Animated.View key={sel} entering={RFadeIn.duration(250)} layout={LinearTransition}>
          {SLOTS.map(({ slot, label, icon }, i) => {
            const dish = day[slot] ? getDish(day[slot]!) : undefined;
            return (
              <FadeIn key={slot} i={i + 2}>
                <View style={styles.slotHead}>
                  <Ionicons name={icon} size={16} color={colors.muted} />
                  <Text style={[type.label, { color: colors.muted }]}>{label}</Text>
                </View>
                {dish ? (
                  <DishRow
                    dish={dish}
                    right={
                      <Pressable hitSlop={12} onPress={() => setPlan(key, slot, null)}>
                        <Ionicons name="close-circle" size={24} color={colors.faint} />
                      </Pressable>
                    }
                  />
                ) : (
                  <PressableScale onPress={() => setPicking(slot)} style={styles.empty} scaleTo={0.98}>
                    <Ionicons name="add-circle" size={22} color={colors.accent} />
                    <Text style={{ color: colors.text, fontWeight: '700' }}>Add {label.toLowerCase()}</Text>
                    {slot === 'lunch' ? <Text style={[type.small, { color: colors.muted, marginLeft: 'auto' }]}>or log the canteen later</Text> : null}
                  </PressableScale>
                )}
              </FadeIn>
            );
          })}
        </Animated.View>

        <FadeIn i={6}>
          <Glass style={{ marginTop: 22 }}>
            <Text style={[type.h2, { color: colors.text }]}>This week</Text>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.big}>{planned.length}</Text>
                <Text style={[type.small, { color: colors.muted }]}>meals planned</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.big}>₹{weekCost}</Text>
                <Text style={[type.small, { color: colors.muted }]}>to cook (1 person)</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.big, { color: colors.accent }]}>₹{weekSave}</Text>
                <Text style={[type.small, { color: colors.muted }]}>saved vs ordering</Text>
              </View>
            </View>
            <View style={{ gap: 10, marginTop: 16 }}>
              <GradientButton title="✨ Auto-plan my week" onPress={autoPlan} />
              <GradientButton
                title="🛒 Grocery list for the week"
                variant="glass"
                disabled={planned.length === 0}
                onPress={() => router.push('/grocery')}
              />
            </View>
          </Glass>
        </FadeIn>
      </ScrollView>

      {picking ? (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View entering={RFadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <Pressable style={{ flex: 1 }} onPress={() => setPicking(null)} />
          </Animated.View>
          <Animated.View entering={SlideInDown.springify().damping(20)} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={[type.h2, { color: colors.text, marginBottom: 12 }]}>Pick {picking}</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {allowedDishes(profile)
                .sort((a, b) => Number(b.category === (picking === 'breakfast' ? 'Breakfast' : 'Main')) - Number(a.category === (picking === 'breakfast' ? 'Breakfast' : 'Main')))
                .map((d) => (
                  <PressableScale
                    key={d.id}
                    onPress={() => {
                      setPlan(key, picking, d.id);
                      setPicking(null);
                    }}
                    style={styles.pickRow}
                    scaleTo={0.98}
                  >
                    <Text style={{ fontSize: 26 }}>{d.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '800' }}>{d.name}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>
                        {d.kcal} kcal · {d.timeMins} min
                      </Text>
                    </View>
                    <Ionicons name="add" size={20} color={colors.accent} />
                  </PressableScale>
                ))}
            </ScrollView>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  day: { width: 62, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayName: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  dayNum: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  slotHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 22, marginBottom: 10 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(61,220,132,0.35)',
  },
  big: { color: colors.text, fontSize: 22, fontWeight: '900' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 110,
    borderWidth: 1,
    borderColor: colors.border,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.faint, marginBottom: 14 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
});
