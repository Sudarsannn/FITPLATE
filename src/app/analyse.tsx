import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishImageSlot } from '../components/dishes/parts';
import { MacroSplitBar } from '../components/viz';
import { Chip, GradientButton } from '../components/ui';
import { Checkbox, k, Loading, Notice, SampleBanner, ScreenTop, Section } from '../components/vendors/kit';
import { useResearchDishes } from '../lib/useResearch';
import { useVendors } from '../lib/useVendors';
import type { Dish } from '../models/research';
import { headlineOrderPrice, totalMinutes } from '../services/dishLibrary';
import { dishCost } from '../services/vendors';
import { matchDish } from '../services/vendors/match';
import { openExternal, swiggySearchUrl } from '../services/vendors/openApp';
import { VendorError } from '../services/vendors/types';
import { colors, radius, type } from '../theme';

type Item = { key: string; name: string; qty: number; price: number | null; dish: Dish | null; choice: 'cook' | 'order' };

/**
 * "Analyse my Swiggy Checkout": a temporary page, one tab per item. Each tab is
 * a compact version of the dish page with Cook / Order tick boxes. Ordered items
 * go to Swiggy first (so they arrive while you cook), then the cook items go
 * through the shopping list and on to the multi-dish cooking plan.
 * Nothing here is saved; only the finished cook is logged, by the cook screens.
 */
