import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '../../components/ui';
import { k, ScreenTop } from '../../components/vendors/kit';
import { featureFlags } from '../../config/featureFlags';
import { useStore } from '../../lib/store';
import { pushCart, searchFallbackUrl } from '../../services/vendors/cartPush';
import { buildCheckoutPlan, VENDOR_NAMES, type CheckoutVendor } from '../../services/vendors/checkoutPlan';
import { openExternal } from '../../services/vendors/openApp';
import { colors, type } from '../../theme';

/**
 * Day 15G2: the confirmation step before any cart push: items, chosen variants and an estimated total.
 * Reached only when flag `vendorCheckout` is on. Payment always happens in the vendor's own app.
 */
export default function ConfirmCheckout() {
  const params = useLocalSearchParams<{ list?: string; vendor?: string }>();
  const store = useStore();
  const vendor: CheckoutVendor = params.vendor === 'zepto' ? 'zepto' : 'instamart';
  const list = store.shoppingLists.find((l) => l.id === params.list);
  const plan = useMemo(() => (list ? buildCheckoutPlan(list, vendor) : null), [list, vendor]);
  const [msg, setMsg] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  if (!featureFlags.vendorCheckout || !plan || !list) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Checkout" />
        <Text style={[k.muted, { padding: 16 }]}>Checkout through grocery apps is not available yet.</Text>
      </SafeAreaView>
    );
  }
  const name = VENDOR_NAMES[vendor];

  const go = async () => {
    const r = await pushCart(plan, true);
    const url = r.ok ? r.openUrl : searchFallbackUrl(plan);
    if (!r.ok) setMsg(r.message);
    if (url && (await openExternal(url))) setOpened(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title={`Confirm for ${name}`} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[type.h2, { color: colors.text }]}>{plan.lines.length} items</Text>
        {plan.lines.map((l) => (
          <View key={l.key} style={{ paddingVertical: 8 }}>
            <Text style={k.strong}>
              {l.name} · {l.amount}
            </Text>
            <Text style={k.muted}>
              {l.variant ?? 'any brand'} · {l.priceInr != null ? `about ₹${l.priceInr}` : 'price not known'}
            </Text>
          </View>
        ))}
        <Text style={[k.strong, { marginTop: 12 }]}>Estimated total: about ₹{plan.estimatedTotalInr}</Text>
        {plan.unpriced ? <Text style={k.muted}>{plan.unpriced} items have no price yet and are left out of the total.</Text> : null}
        <Text style={[k.muted, { marginTop: 8 }]}>An estimate, not a bill. You pay in {name}; FitPlate never sees your payment.</Text>
        {msg ? <Text style={[k.muted, { marginTop: 8 }]}>{msg} Opening a search instead.</Text> : null}
        <GradientButton title={opened ? 'Opened. Back to FitPlate' : `Confirm and open ${name}`} onPress={opened ? () => router.back() : go} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
