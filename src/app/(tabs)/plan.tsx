import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn, FadeOut, SlideInDown, SlideOutDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Checkbox } from '../../components/vendors/kit';
import { DishRow } from '../../components/DishCard';
import { factsLine } from '../../components/dishes/ResearchDishCard';
import { DishImageSlot } from '../../components/dishes/parts';
import { FadeIn, Glass, GradientButton, PressableScale } from '../../components/ui';
import { getDish } from '../../data/research';
import type { Dish } from '../../models/research';
import { CAFETERIA_PLATE, dishesForSlot, isOfficeDay, pickerOrder } from '../../services/planSlots';
import { savingVsOrder } from '../../services/costToMake';
import { makeCost, orderRange } from '../../services/dishLibrary';
import { success } from '../../lib/haptics';
import { addDays, allowedDishes, dayKey, recommend, useStore, type Slot } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const SLOTS: { slot: Slot; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { slot: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { slot: 'lunch', label: 'Lunch', icon: 'briefcase-outline' },
  { slot: 'dinner', label: 'Dinner', icon: 'moon-outline' },
];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// `embedded` is set by the Track tab, which draws its own top inset and switcher.
export function PlanScreen({ embedded = false }: { embedded?: boolean }) {
  const { plan, setPlan, profile, settings, updateSettings } = useStore();
  // Lunch on office days is eaten at the canteen unless the user unticks this (default ticked).
  const officeLunch = settings.featureToggles.skipOfficeLunch ?? true;
  const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const [sel, setSel] = useState(0);
  const [picking, setPicking] = useState<Slot | null>(null);
  const key = dayKey(week[sel]);
  const day = plan[key] ?? {};

  // Old demo plan entries don't match a research dish and simply drop out.
  const planned = week.flatMap((d) => Object.values(plan[dayKey(d)] ?? {}).map((id) => getDish(id!))).filter((d): d is Dish => !!d);
  const costs = planned.map((d) => makeCost(d));
  const weekCost = costs.reduce((s, c) => s + (c?.avg ?? 0), 0);
  const partial = costs.some((c) => !c?.complete);
  const weekSave = planned.reduce((s, d, i) => s + Math.max(0, savingVsOrder(costs[i], orderRange(d))?.rupees ?? 0), 0);

  const autoPlan = () => {
    const ranked = recommend(profile);
    const bf = dishesForSlot(ranked, 'breakfast');
    const lunches = dishesForSlot(ranked, 'lunch');
    const dinners = dishesForSlot(ranked, 'dinner');
    week.forEach((d, i) => {
      const k = dayKey(d);
      const existing = plan[k] ?? {};
      if (!existing.breakfast && bf.length) setPlan(k, 'breakfast', bf[i % bf.length].id);
      if (!existing.lunch) {
        if (officeLunch && isOfficeDay(d)) setPlan(k, 'lunch', CAFETERIA_PLATE);
        else if (lunches.length) setPlan(k, 'lunch', lunches[(i + 1) % lunches.length].id);
      }
      if (!existing.dinner && dinners.length) setPlan(k, 'dinner', dinners[i % dinners.length].id);
    });
    success();
  };

  return (
    <SafeAreaView edges={embedded ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
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
            const cafeteria = slot === 'lunch' && day.lunch === CAFETERIA_PLATE;
            return (
              <FadeIn key={slot} i={i + 2}>
                <View style={styles.slotHead}>
                  <Ionicons name={icon} size={16} color={colors.muted} />
                  <Text style={[type.label, { color: colors.muted }]}>{label}</Text>
                </View>
                {cafeteria ? (
                  <Cafeteria onAddDish={() => setPicking('lunch')} onClear={() => setPlan(key, 'lunch', null)} />
                ) : dish ? (
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
                <Text style={[type.small, { color: colors.muted }]}>{partial ? 'to cook (1 person, some prices coming)' : 'to cook (1 person)'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.big, { color: colors.accent }]}>₹{weekSave}</Text>
                <Text style={[type.small, { color: colors.muted }]}>saved vs ordering</Text>
              </View>
            </View>
            <View style={{ gap: 10, marginTop: 16 }}>
              <View style={styles.office}>
                <Checkbox on={officeLunch} onPress={() => updateSettings({ featureToggles: { ...settings.featureToggles, skipOfficeLunch: !officeLunch } })} label="I eat lunch at the office on weekdays" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '800' }}>I eat lunch at the office on weekdays</Text>
                  <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>{officeLunch ? 'Auto-plan leaves weekday lunch for your cafeteria plate. Untick to plan lunch too.' : 'Auto-plan will plan lunch every day, picking dishes people eat at lunch.'}</Text>
                </View>
              </View>
              <GradientButton title="Auto-plan my week" onPress={autoPlan} />
              <GradientButton
                title="Grocery list for the week"
                variant="glass"
                disabled={planned.length === 0}
                onPress={() => router.push({ pathname: '/basket', params: { dishes: planned.map((d) => d.id).join(','), servings: '1', from: 'week' } })}
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
              {pickerOrder(allowedDishes(profile), picking)
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
                    <DishImageSlot dish={d} size={44} label={false} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: colors.text, fontWeight: '800' }} numberOfLines={1}>
                        {d.name}
                      </Text>
                      <Text style={[type.small, { color: colors.muted }]} numberOfLines={1}>
                        {factsLine(d)}
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

/** Weekday lunch at the office: add a dish, or (later) build a cafeteria plate. */
function Cafeteria({ onAddDish, onClear }: { onAddDish: () => void; onClear: () => void }) {
  const [noted, setNoted] = useState(false);
  return (
    <View style={styles.cafe}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name="briefcase-outline" size={20} color={colors.violet} />
        <Text style={{ color: colors.text, fontWeight: '800', flex: 1 }}>Lunch at the office</Text>
        <Pressable hitSlop={12} onPress={onClear} accessibilityLabel="Clear office lunch">
          <Ionicons name="close-circle" size={22} color={colors.faint} />
        </Pressable>
      </View>
      <View style={{ gap: 8, marginTop: 12 }}>
        <PressableScale onPress={onAddDish} style={styles.cafeBtn} scaleTo={0.98} accessibilityLabel="Add a dish for lunch">
          <Ionicons name="add-circle" size={20} color={colors.accent} />
          <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>Add a dish I carry or order</Text>
        </PressableScale>
        <PressableScale onPress={() => setNoted(true)} style={[styles.cafeBtn, { opacity: 0.85 }]} scaleTo={0.98} accessibilityLabel="Create a cafeteria plate, coming soon">
          <Ionicons name="restaurant-outline" size={20} color={colors.violet} />
          <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>Create a cafeteria plate</Text>
          <View style={styles.soon}>
            <Text style={{ color: colors.violet, fontWeight: '800', fontSize: 11 }}>Coming soon</Text>
          </View>
        </PressableScale>
      </View>
      {noted ? <Text style={[type.small, { color: colors.muted, marginTop: 8 }]}>Noted. Building a canteen plate and tracking office meals is on our list, and we will plan it later.</Text> : null}
    </View>
  );
}

export default function Plan() {
  return <PlanScreen />;
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
  office: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border },
  cafe: { padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)', backgroundColor: 'rgba(167,139,250,0.08)' },
  cafeBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  soon: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: 'rgba(167,139,250,0.18)' },
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
