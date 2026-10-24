import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dishPhoto } from '../../components/dishes/parts';
import { useMealMoney } from '../../components/meals/MealPanel';
import { Bar, FadeIn, Glass, GradientButton } from '../../components/ui';
import { ScreenTop } from '../../components/vendors/kit';
import { getDish, researchNutrients } from '../../data/research';
import { FIBRE_TARGET, GOALS, useStore } from '../../lib/store';
import { dayMicros } from '../../services/dayNutrition';
import { caloriesSaved } from '../../services/dishDetail';
import { HOW_LABEL, MONEY_COLOR, SLOT_ICON, SLOT_LABEL, findMeal, howOf, timeLabel, type MealRow } from '../../services/meals';
import { colors, radius, type } from '../../theme';

/**
 * One meal from My Meals: what it gave you, what it cost or saved, where it
 * sits in your day, and the opt-in way to balance it. The balance link is never
 * pushed; it only appears as a button the person taps.
 */
export default function MealPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { days, profile, sex } = useStore();
  const meal = id ? findMeal(days, id) : null;
  if (!meal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Meal" subtitle={null} fallback="/track" />
        <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>This meal isn&apos;t in your history any more.</Text>
      </SafeAreaView>
    );
  }
  return <Body meal={meal} days={days} goal={GOALS[profile.goal]} sex={sex} />;
}

