import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { useStore } from '../lib/store';
import { leftoverStatus, removeLeftover } from '../services/leftovers';
import { colors, type } from '../theme';
import { IconBadge } from './Icon';
import { Glass, PressableScale } from './ui';

const when = (daysLeft: number) => (daysLeft < 0 ? 'past its date: smell and check before eating' : daysLeft === 0 ? 'use today' : daysLeft === 1 ? 'use by tomorrow' : `${daysLeft} days left`);

/** Today: leftovers put away after cooking, soonest first, with the researched remix idea (flag `savingsDashboard`). Hidden when there are none. */
export function LeftoversCard() {
  const { settings, updateSettings } = useStore();
  const [now] = useState(() => Date.now());
  if (!featureFlags.savingsDashboard) return null;
  const list = settings.leftovers ?? [];
  const rows = leftoverStatus(list, now);
  if (!rows.length) return null;
  return (
    <Glass style={{ marginTop: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBadge name="snow-outline" color={colors.blue} size={40} radius={14} />
        <View style={{ flex: 1 }}>
          <Text style={[type.h2, { color: colors.text }]}>Use up your leftovers</Text>
          <Text style={[type.small, { color: colors.muted }]}>Dates come from each dish&apos;s storage note.</Text>
        </View>
      </View>
      {rows.map((l) => (
        <View key={l.dishId} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PressableScale onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: l.dishId } })} scaleTo={0.98} style={{ flex: 1 }} accessibilityLabel={`Open ${l.name}`}>
              <Text style={{ color: colors.text, fontWeight: '800' }} numberOfLines={1}>{l.name}</Text>
              <Text style={[type.small, { color: l.state === 'ok' ? colors.muted : colors.warn }]}>{when(l.daysLeft)}</Text>
            </PressableScale>
            <PressableScale onPress={() => updateSettings({ leftovers: removeLeftover(list, l.dishId) })} scaleTo={0.94} accessibilityLabel={`${l.name} is finished`} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.accent, fontWeight: '800' }}>Finished</Text>
            </PressableScale>
          </View>
          {l.remix ? <Text style={[type.small, { color: colors.muted, marginTop: 2 }]} numberOfLines={3}>Remix idea: {l.remix}</Text> : null}
        </View>
      ))}
    </Glass>
  );
}
