import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { FadeIn, Glass } from '../components/ui';
import { ALL_GATED, FEATURE_INFO, FEATURE_TIERS, hasPaidFeatures } from '../config/entitlements';
import { colors, type } from '../theme';

/** Day 32: Upgrade screen design with placeholder copy. No payments are wired; nothing here can charge anyone. */
export default function Upgrade() {
  const paid = hasPaidFeatures();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="FitPlate Plus" fallback="/settings" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Everything is free for now</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>
            {paid ? 'These are the parts that belong to Plus.' : 'FitPlate has no paid plan yet. This page shows how one could look. No payment is set up and nothing here can charge you.'}
          </Text>
        </FadeIn>
        <View style={{ gap: 10, marginTop: 16 }}>
          {ALL_GATED.map((f, i) => (
            <FadeIn key={f} i={i + 1}>
              <Glass>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <Text style={{ color: colors.text, fontWeight: '900', fontSize: 15, flex: 1 }}>{FEATURE_INFO[f].name}</Text>
                  <Text style={{ color: FEATURE_TIERS[f] === 'plus' ? colors.warn : colors.accent, fontWeight: '800' }}>{FEATURE_TIERS[f] === 'plus' ? 'Plus' : 'Free'}</Text>
                </View>
                <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>{FEATURE_INFO[f].blurb}</Text>
              </Glass>
            </FadeIn>
          ))}
        </View>
        <Notice tone="info">Placeholder copy. Prices, plans and the list above will be decided by the FitPlate owner before anything is sold.</Notice>
      </ScrollView>
    </SafeAreaView>
  );
}
