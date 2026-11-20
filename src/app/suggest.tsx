import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { Chip, FadeIn, Glass, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import { useRecommend } from '../lib/useRecommend';
import type { Budget } from '../models/survey';
import { plausibleProtein, slotFor, SLOT_LABEL, type Slot } from '../services/recommend';
import { colors, type } from '../theme';
import { Gate } from '../components/LockedCard';

const SLOTS: Slot[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const TIMES: { label: string; value: number | null }[] = [{ label: 'Any time', value: null }, { label: '15 min', value: 15 }, { label: '30 min', value: 30 }, { label: '60 min', value: 60 }];
const BUDGETS: { label: string; value: Budget | null | undefined }[] = [
  { label: 'My budget', value: undefined },
  { label: 'Any', value: null },
  { label: 'Under ₹100', value: 'under-100' },
  { label: 'Under ₹200', value: '100-200' },
  { label: 'Under ₹350', value: '200-350' },
];

/** Day 30: "What should I eat?" and a workout for today, with the reasons for each pick (flag `recommendations`). */
export default function Suggest() {
  return (
    <Gate feature="recommendations">
      <SuggestBody />
    </Gate>
  );
}

function SuggestBody() {
  const [slot, setSlot] = useState<Slot | undefined>(undefined);
  const [maxMinutes, setMaxMinutes] = useState<number | null>(null);
  const [budget, setBudget] = useState<Budget | null | undefined>(undefined);
  const r = useRecommend({ slot, maxMinutes, budget });
  const shown = r.meals.slot;
  const w = r.workout;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="What should I eat?" fallback="/(tabs)" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {!featureFlags.recommendations ? <Notice tone="warn">This feature is switched off.</Notice> : null}
        <FadeIn i={0}>
          <Text style={[type.small, { color: colors.muted }]}>
            Tasty first, then what fits the rest of your day.
            {r.kcalLeft != null ? ` About ${r.kcalLeft.toLocaleString('en-IN')} kcal and ${Math.round(r.proteinLeft)} g protein left today.` : ` About ${Math.round(r.proteinLeft)} g protein left today.`}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
            {SLOTS.map((s) => (
              <Chip key={s} label={SLOT_LABEL[s]} active={shown === s} onPress={() => setSlot(s === slotFor(new Date().getHours()) && !slot ? undefined : s)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
            {TIMES.map((t) => (
              <Chip key={t.label} label={t.label} active={maxMinutes === t.value} onPress={() => setMaxMinutes(t.value)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
            {BUDGETS.map((b) => (
              <Chip key={b.label} label={b.label} active={budget === b.value} onPress={() => setBudget(b.value)} />
            ))}
          </ScrollView>
        </FadeIn>

        {r.meals.notes.map((n) => (
          <Notice key={n} tone="info">
            {n}
          </Notice>
        ))}

        <View style={{ gap: 10, marginTop: 14 }}>
          {r.meals.picks.length === 0 ? (
            <Glass>
              <Text style={{ color: colors.text, fontWeight: '800' }}>No dish matches these choices</Text>
              <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>Try a longer time, a bigger budget or another meal. Your diet, allergies and kitchen always apply.</Text>
            </Glass>
          ) : (
            r.meals.picks.map((p, idx) => (
              <FadeIn key={p.dish.id} i={idx + 1}>
                <PressableScale onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: p.dish.id } })} scaleTo={0.98} accessibilityLabel={`Open ${p.dish.name}`}>
                  <Glass>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, flex: 1 }}>{p.dish.name}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>
                        {Math.round(p.dish.nutritionPerServing.kcal ?? 0)} kcal{(() => { const g = plausibleProtein(p.dish.nutritionPerServing.proteinG, p.dish.nutritionPerServing.kcal); return g != null ? ` · ${Math.round(g)} g protein` : ''; })()}
                      </Text>
                    </View>
                    {p.reasons.map((x) => (
                      <Text key={x} style={{ color: colors.text, marginTop: 6, fontSize: 13.5 }}>
                        {x}
                      </Text>
                    ))}
                  </Glass>
                </PressableScale>
              </FadeIn>
            ))
          )}
        </View>

        <Text style={[type.h2, { color: colors.text, marginTop: 24 }]}>A workout for today</Text>
        {w.notes.map((n) => (
          <Notice key={n} tone="info">
            {n}
          </Notice>
        ))}
        {w.pick ? (
          <PressableScale onPress={() => router.push({ pathname: '/routine/[id]', params: { id: w.pick!.id } })} scaleTo={0.98} accessibilityLabel={`Open ${w.pick.name}`} style={{ marginTop: 10 }}>
            <Glass>
              <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }}>{w.pick.name}</Text>
              <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>
                About {w.pick.minutes} minutes{w.pick.kcal != null ? `, around ${w.pick.kcal} kcal` : ''}
              </Text>
              {w.pick.reasons.map((x) => (
                <Text key={x} style={{ color: colors.text, marginTop: 6, fontSize: 13.5 }}>
                  {x}
                </Text>
              ))}
              <Text style={{ color: colors.accent, fontWeight: '800', marginTop: 10 }}>Open routine</Text>
            </Glass>
          </PressableScale>
        ) : null}
        <Text style={[type.small, { color: colors.faint, marginTop: 18 }]}>Suggestions come from the research in the app and your answers. They are not medical advice.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
