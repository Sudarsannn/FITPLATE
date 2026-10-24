import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Checkbox, k, Loading, Notice, Radio, SampleBanner, ScreenTop, ZeptoCircle } from '../components/vendors/kit';
import { Bar, Chip, GradientButton, PressableScale } from '../components/ui';
import { getDish, getIngredient } from '../data/research';
import { select, success } from '../lib/haptics';
import { addDays, dayKey, useStore } from '../lib/store';
import { useVendors } from '../lib/useVendors';
import type { ShoppingItem, ShoppingList } from '../models/prefs';
import type { Dish } from '../models/research';
import { makeCost } from '../services/dishLibrary';
import { addBought, coverage, haveLabel, onlyMissing } from '../services/pantry';
import { firstDishOfDay, mealPrepDishes } from '../services/planSlots';
import { rupees } from '../services/costToMake';
import { dishCost } from '../services/vendors';
import { buildShoppingItems, cheapestPer100, isPantryStaple, itemAmountLabel, newShoppingList, offlineVariants, preselect, shoppingListText, variantLabel, type VariantOption } from '../services/vendors/basket';
import { VENDOR_VISIBLE, VENDORS_PAUSED } from '../services/vendors/config';
import { VendorPlaceholders } from '../components/vendors/VendorLogos';
import { instamartSearchUrl, openExternal, zeptoSearchUrl, zeptoTarget } from '../services/vendors/openApp';
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

