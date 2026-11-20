import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { useStore } from '../lib/store';
import { useTargets } from '../lib/useTargets';
import { useEntitled } from '../lib/useEntitlement';
import { useRecommend } from '../lib/useRecommend';
import { SLOT_LABEL } from '../services/recommend';
import { colors, type } from '../theme';
import { IconBadge } from './Icon';
import { Glass, PressableScale } from './ui';

/** Today: the single best next meal and a workout, with one reason each. Opens the full list. Hidden when switched off or nothing fits. */
export function RecommendCard() {
  const entitled = useEntitled('recommendations');
  const r = useRecommend();
  const { water, health } = useTargets();
  const { profile } = useStore();
  if (!featureFlags.recommendations || !entitled) return null;
  const top = r.meals.picks[0];
  const w = r.workout.pick;
  if (!top && !w) return null;
  return (
    <PressableScale onPress={() => router.push('/suggest')} scaleTo={0.98} accessibilityLabel="What should I eat? Open suggestions">
      <Glass style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconBadge name="sparkles-outline" color={colors.accent} size={40} radius={14} />
          <View style={{ flex: 1 }}>
            <Text style={[type.h2, { color: colors.text }]}>{profile.name ? `Your plan today, ${profile.name}` : 'Your plan today'}</Text>
            <Text style={[type.small, { color: colors.muted }]}>What should I eat? Picked for {SLOT_LABEL[r.meals.slot].toLowerCase()} time</Text>
          </View>
        </View>
        {top ? (
          <View style={{ marginTop: 10 }}>
            <Text style={s.name}>{top.dish.name}</Text>
            {top.reasons[0] ? <Text style={s.why}>{top.reasons[0]}</Text> : null}
          </View>
        ) : null}
        {!health.waterCaution ? <Text style={[s.why, { marginTop: 8 }]}>Drink: {water.glasses} glasses of water today</Text> : null}
        {w ? <Text style={[s.why, { marginTop: 4 }]}>Move: {w.name}, about {w.minutes} min</Text> : null}
        <Text style={{ color: colors.accent, fontWeight: '800', marginTop: 10 }}>See more picks</Text>
      </Glass>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  name: { color: colors.text, fontWeight: '900', fontSize: 16 },
  why: { color: colors.muted, fontSize: 13, marginTop: 2 },
});