function Body({ meal, days, goal, sex }: { meal: MealRow; days: ReturnType<typeof useStore>['days']; goal: { kcal: number; protein: number; label: string }; sex: 'male' | 'female' | null }) {
  const { dish, money } = useMealMoney(meal);
  const how = howOf(meal);
  const photo = dish ? dishPhoto(dish.id) : null;
  const n = dish?.nutritionPerServing;
  const date = new Date(meal.at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  // Macro split in calories (4 / 4 / 9 per gram), from the recipe's own numbers.
  const split = n && n.proteinG != null && n.carbsG != null && n.fatG != null ? { protein: n.proteinG * 4, carbs: n.carbsG * 4, fat: n.fatG * 9 } : null;

  const dayMeals = days[meal.dateKey]?.meals ?? [];
  const dayKcal = dayMeals.reduce((t, m) => t + m.kcal, 0) || 1;
  const micro = dayMicros([{ dishId: meal.dishId, kcal: meal.kcal, protein: meal.protein, fibre: meal.fibre }], getDish, researchNutrients, sex === 'female' ? 'adult_female' : 'adult_male')
    .filter((b) => b.fraction != null && b.amount > 0)
    .sort((a, b) => (b.fraction ?? 0) - (a.fraction ?? 0))
    .slice(0, 5);

  // Everything the person has logged of this dish.
  const history = meal.dishId ? Object.values(days).flatMap((d) => d.meals).filter((m) => m.dishId === meal.dishId) : [];
  const times = history.length;
  const cooks = history.filter((m) => howOf(m) === 'cooked').length;
  const kcalGap = dish ? caloriesSaved(dish) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title={meal.name} subtitle={`${SLOT_ICON[meal.slot]} ${SLOT_LABEL[meal.slot]} · ${timeLabel(meal.at)}`} fallback="/track" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 70 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <View style={styles.hero}>
            {photo ? <Image source={photo.source} style={styles.photo} accessibilityIgnoresInvertColors /> : <View style={[styles.photo, styles.emoji]}><Text style={{ fontSize: 44 }}>{meal.emoji}</Text></View>}
            <View style={{ flex: 1 }}>
              <Text style={styles.how}>{HOW_LABEL[how]}</Text>
              <Text style={[type.small, { color: colors.muted }]}>{date}</Text>
              {money ? <Text style={[styles.moneyBig, { color: colors[MONEY_COLOR[money.kind]] }]}>{money.label}</Text> : <Text style={[type.small, { color: colors.faint, marginTop: 6 }]}>No price research for this one yet.</Text>}
              <Text style={styles.kcalSmall}>{meal.kcal} kcal</Text>
            </View>
          </View>
        </FadeIn>

        {money ? (
          <FadeIn i={1}>
            <Glass style={[styles.note, { borderColor: colors[MONEY_COLOR[money.kind]] }]}>
              <Text style={{ color: colors.text, lineHeight: 20 }}>
                {how === 'cooked'
                  ? `You cooked this. Ordering it would have cost about ₹${meal.orderInr ?? '?'}; cooking cost about ₹${meal.costInr ?? '?'}.`
                  : how === 'ordered'
                    ? 'You ordered this. Cooking the same dish would have been cheaper, and you would have picked the oil and salt.'
                    : 'You logged this without saying how it was made. If you cook it next time, that is the saving.'}
              </Text>
            </Glass>
          </FadeIn>
        ) : null}

        <FadeIn i={2}>
          <Text style={styles.h}>What you gained</Text>
          <Glass>
            <Gain label="Calories" value={meal.kcal} unit="kcal" target={goal.kcal} color={colors.warm} />
            <Gain label="Protein" value={meal.protein} unit="g" target={goal.protein} color={colors.accent} />
            <Gain label="Fibre" value={meal.fibre} unit="g" target={FIBRE_TARGET} color={colors.blue} />
            <Text style={[type.small, { color: colors.faint, marginTop: 6 }]}>Share of your {goal.label.toLowerCase()} daily goal. General information, not medical advice.</Text>
          </Glass>
        </FadeIn>

        {split ? (
          <FadeIn i={3}>
            <Text style={styles.h}>Where the calories come from</Text>
            <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Donut parts={[{ v: split.protein, c: colors.accent }, { v: split.carbs, c: colors.warn }, { v: split.fat, c: colors.violet }]} />
              <View style={{ flex: 1, gap: 6 }}>
                <Legend color={colors.accent} label="Protein" g={n!.proteinG!} pct={pct(split.protein, split)} />
                <Legend color={colors.warn} label="Carbs" g={n!.carbsG!} pct={pct(split.carbs, split)} />
                <Legend color={colors.violet} label="Fat" g={n!.fatG!} pct={pct(split.fat, split)} />
              </View>
            </Glass>
          </FadeIn>
        ) : null}

        {micro.length ? (
          <FadeIn i={4}>
            <Text style={styles.h}>Vitamins and minerals it brought</Text>
            <Glass>
              {micro.map((b) => (
                <View key={b.id} style={{ marginTop: 8 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.label}>{b.label}</Text>
                    <Text style={styles.small}>{Math.round((b.fraction ?? 0) * 100)}% of a day</Text>
                  </View>
                  <Bar progress={Math.min(1, b.fraction ?? 0)} color={colors.accent} height={8} />
                </View>
              ))}
              <Text style={[type.small, { color: colors.faint, marginTop: 8 }]}>From the recipe research; partial estimates, so real amounts can differ.</Text>
            </Glass>
          </FadeIn>
        ) : null}

        <FadeIn i={5}>
          <Text style={styles.h}>This meal in your day</Text>
          <Glass>
            <View style={styles.dayBar}>
              {dayMeals.map((m, i) => (
                <View key={m.id ?? i} style={{ flex: Math.max(0.04, m.kcal / dayKcal), backgroundColor: m.id === meal.id ? colors.accent : colors.cardAlt, borderRadius: 4 }} />
              ))}
            </View>
            <Text style={[type.small, { color: colors.muted, marginTop: 8 }]}>
              {Math.round((meal.kcal / dayKcal) * 100)}% of the {dayKcal} kcal you logged that day ({dayMeals.length} {dayMeals.length === 1 ? 'meal' : 'meals'}).
            </Text>
          </Glass>
        </FadeIn>

        {dish ? (
          <FadeIn i={6}>
            <Text style={styles.h}>Scores</Text>
            <Glass>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Healthiness (research)</Text>
                <Text style={styles.strong}>{dish.healthiness?.score != null ? `${dish.healthiness.score}/10` : 'Coming soon'}</Text>
              </View>
              {dish.healthiness?.restaurantScore != null ? (
                <View style={[styles.rowBetween, { marginTop: 6 }]}>
                  <Text style={styles.label}>Restaurant version</Text>
                  <Text style={styles.strong}>{dish.healthiness.restaurantScore}/10</Text>
                </View>
              ) : null}
              {kcalGap != null && kcalGap > 0 ? <Text style={[type.small, { color: colors.accent, marginTop: 8 }]}>Home-cooked is about {kcalGap} kcal lighter than the restaurant version.</Text> : null}
            </Glass>
          </FadeIn>
        ) : null}

        {times > 1 ? (
          <FadeIn i={7}>
            <Text style={styles.h}>Your history with this dish</Text>
            <Glass>
              <Text style={{ color: colors.text, lineHeight: 20 }}>
                You&apos;ve had {meal.name} {times} times, and cooked it {cooks} {cooks === 1 ? 'time' : 'times'}.
              </Text>
            </Glass>
          </FadeIn>
        ) : null}

        <FadeIn i={8}>
          <Text style={styles.h}>What next</Text>
          <GradientButton title="⚖️  See ways to balance this" variant="glass" onPress={() => router.push({ pathname: '/balance', params: { kcal: String(meal.kcal), ...(meal.dishId ? { dish: meal.dishId } : {}) } })} />
          {dish ? (
            <>
              <GradientButton title="📖  Open the dish page" variant="glass" style={{ marginTop: 10 }} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: dish.id } })} />
              <GradientButton title="🍳  Cook it again" style={{ marginTop: 10 }} onPress={() => router.push({ pathname: '/basket', params: { dishes: dish.id, servings: '2' } })} />
            </>
          ) : null}
          <Text style={[type.small, { color: colors.faint, marginTop: 14, textAlign: 'center' }]}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.faint} /> Balancing is your choice. Nothing is suggested unless you tap.
          </Text>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const pct = (v: number, s: { protein: number; carbs: number; fat: number }) => Math.round((v / (s.protein + s.carbs + s.fat)) * 100);

