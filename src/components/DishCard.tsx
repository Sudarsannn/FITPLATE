import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useStore } from '../lib/store';
import type { Dish } from '../models/research';
import { savingVsOrder } from '../services/costToMake';
import { makeCost, orderRange } from '../services/dishLibrary';
import { colors, radius } from '../theme';
import { factsLine } from './dishes/ResearchDishCard';
import { DishImageSlot } from './dishes/parts';
import { PressableScale } from './ui';

/**
 * Research-dish cards for Today, Plan and Progress. Every dish opens the one
 * dish page (/recipe/[id]), the same page the Cook tab opens. The demo
 * dishes and their pages are gone (22 Oct 2026).
 */
const open = (d: Dish) => router.push({ pathname: '/recipe/[id]', params: { id: d.id } });

/** "Save ₹113" when the saving is known, else "₹47 to make" (or "From ₹40" when most prices are in), else nothing. */
export function priceBadge(d: Dish): string | null {
  const cost = makeCost(d);
  const save = savingVsOrder(cost, orderRange(d));
  if (save && save.rupees > 0) return `Save ₹${save.rupees}`;
  if (cost?.complete) return `₹${cost.avg} to make`;
  // Most ingredients priced: a floor, labelled as one. Fewer than that would mislead.
  if (cost && cost.countedLines && cost.pricedLines / cost.countedLines >= 0.75) return `From ₹${cost.avg}`;
  return null;
}

export function DishCardTall({ dish, width = 200 }: { dish: Dish; width?: number }) {
  const { favourites } = useStore();
  const badge = priceBadge(dish);
  const kcal = dish.nutritionPerServing.kcal;
  const protein = dish.nutritionPerServing.proteinG;
  return (
    <PressableScale onPress={() => open(dish)} style={[styles.tall, { width }]} accessibilityLabel={`${dish.name}. ${factsLine(dish)}`}>
      <DishImageSlot dish={dish} size={width} />
      {badge ? (
        <View style={styles.saveBadge}>
          <Text style={styles.saveText}>{badge}</Text>
        </View>
      ) : null}
      {favourites.includes(dish.id) ? (
        <View style={styles.heart}>
          <Ionicons name="heart" size={14} color={colors.bad} />
        </View>
      ) : null}
      <Text style={styles.tallName} numberOfLines={2}>
        {dish.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {[kcal != null ? `${Math.round(kcal)} kcal` : null, protein != null ? `${Math.round(protein)} g protein` : null].filter(Boolean).join(' · ')}
      </Text>
    </PressableScale>
  );
}

export function DishRow({ dish, right }: { dish: Dish; right?: ReactNode }) {
  const badge = priceBadge(dish);
  return (
    <PressableScale onPress={() => open(dish)} style={styles.row} scaleTo={0.98} accessibilityLabel={`${dish.name}. ${factsLine(dish)}`}>
      <DishImageSlot dish={dish} size={64} label={false} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.rowName} numberOfLines={2}>
          {dish.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {factsLine(dish)}
        </Text>
      </View>
      {right ?? (badge ? <Text style={styles.rowSave}>{badge}</Text> : null)}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tall: { marginRight: 14 },
  saveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  saveText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  heart: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: 5 },
  tallName: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 10, lineHeight: 19 },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  rowName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  rowSave: { color: colors.accent, fontWeight: '900', fontSize: 13, maxWidth: 96, textAlign: 'right' },
});
