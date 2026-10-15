import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Checkbox, k, Loading, Notice, Radio, SampleBanner, ScreenTop, ZeptoCircle } from '../components/vendors/kit';
import { Bar, Chip, GradientButton, PressableScale } from '../components/ui';
import { getDish, getIngredient } from '../data/research';
import { select, success } from '../lib/haptics';
import { useStore } from '../lib/store';
import { useVendors } from '../lib/useVendors';
import type { ShoppingItem, ShoppingList } from '../models/prefs';
import type { Dish } from '../models/research';
import { dishCost } from '../services/vendors';
import { buildShoppingItems, cheapestPer100, newShoppingList, offlineVariants, preselect, variantLabel, type VariantOption } from '../services/vendors/basket';
import { VENDOR_VISIBLE } from '../services/vendors/config';
import { openExternal, zeptoTarget } from '../services/vendors/openApp';
import type { VendorProduct } from '../services/vendors/types';
import { colors, radius, type } from '../theme';

const toOption = (p: VendorProduct): VariantOption => ({
  label: variantLabel(p.brand ?? p.name, p.packSize ?? 'pack'),
  brand: p.brand ?? p.name,
  pack: p.packSize ?? 'pack',
  priceInr: p.offerPrice,
  pricePer100: p.pricePer100,
  source: 'vendor',
  links: { zepto: null, instamart: null, blinkit: null },
  skuId: p.skuId,
  inStock: p.inStock,
});

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/**
 * Priority plan P3a: the consolidated ingredient checklist. Each ingredient
 * has a whole-ingredient checkbox and, under it, one brand / pack choice;
 * "Add to basket & checkout" opens the vendor sheet (Swiggy Instamart
 * checkout, Zepto links). "At the shop" mode is the offline list to tick off.
 * The list syncs (users/{uid}/shoppingLists) so it can move between devices.
 */
