# FitPlate Build — Day 02 — 2026-10-10

## 1. HEADER

**Day 02 of 37 | Roadmap item: Navigation shell | Phase 0: Foundation and data pipeline | Progress: 5% of the full app (2 ÷ 37)**

- **How today's day was determined:** the newest build file is `FitPlate_Build_Day01_2026-10-09.md`. Its BUILD STATE marks Day 1 ✅ done (nothing INCOMPLETE) and says "Next up: Day 02". So today is Day 02. The day-number rule agrees: 10 October 2026 is 1 day after Day 1.
- **Supervisor review:** there is no `FitPlate_Review_*.md` yet (the first one is due 2026-10-11). No FIX LIST today.
- **Branch context (one-time note):**
  - On 2026-10-09 the Demo thread merged demo-app commit 2295dec into `claude/project-thread-wchnlm` as merge c8a2449, at Sudarsan's request. That commit shows the Google photo and email after sign-in and drops the unused `EXPO_PUBLIC_LOGIN_VIDEO_URL` line from `.env.example`.
  - On 2026-10-10 the Demo thread also merged commits 1799a28 and 017b247 as merge 5c97126. They add the new app icon (white plate and dumbbell on dark green), the `public/index.html` web template with apple-touch-icon and `manifest.json`, and the `public/` icons.
  - Both merges were checked with tsc, lint, the tests and the web export. Today's work is built on top of 5c97126.
  - `public/index.html` and `public/manifest.json` must be kept. The manifest's display stays `"browser"`, because Google sign-in popups are unreliable in iOS standalone web apps.
- **Context available:**
  - Code source **(a)**: the branch `claude/project-thread-wchnlm` at 5c97126, which holds Day 1 plus the two merges, read in a checkout.
  - Spec: `PROMPT.md` and `SPEC-ADDENDA.md` §1–§5. §5 (the cloud-first database from Day 3) applies from today for the daily database duty.
  - Research files visible:
    - Dishes: 7 files (2026-10-04 … 2026-10-10)
    - Ingredients: 7 files (2026-10-04 … 2026-10-10)
    - Nutrients: 2 files (2026-10-09, 2026-10-10)
    - Fitness: 2 files (2026-10-09, 2026-10-10)

## 2. SUMMARY

1. The app now has five tabs: **Today, Cook, Track, Move and Profile**, each with its own icon. The green **+** quick-log button sits at the right end of the tab bar.
2. **Today** is unchanged, calorie ring included. **Cook** shows the dish browser, which the real research library replaces on Day 6. **Track** has a Progress / Meal plan switcher. **Profile** is your settings page as a tab.
3. **Move** is a friendly placeholder for now. It shows the workouts you logged in the last 7 days, a "Log a workout" button, what is coming, and a health note.
4. Onboarding, guest mode and Google sign-in were not touched. Old links (`/discover`, `/plan`, `/progress`, `/profile`) still open. Setting one flag back to false restores the old four tabs.
5. For the cloud database, the first data-model document and the Firestore security rules file are now in the repo. The research ledger recorded today's 4 new research files (no importers until Day 4).

## 3. DATA SYNC REPORT

No importer exists yet (dishes and ingredients come on Day 4; nutrients, hydration and fitness on Day 5). Per section C2, today only **records** new files in the ledger and ingests nothing. No file was ingested twice.

New research files recorded today:

| Stream | File date | Items | Status |
|---|---|---|---|
| Dishes | 2026-10-10 | #31 Indian-style Overnight Oats, #32 Aloo Gobi, #33 Goan Fish Curry, #34 Chilli Paneer, #35 Curd Rice | Backlog (has AS ORDERED block) |
| Ingredients | 2026-10-10 | 13: seer fish (surmai), kokum, fresh coconut, coconut oil, rolled oats, chia seeds, honey, raisins, almonds, pistachios, maida, tomato ketchup, red chilli sauce | Backlog (each has the full nutrient-profile JSON block) |
| Nutrients | 2026-10-10 | #3 Vitamin E, #4 Vitamin K | Backlog |
| Fitness | 2026-10-10 | Home 2 Push-up; Yoga & Stretch 2 Surya Namaskar; Gym 3 Sets, reps, rest and progressive overload; Gym 4 Choosing your starting weight, RPE and RIR | Backlog |

- **Backlog remaining:**
  - Dishes: 35 items in 7 files
  - Ingredients: 110 entries in 7 files
  - Nutrients: 4 topics in 2 files
  - Fitness: 8 items in 2 files
- **Items added or updated:** none, because no importers exist yet.
- **Price trends:** none yet; nothing has been merged.
- **Conflicts, outliers, spikes, "needs review":** none.
- **Format notes:**
  - The dish file for 10-10 says Swiggy, Zomato and magicpin pages block direct access from the research environment, so its order prices come from search-result snapshots. The Day 4 importer should keep this note in each dish's `asOrdered` sources, and price confidence should stay as the research file states it.
  - The ingredient file for 10-10 includes non-Mumbai-staple items such as ketchup and chilli sauce. These are packaged products, so the importer should expect per-pack prices.
- **Unmatched ingredient names:** not checked yet (the alias map comes on Day 5).
- **New research gaps:** none beyond the list in BUILD STATE.

## 4. DESIGN NOTES

**Tab bar (all tab screens)**
- A floating, blurred pill bar, the same look as before.
- Five equal tabs from left to right: Today (flame), Cook (knife and fork), Track (bar chart), Move (dumbbell), Profile (person).
- The active tab gets a soft green pill, a filled icon and white text. Inactive tabs show outline icons in grey.
- The green **+** button (56 px) sits inside the bar at the right end and opens the quick-log sheet. Screen-reader label: "Quick log a meal, workout or water".
- On wide web screens, the bar and the + button stay together at 480 px wide in the centre.

**Today:** unchanged. The avatar now opens the Profile tab. "Find dish" and "See all" now open the Cook tab.

**Cook:** the demo dish browser with its title changed to "Cook": search, filters, featured dish and cards, all as before.

**Track**
- At the top, a two-option switcher: **Progress** | **Meal plan**. The selected option is solid green with dark text.
- Progress shows the demo's 7-day calorie chart, nutrition report and badges.
- Meal plan shows the demo's weekly planner, auto-plan and grocery link.
- It opens on Progress each time.

**Move (placeholder)**
- Title "Move". Subtitle: "Burn it off your way: at home, on the mat or in the gym."
- A card labelled "LAST 7 DAYS" shows workouts, minutes and "kcal (est.)", followed by a **Log a workout** button that opens the quick-log sheet on the Workout tab.
  - Empty state: "No workouts logged yet this week. A 10-minute walk counts!"
- A "COMING SOON" list with three rows:
  - Home workouts: "No equipment, step by step."
  - Yoga and stretches: "Gentle moves for desk days."
  - Gym guides: "Form checks, sets and reps."
- Footer: "Calories burnt are estimates. Check with a doctor before starting a new exercise routine, especially if you have a health condition."

**Profile (tab)**
- The same settings page as before, without the back arrow, and with room at the bottom for the tab bar.
- The saved-dishes hint now reads "Find them under Cook → Saved."
- The old `/profile` screen, which has a back arrow, still works.

## 5. DATA FILES

None today. No importer exists yet, so no per-item JSON was written.

## 6. CODE FILES

| Path | NEW or CHANGED | Purpose |
|---|---|---|
| `src/config/tabs.ts` | NEW | Tab definitions for both shells; link helpers |
| `src/app/(tabs)/_layout.tsx` | CHANGED | Floating tab bar reads the tab config; 5 tabs; "+" at the right end |
| `src/app/(tabs)/cook.tsx` | NEW | Cook tab (demo dish browser titled "Cook") |
| `src/app/(tabs)/track.tsx` | NEW | Track tab: Progress / Meal plan switcher |
| `src/app/(tabs)/move.tsx` | NEW | Move tab placeholder with last-7-days workouts |
| `src/app/(tabs)/me.tsx` | NEW | Profile tab |
| `src/app/(tabs)/discover.tsx` | CHANGED | Exports DiscoverScreen with a title prop |
| `src/app/(tabs)/plan.tsx` | CHANGED | Exports PlanScreen with an embedded prop |
| `src/app/(tabs)/progress.tsx` | CHANGED | Exports ProgressScreen with an embedded prop |
| `src/app/(tabs)/index.tsx` | CHANGED | Avatar and "Find dish"/"See all" links follow the shell; a11y labels |
| `src/app/profile.tsx` | CHANGED | Exports ProfileScreen with an asTab prop |
| `src/components/ui.tsx` | CHANGED | PressableScale gets accessibilityRole and accessibilityLabel |
| `src/config/featureFlags.ts` | CHANGED | newTabShell ON; cloudSync comment follows §5 |
| `src/services/activity.ts` | NEW | Workouts in the last 7 days (Move tab) |
| `src/__tests__/tabs.test.ts` | NEW | Tab config tests |
| `src/__tests__/activity.test.ts` | NEW | Weekly activity tests |
| `src/__tests__/config.test.ts` | CHANGED | newTabShell is now the one finished flag |
| `jest.config.js` | CHANGED | AsyncStorage mock mapping |
| `firestore.rules` | NEW | Owner-only Firestore security rules (SPEC-ADDENDA §5) |
| `docs/DATA_MODEL.md` | NEW | Data model and changelog (daily database duty) |

### `src/config/tabs.ts`

```ts
import type { Ionicons } from '@expo/vector-icons';

import { featureFlags } from './featureFlags';

type IconName = keyof typeof Ionicons.glyphMap;

export type TabDef = {
  /** Route file name inside src/app/(tabs)/. */
  name: string;
  label: string;
  icon: IconName;
  iconOutline: IconName;
};

// The demo's four tabs. They stay as files so old links keep working even
// after the new shell takes over the tab bar.
export const LEGACY_TABS: readonly TabDef[] = [
  { name: 'index', label: 'Today', icon: 'flame', iconOutline: 'flame-outline' },
  { name: 'discover', label: 'Discover', icon: 'compass', iconOutline: 'compass-outline' },
  { name: 'plan', label: 'Plan', icon: 'calendar', iconOutline: 'calendar-outline' },
  { name: 'progress', label: 'Progress', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
];

// Day 2 shell. The Profile tab's file is `me` because `/profile` is already
// the stack screen opened from the Today avatar, and two routes cannot share a URL.
export const SHELL_TABS: readonly TabDef[] = [
  { name: 'index', label: 'Today', icon: 'flame', iconOutline: 'flame-outline' },
  { name: 'cook', label: 'Cook', icon: 'restaurant', iconOutline: 'restaurant-outline' },
  { name: 'track', label: 'Track', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  { name: 'move', label: 'Move', icon: 'barbell', iconOutline: 'barbell-outline' },
  { name: 'me', label: 'Profile', icon: 'person-circle', iconOutline: 'person-circle-outline' },
];

/** Every route file in (tabs), so the layout can register each one exactly once. */
export const ALL_TAB_ROUTES: readonly string[] = Array.from(new Set([...LEGACY_TABS, ...SHELL_TABS].map((t) => t.name)));

export function visibleTabs(newShell: boolean = featureFlags.newTabShell): readonly TabDef[] {
  return newShell ? SHELL_TABS : LEGACY_TABS;
}

/** Where "find a dish" and "see all" links go in the current shell. */
export function dishLibraryHref(newShell: boolean = featureFlags.newTabShell): '/cook' | '/discover' {
  return newShell ? '/cook' : '/discover';
}

/** Where the Today avatar goes: the Profile tab in the new shell, the stack screen before it. */
export function profileHref(newShell: boolean = featureFlags.newTabShell): '/me' | '/profile' {
  return newShell ? '/me' : '/profile';
}
```

