import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { researchExercises } from '../data/research';
import { useStore } from '../lib/store';
import { deskBreakExercise, isDeskHours } from '../services/deskBreak';
import { shortExerciseName } from '../services/fitness';
import { colors, type } from '../theme';
import { IconBadge } from './Icon';
import { Glass, PressableScale } from './ui';

/** Weekday work hours on Today: one desk stretch, only if the person turned "Desk breaks" on in Profile (flag `deskBreak`). */
export function DeskBreakCard() {
  const { settings } = useStore();
  const [now] = useState(() => new Date());
  if (!featureFlags.deskBreak || settings.featureToggles.deskBreak !== true || !isDeskHours(now)) return null;
  const e = deskBreakExercise(researchExercises);
  const full = researchExercises.find((x) => x.id === e?.id);
  if (!full) return null;
  return (
    <Glass style={{ marginTop: 14 }}>
      <PressableScale onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: full.id } })} scaleTo={0.98} accessibilityLabel={`Open ${full.name}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBadge name="body-outline" color={colors.blue} size={40} radius={14} />
        <View style={{ flex: 1 }}>
          <Text style={[type.h2, { color: colors.text }]}>Desk break</Text>
          <Text style={[type.small, { color: colors.muted }]}>{shortExerciseName(full.name)}: a minute or two, no kit needed.</Text>
        </View>
      </PressableScale>
    </Glass>
  );
}