export default function Analyse() {
  const { mode, food } = useVendors();
  const dishes = useResearchDishes();
  const [items, setItems] = useState<Item[]>([]);
  const [tab, setTab] = useState(0);
  const [stage, setStage] = useState<'start' | 'decide' | 'order'>('start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const add = (name: string, qty: number, price: number | null) => {
    const m = matchDish(name, dishes);
    setItems((cur) => [...cur, { key: `${name}-${cur.length}`, name, qty, price, dish: m?.dish ?? null, choice: m ? 'cook' : 'order' }]);
  };

  const readCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const st = await food.status();
      if (!st.connected) throw new VendorError('OTHER', 'Connect Swiggy first (Profile, Shopping & vendors), or add the dishes by hand below.');
      const addr = (await food.getAddresses())[0]?.id;
      if (!addr) throw new VendorError('OTHER', 'Add a delivery address in Swiggy first.');
      const cart = await food.getFoodCart(addr);
      if (!cart.lines.length) throw new VendorError('OTHER', 'Your Swiggy cart is empty. Add the dishes there, or add them by hand below.');
      setItems(
        cart.lines.map((l, n) => {
          const m = matchDish(l.name, dishes);
          return { key: `${l.itemId}-${n}`, name: l.name, qty: l.quantity, price: l.price, dish: m?.dish ?? null, choice: m ? 'cook' : 'order' } as Item;
        }),
      );
      setStage('decide');
    } catch (e) {
      setError(e instanceof VendorError ? e.message : 'Couldn’t read your Swiggy cart.');
    } finally {
      setLoading(false);
    }
  };

  const hits = q.trim().length > 1 ? dishes.filter((d) => d.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5) : [];
  const setChoice = (key: string, choice: Item['choice']) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, choice } : i)));
  const cook = items.filter((i) => i.choice === 'cook' && i.dish);
  const order = items.filter((i) => i.choice === 'order');

  const goShopping = () => {
    const ids = cook.map((i) => i.dish!.id);
    const servings = cook.map((i) => Math.min(8, Math.max(1, i.qty)));
    router.push({ pathname: '/basket', params: { dishes: ids.join(','), servings: servings.join(',') } });
  };
  const next = () => (order.length ? setStage('order') : goShopping());

  if (stage === 'order') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Order first" fallback="/analyse" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Notice tone="info">Order these first so they arrive while you cook. FitPlate never takes payment: you place the order in Swiggy.</Notice>
          <Section title="Open on Swiggy">
            {order.map((i) => (
              <View key={i.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <Text style={[k.strong, { flex: 1 }]}>
                  {i.qty} × {i.name}
                </Text>
                <Pressable onPress={() => openExternal(swiggySearchUrl(i.name))} accessibilityRole="link" style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.warm }}>
                  <Text style={{ color: '#1A1000', fontWeight: '800' }}>Swiggy</Text>
                </Pressable>
              </View>
            ))}
          </Section>
          {cook.length ? (
            <GradientButton title={`Next: shop for ${cook.length} dish${cook.length > 1 ? 'es' : ''} to cook`} onPress={goShopping} style={{ marginTop: 14 }} />
          ) : (
            <GradientButton title="Done" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 14 }} />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const cur = items[tab];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Analyse my Swiggy Checkout" subtitle="Decide what to cook and what to order" fallback="/(tabs)" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {mode === 'sample' ? <SampleBanner /> : null}
        {stage === 'start' ? (
          <>
            <Text style={[k.muted, { marginBottom: 10 }]}>Build your cart in Swiggy, then come back and tap below. FitPlate reads the cart (it never places an order here) and lines each dish up against its recipe.</Text>
            <GradientButton title="Read my Swiggy cart" onPress={readCart} />
            {loading ? <Loading label="Reading your cart…" /> : null}
            {error ? <Notice tone="warn">{error}</Notice> : null}
          </>
        ) : null}

        <Section title={stage === 'start' ? 'Or add dishes by hand' : 'Add another dish'}>
          <TextInput value={q} onChangeText={setQ} placeholder="Search a FitPlate dish" placeholderTextColor={colors.muted} style={{ color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12 }} />
          {hits.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => {
                add(d.name, 1, headlineOrderPrice(d)?.avg ?? null);
                setQ('');
                setStage('decide');
                setTab(items.length);
              }}
              style={{ paddingVertical: 10 }}
            >
              <Text style={k.strong}>+ {d.name}</Text>
            </Pressable>
          ))}
        </Section>

        {stage === 'decide' && items.length ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
              {items.map((i, n) => (
                <Chip key={i.key} label={i.name} icon={i.choice === 'cook' ? 'flame-outline' : 'bicycle-outline'} active={n === tab} onPress={() => setTab(n)} />
              ))}
            </ScrollView>
            {cur ? <Tab item={cur} onChoice={(c) => setChoice(cur.key, c)} /> : null}
            <Notice tone="info">
              {cook.length} to cook, {order.length} to order.
            </Notice>
            <GradientButton title={order.length ? 'Next: order on Swiggy' : cook.length ? 'Next: shop for ingredients' : 'Pick at least one'} onPress={next} disabled={!cook.length && !order.length} style={{ marginTop: 8 }} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/** A compact dish page for one cart item. The full recipe page is one tap away. */
function Tab({ item, onChoice }: { item: Item; onChoice: (c: Item['choice']) => void }) {
  const d = item.dish;
  const make = d ? dishCost(d, item.qty)?.inr ?? null : null;
  const swiggy = item.price != null ? item.price * item.qty : null;
  const saving = make != null && swiggy != null ? swiggy - make : null;
  return (
    <Animated.View key={item.key} entering={FadeInRight.duration(300)} style={{ marginTop: 6 }}>
      {d ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <DishImageSlot dish={d} size={84} label={false} />
          <View style={{ flex: 1, gap: 6 }}>
            <MacroSplitBar macros={d.nutritionPerServing} height={6} />
            {saving != null && saving > 0 ? (
              <View style={s.saveChip}>
                <Ionicons name="trending-down" size={13} color={colors.accent} />
                <Text style={s.saveText}>Cooking saves about ₹{Math.round(saving)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
      <Text style={[type.h2, { color: colors.text }]}>
        {item.qty} × {item.name}
      </Text>
      {d ? (
        <>
          <Text style={[k.muted, { marginTop: 4 }]}>
            {d.nutritionPerServing.kcal} kcal and {d.nutritionPerServing.proteinG} g protein a serving · about {totalMinutes(d)} min to cook
          </Text>
          <Text style={[k.muted, { marginTop: 2 }]}>
            {swiggy != null ? `Swiggy ₹${swiggy}` : 'Swiggy price not shown'}
            {make != null ? ` · about ₹${make} to make` : ''}
          </Text>
          <Pressable onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: d.id } })} accessibilityRole="link" style={{ marginTop: 6 }}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>Open the full dish page</Text>
          </Pressable>
        </>
      ) : (
        <Notice tone="warn">FitPlate has no recipe for this yet, so it can only go in the order list.</Notice>
      )}
      <View style={{ gap: 12, marginTop: 14 }}>
        <Pressable onPress={() => d && onChoice('cook')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, opacity: d ? 1 : 0.4 }}>
          <Checkbox on={item.choice === 'cook'} onPress={() => d && onChoice('cook')} label="Cook this myself" />
          <Text style={k.strong}>Cook it myself</Text>
        </Pressable>
        <Pressable onPress={() => onChoice('order')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Checkbox on={item.choice === 'order'} onPress={() => onChoice('order')} label="Order this on Swiggy" />
          <Text style={k.strong}>Order it on Swiggy</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  saveChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(61,220,132,0.12)' },
  saveText: { color: colors.accent, fontWeight: '800', fontSize: 12 },
});
