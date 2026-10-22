import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishImageSlot, PhotoCredit, SelectChip, TagChip, dishPhoto } from '../../components/dishes/parts';
import { factsLine } from '../../components/dishes/ResearchDishCard';
import { GradientButton, PressableScale } from '../../components/ui';
import { featureFlags } from '../../config/featureFlags';
import { familyOf, getDish, researchLinks } from '../../data/research';
import { useStore } from '../../lib/store';
import type { Dish } from '../../models/research';
import { rangeLabel, rupees, rupeesPer10gProtein, savingVsOrder, type DishCost } from '../../services/costToMake';
import {
  BALANCE_HIDE_LABEL,
  BALANCE_LABEL,
  burnWays,
  caloriesSaved,
  DEFAULT_WEIGHT_KG,
  durationLabel,
  hasPublishedOrdered,
  microRows,
  nutrientLabel,
  nutritionRows,
  quickFacts,
  researchUpdatesLine,
  shortDate,
  splitEquipment,
  splitSource,
  trendArrow,
} from '../../services/dishDetail';
import { headlineOrderPrice, makeCost, orderPriceNote } from '../../services/dishLibrary';
import { colors, radius, type } from '../../theme';

/**
 * Day 7: the full dish detail for a research dish. Every section renders for
 * every dish; anything research hasn't covered reads "Coming soon". The three
 * scores stay separate with their exact labels, and burn-off is opt-in
 * (SPEC-ADDENDA §8), never shown on its own.
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
  const family = familyOf(dish);
  const dietTags = dish.tags.filter((t) => !t.startsWith('Contains '));
  const allergenTags = dish.tags.filter((t) => t.startsWith('Contains '));
  const variants = dish.variants.filter((v) => v.status === 'variant' || v.status === 'not-appropriate');
  const photo = dishPhoto(dish.id);
  // Innovation (Day 07): "Jump to" chips; each anchor records its y on layout.
  const scrollRef = useRef<ScrollView>(null);
  const anchors = useRef<Partial<Record<JumpId, number>>>({});
  const record = useCallback((jump: JumpId, e: LayoutChangeEvent) => {
    anchors.current[jump] = e.nativeEvent.layout.y;
  }, []);
  const jumpTo = (jump: JumpId) => {
    const y = anchors.current[jump];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center' }}>
        <DishImageSlot dish={dish} size={photo ? 240 : 150} />
        {photo ? <PhotoCredit credit={photo.credit} /> : null}
        {photo ? (
          <Text style={styles.allCredits} onPress={() => router.push('/photo-credits')} accessibilityRole="link">
            All photo credits
          </Text>
        ) : null}
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

      {/* Priority plan P3: shop, cook step by step, or compare with ordering. */}
      <View style={{ gap: 10, marginTop: 16 }}>
        <GradientButton title="👩‍🍳 Cook it step by step" onPress={() => router.push({ pathname: '/steps/[id]', params: { id: dish.id, servings: '2' } })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <GradientButton title="🛒 Shop" variant="glass" onPress={() => router.push({ pathname: '/basket', params: { dishes: dish.id, servings: '2' } })} />
          </View>
          <View style={{ flex: 1 }}>
            <GradientButton title="⚖️ Order vs make" variant="glass" onPress={() => router.push({ pathname: '/order-vs-make', params: { q: dish.name } })} />
          </View>
        </View>
      </View>

      {featureFlags.dishJumpChips ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jumpRow} accessibilityLabel="Jump to a section">
          {JUMPS.map((j) => (
            <SelectChip key={j.id} label={j.label} selected={false} onPress={() => jumpTo(j.id)} />
          ))}
        </ScrollView>
      ) : null}

      <QuickFactsSection dish={dish} />
      <ScoresSection dish={dish} />
      <View onLayout={(e) => record('nutrition', e)}>
        <NutritionSection dish={dish} />
      </View>
      <View onLayout={(e) => record('vitamins', e)}>
        <MicroSection dish={dish} />
      </View>
      <View onLayout={(e) => record('price', e)}>
        <OrderSection dish={dish} />
        <MakeSection dish={dish} />
      </View>

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

      <View onLayout={(e) => record('ingredients', e)} />
      <Section title={`Ingredients (1 serving, ${dish.ingredients.length})`}>
        {dish.ingredients.length ? (
          dish.ingredients.map((i, k) => (
            <Text key={`${i.name}-${k}`} style={styles.body}>
              • {i.name}
              {i.quantity != null ? <Text style={styles.muted}>{`  ${i.quantity}${i.unit ? ` ${i.unit}` : ''}`}</Text> : i.householdMeasure ? <Text style={styles.muted}>{`  ${i.householdMeasure}`}</Text> : null}
            </Text>
          ))
        ) : (
          <Text style={styles.body}>Coming soon</Text>
        )}
      </Section>

      <EquipmentSection dish={dish} />

      <View onLayout={(e) => record('storage', e)} />
      <Section title="Storage and leftovers">
        <Text style={styles.subhead}>Keeping it</Text>
        <Text style={styles.body}>{dish.storage ?? 'Coming soon'}</Text>
        <Text style={[styles.subhead, { marginTop: 10 }]}>Leftover idea</Text>
        <Text style={styles.body}>{dish.leftoverRemix ?? 'Coming soon'}</Text>
      </Section>

      <BurnSection dish={dish} />
      <View onLayout={(e) => record('sources', e)}>
        <SourcesSection dish={dish} />
      </View>

      <Text style={[styles.note, { marginTop: 18, textAlign: 'center' }]}>{researchUpdatesLine(dish)}</Text>
      <Text style={[styles.note, { textAlign: 'center' }]}>General information, not medical advice.</Text>
    </ScrollView>
  );
}

