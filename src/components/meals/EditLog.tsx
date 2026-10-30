import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useStore } from '../../lib/store';
import type { MealRow } from '../../services/meals';
import { colors, radius, type } from '../../theme';
import { PressableScale } from '../ui';

/** A small − / + stepper for portion sizes. */
export function Stepper({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 2) / 2)));
  return (
    <View style={styles.stepper}>
      <PressableScale onPress={() => set(value - step)} style={styles.btn} accessibilityLabel="Fewer servings">
        <Ionicons name="remove" size={20} color={colors.text} />
      </PressableScale>
      <Text style={styles.value}>{value}</Text>
      <PressableScale onPress={() => set(value + step)} style={styles.btn} accessibilityLabel="More servings">
        <Ionicons name="add" size={20} color={colors.text} />
      </PressableScale>
    </View>
  );
}

/** Day 13: change the portion of a logged meal or delete it. The numbers on Today and in My Meals update at once. */
export function EditLog({ meal }: { meal: MealRow }) {
  const { setMealServings, deleteMeal } = useStore();
  const [confirm, setConfirm] = useState(false);
  if (!meal.id) return null;
  const id = meal.id;
  const servings = meal.servings ?? 1;
  return (
    <View style={styles.card}>
      <Text style={[type.h2, { color: colors.text }]}>Edit this log</Text>
      <Text style={[type.small, { color: colors.muted }]}>{meal.kcal} kcal for {servings} serving{servings === 1 ? '' : 's'}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={styles.label}>Servings</Text>
        <Stepper value={servings} onChange={(v) => setMealServings(id, v)} min={0.5} max={20} step={0.5} />
      </View>
      {confirm ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <PressableScale
            onPress={() => {
              deleteMeal(id);
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/track');
            }}
            style={[styles.action, { backgroundColor: colors.bad }]}
            accessibilityLabel="Yes, delete this meal"
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Yes, delete</Text>
          </PressableScale>
          <PressableScale onPress={() => setConfirm(false)} style={[styles.action, { backgroundColor: colors.cardAlt }]} accessibilityLabel="Keep this meal">
            <Text style={{ color: colors.text, fontWeight: '800' }}>Keep it</Text>
          </PressableScale>
        </View>
      ) : (
        <PressableScale onPress={() => setConfirm(true)} style={[styles.action, { backgroundColor: colors.cardAlt, marginTop: 10 }]} accessibilityLabel="Delete this meal">
          <Ionicons name="trash-outline" size={16} color={colors.bad} />
          <Text style={{ color: colors.bad, fontWeight: '800' }}>Delete this meal</Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontWeight: '800', fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  value: { color: colors.text, fontWeight: '900', fontSize: 18, minWidth: 34, textAlign: 'center' },
  action: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.pill },
});
