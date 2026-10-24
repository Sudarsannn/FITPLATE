import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BillRows, k, Loading, Notice, Radio, SampleBanner, ScreenTop, Section } from '../components/vendors/kit';
import { Chip, GradientButton } from '../components/ui';
import { useStore } from '../lib/store';
import { useResearchDishes } from '../lib/useResearch';
import { useVendors } from '../lib/useVendors';
import type { Dish } from '../models/research';
import { headlineOrderPrice, totalMinutes } from '../services/dishLibrary';
import { dishCost } from '../services/vendors';
import { orderInsights, type OrderInsight } from '../services/vendors/insights';
import { matchDish } from '../services/vendors/match';
import { VendorError, type FoodCart, type MenuDish, type PaymentMethod, type Restaurant } from '../services/vendors/types';
import { colors, radius, type } from '../theme';

/**
 * Priority plan P3c / PDF section 8: Swiggy Food "Cook it instead".
 * Search a dish (search_menu, veg-only when that's the user's diet) or browse
 * a restaurant's menu; each result has "Cook it instead", which matches it to
 * a FitPlate recipe and shows order vs make side by side. "Start cooking"
 * goes to the shopping list; "Order anyway" builds the Swiggy cart and stops
 * at the confirmation screen unless real orders are on. Only the FitPlate
 * dish id the user picks is ever kept, never Swiggy's menu data.
 */
/** Quick searches for lighter orders (Swiggy returns no calories, so FitPlate's own research does the judging once a dish is matched). */
const HEALTHY_SEARCHES = [
  { label: '🥗 Salad', q: 'salad', nonVeg: false },
  { label: '🍲 Dal & roti', q: 'dal', nonVeg: false },
  { label: '🍗 Grilled', q: 'grilled', nonVeg: true },
  { label: '🥚 Egg dishes', q: 'egg', nonVeg: true },
];