### `src/app/(tabs)/_layout.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '../../components/ui';
import { featureFlags } from '../../config/featureFlags';
import { ALL_TAB_ROUTES, visibleTabs, type TabDef } from '../../config/tabs';
import { select, thud } from '../../lib/haptics';
import { colors, gradients } from '../../theme';

const NEW_SHELL = featureFlags.newTabShell;
const TABS = visibleTabs(NEW_SHELL);
const TAB_BY_NAME: Record<string, TabDef> = Object.fromEntries(TABS.map((t) => [t.name, t]));

function TabItem({ tab, focused, onPress }: { tab: TabDef; focused: boolean; onPress: () => void }) {
  const s = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 220 });
  }, [focused, s]);
  const pill = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scale: 0.6 + s.value * 0.4 }] }));
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: -s.value * 2 }, { scale: 1 + s.value * 0.08 }] }));
  const { icon: on, iconOutline: off, label } = tab;
  return (
    <Pressable
      onPress={() => {
        select();
        onPress();
      }}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.pill, pill]} />
      <Animated.View style={icon}>
        <Ionicons name={focused ? on : off} size={22} color={focused ? colors.accent : colors.muted} />
      </Animated.View>
      <Text style={[styles.label, { color: focused ? colors.text : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // Keep the bar in the order of TABS, whatever order the routes were registered in.
  const routes = TABS.map((t) => state.routes.find((r) => r.name === t.name)).filter((r) => r !== undefined);
  const go = (name: string, key: string) => {
    const ev = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true });
    if (!ev.defaultPrevented) navigation.navigate(name);
  };
  // Four tabs split 2 + 2 around the centre "+" button. Five tabs cannot split
  // evenly, so the new shell keeps them in one row and moves "+" to the right end.
  const half = NEW_SHELL ? routes.length : Math.ceil(routes.length / 2);
  const item = (r: (typeof routes)[number]) => (
    <TabItem key={r.key} tab={TAB_BY_NAME[r.name]} focused={state.routes[state.index].key === r.key} onPress={() => go(r.name, r.key)} />
  );
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      {/* Same width as the bar, so the "+" button lines up with the bar on wide web screens too. */}
      <View style={styles.inner} pointerEvents="box-none">
        <View style={styles.bar}>
          {Platform.OS !== 'android' ? <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} /> : null}
          <View style={[StyleSheet.absoluteFill, styles.tint]} />
          {routes.slice(0, half).map(item)}
          <View style={{ width: NEW_SHELL ? 58 : 64 }} />
          {routes.slice(half).map(item)}
        </View>
        <PressableScale
          onPress={() => {
            thud();
            router.push('/log');
          }}
          haptic={false}
          style={[styles.fab, NEW_SHELL && styles.fabEnd]}
          scaleTo={0.88}
          accessibilityLabel="Quick log a meal, workout or water"
        >
          <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
            <Ionicons name="add" size={30} color="#06210F" />
          </LinearGradient>
        </PressableScale>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(p) => <FloatingTabBar {...p} />}
      screenOptions={{ headerShown: false, animation: 'shift', sceneStyle: { backgroundColor: colors.bg } }}
    >
      {/* Every tab file is registered; the ones not in the current shell get no
          href, so they leave the bar but old links to them still open. */}
      {ALL_TAB_ROUTES.map((name) => (
        <Tabs.Screen key={name} name={name} options={TAB_BY_NAME[name] ? {} : { href: null }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 480, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 480,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tint: { backgroundColor: Platform.OS === 'android' ? 'rgba(14,19,17,0.96)' : 'rgba(14,19,17,0.55)' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  pill: { position: 'absolute', width: 56, height: 52, borderRadius: 18, backgroundColor: 'rgba(61,220,132,0.14)' },
  label: { fontSize: 10.5, fontWeight: '700', marginTop: 3 },
  fab: {
    position: 'absolute',
    top: -14,
    width: 64,
    height: 64,
    borderRadius: 32,
    boxShadow: '0px 8px 24px rgba(61,220,132,0.45)',
  },
  fabEnd: { top: 6, right: 6, width: 56, height: 56, borderRadius: 28 },
  fabInner: { flex: 1, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.bg },
});
```

### `src/app/(tabs)/cook.tsx`

```tsx
import { DiscoverScreen } from './discover';

// Day 2 shell: the Cook tab reuses the demo's dish browser. Day 6 replaces it
// with the research dish library.
export default function Cook() {
  return <DiscoverScreen title="Cook" />;
}
```

### `src/app/(tabs)/track.tsx`

```tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { select } from '../../lib/haptics';
import { colors, radius } from '../../theme';
import { PlanScreen } from './plan';
import { ProgressScreen } from './progress';

type TrackView = 'progress' | 'plan';

const OPTIONS: { key: TrackView; label: string }[] = [
  { key: 'progress', label: 'Progress' },
  { key: 'plan', label: 'Meal plan' },
];

// Day 2 shell: Track holds the demo's Progress and Plan screens behind a
// switcher. Day 29 turns it into the full dashboard.
export default function Track() {
  const [view, setView] = useState<TrackView>('progress');
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.switcher} accessibilityRole="tablist">
        {OPTIONS.map((o) => {
          const on = view === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => {
                select();
                setView(o.key);
              }}
              style={[styles.option, on && styles.optionOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={o.label}
            >
              <Text style={[styles.optionText, { color: on ? '#06210F' : colors.muted }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {view === 'progress' ? <ProgressScreen embedded /> : <PlanScreen embedded />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 8,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: { flex: 1, minHeight: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  optionOn: { backgroundColor: colors.accent },
  optionText: { fontWeight: '800', fontSize: 14 },
});
```

### `src/app/(tabs)/move.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeIn, Glass, GradientButton } from '../../components/ui';
import { useStore } from '../../lib/store';
import { lastSevenDaysActivity } from '../../services/activity';
import { colors, type } from '../../theme';

const COMING: { icon: keyof typeof Ionicons.glyphMap; title: string; blurb: string }[] = [
  { icon: 'home-outline', title: 'Home workouts', blurb: 'No equipment, step by step.' },
  { icon: 'leaf-outline', title: 'Yoga and stretches', blurb: 'Gentle moves for desk days.' },
  { icon: 'barbell-outline', title: 'Gym guides', blurb: 'Form checks, sets and reps.' },
];

// Day 2 placeholder. The research-backed exercise library arrives on Day 21;
// until then this tab shows the week's logged workouts and what is coming.
export default function Move() {
  const { days } = useStore();
  const week = lastSevenDaysActivity(days);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Move</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Burn it off your way: at home, on the mat or in the gym.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <Glass style={{ marginTop: 16 }}>
            <Text style={styles.label}>Last 7 days</Text>
            {week.sessions === 0 ? (
              <Text style={[type.body, { color: colors.text }]}>No workouts logged yet this week. A 10-minute walk counts!</Text>
            ) : (
              <View style={styles.stats}>
                <Stat value={week.sessions} unit={week.sessions === 1 ? 'workout' : 'workouts'} />
                <Stat value={week.minutes} unit="minutes" />
                <Stat value={week.kcal} unit="kcal (est.)" />
              </View>
            )}
            <GradientButton
              title="Log a workout"
              onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise' } })}
              style={{ marginTop: 14 }}
            />
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Text style={[styles.label, { marginTop: 22 }]}>Coming soon</Text>
          {COMING.map((c) => (
            <Glass key={c.title} style={styles.row}>
              <View style={styles.icon}>
                <Ionicons name={c.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>{c.title}</Text>
                <Text style={[type.small, { color: colors.muted }]}>{c.blurb}</Text>
              </View>
            </Glass>
          ))}
        </FadeIn>

        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          Calories burnt are estimates. Check with a doctor before starting a new exercise routine, especially if you have a health condition.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, unit }: { value: number; unit: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '900' }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  stats: { flexDirection: 'row', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(61,220,132,0.14)', alignItems: 'center', justifyContent: 'center' },
});
```

### `src/app/(tabs)/me.tsx`

```tsx
import { ProfileScreen } from '../profile';

// The Profile tab. Its file is `me` because `/profile` is already the stack
// screen that older links open; both show the same settings.
export default function ProfileTab() {
  return <ProfileScreen asTab />;
}
```

### `src/app/(tabs)/discover.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { LinearTransition, FadeIn as RFadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishCardTall } from '../../components/DishCard';
import { Chip, DishArt, FadeIn, PressableScale } from '../../components/ui';
import { costToMake, costToOrder, dishes, type Dish } from '../../data/dishes';
import { useStore } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const FILTERS: { label: string; test: (d: Dish, fav: string[]) => boolean }[] = [
  { label: 'All', test: () => true },
  { label: '❤️ Saved', test: (d, f) => f.includes(d.id) },
  { label: 'Breakfast', test: (d) => d.category === 'Breakfast' },
  { label: 'Under 20 min', test: (d) => d.timeMins <= 20 },
  { label: 'High protein', test: (d) => d.tags.includes('high-protein') },
  { label: 'Veg', test: (d) => d.diet === 'veg' },
  { label: 'Prep night before', test: (d) => d.tags.includes('night-before') },
  { label: 'Batch cook', test: (d) => d.tags.includes('batch-cook') },
];

// The new shell shows this same screen as the Cook tab (see cook.tsx) until
// the research dish library replaces it on Day 6.
export function DiscoverScreen({ title = 'Discover' }: { title?: string }) {
  const { favourites } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState(0);
  const { width } = useWindowDimensions();
  const col = (Math.min(width, 520) - 18 * 2 - 14) / 2;

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return dishes.filter(
      (d) =>
        FILTERS[f].test(d, favourites) &&
        (!query || d.name.toLowerCase().includes(query) || d.ingredients.some((i) => i.name.toLowerCase().includes(query))),
    );
  }, [q, f, favourites]);

  const featured = dishes[new Date().getDate() % dishes.length];
  const fSave = costToOrder(featured, 2) - costToMake(featured, 2);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>{title}</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Search any dish or ingredient you have at home.</Text>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Biryani, paneer, oats…"
              placeholderTextColor={colors.faint}
              style={styles.input}
              returnKeyType="search"
            />
            {q ? (
              <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setQ('')} />
            ) : null}
          </View>
        </FadeIn>

        <FadeIn i={1}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
            {FILTERS.map((x, i) => (
              <Chip key={x.label} label={x.label} active={f === i} onPress={() => setF(i)} />
            ))}
          </ScrollView>
        </FadeIn>

        {!q && f === 0 ? (
          <FadeIn i={2}>
            <PressableScale scaleTo={0.98} onPress={() => router.push({ pathname: '/dish/[id]', params: { id: featured.id } })} style={{ marginTop: 18 }}>
              <View style={styles.feature}>
                <DishArt emoji={featured.emoji} palette={featured.palette} size={'100%'} rounded={radius.lg} style={StyleSheet.absoluteFill} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
                <View style={styles.featureTag}>
                  <Text style={styles.featureTagText}>✨ DISH OF THE DAY</Text>
                </View>
                <View style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
                  <Text style={styles.featureName}>{featured.name}</Text>
                  <Text style={styles.featureSub}>
                    {featured.kcal} kcal · {featured.timeMins} min · save ₹{fSave} vs ordering
                  </Text>
                </View>
              </View>
            </PressableScale>
          </FadeIn>
        ) : null}

        <Text style={[type.label, { color: colors.muted, marginTop: 22, marginBottom: 12 }]}>
          {results.length} {results.length === 1 ? 'dish' : 'dishes'}
        </Text>

        <Animated.View layout={LinearTransition.springify().damping(18)} style={styles.grid}>
          {results.map((d) => (
            <Animated.View key={d.id} entering={RFadeIn.duration(300)} exiting={FadeOut.duration(150)} layout={LinearTransition.springify().damping(18)} style={{ width: col, marginBottom: 18 }}>
              <DishCardTall dish={d} width={col} />
            </Animated.View>
          ))}
        </Animated.View>

        {results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🍳</Text>
            <Text style={[type.h2, { color: colors.text, marginTop: 8 }]}>Not in the demo yet</Text>
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>
              The full app aims for every dish there is. Missing dishes will be generated on request.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Discover() {
  return <DiscoverScreen />;
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 13 },
  feature: { height: 220, borderRadius: radius.lg, overflow: 'hidden' },
  featureTag: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  featureTagText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  featureName: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  featureSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  empty: { alignItems: 'center', padding: 30 },
});
```

### `src/app/(tabs)/plan.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn, FadeOut, SlideInDown, SlideOutDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishRow } from '../../components/DishCard';
import { FadeIn, Glass, GradientButton, PressableScale } from '../../components/ui';
import { costToMake, costToOrder, getDish } from '../../data/dishes';
import { success } from '../../lib/haptics';
import { addDays, allowedDishes, dayKey, recommend, useStore, type Slot } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const SLOTS: { slot: Slot; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { slot: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { slot: 'lunch', label: 'Lunch', icon: 'briefcase-outline' },
  { slot: 'dinner', label: 'Dinner', icon: 'moon-outline' },
];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// `embedded` is set by the Track tab, which draws its own top inset and switcher.
export function PlanScreen({ embedded = false }: { embedded?: boolean }) {
  const { plan, setPlan, profile } = useStore();
  const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const [sel, setSel] = useState(0);
  const [picking, setPicking] = useState<Slot | null>(null);
  const key = dayKey(week[sel]);
  const day = plan[key] ?? {};

  const planned = week.flatMap((d) => Object.values(plan[dayKey(d)] ?? {}).map((id) => getDish(id!)!)).filter(Boolean);
  const weekCost = planned.reduce((s, d) => s + costToMake(d, 1), 0);
  const weekSave = planned.reduce((s, d) => s + costToOrder(d, 1) - costToMake(d, 1), 0);

  const autoPlan = () => {
    const ranked = recommend(profile);
    const bf = ranked.filter((d) => d.category === 'Breakfast');
    const mains = ranked.filter((d) => d.category === 'Main');
    week.forEach((d, i) => {
      const k = dayKey(d);
      const existing = plan[k] ?? {};
      if (!existing.breakfast && bf.length) setPlan(k, 'breakfast', bf[i % bf.length].id);
      // Lunch on weekdays is usually the office canteen, so only plan weekend lunches.
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      if (!existing.lunch && weekend && mains.length) setPlan(k, 'lunch', mains[(i + 1) % mains.length].id);
      if (!existing.dinner && mains.length) setPlan(k, 'dinner', mains[i % mains.length].id);
    });
    success();
  };

  return (
    <SafeAreaView edges={embedded ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Meal plan</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Plan once, shop once, stop deciding at 9 pm.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginTop: 16 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
            {week.map((d, i) => {
              const count = Object.keys(plan[dayKey(d)] ?? {}).length;
              const on = i === sel;
              return (
                <PressableScale key={i} onPress={() => setSel(i)} style={[styles.day, on && styles.dayOn]} scaleTo={0.9}>
                  <Text style={[styles.dayName, on && { color: '#06210F' }]}>{i === 0 ? 'Today' : DAY[d.getDay()]}</Text>
                  <Text style={[styles.dayNum, on && { color: '#06210F' }]}>{d.getDate()}</Text>
                  <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
                    {[0, 1, 2].map((j) => (
                      <View key={j} style={[styles.dot, { backgroundColor: j < count ? (on ? '#06210F' : colors.accent) : on ? 'rgba(0,0,0,0.2)' : colors.faint }]} />
                    ))}
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>
        </FadeIn>

        <Animated.View key={sel} entering={RFadeIn.duration(250)} layout={LinearTransition}>
          {SLOTS.map(({ slot, label, icon }, i) => {
            const dish = day[slot] ? getDish(day[slot]!) : undefined;
            return (
              <FadeIn key={slot} i={i + 2}>
                <View style={styles.slotHead}>
                  <Ionicons name={icon} size={16} color={colors.muted} />
                  <Text style={[type.label, { color: colors.muted }]}>{label}</Text>
                </View>
                {dish ? (
                  <DishRow
                    dish={dish}
                    right={
                      <Pressable hitSlop={12} onPress={() => setPlan(key, slot, null)}>
                        <Ionicons name="close-circle" size={24} color={colors.faint} />
                      </Pressable>
                    }
                  />
                ) : (
                  <PressableScale onPress={() => setPicking(slot)} style={styles.empty} scaleTo={0.98}>
                    <Ionicons name="add-circle" size={22} color={colors.accent} />
                    <Text style={{ color: colors.text, fontWeight: '700' }}>Add {label.toLowerCase()}</Text>
                    {slot === 'lunch' ? <Text style={[type.small, { color: colors.muted, marginLeft: 'auto' }]}>or log the canteen later</Text> : null}
                  </PressableScale>
                )}
              </FadeIn>
            );
          })}
        </Animated.View>

        <FadeIn i={6}>
          <Glass style={{ marginTop: 22 }}>
            <Text style={[type.h2, { color: colors.text }]}>This week</Text>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.big}>{planned.length}</Text>
                <Text style={[type.small, { color: colors.muted }]}>meals planned</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.big}>₹{weekCost}</Text>
                <Text style={[type.small, { color: colors.muted }]}>to cook (1 person)</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.big, { color: colors.accent }]}>₹{weekSave}</Text>
                <Text style={[type.small, { color: colors.muted }]}>saved vs ordering</Text>
              </View>
            </View>
            <View style={{ gap: 10, marginTop: 16 }}>
              <GradientButton title="✨ Auto-plan my week" onPress={autoPlan} />
              <GradientButton
                title="🛒 Grocery list for the week"
                variant="glass"
                disabled={planned.length === 0}
                onPress={() => router.push('/grocery')}
              />
            </View>
          </Glass>
        </FadeIn>
      </ScrollView>

      {picking ? (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View entering={RFadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <Pressable style={{ flex: 1 }} onPress={() => setPicking(null)} />
          </Animated.View>
          <Animated.View entering={SlideInDown.springify().damping(20)} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={[type.h2, { color: colors.text, marginBottom: 12 }]}>Pick {picking}</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {allowedDishes(profile)
                .sort((a, b) => Number(b.category === (picking === 'breakfast' ? 'Breakfast' : 'Main')) - Number(a.category === (picking === 'breakfast' ? 'Breakfast' : 'Main')))
                .map((d) => (
                  <PressableScale
                    key={d.id}
                    onPress={() => {
                      setPlan(key, picking, d.id);
                      setPicking(null);
                    }}
                    style={styles.pickRow}
                    scaleTo={0.98}
                  >
                    <Text style={{ fontSize: 26 }}>{d.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '800' }}>{d.name}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>
                        {d.kcal} kcal · {d.timeMins} min
                      </Text>
                    </View>
                    <Ionicons name="add" size={20} color={colors.accent} />
                  </PressableScale>
                ))}
            </ScrollView>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export default function Plan() {
  return <PlanScreen />;
}

const styles = StyleSheet.create({
  day: { width: 62, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayName: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  dayNum: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  slotHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 22, marginBottom: 10 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(61,220,132,0.35)',
  },
  big: { color: colors.text, fontSize: 22, fontWeight: '900' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 110,
    borderWidth: 1,
    borderColor: colors.border,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.faint, marginBottom: 14 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
});
```

### `src/app/(tabs)/progress.tsx`

```tsx
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishRow } from '../../components/DishCard';
import { Bar, CountUp, FadeIn, Glass, SectionHeader } from '../../components/ui';
import { dishes } from '../../data/dishes';
import { addDays, dayKey, dayTotals, FIBRE_TARGET, GOALS, useStore, WATER_TARGET } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const DAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function Column({ value, max, color, delay }: { value: number; max: number; color: string; delay: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(delay, withTiming(max ? value / max : 0, { duration: 800, easing: Easing.out(Easing.back(1.2)) }));
  }, [value, max, delay, h]);
  const anim = useAnimatedStyle(() => ({ height: `${Math.min(1, h.value) * 100}%` }));
  return (
    <View style={styles.colTrack}>
      <Animated.View style={[{ width: '100%', borderRadius: 6, backgroundColor: color }, anim]} />
    </View>
  );
}

const BADGES = [
  { id: 'first', emoji: '🍳', title: 'First cook', test: (c: Ctx) => c.cooked >= 1 },
  { id: 'streak3', emoji: '🔥', title: '3-day streak', test: (c: Ctx) => c.streak >= 3 },
  { id: 'saved1k', emoji: '💰', title: '₹1,000 saved', test: (c: Ctx) => c.saved >= 1000 },
  { id: 'saved5k', emoji: '🏦', title: '₹5,000 saved', test: (c: Ctx) => c.saved >= 5000 },
  { id: 'protein', emoji: '💪', title: 'Protein day', test: (c: Ctx) => c.proteinDays >= 1 },
  { id: 'water', emoji: '💧', title: 'Hydrated', test: (c: Ctx) => c.waterDays >= 1 },
  { id: 'mover', emoji: '🏃', title: '5 workouts', test: (c: Ctx) => c.workouts >= 5 },
  { id: 'chef', emoji: '👨‍🍳', title: '10 home meals', test: (c: Ctx) => c.cooked >= 10 },
];
type Ctx = { cooked: number; streak: number; saved: number; proteinDays: number; waterDays: number; workouts: number };

// `embedded` is set by the Track tab, which draws its own top inset and switcher.
export function ProgressScreen({ embedded = false }: { embedded?: boolean }) {
  const { days, profile, moneySaved, streak } = useStore();
  const goal = GOALS[profile.goal];
  const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6));
  const logs = week.map((d) => days[dayKey(d)]);
  const totals = logs.map((l) => (l ? dayTotals(l) : { kcalIn: 0, kcalOut: 0, protein: 0, fibre: 0 }));
  const logged = totals.filter((t) => t.kcalIn > 0);
  const avg = (k: keyof (typeof totals)[number]) => (logged.length ? Math.round(logged.reduce((s, t) => s + t[k], 0) / logged.length) : 0);
  const max = Math.max(goal.kcal * 1.2, ...totals.map((t) => t.kcalIn));

  const allMeals = Object.values(days).flatMap((d) => d.meals);
  const cooked = allMeals.filter((m) => m.cooked).length;
  const ctx: Ctx = {
    cooked,
    streak,
    saved: moneySaved,
    proteinDays: Object.values(days).filter((d) => dayTotals(d).protein >= goal.protein * 0.9).length,
    waterDays: Object.values(days).filter((d) => d.water >= WATER_TARGET).length,
    workouts: Object.values(days).reduce((s, d) => s + d.exercise.length, 0),
  };
  const homeShare = allMeals.length ? Math.round((cooked / allMeals.length) * 100) : 0;

  // Weekly nutrition report: suggest dishes that close the biggest gap.
  const proteinGap = avg('protein') / goal.protein;
  const fibreGap = avg('fibre') / FIBRE_TARGET;
  const gap = proteinGap < fibreGap ? 'protein' : 'fibre';
  const fixers = [...dishes].sort((a, b) => (gap === 'protein' ? b.proteinG - a.proteinG : b.fibreG - a.fibreG)).slice(0, 2);

  return (
    <SafeAreaView edges={embedded ? [] : ['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Progress</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Your last 7 days.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <Glass style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.h2, { color: colors.text }]}>Calories</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Legend color={colors.accent} label="In" />
                <Legend color={colors.warm} label="Burnt" />
              </View>
            </View>
            <View style={styles.chart}>
              <View style={[styles.goalLine, { bottom: `${(goal.kcal / max) * 100}%` }]}>
                <Text style={styles.goalText}>goal {goal.kcal}</Text>
              </View>
              {totals.map((t, i) => (
                <View key={i} style={styles.colWrap}>
                  <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', gap: 3, alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Column value={t.kcalIn} max={max} color={colors.accent} delay={i * 60} />
                    <Column value={t.kcalOut} max={max} color={colors.warm} delay={i * 60 + 30} />
                  </View>
                  <Text style={[styles.colLabel, i === 6 && { color: colors.text }]}>{DAY[week[i].getDay()]}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <Mini label="avg eaten" value={`${avg('kcalIn')}`} />
              <Mini label="avg burnt" value={`${avg('kcalOut')}`} />
              <Mini label="home-cooked" value={`${homeShare}%`} color={colors.accent} />
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={[type.h2, { color: colors.text }]}>Weekly nutrition report</Text>
            <View style={{ gap: 14, marginTop: 14 }}>
              <Nutrient label="Protein" value={avg('protein')} target={goal.protein} unit="g" color={colors.violet} />
              <Nutrient label="Fibre" value={avg('fibre')} target={FIBRE_TARGET} unit="g" color={colors.accent2} />
            </View>
            <Text style={{ color: colors.text, marginTop: 16, fontWeight: '700' }}>
              {gap === 'protein' ? '💪 You were lowest on protein.' : '🥦 You were lowest on fibre.'} These close the gap:
            </Text>
            <View style={{ marginTop: 10 }}>
              {fixers.map((d) => (
                <DishRow key={d.id} dish={d} right={<Text style={{ color: colors.accent, fontWeight: '900' }}>{gap === 'protein' ? `${d.proteinG} g` : `${d.fibreG} g`}</Text>} />
              ))}
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={3}>
          <Glass style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: colors.muted }]}>Total saved by cooking</Text>
              <CountUp value={moneySaved} prefix="₹" style={{ color: colors.warn, fontSize: 32, fontWeight: '900', letterSpacing: -1 }} />
            </View>
            <Text style={{ fontSize: 46 }}>💰</Text>
          </Glass>
        </FadeIn>

        <FadeIn i={4}>
          <SectionHeader title="Achievements" />
          <View style={styles.badges}>
            {BADGES.map((b) => {
              const on = b.test(ctx);
              return (
                <View key={b.id} style={[styles.badge, !on && { opacity: 0.35 }]}>
                  <View style={[styles.badgeIcon, on && styles.badgeIconOn]}>
                    <Text style={{ fontSize: 26 }}>{on ? b.emoji : '🔒'}</Text>
                  </View>
                  <Text style={styles.badgeText}>{b.title}</Text>
                </View>
              );
            })}
          </View>
        </FadeIn>

        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 18 }]} onPress={() => router.push('/profile')}>
          Demo data is pre-filled for the last 6 days. Reset it in Profile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={[type.small, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function Mini({ label, value, color = colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color, fontSize: 18, fontWeight: '900' }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function Nutrient({ label, value, target, unit, color }: { label: string; value: number; target: number; unit: string; color: string }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: colors.muted }}>
          avg {value}
          {unit} / {target}
          {unit} a day
        </Text>
      </View>
      <Bar progress={value / target} color={color} height={10} />
    </View>
  );
}

export default function Progress() {
  return <ProgressScreen />;
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', height: 170, marginTop: 18, gap: 8 },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.25)', marginBottom: 18 },
  goalText: { position: 'absolute', right: 0, top: -16, color: colors.muted, fontSize: 10 },
  colWrap: { flex: 1, alignItems: 'center' },
  colTrack: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  colLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  badge: { width: '23%', alignItems: 'center' },
  badgeIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badgeIconOn: { backgroundColor: 'rgba(255,181,71,0.15)', borderColor: 'rgba(255,181,71,0.5)', borderRadius: radius.pill },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 6 },
});
```

### `src/app/(tabs)/index.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolate, Extrapolation } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishCardTall } from '../../components/DishCard';
import { Bar, CountUp, FadeIn, Glass, Glow, PressableScale, Ring, SectionHeader } from '../../components/ui';
import { dishLibraryHref, profileHref } from '../../config/tabs';
import { dishes } from '../../data/dishes';
import { select, success } from '../../lib/haptics';
import { dayTotals, FIBRE_TARGET, GOALS, recommend, useStore, WATER_TARGET } from '../../lib/store';
import { colors, gradients, radius, type } from '../../theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function QuickAction({ icon, label, tint, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; tint: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.qa} scaleTo={0.93} accessibilityLabel={label}>
      <View style={[styles.qaIcon, { backgroundColor: tint + '22' }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </PressableScale>
  );
}

export default function Today() {
  const s = useStore();
  const { profile, today, moneySaved, streak, user } = s;
  const goal = GOALS[profile.goal];
  const t = dayTotals(today);
  const left = goal.kcal - t.kcalIn + t.kcalOut;
  const picks = recommend(profile).slice(0, 6);
  const evening = new Date().getHours() >= 17;
  const breakfasts = dishes.filter((d) => (evening ? d.tags.includes('night-before') : d.tags.includes('zero-energy')));

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const headerBg = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, 60], [0, 1], Extrapolation.CLAMP) }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Glow color={colors.accentDark} size={420} style={{ top: -120, left: -60 }} />
      <Glow color="#3a1d0a" size={360} style={{ top: 40, right: -120 }} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={[styles.headerBg, headerBg]} pointerEvents="none" />
        <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <FadeIn i={0}>
            <View style={styles.header}>
              <View>
                <Text style={[type.small, { color: colors.muted }]}>{greeting()}</Text>
                <Text style={[type.h1, { color: colors.text }]}>{profile.name || 'there'} 👋</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={styles.streak}>
                  <Text style={{ fontSize: 15 }}>🔥</Text>
                  <Text style={styles.streakText}>{streak}</Text>
                </View>
                <PressableScale onPress={() => router.push(profileHref())} style={styles.avatar} accessibilityLabel="Open your profile">
                  {user?.photo ? (
                    <Image source={{ uri: user.photo }} referrerPolicy="no-referrer" style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>{(profile.name || 'F')[0].toUpperCase()}</Text>
                  )}
                </PressableScale>
              </View>
            </View>
          </FadeIn>

          <FadeIn i={1}>
            <Glass style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                <Ring size={136} stroke={13} progress={t.kcalIn / (goal.kcal + t.kcalOut)}>
                  <CountUp value={Math.max(0, left)} style={styles.ringNum} />
                  <Text style={styles.ringLabel}>kcal left</Text>
                </Ring>
                <View style={{ flex: 1, gap: 12 }}>
                  <View style={styles.kv}>
                    <Ionicons name="restaurant" size={15} color={colors.accent} />
                    <Text style={styles.kvLabel}>Eaten</Text>
                    <Text style={styles.kvVal}>{t.kcalIn}</Text>
                  </View>
                  <View style={styles.kv}>
                    <Ionicons name="flame" size={15} color={colors.warm} />
                    <Text style={styles.kvLabel}>Burnt</Text>
                    <Text style={styles.kvVal}>{t.kcalOut}</Text>
                  </View>
                  <View style={styles.kv}>
                    <Ionicons name="flag" size={15} color={colors.blue} />
                    <Text style={styles.kvLabel}>Goal</Text>
                    <Text style={styles.kvVal}>{goal.kcal}</Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 18 }}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nutRow}>
                    <Text style={styles.nutLabel}>Protein</Text>
                    <Text style={styles.nutVal}>
                      {t.protein}/{goal.protein} g
                    </Text>
                  </View>
                  <Bar progress={t.protein / goal.protein} color={colors.violet} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nutRow}>
                    <Text style={styles.nutLabel}>Fibre</Text>
                    <Text style={styles.nutVal}>
                      {t.fibre}/{FIBRE_TARGET} g
                    </Text>
                  </View>
                  <Bar progress={t.fibre / FIBRE_TARGET} color={colors.accent2} />
                </View>
              </View>
            </Glass>
          </FadeIn>

          <FadeIn i={2}>
            <PressableScale
              scaleTo={0.98}
              onPress={() => {
                success();
                Share.share({ message: `I've saved ₹${moneySaved.toLocaleString('en-IN')} by cooking instead of ordering, with FitPlate 🍽️💪` }).catch(() => {});
              }}
              style={{ marginTop: 14 }}
            >
              <LinearGradient colors={gradients.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.money}>
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { color: 'rgba(0,0,0,0.6)' }]}>Saved by cooking</Text>
                  <CountUp value={moneySaved} prefix="₹" style={styles.moneyNum} duration={1400} />
                  <Text style={styles.moneySub}>That’s {Math.floor(moneySaved / 350)} restaurant meals’ worth</Text>
                </View>
                <View style={styles.shareBtn}>
                  <Ionicons name="share-social" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </PressableScale>
          </FadeIn>

          <FadeIn i={3}>
            <View style={styles.qaRow}>
              <QuickAction icon="fast-food" label="Log meal" tint={colors.warm} onPress={() => router.push({ pathname: '/log', params: { tab: 'meal' } })} />
              <QuickAction icon="barbell" label="Workout" tint={colors.violet} onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise' } })} />
              <QuickAction icon="cart" label="Groceries" tint={colors.accent} onPress={() => router.push('/grocery')} />
              <QuickAction icon="search" label="Find dish" tint={colors.blue} onPress={() => router.push(dishLibraryHref())} />
            </View>
          </FadeIn>

          <FadeIn i={4}>
            <Glass style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[type.h2, { color: colors.text }]}>Water</Text>
                  <Text style={[type.small, { color: colors.muted }]}>
                    {today.water} of {WATER_TARGET} glasses
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <PressableScale onPress={() => s.addWater(-1)} style={styles.round}>
                    <Ionicons name="remove" size={18} color={colors.text} />
                  </PressableScale>
                  <PressableScale onPress={() => s.addWater(1)} style={[styles.round, { backgroundColor: colors.blue }]}>
                    <Ionicons name="add" size={18} color="#04202b" />
                  </PressableScale>
                </View>
              </View>
              <View style={styles.glasses}>
                {Array.from({ length: WATER_TARGET }).map((_, i) => (
                  <PressableScale
                    key={i}
                    haptic={false}
                    onPress={() => {
                      select();
                      s.addWater(i + 1 - today.water);
                    }}
                    scaleTo={0.85}
                  >
                    <Ionicons name={i < today.water ? 'water' : 'water-outline'} size={26} color={i < today.water ? colors.blue : colors.faint} />
                  </PressableScale>
                ))}
              </View>
            </Glass>
          </FadeIn>

          <FadeIn i={5}>
            <SectionHeader title={`Picked for you · ${goal.label.toLowerCase()}`} action="See all" onAction={() => router.push(dishLibraryHref())} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18 }} decelerationRate="fast" snapToInterval={214}>
              {picks.map((d) => (
                <DishCardTall key={d.id} dish={d} />
              ))}
            </ScrollView>
          </FadeIn>

          <FadeIn i={6}>
            <SectionHeader title={evening ? '🌙 Prep tonight, eat tomorrow' : '⚡ Zero-energy breakfasts'} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18 }}>
              {breakfasts.map((d) => (
                <DishCardTall key={d.id} dish={d} width={160} />
              ))}
            </ScrollView>
          </FadeIn>

          <FadeIn i={7}>
            <SectionHeader title="Today's log" action="Add" onAction={() => router.push('/log')} />
            {today.meals.length + today.exercise.length === 0 ? (
              <Glass>
                <Text style={{ color: colors.muted, textAlign: 'center' }}>Nothing logged yet. Tap + to add a meal, a workout or water.</Text>
              </Glass>
            ) : (
              <Glass style={{ paddingVertical: 6 }}>
                {today.meals.map((m, i) => (
                  <View key={`m${i}`} style={styles.logRow}>
                    <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logName}>{m.name}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>{m.cooked ? 'Cooked at home' : 'Logged'} · {m.protein} g protein</Text>
                    </View>
                    <Text style={styles.logKcal}>+{m.kcal}</Text>
                  </View>
                ))}
                {today.exercise.map((e, i) => (
                  <View key={`e${i}`} style={styles.logRow}>
                    <Text style={{ fontSize: 22 }}>🏃</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logName}>{e.type}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>{e.minutes} min</Text>
                    </View>
                    <Text style={[styles.logKcal, { color: colors.warm }]}>−{e.kcal}</Text>
                  </View>
                ))}
              </Glass>
            )}
          </FadeIn>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,138,61,0.15)', borderWidth: 1, borderColor: 'rgba(255,138,61,0.35)' },
  streakText: { color: colors.warm, fontWeight: '900', fontSize: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.accent },
  avatarText: { color: colors.text, fontWeight: '900', fontSize: 16 },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  ringNum: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  ringLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '600' },
  kv: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kvLabel: { color: colors.muted, flex: 1, fontSize: 14 },
  kvVal: { color: colors.text, fontWeight: '800', fontSize: 16 },
  nutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nutLabel: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  nutVal: { color: colors.text, fontSize: 12.5, fontWeight: '700' },
  money: { borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center' },
  moneyNum: { color: '#1a0a00', fontSize: 36, fontWeight: '900', letterSpacing: -1, marginTop: 2 },
  moneySub: { color: 'rgba(26,10,0,0.75)', fontSize: 13, fontWeight: '600' },
  shareBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  qaRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  qa: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  qaIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  qaLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  round: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  glasses: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  logName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  logKcal: { color: colors.accent, fontWeight: '900', fontSize: 15 },
});
```

### `src/app/profile.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import type { Diet } from '../data/dishes';
import { setReminders } from '../lib/reminders';
import { GOALS, useStore, type Goal, type Level } from '../lib/store';
import { colors, type } from '../theme';

