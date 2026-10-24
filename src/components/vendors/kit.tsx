import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '../ui';
import { colors, radius, type } from '../../theme';

/** Back button + title row used by the shopping and checkout screens. */
export function ScreenTop({ title, subtitle, fallback = '/(tabs)', right }: { title: string; subtitle?: string | null; fallback?: string; right?: ReactNode }) {
  return (
    <View style={k.top}>
      <PressableScale onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback as never))} style={k.back} accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </PressableScale>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={[type.h2, { color: colors.text, textAlign: 'center' }]} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text style={[type.small, { color: colors.muted, textAlign: 'center' }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/** Says plainly that nothing here is real when the vendor is in sample mode. */
export function SampleBanner({ what = 'prices, products and orders' }: { what?: string }) {
  return (
    <View style={k.banner} accessibilityRole="text">
      <Text style={k.bannerText}>Sample mode: the {what} here are made up. Nothing is ordered and nothing is paid.</Text>
    </View>
  );
}

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <View style={k.section}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={[type.label, { color: colors.muted }]} accessibilityRole="header">
          {title}
        </Text>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'bad' | 'ok'; children: ReactNode }) {
  const c = tone === 'bad' ? colors.bad : tone === 'warn' ? colors.warn : tone === 'ok' ? colors.accent : colors.blue;
  return (
    <View style={[k.notice, { borderColor: c }]}>
      <Text style={{ color: colors.text, fontSize: 13.5, lineHeight: 19 }}>{children}</Text>
    </View>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 }}>
      <ActivityIndicator color={colors.accent} />
      <Text style={{ color: colors.muted }}>{label}</Text>
    </View>
  );
}

export function Checkbox({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label} style={[k.box, on && k.boxOn]}>
      {on ? <Ionicons name="checkmark" size={16} color="#06210F" /> : null}
    </Pressable>
  );
}

export function Radio({ on }: { on: boolean }) {
  return <View style={[k.radio, on && k.radioOn]}>{on ? <View style={k.radioDot} /> : null}</View>;
}

/** The small Zepto circle under each brand / pack (P3b). */
export function ZeptoCircle({ onPress, exact }: { onPress: () => void; exact: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="link" accessibilityLabel={exact ? 'Open this item in Zepto' : 'Open Zepto'} style={[k.zepto, !exact && { opacity: 0.6 }]}>
      <Text style={k.zeptoText}>Z</Text>
    </Pressable>
  );
}

export function BillRows({ rows, total }: { rows: { label: string; amount: number }[]; total: number | null }) {
  return (
    <View>
      {rows.map((r) => (
        <View key={r.label} style={k.billRow}>
          <Text style={{ color: colors.muted }}>{r.label}</Text>
          <Text style={{ color: r.amount < 0 ? colors.accent : colors.text }}>{r.amount < 0 ? `−₹${-r.amount}` : `₹${r.amount}`}</Text>
        </View>
      ))}
      {total != null ? (
        <View style={[k.billRow, { borderTopWidth: 1, borderColor: colors.border, marginTop: 6, paddingTop: 8 }]}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>To pay</Text>
          <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }}>₹{total}</Text>
        </View>
      ) : null}
    </View>
  );
}

export const k = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, gap: 8 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  banner: { marginTop: 10, padding: 10, borderRadius: radius.sm, backgroundColor: 'rgba(90,200,250,0.10)', borderWidth: 1, borderColor: 'rgba(90,200,250,0.35)' },
  bannerText: { color: colors.text, fontSize: 12.5, lineHeight: 17 },
  section: { marginTop: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  notice: { marginTop: 10, padding: 12, borderRadius: radius.sm, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  zepto: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#5B1E9E', alignItems: 'center', justifyContent: 'center' },
  zeptoText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  muted: { color: colors.muted, fontSize: 13 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  strong: { color: colors.text, fontWeight: '800' },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(61,220,132,0.15)', overflow: 'hidden' },
  pillText: { color: colors.accent, fontSize: 11, fontWeight: '800' },
});
