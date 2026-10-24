import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, Radio, SampleBanner, ScreenTop, Section, k } from '../components/vendors/kit';
import { useStore } from '../lib/store';
import { useVendors } from '../lib/useVendors';
import type { VendorId } from '../models/prefs';
import { CHECKOUT_LIVE, VENDOR_VISIBLE } from '../services/vendors/config';
import { colors } from '../theme';

const VENDORS: { id: VendorId; label: string; note: string }[] = [
  { id: 'instamart', label: 'Swiggy Instamart', note: 'Cart and checkout inside FitPlate' },
  { id: 'zepto', label: 'Zepto', note: 'Opens Zepto on the item, you add it there' },
  { id: 'blinkit', label: 'Blinkit', note: 'Parked' },
];

/**
 * Shopping & vendors (priority plan P3). Sample or live Swiggy, connection
 * state, whether real orders are switched on, the preferred shop and the
 * order-history consent. Live is only offered where the local FitPlate
 * server is set up; everyone else stays on sample data.
 */
export default function VendorsScreen() {
  const { settings, updateSettings } = useStore();
  const { mode, liveAvailable, im, food, server, ordersLive } = useVendors();
  const [conn, setConn] = useState<{ im: boolean; food: boolean } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([im.status(), food.status()])
      .then(([a, b]) => alive && setConn({ im: a.connected, food: b.connected }))
      .catch(() => alive && setConn({ im: false, food: false }));
    return () => {
      alive = false;
    };
  }, [im, food, tick]);

  const connect = async (which: 'im' | 'food') => {
    const back = Platform.OS === 'web' ? window.location.href : Linking.createURL('/vendors');
    const url = (which === 'im' ? im : food).connectUrl(back);
    if (!url) return;
    if (Platform.OS === 'web') {
      window.location.href = url;
      return;
    }
    await WebBrowser.openAuthSessionAsync(url, back);
    setTick((t) => t + 1);
  };

  const disconnect = async () => {
    await im.disconnect();
    setTick((t) => t + 1);
  };

  const setLive = (on: boolean) => updateSettings({ featureToggles: { ...settings.featureToggles, swiggyLive: on } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Shopping & vendors" fallback="/(tabs)/me" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        {mode === 'sample' ? <SampleBanner /> : null}

        <Section title="Swiggy">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={k.strong}>Use real Swiggy</Text>
              <Text style={k.muted}>{liveAvailable ? 'Needs the FitPlate server running on this computer.' : 'Only on the computer that runs the FitPlate server. Everyone else uses sample data.'}</Text>
            </View>
            <Switch value={mode === 'live'} onValueChange={setLive} disabled={!liveAvailable} accessibilityLabel="Use real Swiggy" />
          </View>
          {mode === 'live' ? (
            <>
              <Notice tone={server?.running ? 'ok' : server ? 'bad' : 'info'}>
                {server == null ? 'Checking the FitPlate server…' : server.running ? 'FitPlate server is running.' : 'Can’t reach the FitPlate server. Start it with “npm run server”.'}
              </Notice>
              <View style={{ marginTop: 10, gap: 8 }}>
                <ConnectRow label="Instamart" connected={conn?.im} onConnect={() => connect('im')} />
                <ConnectRow label="Swiggy Food" connected={conn?.food} onConnect={() => connect('food')} />
                {conn?.im || conn?.food ? (
                  <Pressable onPress={disconnect} accessibilityRole="button">
                    <Text style={{ color: colors.bad, fontWeight: '800', marginTop: 4 }}>Disconnect Swiggy</Text>
                  </Pressable>
                ) : null}
              </View>
            </>
          ) : null}
        </Section>

        <Section title="Real orders">
          <Text style={k.body}>{ordersLive ? 'On. Placing an order is real and charges you on Swiggy.' : 'Off. You can build carts and see bills, but “Place order” stays locked.'}</Text>
          <Text style={[k.muted, { marginTop: 6 }]}>
            Turned on only when the app setting and the server setting are both on ({CHECKOUT_LIVE ? 'app on' : 'app off'}
            {mode === 'live' && server ? `, server ${server.checkoutLive ? 'on' : 'off'}` : ''}). FitPlate never sees your card or UPI details: you pay in Swiggy or your UPI app.
          </Text>
        </Section>

        <Section title="Preferred shop">
          {VENDORS.filter((v) => VENDOR_VISIBLE[v.id]).map((v) => (
            <Pressable key={v.id} onPress={() => updateSettings({ preferredVendor: settings.preferredVendor === v.id ? null : v.id })} accessibilityRole="radio" accessibilityState={{ checked: settings.preferredVendor === v.id }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
              <Radio on={settings.preferredVendor === v.id} />
              <View style={{ flex: 1 }}>
                <Text style={k.strong}>{v.label}</Text>
                <Text style={k.muted}>{v.note}</Text>
              </View>
            </Pressable>
          ))}
          <Text style={[k.muted, { marginTop: 6 }]}>Blinkit and Zomato are parked until they offer an official way in.</Text>
        </Section>

        <Section title="Swiggy order history">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={k.strong}>Show what I could have cooked</Text>
              <Text style={k.muted}>Reads your recent Swiggy Food orders on this device only to compare them with cooking. Nothing from Swiggy is saved.</Text>
            </View>
            <Switch value={settings.swiggyOrderInsights} onValueChange={(v) => updateSettings({ swiggyOrderInsights: v })} accessibilityLabel="Show what I could have cooked" />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConnectRow({ label, connected, onConnect }: { label: string; connected: boolean | undefined; onConnect: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={k.body}>
        {label}: {connected == null ? '…' : connected ? 'connected' : 'not connected'}
      </Text>
      {connected === false ? (
        <Pressable onPress={onConnect} accessibilityRole="button" style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.accent }}>
          <Text style={{ color: '#06210F', fontWeight: '900' }}>Connect</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
