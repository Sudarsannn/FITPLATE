import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { featureFlags } from '../../config/featureFlags';
import type { Dish } from '../../models/research';
import { caloriesSaved } from '../../services/dishDetail';
import { cardChips, totalMinutes } from '../../services/dishLibrary';
import { colors, radius } from '../../theme';
import { PressableScale } from '../ui';
import { DishImageSlot, TagChip } from './parts';

/** One line of facts: "25 min · Beginner · 390 kcal". Missing values are left out, never guessed. */
export function factsLine(d: Dish): string {
  const t = totalMinutes(d);
  return [t != null ? `${t} min` : null, d.difficulty, d.nutritionPerServing.kcal != null ? `${Math.round(d.nutritionPerServing.kcal)} kcal` : null].filter(Boolean).join(' · ');
}

/**
 * Library card. The two research scores stay separate and keep their exact
 * labels ("Healthiness score" out of 10, "Rating" from FitPlate's research of
 * online sentiment); they are never merged into one number.
 */
export const ResearchDishCard = memo(function ResearchDishCard({ dish }: { dish: Dish }) {
  const health = dish.healthiness?.score;
  const rating = dish.researchRating?.score;
  const chips = cardChips(dish);
  // Innovation (calorieGapBadge): only when the restaurant published its calories.
  const gap = featureFlags.calorieGapBadge ? caloriesSaved(dish) : null;
  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: dish.id } })}
      style={styles.card}
      accessibilityLabel={`${dish.name}. ${factsLine(dish)}. ${chips.join(', ')}`}
    >
      <DishImageSlot dish={dish} size={92} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={2}>
          {dish.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {factsLine(dish)}
        </Text>
        {gap ? (
          <View style={styles.gap}>
            <Text style={styles.gapText} numberOfLines={1}>
              {gap} kcal lighter than the restaurant version
            </Text>
          </View>
        ) : null}
        {chips.length ? (
          <View style={styles.chips}>
            {chips.map((c) => (
              <TagChip key={c} label={c} />
            ))}
          </View>
        ) : null}
        <View style={styles.scores}>
          {health != null ? (
            <Text style={styles.score}>
              Healthiness score <Text style={styles.scoreValue}>{health}/10</Text>
            </Text>
          ) : null}
          {rating != null ? (
            <Text style={styles.score}>
              Rating <Text style={styles.scoreValue}>★ {rating}</Text>
            </Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  name: { color: colors.text, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  gap: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: 'rgba(61,220,132,0.15)', maxWidth: '100%' },
  gapText: { color: colors.accent, fontSize: 11.5, fontWeight: '800' },
  scores: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, marginTop: 6 },
  score: { color: colors.muted, fontSize: 12 },
  scoreValue: { color: colors.text, fontWeight: '800' },
});
