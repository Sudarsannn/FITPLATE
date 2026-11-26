# Welcome back, Sudarsan

Written 26 Nov 2026 at the end of the 37-day build (Day 37, the final integration). Plain words first; details are linked.

## 1. What is built

FitPlate is an Expo (React Native) app that runs on your iPhone, in a browser, and later on Android. It works as a guest or signed in with Google.

- **Cook:** a library of 103 dishes with photos, search, filters and diet tags; cost to make vs ordering; servings and shopping list; guided step-by-step cook mode (keep-awake, timers, read aloud); multi-dish cooking plan; "Cook with what I have".
- **Eat and log:** meal logging with servings, My Meals, leftovers reminders, pantry, "What should I eat?" suggestions with reasons, a "Your plan today" card.
- **Buy:** shopping list with vendor price comparison and deep links to Zepto and Instamart; Swiggy order analysis; live Swiggy only on your Mac.
- **Track:** Charts (calories, protein, water, vitamins, workouts, money saved, streaks), Prices (how ingredient prices moved), water tracker, supplements with upper-limit warnings, weekly nutrition insights.
- **Move:** exercise library (search, filters), exercise detail, routines, workout player with counting, camera mode (recording and tap counter; live pose counting is built but off).
- **You:** a profile survey and a 6-page quick setup, personal targets (calories, protein, water, vitamins and minerals), health-condition limits, one Reminders screen (all off by default), Settings, Export my data, Delete my data, Delete my account.
- **Plan and pricing scaffold:** everything is free; one word in `src/config/entitlements.ts` locks a feature behind a "Plus" tier (no payments built).

## 2. How much research content is in the app

| Content | Count |
|---|---|
| Dishes | 103 |
| Ingredients (with prices) | 180 |
| Nutrient, hydration, guidance and condition items | 61 |
| Exercise and fitness items | 84 |

Ingredient price trends observed (180 ingredients): 40 stable, 11 rising, 3 falling, 126 with too few dated readings to call a trend yet. Prices are estimates from public listings, not live shop prices.

## 3. Apply everything in one go

The code is already on the branch. On your Mac, in the `Fitplate` folder:

```
git fetch origin
git checkout claude/project-thread-wchnlm
git pull
npm install
```

The snapshot bundle is a backup of the same commits: `/mnt/project-files/auto-build/FitPlate_Build_Day37_Snapshot_2026-11-26.bundle` (`git fetch <bundle> claude/project-thread-wchnlm`).

## 4. How to test

1. `npx expo start --web` and open the link: click through Today, Cook, Track, Move and Profile.
2. Phone: rebuild once with `npx expo run:ios --device --configuration Release` (needed for camera mode, read aloud and reminders).
3. Real-device checks that could not be done from the cloud: notification reminders (Settings, Reminders: switch on Water, allow notifications), camera clip recording, read aloud, Google sign-in on the phone, Delete my account on a throwaway account.

## 5. Your to-do list, in order

1. **Check the GitHub token.** Memory notes say it expires 24 Nov 2026. If pushes or the daily builds start failing, renew it first.
2. **Cloudflare:** add the Worker text variable `FIREBASE_PROJECT_ID` (same value as `EXPO_PUBLIC_FIREBASE_PROJECT_ID` in `.env`). AI-created dishes stay off until then. Optional: a KV namespace named `AI_LIMITS`. Also turn off "Builds for non-production branches".
3. **Rebuild the iPhone app** (command above).
4. **Test on the phone:** reminders, camera mode, read aloud, Delete my data and Delete my account (use a throwaway account).
5. **Widen network access** in Project settings, environment, so nutrition research can open ICMR-NIN, NIH, PMC and FSSAI (the nutrient values are marked unverified until then).
6. **Decisions (one word each):**
   - Which features, if any, become paid (default: all free).
   - Hosted Swiggy server: Oracle free VM or a Cloudflare rewrite (`docs/HOSTED_SERVER.md`, `docs/ORACLE_SETUP.md`).
   - Android: want the EAS build guide and an Android client ID (needs the SHA-1 from the build)?
   - Apply to the Swiggy Builders Club?
   - Splash screen: add `expo-splash-screen` (needs an iPhone rebuild)?
   - The four feasibility notes in `docs/feasibility/` end with their own decision lists (overlay test, camera scan, who films the videos, government price data, no scraping).
   - Research cadence and usage plan (research every other day is set now).
7. **Videos:** film the top 10 dishes (see `docs/feasibility/03-videos.md`) and swap them for the placeholder clips of the same file names.
8. **Store accounts:** Apple Developer (paid) and Google Play when you are ready to publish; the free Apple ID build expires every 7 days.
9. **Parked by you, not built:** office canteen thali builder and office meal tracking.
10. **Research "needs review" items:** 187 flagged entries (mostly price ranges backed by one or two listings); see section 7.

## 6. Known issues

- Reminders, camera, read aloud and Delete my account have only been tested by unit tests and a browser, not on a phone.
- Live pose counting is off (no pose model registered).
- Live Swiggy works only on your Mac; the phone and website use sample mode.
- Hydration topics 31 to 34 (hot-humid, electrolytes, food water, urine colour), workday timing, overhydration and the kidney, kidney-stone, gout, IBS, acid-reflux, lactose-intolerance and osteoporosis profiles are researched and stored but not yet wired into the water target and health limits.
- The hosted AI-dish endpoint is off until the Cloudflare variable is added.
- Splash screen and the Android adaptive icon background are defaults.
- The `vendorCheckout` flag is off; the vendor cart adapters are placeholders until an official partner route exists.

## 7. Research gaps and prompt improvements

- **Prices need more sightings:** 187 entries are "price not confirmed", most because only 1 or 2 listings or only 1 platform back the range. Ask the ingredient prompt to record at least 3 listings across 2 platforms, or to say plainly when it cannot.
- **Reference groups:** 46 nutrient rows use the group name `age_60_plus`, which the importer does not recognise. Ask the nutrient prompt to use the documented group names, or add the group to the importer.
- **Choline:** one nutrient is rejected because a betaine conversion factor is 0. Ask the prompt to leave that conversion out instead of writing 0.
- **Unmatched dish ingredients:** 130 of 1,904 recipe lines (7 percent) do not link to a researched ingredient (for example "Milk", "Oil (mustard, groundnut or sunflower)", "For cooking"). Ask the dish prompt to use one ingredient name per line and to avoid heading lines.
- **Nutrient foods not matched:** 9 food rows in nutrient tables have no matching ingredient; ask for plain ingredient names.
- **Calorie sanity:** 9 dishes differ from their ingredient-based estimate by over 25 percent; worth a human look.
- **Network access:** official nutrition sources are blocked from the cloud environment (step 5 of the to-do list).

## 8. Suggested next steps

1. Do the to-do list steps 1 to 4 and use the app for a week.
2. Wire the hydration and condition profiles into the water target and health limits (health first).
3. Film the top 10 dishes.
4. Pick the paid-feature split, then build payments last.
5. Apply to Swiggy for official access before anything public.
6. Ideas waiting in the backlog (price alerts, chart tap-through, cheaper swaps, one-tap suggestion swap, "not today"): see the build state in the latest build file.

Daily builds: the build routine will keep running once a day; with the roadmap finished it only syncs research data and does maintenance. Say the word if you want it paused or changed.
