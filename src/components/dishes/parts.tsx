import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { dishImageCredits, dishImageFiles } from '../../data/research/dish-images';
import type { Dish } from '../../models/research';
import { creditLine, type ImageCredit } from '../../services/data/dishImageCandidates';
import { colors, radius } from '../../theme';
import type { IconName } from '../Icon';

/** Plate rings and a line icon, drawn for dishes that have no photo yet. */
export function DishArtMark({ icon, size }: { icon: IconName; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={size * 0.46} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.34} stroke="rgba(255,255,255,0.22)" strokeWidth={1} fill="rgba(255,255,255,0.10)" />
      </Svg>
      <Ionicons name={icon} size={size * 0.36} color="rgba(255,255,255,0.92)" />
    </View>
  );
}

/**
 * Image slot for a research dish (SPEC-ADDENDA §8, §10). Shows the dish's
 * bundled, freely licensed photo when one has been verified
 * (scripts/research/images.js); otherwise a clearly labelled placeholder.
 */
const MEAL_ART: Record<string, { icon: IconName; palette: [string, string] }> = {
  breakfast: { icon: 'sunny-outline', palette: ['#F8D57E', '#E89B3C'] },
  lunch: { icon: 'restaurant-outline', palette: ['#F2A65A', '#C2502E'] },
  dinner: { icon: 'moon-outline', palette: ['#B5654A', '#5E2A1E'] },
  snack: { icon: 'cafe-outline', palette: ['#E9C46A', '#B5793A'] },
};

export function dishArt(d: Pick<Dish, 'mealType'>) {
  return MEAL_ART[d.mealType[0]?.toLowerCase() ?? ''] ?? { icon: 'restaurant-outline' as IconName, palette: ['#6FCF97', '#1E8A5A'] as [string, string] };
}

/** The dish's verified photo and its credit, or null when it has none yet. */
export function dishPhoto(id: string): { source: (typeof dishImageFiles)[string]; credit: ImageCredit } | null {
  const source = dishImageFiles[id];
  const credit = dishImageCredits[id];
  return source && credit ? { source, credit } : null;
}

export function DishImageSlot({ dish, size, label = true }: { dish: Pick<Dish, 'id' | 'mealType' | 'name'>; size: number; label?: boolean }) {
  const photo = dishPhoto(dish.id);
  if (photo) {
    return (
      <Image
        source={photo.source}
        style={[styles.art, { width: size, height: size }]}
        resizeMode="cover"
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${dish.name}. ${creditLine(photo.credit)}`}
      />
    );
  }
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
      <DishArtMark icon={art.icon} size={size * 0.74} />
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

/**
 * Attribution under a dish photo (CC BY / BY-SA need author, licence and
 * source). Tapping opens the photo's page on the source site.
 */
export function PhotoCredit({ credit }: { credit: ImageCredit }) {
  return (
    <Text
      style={styles.credit}
      onPress={() => Linking.openURL(credit.pageUrl)}
      accessibilityRole="link"
      accessibilityHint="Opens the photo's source page"
    >
      {creditLine(credit)}
    </Text>
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
  credit: { color: colors.muted, fontSize: 11, marginTop: 6, textAlign: 'center', textDecorationLine: 'underline' },
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