function Gain({ label, value, unit, target, color }: { label: string; value: number; unit: string; target: number; color: string }) {
  const f = target ? value / target : 0;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.small}>
          {value} {unit} · {Math.round(f * 100)}%
        </Text>
      </View>
      <Bar progress={Math.min(1, f)} color={color} height={10} />
    </View>
  );
}

function Legend({ color, label, g, pct: p }: { color: string; label: string; g: number; pct: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={[styles.label, { flex: 1 }]}>{label}</Text>
      <Text style={styles.small}>
        {Math.round(g)} g · {p}%
      </Text>
    </View>
  );
}

/** A ring split into coloured arcs. */
function Donut({ parts }: { parts: { v: number; c: string }[] }) {
  const total = parts.reduce((t, p) => t + p.v, 0) || 1;
  const r = 38;
  const C = 2 * Math.PI * r;
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((t, p) => t + (p.v / total) * C, 0));
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100" accessibilityLabel="Calorie split ring">
      <Circle cx={50} cy={50} r={r} stroke={colors.cardAlt} strokeWidth={14} fill="none" />
      {parts.map((p, i) => {
        const len = (p.v / total) * C;
        return <Circle key={i} cx={50} cy={50} r={r} stroke={p.c} strokeWidth={14} fill="none" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-starts[i]} rotation={-90} origin="50, 50" />;
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  photo: { width: 110, height: 110, borderRadius: radius.lg, backgroundColor: colors.card },
  emoji: { alignItems: 'center', justifyContent: 'center' },
  how: { color: colors.text, fontWeight: '900', fontSize: 18 },
  moneyBig: { fontWeight: '900', fontSize: 17, marginTop: 8 },
  kcalSmall: { color: colors.faint, fontSize: 12, fontWeight: '700', marginTop: 2 },
  note: { marginTop: 14, borderWidth: 1 },
  h: { color: colors.text, fontWeight: '900', fontSize: 17, marginTop: 22, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { color: colors.text, fontWeight: '700', fontSize: 14 },
  small: { color: colors.muted, fontSize: 12.5, fontWeight: '700' },
  strong: { color: colors.text, fontWeight: '900', fontSize: 15 },
  dayBar: { flexDirection: 'row', height: 16, gap: 3 },
});
