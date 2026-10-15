# FitPlate data model

This file is the single description of every piece of data FitPlate stores. The daily auto-build updates it on every build day (SPEC-ADDENDA §5) and adds a changelog line at the bottom.

## 1. Where data lives

| Kind | Store | Shared across devices? |
|---|---|---|
| Research content (dishes, ingredients, nutrients, hydration, guidance, exercises) | Bundled JSON in the app (`src/data/research/…`, from Day 4) | Yes. Every device gets the same files with each deploy. |
| Signed-in user's own data (profile, logs, plans, favourites …) | Cloud Firestore, `users/{uid}/…` (from Day 3) | Yes. That is the point of the cloud store. |
| Offline copy of the signed-in user's data | Firestore's local cache (web: persistent cache) plus AsyncStorage | No (one device) |
| Guest data (not signed in) | AsyncStorage only | No (one device) |

Research content is bundled with the app and, from the priority plan's P2-c, also copied to a shared read-only `research/…` area of Firestore by `npm run research:import` (run by Sudarsan). The app uses the server copy only when its version (`researchVersion.js`: newest ledger date + entry count) is newer than the bundle and every count matches. User documents refer to research by id only (`dishId`, `ingredientId`, `nutrientId`, `exerciseId`).

Research files layout (from Day 4): `src/data/research/dishes/NNN-slug.json` (dish id = 3-digit number + slug, e.g. `001-poha`), `src/data/research/ingredients/<id>.json` (kebab-case English name without the bracketed Indian names, e.g. `peanuts-raw`), a generated `index.ts` per folder, and `ledger.json` (every ingested version as item id + research date + build day). From Day 5 also `nutrients/`, `hydration/`, `guidance/`, `conditions/` (nutrient stream; types in `src/models/nutrient.ts`), `exercises/` and `fitness-guides/` (fitness stream; types in `src/models/exercise.ts`), `ingredients/aliases.json` (any spelling → ingredient id) and `links.json` (cross-links: good-source dishes, variant families, drinks, MET values, ingredient micronutrient table). Nutrient and fitness ledger keys are `kind:id` (e.g. `nutrient:vitamin-a`, `exercise:push-up`). `npm run research:sync -- --today YYYY-MM-DD --build DayNN` rebuilds them from the research files.

## 2. The demo blob (read once since Day 03b)

Until Day 03b everything sat in one JSON blob in AsyncStorage under the key `fitplate.state.v2`. Since Day 03b the app no longer writes it. On the first start of the new version, `prepareGuestDevice` (`src/services/userSession.ts`) turns the blob into guest documents once (`fromLegacyState`), sets `fitplate.guestReady.v1`, and leaves the blob in place as a backup. Its fields were:

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

Types live in `src/models/`; versions and migrations in `src/services/storage/schemas.ts`. On the device each collection is one AsyncStorage key, `fitplate.docs.<owner>.<collection>.v1` (owner = `guest` or the Firebase uid), holding an id → document map.

| Path | Holds | Version | Since | Links to research ids |
|---|---|---|---|---|
| `users/{uid}` | Profile (`UserProfile`), document id `profile` | 1 | Day 3 | — |
| `users/{uid}/mealLogs/{id}` | One meal eaten | 1 | Day 3 | `dishId` |
| `users/{uid}/waterLogs/water-YYYY-MM-DD` | Glasses of water for one day (one document per day) | 1 | Day 3 | — |
| `users/{uid}/supplementLogs/{id}` | Supplement taken | 1 | Day 3 | `nutrientId` |
| `users/{uid}/workoutLogs/{id}` | One workout | 1 | Day 3 | `exerciseId` |
| `users/{uid}/favourites/{dishId}` | Saved dish | 1 | Day 3 | `dishId` |
| `users/{uid}/mealPlans/YYYY-MM-DD` | Planned dishes for one day | 1 | Day 3 | `dishId` |
| `users/{uid}/savings/{id}` | Money saved by cooking | 1 | Day 3 | `dishId` |
| `users/{uid}/settings/settings` | Units, preferred vendor, brand per ingredient, toggles, Swiggy insights consent (`UserSettings`) | 1 | P2-b | ingredient ids (keys of `brandChoice`) |
| `users/{uid}/shoppingLists/{id}` | Basket in progress: items, included/ticked, chosen variant, how it was bought (`ShoppingList`). Replaces the planned `groceryLists` | 1 | P2-b | `dishIds`, `items[].ingredientId` |
| `users/{uid}/weightLogs/{id}` | Weight entry, append-only | 1 | P2-b | — |
| `users/{uid}/ratings/{dishId}` | The user's own dish rating (`DishRating`) | 1 | P2-b | `dishId` |
| `users/{uid}/cookCompletions/{id}` | One finished cook, append-only (`CookCompletion`) | 1 | P2-b | `dishId` |
| `users/{uid}/meta/clock` | Server-clock check (`serverClock.ts`), not a user collection | — | P2-b | — |
| `research/meta`, `research/extras`, `research/{kind}/items/{id}` | Shared read-only research library, written only by `scripts/server/import-research.js` | — | P2-c | — |