export default function BasketScreen() {
  const params = useLocalSearchParams<{ dishes?: string; servings?: string; list?: string }>();
  const store = useStore();
  const { mode, im } = useVendors();

  const ids = useMemo(() => (params.dishes ?? '').split(',').filter(Boolean), [params.dishes]);
  const existing = params.list ? store.shoppingLists.find((l) => l.id === params.list) : ids.length ? store.shoppingLists.find((l) => sameIds(l.dishIds, ids)) : undefined;

  const [listId, setListId] = useState<string | null>(existing?.id ?? null);
  const [list, setList] = useState<ShoppingList | null>(() => {
    if (existing) return existing;
    const s = (params.servings ?? '').split(',').map(Number);
    const chosen = ids.map((id, i) => ({ dish: getDish(id), servings: s[i] || s[0] || 2 })).filter((c): c is { dish: Dish; servings: number } => !!c.dish);
    return chosen.length ? newShoppingList(chosen, store.settings.brandChoice) : null;
  });
  const [tab, setTab] = useState<'online' | 'shop'>('online');
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'vendor' | 'zepto' | null>(null);

  if (!list) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Shopping list" fallback="/cook" />
        <View style={{ padding: 24 }}>
          <Notice tone="warn">Pick a dish first: open any dish in the Cook tab and tap “Shop ingredients”.</Notice>
        </View>
      </SafeAreaView>
    );
  }

  const save = (next: ShoppingList) => {
    setList(next);
    const id = store.saveShoppingList(next, listId ?? undefined);
    if (!listId && id) setListId(id);
  };
  const patchItem = (key: string, patch: Partial<ShoppingItem>) => save({ ...list, items: list.items.map((i) => (i.key === key ? { ...i, ...patch } : i)) });

  const dishes = list.dishIds.map((id) => getDish(id)).filter((d): d is Dish => !!d);
  const single = dishes.length === 1 ? dishes[0] : null;
  const servings = single ? (list.servings[single.id] ?? 2) : null;
  const setServings = (n: number) => {
    if (!single) return;
    const fresh = buildShoppingItems([{ dish: single, servings: n }]);
    const old = new Map(list.items.map((i) => [i.key, i]));
    save({ ...list, servings: { [single.id]: n }, items: fresh.map((i) => ({ ...i, included: old.get(i.key)?.included ?? true, checked: old.get(i.key)?.checked ?? false, variant: old.get(i.key)?.variant ?? store.settings.brandChoice[i.key] ?? null })) });
  };

  const included = list.items.filter((i) => i.included);
  const ticked = list.items.filter((i) => i.checked).length;
  const cost = single ? dishCost(single, servings ?? 2) : null;

  const continueToCook = (via: ShoppingList['boughtVia']) => {
    save({ ...list, status: 'done', boughtVia: via, orderedAt: Date.now() });
    const first = dishes[0];
    if (first) router.replace({ pathname: '/steps/[id]', params: { id: first.id, servings: String(list.servings[first.id] ?? 2), via: via ?? 'self' } });
    else router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Shopping list" subtitle={list.title} fallback="/cook" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }}>
        {single && servings ? (
          <View style={s.servings}>
            <Text style={{ color: colors.text, fontWeight: '800', flex: 1 }}>Cooking for</Text>
            <PressableScale style={s.step} onPress={() => servings > 1 && setServings(servings - 1)} accessibilityLabel="Fewer people">
              <Ionicons name="remove" size={18} color={colors.text} />
            </PressableScale>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, minWidth: 64, textAlign: 'center' }}>
              {servings} {servings === 1 ? 'person' : 'people'}
            </Text>
            <PressableScale style={s.step} onPress={() => servings < 12 && setServings(servings + 1)} accessibilityLabel="More people">
              <Ionicons name="add" size={18} color={colors.text} />
            </PressableScale>
          </View>
        ) : null}
        {cost ? (
          <Text style={[k.muted, { marginTop: 8 }]}>
            About ₹{cost.inr} of ingredients for this cook{cost.coveragePct < 100 ? ` (prices known for ${cost.coveragePct}% of them)` : ''}. Packs cost more; you keep the rest.
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Chip label="📦 Order online" active={tab === 'online'} onPress={() => setTab('online')} />
          <Chip label="🏪 At the shop" active={tab === 'shop'} onPress={() => setTab('shop')} />
        </View>
        {tab === 'online' && mode === 'sample' ? <SampleBanner what="brands, prices and stock" /> : null}
        {tab === 'shop' ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 6 }}>
              {ticked} of {list.items.length} in the basket
            </Text>
            <Bar progress={list.items.length ? ticked / list.items.length : 0} />
            <Text style={[k.muted, { marginTop: 6 }]}>Tap an item to see the brands to look for on the shelf, with rough prices.</Text>
          </View>
        ) : (
          <Text style={[k.muted, { marginTop: 10 }]}>Untick anything you already have. Under each item, pick the brand and pack you want.</Text>
        )}

        <View style={{ marginTop: 12 }}>
          {list.items.map((item) => (
            <ItemRow
              key={item.key}
              item={item}
              tab={tab}
              expanded={open === item.key}
              onToggleOpen={() => setOpen(open === item.key ? null : item.key)}
              onToggleBox={() => {
                if (tab === 'shop') {
                  if (item.checked) select();
                  else success();
                  patchItem(item.key, { checked: !item.checked });
                } else patchItem(item.key, { included: !item.included });
              }}
              onChoose={(label) => {
                patchItem(item.key, { variant: label });
                store.chooseBrand(item.key, label);
              }}
              online={tab === 'online'}
              search={im.searchProducts}
              addresses={im.getAddresses}
              connected={im.status}
            />
          ))}
        </View>
      </ScrollView>

      <View style={s.footer}>
        {tab === 'online' ? (
          <>
            <GradientButton title={`Add to basket & checkout (${included.length})`} onPress={() => setSheet('vendor')} disabled={included.length === 0} />
            <Pressable onPress={() => continueToCook('self')} style={s.plain} accessibilityRole="button">
              <Text style={s.plainText}>Bought them yourself? Continue</Text>
            </Pressable>
          </>
        ) : (
          <GradientButton title={ticked === list.items.length ? 'Got everything. Let’s cook 🔥' : 'Continue'} onPress={() => continueToCook('self')} />
        )}
      </View>

      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={s.scrim} onPress={() => setSheet(null)} accessibilityLabel="Close" />
        <View style={s.sheet}>
          {sheet === 'vendor' ? (
            <>
              <Text style={[type.h2, { color: colors.text }]}>Where do you want to buy?</Text>
              <Text style={[k.muted, { marginTop: 4 }]}>{included.length} items. You pay the shop directly; FitPlate never sees your payment.</Text>
              {VENDOR_VISIBLE.instamart ? (
                <PressableScale
                  style={s.vendor}
                  onPress={() => {
                    setSheet(null);
                    store.updateSettings({ preferredVendor: 'instamart' });
                    router.push({ pathname: '/checkout/instamart', params: { list: listId ?? store.saveShoppingList(list) } });
                  }}
                >
                  <View style={[s.logo, { backgroundColor: '#FC8019' }]}>
                    <Text style={s.logoText}>S</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={k.strong}>Swiggy Instamart</Text>
                    <Text style={k.muted}>Whole basket in one go. Check the bill, then pay by UPI or cash.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </PressableScale>
              ) : null}
              {VENDOR_VISIBLE.zepto ? (
                <PressableScale style={s.vendor} onPress={() => setSheet('zepto')}>
                  <View style={[s.logo, { backgroundColor: '#5B1E9E' }]}>
                    <Text style={s.logoText}>Z</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={k.strong}>Open items in Zepto</Text>
                    <Text style={k.muted}>One tap per item opens it in Zepto; add to basket and pay there.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </PressableScale>
              ) : null}
              <Pressable
                onPress={() => {
                  setSheet(null);
                  continueToCook('self');
                }}
                style={s.plain}
                accessibilityRole="button"
              >
                <Text style={s.plainText}>I’ll buy them myself. Continue</Text>
              </Pressable>
            </>
          ) : (
            <ZeptoList
              items={included}
              onDone={() => {
                setSheet(null);
                continueToCook('zepto');
              }}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ItemRow({
  item,
  tab,
  expanded,
  onToggleOpen,
  onToggleBox,
  onChoose,
  online,
  search,
  addresses,
  connected,
}: {
  item: ShoppingItem;
  tab: 'online' | 'shop';
  expanded: boolean;
  onToggleOpen: () => void;
  onToggleBox: () => void;
  onChoose: (label: string) => void;
  online: boolean;
  search: (q: string, addressId: string) => Promise<VendorProduct[]>;
  addresses: () => Promise<{ id: string }[]>;
  connected: () => Promise<{ connected: boolean }>;
}) {
  const ingredient = item.ingredientId ? getIngredient(item.ingredientId) : undefined;
  const offline = useMemo(() => offlineVariants(item, ingredient), [item, ingredient]);
  const [vendor, setVendor] = useState<VariantOption[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expanded || !online || vendor) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        if (!(await connected()).connected) return;
        const addr = (await addresses())[0];
        if (!addr) return;
        const products = await search(item.name, addr.id);
        if (alive) setVendor(products.map(toOption));
      } catch {
        // Offline or not connected: the researched brands below still show.
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [expanded, online, vendor, item.name, search, addresses, connected]);

  const options = online && vendor && vendor.length ? vendor : offline;
  const chosenIdx = preselect(options, item.variant);
  const best = cheapestPer100(options);
  const box = tab === 'shop' ? item.checked : item.included;
  const qty = item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : 'as needed';
  const dim = tab === 'shop' ? item.checked : !item.included;

  return (
    <View style={[s.item, dim && { opacity: 0.55 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Checkbox on={box} onPress={onToggleBox} label={tab === 'shop' ? `Got ${item.name}` : `Buy ${item.name}`} />
        <Pressable style={{ flex: 1, minHeight: 44, justifyContent: 'center' }} onPress={onToggleOpen} accessibilityRole="button" accessibilityLabel={`${item.name}, ${qty}. Show brands`}>
          <Text style={[s.name, tab === 'shop' && item.checked && { textDecorationLine: 'line-through' }]}>{item.name}</Text>
          <Text style={k.muted}>
            {qty}
            {item.variant ? ` · ${item.variant}` : ''}
          </Text>
        </Pressable>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} />
      </View>
      {expanded ? (
        <View style={s.options}>
          {loading ? <Loading label="Checking what’s in stock…" /> : null}
          {options.map((o, i) => {
            const z = zeptoTarget(o.links.zepto);
            const on = i === chosenIdx;
            return (
              <Pressable key={`${o.label}-${i}`} onPress={() => onChoose(o.label)} style={s.option} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Radio on={on} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {o.brand} <Text style={k.muted}>· {o.pack}</Text>
                  </Text>
                  <Text style={k.muted}>
                    {o.priceInr != null ? `${o.source === 'vendor' ? '' : '~'}₹${o.priceInr}` : 'price not known'}
                    {o.pricePer100 != null ? ` · ₹${o.pricePer100}/100 g` : ''}
                    {o.inStock === false ? ' · out of stock' : ''}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
                    {i === best ? (
                      <View style={k.pill}>
                        <Text style={k.pillText}>Best value per 100 g</Text>
                      </View>
                    ) : null}
                    {o.source === 'research' ? <Text style={[k.muted, { fontSize: 11 }]}>FitPlate research estimate</Text> : null}
                  </View>
                </View>
                <ZeptoCircle
                  exact={z.exact}
                  onPress={async () => {
                    const ok = await openExternal(z.url);
                    if (!z.exact) notify('Zepto', `FitPlate doesn’t have the exact Zepto link for ${o.brand} ${item.name} yet, so Zepto’s home page opened. Search for it there.`);
                    else if (!ok) notify('Zepto', 'Couldn’t open Zepto on this device.');
                  }}
                />
              </Pressable>
            );
          })}
          {tab === 'shop' && ingredient?.storage ? <Text style={[k.muted, { marginTop: 6 }]}>Storage: {ingredient.storage}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function ZeptoList({ items, onDone }: { items: ShoppingItem[]; onDone: () => void }) {
  return (
    <>
      <Text style={[type.h2, { color: colors.text }]}>Open each item in Zepto</Text>
      <Text style={[k.muted, { marginTop: 4 }]}>Tap the circle, add it to your Zepto basket, come back for the next one. You pay in Zepto.</Text>
      <ScrollView style={{ maxHeight: 340, marginTop: 10 }}>
        {items.map((i) => {
          const ing = i.ingredientId ? getIngredient(i.ingredientId) : undefined;
          const option = offlineVariants(i, ing).find((o) => o.label === i.variant) ?? offlineVariants(i, ing)[0];
          const z = zeptoTarget(option?.links.zepto);
          return (
            <View key={i.key} style={s.zrow}>
              <View style={{ flex: 1 }}>
                <Text style={k.strong}>{i.name}</Text>
                <Text style={k.muted}>{i.variant ?? 'any brand'}</Text>
              </View>
              <ZeptoCircle
                exact={z.exact}
                onPress={async () => {
                  await openExternal(z.url);
                  if (!z.exact) notify('Zepto', `No exact Zepto link for ${i.name} yet, so Zepto’s home page opened. Search for “${i.name}” there.`);
                }}
              />
            </View>
          );
        })}
      </ScrollView>
      <GradientButton title="Done in Zepto. Continue" onPress={onDone} style={{ marginTop: 12 }} />
    </>
  );
}

function notify(title: string, body: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${body}`);
  else Alert.alert(title, body);
}

const s = StyleSheet.create({
  servings: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  step: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  item: { padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  options: { marginTop: 10, marginLeft: 38, gap: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, minHeight: 44 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24, backgroundColor: colors.bgElevated, borderTopWidth: 1, borderColor: colors.border },
  plain: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  plainText: { color: colors.muted, fontWeight: '700', textDecorationLine: 'underline' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: colors.bgElevated, padding: 20, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: colors.border },
  vendor: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  zrow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border },
});
