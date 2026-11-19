import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useStore } from '../lib/store';
import { profileGaps } from '../services/onboardingFlow';
import { colors, radius, type } from '../theme';
import { IconBadge } from './Icon';
import { Glass, PressableScale } from './ui';

/** Today: what is still unanswered in the profile, each a tap away. Disappears once everything is answered or chosen "none". */
export function ProfileGapsCard() {
  const { profile, body, equipmentOwned } = useStore();
  if (!profile.onboarded) return null;
  const gaps = profileGaps({ survey: profile.survey, body, equipmentOwned });
  if (gaps.length === 0) return null;
  return (
    <Glass style={{ marginTop: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBadge name="person-circle-outline" color={colors.blue} size={40} radius={14} />
        <View style={{ flex: 1 }}>
          <Text style={[type.h2, { color: colors.text }]}>Finish your profile</Text>
          <Text style={[type.small, { color: colors.muted }]}>Each takes under a minute and is optional.</Text>
        </View>
      </View>
      {gaps.map((g) => (
        <PressableScale key={g.page} onPress={() => router.push({ pathname: '/survey', params: { page: g.page } })} style={s.row} scaleTo={0.98} accessibilityLabel={`Add ${g.label}`}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{g.label}</Text>
            <Text style={s.why}>{g.why}</Text>
          </View>
          <Text style={{ color: colors.accent, fontWeight: '800' }}>Add</Text>
        </PressableScale>
      ))}
    </Glass>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt },
  name: { color: colors.text, fontWeight: '800', fontSize: 14 },
  why: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
});