### Fields per collection

- **profile** (`UserProfile`): `name` string · `age` number|null · `sex` 'female'|'male'|'other'|null · `heightCm` number|null · `weightKg` number|null · `activityLevel` 'sedentary'|'light'|'moderate'|'active'|'very-active'|null · `goal` 'lose'|'maintain'|'gain'|'muscle' · `dietType` 'veg'|'egg'|'non-veg' · `cookingLevel` 'beginner'|'expert' · `equipmentOwned` string[] · `gymAccess` boolean|null · `breakfastReminder` boolean · `onboarded` boolean · `privateFlags` map of booleans · `onboardedOn` YYYY-MM-DD|null. Body fields stay null until the user enters them; nothing is guessed.
- **Every log** has `timestamp` (epoch ms), `dateKey` (YYYY-MM-DD, local day) and optional `demoSample` (true only for the demo's made-up sample week; never copied to an account).
- **mealLogs**: `name`, `emoji`, `dishId` (null for quick/custom), `source` 'dish'|'quick'|'custom', `kcal`, `proteinG`, `fibreG`, `cooked` (made at home).
- **waterLogs**: `glasses`.
- **supplementLogs**: `name`, `nutrientId`|null, `dose`|null, `unit`|null.
- **workoutLogs**: `type`, `exerciseId`|null, `minutes`, `kcal` (estimate).
- **favourites**: `dishId`.
- **mealPlans**: `dateKey`, `slots` { breakfast?, lunch?, dinner? } → dish ids.
- **savings**: `timestamp`, `amountInr`, `dishId`|null, `note`|null.

### How sync works (`src/services/storage/`)

- Guests: `LocalDocStore` only.
- Signed in: `SyncedDocStore`. Writes land on the device first, their ids join an outbox (`fitplate.outbox.<uid>.v1`), and after 1.5 s of quiet they go to Firestore in one batch. Failed sends stay in the outbox and retry on the next flush, including after an app restart.
- `pull(collection)` merges device and cloud, last write wins on `updatedAt` (cloud wins a tie), and writes each side only what changed.
- Reads migrate old documents to the current `schemaVersion` and save the upgraded copy once.
- Firestore (`firestoreRemote.ts`): web uses the persistent IndexedDB cache; native uses the memory cache plus the AsyncStorage copy.

### Migration from the demo blob

`fromLegacyState()` turns `fitplate.state.v2` into documents with stable ids (running it twice never duplicates). The demo's sample week is marked `demoSample: true` (meals seeded at whole minutes, workouts at time 0, water on days with only sample entries), and the seeded ₹2,860 is not counted as savings.

A collection is created only on the day a feature first needs it; this table then gets its full field list.

### Security rules

Kept in `firestore.rules` at the repo root. Only the signed-in owner can read or write anything under `users/{their uid}`. New subcollections under `users/{uid}` need no rule change. A new top-level collection would need a new rule and a USER ACTION in that day's build file.

### Free-tier guard

Spark allows about 20,000 writes and 50,000 reads a day. Writes are batched and debounced (for example the water +/- buttons), each screen uses one listener, and the app never writes in a loop on start-up.

## 4. Guests and sign-in (live since Day 03b, `src/lib/store.tsx` + `src/services/userSession.ts`)

- **Guests:** data stays in AsyncStorage on the device, under owner `guest` (`fitplate.docs.guest.<collection>.v1`). A new device gets the demo's sample week, with every entry marked `demoSample: true` (profile excepted). "Reset demo data" (guests only) restores it.
- **Signed in (`cloudSync` ON):** owner = the Firebase uid. Device first (`fitplate.docs.<uid>.…`), then Firestore `users/{uid}/…` through the outbox. On start the app pulls and merges every collection once (last write wins). A device with no copy of this user yet waits up to 8 s for that first pull, so a returning user doesn't land in onboarding. Waiting changes are also sent when the app goes to the background.
- **Guest signs in with Google:** if the guest has their own entries (not the sample week), the welcome screen asks "Bring your data with you?". **Copy my data** copies them into the account (the account's own profile always wins; the guest profile is used only when the account has none), then removes the guest copy from the device. **Start fresh** keeps the guest data on the device. Either answer is remembered per account in `fitplate.guestCopyAsked.<uid>.v1`.
- **Sign-out:** pending changes are sent first. If everything reached the cloud, this device's copy of the account is cleared; if not (offline), the copy and its outbox stay so nothing is lost, and they are sent at the next sign-in.
- **Deleting your data (signed in, cloud on):** Profile → **Delete my data** asks for confirmation in an in-app dialog, then `deleteMyData()` (store) waits for queued writes, sends the outbox, and hard-deletes every document of every collection in `SCHEMAS` under `users/{uid}` and finally `users/{uid}` itself (`src/services/storage/deleteUser.ts`, `RemoteAdapter.deleteMany`, batches of at most 500). The listing reads from the server, so offline it fails before anything is deleted and the device is left untouched; Firestore writes that hang are given up after 20 s. On success the device copy, its outbox and `fitplate.guestCopyAsked.<uid>.v1` are removed and the user is signed out. The Firebase Auth account itself stays (account deletion and export come on Day 34). The **Your data** screen (`/your-data`, linked from the welcome screen and Profile) explains all this in plain words. A new subcollection must be added to `SCHEMAS`, or this delete will miss it.
- **Screens:** they still read the demo's shape (`days`, `moneySaved`, `favourites`, `plan`, `profile`). `toView()` derives it from the documents in memory; each action updates memory on the same tap and writes through the repositories in order.

## 5. Changelog

- 2026-10-10 (Day 2): file created. Documents the demo blob (`fitplate.state.v2`) and the planned Firestore layout. Added `firestore.rules`. No schema code yet and no data changes; the navigation shell stores nothing new.
- 2026-10-10 (Day 3): all user collections defined at version 1, with types in `src/models/`, the device store, the synced store with outbox, last-write-wins merge, the Firestore adapter, the demo-blob migration and the guest → account copy. Tests use a mocked Firestore. The app does not use this layer yet; Day 03b connects it.
- 2026-10-11 (Day 03b): the app now uses the storage layer. Demo blob migrated once into guest documents; guests on the device, signed-in users device + Firestore (`cloudSync` ON). Added `demoSample?` to `Favourite`, `MealPlanDay` and `SavingEntry` (optional field, so no `schemaVersion` bump; older documents simply lack it). The demo's seeded ₹2,860 now stays on the device as a `demo-sample-total` savings entry marked `demoSample`, never copied. Repositories gained `importMany` (write ready-made documents, for migration and the sample seed). New device keys: `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`. No new collection, no rules change.
- 2026-10-11 (Day 04, review fix 3): "Your data" screen (`/your-data`) linked from the welcome screen and Profile; Profile → "Delete my data" for signed-in users hard-deletes every document under `users/{uid}` (all collections in `SCHEMAS`, in batches of ≤500) and clears the device copy, then signs out. `RemoteAdapter` gained `deleteMany(paths)` and `getCollection(path, { fromServer })`. No schema or rules change.
- 2026-10-11 (Day 04): bundled research data started (10 dishes, 30 ingredients). `Dish` gained `allergens`, `dietClaims`, `fasting`, `needsReview`, step detail fields (`title`, `visualCue`, `cameraCheck`, `videoShot`) and `healthiness.restaurantScore`; `Ingredient` gained `macrosPer100Estimate`. Bundled content only: no Firestore change.
- 2026-10-15 (Day 05): nutrient, hydration, guidance, health-profile, exercise and fitness-guide content bundled; `Dish` gained `tags`, `dietTags`, `description`, `familyId` and `variants` (SPEC-ADDENDA §9); `Ingredient` gained `usedIn`; `NutrientPer100` gained the 20 v2 fields (cholesterol, fat types, B vitamins, water, …), null for v1 profiles; `microNutrientsEstimate` is now filled where ingredient data exists. User documents may refer to `nutrientId` and `exerciseId` from these folders. Bundled content only: no Firestore change, no `schemaVersion` bump.
- 2026-10-16 (priority plan P2): settings, shoppingLists, weightLogs, ratings, cookCompletions collections; append-only logs enforced in firestore.rules (APPEND_ONLY in schemas.ts); writes stamped with the server-corrected clock (users/{uid}/meta/clock); shared research library in Firestore with bundled fallback. See docs/SERVER_READINESS.md.
- 2026-10-16 (priority plan P3): shopping list, Instamart checkout, Zepto links, "Cook it instead" and step-by-step cooking use the P2 collections (`shoppingLists` with `status`/`boughtVia`, `settings.brandChoice`, `settings.featureToggles.swiggyLive`, `settings.swiggyOrderInsights`, `cookCompletions`, `ratings`). No new collection, no rules change. Nothing from Swiggy is stored. See docs/VENDOR_INTEGRATIONS.md.
