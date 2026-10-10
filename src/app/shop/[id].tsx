import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bar, Chip, Glass, GradientButton, PressableScale } from '../../components/ui';
import { costToMake, getDish, scaleQty } from '../../data/dishes';
import { select, success } from '../../lib/haptics';
import { colors, radius, type } from '../../theme';

export default function ShopScreen() {
  const { id, servings: s } = useLocalSearchParams<{ id: string; servings?: string }>();
  const dish = getDish(id);
  const servings = Number(s) || dish?.baseServings || 2;
  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(null);
  if (!dish) return null;

  const done = dish.ingredients.filter((i) => checked[i.name]).length;
  const all = done === dish.ingredients.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        <PressableScale onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <View style={{ alignItems: 'center' }}>
          <Text style={[type.h2, { color: colors.text }]}>
            {dish.emoji} {dish.name}
          </Text>
          <Text style={[type.small, { color: colors.muted }]}>
            for {servings} · about ₹{costToMake(dish, servings)}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="🏪 At the supermarket" active={mode === 'offline'} onPress={() => setMode('offline')} />
          <Chip label="📦 Order online" active={mode === 'online'} onPress={() => setMode('online')} />
        </View>

        {mode === 'offline' ? (
          <Glass style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>
                {done} of {dish.ingredients.length} in the basket
              </Text>
              <Text style={{ color: colors.muted }}>tap a name for brands</Text>
            </View>
            <Bar progress={done / dish.ingredients.length} />
          </Glass>
        ) : (
          <Text style={{ color: colors.muted, marginTop: 14 }}>
            In the full app each item opens Blinkit, Zepto or Instamart with the brand you pick. Here the buttons are placeholders.
          </Text>
        )}

        <View style={{ marginTop: 12 }}>
          {dish.ingredients.map((i) => {
            const isOpen = open === i.name;
            const on = !!checked[i.name];
            return (
              <Animated.View key={i.name} layout={LinearTransition.springify().damping(18)} style={[styles.item, on && mode === 'offline' && { opacity: 0.5 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {mode === 'offline' ? (
                    <PressableScale
                      haptic={false}
                      scaleTo={0.8}
                      onPress={() => {
                        if (on) select();
                        else success();
                        setChecked({ ...checked, [i.name]: !on });
                      }}
                      style={[styles.box, on && styles.boxOn]}
                    >
                      {on ? <Ionicons name="checkmark" size={16} color="#06210F" /> : null}
                    </PressableScale>
                  ) : null}
                  <PressableScale haptic={false} scaleTo={0.99} style={{ flex: 1 }} onPress={() => setOpen(isOpen ? null : i.name)}>
                    <Text style={[styles.name, on && mode === 'offline' && { textDecorationLine: 'line-through' }]}>{i.name}</Text>
                    <Text style={[type.small, { color: colors.muted }]}>
                      {scaleQty(i.qty, dish, servings)} {i.unit} · {i.brands.length} {i.brands.length === 1 ? 'option' : 'brands'}
                    </Text>
                  </PressableScale>
                  {mode === 'online' ? (
                    <PressableScale style={styles.buy} onPress={() => Alert.alert('Demo', `This would open ${i.name} on Blinkit or Zepto.`)}>
                      <Text style={styles.buyText}>Add</Text>
                    </PressableScale>
                  ) : (
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} />
                  )}
                </View>
                {isOpen ? (
                  <Animated.View entering={RFadeIn.duration(200)} exiting={FadeOut.duration(120)} style={styles.brands}>
                    {i.look ? <Text style={[type.small, { color: colors.muted, marginBottom: 8 }]}>👀 {i.look}</Text> : null}
                    {i.brands.map((b, bi) => (
                      <View key={b.name} style={styles.brandRow}>
                        <Text style={{ color: colors.text, flex: 1, fontWeight: '600' }}>
                          {b.name}
                          {bi === 0 && i.brands.length > 1 ? <Text style={styles.pick}>  ★ users pick this</Text> : null}
                        </Text>
                        <Text style={{ color: colors.muted }}>
                          {b.pack} · ~₹{b.price}
                        </Text>
                      </View>
                    ))}
                  </Animated.View>
                ) : null}
              </Animated.View>
            );
          })}
        </View>

        {mode === 'offline' && all ? (
          <Animated.View entering={RFadeIn}>
            <GradientButton title="Got everything. Let's cook 🔥" style={{ marginTop: 16 }} onPress={() => router.replace({ pathname: '/cook/[id]', params: { id: dish.id, servings: String(servings) } })} />
          </Animated.View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  item: { padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  buy: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  buyText: { color: '#06210F', fontWeight: '900' },
  brands: { marginTop: 12, marginLeft: 38, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 },
  brandRow: { flexDirection: 'row', paddingVertical: 5, gap: 8 },
  pick: { color: colors.accent, fontSize: 11, fontWeight: '800' },
});
