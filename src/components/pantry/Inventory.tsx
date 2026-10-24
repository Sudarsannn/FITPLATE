import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { researchIngredients } from '../../data/research';
import { select, success } from '../../lib/haptics';
import { useStore } from '../../lib/store';
import { addAmount, removeItem, setAmount, type Pantry } from '../../services/pantry';
import { ingredientKey, amountLabel } from '../../services/vendors/basket';
import { colors, radius, type } from '../../theme';
import { IconBadge } from '../Icon';
import { FadeIn, GradientButton, PressableScale } from '../ui';

const UNITS = ['g', 'ml', 'count'] as const;

/** Track > Ingredients: what is in the kitchen. Fills from "already bought" on a grocery list, and the user can edit every amount (shop bought, online or offline). */
export function Inventory() {
  const { settings, updateSettings } = useStore();
  const pantry = useMemo<Pantry>(() => settings.pantry ?? {}, [settings.pantry]);
  const rows = useMemo(() => Object.entries(pantry).sort(([, a], [, b]) => a.name.localeCompare(b.name)), [pantry]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('g');

  const save = (next: Pantry) => updateSettings({ pantry: next });
  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 2) return [];
    return researchIngredients.filter((i) => i.name.toLowerCase().includes(q) || i.aliases.some((a) => a.toLowerCase().includes(q))).slice(0, 5);
  }, [name]);

  const add = (ing: { id: string | null; name: string } | null) => {
    const label = (ing?.name ?? name).trim();
    const n = Number(qty);
    if (!label || !Number.isFinite(n) || n <= 0) return;
    const id = ing?.id ?? null;
    const key = ingredientKey(id, label);
    save(addAmount(pantry, key, { name: label, ingredientId: id }, n, unit === 'count' ? null : unit));
    setName('');
    setQty('');
    success();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 150 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <FadeIn i={0}>
        <Text style={[type.h1, { color: colors.text }]}>Ingredients</Text>
        <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>What is in your kitchen. Mark a grocery list as bought and it lands here. Edit any amount yourself, whether it came from a shop or an app.</Text>
      </FadeIn>

      <FadeIn i={1}>
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={[type.label, { color: colors.muted }]}>ADD SOMETHING YOU HAVE</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ingredient, for example toor dal" placeholderTextColor={colors.faint} style={[styles.input, { marginTop: 10 }]} accessibilityLabel="Ingredient name" />
          {suggestions.length ? (
            <View style={{ marginTop: 6 }}>
              {suggestions.map((s) => (
                <PressableScale key={s.id} onPress={() => setName(s.name)} style={styles.sugg} scaleTo={0.98} accessibilityLabel={`Use ${s.name}`}>
                  <Text style={{ color: colors.text }}>{s.name}</Text>
                </PressableScale>
              ))}
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <TextInput value={qty} onChangeText={setQty} placeholder="Amount" keyboardType="numeric" placeholderTextColor={colors.faint} style={[styles.input, { flex: 1, minWidth: 80 }]} accessibilityLabel="Amount" />
            {UNITS.map((u) => (
              <PressableScale key={u} onPress={() => setUnit(u)} style={[styles.unit, unit === u && styles.unitOn]} scaleTo={0.94} accessibilityLabel={`Unit ${u}`}>
                <Text style={{ color: unit === u ? '#06210F' : colors.muted, fontWeight: '800', fontSize: 13 }}>{u === 'count' ? 'pcs' : u}</Text>
              </PressableScale>
            ))}
          </View>
          <GradientButton
            title="Add to my ingredients"
            onPress={() => {
              const match = researchIngredients.find((i) => i.name.toLowerCase() === name.trim().toLowerCase());
              add(match ? { id: match.id, name: match.name } : null);
            }}
            disabled={!name.trim() || !(Number(qty) > 0)}
            style={{ marginTop: 12 }}
          />
        </View>
      </FadeIn>

      <FadeIn i={2}>
        {rows.length ? (
          <View style={{ marginTop: 18 }}>
            <Text style={[type.label, { color: colors.muted, marginBottom: 8 }]}>IN YOUR KITCHEN ({rows.length})</Text>
            {rows.map(([key, it]) => (
              <Row key={key} name={it.name} quantity={it.quantity} unit={it.unit} onChange={(q) => save(setAmount(pantry, key, q))} onRemove={() => save(removeItem(pantry, key))} />
            ))}
          </View>
        ) : (
          <View style={[styles.empty, { marginTop: 18 }]}>
            <IconBadge name="basket-outline" color={colors.accent} size={44} />
            <Text style={{ color: colors.text, fontWeight: '800', marginTop: 10 }}>Nothing here yet</Text>
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 19 }}>Plan your week, open the grocery list, and tap “Already bought it” to fill this in. Then every dish shows what you have and what you still need.</Text>
            <GradientButton title="Plan my week" variant="glass" onPress={() => router.push({ pathname: '/(tabs)/track', params: { view: 'plan' } })} style={{ marginTop: 14, alignSelf: 'stretch' }} />
          </View>
        )}
      </FadeIn>
    </ScrollView>
  );
}

function Row({ name, quantity, unit, onChange, onRemove }: { name: string; quantity: number | null; unit: string | null; onChange: (q: number | null) => void; onRemove: () => void }) {
  const [text, setText] = useState(quantity == null ? '' : String(quantity));
  const commit = (t: string) => {
    setText(t);
    const n = Number(t);
    if (t.trim() === '') onChange(null);
    else if (Number.isFinite(n) && n >= 0) onChange(n);
  };
  const step = (d: number) => {
    const base = Number(text) || 0;
    const next = Math.max(0, base + d);
    select();
    commit(String(next));
  };
  const hint = quantity != null && unit && quantity >= 1000 ? ` (${amountLabel(quantity, unit)})` : '';
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: colors.text, fontWeight: '800' }} numberOfLines={2}>
          {name}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>{unit ?? 'pieces'}{hint}</Text>
      </View>
      <PressableScale onPress={() => step(unit === 'g' || unit === 'ml' ? -50 : -1)} style={styles.step} scaleTo={0.9} accessibilityLabel={`Less ${name}`}>
        <Ionicons name="remove" size={16} color={colors.text} />
      </PressableScale>
      <TextInput value={text} onChangeText={commit} keyboardType="numeric" style={styles.qty} accessibilityLabel={`Amount of ${name}`} />
      <PressableScale onPress={() => step(unit === 'g' || unit === 'ml' ? 50 : 1)} style={styles.step} scaleTo={0.9} accessibilityLabel={`More ${name}`}>
        <Ionicons name="add" size={16} color={colors.text} />
      </PressableScale>
      <PressableScale onPress={onRemove} style={{ padding: 6 }} scaleTo={0.9} accessibilityLabel={`Remove ${name}`}>
        <Ionicons name="close-circle" size={22} color={colors.faint} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  input: { color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, backgroundColor: 'rgba(255,255,255,0.03)' },
  sugg: { paddingVertical: 9, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  unit: { paddingHorizontal: 8, height: 44, minWidth: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  unitOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  step: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  qty: { width: 64, textAlign: 'center', color: colors.text, fontWeight: '800', fontSize: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  empty: { alignItems: 'center', padding: 22, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
});
