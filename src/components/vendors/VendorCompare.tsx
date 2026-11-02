import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { VendorListing } from '../../models/research';
import { openExternal } from '../../services/vendors/openApp';
import { cheapestVendor, vendorRows } from '../../services/vendors/vendorCompare';
import { featureFlags } from '../../config/featureFlags';
import { colors, radius } from '../../theme';
import { VendorLogo } from './VendorLogos';

/** Shopping list: what each vendor was seen charging for this ingredient. Tap a logo to search it there. Flag `vendorLinks`. */
export function VendorCompare({ name, listings }: { name: string; listings?: VendorListing[] }) {
  if (!featureFlags.vendorLinks) return null;
  const rows = vendorRows(listings, name, featureFlags.vendorBlinkit);
  const best = cheapestVendor(rows);
  return (
    <View style={s.box} testID="vendor-compare">
      <Text style={s.title}>Seen on quick-commerce apps</Text>
      {rows.map((r) => (
        <Pressable
          key={r.vendor}
          disabled={!r.url}
          onPress={() => r.url && openExternal(r.url)}
          accessibilityRole="link"
          accessibilityLabel={`Search ${name} on ${r.name}. ${r.priceLabel}`}
          style={s.row}
        >
          <VendorLogo vendor={r.vendor} size={28} />
          <View style={{ flex: 1 }}>
            <Text style={s.price}>
              {r.name}: {r.priceLabel}
              {best === r.vendor ? ' (lowest seen)' : ''}
            </Text>
            {r.seenLabel ? <Text style={s.muted}>{r.seenLabel}</Text> : null}
          </View>
        </Pressable>
      ))}
      <Text style={s.muted}>Prices come from search snippets and may differ in your area. The app shows the real price.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { marginTop: 8, padding: 10, borderRadius: radius.md, backgroundColor: colors.cardAlt, gap: 6 },
  title: { color: colors.text, fontWeight: '800', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  price: { color: colors.text, fontWeight: '700', fontSize: 13 },
  muted: { color: colors.muted, fontSize: 11 },
});
