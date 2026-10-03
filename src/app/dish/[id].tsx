import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ServingsPicker from '../../components/ServingsPicker';
import { Button, Card, SectionTitle, Stat, styles as ui } from '../../components/ui';
import { costToMake, costToOrder, getDish, kmToBurn, scaleQty } from '../../data/dishes';
import { colors } from '../../theme';

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={ui.muted}>{label}</Text>
        <Text style={[ui.muted, { color }]}>{score}/10</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${score * 10}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function DishScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dish = getDish(id);
  const [servings, setServings] = useState(dish?.baseServings ?? 2);
  if (!dish) return <Text style={[ui.body, { padding: 16 }]}>Dish not found.</Text>;

  const make = costToMake(dish, servings);
  const order = costToOrder(dish, servings);
  const params = { id: dish.id, servings: String(servings) };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.emoji}>{dish.emoji}</Text>
      <Text style={styles.title}>{dish.name}</Text>
      <Text style={[ui.muted, { marginBottom: 16 }]}>{dish.tagline}</Text>

      <Card>
        <View style={{ flexDirection: 'row' }}>
          <Stat label="kcal per plate" value={`${dish.kcal}`} hint={`Restaurant: ~${dish.restaurantKcal}`} />
          <Stat label="protein" value={`${dish.proteinG} g`} />
          <Stat label="time" value={`${dish.timeMins} min`} />
          <Stat label="difficulty" value={dish.difficulty} />
        </View>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <ServingsPicker value={servings} onChange={setServings} />
        <View style={styles.costRow}>
          <View style={{ flex: 1 }}>
            <Text style={ui.muted}>Make at home</Text>
            <Text style={[styles.cost, { color: colors.accent }]}>₹{make}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={ui.muted}>Order on Swiggy / Zomato</Text>
            <Text style={[styles.cost, { color: colors.bad }]}>₹{order}</Text>
          </View>
        </View>
        <Text style={styles.verdict}>
          Cooking saves you ₹{order - make} ({Math.round(((order - make) / order) * 100)}%).
        </Text>
        <Text style={[ui.muted, { marginTop: 6, fontSize: 11 }]}>Demo prices are estimates for Mumbai.</Text>
      </Card>

      <SectionTitle>How healthy is it?</SectionTitle>
      <Card>
        <ScoreBar label="Made at home" score={dish.healthScore} color={colors.accent} />
        <ScoreBar label="Typical restaurant version" score={dish.restaurantHealthScore} color={colors.warn} />
        {dish.healthNotes.map((n) => (
          <Text key={n} style={[ui.body, { marginTop: 6 }]}>
            • {n}
          </Text>
        ))}
        <Text style={[ui.muted, { marginTop: 10 }]}>
          🏃 One plate ≈ {kmToBurn(dish.kcal)} km of running to burn off.
        </Text>
      </Card>

      <SectionTitle>Ingredients</SectionTitle>
      <Card>
        {dish.ingredients.map((i) => (
          <View key={i.name} style={styles.ingRow}>
            <Text style={[ui.body, { flex: 1 }]}>{i.name}</Text>
            <Text style={ui.muted}>
              {scaleQty(i.qty, dish, servings)} {i.unit}
            </Text>
          </View>
        ))}
      </Card>

      <SectionTitle>Equipment</SectionTitle>
      <Card>
        {dish.equipment.map((e) => (
          <View key={e.name} style={{ marginBottom: 8 }}>
            <Text style={ui.body}>{e.name}</Text>
            {e.alternative ? <Text style={ui.muted}>No {e.name.toLowerCase()}? {e.alternative}.</Text> : null}
          </View>
        ))}
      </Card>

      <View style={{ gap: 10, marginTop: 24 }}>
        <Button title="Start cooking" onPress={() => router.push({ pathname: '/cook/[id]', params })} />
        <Button
          title="Get the ingredients"
          variant="secondary"
          onPress={() => router.push({ pathname: '/shop/[id]', params })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 56 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 4 },
  costRow: { flexDirection: 'row', marginTop: 16 },
  cost: { fontSize: 28, fontWeight: '900', marginTop: 2 },
  verdict: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 12 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.cardAlt, marginTop: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  ingRow: { flexDirection: 'row', paddingVertical: 6, gap: 12 },
});
