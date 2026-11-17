import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { featureFlags } from '../../config/featureFlags';
import { researchNutrients } from '../../data/research';
import { dayKey, useStore } from '../../lib/store';
import { useResearchDishes } from '../../lib/useResearch';
import { useTargets } from '../../lib/useTargets';
import { weeklyCoverage } from '../../services/insights';
import { supplementTotals } from '../../services/supplements';
import { buildBuckets, changePct, coveragePct, notes, PERIODS, seriesStats, streakRows, type Metric, type Period } from '../../services/trends';
import { colors, type } from '../../theme';
import { ColumnChart, EmptyChart } from '../charts';
import { Chip, FadeIn, Glass, PressableScale } from '../ui';

const fmt = (n: number | null, d = 0) => (n == null ? 'none yet' : n.toLocaleString('en-IN', { maximumFractionDigits: d }));

/** Day 29: day, week and month charts from the person's own logs. Empty periods say so plainly. */
export function ChartsView() {
  const { days, sex, supplements } = useStore();
  const { goal, water, micros, health } = useTargets();
  const dishes = useResearchDishes();
  const [period, setPeriod] = useState<Period>('week');
  const [now] = useState(() => new Date());
  const todayKey = dayKey(now);

  const buckets = useMemo(() => buildBuckets(days, period, now), [days, period, now]);
  const before = useMemo(() => buildBuckets(days, period, now, 1), [days, period, now]);

  const group = sex === 'female' ? 'adult_female' : 'adult_male';
  const targets = useMemo(() => (featureFlags.personalTargets && sex ? Object.fromEntries(micros.map((p) => [p.id, p.value])) : undefined), [sex, micros]);
  const supplementsByDay = useMemo(() => {
    const byDay: Record<string, { nutrientId: string; amount: number; unit: string }[]> = {};
    for (const s of supplements) {
      if (s.nutrientId && s.dose != null && s.unit) (byDay[s.dateKey] ??= []).push({ nutrientId: s.nutrientId, amount: s.dose, unit: s.unit });
    }
    return Object.fromEntries(Object.entries(byDay).map(([k, doses]) => [k, supplementTotals(doses, researchNutrients).totals]));
  }, [supplements]);
  const coverageOf = useMemo(() => {
    const dish = (id: string) => dishes.find((d) => d.id === id);
    return (keys: string[]) => weeklyCoverage(days, keys, dish, researchNutrients, group, { targets, supplementsByDay });
  }, [days, dishes, group, targets, supplementsByDay]);
  const coverage = useMemo(() => buckets.map((b) => coveragePct(coverageOf(b.keys).rows)), [buckets, coverageOf]);
  const whole = useMemo(() => coverageOf(buckets.flatMap((b) => b.keys)), [buckets, coverageOf]);

  const waterGoal = health.waterCaution ? null : water.glasses;
  const streaks = streakRows(days, todayKey, waterGoal);
  const lines = notes(buckets, before, period, goal.protein);
  const unitWord = period === 'quarter' ? 'week' : 'day';

  const col = (m: Metric) => buckets.map((b) => ({ label: b.label, value: b[m] }));
  const stat = (m: Metric) => seriesStats(buckets, m);
  const delta = (m: Metric) => changePct(stat(m).average, seriesStats(before, m).average);
  const covValues = coverage.filter((c): c is number => c != null);
  const noData = buckets.every((b) => b.loggedDays === 0 && b.workoutMin === 0 && b.water == null);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <FadeIn i={0}>
        <Text style={[type.h1, { color: colors.text }]}>Charts</Text>
        <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>From what you have logged. Days with nothing logged are left blank, not counted as zero.</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {PERIODS.map((p) => (
            <Chip key={p.key} label={p.label} active={period === p.key} onPress={() => setPeriod(p.key)} />
          ))}
        </View>
      </FadeIn>

      {noData ? (
        <FadeIn i={1}>
          <Glass style={{ marginTop: 16 }}>
            <Text style={[type.h2, { color: colors.text }]}>Nothing logged in this period yet</Text>
            <Text style={[type.small, { color: colors.muted, marginTop: 6 }]}>Log a meal, a glass of water or a workout and the charts fill in on their own.</Text>
            <PressableScale onPress={() => router.push({ pathname: '/log', params: { tab: 'meal' } })} style={{ marginTop: 12 }} scaleTo={0.97} accessibilityLabel="Log a meal">
              <Text style={{ color: colors.accent, fontWeight: '800' }}>Log a meal</Text>
            </PressableScale>
          </Glass>
        </FadeIn>
      ) : null}

      {lines.length ? (
        <FadeIn i={1}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={[type.h2, { color: colors.text }]}>In plain words</Text>
            {lines.map((l) => (
              <Text key={l} style={{ color: colors.text, marginTop: 8, lineHeight: 20 }}>
                {l}
              </Text>
            ))}
          </Glass>
        </FadeIn>
      ) : null}

      <Card title="Calories in and out" sub={`Average a ${unitWord}: eaten ${fmt(stat('kcalIn').average)}, burnt ${fmt(stat('kcalOut').average)} kcal`} delta={delta('kcalIn')}>
        <ColumnChart points={col('kcalIn')} color={colors.accent} goal={goal.kcal} unit=" kcal" empty="No meals logged in this period." summary={`Calories eaten, average ${fmt(stat('kcalIn').average)}`} />
        <Text style={[type.label, { color: colors.muted, marginTop: 14 }]}>BURNT</Text>
        <View style={{ marginTop: 6 }}>
          <ColumnChart points={col('kcalOut')} color={colors.warm} height={70} empty="No workouts logged in this period." summary={`Calories burnt, average ${fmt(stat('kcalOut').average)}`} />
        </View>
      </Card>

      <Card title="Protein" sub={`Average a ${unitWord}: ${fmt(stat('protein').average)} g, goal ${goal.protein} g`} delta={delta('protein')}>
        <ColumnChart points={col('protein')} color={colors.violet} goal={goal.protein} unit=" g" empty="No meals logged in this period." summary={`Protein, average ${fmt(stat('protein').average)} grams`} />
      </Card>

      <Card title="Water" sub={waterGoal != null ? `Average a ${unitWord}: ${fmt(stat('water').average, 1)} glasses, goal ${waterGoal}` : `Average a ${unitWord}: ${fmt(stat('water').average, 1)} glasses`} delta={delta('water')}>
        <ColumnChart points={col('water')} color={colors.blue} goal={waterGoal} unit=" glasses" empty="No water logged in this period." summary={`Water, average ${fmt(stat('water').average, 1)} glasses`} />
      </Card>

      <Card title="Vitamins and minerals" sub={covValues.length ? 'Share of researched targets covered, from FitPlate dishes you logged' : 'Counts days with a FitPlate dish logged'}>
        {covValues.length ? (
          <>
            <ColumnChart points={buckets.map((b, i) => ({ label: b.label, value: coverage[i] }))} color={colors.accent2} goal={100} unit="%" empty="" summary={`Micronutrient coverage, average ${Math.round(covValues.reduce((a, b) => a + b, 0) / covValues.length)} percent`} />
            {whole.gaps.length ? <Text style={{ color: colors.text, marginTop: 10 }}>Lowest: {whole.gaps.map((g) => `${g.name} (${Math.round(g.fraction * 100)}%)`).join(', ')}</Text> : null}
            {featureFlags.nutritionInsights ? (
              <PressableScale onPress={() => router.push('/insights')} style={{ marginTop: 10 }} scaleTo={0.97} accessibilityLabel="Open weekly nutrition">
                <Text style={{ color: colors.accent, fontWeight: '800' }}>See ideas to close the gaps</Text>
              </PressableScale>
            ) : null}
          </>
        ) : (
          <EmptyChart text="Log a dish from the Cook tab and its vitamins and minerals show up here. Other meals carry no vitamin estimate." />
        )}
        <Text style={[type.small, { color: colors.faint, marginTop: 10 }]}>Partial estimates, not a blood test.</Text>
      </Card>

      <Card title="Workouts" sub={`${fmt(stat('workoutMin').total)} minutes in this period`}>
        <ColumnChart points={col('workoutMin')} color={colors.warm} unit=" min" empty="No workouts logged in this period." summary={`Workout minutes, total ${fmt(stat('workoutMin').total)}`} />
      </Card>

      <Card title="Money saved by cooking" sub={`₹${fmt(stat('savedInr').total)} in this period`}>
        <ColumnChart points={col('savedInr')} color={colors.warn} empty="Cook a dish from the Cook tab to see what you saved against ordering." summary={`Money saved, total ${fmt(stat('savedInr').total)} rupees`} />
      </Card>

      <FadeIn i={3}>
        <Glass style={{ marginTop: 14 }}>
          <Text style={[type.h2, { color: colors.text }]}>Streaks</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, rowGap: 12 }}>
            {streaks.map((r) => (
              <View key={r.id} style={{ width: '50%' }}>
                <Text style={{ color: r.days > 0 ? colors.accent : colors.muted, fontSize: 24, fontWeight: '900' }}>{r.days}</Text>
                <Text style={[type.small, { color: colors.muted }]}>
                  {r.days === 1 ? 'day' : 'days'}: {r.label.toLowerCase()}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[type.small, { color: colors.faint, marginTop: 12 }]}>A streak is nice to have, never a duty. Missing a day is fine.</Text>
        </Glass>
      </FadeIn>
    </ScrollView>
  );
}

function Card({ title, sub, delta, children }: { title: string; sub: string; delta?: number | null; children: ReactNode }) {
  return (
    <FadeIn i={2}>
      <Glass style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={[type.h2, { color: colors.text }]}>{title}</Text>
          {delta != null && Math.abs(delta) >= 5 ? <Text style={{ color: colors.muted, fontWeight: '800', fontSize: 12 }}>{`${delta > 0 ? '+' : ''}${delta}% vs before`}</Text> : null}
        </View>
        <Text style={[type.small, { color: colors.muted, marginTop: 2, marginBottom: 14 }]}>{sub}</Text>
        {children}
      </Glass>
    </FadeIn>
  );
}
