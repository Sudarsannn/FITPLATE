import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, GradientButton } from '../components/ui';
import { k, Loading, Notice, SampleBanner, ScreenTop, Section } from '../components/vendors/kit';
import { getDish } from '../data/research';
import { useStore } from '../lib/store';
import { useVendors } from '../lib/useVendors';
import { orderRange } from '../services/dishLibrary';
import { openExternal, SWIGGY_DINEOUT, swiggySearchUrl } from '../services/vendors/openApp';
import { VendorError, type MenuDish } from '../services/vendors/types';
import { colors, radius } from '../theme';

type Place = { id: string; name: string; price: number | null; rating: number | null; itemName: string };

/**
 * Order Instead: the restaurants that serve this dish, for delivery and for
 * dining in, each one a tap away from Swiggy itself. FitPlate never takes
 * the order or the payment; Swiggy does. "Cook it instead" stays a button
 * above. Dine-in listings arrive later (Swiggy Dineout), so that tab says so.
 */
export default function OrderInstead() {
  const { dish: dishId, q } = useLocalSearchParams<{ dish?: string; q?: string }>();
  const dish = dishId ? getDish(dishId) : undefined;
  const query = (dish?.name ?? q ?? '').trim();
  const { profile } = useStore();
  const { mode, food } = useVendors();
  const [tab, setTab] = useState<'online' | 'dinein'>('online');
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const range = dish ? orderRange(dish) : null;

  useEffect(() => {
    if (!query) return;
    let alive = true;
    (async () => {
      try {
        const st = await food.status();
        if (!alive) return;
        setConnected(st.connected);
        if (!st.connected) return;
        const addr = (await food.getAddresses())[0]?.id;
        if (!addr) throw new VendorError('OTHER', 'Add a delivery address in Swiggy first.');
        const items = await food.searchMenu(query, addr, profile.diet === 'veg');
        if (alive) setPlaces(byRestaurant(items));
      } catch (e) {
        if (alive) setError(e instanceof VendorError ? e.message : 'Swiggy search didn’t work just now.');
      }
    })();
    return () => {
      alive = false;
    };
  }, [query, mode, food, profile.diet]);

  const openSwiggy = (what: string) => openExternal(swiggySearchUrl(what));
  const sorted = useMemo(() => [...(places ?? [])].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)), [places]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Order Instead" subtitle={query || null} fallback="/cook" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {mode === 'sample' ? <SampleBanner what="restaurants and prices below" /> : null}

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

        {dish ? (
          <GradientButton title="🍳  Cook it instead" variant="glass" style={{ marginTop: 14 }} onPress={() => router.push({ pathname: '/order-vs-make', params: { q: query } })} />
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
          <Chip label="🛵 Delivery" active={tab === 'online'} onPress={() => setTab('online')} />
          <Chip label="🍽️ Dine-in" active={tab === 'dinein'} onPress={() => setTab('dinein')} />
        </View>

        {tab === 'online' ? (
          <Section title="Restaurants that deliver it">
            {connected === false ? (
              <>
                <Text style={k.body}>Connect Swiggy once to list the restaurants near you here.</Text>
                <GradientButton title="Open Shopping & vendors" onPress={() => router.push('/vendors')} style={{ marginTop: 10 }} />
              </>
            ) : error ? (
              <Notice tone="bad">{error}</Notice>
            ) : places === null ? (
              <Loading label="Asking Swiggy…" />
            ) : sorted.length === 0 ? (
              <Notice>No restaurants found for this dish nearby.</Notice>
            ) : (
              sorted.map((p) => (
                <Pressable key={p.id} onPress={() => openSwiggy(`${p.itemName} ${p.name}`)} style={s.row} accessibilityRole="button" accessibilityLabel={`${p.name}, open in Swiggy`}>
                  <View style={{ flex: 1 }}>
                    <Text style={k.strong}>{p.name}</Text>
                    <Text style={k.muted}>
                      {p.itemName}
                      {p.price != null ? ` · ₹${p.price}` : ''}
                      {p.rating ? ` · ★ ${p.rating}` : ''}
                    </Text>
                  </View>
                  <View style={s.go}>
                    <Text style={s.goText}>Swiggy</Text>
                    <Ionicons name="open-outline" size={14} color="#fff" />
                  </View>
                </Pressable>
              ))
            )}
          </Section>
        ) : (
          <Section title="Restaurants to eat at">
            <Text style={k.body}>Dine-in listings from Swiggy Dineout are coming later, so this list will fill in once that is connected.</Text>
            <GradientButton title="Look on Swiggy Dineout" variant="glass" style={{ marginTop: 10 }} onPress={() => openExternal(SWIGGY_DINEOUT)} />
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** One row per restaurant: its cheapest listing of the dish. */
function byRestaurant(items: MenuDish[]): Place[] {
  const best = new Map<string, Place>();
  for (const m of items) {
    const cur = best.get(m.restaurantId);
    if (!cur || (m.price ?? Infinity) < (cur.price ?? Infinity)) best.set(m.restaurantId, { id: m.restaurantId, name: m.restaurantName, price: m.price, rating: m.rating, itemName: m.name });
  }
  return [...best.values()];
}

const s = StyleSheet.create({
  big: { alignItems: 'center', justifyContent: 'center', minHeight: 64, borderRadius: radius.lg, backgroundColor: '#FC8019', marginTop: 6 },
  bigTitle: { color: '#fff', fontWeight: '900', fontSize: 19 },
  bigSmall: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 11, marginTop: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  go: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, minHeight: 32, borderRadius: radius.pill, backgroundColor: '#FC8019' },
  goText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});

