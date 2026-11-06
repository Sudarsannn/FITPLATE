import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { Chip, FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import { researchNutrients } from '../data/research';
import { dayKey, useStore } from '../lib/store';
import { amountLabel } from '../services/dayNutrition';
import { doseUnits, LIMIT_NOTE, limitStatus, supplementTotals, toMainUnit } from '../services/supplements';
import { colors, radius, type } from '../theme';

const NUTRIENTS = researchNutrients.filter((n) => n.type === 'vitamin' || n.type === 'mineral').slice().sort((a, b) => a.name.localeCompare(b.name));
const short = (name: string) => name.replace(/\s*\(.*$/, '');

/** Day 18: log a supplement from the researched presets or a custom amount, and see it against the researched upper limit (flag `supplementLog`). */
export default function Supplements() {
  const { supplements, addSupplement, removeSupplement } = useStore();
  const [id, setId] = useState(NUTRIENTS[0]?.id ?? '');
  const n = NUTRIENTS.find((x) => x.id === id);
  const units = n ? doseUnits(n) : [];
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<string | null>(null);
  const chosenUnit = unit && units.includes(unit) ? unit : (units[0] ?? '');
  const today = dayKey();
  const todays = supplements.filter((s) => s.dateKey === today);
  const { totals } = useMemo(
    () => supplementTotals(todays.filter((s) => s.nutrientId && s.dose != null && s.unit).map((s) => ({ nutrientId: s.nutrientId as string, amount: s.dose as number, unit: s.unit as string })), researchNutrients),
    [todays],
  );
  const presets = (n?.logPresets ?? []).filter((p) => !p.prescriptionDose && p.amount != null && p.mainAmount != null);
  const value = Number(amount.replace(',', '.'));
  const main = n && amount !== '' && value > 0 ? toMainUnit(n, value, chosenUnit) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Supplements" fallback="/(tabs)/track" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {!featureFlags.supplementLog ? <Notice tone="warn">This feature is switched off.</Notice> : null}
        <Text style={[type.small, { color: colors.muted }]}>Log what you took so your vitamin and mineral bars count it. {LIMIT_NOTE}</Text>

        <FadeIn i={0}>
          <Text style={styles.h}>Which nutrient?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {NUTRIENTS.map((x) => (
              <Chip key={x.id} label={short(x.name)} active={x.id === id} onPress={() => { setId(x.id); setUnit(null); setAmount(''); }} />
            ))}
          </ScrollView>
        </FadeIn>

        {n ? (
          <FadeIn i={1}>
            <Glass style={{ marginTop: 14 }}>
              <Text style={styles.h}>Quick choices</Text>
              {presets.length ? (
                presets.map((p) => (
                  <PressableScale
                    key={p.label}
                    onPress={() => addSupplement({ name: p.label, nutrientId: n.id, dose: p.amount, unit: p.unit })}
                    style={styles.preset}
                    scaleTo={0.98}
                    accessibilityLabel={`Log ${p.label}`}
                  >
                    <Text style={{ color: colors.text, flex: 1 }}>{p.label}</Text>
                    <Text style={{ color: colors.muted }}>{amountLabel(p.amount as number, p.unit)}</Text>
                  </PressableScale>
                ))
              ) : (
                <Text style={{ color: colors.muted }}>No researched presets for {short(n.name)}. Enter the amount from your pack below.</Text>
              )}
              <Text style={[styles.h, { marginTop: 14 }]}>Or enter the amount on your pack</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Amount" placeholderTextColor={colors.faint} style={styles.input} accessibilityLabel="Supplement amount" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 8 }}>
                {units.map((u) => (
                  <Chip key={u} label={u.length > 28 ? `${u.slice(0, 26)}…` : u} active={u === chosenUnit} onPress={() => setUnit(u)} />
                ))}
              </ScrollView>
              {main != null && chosenUnit !== n.unit ? <Text style={[type.small, { color: colors.muted, marginTop: 6 }]}>That counts as {amountLabel(main, n.unit)}.</Text> : null}
              <GradientButton
                title="Log it"
                disabled={main == null}
                onPress={() => {
                  addSupplement({ name: `${short(n.name)} supplement`, nutrientId: n.id, dose: value, unit: chosenUnit });
                  setAmount('');
                }}
                style={{ marginTop: 12 }}
              />
            </Glass>
          </FadeIn>
        ) : null}

        <FadeIn i={2}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={styles.h}>Today</Text>
            {todays.length === 0 ? <Text style={{ color: colors.muted }}>Nothing logged yet.</Text> : null}
            {todays.map((s) => (
              <View key={s.id} style={styles.row}>
                <Text style={{ color: colors.text, flex: 1 }}>
                  {s.name}
                  {s.dose != null ? ` · ${amountLabel(s.dose, s.unit ?? '')}` : ''}
                </Text>
                <PressableScale onPress={() => removeSupplement(s.id)} accessibilityLabel={`Remove ${s.name}`} style={{ minHeight: 44, justifyContent: 'center' }}>
                  <Text style={{ color: colors.muted }}>Remove</Text>
                </PressableScale>
              </View>
            ))}
            {Object.entries(totals).map(([nid, amt]) => {
              const nn = researchNutrients.find((x) => x.id === nid);
              if (!nn) return null;
              const st = limitStatus(nn, 0, amt);
              if (st.level !== 'near' && st.level !== 'over') return null;
              return (
                <Text key={nid} style={{ color: st.level === 'over' ? colors.bad : colors.warn, marginTop: 8 }}>
                  {short(nn.name)}: {st.level === 'over' ? 'over' : 'close to'} the upper limit of {amountLabel(st.limit as number, nn.unit)} from supplements alone. Food adds to this; check the Track tab.
                </Text>
              );
            })}
          </Glass>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h: { color: colors.text, fontWeight: '800', marginTop: 14, marginBottom: 8 },
  preset: { flexDirection: 'row', alignItems: 'center', minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  input: { flex: 1, minHeight: 44, borderRadius: radius.md, backgroundColor: colors.cardAlt, color: colors.text, paddingHorizontal: 12 },
});
