import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Image, Linking, ScrollView, Share, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Extrapolation, FadeInDown, FadeOutDown, interpolate, runOnJS, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { dishArt, PhotoCredit, SelectChip, TagChip, dishPhoto } from '../../components/dishes/parts';
import { Bar, GradientButton, PressableScale } from '../../components/ui';
import { VendorPlaceholders } from '../../components/vendors/VendorLogos';
import { featureFlags } from '../../config/featureFlags';
import { familyOf, getDish, getIngredient, researchLinks } from '../../data/research';
import { success, thud } from '../../lib/haptics';
import { dayKey, useStore } from '../../lib/store';
import type { Dish } from '../../models/research';
import { rangeLabel, rupees, rupeesPer10gProtein, savingVsOrder, type DishCost } from '../../services/costToMake';
import {
  BALANCE_LABEL,
  caloriesSaved,
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
import { makeCost, orderRange } from '../../services/dishLibrary';
import { isPantryStaple, recipeAmountLabel } from '../../services/vendors/basket';
import { colors, radius, type } from '../../theme';

const HERO = 320;

/**
 * The one dish page (22 Oct 2026): every dish in the app opens here. It keeps
 * the demo page's best parts, rebuilt on research data: parallax photo,
 * facts pills, servings stepper, make-vs-order bars with a verdict, home vs
 * restaurant health, favourite, share and plan tonight. Every research
 * section follows; anything research hasn't covered reads "Coming soon". The
 * three scores stay separate with their exact labels, and burn-off is opt-in
 * (SPEC-ADDENDA §8), never shown on its own.
 */
export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dish = id ? getDish(id) : undefined;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/cook'));

  if (!dish) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.topPlain}>
          <PressableScale onPress={back} style={styles.circle} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </PressableScale>
        </View>
        <View style={styles.missing}>
          <Text style={{ fontSize: 40 }}>🍽️</Text>
          <Text style={[type.h2, { color: colors.text, marginTop: 8 }]}>Dish not found</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>It may have been renamed in an update. Find it again in the Cook tab.</Text>
        </View>
      </SafeAreaView>
    );
  }
  return <DishBody dish={dish} back={back} />;
}

function Hero({ dish }: { dish: Dish }) {
  const photo = dishPhoto(dish.id);
  if (photo) return <Image source={photo.source} style={{ width: '100%', height: HERO + 40 }} resizeMode="cover" accessibilityLabel={dish.name} />;
  const art = dishArt(dish);
  return (
    <LinearGradient colors={art.palette} style={{ width: '100%', height: HERO + 40, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 110 }}>{art.emoji}</Text>
    </LinearGradient>
  );
}

