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
