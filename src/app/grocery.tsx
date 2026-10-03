import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bar, FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import { getDish } from '../data/dishes';
import { select, success } from '../lib/haptics';
import { addDays, dayKey, useStore } from '../lib/store';
import { colors, radius, type } from '../theme';

// One combined list for every dish planned this week (1 serving each).
export default function Grocery() {
  const { plan } = useStore();
  const [got, setGot] = useState<Record<string, boolean>>({});

  const items = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; unit: string; cost: number; dishes: Set<string> }>();
    for (let i = 0; i < 7; i++) {
      const day = plan[dayKey(addDays(new Date(), i))] ?? {};
      Object.values(day).forEach((id) => {
        const d = id && getDish(id);
        if (!d) return;
        d.ingredients.forEach((ing) => {
          const k = `${ing.name}|${ing.unit}`;
          const cur = map.get(k) ?? { name: ing.name, qty: 0, unit: ing.unit, cost: 0, dishes: new Set<string>() };
          cur.qty += ing.qty / d.baseServings;
          cur.cost += ing.cost / d.baseServings;
          cur.dishes.add(d.emoji);
          map.set(k, cur);
        });
      });
    }
    return [...map.values()].sort((a, b) => Number(!!got[a.name]) - Number(!!got[b.name]) || a.name.localeCompare(b.name));
  }, [plan, got]);

  const fmt = (q: number) => (q >= 10 ? String(Math.round(q)) : String(Math.round(q * 4) / 4));
  const total = Math.round(items.reduce((s, i) => s + i.cost, 0));
  const done = items.filter((i) => got[i.name]).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        <PressableScale onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text style={[type.h2, { color: colors.text }]}>Grocery list</Text>
        <PressableScale
          onPress={() =>
            Share.share({ message: 'FitPlate grocery list:\n' + items.map((i) => `• ${i.name} – ${fmt(i.qty)} ${i.unit}`).join('\n') }).catch(() => {})
          }
          style={styles.back}
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </PressableScale>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        {items.length === 0 ? (
          <Glass style={{ alignItems: 'center', padding: 28 }}>
            <Text style={{ fontSize: 44 }}>🛒</Text>
            <Text style={[type.h2, { color: colors.text, marginTop: 8 }]}>Nothing planned yet</Text>
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>Plan a few meals and your list builds itself.</Text>
            <GradientButton title="Plan my week" onPress={() => router.replace('/plan')} style={{ marginTop: 16, alignSelf: 'stretch' }} />
          </Glass>
        ) : (
          <>
            <FadeIn i={0}>
              <Glass>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: colors.text, fontWeight: '800' }}>
                    {done} of {items.length} in the bag
                  </Text>
                  <Text style={{ color: colors.accent, fontWeight: '900' }}>≈ ₹{total}</Text>
                </View>
                <Bar progress={items.length ? done / items.length : 0} />
              </Glass>
            </FadeIn>
            <View style={{ marginTop: 14 }}>
              {items.map((i) => (
                <Animated.View key={i.name + i.unit} layout={LinearTransition.springify().damping(18)}>
                  <PressableScale
                    haptic={false}
                    scaleTo={0.98}
                    onPress={() => {
                      const next = !got[i.name];
                      if (next) success();
                      else select();
                      setGot({ ...got, [i.name]: next });
                    }}
                    style={[styles.row, got[i.name] && { opacity: 0.45 }]}
                  >
                    <View style={[styles.box, got[i.name] && styles.boxOn]}>
                      {got[i.name] ? <Ionicons name="checkmark" size={16} color="#06210F" /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.name, got[i.name] && { textDecorationLine: 'line-through' }]}>{i.name}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>
                        {fmt(i.qty)} {i.unit} · for {[...i.dishes].join(' ')}
                      </Text>
                    </View>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
});
