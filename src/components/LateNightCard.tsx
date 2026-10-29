import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { useResearchDishes } from '../lib/useResearch';
import { useStore } from '../lib/store';
import { totalMinutes } from '../services/dishLibrary';
import { isLateNight, lateNightPicks } from '../services/lateNight';
import { colors, radius, type } from '../theme';
import { IconBadge } from './Icon';
import { Glass, PressableScale } from './ui';

/** After 9 pm on Today: three quick, lighter dishes to cook instead of ordering (flag `lateNightHelper`). Hidden otherwise. */
export function LateNightCard() {
  const dishes = useResearchDishes();
  const { profile } = useStore();
  const [now] = useState(() => new Date());
  if (!featureFlags.lateNightHelper || !isLateNight(now)) return null;
  const picks = lateNightPicks(dishes, profile.diet, profile.survey);
  if (!picks.length) return null;
  return (
    <Glass style={{ marginTop: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBadge name="moon-outline" color={colors.violet} size={40} radius={14} />
        <View style={{ flex: 1 }}>
          <Text style={[type.h2, { color: colors.text }]}>Hungry late?</Text>
          <Text style={[type.small, { color: colors.muted }]}>Quick and light, ready in 25 minutes or less.</Text>
        </View>
      </View>
      {picks.map((d) => (
        <PressableScale key={d.id} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: d.id } })} style={styles.row} scaleTo={0.98} accessibilityLabel={`Open ${d.name}`}>
          <Text style={styles.name} numberOfLines={1}>
            {d.name}
          </Text>
          <Text style={styles.meta}>
            {totalMinutes(d)} min · {Math.round(d.nutritionPerServing.kcal ?? 0)} kcal
          </Text>
        </PressableScale>
      ))}
    </Glass>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt },
  name: { flex: 1, color: colors.text, fontWeight: '800', fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
});
