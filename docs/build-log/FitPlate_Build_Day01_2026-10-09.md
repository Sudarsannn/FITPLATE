# FitPlate Build — Day 01 — 2026-10-09

## 1. HEADER

**Day 01 of 37 | Roadmap item: Audit and architecture | Phase 0: Foundation and data pipeline | Progress: 3% of the full app (1 ÷ 37)**

- **How today's day was determined:** there were no earlier `FitPlate_Build_Day*.md` files in `/mnt/project-files/auto-build/`, so I used the day-number rule. Day 1 = 9 October 2026, and today is 9 October 2026 (IST), so today is Day 1. No earlier day is marked INCOMPLETE.
- **Supervisor review:** there is no `FitPlate_Review_*.md` yet (the first review is due 2026-10-11), so there is no FIX LIST today.
- **Context available:**
  - Code source **(b)**: the GitHub baseline, branch `demo-app` @ `5f62d71`, read in full in a checkout. Code source (a) does not exist yet, because this is the first build file.
  - Spec: `auto-build/PROMPT.md` plus `auto-build/SPEC-ADDENDA.md` (dish "AS ORDERED" block; full ingredient nutrient profile).
  - Research files visible: Dishes 6 (2026-10-04 … 2026-10-09), Ingredients 6 (2026-10-04 … 2026-10-09), Nutrients 1 (2026-10-09), Fitness 1 (2026-10-09).
  - Project memory and `.notes/inputs.md` (idea-dump summary) were read for feature intent.

## 2. SUMMARY

