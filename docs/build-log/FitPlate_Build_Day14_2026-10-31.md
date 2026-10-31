# FitPlate Build — Day 14 — 2026-10-31

## 1. HEADER

**Day 14 of 37 | Roadmap item: After the meal and savings dashboard | Phase 1: Food (the core) | Progress: 38% of the full app (14 ÷ 37)**

**Status: DONE.** Commit `dc471c9` is pushed to `claude/project-thread-wchnlm`, which Cloudflare deploys. 57 test suites, 808 tests pass; tsc and lint clean; web export OK; browser click-through at 390x844 clean (no page errors).

- Day 13 was the newest build file; no Day 14 file existed. No new supervisor review and no FIX LIST items left.

## 2. SUMMARY

Much of Day 14 already existed (storage and remix text on the dish page and finish screen, "balance it out" with MET and your weight, opt-in only). Today added the missing parts:
1. **Saved by cooking** card on Progress: money saved (order price minus ingredient cost, cooked meals with both prices) and calories against the restaurant version, for today, the last 7 days and this month. Dearer home meals show as a negative; meals with no confirmed price are left out and counted in a note.
2. **Storage reminders:** on the finish screen, "Put away: use by N days" saves the dish as a leftover (N read from the dish's own storage note, 2 days if it names none). Today shows "Use up your leftovers" soonest first with the researched remix idea and a Finished button.
3. **Burn it off** already links from the finish screen to the Balance screen (MET x your weight, safety-filtered, never automatic); unchanged.
4. **Innovation built: Cook with what I have** (`fridgeRescue`): a button on Track > Ingredients opens a ranked list of dishes by how many main ingredients you already have, with what is missing. Salt, oil, ghee, spices and water are ignored; rice and dal count.

## 3. DATA SYNC REPORT

`run.js --today 2026-10-31 --build Day14`, once. Dishes: 5 ingested (98 in the app, backlog 0). Ingredients: 23 ingested (176 in the app, backlog 0). Nutrients: 0 new (24 in the app). Fitness: 0 new (32 in the app).

## 4. DESIGN NOTES

Same glass cards as Today and Progress. Savings columns are amber, negative amounts red. No emoji. Leftover rows turn amber when due or past; past-date rows say "smell and check before eating" and drop off after 2 days.

## 5. INNOVATION

- **Built:** `fridgeRescue` (ideas queue item 6 of 7). Next in the queue: Plain-words search (`plainSearch`).
- **New ideas (added to the backlog):** 16k use-up chain (when a leftover is due, rank Cook-tab dishes that reuse it), 16l deduct ingredients on cook then feed Cook with what I have, 16m monthly savings goal jar with a progress ring (extends idea 6).

## 6. DATABASE (SPEC-ADDENDA §5)

`settings.leftovers` (array of dishId, name, storedAt, useByDays, remix) joins the synced settings doc. No new collection; meal logs already carry costInr, orderInr and servings, which the savings maths reads. Rules unchanged (users/{uid}/** owner-only).

## 7. DATA FILES

Dish and ingredient JSON refreshed by the sync (src/data/research/dishes, ingredients, links.json, ledger.json).

## 8. CODE FILES

New: src/services/savings.ts, leftovers.ts, fridgeRescue.ts; src/components/SavingsCard.tsx, LeftoversCard.tsx; src/app/fridge.tsx; tests savings, leftovers, fridgeRescue. Changed: models/prefs.ts (Leftover), config/featureFlags.ts (`savingsDashboard`, `fridgeRescue`), steps/[id].tsx (Put away), (tabs)/index.tsx (LeftoversCard), (tabs)/progress.tsx (SavingsCard), pantry/Inventory.tsx (button), config.test.ts.

## 9. DEPENDENCIES

None.

## 10. HOW TO APPLY (for Sudarsan)

Already on the branch. Nothing to rebuild on the phone for this day (no new native module).

## 11. HOW TO TEST

1. Log a dish with "I cooked it" (Quick log), open Track > Progress: "Saved by cooking" shows the amount.
2. Open a dish, cook it to the end: tap "Put away: use by N days"; go back to Today for the "Use up your leftovers" card.
3. Track > Ingredients: add onion, tomato, potato; tap "What can I cook with this?".

## 12. KNOWN ISSUES, LIMITATIONS AND TODOs

- Calories saved only appear for the few dishes where restaurants published calories.
- Leftover dates are whole days from the storage note's fridge limit; notes with no number default to 2 days. Real push reminders wait for Day 33.
- Cook with what I have matches by ingredient id or name; fresh herbs and chillies often show as missing. Cooking does not yet deduct from the inventory (idea 16l).
- Tested in the browser only; leftovers and savings maths covered by unit tests.

## 13. USER ACTIONS ADDED TODAY

None.

**Carry-over for Day 15:** the Supervisor review thread says FitPlate_Review_2026-10-28.md (missed on Days 11-14) and FitPlate_Review_2026-10-31.md exist. Day 15 must read both, do the §3 FIX items (AI endpoint auth/CORS/cap, AI allergens in the allergy filter, plus the 31 Oct ones) or record each as skipped, and record the §5 ideas.

## 14. BUILD STATE

### Roadmap

| Day | Item | Status |
|---|---|---|
| 1 | Audit and architecture | ✅ done |
| 2 | Navigation shell | ✅ done |
| 3 | Data models and storage | ✅ done (layer + tests on Day 03; app wiring on Day 03b) |
| 4 | Research pipeline I (dishes, ingredients) | ✅ done (plus review fixes 1–3) |
| 5 | Research pipeline II (nutrients, hydration, fitness, cross-links) | ✅ done (plus tag engine and families, SPEC-ADDENDA §9; review fix 2 nutrient part) |
| 6 | Dish library (Cook tab), with search, multi-select filters, sort and diet tags (SPEC-ADDENDA §9) | ✅ done (plus review 2026-10-15 fixes 1–3; allergy filter remembered) |
| 7 | Dish detail screen | ✅ done (plus "Jump to" chips; opt-in burn-off per SPEC-ADDENDA §8) |
| 8 | Cost-to-make engine | ✅ done (plus Protein per ₹; review 2026-10-21 fixes 1–2) |
| 9 | Servings scaler and shopping list (checklist with include box and one variant per ingredient, per SPEC-ADDENDA §7) | ✅ done (plus calorie gap badge; Total-line parser fix) |
| 10 | Cooking level and kitchen personalisation | ✅ done (plus "Why these scores?" explainer) |
| 11 | Guided cook mode (core) | ✅ done (plus Cook again / Recently viewed; balance screen respects injuries) |
| 12 | Cook mode extras | ✅ done (plus late-night helper) |
| 13 | Meal logging and a real Today screen | ✅ done (plus desk-break card) |
| 14 | After the meal and savings dashboard | ✅ done (plus Cook with what I have) |
| 15 | INTEGRATION #1 | ⬜ |
| 15G1 | Grocery: vendor price comparison + logo-tap deep links (SPEC-ADDENDA §7) | ⬜ |
| 15G2 | Grocery: basket checkout scaffolding for Zepto and Instamart, confirm step, flags OFF (SPEC-ADDENDA §7) | ⬜ |
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
3. **Storage (Day 3), now cloud-first per SPEC-ADDENDA §5:** typed repositories backed by Firestore (`users/{uid}/…`) for signed-in users and AsyncStorage for guests and as the offline cache; last-write-wins on `updatedAt`; every document has `id`, `createdAt`, `updatedAt`, `schemaVersion`, `deleted`. Built on Day 3 in `src/services/storage/` (see `docs/DATA_MODEL.md`): `storageService` (typed keys, envelopes, migration hook, exportAll, resetAll), `LocalDocStore` (one AsyncStorage key per owner and collection), `RemoteDocStore` over a `RemoteAdapter` (`firestoreRemote.ts` is the real Firestore one), `SyncedDocStore` (device first, outbox, 1.5 s debounced batches), `createRepository` (create/get/list/update/upsert/soft remove, read-time migrations), `fromLegacyState` and `copyGuestToAccount`. `openUserData({ kv, uid, remote })` is the single entry point. Rules in `firestore.rules`. **Since Day 03b the app runs on it:** `src/lib/store.tsx` (`StoreProvider`) opens the guest store or the signed-in user's store (device + Firestore when `cloudSync` is on), and `src/services/userSession.ts` keeps the documents in memory, derives the screens' demo shape with `toView()`, and writes each action through the repositories in order. It also holds the one-time blob migration (`prepareGuestDevice`), the "Bring your data with you?" copy (`copyGuestData` / `skipGuestCopy`) and sign-out (`signOutDevice`). New screens should read documents from the session rather than the demo shape once their day replaces a demo screen. The original plan, kept for reference: `src/services/storage/` wraps AsyncStorage with typed keys (`fitplate.<name>.v<N>`), versioned envelopes `{ version, data }`, a migration hook, `exportAll()` and `resetAll()`. Repositories: `mealLogs`, `waterLogs`, `supplementLogs`, `workoutLogs`, `profile`. A one-time migration reads `fitplate.state.v2` so demo users keep their data. The React context stays as the in-memory cache and calls the repositories.
4. **Data folder layout (Day 4–5):** `src/data/research/dishes/<NNN>-<slug>.json`, `ingredients/<id>.json` plus `aliases.json`, `nutrients/<id>.json`, `hydration/<id>.json`, `guidance/<id>.json`, `exercises/<id>.json`. Each folder has a generated `index.ts` of static `require`s. The demo `src/data/dishes.ts` stays separate until the research dishes replace it on the Cook tab. Importers, merge rules, the price engine, cross-links and validators go in `src/services/data/`, written as plain TS functions so Jest can test them. The import itself is run by the build session with a Node script (`scripts/research/`) that writes the JSON files; the app only reads bundled JSON.
5. **Theme tokens:** `src/config/theme.ts` (`brand.primary` #1E8A5A, `colors`, `spacing`, `radius`, `typography`, `touchTarget` 44). Dark theme stays, as decided in section 4.
6. **Types (built on Day 3):** `src/models/` (`common`, `user`, `logs`, `research`) holds `Dish`, `Ingredient`, `Nutrient`, `Hydration`, `Guidance`, `Exercise`, `MealLog`, `WaterLog`, `SupplementLog`, `WorkoutLog` and `UserProfile`, with the field names from the spec's DEFAULT ARCHITECTURE, plus `Dish.asOrdered` and full `Ingredient.nutritionPer100g` with per-field `source` and `confidence` (SPEC-ADDENDA). The demo's own `Profile`/`MealLog` types in `store.tsx` are mapped to these by the Day 3 migration.
7. **Feature flags:** `src/config/featureFlags.ts`, a typed `as const` object plus `isEnabled()`. Unfinished or dev-build-only features stay `false` until their "Done when" check passes.
8. **Testing:** Jest 29 with the `jest-expo` preset (`jest.config.js`). Tests live in `src/**/__tests__/*.test.ts(x)` and import `describe`/`it`/`expect` from `@jest/globals` (TypeScript 6 does not pick up global jest types automatically). `npm test`. Every logic module gets tests. Jest maps `@react-native-async-storage/async-storage` to its bundled mock; tests that import `src/lib/store.tsx` stub `firebase/auth` and `../lib/firebase` with `jest.mock` (Firebase ships ESM that Jest cannot load). Before every push the checks are `npx tsc --noEmit`, `npx expo lint`, `npm test` and `npx expo export --platform web`.

### Code files touched since the baseline

| Path | Last changed |
|---|---|
| `src/config/theme.ts` | Day 1 |
| `package.json` | Day 4 |
| `package-lock.json` | Day 1 |
| `src/config/tabs.ts` | Day 2 |
| `src/app/(tabs)/_layout.tsx` | Day 2 |
| `src/app/(tabs)/cook.tsx` | Day 6 |
| `src/app/(tabs)/track.tsx` | Day 2 |
| `src/app/(tabs)/move.tsx` | Day 2 |
| `src/app/(tabs)/me.tsx` | Day 2 |
| `src/app/(tabs)/discover.tsx` | Day 2 |
| `src/app/(tabs)/plan.tsx` | Day 2 |
| `src/app/(tabs)/progress.tsx` | Day 2 |
| `src/app/(tabs)/index.tsx` | Day 2 |
| `src/app/profile.tsx` | Day 4 |
| `src/components/ui.tsx` | Day 03b |
| `src/config/featureFlags.ts` | Day 7 |
| `src/services/activity.ts` | Day 2 |
| `src/__tests__/tabs.test.ts` | Day 2 |
| `src/__tests__/activity.test.ts` | Day 03b |
| `src/__tests__/config.test.ts` | Day 7 |
| `jest.config.js` | Day 2 |
| `firestore.rules` | Day 2 |
| `docs/DATA_MODEL.md` | Day 5 |
| `public/index.html`, `public/manifest.json`, `public/*.png`, `assets/icon.png`, `assets/favicon.png` (app icon) | merged from demo-app on 2026-10-10 (5c97126), not by the build |
| `.env.example` (Google photo and email) | merged from demo-app on 2026-10-09 (c8a2449), not by the build |
| `src/lib/store.tsx` | Day 7 (also changed by the 15 Oct on-demand commits P1–P3) |
| `src/app/index.tsx` | Day 4 |
| `src/models/common.ts` | Day 3 |
| `src/models/user.ts` | Day 3 |
| `src/models/logs.ts` | Day 03b |
| `src/models/research.ts` | Day 6 |
| `src/models/index.ts` | Day 3 |
| `src/services/storage/kv.ts` | Day 3 |
| `src/services/storage/storageService.ts` | Day 3 |
| `src/services/storage/docStore.ts` | Day 3 |
| `src/services/storage/remote.ts` | Day 4 |
| `src/services/storage/firestoreRemote.ts` | Day 4 |
| `src/services/storage/syncedStore.ts` | Day 3 |
| `src/services/storage/lww.ts` | Day 3 |
| `src/services/storage/repository.ts` | Day 03b |
| `src/services/storage/schemas.ts` | Day 3 |
| `src/services/storage/legacy.ts` | Day 03b |
| `src/services/storage/guest.ts` | Day 3 |
| `src/services/storage/index.ts` | Day 03b |
| `src/__tests__/storage/fakes.ts` | Day 4 |
| `src/__tests__/storage/storageService.test.ts` | Day 3 |
| `src/__tests__/storage/repository.test.ts` | Day 3 |
| `src/__tests__/storage/sync.test.ts` | Day 3 |
| `src/__tests__/storage/legacy.test.ts` | Day 03b |
| `src/services/userSession.ts` | Day 4 |
| `src/components/GuestCopyPrompt.tsx` | Day 03b |
| `src/services/liteMode.ts` | Day 03b |
| `src/lib/useLiteMode.ts` | Day 03b |
| `src/__tests__/userSession.test.ts` | Day 03b |
| `src/__tests__/liteMode.test.ts` | Day 03b |
| `scripts/research/run.js` | Day 5 |
| `src/services/data/markdown.ts` | Day 4 |
| `src/services/data/dishImporter.ts` | Day 6 |
| `src/services/data/ingredientImporter.ts` | Day 6 |
| `src/services/data/allergens.ts` | Day 4 |
| `src/services/data/fasting.ts` | Day 4 |
| `src/services/data/buildItems.ts` | Day 6 |
| `src/services/data/priceTrend.ts` | Day 4 |
| `src/services/data/merge.ts` | Day 4 |
| `src/services/data/researchIndex.ts` | Day 5 |
| `src/data/research/index.ts` | Day 5 |
| `src/data/research/dishes/index.ts` | Day 6 |
| `src/data/research/ingredients/index.ts` | Day 6 |
| `src/services/storage/deleteUser.ts` | Day 4 |
| `src/app/your-data.tsx` | Day 4 |
| `src/components/ConfirmDeleteData.tsx` | Day 4 |
| `src/app/_layout.tsx` | Day 6 |
| `src/__tests__/data/priceTrend.test.ts` | Day 4 |
| `src/__tests__/data/merge.test.ts` | Day 4 |
| `src/__tests__/data/importers.test.ts` | Day 6 |
| `src/__tests__/data/researchData.test.ts` | Day 5 |
| `src/__tests__/storage/deleteUser.test.ts` | Day 4 |
| `src/models/nutrient.ts` | Day 6 |
| `src/models/exercise.ts` | Day 5 |
| `src/services/data/dietTags.ts` | Day 5 |
| `src/services/data/tags.ts` | Day 6 |
| `src/services/data/crossLinks.ts` | Day 6 |
| `src/services/data/nutrientImporter.ts` | Day 6 |
| `src/services/data/exerciseImporter.ts` | Day 5 |
| `src/__tests__/data/tags.test.ts` | Day 6 |
| `src/__tests__/data/crossLinks.test.ts` | Day 6 |
| `src/__tests__/data/nutrients.test.ts` | Day 6 |
| `src/__tests__/data/exercises.test.ts` | Day 5 |
| `src/data/research/nutrients/index.ts` | Day 5 |
| `src/data/research/hydration/index.ts` | Day 5 |
| `src/data/research/guidance/index.ts` | Day 5 |
| `src/data/research/conditions/index.ts` | Day 5 |
| `src/data/research/exercises/index.ts` | Day 6 |
| `src/data/research/fitness-guides/index.ts` | Day 5 |
| `src/services/search.ts` | Day 6 |
| `src/services/dishLibrary.ts` | Day 6 |
| `src/services/rememberedFilters.ts` | Day 6 |
| `src/components/dishes/DishLibrary.tsx` | Day 6 |
| `src/components/dishes/ResearchDishCard.tsx` | Day 6 |
| `src/components/dishes/parts.tsx` | Day 6 |
| `src/app/recipe/[id].tsx` | Day 7 |
| `src/services/data/priceChecks.ts` | Day 6 |
| `src/__tests__/services/search.test.ts` | Day 6 |
| `src/__tests__/services/dishLibrary.test.ts` | Day 6 |
| `src/services/dishDetail.ts` | Day 7 |
| `src/__tests__/services/dishDetail.test.ts` | Day 7 |
| On-demand commits 90a9539, ee42864, dd66f47, cadd7ef (15 Oct, another session): iPhone dev build config, native Google sign-in, server research library, synced settings/lists/weight/ratings/cooks, basket and Instamart checkout, Zepto links, dish photo pipeline (`scripts/research/images.js`, `src/app/photo-credits.tsx`, `src/data/research/dish-images/`) and many more files | 15 Oct (on demand; outside the day counter) |
| `src/services/moveSafety.ts`, `src/__tests__/moveSafety.test.ts`, `src/app/balance.tsx` | Day 11 |
| `src/services/cookProgress.ts`, `src/lib/alarm.ts`, `src/app/steps/[id].tsx` (keep awake, resume, alarm) | Day 11 |
| `src/services/recentDishes.ts`, `src/components/dishes/RecentRows.tsx`, `DishLibrary.tsx`, `src/app/recipe/[id].tsx` | Day 11 |
| `src/lib/speak.ts`, `src/services/lateNight.ts`, `src/components/LateNightCard.tsx`, `src/app/steps/[id].tsx` (video slot, read aloud, logged card), `docs/COOK_MODE_EXTRAS.md` | Day 12 |
| `src/components/meals/LogDishCard.tsx`, `src/components/meals/EditLog.tsx`, `src/services/meals.ts` (`portionPatch`), `src/services/userSession.ts` (`updateMeal`, `removeMeal`), `src/lib/store.tsx`, `src/app/log.tsx`, `src/app/meal/[id].tsx` | Day 13 |
| `src/services/deskBreak.ts`, `src/components/DeskBreakCard.tsx`, `src/app/profile.tsx`, `src/app/(tabs)/index.tsx` | Day 13 |
| `src/__tests__/services/rememberedFilters.test.ts` | Day 6 |
| `src/__tests__/data/priceChecks.test.ts` | Day 6 |
| `src/services/costToMake.ts` (new), `src/__tests__/services/costToMake.test.ts` (new) | Day 8 |
| `src/services/data/buildItems.ts` (linker rules), `src/services/dishLibrary.ts` (cost sorts, `makeCost`), `src/services/dishDetail.ts` (balance labels), `src/services/vendors/index.ts` (`dishCost` uses the engine), `src/app/recipe/[id].tsx` (Cost to make), `src/app/steps/[id].tsx` and `src/app/done/[id].tsx` (no automatic burn-off) | Day 8 |
| Commit 5684521 (another session, 22 Oct): licensed photos for all 60 research dishes in `assets/dishes/`, `scripts/research/images.js`, `src/data/research/dish-images/` | merged on Day 8 |

### Feature flags

| Flag | Value | For |
|---|---|---|
| newTabShell | true (since Day 2) | Day 2 |
| researchData | true (since Day 6) | Cook tab lists the research dishes; false brings back the 5 demo dishes |
| cameraCheck | false | Day 12 (dev build) |
| voiceSteps | false | Day 12 |
| reminders | false | Day 17 / 33 |
| poseRepCounter | false | Day 26 (dev build) |
| paywall | false | Day 32 (everything free; open decision) |
| cloudSync | true (since Day 03b) | Firestore for signed-in users; false keeps their data on the device only |
| liteMode | true (since Day 03b) | Innovation: still backdrop instead of background videos (Reduce motion, Data Saver, 2G) |
| rememberAllergens | true (since Day 6) | Innovation: the Cook tab remembers "Leave out dishes that contain …" on this device |
| nativeGoogleSignIn | true (on-demand P1) | Google sign-in in the iPhone/Android dev build |
| serverResearch | true (on-demand P2) | research library read from the server when newer |
| dishJumpChips | true (since Day 7) | Innovation: "Jump to" chips on the dish page |
| savingsDashboard | true (since Day 14) | Saved by cooking card, leftovers reminders |
| fridgeRescue | true (since Day 14) | Innovation: Cook with what I have from the ingredient inventory |
| deskBreak | true (since Day 13) | Innovation: opt-in weekday desk-stretch card on Today (switch in Profile) |
| lateNightHelper | true (since Day 12) | Innovation: after 9 pm Today suggests three quick, lighter dishes |
| voiceSteps | true (since Day 12) | Read-aloud switch in cook mode (expo-speech) |
| recentDishes | true (since Day 11) | Innovation: Cook again and Recently viewed rows on the Cook tab |
| proteinPerRupee | true (since Day 8) | Innovation: "₹ per 10 g of protein" on the dish page and a "Protein per ₹" sort |
| scoreExplainer | true (since Day 10) | Innovation: "Why these scores?" on the dish page, from the researched reasons and rating basis |
| calorieGapBadge | true (since Day 9) | Innovation: "N kcal lighter than the restaurant version" on Cook cards and a "Most kcal saved vs restaurant" sort |

### Dependencies added so far

| Package | Version | Type | Day |
|---|---|---|---|
| jest | ^29.7.0 | dev | 1 |
| jest-expo | ~57.0.5 | dev | 1 |
| @jest/globals | ^29.7.0 | dev | 1 |

### RESEARCH LEDGER

Day 14 sync (machine ledger: src/data/research/ledger.json): dishes 5 ingested, ingredients 23 ingested, backlog 0 in both; nutrients and fitness had nothing new. Rows below are the earlier per-file record.

| Stream | File | Items | Ingested on build day |
|---|---|---|---|
| Dishes | FitPlate_Dishes_2026-10-04.md | 1–5 | Day 04 (all 5) |
| Dishes | FitPlate_Dishes_2026-10-05.md | 6–10 | Day 04 (all 5) |
| Dishes | FitPlate_Dishes_2026-10-06.md | 11–15 | Day 05 (all 5) |
| Dishes | FitPlate_Dishes_2026-10-07.md | 16–20 | Day 05 (all 5) |
| Dishes | FitPlate_Dishes_2026-10-08.md | 21–25 | Day 06 (all 5) |
| Dishes | FitPlate_Dishes_2026-10-09.md | 26–30 | Day 06 (all 5) |
| Ingredients | FitPlate_Ingredients_2026-10-04.md | 47 | Day 04 (rows 1–30), Day 05 (rows 31–47) |
| Ingredients | FitPlate_Ingredients_2026-10-05.md | 21 | Day 05 (rows 1–13), Day 06 (rows 14–21) |
| Ingredients | FitPlate_Ingredients_2026-10-06.md | 10 | Day 06 (all 10) |
| Ingredients | FitPlate_Ingredients_2026-10-07.md | 5 | Day 06 (all 5) |
| Ingredients | FitPlate_Ingredients_2026-10-08.md | 7 | Day 06 (all 7) |
| Ingredients | FitPlate_Ingredients_2026-10-09.md | 7 | — (backlog) |
| Nutrients | FitPlate_Nutrients_2026-10-09.md | 1 Vitamin A, 2 Vitamin D | Day 05 (both) |
| Fitness | FitPlate_Fitness_2026-10-09.md | Home 1, Yoga 1, Gym 1, Gym 2 | Day 05 (all 4) |
| Dishes | FitPlate_Dishes_2026-10-10.md | 31–35 | — (backlog; recorded Day 2) |
| Ingredients | FitPlate_Ingredients_2026-10-10.md | 13 | — (backlog; recorded Day 2) |
| Nutrients | FitPlate_Nutrients_2026-10-10.md | 3 Vitamin E, 4 Vitamin K | Day 05 (both) |
| Fitness | FitPlate_Fitness_2026-10-10.md | Home 2, Yoga 2, Gym 3, Gym 4 | Day 05 (all 4) |
| Dishes | FitPlate_Dishes_2026-10-11.md | 36–40 (Rava Dosa, Bhindi Masala, Egg Curry, Veg Biryani, Sabudana Khichdi; first with Fasting suitability) | — (backlog; recorded Day 03b) |
| Ingredients | FitPlate_Ingredients_2026-10-11.md | 3 (okra, sabudana, rock salt) | — (backlog; recorded Day 03b) |
| Nutrients | FitPlate_Nutrients_2026-10-11.md | 5 Vitamin C, 6 Thiamine (B1) | Day 05 (both) |
| Fitness | FitPlate_Fitness_2026-10-11.md | Home 3, Yoga 3, Gym 5, Gym 6 | Day 06 (all 4) |
| Dishes | FitPlate_Dishes_2026-10-12.md | 41–45 (first with PATCH 03 Diet tags) | — (backlog; recorded Day 05) |
| Dishes | FitPlate_Dishes_2026-10-13.md | 46–50 (PATCH 04 tags and variants) | — (backlog; recorded Day 05) |
| Dishes | FitPlate_Dishes_2026-10-14.md | 51–55 | — (backlog; recorded Day 05) |
| Ingredients | FitPlate_Ingredients_2026-10-12.md | 2 (first v2 JSON profile) | — (backlog; recorded Day 05) |
| Fitness | FitPlate_Fitness_2026-10-15.md | Home 4, Yoga 4, Gym 7, Gym 8 (glute bridge, downward dog, stationary bike, rowing machine) | Day 06 (all 4) |
| Dishes | FitPlate_Dishes_2026-10-15.md | 56–60 | — (backlog; recorded Day 06) |
| Ingredients | FitPlate_Ingredients_2026-10-13.md | 6 (written 10-15) | — (backlog; recorded Day 06) |
| Ingredients | FitPlate_Ingredients_2026-10-14.md | 3 (written 10-15) | — (backlog; recorded Day 06) |
| Ingredients | FitPlate_Ingredients_2026-10-15.md | 3 | — (backlog; recorded Day 06) |
| All streams | backlog files above (dishes 31–60, remaining ingredients, nutrients 10-12 to 10-15 incl. type 2 diabetes and prediabetes) | — | OnDemand-2026-10-16 (catch-up run with caps lifted, 15 Oct) |
| — | no research files dated 2026-10-17 to 2026-10-20 (usage limit) | — | — |
| Dishes | FitPlate_Dishes_2026-10-16.md | 61–65 (062 Mutton Biryani invalid: no calories) | Day 08 |
| Dishes | FitPlate_Dishes_2026-10-21.md | 66–70 (068 Chicken Chettinad valid since Day 09 parser fix) | Day 08 |
| Dishes | FitPlate_Dishes_2026-10-22.md | 71–75 | Day 09 (all 5) |
| Dishes | FitPlate_Dishes_2026-10-23.md | 76–80 | Day 09 (all 5) |
| Ingredients | FitPlate_Ingredients_2026-10-16.md | 5 | Day 08 |
| Ingredients | FitPlate_Ingredients_2026-10-21.md | 10 (fenugreek leaves invalid: no price) | Day 08 |
| Ingredients | FitPlate_Ingredients_2026-10-22.md | 2 (ragi flour, baby potatoes) | Day 08 |
| Ingredients | FitPlate_Ingredients_2026-10-23.md | 4 (masoor dal, vermicelli, mutton keema, pineapple) | Day 09 (all 4) |
| Nutrients | FitPlate_Nutrients_2026-10-21.md | Biotin, Folate (invalid unit), High blood pressure profile | Day 08 |
| Fitness | FitPlate_Fitness_2026-10-22.md | reverse lunge, hamstring stretch, stair climber, leg press | Day 08 |
| Nutrients | FitPlate_Nutrients_2026-10-24.md | Calcium, Phosphorus, High triglycerides profile | Day 10 (all 3) |
| Fitness | FitPlate_Fitness_2026-10-24.md | jumping jacks, cobra pose, leg extension, leg curl | Day 10 (all 4) |

- **Machine ledger:** `src/data/research/ledger.json` lists every ingested version (item id, research date, file, build day). Nutrient and fitness keys are `kind:id`. The runner skips any version already there; **each run of the script ingests one capped batch, so run it once per build.**
- **Backlog per stream (after Day 08):** dishes 5 (71–75), ingredients 0, nutrients 0, fitness 0.
- **In the app:** 68 dishes, 143 ingredients, 14 nutrient items (incl. 3 condition profiles), 20 fitness items. Dish lines linked and priced: 1,125 of 1,282.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema:** `profile` is at version 2 since 22 Oct (survey); the other collections are at version 1: `profile` (on `users/{uid}`), `mealLogs`, `waterLogs` (one document per day), `supplementLogs`, `workoutLogs`, `favourites`, `mealPlans` and `savings`. Every document has `id`, `createdAt`, `updatedAt`, `schemaVersion` and `deleted`. Day 03b added the optional `demoSample` to `Favourite`, `MealPlanDay` and `SavingEntry` (no version bump). Fields are listed in `docs/DATA_MODEL.md`.
- **Live since Day 03b:** guests on the device; signed-in users device first, then Firestore (`cloudSync` ON). The demo blob is migrated once into guest documents and kept as a backup. "Bring your data with you?" runs after sign-in. Sign-out clears the device only once everything reached the cloud.
- **Device keys:** `fitplate.docs.<owner>.<collection>.v1`, `fitplate.outbox.<owner>.v1`, `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`; the old `fitplate.state.v2` is a read-once backup.
- **Free-tier guard:** one pull per collection when the app opens for a signed-in user (no listeners yet); writes are debounced batches; water is one document per day; waiting writes are sent when the app goes to the background.
- **Rules:** owner-only (`firestore.rules`), live in the console since 2026-10-10. No top-level collection added.
- **Delete my data (Day 04, review fix 3):** deletes every document under `users/{uid}` (collections from `SCHEMAS`, batches of ≤500, profile last) and the device copy, then signs out. The Firebase Auth account is removed on Day 34.
- **Research content:** bundled JSON in `src/data/research/` since Day 4 (nutrients, hydration, guidance, conditions, exercises and fitness guides since Day 5); never in Firestore. User documents refer to it by id (`dishId`, `ingredientId`, `nutrientId`, `exerciseId`).
- **Device key (Day 06):** `fitplate.docs.<owner>.dishFilters.v1` holds the remembered allergen exclusions; under the owner prefix, so sign-out, Delete my data and Reset clear it.
- **Body weight (Day 07):** the store exposes `bodyWeightKg` (newest `weightLogs` entry, else `profile.weightKg`); read-only, no new reads.
- **Cost to make (Day 08):** computed on the device from bundled research; nothing stored. Planned for Day 14: `savings` entries store the make cost and saving shown at cook time (`makeCostInr`, `savedInr`), so history doesn't move when prices update.
- **Shopping lists (Day 09):** items may carry an optional `more` list; amounts folded to g/ml. No version bump, no rules change. Lists save on the device first and sync for signed-in users.
- **Kitchen (Day 10):** reads `profile.equipmentOwned` and `profile.level`; the beginner-tips switch is `settings.featureToggles.beginnerTips`. No new field, no rules change.
- **USER ACTION:** none open.

### Research gaps

1. Dishes 1–20 (files 10-04 to 10-07) have no "AS ORDERED (from delivery apps)" block, and no Diet tags, Tags line or variants (PATCH 03 and 04 start at dish 41). Their Vegan/Jain/option tags and as-ordered nutrition stay empty until each dish is re-researched.
2. Ingredients from the files dated 10-04 to 10-11 lack the full per-100 g nutrient-profile JSON (the v2 profile starts 10-12). Dish micronutrient estimates are partial until each is re-priced.
3. Spices, flours and sauces used by dishes 1–20 have no ingredient research yet: whole wheat flour (atta), carom seeds, cumin powder, dry mango powder, sambar powder, pav bhaji masala, chole masala, light soy sauce, white vinegar, black pepper, jaggery, kidney beans, cauliflower, pav. 69 dish lines wait on these.
4. 51 foods in the vitamin food-source tables have no ingredient research (e.g. goat liver, amla, amaranth leaves, chicken liver, almonds).
5. Health-condition profiles: none visible yet (nutrition research added them from 2026-10-12, but no nutrient file after 10-11 is in the folder). Needed first for the survey's health page: type 2 diabetes, high blood pressure, high cholesterol, PCOS, hypothyroidism, fatty liver, chronic kidney disease, pregnancy, anaemia, gout.
6. ICMR-NIN has no separate 60+ value for the six vitamins, and none for Vitamin E and K in pregnancy and lactation. Defaults are null; Day 16 needs a researched fallback rule.
7. Images: no dish, ingredient or exercise image exists yet, and no free image generator is available in the build environment (SPEC-ADDENDA §8). The Cook tab shows labelled "Photo soon" placeholders; all 30 bundled dishes need an image.
8. Dish order prices come from search-result snapshots, because delivery-app pages block direct access.
9. Resolved: mustard oil and sesame oil are priced and bundled (ingredient research 15 Oct).
10. NEW (review 2026-10-15): order prices for 17 of 60 dishes rest on one platform, fewer than 3 listings, a closed outlet or an average outside the range; dish 49 has no range. They show "Order price not confirmed yet" until re-researched.
11. NEW (review 2026-10-15): nutrient files for 14 and 15 Oct (B5, B6, Prediabetes profile) are outside the shared folder; fitness skipped 12–14 Oct.
13. NEW (Day 07): no research files 16–21 Oct in any stream (usage limit). Walking and running have no fitness research, so the opt-in burn-off can't offer them.
14. NEW (Day 07): 15 Oct ingredient price rechecks (chicken leg, marathi moggu, white sesame) were made by editing already-ingested files; the ledger doesn't re-read edited files. Research should write rechecks as a new dated entry, or Day 15 re-reads all files.
15. NEW (Day 08): piece weights for whole spices and lemons (bay leaf, green and black cardamom, cloves, cinnamon stick, dried red chilli, green chilli; ml of juice per lemon). 20 dishes are blocked only by these; 15 lack a bay-leaf price.
16. NEW (Day 08): no ingredient density (g per ml) is researched. Ghee and other liquids weighed in grams use 1 g/ml, marked (est.).
17. NEW (Day 08): dishes 062 and 068 have no parsable calories; fenugreek leaves have no parsable price; folate's unit "µg DFE" and choline's 0 factor fail the nutrient validator. The tamarind-date chutney file claims the alias "imli" (resolved by the linker, but it is better removed in research).
12. NEW: fitness rep-counter angles above 180° (plank, glute bridge) and MET vs RPE mismatches (treadmill, elliptical, bike) remain in research.
- Resolved on Day 05: "dish research has no allergen line" (PATCH 03 adds "Allergens declared", read today). Standby: "thali component nutrition" (office canteen idea, parked by Sudarsan).

### IDEAS BACKLOG (ranked by impact ÷ effort; S = 1, M = 2, L = 3)

| Rank | Idea | Type | Impact | Effort | Score | Needs | Status |
|---|---|---|---|---|---|---|---|
| — | Allergy filter ("Leave out dishes that contain …", remembered) | IMPROVE | 5 | S | 5.0 | allergens (Day 04) | **built on Day 06** (filters + `rememberAllergens` flag ON) |
| 1 | Fridge rescue | NEW FEATURE | 4 | S | 4.0 | Dish ingredient links + library (Day 6) | **built on Day 14** (`fridgeRescue` flag ON) |
| 2 | "Make it Jain" switch on a dish | IMPROVE | 4 | S | 4.0 | Researched variants + dish detail (Day 7) | new Day 05 |
| 3 | Cheaper twin ("Veg version: ₹X less") | IMPROVE | 4 | S | 4.0 | Families + cost to make (Day 8, done) | new (supervisor review 2026-10-15); ready now |
| 4 | Vitamin source finder | NEW FEATURE | 4 | S | 4.0 | Good-source links + vitamin tracking (Day 18) | new Day 05 |
| — | Protein per ₹ (sort + tag) | IMPROVE | 4 | S | 4.0 | Cost to make (Day 8) | **built on Day 08** (`proteinPerRupee` flag ON) |
| 5 | "Finish the price" list for research (the most-blocking missing prices and piece weights) | IMPROVE | 4 | S | 4.0 | Cost engine missing lines | new Day 08 |
| 5a | Week list in one basket (meal planner week → one merged Instamart/Zepto basket) | NEW FEATURE | 5 | M | 2.5 | Plan × ingredient links × P3 shopping list | new (supervisor review 2026-10-21) |
| 5b | "Cooking costs more" honesty badge with the batch suggestion | IMPROVE | 3 | S | 3.0 | Cost engine + order prices | new Day 08 |
| 5c | Protein-per-₹ default sort for muscle-gain users | IMPROVE | 4 | S | 4.0 | Survey (Day 31) | new Day 08 |
| 6 | Savings goal jar | NEW FEATURE | 4 | S | 4.0 | `savings` collection; fits Day 14 | new (supervisor review 2026-10-11) |
| 7 | Kettle and one-burner cooking (PG/hostel kitchen preset + filter chip) | IMPROVE | 4 | S | 4.0 | Dish equipment data + kitchen profile (Day 10) | new Day 03b; Day 06 adds the filter chip |
| 8a | Restaurant-calorie gap badge and sort | IMPROVE | 4 | S | 4.0 | asOrdered nutrition | **built on Day 09** (`calorieGapBadge` flag ON; 2 dishes qualify today) |
| 8b | "Why this score?" explainer | IMPROVE | 3 | S | 3.0 | healthiness.reasons | **built on Day 10** (`scoreExplainer` flag ON) |
| 8c | Storage reminder (eat-by from the research's fridge limit) | IMPROVE | 3 | S | 3.0 | storage text + Reminders (Day 33) | **built on Day 14** (in-app card; push reminders wait for Day 33) |
| 8d | Leftover chain (tomorrow's plan from the leftover idea) | NEW FEATURE | 3 | M | 1.5 | leftoverRemix + Plan tab | new Day 07 |
| 8e | Share to the cook (shopping list + steps as text for a family cook or house help) | IMPROVE | 4 | S | 4.0 | Share text (Day 9) | new Day 09 |
| 8f | Swap-in-the-steps (when a kitchen item is missing, rewrite the affected step with the research's alternative, e.g. pan with lid instead of pressure cooker plus time) | IMPROVE | 4 | M | 2.0 | Kitchen gaps (Day 10) + step research giving the no-cooker time | new Day 10 |
| 8 | Plain-words search ("15 min no onion") | IMPROVE | 3 | S | 3.0 | Tags + filters (Day 6) | new Day 06 |
| 9 | Recently viewed / cook again | IMPROVE | 3 | S | 3.0 | none | **built on Day 11** (`recentDishes` flag ON) |
| 10 | Monsoon swap | IMPROVE | 3 | S | 3.0 | Price engine and cost to make (Day 8) | approved by Sudarsan 2026-10-10; build after Day 8 |
| 11 | Late-night craving helper | NEW FEATURE | 3 | S | 3.0 | Dish library (Day 6) | **built on Day 12** (`lateNightHelper` flag ON) |
| 12 | Desk-break movement card | NEW FEATURE | 3 | S | 3.0 | Exercise tags + more desk-friendly items | **built on Day 13** (`deskBreak` flag ON, opt-in) |
| — | Lite mode | IMPROVE | 3 | S | 3.0 | none | **built on Day 03b** (`liteMode` flag ON) |
| 13 | Tomorrow's tiffin (pack dinner for lunch) | NEW FEATURE | 5 | M | 2.5 | Servings (Day 9), cook mode (Day 11), confirmed order prices | new Day 03b; review 2026-10-15 ranks it high |
| 14 | Fasting mode | NEW SEGMENT | 4 | M | 2.0 | Fasting tags (Day 05) | approved by Sudarsan 2026-10-10 |
| 15 | Parents' plate | NEW SEGMENT | 4 | M | 2.0 | Ingredient sodium and sugar data (partial) | approved by Sudarsan 2026-10-10 |
| 16a | Hands-free "Next" in cook mode (say "next" or wave; needs voice or camera) | NEW FEATURE | 4 | M | 2.0 | Day 12 voice steps | new Day 11 |
| 16b | Parallel timers bar (several step timers at once, one floating strip) | IMPROVE | 4 | M | 2.0 | Cook mode (Day 11) + multicook | new Day 11 |
| 16c | Ask-before-hiding for conditions: tell the user which of their answers the research has no rule for, one tap to request research | IMPROVE | 3 | S | 3.0 | moveSafety (Day 11) + research queue | new Day 11 |
| 16d | Deduct ingredients from the inventory after cooking (offered, not built) | IMPROVE | 4 | S | 4.0 | Pantry (24 Oct) | new Day 11 |
| 16e | Step video from the research shot list: auto-generate a short silent clip per step (needs a video model, cost decision) | NEW FEATURE | 4 | L | 1.3 | videoShot lines on steps | new Day 12 |
| 16f | Voice commands in cook mode ("next", "repeat", "start timer") using the phone's speech recognition | IMPROVE | 4 | M | 2.0 | Read aloud (Day 12) + a dev build | new Day 12 |
| 16g | "Kitchen helper" share: send the step list and timers as a link a family member can follow on their own phone | NEW FEATURE | 3 | M | 1.5 | Cook mode (Day 11) | new Day 12 |
| 16h | Copy yesterday's meal: one tap to log the same dish again at a similar time | IMPROVE | 4 | S | 4.0 | Meal logging (Day 13) | new Day 13 |
| 16i | Log by photo: snap the plate, pick the matching dish from the library | NEW FEATURE | 4 | L | 1.3 | Vision model (cost decision) | new Day 13 |
| 16j | Weekly eating summary shared as a card (calories, cooked vs ordered, savings) | IMPROVE | 3 | S | 3.0 | Meal logs + savings (Day 14) | new Day 13 |
| 16k | Use-up chain: when a leftover is due, rank Cook-tab dishes that reuse it | NEW FEATURE | 3 | M | 1.5 | Leftovers (Day 14) + remix text | new Day 14 |
| 16l | Deduct ingredients from the inventory when a dish is cooked, feeding Cook with what I have | IMPROVE | 4 | S | 4.0 | Pantry + cook completion (same as 16d) | new Day 14 |
| 16m | Monthly savings goal jar with a progress ring | IMPROVE | 3 | S | 3.0 | Savings summary (Day 14); extends idea 6 | new Day 14 |
| 16 | Doctor's limits filter (enter your doctor's sodium or fluid limit; dishes over it are marked, never hidden) | IMPROVE | 4 | M | 2.0 | Condition profiles (fix 1 done) + dish sodium per serving | new (supervisor review 2026-10-15) |
| 17 | Allergy-safe swap hint | IMPROVE | 4 | M | 2.0 | Ingredient substitutes + allergen map | new Day 06 |
| 18 | Batch-cook Sunday | NEW FEATURE | 4 | M | 2.0 | Linked ingredients + shopping list (Day 9) | new Day 04 |
| 19 | Shared-ingredient week (plan dishes that use up the same perishable) | NEW FEATURE | 4 | M | 2.0 | Ingredient links, shelf life, prices; Plan tab | new (supervisor review 2026-10-15) |
| 20 | Vitamin gap → dish nudge | IMPROVE | 4 | M | 2.0 | Nutrient data + vitamin tracking (Day 18) | new (supervisor review 2026-10-11) |
| 21 | Cook-prep and plan-ahead reminders (soak, marinate, defrost) | IMPROVE | 4 | M | 2.0 | Step timers + Reminders (Day 33) | new Day 05; Day 06 adds overnight-soak prompts |
| 22 | Price-drop nudge for your staples | IMPROVE | 3 | M | 1.5 | Price trend, 2+ price versions, Day 8 | new Day 04 |
| 23 | Filter memory per family member | IMPROVE | 3 | M | 1.5 | Tags + filters (Day 6) | new Day 05 |
| — | Office canteen builder | IMPROVE | 5 | M | — | New thali-component research | **STANDBY / TODO** (Sudarsan, 2026-10-10: on hold; do not build or research) |

### TODO / STANDBY (Sudarsan's parked items; never build these until he says so)

- **Office canteen thali builder / office meal tracking** (idea 3, parked 2026-10-10). Sudarsan has bigger plans for tracking meals in office workspaces. Keep it here; new ideas about office meals should be added under this item, not built.

### USER ACTIONS (cumulative)

| # | Action | Added | Status |
|---|---|---|---|
| 1 | Create Firestore (asia-south1, Spark) and publish `firestore.rules` | Day 2 | closed: done by Sudarsan (database 2026-10-09, rules 2026-10-10) |
| 2 | Decision: research for thali components (idea 3) | Day 3 | closed: on standby by Sudarsan (2026-10-10); stays in the to-do list |
| 3 | Decision: fasting-suitability field in dish research (idea 4) | Day 3 | closed: approved (2026-10-10); dish research PROMPT_PATCH_02 adds it from dish 36 (SPEC-ADDENDA §6) |
| 4 | Decision: add per-vendor product name, price, pack size and link (Zepto, Instamart, Blinkit) to the daily ingredient research, for Day 15G1 (SPEC-ADDENDA §7) | 2026-10-10 (grocery supplement) | open: decision card posted in the auto-build thread; recommended "Add them" |

**Next up: Day 15: INTEGRATION #1 (follow the INTEGRATION DAYS rules). Innovation: Plain-words search (ideas queue item 7). Data sync continues with any new research files.**