export default function OrderVsMake() {
  const params = useLocalSearchParams<{ q?: string }>();
  const store = useStore();
  const dishes = useResearchDishes();
  const { mode, food, ordersLive } = useVendors();
  const [query, setQuery] = useState(params.q ?? '');
  const [vegOnly, setVegOnly] = useState(store.profile.diet === 'veg');
  const [view, setView] = useState<'search' | 'restaurants'>('search');
  const [results, setResults] = useState<MenuDish[] | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<MenuDish | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [insights, setInsights] = useState<OrderInsight[] | null>(null);
  const [cartCmp, setCartCmp] = useState<CartCompare | 'empty' | null>(null);

  const addressId = async () => (await food.getAddresses())[0]?.id ?? null;

  const run = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setPicked(null);
    try {
      const st = await food.status();
      setConnected(st.connected);
      if (!st.connected) return;
      const addr = await addressId();
      if (!addr) throw new VendorError('OTHER', 'Add a delivery address in Swiggy first.');
      setResults(await food.searchMenu(q.trim(), addr, vegOnly));
    } catch (e) {
      setError(e instanceof VendorError ? e.message : 'Swiggy search didn’t work just now.');
    } finally {
      setLoading(false);
    }
  };

  // Search straight away when opened with a dish name.
  useEffect(() => {
    if (!params.q) return;
    const t = setTimeout(() => run(params.q!), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, mode]);

  // Order-history insights, only with the user's permission.
  const consent = store.settings.swiggyOrderInsights;
  useEffect(() => {
    if (!consent) return;
    let alive = true;
    food
      .getFoodOrders()
      .then((orders) => alive && setInsights(orderInsights(orders, dishes, (d) => dishCost(d, 1)?.inr ?? null, Date.now())))
      .catch(() => alive && setInsights([]));
    return () => {
      alive = false;
    };
  }, [consent, food, dishes]);

  const browse = async () => {
    setView('restaurants');
    setLoading(true);
    setError(null);
    try {
      const addr = await addressId();
      if (!addr) throw new VendorError('OTHER', 'Add a delivery address in Swiggy first.');
      setRestaurants(await food.searchRestaurants(query.trim() || 'north indian', addr));
    } catch (e) {
      setError(e instanceof VendorError ? e.message : 'Couldn’t load restaurants.');
    } finally {
      setLoading(false);
    }
  };

  /** Reads the Swiggy Food cart (get_food_cart) and lines each dish up against its FitPlate recipe. */
  const compareCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const st = await food.status();
      setConnected(st.connected);
      if (!st.connected) return;
      const addr = await addressId();
      if (!addr) throw new VendorError('OTHER', 'Add a delivery address in Swiggy first.');
      const cart = await food.getFoodCart(addr);
      if (!cart.lines.length) return setCartCmp('empty');
      const rows = cart.lines.map((l) => {
        const m = matchDish(l.name, dishes);
        const c = m ? dishCost(m.dish, l.quantity) : null;
        return { line: l, dish: m?.dish ?? null, make: c?.inr ?? null };
      });
      setCartCmp({ restaurant: cart.restaurantName, rows, toPay: cart.toPay });
    } catch (e) {
      setError(e instanceof VendorError ? e.message : 'Couldn’t read your Swiggy cart.');
    } finally {
      setLoading(false);
    }
  };

  const openMenu = async (r: Restaurant) => {
    setLoading(true);
    try {
      const addr = await addressId();
      if (addr) setResults(await food.getRestaurantMenu(r.id, addr));
      setView('search');
    } catch (e) {
      setError(e instanceof VendorError ? e.message : 'Couldn’t load that menu.');
    } finally {
      setLoading(false);
    }
  };

  if (picked) return <Compare item={picked} dishes={dishes} onBack={() => setPicked(null)} mode={mode} ordersLive={ordersLive} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Cook it instead" subtitle="About to order? See what cooking it costs" fallback="/(tabs)" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {mode === 'sample' ? <SampleBanner what="restaurants, menus and prices" /> : null}
        <View style={s.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => run(query)}
            placeholder="A dish you’d order, e.g. paneer butter masala"
            placeholderTextColor={colors.faint}
            style={s.input}
            returnKeyType="search"
            accessibilityLabel="Search a dish on Swiggy"
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <Chip label="Search dishes" active={view === 'search'} onPress={() => run(query)} />
          <Chip label="Browse restaurants" active={view === 'restaurants'} onPress={browse} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <Text style={k.muted}>Veg only</Text>
            <Switch value={vegOnly} onValueChange={setVegOnly} accessibilityLabel="Veg only" />
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {HEALTHY_SEARCHES.filter((h) => !h.nonVeg || !vegOnly).map((h) => (
            <Chip
              key={h.q}
              label={h.label}
              active={false}
              onPress={() => {
                setQuery(h.q);
                run(h.q);
              }}
            />
          ))}
        </View>

        <Section title="Already have a Swiggy cart?">
          <Text style={k.body}>Build your cart in Swiggy, then come back and compare it with cooking the same dishes.</Text>
          <GradientButton title="🛒  Compare my Swiggy cart" onPress={compareCart} style={{ marginTop: 10 }} />
          {mode === 'sample' ? <Text style={[k.muted, { marginTop: 6, fontSize: 12 }]}>Sample mode has no real cart. Search a dish below, tap Cook it instead, then Order anyway to put one in the sample cart (nothing is bought).</Text> : null}
          {cartCmp === 'empty' ? <Notice>Your Swiggy cart is empty right now.</Notice> : null}
          {cartCmp && cartCmp !== 'empty' ? <CartResult c={cartCmp} /> : null}
        </Section>

        {connected === false ? (
          <Section title="Connect Swiggy">
            <Text style={k.body}>Connect your Swiggy account once to search live menus near you.</Text>
            <GradientButton title="Open Shopping & vendors" onPress={() => router.push('/vendors')} style={{ marginTop: 10 }} />
          </Section>
        ) : null}
        {error ? <Notice tone="bad">{error}</Notice> : null}
        {loading ? <Loading label="Asking Swiggy…" /> : null}

        {view === 'restaurants' && restaurants ? (
          <Section title="Restaurants near you">
            {restaurants.map((r) => (
              <Pressable key={r.id} onPress={() => openMenu(r)} style={s.row} accessibilityRole="button">
                <View style={{ flex: 1 }}>
                  <Text style={k.strong}>{r.name}</Text>
                  <Text style={k.muted}>
                    {r.open ? 'Open' : 'Closed'}
                    {r.etaMin ? ` · ${r.etaMin} min` : ''}
                    {r.rating ? ` · ★ ${r.rating}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </Section>
        ) : null}

        {view === 'search' && results ? (
          <View style={{ marginTop: 10 }}>
            {results.length === 0 ? <Notice>No dishes found. Try another name.</Notice> : null}
            {results.map((m) => {
              const match = matchDish(m.name, dishes, m.veg);
              return (
                <View key={`${m.restaurantId}-${m.itemId}`} style={s.card}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[s.veg, { borderColor: m.veg === false ? colors.bad : colors.accent }]}>
                      <View style={[s.vegDot, { backgroundColor: m.veg === false ? colors.bad : colors.accent }]} />
                    </View>
                    <Text style={[k.strong, { flex: 1 }]}>{m.name}</Text>
                    {m.bestseller ? (
                      <View style={k.pill}>
                        <Text style={k.pillText}>Bestseller</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={k.muted}>
                    {m.restaurantName}
                    {m.price != null ? ` · ₹${m.price}` : ''}
                    {m.rating ? ` · ★ ${m.rating}${m.ratingCount ? ` (${m.ratingCount})` : ''}` : ''}
                  </Text>
                  {match ? (
                    <Text style={[k.muted, { fontSize: 12, color: colors.accent }]}>
                      FitPlate has this recipe{dishCost(match.dish, 1) ? ` · about ₹${dishCost(match.dish, 1)!.inr} a serving to make` : ''}
                    </Text>
                  ) : null}
                  {m.sizes.length || m.addons.length ? <Text style={[k.muted, { fontSize: 12 }]}>{[...m.sizes, ...m.addons].slice(0, 4).join(' · ')}</Text> : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
                    <Pressable onPress={() => setPicked(m)} style={[s.cook, !match && { opacity: 0.5 }]} disabled={!match} accessibilityRole="button">
                      <Text style={{ color: '#06210F', fontWeight: '900' }}>🍳 Cook it instead</Text>
                    </Pressable>
                    {!match ? <Text style={[k.muted, { flex: 1, fontSize: 12 }]}>No FitPlate recipe for this one yet.</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <Section title="Your ordering habits">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[k.body, { flex: 1 }]}>Let FitPlate look at your recent Swiggy food orders to show what cooking would have saved. Nothing from them is saved.</Text>
            <Switch value={consent} onValueChange={(v) => store.updateSettings({ swiggyOrderInsights: v })} accessibilityLabel="Use my Swiggy order history" />
          </View>
          {consent && insights === null ? <Loading label="Reading your orders…" /> : null}
          {consent && insights?.length === 0 ? <Text style={[k.muted, { marginTop: 8 }]}>No dishes with a FitPlate recipe in your last 30 days of orders.</Text> : null}
          {consent && insights
            ? insights.slice(0, 3).map((x) => (
                <Pressable key={x.dish.id} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: x.dish.id } })} style={s.insight} accessibilityRole="button">
                  <Text style={k.body}>
                    You ordered <Text style={k.strong}>{x.dish.name}</Text> {x.times} {x.times === 1 ? 'time' : 'times'} this month
                    {x.couldSave ? (
                      <>
                        . Cooking it would have saved about <Text style={{ color: colors.accent, fontWeight: '900' }}>₹{x.couldSave}</Text>.
                      </>
                    ) : (
                      '.'
                    )}
                  </Text>
                </Pressable>
              ))
            : null}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

type CartCompare = { restaurant: string; rows: { line: FoodCart['lines'][number]; dish: Dish | null; make: number | null }[]; toPay: number | null };

/** The cart next to what cooking those dishes would cost, with a way into the shopping list. */
function CartResult({ c }: { c: CartCompare }) {
  const matched = c.rows.filter((r) => r.dish);
  const makeTotal = matched.reduce((t, r) => t + (r.make ?? 0), 0);
  const swiggyMatched = matched.reduce((t, r) => t + (r.line.price ?? 0) * r.line.quantity, 0);
  const ids = matched.map((r) => r.dish!.id);
  const servings = matched.map((r) => Math.min(8, Math.max(1, r.line.quantity)));
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={k.strong}>{c.restaurant}</Text>
      {c.rows.map((r, i) => (
        <View key={`${r.line.itemId}-${i}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 4 }}>
          <Text style={[k.muted, { flex: 1 }]}>
            {r.line.quantity} × {r.line.name}
            {r.dish ? '' : ' (no FitPlate recipe yet)'}
          </Text>
          <Text style={k.muted}>
            {r.line.price != null ? `₹${r.line.price * r.line.quantity}` : '–'}
            {r.make != null ? ` → ₹${r.make} to make` : ''}
          </Text>
        </View>
      ))}
      {c.toPay != null ? <Text style={k.muted}>Swiggy total with delivery and taxes: ₹{c.toPay}</Text> : null}
      {matched.length ? (
        <>
          <Text style={[k.strong, { marginTop: 6, color: colors.accent }]}>
            {swiggyMatched > makeTotal ? `Cooking ${matched.length === c.rows.length ? 'these' : 'the dishes with recipes'} saves about ₹${swiggyMatched - makeTotal}.` : 'Cooking costs about the same as ordering.'}
          </Text>
          <GradientButton title="🍳  Start cooking these" onPress={() => router.push({ pathname: '/basket', params: { dishes: ids.join(','), servings: servings.join(',') } })} style={{ marginTop: 8 }} />
        </>
      ) : null}
    </View>
  );
}