/** Outside the component so event handlers can stamp a time without the render-purity lint. */
const nowMs = () => Date.now();

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
  const [sheet, setSheet] = useState<'vendor' | 'zepto' | 'prep' | null>(null);
  const [prepDays, setPrepDays] = useState(2);
  const [stocked, setStocked] = useState(false);

  if (!list) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Shopping list" fallback="/cook" />
        <ScrollView contentContainerStyle={{ padding: 18, gap: 10 }}>
          {store.shoppingLists.length ? (
            store.shoppingLists.map((l) => (
              <PressableScale key={l.id} style={s.item} onPress={() => router.replace({ pathname: '/basket', params: { list: l.id } })} accessibilityLabel={`Open ${l.title}`}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="list" size={20} color={colors.accent} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.name} numberOfLines={1}>
                      {l.title}
                    </Text>
                    <Text style={k.muted}>
                      {l.items.filter((i) => i.checked).length} of {l.items.length} ticked
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </View>
              </PressableScale>
            ))
          ) : (
            <Notice tone="warn">No shopping list yet. Open any dish in the Cook tab and tap “Shopping list”, or plan your week and tap “Grocery list for the week”.</Notice>
          )}
        </ScrollView>
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
  // Day 9: one estimate for the whole list, from each dish's researched cost to make.
  const costs = dishes.map((d) => dishCost(d, list.servings[d.id] ?? 2));
  const known = costs.filter((c): c is NonNullable<typeof c> => !!c);
  const cost = known.length ? { inr: known.reduce((t, c) => t + c.inr, 0), coveragePct: Math.round(known.reduce((t, c) => t + c.coveragePct, 0) / dishes.length) } : null;

  const shareList = async () => {
    const text = shoppingListText(list, { estimateInr: cost?.inr ?? null });
    try {
      if (Platform.OS !== 'web') {
        await Share.share({ message: text });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: list.title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      notify('List copied', 'Paste it into WhatsApp, Notes or a message.');
    } catch {
      // Share sheet closed, or the browser blocked it: nothing to do.
    }
  };

  const continueToCook = (via: ShoppingList['boughtVia']) => {
    save({ ...list, status: 'done', boughtVia: via, orderedAt: nowMs() });
    const first = dishes[0];
    if (dishes.length > 1) {
      // Several dishes: cook them together on one timeline.
      const go2 = () => router.replace({ pathname: '/multicook', params: { dishes: dishes.map((d) => d.id).join(','), servings: dishes.map((d) => String(list.servings[d.id] ?? 2)).join(','), via: via ?? 'self' } });
      if (Platform.OS === 'ios' && sheet !== null) setTimeout(go2, 450);
      else go2();
      return;
    }
    // iOS drops a navigation made while a Modal is still closing, so wait for it.
    const go = () => {
      if (first) router.replace({ pathname: '/steps/[id]', params: { id: first.id, servings: String(list.servings[first.id] ?? 2), via: via ?? 'self' } });
      else router.back();
    };
    if (Platform.OS === 'ios' && sheet !== null) setTimeout(go, 450);
    else go();
  };

  // ---- inventory ("What is in my kitchen"), meal prep and the first dish of the day
  const pantry = store.settings.pantry ?? {};
  const havePantry = Object.keys(pantry).length > 0;
  const covered = list.items.filter((i) => i.included && coverage(pantry, i).status === 'enough').length;
  const rebuilt = () => {
    const fresh = buildShoppingItems(dishes.map((d) => ({ dish: d, servings: list.servings[d.id] ?? 2 })));
    const old = new Map(list.items.map((i) => [i.key, i]));
    return fresh.map((i) => ({ ...i, included: true, checked: old.get(i.key)?.checked ?? false, variant: old.get(i.key)?.variant ?? store.settings.brandChoice[i.key] ?? null }));
  };
  const buyEverything = () => save({ ...list, items: rebuilt() });
  const buyOnlyMissing = () => save({ ...list, items: onlyMissing(rebuilt(), pantry) });

  const alreadyBought = () => {
    store.updateSettings({ pantry: addBought(pantry, list.items.filter((i) => i.included)) });
    save({ ...list, status: 'done', boughtVia: 'self', orderedAt: nowMs() });
    success();
    setStocked(true);
  };
  const days = Array.from({ length: 7 }, (_, i) => dayKey(addDays(new Date(), i)));
  const prepDishes = mealPrepDishes(store.plan, days, list.dishIds, prepDays);
  const startPrep = () => {
    const chosen = prepDishes.filter((p) => getDish(p.id));
    save({ ...list, status: 'done', boughtVia: list.boughtVia ?? 'self', orderedAt: list.orderedAt ?? nowMs() });
    setSheet(null);
    const go = () => router.replace({ pathname: '/multicook', params: { dishes: chosen.map((p) => p.id).join(','), servings: chosen.map((p) => String(p.servings)).join(','), via: 'self' } });
    if (Platform.OS === 'ios') setTimeout(go, 450);
    else go();
  };
  const startFirstDish = () => {
    const id = firstDishOfDay(store.plan, days, list.dishIds) ?? dishes[0]?.id;
    if (!id) return;
    save({ ...list, status: 'done', boughtVia: list.boughtVia ?? 'self', orderedAt: list.orderedAt ?? nowMs() });
    router.replace({ pathname: '/steps/[id]', params: { id, servings: String(list.servings[id] ?? 1), via: 'self' } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Shopping list" subtitle={list.title} fallback="/cook" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 190 }}>
        {dishes.length ? (
          <View style={s.flow} accessibilityLabel="Step 1 of 2: buy the ingredients. Step 2: cook step by step">
            <View style={[s.flowDot, { backgroundColor: colors.accent }]}>
              <Text style={s.flowN}>1</Text>
            </View>
            <Text style={[s.flowText, { color: colors.text }]}>Buy</Text>
            <View style={s.flowLine} />
            <View style={s.flowDot}>
              <Text style={[s.flowN, { color: colors.muted }]}>2</Text>
            </View>
            <Text style={s.flowText}>Cook step by step</Text>
          </View>
        ) : null}
        {single && servings ? (
          <View style={s.servings}>
            <Text style={{ color: colors.text, fontWeight: '800', flex: 1 }}>Cooking for</Text>
            <PressableScale style={s.step} onPress={() => servings > 1 && setServings(servings - 1)} accessibilityLabel="Fewer people">
              <Ionicons name="remove" size={18} color={colors.text} />
            </PressableScale>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, minWidth: 64, textAlign: 'center' }}>
              {servings} {servings === 1 ? 'person' : 'people'}
            </Text>
            <PressableScale style={s.step} onPress={() => servings < 8 && setServings(servings + 1)} accessibilityLabel="More people">
              <Ionicons name="add" size={18} color={colors.text} />
            </PressableScale>
          </View>
        ) : null}
        {cost ? (
          <Text style={[k.muted, { marginTop: 8 }]}>
            About ₹{cost.inr} of ingredients for {single ? 'this cook' : `these ${dishes.length} dishes`}
            {cost.coveragePct < 100 ? ` (prices known for ${cost.coveragePct}% of them)` : ''}. Packs cost more; you keep the rest.
          </Text>
        ) : null}

        <CostPerIngredient dishes={dishes} servings={list.servings} />

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'center' }}>
          <Chip label="Order online" icon="cube-outline" active={tab === 'online'} onPress={() => setTab('online')} />
          <Chip label="At the shop" icon="storefront-outline" active={tab === 'shop'} onPress={() => setTab('shop')} />
          <View style={{ flex: 1 }} />
          <PressableScale onPress={shareList} style={s.share} scaleTo={0.94} accessibilityLabel="Share the list as text">
            <Ionicons name="share-outline" size={16} color={colors.text} />
            <Text style={s.shareText}>Share</Text>
          </PressableScale>
        </View>
        {tab === 'online' && mode === 'sample' && !VENDORS_PAUSED ? <SampleBanner what="brands, prices and stock" /> : null}
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

        <View style={s.after}>
          <Text style={[type.h2, { color: colors.text }]}>{stocked ? 'Added to your ingredients' : 'After you buy'}</Text>
          <Text style={[k.muted, { marginTop: 4 }]}>{stocked ? 'Your kitchen is updated. Every dish now shows what you have and what is missing.' : 'Pick what happens next.'}</Text>
          <GradientButton title="Already bought it. Add to inventory" variant="glass" onPress={alreadyBought} style={{ marginTop: 12 }} />
          {stocked ? <GradientButton title="See my ingredients" variant="glass" onPress={() => router.push({ pathname: '/(tabs)/track', params: { view: 'ingredients' } })} style={{ marginTop: 10 }} /> : null}
          {dishes.length > 1 ? <GradientButton title="Start meal prep" variant="glass" onPress={() => setSheet('prep')} style={{ marginTop: 10 }} /> : null}
          <GradientButton title={dishes.length > 1 ? 'Start the first dish of the day' : 'Start cooking'} onPress={dishes.length > 1 ? startFirstDish : () => continueToCook('self')} style={{ marginTop: 10 }} />
        </View>
        {havePantry && tab === 'online' ? (
          <View style={s.pantryBar}>
            <Ionicons name="basket-outline" size={18} color={colors.accent} />
            <Text style={[k.muted, { flex: 1 }]}>{covered ? `${covered} of these you already have.` : 'Checked against what is in your kitchen.'}</Text>
            <Chip label="Buy all" onPress={buyEverything} />
            <Chip label="Only what I'm missing" onPress={buyOnlyMissing} />
          </View>
        ) : null}

        <View style={{ marginTop: 12 }}>
          {list.items.map((item) => (
            <ItemRow
              key={item.key}
              item={item}
              have={haveLabel(coverage(pantry, item), item.unit)}
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
              online={tab === 'online' && !VENDORS_PAUSED}
              search={im.searchProducts}
              addresses={im.getAddresses}
              connected={im.status}
            />
          ))}
        </View>
      </ScrollView>

      <View style={s.footer}>
        {tab === 'online' ? (
          <GradientButton title={VENDORS_PAUSED ? `Buy online (${included.length})` : `Add to basket & checkout (${included.length})`} onPress={() => setSheet('vendor')} disabled={included.length === 0} />
        ) : (
          <GradientButton title={ticked === list.items.length ? 'Got everything. Add to inventory' : 'Bought these. Add to inventory'} onPress={alreadyBought} />
        )}
      </View>

      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={s.scrim} onPress={() => setSheet(null)} accessibilityLabel="Close" />
        <View style={s.sheet}>
          {sheet === 'prep' ? (
            <>
              <Text style={[type.h2, { color: colors.text }]}>Meal prep</Text>
              <Text style={[k.muted, { marginTop: 4 }]}>Cook ahead in one session. Ingredients and steps are combined on one timeline, like cooking a basket of dishes together.</Text>
              <View style={s.prepRow}>
                <Text style={{ color: colors.text, fontWeight: '800', flex: 1 }}>Prep for how many days?</Text>
                <PressableScale onPress={() => setPrepDays(Math.max(1, prepDays - 1))} style={s.prepStep} scaleTo={0.9} accessibilityLabel="Fewer days">
                  <Ionicons name="remove" size={18} color={colors.text} />
                </PressableScale>
                <Text style={s.prepDays}>{prepDays}</Text>
                <PressableScale onPress={() => setPrepDays(Math.min(7, prepDays + 1))} style={s.prepStep} scaleTo={0.9} accessibilityLabel="More days">
                  <Ionicons name="add" size={18} color={colors.text} />
                </PressableScale>
              </View>
              <Text style={[k.muted, { marginTop: 10 }]}>
                {prepDishes.map((p) => `${getDish(p.id)?.name ?? p.id}${p.servings > 1 ? ` ×${p.servings}` : ''}`).join(', ')}
              </Text>
              <GradientButton title={`Start meal prep (${prepDays} ${prepDays === 1 ? 'day' : 'days'})`} onPress={startPrep} disabled={prepDishes.length === 0} style={{ marginTop: 16 }} />
            </>
          ) : sheet === 'vendor' && VENDORS_PAUSED ? (
            <>
              <Text style={[type.h2, { color: colors.text }]}>Grocery apps are coming</Text>
              <Text style={[k.muted, { marginTop: 4, marginBottom: 12 }]}>
                Ordering these {included.length} items through a grocery app arrives with the FitPlate phone app. For now, take this list to the shop or your usual app.
              </Text>
              <VendorPlaceholders vendors={['instamart', 'zepto', 'blinkit']} />
              <GradientButton
                title="Use the list at the shop"
                onPress={() => {
                  setSheet(null);
                  setTab('shop');
                }}
                style={{ marginTop: 16 }}
              />
              <Pressable
                onPress={() => {
                  setSheet(null);
                  continueToCook('self');
                }}
                style={s.plain}
                accessibilityRole="button"
              >
                <Text style={s.plainText}>I’ve bought them. Continue to cooking</Text>
              </Pressable>
            </>
          ) : sheet === 'vendor' ? (
            <>
              <Text style={[type.h2, { color: colors.text }]}>Where do you want to buy?</Text>
              <Text style={[k.muted, { marginTop: 4 }]}>{included.length} items. You pay the shop directly; FitPlate never sees your payment.</Text>
              {VENDOR_VISIBLE.instamart ? (
                <PressableScale
                  style={s.vendor}
                  onPress={() => {
                    setSheet(null);
                    store.updateSettings({ preferredVendor: 'instamart' });
                    const id = listId ?? store.saveShoppingList(list);
                    // iOS drops a navigation made while a Modal is still closing, so wait for it.
                    setTimeout(() => router.push({ pathname: '/checkout/instamart', params: { list: id } }), Platform.OS === 'ios' ? 450 : 0);
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
  have,
}: {
  have?: string | null;
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
  const qty = itemAmountLabel(item);
  const pantry = isPantryStaple(ingredient, item.name);
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
          {have ? <Text style={[k.muted, { color: colors.accent }]}>{have}</Text> : null}
          {pantry ? (
            <View style={s.pantry}>
              <Text style={s.pantryText}>Pantry staple · check your shelf</Text>
            </View>
          ) : null}
        </Pressable>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} />
      </View>
      {expanded ? (
        <View style={s.options}>
          {ingredient?.looksLike || ingredient?.howToPick ? (
            <View style={s.know}>
              {ingredient.looksLike ? (
                <Text style={s.knowText}>
                  <Text style={s.knowLabel}>What it looks like </Text>
                  {ingredient.looksLike}
                </Text>
              ) : null}
              {ingredient.howToPick ? (
                <Text style={[s.knowText, ingredient.looksLike ? { marginTop: 6 } : null]}>
                  <Text style={s.knowLabel}>How to pick </Text>
                  {ingredient.howToPick}
                </Text>
              ) : null}
              {ingredient.shelfLife ? <Text style={[k.muted, { marginTop: 6, fontSize: 12 }]}>Keeps: {ingredient.shelfLife}</Text> : null}
            </View>
          ) : null}
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
                {VENDORS_PAUSED ? null : (
                  <ZeptoCircle
                    exact
                    onPress={async () => {
                      const ok = await openExternal(z.exact ? z.url : zeptoSearchUrl(`${o.brand} ${item.name}`));
                      if (!ok) notify('Zepto', 'Couldn’t open Zepto on this device.');
                    }}
                  />
                )}
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
                <Text style={k.muted}>{i.variant ?? 'any brand'}{z.exact ? '' : ' · opens a Zepto search'}</Text>
              </View>
              <Pressable onPress={() => openExternal(instamartSearchUrl(i.name))} hitSlop={8} accessibilityRole="link" accessibilityLabel={`Search ${i.name} on Swiggy Instamart`} style={{ marginRight: 8 }}>
                <Text style={{ color: colors.warm, fontWeight: '800', fontSize: 12 }}>Swiggy</Text>
              </Pressable>
              <ZeptoCircle exact onPress={() => openExternal(z.exact ? z.url : zeptoSearchUrl(i.name))} />
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
  flow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  flowDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  flowN: { color: '#06210F', fontWeight: '900', fontSize: 12 },
  flowText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  flowLine: { flex: 1, height: 2, borderRadius: 1, backgroundColor: colors.border },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24, backgroundColor: colors.bgElevated, borderTopWidth: 1, borderColor: colors.border },
  pantryBar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(61,220,132,0.08)', borderWidth: 1, borderColor: 'rgba(61,220,132,0.3)' },
  after: { marginTop: 18, padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  prepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  prepStep: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  prepDays: { color: colors.text, fontWeight: '900', fontSize: 20, minWidth: 28, textAlign: 'center' },
  plain: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  plainText: { color: colors.muted, fontWeight: '700', textDecorationLine: 'underline' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: colors.bgElevated, padding: 20, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: colors.border },
  vendor: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  share: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 36, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  shareText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  pantry: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: 'rgba(255,138,61,0.14)' },
  pantryText: { color: colors.warm, fontSize: 11, fontWeight: '800' },
  know: { padding: 10, borderRadius: radius.sm, backgroundColor: colors.cardAlt, marginBottom: 6 },
  knowText: { color: colors.text, fontSize: 13, lineHeight: 18 },
  knowLabel: { color: colors.accent, fontWeight: '800' },
  zrow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border },
});

/** What each ingredient costs, shown here (after "Cook it yourself") rather than on the dish page. */
function CostPerIngredient({ dishes, servings }: { dishes: Dish[]; servings: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const costs = dishes.map((d) => ({ dish: d, cost: makeCost(d), n: servings[d.id] ?? 2 })).filter((c) => c.cost);
  if (!costs.length) return null;
  return (
    <View style={{ marginTop: 8 }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={open ? 'Hide cost per ingredient' : 'Show cost per ingredient'} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13.5 }}>{open ? 'Hide cost per ingredient' : 'Cost per ingredient'}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.accent} />
      </Pressable>
      {open
        ? costs.map(({ dish, cost, n }) => (
            <View key={dish.id} style={{ marginTop: 8 }}>
              {dishes.length > 1 ? <Text style={[k.muted, { fontWeight: '800' }]}>{dish.name}</Text> : null}
              {cost!.lines.map((l, i) => (
                <View key={`${i}-${l.name}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 3 }}>
                  <Text style={[k.muted, { flex: 1 }]} numberOfLines={2}>
                    {l.name}
                  </Text>
                  <Text style={[k.muted, l.avg != null ? { color: colors.text, fontWeight: '700' } : null]}>
                    {l.avg != null ? rupees(l.avg * n) : l.note}
                    {l.status === 'estimated' ? ' (est.)' : ''}
                  </Text>
                </View>
              ))}
            </View>
          ))
        : null}
      {open ? <Text style={[k.muted, { fontSize: 11.5, marginTop: 4 }]}>Researched shop prices for the amount you need. Packs cost more; cooking gas isn&apos;t included.</Text> : null}
    </View>
  );
}
