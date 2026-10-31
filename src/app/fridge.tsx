import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { FadeIn, GradientButton, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import { getIngredient } from '../data/research';
import { useResearchDishes } from '../lib/useResearch';
import { useStore } from '../lib/store';
import { fridgeRescue } from '../services/fridgeRescue';
import { fitsSurvey } from '../services/surveyMatch';
import { colors, radius, type } from '../theme';

/** "What can I cook with what I have?" (Day 14 innovation, flag `fridgeRescue`): dishes ranked by how much of them is already in the kitchen. */
export default function Fridge() {
  const dishes = useResearchDishes();
  const { settings, profile } = useStore();
  const pantry = settings.pantry;
  const matches = useMemo(
    () => fridgeRescue(dishes, pantry ?? {}, { category: (id) => getIngredient(id)?.category ?? null, fits: (d) => fitsSurvey(profile.diet, profile.survey, d) }),
    [dishes, pantry, profile.diet, profile.survey],
  );
  const empty = !pantry || Object.keys(pantry).length === 0;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Cook with what I have" fallback="/(tabs)/track" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {!featureFlags.fridgeRescue ? <Notice tone="warn">This feature is switched off.</Notice> : null}
        <FadeIn i={0}>
          <Text style={[type.small, { color: colors.muted }]}>Based on the ingredients in your kitchen. Salt, oil and other pantry staples are ignored. Dishes that fit your diet and allergies come first.</Text>
        </FadeIn>
        {empty ? (
          <View style={{ marginTop: 18 }}>
            <Notice>Add what you have to your ingredients first, then come back.</Notice>
            <GradientButton title="Add my ingredients" onPress={() => router.push({ pathname: '/(tabs)/track', params: { view: 'ingredients' } })} style={{ marginTop: 12 }} />
          </View>
        ) : matches.length === 0 ? (
          <View style={{ marginTop: 18 }}>
            <Notice>Nothing matches yet. A dish needs at least two of its main ingredients in your kitchen.</Notice>
          </View>
        ) : (
          matches.map((m, i) => (
            <FadeIn key={m.dish.id} i={i + 1}>
              <PressableScale onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: m.dish.id } })} scaleTo={0.98} accessibilityLabel={`Open ${m.dish.name}`} style={{ marginTop: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{m.dish.name}</Text>
                <Text style={{ color: m.missing.length ? colors.warn : colors.accent, fontWeight: '700', marginTop: 2 }}>
                  {m.missing.length ? `You have ${m.have.length} of ${m.have.length + m.missing.length} main ingredients` : 'You have everything'}
                </Text>
                {m.missing.length ? <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Missing: {m.missing.join(', ')}</Text> : null}
              </PressableScale>
            </FadeIn>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