// `asTab` is set by the Profile tab of the new shell: no back button, and room
// at the bottom for the floating tab bar.
export function ProfileScreen({ asTab = false }: { asTab?: boolean }) {
  const { profile, updateProfile, signOut, resetDemo, user, favourites } = useStore();
  return (
    <SafeAreaView edges={asTab ? ['top'] : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        {asTab ? (
          <View style={{ width: 40 }} />
        ) : (
          <PressableScale onPress={() => router.back()} style={styles.back} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </PressableScale>
        )}
        <Text style={[type.h2, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: asTab ? 150 : 60 }}>
        <FadeIn i={0}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <View style={styles.avatar}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} referrerPolicy="no-referrer" style={{ width: 78, height: 78, borderRadius: 39 }} />
              ) : (
                <Text style={{ color: colors.text, fontSize: 34, fontWeight: '900' }}>{(profile.name || 'F')[0].toUpperCase()}</Text>
              )}
            </View>
            <Text style={[type.h1, { color: colors.text, marginTop: 10 }]}>{profile.name || 'Guest'}</Text>
            <Text style={{ color: colors.muted }}>
              {user?.guest ? 'Demo mode · not signed in' : user?.email ? `Signed in with Google · ${user.email}` : 'Signed in with Google'}
            </Text>
          </View>
        </FadeIn>

        <FadeIn i={1}>
          <Glass>
            <Text style={styles.label}>Goal</Text>
            <View style={styles.chips}>
              {(Object.keys(GOALS) as Goal[]).map((g) => (
                <Chip key={g} label={`${GOALS[g].emoji} ${GOALS[g].label}`} active={profile.goal === g} onPress={() => updateProfile({ goal: g })} />
              ))}
            </View>
            <Text style={[type.small, { color: colors.muted, marginTop: 8 }]}>
              Target {GOALS[profile.goal].kcal} kcal and {GOALS[profile.goal].protein} g protein a day.
            </Text>
            <Text style={[styles.label, { marginTop: 18 }]}>Diet</Text>
            <View style={styles.chips}>
              {([['veg', '🥦 Veg'], ['egg', '🥚 Egg'], ['non-veg', '🍗 Non-veg']] as [Diet, string][]).map(([d, l]) => (
                <Chip key={d} label={l} active={profile.diet === d} onPress={() => updateProfile({ diet: d })} />
              ))}
            </View>
            <Text style={[styles.label, { marginTop: 18 }]}>Cooking level</Text>
            <View style={styles.chips}>
              {([['beginner', '🌱 Beginner'], ['expert', '👨‍🍳 Expert']] as [Level, string][]).map(([d, l]) => (
                <Chip key={d} label={l} active={profile.level === d} onPress={() => updateProfile({ level: d })} />
              ))}
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Glass style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 26 }}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>Breakfast & batch-cook nudges</Text>
              <Text style={[type.small, { color: colors.muted }]}>9 pm prep reminder, Sunday batch-cook reminder</Text>
            </View>
            <Switch
              value={profile.breakfastReminder}
              onValueChange={(v) => {
                updateProfile({ breakfastReminder: v });
                setReminders(v).catch(() => {});
              }}
              trackColor={{ true: colors.accent, false: '#333' }}
              thumbColor="#fff"
            />
          </Glass>
        </FadeIn>

        <FadeIn i={3}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>❤️ {favourites.length} saved dishes</Text>
            <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>Find them under {featureFlags.newTabShell ? 'Cook' : 'Discover'} → Saved.</Text>
          </Glass>
        </FadeIn>

        <View style={{ gap: 10, marginTop: 24 }}>
          <GradientButton
            title="Reset demo data"
            variant="glass"
            onPress={() =>
              Alert.alert('Reset demo data?', 'This restores the sample week and clears your logs.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: resetDemo },
              ])
            }
          />
          <GradientButton
            title="Sign out"
            variant="glass"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        </View>
        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          FitPlate demo · nutrition and prices are estimates, not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Profile() {
  return <ProfileScreen />;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.accent },
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
```

### `src/components/ui.tsx`

```tsx
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import { tap } from '../lib/haptics';
import { colors, gradients, radius, type } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Springy press feedback used by every tappable surface. */
export function PressableScale({
  children,
  onPress,
  style,
  disabled,
  haptic = true,
  scaleTo = 0.96,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  haptic?: boolean;
  scaleTo?: number;
  /** Screen-reader label for icon-only buttons. */
  accessibilityLabel?: string;
}) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => s.set(withSpring(scaleTo, { damping: 18, stiffness: 400 }))}
      onPressOut={() => s.set(withSpring(1, { damping: 14, stiffness: 300 }))}
      onPress={() => {
        if (haptic) tap();
        onPress?.();
      }}
      style={[anim, style, disabled && { opacity: 0.5 }]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'warm' | 'glass';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <View style={styles.btnInner}>
      {icon}
      <Text style={[styles.btnText, { color: variant === 'glass' ? colors.text : '#06210F' }]}>{title}</Text>
    </View>
  );
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={[styles.btn, style]} accessibilityLabel={title}>
      {variant === 'glass' ? (
        <View style={[styles.btnFill, styles.glassBtn]}>{content}</View>
      ) : (
        <LinearGradient
          colors={variant === 'warm' ? gradients.warm : gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnFill}
        >
          {content}
        </LinearGradient>
      )}
    </PressableScale>
  );
}

