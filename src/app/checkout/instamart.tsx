import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BillRows, k, Loading, Notice, Radio, SampleBanner, ScreenTop, Section } from '../../components/vendors/kit';
import { GradientButton, PressableScale } from '../../components/ui';
import { success } from '../../lib/haptics';
import { useStore } from '../../lib/store';
import { useVendors } from '../../lib/useVendors';
import { pickProduct } from '../../services/vendors/basket';
import { PAYMENT_CHECK_GAP_MS, PAYMENT_CHECKS } from '../../services/vendors/config';
import { openExternal } from '../../services/vendors/openApp';
import { VendorError, type Address, type Cart, type Coupon, type InstamartApi, type PaymentMethod, type VendorProduct } from '../../services/vendors/types';
import { colors, radius, type } from '../../theme';

type Phase = 'checking' | 'connect' | 'address' | 'building' | 'confirm' | 'placing' | 'paying' | 'error';

const describe = (e: unknown): string => {
  if (e instanceof VendorError) {
    if (e.code === 'RATE_LIMIT') return 'Swiggy asked FitPlate to slow down. Wait a minute and try again.';
    if (e.code === 'AUTH') return 'Swiggy signed you out. Connect Swiggy again.';
    if (e.code === 'NOT_LIVE') return 'Real orders are switched off, so the flow stops at the confirmation screen.';
    return e.message;
  }
  return 'Something went wrong talking to Swiggy. Try again.';
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Priority plan P3a/P3b: Swiggy Instamart full-basket checkout.
 * Connect Swiggy once → address → the whole basket into the cart (update_cart
 * replaces it, so the full list is always sent) → confirmation screen with
 * the bill, coupons and any problems → an explicit "Place order" tap →
 * UPI or cash → back in FitPlate: payment check, confirm, tracking.
 */
export default function InstamartCheckout() {
  const { list: listId } = useLocalSearchParams<{ list: string }>();
  const store = useStore();
  const { mode, im, ordersLive, server } = useVendors();
  const list = store.shoppingLists.find((l) => l.id === listId);
  const items = (list?.items ?? []).filter((i) => i.included);

  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [choices, setChoices] = useState<Record<string, { product: VendorProduct | null; quantity: number; results: VendorProduct[] }>>({});
  const [cart, setCart] = useState<Cart | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [method, setMethod] = useState<string | null>(null);
  const [picker, setPicker] = useState<string | null>(null);
  const [order, setOrder] = useState<{ orderId: string; paymentUrl: string | null; toPay: number | null } | null>(null);
  const [fakeUpi, setFakeUpi] = useState(false);
  const busy = useRef(false);

  const fail = (e: unknown) => {
    setError(describe(e));
    if (e instanceof VendorError && e.code === 'AUTH') setPhase('connect');
    else setPhase('error');
  };

  const sendCart = useCallback(
    async (api: InstamartApi, addr: string, next: typeof choices) => {
      const lines = Object.values(next)
        .filter((c) => c.product && c.quantity > 0)
        .map((c) => ({ skuId: c.product!.skuId, quantity: c.quantity }));
      const c = await api.updateCart(addr, lines);
      setCart(c);
      return c;
    },
    [],
  );

  const build = useCallback(
    async (addr: string) => {
      setPhase('building');
      try {
        const next: typeof choices = {};
        for (const item of items) {
          const results = await im.searchProducts(item.name, addr);
          next[item.key] = { product: pickProduct(item, results), quantity: 1, results };
        }
        setChoices(next);
        await sendCart(im, addr, next);
        const [cs, ms] = await Promise.all([im.listCoupons(addr).catch(() => []), im.getPaymentOptions(addr).catch(() => [])]);
        setCoupons(cs);
        setMethods(ms);
        setMethod((m) => m ?? ms.find((x) => x.kind === 'upi')?.id ?? ms[0]?.id ?? null);
        setPhase('confirm');
      } catch (e) {
        fail(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [im, listId, sendCart],
  );

  const start = useCallback(async () => {
    try {
      const { connected } = await im.status();
      setError(null);
      if (!connected) return setPhase('connect');
      const list = await im.getAddresses();
      setAddresses(list);
      if (list.length === 0) return setPhase('address');
      if (list.length > 1) {
        setAddressId(list[0].id);
        return setPhase('address');
      }
      setAddressId(list[0].id);
      await build(list[0].id);
    } catch (e) {
      fail(e);
    }
  }, [im, build]);

  // Start once per screen visit and vendor mode (after this render, not inside it).
  const hasList = Boolean(list);
  useEffect(() => {
    if (!hasList) return;
    const t = setTimeout(start, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, listId, hasList]);

  const connect = async () => {
    const back = Platform.OS === 'web' ? window.location.href : Linking.createURL(`/checkout/instamart?list=${listId}`);
    const url = im.connectUrl(back);
    if (!url) return start();
    if (Platform.OS === 'web') {
      window.location.href = url;
      return;
    }
    await WebBrowser.openAuthSessionAsync(url, back);
    start();
  };

  const change = async (key: string, patch: Partial<{ product: VendorProduct | null; quantity: number }>) => {
    if (!addressId) return;
    const next = { ...choices, [key]: { ...choices[key], ...patch } };
    setChoices(next);
    try {
      await sendCart(im, addressId, next);
    } catch (e) {
      fail(e);
    }
  };

  const finish = (orderId: string) => {
    success();
    if (list) store.saveShoppingList({ ...list, status: 'ordered', boughtVia: 'instamart', orderedAt: Date.now(), items: list.items.map((i) => ({ ...i, checked: i.included })) }, list.id);
    router.replace({ pathname: '/checkout/track', params: { order: orderId, list: listId ?? '', mode } });
  };

  // After the UPI app: check the payment a few times (never in a tight loop), then confirm.
  const verifyPayment = useCallback(
    async (orderId: string) => {
      if (busy.current) return;
      busy.current = true;
      try {
        for (let i = 0; i < PAYMENT_CHECKS; i++) {
          const st = await im.checkPaymentStatus(orderId);
          if (st === 'success') {
            await im.confirmOrder(orderId);
            return finish(orderId);
          }
          if (st === 'failed') {
            setError('The payment didn’t go through. Nothing was charged by FitPlate. You can try again or pick cash on delivery.');
            setPhase('confirm');
            return;
          }
          await sleep(PAYMENT_CHECK_GAP_MS);
        }
        setError('Still waiting for the payment. If you paid, tap “I’ve paid” again in a moment.');
      } catch (e) {
        fail(e);
      } finally {
        busy.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [im],
  );

  useEffect(() => {
    if (phase !== 'paying' || !order) return;
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') verifyPayment(order.orderId);
    });
    return () => sub.remove();
  }, [phase, order, verifyPayment]);

  const place = async () => {
    if (!addressId || !method || !cart) return;
    setPhase('placing');
    setError(null);
    let placed;
    try {
      placed = await im.checkout(addressId, method);
    } catch (e) {
      // Never retry checkout after a server error without checking orders first.
      if (e instanceof VendorError && e.code === 'SERVER') {
        const recent = (await im.getOrders().catch(() => [])).find((o) => o.placedAt != null && Date.now() - o.placedAt < 10 * 60_000);
        if (recent) placed = { orderId: recent.orderId, status: 'placed' as const, paymentUrl: null, toPay: recent.toPay };
        else {
          setError('Swiggy had a problem placing the order. Check the Swiggy app before trying again, so you don’t order twice.');
          setPhase('confirm');
          return;
        }
      } else {
        setError(describe(e));
        setPhase('confirm');
        return;
      }
    }
    setOrder(placed);
    const kind = methods.find((m) => m.id === method)?.kind;
    if (placed.status === 'placed' || kind === 'cod') return finish(placed.orderId);
    setPhase('paying');
    if (placed.paymentUrl === 'sample://upi') return setFakeUpi(true);
    if (placed.paymentUrl) {
      const ok = await openExternal(placed.paymentUrl);
      if (!ok) setError('UPI opens in a UPI app on your phone. On this computer, go back and choose cash on delivery.');
    }
  };

  if (!list) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Swiggy Instamart" fallback="/cook" />
        <View style={{ padding: 20 }}>
          <Notice tone="warn">This shopping list isn’t on this device yet. Open it again from the dish.</Notice>
        </View>
      </SafeAreaView>
    );
  }

  const blocking = cart?.issues.some((i) => i.code === 'MIN_ORDER_NOT_MET' || i.code === 'ADDRESS_NOT_SERVICEABLE') ?? true;
  const canPlace = phase === 'confirm' && !!method && !!cart && !blocking && (mode === 'sample' || ordersLive);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Swiggy Instamart" subtitle={list.title} fallback="/cook" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 160 }}>
        {mode === 'sample' ? <SampleBanner /> : null}
        {error ? <Notice tone="bad">{error}</Notice> : null}

        {phase === 'checking' ? <Loading label="Opening Swiggy…" /> : null}

        {phase === 'connect' ? (
          <Section title="Connect Swiggy once">
            <Text style={k.body}>A Swiggy page asks for your phone number and the OTP, then brings you back here. FitPlate never sees your Swiggy password or payment details.</Text>
            {mode === 'live' && server && !server.running ? <Notice tone="warn">The FitPlate server on this computer isn’t running. Start it with `npm run server`, then try again.</Notice> : null}
            <GradientButton title="Connect Swiggy" onPress={connect} style={{ marginTop: 12 }} />
          </Section>
        ) : null}

        {phase === 'address' ? (
          <Section title="Deliver to">
            {addresses.map((a) => (
              <Pressable key={a.id} onPress={() => setAddressId(a.id)} style={s.row} accessibilityRole="radio" accessibilityState={{ checked: addressId === a.id }}>
                <Radio on={addressId === a.id} />
                <View style={{ flex: 1 }}>
                  <Text style={k.strong}>{a.label}</Text>
                  <Text style={k.muted}>{a.line}</Text>
                </View>
              </Pressable>
            ))}
            {addresses.length === 0 ? (
              <>
                <Text style={k.body}>Swiggy has no saved address for you yet. Type your delivery address:</Text>
                <TextInput value={newAddress} onChangeText={setNewAddress} placeholder="Flat, building, street, area, city" placeholderTextColor={colors.faint} style={s.input} multiline />
                <GradientButton
                  title="Save address"
                  disabled={newAddress.trim().length < 8}
                  onPress={async () => {
                    try {
                      const a = await im.createAddress(newAddress.trim());
                      setAddresses([a]);
                      setAddressId(a.id);
                      await build(a.id);
                    } catch (e) {
                      fail(e);
                    }
                  }}
                  style={{ marginTop: 10 }}
                />
              </>
            ) : (
              <GradientButton title="Use this address" disabled={!addressId} onPress={() => addressId && build(addressId)} style={{ marginTop: 10 }} />
            )}
          </Section>
        ) : null}

        {phase === 'building' ? <Loading label={`Finding ${items.length} items at your address…`} /> : null}

        {cart && (phase === 'confirm' || phase === 'placing' || phase === 'paying') ? (
          <>
            {cart.issues.map((iss, n) => (
              <Notice key={`${iss.code}-${n}`} tone={iss.code === 'OUT_OF_STOCK' ? 'warn' : 'bad'}>
                {iss.message}
              </Notice>
            ))}

            <Section title={`Your basket (${cart.lines.length})`}>
              {items.map((item) => {
                const c = choices[item.key];
                const line = c?.product ? cart.lines.find((l) => l.skuId === c.product!.skuId) : undefined;
                return (
                  <View key={item.key} style={s.line}>
                    <View style={{ flex: 1 }}>
                      <Text style={k.muted}>{item.name}</Text>
                      {c?.product ? (
                        <>
                          <Text style={k.strong}>
                            {c.product.brand ?? c.product.name} · {c.product.packSize ?? 'pack'}
                          </Text>
                          <Text style={k.muted}>
                            {c.product.offerPrice != null ? `₹${c.product.offerPrice}` : 'price on Swiggy'}
                            {c.product.mrp && c.product.offerPrice && c.product.mrp > c.product.offerPrice ? `  (MRP ₹${c.product.mrp})` : ''}
                            {c.product.etaMin ? ` · ${c.product.etaMin} min` : ''}
                            {line && !line.inStock ? ' · out of stock' : ''}
                          </Text>
                        </>
                      ) : (
                        <Text style={[k.muted, { color: colors.warn }]}>Not found at this address</Text>
                      )}
                      <Pressable onPress={() => setPicker(item.key)} hitSlop={6} accessibilityRole="button">
                        <Text style={s.link}>{c?.results.length ? 'Change brand or pack' : 'Search again'}</Text>
                      </Pressable>
                    </View>
                    {c?.product ? (
                      <View style={s.qty}>
                        <PressableScale onPress={() => change(item.key, { quantity: Math.max(0, c.quantity - 1) })} style={s.qtyBtn} accessibilityLabel={`One less ${item.name}`}>
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </PressableScale>
                        <Text style={{ color: colors.text, fontWeight: '800', minWidth: 18, textAlign: 'center' }}>{c.quantity}</Text>
                        <PressableScale
                          onPress={() => change(item.key, { quantity: Math.min(c.product?.purchaseCap ?? 9, c.quantity + 1) })}
                          style={s.qtyBtn}
                          accessibilityLabel={`One more ${item.name}`}
                        >
                          <Ionicons name="add" size={16} color={colors.text} />
                        </PressableScale>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </Section>

            {coupons.length ? (
              <Section title="Coupons">
                {coupons.map((c) => (
                  <View key={c.code} style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={k.strong}>{c.code}</Text>
                      <Text style={k.muted}>{c.description}</Text>
                    </View>
                    {cart.appliedCoupon === c.code ? (
                      <Text style={{ color: colors.accent, fontWeight: '800' }}>Applied</Text>
                    ) : (
                      <Pressable
                        disabled={!c.applicable || !addressId}
                        onPress={async () => {
                          try {
                            setCart(await im.applyCoupon(addressId!, c.code));
                          } catch (e) {
                            setError(describe(e));
                          }
                        }}
                        style={[s.apply, !c.applicable && { opacity: 0.4 }]}
                        accessibilityRole="button"
                      >
                        <Text style={{ color: '#06210F', fontWeight: '900' }}>Apply</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </Section>
            ) : null}

            <Section title="Bill">
              <BillRows rows={cart.bill} total={cart.toPay} />
            </Section>

            <Section title="Pay with">
              {methods.map((m) => (
                <Pressable key={m.id} onPress={() => setMethod(m.id)} style={s.row} accessibilityRole="radio" accessibilityState={{ checked: method === m.id }}>
                  <Radio on={method === m.id} />
                  <Text style={k.body}>{m.label}</Text>
                </Pressable>
              ))}
              <Text style={[k.muted, { marginTop: 6 }]}>UPI opens your own UPI app and the money goes to Swiggy. FitPlate never sees your payment details. Swiggy orders can’t be cancelled.</Text>
            </Section>

            {mode === 'live' && !ordersLive ? (
              <Notice tone="warn">
                Real orders are switched off, so the flow stops here. To place one, set EXPO_PUBLIC_CHECKOUT_LIVE=true in .env and start the server with CHECKOUT_LIVE=true (see docs/VENDOR_INTEGRATIONS.md).
              </Notice>
            ) : null}
          </>
        ) : null}

        {phase === 'paying' && order ? (
          <Section title="Waiting for payment">
            <Text style={k.body}>Pay ₹{order.toPay ?? cart?.toPay} in your UPI app, then come back here.</Text>
            <GradientButton title="I’ve paid" onPress={() => verifyPayment(order.orderId)} style={{ marginTop: 10 }} />
          </Section>
        ) : null}

        {phase === 'error' ? <GradientButton title="Try again" onPress={start} style={{ marginTop: 14 }} /> : null}
      </ScrollView>

      {phase === 'confirm' || phase === 'placing' ? (
        <View style={s.footer}>
          <GradientButton title={phase === 'placing' ? 'Placing order…' : `Place order${cart?.toPay != null ? ` · ₹${cart.toPay}` : ''}`} onPress={place} disabled={!canPlace} />
          <Text style={[k.muted, { textAlign: 'center', marginTop: 6 }]}>{mode === 'sample' ? 'Sample order: nothing is bought.' : 'This places a real Swiggy order.'}</Text>
        </View>
      ) : null}

      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <Pressable style={s.scrim} onPress={() => setPicker(null)} accessibilityLabel="Close" />
        <View style={s.sheet}>
          {picker ? (
            <>
              <Text style={[type.h2, { color: colors.text }]}>{items.find((i) => i.key === picker)?.name}</Text>
              <ScrollView style={{ maxHeight: 380, marginTop: 8 }}>
                {(choices[picker]?.results ?? []).map((p) => {
                  const on = choices[picker]?.product?.skuId === p.skuId;
                  return (
                    <Pressable
                      key={p.skuId}
                      disabled={!p.inStock}
                      onPress={() => {
                        change(picker, { product: p });
                        store.chooseBrand(picker, `${p.brand ?? p.name} · ${p.packSize ?? 'pack'}`);
                        setPicker(null);
                      }}
                      style={[s.row, !p.inStock && { opacity: 0.45 }]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on, disabled: !p.inStock }}
                    >
                      <Radio on={on} />
                      <View style={{ flex: 1 }}>
                        <Text style={k.strong}>
                          {p.brand ?? p.name} · {p.packSize ?? 'pack'}
                        </Text>
                        <Text style={k.muted}>
                          {p.offerPrice != null ? `₹${p.offerPrice}` : ''}
                          {p.pricePer100 != null ? ` · ₹${p.pricePer100}/100 g` : ''}
                          {p.rating ? ` · ★ ${p.rating}` : ''}
                          {p.inStock ? '' : ' · out of stock'}
                        </Text>
                        {!p.inStock && p.similar.length ? <Text style={[k.muted, { color: colors.warn }]}>Try instead: {p.similar.map((x) => x.brand ?? x.name).join(', ')}</Text> : null}
                      </View>
                    </Pressable>
                  );
                })}
                {(choices[picker]?.results ?? []).length === 0 ? <Text style={k.muted}>Nothing found for this item at your address.</Text> : null}
              </ScrollView>
            </>
          ) : null}
        </View>
      </Modal>

      <Modal visible={fakeUpi} transparent animationType="fade" onRequestClose={() => setFakeUpi(false)}>
        <View style={[s.scrim, { justifyContent: 'center', padding: 24 }]}>
          <View style={[s.sheet, { borderRadius: 24 }]}>
            <Text style={[type.h2, { color: colors.text }]}>Sample UPI app</Text>
            <Text style={[k.body, { marginTop: 6 }]}>In the real app this is your GPay or PhonePe. Pay ₹{order?.toPay ?? cart?.toPay} to Swiggy?</Text>
            <GradientButton
              title="Pay (sample)"
              onPress={() => {
                setFakeUpi(false);
                if (order) verifyPayment(order.orderId);
              }}
              style={{ marginTop: 14 }}
            />
            <Pressable
              onPress={() => {
                setFakeUpi(false);
                setPhase('confirm');
              }}
              style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: colors.muted, fontWeight: '700' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 6 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border },
  link: { color: colors.accent, fontWeight: '700', marginTop: 4, fontSize: 13 },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  apply: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  input: { marginTop: 10, minHeight: 70, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 10, backgroundColor: 'rgba(255,255,255,0.04)' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24, backgroundColor: colors.bgElevated, borderTopWidth: 1, borderColor: colors.border },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: colors.bgElevated, padding: 20, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.border },
});