const JUMPS = [
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'vitamins', label: 'Vitamins' },
  { id: 'price', label: 'Price' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'storage', label: 'Storage' },
  { id: 'sources', label: 'Sources' },
] as const;
type JumpId = (typeof JUMPS)[number]['id'];

function QuickFactsSection({ dish }: { dish: Dish }) {
  return (
    <Section title="Quick facts">
      <View style={styles.grid}>
        {quickFacts(dish).map((f) => (
          <View key={f.label} style={styles.fact} accessible accessibilityLabel={`${f.label}: ${f.value}`}>
            <Text style={styles.factValueSm}>{f.value}</Text>
            <Text style={styles.muted}>{f.label}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

/** THREE SCORES RULE: separate rows, exact labels, never combined. */
function ScoresSection({ dish }: { dish: Dish }) {
  const h = dish.healthiness;
  const r = dish.researchRating;
  return (
    <Section title="Scores">
      <ScoreRow label="Healthiness score" value={h?.score != null ? `${h.score}/10` : 'Coming soon'} hint={h?.restaurantScore != null ? `Restaurant version: ${h.restaurantScore}/10` : null} />
      {h?.reasons.length ? <Text style={styles.note}>{h.reasons[0]}</Text> : null}
      <ScoreRow label="Rating" value={r?.score != null ? `★ ${r.score}` : 'Coming soon'} hint="FitPlate's research of what people say online, not user or restaurant ratings." />
      <ScoreRow label="FitPlate Score" value="Coming after launch" hint="Built from cooks and your ratings once FitPlate launches." />
    </Section>
  );
}

function ScoreRow({ label, value, hint }: { label: string; value: string; hint: string | null }) {
  return (
    <View style={styles.scoreRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={styles.body}>{label}</Text>
        <Text style={styles.strong}>{value}</Text>
      </View>
      {hint ? <Text style={styles.note}>{hint}</Text> : null}
    </View>
  );
}

/** SPEC-ADDENDA §1: as-ordered beside home-cooked, clearly labelled, never merged. */
function NutritionSection({ dish }: { dish: Dish }) {
  const rows = nutritionRows(dish);
  const showOrdered = hasPublishedOrdered(dish);
  const saved = caloriesSaved(dish);
  return (
    <Section title="Nutrition per serving">
      <View style={styles.tableHead}>
        <Text style={[styles.cellLabel, styles.muted]} />
        <Text style={[styles.cell, styles.headText]}>Home-cooked (FitPlate recipe)</Text>
        {showOrdered ? <Text style={[styles.cell, styles.headText]}>As ordered (published by the restaurant)</Text> : null}
      </View>
      {rows.map((r) => (
        <View key={r.label} style={styles.tableRow} accessible accessibilityLabel={`${r.label}: home-cooked ${r.cooked}${showOrdered ? `, as ordered ${r.ordered}` : ''}`}>
          <Text style={[styles.cellLabel, styles.muted]}>{r.label}</Text>
          <Text style={[styles.cell, styles.strong]}>{r.cooked}</Text>
          {showOrdered ? <Text style={[styles.cell, r.ordered === 'Not published' ? styles.muted : styles.strong]}>{r.ordered}</Text> : null}
        </View>
      ))}
      {saved ? <Text style={[styles.body, { marginTop: 8 }]}>Cooking it at home saves about {saved} kcal compared with the published restaurant version.</Text> : null}
      {!showOrdered ? <Text style={styles.note}>Restaurant nutrition: not published for this dish yet.</Text> : null}
    </Section>
  );
}

function MicroSection({ dish }: { dish: Dish }) {
  const micro = microRows(dish);
  const goodFor = researchLinks.dishGoodSourceOf[dish.id] ?? [];
  return (
    <Section title="Vitamins and minerals">
      {micro ? (
        <>
          <Text style={styles.note}>Partial estimate from the ingredients ({micro.coveragePct}% of the recipe covered).</Text>
          <View style={[styles.grid, { marginTop: 8 }]}>
            {micro.rows.map((m) => (
              <View key={m.id} style={styles.fact}>
                <Text style={styles.factValueSm}>{m.value}</Text>
                <Text style={styles.muted}>{m.label}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.body}>Coming soon</Text>
      )}
      {goodFor.length ? <Text style={[styles.body, { marginTop: 8 }]}>Research lists it as a good source of {goodFor.map(nutrientLabel).join(', ')}.</Text> : null}
    </Section>
  );
}

function OrderSection({ dish }: { dish: Dish }) {
  const price = headlineOrderPrice(dish);
  const trend = trendArrow(dish.orderPrice?.trend);
  const note = orderPriceNote(dish);
  return (
    <Section title="Cost to order">
      {price ? (
        <Text style={styles.body} accessibilityLabel={`About ${price.avg} rupees, usually ${price.min} to ${price.max}${trend ? `, ${trend.label}` : ''}`}>
          About <Text style={styles.strong}>₹{price.avg}</Text> (usually ₹{price.min}–{price.max}){' '}
          {trend ? <Text style={{ color: trend.arrow === '↑' ? colors.warn : colors.accent }}>{trend.arrow}</Text> : null}
        </Text>
      ) : (
        <Text style={styles.body}>Order price not confirmed yet.</Text>
      )}
      {price?.observed ? <Text style={styles.note}>Prices updated {shortDate(price.observed)}.</Text> : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </Section>
  );
}

/**
 * Day 8: cost to make one serving, as a range, from the researched
 * ingredient prices, and the saving versus ordering once every ingredient is
 * priced and the order price is confirmed.
 */
function MakeSection({ dish }: { dish: Dish }) {
  const [open, setOpen] = useState(false);
  const cost = makeCost(dish);
  const saving = savingVsOrder(cost, headlineOrderPrice(dish));
  const perProtein = featureFlags.proteinPerRupee ? rupeesPer10gProtein(cost, dish.nutritionPerServing.proteinG) : null;
  if (!cost) {
    return (
      <Section title="Cost to make">
        <Text style={styles.body}>Coming soon</Text>
      </Section>
    );
  }
  const trend = cost.trend ? trendArrow(cost.trend.trend) : null;
  return (
    <Section title="Cost to make">
      <Text style={styles.body} accessibilityLabel={`About ${cost.avg} rupees per serving, usually ${cost.min} to ${cost.max}${trend ? `, ${trend.label}` : ''}`}>
        About <Text style={styles.strong}>₹{cost.avg}</Text> per serving ({rangeLabel(cost)}){' '}
        {trend ? <Text style={{ color: trend.arrow === '↑' ? colors.warn : colors.accent }}>{trend.arrow}</Text> : null}
      </Text>
      {cost.complete ? null : (
        <Text style={styles.note}>
          Covers {cost.pricedLines} of {cost.countedLines} ingredients. {cost.missing.length} {cost.missing.length === 1 ? 'price is' : 'prices are'} coming soon, so the full cost is a little higher.
        </Text>
      )}
      <SavingLine cost={cost} saving={saving} />
      {perProtein != null ? <Text style={styles.body}>₹{perProtein} per 10 g of protein</Text> : null}
      <Text style={styles.note}>{trend ? `${trend.label} for its ingredients over the last month${cost.trend?.change30dPct != null ? ` (${cost.trend.change30dPct > 0 ? '+' : ''}${cost.trend.change30dPct}%)` : ''}.` : 'Ingredient price trend: not enough price history yet.'}</Text>
      {cost.estimated ? <Text style={styles.note}>(est.) Some amounts were converted between weight and volume at 1 g per ml, because research hasn&apos;t published densities yet.</Text> : null}
      {cost.unconfirmed ? (
        <Text style={styles.note}>
          {cost.unconfirmed} {cost.unconfirmed === 1 ? 'ingredient price rests' : 'ingredient prices rest'} on fewer than 3 shop listings so far.
        </Text>
      ) : null}
      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={open ? 'Hide cost per ingredient' : 'Show cost per ingredient'}>
        <Text style={styles.linkText}>{open ? 'Hide cost per ingredient' : 'Show cost per ingredient'}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
      </PressableScale>
      {open
        ? cost.lines.map((l, k) => (
            <View key={`${k}-${l.name}`} style={styles.burnRow}>
              <Text style={[styles.body, { flex: 1 }]}>{l.name}</Text>
              <Text style={l.avg != null ? styles.strong : styles.muted}>
                {l.avg != null ? rupees(l.avg) : l.note}
                {l.status === 'estimated' ? ' (est.)' : ''}
              </Text>
            </View>
          ))
        : null}
      <Text style={styles.note}>For 1 serving, from researched shop prices. Cooking gas isn&apos;t included.</Text>
    </Section>
  );
}

function SavingLine({ cost, saving }: { cost: DishCost; saving: { rupees: number; pct: number } | null }) {
  if (!saving) {
    return <Text style={styles.note}>{cost.complete ? 'Saving versus ordering shows once the order price is confirmed.' : 'Saving versus ordering shows once every ingredient has a price.'}</Text>;
  }
  if (saving.rupees > 0) {
    return (
      <Text style={[styles.body, { color: colors.accent }]}>
        Saves about <Text style={styles.strong}>₹{saving.rupees}</Text> ({saving.pct}%) versus ordering
      </Text>
    );
  }
  if (saving.rupees === 0) return <Text style={styles.body}>About the same as ordering</Text>;
  return (
    <Text style={styles.body}>
      Costs about ₹{-saving.rupees} ({-saving.pct}%) more than ordering
    </Text>
  );
}

function EquipmentSection({ dish }: { dish: Dish }) {
  return (
    <Section title="Equipment">
      {dish.equipment.length ? (
        dish.equipment.map((e, k) => {
          const { item, note } = splitEquipment(e);
          return (
            <Text key={`${k}-${item}`} style={styles.body}>
              • {item}
              {note ? <Text style={styles.muted}>{`  (${note})`}</Text> : null}
            </Text>
          );
        })
      ) : (
        <Text style={styles.body}>Coming soon</Text>
      )}
    </Section>
  );
}

/**
 * SPEC-ADDENDA §8: opt-in only. Nothing about burning calories shows until
 * the user asks; then it offers several ways with minutes at their weight.
 */
function BurnSection({ dish }: { dish: Dish }) {
  const [open, setOpen] = useState(false);
  const { bodyWeightKg } = useStore();
  const kcal = dish.nutritionPerServing.kcal;
  const ways = open ? burnWays(kcal, bodyWeightKg, researchLinks.met) : [];
  return (
    <Section title="Balance it out">
      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={open ? BALANCE_HIDE_LABEL : BALANCE_LABEL}>
        <Text style={styles.linkText}>{open ? BALANCE_HIDE_LABEL : BALANCE_LABEL}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
      </PressableScale>
      {open ? (
        ways.length ? (
          <>
            {ways.map((w) => (
              <View key={w.exerciseId} style={styles.burnRow}>
                <Text style={styles.body}>{w.name}</Text>
                <Text style={styles.strong}>{durationLabel(w.minutes)}</Text>
              </View>
            ))}
            <Text style={styles.note}>
              For one serving ({Math.round(kcal ?? 0)} kcal) at {bodyWeightKg ?? DEFAULT_WEIGHT_KG} kg
              {bodyWeightKg ? '' : ' (the research average; your own weight is used once you log it)'}. Estimates from Compendium MET values. Food is fuel; this is just for curiosity.
            </Text>
            <PressableScale onPress={() => router.push('/move')} style={styles.link} scaleTo={0.98} accessibilityLabel="See workouts in the Move tab">
              <Text style={styles.linkText}>See workouts</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableScale>
            <Text style={styles.note}>Check with a doctor before starting new exercise.</Text>
          </>
        ) : (
          <Text style={styles.body}>Coming soon</Text>
        )
      ) : null}
    </Section>
  );
}

function SourcesSection({ dish }: { dish: Dish }) {
  const [open, setOpen] = useState(false);
  return (
    <Section title="Sources">
      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={`${open ? 'Hide' : 'Show'} ${dish.sources.length} sources`}>
        <Text style={styles.linkText}>{dish.sources.length ? `${open ? 'Hide' : 'Show'} ${dish.sources.length} sources` : 'Coming soon'}</Text>
        {dish.sources.length ? <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} /> : null}
      </PressableScale>
      {open
        ? dish.sources.map((s, k) => {
            const { label, url } = splitSource(s);
            return url ? (
              <Text key={k} style={[styles.note, styles.sourceLink]} onPress={() => Linking.openURL(url)} accessibilityRole="link">
                {label}
              </Text>
            ) : (
              <Text key={k} style={styles.note}>
                {label}
              </Text>
            );
          })
        : null}
    </Section>
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

const styles = StyleSheet.create({
  jumpRow: { gap: 8, paddingTop: 14 },
  allCredits: { color: colors.muted, fontSize: 11, marginTop: 2, textDecorationLine: 'underline' },
  top: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 4 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  scroll: { padding: 18, paddingBottom: 60 },
  muted: { color: colors.muted, fontSize: 13 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 4 },
  subhead: { color: colors.text, fontSize: 13, fontWeight: '700' },
  strong: { fontWeight: '800', color: colors.text },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  section: { marginTop: 16, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fact: { minWidth: 90, flexGrow: 1 },
  factValueSm: { color: colors.text, fontSize: 15, fontWeight: '800' },
  scoreRow: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tableHead: { flexDirection: 'row', gap: 8, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tableRow: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  cellLabel: { width: 64 },
  cell: { flex: 1, fontSize: 14, color: colors.text },
  headText: { color: colors.muted, fontSize: 11, lineHeight: 15 },
  burnRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  sourceLink: { textDecorationLine: 'underline' },
  missing: { alignItems: 'center', padding: 30 },
});
