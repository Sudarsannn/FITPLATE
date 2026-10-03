import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, styles as ui } from '../../components/ui';
import { costToMake, getDish, scaleQty } from '../../data/dishes';
import { colors } from '../../theme';

export default function ShopScreen() {
  const { id, servings: s } = useLocalSearchParams<{ id: string; servings?: string }>();
  const dish = getDish(id);
  const servings = Number(s) || dish?.baseServings || 2;
  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(null);
  if (!dish) return null;

  const done = dish.ingredients.filter((i) => checked[i.name]).length;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.title}>
        {dish.emoji} {dish.name} · {servings} {servings === 1 ? 'person' : 'people'}
      </Text>
      <Text style={ui.muted}>Estimated cost about ₹{costToMake(dish, servings)}</Text>

      <View style={styles.tabs}>
        {(['offline', 'online'] as const).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.tab, mode === m && styles.tabOn]}>
            <Text style={[styles.tabText, mode === m && { color: '#06210F' }]}>
              {m === 'offline' ? 'At the supermarket' : 'Order online'}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'offline' ? (
        <Text style={[ui.muted, { marginBottom: 10 }]}>
          Tick items off as you shop ({done}/{dish.ingredients.length}). Tap a name to see brands and prices.
        </Text>
      ) : (
        <Text style={[ui.muted, { marginBottom: 10 }]}>
          In the full app each item links to Blinkit, Zepto or Instamart. In this demo the buttons are placeholders.
        </Text>
      )}

      <Card style={{ paddingVertical: 4 }}>
        {dish.ingredients.map((i, idx) => {
          const isOpen = open === i.name;
          return (
            <View key={i.name} style={[styles.item, idx > 0 && styles.divider]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {mode === 'offline' ? (
                  <Pressable
                    onPress={() => setChecked({ ...checked, [i.name]: !checked[i.name] })}
                    style={[styles.box, checked[i.name] && styles.boxOn]}
                  >
                    {checked[i.name] ? <Text style={{ color: '#06210F', fontWeight: '900' }}>✓</Text> : null}
                  </Pressable>
                ) : null}
                <Pressable style={{ flex: 1 }} onPress={() => setOpen(isOpen ? null : i.name)}>
                  <Text style={[ui.body, checked[i.name] && styles.struck]}>{i.name}</Text>
                  <Text style={ui.muted}>
                    {scaleQty(i.qty, dish, servings)} {i.unit}
                  </Text>
                </Pressable>
                {mode === 'online' ? (
                  <Pressable
                    style={styles.buy}
                    onPress={() => Alert.alert('Demo', `This would open ${i.name} on Blinkit or Zepto.`)}
                  >
                    <Text style={styles.buyText}>Buy</Text>
                  </Pressable>
                ) : null}
              </View>
              {isOpen ? (
                <View style={styles.brands}>
                  {i.look ? <Text style={[ui.muted, { marginBottom: 6 }]}>👀 {i.look}</Text> : null}
                  {i.brands.map((b, bi) => (
                    <View key={b.name} style={styles.brandRow}>
                      <Text style={[ui.body, { flex: 1 }]}>
                        {b.name}
                        {bi === 0 && i.brands.length > 1 ? <Text style={styles.pick}>  users pick this</Text> : null}
                      </Text>
                      <Text style={ui.muted}>
                        {b.pack} · ~₹{b.price}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </Card>

      {mode === 'offline' && done === dish.ingredients.length ? (
        <View style={{ marginTop: 20 }}>
          <Button title="Got everything 🎉" onPress={() => Alert.alert('Nice!', 'Head back and tap Start cooking.')} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.text, fontWeight: '700' },
  item: { paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  struck: { textDecorationLine: 'line-through', color: colors.muted },
  buy: { backgroundColor: colors.cardAlt, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  buyText: { color: colors.accent, fontWeight: '800' },
  brands: { marginTop: 10, marginLeft: 38, backgroundColor: colors.cardAlt, borderRadius: 12, padding: 12 },
  brandRow: { flexDirection: 'row', paddingVertical: 4, gap: 8 },
  pick: { color: colors.accent, fontSize: 11, fontWeight: '700' },
});