/** Frosted card. Real blur on iOS/web, tinted glass on Android. */
export function Glass({ children, style, intensity = 30 }: { children: ReactNode; style?: StyleProp<ViewStyle>; intensity?: number }) {
  return (
    <View style={[styles.glass, style]}>
      {Platform.OS !== 'android' ? (
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

/** Staggered entrance for lists and sections. */
export function FadeIn({ children, i = 0, style }: { children: ReactNode; i?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.delay(60 + i * 70).duration(520).springify().damping(18)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Animated progress ring. */
export function Ring({
  size = 120,
  stroke = 12,
  progress,
  colorsFrom = '#B4F461',
  colorsTo = '#16A34A',
  children,
}: {
  size?: number;
  stroke?: number;
  progress: number;
  colorsFrom?: string;
  colorsTo?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [progress, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colorsFrom} />
            <Stop offset="1" stopColor={colorsTo} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}

/** Animated bar used for progress and nutrients. */
export function Bar({ progress, color = colors.accent, height = 8 }: { progress: number; color?: string; height?: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, w]);
  const anim = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, anim]} />
    </View>
  );
}

/** Number that counts up when it changes. */
export function CountUp({ value, prefix = '', style, duration = 1000 }: { value: number; prefix?: string; style?: StyleProp<any>; duration?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = Date.now();
    const a = from.current;
    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(a + (value - a) * e));
      if (t < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <Text style={style}>
      {prefix}
      {shown.toLocaleString('en-IN')}
    </Text>
  );
}

/** Gradient tile with the dish emoji, used wherever a photo would go. */
export function DishArt({
  emoji,
  palette,
  size = 72,
  rounded = radius.md,
  style,
}: {
  emoji: string;
  palette: readonly [string, string];
  size?: number | '100%';
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const n = typeof size === 'number' ? size : 220;
  return (
    <LinearGradient
      colors={[palette[0], palette[1]]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[{ width: size, height: size === '100%' ? undefined : size, borderRadius: rounded, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}
    >
      <View style={[styles.artGlow, { width: n * 0.9, height: n * 0.9, borderRadius: n }]} />
      <Text style={{ fontSize: n * 0.5 }}>{emoji}</Text>
    </LinearGradient>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <PressableScale onPress={onPress} style={[styles.chip, active && styles.chipOn]} scaleTo={0.92}>
      <Text style={[styles.chipText, active && { color: '#06210F' }]}>{label}</Text>
    </PressableScale>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={[type.h2, { color: colors.text }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Stat({ label, value, hint, color = colors.text }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>{label}</Text>
      {hint ? <Text style={[type.small, { color: colors.accent }]}>{hint}</Text> : null}
    </View>
  );
}

/** Muted, looping, cover-fit background video. */
export function VideoBackground({ source, dim = 0.35 }: { source: number; dim?: number }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />
    </View>
  );
}

/** Soft breathing glow, used behind heroes. */
export function Glow({ color = colors.accent, size = 260, style }: { color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(0.35);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.7, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  const core = size * 0.35;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: core,
          height: core,
          borderRadius: core,
          backgroundColor: color,
          boxShadow: `0px 0px ${Math.round(size * 0.5)}px ${Math.round(size * 0.3)}px ${color}`,
        },
        anim,
        style,
      ]}
    />
  );
}

export const styles = StyleSheet.create({
  btn: { borderRadius: radius.pill, overflow: 'hidden' },
  btnFill: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: radius.pill },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: colors.border },
  glass: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: 'rgba(20,26,23,0.55)' },
  card: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: colors.cardSolid },
  artGlow: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.22)', top: '-25%', left: '-20%' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 },
});
```

### `src/config/featureFlags.ts`

```ts
// Feature flags for the auto-build roadmap. Every feature that is not finished,
// or that needs a native development build, ships switched OFF so the app
// always runs in Expo Go exactly as before. A flag turns ON once its day's
// "Done when" check passes; it then stays as a kill switch.
export const featureFlags = {
  /** Day 2: five-tab shell (Today, Cook, Track, Move, Profile). ON since Day 2; false restores the demo's four tabs. */
  newTabShell: true,
  /** Day 4–5: load dishes, ingredients, nutrients and exercises from research JSON. */
  researchData: false,
  /** Day 12: camera check step in cook mode (plan only; needs a dev build). */
  cameraCheck: false,
  /** Day 12: read steps aloud with expo-speech. */
  voiceSteps: false,
  /** Day 17 / 33: local reminders through expo-notifications. */
  reminders: false,
  /** Day 26: live pose-based rep counting (needs a dev build). */
  poseRepCounter: false,
  /** Day 32: free vs paid locks. Everything is free until Sudarsan decides. */
  paywall: false,
  /** Day 3+: Firestore as the store for signed-in users (SPEC-ADDENDA §5). OFF until the storage layer ships and Firestore is enabled. */
  cloudSync: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag, flags: Record<FeatureFlag, boolean> = featureFlags): boolean {
  return flags[flag] === true;
}
```

### `src/services/activity.ts`

```ts
import { addDays, dayKey, type DayLog } from '../lib/store';

