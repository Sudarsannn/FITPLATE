import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { k, Notice, SampleBanner, ScreenTop, Section } from '../../components/vendors/kit';
import { Bar, GradientButton } from '../../components/ui';
import { getDish } from '../../data/research';
import { useStore } from '../../lib/store';
import { instamart, type VendorMode } from '../../services/vendors';
import { TRACK_POLL_MS } from '../../services/vendors/config';
import { prepTimeline } from '../../services/vendors/prep';
import type { Tracking } from '../../services/vendors/types';
import { colors, radius, type } from '../../theme';

/** P3c: tracking after the order, with a "start chopping now" prep timeline, then "Continue" into cooking. */
export default function TrackScreen() {
  const { order, list: listId, mode = 'sample' } = useLocalSearchParams<{ order: string; list?: string; mode?: VendorMode }>();
  const { shoppingLists } = useStore();
  const list = shoppingLists.find((l) => l.id === listId);
  const dish = list?.dishIds[0] ? getDish(list.dishIds[0]) : undefined;
  const [t, setT] = useState<Tracking | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!order) return;
    const api = instamart(mode);
    let alive = true;
    const poll = async () => {
      try {
        const next = await api.trackOrder(order);
        if (!alive) return;
        setT(next);
        setErr(null);
        if (next.delivered) clearInterval(timer);
      } catch {
        if (alive) setErr('Couldn’t get the delivery status just now. It updates again shortly.');
      }
    };
    const first = setTimeout(poll, 0);
    // Never faster than TRACK_POLL_MS.
    const timer = setInterval(poll, TRACK_POLL_MS);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [order, mode]);

  const timeline = prepTimeline(t?.etaMin ?? null, dish?.equipment ?? []);
  const go = () => {
    if (dish) router.replace({ pathname: '/steps/[id]', params: { id: dish.id, servings: String(list?.servings[dish.id] ?? 2), via: 'instamart' } });
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Your ingredients" subtitle={order ? `Order ${order}` : null} fallback="/(tabs)" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
        {mode === 'sample' ? <SampleBanner what="order and delivery" /> : null}
        <View style={s.hero}>
          <Text style={[type.label, { color: colors.muted }]}>Swiggy Instamart</Text>
          <Text style={[type.h1, { color: colors.text, marginTop: 4 }]}>
            {t?.delivered ? 'Delivered 🎉' : t?.etaMin != null ? `Ingredients arrive in about ${t.etaMin} min` : 'Order placed'}
          </Text>
          <Text style={[k.muted, { marginTop: 4 }]}>{t?.status ?? 'Checking the delivery status…'}</Text>
          <View style={{ marginTop: 12 }}>
            <Bar progress={t?.delivered ? 1 : t?.etaMin != null ? Math.max(0.08, 1 - t.etaMin / 15) : 0.05} />
          </View>
        </View>
        {err ? <Notice tone="warn">{err}</Notice> : null}

        <Section title="Cook while it arrives">
          {timeline.map((step) => (
            <View key={step.at} style={[s.step, step.now && s.stepNow]}>
              <Text style={[k.strong, { width: 110 }]}>{step.at}</Text>
              <Text style={[k.body, { flex: 1 }]}>{step.text}</Text>
            </View>
          ))}
        </Section>
        {dish ? <Text style={[k.muted, { marginTop: 10 }]}>Next: {dish.name}, step by step.</Text> : null}
      </ScrollView>
      <View style={s.footer}>
        <GradientButton title="Continue to cooking" onPress={go} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: { marginTop: 12, padding: 18, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  step: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border },
  stepNow: { backgroundColor: 'rgba(61,220,132,0.08)', borderRadius: 10, paddingHorizontal: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24, backgroundColor: colors.bgElevated, borderTopWidth: 1, borderColor: colors.border },
});
