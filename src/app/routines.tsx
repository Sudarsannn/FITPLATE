import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton, PressableScale } from '../components/ui';
import { ScreenTop } from '../components/vendors/kit';
import { useStore } from '../lib/store';
import { DAY_LABELS, PREBUILT_ROUTINES, routineKcal, routineMinutes } from '../services/routines';
import { colors, radius, type } from '../theme';

/** Day 23: prebuilt and saved workout routines. */
export default function Routines() {
  const { routines, bodyWeightKg } = useStore();
  const open = (id: string) => router.push({ pathname: '/routine/[id]', params: { id } });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Routines" subtitle="Several moves, one go" fallback="/move" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <GradientButton title="Build my own routine" onPress={() => router.push('/routine/edit')} />

        <Text style={styles.head}>My routines</Text>
        {routines.length === 0 ? <Text style={styles.empty}>Nothing saved yet. Build one, or open a ready-made routine below and tap Make it mine.</Text> : null}
        {routines.map((r) => (
          <Row key={r.id} name={r.name} meta={meta(r, bodyWeightKg)} days={r.days} onPress={() => open(r.id)} />
        ))}

        <Text style={styles.head}>Ready-made</Text>
        {PREBUILT_ROUTINES.map((r) => (
          <Row key={r.id} name={r.name} meta={meta(r, bodyWeightKg)} days={r.days} onPress={() => open(r.id)} />
        ))}
        <Text style={styles.note}>Minutes and calories are estimates. Check with a doctor before starting new exercise, especially with a health condition, pregnancy or an injury.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const meta = (r: { items: { exerciseId: string }[] }, w: number | null) => `${r.items.length} moves · about ${routineMinutes(r)} min · ≈ ${routineKcal(r, w)} kcal`;

function Row({ name, meta: m, days, onPress }: { name: string; meta: string; days: number[]; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.row} scaleTo={0.98} accessibilityLabel={`${name}. ${m}`}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{m}</Text>
        {days.length ? <Text style={styles.days}>{days.map((d) => DAY_LABELS[d]).join(', ')}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  head: { ...type.h2, color: colors.text, marginTop: 24, marginBottom: 10 },
  empty: { color: colors.muted, fontSize: 13.5, lineHeight: 19, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  days: { color: colors.accent2, fontSize: 12.5, fontWeight: '700', marginTop: 3 },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 20 },
});
