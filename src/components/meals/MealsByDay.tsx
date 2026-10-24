import { StyleSheet, Text, View } from 'react-native';

import { dayGroup, SLOT_ICON, SLOT_LABEL, type DayGroup } from '../../services/meals';
import type { DayLog } from '../../lib/store';
import { colors } from '../../theme';
import { MealPanel } from './MealPanel';

/** One day's meals under Breakfast / Lunch / Snacks / Dinner sub-headings. Shared by Today's log and My Meals. */
export function MealsOfDay({ group }: { group: DayGroup }) {
  return (
    <View>
      {group.slots.map((s) => (
        <View key={s.slot} style={{ marginTop: 10 }}>
          <Text style={styles.slot}>
            {SLOT_ICON[s.slot]} {SLOT_LABEL[s.slot]}
          </Text>
          {s.meals.map((m, i) => (
            <MealPanel key={m.id ?? `${m.at}-${i}`} meal={m} />
          ))}
        </View>
      ))}
    </View>
  );
}

export const groupOf = (dateKey: string, day: DayLog | undefined) => dayGroup(dateKey, day);

const styles = StyleSheet.create({
  slot: { color: colors.muted, fontWeight: '900', fontSize: 12.5, letterSpacing: 0.4, textTransform: 'uppercase' },
});
