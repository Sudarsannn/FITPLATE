import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { addDays, dayKey, useStore } from '../../lib/store';
import { dayLabel, groupMeals } from '../../services/meals';
import { colors, radius, type } from '../../theme';
import { FadeIn, Glass, PressableScale } from '../ui';
import { MealsOfDay } from './MealsByDay';

/** Track > My Meals: every meal ever logged, cooked or ordered, newest day first. */
export function MyMeals() {
  const { days } = useStore();
  const groups = groupMeals(days);
  const today = dayKey();
  const yesterday = dayKey(addDays(new Date(), -1));
  const total = groups.reduce((t, g) => t + g.count, 0);
  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <FadeIn i={0}>
        <Text style={[type.h1, { color: colors.text }]}>My Meals</Text>
        <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>
          {total ? `${total} ${total === 1 ? 'meal' : 'meals'} since you started. Tap one for what it gave you.` : 'Everything you cook, order or log shows up here.'}
        </Text>
        <View style={styles.legend}>
          <Text style={[styles.key, { color: colors.accent }]}>● Cooked: saved</Text>
          <Text style={[styles.key, { color: colors.bad }]}>● Ordered: extra</Text>
          <Text style={[styles.key, { color: colors.warn }]}>● Logged: could save</Text>
        </View>
      </FadeIn>
      {groups.length === 0 ? (
        <Glass style={{ marginTop: 16 }}>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>Nothing yet. Log a meal or cook a dish and it lands here.</Text>
          <PressableScale onPress={() => router.push('/log')} style={styles.add} accessibilityLabel="Log a meal">
            <Ionicons name="add" size={18} color="#06210F" />
            <Text style={{ color: '#06210F', fontWeight: '900' }}>Log a meal</Text>
          </PressableScale>
        </Glass>
      ) : (
        groups.map((g) => (
          <View key={g.dateKey} style={{ marginTop: 22 }}>
            <View style={styles.dayHead}>
              <Text style={styles.day}>{dayLabel(g.dateKey, today, yesterday)}</Text>
              <Text style={styles.dayKcal}>
                {g.count} {g.count === 1 ? 'meal' : 'meals'} · {g.kcal} kcal
              </Text>
            </View>
            <MealsOfDay group={g} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  key: { fontSize: 11.5, fontWeight: '800' },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6 },
  day: { color: colors.text, fontWeight: '900', fontSize: 18 },
  dayKcal: { color: colors.faint, fontSize: 12, fontWeight: '700' },
  add: { alignSelf: 'center', flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 12, paddingHorizontal: 16, minHeight: 42, borderRadius: radius.pill, backgroundColor: colors.accent },
});