function Compare({ item, dishes, onBack, mode, ordersLive }: { item: MenuDish; dishes: readonly Dish[]; onBack: () => void; mode: 'sample' | 'live'; ordersLive: boolean }) {
  const { food } = useVendors();
  const { logDish } = useStore();
  const [servings, setServings] = useState(1);
  const [bill, setBill] = useState<FoodCart | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [method, setMethod] = useState<string | null>(null);
  const [step, setStep] = useState<'compare' | 'order' | 'placed'>('compare');
  const [error, setError] = useState<string | null>(null);
  const match = matchDish(item.name, dishes, item.veg);
  if (!match) return null;
  const dish = match.dish;
  const cost = dishCost(dish, servings);
  const research = headlineOrderPrice(dish);
  const asOrderedKcal = dish.asOrdered?.nutrition?.calories?.value ?? null;
  const n = dish.nutritionPerServing;
  const swiggyPrice = item.price != null ? item.price * servings : null;
  const orderTotal = bill?.toPay ?? swiggyPrice;
  const saving = cost && orderTotal != null ? Math.round(orderTotal - cost.inr) : null;
  const mins = totalMinutes(dish);

  const seeBill = async () => {
    setError(null);
    try {
      const addr = (await food.getAddresses())[0]?.id;
      if (!addr) throw new VendorError('OTHER', 'Add a delivery address in Swiggy first.');
      setBill(await food.updateFoodCart(addr, item.restaurantId, [{ itemId: item.itemId, quantity: servings }]));
      const ms = await food.getPaymentOptions(addr).catch(() => []);
      setMethods(ms);
      setMethod(ms.find((m) => m.kind === 'cod')?.id ?? ms[0]?.id ?? null);
      setStep('order');
    } catch (e) {
      setError(e instanceof VendorError ? e.message : 'Couldn’t get the full bill.');
    }
  };

  const place = async () => {
    if (!method) return;
    setError(null);
    try {
      const addr = (await food.getAddresses())[0]?.id;
      if (!addr) return;
      const placed = await food.placeFoodOrder(addr, method);
      if (placed.status === 'pending-payment') {
        // Sample mode and cash need no UPI hop; live UPI pays in the user's UPI app.
        if ((await food.checkPaymentStatus(placed.orderId)) === 'success') await food.confirmOrder(placed.orderId);
      }
      // Only real orders go into My Meals; sample mode's pretend orders never do.
      if (mode === 'live') logDish(dish, 'ordered', bill?.toPay ?? swiggyPrice);
      setStep('placed');
    } catch (e) {
      setError(e instanceof VendorError ? e.message : 'The order didn’t go through.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.top}>
        <Pressable onPress={onBack} style={s.back} accessibilityRole="button" accessibilityLabel="Back to results">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[type.h2, { color: colors.text, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          Order vs make
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        {mode === 'sample' ? <SampleBanner what="restaurant prices" /> : null}
        <Text style={[k.muted, { marginTop: 8 }]}>
          {item.name} from {item.restaurantName} → FitPlate’s {dish.name}
          {match.how === 'words' ? ' (closest recipe)' : ''}
        </Text>
        <View style={s.servings}>
          <Text style={[k.strong, { flex: 1 }]}>Servings</Text>
          {[1, 2, 3, 4].map((v) => (
            <Chip key={v} label={String(v)} active={servings === v} onPress={() => {
              setServings(v);
              setBill(null);
              setStep('compare');
            }} />
          ))}
        </View>

        <View style={s.grid}>
          <View style={[s.col, { borderColor: colors.warm }]}>
            <Text style={[type.label, { color: colors.warm }]}>Order</Text>
            <Big value={orderTotal != null ? `₹${orderTotal}` : '—'} label={bill ? 'full bill on Swiggy' : 'Swiggy menu price'} />
            <Big value={asOrderedKcal != null ? `${Math.round(asOrderedKcal)}` : '—'} label="kcal a serving, as ordered" />
            <Big value={'30–45 min'} label="delivery" />
            {research ? <Text style={[k.muted, { fontSize: 11, marginTop: 6 }]}>Research: usually ₹{research.min}–{research.max} a serving.</Text> : null}
          </View>
          <View style={[s.col, { borderColor: colors.accent }]}>
            <Text style={[type.label, { color: colors.accent }]}>Make</Text>
            <Big value={cost ? `₹${cost.inr}` : '—'} label={cost && cost.coveragePct < 100 ? `ingredients (${cost.coveragePct}% priced)` : 'ingredients'} />
            <Big value={n.kcal != null ? `${Math.round(n.kcal)}` : '—'} label="kcal a serving, home-cooked" />
            <Big value={mins ? `${mins} min` : '—'} label={`${dish.difficulty ?? 'easy'} to make`} />
          </View>
        </View>
        {saving != null && saving > 0 ? (
          <Notice tone="ok">
            Cooking saves about <Text style={{ fontWeight: '900' }}>₹{saving}</Text>
            {asOrderedKcal != null && n.kcal != null && asOrderedKcal > n.kcal ? ` and ${Math.round(asOrderedKcal - n.kcal)} kcal a serving` : ''}.
          </Notice>
        ) : null}
        {error ? <Notice tone="bad">{error}</Notice> : null}

        {step === 'compare' ? (
          <>
            <GradientButton title="Start cooking" onPress={() => router.push({ pathname: '/basket', params: { dishes: dish.id, servings: String(servings) } })} style={{ marginTop: 16 }} />
            <GradientButton title="Order anyway" variant="glass" onPress={seeBill} style={{ marginTop: 10 }} />
          </>
        ) : null}

        {step === 'order' && bill ? (
          <>
            <Section title={`Your Swiggy order · ${bill.restaurantName}`}>
              {bill.lines.map((l) => (
                <Text key={l.itemId} style={k.body}>
                  {l.quantity} × {l.name}
                  {l.price != null ? <Text style={k.muted}>{`  ₹${l.price * l.quantity}`}</Text> : null}
                </Text>
              ))}
              <View style={{ marginTop: 8 }}>
                <BillRows rows={bill.bill} total={bill.toPay} />
              </View>
            </Section>
            <Section title="Pay with">
              {methods.map((m) => (
                <Pressable key={m.id} onPress={() => setMethod(m.id)} style={s.row} accessibilityRole="radio" accessibilityState={{ checked: method === m.id }}>
                  <Radio on={method === m.id} />
                  <Text style={k.body}>{m.label}</Text>
                </Pressable>
              ))}
            </Section>
            {mode === 'live' && !ordersLive ? <Notice tone="warn">Real orders are switched off, so this is where the flow stops.</Notice> : null}
            <GradientButton title={`Place order${bill.toPay != null ? ` · ₹${bill.toPay}` : ''}`} onPress={place} disabled={!method || (mode === 'live' && !ordersLive)} style={{ marginTop: 14 }} />
            <Text style={[k.muted, { textAlign: 'center', marginTop: 6 }]}>{mode === 'sample' ? 'Sample order: nothing is bought.' : 'This places a real Swiggy order. It can’t be cancelled.'}</Text>
          </>
        ) : null}

        {step === 'placed' ? (
          <Section title="Order placed">
            <Text style={k.body}>Enjoy your meal. Next time, {dish.name} at home would cost about ₹{cost?.inr ?? '—'}.</Text>
            <GradientButton title="Back to Today" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 10 }} />
          </Section>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Big({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{value}</Text>
      <Text style={[k.muted, { fontSize: 12 }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, minHeight: 46, color: colors.text, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 6 },
  card: { padding: 14, marginBottom: 8, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  veg: { width: 16, height: 16, borderWidth: 1.5, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  vegDot: { width: 7, height: 7, borderRadius: 4 },
  cook: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  insight: { paddingVertical: 10, borderTopWidth: 1, borderColor: colors.border, marginTop: 8 },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  servings: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  grid: { flexDirection: 'row', gap: 10, marginTop: 14 },
  col: { flex: 1, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1.5 },
});
