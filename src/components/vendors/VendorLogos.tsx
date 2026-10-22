import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../../theme';

/** Text placeholders in each app's colour, not their real logos, while hook-ups are paused. */
export const VENDOR_MARKS = {
  swiggy: { name: 'Swiggy', letter: 'S', bg: '#FC8019' },
  zomato: { name: 'Zomato', letter: 'Z', bg: '#E23744' },
  instamart: { name: 'Instamart', letter: 'I', bg: '#FC8019' },
  zepto: { name: 'Zepto', letter: 'Z', bg: '#5B1E9E' },
  blinkit: { name: 'Blinkit', letter: 'B', bg: '#C9A227' },
} as const;
export type VendorMark = keyof typeof VENDOR_MARKS;

export function VendorLogo({ vendor, size = 36 }: { vendor: VendorMark; size?: number }) {
  const v = VENDOR_MARKS[vendor];
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: v.bg }]} accessibilityLabel={`${v.name} (coming with the app)`}>
      <Text style={[styles.letter, { fontSize: size * 0.45 }]}>{v.letter}</Text>
    </View>
  );
}

/** A row of vendor placeholders with their names and one "Coming with the app" note. */
export function VendorPlaceholders({ vendors }: { vendors: VendorMark[] }) {
  return (
    <View>
      <View style={styles.row}>
        {vendors.map((v) => (
          <View key={v} style={styles.item}>
            <VendorLogo vendor={v} size={32} />
            <Text style={styles.name} numberOfLines={1}>
              {VENDOR_MARKS[v].name}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.soon}>
        <Text style={styles.soonText}>Coming with the app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center', justifyContent: 'center', opacity: 0.9 },
  letter: { color: '#fff', fontWeight: '900' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 12, paddingLeft: 4, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.text, fontWeight: '700', fontSize: 13 },
  soon: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(255,181,71,0.15)' },
  soonText: { color: colors.warn, fontSize: 11.5, fontWeight: '800' },
});
