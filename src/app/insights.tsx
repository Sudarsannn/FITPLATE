import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BAND_COLOR } from '../components/NutritionCard';
import { Notice, ScreenTop } from '../components/vendors/kit';
import { Bar, FadeIn, Glass, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import { researchNutrients } from '../data/research';
import { addDays, dayKey, useStore } from '../lib/store';
import { useResearchDishes } from '../lib/useResearch';
import { useTargets } from '../lib/useTargets';
import { amountLabel } from '../services/dayNutrition';
import { INSIGHTS_NOTE, suggestionsFor, weeklyCoverage } from '../services/insights';
import { supplementTotals } from '../services/supplements';
import { fitsSurvey } from '../services/surveyMatch';
import { colors, radius, type } from '../theme';

/** Day 19: this week's vitamin and mineral coverage, the top gaps, tasty-first ideas for each, and absorption tips (flag `nutritionInsights`). */
export default function Insights() {
  const { days, sex, profile, supplements } = useStore();
  const { micros } = useTargets();
  const dishes = useResearchDishes();
  const [now] = useState(() => new Date());
  const keys = useMemo(() => Array.from({ length: 7 }, (_, i) => dayKey(addDays(now, -i))), [now]);
  const supplementsByDay = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    for (const key of keys) {
      const doses = supplements.filter((s) => s.dateKey === key && s.nutrientId && s.dose != null && s.unit).map((s) => ({ nutrientId: s.nutrientId as string, amount: s.dose as number, unit: s.unit as string }));
      out[key] = supplementTotals(doses, researchNutrients).totals;
    }
    return out;
  }, [supplements, keys]);
  const targets = featureFlags.personalTargets && sex ? Object.fromEntries(micros.map((p) => [p.id, p.value])) : undefined;
  const week = useMemo(
    () => weeklyCoverage(days, keys, (id) => dishes.find((d) => d.id === id), researchNutrients, sex === 'female' ? 'adult_female' : 'adult_male', { targets, supplementsByDay }),
    [days, keys, dishes, sex, targets, supplementsByDay],
  );
  const vegOnly = ['veg', 'jain', 'vegan', 'egg', 'no-onion-garlic'].includes(profile.diet);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Weekly nutrition" fallback="/(tabs)/track" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {!featureFlags.nutritionInsights ? <Notice tone="warn">This feature is switched off.</Notice> : null}
        {week.daysCounted === 0 ? (
          <Notice>Log a FitPlate dish on any day this week and your vitamin and mineral picture will appear here. Meals you type in yourself carry no vitamin estimate.</Notice>
        ) : (
          <>
            <FadeIn i={0}>
              <Text style={[type.small, { color: colors.muted }]}>
                Based on {week.daysCounted} {week.daysCounted === 1 ? 'day' : 'days'} with FitPlate dishes in the last 7. Average per day against your target.
              </Text>
            </FadeIn>

            <FadeIn i={1}>
              <Glass style={{ marginTop: 12 }}>
                <Text style={styles.h}>Top gaps</Text>
                {week.gaps.length === 0 ? <Text style={{ color: colors.accent, fontWeight: '700' }}>Nothing stands out. Your logged dishes cover the nutrients with a target.</Text> : null}
                {week.gaps.map((g) => {
                  const n = researchNutrients.find((x) => x.id === g.id)!;
                  const s = suggestionsFor(n, g.target, dishes, { fits: (d) => fitsSurvey(profile.diet, profile.survey, d), vegOnly });
                  return (
                    <View key={g.id} style={styles.gap}>
                      <Text style={{ color: colors.text, fontWeight: '800' }}>
                        {g.name} · {Math.round(g.fraction * 100)}% of target
                      </Text>
                      {s.riskIndia === 'high' || s.riskIndia === 'moderate' ? <Text style={[type.small, { color: colors.muted }]}>Commonly low in Indian diets (research: {s.riskIndia} risk).</Text> : null}
                      {g.avg === 0 ? <Text style={[type.small, { color: colors.muted }]}>None of your logged dishes carry an estimate for this, so it may be higher than shown.</Text> : null}
                      {s.dishes.length ? <Text style={styles.sub}>Dishes that help</Text> : null}
                      {s.dishes.map((d) => (
                        <PressableScale key={d.dish.id} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: d.dish.id } })} style={styles.row} scaleTo={0.98} accessibilityLabel={`Open ${d.dish.name}`}>
                          <Text style={{ color: colors.text, flex: 1 }}>{d.dish.name}</Text>
                          <Text style={{ color: colors.muted }}>{Math.round(d.shareOfTarget * 100)}% of target</Text>
                        </PressableScale>
                      ))}
                      {s.foods.length ? <Text style={styles.sub}>Foods rich in it</Text> : null}
                      {s.foods.map((f) => (
                        <Text key={f.food} style={{ color: colors.text, minHeight: 28 }}>
                          {f.food}, {f.serving}: about {amountLabel(f.perServing, g.unit)} ({Math.round(f.shareOfTarget * 100)}%)
                        </Text>
                      ))}
                      {s.boosters.length || s.blockers.length ? <Text style={styles.sub}>Absorption tips</Text> : null}
                      {s.boosters.map((b) => (
                        <Text key={b} style={{ color: colors.accent }}>
                          Helps: {b}
                        </Text>
                      ))}
                      {s.blockers.map((b) => (
                        <Text key={b} style={{ color: colors.warn }}>
                          Hinders: {b}
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </Glass>
            </FadeIn>

            <FadeIn i={2}>
              <Glass style={{ marginTop: 14 }}>
                <Text style={styles.h}>This week by nutrient</Text>
                {week.rows.map((r) => (
                  <View key={r.id} style={styles.cov}>
                    <Text style={styles.covName} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Bar progress={r.fraction} color={BAND_COLOR[r.band]} height={6} />
                    </View>
                    <Text style={styles.covVal}>{Math.round(r.fraction * 100)}%</Text>
                  </View>
                ))}
              </Glass>
            </FadeIn>
          </>
        )}
        <Text style={[type.small, { color: colors.faint, marginTop: 14 }]}>{INSIGHTS_NOTE}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h: { color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 8 },
  gap: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  sub: { color: colors.muted, fontWeight: '700', marginTop: 8, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, borderRadius: radius.md, gap: 8 },
  cov: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 30 },
  covName: { color: colors.text, width: 110, fontSize: 13 },
  covVal: { color: colors.text, width: 44, textAlign: 'right', fontSize: 13, fontWeight: '700' },
});
