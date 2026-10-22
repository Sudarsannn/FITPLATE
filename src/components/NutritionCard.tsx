import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getDish, researchNutrients } from '../data/research';
import type { DayLog } from '../lib/store';
import { amountLabel, band, dayMacros, dayMicros, type Band, type MicroBar } from '../services/dayNutrition';
import { colors, radius } from '../theme';
import { Bar, Chip } from './ui';

export const BAND_COLOR: Record<Band, string> = { low: colors.bad, 'getting-there': colors.warn, 'on-track': colors.accent };
const BAND_LABEL: Record<Band, string> = { low: 'Under 50%', 'getting-there': '50–89%', 'on-track': '90%+' };

function MacroRow({ label, amount, target, unit, invert = false }: { label: string; amount: number; target: number; unit: string; invert?: boolean }) {
  const f = target ? amount / target : 0;
  // Calories are the one bar where going well past the goal is not good.
  const over = invert && f > 1.1;
  const color = over ? colors.warn : BAND_COLOR[band(f)];
  return (
    <View style={styles.macro}>
      <View style={styles.rowHead}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.value} numberOfLines={1}>
          {Math.round(amount)}
          <Text style={styles.of}>
            {' '}
            / {target} {unit}
          </Text>
        </Text>
      </View>
      <Bar progress={f} color={color} height={7} />
      {over ? <Text style={[styles.note, { color: colors.warn }]}>Over today&apos;s goal</Text> : null}
    </View>
  );
}

