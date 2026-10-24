import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { k, ScreenTop, Section } from '../components/vendors/kit';
import { getDish } from '../data/research';
import { orderRange } from '../services/dishLibrary';
import { openExternal, swiggySearchUrl } from '../services/vendors/openApp';
import { colors, radius } from '../theme';

/**
 * Order Instead: the restaurants that serve this dish, for delivery and for
 * dining in. For now the big button opens Swiggy's own results and the
 * restaurant lists say "coming soon". FitPlate never takes the order or payment.
 */
export default function OrderInstead() {
  const { dish: dishId, q } = useLocalSearchParams<{ dish?: string; q?: string }>();
  const dish = dishId ? getDish(dishId) : undefined;
  const query = (dish?.name ?? q ?? '').trim();
  const range = dish ? orderRange(dish) : null;

  const openSwiggy = (what: string) => openExternal(swiggySearchUrl(what));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Order Instead" subtitle={query || null} fallback="/cook" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={[k.strong, { textAlign: 'center', marginBottom: 6 }]}>Order on the Swiggy app</Text>
        <Pressable onPress={() => openSwiggy(query)} style={s.big} accessibilityRole="button" accessibilityLabel={`Order ${query} instead on Swiggy`}>
          <Text style={s.bigTitle}>Order instead</Text>
          <Text style={s.bigSmall}>Swiggy</Text>
        </Pressable>
        <Text style={[k.muted, { textAlign: 'center', marginTop: 6, fontSize: 12 }]}>Opens Swiggy&apos;s own results for {query || 'this dish'}. You order and pay in Swiggy; FitPlate never sees your payment.</Text>

        {range ? (
          <Text style={[k.muted, { textAlign: 'center', marginTop: 8 }]}>
            Usually ₹{range.min}–{range.max} a serving on Swiggy and Zomato, from FitPlate&apos;s price research.
          </Text>
        ) : null}

        <Section title="Order Here">
          <Text style={k.body}>Restaurants that deliver {query || 'this'}: coming soon.</Text>
          <Text style={[k.body, { marginTop: 6 }]}>Restaurants to dine in: coming soon.</Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  big: { alignItems: 'center', justifyContent: 'center', minHeight: 64, borderRadius: radius.lg, backgroundColor: '#FC8019', marginTop: 6 },
  bigTitle: { color: '#fff', fontWeight: '900', fontSize: 19 },
  bigSmall: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 11, marginTop: 1 },
});

