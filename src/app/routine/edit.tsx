import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, GradientButton, PressableScale } from '../../components/ui';
import { ScreenTop } from '../../components/vendors/kit';
import { researchExercises } from '../../data/research';
import { useStore } from '../../lib/store';
import type { RoutineItem } from '../../models/routine';
import { byNumber, exerciseDoc } from '../../services/exerciseLibrary';
import { shortExerciseName } from '../../services/fitness';
import { DAY_LABELS, exerciseById, itemMinutesLabel, moveItem, resolveRoutine, routineKcal, routineMinutes, toggleDay } from '../../services/routines';
import { runSearch } from '../../services/search';
import { colors, radius, type } from '../../theme';

/** Day 23: build or edit your own routine: name, moves in order, days of the week. */
export default function RoutineEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { routines, saveRoutine, bodyWeightKg } = useStore();
  const existing = id ? resolveRoutine(id, routines.map((r) => ({ id: r.id, routine: r })))?.routine : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [items, setItems] = useState<RoutineItem[]>(existing?.items ?? []);
  const [days, setDays] = useState<number[]>(existing?.days ?? []);
  const [query, setQuery] = useState('');
  const picks = useMemo(
    () => runSearch(researchExercises, { toDoc: exerciseDoc, query, groups: [], selection: {}, sort: 'relevance', tieBreak: byNumber }).map((r) => r.item).slice(0, query.trim() ? 12 : 8),
    [query],
  );
  const draft = { name: name.trim(), items, days };
  const canSave = draft.name.length > 0 && items.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title={existing ? 'Edit routine' : 'New routine'} fallback="/routines" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="e.g. Morning 15" placeholderTextColor={colors.faint} accessibilityLabel="Routine name" style={styles.input} maxLength={50} />

        <Text style={styles.label}>Days</Text>
        <View style={styles.chips}>
          {DAY_LABELS.map((d, i) => (
            <Chip key={d} label={d} active={days.includes(i)} onPress={() => setDays((cur) => toggleDay(cur, i))} />
          ))}
        </View>

        <Text style={styles.label}>Moves ({items.length}){items.length ? ` · about ${routineMinutes({ items })} min · ≈ ${routineKcal({ items }, bodyWeightKg)} kcal` : ''}</Text>
        {items.length === 0 ? <Text style={styles.muted}>Add at least one move below.</Text> : null}
        {items.map((it, i) => {
          const e = exerciseById(it.exerciseId);
          if (!e) return null;
          return (
            <View key={`${it.exerciseId}-${i}`} style={styles.row}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {i + 1}. {shortExerciseName(e.name)}
                </Text>
                <Text style={styles.meta}>{itemMinutesLabel(it)}</Text>
              </View>
              <Mini icon="arrow-up" label={`Move ${shortExerciseName(e.name)} up`} onPress={() => setItems((cur) => moveItem(cur, i, i - 1))} />
              <Mini icon="arrow-down" label={`Move ${shortExerciseName(e.name)} down`} onPress={() => setItems((cur) => moveItem(cur, i, i + 1))} />
              <Mini icon="close" label={`Remove ${shortExerciseName(e.name)}`} onPress={() => setItems((cur) => cur.filter((_, k) => k !== i))} />
            </View>
          );
        })}

        <Text style={styles.label}>Add a move</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search moves or muscles" placeholderTextColor={colors.faint} accessibilityLabel="Search moves to add" style={styles.input} autoCorrect={false} />
        {picks.map((e) => (
          <PressableScale key={e.id} onPress={() => setItems((cur) => [...cur, { exerciseId: e.id }])} style={styles.pick} scaleTo={0.98} accessibilityLabel={`Add ${shortExerciseName(e.name)}`}>
            <Text style={[styles.name, { flex: 1 }]} numberOfLines={1}>
              {shortExerciseName(e.name)}
            </Text>
            <Ionicons name="add-circle" size={22} color={colors.accent} />
          </PressableScale>
        ))}
        {query.trim() && picks.length === 0 ? <Text style={styles.muted}>No moves match.</Text> : null}

        <GradientButton
          title="Save routine"
          disabled={!canSave}
          style={{ marginTop: 22 }}
          onPress={() => {
            const savedId = saveRoutine(draft, existing ? id : undefined);
            router.replace({ pathname: '/routine/[id]', params: { id: savedId } });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Mini({ icon, label, onPress }: { icon: 'arrow-up' | 'arrow-down' | 'close'; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} style={styles.mini}>
      <Ionicons name={icon} size={18} color={colors.muted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  label: { ...type.label, color: colors.muted, marginTop: 20, marginBottom: 8 },
  input: { color: colors.text, fontSize: 15, minHeight: 46, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muted: { color: colors.muted, fontSize: 13.5, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingLeft: 14, paddingRight: 4, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 8 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  mini: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
});