export type WeekActivity = { sessions: number; minutes: number; kcal: number; activeDays: number };

/** Workouts logged in the last 7 days, today included. Used by the Move tab. */
export function lastSevenDaysActivity(days: Record<string, DayLog | undefined>, now: Date = new Date()): WeekActivity {
  const out: WeekActivity = { sessions: 0, minutes: 0, kcal: 0, activeDays: 0 };
  for (let i = 0; i < 7; i++) {
    const log = days[dayKey(addDays(now, -i))];
    if (!log || log.exercise.length === 0) continue;
    out.activeDays += 1;
    for (const e of log.exercise) {
      out.sessions += 1;
      out.minutes += e.minutes;
      out.kcal += e.kcal;
    }
  }
  return out;
}
```

### `src/__tests__/tabs.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { ALL_TAB_ROUTES, dishLibraryHref, LEGACY_TABS, profileHref, SHELL_TABS, visibleTabs } from '../config/tabs';

describe('tab shell', () => {
  it('shows the five Day 2 tabs in order when the new shell is on', () => {
    expect(visibleTabs(true).map((t) => t.label)).toEqual(['Today', 'Cook', 'Track', 'Move', 'Profile']);
  });

  it('keeps the demo four tabs when the new shell is off', () => {
    expect(visibleTabs(false).map((t) => t.name)).toEqual(['index', 'discover', 'plan', 'progress']);
  });

  it('keeps Today as the first tab in both shells, so the calorie ring stays the home screen', () => {
    expect(SHELL_TABS[0].name).toBe('index');
    expect(LEGACY_TABS[0].name).toBe('index');
  });

  it('registers every tab route exactly once, so old links still resolve', () => {
    expect(new Set(ALL_TAB_ROUTES).size).toBe(ALL_TAB_ROUTES.length);
    for (const t of [...SHELL_TABS, ...LEGACY_TABS]) expect(ALL_TAB_ROUTES).toContain(t.name);
  });

  it('never names a tab route "profile", which is already a stack screen', () => {
    expect(ALL_TAB_ROUTES).not.toContain('profile');
  });

  it('gives every tab a label and two icons', () => {
    for (const t of SHELL_TABS) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.icon).not.toBe(t.iconOutline);
    }
  });

  it('points links at the right screens for each shell', () => {
    expect(dishLibraryHref(true)).toBe('/cook');
    expect(dishLibraryHref(false)).toBe('/discover');
    expect(profileHref(true)).toBe('/me');
    expect(profileHref(false)).toBe('/profile');
  });
});
```

### `src/__tests__/activity.test.ts`

```ts
import { describe, expect, it, jest } from '@jest/globals';

