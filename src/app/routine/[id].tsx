import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, GradientButton, PressableScale } from '../../components/ui';
import { ScreenTop } from '../../components/vendors/kit';
import { useStore } from '../../lib/store';
import { shortExerciseName } from '../../services/fitness';
import { DAY_LABELS, exerciseById, itemMinutesLabel, liveItems, resolveRoutine, routineKcal, routineMinutes, startParams, toggleDay } from '../../services/routines';
import { colors, radius, type } from '../../theme';

/** Day 23: one routine: its moves, time and calories, schedule, and a Start button. */
export default function RoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, bodyWeightKg, saveRoutine, removeRoutine } = useStore();
  const found = resolveRoutine(id, routines.map((r) => ({ id: r.id, routine: r })));
  if (!found) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Routine" fallback="/routines" />
        <View style={{ padding: 30, alignItems: 'center' }}>
          <Text style={[type.h2, { color: colors.text }]}>Not found</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>It may have been deleted. Open Routines to pick another.</Text>
        </View>
      </SafeAreaView>
    );
  }
  const { routine, own, blurb } = found;
  const items = liveItems(routine);
  const start = () => router.push({ pathname: '/workout/[id]', params: startParams(id, items, 0) });
  const makeMine = () => {
    const newId = saveRoutine({ name: routine.name, items: routine.items.map((i) => ({ ...i })), days: [...routine.days] });
    router.replace({ pathname: '/routine/[id]', params: { id: newId } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title={routine.name} subtitle={`${items.length} moves · about ${routineMinutes(routine)} min`} fallback="/routines" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {blurb ? <Text style={styles.blurb}>{blurb}</Text> : null}
        <View style={styles.stats}>
          <Stat value={`${routineMinutes(routine)}`} label="minutes" />
          <Stat value={`≈ ${routineKcal(routine, bodyWeightKg)}`} label="kcal (est.)" />
          <Stat value={`${items.length}`} label="moves" />
        </View>
        <GradientButton title="▶  Start routine" onPress={start} disabled={items.length === 0} style={{ marginTop: 16 }} />

        <Text style={styles.head}>Days</Text>
        {own ? (
          <View style={styles.chips}>
            {DAY_LABELS.map((d, i) => (
              <Chip key={d} label={d} active={routine.days.includes(i)} onPress={() => saveRoutine({ ...routine, days: toggleDay(routine.days, i) }, id)} />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>{routine.days.length ? `Suggested: ${routine.days.map((d) => DAY_LABELS[d]).join(', ')}. ` : ''}Tap Make it mine to pick your own days.</Text>
        )}

        <Text style={styles.head}>Moves</Text>
        {items.map((it, i) => {
          const e = exerciseById(it.exerciseId)!;
          return (
            <PressableScale key={`${it.exerciseId}-${i}`} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })} style={styles.row} scaleTo={0.98}>
              <Text style={styles.n}>{i + 1}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {shortExerciseName(e.name)}
                </Text>
                <Text style={styles.meta}>{itemMinutesLabel(it)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </PressableScale>
          );
        })}

        <View style={{ gap: 10, marginTop: 18 }}>
          {own ? (
            <>
              <GradientButton title="Edit" variant="glass" onPress={() => router.push({ pathname: '/routine/edit', params: { id } })} />
              <GradientButton
                title="Delete this routine"
                variant="glass"
                onPress={() => {
                  removeRoutine(id);
                  router.replace('/routines');
                }}
              />
            </>
          ) : (
            <GradientButton title="Make it mine" variant="glass" onPress={makeMine} />
          )}
        </View>
        <Text style={styles.note}>Estimates only. Stop if anything hurts, and check with a doctor first if you have a health condition, are pregnant or are injured.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.meta}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  blurb: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  statVal: { color: colors.text, fontWeight: '900', fontSize: 18 },
  head: { ...type.h2, color: colors.text, marginTop: 22, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muted: { color: colors.muted, fontSize: 13.5, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  n: { color: colors.accent, fontWeight: '900', width: 20, fontSize: 15 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 20 },
});
