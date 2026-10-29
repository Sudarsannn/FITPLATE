# FitPlate Build — Day 06 — 2026-10-15 (evening run)

## 1. HEADER

**Day 06 of 37 | Roadmap item: Dish library (Cook tab), with search, multi-select filters and sort (SPEC-ADDENDA §9) | Phase 1: Food (the core) | Progress: 16% of the full app (6 ÷ 37)**

**Status: DONE.** Commit `5976adb` is pushed to `claude/project-thread-wchnlm`, and Netlify deploys it to https://fitplateapp.netlify.app.

- **How this run's day was determined:** the newest build file is `FitPlate_Build_Day05_2026-10-15.md` ("Next up: Day 06"). This is the 22:52 IST evening run; one build file existed for 2026-10-15 (fewer than two), so the run went ahead.
- **Supervisor review:** `FitPlate_Review_2026-10-15.md` appeared after the morning run, so this is the first run after it. Its FIX LIST (3 items) was done in full alongside Day 06; see section 3a. Its NEW ideas are in the IDEAS BACKLOG. ROADMAP SUGGESTIONS: none.
- **Context available:**
  - Code source **(a)**: branch `claude/project-thread-wchnlm` at ce7b870 (Day 05).
  - Spec: `PROMPT.md` and `SPEC-ADDENDA.md` §1, §2 and §4 to §9.
  - Research files visible: Dishes 12 (… 2026-10-15), Ingredients 12 (… 2026-10-15), Nutrients 3 (… 2026-10-11; the 14 and 15 Oct files are not in the shared folder, per the review), Fitness 4 (09, 10, 11, 15 Oct).

## 2. SUMMARY

1. **The Cook tab now shows the researched dishes.** All 30 dishes researched and imported so far replace the 5 demo dishes. Each card shows the dish's time, difficulty, calories, diet and allergen tags, and its Healthiness score and Rating as two separate numbers. Pictures are labelled "Photo soon" until real images exist.
2. **Search that forgives spelling.** Search by dish name, ingredient (including Indian names like jeera or palak), diet or tag. Common Indian spelling variants and small slips still find the dish ("brhiyani" finds Biryani).
3. **Filters and sort.** Quick chips (Veg, High protein, Under 30 min, Breakfast) sit above the list. A filter sheet adds diet (including Jain, Vegan, Gluten-free and Dairy-free versions), "leave out dishes that contain" any of 10 allergens, meal, time, difficulty, nutrition, calories and cuisine, with a count on each chip. Sort by quickest, lowest calories, highest protein or fibre, Healthiness score, Rating, fewest ingredients or cheapest to order. Active filters show as removable chips with "Clear all".
4. **Your allergy choice is remembered (small extra).** The dishes you leave out for an allergy stay left out next time, on this phone. "Delete my data" and sign-out clear it.
5. **Safer health and price data (supervisor review fixes).** Health-condition limits now default to "use your doctor's number" when research doesn't say. Order prices backed by too few listings, one platform, a closed outlet or an average outside its own range are no longer shown as a headline ("Order price not confirmed yet"). Variant families can no longer split a dish across two groups.
6. **Data sync:** 10 more dishes (30 in the app), 30 more ingredients (90) and 8 more fitness items (16).

## 3. DATA SYNC REPORT

- **New research files since Day 05:** Dishes 10-15 (dishes 56–60); Ingredients 10-13, 10-14, 10-15 (12 entries, written late on 10-15); Fitness 10-15 (glute bridge, downward dog, stationary bike, rowing machine). No new nutrient file in the shared folder.
- **Ingested this run** (ledger in `src/data/research/ledger.json`):

  | Stream | Files | Items ingested | Backlog before → after |
  |---|---|---|---|
  | Dishes | 10-08, 10-09 | 10: 21 Masala Omelette, 22 Kadai Paneer, 23 Mutton Rogan Josh, 24 Medu Vada, 25 Veg Pulao, 26 Moong Dal Chilla, 27 Dal Makhani, 28 Chicken 65, 29 Misal Pav, 30 Lemon Rice | 40 → 30 |
  | Ingredients | 10-05 (last 8), 10-06, 10-07, 10-08 (first 7) | 30: jaggery-block-powder, light-soy-sauce, white-vinegar-synthetic, black-tea, chole-masala, sambar-powder, dry-mango-powder, black-pepper-powder, whole-wheat-flour, red-kidney-beans-dried, eggs-white-standard, cauliflower, pav, hakka-noodles-dry, green-chilli-sauce, pav-bhaji-masala, carom-seeds, cumin-powder, gram-flour, spinach, rice-flour, baking-soda, desiccated-coconut, mutton-goat-bone-in-curry-cut, alkanet-root, coriander-seeds-whole, black-peppercorns-whole, black-cardamom, fennel-powder, dry-ginger-powder | 67 → 37 |
  | Nutrients | — | none new | 0 |
  | Fitness | 10-11, 10-15 | 8: plank and side plank, hip flexor stretch, treadmill, elliptical cross-trainer, glute bridge, downward dog, stationary bike, rowing machine | 8 → 0 |

- **Validation:** nothing rejected; no parse errors.
- **Cross-links:** **474 of 575** dish ingredient lines linked, all priced (Day 05: 308 of 406); 57 unmatched. New aliases learned: nariyal, dhania-patta, fansi, lehsun, lasun, kothimbir, limbu, pav-buns, sasive, bengal-gram-dal (plus dhaniya, small-onions, makhan from Day 05). "kali-mirch" is ambiguous (black pepper powder vs whole peppercorns) and is not used. A first sync pass also learned preparation words ("dry", "refined wheat", "cut into squares", "pureed", "split") as names; the stoplist now blocks them (new test). One genuine alias, "split pigeon pea" → toor dal, is lost with "split"; noted under KNOWN ISSUES.
- **Calorie and "Used in" checks:** no dish over 25% apart; no quantity more than 15% apart.
- **Families:** none yet with two bundled dishes (Veg Biryani 039 is next run's batch).
- **MET values** for all 16 exercises are in `links.json` (e.g. stationary bike 6.0, rowing 5.0, treadmill 4.8, elliptical 5.0).
- **Price checks (review fix 2), bundled items:**
  - Dishes not confirmed (shown as "Order price not confirmed yet"): 002 Chicken Biryani (a ₹120 listing was for a closed outlet), 007 Butter Chicken (magicpin only), 009 Idli with Sambar (Swiggy only), 013 Pav Bhaji (Zomato only), 016 Besan Chilla (magicpin only), 023 Mutton Rogan Josh (Swiggy only). The other 24 dishes are confirmed; those with fewer than 5 listings say "Based on N listings".
  - Ingredients not confirmed: 31 of 90, mostly BigBasket-only or 2 listings (e.g. chana dal, lemon, curry leaves, spinach, carrot, cabbage, garlic, ginger); alkanet root used a closed/out-of-stock listing. Ingredient prices aren't shown in the app until Day 8.
  - Across all 60 researched dishes the check confirms 42 and leaves 17 unconfirmed (incl. 50 Chicken Korma, average ₹280 outside ₹180–240, and 60 Aloo Matar, Swiggy only); dish 49 has no range at all.
- **Needs review (new):**
  - Fitness: plank (165–195° phases and a > 195° form check), glute bridge (170–185° and > 195°), downward dog (a position check, not an angle): unsigned three-point angles can't exceed 180°. Treadmill: MET 4.8 vs its own Compendium row 3.8 for the beginner speed; treadmill, elliptical and bike give "moderate" as RPE 3–4, where ACSM maps moderate to about 5–6. These stay as text until Day 25.
  - Dish 026 Moong Dal Chilla: "gluten-free" dropped (hing), as flagged on Day 04.
  - Carried from Day 05: nutrient 60+ and pregnancy/lactation defaults for E and K, Vitamin E ambiguous presets, desk release and Surya Namaskar phases.
- **Backlog dishes already flagged:** 039 Veg Biryani, 042 Malai Kofta, 043 Chicken Fried Rice, 047 Veg Manchurian (as Day 05), plus **060 Aloo Matar** (Jain "with changes" but onion, garlic, potato and fresh ginger stay with no skip named).

### 3a. Supervisor review FIX LIST (FitPlate_Review_2026-10-15.md)

| # | Fix | Done? | Notes |
|---|---|---|---|
| 1 | Condition profiles default to "ask your doctor" | ✅ done | `nutrientImporter.ts`: when `requires_doctor_input` is missing and the profile sets a water max, a sodium max, or a protein/potassium/phosphorus/fluid limit, `requiresDoctorInput` becomes true and a needs-review note is added; an explicit false stays false; across versions a stated true wins, otherwise the newest version decides. New fields `requiresDoctorInputStated` and `fluidNote` ("Follow your doctor's advice") on every condition with a water or fluid number. 5 tests. No condition profile is bundled yet (no nutrient file after 10-11). |
| 2 | Check order-price ranges | ✅ done | New `src/services/data/priceChecks.ts`: counts distinct listings and platforms from each section-6 table (rows marked dropped, excluded, context or combo don't count), flags out-of-stock or closed listings, and checks the stated average and median lie inside [min, max]. Fewer than 3 listings, 1 platform, an out-of-stock listing or an average outside the range → `confirmed: false`, reasons in `checkNotes` and needs review. `PriceEstimate` gained `listingCount`, `platforms`, `outOfStock`, `confirmed`, `checkNotes`. The app shows only confirmed prices as a headline (average with range and date), "Based on N listings" under 5, otherwise "Order price not confirmed yet". 14 tests using the dish 50, 57, 59 and 60 rows. "Money saved" arrives on Day 8 and will use only confirmed prices. |
| 3 | Family grouping | ✅ done | `assignFamilies` now merges groups that share a dish (union-find), so every dish lands in exactly one family, named after its lowest-numbered dish. Test with dish 60 Aloo Matar, its linked variant "Matar aur Kacha Kela" and a Jain version: all three share `aloo-matar`. The Pescatarian chip shows only on dishes with fish or seafood; veg and egg dishes still match a Pescatarian filter. |

## 4. DESIGN NOTES

### Cook tab (research dish library)
- **Header:** "Cook", "30 researched dishes, and more every day. Search by name, ingredient or diet."
- **Search box** (placeholder "Biryani, paneer, jeera, Jain…", clear button). Results update as you type.
- **Chip row** (scrolls sideways): **Filters** (shows "Filters · 2" when active), **sort** ("Best match" by default), then quick chips Veg, High protein, Under 30 min, Breakfast. Every chip is at least 40 pt tall with extra touch slop, and reads as a checkbox to screen readers.
- **Active filters** appear as small removable chips ("No peanut", "Veg") plus **Clear all**.
- **Count** ("12 dishes", announced to screen readers) and the line "Allergens are worked out from each recipe's ingredients. Check labels if you have an allergy."
- **Card:** labelled picture slot ("Photo soon", a meal-type emoji on a warm gradient), name, "18 min · Beginner · 390 kcal", up to three chips (diet first, then "Contains …"), then "Healthiness score 7/10" and "Rating ★ 4.5", always separate.
- **Filter sheet** (slides up, 82% height): Diet; Leave out dishes that contain; Meal; Time; Difficulty; Nutrition; Calories per serving; Cuisine. Each chip shows how many dishes it would leave; impossible "any" chips are greyed. Footer: "Show N dishes". Note: "Jain, Vegan, Gluten-free and Dairy-free include dishes with a researched version (shown as '… option' on the card)."
- **Sort sheet:** Best match, Quickest, Lowest calories, Highest protein, Highest fibre, Healthiness score, Rating, Fewest ingredients, Cheapest to order; greyed "Coming soon": Cheapest to cook, Most saved vs ordering, Protein per ₹ (need cost to make, Day 8), Lowest sodium (needs dish sodium data).
- **Empty states:** "No dishes match" with "Clear search and filters"; "Dishes are on their way" if no data is bundled.
- **Offline:** everything is bundled, so the library works with no connection.

### Dish page (`/recipe/[id]`, the Day 7 detail screen starts from it)
- Picture slot, name, facts line, all diet tags then allergen chips, description, the allergen label line.
- Per serving (home-cooked): calories, protein, carbs, fat, fibre ("coming soon" when missing).
- Scores: Healthiness score and Rating, separately, with "Rating is FitPlate's research of what people say online, not user or restaurant ratings."
- To order: "About ₹130 (usually ₹120–150), seen 2026-10-04" and "Based on 4 listings.", or "Order price not confirmed yet."
- Other versions (family dishes as links; researched variants or "not suitable" reasons), ingredients with quantities, and "Full recipe steps, cost to make and guided cooking arrive in the next updates."

## 5. INNOVATION

New ideas this run:

1. **"What can I make in 15 minutes with no onion?" voice-style search** · IMPROVE (Cook search) · Impact 3 · Effort S
   - **Problem:** "I'm tired, I just want to type what I want in plain words." Busy corporates on the commute.
   - **Solution:** read plain phrases into filters: "under 20 min", "no onion", "high protein", "jain", "breakfast" become chips automatically, and the rest stays as search words.
   - **Data:** tags and filters (built today). No new research.
   - **Risk:** a wrong reading hides dishes; the chips it adds are shown and removable.
2. **Hostel and PG filter: "Kettle or one burner"** · merges with backlog idea "Kettle and one-burner cooking"; adds an equipment filter chip once Day 10 has the kitchen profile.
3. **Recently viewed and "cook again"** · IMPROVE (Cook tab) · Impact 3 · Effort S
   - **Problem:** "I saw a dish yesterday and can't find it again."
   - **Solution:** a short "Recently viewed" row above the list, stored on the device under the owner prefix (cleared by Delete my data).
   - **Data:** none new.
   - **Risk:** none.
4. **Allergy-safe swap hint** · IMPROVE (dish page, Day 7) · Impact 4 · Effort M
   - **Problem:** "This dish looks great but it has cashews and my son is allergic."
   - **Solution:** when a dish contains an allergen you leave out, show the research's own substitute for that ingredient (ingredient files carry `substitutes`), never a made-up one; otherwise say no researched swap exists.
   - **Data:** ingredient substitutes (researched), allergen map (Day 04).
   - **Risk:** substitutes may carry other allergens; the swap is checked against the same allergen map before it is shown.

From the supervisor review (added to the backlog): Cheaper twin, Doctor's limits filter, Shared-ingredient week.

**Health-condition research (SPEC-ADDENDA §8):** still no condition profile in the shared folder (the review says the nutrition thread saved its 14 and 15 Oct files, including a Prediabetes profile, outside it). The importer now defaults to "ask your doctor" (fix 1), so the first profiles can be shown safely when they arrive. Still needed, in the order the survey needs them: type 2 diabetes, prediabetes, high blood pressure, high cholesterol, PCOS, hypothyroidism, fatty liver, chronic kidney disease, pregnancy, anaemia, gout.

**Reminders (innovation):** a "plan-ahead dish" reminder: dishes whose steps need an overnight soak (rajma, chole) offer "remind me tonight at 9 pm to soak", from the step timers already in research. For Day 33.

**Survey-driven curation (innovation):** the remembered allergen exclusions built today become the default for the survey's allergy question on Day 31 (and the survey answer will set them), so the two never disagree.

**Built today:** the allergy filter (backlog rank 2; the review's rank 1) as part of the Day 6 filters, plus remembering it on the device (`rememberAllergens` flag ON, 4 tests).

## 6. DATABASE (SPEC-ADDENDA §5)

- **Firestore:** no change. No new collection, no rules change, no `schemaVersion` bump.
- **Device:** one new key per owner, `fitplate.docs.<owner>.dishFilters.v1` = `{ version: 1, excludeAllergens: AllergenId[] }`. It sits under the owner prefix, so sign-out, "Delete my data" and "Reset demo data" remove it, and "export" includes it. Unknown or damaged values load as "nothing left out".
- **Content model (bundled research only):** `PriceEstimate` gained optional `listingCount`, `platforms`, `outOfStock`, `confirmed`, `checkNotes`; `HealthCondition` gained `requiresDoctorInputStated` and `fluidNote`.
- **Free-tier guard:** unchanged; the library reads bundled data only.
- **USER ACTION:** none.

## 7. DATA FILES

Generated by `scripts/research/run.js`; rebuild with `node scripts/research/run.js --today 2026-10-15 --build Day06` (run it once: each run ingests one capped batch). Files added or changed today (CHANGED files gained the price-check fields):

- `src/data/research/dishes/001-poha.json` (CHANGED)
- `src/data/research/dishes/002-chicken-biryani.json` (CHANGED)
- `src/data/research/dishes/003-paneer-butter-masala.json` (CHANGED)
- `src/data/research/dishes/004-masala-dosa.json` (CHANGED)
- `src/data/research/dishes/005-dal-tadka.json` (CHANGED)
- `src/data/research/dishes/006-upma.json` (CHANGED)
- `src/data/research/dishes/007-butter-chicken.json` (CHANGED)
- `src/data/research/dishes/008-chole-chana-masala.json` (CHANGED)
- `src/data/research/dishes/009-idli-with-sambar.json` (CHANGED)
- `src/data/research/dishes/010-veg-fried-rice.json` (CHANGED)
- `src/data/research/dishes/011-aloo-paratha.json` (CHANGED)
- `src/data/research/dishes/012-rajma-chawal.json` (CHANGED)
- `src/data/research/dishes/013-pav-bhaji.json` (CHANGED)
- `src/data/research/dishes/014-egg-bhurji.json` (CHANGED)
- `src/data/research/dishes/015-veg-hakka-noodles.json` (CHANGED)
- `src/data/research/dishes/016-besan-chilla.json` (CHANGED)
- `src/data/research/dishes/017-palak-paneer.json` (CHANGED)
- `src/data/research/dishes/018-chicken-tikka-masala.json` (CHANGED)
- `src/data/research/dishes/019-jeera-rice.json` (CHANGED)
- `src/data/research/dishes/020-vada-pav.json` (CHANGED)
- `src/data/research/dishes/021-masala-omelette.json` (NEW)
- `src/data/research/dishes/022-kadai-paneer.json` (NEW)
- `src/data/research/dishes/023-mutton-rogan-josh.json` (NEW)
- `src/data/research/dishes/024-medu-vada.json` (NEW)
- `src/data/research/dishes/025-veg-pulao.json` (NEW)
- `src/data/research/dishes/026-moong-dal-chilla.json` (NEW)
- `src/data/research/dishes/027-dal-makhani.json` (NEW)
- `src/data/research/dishes/028-chicken-65.json` (NEW)
- `src/data/research/dishes/029-misal-pav.json` (NEW)
- `src/data/research/dishes/030-lemon-rice.json` (NEW)
- `src/data/research/dishes/index.ts` (CHANGED)
- `src/data/research/exercises/adho-mukha-svanasana.json` (NEW)
- `src/data/research/exercises/elliptical-cross-trainer.json` (NEW)
- `src/data/research/exercises/glute-bridge.json` (NEW)
- `src/data/research/exercises/hip-flexor-stretch.json` (NEW)
- `src/data/research/exercises/index.ts` (CHANGED)
- `src/data/research/exercises/plank-and-side-plank.json` (NEW)
- `src/data/research/exercises/rowing-machine.json` (NEW)
- `src/data/research/exercises/stationary-bike.json` (NEW)
- `src/data/research/exercises/treadmill.json` (NEW)
- `src/data/research/ingredients/aliases.json` (CHANGED)
- `src/data/research/ingredients/alkanet-root.json` (NEW)
- `src/data/research/ingredients/asafoetida.json` (CHANGED)
- `src/data/research/ingredients/baking-soda.json` (NEW)
- `src/data/research/ingredients/basmati-rice-everyday-grade.json` (CHANGED)
- `src/data/research/ingredients/bay-leaf.json` (CHANGED)
- `src/data/research/ingredients/biryani-masala.json` (CHANGED)
- `src/data/research/ingredients/black-cardamom.json` (NEW)
- `src/data/research/ingredients/black-pepper-powder.json` (NEW)
- `src/data/research/ingredients/black-peppercorns-whole.json` (NEW)
- `src/data/research/ingredients/black-tea.json` (NEW)
- `src/data/research/ingredients/butter-salted.json` (CHANGED)
- `src/data/research/ingredients/cabbage.json` (CHANGED)
- `src/data/research/ingredients/carom-seeds.json` (NEW)
- `src/data/research/ingredients/carrot.json` (CHANGED)
- `src/data/research/ingredients/cashew-nuts-whole.json` (CHANGED)
- `src/data/research/ingredients/cauliflower.json` (NEW)
- `src/data/research/ingredients/chana-dal.json` (CHANGED)
- `src/data/research/ingredients/chicken-curry-cut-bone-in-skinless.json` (CHANGED)
- `src/data/research/ingredients/chicken-thigh-boneless-skinless.json` (CHANGED)
- `src/data/research/ingredients/chickpeas-dried.json` (CHANGED)
- `src/data/research/ingredients/chole-masala.json` (NEW)
- `src/data/research/ingredients/cinnamon-cassia.json` (CHANGED)
- `src/data/research/ingredients/cloves.json` (CHANGED)
- `src/data/research/ingredients/cooking-oil-refined-sunflower-groundnut.json` (CHANGED)
- `src/data/research/ingredients/coriander-leaves.json` (CHANGED)
- `src/data/research/ingredients/coriander-powder.json` (CHANGED)
- `src/data/research/ingredients/coriander-seeds-whole.json` (NEW)
- `src/data/research/ingredients/cumin-powder.json` (NEW)
- `src/data/research/ingredients/cumin-seeds.json` (CHANGED)
- `src/data/research/ingredients/curd-plain.json` (CHANGED)
- `src/data/research/ingredients/curry-leaves.json` (CHANGED)
- `src/data/research/ingredients/desiccated-coconut.json` (NEW)
- `src/data/research/ingredients/dried-fenugreek-leaves.json` (CHANGED)
- `src/data/research/ingredients/dried-red-chilli-whole.json` (CHANGED)
- `src/data/research/ingredients/drumstick.json` (CHANGED)
- `src/data/research/ingredients/dry-ginger-powder.json` (NEW)
- `src/data/research/ingredients/dry-mango-powder.json` (NEW)
- `src/data/research/ingredients/eggs-white-standard.json` (NEW)
- `src/data/research/ingredients/fennel-powder.json` (NEW)
- `src/data/research/ingredients/fenugreek-seeds.json` (CHANGED)
- `src/data/research/ingredients/flattened-rice-thick.json` (CHANGED)
- `src/data/research/ingredients/french-beans.json` (CHANGED)
- `src/data/research/ingredients/fresh-cream.json` (CHANGED)
- `src/data/research/ingredients/garam-masala.json` (CHANGED)
- `src/data/research/ingredients/garlic.json` (CHANGED)
- `src/data/research/ingredients/ghee-cow.json` (CHANGED)
- `src/data/research/ingredients/ginger-garlic-paste.json` (CHANGED)
- `src/data/research/ingredients/ginger.json` (CHANGED)
- `src/data/research/ingredients/gram-flour.json` (NEW)
- `src/data/research/ingredients/green-capsicum.json` (CHANGED)
- `src/data/research/ingredients/green-cardamom.json` (CHANGED)
- `src/data/research/ingredients/green-chilli-sauce.json` (NEW)
- `src/data/research/ingredients/green-chilli.json` (CHANGED)
- `src/data/research/ingredients/green-peas-frozen.json` (CHANGED)
- `src/data/research/ingredients/hakka-noodles-dry.json` (NEW)
- `src/data/research/ingredients/idli-rice-parboiled-rice.json` (CHANGED)
- `src/data/research/ingredients/index.ts` (CHANGED)
- `src/data/research/ingredients/jaggery-block-powder.json` (NEW)
- `src/data/research/ingredients/kashmiri-red-chilli-powder.json` (CHANGED)
- `src/data/research/ingredients/lemon.json` (CHANGED)
- `src/data/research/ingredients/light-soy-sauce.json` (NEW)
- `src/data/research/ingredients/milk-toned.json` (CHANGED)
- `src/data/research/ingredients/mint-leaves.json` (CHANGED)
- `src/data/research/ingredients/mustard-seeds.json` (CHANGED)
- `src/data/research/ingredients/mutton-goat-bone-in-curry-cut.json` (NEW)
- `src/data/research/ingredients/onion.json` (CHANGED)
- `src/data/research/ingredients/paneer.json` (CHANGED)
- `src/data/research/ingredients/pav-bhaji-masala.json` (NEW)
- `src/data/research/ingredients/pav.json` (NEW)
- `src/data/research/ingredients/peanuts-raw.json` (CHANGED)
- `src/data/research/ingredients/potato.json` (CHANGED)
- `src/data/research/ingredients/pumpkin-red-yellow.json` (CHANGED)
- `src/data/research/ingredients/red-chilli-powder.json` (CHANGED)
- `src/data/research/ingredients/red-kidney-beans-dried.json` (NEW)
- `src/data/research/ingredients/rice-flour.json` (NEW)
- `src/data/research/ingredients/saffron.json` (CHANGED)
- `src/data/research/ingredients/salt.json` (CHANGED)
- `src/data/research/ingredients/sambar-powder.json` (NEW)
- `src/data/research/ingredients/semolina-fine-bombay-rava.json` (CHANGED)
- `src/data/research/ingredients/shahi-jeera.json` (CHANGED)
- `src/data/research/ingredients/shallots.json` (CHANGED)
- `src/data/research/ingredients/spinach.json` (NEW)
- `src/data/research/ingredients/spring-onion.json` (CHANGED)
- `src/data/research/ingredients/sugar.json` (CHANGED)
- `src/data/research/ingredients/tamarind-seedless-block.json` (CHANGED)
- `src/data/research/ingredients/tomato.json` (CHANGED)
- `src/data/research/ingredients/toor-dal.json` (CHANGED)
- `src/data/research/ingredients/turmeric-powder.json` (CHANGED)
- `src/data/research/ingredients/urad-dal-split-skinned.json` (CHANGED)
- `src/data/research/ingredients/white-vinegar-synthetic.json` (NEW)
- `src/data/research/ingredients/whole-wheat-flour.json` (NEW)
- `src/data/research/ledger.json` (CHANGED)
- `src/data/research/links.json` (CHANGED)

Samples (full content):

### `src/data/research/dishes/026-moong-dal-chilla.json`

```json
{
  "id": "026-moong-dal-chilla",
  "number": 26,
  "name": "Moong Dal Chilla",
  "cuisine": "North Indian (Uttar Pradesh, Rajasthan, Delhi street stalls; also \"moong dal cheela\", \"moong dal ka chilla\", \"moonglet\" for the thick, fluffy Delhi style, and close to Gujarat's \"moong dal pudla\")",
  "dietType": "veg",
  "mealType": [
    "breakfast"
  ],
  "difficulty": "Beginner",
  "prepMin": 15,
  "cookMin": 10,
  "servings": 1,
  "ingredients": [
    {
      "ingredientId": null,
      "name": "Split yellow moong dal (dhuli moong dal), dry",
      "quantity": 50,
      "unit": "g",
      "householdMeasure": "¼ cup"
    },
    {
      "ingredientId": null,
      "name": "Water, for soaking",
      "quantity": 250,
      "unit": "ml",
      "householdMeasure": "1 cup +"
    },
    {
      "ingredientId": null,
      "name": "Water, for grinding and thinning",
      "quantity": 40,
      "unit": "ml",
      "householdMeasure": "3–4 tbsp (add slowly)"
    },
    {
      "ingredientId": "ginger",
      "name": "Ginger (adrak)",
      "quantity": 3,
      "unit": "g",
      "householdMeasure": "½-inch piece, peeled"
    },
    {
      "ingredientId": "green-chilli",
      "name": "Green chilli (hari mirch)",
      "quantity": 3,
      "unit": "g",
      "householdMeasure": "½–1 chilli"
    },
    {
      "ingredientId": "cumin-seeds",
      "name": "Cumin seeds (jeera)",
      "quantity": 0.5,
      "unit": "g",
      "householdMeasure": "¼ tsp"
    },
    {
      "ingredientId": "asafoetida",
      "name": "Asafoetida (hing)",
      "quantity": null,
      "unit": null,
      "householdMeasure": "a pinch"
    },
    {
      "ingredientId": "turmeric-powder",
      "name": "Turmeric powder (haldi)",
      "quantity": 0.25,
      "unit": "g",
      "householdMeasure": "a pinch (scant ⅛ tsp)"
    },
    {
      "ingredientId": "salt",
      "name": "Salt (namak)",
      "quantity": 1.5,
      "unit": "g",
      "householdMeasure": "¼ tsp (level)"
    },
    {
      "ingredientId": "onion",
      "name": "Onion (pyaz/kanda)",
      "quantity": 30,
      "unit": "g",
      "householdMeasure": "¼ medium onion, very finely chopped (about 3 tbsp)"
    },
    {
      "ingredientId": "coriander-leaves",
      "name": "Coriander leaves (dhania)",
      "quantity": 5,
      "unit": "g",
      "householdMeasure": "1 tbsp, chopped"
    },
    {
      "ingredientId": null,
      "name": "Groundnut oil (or any neutral cooking oil)",
      "quantity": 10,
      "unit": "ml",
      "householdMeasure": "2 tsp (1 tsp per chilla)"
    }
  ],
  "equipment": [
    "Bowl for soaking, and a sieve or colander",
    "Mixer-grinder with a small chutney jar",
    "Mixing bowl",
    "Flat non-stick tawa or 9–10-inch non-stick pan",
    "Ladle (about ¼ cup / 60 ml)",
    "Flat, wide spatula",
    "Chopping board and knife",
    "Measuring spoons and a measuring cup (normal teaspoons and a steel glass are fine stand-ins)"
  ],
  "steps": [
    {
      "n": 1,
      "title": "Measure the dal",
      "text": "Measure 50 g (¼ cup) split yellow moong dal into a bowl.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "A small heap of pale-yellow split lentils",
      "cameraCheck": "¼ cup dal in the bowl",
      "videoShot": "Dal poured from the cup into the bowl."
    },
    {
      "n": 2,
      "title": "Rinse the dal",
      "text": "Cover with water, swirl with your fingers, pour the water off. Repeat 3 times.",
      "timerSec": 60,
      "tip": "Rinsing removes dust and surface starch, so the batter tastes cleaner.",
      "visualCue": "The water goes from cloudy to almost clear.",
      "cameraCheck": "The bowl with clear rinse water",
      "videoShot": "Fingers swirling the dal in water."
    },
    {
      "n": 3,
      "title": "Soak the dal",
      "text": "Add 1 cup (250 ml) fresh water and leave it covered.",
      "timerSec": 14400,
      "tip": "Under-soaked dal gives a gritty batter that sticks. If you only have 1–2 hours, soak in warm water and grind longer.",
      "visualCue": "The dal has swelled to about double, and a grain crushes easily between two fingers.",
      "cameraCheck": "A soaked grain pressed between your fingers",
      "videoShot": "Fingers squashing a soft, soaked lentil."
    },
    {
      "n": 4,
      "title": "Drain the dal",
      "text": "Pour the soaked dal into a sieve and let it drip.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "No standing water around the dal.",
      "cameraCheck": "The drained dal in the sieve",
      "videoShot": "Water draining through the sieve."
    },
    {
      "n": 5,
      "title": "Prepare the ginger and chilli",
      "text": "Peel the ginger (3 g) and break the green chilli (3 g) into 2–3 pieces.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "A small peeled ginger piece and chilli pieces",
      "cameraCheck": "The ginger and chilli on the board",
      "videoShot": "A spoon edge scraping the ginger skin off."
    },
    {
      "n": 6,
      "title": "Load the grinder",
      "text": "Put the drained dal, ginger, chilli, ¼ tsp cumin seeds and 2 tbsp (30 ml) water into the small grinder jar.",
      "timerSec": 30,
      "tip": "Start with less water. You can thin the batter later but you cannot thicken it.",
      "visualCue": "Dal, aromatics and a little water in the jar",
      "cameraCheck": "The loaded jar, lid off",
      "videoShot": "Ingredients going into the jar."
    },
    {
      "n": 7,
      "title": "Grind the batter",
      "text": "Grind in short bursts, scraping down the sides once or twice.",
      "timerSec": 120,
      "tip": "If the blades spin without catching, add 1 tbsp water and grind again.",
      "visualCue": "A thick, pale-yellow, mostly smooth paste with a slight grain when rubbed between fingers.",
      "cameraCheck": "The batter on a spoon",
      "videoShot": "The jar lid lifted to show the paste."
    },
    {
      "n": 8,
      "title": "Transfer to a bowl",
      "text": "Scrape the batter into the mixing bowl.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "All batter out of the jar",
      "cameraCheck": "The batter in the bowl",
      "videoShot": "A spatula scraping the jar."
    },
    {
      "n": 9,
      "title": "Chop the onion and coriander",
      "text": "Very finely chop 30 g onion and 1 tbsp (5 g) coriander leaves.",
      "timerSec": 120,
      "tip": "Big onion pieces tear the chilla when you spread it. For the thinnest, crispest chilla, leave the onion out of the batter and sprinkle it on top after spreading.",
      "visualCue": "Tiny, even onion pieces and fine green flecks",
      "cameraCheck": "The chopped onion and coriander side by side",
      "videoShot": "The knife rocking through the onion."
    },
    {
      "n": 10,
      "title": "Season the batter",
      "text": "Add ¼ tsp salt, a pinch of turmeric, a pinch of hing, the onion and the coriander. Stir well.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "An evenly yellow batter speckled with white and green",
      "cameraCheck": "The mixed batter",
      "videoShot": "A spoon folding in the onion and coriander."
    },
    {
      "n": 11,
      "title": "Adjust the thickness",
      "text": "Stir in 1–2 tbsp water, a little at a time.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "Like thick dosa batter: it falls from the ladle in a thick ribbon and slowly settles, not running like water.",
      "cameraCheck": "Batter dripping from the ladle",
      "videoShot": "The ribbon of batter falling back into the bowl."
    },
    {
      "n": 12,
      "title": "Heat the tawa",
      "text": "Put the tawa on medium heat. Add ½ tsp oil and wipe it across with a folded paper towel or onion half.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "A sprinkle of water sizzles and disappears in 2–3 seconds.",
      "cameraCheck": "The greased tawa",
      "videoShot": "Water drops dancing and vanishing on the hot tawa."
    },
    {
      "n": 13,
      "title": "Pour and spread the first chilla",
      "text": "Pour half the batter (one ladle, about 75 ml) in the centre. Using the back of the ladle, spread it in circles from the centre out to about 7 inches.",
      "timerSec": 30,
      "tip": "If it drags and tears, the tawa is too hot. Take it off the flame for 10 seconds, sprinkle water, wipe, and try again.",
      "visualCue": "An even round, thin enough that the tawa shows through in a few spots",
      "cameraCheck": "The spread chilla on the tawa",
      "videoShot": "The ladle spiralling outwards."
    },
    {
      "n": 14,
      "title": "Add oil around it",
      "text": "Drizzle ½ tsp oil around the edges and a few drops on top.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "The oil sizzles at the edges.",
      "cameraCheck": "Oil bubbling around the rim",
      "videoShot": "The spoon drizzling oil around the edge."
    },
    {
      "n": 15,
      "title": "Cook the first side",
      "text": "Cook on medium heat without touching it.",
      "timerSec": 120,
      "tip": null,
      "visualCue": "The top turns from glossy to matte, the edges lift and turn golden, and the base slides when nudged.",
      "cameraCheck": "The lifted golden edge",
      "videoShot": "The spatula lifting an edge to show the browned underside."
    },
    {
      "n": 16,
      "title": "Flip it",
      "text": "Slide the spatula under the chilla and turn it over.",
      "timerSec": 10,
      "tip": "If it is not sliding freely, wait 30 more seconds before flipping.",
      "visualCue": "The cooked side is golden with brown spots.",
      "cameraCheck": "The flipped side",
      "videoShot": "The flip."
    },
    {
      "n": 17,
      "title": "Cook the second side",
      "text": "Press lightly with the spatula and cook.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "Light-brown spots and no raw, sticky patches when pressed",
      "cameraCheck": "The second side, lifted with the spatula",
      "videoShot": "The spatula pressing the chilla."
    },
    {
      "n": 18,
      "title": "Plate it",
      "text": "Fold in half or serve flat on a plate.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "Golden, crisp edges, soft centre",
      "cameraCheck": "The finished chilla on the plate",
      "videoShot": "The chilla sliding onto the plate."
    },
    {
      "n": 19,
      "title": "Make the second chilla",
      "text": "Stir the batter, wipe the tawa, and repeat steps 13 to 18 with the remaining batter and the last 1 tsp oil.",
      "timerSec": 240,
      "tip": null,
      "visualCue": "Two golden chillas on the plate",
      "cameraCheck": "Both chillas on the plate",
      "videoShot": "The second chilla joining the first."
    }
  ],
  "nutritionPerServing": {
    "kcal": 260,
    "proteinG": 12.6,
    "carbsG": 29.2,
    "fatG": 9.9,
    "fibreG": 5.6
  },
  "microNutrientsEstimate": {
    "values": {
      "vitamin-a": 31.8,
      "vitamin-k": 13.7
    },
    "coveragePct": 1,
    "basis": "partial estimate from ingredient quantities"
  },
  "asOrdered": {
    "price": {
      "priceHistory": [
        {
          "date": "2026-10-09",
          "min": 110,
          "max": 150,
          "avg": 125,
          "confidence": null,
          "sourceFile": "FitPlate_Dishes_2026-10-09.md"
        }
      ],
      "currentEstimate": {
        "min": 110,
        "max": 140,
        "avg": 130
      },
      "method": "single",
      "trend": "unknown",
      "change30dPct": null,
      "lastObserved": "2026-10-09",
      "stale": false,
      "seasonal": false,
      "listingCount": 4,
      "platforms": [
        "Bikanervala's own ordering site",
        "Swiggy",
        "Zomato"
      ],
      "outOfStock": false,
      "confirmed": true,
      "checkNotes": []
    },
    "nutrition": {
      "calories": {
        "value": null,
        "source": null
      },
      "protein": {
        "value": null,
        "source": null
      },
      "carbs": {
        "value": null,
        "source": null
      },
      "fat": {
        "value": null,
        "source": null
      },
      "fibre": {
        "value": null,
        "source": null
      }
    },
    "restaurantsSampled": null,
    "platforms": [
      "Swiggy",
      "Zomato",
      "magicpin"
    ]
  },
  "orderPrice": {
    "priceHistory": [
      {
        "date": "2026-10-09",
        "min": 110,
        "max": 150,
        "avg": 125,
        "confidence": null,
        "sourceFile": "FitPlate_Dishes_2026-10-09.md"
      }
    ],
    "currentEstimate": {
      "min": 110,
      "max": 140,
      "avg": 130
    },
    "method": "single",
    "trend": "unknown",
    "change30dPct": null,
    "lastObserved": "2026-10-09",
    "stale": false,
    "seasonal": false,
    "listingCount": 4,
    "platforms": [
      "Bikanervala's own ordering site",
      "Swiggy",
      "Zomato"
    ],
    "outOfStock": false,
    "confirmed": true,
    "checkNotes": []
  },
  "healthiness": {
    "score": 8,
    "restaurantScore": null,
    "reasons": [
      "50 g moong dal gives about 12 g of plant protein and 5 g of fibre, with very little natural fat, and the dish is shallow-cooked in just 2 tsp oil. It is gluten-free, vegan, and moong is widely regarded as one of the easiest dals to digest. Points come off because protein is modest for a full meal on its own, vegetables are few, and sodium is about 600 mg. Restaurant and stall versions are often brushed with butter, made thick and heavy (\"moonglet\"), stuffed with paneer or cheese, and served with sweet chutneys or mayonnaise dips."
    ]
  },
  "researchRating": {
    "score": 4.5,
    "basis": "moong dal chilla is a widely loved, everyday North Indian breakfast and a staple of \"high-protein, weight-loss breakfast\" articles. Recipe pages score very high (Hebbar's Kitchen 4.99/5 from 266 votes; Indian Healthy Recipes 5/5 from 45 votes; Piping Pot Curry 4.93/5 from 13 votes; Tarla Dalal 5/5 from 8 reviews; Spice Up The Curry 5/5 from 4 votes), and Hindi food media (Aaj Tak) regularly feature it. Small deductions because the soaking step puts off some people, the plain version is seen as everyday rather than a treat, and it is far less common on Mumbai menus than besan or paneer chillas."
  },
  "storage": "Cooked chillas are best fresh; they go limp as they cool. Leftover chillas keep in an airtight box in the fridge for up to 1 day. Uncooked batter keeps in a closed box in the fridge for up to 2 days (stir in 1–2 tbsp water before using; leave the onion out if storing, and add it fresh). Freezing cooked chillas is not recommended (they turn soggy); the plain batter (without onion) can be frozen for up to 1 month and thawed overnight in the fridge. Reheat cooked chillas on a hot tawa for 30–40 seconds per side; avoid the microwave, which makes them rubbery.",
  "leftoverRemix": "Chilla \"noodle\" upma. Roll 2 leftover chillas and slice them into thin ribbons. Heat ½ tsp oil, crackle ¼ tsp mustard seeds and a few curry leaves, add 2 tbsp chopped onion and capsicum, then toss in the ribbons with a pinch of salt and ½ tsp lemon juice for 1–2 minutes. Finish with coriander.",
  "burnOff": "about 3.7 km of running (260 ÷ 70 kcal/km, for a 70 kg adult), or about 5.2 km of brisk walking (about 1 hour at 5 km/h, using about 50 kcal/km for walking) (est.).",
  "sources": [
    "Hebbar's Kitchen, Moong dal chilla (1 cup dal, 3 h soak, about 5 chillas; 4.99/5 from 266 votes): https://hebbarskitchen.com/moong-dal-chilla-recipe-moong-dal-cheela/",
    "Dassana's Veg Recipes (Vegrecipesofindia), Moong Dal Chilla (soak 3–4 h, grind with ¼ cup water): https://www.vegrecipesofindia.com/moong-dal-chilla-recipe/",
    "Swasthi's Recipes (Indian Healthy Recipes), Moong Dal Chilla (5/5 from 45 votes): https://www.indianhealthyrecipes.com/moong-dal-chilla/",
    "Indian Veggie Delight, Moong Dal Chilla: https://www.indianveggiedelight.com/moong-dal-chilla/",
    "Whisk Affair, Moong Dal Chilla: https://www.whiskaffair.com/paneer-moong-dal-chila-lentil-crepe-with-cottage-cheese-stuffing/",
    "Tarla Dalal, Moong dal chilla / stuffed moong dal chilla (Mumbai roadside context): https://www.tarladalal.com/moong-dal-chilla-stuffed-moong-dal-chila-764r",
    "Piping Pot Curry, Moong dal chilla (4.93/5 from 13 votes): https://pipingpotcurry.com/moong-dal-chilla/",
    "Spice Up The Curry, Moong Dal Chilla (5/5 from 4 votes): https://www.spiceupthecurry.com/moong-dal-chilla/",
    "My Food Story, Stuffed Moong Dal Chilla: https://myfoodstory.com/moong-dal-chilla/",
    "Bread and Dreams, Moong dal chilla (Swati Snacks, Mumbai mention): https://breadanddreams.in/2017/11/24/moong-dal-chilla",
    "Aaj Tak, moong dal chilla features (sentiment): https://www.aajtak.in/lifestyle/kitchen/story/moong-dal-chilla-recipe-for-healthy-protein-rich-breakfast-weight-loss-digestion-tmovx-dskc-2453659-2026-02-01",
    "IFCT 2017 (ICMR-NIN), Indian Food Composition Tables: https://www.nin.res.in/ebooks/IFCT2017.pdf",
    "USDA FoodData Central: https://fdc.nal.usda.gov/",
    "Swiggy, Dillie Heart, HyperCity Mall, Malad West (Moong Dal Chilla ₹109): https://www.swiggy.com/restaurants/dillie-heart-hypercity-mall-malad-kan-west-mumbai-20588",
    "Swiggy, The Comfort Zone, Vile Parle West (Cheela ₹115): https://www.swiggy.com/restaurants/the-comfort-zone-vile-parle-vile-parle-west-mumbai-290462",
    "Bikanervala ordering site, restaurant menu (Dal Chilla ₹130, Paneer Dal Masala Chilla ₹150): https://order.bikanervala.com/products/restaurant",
    "Swiggy, Bikanervala restaurants in Mumbai (outlet locations): https://www.swiggy.com/city/mumbai/bikanervala",
    "Zomato, Apricot Foods, Borivali West (Moonglet 1 piece ₹150): https://www.zomato.com/mumbai/apricot-foods-2-borivali-west/order",
    "magicpin, Via Calcutta, Pali Hill, Bandra West (Victoria Moong Dal Chilla ₹180): https://magicpin.in/Mumbai/Pali-Hill/Restaurant/Via-Calcutta/store/a8957/menu/",
    "magicpin, Via Calcutta, Powai (same item, 1 pc; price not seen): https://magicpin.in/Mumbai/Powai/Restaurant/Via-Calcutta/store/16a889c/",
    "Zomato, Chilla Chilette, Sakinaka (Healthy Moong Dal Chilla, 2 pc; price not seen): https://www.zomato.com/mumbai/chilla-chilette-sakinaka/order",
    "Zomato, Brijwasi Kashinath Chhotalal, Matunga East (paneer and cheese capsicum variants, dropped): https://www.zomato.com/mumbai/brijwasi-kashinath-chhotalal-1-matunga-east/order",
    "Zomato, Brijwasi Kashinath Chhotalal, Kharghar (peri peri variant, dropped): https://www.zomato.com/mumbai/brijwasi-kashinath-chhotalal-kharghar-navi-mumbai",
    "magicpin, Brijwasi Kashinath Chhotalal, Kings Circle (paneer variant ₹80, dropped): https://magicpin.in/Mumbai/Kings-Circle/Restaurant/Brijwasi-Kashinath-Chhotalal/store/940016/",
    "magicpin, Satvik Gujrati Foods & Snacks, Santacruz West (paneer variant, dropped): https://magicpin.in/Mumbai/Santacruz-West/Restaurant/Satvik-Gujrati-Foods-and-Snacks/store/1548bc2/delivery/",
    "magicpin, Bayleaf Cafe, Juhu (stuffed variant, dropped): https://magicpin.in/Mumbai/Juhu/Restaurant/Bayleaf-Cafe/store/15537a2/delivery/",
    "magicpin, Oye Paaji, Goregaon East (green moong, dropped): https://magicpin.in/Mumbai/Goregaon/Restaurant/Oye-Paaji/store/163baa5/delivery/",
    "Zomato, Moong Dal Chilla in Mumbai (directory; cost-for-two only, not used): https://www.zomato.com/mumbai/restaurants/dish-moong-dal-chilla",
    "Zomato, Healthy Chilla, Kharadi, Pune (published kcal/protein for stuffed chillas; context only): https://www.zomato.com/pune/healthy-chilla-kharadi/order"
  ],
  "allergens": [
    "peanut",
    "gluten"
  ],
  "dietClaims": [
    "vegan"
  ],
  "fasting": null,
  "dietTags": null,
  "tags": [
    "Veg",
    "Vegan",
    "Contains peanut",
    "Contains gluten",
    "Breakfast",
    "North Indian",
    "Under 30 min",
    "Beginner",
    "Low calorie"
  ],
  "description": null,
  "familyId": null,
  "variants": [],
  "needsReview": [
    "dropped \"glutenFree\" claim: recipe has gluten"
  ],
  "versions": [
    {
      "date": "2026-10-09",
      "file": "FitPlate_Dishes_2026-10-09.md"
    }
  ],
  "mergeMethod": {
    "nutritionPerServing": "stable (single)",
    "orderPrice": "price engine (single)",
    "ingredients": "newest",
    "steps": "newest",
    "healthiness": "newest",
    "researchRating": "newest",
    "sources": "union",
    "tags": "tag engine (tags.ts) on the merged dish"
  },
  "mergeNotes": [
    "price flag: narrowed",
    "Range 110.0–150.0 was wider than 30% of avg 125.0; narrowed to ±15%.",
    "2026-10-09: hing: compounded hing usually contains wheat flour"
  ]
}
```

### `src/data/research/ingredients/spinach.json`

```json
{
  "id": "spinach",
  "name": "Spinach",
  "aliases": [
    "palak"
  ],
  "category": "Vegetable (leafy green)",
  "standardUnit": "kg",
  "price": {
    "priceHistory": [
      {
        "date": "2026-10-07",
        "min": 40,
        "max": 70,
        "avg": 55,
        "confidence": "Low",
        "sourceFile": "FitPlate_Ingredients_2026-10-07.md"
      }
    ],
    "currentEstimate": {
      "min": 47,
      "max": 63,
      "avg": 55
    },
    "method": "single",
    "trend": "unknown",
    "change30dPct": null,
    "lastObserved": "2026-10-07",
    "stale": false,
    "seasonal": false,
    "listingCount": 2,
    "platforms": [
      "BigBasket"
    ],
    "outOfStock": false,
    "confirmed": false,
    "checkNotes": [
      "only 2 listings back the range (need 3)",
      "only 1 platform (BigBasket) backs the range"
    ]
  },
  "per100Estimate": {
    "min": 4.7,
    "max": 6.3,
    "avg": 5.5
  },
  "seasonal": false,
  "nutritionPer100g": null,
  "macrosPer100Estimate": {
    "kcal": 23,
    "proteinG": 2.9,
    "carbsG": 3.6,
    "fatG": 0.4,
    "fibreG": 2.2
  },
  "storage": "unwashed, wrapped in a dry cloth or paper towel inside a bag or box, for 2–4 days. Wash just before use.",
  "substitutes": [
    "Frozen spinach",
    "Methi (fenugreek) leaves",
    "Bathua / chaulai (amaranth) leaves"
  ],
  "usedIn": [
    {
      "dishNumber": 17,
      "quantity": 150,
      "unit": "g",
      "raw": "150 g leaves (about 220 g as bought, with stems; ½ medium bunch)"
    }
  ],
  "versions": [
    {
      "date": "2026-10-07",
      "file": "FitPlate_Ingredients_2026-10-07.md"
    }
  ],
  "mergeMethod": {
    "price": "price engine (single)",
    "macrosPer100Estimate": "stable (single)",
    "aliases": "union",
    "substitutes": "union",
    "storage": "newest",
    "usedIn": "newest"
  },
  "mergeNotes": [
    "price flag: narrowed",
    "Range 40.0–70.0 was wider than 30% of avg 55.0; narrowed to ±15%."
  ]
}
```

### `src/data/research/exercises/glute-bridge.json`

```json
{
  "id": "glute-bridge",
  "number": 4,
  "name": "Glute bridge",
  "otherNames": [
    "Hip bridge",
    "Floor bridge",
    "Supine bridge",
    "Bridging",
    "Two-leg bridge",
    "Marching bridge",
    "Single-leg bridge"
  ],
  "section": "home",
  "type": "strength",
  "equipment": [],
  "noEquipmentAlternative": "No equipment needed; use a folded bedsheet or towel instead of a mat on hard floors. Can be done on a firm bed.",
  "musclesPrimary": [
    "gluteus maximus",
    "gluteus medius (single-leg version)"
  ],
  "musclesSecondary": [
    "hamstrings (biceps femoris, semitendinosus, semimembranosus)",
    "adductor magnus",
    "erector spinae",
    "transversus abdominis",
    "obliques"
  ],
  "level": "beginner",
  "impact": "low",
  "flatFriendly": true,
  "met": 3.5,
  "compendiumCode": "02030",
  "metOptions": [
    {
      "code": "02030",
      "met": 3.5,
      "activity": "MET: 3.5 (est.). The 2024 Adult Compendium of Physical Activities has no entry that names the glute bridge. The closest is code 02030, \"calisthenics, light or moderate effort, general (e.g., back exer"
    },
    {
      "code": "02024",
      "met": 2.8,
      "activity": "MET: 3.5 (est.). The 2024 Adult Compendium of Physical Activities has no entry that names the glute bridge. The closest is code 02030, \"calisthenics, light or moderate effort, general (e.g., back exer"
    },
    {
      "code": "02022",
      "met": 3.8,
      "activity": "MET: 3.5 (est.). The 2024 Adult Compendium of Physical Activities has no entry that names the glute bridge. The closest is code 02030, \"calisthenics, light or moderate effort, general (e.g., back exer"
    }
  ],
  "prescriptions": [
    {
      "level": "beginner",
      "goal": "general_fitness",
      "sets": 3,
      "reps": "10-12 two-leg bridges",
      "timeSec": null,
      "restSec": 45,
      "tempo": "2 s up, 1 s hold, 2 s down",
      "perWeek": 3
    },
    {
      "level": "beginner",
      "goal": "fat_loss",
      "sets": 3,
      "reps": "10-12 two-leg bridges (as one circuit station)",
      "timeSec": null,
      "restSec": 30,
      "tempo": "2 s up, 1 s hold, 2 s down",
      "perWeek": 3
    },
    {
      "level": "beginner",
      "goal": "muscle",
      "sets": 3,
      "reps": "10-12 two-leg bridges with 2 s squeeze",
      "timeSec": null,
      "restSec": 60,
      "tempo": "2 s up, 2 s hold, 2 s down",
      "perWeek": 3
    },
    {
      "level": "beginner",
      "goal": "strength",
      "sets": 3,
      "reps": "8-10 two-leg bridges with 5 s hold",
      "timeSec": 5,
      "restSec": 60,
      "tempo": "2 s up, 5 s hold, 2 s down",
      "perWeek": 3
    },
    {
      "level": "beginner",
      "goal": "endurance",
      "sets": 2,
      "reps": "15-20 two-leg bridges",
      "timeSec": null,
      "restSec": 30,
      "tempo": "2 s up, 1 s hold, 2 s down",
      "perWeek": 3
    },
    {
      "level": "intermediate",
      "goal": "general_fitness",
      "sets": 3,
      "reps": "8-10 marches per side (marching bridge)",
      "timeSec": null,
      "restSec": 45,
      "tempo": "hold bridge, 1-2 s per march",
      "perWeek": 3
    },
    {
      "level": "intermediate",
      "goal": "muscle",
      "sets": 3,
      "reps": "8-12 single-leg bridges per side",
      "timeSec": null,
      "restSec": 60,
      "tempo": "2 s up, 2 s hold, 3 s down",
      "perWeek": 3
    },
    {
      "level": "intermediate",
      "goal": "strength",
      "sets": 3,
      "reps": "6-8 single-leg bridges per side with 3-5 s hold",
      "timeSec": 5,
      "restSec": 90,
      "tempo": "2 s up, 3-5 s hold, 3 s down",
      "perWeek": 2
    },
    {
      "level": "intermediate",
      "goal": "endurance",
      "sets": 3,
      "reps": "20-25 two-leg bridges",
      "timeSec": null,
      "restSec": 45,
      "tempo": "2 s up, 1 s hold, 2 s down",
      "perWeek": 3
    },
    {
      "level": "advanced",
      "goal": "general_fitness",
      "sets": 3,
      "reps": "12-15 single-leg bridges per side",
      "timeSec": null,
      "restSec": 45,
      "tempo": "2 s up, 1 s hold, 2 s down",
      "perWeek": 3
    },
    {
      "level": "advanced",
      "goal": "muscle",
      "sets": 4,
      "reps": "8-12 weighted bridges or shoulder-elevated hip thrusts",
      "timeSec": null,
      "restSec": 90,
      "tempo": "2 s up, 1 s hold, 3 s down",
      "perWeek": 2
    },
    {
      "level": "advanced",
      "goal": "strength",
      "sets": 4,
      "reps": "5-8 heavy weighted bridges or hip thrusts",
      "timeSec": null,
      "restSec": 120,
      "tempo": "controlled up, 1 s hold, 3 s down",
      "perWeek": 2
    },
    {
      "level": "advanced",
      "goal": "endurance",
      "sets": 3,
      "reps": "15-20 single-leg bridges per side",
      "timeSec": null,
      "restSec": 45,
      "tempo": "2 s up, 1 s hold, 2 s down",
      "perWeek": 3
    }
  ],
  "cardioSettings": null,
  "repCounter": {
    "mode": "reps",
    "cameraView": "side",
    "landmarks": [
      "nose",
      "left_shoulder",
      "right_shoulder",
      "left_hip",
      "right_hip",
      "left_knee",
      "right_knee",
      "left_ankle",
      "right_ankle",
      "left_heel",
      "right_heel",
      "left_foot_index",
      "right_foot_index"
    ],
    "phases": [
      {
        "name": "bottom",
        "joint": "hip (shoulder-hip-knee)",
        "angleDeg": "<= 145",
        "parsed": {
          "op": "<=",
          "value": 145,
          "max": null
        }
      },
      {
        "name": "top",
        "joint": "hip (shoulder-hip-knee)",
        "angleDeg": ">= 165",
        "parsed": {
          "op": ">=",
          "value": 165,
          "max": null
        }
      },
      {
        "name": "top_target",
        "joint": "hip (shoulder-hip-knee)",
        "angleDeg": "170-185",
        "parsed": {
          "op": "between",
          "value": 170,
          "max": 185
        }
      },
      {
        "name": "all_phases",
        "joint": "knee (hip-knee-ankle)",
        "angleDeg": "70-110",
        "parsed": {
          "op": "between",
          "value": 70,
          "max": 110
        }
      }
    ],
    "minRepSec": 1.5
  },
  "formChecks": [
    {
      "joint": "hip",
      "rule": "top hip angle < 160 degrees",
      "message": "Lift a little higher: knees, hips, shoulders in a line"
    },
    {
      "joint": "hip",
      "rule": "hip angle > 195 degrees or hip well above shoulder-knee line",
      "message": "Too high: ribs down, squeeze your buttocks"
    },
    {
      "joint": "knee",
      "rule": "knee angle at top > 115 degrees",
      "message": "Walk your feet closer"
    },
    {
      "joint": "knee",
      "rule": "knee angle at top < 65 degrees",
      "message": "Move your feet a little further away"
    },
    {
      "joint": "ankle",
      "rule": "heel landmark rises above foot-index landmark beyond margin",
      "message": "Keep your heels down"
    },
    {
      "joint": "hip",
      "rule": "rep duration < 1.5 s or lowering < 1 s",
      "message": "Slow down: 2 seconds up, 2 down"
    },
    {
      "joint": "knee",
      "rule": "front view: knee distance smaller than ankle distance beyond margin",
      "message": "Knees over your toes"
    },
    {
      "joint": "hip",
      "rule": "single-leg, front view: left and right hip heights differ beyond margin",
      "message": "Keep your hips level"
    }
  ],
  "safetyFlags": [
    "pregnancy_after_first_trimester_avoid_lying_flat",
    "postpartum_get_clearance_first",
    "acute_low_back_pain_use_small_range",
    "uncontrolled_high_blood_pressure_breathe_continuously",
    "neck_problems_keep_weight_on_upper_back",
    "recent_hip_spine_abdominal_or_knee_surgery",
    "hamstring_injury_avoid_single_leg"
  ],
  "progressions": [
    "longer top hold (5-10 s)",
    "marching bridge",
    "single-leg bridge",
    "band-around-knees bridge",
    "feet-elevated bridge",
    "weighted bridge",
    "shoulder-elevated hip thrust"
  ],
  "regressions": [
    "pelvic tilt / small-range bridge",
    "partial-range bridge",
    "short isometric holds (3-5 s)",
    "bridge on a firm bed"
  ],
  "videoShots": [
    {
      "seconds": 8,
      "angle": "side, floor level, 2 m",
      "shows": "setup: lying, knees bent, feet hip-width, heels 15-20 cm from buttocks",
      "textOverlay": "Feet hip-width, heels close"
    },
    {
      "seconds": 6,
      "angle": "overhead, 1.5 m",
      "shows": "foot placement, toes forward",
      "textOverlay": "Toes forward"
    },
    {
      "seconds": 8,
      "angle": "side, floor level, 2 m",
      "shows": "brace, squeeze, lift to straight line, hold, lower slowly",
      "textOverlay": "Squeeze, then lift. Knees-hips-shoulders in a line."
    },
    {
      "seconds": 6,
      "angle": "side, split screen",
      "shows": "too low vs arched vs correct",
      "textOverlay": "Too low / Arched / Correct"
    },
    {
      "seconds": 6,
      "angle": "front from feet end, floor level, 2 m",
      "shows": "knees over toes vs knees caving",
      "textOverlay": "Knees over toes"
    },
    {
      "seconds": 8,
      "angle": "front from feet end, 2 m",
      "shows": "marching bridge with level hips",
      "textOverlay": "Hips stay level"
    },
    {
      "seconds": 8,
      "angle": "side, floor level, 2 m",
      "shows": "single-leg bridge lift and lower",
      "textOverlay": "Push through the heel"
    },
    {
      "seconds": 6,
      "angle": "close-up, 1 m",
      "shows": "heels down vs heels lifting; feet closer for hamstring cramp",
      "textOverlay": "Heels heavy. Cramping? Feet closer."
    }
  ],
  "lastResearched": "2026-10-15",
  "setupSteps": [
    "Clear a strip of floor about 1.8 m x 0.8 m (est.). Make sure nothing sharp is near your head or feet.",
    "Lay the mat lengthwise. On a hard floor, add a folded towel under the upper back.",
    "Lie on your back with your head on the mat. A thin folded towel under the head is fine if your neck feels strained, but not a thick pillow.",
    "Bend both knees and put your feet flat on the floor.",
    "Foot width: feet hip-width apart, toes pointing forward (NASM).",
    "Foot distance: heels about 15–20 cm (6–8 inches) from your buttocks (NASM). A quick check: when you lift your hips, your shins should be close to vertical, with the knees above the ankles (NASM floor bridge: feet directly under the knees at the top). Some NHS sheets say \"feet close to the buttocks\".",
    "Arms: lie them on the floor at your sides, palms down, about 30–45 degrees from your body (est.). They give light support; do not push hard through them.",
    "Spine: let your lower back rest in its natural position. There may be a small gap under the lower back. Do not force it flat or arch it.",
    "Head and eyes: look straight up at the ceiling. Do not turn the head while lifting.",
    "Clothing: fitted track pants or leggings so you (and the camera) can see your hip and knee line."
  ],
  "steps": [
    {
      "n": 1,
      "part": "A. Two-leg glute bridge (main version)",
      "title": "Press the feet into the floor",
      "action": "Spread your weight evenly through each whole foot, like a tripod (big-toe joint, little-toe joint and heel). Keep the heels down.",
      "feel": "Light pressure through the heels and the balls of the feet.",
      "breathing": "Breathe in normally.",
      "tempo": null,
      "visualCheck": "Side: heels flat on the floor, toes not lifted. Front: feet hip-width, toes forward."
    },
    {
      "n": 2,
      "part": "A. Two-leg glute bridge (main version)",
      "title": "Brace the stomach",
      "action": "Gently tighten your stomach, as if you were about to cough. Do not suck it in hard.",
      "feel": "A light firmness around the waist; your lower ribs stay down.",
      "breathing": "Start a slow breath out.",
      "tempo": null,
      "visualCheck": "Side: lower ribs do not flare up toward the ceiling."
    },
    {
      "n": 3,
      "part": "A. Two-leg glute bridge (main version)",
      "title": "Squeeze the buttocks",
      "action": "Squeeze your buttocks together before your hips leave the floor (NHS and NASM both cue the squeeze first).",
      "feel": "Your buttocks tighten while you are still lying down.",
      "breathing": "Continue breathing out.",
      "tempo": null,
      "visualCheck": "The pelvis may tilt very slightly (tail bone curls up a little); nothing else moves."
    },
    {
      "n": 4,
      "part": "A. Two-leg glute bridge (main version)",
      "title": "Lift the hips",
      "action": "Push through your feet and lift your hips off the floor until your body forms a straight line from your knees through your hips to your shoulders (NASM).",
      "feel": "The work is mostly in the buttocks, with some in the back of the thighs. No pinch in the lower back.",
      "breathing": "Breathe out as you lift (Mayo Clinic).",
      "tempo": null,
      "visualCheck": "Side: straight line from knee to hip to shoulder; shins close to vertical; weight on the upper back and shoulders, not on the neck. Front: knees stay hip-width (not falling in or flaring out); hips level."
    },
    {
      "n": 5,
      "part": "A. Two-leg glute bridge (main version)",
      "title": "Hold at the top",
      "action": "Keep squeezing the buttocks. Do not push the hips higher than the straight line.",
      "feel": "Strong squeeze in the buttocks; stomach lightly braced.",
      "breathing": "Keep breathing; do not hold your breath. On longer holds, breathe slowly in and out.",
      "tempo": null,
      "visualCheck": "Side: hips do not sag below the line or rise above it (no arch in the lower back). Front: pelvis level, knees still in line with the feet."
    },
    {
      "n": 6,
      "part": "A. Two-leg glute bridge (main version)",
      "title": "Lower with control",
      "action": "Slowly lower your hips back to the floor, putting your back down from the upper back to the tail bone.",
      "feel": "Buttocks still working as they control the lowering.",
      "breathing": "Breathe in as you lower.",
      "tempo": null,
      "visualCheck": "No dropping or bouncing off the floor."
    },
    {
      "n": 7,
      "part": "A. Two-leg glute bridge (main version)",
      "title": "Reset",
      "action": "Let the buttocks touch the floor lightly, relax for a moment, check your feet have not slid away, then start the next rep.",
      "feel": null,
      "breathing": "One easy breath.",
      "tempo": null,
      "visualCheck": "Feet still in the start spot."
    },
    {
      "n": 8,
      "part": "B. Marching bridge (first progression)",
      "title": "Lift into the two-leg bridge (steps 1–5 above)",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 9,
      "part": "B. Marching bridge (first progression)",
      "title": "Keeping the hips level, lift one foot a few centimetres off the floor, knee still bent. Feel the standing-side buttock work harder. Breathe out as the foot lifts. About 1–2 seconds",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 10,
      "part": "B. Marching bridge (first progression)",
      "title": "Put the foot back down. Breathe in",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 11,
      "part": "B. Marching bridge (first progression)",
      "title": "Repeat with the other foot. Visual check (front): the hips do not drop or twist toward the lifted leg",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 12,
      "part": "B. Marching bridge (first progression)",
      "title": "Lower the hips after the planned number of marches",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 13,
      "part": "C. Single-leg bridge (harder progression)",
      "title": "From the setup position, straighten one leg (or lift it with the knee bent, pulled gently toward the chest, as in ACE's single-leg progression). Keep both thighs level with each other",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 14,
      "part": "C. Single-leg bridge (harder progression)",
      "title": "Brace the stomach and squeeze the buttock on the side of the foot that is on the floor",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 15,
      "part": "C. Single-leg bridge (harder progression)",
      "title": "Push through the heel on the floor and lift the hips until the line from the knee through the hip to the shoulder is straight. Breathe out. About 2 seconds",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 16,
      "part": "C. Single-leg bridge (harder progression)",
      "title": "Hold 1–2 seconds. The pelvis must stay level (NHS: keep the pelvis \"as level as possible\"; no dropping or rotating)",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 17,
      "part": "C. Single-leg bridge (harder progression)",
      "title": "Lower in 2–3 seconds. Breathe in",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    },
    {
      "n": 18,
      "part": "C. Single-leg bridge (harder progression)",
      "title": "Finish all reps on one side, then switch. Do the same number on each side",
      "action": null,
      "feel": null,
      "breathing": null,
      "tempo": null,
      "visualCheck": null
    }
  ],
  "commonMistakes": [
    {
      "title": "Arching the lower back at the top (lifting too high)",
      "text": "Arching the lower back at the top (lifting too high). Why: the lower back muscles take over and the joints at the back of the spine are pinched, while the buttocks do less. Fix: stop when the knee–hip–shoulder line is straight; keep the ribs down and buttocks squeezed. If you feel the lower back, lower a little."
    },
    {
      "title": "Hamstring cramp or doing it all with the back of the thigh",
      "text": "Hamstring cramp or doing it all with the back of the thigh. Why: feet are usually too far from the buttocks, which makes the hamstrings do more (EMG shows hamstring activity rises as the knee straightens). Fix: walk the feet 2–5 cm (est.) closer and push through the heels. Some hamstring work is normal."
    },
    {
      "title": "Pushing through the toes (heels lifting)",
      "text": "Pushing through the toes (heels lifting). Why: shifts work to the front of the thighs and calves. Fix: whole-foot tripod with heels heavy."
    },
    {
      "title": "Knees falling in or flaring out",
      "text": "Knees falling in or flaring out. Why: reduces side-hip work and can strain the knees. Fix: knees over the second toe, hip-width; a cushion or rolled towel held lightly between the knees can help you feel the line (note: squeezing between the knees, hip adduction, increased hamstring and back activity in one Korean study, so keep the squeeze light)."
    },
    {
      "title": "Rushing and bouncing the hips off the floor",
      "text": "Rushing and bouncing the hips off the floor. Why: momentum does the work and the top squeeze is skipped. Fix: 2 seconds up, 1–2 seconds hold, 2–3 seconds down."
    },
    {
      "title": "Holding the breath",
      "text": "Holding the breath. Why: breath-holding raises blood pressure (a concern for people with high blood pressure or heart disease). Fix: breathe out on the way up, in on the way down."
    },
    {
      "title": "Single-leg version: hips dropping or twisting toward the lifted leg",
      "text": "Single-leg version: hips dropping or twisting toward the lifted leg. Why: the target side-hip muscles are not doing their job and the lower back twists. Fix: lower the hips a little, slow down, or go back to the marching bridge."
    },
    {
      "title": "Pushing with the arms or head",
      "text": "Pushing with the arms or head. Why: strains the neck and shoulders and makes the hips work less. Fix: arms relaxed; eyes up."
    }
  ],
  "safetyNotes": [
    "Lower back problems: usually included in physiotherapy back programmes, but lift only to a straight line, never into an arch, and use the small-range version during a flare-up. Stop if pain spreads down a leg.",
    "Pregnancy: after the first trimester, ACOG-based guidance commonly advises avoiding exercises lying flat on the back, because the womb can press on the large blood vessels and cause dizziness or low blood pressure. Some sources describe short supine periods as acceptable if the person feels well. FitPlate default: avoid after the first trimester; swap to standing hip exercises (see section 13).",
    "Postpartum: pelvic floor exercises can usually start early; bridges are a common gentle postnatal exercise, but get clearance from your midwife, GP or pelvic-health physiotherapist first, especially after a caesarean.",
    "High blood pressure and heart disease: breathe continuously; avoid long, maximal-effort holds; get clearance if blood pressure is uncontrolled.",
    "Neck problems: keep the weight on the upper back, not the neck; do not lift so high that the neck bends forward.",
    "Recent hip, spine, abdominal or knee surgery: only with your surgeon's or physiotherapist's approval.",
    "Hamstring injury: single-leg and feet-far versions load the hamstrings more; keep feet close and use the two-leg version."
  ],
  "sources": [
    "ACE Fitness, Exercise Library: Glute Bridge (and Glute Bridge Single Leg Progression). https://www.acefitness.org/resources/everyone/exercise-library/57/glute-bridge/",
    "NASM, How to do a glute bridge (setup: feet hip-width, heels 6–8 in from glutes; straight line knees to shoulders; Phase 1 2 x 12). https://blog.nasm.org/how-to-do-a-glute-bridge",
    "NASM, Exercise library: Floor Bridge. https://www.nasm.org/resource-center/exercise-library/floor-bridge",
    "NASM, Why the glute bridge belongs in almost every client program. https://www.nasm.org/resource-center/blog/training/why-the-glute-bridge-belongs-in-almost-every-client-program",
    "Mayo Clinic, Video: The glutes exercise you need to know about. https://mayoclinic.org/connected-care/the-glutes-exercise-you-need-to-know-about/vid-20307390",
    "Mayo Clinic Care Network, Video: Bridge with fitness ball. https://www.mymlc.com/health-information/videos/fitness/strength-training/core-exercises/video-bridge-with-fitness-ball/",
    "Harvard Health Publishing, More strengthening exercises (bridge muscles). https://www.health.harvard.edu/newsletter_article/more_strengthening_exercises",
    "Wrightington, Wigan and Leigh NHS Teaching Hospitals, Low Back Pain Exercises leaflets (levels 1–2). https://www.wwl.nhs.uk/media/.leaflets/6214e7c8e2e1f0.63708939.pdf ; https://www.wwl.nhs.uk/pdfreader/cnv-wwl-68ca8bceac0271.70461764",
    "NHS Fife, Back pain advice (bridge, 10 s hold x 10). https://www.nhsfife.org/media/33403/back-pain-advice-updated-21052020.pdf",
    "2024 Adult Compendium of Physical Activities (Herrmann et al., J Sport Health Sci 2024): activity list and Conditioning Exercise page (codes 02030, 02024, 02022). https://pacompendium.com/wp-content/uploads/2024/02/1_2024-adult-compendium_1_2024.pdf ; https://pacompendium.com/conditioning-exercise/ ; https://pubmed.ncbi.nlm.nih.gov/38242596/",
    "Gluteal EMG review table (2014), %MVIC for double- and single-limb bridge. https://pmc.ncbi.nlm.nih.gov/articles/PMC4004121/table/T2",
    "Lehecka BJ et al. (2017), single-leg bridge at 90 vs 135 degrees knee flexion, gluteal and hamstring EMG. https://pmc.ncbi.nlm.nih.gov/articles/PMC5534144/",
    "Supine unilateral bridge vs resisted hip extension EMG (Brookbush Institute summary). https://brookbushinstitute.com/articles/electromyographic-analysis-of-gluteus-maximus-and-hamstring-activity-during-the-supine-resisted-hip-extension-exercise-versus-supine-unilateral-bridge-to-neutral",
    "Colonna S et al. (2025), Supine Bridge Exercise: A Narrative Review of the Literature (Part I), Cureus. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11981018/",
    "Colonna S et al. (2025), Supine Bridge Exercise for Low Back Pain (Part II), Cureus. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12145699/",
    "Ojoawo AO et al. (2021), bridging vs V-sitting in chronic low back pain, Eur J Clin Exp Med. https://journals.ur.edu.pl/ejcem/article/view/11886",
    "Hip adduction/abduction during bridging EMG (Brookbush Institute summary of Korean study). https://brookbushinstitute.com/articles/hip-abduction-increased-glute-max-activation-in-bridging-exercise",
    "Contreras B et al. (2015), barbell hip thrust vs back squat EMG. https://ro.ecu.edu.au/ecuworkspost2013/1592",
    "ACSM (Zaleski), exercise for hypertension. https://acsm.org/?p=18319",
    "Colberg SR et al. (2016) ADA position statement, key points. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5317029/",
    "ACC summary of the 2023 AHA scientific statement on resistance exercise training. https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2023/12/19/15/33/resistance-exercise-training",
    "Patient Care Online, AHA 2007 statement on resistance training for cardiac patients. https://www.patientcareonline.com/view/aha-says-weight-training-may-benefit-cardiac-patients",
    "AHA Professional, Physical activity as first-line treatment for elevated BP or cholesterol (Gibbs et al.). https://professional.heart.org/en/science-news/Physical-Activity-as-a-Critical-Component-of-First-Line-Treatment-for-Elevated-BP-or-Cholesterol/commentary",
    "Donnelly JE et al. (2009), ACSM position stand on physical activity for weight loss. https://pubmed.ncbi.nlm.nih.gov/19127177/",
    "Exercise in the management of PCOS: position statement / 2023 guideline evidence review. https://vuir.vu.edu.au/45855/1/1-s2.0-S2772696723000054-main.pdf",
    "Effect of physical exercise in people with hypothyroidism: systematic review and meta-analysis (2023). https://pubmed.ncbi.nlm.nih.gov/37999992/",
    "WebMD, Exercises for underactive thyroid (quoting Mayo Clinic endocrinologist). https://www.webmd.com/women/features/exercises-underactive-thyroid",
    "Pharmacy Magazine CPD, Exercise and asthma. https://www.pharmacymagazine.co.uk/cpd-modules/making-a-difference-in-asthma-care/exercise-and-asthma-528343",
    "Pure Physiotherapy, Knee osteoarthritis intermediate/advanced programmes (hip bridge, single-leg bridge). https://purephysiotherapy.co.uk/exercise-plans/intermediate-knee-osteoarthritis-exercise-programme/",
    "Covenant Health (Alberta), Osteoporosis strengthening exercises: lower extremity (2024). https://covenanthealth.ca/sites/default/files/2024-08/osteoporosis-strengthening-exercises-lower-extremity.pdf",
    "ACOG Committee Opinion No. 804 (2020), Physical activity and exercise during pregnancy and the postpartum period (abstract record). https://opqic.org/acog-committee-opinion-no-804-physical-activity-and-exercise-during-pregnancy-and-the-postpartum-period/",
    "Riverview Health, Pregnancy exercise (summarising ACOG guidance on lying on the back). https://riverview.org/sites/womens/article/pregnancy-exercise",
    "OB/GYN Project, exercise in pregnancy (supine position after 20 weeks). https://www.obgproject.com/tag/exercise-pregnancy/",
    "Norfolk and Norwich University Hospitals NHS, Post-natal physiotherapy advice and exercises. https://www.nnuh.nhs.uk/publication/download/post-natal-physiotherapy-advice-and-exercises-v2-1",
    "Royal Devon University Healthcare NHS, Postnatal physiotherapy advice. https://www.royaldevon.nhs.uk/media/ibneih1b/patient-information-leaflet-postnatal-physiotherapy-advice-rde-20-143-001.pdf",
    "Livestrong, 7 glute bridge mistakes (coaching cues; lower-evidence source). https://livestrong.com/article/13730397-glute-bridge-exercise-mistakes",
    "arXiv (2023), pose-based repetition counting limitations (viewpoint). https://arxiv.org/html/2308.08632v2"
  ],
  "burnMinutes": {
    "per100kcal": {
      "60kg": 28.6,
      "70kg": 24.5,
      "80kg": 21.4
    },
    "per300kcal": {
      "60kg": 85.7,
      "70kg": 73.5,
      "80kg": 64.3
    }
  },
  "gymAccess": [
    "none",
    "home_equipment",
    "basic_gym",
    "full_gym"
  ],
  "suitsPreferences": [
    "strength",
    "mobility",
    "yoga",
    "beginner",
    "small_flat",
    "neighbours_below",
    "short_sessions",
    "back_care",
    "warm_up"
  ],
  "swapsByAccess": {
    "none": "Bodyweight squat (Home 1) or standing hip extension holding a chair",
    "home_equipment": "Dumbbell Romanian deadlift (Home 16) or resistance band squat and lateral walk (Home 24)",
    "basic_gym": "Bench hip thrust (Gym 17) or standing cable/band glute kickback",
    "full_gym": "Hip thrust machine or barbell hip thrust (Gym 17); standing option: hip abductor machine (Gym 18) or leg press (Gym 10)"
  },
  "conditionCautions": [
    {
      "condition": "hypertension",
      "status": "modify",
      "change": "Breathe out on lift, no breath-holding, short top holds, moderate effort; uncontrolled BP needs clearance",
      "source": "ACSM hypertension exercise guidance"
    },
    {
      "condition": "type2_diabetes",
      "status": "ok",
      "change": "Use on 2-3 non-consecutive resistance days per week; usual glucose checks if on insulin or sulfonylureas",
      "source": "ADA position statement, Colberg et al. 2016"
    },
    {
      "condition": "heart_disease",
      "status": "ask_doctor",
      "change": "After clearance: 1 set of 10-15 light reps, rhythmic breathing, no straining",
      "source": "AHA resistance exercise statements (2007, 2023)"
    },
    {
      "condition": "high_cholesterol",
      "status": "ok",
      "change": "Part of 2+ days/week resistance work with aerobic activity",
      "source": "AHA scientific statement (Gibbs et al.)"
    },
    {
      "condition": "obesity",
      "status": "ok",
      "change": "Thicker mat; get down and up via side-lying and kneeling; pair with aerobic work",
      "source": "ACSM weight management position stand (Donnelly et al. 2009)"
    },
    {
      "condition": "pcos",
      "status": "ok",
      "change": "Fits muscle-strengthening guidance; no bridge-specific advice found",
      "source": "International PCOS guideline 2023 / exercise position statement"
    },
    {
      "condition": "thyroid",
      "status": "ok",
      "change": "Train normally if controlled; start at beginner level with ongoing fatigue",
      "source": "Systematic review 2023 (PubMed 37999992)"
    },
    {
      "condition": "asthma",
      "status": "ok",
      "change": "Low intensity; warm up and keep reliever inhaler nearby",
      "source": "Asthma exercise guidance (Pharmacy Magazine CPD citing Asthma UK)"
    },
    {
      "condition": "knee_pain",
      "status": "ok",
      "change": "Hip strengthening is part of knee OA programmes; keep feet close enough that knees do not ache",
      "source": "Physiotherapy knee OA exercise programmes"
    },
    {
      "condition": "lower_back_pain",
      "status": "modify",
      "change": "Lift only to straight line, never arch; small-range version in flare; stop with leg pain",
      "source": "NHS physiotherapy low back pain sheets; Ojoawo et al. 2021"
    },
    {
      "condition": "shoulder_problems",
      "status": "ok",
      "change": "Little shoulder load; arms relaxed at sides (no condition-specific source found)",
      "source": "Not found"
    },
    {
      "condition": "osteoporosis",
      "status": "ok",
      "change": "5-10 reps, 3x/week; lower slowly; avoid adding rounded-back moves",
      "source": "Covenant Health osteoporosis strengthening handout 2024"
    },
    {
      "condition": "pregnancy",
      "status": "modify",
      "change": "After first trimester avoid lying flat on back; swap to standing hip exercises; ask obstetrician",
      "source": "ACOG Committee Opinion 804 / ACOG FAQ (secondary citations)"
    },
    {
      "condition": "postpartum",
      "status": "modify",
      "change": "Pelvic floor work first; gentle bridges once cleared, especially after caesarean",
      "source": "NHS postnatal physiotherapy leaflets (NNUH, Royal Devon)"
    },
    {
      "condition": "recent_surgery",
      "status": "ask_doctor",
      "change": "Only with surgeon or physiotherapist approval",
      "source": "Not found"
    }
  ],
  "searchTags": {
    "location": [
      "home",
      "gym"
    ],
    "bodyRegion": [
      "lower",
      "core"
    ],
    "goalTags": [
      "general_fitness",
      "muscle",
      "strength",
      "endurance"
    ],
    "intensity": "light",
    "noise": "quiet",
    "space": "mat_only",
    "typicalMinutes": 5,
    "kcalPer10min70kg": 41,
    "difficulty1to5": 1,
    "cameraTrackable": true
  },
  "tags": [
    "Home",
    "Gym",
    "No equipment",
    "Flat-friendly",
    "Quiet",
    "Beginner",
    "Low impact",
    "Strength",
    "Glutes",
    "Rep counter",
    "Under 10 min"
  ],
  "needsReview": [
    "rep_counter phase \"top_target\" (hip (shoulder-hip-knee)): angle \"170-185\" is above 180°, which an unsigned three-point angle can't reach",
    "form check \"hip angle > 195 degrees or hip well above shoulder-knee line\": angle 195 is above 180°, which an unsigned three-point angle can't reach"
  ],
  "versions": [
    {
      "date": "2026-10-15",
      "file": "FitPlate_Fitness_2026-10-15.md"
    }
  ],
  "mergeMethod": {
    "met": "single",
    "instructions": "single",
    "repCounterThresholds": "single",
    "lists": "union",
    "safety": "union (never dropped)",
    "description": "newest"
  },
  "mergeNotes": []
}
```


## 8. CODE FILES

| Path | NEW or CHANGED | Purpose |
|---|---|---|
| `src/services/search.ts` | NEW | Shared search, filter and sort engine (SPEC-ADDENDA §9) |
| `src/services/dishLibrary.ts` | NEW | Dish library facets: search doc, filter groups, sorts, card chips, price headline |
| `src/services/rememberedFilters.ts` | NEW | Innovation: remembered allergen exclusions per owner on the device |
| `src/components/dishes/DishLibrary.tsx` | NEW | Cook tab library screen with filter and sort sheets |
| `src/components/dishes/ResearchDishCard.tsx` | NEW | Library card (facts, chips, separate scores) |
| `src/components/dishes/parts.tsx` | NEW | Image slot placeholder, tag chip, selectable chip |
| `src/app/recipe/[id].tsx` | NEW | Research dish page (start of the Day 7 detail screen) |
| `src/app/(tabs)/cook.tsx` | CHANGED | Cook tab shows the research library when researchData is on |
| `src/app/_layout.tsx` | CHANGED | recipe/[id] route |
| `src/config/featureFlags.ts` | CHANGED | researchData ON; rememberAllergens ON |
| `src/services/data/priceChecks.ts` | NEW | Review fix 2: listing table reader and price check |
| `src/services/data/dishImporter.ts` | CHANGED | Order price listings, platforms, stated average and median |
| `src/services/data/ingredientImporter.ts` | CHANGED | Ingredient price listings and platforms |
| `src/services/data/buildItems.ts` | CHANGED | Runs the price check on dishes and ingredients |
| `src/services/data/nutrientImporter.ts` | CHANGED | Review fix 1: doctor-input default and fluid note |
| `src/services/data/tags.ts` | CHANGED | Review fix 3: union-find families; Pescatarian chip on seafood only |
| `src/services/data/crossLinks.ts` | CHANGED | Alias stoplist: preparation words |
| `src/models/research.ts` | CHANGED | PriceCheck fields on PriceEstimate |
| `src/models/nutrient.ts` | CHANGED | requiresDoctorInputStated, fluidNote |
| `src/__tests__/services/search.test.ts` | NEW | Search engine tests |
| `src/__tests__/services/dishLibrary.test.ts` | NEW | Dish library tests on the bundled data |
| `src/__tests__/services/rememberedFilters.test.ts` | NEW | Remembered allergen filter tests |
| `src/__tests__/data/priceChecks.test.ts` | NEW | Price check tests (14) |
| `src/__tests__/data/nutrients.test.ts` | CHANGED | Doctor-input default tests (5 new) |
| `src/__tests__/data/tags.test.ts` | CHANGED | Family union and Pescatarian chip tests |
| `src/__tests__/data/crossLinks.test.ts` | CHANGED | Alias stoplist test |
| `src/__tests__/data/importers.test.ts` | CHANGED | Fixtures for the new price fields |
| `src/__tests__/config.test.ts` | CHANGED | researchData and rememberAllergens are finished flags |


### `src/services/search.ts`

```ts
/**
 * Shared search, filter and sort rules (SPEC-ADDENDA §9). Pure functions, so
 * every library (dishes on Day 6, nutrients on Day 18, exercises on Day 21, the
 * Track tab on Day 29) ranks and filters the same way.
 *
 * - Text search matches names, aliases (Indian names), tags and ingredients,
 *   and tolerates small spelling slips ("brhiyani" → biryani).
 * - Filters are groups of multi-select chips. Inside a group any chip may
 *   match ("Breakfast" or "Lunch"); across groups every group must match.
 *   An "exclude" group (allergens) drops items that have any chosen chip.
 */

/** What the search engine reads from an item. Each library builds one per item. */
export type SearchDoc = {
  id: string;
  name: string;
  /** Other names, e.g. "kanda" for onion or "Chana Masala" for Chole. */
  aliases?: string[];
  tags?: string[];
  /** Ingredient names, muscle groups or anything else worth matching weakly. */
  extra?: string[];
};

/** Lower-case, strip accents and punctuation, collapse spaces. */
export function normalise(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function words(text: string): string[] {
  const n = normalise(text);
  return n ? n.split(' ') : [];
}

/**
 * Optimal string alignment distance (Levenshtein plus swapping two neighbours),
 * stopped early once it is clearly above `max`.
 */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) rows.push([i]);
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, rows[i - 2][j - 2] + 1);
      rows[i][j] = v;
      best = Math.min(best, v);
    }
    if (best > max) return max + 1;
  }
  return rows[a.length][b.length];
}

/** How many slips a typed word may have: none for short words, more for long ones. */
export function allowedSlips(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 5) return 1;
  return 2;
}

/**
 * A rough sound-alike form for Indian dish and ingredient names, which are
 * spelt many ways in English: "h" after a consonant is dropped (brhiyani,
 * dhal), "ee"/"oo" become "i"/"u" (paneer → panir), doubled letters collapse,
 * and "w" becomes "v" (kawa → kava).
 */
export function soundAlike(word: string): string {
  return word
    .replace(/([bcdgjkprt])h/g, '$1')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/w/g, 'v')
    .replace(/(.)\1+/g, '$1');
}

/** 1 exact, 0.85 prefix, 0.6 inside the word, 0.5 within the allowed slips, else 0. */
export function wordMatch(query: string, target: string): number {
  if (target === query) return 1;
  if (target.startsWith(query)) return 0.85;
  if (query.length >= 3 && target.includes(query)) return 0.6;
  const slips = allowedSlips(query);
  if (slips > 0) {
    if (editDistance(query, target, slips) <= slips) return 0.5;
    if (editDistance(soundAlike(query), soundAlike(target), slips) <= slips) return 0.5;
  }
  return 0;
}

function bestWord(query: string, targetWords: string[]): number {
  let best = 0;
  for (const t of targetWords) {
    const s = wordMatch(query, t);
    if (s > best) best = s;
    if (best === 1) break;
  }
  return best;
}

/** Weights: a hit on the name counts most, then aliases, tags, the rest. */
const FIELD_WEIGHT = { name: 10, aliases: 8, tags: 5, extra: 3 } as const;

/**
 * Relevance of one item for a query; 0 means "not a match". Every query word
 * must match somewhere, so "paneer rice" doesn't return every rice dish.
 */
export function scoreDoc(doc: SearchDoc, query: string): number {
  const q = words(query);
  if (q.length === 0) return 1;
  const fields = {
    name: words(doc.name),
    aliases: (doc.aliases ?? []).flatMap(words),
    tags: (doc.tags ?? []).flatMap(words),
    extra: (doc.extra ?? []).flatMap(words),
  };
  let total = 0;
  for (const w of q) {
    let best = 0;
    for (const key of Object.keys(FIELD_WEIGHT) as (keyof typeof FIELD_WEIGHT)[]) {
      const s = bestWord(w, fields[key]) * FIELD_WEIGHT[key];
      if (s > best) best = s;
    }
    if (best === 0) return 0;
    total += best;
  }
  // The whole query as a phrase at the start of the name ranks first.
  if (normalise(doc.name).startsWith(normalise(query))) total += 5;
  return total;
}

// ------------------------------------------------------------------ filters

export type FilterOption<T> = { id: string; label: string; test: (item: T) => boolean };

export type FilterGroup<T> = {
  id: string;
  label: string;
  /** "any": keep items matching any chosen chip. "exclude": drop items matching any chosen chip. */
  mode: 'any' | 'exclude';
  options: FilterOption<T>[];
};

/** Chosen chip ids per group id. Missing or empty means the group is off. */
export type Selection = Record<string, string[]>;

export function activeCount(selection: Selection): number {
  return Object.values(selection).reduce((n, ids) => n + ids.length, 0);
}

export function toggle(selection: Selection, groupId: string, optionId: string): Selection {
  const current = selection[groupId] ?? [];
  const next = current.includes(optionId) ? current.filter((x) => x !== optionId) : [...current, optionId];
  return { ...selection, [groupId]: next };
}

export function passesFilters<T>(item: T, groups: FilterGroup<T>[], selection: Selection): boolean {
  for (const g of groups) {
    const chosen = selection[g.id] ?? [];
    if (chosen.length === 0) continue;
    const options = g.options.filter((o) => chosen.includes(o.id));
    const hit = options.some((o) => o.test(item));
    if (g.mode === 'any' && !hit) return false;
    if (g.mode === 'exclude' && hit) return false;
  }
  return true;
}

/** How many items each chip would leave, given the other groups' choices (shown on the chips). */
export function optionCounts<T>(items: readonly T[], groups: FilterGroup<T>[], selection: Selection): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const g of groups) {
    const others = { ...selection, [g.id]: [] };
    const base = items.filter((i) => passesFilters(i, groups, others));
    for (const o of g.options) {
      const key = `${g.id}:${o.id}`;
      counts[key] = g.mode === 'any' ? base.filter(o.test).length : base.filter((i) => !o.test(i)).length;
    }
  }
  return counts;
}

// ------------------------------------------------------------------ sort

export type SortOption<T> = {
  id: string;
  label: string;
  /** Number to sort by; null sorts last whatever the direction. */
  value: (item: T) => number | null;
  direction: 'asc' | 'desc';
};

export function sortItems<T>(items: readonly T[], sort: SortOption<T>, tieBreak: (a: T, b: T) => number): T[] {
  return [...items].sort((a, b) => {
    const va = sort.value(a);
    const vb = sort.value(b);
    if (va == null && vb == null) return tieBreak(a, b);
    if (va == null) return 1;
    if (vb == null) return -1;
    if (va !== vb) return sort.direction === 'asc' ? va - vb : vb - va;
    return tieBreak(a, b);
  });
}

// ------------------------------------------------------------------ all together

export type SearchResult<T> = { item: T; score: number };

/**
 * Search, then filter, then sort. With a query and the "relevance" sort,
 * the best text matches come first; otherwise the chosen sort decides.
 */
export function runSearch<T>(
  items: readonly T[],
  opts: {
    toDoc: (item: T) => SearchDoc;
    query: string;
    groups: FilterGroup<T>[];
    selection: Selection;
    sort: SortOption<T> | 'relevance';
    tieBreak: (a: T, b: T) => number;
  },
): SearchResult<T>[] {
  const scored: SearchResult<T>[] = [];
  for (const item of items) {
    if (!passesFilters(item, opts.groups, opts.selection)) continue;
    const score = scoreDoc(opts.toDoc(item), opts.query);
    if (score > 0) scored.push({ item, score });
  }
  if (opts.sort === 'relevance') {
    return scored.sort((a, b) => b.score - a.score || opts.tieBreak(a.item, b.item));
  }
  const order = sortItems(
    scored.map((s) => s.item),
    opts.sort,
    opts.tieBreak,
  );
  const byItem = new Map(scored.map((s) => [s.item, s.score]));
  return order.map((item) => ({ item, score: byItem.get(item) ?? 0 }));
}
```

### `src/services/dishLibrary.ts`

```ts
/**
 * Day 6: the dish library's search, filter and sort settings, built on the
 * shared rules in search.ts and the tags from the tag engine (tags.ts).
 * Option lists for cuisine, meal type and difficulty come from the dishes
 * themselves, so the library grows with every import.
 */
import type { AllergenId, Dish } from '../models/research';
import { ALLERGEN_IDS } from '../models/research';
import { ALLERGEN_LABELS } from './data/allergens';
import { cuisineTag, TAG } from './data/tags';
import type { FilterGroup, FilterOption, SearchDoc, SortOption } from './search';

export function totalMinutes(d: Pick<Dish, 'prepMin' | 'cookMin'>): number | null {
  if (d.prepMin == null && d.cookMin == null) return null;
  const t = (d.prepMin ?? 0) + (d.cookMin ?? 0);
  return t > 0 ? t : null;
}

/**
 * The order price to show, or null. Only an estimate that passed the price
 * checks (review 2026-10-15, fix 2) is a headline; the average is shown, never
 * the top of the range (SPEC-ADDENDA §8).
 */
export function headlineOrderPrice(d: Pick<Dish, 'orderPrice'>): { avg: number; min: number; max: number; observed: string | null } | null {
  const p = d.orderPrice;
  if (!p?.currentEstimate || p.confirmed === false) return null;
  return { ...p.currentEstimate, observed: p.lastObserved };
}

/** "Based on 3 listings" under a price backed by fewer than 5 listings (review 2026-10-15, fix 2). */
export function orderPriceNote(d: Pick<Dish, 'orderPrice'>): string | null {
  const p = d.orderPrice;
  if (!p?.currentEstimate) return null;
  if (p.confirmed === false) return p.checkNotes?.length ? `Not shown: ${p.checkNotes[0]}` : null;
  if (p.listingCount != null && p.listingCount < 5) return `Based on ${p.listingCount} ${p.listingCount === 1 ? 'listing' : 'listings'}.`;
  return null;
}

export function dishDoc(d: Dish): SearchDoc {
  return {
    id: d.id,
    name: d.name,
    // Bracketed names in the title ("Chole (Chana Masala)") and the family ("biryani") are aliases.
    aliases: [...(d.familyId ? [d.familyId.replace(/-/g, ' ')] : []), ...(d.variants.map((v) => v.name).filter(Boolean) as string[])],
    tags: d.tags,
    extra: [...d.ingredients.map((i) => i.name), ...(d.cuisine ? [d.cuisine] : []), ...(d.description ? [d.description] : [])],
  };
}

/** Dish number order: the order research added them, a stable tie-break. */
export const byNumber = (a: Dish, b: Dish) => a.number - b.number;

const has = (d: Dish, ...tags: string[]) => tags.some((t) => d.tags.includes(t));

function unique(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
}

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIFFICULTY_ORDER = ['Beginner', 'Easy', 'Intermediate', 'Medium', 'Advanced', 'Hard'];
const ordered = (list: string[], order: string[]) =>
  [...list].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b));

const title = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const DIET_OPTIONS: FilterOption<Dish>[] = [
  { id: 'veg', label: 'Veg', test: (d) => d.dietType === 'veg' },
  { id: 'egg', label: 'Egg', test: (d) => d.dietType === 'egg' },
  { id: 'non-veg', label: 'Non-veg', test: (d) => d.dietType === 'non-veg' },
  // "Option" tags mean research found a version (a variant or "with changes"); the card says so.
  { id: 'jain', label: 'Jain', test: (d) => has(d, TAG.jain, TAG.jainOption) },
  { id: 'vegan', label: 'Vegan', test: (d) => has(d, TAG.vegan, TAG.veganOption) },
  { id: 'gluten-free', label: 'Gluten-free', test: (d) => has(d, TAG.glutenFree, TAG.glutenFreeOption) },
  { id: 'dairy-free', label: 'Dairy-free', test: (d) => has(d, TAG.dairyFree, TAG.dairyFreeOption) },
  { id: 'no-onion-garlic', label: 'No onion-garlic', test: (d) => has(d, TAG.sattvik) },
  // Vegetarian and egg dishes fit a pescatarian diet too; fish dishes carry the tag.
  { id: 'pescatarian', label: 'Pescatarian', test: (d) => d.dietType === 'veg' || d.dietType === 'egg' || has(d, TAG.pescatarian) },
  { id: 'fasting', label: 'Fasting', test: (d) => has(d, TAG.navratri, TAG.ekadashi, TAG.fastingFriendly) },
];

export const TIME_OPTIONS: FilterOption<Dish>[] = [15, 30, 60].map((m) => ({
  id: `under-${m}`,
  label: `Under ${m} min`,
  test: (d: Dish) => {
    const t = totalMinutes(d);
    return t != null && t <= m;
  },
}));

export const NUTRITION_OPTIONS: FilterOption<Dish>[] = [
  { id: 'high-protein', label: TAG.highProtein, test: (d) => has(d, TAG.highProtein) },
  { id: 'high-fibre', label: TAG.highFibre, test: (d) => has(d, TAG.highFibre) },
  { id: 'low-calorie', label: TAG.lowCalorie, test: (d) => has(d, TAG.lowCalorie) },
];

export const CALORIE_OPTIONS: FilterOption<Dish>[] = [
  { id: 'kcal-400', label: 'Under 400 kcal', test: (d) => d.nutritionPerServing.kcal != null && d.nutritionPerServing.kcal < 400 },
  { id: 'kcal-400-600', label: '400–600 kcal', test: (d) => d.nutritionPerServing.kcal != null && d.nutritionPerServing.kcal >= 400 && d.nutritionPerServing.kcal <= 600 },
  { id: 'kcal-600', label: 'Over 600 kcal', test: (d) => d.nutritionPerServing.kcal != null && d.nutritionPerServing.kcal > 600 },
];

/** The filter sheet's groups, in display order. Lists without any option in the data are left out. */
export function dishFilterGroups(dishes: readonly Dish[]): FilterGroup<Dish>[] {
  const meals = ordered(unique(dishes.flatMap((d) => d.mealType.map(title))), MEAL_ORDER);
  const cuisines = unique(dishes.map((d) => cuisineTag(d.cuisine)));
  const levels = ordered(unique(dishes.map((d) => d.difficulty)), DIFFICULTY_ORDER);
  const allergens = ALLERGEN_IDS.filter((a) => dishes.some((d) => d.allergens.includes(a)));
  const groups: FilterGroup<Dish>[] = [
    { id: 'diet', label: 'Diet', mode: 'any', options: DIET_OPTIONS },
    {
      id: 'allergen',
      label: 'Leave out dishes that contain',
      mode: 'exclude',
      options: allergens.map((a: AllergenId) => ({ id: a, label: ALLERGEN_LABELS[a], test: (d: Dish) => d.allergens.includes(a) })),
    },
    { id: 'meal', label: 'Meal', mode: 'any', options: meals.map((m) => ({ id: m.toLowerCase(), label: m, test: (d: Dish) => d.mealType.some((x) => title(x) === m) })) },
    { id: 'time', label: 'Time', mode: 'any', options: TIME_OPTIONS },
    { id: 'level', label: 'Difficulty', mode: 'any', options: levels.map((l) => ({ id: l.toLowerCase(), label: l, test: (d: Dish) => d.difficulty === l })) },
    { id: 'nutrition', label: 'Nutrition', mode: 'any', options: NUTRITION_OPTIONS },
    { id: 'kcal', label: 'Calories per serving', mode: 'any', options: CALORIE_OPTIONS },
    { id: 'cuisine', label: 'Cuisine', mode: 'any', options: cuisines.map((c) => ({ id: c.toLowerCase(), label: c, test: (d: Dish) => cuisineTag(d.cuisine) === c })) },
  ];
  return groups.filter((g) => g.options.length > 0);
}

export const DISH_SORTS: SortOption<Dish>[] = [
  { id: 'quickest', label: 'Quickest', value: totalMinutes, direction: 'asc' },
  { id: 'lowest-kcal', label: 'Lowest calories', value: (d) => d.nutritionPerServing.kcal, direction: 'asc' },
  { id: 'highest-protein', label: 'Highest protein', value: (d) => d.nutritionPerServing.proteinG, direction: 'desc' },
  { id: 'highest-fibre', label: 'Highest fibre', value: (d) => d.nutritionPerServing.fibreG, direction: 'desc' },
  { id: 'healthiness', label: 'Healthiness score', value: (d) => d.healthiness?.score ?? null, direction: 'desc' },
  { id: 'rating', label: 'Rating', value: (d) => d.researchRating?.score ?? null, direction: 'desc' },
  { id: 'fewest-ingredients', label: 'Fewest ingredients', value: (d) => (d.ingredients.length ? d.ingredients.length : null), direction: 'asc' },
  { id: 'order-price', label: 'Cheapest to order', value: (d) => headlineOrderPrice(d)?.avg ?? null, direction: 'asc' },
];

/** Sorts named in SPEC-ADDENDA §9 that need data from a later day; shown greyed out with the reason. */
export const COMING_SORTS: { label: string; when: string }[] = [
  { label: 'Cheapest to cook', when: 'cost to make' },
  { label: 'Most saved vs ordering', when: 'cost to make' },
  { label: 'Protein per ₹', when: 'cost to make' },
  { label: 'Lowest sodium', when: 'dish sodium data' },
];

/** The few chips a card has room for: diet first, then "option" tags, then allergens. */
export function cardChips(d: Dish, max = 3): string[] {
  const diet = [TAG.veg, TAG.egg, TAG.nonVeg, TAG.vegan, TAG.jain, TAG.jainOption, TAG.veganOption, TAG.glutenFree, TAG.dairyFree, TAG.pescatarian, TAG.sattvik] as string[];
  const chips = d.tags.filter((t) => diet.includes(t));
  const allergens = d.tags.filter((t) => t.startsWith('Contains '));
  return [...chips, ...allergens].slice(0, max);
}
```

### `src/services/rememberedFilters.ts`

```ts
/**
 * Innovation (Day 06): the dish library remembers which allergens a person
 * leaves out, on this device, so a peanut allergy doesn't have to be set again
 * every time. Kept under the owner's device prefix, so "Delete my data",
 * sign-out and "Reset demo data" clear it with everything else.
 */
import { ALLERGEN_IDS, type AllergenId } from '../models/research';
import { ownerPrefix } from './storage/docStore';
import type { KeyValueStore } from './storage/kv';

export const rememberedFiltersKey = (owner: string) => `${ownerPrefix(owner)}dishFilters.v1`;

type Saved = { version: 1; excludeAllergens: AllergenId[] };

/** Only known allergen ids survive, so an old or damaged value can't hide dishes for no reason. */
export function cleanAllergens(value: unknown): AllergenId[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is AllergenId => typeof v === 'string' && (ALLERGEN_IDS as readonly string[]).includes(v)))];
}

export async function loadExcludedAllergens(kv: KeyValueStore, owner: string): Promise<AllergenId[]> {
  try {
    const raw = await kv.getItem(rememberedFiltersKey(owner));
    if (!raw) return [];
    const saved = JSON.parse(raw) as Partial<Saved>;
    return saved.version === 1 ? cleanAllergens(saved.excludeAllergens) : [];
  } catch {
    return [];
  }
}

export async function saveExcludedAllergens(kv: KeyValueStore, owner: string, ids: readonly string[]): Promise<void> {
  const clean = cleanAllergens(ids);
  try {
    if (clean.length === 0) await kv.removeItem(rememberedFiltersKey(owner));
    else await kv.setItem(rememberedFiltersKey(owner), JSON.stringify({ version: 1, excludeAllergens: clean } satisfies Saved));
  } catch {
    // Remembering is a convenience; the filter still works for this visit.
  }
}
```

### `src/components/dishes/DishLibrary.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { featureFlags } from '../../config/featureFlags';
import { researchDishes } from '../../data/research';
import { useStore } from '../../lib/store';
import type { Dish } from '../../models/research';
import { byNumber, COMING_SORTS, dishDoc, dishFilterGroups, DISH_SORTS } from '../../services/dishLibrary';
import { loadExcludedAllergens, saveExcludedAllergens } from '../../services/rememberedFilters';
import { GUEST_OWNER } from '../../services/storage';
import { activeCount, optionCounts, runSearch, toggle, type FilterGroup, type Selection } from '../../services/search';
import { colors, radius, type } from '../../theme';
import { SelectChip } from './parts';
import { ResearchDishCard } from './ResearchDishCard';

/** One-tap chips above the list: the filters people reach for most. */
const QUICK: { group: string; option: string; label: string }[] = [
  { group: 'diet', option: 'veg', label: 'Veg' },
  { group: 'nutrition', option: 'high-protein', label: 'High protein' },
  { group: 'time', option: 'under-30', label: 'Under 30 min' },
  { group: 'meal', option: 'breakfast', label: 'Breakfast' },
];

const RELEVANCE = 'relevance';

/**
 * Day 6: the Cook tab's dish library on the research data (SPEC-ADDENDA §9).
 * Search covers every dish; the person narrows it with filters. Nothing here
 * is driven by the survey.
 */
export function DishLibrary({ dishes = researchDishes }: { dishes?: readonly Dish[] }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selection, setSelection] = useState<Selection>({});
  const [sortId, setSortId] = useState<string>(RELEVANCE);
  const [sheet, setSheet] = useState<'filters' | 'sort' | null>(null);
  useRememberedAllergens(selection, setSelection);

  const groups = useMemo(() => dishFilterGroups(dishes), [dishes]);
  const sort = DISH_SORTS.find((s) => s.id === sortId) ?? RELEVANCE;
  const results = useMemo(
    () => runSearch(dishes, { toDoc: dishDoc, query: deferredQuery, groups, selection, sort, tieBreak: byNumber }).map((r) => r.item),
    [dishes, deferredQuery, groups, selection, sort],
  );
  const counts = useMemo(() => (sheet === 'filters' ? optionCounts(dishes, groups, selection) : {}), [sheet, dishes, groups, selection]);
  const nActive = activeCount(selection);
  const activeChips = groups.flatMap((g) => g.options.filter((o) => selection[g.id]?.includes(o.id)).map((o) => ({ g, o })));
  const sortLabel = sort === RELEVANCE ? 'Best match' : sort.label;
  const excludesAllergens = (selection.allergen ?? []).length > 0;

  const header = (
    <View>
      <Text style={[type.h1, { color: colors.text }]} accessibilityRole="header">
        Cook
      </Text>
      <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>
        {dishes.length} researched dishes, and more every day. Search by name, ingredient or diet.
      </Text>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Biryani, paneer, jeera, Jain…"
          placeholderTextColor={colors.faint}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search dishes"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow} contentContainerStyle={styles.quickContent} keyboardShouldPersistTaps="handled">
        <SelectChip
          label={nActive ? `Filters · ${nActive}` : 'Filters'}
          selected={nActive > 0}
          onPress={() => setSheet('filters')}
          icon={<Ionicons name="options-outline" size={16} color={nActive ? '#06210F' : colors.text} />}
        />
        <SelectChip label={sortLabel} selected={sort !== RELEVANCE} onPress={() => setSheet('sort')} icon={<Ionicons name="swap-vertical" size={16} color={sort !== RELEVANCE ? '#06210F' : colors.text} />} />
        {QUICK.filter((q) => groups.some((g) => g.id === q.group && g.options.some((o) => o.id === q.option))).map((q) => (
          <SelectChip key={q.label} label={q.label} selected={!!selection[q.group]?.includes(q.option)} onPress={() => setSelection((s) => toggle(s, q.group, q.option))} />
        ))}
      </ScrollView>

      {activeChips.length ? (
        <View style={styles.active}>
          {activeChips.map(({ g, o }) => (
            <Pressable
              key={`${g.id}:${o.id}`}
              onPress={() => setSelection((s) => toggle(s, g.id, o.id))}
              style={styles.activeChip}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Remove filter ${g.mode === 'exclude' ? `no ${o.label}` : o.label}`}
            >
              <Text style={styles.activeText}>{g.mode === 'exclude' ? `No ${o.label.toLowerCase()}` : o.label}</Text>
              <Ionicons name="close" size={14} color={colors.text} />
            </Pressable>
          ))}
          <Pressable onPress={() => setSelection({})} hitSlop={10} accessibilityRole="button" style={styles.clearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={[type.label, { color: colors.muted, marginTop: 16 }]} accessibilityLiveRegion="polite">
        {results.length} {results.length === 1 ? 'dish' : 'dishes'}
      </Text>
      <Text style={styles.note}>
        Allergens are worked out from each recipe&apos;s ingredients. Check labels if you have an allergy
        {excludesAllergens ? ', because packaged spice mixes can contain allergens their names don’t show.' : '.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => <ResearchDishCard dish={item} />}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: 10 }}
        ListEmptyComponent={
          dishes.length === 0 ? (
            <Empty icon="🍳" title="Dishes are on their way" body="The first researched dishes arrive with the next app update." />
          ) : (
            <Empty
              icon="🔍"
              title="No dishes match"
              body={query ? `Nothing for “${query.trim()}” with these filters. Try fewer filters or another word.` : 'Try removing a filter.'}
              action={nActive || query ? { label: 'Clear search and filters', onPress: () => (setSelection({}), setQuery('')) } : undefined}
            />
          )
        }
        contentContainerStyle={{ padding: 18, paddingBottom: 140 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />

      <Sheet visible={sheet === 'filters'} title="Filters" onClose={() => setSheet(null)} footer={{ label: `Show ${results.length} ${results.length === 1 ? 'dish' : 'dishes'}`, onPress: () => setSheet(null) }} onClear={nActive ? () => setSelection({}) : undefined}>
        {groups.map((g) => (
          <FilterSection key={g.id} group={g} selection={selection} counts={counts} onToggle={(o) => setSelection((s) => toggle(s, g.id, o))} />
        ))}
        <Text style={styles.note}>“Jain”, “Vegan”, “Gluten-free” and “Dairy-free” include dishes with a researched version (shown as “… option” on the card).</Text>
      </Sheet>

      <Sheet visible={sheet === 'sort'} title="Sort by" onClose={() => setSheet(null)}>
        <View style={styles.wrap}>
          <SelectChip label="Best match" selected={sort === RELEVANCE} onPress={() => (setSortId(RELEVANCE), setSheet(null))} />
          {DISH_SORTS.map((s) => (
            <SelectChip key={s.id} label={s.label} selected={sortId === s.id} onPress={() => (setSortId(s.id), setSheet(null))} />
          ))}
        </View>
        <Text style={[type.label, { color: colors.muted, marginTop: 18, marginBottom: 8 }]}>Coming soon</Text>
        <View style={styles.wrap}>
          {COMING_SORTS.map((s) => (
            <SelectChip key={s.label} label={s.label} selected={false} disabled onPress={() => undefined} />
          ))}
        </View>
        <Text style={styles.note}>These need {[...new Set(COMING_SORTS.map((s) => s.when))].join(' and ')}, which arrive in the next updates.</Text>
      </Sheet>
    </SafeAreaView>
  );
}

/** Innovation (Day 06, flag rememberAllergens): keep "Leave out dishes that contain" between visits, on this device. */
function useRememberedAllergens(selection: Selection, setSelection: (f: (s: Selection) => Selection) => void) {
  const { user } = useStore();
  const owner = user && !user.guest && user.uid ? user.uid : GUEST_OWNER;
  const loadedFor = useRef<string | null>(null);
  const allergens = selection.allergen ?? [];
  const key = allergens.join(',');

  useEffect(() => {
    if (!featureFlags.rememberAllergens) return;
    let alive = true;
    loadedFor.current = null;
    loadExcludedAllergens(AsyncStorage, owner).then((ids) => {
      if (!alive) return;
      setSelection((s) => ({ ...s, allergen: ids }));
      loadedFor.current = owner;
    });
    return () => {
      alive = false;
    };
  }, [owner, setSelection]);

  useEffect(() => {
    // Save only after this owner's saved choice has been read, so it is never overwritten by the empty start.
    if (!featureFlags.rememberAllergens || loadedFor.current !== owner) return;
    void saveExcludedAllergens(AsyncStorage, owner, key ? key.split(',') : []);
  }, [owner, key]);
}

function FilterSection({ group, selection, counts, onToggle }: { group: FilterGroup<Dish>; selection: Selection; counts: Record<string, number>; onToggle: (id: string) => void }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[type.label, { color: colors.muted, marginBottom: 8 }]} accessibilityRole="header">
        {group.label}
      </Text>
      <View style={styles.wrap}>
        {group.options.map((o) => {
          const selected = !!selection[group.id]?.includes(o.id);
          const n = counts[`${group.id}:${o.id}`];
          return <SelectChip key={o.id} label={o.label} selected={selected} count={n} disabled={!selected && n === 0 && group.mode === 'any'} onPress={() => onToggle(o.id)} />;
        })}
      </View>
    </View>
  );
}

function Sheet({
  visible,
  title,
  onClose,
  onClear,
  footer,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onClear?: () => void;
  footer?: { label: string; onPress: () => void };
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: 12 + insets.bottom }]} accessibilityViewIsModal>
        <View style={styles.grabber} />
        <View style={styles.sheetTop}>
          <Text style={[type.h2, { color: colors.text }]} accessibilityRole="header">
            {title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {onClear ? (
              <Pressable onPress={onClear} hitSlop={10} accessibilityRole="button" style={styles.sheetBtn}>
                <Text style={styles.clearText}>Clear all</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close" style={styles.sheetBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {footer ? (
          <Pressable onPress={footer.onPress} style={styles.footerBtn} accessibilityRole="button">
            <Text style={styles.footerText}>{footer.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

function Empty({ icon, title, body, action }: { icon: string; title: string; body: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 40 }}>{icon}</Text>
      <Text style={[type.h2, { color: colors.text, marginTop: 8, textAlign: 'center' }]}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>{body}</Text>
      {action ? (
        <Pressable onPress={action.onPress} style={[styles.footerBtn, { marginTop: 16, alignSelf: 'stretch' }]} accessibilityRole="button">
          <Text style={styles.footerText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
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
  quickRow: { marginHorizontal: -18, marginTop: 12 },
  quickContent: { paddingHorizontal: 18, gap: 8, paddingVertical: 2 },
  active: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.cardAlt },
  activeText: { color: colors.text, fontSize: 12.5, fontWeight: '700' },
  clearAll: { paddingHorizontal: 6, paddingVertical: 6 },
  clearText: { color: colors.accent, fontWeight: '800', fontSize: 13.5 },
  note: { color: colors.faint, fontSize: 11.5, lineHeight: 16, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.faint, marginBottom: 8 },
  sheetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetBtn: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  footerBtn: { minHeight: 50, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#06210F', fontWeight: '900', fontSize: 16 },
  empty: { alignItems: 'center', padding: 30 },
});
```

### `src/components/dishes/ResearchDishCard.tsx`

```tsx
import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Dish } from '../../models/research';
import { cardChips, totalMinutes } from '../../services/dishLibrary';
import { colors, radius } from '../../theme';
import { PressableScale } from '../ui';
import { DishImageSlot, TagChip } from './parts';

/** One line of facts: "25 min · Beginner · 390 kcal". Missing values are left out, never guessed. */
export function factsLine(d: Dish): string {
  const t = totalMinutes(d);
  return [t != null ? `${t} min` : null, d.difficulty, d.nutritionPerServing.kcal != null ? `${Math.round(d.nutritionPerServing.kcal)} kcal` : null].filter(Boolean).join(' · ');
}

/**
 * Library card. The two research scores stay separate and keep their exact
 * labels ("Healthiness score" out of 10, "Rating" from FitPlate's research of
 * online sentiment); they are never merged into one number.
 */
export const ResearchDishCard = memo(function ResearchDishCard({ dish }: { dish: Dish }) {
  const health = dish.healthiness?.score;
  const rating = dish.researchRating?.score;
  const chips = cardChips(dish);
  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: dish.id } })}
      style={styles.card}
      accessibilityLabel={`${dish.name}. ${factsLine(dish)}. ${chips.join(', ')}`}
    >
      <DishImageSlot dish={dish} size={92} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={2}>
          {dish.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {factsLine(dish)}
        </Text>
        {chips.length ? (
          <View style={styles.chips}>
            {chips.map((c) => (
              <TagChip key={c} label={c} />
            ))}
          </View>
        ) : null}
        <View style={styles.scores}>
          {health != null ? (
            <Text style={styles.score}>
              Healthiness score <Text style={styles.scoreValue}>{health}/10</Text>
            </Text>
          ) : null}
          {rating != null ? (
            <Text style={styles.score}>
              Rating <Text style={styles.scoreValue}>★ {rating}</Text>
            </Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  name: { color: colors.text, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  scores: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, marginTop: 6 },
  score: { color: colors.muted, fontSize: 12 },
  scoreValue: { color: colors.text, fontWeight: '800' },
});
```

### `src/components/dishes/parts.tsx`

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Dish } from '../../models/research';
import { colors, radius } from '../../theme';

/**
 * Image slot for a research dish (SPEC-ADDENDA §8). No real photo or
 * illustration exists yet, so it shows a clearly labelled placeholder; real
 * images are swapped in later by file name.
 */
const MEAL_ART: Record<string, { emoji: string; palette: [string, string] }> = {
  breakfast: { emoji: '🍳', palette: ['#F8D57E', '#E89B3C'] },
  lunch: { emoji: '🍛', palette: ['#F2A65A', '#C2502E'] },
  dinner: { emoji: '🍲', palette: ['#B5654A', '#5E2A1E'] },
  snack: { emoji: '🥟', palette: ['#E9C46A', '#B5793A'] },
};

export function dishArt(d: Pick<Dish, 'mealType'>) {
  return MEAL_ART[d.mealType[0]?.toLowerCase() ?? ''] ?? { emoji: '🍽️', palette: ['#6FCF97', '#1E8A5A'] as [string, string] };
}

export function DishImageSlot({ dish, size, label = true }: { dish: Pick<Dish, 'mealType' | 'name'>; size: number; label?: boolean }) {
  const art = dishArt(dish);
  return (
    <LinearGradient
      colors={art.palette}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.art, { width: size, height: size }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${dish.name}: picture coming soon`}
    >
      <Text style={{ fontSize: size * 0.42 }}>{art.emoji}</Text>
      {label ? (
        <View style={styles.artLabel}>
          <Text style={styles.artLabelText} numberOfLines={1}>
            Photo soon
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

/** A small tag chip on a card or title ("Veg", "Jain option", "Contains milk"). */
export function TagChip({ label }: { label: string }) {
  const tone = label.startsWith('Contains ') ? styles.tagWarn : label === 'Non-veg' ? styles.tagNonVeg : label === 'Egg' ? styles.tagEgg : styles.tagOk;
  return (
    <View style={[styles.tag, tone]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

/** Selectable chip for filters and sort, at least 44 pt tall to the thumb. */
export function SelectChip({
  label,
  selected,
  onPress,
  count,
  disabled,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={count != null ? `${label}, ${count} dishes` : label}
      style={({ pressed }) => [styles.select, selected && styles.selectOn, disabled && { opacity: 0.4 }, pressed && { opacity: 0.75 }]}
    >
      {icon}
      <Text style={[styles.selectText, selected && styles.selectTextOn]}>{label}</Text>
      {count != null ? <Text style={[styles.count, selected && styles.selectTextOn]}>{count}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artLabel: { position: 'absolute', bottom: 5, left: 5, right: 5, alignItems: 'center' },
  artLabelText: { color: 'rgba(255,255,255,0.92)', fontSize: 9.5, fontWeight: '800', backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  tagOk: { backgroundColor: 'rgba(61,220,132,0.12)', borderColor: 'rgba(61,220,132,0.35)' },
  tagNonVeg: { backgroundColor: 'rgba(255,107,107,0.12)', borderColor: 'rgba(255,107,107,0.35)' },
  tagEgg: { backgroundColor: 'rgba(255,181,71,0.12)', borderColor: 'rgba(255,181,71,0.35)' },
  tagWarn: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.border },
  tagText: { color: colors.text, fontSize: 11.5, fontWeight: '700' },
  select: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  selectText: { color: colors.text, fontWeight: '700', fontSize: 13.5 },
  selectTextOn: { color: '#06210F' },
  count: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
```

### `src/app/recipe/[id].tsx`

```tsx
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
```

### `src/app/(tabs)/cook.tsx`

```tsx
import { DishLibrary } from '../../components/dishes/DishLibrary';
import { featureFlags } from '../../config/featureFlags';
import { DiscoverScreen } from './discover';

// Day 6: the Cook tab is the research dish library. With the researchData flag
// off it falls back to the demo's dish browser, as on Days 2–5.
export default function Cook() {
  return featureFlags.researchData ? <DishLibrary /> : <DiscoverScreen title="Cook" />;
}
```

### `src/app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider } from '../lib/store';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="dish/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="recipe/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="cook/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
          <Stack.Screen name="done/[id]" options={{ animation: 'fade' }} />
          <Stack.Screen name="shop/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="profile" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="your-data" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="grocery" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="log" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.75, 1], sheetGrabberVisible: true, sheetCornerRadius: 28, contentStyle: { backgroundColor: colors.bgElevated } }} />
        </Stack>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
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
  /** Day 6: the Cook tab lists the research dishes (search, filters, sort). ON since Day 6; false brings back the 5 demo dishes. */
  researchData: true,
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
  /** Day 03b: Firestore as the store for signed-in users (SPEC-ADDENDA §5). ON since Day 03b; false keeps a signed-in user's data on the device only. */
  cloudSync: true,
  /** Innovation (Day 03b): still backdrop instead of background videos with Reduce motion, Data Saver or 2G. */
  liteMode: true,
  /** Innovation (Day 06): the Cook tab remembers "Leave out dishes that contain …" on this device. */
  rememberAllergens: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag, flags: Record<FeatureFlag, boolean> = featureFlags): boolean {
  return flags[flag] === true;
}
```

### `src/services/data/priceChecks.ts`

```ts
/**
 * Order-price checks (review 2026-10-15 FIX 2). A researched price range is
 * only shown as a headline when the research's own numbers agree with it:
 *
 *   1. the stated average and median lie inside [min, max];
 *   2. at least 3 distinct listings, on more than 1 platform, back the range;
 *   3. no listing used for the range is marked out of stock (or, for a dish,
 *      as a closed / not-delivering outlet).
 *
 * Anything else is "not confirmed" with the reasons, which also go to the
 * DATA SYNC REPORT's needs-review list. Pure, so it runs in Jest and in the
 * sync runner alike. Nothing here estimates a number: a count that cannot be
 * read from the file stays null.
 */
import type { PriceCheck } from '../../models/research';
import { num, plain } from './markdown';

export const MIN_LISTINGS = 3;
export const MIN_PLATFORMS = 2;

/** One row of a section-6 (dish) or "Price" (ingredient) listing table. */
export type ListingRow = {
  /** Restaurant (dish) or source (ingredient) cell, as written. */
  source: string;
  /** Normalised platform names ("Zomato and magicpin" → both). */
  platforms: string[];
  /**
   * Price for 1 serving (dish: the first amount in the last cell) or per
   * standard unit (ingredient: every amount in the last cell, since one cell
   * may give "₹96/kg, about ₹4–6 per lemon"). A written range stays a range;
   * empty when the row shows no price.
   */
  prices: { min: number; max: number }[];
  /** The research marks the row as dropped, excluded, trimmed, reference or context only. */
  excluded: boolean;
  /** The research marks the listing as out of stock, sold out, closed or not taking orders. */
  outOfStock: boolean;
  /** The row says the outlet is outside Mumbai city (Thane, Navi Mumbai, …). */
  outsideCity: boolean;
};

/** What the listing table says about one researched range. */
export type ListingEvidence = { listingCount: number | null; platforms: string[]; outOfStock: boolean };

/** Inputs of the check: the range as written plus what backs it. */
export type PriceCheckInput = ListingEvidence & { min: number; max: number; avg: number | null; median: number | null };

const KNOWN_PLATFORMS: [RegExp, string][] = [
  [/swiggy instamart|instamart/i, 'Swiggy Instamart'],
  [/swiggy/i, 'Swiggy'],
  [/zomato/i, 'Zomato'],
  [/magicpin/i, 'magicpin'],
  [/bigbasket/i, 'BigBasket'],
  [/blinkit/i, 'Blinkit'],
  [/zepto/i, 'Zepto'],
  [/jiomart/i, 'JioMart'],
  [/amazon/i, 'Amazon'],
  [/flipkart/i, 'Flipkart'],
  [/dunzo/i, 'Dunzo'],
  [/storeking/i, 'StoreKing'],
  [/oneindia/i, 'OneIndia'],
  [/justdial/i, 'Justdial'],
];

const EXCLUDED = /\b(dropped|excluded|not used|trimmed|context only|not counted|reference|cross-check|combo)\b/i;
const OUT_OF_STOCK = /out of stock|sold out|unavailable|not accepting orders|not delivering|\bclosed\b|listing inactive/i;
const PRICE = /₹\s*([\d,]+(?:\.\d+)?)(?:\s*(?:[–-]|to)\s*₹?\s*([\d,]+(?:\.\d+)?))?/g;

/** "Swiggy (Mumbai dish page)" → ["Swiggy"]; "Zomato and magicpin" → ["Zomato", "magicpin"]; unknown names kept as written. */
export function normalisePlatforms(cell: string): string[] {
  // Brackets hold remarks ("own website (says it delivers via Swiggy and Zomato)"), not the platform.
  const text = plain(cell).replace(/^\*[^*]*\*\s*/, '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const found: string[] = [];
  let rest = text;
  for (const [re, name] of KNOWN_PLATFORMS) {
    if (re.test(rest)) {
      found.push(name);
      rest = rest.replace(re, ' ');
    }
  }
  if (found.length > 0) return found;
  const own = text.replace(/\*/g, '').trim();
  return own ? [own] : [];
}

function pricesOf(cell: string): ListingRow['prices'] {
  const out: ListingRow['prices'] = [];
  for (const m of plain(cell).matchAll(PRICE)) {
    const a = num(m[1]);
    const b = m[2] ? num(m[2]) : a;
    if (a != null && b != null) out.push({ min: Math.min(a, b), max: Math.max(a, b) });
  }
  return out;
}

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

/**
 * Rows of the first listing table in `body` (dish section 6: the table with a
 * "Platform" column; ingredient "Price" section: the table whose first column
 * is "Source"). The last column is the per-serving / per-unit price. Null
 * when there is no such table.
 */
export function parseListingTable(body: string, kind: 'dish' | 'ingredient'): ListingRow[] | null {
  const lines = body.split('\n');
  const isHeader = (l: string) => (kind === 'dish' ? /\|\s*platform\s*\|/i.test(l) : /^\|\s*source\s*\|/i.test(l.trim()));
  const start = lines.findIndex((l) => l.trim().startsWith('|') && isHeader(l));
  if (start < 0) return null;
  const head = cells(lines[start]).map((c) => c.toLowerCase());
  const platformCol = kind === 'dish' ? head.findIndex((c) => c === 'platform') : -1;
  const rows: ListingRow[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const c = cells(line);
    if (c.every((x) => /^:?-{2,}:?$/.test(x) || x === '')) continue;
    const last = c[c.length - 1] ?? '';
    const source = c[0] ?? '';
    const platformCell = platformCol >= 0 ? (c[platformCol] ?? '') : source.split(/:|\s[–-]\s|,/)[0];
    const marked = kind === 'dish' ? last : `${source} ${last}`;
    const prices = /^not found\b/i.test(plain(last).trim()) ? [] : pricesOf(last);
    rows.push({
      source: plain(source).trim(),
      platforms: normalisePlatforms(platformCell),
      prices: kind === 'dish' ? prices.slice(0, 1) : prices,
      excluded: EXCLUDED.test(plain(marked)) || /^\*/.test(source),
      outOfStock: OUT_OF_STOCK.test(plain(c.join(' '))),
      outsideCity: /outside (?:the )?mumbai city/i.test(plain(c.join(' '))),
    });
  }
  return rows;
}

/**
 * Listings backing a range: rows the research kept whose price falls inside
 * [min − tolerance, max + tolerance] (the research rounds, e.g. ₹209.64 → ₹210).
 * When the range is stated for "Mumbai city" only, rows marked outside the
 * city do not back it. Rows are distinct by source and platform.
 * Null count when the table could not be read.
 */
export function listingEvidence(
  rows: ListingRow[] | null,
  range: { min: number; max: number },
  tolerance: number,
  opts: { cityOnly?: boolean } = {},
): ListingEvidence {
  if (!rows) return { listingCount: null, platforms: [], outOfStock: false };
  const priced = rows.filter((r) => r.prices.length > 0);
  if (priced.length === 0) return { listingCount: null, platforms: [], outOfStock: false };
  const inRange = (p: { min: number; max: number }) => p.max >= range.min - tolerance && p.min <= range.max + tolerance;
  const used = priced.filter((r) => !r.excluded && !(opts.cityOnly && r.outsideCity) && r.prices.some(inRange));
  const keys = new Set(used.map((r) => `${r.source.toLowerCase()}|${r.platforms.join('+')}`));
  const platforms = [...new Set(used.flatMap((r) => r.platforms))].sort((a, b) => a.localeCompare(b));
  return { listingCount: keys.size, platforms, outOfStock: used.some((r) => r.outOfStock) };
}

const rs = (v: number) => `₹${Number.isInteger(v) ? v : v.toFixed(2)}`;

/** The three FIX 2 rules. `confirmed` is true only when no rule fires. */
export function checkPrice(input: PriceCheckInput): PriceCheck {
  const notes: string[] = [];
  const { min, max } = input;
  const range = `${rs(min)}–${rs(max)}`;
  if (input.avg != null && (input.avg < min || input.avg > max)) notes.push(`average ${rs(input.avg)} lies outside the range ${range}`);
  if (input.median != null && (input.median < min || input.median > max)) notes.push(`median ${rs(input.median)} lies outside the range ${range}`);
  if (input.listingCount != null && input.listingCount < MIN_LISTINGS) {
    notes.push(`only ${input.listingCount} ${input.listingCount === 1 ? 'listing backs' : 'listings back'} the range (need ${MIN_LISTINGS})`);
  }
  if (input.platforms.length === 1) notes.push(`only 1 platform (${input.platforms[0]}) backs the range`);
  if (input.outOfStock) notes.push('a listing used for the range is marked out of stock, closed or not taking orders');
  return { listingCount: input.listingCount, platforms: input.platforms, outOfStock: input.outOfStock, confirmed: notes.length === 0, checkNotes: notes };
}
```

### `src/services/data/dishImporter.ts`

```ts
/**
 * Dish importer (roadmap Day 4). Parses one daily dish research file into
 * per-dish records. Pure: it takes the markdown text and returns data, so
 * it runs the same in Jest and in scripts/research/run.js.
 *
 * Null always means "not found in the file"; nothing is estimated here.
 */
import type { DietClaim, Dish, DishIngredient, DishStep, Macros } from '../../models/research';
import { checkClaims, dishAllergens, allergenNotes, findClaims, sortAllergens } from './allergens';
import { parseDietTags, parseTagsLine, parseVariants, withoutDietTags } from './dietTags';
import { parseFasting, validateFasting } from './fasting';
import { bullets, labelled, minutes, num, plain, rupee, rupeeRange, seconds, slugify, splitHeadings, tableRows, type Section } from './markdown';
import { listingEvidence, parseListingTable, type ListingEvidence } from './priceChecks';

/** One dish as written in one research file, before merging with other versions. */
export type DishVersion = {
  id: string;
  number: number;
  date: string;
  file: string;
  name: string;
  cuisine: string | null;
  dietType: Dish['dietType'];
  mealType: string[];
  difficulty: string | null;
  prepMin: number | null;
  cookMin: number | null;
  totalMin: number | null;
  servingsWritten: number | null;
  ingredients: DishIngredient[];
  equipment: string[];
  steps: DishStep[];
  nutrition: Macros;
  /** Order price for 1 serving as written; feeds the price trend engine. */
  orderPrice: OrderPriceVersion | null;
  /** "AS ORDERED" block (dish files from 2026-10-08). Null when the block is missing. */
  asOrdered: Dish['asOrdered'];
  healthiness: Dish['healthiness'];
  researchRating: Dish['researchRating'];
  storage: string | null;
  leftoverRemix: string | null;
  burnOff: string | null;
  sources: string[];
  allergens: Dish['allergens'];
  dietClaims: DietClaim[];
  fasting: Dish['fasting'];
  dietTags: Dish['dietTags'];
  /** PATCH 04 "Tags:" line as written (kept for the report; the app's tags come from tags.ts). */
  researchTags: string[];
  description: string | null;
  variants: Dish['variants'];
  needsReview: string[];
  notes: string[];
};

/**
 * One researched order price. `avg` is what the price engine uses (null when
 * the file's average lies outside its own range); `statedAvg` and `median`
 * are the headline figures as written, kept for the FIX 2 checks.
 */
export type OrderPriceVersion = ListingEvidence & {
  min: number;
  max: number;
  avg: number | null;
  statedAvg: number | null;
  median: number | null;
};

/** Research rounds dish prices to ₹10, so a ₹209.64 listing backs a ₹210 floor. */
const DISH_PRICE_TOLERANCE = 5;

export function dishId(number: number, name: string): string {
  return `${String(number).padStart(3, '0')}-${slugify(name)}`;
}

function section(sections: Section[], n: number, titleHint: RegExp): string {
  return (sections.find((s) => titleHint.test(s.title)) ?? sections.find((s) => s.n === n))?.body ?? '';
}

function dietOf(raw: string): Dish['dietType'] {
  const s = raw.toLowerCase();
  if (/non[- ]?veg/.test(s)) return 'non-veg';
  if (/\begg/.test(s)) return 'egg';
  if (/\bveg/.test(s)) return 'veg';
  return null;
}

/** "Maharashtrian (…) | Veg | Breakfast (also an evening snack)" */
function parseHeader(body: string): { cuisine: string | null; diet: string; dietType: Dish['dietType']; mealType: string[] } {
  const line = body.split('\n').find((l) => l.includes('|') && !l.trim().startsWith('|')) ?? '';
  const parts = line.split('|').map((p) => p.trim());
  const dietIdx = parts.findIndex((p) => dietOf(p) !== null);
  const cuisine = parts[0] && dietIdx !== 0 ? parts[0] : null;
  const diet = dietIdx >= 0 ? parts[dietIdx] : '';
  const mealRaw = dietIdx >= 0 ? parts.slice(dietIdx + 1).join(' ') : '';
  const mealType = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink']
    .filter((m) => new RegExp(`\\b${m}`, 'i').test(mealRaw.replace(/\([^)]*\)/g, '')));
  return { cuisine, diet, dietType: dietIdx >= 0 ? dietOf(parts[dietIdx]) : null, mealType };
}

/** "60 g", "10 ml (about 9 g)", "1 small chilli", "About 1 cup …" */
function parseQuantity(raw: string): { quantity: number | null; unit: string | null } {
  const m = /^(?:about\s+|~\s*)?(\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(g|kg|ml|l|litre|liter|tsp|tbsp|cup|cups|pinch|piece|pieces|pcs|no\.?|clove|cloves|leaves|sprig|small|medium|large)?\b/i.exec(raw.trim());
  if (!m) return { quantity: null, unit: null };
  const unit = m[2] ? m[2].toLowerCase().replace(/^litre$|^liter$/, 'l').replace(/^cups$/, 'cup') : null;
  return { quantity: Number(m[1]), unit };
}

function parseIngredients(body: string): DishIngredient[] {
  const out: DishIngredient[] = [];
  for (const cells of tableRows(body)) {
    if (cells.length < 2) continue;
    const name = plain(cells[0]).trim();
    if (!name || /^total$/i.test(name)) continue;
    const { quantity, unit } = parseQuantity(plain(cells[1]));
    const household = cells[2] ? plain(cells[2]).trim() : '';
    out.push({ ingredientId: null, name, quantity, unit, householdMeasure: household && household !== '–' && household !== '-' ? household : null });
  }
  return out;
}

function parseEquipment(body: string): string[] {
  return bullets(body).map((b) => {
    const p = plain(b);
    // Keep the item itself; "No colander? Use …" alternatives stay in the full text below the first sentence.
    const first = p.split(/\.\s+(?=[A-Z])/)[0];
    return first.replace(/\.$/, '').trim();
  });
}

function parseSteps(body: string): DishStep[] {
  const steps: DishStep[] = [];
  let current: DishStep | null = null;
  for (const line of body.split('\n')) {
    const head = /^(\d+)\.\s+(.*)$/.exec(line);
    if (head) {
      if (current) steps.push(current);
      const rest = head[2].trim();
      const titled = /^\*\*(.+?)\*\*\s*(.*)$/.exec(rest);
      const title = titled ? titled[1].replace(/[.:]$/, '').trim() : null;
      current = { n: Number(head[1]), title, text: plain(titled ? titled[2] : rest).trim() || (title ?? ''), timerSec: null, tip: null, visualCue: null, cameraCheck: null, videoShot: null };
      continue;
    }
    const sub = /^\s+-\s+(.*)$/.exec(line);
    if (!sub || !current) continue;
    const item = plain(sub[1]);
    const kv = /^([^:]+):\s*(.*)$/.exec(item);
    if (!kv) continue;
    const key = kv[1].toLowerCase();
    const value = kv[2].trim();
    if (key.startsWith('time')) current.timerSec = seconds(value);
    else if (key.startsWith('visual cue')) current.visualCue = value;
    else if (key.startsWith('camera check')) current.cameraCheck = value;
    else if (key.startsWith('video shot')) current.videoShot = value;
    else if (key.includes('tip')) current.tip = value;
  }
  if (current) steps.push(current);
  return steps;
}

/**
 * Section 5 totals, written three ways across days:
 * "**Total: about 390 kcal | Protein 7.9 g | …**" (also "Total (2 chillas, no chutney): …"),
 * "- Calories: about 660 kcal", or "| Calories | ~540 kcal |".
 * The per-ingredient table comes after the totals, so the first match wins.
 */
export function parseNutrition(body: string): Macros {
  const text = plain(body);
  const kcal = /(?:Total(?:\s*\([^)]*\))?:\s*(?:about|~|≈)?\s*|Calories\s*(?:\(kcal\))?\s*[:|]\s*(?:about|~|≈)?\s*)([\d,]+(?:\.\d+)?)\s*kcal/i.exec(text);
  const grams = (label: string) => {
    const m = new RegExp(`\\b(?:${label})\\b[^0-9\\n|]*\\|?\\s*(?:about|~|≈)?\\s*(\\d+(?:\\.\\d+)?)\\s*g\\b`, 'i').exec(text);
    return m ? num(m[1]) : null;
  };
  return {
    kcal: kcal ? num(kcal[1]) : null,
    proteinG: grams('Protein'),
    carbsG: grams('Carbs|Carbohydrates?'),
    fatG: grams('Fat'),
    fibreG: grams('Fibre|Fiber'),
  };
}

const AMOUNT = '₹\\s*([\\d,]+(?:\\.\\d+)?)';

/** "average about ₹280" / "median ₹225" in one phrase; "average of all …" describes the full spread, not the range. */
function statedFigure(text: string, label: 'average' | 'median'): number | null {
  const m = new RegExp(`\\b${label}\\b(?! of all)[^₹\\n.;]{0,15}${AMOUNT}`, 'i').exec(text);
  return m ? num(m[1]) : null;
}

/**
 * The headline average and median the research gives for its range, as
 * written (not filtered): the range sentence itself ("₹180–240; median about
 * ₹230; average about ₹280."), then an "Average:" / "Median:" label, then the
 * AS ORDERED price line when it repeats the same range.
 */
function headlineFigures(text: string, rangeLine: string, range: { min: number; max: number }): { avg: number | null; median: number | null } {
  const fromRange = rangeLine.slice(rangeLine.search(/price range/i));
  const headline = fromRange.split(/(?<=\.)\s+(?=[A-Z])/)[0];
  const lines = text.split('\n');
  const label = (name: string) => {
    const inLine = new RegExp(`(?:^|\\.\\s+)${name}\\b[^:.]{0,30}:\\s*(?:about|~|≈)?\\s*${AMOUNT}`, 'i').exec(fromRange);
    if (inLine) return num(inLine[1]);
    const own = lines.find((l) => new RegExp(`^\\s*-?\\s*${name}\\b[^:]*:`, 'i').test(l) && !/average of all/i.test(l));
    return own ? rupee(own) : null;
  };
  const asOrdered = lines.find((l) => /^\s*-?\s*price\b[^:]*:/i.test(l) && !/price range/i.test(l) && /average|median/i.test(l) && (() => {
    const r = rupeeRange(l.slice(l.search(/range/i)));
    return r != null && r.min === range.min && r.max === range.max;
  })());
  return {
    avg: statedFigure(headline, 'average') ?? label('average') ?? (asOrdered ? statedFigure(asOrdered, 'average') : null),
    median: statedFigure(headline, 'median') ?? label('median') ?? (asOrdered ? statedFigure(asOrdered, 'median') : null),
  };
}

export function parseOrderPrice(body: string): OrderPriceVersion | null {
  const text = plain(body);
  const rangeLine = text.split('\n').find((l) => /price range/i.test(l));
  if (!rangeLine) return null;
  const range = rupeeRange(rangeLine.slice(rangeLine.search(/price range/i)));
  if (!range) return null;
  // "- Average (1 serving): about ₹130" on its own line, or "… Average: ~₹330." after the range.
  // "Average of all N prices" lines describe the full spread before narrowing, so they don't count.
  const avgLine = text.split('\n').find((l) => /^\s*-?\s*average\b[^:]*:/i.test(l) && !/average of all/i.test(l));
  let avg = avgLine ? rupee(avgLine) : null;
  if (avg == null) {
    // Otherwise the last "average about ₹N" in the range explanation that sits inside the range.
    const mentions = [...rangeLine.matchAll(/average[^₹\n]{0,15}₹\s*([\d,]+)/gi)].map((m) => num(m[1]));
    avg = mentions.filter((v): v is number => v != null && v >= range.min && v <= range.max).pop() ?? null;
  }
  // An average outside the narrowed range belongs to the full spread, not the range.
  if (avg != null && (avg < range.min || avg > range.max)) avg = null;
  const stated = headlineFigures(text, rangeLine, range);
  return {
    min: range.min,
    max: range.max,
    avg,
    statedAvg: stated.avg,
    median: stated.median,
    // "Price range (1 serving), everyday Mumbai city restaurants: ₹180–240" leaves out-of-city rows out.
    ...listingEvidence(parseListingTable(body, 'dish'), range, DISH_PRICE_TOLERANCE, { cityOnly: /mumbai city/i.test(rangeLine.split('₹')[0]) }),
  };
}

function parseAsOrdered(body: string): Dish['asOrdered'] {
  const idx = body.search(/AS ORDERED/);
  if (idx < 0) return null;
  const block = plain(body.slice(idx));
  const value = (label: string) => {
    const line = block.split('\n').find((l) => new RegExp(`^\\s*[-|]?\\s*${label}\\b`, 'i').test(l));
    if (!line || /not found/i.test(line)) return { value: null, source: null };
    const m = /(\d+(?:\.\d+)?)\s*(kcal|g)\b/i.exec(line);
    const src = /(?:source|from)[:\s]+([^|]+?)\s*(?:\||$)/i.exec(line);
    return { value: m ? Number(m[1]) : null, source: m && src ? src[1].trim() : null };
  };
  const sampled = /(\d+)\s+restaurants?/i.exec(block);
  const platforms = ['Swiggy', 'Zomato', 'magicpin'].filter((p) => new RegExp(p, 'i').test(block));
  return {
    price: null,
    nutrition: { calories: value('Calories'), protein: value('Protein'), carbs: value('Carbs|Carbohydrates?'), fat: value('Fat'), fibre: value('Fibre|Fiber') },
    restaurantsSampled: sampled ? Number(sampled[1]) : null,
    platforms,
  };
}

function parseHealth(body: string): Dish['healthiness'] {
  const text = plain(body);
  const home = /Home(?:[- ]cooked)?(?: version)?:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i.exec(text);
  const rest = /restaurant(?: version)?:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i.exec(text);
  const reason = labelled(body, ['Reason', 'Why']);
  if (!home && !rest && !reason) return null;
  return { score: home ? Number(home[1]) : null, restaurantScore: rest ? Number(rest[1]) : null, reasons: reason ? [reason] : [] };
}

function parseRating(body: string): Dish['researchRating'] {
  const text = plain(body);
  const m = /Rating:\s*(\d+(?:\.\d+)?)\s*\/\s*5/i.exec(text);
  const basis = labelled(body, ['Reason']);
  if (!m && !basis) return null;
  return { score: m ? Number(m[1]) : null, basis };
}

function parseSources(body: string): string[] {
  return bullets(body)
    .map((b) => plain(b).trim())
    .filter((b) => /https?:\/\//.test(b));
}

/** Parses one dish block ("## N. Name" and its sections). */
export function parseDish(block: Section, meta: { date: string; file: string }): DishVersion | null {
  if (block.n == null) return null;
  const name = plain(block.title).trim();
  const sections = splitHeadings(block.body, 3);
  const headerText = block.body.split(/^### /m)[0];
  const header = parseHeader(headerText);
  const tagsLine = parseTagsLine(headerText);
  const facts = section(sections, 1, /quick facts/i);
  const dietTags = parseDietTags(facts);
  const notes: string[] = [];
  const needsReview: string[] = [];

  const prepRaw = labelled(facts, ['Prep time / Cook time / Total time']);
  let prepMin: number | null;
  let cookMin: number | null;
  let totalMin: number | null;
  if (prepRaw) {
    const parts = prepRaw.split('/');
    [prepMin, cookMin, totalMin] = [minutes(parts[0] ?? null), minutes(parts[1] ?? null), minutes(parts[2] ?? null)];
  } else {
    prepMin = minutes(labelled(facts, ['Prep time']));
    const prepLine = labelled(facts, ['Prep time']) ?? '';
    cookMin = minutes(labelled(facts, ['Cook time']) ?? (/cook time:\s*([^/]+)/i.exec(prepLine)?.[1] ?? null));
    totalMin = minutes(labelled(facts, ['Total time']) ?? (/total time:\s*([^/]+)/i.exec(prepLine)?.[1] ?? null));
  }
  const servingsLine = labelled(facts, ['Servings']);
  const servingsWritten = servingsLine ? num(/^(\d+)/.exec(servingsLine)?.[1]) : null;
  if (servingsWritten != null && servingsWritten !== 1) notes.push(`file says ${servingsWritten} servings; not converted`);

  const difficultyRaw = labelled(facts, ['Difficulty']);
  const difficulty = difficultyRaw ? (/^(beginner|easy|intermediate|medium|advanced|hard)/i.exec(difficultyRaw)?.[1] ?? null) : null;

  const ingredients = parseIngredients(section(sections, 2, /^ingredients/i));
  const derived = dishAllergens(ingredients);
  // Safety first: an allergen the research declares is kept even if the ingredient names don't show it.
  const declared = dietTags?.allergensDeclared ?? [];
  const extra = declared.filter((a) => !derived.includes(a));
  if (extra.length > 0) notes.push(`research declares ${extra.join(', ')} not detected from ingredient names; added`);
  const allergens = sortAllergens([...derived, ...extra]);
  const allergenSafety = [...new Set(ingredients.flatMap((i) => allergenNotes(i)))];
  notes.push(...allergenSafety);

  // Claims live in the header line ("Veg (naturally vegan and gluten-free)"), in Quick facts, and
  // (from PATCH 03) as "Yes" lines in the Diet tags block, which is read structurally, not as prose.
  const claimLines = [header.diet, ...bullets(withoutDietTags(facts)).map(plain).filter((b) => !/^(navratri|ekadashi|jain|ramadan)/i.test(b))];
  const found = findClaims(claimLines);
  if (dietTags) {
    for (const [key, claim] of [['vegan', 'vegan'], ['glutenFree', 'glutenFree'], ['dairyFree', 'dairyFree']] as const) {
      if (dietTags[key].status === 'yes' && !found.includes(claim)) found.push(claim);
    }
  }
  const claims = checkClaims(found, allergens, header.dietType);
  for (const d of claims.dropped) needsReview.push(`dropped "${d.claim}" claim: recipe has ${d.because.join(', ')}`);

  const fastingCheck = validateFasting(parseFasting(facts), ingredients.map((i) => i.name));
  needsReview.push(...fastingCheck.issues);

  const stepsBody = section(sections, 4, /micro-steps|steps/i);
  const order = section(sections, 6, /cost to order/i);
  const after = section(sections, 10, /after the meal/i);

  return {
    id: dishId(block.n, name),
    number: block.n,
    date: meta.date,
    file: meta.file,
    name,
    cuisine: header.cuisine,
    dietType: header.dietType,
    mealType: header.mealType,
    difficulty: difficulty ? difficulty[0].toUpperCase() + difficulty.slice(1).toLowerCase() : null,
    prepMin,
    cookMin,
    totalMin,
    servingsWritten,
    ingredients,
    equipment: parseEquipment(section(sections, 3, /^equipment/i)),
    steps: parseSteps(stepsBody.split(/\*\*Diet variants\*\*/i)[0]),
    nutrition: parseNutrition(section(sections, 5, /calories and nutrition/i)),
    orderPrice: parseOrderPrice(order),
    asOrdered: parseAsOrdered(order),
    healthiness: parseHealth(section(sections, 7, /healthiness/i)),
    researchRating: parseRating(section(sections, 8, /^rating/i)),
    storage: labelled(after, ['Storage']),
    leftoverRemix: labelled(after, ['Leftover remix']),
    burnOff: labelled(after, ['Burn it off']),
    sources: parseSources(section(sections, 12, /^sources/i)),
    allergens,
    dietClaims: claims.kept,
    fasting: fastingCheck.fasting,
    dietTags,
    researchTags: tagsLine?.researchTags ?? [],
    description: tagsLine?.description ?? null,
    variants: parseVariants(stepsBody),
    needsReview,
    notes,
  };
}

/** Date from "FitPlate_Dishes_2026-10-04.md". */
export function fileDate(file: string): string | null {
  return /(\d{4}-\d{2}-\d{2})/.exec(file)?.[1] ?? null;
}

/** Parses every dish in one dish research file. */
export function parseDishFile(text: string, file: string): DishVersion[] {
  const date = fileDate(file);
  if (!date) throw new Error(`No date in file name: ${file}`);
  return splitHeadings(text, 2)
    .map((block) => parseDish(block, { date, file }))
    .filter((d): d is DishVersion => d !== null);
}
```

### `src/services/data/ingredientImporter.ts`

```ts
/**
 * Ingredient importer (roadmap Day 4). Every ingredient file opens with a
 * summary table (one row per ingredient), followed by a "## Name" section
 * per ingredient; files from 2026-10-08 also carry a JSON block per
 * ingredient (schema fitplate.ingredient.v1) with the full nutrient profile.
 * The summary row is the backbone; the sections and JSON add detail.
 */
import type { Confidence, Macros, NutrientPer100, SourcedValue } from '../../models/research';
import { fileDate } from './dishImporter';
import { bullets, labelled, num, plain, rupee, rupeeRange, slugify, splitHeadings, splitName, tableRows } from './markdown';
import { listingEvidence, parseListingTable, type ListingEvidence } from './priceChecks';

export type IngredientVersion = {
  id: string;
  date: string;
  file: string;
  name: string;
  aliases: string[];
  category: string | null;
  standardUnit: string | null;
  /**
   * Summary-row price. `avg` feeds the price engine (null when outside the
   * range); `statedAvg` is the average as written and the listing fields come
   * from the section's price table (review 2026-10-15 FIX 2).
   */
  price: (ListingEvidence & { min: number; max: number; avg: number | null; statedAvg: number | null; median: number | null }) | null;
  per100: { min: number; max: number } | null;
  sourcesChecked: number | null;
  confidence: Confidence | null;
  storage: string | null;
  substitutes: string[];
  macrosPer100: Macros | null;
  nutritionPer100g: NutrientPer100 | null;
  usedIn: UsedIn[];
  notes: string[];
};

/** One "Used in" line: "- 6 Upma: 20 g (2 tbsp, finely diced)" or "- Dish 1, Poha: 60 g (thick)". */
export type UsedIn = { dishNumber: number; quantity: number | null; unit: string | null; raw: string };

/** Spec F7: the ingredient file's own "Used in" list, cross-checked against dish tables by the runner. */
export function parseUsedIn(body: string): UsedIn[] {
  const out: UsedIn[] = [];
  for (const b of bullets(body)) {
    const p = plain(b).trim();
    const m = /^(?:dish\s+)?(\d+)[,.]?\s+[^:]+:\s*(.*)$/i.exec(p);
    if (!m) continue;
    const q = /^(?:about\s+|~\s*)?(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\b/i.exec(m[2].trim());
    out.push({ dishNumber: Number(m[1]), quantity: q ? Number(q[1]) : null, unit: q ? q[2].toLowerCase() : null, raw: m[2].trim() });
  }
  return out;
}

/**
 * Research rounds ingredient prices to ₹1–₹5 (₹461 → ₹460) and large per-kg
 * prices more coarsely (₹1,396 → ₹1,400), so a listing backs the range when it
 * sits within this much of either end.
 */
function ingredientPriceTolerance(max: number): number {
  return Math.max(Math.min(2.5, 0.05 * max), 0.02 * max);
}

/** Canonical id: kebab-case of the English name, without the Indian names in brackets. */
export function ingredientId(name: string): string {
  return slugify(splitName(name).english);
}

function confidenceOf(raw: string | null | undefined): Confidence | null {
  const m = /\b(high|medium|low)\b/i.exec(raw ?? '');
  return m ? ((m[1][0].toUpperCase() + m[1].slice(1).toLowerCase()) as Confidence) : null;
}

/** "per kg (≈₹0.5 per small chilli)" → "kg" */
function unitOf(raw: string): string | null {
  const m = /per\s+(kg|g|litre|liter|l|ml|piece|dozen|bunch|pack|lemon|egg)\b/i.exec(raw);
  if (!m) return null;
  const u = m[1].toLowerCase();
  if (u === 'litre' || u === 'liter') return 'l';
  if (u === 'lemon' || u === 'egg') return 'piece';
  return u;
}

function parseSummary(text: string): { name: string; cells: string[] }[] {
  const summary = splitHeadings(text, 2).find((s) => /^summary/i.test(s.title));
  if (!summary) return [];
  return tableRows(summary.body)
    .filter((cells) => cells.length >= 8)
    .map((cells) => ({ name: plain(cells[0]).trim(), cells }));
}

/** Section 6 one-liner: "About 346 kcal | Protein 6.6 g | Carbs 77 g | Fat 1.2 g | Fibre 2 g". */
function parseMacros(body: string): Macros | null {
  const text = plain(body);
  const kcal = /(\d+(?:\.\d+)?)\s*kcal/i.exec(text);
  const g = (label: string) => {
    // "Protein 6.6 g" or "1.1 g protein"
    const after = new RegExp(`\\b(?:${label})\\b\\s*:?\\s*(?:about|~)?\\s*(\\d+(?:\\.\\d+)?)\\s*g\\b`, 'i').exec(text);
    const before = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*g\\s+(?:${label})\\b`, 'i').exec(text);
    const m = after ?? before;
    return m ? Number(m[1]) : null;
  };
  const out: Macros = { kcal: kcal ? Number(kcal[1]) : null, proteinG: g('Protein'), carbsG: g('Carbs|Carbohydrates?'), fatG: g('Fat'), fibreG: g('Fibre|Fiber') };
  return Object.values(out).some((v) => v != null) ? out : null;
}

const JSON_FIELDS: [keyof Omit<NutrientPer100, 'basis'>, string][] = [
  ['energyKcal', 'energy_kcal'],
  ['proteinG', 'protein_g'],
  ['carbsG', 'carbohydrate_g'],
  ['sugarsG', 'sugars_g'],
  ['fatG', 'fat_g'],
  ['saturatedFatG', 'saturated_fat_g'],
  ['fibreG', 'fibre_g'],
  ['sodiumMg', 'sodium_mg'],
  ['ironMg', 'iron_mg'],
  ['calciumMg', 'calcium_mg'],
  ['potassiumMg', 'potassium_mg'],
  ['magnesiumMg', 'magnesium_mg'],
  ['zincMg', 'zinc_mg'],
  ['vitaminCMg', 'vitamin_c_mg'],
  ['vitaminAUgRae', 'vitamin_a_ug_rae'],
  ['folateUgDfe', 'folate_ug_dfe'],
  // fitplate.ingredient.v2 (ingredient PATCH_02, files from 2026-10-12); null in v1 blocks.
  ['waterG', 'water_g'],
  ['cholesterolMg', 'cholesterol_mg'],
  ['transFatG', 'trans_fat_g'],
  ['mufaG', 'mufa_g'],
  ['pufaG', 'pufa_g'],
  ['omega3G', 'omega3_g'],
  ['addedSugarsG', 'added_sugars_g'],
  ['phosphorusMg', 'phosphorus_mg'],
  ['seleniumUg', 'selenium_ug'],
  ['copperMg', 'copper_mg'],
  ['manganeseMg', 'manganese_mg'],
  ['iodineUg', 'iodine_ug'],
  ['vitaminDUg', 'vitamin_d_ug'],
  ['vitaminEMg', 'vitamin_e_mg'],
  ['vitaminKUg', 'vitamin_k_ug'],
  ['thiaminMg', 'thiamin_mg'],
  ['riboflavinMg', 'riboflavin_mg'],
  ['niacinMg', 'niacin_mg'],
  ['vitaminB6Mg', 'vitamin_b6_mg'],
  ['vitaminB12Ug', 'vitamin_b12_ug'],
];

/** Ingredient profile schemas; other blocks (e.g. fitplate.ingredient_facts.v1, PATCH_03) are not profiles. */
const PROFILE_SCHEMAS = new Set(['fitplate.ingredient.v1', 'fitplate.ingredient.v2']);

type JsonBlock = { id?: string; name?: string; nutrition?: Record<string, unknown> | null };

/** Every fitplate.ingredient.v1 / v2 JSON block in the file. Malformed blocks are skipped and reported. */
export function parseJsonBlocks(text: string): { blocks: JsonBlock[]; errors: string[] } {
  const blocks: JsonBlock[] = [];
  const errors: string[] = [];
  const re = /```json\s*\n([\s\S]*?)\n```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    try {
      const parsed = JSON.parse(m[1]) as JsonBlock & { schema?: string };
      if (parsed.schema && PROFILE_SCHEMAS.has(parsed.schema)) blocks.push(parsed);
    } catch (e) {
      errors.push(`JSON block at offset ${m.index}: ${(e as Error).message}`);
    }
  }
  return { blocks, errors };
}

/** Maps a JSON nutrition block to NutrientPer100. "Not found" stays null; nothing is estimated. */
export function nutritionFromJson(n: Record<string, unknown> | null | undefined): NutrientPer100 | null {
  if (!n) return null;
  const source = typeof n.source === 'string' ? n.source : null;
  const ref = typeof n.source_ref === 'string' ? n.source_ref : null;
  const confidence = confidenceOf(typeof n.confidence === 'string' ? n.confidence : null);
  const value = (key: string): SourcedValue => {
    const v = n[key];
    const ok = typeof v === 'number' && Number.isFinite(v);
    return { value: ok ? v : null, source: ok ? [source, ref].filter(Boolean).join(': ') || null : null, confidence: ok ? confidence : null };
  };
  const basis = typeof n.basis === 'string' && /ml/i.test(n.basis) ? '100ml' : '100g';
  const out = { basis } as NutrientPer100;
  for (const [field, key] of JSON_FIELDS) out[field] = value(key);
  return out;
}

/** Normalises a JSON id ("green_chilli") to the app's kebab-case ids. */
export function normaliseId(raw: string): string {
  return slugify(raw.replace(/_/g, '-'));
}

/** Parses every ingredient in one ingredient research file. */
export function parseIngredientFile(text: string, file: string): { items: IngredientVersion[]; errors: string[] } {
  const date = fileDate(file);
  if (!date) throw new Error(`No date in file name: ${file}`);
  const sections = splitHeadings(text, 2).filter((s) => !/^summary/i.test(s.title));
  const { blocks, errors } = parseJsonBlocks(text);
  const items: IngredientVersion[] = [];

  for (const { name, cells } of parseSummary(text)) {
    const { english, aliases } = splitName(name);
    const id = ingredientId(name);
    const notes: string[] = [];
    // Section heading may spell the name slightly differently: match on the English part.
    const sec = sections.find((s) => slugify(splitName(plain(s.title)).english) === id);
    const sub = sec ? splitHeadings(sec.body, 3) : [];
    const body = (n: number, hint: RegExp) => (sub.find((s) => hint.test(s.title)) ?? sub.find((s) => s.n === n))?.body ?? '';
    if (!sec) notes.push('no detail section found');

    const range = rupeeRange(cells[3]);
    const statedAvg = rupee(cells[4]);
    let avg = statedAvg;
    if (range && avg != null && (avg < range.min || avg > range.max)) {
      notes.push(`average ₹${avg} outside range; ignored`);
      avg = null;
    }
    const per100 = /₹/.test(cells[5]) ? (rupeeRange(cells[5]) ?? (rupee(cells[5]) != null ? { min: rupee(cells[5]) as number, max: rupee(cells[5]) as number } : null)) : null;

    const sectionAliases = sec ? splitName(plain(sec.title)).aliases : [];
    const json = blocks.find((b) => (b.id && normaliseId(b.id) === id) || (b.name && ingredientId(b.name) === id));
    const substitutes = bullets(body(5, /substitutes/i))
      // "**Shallots (small/sambar onion):** same flavour…" or "Ghee: same richness…"
      .map((b) => /^\*\*(.+?)[:.]?\*\*/.exec(b)?.[1]?.replace(/:$/, '').trim() ?? /^([^:]{2,60}):/.exec(plain(b))?.[1]?.trim() ?? null)
      .filter((s): s is string => !!s);
    const storageBody = body(4, /storage/i);

    items.push({
      id,
      date,
      file,
      name: english,
      aliases: [...new Set([...aliases, ...sectionAliases])],
      category: plain(cells[1]).trim() || null,
      standardUnit: unitOf(cells[2]),
      price: range
        ? {
            min: range.min,
            max: range.max,
            avg,
            statedAvg,
            median: null,
            ...listingEvidence(parseListingTable(body(2, /price/i), 'ingredient'), range, ingredientPriceTolerance(range.max)),
          }
        : null,
      per100: per100 && per100.min <= per100.max ? per100 : null,
      sourcesChecked: num(/(\d+)/.exec(cells[6])?.[1]),
      confidence: confidenceOf(cells[7]),
      storage: storageBody ? (labelled(storageBody, ['Storage', 'Fridge', 'Pantry']) ?? (bullets(storageBody).map(plain).join(' ') || null)) : null,
      substitutes,
      macrosPer100: parseMacros(body(6, /nutrition/i)),
      nutritionPer100g: json ? nutritionFromJson(json.nutrition ?? null) : null,
      usedIn: parseUsedIn(body(7, /used in/i)),
      notes,
    });
  }
  return { items, errors };
}
```

### `src/services/data/buildItems.ts`

```ts
/**
 * Turns all research versions of one item into the app record (spec C.4):
 * normalise → cross-link → merge (section D) → validate. Rebuilding from every
 * version each run keeps output deterministic and idempotent: the same
 * ledger always gives the same JSON.
 */
import type { Dish, Ingredient, Macros, NutrientPer100, PriceEstimate, SourcedValue } from '../../models/research';
import type { DishVersion } from './dishImporter';
import type { IngredientVersion } from './ingredientImporter';
import { mergeOfficial, mergeStable, recipeChangedMaterially, unionList, type OfficialVersion } from './merge';
import { slugify, splitName } from './markdown';
import { checkPrice, type PriceCheckInput } from './priceChecks';
import { computePriceEstimate, SEASONAL_PRODUCE, type PriceObservation } from './priceTrend';
import { dishTags } from './tags';

const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);

/**
 * Drops the engine's extra fields into notes, and keeps a narrowed range
 * inside what research actually observed: rounding a ±15% band can reach
 * below the lowest price any source showed (idli: ₹70–100 → ₹60–90).
 */
function stripEngine(result: ReturnType<typeof computePriceEstimate>, observations: PriceObservation[]): { estimate: PriceEstimate; notes: string[] } {
  const { flags, notes, ...estimate } = result;
  const cur = estimate.currentEstimate;
  if (cur && observations.length > 0) {
    const lo = Math.min(...observations.map((o) => o.min));
    const hi = Math.max(...observations.map((o) => o.max));
    const min = Math.max(cur.min, lo);
    const max = Math.min(cur.max, hi);
    if (min <= cur.avg && cur.avg <= max && (min !== cur.min || max !== cur.max)) {
      notes.push(`range clamped to observed prices: ${cur.min}–${cur.max} → ${min}–${max}`);
      estimate.currentEstimate = { ...cur, min, max };
    }
  }
  return { estimate, notes: [...flags.map((f) => `price flag: ${f}`), ...notes] };
}

/**
 * Review 2026-10-15 FIX 2: checks the newest researched range (the one the
 * estimate follows) and stores the result on the merged price. Reasons go to
 * needs-review so the DATA SYNC REPORT lists them.
 */
function attachPriceCheck(
  estimate: PriceEstimate,
  newest: (PriceCheckInput & { statedAvg: number | null }) | null,
  date: string,
  review: string[],
): PriceEstimate {
  if (!newest) return estimate;
  const check = checkPrice({ ...newest, avg: newest.statedAvg });
  for (const n of check.checkNotes) review.push(`price not confirmed (${date}): ${n}`);
  return { ...estimate, ...check };
}

function mergeMacros(versions: { date: string; macros: Macros | null }[], label: string, notes: string[]): { value: Macros; method: string } {
  const out = {} as Macros;
  let method = 'none';
  for (const key of ['kcal', 'proteinG', 'carbsG', 'fatG', 'fibreG'] as const) {
    const merged = mergeStable(versions.map((v) => ({ date: v.date, value: v.macros?.[key] ?? null })));
    out[key] = merged.value;
    if (key === 'kcal') method = merged.method;
    for (const n of merged.notes) notes.push(`${label}.${key}: ${n}`);
  }
  return { value: out, method };
}

// ---------------------------------------------------------------- ingredients

/** Lookup from any spelling (English name, alias) to a canonical ingredient id. */
export type IngredientIndex = { byKey: Map<string, string>; ids: string[] };

export function buildIngredientIndex(items: { id: string; name: string; aliases: string[] }[]): IngredientIndex {
  const byKey = new Map<string, string>();
  for (const item of items) {
    byKey.set(item.id, item.id);
    byKey.set(slugify(item.name), item.id);
    for (const alias of item.aliases) {
      const key = slugify(alias);
      // An alias shared by two ingredients (e.g. "chawal") identifies neither.
      if (byKey.has(key) && byKey.get(key) !== item.id) byKey.set(key, '');
      else if (!byKey.has(key)) byKey.set(key, item.id);
    }
  }
  return { byKey, ids: items.map((i) => i.id) };
}

/**
 * Best-effort link from a dish's ingredient line to a canonical id: exact
 * English name, then a bracketed alias, then a whole-word prefix ("lemon
 * juice" → lemon). Unmatched lines stay null; Day 5 adds the full alias map.
 */
export function linkIngredient(name: string, index: IngredientIndex): string | null {
  const { english, aliases } = splitName(name);
  const key = slugify(english);
  const direct = index.byKey.get(key);
  if (direct) return direct;
  for (const alias of aliases) {
    const hit = index.byKey.get(slugify(alias));
    if (hit) return hit;
  }
  const prefixes = index.ids.filter((id) => key.startsWith(id + '-')).sort((a, b) => b.length - a.length);
  if (prefixes.length > 0) return prefixes[0];
  const longer = index.ids.filter((id) => id.startsWith(key + '-'));
  return longer.length === 1 ? longer[0] : null;
}

function per100From(estimate: PriceEstimate | null, unit: string | null): Ingredient['per100Estimate'] {
  const cur = estimate?.currentEstimate;
  if (!cur) return null;
  const factor = unit === 'kg' || unit === 'l' ? 0.1 : unit === 'g' || unit === 'ml' ? 100 : null;
  if (factor == null) return null;
  const r = (v: number) => Math.round(v * factor * 100) / 100;
  return { min: r(cur.min), max: r(cur.max), avg: r(cur.avg) };
}

const OFFICIAL = /\b(IFCT|USDA|FDC|ICMR|NIN)\b/i;

function mergeNutrient(versions: IngredientVersion[], notes: string[], review: string[]): NutrientPer100 | null {
  const withProfile = versions.filter((v) => v.nutritionPer100g);
  if (withProfile.length === 0) return null;
  const latest = withProfile[withProfile.length - 1].nutritionPer100g as NutrientPer100;
  const out = { basis: latest.basis } as NutrientPer100;
  for (const key of Object.keys(latest).filter((k) => k !== 'basis') as (keyof Omit<NutrientPer100, 'basis'>)[]) {
    type Held = OfficialVersion & { sv: SourcedValue };
    let prev = null as Held | null;
    for (const v of withProfile) {
      const sv = (v.nutritionPer100g as NutrientPer100)[key];
      const next: Held = { value: sv.value, citesOfficial: OFFICIAL.test(sv.source ?? ''), date: v.date, sv };
      const merged = mergeOfficial(prev, next);
      if (merged.note) notes.push(`nutritionPer100g.${key}: ${merged.note}`);
      if (merged.needsReview) review.push(`nutritionPer100g.${key} conflict`);
      // mergeOfficial returns one of the two values; keep that version's source with it.
      const held: Held = prev !== null && merged.value === prev.value && merged.value !== next.value ? prev : next;
      prev = { ...held, value: merged.value };
    }
    out[key] = prev?.sv ?? { value: null, source: null, confidence: null };
  }
  return out;
}

export function buildIngredient(all: IngredientVersion[], today: string): Ingredient & { needsReview: string[] } {
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const notes: string[] = [];
  const review: string[] = [];
  const mergeMethod: Record<string, string> = {};

  const seasonal = SEASONAL_PRODUCE.has(latest.id);
  const observations: PriceObservation[] = versions
    .filter((v) => v.price)
    .map((v) => ({ date: v.date, min: v.price!.min, max: v.price!.max, avg: v.price!.avg, confidence: v.confidence, sourceFile: v.file }));
  let price: PriceEstimate | null = null;
  if (observations.length > 0) {
    const { estimate, notes: n } = stripEngine(computePriceEstimate(observations, { today, seasonal, kind: 'ingredient' }), observations);
    const newest = [...versions].reverse().find((v) => v.price);
    price = attachPriceCheck(estimate, newest?.price ?? null, newest?.date ?? '', review);
    notes.push(...n);
    mergeMethod.price = `price engine (${estimate.method})`;
  }
  const newest = <K extends keyof IngredientVersion>(key: K): IngredientVersion[K] | null => {
    for (let i = versions.length - 1; i >= 0; i--) if (versions[i][key] != null) return versions[i][key];
    return null;
  };
  const macros = mergeMacros(versions.map((v) => ({ date: v.date, macros: v.macrosPer100 })), 'macrosPer100Estimate', notes);
  mergeMethod.macrosPer100Estimate = `stable (${macros.method})`;
  const nutritionPer100g = mergeNutrient(versions, notes, review);
  if (nutritionPer100g) mergeMethod.nutritionPer100g = 'official (D3)';
  mergeMethod.aliases = 'union';
  mergeMethod.substitutes = 'union';
  mergeMethod.storage = 'newest';
  mergeMethod.usedIn = 'newest';

  for (const v of versions) for (const n of v.notes) notes.push(`${v.date}: ${n}`);
  const unit = newest('standardUnit') as string | null;

  return {
    id: latest.id,
    name: latest.name,
    aliases: unionList(...versions.map((v) => v.aliases)),
    category: newest('category') as string | null,
    standardUnit: unit,
    price,
    per100Estimate: per100From(price, unit),
    seasonal,
    nutritionPer100g,
    macrosPer100Estimate: Object.values(macros.value).some((x) => x != null) ? macros.value : null,
    storage: newest('storage') as string | null,
    substitutes: unionList(...versions.map((v) => v.substitutes)),
    usedIn: latest.usedIn ?? [],
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod,
    mergeNotes: notes,
    needsReview: review,
  };
}

// ---------------------------------------------------------------- dishes

export function buildDish(all: DishVersion[], today: string, index: IngredientIndex): Dish {
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const notes: string[] = [];
  const priceReview: string[] = [];
  const mergeMethod: Record<string, string> = {};

  const nutrition = mergeMacros(versions.map((v) => ({ date: v.date, macros: v.nutrition })), 'nutritionPerServing', notes);
  mergeMethod.nutritionPerServing = `stable (${nutrition.method})`;

  const observations: PriceObservation[] = versions
    .filter((v) => v.orderPrice)
    .map((v) => ({ date: v.date, min: v.orderPrice!.min, max: v.orderPrice!.max, avg: v.orderPrice!.avg, confidence: null, sourceFile: v.file }));
  let orderPrice: PriceEstimate | null = null;
  if (observations.length > 0) {
    const { estimate, notes: n } = stripEngine(computePriceEstimate(observations, { today, seasonal: false, kind: 'dish' }), observations);
    const newest = [...versions].reverse().find((v) => v.orderPrice);
    orderPrice = attachPriceCheck(estimate, newest?.orderPrice ?? null, newest?.date ?? '', priceReview);
    notes.push(...n);
    mergeMethod.orderPrice = `price engine (${estimate.method})`;
  }

  if (versions.length > 1) {
    const prev = versions[versions.length - 2];
    const line = (v: DishVersion) => v.ingredients.map((i) => ({ ingredientId: linkIngredient(i.name, index), name: i.name, quantity: i.quantity }));
    if (recipeChangedMaterially(line(prev), line(latest))) notes.push(`recipe changed materially between ${prev.date} and ${latest.date}; newest recipe used`);
  }
  mergeMethod.ingredients = 'newest';
  mergeMethod.steps = 'newest';
  mergeMethod.healthiness = 'newest';
  mergeMethod.researchRating = 'newest';
  mergeMethod.sources = 'union';
  for (const v of versions) for (const n of v.notes) notes.push(`${v.date}: ${n}`);

  // As-ordered values are published numbers: keep the newest block; its price is the order price.
  const asOrdered = [...versions].reverse().find((v) => v.asOrdered)?.asOrdered ?? null;

  const dish: Dish = {
    id: latest.id,
    number: latest.number,
    name: latest.name,
    cuisine: latest.cuisine,
    dietType: latest.dietType,
    mealType: latest.mealType,
    difficulty: latest.difficulty,
    prepMin: latest.prepMin,
    cookMin: latest.cookMin,
    servings: 1,
    ingredients: latest.ingredients.map((i) => ({ ...i, ingredientId: linkIngredient(i.name, index) })),
    equipment: latest.equipment,
    steps: latest.steps,
    nutritionPerServing: nutrition.value,
    microNutrientsEstimate: null,
    asOrdered: asOrdered ? { ...asOrdered, price: orderPrice } : null,
    orderPrice,
    healthiness: latest.healthiness,
    researchRating: latest.researchRating,
    storage: latest.storage,
    leftoverRemix: latest.leftoverRemix,
    burnOff: latest.burnOff,
    sources: unionList(...versions.map((v) => v.sources)),
    allergens: latest.allergens,
    dietClaims: latest.dietClaims,
    fasting: latest.fasting,
    dietTags: latest.dietTags,
    tags: [],
    description: latest.description,
    // Set across all dishes by assignFamilies() in the runner; one dish alone can't know its family.
    familyId: null,
    variants: latest.variants,
    needsReview: [...latest.needsReview, ...priceReview],
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod,
    mergeNotes: notes,
  };
  const tagged = dishTags(dish);
  dish.tags = tagged.tags;
  dish.needsReview.push(...tagged.review);
  mergeMethod.tags = 'tag engine (tags.ts) on the merged dish';
  return dish;
}

/** Light validation before a record is written; problems block the write and go in the report. */
export function validateDish(d: Dish): string[] {
  const errs: string[] = [];
  if (!d.name) errs.push('no name');
  if (d.ingredients.length === 0) errs.push('no ingredients parsed');
  if (d.steps.length === 0) errs.push('no steps parsed');
  if (d.nutritionPerServing.kcal == null) errs.push('no calories parsed');
  if (d.steps.some((s, i) => s.n !== i + 1)) errs.push('steps not numbered 1..n');
  return errs;
}

export function validateIngredient(i: Ingredient): string[] {
  const errs: string[] = [];
  if (!i.name) errs.push('no name');
  if (!i.price) errs.push('no price parsed');
  const cur = i.price?.currentEstimate;
  if (cur && !(cur.min <= cur.avg && cur.avg <= cur.max)) errs.push('price estimate out of order');
  return errs;
}
```

### `src/services/data/nutrientImporter.ts`

```ts
/**
 * Nutrient research importer and builder (roadmap Day 5). Each
 * "FitPlate_Nutrients_YYYY-MM-DD.md" file holds two topics plus (from
 * 2026-10-12) one profile, each a "## N. Name" / "## PN. Name" section with
 * one JSON app-data block. The JSON's "type" decides the template:
 *   vitamin | mineral                → Template A → Nutrient
 *   hydration                        → Template B → Hydration
 *   guidance                         → Template C → Guidance
 *   condition | goal | diet_pattern  → Template D → HealthCondition
 * The markdown adds what the JSON lacks (unit conversions for salts and
 * derivatives, the drinks table's serving sizes). Everything here is pure:
 * text in, records out, so the runner and tests can rebuild from raw files.
 */
import type {
  AltUnit,
  BloodMarker,
  ConditionAdjustment,
  DefaultTargetGroup,
  DishRef,
  Drink,
  DrinkTableRow,
  FoodSource,
  GuidanceData,
  GuidanceRule,
  Guidance,
  HealthCondition,
  HealthConditionData,
  Hydration,
  HydrationData,
  LogPreset,
  Nutrient,
  NutrientData,
  NutrientLogPreset,
  NutrientTarget,
  ProfileTarget,
  TargetGroup,
  UnitConversion,
  UpperLimit,
} from '../../models/nutrient';
import { DEFAULT_TARGET_GROUPS, FOLLOW_DOCTOR_LINE, TARGET_GROUPS } from '../../models/nutrient';
import { fileDate } from './dishImporter';
import { normaliseId } from './ingredientImporter';
import { plain, slugify, splitHeadings, splitName, tableRows } from './markdown';
import { mergeOfficial, unionList, type OfficialVersion } from './merge';

// ---------------------------------------------------------------- versions

type VersionBase = {
  id: string;
  date: string;
  file: string;
  /** "3" for topic 3, "P1" for profile 1; null if the heading has no number. */
  topicNumber: string | null;
  /** Section heading without its number. */
  title: string;
  /** Problems found while reading this block (wrong value types); they become needs-review items. */
  notes: string[];
};

export type NutrientVersion = VersionBase & { kind: 'nutrient'; data: NutrientData; conversions: UnitConversion[] };
export type HydrationVersion = VersionBase & { kind: 'hydration'; data: HydrationData; drinksTable: DrinkTableRow[] };
export type GuidanceVersion = VersionBase & { kind: 'guidance'; data: GuidanceData };
export type ConditionVersion = VersionBase & { kind: 'condition'; data: HealthConditionData };
export type NutrientTopicVersion = NutrientVersion | HydrationVersion | GuidanceVersion | ConditionVersion;
export type NutrientTopicKind = NutrientTopicVersion['kind'];

// ---------------------------------------------------------------- units

const MICRO = /\b(?:mcg|ug)\b|μg/gi;

/** "mcg", "ug" and the Greek-mu "μg" are all the micro sign "µg"; lower case so "IU" and "iu" compare equal. */
function normUnit(u: string): string {
  return u.replace(MICRO, 'µg').trim().toLowerCase();
}

/** Lower case, Greek letters spelled out, brackets dropped: the form used to compare unit labels and names. */
function normText(s: string): string {
  return plain(s)
    .replace(MICRO, 'µg')
    .toLowerCase()
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/\s+/g, ' ')
    .trim();
}

function unitKey(u: string): string {
  return normText(u.replace(/\([^)]*\)/g, ' '));
}

/** The mass (or IU) unit an amount or limit is written in: "µg/day preformed vitamin A" → "µg". */
function baseUnit(u: string): string | null {
  const m = /^\s*(µg|μg|mcg|ug|mg|g|iu)(?![a-z])/i.exec(u);
  return m ? normUnit(m[1]) : null;
}

const MG_PER: Record<string, number> = { 'µg': 0.001, mg: 1, g: 1000 };

/**
 * Factor between two mass units. Used only to compare an upper limit or a
 * "To" column written in µg with a main unit of mg; SI prefixes are
 * definitions, not research numbers, so this never stands in for a missing
 * research factor on a label form.
 */
function massFactor(from: string, to: string): number | null {
  const a = MG_PER[from];
  const b = MG_PER[to];
  return a === undefined || b === undefined ? null : a / b;
}

/** Strips float noise (400 × 0.45 = 180.00000000000003) without hiding real decimals. */
function tidy(n: number): number {
  return Math.round(n * 100) / 100 + 0;
}

const sameNumber = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// ---------------------------------------------------------------- JSON reading

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Reads JSON fields defensively. A value of the wrong type is treated as
 * "not found" and noted for review, never coerced into a guess.
 */
class Reader {
  constructor(
    private readonly where: string,
    private readonly notes: string[],
  ) {}

  /** A needs-review note about this block that is not a wrong value type. */
  note(message: string): void {
    this.notes.push(`${this.where}: ${message}`);
  }

  private bad(key: string, v: unknown): void {
    this.notes.push(`${this.where}: "${key}" has unexpected value ${JSON.stringify(v)}; treated as not found`);
  }

  str(o: Obj, key: string): string {
    const v = o[key];
    if (v == null) return '';
    if (typeof v === 'string') return v.trim();
    this.bad(key, v);
    return '';
  }

  strOrNull(o: Obj, key: string): string | null {
    const s = this.str(o, key);
    return s === '' ? null : s;
  }

  num(o: Obj, key: string): number | null {
    const v = o[key];
    if (v == null) return null;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    this.bad(key, v);
    return null;
  }

  bool(o: Obj, key: string): boolean | null {
    const v = o[key];
    if (v == null) return null;
    if (typeof v === 'boolean') return v;
    this.bad(key, v);
    return null;
  }

  list(o: Obj, key: string): unknown[] {
    const v = o[key];
    if (v == null) return [];
    if (Array.isArray(v)) return v;
    this.bad(key, v);
    return [];
  }

  strs(o: Obj, key: string): string[] {
    return this.list(o, key).filter((x): x is string => {
      if (typeof x === 'string') return x.trim() !== '';
      this.bad(`${key}[]`, x);
      return false;
    });
  }

  nums(o: Obj, key: string): number[] {
    return this.list(o, key).filter((x): x is number => {
      if (typeof x === 'number' && Number.isFinite(x)) return true;
      this.bad(`${key}[]`, x);
      return false;
    });
  }

  objs(o: Obj, key: string): Obj[] {
    return this.list(o, key).filter((x): x is Obj => {
      if (isObj(x)) return true;
      this.bad(`${key}[]`, x);
      return false;
    });
  }

  oneOf<T extends string>(o: Obj, key: string, allowed: readonly T[]): T | null {
    const s = this.str(o, key);
    if (s === '') return null;
    const hit = allowed.find((a) => a === s.toLowerCase());
    if (hit) return hit;
    this.bad(key, s);
    return null;
  }
}

function dishRefs(r: Reader, o: Obj, key: string): DishRef[] {
  return r
    .objs(o, key)
    .map((d) => ({ dishNumber: r.num(d, 'dish_number'), dishName: r.str(d, 'dish_name') }))
    .filter((d) => d.dishNumber != null || d.dishName !== '');
}

// ---------------------------------------------------------------- markdown extras

/**
 * Rows of the "Unit conversions" table in a Template A section, e.g.
 * "| 1 mg benfotiamine | about 0.57 mg thiamine |". Rows without a clear
 * "N unit [form]" → "number [unit]" shape (energy formulas, "Not used") are
 * skipped rather than interpreted.
 */
export function parseUnitConversions(sectionBody: string, mainUnit: string): UnitConversion[] {
  const at = sectionBody.search(/unit conversions/i);
  if (at < 0) return [];
  const lines = sectionBody.slice(at).split('\n');
  const start = lines.findIndex((l) => l.trim().startsWith('|'));
  if (start < 0) return [];
  // Only the first table after the heading; a later table belongs to another sub-section.
  const end = lines.findIndex((l, i) => i > start && !l.trim().startsWith('|'));
  const table = lines.slice(start, end < 0 ? undefined : end).join('\n');
  const main = normUnit(mainUnit);
  const out: UnitConversion[] = [];
  for (const cells of tableRows(table)) {
    if (cells.length < 2) continue;
    const from = /^\s*(\d[\d,]*(?:\.\d+)?)\s*(µg|μg|mcg|ug|mg|g|iu)(?![a-z])\s*(.*)$/i.exec(plain(cells[0]));
    if (!from) continue;
    // "1/6 = 0.167 µg (ICMR 6:1)": the worked result follows the last "=".
    const toText = plain(cells[1]).split('=').pop() ?? '';
    const to = /(\d[\d,]*(?:\.\d+)?)\s*(µg|μg|mcg|ug|mg|g)?(?![a-z])/i.exec(toText);
    if (!to) continue;
    const fromAmount = Number(from[1].replace(/,/g, ''));
    const toAmount = Number(to[1].replace(/,/g, ''));
    // The "To" column is headed in the main unit; a unit written in the cell may still be a different mass unit.
    const toScale = to[2] ? massFactor(normUnit(to[2]), main) : 1;
    if (!(fromAmount > 0) || !Number.isFinite(toAmount) || toScale === null) continue;
    const compound = normText(from[3].replace(/\([^)]*\)/g, ' ')).replace(/^of\s+/, '');
    out.push({
      fromUnit: normUnit(from[2]),
      compound,
      toMainUnitFactor: Number(((toAmount * toScale) / fromAmount).toPrecision(6)),
      raw: `${cells[0]} | ${cells[1]}`,
    });
  }
  return out;
}

/** Template B section 7: Drink | Counts toward hydration? | Notes | Typical serving (ml). */
export function parseDrinksTable(sectionBody: string): DrinkTableRow[] {
  const sub = splitHeadings(sectionBody, 3).find((s) => /drinks?\s+table/i.test(s.title));
  if (!sub) return [];
  return tableRows(sub.body)
    .filter((c) => c.length >= 4 && plain(c[0]).trim() !== '')
    .map((c) => {
      const m = /(\d+(?:\.\d+)?)(?:\s*(?:[–-]|to)\s*(\d+(?:\.\d+)?))?/.exec(c[3]);
      const min = m ? Number(m[1]) : null;
      const max = m && m[2] ? Number(m[2]) : min;
      return {
        drink: plain(c[0]).trim(),
        counts: plain(c[1]).trim(),
        notes: plain(c[2]).trim(),
        typicalServingMl: min !== null && max !== null && min <= max ? { min, max } : null,
      };
    });
}

// ---------------------------------------------------------------- log presets (review FIX 2a)

type ConversionContext = { mainUnit: string; altUnits: AltUnit[]; conversions: UnitConversion[] };
type Candidate = { factor: number; source: 'same-unit' | 'alt_units' | 'markdown' };

function words(s: string): string[] {
  return s.split(/[^a-z0-9µ]+/).filter(Boolean);
}

function containsPhrase(text: string, phrase: string): boolean {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${esc}($|[^a-z0-9])`).test(text);
}

/**
 * Converts one preset to the nutrient's main unit with the research file's
 * own factors, in this order:
 * 1. a form named in the label that the markdown table converts
 *    ("Benfotiamine 150 mg" → × 0.57), because the unit alone ("mg") would
 *    wrongly count the derivative's weight as the vitamin;
 * 2. the main unit itself (factor 1);
 * 3. alt_units / markdown rows whose unit matches the preset's unit
 *    (exactly, else every word of the preset unit appears in the row).
 * Several different factors mean the form is ambiguous: no single amount,
 * a min–max range instead, and a review note.
 */
export function convertPreset(raw: { label: string; amount: number | null; unit: string }, ctx: ConversionContext): { preset: LogPreset; review: string | null } {
  const main = normUnit(ctx.mainUnit);
  const key = unitKey(raw.unit);
  const base = baseUnit(raw.unit);
  const label = normText(raw.label);
  let candidates: Candidate[] = [];

  if (base) {
    const named = ctx.conversions.filter((c) => c.compound !== '' && c.fromUnit === base && containsPhrase(label, c.compound));
    if (named.length > 0) {
      // "thiamine mononitrate" beats a bare "thiamine" row when both match.
      const longest = Math.max(...named.map((c) => c.compound.length));
      candidates = named.filter((c) => c.compound.length === longest).map((c) => ({ factor: c.toMainUnitFactor, source: 'markdown' }));
    }
  }
  if (candidates.length === 0 && key === main) candidates = [{ factor: 1, source: 'same-unit' }];
  if (candidates.length === 0) {
    const pool: (Candidate & { key: string })[] = [
      ...ctx.altUnits.map((a) => ({ key: unitKey(a.unit), factor: a.toMainUnitFactor, source: 'alt_units' as const })),
      ...ctx.conversions.map((c) => ({ key: unitKey(`${c.fromUnit} ${c.compound}`), factor: c.toMainUnitFactor, source: 'markdown' as const })),
    ];
    const exact = pool.filter((p) => p.key === key);
    const want = words(key);
    candidates = exact.length > 0 ? exact : want.length > 0 ? pool.filter((p) => want.every((w) => words(p.key).includes(w))) : [];
  }

  const factors = [...new Set(candidates.map((c) => c.factor))].sort((a, b) => a - b);
  const preset: LogPreset = { ...raw, toMainFactor: null, factorSource: null, mainAmount: null, mainAmountRange: null };
  if (factors.length === 1) {
    preset.toMainFactor = factors[0];
    preset.factorSource = candidates[0].source;
    preset.mainAmount = raw.amount === null ? null : factors[0] === 1 ? raw.amount : tidy(raw.amount * factors[0]);
    return { preset, review: null };
  }
  if (factors.length > 1) {
    const lo = factors[0];
    const hi = factors[factors.length - 1];
    if (raw.amount !== null) preset.mainAmountRange = { min: tidy(raw.amount * lo), max: tidy(raw.amount * hi) };
    return {
      preset,
      review: `log preset "${raw.label}": unit "${raw.unit}" matches several factors (${factors.join(', ')}); the form is ambiguous, so no single ${ctx.mainUnit} amount`,
    };
  }
  return { preset, review: `log preset "${raw.label}": no factor in the research file converts "${raw.unit}" to ${ctx.mainUnit}; main amount left empty` };
}

// ---------------------------------------------------------------- per-template JSON → data

function readNutrient(o: Obj, id: string, r: Reader): NutrientData {
  const ul = isObj(o.upper_limit) ? o.upper_limit : null;
  const defaults = isObj(o.app_default_target) ? o.app_default_target : {};
  const appDefaultTarget = {} as Record<DefaultTargetGroup, number | null>;
  for (const g of DEFAULT_TARGET_GROUPS) appDefaultTarget[g] = r.num(defaults, g);
  const upperLimit: UpperLimit | null = ul
    ? { value: r.num(ul, 'value'), unit: r.str(ul, 'unit'), appliesTo: r.oneOf(ul, 'applies_to', ['food_and_supplements', 'supplements_only'] as const), source: r.str(ul, 'source') }
    : null;
  return {
    id,
    name: r.str(o, 'name'),
    type: r.oneOf(o, 'type', ['vitamin', 'mineral'] as const) ?? 'vitamin',
    subtype: r.oneOf(o, 'subtype', ['fat-soluble', 'water-soluble', 'macromineral', 'trace-mineral'] as const),
    unit: r.str(o, 'unit'),
    altUnits: r
      .objs(o, 'alt_units')
      .map((a) => ({ unit: r.str(a, 'unit'), toMainUnitFactor: r.num(a, 'to_main_unit_factor') }))
      .filter((a): a is AltUnit => a.unit !== '' && a.toMainUnitFactor !== null),
    targets: r
      .objs(o, 'targets')
      .map((t) => ({ group: r.oneOf(t, 'group', TARGET_GROUPS), ear: r.num(t, 'ear'), rda: r.num(t, 'rda'), ai: r.num(t, 'ai'), source: r.str(t, 'source') }))
      .filter((t): t is NutrientTarget => t.group !== null),
    appDefaultTarget,
    upperLimit,
    topFoodSources: r
      .objs(o, 'top_food_sources')
      .map((f) => ({
        food: r.str(f, 'food'),
        veg: r.bool(f, 'veg'),
        per100g: r.num(f, 'per_100g'),
        servingG: r.num(f, 'serving_g'),
        servingLabel: r.str(f, 'serving_label'),
        perServing: r.num(f, 'per_serving'),
      }))
      .filter((f) => f.food !== ''),
    goodSourceDishes: dishRefs(r, o, 'good_source_dishes'),
    deficiencyRiskIndia: r.oneOf(o, 'deficiency_risk_india', ['low', 'moderate', 'high'] as const),
    absorptionBoosters: r.strs(o, 'absorption_boosters'),
    absorptionBlockers: r.strs(o, 'absorption_blockers'),
    // Converted in buildNutrient, against this version's own alt_units and markdown table.
    logPresets: r
      .objs(o, 'log_presets')
      .map((p) => ({ label: r.str(p, 'label'), amount: r.num(p, 'amount'), unit: r.str(p, 'unit') }))
      .filter((p) => p.label !== '')
      .map((p) => ({ ...p, toMainFactor: null, factorSource: null, mainAmount: null, mainAmountRange: null })),
    warnings: r.strs(o, 'warnings'),
    conditionAdjustments: r
      .objs(o, 'condition_adjustments')
      .map((c) => ({ profileId: r.str(c, 'profile_id'), change: r.str(c, 'change'), value: r.num(c, 'value'), unit: r.str(c, 'unit'), source: r.str(c, 'source') }))
      .filter((c) => c.profileId !== '' || c.change !== ''),
    lastResearched: r.strOrNull(o, 'last_researched'),
  };
}

function readHydration(o: Obj, id: string, title: string, r: Reader): HydrationData {
  return {
    id,
    type: 'hydration',
    name: r.strOrNull(o, 'name') ?? title,
    defaultTargetFormula: r.strOrNull(o, 'default_target_formula'),
    inputs: r.strs(o, 'inputs'),
    minMl: r.num(o, 'min_ml'),
    maxMl: r.num(o, 'max_ml'),
    quickAddPresetsMl: r.nums(o, 'quick_add_presets_ml'),
    drinks: r
      .objs(o, 'drinks')
      .map((d) => ({ name: r.str(d, 'name'), countsAsWaterPct: r.num(d, 'counts_as_water_pct'), notes: r.str(d, 'notes') }))
      .filter((d) => d.name !== ''),
    reminderRules: r
      .objs(o, 'reminder_rules')
      .map((x) => ({ rule: r.str(x, 'rule'), source: r.str(x, 'source') }))
      .filter((x) => x.rule !== ''),
    warnings: r.strs(o, 'warnings'),
    lastResearched: r.strOrNull(o, 'last_researched'),
  };
}

function readGuidance(o: Obj, id: string, title: string, r: Reader): GuidanceData {
  return {
    id,
    type: 'guidance',
    name: r.strOrNull(o, 'name') ?? title,
    rules: r
      .objs(o, 'rules')
      .map((x) => ({ if: r.str(x, 'if'), then: r.str(x, 'then'), source: r.str(x, 'source') }))
      .filter((x) => x.then !== ''),
    lastResearched: r.strOrNull(o, 'last_researched'),
  };
}

/** Target nutrients whose limit must come from the user's doctor (review 2026-10-15 FIX 1). */
const DOCTOR_LIMIT_NUTRIENT = /protein|potassium|phosphorus|fluid|water/i;

/**
 * Limits in a condition profile that the app must not show without a
 * doctor's number: a water max, a sodium max, or a protein / potassium /
 * phosphorus / fluid target with direction "limit". Empty when none.
 */
export function doctorLimits(d: Pick<HealthConditionData, 'waterMl' | 'sodiumMgMax' | 'targets'>): string[] {
  const out: string[] = [];
  if (d.waterMl?.max != null) out.push(`water max ${d.waterMl.max} ml`);
  if (d.sodiumMgMax != null) out.push(`sodium max ${d.sodiumMgMax} mg`);
  for (const t of d.targets) if (t.direction === 'limit' && DOCTOR_LIMIT_NUTRIENT.test(t.nutrient)) out.push(`${t.nutrient} limit`);
  return out;
}

/** SPEC-ADDENDA §8: any water or fluid number carries "Follow your doctor's advice". */
export function fluidNoteOf(d: Pick<HealthConditionData, 'waterMl' | 'targets'>): string | null {
  const water = d.waterMl != null && (d.waterMl.min != null || d.waterMl.max != null);
  const fluid = d.targets.some((t) => /fluid|water/i.test(t.nutrient) && [t.generalAdult, t.profileValue, t.min, t.max].some((v) => v != null));
  return water || fluid ? FOLLOW_DOCTOR_LINE : null;
}

function readCondition(o: Obj, id: string, title: string, type: HealthConditionData['type'], r: Reader): HealthConditionData {
  const water = isObj(o.water_ml) ? o.water_ml : null;
  const stated = r.bool(o, 'requires_doctor_input');
  const data: HealthConditionData = {
    id,
    type,
    name: r.strOrNull(o, 'name') ?? title,
    surveyQuestion: r.strOrNull(o, 'survey_question'),
    targets: r
      .objs(o, 'targets')
      .map((t) => ({
        nutrient: r.str(t, 'nutrient'),
        unit: r.str(t, 'unit'),
        generalAdult: r.num(t, 'general_adult'),
        profileValue: r.num(t, 'profile_value'),
        min: r.num(t, 'min'),
        max: r.num(t, 'max'),
        direction: r.oneOf(t, 'direction', ['raise', 'limit', 'same'] as const),
        source: r.str(t, 'source'),
      }))
      .filter((t) => t.nutrient !== ''),
    bloodMarkers: r
      .objs(o, 'blood_markers')
      .map((b) => ({ marker: r.str(b, 'marker'), target: r.str(b, 'target'), unit: r.str(b, 'unit'), source: r.str(b, 'source') }))
      .filter((b) => b.marker !== ''),
    waterMl: water ? { min: r.num(water, 'min'), max: r.num(water, 'max'), notes: r.str(water, 'notes') } : null,
    sodiumMgMax: r.num(o, 'sodium_mg_max'),
    dietaryCholesterolMgMax: r.num(o, 'dietary_cholesterol_mg_max'),
    foodsFavour: r.strs(o, 'foods_favour'),
    foodsLimit: r.strs(o, 'foods_limit'),
    goodFitDishes: dishRefs(r, o, 'good_fit_dishes'),
    cautionDishes: r
      .objs(o, 'caution_dishes')
      .map((d) => ({ dishNumber: r.num(d, 'dish_number'), dishName: r.str(d, 'dish_name'), reason: r.str(d, 'reason') }))
      .filter((d) => d.dishNumber != null || d.dishName !== ''),
    conflictsWith: r
      .objs(o, 'conflicts_with')
      .map((c) => ({ profileId: r.str(c, 'profile_id'), rule: r.str(c, 'rule') }))
      .filter((c) => c.profileId !== ''),
    // Missing means "not stated", which is not the same as "safe without a doctor": see below.
    requiresDoctorInput: stated ?? false,
    requiresDoctorInputStated: stated !== null,
    fluidNote: null,
    warnings: r.strs(o, 'warnings'),
    lastResearched: r.strOrNull(o, 'last_researched'),
  };
  // Review 2026-10-15 FIX 1: a profile that sets a water, sodium or protein/potassium/phosphorus/fluid
  // limit without stating the flag defaults to "ask your doctor". An explicit false stays false.
  if (stated === null) {
    const limits = doctorLimits(data);
    if (limits.length > 0) {
      data.requiresDoctorInput = true;
      r.note(`requires_doctor_input is missing but the profile sets ${limits.join(', ')}; set to true (the app asks for the doctor's number)`);
    }
  }
  data.fluidNote = fluidNoteOf(data);
  return data;
}

// ---------------------------------------------------------------- file parsing

type Heading = { offset: number; end: number; number: string | null; title: string };

function topicHeadings(text: string): Heading[] {
  const out: Heading[] = [];
  const re = /^## (.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const h = m[1].trim();
    const num = /^(P?\d+)\.\s+(.*)$/i.exec(h);
    if (out.length > 0) out[out.length - 1].end = m.index;
    out.push({ offset: m.index, end: text.length, number: num ? num[1].toUpperCase() : null, title: (num ? num[2] : h).trim() });
  }
  return out;
}

/**
 * Parses one nutrient research file into topic versions. A block that is
 * not valid JSON, has no id, or has an unknown "type" becomes an error
 * entry for the report (spec G: back to the backlog, never guessed).
 */
export function parseNutrientFile(text: string, file: string): { items: NutrientTopicVersion[]; errors: string[] } {
  const date = fileDate(file);
  if (!date) throw new Error(`No date in file name: ${file}`);
  const headings = topicHeadings(text);
  const items: NutrientTopicVersion[] = [];
  const errors: string[] = [];
  const withJson = new Set<Heading>();

  const re = /```json\s*\n([\s\S]*?)\n```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const at = m.index;
    const heading = [...headings].reverse().find((h) => h.offset < at) ?? null;
    if (heading) withJson.add(heading);
    const where = `${file} ${heading ? `§${heading.number ?? ''} ${heading.title}`.trim() : `offset ${at}`}`;
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1]);
    } catch (e) {
      errors.push(`${where}: malformed JSON (${(e as Error).message})`);
      continue;
    }
    if (!isObj(parsed)) {
      errors.push(`${where}: JSON block is not an object`);
      continue;
    }
    if (typeof parsed.id !== 'string' || parsed.id.trim() === '') {
      errors.push(`${where}: JSON block has no "id"`);
      continue;
    }
    const id = normaliseId(parsed.id);
    const type = typeof parsed.type === 'string' ? parsed.type.trim().toLowerCase() : '';
    const notes: string[] = [];
    const r = new Reader(`${date} ${id}`, notes);
    const body = heading ? text.slice(heading.offset, heading.end) : '';
    const title = heading?.title ?? id;
    const base = { id, date, file, topicNumber: heading?.number ?? null, title, notes };

    if (type === 'vitamin' || type === 'mineral') {
      const data = readNutrient(parsed, id, r);
      items.push({ ...base, kind: 'nutrient', data, conversions: parseUnitConversions(body, data.unit) });
    } else if (type === 'hydration') {
      items.push({ ...base, kind: 'hydration', data: readHydration(parsed, id, title, r), drinksTable: parseDrinksTable(body) });
    } else if (type === 'guidance') {
      items.push({ ...base, kind: 'guidance', data: readGuidance(parsed, id, title, r) });
    } else if (type === 'condition' || type === 'goal' || type === 'diet_pattern') {
      items.push({ ...base, kind: 'condition', data: readCondition(parsed, id, title, type, r) });
    } else {
      errors.push(`${where}: unknown "type" ${JSON.stringify(parsed.type)}; expected vitamin, mineral, hydration, guidance, condition, goal or diet_pattern`);
    }
  }

  for (const h of headings) {
    if (h.number !== null && !withJson.has(h)) errors.push(`${file} §${h.number} ${h.title}: no JSON app-data block`);
  }
  return { items, errors };
}

/** Groups versions of the same topic (kind + id), oldest first, ready for buildTopic. */
export function groupTopicVersions(items: NutrientTopicVersion[]): Map<string, NutrientTopicVersion[]> {
  const out = new Map<string, NutrientTopicVersion[]>();
  for (const v of items) {
    const key = `${v.kind}:${v.id}`;
    const list = out.get(key) ?? [];
    // Same id + date is the same version (ledger rule B): never count it twice.
    if (!list.some((x) => x.date === v.date)) list.push(v);
    out.set(key, list);
  }
  for (const list of out.values()) list.sort(byDate);
  return out;
}

// ---------------------------------------------------------------- merge helpers

const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);

type MergeLog = { notes: string[]; review: string[]; method: Record<string, string> };

/**
 * Official values (D3) across all versions, oldest first. Returns the kept
 * value and the date of the version it came from, so its source text can
 * travel with it.
 */
function officialSeries(
  series: { date: string; value: number | null; cites: boolean }[],
  label: string,
  log: MergeLog,
  opts: { safetyLimit?: boolean } = {},
): { value: number | null; date: string | null } {
  let held: OfficialVersion | null = null;
  for (const s of series) {
    const next: OfficialVersion = { value: s.value, citesOfficial: s.cites, date: s.date };
    const merged = mergeOfficial(held, next, opts);
    if (merged.note) log.notes.push(`${label}: ${merged.note}`);
    if (merged.needsReview) log.review.push(`${label}: ${merged.note ?? 'conflict'}`);
    // Hold the whole winning version (value, citation, date) so a third version is judged against it.
    if (held !== null && held.value !== null && merged.value === held.value && next.value !== merged.value) continue;
    if (held !== null && held.value !== null && next.value === null) continue;
    const sameAsHeld: boolean = held !== null && held.value !== null && next.value === held.value;
    held = { value: merged.value, citesOfficial: s.cites || (sameAsHeld && (held as OfficialVersion).citesOfficial), date: s.date };
  }
  return { value: held?.value ?? null, date: held && held.value !== null ? held.date : null };
}

/** Union of keyed records across versions (oldest first); a newer version's copy of a key replaces the older one in place. */
function unionBy<T>(lists: T[][], key: (t: T) => string): T[] {
  const out = new Map<string, T>();
  for (const list of lists) for (const item of list) out.set(key(item), item);
  return [...out.values()];
}

function newestText<T>(versions: T[], pick: (v: T) => string | null): string | null {
  for (let i = versions.length - 1; i >= 0; i--) {
    const s = pick(versions[i]);
    if (s) return s;
  }
  return null;
}

function provenance(versions: VersionBase[], log: MergeLog): { versions: { date: string; file: string }[]; mergeMethod: Record<string, string>; mergeNotes: string[]; needsReview: string[] } {
  const review = [...log.review];
  for (const v of versions) for (const n of v.notes) review.push(n);
  return {
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod: log.method,
    mergeNotes: log.notes,
    needsReview: [...new Set(review)],
  };
}

function checkFreshness(versions: VersionBase[], today: string, log: MergeLog): void {
  for (const v of versions) if (v.date > today) log.review.push(`version ${v.date} (${v.file}) is dated after today (${today})`);
}

const dishKey = (d: DishRef) => (d.dishNumber != null ? `#${d.dishNumber}` : slugify(d.dishName));
const foodKey = (f: FoodSource) => slugify(splitName(f.food).english) || slugify(f.food);

// ---------------------------------------------------------------- nutrients (Template A)

/** A row "cites the official table" when its source names ICMR and does not say the ICMR value was not found. */
const ICMR_MISSING = [/not found[^;.()]*\bICMR/i, /ICMR[^;()]*\bvalue\b[^;()]*not found/i];
export function isIcmrRow(t: Pick<NutrientTarget, 'source' | 'rda' | 'ai'>): boolean {
  return /\bICMR/i.test(t.source) && !ICMR_MISSING.some((re) => re.test(t.source)) && (t.rda ?? t.ai) !== null;
}

const ROWS_FOR: Record<DefaultTargetGroup, TargetGroup[]> = {
  adult_male: ['adult_male_sedentary', 'adult_male_moderate', 'adult_male_heavy'],
  adult_female: ['adult_female_sedentary', 'adult_female_moderate', 'adult_female_heavy'],
  pregnant: ['pregnant'],
  lactating: ['lactating'],
  age_60_plus: ['age_60_plus'],
};

/**
 * Review FIX 2c: an app default is only trusted when it equals the ICMR
 * RDA (or AI) of a row for that group. A default copied from a US/EFSA value
 * (Vitamin E pregnancy) or set where ICMR has no row (most age-60+ rows) is
 * nulled and flagged, so the app never presents it as an ICMR target.
 */
export function checkDefaultTargets(
  defaults: Record<DefaultTargetGroup, number | null>,
  targets: NutrientTarget[],
): { value: Record<DefaultTargetGroup, number | null>; review: string[] } {
  const value = { ...defaults };
  const review: string[] = [];
  for (const g of DEFAULT_TARGET_GROUPS) {
    const rows = targets.filter((t) => ROWS_FOR[g].includes(t.group));
    const icmr = rows.filter(isIcmrRow);
    const v = defaults[g];
    if (v === null) {
      if (icmr.length > 0) review.push(`app_default_target.${g} is empty although ICMR gives ${icmr.map((t) => `${t.group} ${t.rda ?? t.ai}`).join(', ')}`);
      continue;
    }
    if (icmr.some((t) => sameNumber((t.rda ?? t.ai) as number, v))) continue;
    value[g] = null;
    if (icmr.length > 0) {
      review.push(`app_default_target.${g} = ${v} does not equal the ICMR row (${icmr.map((t) => `${t.group} ${t.rda ?? t.ai}`).join(', ')}); set to null`);
    } else {
      const src = rows.map((t) => `${t.group}: "${t.source}"`).join('; ') || 'no row';
      review.push(`app_default_target.${g} = ${v} has no ICMR row to match (${src}); set to null`);
    }
  }
  return { value, review };
}

/** The adult upper limit in the main unit, or null when there is none or its unit can't be compared. */
function upperLimitInMain(ul: UpperLimit | null, mainUnit: string): number | null {
  if (!ul || ul.value === null) return null;
  const main = normUnit(mainUnit);
  const base = baseUnit(ul.unit) ?? main;
  const f = base === main ? 1 : massFactor(base, main);
  return f === null ? null : ul.value * f;
}

/** Review FIX 2b: a preset above the adult UL is a prescription dose, judged on the safe (higher) side of an ambiguous range. */
export function markPrescriptionDoses(presets: LogPreset[], ul: UpperLimit | null, mainUnit: string): NutrientLogPreset[] {
  const limit = upperLimitInMain(ul, mainUnit);
  return presets.map((p) => {
    const amount = p.mainAmountRange?.max ?? p.mainAmount;
    return { ...p, prescriptionDose: limit !== null && amount !== null && amount > limit };
  });
}

export function buildNutrient(all: NutrientVersion[], today: string): Nutrient {
  if (all.length === 0) throw new Error('buildNutrient: no versions');
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const log: MergeLog = { notes: [], review: [], method: {} };
  checkFreshness(versions, today, log);

  const units = [...new Set(versions.map((v) => normUnit(v.data.unit)).filter(Boolean))];
  if (units.length > 1) log.review.push(`main unit changed between versions (${units.join(' → ')}); values were not converted`);
  const unit = latest.data.unit;

  // Targets: each of EAR / RDA / AI is an official value (D3).
  const groups = TARGET_GROUPS.filter((g) => versions.some((v) => v.data.targets.some((t) => t.group === g)));
  const targets: NutrientTarget[] = groups.map((group) => {
    const rows = versions.map((v) => ({ date: v.date, row: v.data.targets.find((t) => t.group === group) ?? null }));
    const pick = (field: 'ear' | 'rda' | 'ai') =>
      officialSeries(
        rows.map(({ date, row }) => ({ date, value: row ? row[field] : null, cites: row ? isIcmrRow(row) : false })),
        `targets.${group}.${field}`,
        log,
      );
    const ear = pick('ear');
    const rda = pick('rda');
    const ai = pick('ai');
    // The source travels with the value the app will use (RDA, else AI).
    const fromDate = rda.value !== null ? rda.date : ai.value !== null ? ai.date : ear.date;
    const src = rows.find((x) => x.date === fromDate)?.row ?? [...rows].reverse().find((x) => x.row)?.row ?? null;
    return { group, ear: ear.value, rda: rda.value, ai: ai.value, source: src?.source ?? '' };
  });
  log.method.targets = 'official (D3)';

  // Upper limit: official and a safety limit, so a conflict keeps the lower value.
  const ulVersions = versions.filter((v) => v.data.upperLimit);
  const ulPick = officialSeries(
    ulVersions.map((v) => ({ date: v.date, value: v.data.upperLimit?.value ?? null, cites: /\bICMR/i.test(v.data.upperLimit?.source ?? '') })),
    'upperLimit',
    log,
    { safetyLimit: true },
  );
  const ulFrom = ulVersions.find((v) => v.date === ulPick.date) ?? ulVersions[ulVersions.length - 1];
  const upperLimit: UpperLimit | null = ulFrom?.data.upperLimit ? { ...ulFrom.data.upperLimit, value: ulPick.value } : null;
  log.method.upperLimit = 'official safety limit (D3, lower on conflict)';

  // Food sources: per-100 g values are IFCT-type official numbers; the rest of the row is descriptive (newest).
  const foods = unionBy(versions.map((v) => v.data.topFoodSources), foodKey).map((f) => {
    const per = officialSeries(
      versions.map((v) => ({ date: v.date, value: v.data.topFoodSources.find((x) => foodKey(x) === foodKey(f))?.per100g ?? null, cites: false })),
      `topFoodSources.${foodKey(f)}.per100g`,
      log,
    );
    return { ...f, per100g: per.value };
  });
  log.method.topFoodSources = 'union; per100g official (D3)';

  // Alt units: conversion constants; a changed factor keeps the previous one and asks a human.
  const altUnits = unionBy(versions.map((v) => v.data.altUnits), (a) => unitKey(a.unit)).map((a) => {
    const f = officialSeries(
      versions.map((v) => ({ date: v.date, value: v.data.altUnits.find((x) => unitKey(x.unit) === unitKey(a.unit))?.toMainUnitFactor ?? null, cites: false })),
      `altUnits.${a.unit}`,
      log,
    );
    return { unit: a.unit, toMainUnitFactor: f.value ?? a.toMainUnitFactor };
  });

  // Presets: each converted with its own file's factors (FIX 2a), newest copy of a label wins, then FIX 2b.
  const presetReviews = new Map<string, string>();
  const converted = versions.map((v) =>
    v.data.logPresets.map((p) => {
      const { preset, review } = convertPreset(p, { mainUnit: v.data.unit, altUnits: v.data.altUnits, conversions: v.conversions });
      const k = normText(p.label);
      if (review) presetReviews.set(k, review);
      else presetReviews.delete(k);
      return preset;
    }),
  );
  const presets = unionBy(converted, (p) => normText(p.label));
  for (const p of presets) {
    const r = presetReviews.get(normText(p.label));
    if (r) log.review.push(r);
  }
  const logPresets = markPrescriptionDoses(presets, upperLimit, unit);
  if (upperLimit?.value != null && upperLimitInMain(upperLimit, unit) === null) {
    log.review.push(`upperLimit unit "${upperLimit.unit}" cannot be compared with ${unit}; prescription doses not marked`);
  }
  log.method.logPresets = 'union by label (newest), converted with own file factors';

  const defaults = checkDefaultTargets(latest.data.appDefaultTarget, targets);
  log.review.push(...defaults.review);
  log.method.appDefaultTarget = 'newest, kept only where it equals the ICMR row';

  log.method.lists = 'union';
  log.method.warnings = 'union (never dropped)';
  log.method.text = 'newest';

  const risk = newestText(versions, (v) => v.data.deficiencyRiskIndia) as NutrientData['deficiencyRiskIndia'];
  const subtype = newestText(versions, (v) => v.data.subtype) as NutrientData['subtype'];
  return {
    id: latest.id,
    name: newestText(versions, (v) => v.data.name) ?? latest.title,
    type: latest.data.type,
    subtype,
    unit,
    altUnits,
    unitConversions: latest.conversions,
    targets,
    appDefaultTarget: defaults.value,
    upperLimit,
    topFoodSources: foods,
    goodSourceDishes: unionBy(versions.map((v) => v.data.goodSourceDishes), dishKey),
    deficiencyRiskIndia: risk,
    absorptionBoosters: unionList(...versions.map((v) => v.data.absorptionBoosters)),
    absorptionBlockers: unionList(...versions.map((v) => v.data.absorptionBlockers)),
    logPresets,
    warnings: unionList(...versions.map((v) => v.data.warnings)),
    conditionAdjustments: unionBy(versions.map((v) => v.data.conditionAdjustments), (c: ConditionAdjustment) => `${c.profileId}|${normText(c.change)}`),
    lastResearched: newestText(versions, (v) => v.data.lastResearched),
    ...provenance(versions, log),
  };
}

// ---------------------------------------------------------------- hydration (Template B)

export function buildHydration(all: HydrationVersion[], today: string): Hydration {
  if (all.length === 0) throw new Error('buildHydration: no versions');
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const log: MergeLog = { notes: [], review: [], method: {} };
  checkFreshness(versions, today, log);

  // The maximum is an overhydration safety cap: on conflict keep the lower one (D3).
  const maxMl = officialSeries(versions.map((v) => ({ date: v.date, value: v.data.maxMl, cites: false })), 'maxMl', log, { safetyLimit: true }).value;
  let minMl: number | null = null;
  for (const v of versions) {
    if (v.data.minMl === null) continue;
    if (minMl !== null && minMl !== v.data.minMl) log.notes.push(`minMl: ${minMl} → ${v.data.minMl} (${v.date}); kept the newest`);
    minMl = v.data.minMl;
  }
  log.method.maxMl = 'safety limit (lower on conflict)';
  log.method.minMl = 'newest';
  log.method.lists = 'union';

  return {
    id: latest.id,
    type: 'hydration',
    name: newestText(versions, (v) => v.data.name) ?? latest.title,
    defaultTargetFormula: newestText(versions, (v) => v.data.defaultTargetFormula),
    inputs: unionList(...versions.map((v) => v.data.inputs)),
    minMl,
    maxMl,
    quickAddPresetsMl: [...new Set(versions.flatMap((v) => v.data.quickAddPresetsMl))].sort((a, b) => a - b),
    drinks: unionBy(versions.map((v) => v.data.drinks), (d: Drink) => slugify(d.name)),
    drinksTable: unionBy(versions.map((v) => v.drinksTable), (d) => slugify(d.drink)),
    reminderRules: unionBy(versions.map((v) => v.data.reminderRules), (x) => normText(x.rule)),
    warnings: unionList(...versions.map((v) => v.data.warnings)),
    lastResearched: newestText(versions, (v) => v.data.lastResearched),
    ...provenance(versions, log),
  };
}

// ---------------------------------------------------------------- special topics (Template C)

export function buildGuidance(all: GuidanceVersion[], today: string): Guidance {
  if (all.length === 0) throw new Error('buildGuidance: no versions');
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const log: MergeLog = { notes: [], review: [], method: { rules: 'union (newest wording of the same rule)' } };
  checkFreshness(versions, today, log);
  return {
    id: latest.id,
    type: 'guidance',
    name: newestText(versions, (v) => v.data.name) ?? latest.title,
    rules: unionBy(versions.map((v) => v.data.rules), (x: GuidanceRule) => `${normText(x.if)}|${normText(x.then)}`),
    lastResearched: newestText(versions, (v) => v.data.lastResearched),
    ...provenance(versions, log),
  };
}

// ---------------------------------------------------------------- profiles (Template D)

/** Indian and international guideline bodies the profile PROMPT names; a target citing one "cites the official table". */
const GUIDELINE = /\b(ICMR|NIN|RSSDI|LAI|Lipid Association of India|ISH|ESC|KDIGO|FOGSI|WHO|ADA|AHA|NICE|EFSA|DGI)\b/i;

export function buildCondition(all: ConditionVersion[], today: string): HealthCondition {
  if (all.length === 0) throw new Error('buildCondition: no versions');
  const versions = [...all].sort(byDate);
  const latest = versions[versions.length - 1];
  const log: MergeLog = { notes: [], review: [], method: {} };
  checkFreshness(versions, today, log);

  const tKey = (t: ProfileTarget) => `${slugify(t.nutrient)}|${normUnit(t.unit)}`;
  const targets = unionBy(versions.map((v) => v.data.targets), tKey).map((t) => {
    const series = (field: 'generalAdult' | 'profileValue' | 'min' | 'max') =>
      versions.map((v) => {
        const row = v.data.targets.find((x) => tKey(x) === tKey(t));
        return { date: v.date, value: row ? row[field] : null, cites: row ? GUIDELINE.test(row.source) : false };
      });
    const label = `targets.${tKey(t)}`;
    return {
      ...t,
      generalAdult: officialSeries(series('generalAdult'), `${label}.generalAdult`, log).value,
      profileValue: officialSeries(series('profileValue'), `${label}.profileValue`, log).value,
      min: officialSeries(series('min'), `${label}.min`, log).value,
      // A maximum is a safety limit: the lower one on conflict.
      max: officialSeries(series('max'), `${label}.max`, log, { safetyLimit: true }).value,
    };
  });
  const safety = (pick: (d: HealthConditionData) => number | null, label: string) =>
    officialSeries(versions.map((v) => ({ date: v.date, value: pick(v.data), cites: false })), label, log, { safetyLimit: true }).value;
  const waterVersions = versions.filter((v) => v.data.waterMl);
  const waterMl = waterVersions.length
    ? {
        min: newestNumber(waterVersions.map((v) => v.data.waterMl?.min ?? null)),
        max: safety((d) => d.waterMl?.max ?? null, 'waterMl.max'),
        notes: newestText(waterVersions, (v) => v.data.waterMl?.notes || null) ?? '',
      }
    : null;

  const sodiumMgMax = safety((d) => d.sodiumMgMax, 'sodiumMgMax');
  // Stated true in any version wins (safety first). Otherwise the newest version decides, so an
  // explicit false overrides an older importer default; with nothing stated anywhere, the merged
  // limits decide (review 2026-10-15 FIX 1).
  const statedTrue = versions.some((v) => v.data.requiresDoctorInputStated && v.data.requiresDoctorInput);
  const anyStated = versions.some((v) => v.data.requiresDoctorInputStated);
  const latestDefaulted = !latest.data.requiresDoctorInputStated && latest.data.requiresDoctorInput;
  const requiresDoctorInput = statedTrue || latestDefaulted || (!anyStated && doctorLimits({ waterMl, sodiumMgMax, targets }).length > 0);
  if (requiresDoctorInput && !latest.data.requiresDoctorInput) {
    log.notes.push('requiresDoctorInput: an older version requires doctor input and the newest does not explain why; kept true (safety first)');
  }
  log.method.targets = 'official (D3); max as safety limit';
  log.method.limits = 'safety limit (lower on conflict)';
  log.method.lists = 'union';
  log.method.requiresDoctorInput = 'stated true in any version, else newest version (missing flag + limits → true)';

  return {
    id: latest.id,
    type: latest.data.type,
    name: newestText(versions, (v) => v.data.name) ?? latest.title,
    surveyQuestion: newestText(versions, (v) => v.data.surveyQuestion),
    targets,
    bloodMarkers: unionBy(versions.map((v) => v.data.bloodMarkers), (b: BloodMarker) => slugify(b.marker)),
    waterMl,
    sodiumMgMax,
    dietaryCholesterolMgMax: safety((d) => d.dietaryCholesterolMgMax, 'dietaryCholesterolMgMax'),
    foodsFavour: unionList(...versions.map((v) => v.data.foodsFavour)),
    foodsLimit: unionList(...versions.map((v) => v.data.foodsLimit)),
    goodFitDishes: unionBy(versions.map((v) => v.data.goodFitDishes), dishKey),
    cautionDishes: unionBy(versions.map((v) => v.data.cautionDishes), dishKey),
    conflictsWith: unionBy(versions.map((v) => v.data.conflictsWith), (c) => `${c.profileId}|${normText(c.rule)}`),
    requiresDoctorInput,
    requiresDoctorInputStated: anyStated,
    fluidNote: fluidNoteOf({ waterMl, targets }),
    warnings: unionList(...versions.map((v) => v.data.warnings)),
    lastResearched: newestText(versions, (v) => v.data.lastResearched),
    ...provenance(versions, log),
  };
}

function newestNumber(values: (number | null)[]): number | null {
  for (let i = values.length - 1; i >= 0; i--) if (values[i] !== null) return values[i];
  return null;
}

export type NutrientTopic = Nutrient | Hydration | Guidance | HealthCondition;

/** Builds one topic from all its versions (one kind + id, as grouped by groupTopicVersions). */
export function buildTopic(versions: NutrientTopicVersion[], today: string): { kind: NutrientTopicKind; item: NutrientTopic } {
  if (versions.length === 0) throw new Error('buildTopic: no versions');
  const kind = versions[0].kind;
  if (versions.some((v) => v.kind !== kind)) throw new Error(`buildTopic: mixed kinds for ${versions[0].id}`);
  switch (kind) {
    case 'nutrient':
      return { kind, item: buildNutrient(versions as NutrientVersion[], today) };
    case 'hydration':
      return { kind, item: buildHydration(versions as HydrationVersion[], today) };
    case 'guidance':
      return { kind, item: buildGuidance(versions as GuidanceVersion[], today) };
    case 'condition':
      return { kind, item: buildCondition(versions as ConditionVersion[], today) };
  }
}

// ---------------------------------------------------------------- validation (spec G)

const MAIN_UNITS = new Set(['µg', 'mg', 'g']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Problems that block writing a nutrient record; they go to the report and the topic back to the backlog. */
export function validateNutrient(n: Nutrient): string[] {
  const errs: string[] = [];
  if (!n.id) errs.push('no id');
  if (!n.name) errs.push('no name');
  if (!n.unit) errs.push('no main unit');
  else if (!MAIN_UNITS.has(normUnit(n.unit))) errs.push(`main unit "${n.unit}" is not µg, mg or g`);
  if (n.targets.length === 0) errs.push('no targets');
  if (n.lastResearched !== null && !ISO_DATE.test(n.lastResearched)) errs.push(`last_researched "${n.lastResearched}" is not YYYY-MM-DD`);

  const negative = (label: string, v: number | null) => {
    if (v !== null && v < 0) errs.push(`${label} is negative (${v})`);
  };
  for (const t of n.targets) {
    negative(`targets.${t.group}.ear`, t.ear);
    negative(`targets.${t.group}.rda`, t.rda);
    negative(`targets.${t.group}.ai`, t.ai);
    if (t.ear !== null && t.rda !== null && t.ear > t.rda) errs.push(`targets.${t.group}: EAR ${t.ear} above RDA ${t.rda}`);
  }
  for (const g of DEFAULT_TARGET_GROUPS) negative(`appDefaultTarget.${g}`, n.appDefaultTarget[g]);
  negative('upperLimit.value', n.upperLimit?.value ?? null);
  for (const a of n.altUnits) if (!(a.toMainUnitFactor > 0)) errs.push(`altUnits "${a.unit}" factor must be above 0 (${a.toMainUnitFactor})`);
  for (const f of n.topFoodSources) {
    negative(`topFoodSources.${f.food}.per100g`, f.per100g);
    negative(`topFoodSources.${f.food}.servingG`, f.servingG);
    negative(`topFoodSources.${f.food}.perServing`, f.perServing);
  }
  for (const p of n.logPresets) {
    negative(`logPresets "${p.label}".amount`, p.amount);
    if (!p.unit) errs.push(`logPresets "${p.label}" has no unit`);
  }

  const ul = upperLimitInMain(n.upperLimit, n.unit);
  if (ul !== null) {
    for (const t of n.targets) {
      const need = t.rda ?? t.ai;
      if (need !== null && ul < need) errs.push(`upper limit ${ul} ${n.unit} is below ${t.group} ${t.rda !== null ? 'RDA' : 'AI'} ${need}`);
    }
  }
  return errs;
}

export function validateHydration(h: Hydration): string[] {
  const errs: string[] = [];
  if (!h.id) errs.push('no id');
  if (h.minMl !== null && h.minMl < 0) errs.push(`minMl is negative (${h.minMl})`);
  if (h.minMl !== null && h.maxMl !== null && h.minMl > h.maxMl) errs.push(`minMl ${h.minMl} above maxMl ${h.maxMl}`);
  if (h.quickAddPresetsMl.some((x) => x <= 0)) errs.push('quick-add preset of 0 ml or less');
  for (const d of h.drinks) {
    if (d.countsAsWaterPct !== null && (d.countsAsWaterPct < 0 || d.countsAsWaterPct > 100)) errs.push(`drink "${d.name}" counts_as_water_pct ${d.countsAsWaterPct} outside 0–100`);
  }
  return errs;
}

export function validateGuidance(g: Guidance): string[] {
  const errs: string[] = [];
  if (!g.id) errs.push('no id');
  if (g.rules.length === 0) errs.push('no rules');
  return errs;
}

export function validateCondition(c: HealthCondition): string[] {
  const errs: string[] = [];
  if (!c.id) errs.push('no id');
  if (!c.name) errs.push('no name');
  for (const t of c.targets) {
    for (const k of ['generalAdult', 'profileValue', 'min', 'max'] as const) {
      const v = t[k];
      if (v !== null && v < 0) errs.push(`targets.${t.nutrient}.${k} is negative (${v})`);
    }
    if (t.min !== null && t.max !== null && t.min > t.max) errs.push(`targets.${t.nutrient}: min ${t.min} above max ${t.max}`);
  }
  for (const [k, v] of [['sodiumMgMax', c.sodiumMgMax], ['dietaryCholesterolMgMax', c.dietaryCholesterolMgMax]] as const) {
    if (v !== null && v < 0) errs.push(`${k} is negative (${v})`);
  }
  return errs;
}

// ---------------------------------------------------------------- cross-linking (spec F3–F5)

export type NutrientCrossLinks = {
  id: string;
  unit: string;
  /** F4: dish numbers to recommend when this nutrient is low. */
  goodSourceDishNumbers: number[];
  /** Dishes named without a number; the runner lists them as unmatched rather than guessing. */
  unnumberedDishes: string[];
  /** F3: per-100 g values to link to ingredient ids (in `unit` per 100 g). */
  foodSources: { food: string; per100g: number | null; unit: string; veg: boolean | null }[];
};

export function nutrientCrossLinks(n: Nutrient): NutrientCrossLinks {
  return {
    id: n.id,
    unit: n.unit,
    goodSourceDishNumbers: n.goodSourceDishes.map((d) => d.dishNumber).filter((x): x is number => x !== null),
    unnumberedDishes: n.goodSourceDishes.filter((d) => d.dishNumber === null).map((d) => d.dishName),
    foodSources: n.topFoodSources.map((f) => ({ food: f.food, per100g: f.per100g, unit: n.unit, veg: f.veg })),
  };
}

/** F5: drinks that count toward the water target, from the JSON and (with serving sizes) the markdown table. */
export function hydrationCrossLinks(h: Hydration): { id: string; drinks: Drink[]; drinksTable: DrinkTableRow[] } {
  return { id: h.id, drinks: h.drinks, drinksTable: h.drinksTable };
}

/** Dish number → ids of nutrients it is a good source of (for "fill the gap" suggestions). */
export function dishNutrientIndex(nutrients: Nutrient[]): Record<number, string[]> {
  const out: Record<number, string[]> = {};
  for (const n of nutrients) {
    for (const num of nutrientCrossLinks(n).goodSourceDishNumbers) {
      const list = (out[num] ??= []);
      if (!list.includes(n.id)) list.push(n.id);
    }
  }
  return out;
}
```

### `src/services/data/tags.ts`

```ts
/**
 * Tag engine (SPEC-ADDENDA §9). Computes a dish's search and chip tags at
 * import time from data that has already been checked. A tag appears only when
 * the data supports it; nothing here is guessed.
 *
 * - Vegan / Gluten-free / Dairy-free: only from a research claim that the
 *   Day 04 allergen check kept. "No gluten detected" is never "Gluten-free".
 * - Jain / Navratri / Ekadashi: only from a validated fasting line of "yes".
 *   A Jain "with changes" line, or a researched Jain variant, gives "Jain option".
 * - Contains …: from the allergen list (derived plus what research declared).
 * - Nutrition tags use the dish research's own thresholds (PATCH 04 A):
 *   High protein ≥ 15 g, High fibre ≥ 6 g, Low calorie ≤ 300 kcal per serving.
 * - Time bands use prep + cook minutes: Under 15 / 30 / 60 min.
 */
import type { Dish, DishVariant } from '../../models/research';
import { ALLERGEN_LABELS } from './allergens';

export const TAG = {
  veg: 'Veg',
  egg: 'Egg',
  nonVeg: 'Non-veg',
  vegan: 'Vegan',
  jain: 'Jain',
  jainOption: 'Jain option',
  veganOption: 'Vegan option',
  glutenFree: 'Gluten-free',
  glutenFreeOption: 'Gluten-free option',
  dairyFree: 'Dairy-free',
  dairyFreeOption: 'Dairy-free option',
  vegOption: 'Veg option',
  pescatarian: 'Pescatarian',
  sattvik: 'No onion-garlic',
  navratri: 'Navratri / vrat',
  ekadashi: 'Ekadashi',
  ramadan: 'Ramadan sehri / iftar',
  fastingFriendly: 'Fasting-friendly',
  highProtein: 'High protein',
  highFibre: 'High fibre',
  lowCalorie: 'Low calorie',
} as const;

/** Thresholds from dish research PROMPT_PATCH_04 (A), per 1 serving. */
export const NUTRITION_THRESHOLDS = { highProteinG: 15, highFibreG: 6, lowCalorieKcal: 300 } as const;

export function containsTag(label: string): string {
  return `Contains ${label.toLowerCase()}`;
}

/** Onion and garlic, for checking a researched "no onion / no garlic" Yes against the recipe. */
const ONION_GARLIC = /\b(onions?|kanda|pyaz|spring onion|shallots?|garlic|lahsun|lehsun)\b/i;
/** Meat and poultry, for checking a researched "Pescatarian: Yes". Fish and seafood are fine. */
const MEAT = /\b(chicken|mutton|goat|lamb|beef|pork|keema|meat)\b/i;
/** Fish and seafood, for showing the Pescatarian chip. */
const SEAFOOD = /\b(fish|prawns?|shrimps?|crabs?|squid|mussels?|clams?|lobster|surmai|pomfret|bangda|mackerel|rohu|hilsa|tuna|salmon|sardines?|anchov(y|ies))\b/i;

function title(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/** "South Indian (Tamil Nadu; also …)" → "South Indian". */
export function cuisineTag(cuisine: string | null): string | null {
  if (!cuisine) return null;
  const short = cuisine.replace(/\(.*$/, '').split(/[/;,]/)[0].trim();
  return short.length > 0 && short.length <= 30 ? short : null;
}

export function timeBand(prepMin: number | null, cookMin: number | null): string | null {
  if (prepMin == null && cookMin == null) return null;
  const total = (prepMin ?? 0) + (cookMin ?? 0);
  if (total <= 0) return null;
  if (total <= 15) return 'Under 15 min';
  if (total <= 30) return 'Under 30 min';
  if (total <= 60) return 'Under 60 min';
  return null;
}

function hasVariant(variants: DishVariant[], category: RegExp): boolean {
  return variants.some((v) => v.status === 'variant' && category.test(v.category));
}

type TagInput = Pick<
  Dish,
  'dietType' | 'dietClaims' | 'fasting' | 'allergens' | 'mealType' | 'cuisine' | 'difficulty' | 'prepMin' | 'cookMin' | 'nutritionPerServing' | 'dietTags' | 'variants' | 'ingredients'
>;

export type TagResult = { tags: string[]; review: string[] };

/** All tags for one dish, in display order: diet first, then allergens, meal, cuisine, time, nutrition. */
export function dishTags(d: TagInput): TagResult {
  const tags: string[] = [];
  const review: string[] = [];
  const add = (t: string | null) => {
    if (t && !tags.includes(t)) tags.push(t);
  };
  const names = d.ingredients.map((i) => i.name);

  add(d.dietType === 'veg' ? TAG.veg : d.dietType === 'egg' ? TAG.egg : d.dietType === 'non-veg' ? TAG.nonVeg : null);
  if (d.dietClaims.includes('vegan')) add(TAG.vegan);
  if (d.fasting?.jain.status === 'yes') add(TAG.jain);
  else if (d.fasting?.jain.status === 'with-changes' || hasVariant(d.variants, /jain/i)) add(TAG.jainOption);
  if (!d.dietClaims.includes('vegan') && hasVariant(d.variants, /vegan/i)) add(TAG.veganOption);
  if (d.dietClaims.includes('glutenFree')) add(TAG.glutenFree);
  else if (hasVariant(d.variants, /gluten/i)) add(TAG.glutenFreeOption);
  if (d.dietClaims.includes('dairyFree')) add(TAG.dairyFree);
  else if (hasVariant(d.variants, /dairy/i)) add(TAG.dairyFreeOption);
  if (d.dietType !== 'veg' && hasVariant(d.variants, /^veg/i)) add(TAG.vegOption);

  // Other researched diet types (§8), each checked against the recipe before it becomes a tag.
  if (d.dietTags?.sattvik.status === 'yes') {
    if (names.some((n) => ONION_GARLIC.test(n))) review.push('"No onion / no garlic: Yes" but the recipe has onion or garlic; tag not shown');
    else add(TAG.sattvik);
  }
  if (d.dietTags?.pescatarian.status === 'yes') {
    if (names.some((n) => MEAT.test(n))) review.push('"Pescatarian: Yes" but the recipe has meat or poultry; tag not shown');
    // The chip only on dishes with fish or seafood (review 2026-10-15, fix 3): on every veg
    // dish it would crowd the title. Veg dishes still match a Pescatarian filter in search.
    else if (names.some((n) => SEAFOOD.test(n))) add(TAG.pescatarian);
  }

  const nav = d.fasting?.navratri.status === 'yes';
  const eka = d.fasting?.ekadashi.status === 'yes';
  if (nav) add(TAG.navratri);
  if (eka) add(TAG.ekadashi);
  if (d.fasting?.ramadan.status === 'yes') add(TAG.ramadan);
  if (nav || eka) add(TAG.fastingFriendly);

  for (const a of d.allergens) add(containsTag(ALLERGEN_LABELS[a]));

  for (const m of d.mealType) add(title(m));
  add(cuisineTag(d.cuisine));
  add(timeBand(d.prepMin, d.cookMin));
  if (d.difficulty) add(d.difficulty);

  const n = d.nutritionPerServing;
  if (n.proteinG != null && n.proteinG >= NUTRITION_THRESHOLDS.highProteinG) add(TAG.highProtein);
  if (n.fibreG != null && n.fibreG >= NUTRITION_THRESHOLDS.highFibreG) add(TAG.highFibre);
  if (n.kcal != null && n.kcal <= NUTRITION_THRESHOLDS.lowCalorieKcal) add(TAG.lowCalorie);

  return { tags, review };
}

// ---------------------------------------------------------------- families

/**
 * Words that name a diet or protein version of the same dish. "Chicken
 * Biryani" and "Veg Biryani" share the key "biryani"; "Masala Dosa" and
 * "Rava Dosa" do not, because rava and masala change the dish itself.
 */
const VERSION_WORDS = /^(chicken|mutton|lamb|goat|egg|fish|prawns?|shrimp|veg|vegetable|jain|vegan|paneer|soya|tofu|mushroom)\b\s*/i;

export function familyKey(name: string): string {
  let base = name.replace(/\(.*?\)/g, '').trim();
  let prev = '';
  while (prev !== base) {
    prev = base;
    base = base.replace(VERSION_WORDS, '');
  }
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type FamilyLink = { familyId: string; dishIds: string[]; how: 'name' | 'research-variant' };

/**
 * Groups dishes into variant families. Dishes whose names differ only by a
 * version word share a group; a research link ("Vegetarian variant: Veg Fried
 * Rice (FitPlate dish 10)") joins the two dishes' groups. Groups that share a
 * dish are merged (union-find), so every dish lands in exactly one family,
 * named after its lowest-numbered dish (review 2026-10-15, fix 3). A family
 * needs at least two dishes. Name matches are listed in the DATA SYNC REPORT.
 */
export function assignFamilies(dishes: Pick<Dish, 'id' | 'number' | 'name' | 'variants'>[]): { familyOf: Map<string, string>; links: FamilyLink[] } {
  const byNumber = new Map(dishes.map((d) => [d.number, d]));
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression keeps later lookups flat.
    let cur = id;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(rb, ra);
  };
  for (const d of dishes) parent.set(d.id, d.id);

  const byKey = new Map<string, string>();
  for (const d of dishes) {
    const key = familyKey(d.name);
    if (!key) continue;
    const first = byKey.get(key);
    if (first) union(first, d.id);
    else byKey.set(key, d.id);
  }
  const researchLinked = new Set<string>();
  for (const d of dishes) {
    for (const v of d.variants) {
      const other = v.linkedDishNumber != null ? byNumber.get(v.linkedDishNumber) : undefined;
      if (other && other.id !== d.id) {
        union(d.id, other.id);
        researchLinked.add(d.id);
        researchLinked.add(other.id);
      }
    }
  }

  const groups = new Map<string, Pick<Dish, 'id' | 'number' | 'name' | 'variants'>[]>();
  for (const d of dishes) {
    const root = find(d.id);
    groups.set(root, [...(groups.get(root) ?? []), d]);
  }
  const familyOf = new Map<string, string>();
  const links: FamilyLink[] = [];
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const lowest = members.reduce((a, b) => (b.number < a.number ? b : a));
    const familyId = familyKey(lowest.name) || lowest.id;
    const ids = members.map((m) => m.id).sort();
    for (const id of ids) familyOf.set(id, familyId);
    links.push({ familyId, dishIds: ids, how: ids.some((id) => researchLinked.has(id)) ? 'research-variant' : 'name' });
  }
  links.sort((a, b) => a.familyId.localeCompare(b.familyId));
  return { familyOf, links };
}
```

### `src/services/data/crossLinks.ts`

```ts
/**
 * Cross-linking the research streams (spec section F, roadmap Day 5).
 * Pure functions over already-built items; the runner writes the results to
 * src/data/research/ingredients/aliases.json and src/data/research/links.json.
 *
 * Never guesses: a name that doesn't resolve through the alias map stays
 * unmatched and is listed in the DATA SYNC REPORT.
 */
import type { Dish, Ingredient, NutrientPer100 } from '../../models/research';
import { buildIngredientIndex, linkIngredient, type IngredientIndex } from './buildItems';
import { slugify, splitName } from './markdown';

// ---------------------------------------------------------------- F1 alias map

export type AliasMap = Record<string, string>;

/**
 * Brackets in dish lines also hold notes ("optional", "for the stir-fry",
 * "e.g. Amul", "25% fat"). Only short, plain names are learned as aliases.
 */
const NOT_A_NAME = /\b(optional|for|e|g|eg|or|and|any|about|approx|fat|chopped|sliced|diced|petals|store|bought|homemade|amul|mdh|everest|tata|catch|brand|see|step|plus|extra|to|taste|dry|dried|fresh|frozen|refined|cut|into|squares|cubes|pieces|pureed|puree|split|whole|ground|grated|minced|crushed|soaked|boiled|cooked|raw|ripe|thin|thick|peeled|deseeded|finely|roughly|halved|julienned|large|medium)\b/;

export function looksLikeName(alias: string): boolean {
  const key = slugify(alias);
  return key.length >= 3 && !/\d/.test(key) && key.split('-').length <= 3 && !NOT_A_NAME.test(key.replace(/-/g, ' '));
}

/**
 * Spelling → canonical id, from the ingredient files (names, Indian names) and
 * from dish files: when a dish line links by its English name, its bracketed
 * Indian names ("Cumin seeds (jeera)") become aliases too. An alias that two
 * ingredients claim is dropped, since it identifies neither.
 */
export function buildAliasMap(ingredients: Pick<Ingredient, 'id' | 'name' | 'aliases'>[], dishes: Pick<Dish, 'ingredients'>[]): { aliases: AliasMap; learned: { alias: string; id: string }[]; ambiguous: string[] } {
  const owners = new Map<string, Set<string>>();
  const claim = (raw: string, id: string) => {
    const key = slugify(raw);
    if (!key) return;
    (owners.get(key) ?? owners.set(key, new Set()).get(key)!).add(id);
  };
  for (const i of ingredients) {
    claim(i.id, i.id);
    claim(i.name, i.id);
    for (const a of i.aliases) claim(a, i.id);
  }
  const fromFiles = new Set(owners.keys());
  const index = buildIngredientIndex(ingredients);
  const learned: { alias: string; id: string }[] = [];
  for (const d of dishes) {
    for (const line of d.ingredients) {
      const { english, aliases } = splitName(line.name);
      // Only a direct English-name hit is trusted enough to teach new aliases.
      const id = index.byKey.get(slugify(english));
      if (!id) continue;
      for (const a of aliases) {
        const key = slugify(a);
        if (!key || fromFiles.has(key) || !looksLikeName(a)) continue;
        if (!owners.has(key)) learned.push({ alias: key, id });
        claim(a, id);
      }
    }
  }
  const aliases: AliasMap = {};
  const ambiguous: string[] = [];
  for (const [key, ids] of [...owners.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (ids.size === 1) aliases[key] = [...ids][0];
    else ambiguous.push(`${key} (${[...ids].sort().join(', ')})`);
  }
  const unique = learned.filter((l) => aliases[l.alias] === l.id);
  return { aliases, learned: unique, ambiguous };
}

/** An IngredientIndex that also knows the learned aliases. */
export function indexWithAliases(ingredients: Pick<Ingredient, 'id' | 'name' | 'aliases'>[], aliases: AliasMap): IngredientIndex {
  const index = buildIngredientIndex(ingredients);
  for (const [key, id] of Object.entries(aliases)) if (!index.byKey.has(key)) index.byKey.set(key, id);
  return index;
}

export type LinkStats = { lines: number; linked: number; priced: number; unmatched: { dishId: string; name: string }[] };

export function linkStats(dishes: Pick<Dish, 'id' | 'ingredients'>[], ingredients: Pick<Ingredient, 'id' | 'price'>[]): LinkStats {
  const priced = new Set(ingredients.filter((i) => i.price?.currentEstimate).map((i) => i.id));
  const stats: LinkStats = { lines: 0, linked: 0, priced: 0, unmatched: [] };
  for (const d of dishes) {
    for (const line of d.ingredients) {
      stats.lines++;
      if (line.ingredientId) {
        stats.linked++;
        if (priced.has(line.ingredientId)) stats.priced++;
      } else if (!/^water\b/i.test(line.name) && !(line.quantity == null && /^[A-Za-z]+$/.test(line.name.trim()))) {
        // Water isn't bought, and one-word rows with no quantity ("Marinade", "Dough") are table sub-headings.
        stats.unmatched.push({ dishId: d.id, name: line.name });
      }
    }
  }
  return stats;
}

// ---------------------------------------------------------------- F3 micronutrients

/** Nutrient-stream ids for the fields of the ingredient profile (SPEC-ADDENDA §2). */
export const PROFILE_TO_NUTRIENT: Partial<Record<keyof Omit<NutrientPer100, 'basis'>, { id: string; unit: string }>> = {
  ironMg: { id: 'iron', unit: 'mg' },
  calciumMg: { id: 'calcium', unit: 'mg' },
  potassiumMg: { id: 'potassium', unit: 'mg' },
  magnesiumMg: { id: 'magnesium', unit: 'mg' },
  zincMg: { id: 'zinc', unit: 'mg' },
  sodiumMg: { id: 'sodium', unit: 'mg' },
  vitaminCMg: { id: 'vitamin-c', unit: 'mg' },
  vitaminAUgRae: { id: 'vitamin-a', unit: 'µg' },
  folateUgDfe: { id: 'folate', unit: 'µg' },
  cholesterolMg: { id: 'cholesterol', unit: 'mg' },
  phosphorusMg: { id: 'phosphorus', unit: 'mg' },
  seleniumUg: { id: 'selenium', unit: 'µg' },
  copperMg: { id: 'copper', unit: 'mg' },
  manganeseMg: { id: 'manganese', unit: 'mg' },
  iodineUg: { id: 'iodine', unit: 'µg' },
  vitaminDUg: { id: 'vitamin-d', unit: 'µg' },
  vitaminEMg: { id: 'vitamin-e', unit: 'mg' },
  vitaminKUg: { id: 'vitamin-k', unit: 'µg' },
  thiaminMg: { id: 'thiamine', unit: 'mg' },
  riboflavinMg: { id: 'riboflavin', unit: 'mg' },
  niacinMg: { id: 'niacin', unit: 'mg' },
  vitaminB6Mg: { id: 'vitamin-b6', unit: 'mg' },
  vitaminB12Ug: { id: 'vitamin-b12', unit: 'µg' },
};

export type MicroCell = { per100: number; unit: string; source: string };
/** ingredientId → nutrientId → value per 100 g (or 100 ml). */
export type MicroTable = Record<string, Record<string, MicroCell>>;

/** The minimum a nutrient topic needs to give for cross-linking. */
export type NutrientSourceInput = {
  id: string;
  unit: string;
  topFoodSources: { food: string; per100g: number | null }[];
};

/**
 * Builds the ingredient micronutrient table. The ingredient research profile
 * (IFCT / USDA, per ingredient) wins; a nutrient topic's food-source table
 * fills a gap only when its food name resolves to an ingredient id.
 */
export function buildMicroTable(ingredients: Pick<Ingredient, 'id' | 'nutritionPer100g'>[], nutrients: NutrientSourceInput[], index: IngredientIndex): { table: MicroTable; fromNutrientStream: number; unmatchedFoods: string[] } {
  const table: MicroTable = {};
  for (const ing of ingredients) {
    const p = ing.nutritionPer100g;
    if (!p) continue;
    for (const [field, target] of Object.entries(PROFILE_TO_NUTRIENT) as [keyof Omit<NutrientPer100, 'basis'>, { id: string; unit: string }][]) {
      const sv = p[field];
      if (sv?.value == null) continue;
      (table[ing.id] ??= {})[target.id] = { per100: sv.value, unit: target.unit, source: `ingredient research (${sv.source ?? 'source not given'})` };
    }
  }
  let fromNutrientStream = 0;
  const unmatchedFoods = new Set<string>();
  for (const n of nutrients) {
    for (const f of n.topFoodSources) {
      if (f.per100g == null) continue;
      const id = linkIngredient(f.food, index);
      if (!id) {
        unmatchedFoods.add(f.food);
        continue;
      }
      const row = (table[id] ??= {});
      if (row[n.id]) continue;
      row[n.id] = { per100: f.per100g, unit: n.unit, source: `nutrient research (${n.id} food sources)` };
      fromNutrientStream++;
    }
  }
  return { table, fromNutrientStream, unmatchedFoods: [...unmatchedFoods].sort() };
}

const GRAMS: Record<string, number> = { g: 1, kg: 1000, ml: 1, l: 1000 };

/**
 * Estimated micronutrients per serving from ingredient quantities. Only lines
 * measured in g / kg / ml / l count (household units need Day 8's converter
 * and research densities). Coverage is the share of that measured weight
 * whose ingredient has any micronutrient data; under 100% it's a partial estimate.
 */
export function dishMicros(dish: Pick<Dish, 'ingredients'>, table: MicroTable): Dish['microNutrientsEstimate'] {
  let measured = 0;
  let covered = 0;
  const values: Record<string, number> = {};
  for (const line of dish.ingredients) {
    const factor = line.unit ? GRAMS[line.unit] : undefined;
    if (line.quantity == null || factor == null) continue;
    const grams = line.quantity * factor;
    measured += grams;
    const row = line.ingredientId ? table[line.ingredientId] : undefined;
    if (!row || Object.keys(row).length === 0) continue;
    covered += grams;
    for (const [nid, cell] of Object.entries(row)) values[nid] = (values[nid] ?? 0) + (cell.per100 * grams) / 100;
  }
  if (measured === 0 || covered === 0) return null;
  const rounded: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(values).sort(([a], [b]) => a.localeCompare(b))) rounded[k] = Math.round(v * 10) / 10;
  const coveragePct = Math.round((covered / measured) * 100);
  return { values: rounded, coveragePct, basis: coveragePct < 100 ? 'partial estimate from ingredient quantities' : 'estimate from ingredient quantities' };
}

/** Energy from the same table route, to compare with the dish file's own kcal (SPEC-ADDENDA §2: flag > 25%). */
export function dishKcalFromIngredients(dish: Pick<Dish, 'ingredients'>, ingredients: Map<string, Pick<Ingredient, 'nutritionPer100g'>>): { kcal: number; coveragePct: number } | null {
  let measured = 0;
  let covered = 0;
  let kcal = 0;
  for (const line of dish.ingredients) {
    const factor = line.unit ? GRAMS[line.unit] : undefined;
    if (line.quantity == null || factor == null) continue;
    const grams = line.quantity * factor;
    measured += grams;
    const e = line.ingredientId ? ingredients.get(line.ingredientId)?.nutritionPer100g?.energyKcal.value : null;
    if (e == null) continue;
    covered += grams;
    kcal += (e * grams) / 100;
  }
  if (covered === 0) return null;
  return { kcal: Math.round(kcal), coveragePct: Math.round((covered / measured) * 100) };
}

// ---------------------------------------------------------------- F4–F7 link tables

export type GoodSourceInput = { id: string; goodSourceDishes: { dishNumber: number; dishName: string }[] };

/** nutrientId → dishes research names as good sources; inApp tells which are bundled yet. */
export function goodSourceLinks(nutrients: GoodSourceInput[], dishes: Pick<Dish, 'id' | 'number'>[]) {
  const byNumber = new Map(dishes.map((d) => [d.number, d.id]));
  const byNutrient: Record<string, { dishNumber: number; dishName: string; dishId: string | null }[]> = {};
  const byDish: Record<string, string[]> = {};
  for (const n of nutrients) {
    byNutrient[n.id] = n.goodSourceDishes.map((g) => ({ ...g, dishId: byNumber.get(g.dishNumber) ?? null }));
    for (const g of byNutrient[n.id]) if (g.dishId) (byDish[g.dishId] ??= []).push(n.id);
  }
  for (const k of Object.keys(byDish)) byDish[k].sort();
  return { byNutrient, byDish };
}

export type UsedInMismatch = { ingredientId: string; dishNumber: number; ingredientFile: string; dishTable: string };

/**
 * F7: compares an ingredient file's "Used in" quantity with the dish's own
 * table. Both in g/ml and more than 15% apart (the recipe-change threshold) → listed.
 */
export function usedInMismatches(ingredients: Pick<Ingredient, 'id' | 'usedIn'>[], dishes: Pick<Dish, 'number' | 'ingredients'>[]): UsedInMismatch[] {
  const byNumber = new Map(dishes.map((d) => [d.number, d]));
  const out: UsedInMismatch[] = [];
  for (const ing of ingredients) {
    for (const u of ing.usedIn) {
      const dish = byNumber.get(u.dishNumber);
      if (!dish || u.quantity == null || !u.unit) continue;
      const line = dish.ingredients.find((l) => l.ingredientId === ing.id);
      if (!line || line.quantity == null || !line.unit) continue;
      const a = u.quantity * (GRAMS[u.unit] ?? NaN);
      const b = line.quantity * (GRAMS[line.unit] ?? NaN);
      if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) continue;
      if (Math.abs(a - b) / b > 0.15) out.push({ ingredientId: ing.id, dishNumber: u.dishNumber, ingredientFile: `${u.quantity} ${u.unit}`, dishTable: `${line.quantity} ${line.unit}` });
    }
  }
  return out;
}
```

### `src/models/research.ts`

```ts
/**
 * Research content types. These ship as bundled JSON (never in Firestore).
 * Field names follow the spec's DEFAULT ARCHITECTURE; the importers on Days 4–5
 * fill them from the research files, and null always means "not found".
 */

export type Confidence = 'High' | 'Medium' | 'Low';

export type Provenance = {
  versions: { date: string; file: string }[];
  mergeMethod: Record<string, string>;
  mergeNotes: string[];
};

/** Output of the price trend engine (spec section E). */
export type PriceEstimate = {
  priceHistory: { date: string; min: number; max: number; avg: number; confidence: Confidence | null; sourceFile: string }[];
  currentEstimate: { min: number; max: number; avg: number } | null;
  method: 'single' | 'wma' | 'latest-trend' | 'spike-blend';
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
  change30dPct: number | null;
  lastObserved: string | null;
  stale: boolean;
  seasonal: boolean;
} & Partial<PriceCheck>;

/**
 * Review 2026-10-15 FIX 2: what backs the newest researched range, and
 * whether it passes the checks in services/data/priceChecks.ts. Optional on
 * PriceEstimate so records built before the check still type-check; a missing
 * `confirmed` means "not checked", which the app treats as not confirmed.
 */
export type PriceCheck = {
  /** Distinct listings (table rows) whose price backs the range; null when the file's table could not be read. */
  listingCount: number | null;
  /** Platforms of those listings (e.g. ["Swiggy", "Zomato"]); empty when not readable. */
  platforms: string[];
  /** A listing used for the range is marked out of stock (dishes: outlet closed / not taking orders). */
  outOfStock: boolean;
  /** True only when every check passes; only confirmed prices may be shown as a headline or used for "money saved". */
  confirmed: boolean;
  /** Why the price is not confirmed (empty when confirmed). */
  checkNotes: string[];
};

export type SourcedValue = { value: number | null; source: string | null; confidence?: Confidence | null };

export type Macros = { kcal: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null; fibreG: number | null };

export type DishIngredient = { ingredientId: string | null; name: string; quantity: number | null; unit: string | null; householdMeasure: string | null };

/** Review 2026-10-11 FIX 1: the ten allergen groups FitPlate tags. */
export const ALLERGEN_IDS = ['peanut', 'treeNut', 'milk', 'egg', 'fish', 'shellfish', 'gluten', 'soy', 'sesame', 'mustard'] as const;
export type AllergenId = (typeof ALLERGEN_IDS)[number];

/** "Free-from" claims a dish file may make; the importer drops any its own ingredients contradict. */
export type DietClaim = 'vegan' | 'glutenFree' | 'dairyFree';

export type FastingStatus = 'yes' | 'no' | 'with-changes' | null;
export type FastingLine = { status: FastingStatus; reason: string | null };
/** SPEC-ADDENDA §7 (PROMPT_PATCH_02): null when the dish file predates the block. */
export type FastingSuitability = { navratri: FastingLine; ekadashi: FastingLine; jain: FastingLine; ramadan: FastingLine };

/** One "**Diet tags**" line (dish research PATCH 03). What research says; the tag engine checks it. */
export type DietLine = { status: 'yes' | 'no' | 'with-changes' | null; reason: string | null };
export type DietTagLines = {
  base: string | null;
  jain: DietLine;
  vegan: DietLine;
  pescatarian: DietLine;
  /** "No onion / no garlic (sattvik)". */
  sattvik: DietLine;
  glutenFree: DietLine;
  dairyFree: DietLine;
  /** Allergens the research itself lists, mapped to FitPlate ids; null when the line is missing. */
  allergensDeclared: AllergenId[] | null;
};

/** One entry of the "**Diet variants**" block (dish research PATCH 04). Variant recipes come only from research. */
export type DishVariant = {
  category: string;
  status: 'variant' | 'already-fits' | 'not-appropriate' | null;
  name: string | null;
  origin: 'established' | 'fitplate-created' | null;
  /** When the variant is another FitPlate dish ("Veg Fried Rice (FitPlate dish 10)"). */
  linkedDishNumber: number | null;
  /** Why it already fits or isn't appropriate. */
  reason: string | null;
};

export type DishStep = {
  n: number;
  /** Bold lead-in of the step, e.g. "Rinse the poha". */
  title: string | null;
  text: string;
  timerSec: number | null;
  tip: string | null;
  visualCue: string | null;
  cameraCheck: string | null;
  videoShot: string | null;
};

export type Dish = Provenance & {
  id: string;
  number: number;
  name: string;
  cuisine: string | null;
  dietType: 'veg' | 'egg' | 'non-veg' | null;
  mealType: string[];
  difficulty: string | null;
  prepMin: number | null;
  cookMin: number | null;
  servings: 1;
  ingredients: DishIngredient[];
  equipment: string[];
  steps: DishStep[];
  /** As-cooked recipe nutrition per serving. Never mixed with `asOrdered`. */
  nutritionPerServing: Macros;
  microNutrientsEstimate: { values: Record<string, number | null>; coveragePct: number; basis: string } | null;
  /** SPEC-ADDENDA §1: what restaurants publish for the delivered dish. */
  asOrdered: {
    price: PriceEstimate | null;
    nutrition: { calories: SourcedValue; protein: SourcedValue; carbs: SourcedValue; fat: SourcedValue; fibre: SourcedValue } | null;
    restaurantsSampled: number | null;
    platforms: string[];
  } | null;
  orderPrice: PriceEstimate | null;
  /** "Healthiness score" (out of 10) of the home-cooked recipe. One of the THREE separate scores. */
  healthiness: { score: number | null; restaurantScore: number | null; reasons: string[] } | null;
  /** "Rating" from research. One of the THREE separate scores. */
  researchRating: { score: number | null; basis: string | null } | null;
  storage: string | null;
  leftoverRemix: string | null;
  burnOff: string | null;
  sources: string[];
  /** Review FIX 1: derived from the ingredient list; empty means none detected, not "allergen-free". */
  allergens: AllergenId[];
  /** Claims kept after the allergen check. */
  dietClaims: DietClaim[];
  fasting: FastingSuitability | null;
  /** SPEC-ADDENDA §9: PATCH 03 lines as researched (null before 2026-10-12 files). */
  dietTags: DietTagLines | null;
  /** SPEC-ADDENDA §9: search and chip tags from the tag engine (tags.ts); only what the data supports. */
  tags: string[];
  /** PATCH 04 description sentence; null for older files. */
  description: string | null;
  /** SPEC-ADDENDA §9: family of diet variants (e.g. "biryani"); null when the dish has no sibling. */
  familyId: string | null;
  variants: DishVariant[];
  /** Import validators' findings; listed under "needs review" in the DATA SYNC REPORT. */
  needsReview: string[];
};

export type NutrientPer100 = {
  basis: '100g' | '100ml';
  energyKcal: SourcedValue;
  proteinG: SourcedValue;
  carbsG: SourcedValue;
  sugarsG: SourcedValue;
  fatG: SourcedValue;
  saturatedFatG: SourcedValue;
  fibreG: SourcedValue;
  sodiumMg: SourcedValue;
  ironMg: SourcedValue;
  calciumMg: SourcedValue;
  potassiumMg: SourcedValue;
  magnesiumMg: SourcedValue;
  zincMg: SourcedValue;
  vitaminCMg: SourcedValue;
  vitaminAUgRae: SourcedValue;
  folateUgDfe: SourcedValue;
  // Ingredient PATCH_02 (schema v2, from 2026-10-12); null for v1 profiles.
  waterG: SourcedValue;
  cholesterolMg: SourcedValue;
  transFatG: SourcedValue;
  mufaG: SourcedValue;
  pufaG: SourcedValue;
  omega3G: SourcedValue;
  addedSugarsG: SourcedValue;
  phosphorusMg: SourcedValue;
  seleniumUg: SourcedValue;
  copperMg: SourcedValue;
  manganeseMg: SourcedValue;
  iodineUg: SourcedValue;
  vitaminDUg: SourcedValue;
  vitaminEMg: SourcedValue;
  vitaminKUg: SourcedValue;
  thiaminMg: SourcedValue;
  riboflavinMg: SourcedValue;
  niacinMg: SourcedValue;
  vitaminB6Mg: SourcedValue;
  vitaminB12Ug: SourcedValue;
};

export type Ingredient = Provenance & {
  id: string;
  name: string;
  aliases: string[];
  category: string | null;
  standardUnit: string | null;
  price: PriceEstimate | null;
  per100Estimate: { min: number; max: number; avg: number } | null;
  seasonal: boolean;
  /** SPEC-ADDENDA §2 profile; null until a research file carries it. */
  nutritionPer100g: NutrientPer100 | null;
  /** Older files' one-line macro estimate ("About N kcal | Protein …"), kept apart from the official profile. */
  macrosPer100Estimate: Macros | null;
  storage: string | null;
  substitutes: string[];
  /** Spec F7: dishes the ingredient file says use it, with the quantity it gives (newest version). */
  usedIn: { dishNumber: number; quantity: number | null; unit: string | null; raw: string }[];
};

/**
 * Nutrient, Hydration, Guidance (nutrition) and HealthCondition types live in
 * ./nutrient; Exercise and fitness Guidance in ./exercise (Day 5). Import them
 * from those modules: both have a `Guidance` type, so neither is re-exported here.
 */
```

### `src/models/nutrient.ts`

```ts
/**
 * Nutrient-research content types (vitamins and minerals, water and
 * hydration, special topics, and from 2026-10-12 goal / health-condition /
 * diet-pattern profiles). Field names follow the JSON blocks of
 * nutrient-research/PROMPT.md, camelCased. null always means "not found in
 * the research"; the build never fills a gap with its own number.
 */
import type { Provenance } from './research';

// ---------------------------------------------------------------- shared

/** Every merged topic carries the importer's open questions for Sudarsan (DATA SYNC REPORT "needs review"). */
type Reviewed = Provenance & { needsReview: string[] };

export type DishRef = { dishNumber: number | null; dishName: string };

// ---------------------------------------------------------------- vitamins and minerals (Template A)

/** Allowed "group" values of a targets row (PROMPT Template A). */
export const TARGET_GROUPS = [
  'adult_male_sedentary',
  'adult_male_moderate',
  'adult_male_heavy',
  'adult_female_sedentary',
  'adult_female_moderate',
  'adult_female_heavy',
  'pregnant',
  'lactating',
  'age_60_plus',
] as const;
export type TargetGroup = (typeof TARGET_GROUPS)[number];

/** Keys of "app_default_target". */
export const DEFAULT_TARGET_GROUPS = ['adult_male', 'adult_female', 'pregnant', 'lactating', 'age_60_plus'] as const;
export type DefaultTargetGroup = (typeof DEFAULT_TARGET_GROUPS)[number];

export type NutrientTarget = {
  group: TargetGroup;
  ear: number | null;
  rda: number | null;
  ai: number | null;
  /** Free text from research, e.g. "ICMR-NIN 2020 (RDA via secondary summary; EAR not found)". */
  source: string;
};

/** "alt_units": one label unit and how many main units one of it is. */
export type AltUnit = { unit: string; toMainUnitFactor: number };

/**
 * A conversion stated in the topic's markdown "Unit conversions" table, e.g.
 * "| 1 mg benfotiamine | about 0.57 mg thiamine |". Some label forms (salts,
 * derivatives) only appear here, not in alt_units.
 */
export type UnitConversion = {
  /** Unit of the "From" side, normalised (µg, mg, g, IU…). */
  fromUnit: string;
  /** The named form, lower-cased, e.g. "benfotiamine"; '' when the row is a bare unit ("1 mg"). */
  compound: string;
  /** Main units per one fromUnit of that form. */
  toMainUnitFactor: number;
  /** The table row as written, for the review report. */
  raw: string;
};

export type UpperLimit = {
  value: number | null;
  /** As written, e.g. "µg/day preformed vitamin A (retinol)"; the leading mass unit is what comparisons use. */
  unit: string;
  appliesTo: 'food_and_supplements' | 'supplements_only' | null;
  source: string;
};

export type FoodSource = {
  food: string;
  veg: boolean | null;
  /** Official per-100 g value (IFCT 2017 where the research found it), in the nutrient's main unit. */
  per100g: number | null;
  servingG: number | null;
  servingLabel: string;
  perServing: number | null;
};

/**
 * One supplement quick-log choice. Review 2026-10-11 FIX 2: the research
 * stores presets in mixed units (label IU, salt or derivative mg), so each is
 * converted to the main unit with the file's own factor. The label values are
 * kept as written so the logging screen can show what is on the pack.
 */
export type LogPreset = {
  label: string;
  /** Label amount as written in research; null for "enter label value" presets. */
  amount: number | null;
  unit: string;
  /** Main units per one `unit`; null when the file gives no factor or several that disagree. */
  toMainFactor: number | null;
  factorSource: 'same-unit' | 'alt_units' | 'markdown' | null;
  /** amount × toMainFactor; null when either is unknown. */
  mainAmount: number | null;
  /**
   * When the form is ambiguous (e.g. "tocopheryl acetate" without d-/dl-), the
   * spread of possible main amounts: the app counts min toward the target and
   * max toward the upper limit, which is the safe side.
   */
  mainAmountRange: { min: number; max: number } | null;
};

/** Merged preset: adds the prescription-dose flag, set against the merged adult upper limit. */
export type NutrientLogPreset = LogPreset & {
  /**
   * The converted amount is above the adult upper limit: the app shows
   * "(prescription dose)" and never offers it as a quick choice.
   */
  prescriptionDose: boolean;
};

export type ConditionAdjustment = {
  profileId: string;
  change: string;
  value: number | null;
  unit: string;
  source: string;
};

/** The JSON block of one research version, camelCased (before merging). */
export type NutrientData = {
  id: string;
  name: string;
  type: 'vitamin' | 'mineral';
  subtype: 'fat-soluble' | 'water-soluble' | 'macromineral' | 'trace-mineral' | null;
  unit: string;
  altUnits: AltUnit[];
  targets: NutrientTarget[];
  appDefaultTarget: Record<DefaultTargetGroup, number | null>;
  upperLimit: UpperLimit | null;
  topFoodSources: FoodSource[];
  goodSourceDishes: DishRef[];
  deficiencyRiskIndia: 'low' | 'moderate' | 'high' | null;
  absorptionBoosters: string[];
  absorptionBlockers: string[];
  logPresets: LogPreset[];
  warnings: string[];
  /** Added to Template A on 2026-10-12; [] in older files. */
  conditionAdjustments: ConditionAdjustment[];
  lastResearched: string | null;
};

export type Nutrient = Reviewed &
  Omit<NutrientData, 'logPresets'> & {
    /** Markdown conversions from the newest version, kept for the logging screen's custom entries. */
    unitConversions: UnitConversion[];
    logPresets: NutrientLogPreset[];
  };

// ---------------------------------------------------------------- water and hydration (Template B)

export type Drink = { name: string; countsAsWaterPct: number | null; notes: string };

/** A row of the markdown "Drinks table" (section 7); it carries the serving size the JSON lacks. */
export type DrinkTableRow = {
  drink: string;
  /** "Counts toward hydration?" as written (e.g. "Yes", "Mostly", "Partly"). */
  counts: string;
  notes: string;
  typicalServingMl: { min: number; max: number } | null;
};

export type HydrationData = {
  id: string;
  type: 'hydration';
  /** From the section heading; the JSON block has no name key. */
  name: string;
  /** Plain-text formula as researched; the app's target engine interprets it (Day 17). */
  defaultTargetFormula: string | null;
  /** Inputs the formula uses, e.g. weight_kg, sex, activity_level, workout_minutes, hot_weather. */
  inputs: string[];
  minMl: number | null;
  maxMl: number | null;
  quickAddPresetsMl: number[];
  drinks: Drink[];
  reminderRules: { rule: string; source: string }[];
  warnings: string[];
  lastResearched: string | null;
};

export type Hydration = Reviewed & HydrationData & { drinksTable: DrinkTableRow[] };

// ---------------------------------------------------------------- special topics (Template C)

export type GuidanceRule = { if: string; then: string; source: string };

export type GuidanceData = {
  id: string;
  type: 'guidance';
  /** From the section heading; the JSON block has no name key. */
  name: string;
  rules: GuidanceRule[];
  lastResearched: string | null;
};

export type Guidance = Reviewed & GuidanceData;

// ---------------------------------------------------------------- goal / health condition / diet pattern (Template D)

export type ProfileTarget = {
  nutrient: string;
  unit: string;
  generalAdult: number | null;
  profileValue: number | null;
  min: number | null;
  max: number | null;
  direction: 'raise' | 'limit' | 'same' | null;
  source: string;
};

export type BloodMarker = {
  marker: string;
  /** Free text range as researched ("< 100", "70–99"); the app only shows it as context for the user's own lab values. */
  target: string;
  unit: string;
  source: string;
};

export type HealthConditionData = {
  id: string;
  /** "condition" | "goal" | "diet_pattern" (PROMPT Template D). */
  type: 'condition' | 'goal' | 'diet_pattern';
  name: string;
  surveyQuestion: string | null;
  targets: ProfileTarget[];
  bloodMarkers: BloodMarker[];
  waterMl: { min: number | null; max: number | null; notes: string } | null;
  sodiumMgMax: number | null;
  dietaryCholesterolMgMax: number | null;
  foodsFavour: string[];
  foodsLimit: string[];
  goodFitDishes: DishRef[];
  cautionDishes: (DishRef & { reason: string })[];
  conflictsWith: { profileId: string; rule: string }[];
  /**
   * SPEC-ADDENDA §8: for these profiles the app never sets the limit itself;
   * it asks for the number the user's doctor gave and shows "Follow your
   * doctor's advice". Once any version says true it stays true (safety first).
   */
  requiresDoctorInput: boolean;
  /**
   * Review 2026-10-15 FIX 1: true when the research file states
   * `requires_doctor_input` itself; false when the importer decided it
   * (missing flag: true if the profile carries a water, sodium or
   * protein/potassium/phosphorus/fluid limit, else false).
   */
  requiresDoctorInputStated: boolean;
  /**
   * SPEC-ADDENDA §8: FOLLOW_DOCTOR_LINE whenever the profile carries a water
   * or fluid number; null otherwise. The app shows it next to that number.
   */
  fluidNote: string | null;
  warnings: string[];
  lastResearched: string | null;
};

/** SPEC-ADDENDA §8 display line for any condition water or fluid number. */
export const FOLLOW_DOCTOR_LINE = "Follow your doctor's advice";

export type HealthCondition = Reviewed & HealthConditionData;
```

### `src/__tests__/services/search.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import {
  activeCount,
  allowedSlips,
  editDistance,
  normalise,
  optionCounts,
  passesFilters,
  runSearch,
  scoreDoc,
  sortItems,
  soundAlike,
  toggle,
  wordMatch,
  type FilterGroup,
  type SearchDoc,
  type SortOption,
} from '../../services/search';

type Item = { id: string; name: string; tags: string[]; kcal: number | null; extra?: string[] };
const ITEMS: Item[] = [
  { id: 'a', name: 'Chicken Biryani', tags: ['Non-veg', 'Lunch'], kcal: 660, extra: ['Basmati rice', 'Chicken'] },
  { id: 'b', name: 'Veg Biryani', tags: ['Veg', 'Lunch', 'Jain option'], kcal: 480, extra: ['Basmati rice', 'Carrot'] },
  { id: 'c', name: 'Poha', tags: ['Veg', 'Breakfast', 'Contains peanut'], kcal: 390, extra: ['Flattened rice (poha)', 'Peanuts'] },
  { id: 'd', name: 'Palak Paneer', tags: ['Veg', 'Dinner', 'Contains milk'], kcal: null, extra: ['Spinach (palak)', 'Paneer'] },
];
const doc = (i: Item): SearchDoc => ({ id: i.id, name: i.name, tags: i.tags, extra: i.extra });
const GROUPS: FilterGroup<Item>[] = [
  {
    id: 'diet',
    label: 'Diet',
    mode: 'any',
    options: [
      { id: 'veg', label: 'Veg', test: (i) => i.tags.includes('Veg') },
      { id: 'non-veg', label: 'Non-veg', test: (i) => i.tags.includes('Non-veg') },
    ],
  },
  { id: 'meal', label: 'Meal', mode: 'any', options: ['Breakfast', 'Lunch', 'Dinner'].map((m) => ({ id: m, label: m, test: (i: Item) => i.tags.includes(m) })) },
  {
    id: 'allergen',
    label: 'Leave out',
    mode: 'exclude',
    options: [
      { id: 'peanut', label: 'Peanut', test: (i) => i.tags.includes('Contains peanut') },
      { id: 'milk', label: 'Milk', test: (i) => i.tags.includes('Contains milk') },
    ],
  },
];
const byId = (a: Item, b: Item) => a.id.localeCompare(b.id);
const ids = (r: { item: Item }[]) => r.map((x) => x.item.id);

describe('text matching', () => {
  it('normalises case, accents and punctuation', () => {
    expect(normalise('  Chole (Chana-Masala)! ')).toBe('chole chana masala');
    expect(normalise('Crème brûlée')).toBe('creme brulee');
  });

  it('measures spelling slips, including swapped letters', () => {
    expect(editDistance('biryani', 'biryani')).toBe(0);
    expect(editDistance('biryani', 'biriyani')).toBe(1);
    expect(editDistance('brhiyani', 'biryani')).toBe(3);
    expect(editDistance('paneer', 'panir')).toBe(2);
    expect(editDistance('abc', 'abcdefgh', 2)).toBe(3);
    expect(editDistance('ab', 'ba')).toBe(1);
  });

  it('folds common Indian spelling variants', () => {
    expect(soundAlike('brhiyani')).toBe('briyani');
    expect(soundAlike('paneer')).toBe(soundAlike('panir'));
    expect(soundAlike('dhal')).toBe('dal');
    expect(soundAlike('kawa')).toBe('kava');
  });

  it('allows more slips in longer words and none in short ones', () => {
    expect(allowedSlips('dal')).toBe(0);
    expect(allowedSlips('poha')).toBe(1);
    expect(allowedSlips('biryani')).toBe(2);
    expect(wordMatch('dal', 'dhal')).toBe(0);
    expect(wordMatch('bir', 'biryani')).toBe(0.85);
    expect(wordMatch('ryan', 'biryani')).toBe(0.6);
    expect(wordMatch('brhiyani', 'biryani')).toBe(0.5);
  });

  it('needs every query word to match somewhere', () => {
    expect(scoreDoc(doc(ITEMS[0]), 'chicken rice')).toBeGreaterThan(0);
    expect(scoreDoc(doc(ITEMS[2]), 'chicken rice')).toBe(0);
    expect(scoreDoc(doc(ITEMS[0]), '')).toBe(1);
    expect(scoreDoc(doc(ITEMS[0]), '  ')).toBe(1);
  });

  it('ranks name hits above ingredient hits', () => {
    const r = runSearch(ITEMS, { toDoc: doc, query: 'palak', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(r)).toEqual(['d']);
    const rice = runSearch(ITEMS, { toDoc: doc, query: 'poha', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(rice)[0]).toBe('c');
  });

  it('finds biryani from a misspelling and matches tags', () => {
    const r = runSearch(ITEMS, { toDoc: doc, query: 'brhiyani', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(r).sort()).toEqual(['a', 'b']);
    const jain = runSearch(ITEMS, { toDoc: doc, query: 'jain', groups: GROUPS, selection: {}, sort: 'relevance', tieBreak: byId });
    expect(ids(jain)).toEqual(['b']);
  });
});

describe('filters', () => {
  it('ORs inside a group and ANDs across groups', () => {
    const sel = { diet: ['veg'], meal: ['Lunch', 'Breakfast'] };
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, sel)).map((i) => i.id)).toEqual(['b', 'c']);
  });

  it('excludes items with a chosen allergen', () => {
    const sel = { allergen: ['peanut', 'milk'] };
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, sel)).map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('ignores empty groups and unknown option ids', () => {
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, { diet: [], meal: ['Nope'] })).length).toBe(0);
    expect(ITEMS.filter((i) => passesFilters(i, GROUPS, { diet: [] })).length).toBe(4);
  });

  it('toggles chips and counts them', () => {
    let s = toggle({}, 'diet', 'veg');
    s = toggle(s, 'meal', 'Lunch');
    expect(activeCount(s)).toBe(2);
    s = toggle(s, 'diet', 'veg');
    expect(s.diet).toEqual([]);
    expect(activeCount(s)).toBe(1);
  });

  it('counts what each chip would leave, given the other groups', () => {
    const c = optionCounts(ITEMS, GROUPS, { diet: ['veg'] });
    expect(c['diet:non-veg']).toBe(1); // other diet chips ignore the diet group's own choice
    expect(c['meal:Lunch']).toBe(1);
    expect(c['allergen:peanut']).toBe(2); // veg dishes left after leaving out peanut
  });
});

describe('sort', () => {
  const lowKcal: SortOption<Item> = { id: 'kcal', label: 'Lowest calories', value: (i) => i.kcal, direction: 'asc' };
  it('sorts by value and puts missing values last', () => {
    expect(sortItems(ITEMS, lowKcal, byId).map((i) => i.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(sortItems(ITEMS, { ...lowKcal, direction: 'desc' }, byId).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('applies the sort after search and filters', () => {
    const r = runSearch(ITEMS, { toDoc: doc, query: 'rice', groups: GROUPS, selection: {}, sort: lowKcal, tieBreak: byId });
    expect(ids(r)).toEqual(['c', 'b', 'a']);
  });
});
```

### `src/__tests__/services/dishLibrary.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../../data/research';
import type { Dish } from '../../models/research';
import { byNumber, cardChips, dishDoc, dishFilterGroups, DISH_SORTS, headlineOrderPrice, orderPriceNote, totalMinutes } from '../../services/dishLibrary';
import { runSearch, type Selection } from '../../services/search';

const groups = dishFilterGroups(researchDishes);
const search = (query: string, selection: Selection = {}, sortId?: string) =>
  runSearch(researchDishes, {
    toDoc: dishDoc,
    query,
    groups,
    selection,
    sort: DISH_SORTS.find((s) => s.id === sortId) ?? 'relevance',
    tieBreak: byNumber,
  }).map((r) => r.item);

describe('dish library on the bundled research dishes', () => {
  it('lists every dish with no query and no filters', () => {
    expect(search('')).toHaveLength(researchDishes.length);
    expect(researchDishes.length).toBeGreaterThanOrEqual(20);
  });

  it('finds dishes by name, misspelling, Indian ingredient name and tag', () => {
    expect(search('biryani')[0].name).toMatch(/Biryani/);
    expect(search('brhiyani').some((d) => /Biryani/.test(d.name))).toBe(true);
    expect(search('poha')[0].id).toBe('001-poha');
    expect(search('palak').some((d) => d.id === '017-palak-paneer')).toBe(true);
    expect(search('jeera').some((d) => d.id === '019-jeera-rice')).toBe(true);
    expect(search('xyzzy')).toEqual([]);
  });

  it('builds filter groups from the data and every chip matches at least one dish', () => {
    const ids = groups.map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['diet', 'allergen', 'meal', 'time', 'level', 'nutrition', 'kcal', 'cuisine']));
    for (const g of groups.filter((x) => x.id !== 'diet')) {
      for (const o of g.options) expect(researchDishes.some(o.test)).toBe(true);
    }
  });

  it('filters veg + breakfast and leaves out peanut dishes', () => {
    const r = search('', { diet: ['veg'], meal: ['breakfast'], allergen: ['peanut'] });
    expect(r.length).toBeGreaterThan(0);
    for (const d of r) {
      expect(d.dietType).toBe('veg');
      expect(d.mealType).toContain('breakfast');
      expect(d.allergens).not.toContain('peanut');
    }
  });

  it('time chips include faster dishes too', () => {
    for (const d of search('', { time: ['under-30'] })) expect(totalMinutes(d)!).toBeLessThanOrEqual(30);
    expect(search('', { time: ['under-60'] }).length).toBeGreaterThanOrEqual(search('', { time: ['under-30'] }).length);
  });

  it('sorts quickest first and highest protein first, missing values last', () => {
    const q = search('', {}, 'quickest');
    for (let i = 1; i < q.length; i++) {
      const a = totalMinutes(q[i - 1]);
      const b = totalMinutes(q[i]);
      if (a != null && b != null) expect(a).toBeLessThanOrEqual(b);
    }
    const p = search('', {}, 'highest-protein').map((d) => d.nutritionPerServing.proteinG ?? -1);
    expect(p[0]).toBe(Math.max(...p));
  });

  it('shows diet chips before allergens, three at most', () => {
    const poha = researchDishes.find((d) => d.id === '001-poha')!;
    expect(cardChips(poha)).toEqual(['Veg', 'Contains peanut', 'Contains mustard']);
  });
});

describe('order price headline', () => {
  const base = researchDishes[0];
  const withPrice = (over: Partial<NonNullable<Dish['orderPrice']>>): Dish => ({ ...base, orderPrice: { ...base.orderPrice!, ...over } });

  it('shows the average and range of a confirmed price, never the top as headline', () => {
    const d = withPrice({ currentEstimate: { min: 120, max: 150, avg: 130 }, confirmed: true, listingCount: 6 } as never);
    expect(headlineOrderPrice(d)).toMatchObject({ avg: 130, min: 120, max: 150 });
    expect(orderPriceNote(d)).toBeNull();
  });

  it('hides an unconfirmed price and says why', () => {
    const d = withPrice({ confirmed: false, checkNotes: ['the average is outside the range'] } as never);
    expect(headlineOrderPrice(d)).toBeNull();
    expect(orderPriceNote(d)).toMatch(/average is outside/);
  });

  it('notes thin evidence under 5 listings', () => {
    const d = withPrice({ confirmed: true, listingCount: 3 } as never);
    expect(orderPriceNote(d)).toBe('Based on 3 listings.');
  });
});
```

### `src/__tests__/services/rememberedFilters.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { cleanAllergens, loadExcludedAllergens, rememberedFiltersKey, saveExcludedAllergens } from '../../services/rememberedFilters';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { ownerPrefix } from '../../services/storage/docStore';

describe('remembered allergen filter', () => {
  it('saves and loads per owner, under the owner prefix that Delete my data clears', async () => {
    const kv = memoryKeyValueStore();
    await saveExcludedAllergens(kv, 'guest', ['peanut', 'milk']);
    expect(await loadExcludedAllergens(kv, 'guest')).toEqual(['peanut', 'milk']);
    expect(await loadExcludedAllergens(kv, 'uid-1')).toEqual([]);
    expect(rememberedFiltersKey('guest').startsWith(ownerPrefix('guest'))).toBe(true);
  });

  it('removes the key when nothing is left out', async () => {
    const kv = memoryKeyValueStore();
    await saveExcludedAllergens(kv, 'guest', ['peanut']);
    await saveExcludedAllergens(kv, 'guest', []);
    expect(kv.dump()).toEqual({});
  });

  it('drops unknown ids and duplicates, and survives damaged values', async () => {
    expect(cleanAllergens(['peanut', 'peanut', 'chocolate', 3])).toEqual(['peanut']);
    expect(cleanAllergens('peanut')).toEqual([]);
    const kv = memoryKeyValueStore({ [rememberedFiltersKey('guest')]: '{not json' });
    expect(await loadExcludedAllergens(kv, 'guest')).toEqual([]);
    const old = memoryKeyValueStore({ [rememberedFiltersKey('guest')]: JSON.stringify({ version: 9, excludeAllergens: ['milk'] }) });
    expect(await loadExcludedAllergens(old, 'guest')).toEqual([]);
  });

  it('never throws when storage fails', async () => {
    const broken = { ...memoryKeyValueStore(), getItem: async () => Promise.reject(new Error('x')), setItem: async () => Promise.reject(new Error('x')) };
    expect(await loadExcludedAllergens(broken, 'guest')).toEqual([]);
    await expect(saveExcludedAllergens(broken, 'guest', ['milk'])).resolves.toBeUndefined();
  });
});
```

### `src/__tests__/data/priceChecks.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { buildDish, buildIngredient, buildIngredientIndex } from '../../services/data/buildItems';
import { parseDishFile, parseOrderPrice } from '../../services/data/dishImporter';
import { parseIngredientFile } from '../../services/data/ingredientImporter';
import { checkPrice, listingEvidence, normalisePlatforms, parseListingTable } from '../../services/data/priceChecks';

// Section-6 excerpts copied from the research files (rows and headline sentences as written; prose trimmed).

/** FitPlate_Dishes_2026-10-13.md, dish 50 Chicken Korma. */
const KORMA = `Serving used for comparison: one plate of chicken korma as listed = 1 serving.

| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Shan Chinese, Jogeshwari | magicpin | ₹150 (Chicken Korma) | Not listed, treated as 1 serving | ₹150 |
| Noor Mohammadi Hotel, Kurla | Zomato | ₹180 (Chicken Korma) | Not listed, treated as 1 serving | ₹180 |
| Mao Family Restaurant, Mahim | magicpin | ₹185 (Chicken Korma); Chicken Korma [1 Kg] ₹1,160 | Not listed (1 kg also offered) | ₹185 (1 kg ÷ 4 = about ₹290) |
| Mao Family Restaurant, Kalbadevi | magicpin | ₹210 menu price (shown discounted to ₹200); 1 kg also offered | Not listed, treated as 1 serving | ₹210 |
| Cafe Alif, Jogeshwari West | magicpin | ₹225 (Chicken Korma) | Not listed, treated as 1 serving | ₹225 |
| Afzal Restaurant, Mazgaon | magicpin | ₹240 (Chicken Korma) | Not listed, treated as 1 serving | ₹240 |
| Murgori Chicken Kebab, Lower Parel | Zomato | ₹280 (Murgh Shahi Korma) | Not listed, treated as 1 serving | ₹280 |
| Charcoal Eats – Biryani & Beyond, Oshiwara, Andheri West | Zomato | ₹399 (chicken korma, "yogurt and cashew gravy") | Not listed, treated as 1 serving | ₹399 |
| Kareem's, Powai | magicpin | ₹435 (Murg Shahi Korma) | Not listed, treated as 1 serving | ₹435 |
| Singarawala, Kandivali East | Zomato | ₹520 (chicken korma) | Not listed, treated as 1 serving | ₹520 |
| One8 Commune, Juhu | Zomato | ₹855 (old-Delhi-style chicken korma, on the bone) | Not listed | ₹855 (premium, excluded) |
| Carnivore, Airoli, **Navi Mumbai** | magicpin | ₹220 menu price (Delhi Chicken Korma; shown discounted to ₹187) | Not listed | ₹220 (outside Mumbai city) |
| Jio Foods, Kharghar, **Navi Mumbai** | Zomato | ₹149 (chicken korma gravy) | Not listed | ₹149 (outside Mumbai city) |
| Simla Dhaba, **Vasai** | Zomato | ₹230 (chicken korma) | Not listed | ₹230 (outside Mumbai city) |
| Hotel Vijaya, **Ambernath (Thane district)** | Zomato | ₹310 (Chicken Shahi Korma) | Not listed | ₹310 (outside Mumbai city) |

- **Price range (1 serving = 1 plate as listed), everyday Mumbai city restaurants: ₹180–240; median about ₹230; average about ₹280. Low confidence on portion size (no listing states a size).** The ten everyday Mumbai city prices are ₹150, ₹180, ₹185, ₹210, ₹225, ₹240, ₹280, ₹399, ₹435 and ₹520 (median ₹233, average ₹282).
- Note: menu prices only. Delivery fees, taxes and discounts are excluded. Prices vary by area and change often.

**AS ORDERED (from delivery apps)**
- **Price (1 serving = 1 plate of chicken korma as listed):** average about ₹280, median about ₹230, range ₹180–240 (everyday Mumbai city restaurants; premium excluded; low confidence on portion size).
`;

/** FitPlate_Dishes_2026-10-15.md, dish 60 Aloo Matar. */
const ALOO_MATAR = `| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Geeta Bhavan, Kalbadevi | Swiggy | ₹135 (dated) | "Aloo Mattar", described as dry-style; portion not listed | ₹135 (outlet shown not accepting orders: expired food safety licence) |
| Greens Restaurant, Linkway Estate, Malad West | Swiggy | ₹275 (dated) | "Aloo Mattar", light gravy, "serves 2" | ₹137.50 (₹275 ÷ 2; outlet shown not delivering) |
| New Kathiyawadi Dhaba, **Mira Road** (Thane district) | Swiggy | ₹209.64 (dated) | "Aloo Matar", portion not listed | ₹209.64 (outside Mumbai city) |
| Pet Pooja Point (Swiggy tags the same outlet as Bhoiwada and East Kalyan; area unclear) | Swiggy | ₹240 (dated) | "Aloo Mutter", portion not listed | ₹240 |
| Ruchi Veg Restaurant, Goregaon East | Swiggy | ₹250 (dated) | "Aloo Mattar", creamy, mildly spiced tomato gravy; portion not listed | ₹250 (outlet shown closed) |
| Harish Kitchen, Majiwada, **Thane** | Swiggy | ₹269 (dated) | "Aloo Mattar", potato-and-pea curry; portion not listed | ₹269 (outside Mumbai city; outlet shown closed) |
| Navaratna Veg Restaurant, Vashi, **Navi Mumbai** | Swiggy | ₹385 (dated) | "Aloo Matar", portion not listed | ₹385 (outside Mumbai city) |
| K Bhagat Tarachand, Borivali West | Swiggy | ₹419 (dated) | "Jain Alu Mutter", portion not listed | ₹419 (Jain variant, not the standard dish; excluded from the range, used in the Jain variant) |

- **Price range (1 serving): ₹210–270; median about ₹240; average about ₹230.** Seven everyday listings (excluding the Jain ₹419 listing): ₹135, ₹137.50, ₹209.64, ₹240, ₹250, ₹269 and ₹385 (median ₹240; average ₹232.31, rounded to ₹230).
`;

/** FitPlate_Dishes_2026-10-15.md, dish 59 Chicken Kathi Roll: a range that passes every check. */
const KATHI_ROLL = `| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Rollzilla, Kandivali West | magicpin | ₹210 (Reshmi Chicken Tikka Roll) | 1 roll | ₹210 |
| Rolling Fresh (Mumbai listing; outlet area not shown) | Swiggy | ₹219 (Chicken Seekh Kathi Roll) | 1 roll | ₹219 |
| Hangla's, Powai (Kolkata-style roll chain) | magicpin | ₹225 (Chicken Roll) | 1 roll | ₹225 |
| RollsKing (Mumbai listing; outlet area not shown) | Swiggy | ₹247 (Classic Chicken Egg Roll) | 1 roll | ₹247 |
| Jatt Rolls (Mumbai listing; outlet area not shown) | Swiggy | ₹279 (Ultimate Chicken Kathi Roll) | 1 roll | ₹279 |
| Unnamed restaurant (Mumbai roll listing) | Swiggy | ₹339 (Chicken Tikka Kathi Roll); ₹369 (Malai Chicken Tikka Kathi Roll) | 1 roll | Not used: restaurant and area not visible in the snippet |
| Ayub's, Kala Ghoda / Fort | The Quint article (not a platform) | ₹230–250 (rolls) | 1 roll | Context only (dated; article date not shown) |

- **Price range (1 serving = 1 roll), everyday Mumbai restaurants: ₹210–280; median ₹225; average about ₹236.** Five everyday Mumbai prices across two platforms: ₹210, ₹219, ₹225, ₹247, ₹279 (₹279 rounds to ₹280).
`;

/** FitPlate_Dishes_2026-10-15.md, dish 57 Tomato Rice: two usable listings. */
const TOMATO_RICE = `| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Just Rice, Oshiwara / Adarsh Nagar, Andheri West | Dunzo | ₹119 ("Tomato Rice") | Not listed, treated as 1 serving | ₹119 (dated: Dunzo snapshot, undated) |
| Madras Curd Rice Company, Manpada, Thane West | Zomato (order page) | ₹225 ("Tomato Rice") | Not listed, treated as 1 serving | ₹225 (Thane) |
| Madras Curd Rice Company, Marol (Andheri East) | magicpin | ₹221 shown with an offer price of ₹99 (page dated Feb 2026) | Not listed | Not used (₹221 appears to be the struck-through price and ₹99 a discount) |
| Madras Curd Rice Company, Lower Parel | magicpin | ₹221 shown with an offer price of ₹99; "served with coconut chutney and papad churi", made with chana dal | Not listed | Not used (same reason) |
| Udupi Tiffins, Mulund West | magicpin | ₹144 ("Tomato Rice Tiffin", with raita and sheera) | Tiffin combo | ₹144 (combo, excluded) |
| Just Rice, Andheri Lokhandwala and Just Rice, Powai | Zomato (order pages) | Tomato Rice listed; price not shown in the snippet | – | Not found |
- **Price range (1 serving): ₹120–220 (low confidence).** Only two usable everyday prices (₹119 and ₹225), rounded to the nearest ₹10 without rounding up (₹225 → ₹220).
`;

describe('parseOrderPrice: listing evidence and headline figures', () => {
  it('dish 50: keeps the stated average (₹280) and median (₹230) and counts only Mumbai-city rows in the range', () => {
    const p = parseOrderPrice(KORMA);
    expect(p).toMatchObject({ min: 180, max: 240, statedAvg: 280, median: 230 });
    // The engine average stays null: ₹280 belongs to the full spread, not the range.
    expect(p?.avg).toBeNull();
    // ₹180, ₹185, ₹210, ₹225, ₹240; the out-of-city ₹220 and ₹230 do not back a "Mumbai city" range.
    expect(p?.listingCount).toBe(5);
    expect(p?.platforms).toEqual(['magicpin', 'Zomato']);
    expect(p?.outOfStock).toBe(false);
  });

  it('dish 60: Swiggy only, 4 listings in ₹210–270 (₹209.64 rounds in), one of them shown closed', () => {
    const p = parseOrderPrice(ALOO_MATAR);
    expect(p).toMatchObject({ min: 210, max: 270, statedAvg: 230, median: 240, listingCount: 4, platforms: ['Swiggy'], outOfStock: true });
  });

  it('leaves dropped, "not used" and "context only" rows out', () => {
    const rows = parseListingTable(KATHI_ROLL, 'dish');
    expect(rows).toHaveLength(7);
    expect(rows?.filter((r) => r.excluded).map((r) => r.source)).toEqual(['Unnamed restaurant (Mumbai roll listing)', "Ayub's, Kala Ghoda / Fort"]);
    expect(listingEvidence(rows, { min: 210, max: 280 }, 5)).toEqual({ listingCount: 5, platforms: ['magicpin', 'Swiggy'], outOfStock: false });
  });

  it('gives a null count when there is no listing table, rather than guessing', () => {
    const p = parseOrderPrice('- **Price range (1 serving): ₹120–150.**\n- Average (1 serving): about ₹130\n');
    expect(p).toMatchObject({ min: 120, max: 150, avg: 130, statedAvg: 130, listingCount: null, platforms: [], outOfStock: false });
    expect(checkPrice({ ...p!, avg: p!.statedAvg }).confirmed).toBe(true);
  });

  it('reads platform names, ignoring remarks in brackets', () => {
    expect(normalisePlatforms('Zomato and magicpin (same price)')).toEqual(['Zomato', 'magicpin']);
    expect(normalisePlatforms("Restaurant's own website (says it delivers via Swiggy and Zomato; app price not seen)")).toEqual(["Restaurant's own website"]);
    expect(normalisePlatforms('Swiggy (Mumbai dish page)')).toEqual(['Swiggy']);
  });
});

describe('checkPrice: one test per rule', () => {
  const korma = parseOrderPrice(KORMA)!;
  const alooMatar = parseOrderPrice(ALOO_MATAR)!;

  it('rule 1: dish 50 average ₹280 outside ₹180–240 → not confirmed', () => {
    const c = checkPrice({ ...korma, avg: korma.statedAvg });
    expect(c.confirmed).toBe(false);
    expect(c.checkNotes).toEqual(['average ₹280 lies outside the range ₹180–₹240']);
  });

  it('rule 1: a median outside the range is flagged too (synthetic median; no research file has one yet)', () => {
    const c = checkPrice({ ...korma, avg: null, median: 250 });
    expect(c.checkNotes).toEqual(['median ₹250 lies outside the range ₹180–₹240']);
  });

  it('rule 2: dish 60 rests on 1 platform (Swiggy) → not confirmed', () => {
    const c = checkPrice({ ...alooMatar, avg: alooMatar.statedAvg, outOfStock: false });
    expect(c).toMatchObject({ confirmed: false, listingCount: 4, platforms: ['Swiggy'] });
    expect(c.checkNotes).toEqual(['only 1 platform (Swiggy) backs the range']);
  });

  it('rule 2: dish 57 rests on 2 listings → not confirmed', () => {
    const p = parseOrderPrice(TOMATO_RICE)!;
    expect(p).toMatchObject({ listingCount: 2, platforms: ['Dunzo', 'Zomato'] });
    expect(checkPrice({ ...p, avg: p.statedAvg }).checkNotes).toEqual(['only 2 listings back the range (need 3)']);
  });

  it('rule 3: dish 60 uses a listing shown closed → not confirmed', () => {
    const c = checkPrice({ ...alooMatar, avg: alooMatar.statedAvg, platforms: ['Swiggy', 'Zomato'] });
    expect(c.checkNotes).toEqual(['a listing used for the range is marked out of stock, closed or not taking orders']);
  });

  it('passes dish 59: 5 listings on 2 platforms, average ₹236 and median ₹225 inside ₹210–280', () => {
    const p = parseOrderPrice(KATHI_ROLL)!;
    expect(p).toMatchObject({ statedAvg: 236, median: 225 });
    expect(checkPrice({ ...p, avg: p.statedAvg })).toEqual({ listingCount: 5, platforms: ['magicpin', 'Swiggy'], outOfStock: false, confirmed: true, checkNotes: [] });
  });
});

describe('price checks reach the built records', () => {
  const dishFile = (n: number, name: string, section6: string) =>
    `## ${n}. ${name}\nNorth Indian | Veg | Lunch\n\n### 2. Ingredients (1 serving)\n| Ingredient | Quantity | Household |\n|---|---|---|\n| Potato (aloo) | 150 g | 1 medium |\n\n### 6. Cost to order (1 serving)\n${section6}\n`;

  it('dish 60: stores listingCount, platforms and confirmed: false, and lists the reasons for review', () => {
    const [v] = parseDishFile(dishFile(60, 'Aloo Matar', ALOO_MATAR), 'FitPlate_Dishes_2026-10-15.md');
    const dish = buildDish([v], '2026-10-15', buildIngredientIndex([]));
    expect(dish.orderPrice).toMatchObject({ listingCount: 4, platforms: ['Swiggy'], outOfStock: true, confirmed: false });
    expect(dish.orderPrice?.currentEstimate).not.toBeNull();
    expect(dish.needsReview).toEqual(
      expect.arrayContaining([
        'price not confirmed (2026-10-15): only 1 platform (Swiggy) backs the range',
        'price not confirmed (2026-10-15): a listing used for the range is marked out of stock, closed or not taking orders',
      ]),
    );
  });

  it('dish 59: a confirmed price adds nothing to needs-review', () => {
    const [v] = parseDishFile(dishFile(59, 'Chicken Kathi Roll', KATHI_ROLL), 'FitPlate_Dishes_2026-10-15.md');
    const dish = buildDish([v], '2026-10-15', buildIngredientIndex([]));
    expect(dish.orderPrice).toMatchObject({ confirmed: true, checkNotes: [] });
    expect(dish.needsReview.filter((n) => n.startsWith('price not confirmed'))).toEqual([]);
  });

  it('ingredient: chicken leg (2026-10-12) rests on 2 BigBasket listings, one out of stock', () => {
    const file = [
      '## Summary',
      '| Ingredient | Category | Standard unit | Price range | Average | Per 100 g | Sources checked | Confidence |',
      '|---|---|---|---|---|---|---|---|',
      '| Chicken leg, skinless, bone-in (murgh ki tangri / leg piece) | Meat/seafood | per kg | ₹460–530 | ₹495 | ₹46.0–53.0 | 9 | Low |',
      '',
      '## Chicken leg, skinless, bone-in (murgh ki tangri / leg piece)',
      '### 2. Price (Mumbai)',
      '| Source | Pack size | Pack price | Price per standard unit |',
      '|---|---|---|---|',
      '| BigBasket, Chicken Leg Without Skin, 3–4 pcs (marked out of stock in the snapshot; date not shown) | 450 g | ₹239 | ₹531/kg |',
      '| BigBasket, fresho Chicken Thigh Without Skin (bone-in not stated; date not shown) | 900 g | ₹415 | ₹461/kg |',
      '| *Reference (with skin, not used for range):* BigBasket, Chicken Leg With Skin, 3–4 pcs | 450 g | ₹199 | ₹442/kg |',
      '| *Reference (different cut):* Amazon, "Elicious" Fresh Chicken Curry Cut Skinless, via price-history.in | 500 g | ₹130 (MRP ₹175) | ₹260/kg |',
      '| *Dropped (premium):* BigBasket, FreshToHome Premium Chicken Drumsticks Skinless | 280 g | ₹350 | about ₹1,250/kg |',
      '',
      '- **Range:** ₹460–530/kg. **Average:** ₹495/kg (midpoint of ₹461 and ₹531, rounded to the nearest ₹5).',
    ].join('\n');
    const [v] = parseIngredientFile(file, 'FitPlate_Ingredients_2026-10-12.md').items;
    expect(v.price).toMatchObject({ min: 460, max: 530, avg: 495, listingCount: 2, platforms: ['BigBasket'], outOfStock: true });
    const built = buildIngredient([v], '2026-10-15');
    expect(built.price).toMatchObject({ confirmed: false, listingCount: 2, platforms: ['BigBasket'] });
    expect(built.price?.checkNotes).toEqual([
      'only 2 listings back the range (need 3)',
      'only 1 platform (BigBasket) backs the range',
      'a listing used for the range is marked out of stock, closed or not taking orders',
    ]);
    expect(built.needsReview).toHaveLength(3);
  });
});
```

### `src/__tests__/data/nutrients.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

import {
  buildCondition,
  buildHydration,
  buildNutrient,
  buildTopic,
  checkDefaultTargets,
  convertPreset,
  dishNutrientIndex,
  groupTopicVersions,
  hydrationCrossLinks,
  isIcmrRow,
  nutrientCrossLinks,
  parseNutrientFile,
  parseUnitConversions,
  validateCondition,
  validateHydration,
  validateNutrient,
  type ConditionVersion,
  type HydrationVersion,
  type NutrientTopicVersion,
  type NutrientVersion,
} from '../../services/data/nutrientImporter';
import { FOLLOW_DOCTOR_LINE, type Nutrient } from '../../models/nutrient';

// Fixtures copy the shapes of the real nutrient files (thiamine, vitamin A, vitamin E cases).
type Json = Record<string, unknown>;

function nutrientJson(over: Json = {}): Json {
  return {
    id: 'thiamine',
    name: 'Thiamine (Vitamin B1)',
    type: 'vitamin',
    subtype: 'water-soluble',
    unit: 'mg',
    alt_units: [{ unit: 'mcg', to_main_unit_factor: 0.001 }],
    targets: [
      { group: 'adult_male_sedentary', ear: 1.2, rda: 1.4, ai: null, source: 'ICMR-NIN 2020 short report' },
      { group: 'adult_male_moderate', ear: 1.5, rda: 1.8, ai: null, source: 'ICMR-NIN 2020 brief note' },
      { group: 'adult_female_sedentary', ear: 1.1, rda: 1.4, ai: null, source: 'ICMR-NIN 2020 short report' },
      { group: 'pregnant', ear: null, rda: 2.0, ai: null, source: 'ICMR-NIN 2020 via secondary summary only; EAR not found' },
      { group: 'lactating', ear: null, rda: 2.1, ai: null, source: 'ICMR-NIN 2020 via secondary summary only' },
      { group: 'age_60_plus', ear: null, rda: null, ai: null, source: 'ICMR-NIN 2020 value for 60+ not found; app applies sedentary adult RDA 1.4 mg' },
    ],
    app_default_target: { adult_male: 1.4, adult_female: 1.4, pregnant: 2.0, lactating: 2.1, age_60_plus: 1.4 },
    upper_limit: { value: null, unit: 'mg/day', applies_to: 'supplements_only', source: 'No UL set' },
    top_food_sources: [{ food: 'Wheat flour, whole (atta)', veg: true, per_100g: 0.42, serving_g: 60, serving_label: '2 medium rotis', per_serving: 0.25 }],
    good_source_dishes: [{ dish_number: 11, dish_name: 'Aloo Paratha' }, { dish_number: 5, dish_name: 'Dal Tadka' }],
    deficiency_risk_india: 'moderate',
    absorption_boosters: ['whole grains'],
    absorption_blockers: ['raw fish (thiaminase)'],
    log_presets: [
      { label: 'Benfotiamine 150 mg (combination tablet)', amount: 150, unit: 'mg' },
      { label: 'High-dose thiamine tablet 100 mg', amount: 100, unit: 'mg' },
      { label: 'Custom amount in mcg', amount: null, unit: 'mcg' },
    ],
    warnings: ['No formal upper limit is set for thiamine.'],
    last_researched: '2026-10-11',
    ...over,
  };
}

const THIAMINE_CONVERSIONS = `**Unit conversions (with worked examples)**

| From | To mg of thiamine | Notes |
|---|---|---|
| 1,000 µg (mcg) | 1 mg | Same vitamin, smaller unit |
| 1 mg thiamine hydrochloride | about 0.79 mg thiamine | Calculated |
| 1 mg thiamine mononitrate | about 0.81 mg thiamine | Calculated |
| 1 mg benfotiamine | about 0.57 mg thiamine | Calculated (265.4 / 466.4) |
| Energy-based target | mg = (kcal/day ÷ 1,000) × factor | Not a unit conversion |
`;

function nutrientFile(json: Json, extra = THIAMINE_CONVERSIONS, n = 6, title = 'Thiamine (B1)'): string {
  return `Cycle 1 | Topics ${n}

## ${n}. ${title}

### 3. Daily requirements
${extra}

### 12. App data (JSON)
\`\`\`json
${JSON.stringify(json, null, 2)}
\`\`\`

Today: topics ${n}.
`;
}

function nutrientVersion(json: Json, date: string, extra = THIAMINE_CONVERSIONS): NutrientVersion {
  const { items, errors } = parseNutrientFile(nutrientFile(json, extra), `FitPlate_Nutrients_${date}.md`);
  expect(errors).toEqual([]);
  return items[0] as NutrientVersion;
}

const ctx = (over: Partial<Parameters<typeof convertPreset>[1]> = {}) => ({ mainUnit: 'mg', altUnits: [], conversions: [], ...over });

describe('parseNutrientFile', () => {
  it('routes vitamin / mineral blocks to nutrients and camelCases the JSON', () => {
    const { items, errors } = parseNutrientFile(nutrientFile(nutrientJson()), 'FitPlate_Nutrients_2026-10-11.md');
    expect(errors).toEqual([]);
    expect(items).toHaveLength(1);
    const v = items[0] as NutrientVersion;
    expect(v.kind).toBe('nutrient');
    expect(v).toMatchObject({ id: 'thiamine', date: '2026-10-11', topicNumber: '6', title: 'Thiamine (B1)' });
    expect(v.data.altUnits).toEqual([{ unit: 'mcg', toMainUnitFactor: 0.001 }]);
    expect(v.data.topFoodSources[0]).toMatchObject({ food: 'Wheat flour, whole (atta)', per100g: 0.42, servingG: 60, perServing: 0.25 });
    expect(v.data.goodSourceDishes[0]).toEqual({ dishNumber: 11, dishName: 'Aloo Paratha' });
    expect(v.data.upperLimit).toMatchObject({ value: null, appliesTo: 'supplements_only' });
    expect(v.conversions.map((c) => [c.compound, c.toMainUnitFactor])).toEqual([
      ['', 0.001],
      ['thiamine hydrochloride', 0.79],
      ['thiamine mononitrate', 0.81],
      ['benfotiamine', 0.57],
    ]);
  });

  it('routes hydration, guidance and profile blocks by "type"', () => {
    const text = [
      '## 30. Daily water requirement',
      '### 7. Drinks table',
      '| Drink | Counts toward hydration? | Notes | Typical serving (ml) |',
      '|---|---|---|---|',
      '| Buttermilk (chaas) | Yes | Some sodium | 200–250 |',
      '| Masala chai | Mostly | Caffeine | 120 |',
      '```json',
      JSON.stringify({ id: 'water-daily-requirement', type: 'hydration', default_target_formula: '35 ml × weight_kg', inputs: ['weight_kg'], min_ml: 1500, max_ml: 4000, quick_add_presets_ml: [250, 500], drinks: [{ name: 'Buttermilk', counts_as_water_pct: 100, notes: '' }], reminder_rules: [], warnings: ['Kidney or heart conditions: ask your doctor.'], last_researched: '2026-10-25' }),
      '```',
      '## 37. Common micronutrient deficiencies in India',
      '```json',
      JSON.stringify({ id: 'common-deficiencies', type: 'guidance', rules: [{ if: 'vegetarian', then: 'track B12', source: 'ICMR' }], last_researched: '2026-10-28' }),
      '```',
      '## P13. Chronic kidney disease (early stages)',
      '```json',
      JSON.stringify({ id: 'ckd-early', type: 'condition', name: 'Chronic kidney disease', targets: [{ nutrient: 'Sodium', unit: 'mg', general_adult: 2000, profile_value: null, min: null, max: 2000, direction: 'limit', source: 'KDIGO 2024' }], sodium_mg_max: 2000, requires_doctor_input: true, warnings: [], last_researched: '2026-10-24' }),
      '```',
    ].join('\n');
    const { items, errors } = parseNutrientFile(text, 'FitPlate_Nutrients_2026-10-24.md');
    expect(errors).toEqual([]);
    expect(items.map((i) => [i.kind, i.id, i.topicNumber])).toEqual([
      ['hydration', 'water-daily-requirement', '30'],
      ['guidance', 'common-deficiencies', '37'],
      ['condition', 'ckd-early', 'P13'],
    ]);
    const h = items[0] as HydrationVersion;
    expect(h.data.name).toBe('Daily water requirement');
    expect(h.drinksTable).toEqual([
      { drink: 'Buttermilk (chaas)', counts: 'Yes', notes: 'Some sodium', typicalServingMl: { min: 200, max: 250 } },
      { drink: 'Masala chai', counts: 'Mostly', notes: 'Caffeine', typicalServingMl: { min: 120, max: 120 } },
    ]);
    const c = items[2] as ConditionVersion;
    expect(c.data).toMatchObject({ type: 'condition', requiresDoctorInput: true, sodiumMgMax: 2000 });
    expect(c.data.targets[0]).toMatchObject({ nutrient: 'Sodium', max: 2000, direction: 'limit' });
  });

  it('reports malformed JSON, missing ids and unknown types instead of guessing', () => {
    const text = [
      '## 1. Vitamin A',
      '```json',
      '{ "id": "vitamin-a", "type": "vitamin", ',
      '```',
      '## 2. Vitamin D',
      '```json',
      '{ "type": "vitamin" }',
      '```',
      '## 3. Vitamin E',
      '```json',
      '{ "id": "vitamin-e", "type": "herb" }',
      '```',
      '## 4. Vitamin K',
      'No JSON here.',
    ].join('\n');
    const { items, errors } = parseNutrientFile(text, 'FitPlate_Nutrients_2026-10-10.md');
    expect(items).toEqual([]);
    expect(errors).toHaveLength(4);
    expect(errors[0]).toMatch(/§1 Vitamin A: malformed JSON/);
    expect(errors[1]).toMatch(/no "id"/);
    expect(errors[2]).toMatch(/unknown "type" "herb"/);
    expect(errors[3]).toMatch(/§4 Vitamin K: no JSON app-data block/);
  });

  it('treats wrongly typed values as not found and notes them for review', () => {
    const v = nutrientVersion(nutrientJson({ upper_limit: { value: '100 mg', unit: 'mg', applies_to: 'supplements_only', source: '' } }), '2026-10-11');
    expect(v.data.upperLimit?.value).toBeNull();
    expect(v.notes[0]).toMatch(/"value" has unexpected value "100 mg"/);
    expect(buildNutrient([v], '2026-10-15').needsReview.some((r) => /unexpected value/.test(r))).toBe(true);
  });

  it('throws on a file name without a date', () => {
    expect(() => parseNutrientFile('', 'FitPlate_Nutrients.md')).toThrow(/No date/);
  });
});

describe('review fix 2a: log presets converted with the file’s own factor', () => {
  it('uses a markdown conversion for a form named in the label: benfotiamine 150 mg → about 86 mg thiamine', () => {
    const conversions = parseUnitConversions(THIAMINE_CONVERSIONS, 'mg');
    const { preset, review } = convertPreset({ label: 'Benfotiamine 150 mg (combination tablet)', amount: 150, unit: 'mg' }, ctx({ conversions }));
    expect(review).toBeNull();
    expect(preset).toMatchObject({ label: 'Benfotiamine 150 mg (combination tablet)', amount: 150, unit: 'mg', toMainFactor: 0.57, factorSource: 'markdown' });
    expect(preset.mainAmount).toBeCloseTo(85.5, 5);
    expect(Math.round(preset.mainAmount as number)).toBe(86);
  });

  it('keeps the amount when the preset is already in the main unit', () => {
    const { preset } = convertPreset({ label: 'High-dose thiamine tablet 100 mg', amount: 100, unit: 'mg' }, ctx({ conversions: parseUnitConversions(THIAMINE_CONVERSIONS, 'mg') }));
    expect(preset).toMatchObject({ toMainFactor: 1, factorSource: 'same-unit', mainAmount: 100 });
  });

  it('uses alt_units for a label unit (IU → µg), including for "enter value" presets', () => {
    const c = ctx({ mainUnit: 'µg', altUnits: [{ unit: 'IU (retinol)', toMainUnitFactor: 0.3 }] });
    expect(convertPreset({ label: 'Capsule 25,000 IU', amount: 25000, unit: 'IU' }, c).preset).toMatchObject({ toMainFactor: 0.3, factorSource: 'alt_units', mainAmount: 7500 });
    expect(convertPreset({ label: 'Custom amount in IU', amount: null, unit: 'IU' }, c)).toMatchObject({ preset: { toMainFactor: 0.3, mainAmount: null }, review: null });
  });

  it('treats mcg, ug and µg as the same unit', () => {
    const { preset } = convertPreset({ label: 'Custom amount in mcg', amount: 500, unit: 'mcg' }, ctx({ altUnits: [{ unit: 'µg', toMainUnitFactor: 0.001 }] }));
    expect(preset.mainAmount).toBe(0.5);
  });

  it('leaves mainAmount null and flags review when the file has no factor', () => {
    const { preset, review } = convertPreset({ label: 'Retinol 5000 IU', amount: 5000, unit: 'IU' }, ctx({ mainUnit: 'µg' }));
    expect(preset).toMatchObject({ amount: 5000, unit: 'IU', toMainFactor: null, mainAmount: null, mainAmountRange: null });
    expect(review).toMatch(/no factor in the research file converts "IU" to µg/);
  });

  it('gives a range and flags review when the form is ambiguous (tocopheryl acetate without d-/dl-)', () => {
    const altUnits = [
      { unit: 'mg dl-alpha-tocopheryl acetate (synthetic ester)', toMainUnitFactor: 0.45 },
      { unit: 'mg d-alpha-tocopheryl acetate (natural ester)', toMainUnitFactor: 0.91 },
    ];
    const { preset, review } = convertPreset({ label: 'Vitamin E capsule 400 mg tocopheryl acetate', amount: 400, unit: 'mg tocopheryl acetate' }, ctx({ altUnits }));
    expect(preset.mainAmount).toBeNull();
    expect(preset.mainAmountRange).toEqual({ min: 180, max: 364 });
    expect(review).toMatch(/ambiguous/);
  });
});

describe('review fix 2b: prescription doses', () => {
  const vitA = (presets: Json[]) =>
    nutrientJson({
      id: 'vitamin-a',
      name: 'Vitamin A',
      unit: 'µg',
      alt_units: [{ unit: 'IU (retinol)', to_main_unit_factor: 0.3 }],
      upper_limit: { value: 3000, unit: 'µg/day preformed vitamin A (retinol)', applies_to: 'food_and_supplements', source: 'ICMR-NIN 2020' },
      log_presets: presets,
    });

  it('marks a preset above the adult UL (Vitamin A 25,000 IU = 7500 µg vs 3000)', () => {
    const n = buildNutrient([nutrientVersion(vitA([{ label: 'Vitamin A capsule 25,000 IU', amount: 7500, unit: 'µg' }, { label: 'Multivitamin', amount: 900, unit: 'µg' }]), '2026-10-09', '')], '2026-10-15');
    expect(n.logPresets.map((p) => [p.label, p.mainAmount, p.prescriptionDose])).toEqual([
      ['Vitamin A capsule 25,000 IU', 7500, true],
      ['Multivitamin', 900, false],
    ]);
  });

  it('judges a converted IU preset in the main unit', () => {
    const n = buildNutrient([nutrientVersion(vitA([{ label: 'Retinol 25,000 IU', amount: 25000, unit: 'IU' }]), '2026-10-09', '')], '2026-10-15');
    expect(n.logPresets[0]).toMatchObject({ mainAmount: 7500, prescriptionDose: true });
  });

  it('uses the top of an ambiguous range (safe side) and compares across mass units', () => {
    const json = nutrientJson({
      id: 'vitamin-e',
      alt_units: [
        { unit: 'mg dl-alpha-tocopheryl acetate', to_main_unit_factor: 0.45 },
        { unit: 'mg d-alpha-tocopheryl acetate', to_main_unit_factor: 0.91 },
      ],
      upper_limit: { value: 300000, unit: 'µg/day', applies_to: 'food_and_supplements', source: 'EFSA 2024' },
      log_presets: [{ label: '400 mg tocopheryl acetate', amount: 400, unit: 'mg tocopheryl acetate' }, { label: 'Capsule 200 mg', amount: 200, unit: 'mg' }],
    });
    const n = buildNutrient([nutrientVersion(json, '2026-10-10', '')], '2026-10-15');
    expect(n.logPresets.map((p) => p.prescriptionDose)).toEqual([true, false]);
  });

  it('never marks presets when there is no UL', () => {
    const n = buildNutrient([nutrientVersion(nutrientJson(), '2026-10-11')], '2026-10-15');
    expect(n.logPresets.every((p) => !p.prescriptionDose)).toBe(true);
  });
});

describe('review fix 2c: app default targets must equal the ICMR row', () => {
  it('recognises ICMR rows and rows that say the ICMR value was not found', () => {
    expect(isIcmrRow({ source: 'ICMR-NIN 2020 (RDA via secondary summary; EAR not found)', rda: 900, ai: null })).toBe(true);
    expect(isIcmrRow({ source: 'ICMR-NIN value not found; NASEM 2000 / NIH ODS shown', rda: 15, ai: null })).toBe(false);
    expect(isIcmrRow({ source: 'ICMR-NIN 2020 pregnancy value not found; adult value applied', rda: null, ai: 55 })).toBe(false);
    expect(isIcmrRow({ source: 'Not found in ICMR-NIN 2020; app uses adult value by sex', rda: null, ai: null })).toBe(false);
    expect(isIcmrRow({ source: 'Not found as separate ICMR-NIN value; NASEM 2011', rda: null, ai: null })).toBe(false);
  });

  it('keeps defaults matching any adult_male_* / adult_female_* row, pregnant and lactating', () => {
    const v = nutrientVersion(nutrientJson(), '2026-10-11');
    const { value, review } = checkDefaultTargets(v.data.appDefaultTarget, v.data.targets);
    expect(value).toEqual({ adult_male: 1.4, adult_female: 1.4, pregnant: 2.0, lactating: 2.1, age_60_plus: null });
    expect(review).toHaveLength(1);
    expect(review[0]).toMatch(/age_60_plus = 1.4 has no ICMR row/);
  });

  it('nulls a default that differs from the ICMR row', () => {
    const v = nutrientVersion(nutrientJson({ app_default_target: { adult_male: 1.6, adult_female: 1.4, pregnant: 2.0, lactating: 2.1, age_60_plus: null } }), '2026-10-11');
    const { value, review } = checkDefaultTargets(v.data.appDefaultTarget, v.data.targets);
    expect(value.adult_male).toBeNull();
    expect(review[0]).toMatch(/adult_male = 1.6 does not equal the ICMR row \(adult_male_sedentary 1.4, adult_male_moderate 1.8\)/);
  });

  it('nulls the Vitamin E pregnancy default that sits on a US-valued row', () => {
    const json = nutrientJson({
      id: 'vitamin-e',
      targets: [
        { group: 'adult_female_sedentary', ear: null, rda: null, ai: 7.5, source: 'ICMR-NIN 2020 (about 7.5-10 mg/day; EAR not found)' },
        { group: 'pregnant', ear: 12, rda: 15, ai: null, source: 'ICMR-NIN value not found; NASEM 2000 / NIH ODS shown' },
      ],
      app_default_target: { adult_male: null, adult_female: 7.5, pregnant: 7.5, lactating: null, age_60_plus: null },
    });
    const n = buildNutrient([nutrientVersion(json, '2026-10-10', '')], '2026-10-15');
    expect(n.appDefaultTarget).toMatchObject({ adult_female: 7.5, pregnant: null });
    expect(n.needsReview.some((r) => /app_default_target.pregnant = 7.5 has no ICMR row/.test(r))).toBe(true);
  });
});

describe('buildNutrient merge rules', () => {
  const older = nutrientJson({
    upper_limit: { value: 120, unit: 'mg', applies_to: 'supplements_only', source: 'UK EVM' },
    absorption_boosters: ['whole grains'],
    warnings: ['Old warning that must survive.'],
    deficiency_risk_india: 'high',
  });

  it('never averages official values: both cite ICMR and differ → keep previous and flag', () => {
    const newer = nutrientJson({ targets: [{ group: 'adult_male_sedentary', ear: 1.2, rda: 1.5, ai: null, source: 'ICMR-NIN 2020' }] });
    const n = buildNutrient([nutrientVersion(newer, '2026-11-01'), nutrientVersion(older, '2026-10-11')], '2026-11-02');
    expect(n.targets.find((t) => t.group === 'adult_male_sedentary')?.rda).toBe(1.4);
    expect(n.needsReview.some((r) => /targets.adult_male_sedentary.rda: Conflict .*both cite/.test(r))).toBe(true);
  });

  it('keeps the version that cites the official table', () => {
    const uncited = nutrientJson({ targets: [{ group: 'adult_male_sedentary', ear: 1.2, rda: 1.2, ai: null, source: 'NASEM 1998' }] });
    const n = buildNutrient([nutrientVersion(older, '2026-10-11'), nutrientVersion(uncited, '2026-11-01')], '2026-11-02');
    const row = n.targets.find((t) => t.group === 'adult_male_sedentary');
    expect(row).toMatchObject({ rda: 1.4, source: 'ICMR-NIN 2020 short report' });
    expect(n.needsReview.some((r) => /adult_male_sedentary.rda/.test(r))).toBe(false);
  });

  it('keeps the lower upper limit on conflict and flags it', () => {
    const newer = nutrientJson({ upper_limit: { value: 100, unit: 'mg', applies_to: 'supplements_only', source: 'UK EVM 2003' } });
    const a = buildNutrient([nutrientVersion(older, '2026-10-11'), nutrientVersion(newer, '2026-11-01')], '2026-11-02');
    expect(a.upperLimit?.value).toBe(100);
    expect(a.needsReview.some((r) => /upperLimit: Safety limit conflict/.test(r))).toBe(true);
    const higherLater = nutrientJson({ upper_limit: { value: 200, unit: 'mg', applies_to: 'supplements_only', source: 'x' } });
    expect(buildNutrient([nutrientVersion(older, '2026-10-11'), nutrientVersion(higherLater, '2026-11-01')], '2026-11-02').upperLimit?.value).toBe(120);
  });

  it('flags a per-100 g food value that changed, keeping the previous one', () => {
    const newer = nutrientJson({ top_food_sources: [{ food: 'Wheat flour, whole (atta)', veg: true, per_100g: 0.45, serving_g: 60, serving_label: '2 rotis', per_serving: 0.27 }] });
    const n = buildNutrient([nutrientVersion(older, '2026-10-11'), nutrientVersion(newer, '2026-11-01')], '2026-11-02');
    expect(n.topFoodSources[0]).toMatchObject({ per100g: 0.42, servingLabel: '2 rotis' });
    expect(n.needsReview.some((r) => /topFoodSources.wheat-flour-whole.per100g/.test(r))).toBe(true);
  });

  it('unions lists and warnings, takes text from the newest, and keeps provenance', () => {
    const newer = nutrientJson({
      absorption_boosters: ['Whole grains', 'parboiled rice'],
      warnings: ['A new warning.'],
      deficiency_risk_india: 'moderate',
      good_source_dishes: [{ dish_number: 12, dish_name: 'Rajma Chawal' }, { dish_number: 5, dish_name: 'Dal Tadka' }],
      last_researched: '2026-11-01',
    });
    const n = buildNutrient([nutrientVersion(older, '2026-10-11'), nutrientVersion(newer, '2026-11-01')], '2026-11-02');
    expect(n.absorptionBoosters).toEqual(['whole grains', 'parboiled rice']);
    expect(n.warnings).toEqual(['Old warning that must survive.', 'A new warning.']);
    expect(n.deficiencyRiskIndia).toBe('moderate');
    expect(n.goodSourceDishes.map((d) => d.dishNumber)).toEqual([11, 5, 12]);
    expect(n.lastResearched).toBe('2026-11-01');
    expect(n.versions).toEqual([
      { date: '2026-10-11', file: 'FitPlate_Nutrients_2026-10-11.md' },
      { date: '2026-11-01', file: 'FitPlate_Nutrients_2026-11-01.md' },
    ]);
    expect(n.mergeMethod.upperLimit).toMatch(/lower on conflict/);
  });

  it('groups versions by kind + id and ignores a duplicate of the same date', () => {
    const v = nutrientVersion(nutrientJson(), '2026-10-11');
    const groups = groupTopicVersions([v, v, nutrientVersion(nutrientJson(), '2026-11-01')] as NutrientTopicVersion[]);
    expect([...groups.keys()]).toEqual(['nutrient:thiamine']);
    expect(groups.get('nutrient:thiamine')?.map((x) => x.date)).toEqual(['2026-10-11', '2026-11-01']);
    expect(buildTopic(groups.get('nutrient:thiamine') ?? [], '2026-11-02').kind).toBe('nutrient');
  });
});

describe('hydration and profiles', () => {
  const hyd = (date: string, over: Json): HydrationVersion => {
    const text = `## 30. Daily water requirement\n\`\`\`json\n${JSON.stringify({ id: 'water-daily-requirement', type: 'hydration', inputs: ['weight_kg'], quick_add_presets_ml: [250], drinks: [], warnings: [], ...over })}\n\`\`\`\n`;
    return parseNutrientFile(text, `FitPlate_Nutrients_${date}.md`).items[0] as HydrationVersion;
  };

  it('keeps the lower max water cap and unions presets and warnings', () => {
    const h = buildHydration([hyd('2026-10-25', { max_ml: 4000, min_ml: 1500, warnings: ['a'] }), hyd('2026-11-15', { max_ml: 5000, min_ml: 1800, quick_add_presets_ml: [500, 250], warnings: ['b'] })], '2026-11-16');
    expect(h).toMatchObject({ maxMl: 4000, minMl: 1800, quickAddPresetsMl: [250, 500], warnings: ['a', 'b'] });
    expect(validateHydration(h)).toEqual([]);
    expect(validateHydration({ ...h, minMl: 6000 })).toEqual(['minMl 6000 above maxMl 4000']);
  });

  it('keeps requires_doctor_input once any version sets it, and the lower sodium limit', () => {
    const cond = (date: string, over: Json): ConditionVersion =>
      parseNutrientFile(`## P3. High blood pressure\n\`\`\`json\n${JSON.stringify({ id: 'hypertension', type: 'condition', name: 'High blood pressure', ...over })}\n\`\`\`\n`, `FitPlate_Nutrients_${date}.md`).items[0] as ConditionVersion;
    const c = buildCondition([cond('2026-10-14', { sodium_mg_max: 1500, requires_doctor_input: true }), cond('2026-11-16', { sodium_mg_max: 2000, requires_doctor_input: false })], '2026-11-17');
    expect(c).toMatchObject({ sodiumMgMax: 1500, requiresDoctorInput: true });
    expect(validateCondition(c)).toEqual([]);
  });
});

describe('validateNutrient', () => {
  const ok = () => buildNutrient([nutrientVersion(nutrientJson({ upper_limit: { value: 100, unit: 'mg', applies_to: 'supplements_only', source: 'x' } }), '2026-10-11')], '2026-10-15');

  it('accepts a well-formed nutrient', () => {
    expect(validateNutrient(ok())).toEqual([]);
  });

  it('reports missing fields, bad units, negative numbers and UL below RDA', () => {
    const n: Nutrient = ok();
    expect(validateNutrient({ ...n, name: '', unit: 'IU' })).toEqual(['no name', 'main unit "IU" is not µg, mg or g']);
    expect(validateNutrient({ ...n, targets: [{ group: 'pregnant', ear: -1, rda: 2, ai: null, source: '' }] })).toEqual(['targets.pregnant.ear is negative (-1)']);
    expect(validateNutrient({ ...n, upperLimit: { value: 1.5, unit: 'mg', appliesTo: null, source: '' } })).toEqual([
      'upper limit 1.5 mg is below adult_male_moderate RDA 1.8',
      'upper limit 1.5 mg is below pregnant RDA 2',
      'upper limit 1.5 mg is below lactating RDA 2.1',
    ]);
  });
});

describe('cross-link helpers', () => {
  it('exposes dish numbers, per-100 g food values and drinks', () => {
    const n = buildNutrient([nutrientVersion(nutrientJson(), '2026-10-11')], '2026-10-15');
    expect(nutrientCrossLinks(n)).toEqual({
      id: 'thiamine',
      unit: 'mg',
      goodSourceDishNumbers: [11, 5],
      unnumberedDishes: [],
      foodSources: [{ food: 'Wheat flour, whole (atta)', per100g: 0.42, unit: 'mg', veg: true }],
    });
    expect(dishNutrientIndex([n, { ...n, id: 'other' }])).toEqual({ 11: ['thiamine', 'other'], 5: ['thiamine', 'other'] });
    const h = buildHydration(
      [parseNutrientFile('## 33. Water from drinks\n```json\n{"id":"water-from-drinks","type":"hydration","drinks":[{"name":"Coconut water","counts_as_water_pct":100,"notes":""}]}\n```\n', 'FitPlate_Nutrients_2026-10-26.md').items[0] as HydrationVersion],
      '2026-10-27',
    );
    expect(hydrationCrossLinks(h).drinks).toEqual([{ name: 'Coconut water', countsAsWaterPct: 100, notes: '' }]);
  });
});

// The real research files, when this machine can see them.
const REAL_DIR = '/mnt/project-files/nutrient-research';
const REAL_FILES = ['FitPlate_Nutrients_2026-10-09.md', 'FitPlate_Nutrients_2026-10-10.md', 'FitPlate_Nutrients_2026-10-11.md'];
const haveReal = REAL_FILES.every((f) => fs.existsSync(path.join(REAL_DIR, f)));

(haveReal ? describe : describe.skip)('real nutrient research files', () => {
  const versions = REAL_FILES.flatMap((f) => {
    const { items, errors } = parseNutrientFile(fs.readFileSync(path.join(REAL_DIR, f), 'utf8'), f);
    expect(errors).toEqual([]);
    return items;
  });
  const built = [...groupTopicVersions(versions).values()].map((v) => buildTopic(v, '2026-10-15').item as Nutrient);
  const byId = Object.fromEntries(built.map((n) => [n.id, n]));
  const preset = (id: string, label: RegExp) => byId[id].logPresets.find((p) => label.test(p.label));

  it('parses all six topics as valid nutrients', () => {
    expect(versions.map((v) => [v.kind, v.id])).toEqual([
      ['nutrient', 'vitamin-a'],
      ['nutrient', 'vitamin-d'],
      ['nutrient', 'vitamin-e'],
      ['nutrient', 'vitamin-k'],
      ['nutrient', 'vitamin-c'],
      ['nutrient', 'thiamine'],
    ]);
    for (const n of built) expect([n.id, validateNutrient(n)]).toEqual([n.id, []]);
  });

  it('converts presets with the files’ own factors', () => {
    expect(preset('thiamine', /benfotiamine/i)?.mainAmount).toBeCloseTo(85.5, 5);
    expect(preset('thiamine', /mononitrate/i)?.mainAmount).toBeCloseTo(8.1, 5);
    expect(preset('vitamin-e', /tocopheryl acetate/i)?.mainAmountRange).toEqual({ min: 180, max: 364 });
    expect(preset('vitamin-a', /Custom amount in IU/)?.toMainFactor).toBe(0.3);
  });

  it('marks prescription doses above the adult UL', () => {
    const rx = built.flatMap((n) => n.logPresets.filter((p) => p.prescriptionDose).map((p) => `${n.id}: ${p.label}`));
    expect(rx).toEqual([
      'vitamin-a: Vitamin A capsule 25,000 IU',
      'vitamin-d: Vitamin D3 60,000 IU weekly sachet/capsule',
      expect.stringMatching(/^vitamin-e: Vitamin E capsule 400 mg tocopheryl acetate/),
    ]);
  });

  it('keeps only app defaults that equal the ICMR row', () => {
    expect(byId['vitamin-a'].appDefaultTarget).toEqual({ adult_male: 1000, adult_female: 840, pregnant: 900, lactating: 950, age_60_plus: null });
    expect(byId['vitamin-e'].appDefaultTarget).toEqual({ adult_male: 10, adult_female: 7.5, pregnant: null, lactating: null, age_60_plus: null });
    expect(byId['vitamin-k'].appDefaultTarget).toEqual({ adult_male: 55, adult_female: 55, pregnant: null, lactating: null, age_60_plus: null });
    expect(byId['thiamine'].appDefaultTarget).toEqual({ adult_male: 1.4, adult_female: 1.4, pregnant: 2, lactating: 2.1, age_60_plus: null });
  });
});

describe('condition profiles default to "ask your doctor" (review 2026-10-15 FIX 1)', () => {
  const cond = (date: string, over: Json): ConditionVersion =>
    parseNutrientFile(
      `## P13. Chronic kidney disease (early stages)\n\`\`\`json\n${JSON.stringify({ id: 'ckd-early', type: 'condition', name: 'Chronic kidney disease', ...over })}\n\`\`\`\n`,
      `FitPlate_Nutrients_${date}.md`,
    ).items[0] as ConditionVersion;

  it('flag missing with a water max → true, a needs-review note, and the doctor display line', () => {
    const v = cond('2026-10-24', { water_ml: { min: 1500, max: 2000, notes: 'Depends on urine output' } });
    expect(v.data).toMatchObject({ requiresDoctorInput: true, requiresDoctorInputStated: false, fluidNote: FOLLOW_DOCTOR_LINE });
    expect(v.notes).toEqual([
      "2026-10-24 ckd-early: requires_doctor_input is missing but the profile sets water max 2000 ml; set to true (the app asks for the doctor's number)",
    ]);
    const c = buildCondition([v], '2026-10-25');
    expect(c).toMatchObject({ requiresDoctorInput: true, fluidNote: "Follow your doctor's advice" });
    expect(c.needsReview).toContain(v.notes[0]);
  });

  it('flag missing with a sodium max or a protein/potassium/phosphorus/fluid limit → true', () => {
    expect(cond('2026-10-24', { sodium_mg_max: 2000 }).data.requiresDoctorInput).toBe(true);
    for (const nutrient of ['Protein', 'Potassium', 'Phosphorus', 'Fluid']) {
      const v = cond('2026-10-24', { targets: [{ nutrient, unit: 'g', general_adult: null, profile_value: null, min: null, max: 1, direction: 'limit', source: 'KDIGO 2024' }] });
      expect([nutrient, v.data.requiresDoctorInput]).toEqual([nutrient, true]);
    }
    // A protein target to raise is not a limit.
    expect(cond('2026-10-24', { targets: [{ nutrient: 'Protein', unit: 'g', min: 60, direction: 'raise', source: 'ICMR' }] }).data.requiresDoctorInput).toBe(false);
  });

  it('flag explicitly false stays false, even with a water max; the display line is still there', () => {
    const v = cond('2026-10-24', { water_ml: { min: 1500, max: 2000, notes: '' }, sodium_mg_max: 2000, requires_doctor_input: false });
    expect(v.data).toMatchObject({ requiresDoctorInput: false, requiresDoctorInputStated: true, fluidNote: FOLLOW_DOCTOR_LINE });
    expect(v.notes).toEqual([]);
    expect(buildCondition([v], '2026-10-25')).toMatchObject({ requiresDoctorInput: false, needsReview: [] });
  });

  it('flag missing and no limits → false, no note, no display line', () => {
    const v = cond('2026-10-24', { foods_favour: ['Fresh fruit'] });
    expect(v.data).toMatchObject({ requiresDoctorInput: false, requiresDoctorInputStated: false, fluidNote: null });
    expect(v.notes).toEqual([]);
    expect(buildCondition([v], '2026-10-25').requiresDoctorInput).toBe(false);
  });

  it('a newer explicit false overrides an older default; a newer default overrides an older explicit false', () => {
    const defaulted = cond('2026-10-24', { water_ml: { min: null, max: 2000, notes: '' } });
    const statedFalse = cond('2026-11-14', { water_ml: { min: null, max: 2000, notes: '' }, requires_doctor_input: false });
    expect(buildCondition([defaulted, statedFalse], '2026-11-15').requiresDoctorInput).toBe(false);
    const olderFalse = cond('2026-10-24', { requires_doctor_input: false });
    const newerDefault = cond('2026-11-14', { sodium_mg_max: 1500 });
    expect(buildCondition([olderFalse, newerDefault], '2026-11-15').requiresDoctorInput).toBe(true);
  });
});
```

### `src/__tests__/data/tags.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { buildDish, buildIngredientIndex } from '../../services/data/buildItems';
import { declaredAllergens, parseDietTags, parseTagsLine, parseVariants, withoutDietTags } from '../../services/data/dietTags';
import { parseDishFile } from '../../services/data/dishImporter';
import { assignFamilies, cuisineTag, dishTags, familyKey, timeBand } from '../../services/data/tags';
import type { Dish, FastingLine } from '../../models/research';

// Shapes copied from FitPlate_Dishes_2026-10-12.md (PATCH 03 and 04 blocks).
const FACTS = `- Difficulty: Beginner.
- Servings: 1.

**Diet tags**
- Base diet: Vegetarian
- Jain: With changes — skip the fresh ginger (a root)
- Vegan: With changes — use 1 tbsp groundnut oil instead of ghee
- Pescatarian: Yes — vegetarian, so it fits
- No onion / no garlic (sattvik): Yes — no onion or garlic
- Gluten-free: With changes — use a hing labelled gluten-free
- Dairy-free: With changes — ghee is the only dairy
- Contains common allergens: dairy (ghee), tree nuts (cashew), gluten (only via compounded hing)

**Fasting suitability**
- Navratri / vrat: No — rice and dal
- Ekadashi: No — rice
- Jain: With changes — skip the fresh ginger
- Ramadan sehri / iftar: Yes — mild and filling
`;

const VARIANTS_NESTED = `1. **Roast the dal.** Dry-roast it.
    - Time: 3 min

**Diet variants**
- Jain: Variant.
  **Jain variant: Jain Ven Pongal (no ginger)**
  - Origin: FitPlate-created. No established recipe was found.
  - Swaps: ginger 5 g → leave out
- Vegan: Variant.
  **Vegan variant: Vegan Ven Pongal (groundnut oil)**
  - Origin: Established dish (Holy Cow Vegan).
- Dairy-free: Already fits — main recipe already dairy-free
- Jain-style sweet: Not appropriate — a different dish
`;

const VARIANTS_AFTER = `**Diet variants**
- **Jain:** Variant (below).
- **Dairy-free:** Already fits — no milk, butter or ghee.
- **Vegetarian:** Variant (below).

**Vegetarian variant: Veg Fried Rice (FitPlate dish 10)**
- Origin: Established dish (FitPlate dish 10).
- Swaps: chicken 100 g → leave out

**Jain variant: Jain Vegetable Fried Rice**
- Origin: Established dish (Tarla Dalal).
`;

describe('PATCH 03 diet tags block', () => {
  it('reads every line with its status', () => {
    const t = parseDietTags(FACTS)!;
    expect(t.base).toBe('Vegetarian');
    expect(t.jain.status).toBe('with-changes');
    expect(t.vegan).toEqual({ status: 'with-changes', reason: 'use 1 tbsp groundnut oil instead of ghee' });
    expect(t.pescatarian.status).toBe('yes');
    expect(t.sattvik.status).toBe('yes');
    expect(t.glutenFree.status).toBe('with-changes');
    expect(t.allergensDeclared).toEqual(['milk', 'treeNut', 'gluten']);
  });

  it('stops at the Fasting suitability block', () => {
    const t = parseDietTags(FACTS)!;
    expect(t.jain.reason).toBe('skip the fresh ginger (a root)');
  });

  it('is null for files before PATCH 03', () => {
    expect(parseDietTags('- Difficulty: Beginner.\n')).toBeNull();
  });

  it('removes the block so its lines are not read as prose claims', () => {
    const rest = withoutDietTags(FACTS);
    expect(rest).not.toMatch(/Vegan: With changes/);
    expect(rest).toMatch(/Fasting suitability/);
  });

  it('maps declared allergen words to FitPlate ids', () => {
    expect(declaredAllergens('None of the listed')).toEqual([]);
    expect(declaredAllergens('egg, soy (soy sauce), gluten (soy sauce)')).toEqual(['egg', 'soy', 'gluten']);
    expect(declaredAllergens('peanut (groundnut oil), mustard')).toEqual(['peanut', 'mustard']);
  });
});

describe('PATCH 04 tags line and variants', () => {
  it('splits research tags, variant categories and the description', () => {
    const head = `South Indian | Vegetarian | Breakfast
Tags: Vegetarian, Sattvik, Breakfast, South Indian (Tamil Nadu, Kerala), Has variants: Jain, Vegan, Lower-GI (millet)
A vegetarian, sattvik Tamil breakfast; Jain and vegan versions below.
`;
    const t = parseTagsLine(head)!;
    expect(t.researchTags).toEqual(['Vegetarian', 'Sattvik', 'Breakfast', 'South Indian (Tamil Nadu, Kerala)']);
    expect(t.variantCategories).toEqual(['Jain', 'Vegan', 'Lower-GI (millet)']);
    expect(t.description).toMatch(/^A vegetarian, sattvik/);
    expect(parseTagsLine('Maharashtrian | Veg | Breakfast\n')).toBeNull();
  });

  it('reads nested variants with names and origins', () => {
    const v = parseVariants(VARIANTS_NESTED);
    expect(v.map((x) => [x.category, x.status, x.origin])).toEqual([
      ['Jain', 'variant', 'fitplate-created'],
      ['Vegan', 'variant', 'established'],
      ['Dairy-free', 'already-fits', null],
      ['Jain-style sweet', 'not-appropriate', null],
    ]);
    expect(v[0].name).toBe('Jain Ven Pongal (no ginger)');
    expect(v[2].reason).toBe('main recipe already dairy-free');
  });

  it('reads summary-first variants and links to another FitPlate dish', () => {
    const v = parseVariants(VARIANTS_AFTER);
    const veg = v.find((x) => x.category === 'Vegetarian')!;
    expect(veg).toMatchObject({ status: 'variant', name: 'Veg Fried Rice', linkedDishNumber: 10, origin: 'established' });
    expect(v.find((x) => x.category === 'Jain')).toMatchObject({ name: 'Jain Vegetable Fried Rice', origin: 'established' });
    // "- Origin:" and "- Swaps:" lines at the left margin are detail, not categories.
    expect(v.map((x) => x.category).sort()).toEqual(['Dairy-free', 'Jain', 'Vegetarian']);
  });

  it('is empty when the block is missing', () => {
    expect(parseVariants('1. **Cook.** Cook it.')).toEqual([]);
  });
});

const NO: FastingLine = { status: 'no', reason: null };
const YES: FastingLine = { status: 'yes', reason: null };

function base(over: Partial<Dish> = {}): Parameters<typeof dishTags>[0] {
  return {
    dietType: 'veg',
    dietClaims: [],
    fasting: null,
    allergens: [],
    mealType: ['breakfast'],
    cuisine: 'Maharashtrian (Mumbai)',
    difficulty: 'Beginner',
    prepMin: 10,
    cookMin: 10,
    nutritionPerServing: { kcal: 390, proteinG: 8, carbsG: 60, fatG: 12, fibreG: 3 },
    dietTags: null,
    variants: [],
    ingredients: [],
    ...over,
  };
}

describe('tag engine', () => {
  it('tags diet, meal, cuisine, time and difficulty', () => {
    expect(dishTags(base()).tags).toEqual(['Veg', 'Breakfast', 'Maharashtrian', 'Under 30 min', 'Beginner']);
  });

  it('shows Vegan / Gluten-free only from kept claims, never from "nothing detected"', () => {
    expect(dishTags(base()).tags).not.toContain('Gluten-free');
    const t = dishTags(base({ dietClaims: ['vegan', 'glutenFree'] })).tags;
    expect(t).toContain('Vegan');
    expect(t).toContain('Gluten-free');
  });

  it('gives Jain only for a validated yes, and Jain option for with-changes or a variant', () => {
    const fasting = { navratri: NO, ekadashi: NO, ramadan: NO, jain: YES };
    expect(dishTags(base({ fasting })).tags).toContain('Jain');
    expect(dishTags(base({ fasting: { ...fasting, jain: { status: 'with-changes', reason: 'skip onion' } } })).tags).toContain('Jain option');
    // A Jain line the validator nulled gives nothing unless research has a Jain variant.
    expect(dishTags(base({ fasting: { ...fasting, jain: { status: null, reason: 'x' } } })).tags.filter((t) => t.startsWith('Jain'))).toEqual([]);
    const variant = { category: 'Jain', status: 'variant' as const, name: 'Jain Pav Bhaji', origin: 'established' as const, linkedDishNumber: null, reason: null };
    expect(dishTags(base({ variants: [variant] })).tags).toContain('Jain option');
  });

  it('marks fasting dishes', () => {
    const t = dishTags(base({ fasting: { navratri: YES, ekadashi: YES, jain: NO, ramadan: NO } })).tags;
    expect(t).toEqual(expect.arrayContaining(['Navratri / vrat', 'Ekadashi', 'Fasting-friendly']));
  });

  it('adds Contains chips from allergens', () => {
    expect(dishTags(base({ allergens: ['peanut', 'treeNut'] })).tags).toEqual(expect.arrayContaining(['Contains peanut', 'Contains tree nuts']));
  });

  it('uses the research thresholds for nutrition tags', () => {
    const t = dishTags(base({ nutritionPerServing: { kcal: 300, proteinG: 15, carbsG: 20, fatG: 5, fibreG: 6 } })).tags;
    expect(t).toEqual(expect.arrayContaining(['High protein', 'High fibre', 'Low calorie']));
    const u = dishTags(base({ nutritionPerServing: { kcal: 301, proteinG: 14.9, carbsG: 20, fatG: 5, fibreG: 5.9 } })).tags;
    expect(u).not.toEqual(expect.arrayContaining(['High protein']));
    expect(u).not.toContain('High fibre');
    expect(u).not.toContain('Low calorie');
  });

  it('checks researched sattvik and pescatarian lines against the recipe', () => {
    const lines = { base: 'Vegetarian', jain: NO, vegan: NO, glutenFree: NO, dairyFree: NO, allergensDeclared: null, sattvik: YES, pescatarian: YES };
    const ok = dishTags(base({ dietTags: lines, ingredients: [{ ingredientId: null, name: 'Rice', quantity: 50, unit: 'g', householdMeasure: null }] }));
    expect(ok.tags).toContain('No onion-garlic');
    // Veg dish: no Pescatarian chip (it would crowd every veg title); search still matches it.
    expect(ok.tags).not.toContain('Pescatarian');
    const fish = dishTags(base({ dietType: 'non-veg', dietTags: lines, ingredients: [{ ingredientId: null, name: 'Surmai (kingfish) steaks', quantity: 150, unit: 'g', householdMeasure: null }] }));
    expect(fish.tags).toContain('Pescatarian');
    const bad = dishTags(
      base({
        dietTags: lines,
        ingredients: [
          { ingredientId: null, name: 'Onion (kanda)', quantity: 30, unit: 'g', householdMeasure: null },
          { ingredientId: null, name: 'Chicken, curry cut', quantity: 100, unit: 'g', householdMeasure: null },
        ],
      }),
    );
    expect(bad.tags).not.toContain('No onion-garlic');
    expect(bad.tags).not.toContain('Pescatarian');
    expect(bad.review).toHaveLength(2);
  });

  it('time bands and cuisine', () => {
    expect(timeBand(5, 10)).toBe('Under 15 min');
    expect(timeBand(20, 25)).toBe('Under 60 min');
    expect(timeBand(30, 60)).toBeNull();
    expect(timeBand(null, null)).toBeNull();
    expect(cuisineTag('South Indian (Tamil Nadu; also Udupi)')).toBe('South Indian');
    expect(cuisineTag(null)).toBeNull();
  });
});

describe('variant families', () => {
  it('keys names that differ only by a version word', () => {
    expect(familyKey('Chicken Biryani')).toBe('biryani');
    expect(familyKey('Veg Biryani')).toBe('biryani');
    expect(familyKey('Jain Veg Biryani')).toBe('biryani');
    expect(familyKey('Masala Dosa')).not.toBe(familyKey('Rava Dosa'));
  });

  it('needs two dishes and uses research links', () => {
    const v = (n: number) => ({ category: 'Vegetarian', status: 'variant' as const, name: 'x', origin: null, linkedDishNumber: n, reason: null });
    const { familyOf, links } = assignFamilies([
      { id: '002-chicken-biryani', number: 2, name: 'Chicken Biryani', variants: [] },
      { id: '039-veg-biryani', number: 39, name: 'Veg Biryani', variants: [] },
      { id: '001-poha', number: 1, name: 'Poha', variants: [] },
      { id: '043-chicken-fried-rice', number: 43, name: 'Chicken Fried Rice', variants: [v(10)] },
      { id: '010-veg-fried-rice', number: 10, name: 'Veg Fried Rice', variants: [] },
    ]);
    expect(familyOf.get('039-veg-biryani')).toBe('biryani');
    expect(familyOf.has('001-poha')).toBe(false);
    expect(links.find((l) => l.familyId === 'fried-rice')).toMatchObject({ how: 'research-variant', dishIds: ['010-veg-fried-rice', '043-chicken-fried-rice'] });
  });

  it('puts each dish in exactly one family when a research link joins two name groups (review fix 3)', () => {
    // Dish 60 Aloo Matar links its variant "Matar aur Kacha Kela"; a Jain version shares the variant's name key.
    const link = { category: 'Vegan', status: 'variant' as const, name: 'Matar aur Kacha Kela', origin: null, linkedDishNumber: 61, reason: null };
    const { familyOf, links } = assignFamilies([
      { id: '062-jain-matar-aur-kacha-kela', number: 62, name: 'Jain Matar aur Kacha Kela', variants: [] },
      { id: '061-matar-aur-kacha-kela', number: 61, name: 'Matar aur Kacha Kela', variants: [] },
      { id: '060-aloo-matar', number: 60, name: 'Aloo Matar', variants: [link] },
    ]);
    expect(familyOf.get('060-aloo-matar')).toBe('aloo-matar');
    expect(familyOf.get('061-matar-aur-kacha-kela')).toBe('aloo-matar');
    expect(familyOf.get('062-jain-matar-aur-kacha-kela')).toBe('aloo-matar');
    expect(links).toEqual([{ familyId: 'aloo-matar', dishIds: ['060-aloo-matar', '061-matar-aur-kacha-kela', '062-jain-matar-aur-kacha-kela'], how: 'research-variant' }]);
  });
});

describe('dish importer with PATCH 03/04 blocks', () => {
  const FILE = `## 41. Pongal
South Indian | Vegetarian, Sattvik | Breakfast
Tags: Vegetarian, Sattvik, Breakfast, Has variants: Jain
A vegetarian, sattvik breakfast; a Jain version below.

### 1. Quick facts
${FACTS}
### 2. Ingredients (1 serving)
| Ingredient (standard name) | Quantity for 1 serving | Household measure |
|---|---|---|
| Raw rice | 50 g | ¼ cup |
| Ghee | 13 g | 1 tbsp |
| Ginger (adrak) | 5 g | 1 cm |
| Cashews (kaju) | 8 g | 6 |

### 3. Equipment
- Pressure cooker.

### 4. Micro-steps
${VARIANTS_NESTED}
### 5. Calories and nutrition (1 serving)
**Total: about 435 kcal | Protein 11.9 g | Carbs 55.5 g | Fat 17.4 g | Fibre 4.7 g**
`;
  const [v] = parseDishFile(FILE, 'FitPlate_Dishes_2026-10-12.md');

  it('keeps steps apart from the variants block', () => {
    expect(v.steps).toHaveLength(1);
    expect(v.variants).toHaveLength(4);
  });

  it('adds research-declared allergens the names miss (hing gluten)', () => {
    expect(v.allergens).toEqual(expect.arrayContaining(['milk', 'treeNut', 'gluten']));
  });

  it('does not read "Vegan: With changes" as a vegan claim', () => {
    expect(v.dietClaims).not.toContain('vegan');
  });

  it('builds a tagged dish', () => {
    const d = buildDish([v], '2026-10-15', buildIngredientIndex([]));
    expect(d.description).toMatch(/^A vegetarian/);
    expect(d.familyId).toBeNull();
    expect(d.tags).toEqual(expect.arrayContaining(['Veg', 'Jain option', 'Vegan option', 'No onion-garlic', 'Contains milk', 'Breakfast']));
    expect(d.tags).not.toContain('Gluten-free');
  });
});
```

### `src/__tests__/data/crossLinks.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import {
  buildAliasMap,
  buildMicroTable,
  dishKcalFromIngredients,
  dishMicros,
  goodSourceLinks,
  indexWithAliases,
  linkStats,
  usedInMismatches,
} from '../../services/data/crossLinks';
import { linkIngredient } from '../../services/data/buildItems';
import { parseUsedIn } from '../../services/data/ingredientImporter';
import type { DishIngredient, NutrientPer100, SourcedValue } from '../../models/research';

const line = (name: string, quantity: number | null, unit: string | null, ingredientId: string | null = null): DishIngredient => ({ ingredientId, name, quantity, unit, householdMeasure: null });

const sv = (value: number | null): SourcedValue => ({ value, source: value == null ? null : 'IFCT 2017', confidence: value == null ? null : 'High' });
function profile(over: Partial<Record<keyof Omit<NutrientPer100, 'basis'>, number>>): NutrientPer100 {
  const keys = ['energyKcal', 'proteinG', 'carbsG', 'sugarsG', 'fatG', 'saturatedFatG', 'fibreG', 'sodiumMg', 'ironMg', 'calciumMg', 'potassiumMg', 'magnesiumMg', 'zincMg', 'vitaminCMg', 'vitaminAUgRae', 'folateUgDfe', 'waterG', 'cholesterolMg', 'transFatG', 'mufaG', 'pufaG', 'omega3G', 'addedSugarsG', 'phosphorusMg', 'seleniumUg', 'copperMg', 'manganeseMg', 'iodineUg', 'vitaminDUg', 'vitaminEMg', 'vitaminKUg', 'thiaminMg', 'riboflavinMg', 'niacinMg', 'vitaminB6Mg', 'vitaminB12Ug'] as const;
  const out = { basis: '100g' } as NutrientPer100;
  for (const k of keys) out[k] = sv(over[k] ?? null);
  return out;
}

const INGREDIENTS = [
  { id: 'cumin-seeds', name: 'Cumin seeds', aliases: [] as string[] },
  { id: 'spinach', name: 'Spinach', aliases: ['palak'] },
  { id: 'chawal-a', name: 'Rice A', aliases: ['chawal'] },
  { id: 'chawal-b', name: 'Rice B', aliases: ['chawal'] },
];

describe('F1 alias map', () => {
  it('learns Indian names from dish lines that link by English name', () => {
    const { aliases, learned, ambiguous } = buildAliasMap(INGREDIENTS, [{ ingredients: [line('Cumin seeds (jeera)', 1, 'g')] }]);
    expect(aliases.jeera).toBe('cumin-seeds');
    expect(aliases.palak).toBe('spinach');
    expect(learned).toEqual([{ alias: 'jeera', id: 'cumin-seeds' }]);
    expect(ambiguous).toEqual(['chawal (chawal-a, chawal-b)']);
    expect(aliases.chawal).toBeUndefined();
  });

  it('never learns from a line that only matched by prefix or alias', () => {
    const { learned } = buildAliasMap(INGREDIENTS, [{ ingredients: [line('Palak leaves (saag)', 100, 'g')] }]);
    expect(learned).toEqual([]);
  });

  it('never learns preparation words as names', () => {
    const ings = [{ id: 'hakka-noodles-dry', name: 'Hakka noodles', aliases: [] as string[] }, { id: 'tomato', name: 'Tomato', aliases: [] as string[] }];
    const { learned } = buildAliasMap(ings, [{ ingredients: [line('Hakka noodles (dry, refined wheat)', 100, 'g'), line('Tomato (pureed)', 50, 'g'), line('Tomato (cut into squares)', 50, 'g')] }]);
    expect(learned).toEqual([]);
  });

  it('the learned aliases link new lines', () => {
    const { aliases } = buildAliasMap(INGREDIENTS, [{ ingredients: [line('Cumin seeds (jeera)', 1, 'g')] }]);
    const index = indexWithAliases(INGREDIENTS, aliases);
    expect(linkIngredient('Jeera', index)).toBe('cumin-seeds');
    expect(linkIngredient('Unknown spice', index)).toBeNull();
  });

  it('counts linked and priced lines and lists the rest', () => {
    const s = linkStats(
      [{ id: '001-x', ingredients: [line('Spinach', 100, 'g', 'spinach'), line('Cumin', 1, 'g', 'cumin-seeds'), line('Mystery', 5, 'g')] }],
      [{ id: 'spinach', price: { currentEstimate: { min: 1, max: 2, avg: 1.5 } } as never }, { id: 'cumin-seeds', price: null }],
    );
    expect(s).toMatchObject({ lines: 3, linked: 2, priced: 1, unmatched: [{ dishId: '001-x', name: 'Mystery' }] });
  });
});

describe('F3 micronutrient table and dish estimate', () => {
  const ings = [
    { id: 'spinach', nutritionPer100g: profile({ ironMg: 2.7, vitaminAUgRae: 469, energyKcal: 23 }) },
    { id: 'cumin-seeds', nutritionPer100g: null },
  ];
  const index = indexWithAliases(INGREDIENTS, {});

  it('prefers the ingredient profile and fills gaps from nutrient food sources', () => {
    const { table, fromNutrientStream, unmatchedFoods } = buildMicroTable(
      ings,
      [
        { id: 'vitamin-a', unit: 'µg', topFoodSources: [{ food: 'Spinach (palak)', per100g: 434 }, { food: 'Goat liver', per100g: 15655 }] },
        { id: 'vitamin-c', unit: 'mg', topFoodSources: [{ food: 'Spinach', per100g: 28 }, { food: 'Amla', per100g: null }] },
      ],
      index,
    );
    expect(table.spinach.iron).toMatchObject({ per100: 2.7, unit: 'mg' });
    expect(table.spinach['vitamin-a'].per100).toBe(469); // the profile wins over the food-source table
    expect(table.spinach['vitamin-c']).toMatchObject({ per100: 28, source: 'nutrient research (vitamin-c food sources)' });
    expect(fromNutrientStream).toBe(1);
    expect(unmatchedFoods).toEqual(['Goat liver']);
  });

  it('scales by grams and reports weight coverage', () => {
    const { table } = buildMicroTable(ings, [], index);
    const est = dishMicros({ ingredients: [line('Spinach', 200, 'g', 'spinach'), line('Paneer', 200, 'g', 'paneer'), line('Salt', 1, 'tsp')] }, table)!;
    expect(est.values.iron).toBe(5.4);
    expect(est.coveragePct).toBe(50);
    expect(est.basis).toMatch(/partial/);
    expect(dishMicros({ ingredients: [line('Paneer', 100, 'g', 'paneer')] }, table)).toBeNull();
  });

  it('computes kcal from ingredients for the 25% comparison', () => {
    const map = new Map(ings.map((i) => [i.id, i]));
    expect(dishKcalFromIngredients({ ingredients: [line('Spinach', 0.2, 'kg', 'spinach')] }, map)).toEqual({ kcal: 46, coveragePct: 100 });
    expect(dishKcalFromIngredients({ ingredients: [line('Cumin', 1, 'g', 'cumin-seeds')] }, map)).toBeNull();
  });
});

describe('F4 good-source dishes and F7 used-in check', () => {
  it('links nutrient good-source dishes to bundled dish ids both ways', () => {
    const { byNutrient, byDish } = goodSourceLinks(
      [{ id: 'vitamin-a', goodSourceDishes: [{ dishNumber: 9, dishName: 'Idli with Sambar' }, { dishNumber: 96, dishName: 'Gajar Halwa' }] }],
      [{ id: '009-idli-with-sambar', number: 9 }],
    );
    expect(byNutrient['vitamin-a']).toEqual([
      { dishNumber: 9, dishName: 'Idli with Sambar', dishId: '009-idli-with-sambar' },
      { dishNumber: 96, dishName: 'Gajar Halwa', dishId: null },
    ]);
    expect(byDish).toEqual({ '009-idli-with-sambar': ['vitamin-a'] });
  });

  it('parses both "Used in" layouts', () => {
    expect(parseUsedIn('- 6 Upma: 20 g (2 tbsp, finely diced)\n- Dish 1, Poha: 60 g (thick)\n- 4 Masala Dosa: a pinch\n')).toEqual([
      { dishNumber: 6, quantity: 20, unit: 'g', raw: '20 g (2 tbsp, finely diced)' },
      { dishNumber: 1, quantity: 60, unit: 'g', raw: '60 g (thick)' },
      { dishNumber: 4, quantity: null, unit: null, raw: 'a pinch' },
    ]);
  });

  it('flags quantities more than 15% apart', () => {
    const dishes = [{ number: 6, ingredients: [line('Carrot', 20, 'g', 'carrot')] }, { number: 9, ingredients: [line('Carrot', 25, 'g', 'carrot')] }];
    const out = usedInMismatches(
      [{ id: 'carrot', usedIn: [{ dishNumber: 6, quantity: 22, unit: 'g', raw: '' }, { dishNumber: 9, quantity: 40, unit: 'g', raw: '' }, { dishNumber: 99, quantity: 10, unit: 'g', raw: '' }] }],
      dishes,
    );
    expect(out).toEqual([{ ingredientId: 'carrot', dishNumber: 9, ingredientFile: '40 g', dishTable: '25 g' }]);
  });
});
```

### `src/__tests__/data/importers.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { allergensOf, checkClaims, dishAllergens, findClaims } from '../../services/data/allergens';
import { buildDish, buildIngredient, buildIngredientIndex, linkIngredient, validateDish } from '../../services/data/buildItems';
import { parseDishFile, parseNutrition } from '../../services/data/dishImporter';
import { parseFasting, validateFasting } from '../../services/data/fasting';
import { normaliseId, parseIngredientFile } from '../../services/data/ingredientImporter';
import { minutes, rupeeRange, seconds, splitName, tableRows } from '../../services/data/markdown';
import { renderIndex } from '../../services/data/researchIndex';
import type { AllergenId } from '../../models/research';

// Fixtures copy the shapes of the real research files (dish 1 / 2 / 3 formats, dish 26 / 39 problems).
const DISH_FILE = `Cycle 1 | Dishes 1–2

# FitPlate daily dish research

## 1. Poha
Maharashtrian | Veg (naturally vegan and gluten-free) | Breakfast (also an evening snack)

### 1. Quick facts
- Difficulty: Beginner. One pan.
- Prep time: 10 min (chopping) / Cook time: 8–10 min / Total time: about 20 min
- Servings: 1.

**Fasting suitability**
- Navratri / vrat: No — poha is rice.
- Ekadashi: No — rice.
- Jain: With changes — skip the onion; use more peanuts.
- Ramadan sehri / iftar: Yes — light and filling.

### 2. Ingredients (1 serving)
| Ingredient (standard name) | Quantity for 1 serving | Household measure | What it looks like | Pantry staple? |
|---|---|---|---|---|
| Flattened rice, thick (poha) | 60 g | ¾ cup | Flakes | Y |
| Peanuts (moongphali), raw | 10 g | 1 tbsp | – | Y |
| Onion (kanda/pyaz) | 60 g | ½ medium onion | – | Y |
| Asafoetida (hing) | 0.1 g | a pinch | – | Y |

### 3. Equipment
- Kadai or wide frying pan with a lid. No lid? Use a plate.
- Colander

### 4. Micro-steps
1. **Rinse the poha.** Hold the colander under running water.
   - Time: 20–30 sec (no longer)
   - Visual cue: Every flake looks wet.
   - Camera check: The wet poha
   - Video shot: Water running over the poha.
   - Beginner tip: Do **not** soak it.
2. **Fry the peanuts.** Add the peanuts.
   - Time: 1.5–2 min

### 5. Calories and nutrition (1 serving)
**Total: about 390 kcal | Protein 7.9 g | Carbs 57.6 g | Fat 15.2 g | Fibre 3.2 g (all est.)**

| Ingredient | Qty | kcal | Protein (g) | Carbs (g) | Fat (g) | Fibre (g) | Basis |
|---|---|---|---|---|---|---|---|
| Poha | 60 g | 207.6 | 3.96 | 46.38 | 0.72 | 0.72 | IFCT |

### 6. Cost to order (1 serving)
- **Price range (1 serving): ₹120–150.** All 6 typical prices span ₹35–150 (average ₹87), which is more than 30%: two groups.
- **Average (1 serving): about ₹130** for the main group.

### 7. Healthiness score (out of 10)
- **Home-cooked: 7/10 | Typical restaurant: 5.5/10 (est.)**
- Reason: little oil, no deep frying.

### 8. Rating (based on our research)
- **Rating: 4.5 / 5**
- Reason: one of India's most-loved breakfasts.

### 10. After the meal
- **Storage:** Fridge for up to 1 day.
- **Leftover remix: Poha cutlets.** Mash and fry.
- **Burn it off (about 390 kcal):** about 5.6 km of running.

### 12. Sources
- Veg Recipes of India, Poha: https://www.vegrecipesofindia.com/kanda-poha-or-onion-poha/
- Not a link

---

## 2. Veg Biryani
Mughlai | Veg | Lunch / dinner

### 1. Quick facts
- Difficulty: Intermediate.
- Prep time / Cook time / Total time: 20 min / 1 hr 10 min / 1 hr 30 min
- Servings: 1

**Fasting suitability**
- Navratri / vrat: Yes — fine.
- Ekadashi: No — rice.
- Jain: With changes — skip onion, garlic, fried onions, potato and carrot; use cauliflower and peas, with hing and ginger for flavour.
- Ramadan sehri / iftar: Yes — filling.

### 2. Ingredients (1 serving)
| Ingredient | Quantity | Household measure |
|---|---|---|
| Basmati rice | 75 g | ⅓ cup |
| Ginger-garlic paste | 5 g | 1 tsp |
| Curd (dahi) | 50 g | 3 tbsp |

### 4. Micro-steps
1. **Soak the rice.** Rinse and soak.
   - Time: 20 min

### 5. Calories and nutrition (1 serving)
| Nutrient | Amount (est.) |
|---|---|
| Calories | ~540 kcal (est.) |
| Protein | ~12 g (est.) |
| Carbohydrates | ~80 g (est.) |
| Fat | ~18 g (est.) |
| Fibre | ~6 g (est.) |

### 6. Cost to order (1 serving)
- **Price range (1 serving): ₹200–₹260. Average: ~₹230.**

### 7. Healthiness score (out of 10)
- **Home-cooked version: 6/10 (est.)**
`;

const INGREDIENT_FILE = `Based on: FitPlate_Dishes_2026-10-04.md

# FitPlate ingredient price library

## Summary

| Ingredient | Category | Standard unit | Price range (Mumbai) | Average | Per 100 g/ml (range) | Sources checked | Confidence (High/Medium/Low) |
|---|---|---|---|---|---|---|---|
| Onion (kanda/pyaz) | Vegetable | per kg | ₹45–60/kg | ₹55/kg | ₹4.5–6.0 | 3 | Medium |
| Lemon (nimbu) | Fruit (citrus) | per piece (and per kg) | ₹4–6 per lemon (≈₹96/kg) | ₹5 per lemon | ≈₹9.6 | 2 | Low |
| Mutton (goat meat), bone-in curry cut | Meat/seafood | per kg | ₹885–945/kg | ₹915/kg | ₹88.5–94.5 | 2 | Low |

## Onion (kanda / pyaz)

### 1. Basics
- **Category:** Vegetable

### 4. Storage
- Whole: room temperature in a basket for 3–4 weeks.

### 5. Substitutes
- **Shallots (small/sambar onion):** same flavour.
- Spring onion: milder.

### 6. Nutrition per 100 g (est.)
- About 40 kcal, 1.1 g protein, 9.3 g carbs, 0.1 g fat, 1.7 g fibre (USDA FDC).

## Mutton (goat meat), bone-in curry cut

\`\`\`json
{
  "schema": "fitplate.ingredient.v1",
  "id": "mutton_curry_cut",
  "name": "Mutton (goat meat), bone-in curry cut",
  "nutrition": {
    "basis": "per_100g",
    "energy_kcal": 109,
    "protein_g": 20.6,
    "carbohydrate_g": null,
    "iron_mg": 2.8,
    "source": "USDA FDC",
    "source_ref": "FDC 175303",
    "confidence": "Medium"
  }
}
\`\`\`
`;

describe('markdown helpers', () => {
  it('reads durations and timers', () => {
    expect(minutes('about 1 hr 40 min (incl. marination)')).toBe(100);
    expect(minutes('8–10 min')).toBe(8);
    expect(minutes('no time here')).toBeNull();
    expect(seconds('20–30 sec (no longer)')).toBe(20);
    expect(seconds('1.5–2 min')).toBe(90);
  });

  it('splits Indian names out of the English name wherever they sit', () => {
    expect(splitName('Peanuts (moongphali), raw')).toEqual({ english: 'Peanuts, raw', aliases: ['moongphali'] });
    expect(splitName('Onion (kanda/pyaz)')).toEqual({ english: 'Onion', aliases: ['kanda', 'pyaz'] });
  });

  it('parses rupee ranges with commas and an optional second ₹', () => {
    expect(rupeeRange('₹1,030–1,180/kg')).toEqual({ min: 1030, max: 1180 });
    expect(rupeeRange('₹280–₹380')).toEqual({ min: 280, max: 380 });
    expect(rupeeRange('₹380–₹280')).toBeNull();
  });

  it('drops header and divider rows from tables', () => {
    expect(tableRows('| A | B |\n|---|---|\n| 1 | 2 |')).toEqual([['1', '2']]);
  });
});

describe('dish importer', () => {
  const [poha, biryani] = parseDishFile(DISH_FILE, 'FitPlate_Dishes_2026-10-04.md');

  it('reads header, quick facts, steps and the three scores', () => {
    expect(poha.id).toBe('001-poha');
    expect(poha.date).toBe('2026-10-04');
    expect(poha.dietType).toBe('veg');
    expect(poha.mealType).toEqual(['breakfast']);
    expect([poha.prepMin, poha.cookMin, poha.totalMin]).toEqual([10, 8, 20]);
    expect(poha.difficulty).toBe('Beginner');
    expect(poha.steps).toHaveLength(2);
    expect(poha.steps[0]).toMatchObject({ n: 1, title: 'Rinse the poha', timerSec: 20, tip: 'Do not soak it.', visualCue: 'Every flake looks wet.' });
    expect(poha.healthiness).toEqual({ score: 7, restaurantScore: 5.5, reasons: ['little oil, no deep frying.'] });
    expect(poha.researchRating?.score).toBe(4.5);
    expect(poha.equipment).toEqual(['Kadai or wide frying pan with a lid', 'Colander']);
    expect(poha.sources).toEqual(['Veg Recipes of India, Poha: https://www.vegrecipesofindia.com/kanda-poha-or-onion-poha/']);
    expect(poha.leftoverRemix).toBe('Poha cutlets. Mash and fry.');
    expect(biryani.prepMin).toBe(20);
    expect(biryani.cookMin).toBe(70);
  });

  it('takes the average of the range, not of the full spread', () => {
    expect(poha.orderPrice).toMatchObject({ min: 120, max: 150, avg: 130 });
    expect(biryani.orderPrice).toMatchObject({ min: 200, max: 260, avg: 230 });
  });

  it('reads all three nutrition formats', () => {
    expect(poha.nutrition).toEqual({ kcal: 390, proteinG: 7.9, carbsG: 57.6, fatG: 15.2, fibreG: 3.2 });
    expect(biryani.nutrition).toEqual({ kcal: 540, proteinG: 12, carbsG: 80, fatG: 18, fibreG: 6 });
    expect(parseNutrition('- Calories: about 660 kcal (est.)\n- Protein: about 38 g (est.)\n- Carbs: about 74 g\n- Fat: about 23 g\n- Fibre: about 5 g')).toEqual({
      kcal: 660,
      proteinG: 38,
      carbsG: 74,
      fatG: 23,
      fibreG: 5,
    });
  });

  it('has no as-ordered block or fasting data unless the file has one', () => {
    expect(poha.asOrdered).toBeNull();
    expect(poha.fasting?.ramadan).toEqual({ status: 'yes', reason: 'light and filling.' });
  });

  it('FIX 1: tags allergens and drops a gluten-free claim the recipe contradicts (dish 26 case)', () => {
    expect(poha.allergens).toEqual(['peanut', 'gluten']);
    expect(poha.dietClaims).toEqual(['vegan']);
    expect(poha.needsReview).toContain('dropped "glutenFree" claim: recipe has gluten');
    expect(poha.notes).toContain('hing: compounded hing usually contains wheat flour');
  });

  it('FIX 2: nulls a Jain line that keeps ginger and a Navratri "yes" with rice and garlic (dish 39 case)', () => {
    expect(biryani.fasting?.jain.status).toBeNull();
    expect(biryani.fasting?.jain.reason).toContain('skip onion');
    expect(biryani.fasting?.navratri.status).toBeNull();
    expect(biryani.needsReview.join(' | ')).toMatch(/Jain "with-changes" but the recipe keeps fresh ginger/);
    expect(biryani.needsReview.join(' | ')).toMatch(/Navratri "yes" but the recipe has grain, garlic/);
    expect(biryani.fasting?.ekadashi.status).toBe('no');
    // Poha's Jain line skips the onion it uses, so it stands.
    expect(poha.fasting?.jain.status).toBe('with-changes');
  });
});

describe('allergen map', () => {
  it.each<[string, AllergenId[]]>([
    ['Peanuts (moongphali), raw', ['peanut']],
    ['Cashew nuts (kaju)', ['treeNut']],
    ['Ghee', ['milk']],
    ['Coconut milk', []],
    ['Egg, whole', ['egg']],
    ['Eggplant (baingan)', []],
    ['Prawns (kolambi)', ['shellfish']],
    ['Surmai (seer fish)', ['fish']],
    ['Asafoetida (hing, compounded)', ['gluten']],
    ['Gluten-free hing', []],
    ['Rolled oats', ['gluten']],
    ['Semolina (rava/sooji)', ['gluten']],
    ['Idli rava', []],
    ['Soy sauce', ['gluten', 'soy']],
    ['Sesame oil (gingelly)', ['sesame']],
    ['Mustard seeds (rai)', ['mustard']],
    ['Lentils (masoor)', []],
    ['Curd (dahi)', ['milk']],
  ])('%s → %j', (name, expected) => {
    expect(allergensOf({ name })).toEqual(expected);
  });

  it('also reads the canonical id', () => {
    expect(allergensOf({ ingredientId: 'peanuts-raw', name: 'Shengdana' })).toEqual(['peanut']);
  });

  it('unions a dish and keeps a fixed order', () => {
    expect(dishAllergens([{ name: 'Mustard seeds' }, { name: 'Paneer' }, { name: 'Peanuts' }])).toEqual(['peanut', 'milk', 'mustard']);
  });

  it('ignores conditional and negated claims', () => {
    expect(findClaims(['Veg (vegan if made with peanut oil instead of ghee)'])).toEqual([]);
    expect(findClaims(['Veg (contains dairy; not vegan)'])).toEqual([]);
    expect(findClaims(['Groundnut oil makes the dish vegan.'])).toEqual([]);
    expect(findClaims(['Veg (naturally vegan and gluten-free)'])).toEqual(['vegan', 'glutenFree']);
  });

  it('drops vegan for milk and for non-veg dishes', () => {
    expect(checkClaims(['vegan', 'dairyFree'], ['milk'], 'veg').kept).toEqual([]);
    expect(checkClaims(['vegan'], [], 'non-veg').dropped).toEqual([{ claim: 'vegan', because: ['non-veg'] }]);
    expect(checkClaims(['glutenFree'], ['milk'], 'veg').kept).toEqual(['glutenFree']);
  });
});

describe('fasting', () => {
  it('returns null when the block is missing', () => {
    expect(parseFasting('- Difficulty: Beginner')).toBeNull();
  });

  it('accepts dry ginger and a skip that names every excluded ingredient', () => {
    const f = parseFasting('**Fasting suitability**\n- Jain: With changes — skip the onion and fresh ginger (root vegetables) and use dry ginger powder (sonth)');
    const check = validateFasting(f, ['Onion', 'Ginger, fresh', 'Dry ginger powder (sonth)']);
    expect(check.issues).toEqual([]);
    expect(check.fasting?.jain.status).toBe('with-changes');
  });

  it('flags a Navratri "with changes" line that never says to skip the rice', () => {
    const f = parseFasting('**Fasting suitability**\n- Navratri / vrat: With changes — use sendha namak.');
    const check = validateFasting(f, ['Basmati rice', 'Tomato']);
    expect(check.fasting?.navratri.status).toBeNull();
  });

  it('lets fasting flours through', () => {
    const f = parseFasting('**Fasting suitability**\n- Navratri / vrat: Yes — standard upvas food.');
    expect(validateFasting(f, ['Sabudana (sago pearls)', 'Samak rice (vrat ke chawal)', 'Peanuts']).issues).toEqual([]);
  });
});

describe('ingredient importer', () => {
  const { items, errors } = parseIngredientFile(INGREDIENT_FILE, 'FitPlate_Ingredients_2026-10-08.md');
  const onion = items.find((i) => i.id === 'onion')!;
  const lemon = items.find((i) => i.id === 'lemon')!;
  const mutton = items.find((i) => i.id === 'mutton-bone-in-curry-cut')!;

  it('reads the summary row and the detail section', () => {
    expect(errors).toEqual([]);
    expect(onion).toMatchObject({ name: 'Onion', aliases: ['kanda', 'pyaz'], standardUnit: 'kg', price: { min: 45, max: 60, avg: 55 }, confidence: 'Medium', sourcesChecked: 3 });
    expect(onion.storage).toBe('Whole: room temperature in a basket for 3–4 weeks.');
    expect(onion.substitutes).toEqual(['Shallots (small/sambar onion)', 'Spring onion']);
    expect(onion.macrosPer100).toEqual({ kcal: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1, fibreG: 1.7 });
    expect(onion.nutritionPer100g).toBeNull();
  });

  it('handles per-piece units', () => {
    expect(lemon.standardUnit).toBe('piece');
    expect(lemon.price).toMatchObject({ min: 4, max: 6, avg: 5 });
  });

  it('reads the JSON nutrient profile; missing values stay null, never estimated', () => {
    expect(normaliseId('mutton_curry_cut')).toBe('mutton-curry-cut');
    expect(mutton.nutritionPer100g?.energyKcal).toEqual({ value: 109, source: 'USDA FDC: FDC 175303', confidence: 'Medium' });
    expect(mutton.nutritionPer100g?.carbsG).toEqual({ value: null, source: null, confidence: null });
    expect(mutton.nutritionPer100g?.basis).toBe('100g');
  });

  it('builds one ingredient from two versions through the price engine', () => {
    const later = { ...onion, date: '2026-10-24', file: 'FitPlate_Ingredients_2026-10-24.md', price: { ...onion.price!, min: 60, max: 75, avg: 68, statedAvg: 68 }, substitutes: ['Leeks'] };
    const built = buildIngredient([later, onion], '2026-10-25');
    expect(built.versions.map((v) => v.date)).toEqual(['2026-10-08', '2026-10-24']);
    expect(built.price?.priceHistory).toHaveLength(2);
    expect(built.price?.lastObserved).toBe('2026-10-24');
    expect(built.price?.method).not.toBe('single');
    expect(built.seasonal).toBe(true);
    expect(built.substitutes).toEqual(['Shallots (small/sambar onion)', 'Spring onion', 'Leeks']);
    expect(built.per100Estimate?.avg).toBeCloseTo((built.price?.currentEstimate?.avg ?? 0) / 10, 5);
  });
});

describe('building dishes', () => {
  const [poha] = parseDishFile(DISH_FILE, 'FitPlate_Dishes_2026-10-04.md');
  const { items } = parseIngredientFile(INGREDIENT_FILE, 'FitPlate_Ingredients_2026-10-08.md');
  const index = buildIngredientIndex(items.map((i) => buildIngredient([i], '2026-10-11')));

  it('links dish lines to canonical ingredient ids, leaving unknowns null', () => {
    expect(linkIngredient('Onion (kanda/pyaz)', index)).toBe('onion');
    expect(linkIngredient('Lemon (nimbu) juice', index)).toBe('lemon');
    expect(linkIngredient('Pyaz', index)).toBe('onion');
    expect(linkIngredient('Saffron', index)).toBeNull();
  });

  it('produces a valid Dish with an order price estimate', () => {
    const dish = buildDish([poha], '2026-10-11', index);
    expect(validateDish(dish)).toEqual([]);
    expect(dish.servings).toBe(1);
    expect(dish.orderPrice?.currentEstimate).toEqual({ min: 120, max: 150, avg: 130 });
    expect(dish.ingredients.find((i) => i.name.startsWith('Onion'))?.ingredientId).toBe('onion');
    expect(dish.microNutrientsEstimate).toBeNull();
  });
});

describe('generated index', () => {
  it('imports each item statically', () => {
    const out = renderIndex('Dish', ['001-poha']);
    expect(out).toContain("import item_001_poha from './001-poha.json';");
    expect(out).toContain('item_001_poha as unknown as Dish,');
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
    const finished: FeatureFlag[] = ['newTabShell', 'cloudSync', 'liteMode', 'researchData', 'rememberAllergens'];
    for (const flag of Object.keys(featureFlags) as FeatureFlag[]) {
      expect(isEnabled(flag)).toBe(finished.includes(flag));
    }
  });

  it('reads an overridden flag set', () => {
    const flags = { ...featureFlags, voiceSteps: true, cloudSync: false };
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


## 9. DEPENDENCIES

None.

## 10. HOW TO APPLY (for Sudarsan)

Run these from inside the `Fitplate` folder on your Mac.

**Option A (simplest): the code is already on the branch**
1. `git add -A && git commit -m "Before Day 06"` (skip this if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand.** Days 01 to 05 must be applied first.
1. `git add -A && git commit -m "Before Day 06"`
2. Create every NEW file from section 8 at its path and replace every CHANGED file with the version shown. For the data files, run the sync command above once instead of copying them.
3. `npm test`, then `npx expo start -c`.

## 11. HOW TO TEST

**Quickest check: the live site** https://fitplateapp.netlify.app (it deploys this commit automatically).

**Manual checklist (web and iPhone)**
- [ ] **Cook tab lists 30 dishes** with picture slots, chips and both scores. Web ☐ iPhone ☐
- [ ] **Search:** type "brhiyani" → Chicken Biryani; "jeera" → Jeera Rice and dishes using cumin; "xyzzy" → "No dishes match" with a clear button. Web ☐ iPhone ☐
- [ ] **Filters:** tap Veg and High protein, then Filters → Leave out Peanut → "Show N dishes". The count drops; the chips show "Veg", "High protein", "No peanut"; Clear all brings back 30. Web ☐ iPhone ☐
- [ ] **Remembered allergy:** leave out Milk, close and reopen the app: "No milk" is still set. Web ☐ iPhone ☐
- [ ] **Sort:** Best match → Quickest puts the fastest dish first. Web ☐ iPhone ☐
- [ ] **Dish page:** tap Poha: nutrition, both scores, "About ₹130 (usually ₹120–150)", ingredients. Tap Chicken Biryani: "Order price not confirmed yet". Web ☐ iPhone ☐
- [ ] **Everything else as before** (Today, Track, Move, Profile, logging, sign-in). Web ☐ iPhone ☐

**Automated (run in this session on 2026-10-15; real results)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems) |
| Unit tests | `npm test` | ✅ 22 suites, 451 tests passed (89 new) |
| Web bundle | `npx expo export -p web` | ✅ exported (11 MB `dist`) |
| Web click-through | Playwright (Chromium, 390×844) on the exported site | ✅ see below; no page or console errors |
| Data sync | `node scripts/research/run.js --today 2026-10-15 --build Day06` | ✅ 10 dishes, 30 ingredients, 8 fitness items; 0 invalid, 0 parse errors |

Click-through results: fresh guest → onboarding → Cook showed "30 dishes"; "brhiyani" → 1 dish (Chicken Biryani); Veg + High protein → 7; Filters → leave out Peanut → 4; Clear all → 30; "xyzzy" → empty state, then clear; sort Quickest; Poha opened `/recipe/001-poha`; leaving out Milk survived a reload ("No milk" chip, 12 dishes); Today, Track, Move and Profile opened. Screenshots of the list, filter sheet, active filters, empty state, sort sheet and dish page were checked at 390 px; nothing clipped (the last quick chip scrolls sideways by design).

New tests cover: the search engine (normalising, edit distance with swaps, Indian sound-alike folding, every query word must match, field weights, filters any/exclude, chip counts, sort with missing values last); the dish library on the real bundled data (search by name, misspelling, Indian ingredient name; every chip matches a dish; veg + breakfast − peanut; time chips; sorts; card chips; price headline rules); the remembered allergen filter; review fixes 1–3; the alias stoplist.

## 12. KNOWN ISSUES, LIMITATIONS AND TODOs

- **Only 30 of 60 researched dishes are in the app;** the sync caps at 10 a run, so about 3 more runs clear the dish backlog.
- **No Vegan/Jain "option" tags or families appear yet** in the bundled 30 dishes: those blocks start at dish 41 (the 10-12 files).
- **Pictures are placeholders** ("Photo soon"): no free image generator is available in this environment. See Research gaps.
- **"Split pigeon pea" no longer links to toor dal** because "split" is now a stop word; the dish lines that used it still link by "toor dal".
- **Filter counts on "Leave out" chips** show how many dishes remain if you tick that chip, which can read oddly next to diet counts; to be revisited with user feedback.
- **Dish 49** has a single listing and no range, so it will show no order price.

## 13. USER ACTIONS ADDED TODAY

None.

Still open: USER ACTION 4 (vendor product links and prices in ingredient research). From the review, for Sudarsan: the usage-limit choice (wait, pay for extra usage, or move the build to once a day), a real "Delete my data" test with a spare Google account, and the research prompt edits listed in the review's section 4.

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
| 7 | Dish detail screen | ⬜ |
| 8 | Cost-to-make engine | ⬜ |
| 9 | Servings scaler and shopping list (checklist with include box and one variant per ingredient, per SPEC-ADDENDA §7) | ⬜ |
| 10 | Cooking level and kitchen personalisation | ⬜ |
| 11 | Guided cook mode (core) | ⬜ |
| 12 | Cook mode extras | ⬜ |
| 13 | Meal logging and a real Today screen | ⬜ |
| 14 | After the meal and savings dashboard | ⬜ |
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
| `src/config/featureFlags.ts` | Day 6 |
| `src/services/activity.ts` | Day 2 |
| `src/__tests__/tabs.test.ts` | Day 2 |
| `src/__tests__/activity.test.ts` | Day 03b |
| `src/__tests__/config.test.ts` | Day 6 |
| `jest.config.js` | Day 2 |
| `firestore.rules` | Day 2 |
| `docs/DATA_MODEL.md` | Day 5 |
| `public/index.html`, `public/manifest.json`, `public/*.png`, `assets/icon.png`, `assets/favicon.png` (app icon) | merged from demo-app on 2026-10-10 (5c97126), not by the build |
| `.env.example` (Google photo and email) | merged from demo-app on 2026-10-09 (c8a2449), not by the build |
| `src/lib/store.tsx` | Day 4 |
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
| `src/app/recipe/[id].tsx` | Day 6 |
| `src/services/data/priceChecks.ts` | Day 6 |
| `src/__tests__/services/search.test.ts` | Day 6 |
| `src/__tests__/services/dishLibrary.test.ts` | Day 6 |
| `src/__tests__/services/rememberedFilters.test.ts` | Day 6 |
| `src/__tests__/data/priceChecks.test.ts` | Day 6 |

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

### Dependencies added so far

| Package | Version | Type | Day |
|---|---|---|---|
| jest | ^29.7.0 | dev | 1 |
| jest-expo | ~57.0.5 | dev | 1 |
| @jest/globals | ^29.7.0 | dev | 1 |

### RESEARCH LEDGER

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

- **Machine ledger:** `src/data/research/ledger.json` lists every ingested version (item id, research date, file, build day). Nutrient and fitness keys are `kind:id`. The runner skips any version already there; **each run of the script ingests one capped batch, so run it once per build.**
- **Backlog per stream (after Day 06):**
  - Dishes: 6 files / 30 items (31–60)
  - Ingredients: 37 entries (10-08 rows 8+ onwards)
  - Nutrients: 0 visible (the 14 and 15 Oct files are outside the shared folder)
  - Fitness: 0 (fitness research is 3 days behind; 12–14 Oct files never written)
- **In the app:** 30 dishes, 90 ingredients, 6 nutrients, 12 exercises, 4 fitness guides.
- **Catch-up plan:** about 3 more runs clear the dish backlog at 10 a run against 5 new a day; ingredients in about 2.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema:** all eight user collections are at version 1: `profile` (on `users/{uid}`), `mealLogs`, `waterLogs` (one document per day), `supplementLogs`, `workoutLogs`, `favourites`, `mealPlans` and `savings`. Every document has `id`, `createdAt`, `updatedAt`, `schemaVersion` and `deleted`. Day 03b added the optional `demoSample` to `Favourite`, `MealPlanDay` and `SavingEntry` (no version bump). Fields are listed in `docs/DATA_MODEL.md`.
- **Live since Day 03b:** guests on the device; signed-in users device first, then Firestore (`cloudSync` ON). The demo blob is migrated once into guest documents and kept as a backup. "Bring your data with you?" runs after sign-in. Sign-out clears the device only once everything reached the cloud.
- **Device keys:** `fitplate.docs.<owner>.<collection>.v1`, `fitplate.outbox.<owner>.v1`, `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`; the old `fitplate.state.v2` is a read-once backup.
- **Free-tier guard:** one pull per collection when the app opens for a signed-in user (no listeners yet); writes are debounced batches; water is one document per day; waiting writes are sent when the app goes to the background.
- **Rules:** owner-only (`firestore.rules`), live in the console since 2026-10-10. No top-level collection added.
- **Delete my data (Day 04, review fix 3):** deletes every document under `users/{uid}` (collections from `SCHEMAS`, batches of ≤500, profile last) and the device copy, then signs out. The Firebase Auth account is removed on Day 34.
- **Research content:** bundled JSON in `src/data/research/` since Day 4 (nutrients, hydration, guidance, conditions, exercises and fitness guides since Day 5); never in Firestore. User documents refer to it by id (`dishId`, `ingredientId`, `nutrientId`, `exerciseId`).
- **Device key (Day 06):** `fitplate.docs.<owner>.dishFilters.v1` holds the remembered allergen exclusions; under the owner prefix, so sign-out, Delete my data and Reset clear it.
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
9. Mustard oil and sesame oil have no ingredient price yet (still open per the 2026-10-15 review).
10. NEW (review 2026-10-15): order prices for 17 of 60 dishes rest on one platform, fewer than 3 listings, a closed outlet or an average outside the range; dish 49 has no range. They show "Order price not confirmed yet" until re-researched.
11. NEW (review 2026-10-15): nutrient files for 14 and 15 Oct (B5, B6, Prediabetes profile) are outside the shared folder; fitness skipped 12–14 Oct.
12. NEW: fitness rep-counter angles above 180° (plank, glute bridge) and MET vs RPE mismatches (treadmill, elliptical, bike) remain in research.
- Resolved on Day 05: "dish research has no allergen line" (PATCH 03 adds "Allergens declared", read today). Standby: "thali component nutrition" (office canteen idea, parked by Sudarsan).

### IDEAS BACKLOG (ranked by impact ÷ effort; S = 1, M = 2, L = 3)

| Rank | Idea | Type | Impact | Effort | Score | Needs | Status |
|---|---|---|---|---|---|---|---|
| — | Allergy filter ("Leave out dishes that contain …", remembered) | IMPROVE | 5 | S | 5.0 | allergens (Day 04) | **built on Day 06** (filters + `rememberAllergens` flag ON) |
| 1 | Fridge rescue | NEW FEATURE | 4 | S | 4.0 | Dish ingredient links (474 of 575 lines) + library (Day 6) | approved by Sudarsan 2026-10-10; ready to build |
| 2 | "Make it Jain" switch on a dish | IMPROVE | 4 | S | 4.0 | Researched variants + dish detail (Day 7) | new Day 05 |
| 3 | Cheaper twin ("Veg version: ₹X less") | IMPROVE | 4 | S | 4.0 | Families + cost to make (Day 8) | new (supervisor review 2026-10-15) |
| 4 | Vitamin source finder | NEW FEATURE | 4 | S | 4.0 | Good-source links + vitamin tracking (Day 18) | new Day 05 |
| 5 | Protein per ₹ (sort + tag) | IMPROVE | 4 | S | 4.0 | Cost to make (Day 8); sort slot already shown as "Coming soon" | new (supervisor review 2026-10-11) |
| 6 | Savings goal jar | NEW FEATURE | 4 | S | 4.0 | `savings` collection; fits Day 14 | new (supervisor review 2026-10-11) |
| 7 | Kettle and one-burner cooking (PG/hostel kitchen preset + filter chip) | IMPROVE | 4 | S | 4.0 | Dish equipment data + kitchen profile (Day 10) | new Day 03b; Day 06 adds the filter chip |
| 8 | Plain-words search ("15 min no onion") | IMPROVE | 3 | S | 3.0 | Tags + filters (Day 6) | new Day 06 |
| 9 | Recently viewed / cook again | IMPROVE | 3 | S | 3.0 | none | new Day 06 |
| 10 | Monsoon swap | IMPROVE | 3 | S | 3.0 | Price engine and cost to make (Day 8) | approved by Sudarsan 2026-10-10; build after Day 8 |
| 11 | Late-night craving helper | NEW FEATURE | 3 | S | 3.0 | Dish library (Day 6) | new Day 03b |
| 12 | Desk-break movement card | NEW FEATURE | 3 | S | 3.0 | Exercise tags + more desk-friendly items | new Day 05 |
| — | Lite mode | IMPROVE | 3 | S | 3.0 | none | **built on Day 03b** (`liteMode` flag ON) |
| 13 | Tomorrow's tiffin (pack dinner for lunch) | NEW FEATURE | 5 | M | 2.5 | Servings (Day 9), cook mode (Day 11), confirmed order prices | new Day 03b; review 2026-10-15 ranks it high |
| 14 | Fasting mode | NEW SEGMENT | 4 | M | 2.0 | Fasting tags (Day 05) | approved by Sudarsan 2026-10-10 |
| 15 | Parents' plate | NEW SEGMENT | 4 | M | 2.0 | Ingredient sodium and sugar data (partial) | approved by Sudarsan 2026-10-10 |
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

**Next up: Day 07: Dish detail screen on `/recipe/[id]` (quick facts, nutrition, partial micronutrient estimate, order price with trend arrow and the price-check notes, equipment with alternatives, storage and leftovers, opt-in "See ways to balance this" instead of automatic burn-off, sources collapsed, "Based on N research updates"; the three scores separate; diet chips and variants in the title area; "Coming soon" for missing data). The data sync continues with dishes 31–40 (first families: Veg Biryani 039), the next 30 ingredients and any new fitness or nutrient files.**