import { addDays, dayKey, type DayLog } from '../lib/store';
import { lastSevenDaysActivity } from '../services/activity';

// The store module also sets up Firebase sign-in, which Jest cannot load (ESM).
// These tests only need its date helpers, so Firebase is stubbed out. Jest
// hoists these calls above the imports.
jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn(), signOut: jest.fn() }));
jest.mock('../lib/firebase', () => ({ firebaseConfigured: false, getFirebaseAuth: () => null }));

const now = new Date(2026, 9, 10, 12, 0);
const day = (exercise: DayLog['exercise']): DayLog => ({ meals: [], exercise, water: 0 });

describe('lastSevenDaysActivity', () => {
  it('returns zeros when nothing is logged', () => {
    expect(lastSevenDaysActivity({}, now)).toEqual({ sessions: 0, minutes: 0, kcal: 0, activeDays: 0 });
  });

  it('sums workouts from today and the six days before', () => {
    const days = {
      [dayKey(now)]: day([{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }]),
      [dayKey(addDays(now, -6))]: day([
        { type: 'Yoga', minutes: 20, kcal: 60, at: 0 },
        { type: 'Run', minutes: 15, kcal: 150, at: 0 },
      ]),
    };
    expect(lastSevenDaysActivity(days, now)).toEqual({ sessions: 3, minutes: 65, kcal: 330, activeDays: 2 });
  });

  it('ignores workouts older than seven days and days with no workout', () => {
    const days = {
      [dayKey(addDays(now, -7))]: day([{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }]),
      [dayKey(addDays(now, -1))]: day([]),
    };
    expect(lastSevenDaysActivity(days, now)).toEqual({ sessions: 0, minutes: 0, kcal: 0, activeDays: 0 });
  });
});
```

### `src/__tests__/config.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { featureFlags, isEnabled, type FeatureFlag } from '../config/featureFlags';
import { brand, colors, spacing } from '../config/theme';

describe('feature flags', () => {
  it('ships every unfinished feature switched off', () => {
    // Finished features stay listed here so turning one on is always a deliberate test change.
    const finished: FeatureFlag[] = ['newTabShell'];
    for (const flag of Object.keys(featureFlags) as FeatureFlag[]) {
      expect(isEnabled(flag)).toBe(finished.includes(flag));
    }
  });

  it('reads an overridden flag set', () => {
    const flags = { ...featureFlags, voiceSteps: true };
    expect(isEnabled('voiceSteps', flags)).toBe(true);
    expect(isEnabled('cloudSync', flags)).toBe(false);
  });
});

