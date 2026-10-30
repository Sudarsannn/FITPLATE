import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useStore } from '../../lib/store';
import type { Dish } from '../../models/research';
import { headlineOrderPrice } from '../../services/dishLibrary';
import { dishCost } from '../../services/vendors';
import { colors, radius, type } from '../../theme';
import { Chip, GradientButton } from '../ui';
import { Stepper } from './EditLog';

type How = 'cooked' | 'ordered' | 'logged';

/**
 * Day 13: log a FitPlate dish with how many servings and how you got it. "I cooked it"
 * also records the cook and what it saved; "Ordered" takes the price you paid.
 */
export function LogDishCard({ dish, onDone, onCancel }: { dish: Dish; onDone: () => void; onCancel: () => void }) {
  const { logDish, logResearchCook } = useStore();
  const [servings, setServings] = useState(1);
  const [how, setHow] = useState<How>('logged');
  const [paid, setPaid] = useState('');
  const n = dish.nutritionPerServing;

  const submit = () => {
    if (how === 'cooked') {
      const cost = dishCost(dish, servings);
      const order = headlineOrderPrice(dish);
      const eaten = (v: number | null) => (v == null ? null : v * servings);
      logResearchCook({ id: dish.id, name: dish.name, kcal: eaten(n.kcal), proteinG: eaten(n.proteinG), fibreG: eaten(n.fibreG) }, servings, cost?.inr ?? null, order ? order.avg * servings : null, 'self');
    } else if (how === 'ordered') {
      const price = Number(paid.replace(',', '.'));
      logDish(dish, 'ordered', Number.isFinite(price) && price > 0 ? price / servings : null, servings);
    } else {
      logDish(dish, 'logged', null, servings);
    }
    onDone();
  };

  return (
    <View style={styles.card}>
      <Text style={[type.h2, { color: colors.text }]}>{dish.name}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{n.kcal != null ? `${Math.round(n.kcal * servings)} kcal for ${servings} serving${servings === 1 ? '' : 's'}` : 'Calories not researched yet'}</Text>
      <Text style={styles.label}>Servings</Text>
      <Stepper value={servings} onChange={setServings} min={0.5} max={10} step={0.5} />
      <Text style={styles.label}>How did you get it?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip label="Just ate it" active={how === 'logged'} onPress={() => setHow('logged')} />
        <Chip label="I cooked it" active={how === 'cooked'} onPress={() => setHow('cooked')} />
        <Chip label="Ordered" active={how === 'ordered'} onPress={() => setHow('ordered')} />
      </View>
      {how === 'ordered' ? <TextInput value={paid} onChangeText={setPaid} placeholder="What you paid in total, ₹ (optional)" keyboardType="numeric" placeholderTextColor={colors.faint} style={styles.field} accessibilityLabel="Amount paid" /> : null}
      <GradientButton title="Log it" onPress={submit} />
      <Text onPress={onCancel} style={styles.cancel} accessibilityRole="button">
        Choose a different dish
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent, marginBottom: 12 },
  label: { color: colors.muted, fontWeight: '800', fontSize: 12, marginTop: 4 },
  field: { color: colors.text, fontSize: 15, height: 44, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: colors.cardAlt },
  cancel: { color: colors.muted, fontWeight: '700', textAlign: 'center', paddingVertical: 8 },
});