function DishBody({ dish, back }: { dish: Dish; back: () => void }) {
  const insets = useSafeAreaInsets();
  const { favourites, toggleFavourite, setPlan, logDish } = useStore();
  const [servings, setServings] = useState(2);
  const [planned, setPlanned] = useState(false);
  const [logged, setLogged] = useState(false);
  const family = familyOf(dish);
  const dietTags = dish.tags.filter((t) => !t.startsWith('Contains '));
  const allergenTags = dish.tags.filter((t) => t.startsWith('Contains '));
  const variants = dish.variants.filter((v) => v.status === 'variant' || v.status === 'not-appropriate');
  const photo = dishPhoto(dish.id);
  const fav = favourites.includes(dish.id);
  const cost = makeCost(dish);
  const order = orderRange(dish);

  // Parallax hero: the photo moves at half speed and stretches on pull-down.
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [-200, 0, HERO], [-100, 0, -HERO * 0.5], Extrapolation.CLAMP) },
      { scale: interpolate(y.value, [-200, 0], [1.5, 1], Extrapolation.CLAMP) },
    ],
  }));
  const barStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [HERO - 140, HERO - 60], [0, 1], Extrapolation.CLAMP) }));
  // The bottom "Cook it yourself" bar only appears once the price card (and its own button) has scrolled away.
  const priceBottom = useSharedValue(0);
  const [showCta, setShowCta] = useState(false);
  useAnimatedReaction(
    () => priceBottom.value > 0 && y.value > priceBottom.value - 40,
    (now, before) => {
      if (now !== before) runOnJS(setShowCta)(now);
    },
  );
  const cookHref = { pathname: '/basket' as const, params: { dishes: dish.id, servings: String(servings) } };

  // Innovation (Day 07): "Jump to" chips; each anchor records its y on layout.
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const anchors = useRef<Partial<Record<JumpId, number>>>({});
  const record = useCallback((jump: JumpId, e: LayoutChangeEvent) => {
    anchors.current[jump] = e.nativeEvent.layout.y;
  }, []);
  const sheetY = useRef(0);
  const jumpTo = (jump: JumpId) => {
    const at = anchors.current[jump];
    if (at != null) scrollRef.current?.scrollTo({ y: Math.max(0, sheetY.current + at - insets.top - 64), animated: true });
  };

  const n = dish.nutritionPerServing;
  const total = dish.prepMin != null || dish.cookMin != null ? (dish.prepMin ?? 0) + (dish.cookMin ?? 0) : null;
  const shareText = [
    `${dish.name} on FitPlate`,
    cost ? `about ₹${cost.avg} a serving to make` : null,
    order ? `₹${order.min}–${order.max} to order` : null,
  ]
    .filter(Boolean)
    .join(': ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.View style={[styles.hero, heroStyle]}>
        <Hero dish={dish} />
        <LinearGradient colors={['rgba(7,9,10,0)', 'rgba(7,9,10,0.55)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      </Animated.View>

      <Animated.ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: HERO - 36, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={styles.sheet} onLayout={(e) => (sheetY.current = e.nativeEvent.layout.y)}>
          <View style={styles.grabber} />
          <View style={styles.chips}>
            {[...dietTags.slice(0, 5), ...allergenTags].map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {dish.name}
          </Text>
          {dish.cuisine ? (
            <Text style={styles.muted} numberOfLines={2}>
              {dish.cuisine}
            </Text>
          ) : null}

          <View style={styles.pills}>
            <Pill icon="flame" color={colors.warm} value={n.kcal != null ? `${Math.round(n.kcal)}` : '–'} label="kcal" />
            <Pill icon="barbell" color={colors.violet} value={n.proteinG != null ? `${Math.round(n.proteinG)} g` : '–'} label="protein" />
            <Pill icon="time" color={colors.blue} value={total != null ? `${total} min` : '–'} label="time" />
            <Pill icon="speedometer" color={colors.accent} value={levelWord(dish.difficulty)} label="level" />
          </View>
          <Text style={styles.perServing}>Per serving, from the researched recipe</Text>
          <PressableScale onPress={() => router.push({ pathname: '/balance', params: { dish: dish.id } })} style={styles.balance} scaleTo={0.98} accessibilityLabel={BALANCE_LABEL}>
            <Ionicons name="walk" size={17} color={colors.warm} />
            <Text style={styles.balanceText}>{BALANCE_LABEL}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </PressableScale>

          <View
            onLayout={(e) => {
              record('price', e);
              priceBottom.value = sheetY.current + e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <MakeOrOrder dish={dish} cost={cost} order={order} servings={servings} setServings={setServings} />
          </View>

          {dish.description ? <Text style={styles.body}>{dish.description}</Text> : null}
          {allergenTags.length ? <Text style={styles.note}>Allergens are worked out from the recipe. Check labels if you have an allergy.</Text> : null}
          {photo ? (
            <Text style={styles.note}>
              <PhotoCredit credit={photo.credit} />
              {'  '}
              <Text style={styles.allCredits} onPress={() => router.push('/photo-credits')} accessibilityRole="link">
                All photo credits
              </Text>
            </Text>
          ) : null}

          <HealthCompare dish={dish} />

          <View style={styles.actions}>
            <GradientButton
              title={planned ? '✓ On tonight' : '📅 Plan tonight'}
              variant="glass"
              style={{ flex: 1 }}
              onPress={() => {
                setPlan(dayKey(), dish.mealType.includes('breakfast') && !dish.mealType.includes('dinner') ? 'breakfast' : 'dinner', dish.id);
                setPlanned(true);
                success();
              }}
            />
            <GradientButton
              title={logged ? '✓ Logged' : '🍽️ I ate this'}
              variant="glass"
              style={{ flex: 1 }}
              disabled={logged}
              onPress={() => {
                logDish(dish);
                setLogged(true);
                success();
              }}
            />
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
      <Section title={`Ingredients for ${servings} (${dish.ingredients.length})`}>
        {dish.ingredients.length ? (
          dish.ingredients.map((i, k) => (
            <View key={`${i.name}-${k}`} style={[styles.ing, k > 0 && styles.ingLine]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.body, { marginTop: 0 }]}>{i.name}</Text>
                {isPantryStaple(i.ingredientId ? getIngredient(i.ingredientId) : undefined, i.name) ? <Text style={styles.pantry}>Pantry staple</Text> : null}
              </View>
              <Text style={styles.ingQty}>
                {i.quantity != null ? recipeAmountLabel(i.quantity * servings, i.unit) : servings === 1 ? (i.householdMeasure ?? '') : i.householdMeasure ? `${i.householdMeasure} × ${servings}` : ''}
              </Text>
            </View>
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

      <View onLayout={(e) => record('sources', e)}>
        <SourcesSection dish={dish} />
      </View>

      <Text style={[styles.note, { marginTop: 18, textAlign: 'center' }]}>{researchUpdatesLine(dish)}</Text>
      <Text style={[styles.note, { textAlign: 'center' }]}>General information, not medical advice.</Text>
        </View>
      </Animated.ScrollView>

      <Animated.View style={[styles.topBar, { paddingTop: insets.top, height: insets.top + 60 }, barStyle]} pointerEvents="none">
        <Text style={[type.h2, { color: colors.text }]} numberOfLines={1}>
          {dish.name}
        </Text>
      </Animated.View>
      <View style={[styles.topBtns, { top: insets.top + 8 }]}>
        <PressableScale onPress={back} style={styles.circle} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </PressableScale>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PressableScale onPress={() => Share.share({ message: `${shareText}. Found on FitPlate.` }).catch(() => {})} style={styles.circle} accessibilityLabel="Share">
            <Ionicons name="share-outline" size={20} color="#fff" />
          </PressableScale>
          <PressableScale
            onPress={() => {
              thud();
              toggleFavourite(dish.id);
            }}
            haptic={false}
            style={styles.circle}
            accessibilityLabel={fav ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Animated.View key={String(fav)} entering={ZoomIn.springify().damping(8)}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={21} color={fav ? colors.bad : '#fff'} />
            </Animated.View>
          </PressableScale>
        </View>
      </View>

      {showCta ? (
        <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutDown.duration(180)} style={[styles.cta, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <GradientButton title={`🍳  Cook it yourself (for ${servings})`} onPress={() => router.push(cookHref)} />
        </Animated.View>
      ) : null}
    </View>
  );
}

/** The research's difficulty in a word that fits a pill: Beginner → Easy, Intermediate → Medium, Advanced → Hard. */
function levelWord(d: string | null): string {
  if (!d) return '–';
  if (/^begin/i.test(d)) return 'Easy';
  if (/^inter/i.test(d)) return 'Medium';
  if (/^adv/i.test(d)) return 'Hard';
  return d.split(/[\s(/]/)[0];
}

function Pill({ icon, color, value, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: string; label: string }) {
  return (
    <View style={styles.pill} accessible accessibilityLabel={`${value} ${label}`}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.pillVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

type OrderRange = NonNullable<ReturnType<typeof orderRange>>;

/**
 * The two ways to eat it, side by side for the chosen servings: make it
 * (researched ingredient prices) or order it (the range across the
 * restaurants research sampled on Swiggy and Zomato). The verdict only shows
 * when every ingredient is priced, so a missing price can't flatter cooking.
 */
function MakeOrOrder({ dish, cost, order, servings, setServings }: { dish: Dish; cost: DishCost | null; order: OrderRange | null; servings: number; setServings: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  const make = cost ? cost.avg * servings : null;
  const orderAvg = order ? order.avg * servings : null;
  const top = Math.max(make ?? 0, order ? order.max * servings : 0) || 1;
  const saving = savingVsOrder(cost, order);
  const perProtein = featureFlags.proteinPerRupee ? rupeesPer10gProtein(cost, dish.nutritionPerServing.proteinG) : null;
  const trend = cost?.trend ? trendArrow(cost.trend.trend) : null;
  const orderTrend = trendArrow(dish.orderPrice?.trend);
  const updated = order?.observed ?? null;

  return (
    <View style={styles.card}>
      <View style={styles.servRow}>
        <Text style={styles.cardTitle}>Make it or order it?</Text>
        <View style={styles.stepper}>
          <PressableScale onPress={() => setServings(Math.max(1, servings - 1))} style={styles.step} accessibilityLabel="Fewer servings">
            <Ionicons name="remove" size={18} color={colors.text} />
          </PressableScale>
          <Animated.Text key={servings} entering={ZoomIn.duration(200)} style={styles.serv} accessibilityLabel={`${servings} servings`}>
            {servings}
          </Animated.Text>
          <PressableScale onPress={() => setServings(Math.min(8, servings + 1))} style={styles.step} accessibilityLabel="More servings">
            <Ionicons name="add" size={18} color={colors.text} />
          </PressableScale>
        </View>
      </View>
      <Text style={styles.muted}>For {servings} {servings === 1 ? 'serving' : 'servings'}</Text>

      {/* Make it yourself */}
      <View style={styles.option}>
        <View style={styles.optionHead}>
          <Text style={styles.optionTitle}>🏠 Make it yourself</Text>
          <Text style={[styles.price, { color: colors.accent }]}>{make != null ? `₹${make}` : '–'}</Text>
        </View>
        {cost ? (
          <>
            <Bar progress={(make ?? 0) / top} color={colors.accent} height={12} />
            <Text style={styles.note}>
              {rangeLabel({ min: cost.min * servings, max: cost.max * servings })} from researched shop prices{trend ? ` · ${trend.arrow} ${trend.label}` : ''}
              {cost.complete ? '' : `. ${cost.missing.length} of ${cost.countedLines} prices still coming, so the real cost is a little higher`}.
            </Text>
            {perProtein != null ? <Text style={styles.note}>₹{perProtein} per 10 g of protein</Text> : null}
          </>
        ) : (
          <Text style={styles.note}>Ingredient prices for this dish are coming soon.</Text>
        )}
        <GradientButton title="🍳  Cook it yourself" style={{ marginTop: 12 }} onPress={() => router.push({ pathname: '/basket', params: { dishes: dish.id, servings: String(servings) } })} />
        <Text style={styles.flow}>Next: buy the ingredients online or at the shop, then cook step by step.</Text>
        <PressableScale onPress={() => router.push({ pathname: '/steps/[id]', params: { id: dish.id, servings: String(servings) } })} style={styles.link} scaleTo={0.98} accessibilityLabel="Already have everything? Start cooking">
          <Text style={styles.linkText}>Already have everything? Start cooking</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </PressableScale>
        {cost ? (
          <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={open ? 'Hide cost per ingredient' : 'Show cost per ingredient'}>
            <Text style={styles.linkText}>{open ? 'Hide cost per ingredient' : 'Cost per ingredient'}</Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
          </PressableScale>
        ) : null}
        {open && cost ? (
          <>
            {cost.lines.map((l, k) => (
              <View key={`${k}-${l.name}`} style={styles.burnRow}>
                <Text style={[styles.small, { flex: 1 }]} numberOfLines={2}>
                  {l.name}
                </Text>
                <Text style={[styles.small, l.avg != null ? styles.strong : { color: colors.muted }]}>
                  {l.avg != null ? rupees(l.avg * servings) : l.note}
                  {l.status === 'estimated' ? ' (est.)' : ''}
                </Text>
              </View>
            ))}
            {cost.estimated ? <Text style={styles.note}>(est.) Some amounts were converted between weight and volume, or taken from the recipe&apos;s own measure, because research hasn&apos;t published them yet.</Text> : null}
            {cost.unconfirmed ? (
              <Text style={styles.note}>
                {cost.unconfirmed} {cost.unconfirmed === 1 ? 'price rests' : 'prices rest'} on fewer than 3 shop listings so far.
              </Text>
            ) : null}
            <Text style={styles.note}>Cooking gas isn&apos;t included.</Text>
          </>
        ) : null}
      </View>

      {/* Order online */}
      <View style={styles.option}>
        <View style={styles.optionHead}>
          <Text style={styles.optionTitle}>🛵 Order online</Text>
          <Text style={[styles.price, { color: colors.bad }]}>{orderAvg != null ? `₹${orderAvg}` : '–'}</Text>
        </View>
        {order ? (
          <>
            <Bar progress={(orderAvg ?? 0) / top} color={colors.bad} height={12} />
            <Text style={styles.note}>
              Usually ₹{order.min * servings}–{order.max * servings} across restaurants on Swiggy and Zomato{orderTrend ? ` · ${orderTrend.arrow} ${orderTrend.label}` : ''}.
              {order.confirmed ? '' : ` Based on ${order.listings ?? 'a few'} ${order.listings === 1 ? 'listing' : 'listings'} so far, still being checked.`}
            </Text>
          </>
        ) : (
          <Text style={styles.note}>Restaurant prices for this dish are coming soon.</Text>
        )}
        <View style={{ marginTop: 10 }}>
          <VendorPlaceholders vendors={['swiggy', 'zomato']} />
        </View>
      </View>

      {saving ? (
        <LinearGradient colors={saving.rupees > 0 ? ['rgba(61,220,132,0.20)', 'rgba(61,220,132,0.04)'] : ['rgba(255,181,71,0.18)', 'rgba(255,181,71,0.04)']} style={styles.verdict}>
          <Text style={styles.verdictText}>
            {saving.rupees > 0
              ? `You keep ₹${saving.rupees * servings} (${saving.pct}%) by cooking.`
              : saving.rupees === 0
                ? 'About the same as ordering.'
                : `Ordering is about ₹${-saving.rupees * servings} cheaper, but you control the oil and salt at home.`}
          </Text>
        </LinearGradient>
      ) : cost && order ? (
        <Text style={[styles.note, { marginTop: 12 }]}>The saving shows once every ingredient has a price.</Text>
      ) : null}
      <Text style={styles.note}>
        Averages from FitPlate&apos;s price research{updated ? `, last checked ${shortDate(updated)}` : ''}. New prices are added as research comes in and all prices are refreshed monthly.
      </Text>
    </View>
  );
}

/** Home vs restaurant, using the research Healthiness score (one of the three separate scores). */
function HealthCompare({ dish }: { dish: Dish }) {
  const h = dish.healthiness;
  if (!h || (h.score == null && h.restaurantScore == null)) return null;
  const homeKcal = dish.nutritionPerServing.kcal;
  const orderedKcal = dish.asOrdered?.nutrition?.calories.value ?? null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>How healthy is it?</Text>
      <Text style={styles.muted}>Healthiness score, out of 10</Text>
      {h.score != null ? <Compare label="Made by you" score={h.score} kcal={homeKcal} color={colors.accent} /> : null}
      {h.restaurantScore != null ? <Compare label="Typical restaurant" score={h.restaurantScore} kcal={orderedKcal} color={colors.warn} /> : null}
      {h.reasons.slice(0, 3).map((r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
          <Text style={[styles.small, { flex: 1, color: colors.text }]}>{r}</Text>
        </View>
      ))}
    </View>
  );
}

function Compare({ label, score, kcal, color }: { label: string; score: number; kcal: number | null; color: string }) {
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
        <Text style={{ color: colors.text, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>
          {label}
        </Text>
        <Text style={{ color, fontWeight: '700' }}>
          {score}/10{kcal != null ? ` · ${Math.round(kcal)} kcal` : ''}
        </Text>
      </View>
      <Bar progress={score / 10} color={color} height={10} />
    </View>
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
  topPlain: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 4 },
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO + 40, overflow: 'hidden' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 20 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.faint, marginBottom: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.6, marginTop: 10, lineHeight: 33 },
  pills: { flexDirection: 'row', gap: 8, marginTop: 16 },
  pill: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 2 },
  pillVal: { color: colors.text, fontWeight: '900', fontSize: 15 },
  pillLabel: { color: colors.muted, fontSize: 11.5 },
  perServing: { color: colors.faint, fontSize: 11.5, marginTop: 6, textAlign: 'center' },
  card: { marginTop: 16, padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800', flexShrink: 1 },
  servRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  step: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  serv: { color: colors.text, fontSize: 20, fontWeight: '900', width: 36, textAlign: 'center' },
  option: { marginTop: 14, padding: 14, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border },
  optionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  optionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  flow: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 8, textAlign: 'center' },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingHorizontal: 14, minHeight: 46, borderRadius: radius.pill, backgroundColor: 'rgba(255,138,61,0.10)', borderWidth: 1, borderColor: 'rgba(255,138,61,0.28)' },
  balanceText: { color: colors.text, fontWeight: '800', fontSize: 14, flex: 1 },
  price: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  verdict: { marginTop: 14, padding: 14, borderRadius: radius.md },
  verdictText: { color: colors.text, fontWeight: '800', fontSize: 15, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  small: { color: colors.text, fontSize: 13, lineHeight: 18 },
  ing: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  ingLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  pantry: { color: colors.warm, fontSize: 11, fontWeight: '800', marginTop: 2 },
  ingQty: { color: colors.muted, fontWeight: '700', fontSize: 13, maxWidth: '45%', textAlign: 'right' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(7,9,10,0.95)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 120, borderBottomWidth: 1, borderBottomColor: colors.border },
  topBtns: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  circle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 12, backgroundColor: 'rgba(7,9,10,0.94)', borderTopWidth: 1, borderTopColor: colors.border },
  muted: { color: colors.muted, fontSize: 13 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 4 },
  subhead: { color: colors.text, fontSize: 13, fontWeight: '700' },
  strong: { fontWeight: '800', color: colors.text },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  section: { marginTop: 16, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fact: { minWidth: 90, maxWidth: '100%', flexGrow: 1, flexShrink: 1 },
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
