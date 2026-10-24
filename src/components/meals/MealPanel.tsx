import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { getDish } from '../../data/research';
import { dishPhoto } from '../dishes/parts';
import { Glass, PressableScale } from '../ui';
import { makeCost, orderRange } from '../../services/dishLibrary';
import { HOW_LABEL, howOf, MONEY_COLOR, mealMoney, SLOT_LABEL, timeLabel, type MealRow } from '../../services/meals';
import { colors, type } from '../../theme';
import { IconBadge } from '../Icon';

/** The money line for a meal, using its own prices or the dish's researched ones. */
export function useMealMoney(m: MealRow) {
  const dish = m.dishId ? getDish(m.dishId) : undefined;
  const make = dish ? (makeCost(dish)?.avg ?? null) : null;
  const order = dish ? (orderRange(dish)?.avg ?? null) : null;
  return { dish, money: mealMoney(m, dish, make, order) };
}

/**
 * One meal as a panel: photo or emoji, name, how and when, and in the bottom
 * right two small figures: the money (green cooked, red ordered, orange
 * logged) and the calories (grey). Opens the meal's own page.
 */
export function MealPanel({ meal }: { meal: MealRow }) {
  const { dish, money } = useMealMoney(meal);
  const photo = dish ? dishPhoto(dish.id) : null;
  const how = howOf(meal);
  return (
    <PressableScale
      onPress={() => meal.id && router.push({ pathname: '/meal/[id]', params: { id: meal.id } })}
      accessibilityLabel={`${meal.name}, ${HOW_LABEL[how]}, ${meal.kcal} calories. Open details`}
      style={{ marginTop: 8 }}
    >
      <Glass style={styles.card}>
        {photo ? <Image source={photo.source} style={styles.thumb} accessibilityIgnoresInvertColors /> : <IconBadge name={how === 'ordered' ? 'bicycle-outline' : how === 'cooked' ? 'flame-outline' : 'restaurant-outline'} color={how === 'ordered' ? colors.bad : how === 'cooked' ? colors.accent : colors.warm} size={56} radius={14} />}
        <View style={{ flex: 1, minHeight: 56 }}>
          <Text style={styles.name} numberOfLines={1}>
            {meal.name}
          </Text>
          <Text style={[type.small, { color: colors.muted }]} numberOfLines={1}>
            {HOW_LABEL[how]} · {SLOT_LABEL[meal.slot]} · {timeLabel(meal.at)}
          </Text>
          <View style={styles.foot}>
            {money ? <Text style={[styles.money, { color: colors[MONEY_COLOR[money.kind]] }]}>{money.label}</Text> : <View />}
            <Text style={styles.kcal}>{meal.kcal} kcal</Text>
          </View>
        </View>
      </Glass>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.card },
  emoji: { alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 },
  money: { fontSize: 11.5, fontWeight: '800' },
  kcal: { color: colors.faint, fontSize: 11.5, fontWeight: '700' },
});
