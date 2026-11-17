import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChartsView } from '../../components/track/ChartsView';
import { PricesView } from '../../components/track/PricesView';
import { Inventory } from '../../components/pantry/Inventory';
import { MyMeals } from '../../components/meals/MyMeals';
import { NutritionCard } from '../../components/NutritionCard';
import { FadeIn, Glass, PressableScale, TopGlow } from '../../components/ui';
import { isEnabled } from '../../config/featureFlags';
import { select } from '../../lib/haptics';
import { FIBRE_TARGET, useStore } from '../../lib/store';
import { useTargets } from '../../lib/useTargets';
import { colors, radius, type } from '../../theme';
import { PlanScreen } from './plan';
import { ProgressScreen } from './progress';

type TrackView = 'nutrition' | 'charts' | 'prices' | 'meals' | 'progress' | 'plan' | 'ingredients';

const OPTIONS: { key: TrackView; label: string }[] = [
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'charts', label: 'Charts' },
  { key: 'prices', label: 'Prices' },
  { key: 'meals', label: 'Meals' },
  { key: 'progress', label: 'Progress' },
  { key: 'plan', label: 'Plan' },
  { key: 'ingredients', label: 'Ingredients' },
];

// Day 2 shell: Track holds today's full nutrition, Progress and Plan behind a
// switcher (Today shows the summary and links here). Day 29 added the Charts and Prices views.
export default function Track() {
  const options = OPTIONS.filter((o) => isEnabled('trackCharts') || (o.key !== 'charts' && o.key !== 'prices'));
  const params = useLocalSearchParams<{ view?: TrackView }>();
  const [view, setView] = useState<TrackView>(params.view ?? 'nutrition');
  // A link from Today ("Full breakdown") can land here while the tab is already open.
  const [seen, setSeen] = useState(params.view);
  if (params.view !== seen) {
    setSeen(params.view);
    if (params.view) setView(params.view);
  }
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopGlow color={colors.blue} />
      <View style={styles.switcherWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcher} accessibilityRole="tablist">
        {options.map((o) => {
          const on = view === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => {
                select();
                setView(o.key);
              }}
              style={[styles.option, on && styles.optionOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={o.label}
            >
              <Text style={[styles.optionText, { color: on ? '#06210F' : colors.muted }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      </View>
      {view === 'nutrition' ? <NutritionScreen /> : view === 'charts' ? <ChartsView /> : view === 'prices' ? <PricesView /> : view === 'meals' ? <MyMeals /> : view === 'progress' ? <ProgressScreen embedded /> : view === 'ingredients' ? <Inventory /> : <PlanScreen embedded />}
    </SafeAreaView>
  );
}

/** Every bar for today: calories, protein, fibre, carbs and fat, the calorie split, and each vitamin and mineral. */
function NutritionScreen() {
  const { today, sex } = useStore();
  const { goal } = useTargets();
  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <FadeIn i={0}>
        <Text style={[type.h1, { color: colors.text }]}>Today&apos;s nutrition</Text>
        <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Every nutrient, against your {goal.label.toLowerCase()} goal.</Text>
      </FadeIn>
      <FadeIn i={1}>
        <Glass style={{ marginTop: 16 }}>
          <NutritionCard today={today} goal={goal} fibreTarget={FIBRE_TARGET} sex={sex} />
        </Glass>
      </FadeIn>
      <FadeIn i={2}>
        <View style={styles.links}>
          <PressableScale onPress={() => router.push({ pathname: '/log', params: { tab: 'meal' } })} style={styles.linkBtn} scaleTo={0.96}>
            <Ionicons name="add-circle-outline" size={17} color={colors.text} />
            <Text style={styles.linkText}>Log a meal</Text>
          </PressableScale>
          <PressableScale onPress={() => router.push('/cook')} style={styles.linkBtn} scaleTo={0.96}>
            <Ionicons name="search-outline" size={17} color={colors.text} />
            <Text style={styles.linkText}>Find a dish</Text>
          </PressableScale>
        </View>
      </FadeIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  links: { flexDirection: 'row', gap: 10, marginTop: 14 },
  linkBtn: { flex: 1, minHeight: 46, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  linkText: { color: colors.text, fontWeight: '800', fontSize: 14 },
  switcherWrap: { marginHorizontal: 12, marginTop: 8, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  switcher: { padding: 4, gap: 2 },
  option: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  optionOn: { backgroundColor: colors.accent },
  optionText: { fontWeight: '800', fontSize: 11.5 },
});
