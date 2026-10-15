import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Dish } from '../../models/research';
import { colors, radius } from '../../theme';

/**
 * Image slot for a research dish (SPEC-ADDENDA §8). No real photo or
 * illustration exists yet, so it shows a clearly labelled placeholder; real
 * images are swapped in later by file name.
 */
const MEAL_ART: Record<string, { emoji: string; palette: [string, string] }> = {
  breakfast: { emoji: '🍳', palette: ['#F8D57E', '#E89B3C'] },
  lunch: { emoji: '🍛', palette: ['#F2A65A', '#C2502E'] },
  dinner: { emoji: '🍲', palette: ['#B5654A', '#5E2A1E'] },
  snack: { emoji: '🥟', palette: ['#E9C46A', '#B5793A'] },
};

export function dishArt(d: Pick<Dish, 'mealType'>) {
  return MEAL_ART[d.mealType[0]?.toLowerCase() ?? ''] ?? { emoji: '🍽️', palette: ['#6FCF97', '#1E8A5A'] as [string, string] };
}

export function DishImageSlot({ dish, size, label = true }: { dish: Pick<Dish, 'mealType' | 'name'>; size: number; label?: boolean }) {
  const art = dishArt(dish);
  return (
    <LinearGradient
      colors={art.palette}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.art, { width: size, height: size }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${dish.name}: picture coming soon`}
    >
      <Text style={{ fontSize: size * 0.42 }}>{art.emoji}</Text>
      {label ? (
        <View style={styles.artLabel}>
          <Text style={styles.artLabelText} numberOfLines={1}>
            Photo soon
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

/** A small tag chip on a card or title ("Veg", "Jain option", "Contains milk"). */
export function TagChip({ label }: { label: string }) {
  const tone = label.startsWith('Contains ') ? styles.tagWarn : label === 'Non-veg' ? styles.tagNonVeg : label === 'Egg' ? styles.tagEgg : styles.tagOk;
  return (
    <View style={[styles.tag, tone]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

/** Selectable chip for filters and sort, at least 44 pt tall to the thumb. */
export function SelectChip({
  label,
  selected,
  onPress,
  count,
  disabled,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={count != null ? `${label}, ${count} dishes` : label}
      style={({ pressed }) => [styles.select, selected && styles.selectOn, disabled && { opacity: 0.4 }, pressed && { opacity: 0.75 }]}
    >
      {icon}
      <Text style={[styles.selectText, selected && styles.selectTextOn]}>{label}</Text>
      {count != null ? <Text style={[styles.count, selected && styles.selectTextOn]}>{count}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artLabel: { position: 'absolute', bottom: 5, left: 5, right: 5, alignItems: 'center' },
  artLabelText: { color: 'rgba(255,255,255,0.92)', fontSize: 9.5, fontWeight: '800', backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  tagOk: { backgroundColor: 'rgba(61,220,132,0.12)', borderColor: 'rgba(61,220,132,0.35)' },
  tagNonVeg: { backgroundColor: 'rgba(255,107,107,0.12)', borderColor: 'rgba(255,107,107,0.35)' },
  tagEgg: { backgroundColor: 'rgba(255,181,71,0.12)', borderColor: 'rgba(255,181,71,0.35)' },
  tagWarn: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.border },
  tagText: { color: colors.text, fontSize: 11.5, fontWeight: '700' },
  select: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  selectText: { color: colors.text, fontWeight: '700', fontSize: 13.5 },
  selectTextOn: { color: '#06210F' },
  count: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