1. I read the whole demo app and documented how it is built: Expo SDK 57, Expo Router, TypeScript, one React-context store saved to AsyncStorage, and a dark neon theme.
2. I wrote the ARCHITECTURE that the next 36 days will follow (section 12), adapting the default architecture to the repo's real conventions.
3. I added a theme-tokens file in FitPlate green (#1E8A5A) and a feature-flags file with every unfinished feature switched off.
4. I set up unit testing (Jest with jest-expo) and wrote a first test. It passes, along with the type-check, lint and a full web build.
5. Nothing on screen changes today. The research ledger is started, with 14 files (30 dishes, 97 ingredient entries, 2 nutrient topics, 4 fitness items) waiting for their importers on Days 4–5.

## 3. DATA SYNC REPORT

No importer exists yet (dishes and ingredients from Day 4; nutrients, hydration and fitness from Day 5). Per section C2, today only **records** the files in the ledger and ingests nothing.

| Stream | File date | Items | Status |
|---|---|---|---|
| Dishes | 2026-10-04 | #1 Poha, #2 Chicken Biryani, #3 Paneer Butter Masala, #4 Masala Dosa, #5 Dal Tadka | Backlog |
| Dishes | 2026-10-05 | #6 Upma, #7 Butter Chicken, #8 Chole (Chana Masala), #9 Idli with Sambar, #10 Veg Fried Rice | Backlog |
| Dishes | 2026-10-06 | #11 Aloo Paratha, #12 Rajma Chawal, #13 Pav Bhaji, #14 Egg Bhurji, #15 Veg Hakka Noodles | Backlog |
| Dishes | 2026-10-07 | #16 Besan Chilla, #17 Palak Paneer, #18 Chicken Tikka Masala, #19 Jeera Rice, #20 Vada Pav | Backlog |
| Dishes | 2026-10-08 | #21 Masala Omelette, #22 Kadai Paneer, #23 Mutton Rogan Josh, #24 Medu Vada, #25 Veg Pulao | Backlog (has AS ORDERED block) |
| Dishes | 2026-10-09 | #26 Moong Dal Chilla, #27 Dal Makhani, #28 Chicken 65, #29 Misal Pav, #30 Lemon Rice | Backlog (has AS ORDERED block) |
| Ingredients | 2026-10-04 | 47 items (poha … saffron) | Backlog |
| Ingredients | 2026-10-05 | 21 items (carrot … black pepper powder) | Backlog |
| Ingredients | 2026-10-06 | 10 items (atta … cumin powder) | Backlog |
| Ingredients | 2026-10-07 | 5 items (besan … desiccated coconut) | Backlog |
| Ingredients | 2026-10-08 | 7 items (mutton … dry ginger powder) | Backlog |
| Ingredients | 2026-10-09 | 7 items (moong dal … farsan) | Backlog (has full nutrient-profile JSON, per PATCH_01) |
| Nutrients | 2026-10-09 | #1 Vitamin A, #2 Vitamin D | Backlog |
| Fitness | 2026-10-09 | Home 1 Bodyweight squat; Yoga & Stretch 1 Desk neck and shoulder release; Gym 1 Gym basics; Gym 2 Warm-up and cool-down protocol | Backlog |

- **Backlog remaining:** Dishes 30 items in 6 files · Ingredients 97 entries in 6 files · Nutrients 2 topics in 1 file · Fitness 4 items in 1 file.
- **Items added or updated:** none (no importers yet).
- **Price trends:** none yet. Every ingredient has at most 1 observation, so every trend will start as "unknown", method "single".
- **Conflicts, outliers, spikes, "needs review":** none (nothing merged yet).
- **Format notes found while recording:**
  - All six dish files are already the v2 per-1-serving format. No old 2-serving files exist, so the Day 4 converter only needs a guard.
  - The dish files dated 10-08 and 10-09 carry the "AS ORDERED (from delivery apps)" block. The four earlier files do not.
  - Only the ingredient file dated 10-09 carries the full nutrient-profile JSON (see `ingredient-research/PATCH_01_nutrient_profile.md`). Its section 6 is headed "Nutrition per 100 g (or 100 ml)", while earlier files say "(est.)". The importer must read both.
- **Unmatched ingredient names:** not checked yet (the alias map is built on Day 5).
- **New research gaps:** see the list in BUILD STATE.

## 4. DESIGN NOTES

There are no new or changed screens today. Every existing screen renders exactly as in the baseline.

Design decisions recorded for later days:
- **Visual direction:** the demo uses a dark background (#07090A) with a neon green accent (#3DDC84). The spec's default says "light mode first", but rebuilding every screen would break the "do not break anything" rule and the look Sudarsan already approved. So the dark theme stays. FitPlate green #1E8A5A is the **brand primary** for new components: primary buttons on light surfaces, charts, the price trend UI, badges and the app icon on Day 35. Both palettes live in one token file, `src/config/theme.ts`.
- **Copy tone:** keep the demo's tone (short, friendly, "Cook it. Track it. Burn it."). Health information uses gentle wording and never alarm-red.

## 5. DATA FILES

None today. The per-item JSON layout is created on Day 4.

## 6. CODE FILES

| Path | NEW or CHANGED | Purpose |
|---|---|---|
| `src/config/theme.ts` | NEW | Design tokens: brand green #1E8A5A, spacing, radius, typography, touch target; re-exports the demo palette |
| `src/config/featureFlags.ts` | NEW | Feature flags for every roadmap feature (all OFF) and `isEnabled()` |
| `jest.config.js` | NEW | Jest with the jest-expo preset; tests live in `src/**/__tests__/` |
| `src/__tests__/config.test.ts` | NEW | First unit test: flags are off, overrides work, theme tokens are correct |
| `package.json` | CHANGED | Adds `jest`, `jest-expo` and `@jest/globals` (dev) and an `npm test` script |
| `package-lock.json` | CHANGED | Lockfile update for the three dev dependencies (generated by npm; take it from the branch) |

### `src/config/theme.ts`

```ts
// Design tokens for everything built from the auto-build roadmap onwards.
// The demo screens keep using src/theme.ts (dark look, neon accent) so nothing
// that already works changes; new screens import from here instead, and the
// two meet on the shared palette re-exported below.
import { colors as demoColors, gradients, radius as demoRadius, type as demoType } from '../theme';

export const brand = {
  // FitPlate green: the brand colour for buttons, highlights and charts.
  primary: '#1E8A5A',
  primaryPressed: '#17704A',
  primarySoft: 'rgba(30,138,90,0.16)',
  onPrimary: '#FFFFFF',
} as const;

export const colors = {
  ...demoColors,
  primary: brand.primary,
  primaryPressed: brand.primaryPressed,
  primarySoft: brand.primarySoft,
  onPrimary: brand.onPrimary,
  // Trend arrows and gentle status colours; never alarm-red for health copy.
  trendUp: demoColors.warn,
  trendDown: demoColors.accent,
  info: demoColors.blue,
} as const;

// 4-point spacing scale.
export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { ...demoRadius, xs: 6 } as const;

export const typography = {
  ...demoType,
  // Large step text for guided cook mode and workout player.
  step: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  number: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
} as const;

// Minimum touch target (Apple HIG / Material) for one-thumb use.
export const touchTarget = 44;

export { gradients };
```

### `src/config/featureFlags.ts`

```ts
// Feature flags for the auto-build roadmap. Every feature that is not finished,
// or that needs a native development build, ships switched OFF so the app
// always runs in Expo Go exactly as before. Flip a flag here to try a feature.
export const featureFlags = {
  /** Day 2: five-tab shell (Today, Cook, Track, Move, Profile). */
  newTabShell: false,
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
  /** Day 34: Firestore cloud sync. Stays OFF until Firestore is enabled. */
  cloudSync: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag, flags: Record<FeatureFlag, boolean> = featureFlags): boolean {
  return flags[flag] === true;
}
```

### `jest.config.js`

```js
// Unit tests run with jest-expo so React Native and Expo modules resolve the
// same way they do in the app.
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts?(x)'],
};
```

### `src/__tests__/config.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { featureFlags, isEnabled, type FeatureFlag } from '../config/featureFlags';
import { brand, colors, spacing } from '../config/theme';

describe('feature flags', () => {
  it('ships every unfinished feature switched off', () => {
    for (const flag of Object.keys(featureFlags) as FeatureFlag[]) {
      expect(isEnabled(flag)).toBe(false);
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

### `package.json`

```json
{
  "name": "fitplate",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "dependencies": {
    "@expo/vector-icons": "^15.0.2",
    "@react-native-async-storage/async-storage": "2.2.0",
    "eslint-config-expo": "~57.0.2",
    "expo": "~57.0.26",
    "expo-auth-session": "~57.0.13",
    "expo-blur": "~57.0.3",
    "expo-constants": "~57.0.20",
    "expo-crypto": "~57.0.3",
    "expo-font": "~57.0.4",
    "expo-haptics": "~57.0.3",
    "expo-keep-awake": "~57.0.2",
    "expo-linear-gradient": "~57.0.2",
    "expo-linking": "~57.0.11",
    "expo-notifications": "~57.0.21",
    "expo-router": "~57.0.24",
    "expo-status-bar": "~57.0.1",
    "expo-video": "~57.0.5",
    "expo-web-browser": "~57.0.3",
    "firebase": "^12.19.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-svg": "15.15.4",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.10.1"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@types/react": "~19.2.2",
    "eslint": "^9.39.5",
    "jest": "^29.7.0",
    "jest-expo": "~57.0.5",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit",
    "lint": "expo lint",
    "test": "jest"
  },
  "private": true
}
```

## 7. DEPENDENCIES

Dev-only, all free and open source. They don't change the app bundle or Expo Go.

```bash
npx expo install jest-expo jest -- --save-dev
npm install --save-dev @jest/globals@^29.7.0
```

(If you check out the branch, `npm install` alone is enough.)

## 8. HOW TO APPLY (for Sudarsan)

Run these from inside the `FITPLATE` folder on your Mac.

**Option A (simplest): the code is already on a branch**
1. `git add -A && git commit -m "Before Day 01"` (saves any local changes; skip it if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand**
1. Day 1 only: `git checkout demo-app && git pull`, then `git checkout -b auto-build`
2. `git add -A && git commit -m "Before Day 01"`
3. Create the four NEW files from section 6 at the paths shown: `src/config/theme.ts`, `src/config/featureFlags.ts`, `jest.config.js`, `src/__tests__/config.test.ts`.
4. Replace `package.json` with the version in section 6.
5. Run the install commands in section 7. This regenerates `package-lock.json`.
6. `npx expo start -c`

No earlier days need to be applied first; this is Day 1.

## 9. HOW TO TEST

**Manual checklist (web: press `w` → http://localhost:8081; iPhone: scan the QR code in Expo Go)**
- [ ] The welcome screen shows the looping cooking video and "Your health starts on your plate." Web ☐ iPhone ☐
- [ ] Tap **Get started** (or **Try it without signing in** if Google keys are set) → onboarding opens. Web ☐ iPhone ☐
- [ ] Finish onboarding → the Today tab shows the calorie ring. Web ☐ iPhone ☐
- [ ] The Discover, Plan and Progress tabs and the green + button all open as before. Web ☐ iPhone ☐
- [ ] If your `.env` has Firebase keys: Google sign-in still works in your development build.

**Automated (run in this session on 2026-10-09; real results, not estimates)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems) |
| Unit tests | `npm test` | ✅ 1 suite, 5 tests passed |
| Web bundle | `npx expo export --platform web` | ✅ exported without errors |

Not tested here: running in Expo Go on a real iPhone, and Google sign-in with real keys. Those need your phone and your `.env`.

## 10. KNOWN ISSUES, LIMITATIONS AND TODOs

- `src/theme.ts` (demo palette) and `src/config/theme.ts` (new tokens) both exist on purpose. New code imports from `src/config/theme.ts`. The old file is folded in at the Day 35 quality pass, not earlier, so working screens are never touched just to rename imports.
- The demo store (`src/lib/store.tsx`) keeps its own types (`Profile`, `MealLog`, `DayLog`) and seeds sample history. Day 3 adds the typed storage service and a migration from the `fitplate.state.v2` key, so existing on-device data carries over.
- `src/data/dishes.ts` holds 5 hand-made demo dishes with estimated numbers. They stay as the fallback until the research importer is live (`researchData` flag, Day 4–6). They are not research data and must not be merged with it.
- The `.env.example` file lists `EXPO_PUBLIC_LOGIN_VIDEO_URL`. It is unused by code today, and is noted for Day 35.
- npm reports existing audit warnings in transitive packages. They are not new today and not fixable without breaking Expo SDK pins.

## 11. USER ACTIONS ADDED TODAY

None. Day 1 needs nothing from you.

## 12. BUILD STATE

### Roadmap

| Day | Item | Status |
|---|---|---|
| 1 | Audit and architecture | ✅ done |
| 2 | Navigation shell | ⬜ |
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
| 34 | Cloud sync (OFF by default) | ⬜ |
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
2. **Navigation map (Day 2):** keep the custom floating tab bar and its "+" quick-log button. Tabs become **Today** (`(tabs)/index`), **Cook** (`(tabs)/cook`: dish library; the current Discover content moves here), **Track** (`(tabs)/track`: the current Progress and Plan content, later the dashboard), **Move** (`(tabs)/move`: exercise library) and **Profile** (`(tabs)/profile`). The stack routes (`dish/[id]`, `cook/[id]`, `done/[id]`, `shop/[id]`, `grocery`, `log`) stay. The new shell sits behind `featureFlags.newTabShell` until it is verified, and the old routes redirect so no deep link breaks.
3. **Storage (Day 3):** `src/services/storage/` wraps AsyncStorage with typed keys (`fitplate.<name>.v<N>`), versioned envelopes `{ version, data }`, a migration hook, `exportAll()` and `resetAll()`. Repositories: `mealLogs`, `waterLogs`, `supplementLogs`, `workoutLogs`, `profile`. A one-time migration reads `fitplate.state.v2` so demo users keep their data. The React context stays as the in-memory cache and calls the repositories.
4. **Data folder layout (Day 4–5):** `src/data/research/dishes/<NNN>-<slug>.json`, `ingredients/<id>.json` plus `aliases.json`, `nutrients/<id>.json`, `hydration/<id>.json`, `guidance/<id>.json`, `exercises/<id>.json`. Each folder has a generated `index.ts` of static `require`s. The demo `src/data/dishes.ts` stays separate until the research dishes replace it on the Cook tab. Importers, merge rules, the price engine, cross-links and validators go in `src/services/data/`, written as plain TS functions so Jest can test them. The import itself is run by the build session with a Node script (`scripts/research/`) that writes the JSON files; the app only reads bundled JSON.
5. **Theme tokens:** `src/config/theme.ts` (`brand.primary` #1E8A5A, `colors`, `spacing`, `radius`, `typography`, `touchTarget` 44). Dark theme stays, as decided in section 4.
6. **Types (Day 3):** `src/models/` holds `Dish`, `Ingredient`, `Nutrient`, `Hydration`, `Guidance`, `Exercise`, `MealLog`, `WaterLog`, `SupplementLog`, `WorkoutLog` and `UserProfile`, with the field names from the spec's DEFAULT ARCHITECTURE, plus `Dish.asOrdered` and full `Ingredient.nutritionPer100g` with per-field `source` and `confidence` (SPEC-ADDENDA). The demo's own `Profile`/`MealLog` types in `store.tsx` are mapped to these by the Day 3 migration.
7. **Feature flags:** `src/config/featureFlags.ts`, a typed `as const` object plus `isEnabled()`. Unfinished or dev-build-only features stay `false` until their "Done when" check passes.
8. **Testing:** Jest 29 with the `jest-expo` preset (`jest.config.js`). Tests live in `src/**/__tests__/*.test.ts(x)` and import `describe`/`it`/`expect` from `@jest/globals` (TypeScript 6 does not pick up global jest types automatically). `npm test`. Every logic module gets tests. Before every push the checks are `npx tsc --noEmit`, `npx expo lint`, `npm test` and `npx expo export --platform web`.

### Code files touched since the baseline

| Path | Last changed |
|---|---|
| `src/config/theme.ts` | Day 1 |
| `src/config/featureFlags.ts` | Day 1 |
| `jest.config.js` | Day 1 |
| `src/__tests__/config.test.ts` | Day 1 |
| `package.json` | Day 1 |
| `package-lock.json` | Day 1 |

### Feature flags

| Flag | Value | For |
|---|---|---|
| newTabShell | false | Day 2 |
| researchData | false | Day 4–6 |
| cameraCheck | false | Day 12 (dev build) |
| voiceSteps | false | Day 12 |
| reminders | false | Day 17 / 33 |
| poseRepCounter | false | Day 26 (dev build) |
| paywall | false | Day 32 (everything free; open decision) |
| cloudSync | false | Day 34 |

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

- **Backlog per stream:** Dishes 6 files / 30 items · Ingredients 6 files / 97 entries · Nutrients 1 file / 2 topics · Fitness 1 file / 4 items.
- **Per-item versions:** every item so far has 1 version, and none has been merged or output yet. Per-item version tracking starts when the importers write their first JSON (Day 4).
- **Catch-up plan:** at the caps of 10 dishes and 30 ingredients per day, from Day 4 the dish backlog (+5 a day) shrinks by about 5 a day and the ingredient backlog clears in roughly 4–5 runs.

### Research gaps

1. Dishes 1–20 (files 10-04 to 10-07) have no "AS ORDERED (from delivery apps)" block. Their as-ordered nutrition will be null until each dish is re-researched (about 20 days later).
2. Ingredients from the files dated 10-04 to 10-08 (90 entries) lack the full per-100 g nutrient-profile JSON. Their section 6 values are marked "(est.)". These stay null until each ingredient is re-priced.
3. Nutrient topics 3–42 and fitness items beyond Day 1 have not been researched yet (expected; those routines started today).

### IDEAS BACKLOG

Empty. It fills from the supervisor review's NEW ideas, starting 2026-10-11.

### USER ACTIONS (cumulative)

None yet.

**Next up: Day 02: Navigation shell (Today, Cook, Track, Move, Profile)**