/** Stacked bar: where today's calories came from (protein 4, carbs 4, fat 9 kcal per gram). */
function EnergySplit({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const p = protein * 4;
  const c = carbs * 4;
  const f = fat * 9;
  const total = p + c + f;
  if (!total) return null;
  const parts = [
    { key: 'Protein', kcal: p, color: colors.violet },
    { key: 'Carbs', kcal: c, color: colors.blue },
    { key: 'Fat', kcal: f, color: colors.warm },
  ];
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.sub}>Where the calories came from</Text>
      <View style={styles.stack}>
        {parts.map((x) => (x.kcal ? <View key={x.key} style={{ flex: x.kcal, backgroundColor: x.color }} /> : null))}
      </View>
      <View style={styles.legendRow}>
        {parts.map((x) => (
          <View key={x.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: x.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {x.key} {Math.round((x.kcal / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MicroRow({ bar }: { bar: MicroBar }) {
  return (
    <View style={styles.micro}>
      <Text style={styles.microLabel} numberOfLines={1}>
        {bar.label}
      </Text>
      <View style={{ flex: 1 }}>
        {bar.fraction == null ? null : <Bar progress={bar.fraction} color={BAND_COLOR[bar.band!]} height={6} />}
      </View>
      <Text style={styles.microVal} numberOfLines={1}>
        {bar.fraction == null ? amountLabel(bar.amount, bar.unit) : `${Math.round(bar.fraction * 100)}%`}
      </Text>
    </View>
  );
}

/**
 * Today's nutrition: macro bars against the goal, the calorie split, and
 * vitamin and mineral bars from the logged FitPlate dishes' researched
 * estimates against ICMR-NIN adult targets from the nutrition research.
 */
export function NutritionCard({
  today,
  goal,
  fibreTarget,
  sex,
}: {
  today: DayLog;
  goal: { kcal: number; protein: number };
  fibreTarget: number;
  sex: 'male' | 'female' | null;
}) {
  const [tab, setTab] = useState<'vitamin' | 'mineral'>('vitamin');
  const [all, setAll] = useState(false);
  const m = dayMacros(today.meals, getDish);
  const micros = dayMicros(today.meals, getDish, researchNutrients, sex === 'female' ? 'adult_female' : 'adult_male');
  const loggedDishes = today.meals.some((x) => x.dishId && getDish(x.dishId));
  const shown = micros.filter((b) => b.kind === tab);
  const list = all ? shown : shown.slice(0, 6);

  return (
    <View>
      <MacroRow label="Calories" amount={m.kcal} target={goal.kcal} unit="kcal" invert />
      <View style={styles.two}>
        <View style={{ flex: 1 }}>
          <MacroRow label="Protein" amount={m.protein} target={goal.protein} unit="g" />
        </View>
        <View style={{ flex: 1 }}>
          <MacroRow label="Fibre" amount={m.fibre} target={fibreTarget} unit="g" />
        </View>
      </View>
      <View style={styles.two}>
        <View style={styles.pill}>
          <Text style={styles.pillLabel}>Carbs</Text>
          <Text style={styles.pillVal}>{m.carbs == null ? '–' : `${m.carbs} g`}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillLabel}>Fat</Text>
          <Text style={styles.pillVal}>{m.fat == null ? '–' : `${m.fat} g`}</Text>
        </View>
      </View>
      {m.carbs != null && m.fat != null ? <EnergySplit protein={m.protein} carbs={m.carbs} fat={m.fat} /> : null}

      <View style={styles.microHead}>
        <Text style={styles.sub}>Vitamins and minerals</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="Vitamins" active={tab === 'vitamin'} onPress={() => setTab('vitamin')} />
          <Chip label="Minerals" active={tab === 'mineral'} onPress={() => setTab('mineral')} />
        </View>
      </View>
      {!loggedDishes ? <Text style={styles.empty}>Nothing to count yet: these fill as you log FitPlate dishes, because each one carries researched vitamin and mineral estimates. Meals you type in yourself only add calories and protein.</Text> : null}
      {list.length ? (
        list.map((b) => <MicroRow key={b.id} bar={b} />)
      ) : (
        <Text style={styles.note}>{tab === 'mineral' ? 'Mineral research is still coming in, so nothing to show here yet.' : 'Coming soon'}</Text>
      )}
      {shown.length > 6 ? (
        <Text style={styles.more} onPress={() => setAll((v) => !v)}>
          {all ? 'Show fewer' : `Show all ${shown.length}`}
        </Text>
      ) : null}
      {tab === 'mineral' && list.length ? <Text style={styles.note}>Mineral targets are still being researched, so these show amounts only.</Text> : null}
      <View style={styles.legendRow}>
        {(Object.keys(BAND_COLOR) as Band[]).map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: BAND_COLOR[k] }]} />
            <Text style={styles.legendText}>{BAND_LABEL[k]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        Estimates from researched recipes against ICMR-NIN adult targets{sex ? '' : " (men's targets until you choose in Profile)"}. Not medical advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  macro: { marginTop: 12 },
  rowHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  label: { color: colors.muted, fontSize: 12.5, fontWeight: '700', flexShrink: 1 },
  value: { color: colors.text, fontSize: 13, fontWeight: '800' },
  of: { color: colors.muted, fontWeight: '600', fontSize: 11.5 },
  two: { flexDirection: 'row', gap: 14 },
  pill: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.card },
  pillLabel: { color: colors.muted, fontSize: 12.5, fontWeight: '700' },
  pillVal: { color: colors.text, fontSize: 13, fontWeight: '800' },
  sub: { color: colors.text, fontSize: 13.5, fontWeight: '800' },
  stack: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.muted, fontSize: 11.5, fontWeight: '600' },
  microHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 18, marginBottom: 6 },
  micro: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  microLabel: { width: 128, color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  microVal: { width: 64, textAlign: 'right', color: colors.text, fontSize: 12.5, fontWeight: '800' },
  empty: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginBottom: 6, padding: 10, borderRadius: radius.sm, backgroundColor: colors.card },
  more: { color: colors.accent, fontWeight: '800', fontSize: 12.5, marginTop: 4 },
  note: { color: colors.faint, fontSize: 11.5, lineHeight: 16, marginTop: 8 },
});
