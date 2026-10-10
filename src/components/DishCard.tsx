import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { costToMake, costToOrder, type Dish } from '../data/dishes';
import { useStore } from '../lib/store';
import { colors, radius } from '../theme';
import { DishArt, PressableScale } from './ui';

const open = (d: Dish) => router.push({ pathname: '/dish/[id]', params: { id: d.id } });

export function DishCardTall({ dish, width = 200 }: { dish: Dish; width?: number }) {
  const save = costToOrder(dish, dish.baseServings) - costToMake(dish, dish.baseServings);
  const { favourites } = useStore();
  return (
    <PressableScale onPress={() => open(dish)} style={[styles.tall, { width }]}>
      <DishArt emoji={dish.emoji} palette={dish.palette} size={width} rounded={radius.lg} style={{ height: width * 0.95 }} />
      <View style={styles.saveBadge}>
        <Text style={styles.saveText}>Save ₹{save}</Text>
      </View>
      {favourites.includes(dish.id) ? (
        <View style={styles.heart}>
          <Ionicons name="heart" size={14} color={colors.bad} />
        </View>
      ) : null}
      <Text style={styles.tallName} numberOfLines={1}>
        {dish.name}
      </Text>
      <Text style={styles.meta}>
        {dish.kcal} kcal · {dish.timeMins} min · {dish.proteinG} g protein
      </Text>
    </PressableScale>
  );
}

export function DishRow({ dish, right }: { dish: Dish; right?: React.ReactNode }) {
  const save = costToOrder(dish, dish.baseServings) - costToMake(dish, dish.baseServings);
  return (
    <PressableScale onPress={() => open(dish)} style={styles.row} scaleTo={0.98}>
      <DishArt emoji={dish.emoji} palette={dish.palette} size={64} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{dish.name}</Text>
        <Text style={styles.meta}>
          {dish.kcal} kcal · {dish.timeMins} min · {dish.difficulty}
        </Text>
      </View>
      {right ?? (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.rowSave}>₹{save}</Text>
          <Text style={styles.meta}>saved</Text>
        </View>
      )}
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  saveText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  heart: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: 5 },
  tallName: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 10 },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  rowName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  rowSave: { color: colors.accent, fontWeight: '900', fontSize: 16 },
});