describe('theme tokens', () => {
  it('uses FitPlate green as the brand primary', () => {
    expect(brand.primary).toBe('#1E8A5A');
    expect(colors.primary).toBe(brand.primary);
  });

  it('keeps the demo palette available to new screens', () => {
    expect(colors.bg).toBe('#07090A');
    expect(colors.accent).toBe('#3DDC84');
  });

  it('has an increasing spacing scale', () => {
    const values = Object.values(spacing);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});
```

### `jest.config.js`

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts?(x)'],
  // AsyncStorage has no native module under Jest; use the in-memory mock it ships.
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
};
```

### `firestore.rules`

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### `docs/DATA_MODEL.md`

````markdown
# FitPlate data model

This file is the single description of every piece of data FitPlate stores. The daily auto-build updates it on every build day (SPEC-ADDENDA §5) and adds a changelog line at the bottom.

## 1. Where data lives

| Kind | Store | Shared across devices? |
|---|---|---|
| Research content (dishes, ingredients, nutrients, hydration, guidance, exercises) | Bundled JSON in the app (`src/data/research/…`, from Day 4) | Yes. Every device gets the same files with each deploy. |
| Signed-in user's own data (profile, logs, plans, favourites …) | Cloud Firestore, `users/{uid}/…` (from Day 3) | Yes. That is the point of the cloud store. |
| Offline copy of the signed-in user's data | Firestore's local cache (web: persistent cache) plus AsyncStorage | No (one device) |
| Guest data (not signed in) | AsyncStorage only | No (one device) |

Research content is never copied into Firestore. User documents refer to it by id only (`dishId`, `ingredientId`, `nutrientId`, `exerciseId`).

## 2. Today's storage (demo, until Day 3)

Everything sits in one JSON blob in AsyncStorage under the key `fitplate.state.v2` (`src/lib/store.tsx`). Day 3 migrates it into the repositories below and keeps reading it once, so nobody loses data.

| Field | Type | Meaning |
|---|---|---|
| `profile.name` | string | First name shown on Today |
| `profile.goal` | `'lose' \| 'maintain' \| 'gain' \| 'muscle'` | Picks the daily kcal and protein target (`GOALS`) |
| `profile.level` | `'beginner' \| 'expert'` | Cooking level |
| `profile.diet` | `'veg' \| 'egg' \| 'non-veg'` | Filters dishes |
| `profile.breakfastReminder` | boolean | 9 pm prep and Sunday batch-cook reminders |
| `profile.onboarded` | boolean | Onboarding finished |
| `days[YYYY-MM-DD].meals[]` | `{ name, emoji, kcal, protein, fibre, cooked, at }` | Meals eaten that day; `cooked` = made at home; `at` = epoch ms |
| `days[YYYY-MM-DD].exercise[]` | `{ type, minutes, kcal, at }` | Workouts; kcal from MET × 70 kg × hours (estimate) |
| `days[YYYY-MM-DD].water` | number | Glasses of water |
| `moneySaved` | number (₹) | Running total saved by cooking instead of ordering |
| `favourites` | string[] | Demo dish ids |
| `plan[YYYY-MM-DD][slot]` | demo dish id | Meal plan; slot = breakfast, lunch or dinner |

## 3. Cloud layout (Firestore, from Day 3)

Database: Firestore, default database, location `asia-south1`, Spark (free) plan.

### Fields every document has

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Same as the document id |
| `createdAt` | number (epoch ms) | When it was first written |
| `updatedAt` | number (epoch ms) | Last change; conflicts resolve last-write-wins on this |
| `schemaVersion` | number | Version of this document type; older documents are migrated when read |
| `deleted` | boolean | Soft delete, so other devices learn about deletions |

### Collections

| Path | Holds | Added on | Links to research ids |
|---|---|---|---|
| `users/{uid}` | Profile document (UserProfile fields) | Day 3 (planned) | — |
| `users/{uid}/mealLogs/{id}` | One meal eaten | Day 3 (planned) | `dishId` |
| `users/{uid}/waterLogs/{id}` | Water intake | Day 3 (planned) | — |
| `users/{uid}/supplementLogs/{id}` | Supplement taken | Day 3 (planned) | `nutrientId` |
| `users/{uid}/workoutLogs/{id}` | One workout | Day 3 (planned) | `exerciseId` |
| `users/{uid}/favourites/{id}` | Saved dish | when first needed | `dishId` |
| `users/{uid}/mealPlans/{id}` | Meal plan entries | when first needed | `dishId` |
| `users/{uid}/groceryLists/{id}` | Shopping list | when first needed | `ingredientId` |
| `users/{uid}/ratings/{id}` | The user's own dish rating | when first needed | `dishId` |
| `users/{uid}/savings/{id}` | Money saved by cooking | when first needed | `dishId` |

A collection is created only on the day a feature first needs it; this table then gets its full field list.

### Security rules

Kept in `firestore.rules` at the repo root. Only the signed-in owner can read or write anything under `users/{their uid}`. New subcollections under `users/{uid}` need no rule change. A new top-level collection would need a new rule and a USER ACTION in that day's build file.

### Free-tier guard

Spark allows about 20,000 writes and 50,000 reads a day. Writes are batched and debounced (for example the water +/- buttons), each screen uses one listener, and the app never writes in a loop on start-up.

## 4. Guests and sign-in

- Guests: data stays in AsyncStorage on the device.
- Guest signs in with Google: the app offers to copy the device data into the account (one tap), then uses the cloud copy.
- Sign-out: the cloud data stays; the device cache is cleared.

## 5. Changelog

- 2026-10-10 (Day 2): file created. Documents the demo blob (`fitplate.state.v2`) and the planned Firestore layout. Added `firestore.rules`. No schema code yet and no data changes; the navigation shell stores nothing new.
````

## 7. DEPENDENCIES

None. Nothing was installed today.

## 8. HOW TO APPLY (for Sudarsan)

Run these from inside the `FITPLATE` folder on your Mac.

**Option A (simplest): the code is already on the branch**
1. `git add -A && git commit -m "Before Day 02"` (skip this if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand.** Day 01 must be applied first.
1. `git add -A && git commit -m "Before Day 02"`
2. Create the NEW files from section 6 at the paths shown. In `src/app/(tabs)/`, these are `cook.tsx`, `track.tsx`, `move.tsx` and `me.tsx`. The others are `src/config/tabs.ts`, `src/services/activity.ts`, two test files, `firestore.rules` and `docs/DATA_MODEL.md`.
3. Replace each CHANGED file with its full content from section 6.
4. `npx expo start -c`

## 9. HOW TO TEST

**Quickest check: the live site** https://fitplateapp.netlify.app. It redeploys automatically from this push.

**Manual checklist (web: the live URL or `w` → http://localhost:8081; iPhone: Expo Go or the live URL in Safari)**
- [ ] The welcome screen and onboarding work as before. Web ☐ iPhone ☐
- [ ] After onboarding, the Today tab shows the calorie ring, and the bar shows Today · Cook · Track · Move · Profile with a green + at the right. Web ☐ iPhone ☐
- [ ] Tap **Cook**: the dish browser, titled "Cook". Web ☐ iPhone ☐
- [ ] Tap **Track**: Progress shows. Tap **Meal plan**: the planner shows. Web ☐ iPhone ☐
- [ ] Tap **Move**: last-7-days workouts, Log a workout, Coming soon list. Web ☐ iPhone ☐
- [ ] Tap **Profile**: settings with no back arrow; "Find them under Cook → Saved." Web ☐ iPhone ☐
- [ ] Tap **+**: the quick-log sheet opens. Web ☐ iPhone ☐
- [ ] On Today, tap your avatar: the Profile tab opens. Tap "Find dish": the Cook tab opens. Web ☐ iPhone ☐
- [ ] Sign out from Profile, then sign in with Google: it works as before. Web ☐ iPhone ☐

**Automated (run in this session on 2026-10-10; real results)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems) |
| Unit tests | `npm test` | ✅ 3 suites, 15 tests passed |
| Web bundle | `npx expo export -p web` | ✅ exported without errors |
| Web click-through | Playwright (Chromium, 390×844) on the exported site | ✅ guest onboarding → all 5 tabs, Track switcher, avatar → `/me`, + → `/log`, old `/discover` `/plan` `/progress` `/profile` links open; no page errors |

Not tested here: Expo Go on a real iPhone, and Google sign-in with real keys. Those need your phone and your account.

## 10. KNOWN ISSUES, LIMITATIONS AND TODOs

- Cook and Track reuse demo screens through named exports from route files (`DiscoverScreen`, `ProgressScreen`, `PlanScreen`, `ProfileScreen`). This is deliberate to avoid a big move on Day 2. Day 6 (Cook library) and Day 29 (Track dashboard) replace them with components outside `src/app/`.
- The Profile tab's route is `/me`, because `/profile` is the existing stack screen. Both show the same settings.
- The old `discover`, `plan` and `progress` tabs are hidden, not removed. Opening them by URL shows the screen with no tab highlighted. They are removed once nothing links to them (Day 35).
- Track always opens on Progress. It does not remember the last choice yet; that comes with the storage layer.
- Move's numbers come from the demo's own workout log (MET × 70 kg estimates), not research data. The exercise library arrives on Day 21.

## 11. USER ACTIONS ADDED TODAY

**Create Firestore and paste the security rules (open; Sudarsan said on 2026-10-10 that he is setting this up)**
- **Why:** from Day 3, signed-in users' data is saved in Firestore, so it is the same on every device.
- **When:** before Day 3 goes live (2026-10-11). Until then the app keeps working on device storage.
- **Steps:**
  1. In the Firebase console, open the FitPlate project, then Build → Firestore Database → Create database.
  2. Choose Production mode, location `asia-south1` (Mumbai), and the default database.
  3. Open the **Rules** tab, replace everything with the contents of `firestore.rules` from the repo (also in section 6), and press Publish.
  4. Stay on the free Spark plan; no billing is needed.
- **Time:** about 5 minutes.

## 12. BUILD STATE

### Roadmap

| Day | Item | Status |
|---|---|---|
| 1 | Audit and architecture | ✅ done |
| 2 | Navigation shell | ✅ done |
| 3 | Data models and storage | ⬜ |
| 4 | Research pipeline I (dishes, ingredients) | ⬜ |
| 5 | Research pipeline II (nutrients, hydration, fitness, cross-links) | ⬜ |
| 6 | Dish library (Cook tab) | ⬜ |
| 7 | Dish detail screen | ⬜ |
| 8 | Cost-to-make engine | ⬜ |
| 9 | Servings scaler and shopping list | ⬜ |
| 10 | Cooking level and kitchen personalisation | ⬜ |
| 11 | Guided cook mode (core) | ⬜ |
| 12 | Cook mode extras | ⬜ |
| 13 | Meal logging and a real Today screen | ⬜ |
| 14 | After the meal and savings dashboard | ⬜ |
| 15 | INTEGRATION #1 | ⬜ |
| 16 | Profile and targets engine | ⬜ |
| 17 | Water tracker | ⬜ |
| 18 | Vitamin and mineral tracking | ⬜ |
| 19 | Nutrition insights | ⬜ |
| 20 | INTEGRATION #2 | ⬜ |
| 21 | Exercise library (Move tab) | ⬜ |
| 22 | Exercise detail | ⬜ |
| 23 | Routines | ⬜ |
| 24 | Workout player | ⬜ |
| 25 | Rep-counter and form-check engine | ⬜ |
| 26 | Camera workout mode | ⬜ |
| 27 | Burn and balance | ⬜ |
| 28 | INTEGRATION #3 | ⬜ |
| 29 | Track tab dashboard | ⬜ |
| 30 | Recommendations | ⬜ |
| 31 | Onboarding and personalisation upgrade | ⬜ |
| 32 | Free vs paid scaffold and settings | ⬜ |
| 33 | Reminders and habits | ⬜ |
| 34 | Cloud sync hardening (per SPEC-ADDENDA §5) | ⬜ |
| 35 | Quality pass | ⬜ |
| 36 | Feasibility documents | ⬜ |
| 37 | Final integration and handover | ⬜ |

### Baseline audit (demo-app @ 5f62d71)

- **Stack:** Expo SDK 57 (`expo ~57.0.26`), React Native 0.86.3, React 19.2.3, TypeScript ~6.0 (strict), Expo Router ~57 with typed routes, Reanimated 4, ESLint 9 (`eslint-config-expo` flat config). There are no `ios/` or `android/` folders (Continuous Native Generation).
- **Folders:** `src/app/` (routes only), `src/components/` (`ui.tsx` shared UI, `DishCard`, `GoogleSignInButton`), `src/data/dishes.ts` (5 demo dishes), `src/lib/` (`store.tsx`, `firebase.ts`, `haptics.ts`, `reminders.ts`), `src/theme.ts`, `assets/` (icons, `videos/login.mp4`).
- **Navigation (Expo Router):** root `Stack` in `src/app/_layout.tsx` → `index` (welcome/login), `onboarding`, `(tabs)`, `dish/[id]`, `cook/[id]`, `done/[id]`, `shop/[id]`, `profile`, `grocery`, `log` (form sheet). `(tabs)/_layout.tsx` is a custom floating blurred tab bar with the tabs **Today** (`index`), **Discover**, **Plan** and **Progress**, plus a centre "+" button that opens `/log`.
- **Auth flow:** `src/lib/firebase.ts` turns Firebase on only when `EXPO_PUBLIC_FIREBASE_API_KEY`, `_PROJECT_ID` and `_APP_ID` exist. The Google button shows only if a Google client ID is also set. Otherwise "Get started" runs `continueAsGuest`. `index.tsx` redirects a signed-in or guest user to `/onboarding` or `/(tabs)`.
- **State:** a single React context (`StoreProvider` / `useStore`) holding the profile, day logs (meals, exercise, water), money saved, favourites and the meal plan. It is saved as one JSON blob in AsyncStorage under `fitplate.state.v2` and seeded with sample history for the demo. Helpers in the store: `GOALS` targets, `EXERCISES` METs (70 kg), `QUICK_MEALS`, `dayTotals`, `recommend`, `allowedDishes`.
- **Styling:** `StyleSheet.create` plus tokens from `src/theme.ts` (dark palette, gradients, radius, type). `expo-blur`, `expo-linear-gradient` and Reanimated are used for motion. Haptics go through `src/lib/haptics.ts`.
- **Already installed and usable later:** AsyncStorage, `expo-notifications`, `expo-keep-awake`, `expo-haptics`, `expo-video`, `react-native-svg`, `@expo/vector-icons`.

### ARCHITECTURE (final; all later days follow this)

1. **Conventions:** TypeScript strict; Expo Router; every file in `src/app/` is a route, and non-route code lives outside it. `StyleSheet.create` with tokens. Functional components and hooks. Named exports for logic, default exports for route screens. Two-space indent, single quotes (as in the repo). Comments explain *why*.
2. **Navigation map (built on Day 2):** the custom floating tab bar is driven by `src/config/tabs.ts`. Tabs: **Today** (`(tabs)/index`), **Cook** (`(tabs)/cook`: shows the demo dish browser until Day 6), **Track** (`(tabs)/track`: Progress / Meal plan switcher until Day 29), **Move** (`(tabs)/move`: placeholder until Day 21) and **Profile** (`(tabs)/me`). The Profile tab file is `me`, not `profile`, because `/profile` is already a stack screen and two routes cannot share a URL. The "+" quick-log button sits at the right end of the bar. `discover`, `plan` and `progress` stay registered with `href: null`, so old links still open. `featureFlags.newTabShell` is ON; false restores the demo's four tabs. Links that depend on the shell use `dishLibraryHref()` and `profileHref()`. The stack routes (`dish/[id]`, `cook/[id]`, `done/[id]`, `shop/[id]`, `profile`, `grocery`, `log`) are unchanged.
3. **Storage (Day 3), now cloud-first per SPEC-ADDENDA §5:** typed repositories backed by Firestore (`users/{uid}/…`) for signed-in users and AsyncStorage for guests and as the offline cache; last-write-wins on `updatedAt`; every document has `id`, `createdAt`, `updatedAt`, `schemaVersion`, `deleted`. The schema is documented in `docs/DATA_MODEL.md`, rules in `firestore.rules`. The original plan, kept for the local layer: `src/services/storage/` wraps AsyncStorage with typed keys (`fitplate.<name>.v<N>`), versioned envelopes `{ version, data }`, a migration hook, `exportAll()` and `resetAll()`. Repositories: `mealLogs`, `waterLogs`, `supplementLogs`, `workoutLogs`, `profile`. A one-time migration reads `fitplate.state.v2` so demo users keep their data. The React context stays as the in-memory cache and calls the repositories.
4. **Data folder layout (Day 4–5):** `src/data/research/dishes/<NNN>-<slug>.json`, `ingredients/<id>.json` plus `aliases.json`, `nutrients/<id>.json`, `hydration/<id>.json`, `guidance/<id>.json`, `exercises/<id>.json`. Each folder has a generated `index.ts` of static `require`s. The demo `src/data/dishes.ts` stays separate until the research dishes replace it on the Cook tab. Importers, merge rules, the price engine, cross-links and validators go in `src/services/data/`, written as plain TS functions so Jest can test them. The import itself is run by the build session with a Node script (`scripts/research/`) that writes the JSON files; the app only reads bundled JSON.
5. **Theme tokens:** `src/config/theme.ts` (`brand.primary` #1E8A5A, `colors`, `spacing`, `radius`, `typography`, `touchTarget` 44). Dark theme stays, as decided in section 4.
6. **Types (Day 3):** `src/models/` holds `Dish`, `Ingredient`, `Nutrient`, `Hydration`, `Guidance`, `Exercise`, `MealLog`, `WaterLog`, `SupplementLog`, `WorkoutLog` and `UserProfile`, with the field names from the spec's DEFAULT ARCHITECTURE, plus `Dish.asOrdered` and full `Ingredient.nutritionPer100g` with per-field `source` and `confidence` (SPEC-ADDENDA). The demo's own `Profile`/`MealLog` types in `store.tsx` are mapped to these by the Day 3 migration.
7. **Feature flags:** `src/config/featureFlags.ts`, a typed `as const` object plus `isEnabled()`. Unfinished or dev-build-only features stay `false` until their "Done when" check passes.
8. **Testing:** Jest 29 with the `jest-expo` preset (`jest.config.js`). Tests live in `src/**/__tests__/*.test.ts(x)` and import `describe`/`it`/`expect` from `@jest/globals` (TypeScript 6 does not pick up global jest types automatically). `npm test`. Every logic module gets tests. Jest maps `@react-native-async-storage/async-storage` to its bundled mock; tests that import `src/lib/store.tsx` stub `firebase/auth` and `../lib/firebase` with `jest.mock` (Firebase ships ESM that Jest cannot load). Before every push the checks are `npx tsc --noEmit`, `npx expo lint`, `npm test` and `npx expo export --platform web`.

### Code files touched since the baseline

| Path | Last changed |
|---|---|
| `src/config/theme.ts` | Day 1 |
| `package.json` | Day 1 |
| `package-lock.json` | Day 1 |
| `src/config/tabs.ts` | Day 2 |
| `src/app/(tabs)/_layout.tsx` | Day 2 |
| `src/app/(tabs)/cook.tsx` | Day 2 |
| `src/app/(tabs)/track.tsx` | Day 2 |
| `src/app/(tabs)/move.tsx` | Day 2 |
| `src/app/(tabs)/me.tsx` | Day 2 |
| `src/app/(tabs)/discover.tsx` | Day 2 |
| `src/app/(tabs)/plan.tsx` | Day 2 |
| `src/app/(tabs)/progress.tsx` | Day 2 |
| `src/app/(tabs)/index.tsx` | Day 2 |
| `src/app/profile.tsx` | Day 2 |
| `src/components/ui.tsx` | Day 2 |
| `src/config/featureFlags.ts` | Day 2 |
| `src/services/activity.ts` | Day 2 |
| `src/__tests__/tabs.test.ts` | Day 2 |
| `src/__tests__/activity.test.ts` | Day 2 |
| `src/__tests__/config.test.ts` | Day 2 |
| `jest.config.js` | Day 2 |
| `firestore.rules` | Day 2 |
| `docs/DATA_MODEL.md` | Day 2 |
| `public/index.html`, `public/manifest.json`, `public/*.png`, `assets/icon.png`, `assets/favicon.png` (app icon) | merged from demo-app on 2026-10-10 (5c97126), not by the build |
| `src/lib/store.tsx`, `src/app/index.tsx`, `.env.example` (Google photo and email) | merged from demo-app on 2026-10-09 (c8a2449), not by the build |

### Feature flags

| Flag | Value | For |
|---|---|---|
| newTabShell | **true** (since Day 2; false restores the demo's 4 tabs) | Day 2 |
| researchData | false | Day 4–6 |
| cameraCheck | false | Day 12 (dev build) |
| voiceSteps | false | Day 12 |
| reminders | false | Day 17 / 33 |
| poseRepCounter | false | Day 26 (dev build) |
| paywall | false | Day 32 (everything free; open decision) |
| cloudSync | false | Day 3+ (Firestore for signed-in users, SPEC-ADDENDA §5) |

### Dependencies added so far

| Package | Version | Type | Day |
|---|---|---|---|
| jest | ^29.7.0 | dev | 1 |
| jest-expo | ~57.0.5 | dev | 1 |
| @jest/globals | ^29.7.0 | dev | 1 |

### RESEARCH LEDGER

| Stream | File | Items | Ingested on build day |
|---|---|---|---|
| Dishes | FitPlate_Dishes_2026-10-04.md | 1–5 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-05.md | 6–10 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-06.md | 11–15 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-07.md | 16–20 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-08.md | 21–25 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-09.md | 26–30 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-04.md | 47 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-05.md | 21 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-06.md | 10 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-07.md | 5 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-08.md | 7 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-09.md | 7 | — (backlog) |
| Nutrients | FitPlate_Nutrients_2026-10-09.md | 1 Vitamin A, 2 Vitamin D | — (backlog) |
| Fitness | FitPlate_Fitness_2026-10-09.md | Home 1, Yoga 1, Gym 1, Gym 2 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-10.md | 31–35 | — (backlog; recorded Day 2) |
| Ingredients | FitPlate_Ingredients_2026-10-10.md | 13 | — (backlog; recorded Day 2) |
| Nutrients | FitPlate_Nutrients_2026-10-10.md | 3 Vitamin E, 4 Vitamin K | — (backlog; recorded Day 2) |
| Fitness | FitPlate_Fitness_2026-10-10.md | Home 2, Yoga 2, Gym 3, Gym 4 | — (backlog; recorded Day 2) |

- **Backlog per stream:**
  - Dishes: 7 files / 35 items
  - Ingredients: 7 files / 110 entries
  - Nutrients: 2 files / 4 topics
  - Fitness: 2 files / 8 items
- **Per-item versions:** every item still has 1 version, and nothing has been merged or output yet.
- **Catch-up plan:** from Day 4, at 10 dishes and 30 ingredients a day, the dish backlog shrinks by about 5 a day. The ingredient backlog (about 136 entries by Day 4, +13 a day at the current pace) clears in roughly 8 runs.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema changes today:** none in code. The navigation shell saves nothing new.
- **Added:** `docs/DATA_MODEL.md`, which documents the current demo blob (`fitplate.state.v2`) and the planned Firestore layout (`users/{uid}` plus subcollections, and the common fields `id`, `createdAt`, `updatedAt`, `schemaVersion`, `deleted`). Also `firestore.rules` (owner-only).
- **Migration:** none today. Day 3 writes the first one (`fitplate.state.v2` → repositories, plus guest → account copy).
- **Tests:** none for the database yet. Day 3 adds repository and migration tests against a mocked Firestore.
- **USER ACTION:** create Firestore and paste the rules (section 11).

### Research gaps

1. Dishes 1–20 (files 10-04 to 10-07) have no "AS ORDERED (from delivery apps)" block. Their as-ordered nutrition stays null until each dish is re-researched.
2. Ingredients from the files dated 10-04 to 10-08 (90 entries) lack the full per-100 g nutrient-profile JSON. They stay null until each ingredient is re-priced.
3. Nutrient topics 5–42 and later fitness items have not been researched yet (expected; those routines run daily).
4. Dish order prices from 10-10 come from search-result snapshots, because delivery-app pages block direct access. Confidence should reflect that. Possible prompt improvement: name the snapshot date and source page for each restaurant.

### IDEAS BACKLOG

Empty. It fills from the supervisor review's NEW ideas, starting 2026-10-11.

### USER ACTIONS (cumulative)

| # | Action | Added | Status |
|---|---|---|---|
| 1 | Create Firestore (asia-south1, Spark) and publish `firestore.rules` | Day 2 | open |

**Next up: Day 03: Data models and storage (cloud-first: Firestore for signed-in users, AsyncStorage for guests and offline, per SPEC-ADDENDA §5)**
