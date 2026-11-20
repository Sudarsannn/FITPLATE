import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { FEATURE_INFO, type GatedFeature } from '../config/entitlements';
import { useEntitled } from '../lib/useEntitlement';
import { colors, type } from '../theme';
import { IconBadge } from './Icon';
import { Glass, GradientButton } from './ui';

/** Shows its children when the feature is open to this person, otherwise a locked card that leads to the Upgrade screen. */
export function Gate({ feature, children, compact = false }: { feature: GatedFeature; children: React.ReactNode; compact?: boolean }) {
  const ok = useEntitled(feature);
  if (ok) return <>{children}</>;
  if (compact) return null;
  const info = FEATURE_INFO[feature];
  return (
    <View style={{ padding: 18 }}>
      <Glass>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconBadge name="lock-closed-outline" color={colors.warn} size={44} radius={14} />
          <View style={{ flex: 1 }}>
            <Text style={[type.h2, { color: colors.text }]}>{info.name}</Text>
            <Text style={[type.small, { color: colors.muted }]}>Part of FitPlate Plus</Text>
          </View>
        </View>
        <Text style={{ color: colors.text, marginTop: 12 }}>{info.blurb}</Text>
        <View style={{ marginTop: 14 }}>
          <GradientButton title="See FitPlate Plus" onPress={() => router.push('/upgrade')} />
        </View>
      </Glass>
    </View>
  );
}
