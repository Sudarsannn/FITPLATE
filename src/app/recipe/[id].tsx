import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishImageSlot, TagChip } from '../../components/dishes/parts';
import { factsLine } from '../../components/dishes/ResearchDishCard';
import { PressableScale } from '../../components/ui';
import { familyOf, getDish } from '../../data/research';
import type { Dish } from '../../models/research';
import { headlineOrderPrice, orderPriceNote } from '../../services/dishLibrary';
import { colors, radius, type } from '../../theme';

/**
 * Day 6: what a research dish shows when tapped in the library. Day 7 turns
 * this into the full dish detail (nutrition, cost, equipment, storage, sources).
 */
export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dish = id ? getDish(id) : undefined;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/cook'));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        <PressableScale onPress={back} style={styles.back} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
      </View>
      {dish ? (
        <DishBody dish={dish} />
      ) : (
        <View style={styles.missing}>
          <Text style={{ fontSize: 40 }}>🍽️</Text>
          <Text style={[type.h2, { color: colors.text, marginTop: 8 }]}>Dish not found</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>It may have been renamed in an update. Find it again in the Cook tab.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function DishBody({ dish }: { dish: Dish }) {
  const n = dish.nutritionPerServing;
  const price = headlineOrderPrice(dish);
  const family = familyOf(dish);
  const dietTags = dish.tags.filter((t) => !t.startsWith('Contains '));
  const allergenTags = dish.tags.filter((t) => t.startsWith('Contains '));
  const variants = dish.variants.filter((v) => v.status === 'variant' || v.status === 'not-appropriate');

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center' }}>
        <DishImageSlot dish={dish} size={150} />
      </View>
      <Text style={[type.h1, { color: colors.text, marginTop: 16 }]} accessibilityRole="header">
        {dish.name}
      </Text>
      <Text style={styles.muted}>{factsLine(dish)}</Text>
      <View style={styles.chips}>
        {[...dietTags.slice(0, 8), ...allergenTags].map((t) => (
          <TagChip key={t} label={t} />
        ))}
      </View>
      {dish.description ? <Text style={styles.body}>{dish.description}</Text> : null}
      {allergenTags.length ? <Text style={styles.note}>Allergens are worked out from the recipe. Check labels if you have an allergy.</Text> : null}

      <Section title="Per serving (home-cooked)">
        <View style={styles.grid}>
          <Fact label="Calories" value={n.kcal != null ? `${Math.round(n.kcal)} kcal` : null} />
          <Fact label="Protein" value={n.proteinG != null ? `${n.proteinG} g` : null} />
          <Fact label="Carbs" value={n.carbsG != null ? `${n.carbsG} g` : null} />
          <Fact label="Fat" value={n.fatG != null ? `${n.fatG} g` : null} />
          <Fact label="Fibre" value={n.fibreG != null ? `${n.fibreG} g` : null} />
        </View>
      </Section>

      <Section title="Scores">
        <Text style={styles.body}>
          Healthiness score: <Text style={styles.strong}>{dish.healthiness?.score != null ? `${dish.healthiness.score}/10` : 'Coming soon'}</Text>
        </Text>
        <Text style={styles.body}>
          Rating: <Text style={styles.strong}>{dish.researchRating?.score != null ? `★ ${dish.researchRating.score}` : 'Coming soon'}</Text>
        </Text>
        <Text style={styles.note}>Rating is FitPlate&apos;s research of what people say online, not user or restaurant ratings.</Text>
      </Section>

      <Section title="To order">
        {price ? (
          <Text style={styles.body}>
            About <Text style={styles.strong}>₹{price.avg}</Text> (usually ₹{price.min}–{price.max}){price.observed ? `, seen ${price.observed}` : ''}
          </Text>
        ) : (
          <Text style={styles.body}>Order price not confirmed yet.</Text>
        )}
        {orderPriceNote(dish) ? <Text style={styles.note}>{orderPriceNote(dish)}</Text> : null}
      </Section>

      {variants.length || family.length ? (
        <Section title="Other versions">
          {family.map((f) => (
            <PressableScale key={f.id} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: f.id } })} style={styles.link} scaleTo={0.98}>
              <Text style={styles.linkText}>{f.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableScale>
          ))}
          {variants.map((v) => (
            <Text key={v.category} style={styles.body}>
              <Text style={styles.strong}>{v.category}: </Text>
              {v.status === 'variant' ? (v.name ?? 'researched version') : `not suitable${v.reason ? ` (${v.reason})` : ''}`}
            </Text>
          ))}
        </Section>
      ) : null}

      <Section title={`Ingredients (1 serving, ${dish.ingredients.length})`}>
        {dish.ingredients.map((i, k) => (
          <Text key={`${i.name}-${k}`} style={styles.body}>
            • {i.name}
            {i.quantity != null ? <Text style={styles.muted}>{`  ${i.quantity}${i.unit ? ` ${i.unit}` : ''}`}</Text> : i.householdMeasure ? <Text style={styles.muted}>{`  ${i.householdMeasure}`}</Text> : null}
          </Text>
        ))}
      </Section>

      <Text style={[styles.note, { marginTop: 18 }]}>Full recipe steps, cost to make and guided cooking arrive in the next updates.</Text>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[type.label, { color: colors.muted, marginBottom: 8 }]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value ?? '—'}</Text>
      <Text style={styles.muted}>{value ? label : `${label}: coming soon`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 4 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  scroll: { padding: 18, paddingBottom: 60 },
  muted: { color: colors.muted, fontSize: 13 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 4 },
  strong: { fontWeight: '800', color: colors.text },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  section: { marginTop: 16, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fact: { minWidth: 90, flexGrow: 1 },
  factValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  missing: { alignItems: 'center', padding: 30 },
});
