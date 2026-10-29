# FitPlate Build — Day 05 — 2026-10-15

## 1. HEADER

**Day 05 of 37 | Roadmap item: Research pipeline II (nutrients, hydration, guidance, fitness, cross-links), plus the tag engine and variant families from SPEC-ADDENDA §9 | Phase 0: Foundation and data pipeline | Progress: 14% of the full app (5 ÷ 37)**

**Status: DONE.** Commit `ce7b870` is pushed to `claude/project-thread-wchnlm`, and Netlify deploys it to https://fitplateapp.netlify.app.

- **How this run's day was determined:**
  - The newest build file is `FitPlate_Build_Day04_2026-10-11.md`. Its BUILD STATE marks Day 4 ✅ and says "Next up: Day 05". No build file is dated 12, 13 or 14 October.
  - No build file existed for 2026-10-15, so the run went ahead.
- **Supervisor review:** the only review is still `FitPlate_Review_2026-10-11.md`. Its FIX LIST was done on Day 04 except the nutrient half of fix 2, which Day 04 carried over to this day. It is done now; see section 3a.
- **Inputs from Sudarsan since Day 04 (written in the Supervisor review thread, now in SPEC-ADDENDA §8 and §9):** the profile survey, health-aware targets, reminders as their own feature, opt-in burn-off, image slots and accurate prices (§8); app-wide search, multi-select filters, diet tags on every food item and dish variant families (§9). Day 05 builds the data side of §9 (tags, variants, families). The screens come on their roadmap days (search and filters on Day 6, the survey on Days 16 and 31, reminders on Day 33).
- **On-demand builds (Sudarsan, 2026-10-14):** this thread now also takes on-demand build requests on the same branch, with the same checks before each push. On-demand work does not move the roadmap day counter unless he says so. The Demo thread is retired; the demo code already lives on this branch.
- **Context available:**
  - Code source **(a)**: branch `claude/project-thread-wchnlm` at a593334 (Day 04).
  - Spec: `PROMPT.md` and `SPEC-ADDENDA.md` §1, §2 and §4 to §9.
  - Research files visible at sync time: Dishes 11 (2026-10-04 … 2026-10-14), Ingredients 9 (… 2026-10-12), Nutrients 3 (2026-10-09 … 2026-10-11), Fitness 3 (2026-10-09 … 2026-10-11). `FitPlate_Fitness_2026-10-15.md` arrived after the sync and goes into the next run.

## 2. SUMMARY

1. **Vitamins and workouts now come from research too.** Two new importers read the daily nutrition and fitness research files. Tonight they brought in all 6 vitamin topics researched so far (A, D, E, K, C and thiamine) and the first 8 fitness items (bodyweight squat, push-up, Surya Namaskar, a desk neck and shoulder release, and 4 gym guides). Each vitamin carries its daily targets, upper limit, Indian food sources and ready-made "log a tablet" presets.
2. **Tablet doses are checked against safe limits (review fix 2).** Every "log a tablet" preset is converted to the vitamin's own unit. Doses above the safe upper limit, like the 60,000 IU vitamin D sachet, are marked "prescription dose", so the app can say "take this only as your doctor prescribed". Benfotiamine counts as the thiamine it actually gives (150 mg → about 86 mg). Default targets stay only where they match the Indian ICMR-NIN table.
3. **Every dish now has tags you can filter by (your search input).** Veg, Egg or Non-veg; Vegan, Jain, Gluten-free and Dairy-free only when the recipe checks out; "Jain option" or "Vegan option" when research found a variant; "Contains milk" and other allergens; meal, cuisine, "Under 30 min" and difficulty; High protein, High fibre and Low calorie by the dish research's own thresholds. Dish variants (a Jain or vegan version) and variant families (Chicken and Veg Biryani) are read from research and linked.
4. **Ingredients, dishes and vitamins are now linked to each other.** Indian names learned from the recipes (dhaniya → coriander leaves) link more dish lines to priced ingredients: 308 of 406 lines now, up from 97 of 203. Dishes get a first micronutrient estimate from their ingredients, and vitamins list the bundled dishes that are good sources of them.
5. **Data sync:** 10 more dishes (Aloo Paratha to Vada Pav, 20 in the app), 30 more ingredients (60 in the app). The app looks the same until Day 6 switches the Cook tab to this data.

## 3. DATA SYNC REPORT

- **New research files since Day 04:** Dishes 10-12, 10-13, 10-14 (dishes 41–55, the first with PATCH 03 Diet tags and PATCH 04 tags and variants); Ingredients 10-12 (2 entries, the first in the v2 JSON profile with 20 more nutrient fields). No new nutrient file after 10-11. The fitness file for 10-15 arrived after the sync.
- **Ingested this run** (each version identified by item id + research date; ledger in `src/data/research/ledger.json`, nutrient and fitness keys written as `kind:id`, e.g. `nutrient:vitamin-a`):

  | Stream | Files | Items ingested | Backlog before → after |
  |---|---|---|---|
  | Dishes | 10-06, 10-07 | 10: 11 Aloo Paratha, 12 Rajma Chawal, 13 Pav Bhaji, 14 Egg Bhurji, 15 Veg Hakka Noodles, 16 Besan Chilla, 17 Palak Paneer, 18 Chicken Tikka Masala, 19 Jeera Rice, 20 Vada Pav | 45 → 35 |
  | Ingredients | 10-04 (rows 31–47), 10-05 (first 13 of 21) | 30: coriander-powder, garam-masala, biryani-masala, asafoetida, salt, sugar, mustard-seeds, cumin-seeds, fenugreek-seeds, dried-fenugreek-leaves, bay-leaf, green-cardamom, cloves, cinnamon-cassia, shahi-jeera, dried-red-chilli-whole, saffron, carrot, cabbage, green-capsicum, french-beans, spring-onion, shallots, green-peas-frozen, drumstick, pumpkin-red-yellow, chicken-thigh-boneless-skinless, chickpeas-dried, semolina-fine-bombay-rava, tamarind-seedless-block | 85 → 55 |
  | Nutrients | 10-09, 10-10, 10-11 | 6: Vitamin A, Vitamin D, Vitamin E, Vitamin K, Vitamin C, Thiamine (B1) | 6 → 0 |
  | Fitness | 10-09, 10-10 | 8: bodyweight squat, desk neck and shoulder release, push-up, Surya Namaskar; guides: gym basics, warm-up and cool-down, sets/reps/rest and overload, starting weight with RPE and RIR | 12 → 4 |

- **Validation:** nothing was rejected; no parse errors. Fitness validator findings go to "needs review" and don't block an item that has an id and a name.
- **Dish tags (tag engine, SPEC-ADDENDA §9):** every dish has tags. Examples: Rajma Chawal = Veg, Contains peanut, Contains milk, Contains mustard, Lunch, Dinner, Punjabi, Under 60 min, Beginner, High protein, High fibre. Egg Bhurji = Egg, Contains peanut, milk, egg and gluten, Breakfast, Maharashtrian, Under 30 min, Beginner, High protein. Dishes 1–20 predate PATCH 03 and 04, so none has a Vegan, Jain or "option" tag yet; those arrive with dishes 41+ in the next runs.
- **Variants and families:** dishes 1–20 have no variants block. No family has two bundled dishes yet (Chicken Biryani 002 waits for Veg Biryani 039).
- **Cross-links:**
  - Dish ingredient lines: **308 of 406 linked**, all 308 priced (Day 04: 97 of 203). 69 lines are still unmatched. Most are spices or flours not researched yet (whole wheat flour, carom seeds, sambar powder, soy sauce, cauliflower, kidney beans) or oil lines worded as choices ("Oil (sunflower / groundnut)"). Water and one-word sub-headings ("For cooking") are not counted.
  - **Aliases learned from the recipes:** dhaniya → coriander-leaves, split-pigeon-pea → toor-dal, small-onions → shallots, makhan → butter-salted. None ambiguous. Junk words in brackets ("optional", "e.g. Amul") are filtered out.
  - **Micronutrient estimate per dish:** filled from ingredient profiles, with gaps filled by the vitamin research's food-source tables (14 cells came from there). Coverage is shown per dish; most dishes are partial because the 10-04 to 10-07 ingredients have no full profile yet (research gap 2).
  - **Calorie check (ingredients vs the dish's own total):** no dish over 25% apart where ingredient coverage is 80% or more.
  - **"Used in" check (ingredient file vs dish table quantity):** no quantity more than 15% apart.
  - **Good-source dishes:** each vitamin's "good source dishes" are linked to bundled dish ids both ways. Example: thiamine → Aloo Paratha, Dal Tadka, Chole, Rajma Chawal, Besan Chilla, Idli with Sambar; Misal Pav (29) and Dal Makhani (27) link once they are ingested.
  - 51 food names in the vitamin food-source tables (goat liver, amla, amaranth leaves) have no ingredient research yet.
  - **MET values** for the 4 exercises: squat 3.8, push-up 3.8, Surya Namaskar 3.5, desk release 2.3. Burn-off minutes use them only when the person opts in (SPEC-ADDENDA §8).
- **Needs review (ingested items):**
  - **Default targets for age 60+** set to null for all 6 vitamins: the research itself says ICMR-NIN has no separate 60+ value.
  - **Vitamin E** pregnant and lactating defaults (US values) and **Vitamin K** pregnant and lactating defaults set to null for the same reason.
  - **Vitamin E presets** "400 mg tocopheryl acetate (form not stated)" and "Custom amount in IU" are ambiguous: the natural and synthetic forms convert differently. The app keeps the research's range and asks for the label form.
  - **Desk neck and shoulder release:** two rep-counter phases use a ratio and a position, not an angle. **Surya Namaskar:** one phase is a position check, and one form check says "> 195°", which a three-point angle can't reach. Both stay as text until Day 25's rep-counter engine decides how to read them.
- **Backlog dishes already flagged for when they are ingested:** 026 Moong Dal Chilla ("gluten-free" dropped: hing), 039 Veg Biryani (Jain keeps fresh ginger), 042 Malai Kofta (Jain and Ekadashi "with changes" but nothing to skip is named), 043 Chicken Fried Rice ("gluten-free" dropped: soy sauce), 047 Veg Manchurian (Jain keeps onion, garlic, carrot, ginger).

### 3a. Supervisor review FIX LIST (carried over from FitPlate_Review_2026-10-11.md)

| # | Fix | Done? | Notes |
|---|---|---|---|
| 2 | Fasting validator, nutrient part: benfotiamine conversion | ✅ done | Presets convert through the research's own conversion table. Benfotiamine 150 mg → 85.5 mg thiamine (factor 0.57); B-complex thiamine mononitrate 10 mg → 8.1 mg (0.81). |
| 2 | Prescription doses above the UL | ✅ done | `prescriptionDose: true` when the converted dose is above the upper limit: Vitamin A 25,000 IU (7,500 µg vs UL 3,000), Vitamin D3 60,000 IU (1,500 µg vs UL 100), Vitamin E 400 mg (above UL 300). Vitamin C 1,000 mg stays under its UL of 2,000. Thiamine and K have no formal UL, so nothing is flagged. |
| 2 | ICMR default target | ✅ done | `app_default_target` is kept only where it equals the ICMR-NIN row; otherwise null and needs review (the 60+, Vitamin E and Vitamin K cases above). |

Fixes 1 and 3 and the dish half of fix 2 were done on Day 04. The FIX LIST is now complete.

## 4. DESIGN NOTES

No screen changed today; the app looks the same as Day 04 (checked at 390×844). The decisions below shape Day 6 onwards.

- **A tag appears only when checked data supports it.** "No gluten detected" is never "Gluten-free". A research "Vegan: Yes" becomes a tag only if the Day 04 allergen check keeps the claim. "No onion / no garlic: Yes" and "Pescatarian: Yes" are checked against the recipe's ingredient names; a contradiction hides the tag and adds a needs-review note.
- **"Jain" and "Jain option" are different tags.** "Jain" needs a validated fasting line of Yes. "Jain option" means the dish can be made Jain with changes, or research wrote a Jain variant. The same pattern gives "Vegan option", "Gluten-free option", "Dairy-free option" and "Veg option".
- **Tag order on cards:** diet first, then allergens, meal, cuisine, time, difficulty, nutrition. Day 6 shows the first few as chips and the rest in filters.
- **Families:** dishes whose names differ only by a version word (chicken, veg, jain, vegan, paneer and similar) share a family; "Masala Dosa" and "Rava Dosa" don't, because rava and masala change the dish. Research links ("FitPlate dish 10") also join a family. A family needs two dishes in the app.
- **Vitamin presets keep the label words.** The person picks "Vitamin D3 60,000 IU weekly sachet" and FitPlate counts 1,500 µg. A prescription-dose preset will always show "Take this only as your doctor prescribed" (Day 18).
- **Null means not found.** Missing 60+ targets stay empty; Day 16 falls back to the adult value with a note, never a guess.

## 5. INNOVATION

New ideas this run:

1. **"Make it Jain" switch on a dish** · IMPROVE (dish detail, Day 7) · Impact 4 · Effort S
   - **Problem:** "My mother is Jain; I find a recipe I like and then have to work out myself what to swap." Jain families and anyone cooking for a Jain guest.
   - **Solution:** when a dish has a researched Jain variant, the detail screen shows a "Jain version" switch that swaps the ingredient list and steps to the variant and keeps the shopping list in step.
   - **Data:** `variants` (parsed today); the variant's own recipe stays in the research file and is read on Day 7. No new research stream.
   - **Risk:** a wrong swap breaks someone's religious practice. Only researched variants, never generated ones.
2. **Vitamin source finder** · NEW FEATURE (Track tab, after Day 18) · Impact 4 · Effort S
   - **Problem:** "The app says I'm low on vitamin C. What do I actually eat for it?" The busy corporate who logs but doesn't plan.
   - **Solution:** tap a vitamin to see "Good sources you can cook", the bundled dishes linked today, cheapest first, plus the top foods from the research.
   - **Data:** `goodSourceDishes` linked both ways (built today) and ingredient prices. Exists.
   - **Risk:** none beyond the usual "not medical advice". Merges with backlog idea "Vitamin gap → dish nudge" as its manual half.
3. **Desk-break movement card** · NEW FEATURE (Today, workdays, opt-in) · Impact 3 · Effort S
   - **Problem:** "I sit for 9 hours; by 4 pm my neck hurts and I never get to the gym." Office workers.
   - **Solution:** one card on workday afternoons with the researched desk neck and shoulder release (or another quiet, no-equipment item), with its hold timer. Never pushes; one tap to hide for the day.
   - **Data:** exercise tags "Quiet", "No equipment", "Flat-friendly" (built today). Needs more desk-friendly items from fitness research (in progress).
   - **Risk:** neck pain may need a doctor; the card carries the research's stop signs.
4. **Filter memory per family member** · IMPROVE (search and filters, Day 6+) · Impact 3 · Effort M
   - **Problem:** "I cook for my vegan sister on Sundays and for myself the rest of the week; resetting filters every time is annoying."
   - **Solution:** save filter sets as named chips ("Sister: vegan, no peanut"), stored with the profile.
   - **Data:** tags (built today). A small field on the profile document (no new collection).
   - **Risk:** privacy of other people's diets; stays in the signed-in user's own space.

**Health-condition research (SPEC-ADDENDA §8, every run):** the nutrition research routine now writes one health-condition profile a day (from 2026-10-12), but no nutrient file after 2026-10-11 is visible yet, so no condition profile has been ingested. The importer for them (`buildCondition`, with limits on macros, micros, water, cholesterol and salt) is built and tested. Conditions still to see in research, in the order the survey needs them: type 2 diabetes, high blood pressure, high cholesterol, PCOS, hypothyroidism, fatty liver, chronic kidney disease, pregnancy, anaemia, gout. Listed under Research gaps. No values are written into the app from memory.

**Reminders (innovation, every run):** a "cook prep" reminder built from the dish data: soak rajma the night before (Rajma Chawal's step timing), marinate chicken tikka ahead, defrost frozen peas. It needs the step "advance prep" times, which the dish steps already carry as timers. For Day 33.

**Survey-driven curation (innovation, every run):** the Nutrition section's allergy answers map one-to-one to today's "Contains …" tags, and the Gym section's equipment and place answers map to exercise tags ("No equipment", "Home", "Gym", "Quiet"). Day 31 can therefore curate both lists by tag matching, with no extra data.

**Built today:** none. The roadmap day ran long (four importers, the tag engine and cross-links).

## 6. DATABASE (SPEC-ADDENDA §5)

- **What changed today:** nothing in Firestore. All new data is bundled research content: `nutrients/`, `hydration/`, `guidance/`, `conditions/`, `exercises/`, `fitness-guides/`, plus `ingredients/aliases.json` and `links.json`.
- **Content model changes:** `Dish` gained `tags`, `dietTags`, `description`, `familyId` and `variants`; `Ingredient` gained `usedIn`; `NutrientPer100` gained 20 fields from the v2 ingredient profile (cholesterol, fat types, B vitamins, water and others), null for v1 profiles. New types in `src/models/nutrient.ts` and `src/models/exercise.ts`.
- **User documents** may refer to `nutrientId` and `exerciseId` from these folders (supplement and workout logs on Days 18 and 24). No `schemaVersion` bump; no rules change.
- **Free-tier guard:** unchanged; bundled content costs no reads.
- **`docs/DATA_MODEL.md`:** research layout paragraph and a 2026-10-15 changelog line.
- **USER ACTION:** none.

## 7. DATA FILES

Generated by `scripts/research/run.js`; rebuild them any time from the research files with `node scripts/research/run.js --today 2026-10-15 --build Day05`. Files added or changed today (CHANGED dish and ingredient files gained `tags`, `usedIn` or the v2 nutrient fields):

- `src/data/research/conditions/index.ts` (NEW)
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
- `src/data/research/dishes/011-aloo-paratha.json` (NEW)
- `src/data/research/dishes/012-rajma-chawal.json` (NEW)
- `src/data/research/dishes/013-pav-bhaji.json` (NEW)
- `src/data/research/dishes/014-egg-bhurji.json` (NEW)
- `src/data/research/dishes/015-veg-hakka-noodles.json` (NEW)
- `src/data/research/dishes/016-besan-chilla.json` (NEW)
- `src/data/research/dishes/017-palak-paneer.json` (NEW)
- `src/data/research/dishes/018-chicken-tikka-masala.json` (NEW)
- `src/data/research/dishes/019-jeera-rice.json` (NEW)
- `src/data/research/dishes/020-vada-pav.json` (NEW)
- `src/data/research/dishes/index.ts` (CHANGED)
- `src/data/research/exercises/bodyweight-squat.json` (NEW)
- `src/data/research/exercises/desk-neck-shoulder-release.json` (NEW)
- `src/data/research/exercises/index.ts` (NEW)
- `src/data/research/exercises/push-up.json` (NEW)
- `src/data/research/exercises/surya-namaskar.json` (NEW)
- `src/data/research/fitness-guides/gym-basics.json` (NEW)
- `src/data/research/fitness-guides/index.ts` (NEW)
- `src/data/research/fitness-guides/sets-reps-rest-overload.json` (NEW)
- `src/data/research/fitness-guides/starting-weight-rpe-rir.json` (NEW)
- `src/data/research/fitness-guides/warm-up-cool-down.json` (NEW)
- `src/data/research/guidance/index.ts` (NEW)
- `src/data/research/hydration/index.ts` (NEW)
- `src/data/research/index.ts` (CHANGED)
- `src/data/research/ingredients/aliases.json` (NEW)
- `src/data/research/ingredients/asafoetida.json` (NEW)
- `src/data/research/ingredients/basmati-rice-everyday-grade.json` (CHANGED)
- `src/data/research/ingredients/bay-leaf.json` (NEW)
- `src/data/research/ingredients/biryani-masala.json` (NEW)
- `src/data/research/ingredients/butter-salted.json` (CHANGED)
- `src/data/research/ingredients/cabbage.json` (NEW)
- `src/data/research/ingredients/carrot.json` (NEW)
- `src/data/research/ingredients/cashew-nuts-whole.json` (CHANGED)
- `src/data/research/ingredients/chana-dal.json` (CHANGED)
- `src/data/research/ingredients/chicken-curry-cut-bone-in-skinless.json` (CHANGED)
- `src/data/research/ingredients/chicken-thigh-boneless-skinless.json` (NEW)
- `src/data/research/ingredients/chickpeas-dried.json` (NEW)
- `src/data/research/ingredients/cinnamon-cassia.json` (NEW)
- `src/data/research/ingredients/cloves.json` (NEW)
- `src/data/research/ingredients/cooking-oil-refined-sunflower-groundnut.json` (CHANGED)
- `src/data/research/ingredients/coriander-leaves.json` (CHANGED)
- `src/data/research/ingredients/coriander-powder.json` (NEW)
- `src/data/research/ingredients/cumin-seeds.json` (NEW)
- `src/data/research/ingredients/curd-plain.json` (CHANGED)
- `src/data/research/ingredients/curry-leaves.json` (CHANGED)
- `src/data/research/ingredients/dried-fenugreek-leaves.json` (NEW)
- `src/data/research/ingredients/dried-red-chilli-whole.json` (NEW)
- `src/data/research/ingredients/drumstick.json` (NEW)
- `src/data/research/ingredients/fenugreek-seeds.json` (NEW)
- `src/data/research/ingredients/flattened-rice-thick.json` (CHANGED)
- `src/data/research/ingredients/french-beans.json` (NEW)
- `src/data/research/ingredients/fresh-cream.json` (CHANGED)
- `src/data/research/ingredients/garam-masala.json` (NEW)
- `src/data/research/ingredients/garlic.json` (CHANGED)
- `src/data/research/ingredients/ghee-cow.json` (CHANGED)
- `src/data/research/ingredients/ginger-garlic-paste.json` (CHANGED)
- `src/data/research/ingredients/ginger.json` (CHANGED)
- `src/data/research/ingredients/green-capsicum.json` (NEW)
- `src/data/research/ingredients/green-cardamom.json` (NEW)
- `src/data/research/ingredients/green-chilli.json` (CHANGED)
- `src/data/research/ingredients/green-peas-frozen.json` (NEW)
- `src/data/research/ingredients/idli-rice-parboiled-rice.json` (CHANGED)
- `src/data/research/ingredients/index.ts` (CHANGED)
- `src/data/research/ingredients/kashmiri-red-chilli-powder.json` (CHANGED)
- `src/data/research/ingredients/lemon.json` (CHANGED)
- `src/data/research/ingredients/milk-toned.json` (CHANGED)
- `src/data/research/ingredients/mint-leaves.json` (CHANGED)
- `src/data/research/ingredients/mustard-seeds.json` (NEW)
- `src/data/research/ingredients/onion.json` (CHANGED)
- `src/data/research/ingredients/paneer.json` (CHANGED)
- `src/data/research/ingredients/peanuts-raw.json` (CHANGED)
- `src/data/research/ingredients/potato.json` (CHANGED)
- `src/data/research/ingredients/pumpkin-red-yellow.json` (NEW)
- `src/data/research/ingredients/red-chilli-powder.json` (CHANGED)
- `src/data/research/ingredients/saffron.json` (NEW)
- `src/data/research/ingredients/salt.json` (NEW)
- `src/data/research/ingredients/semolina-fine-bombay-rava.json` (NEW)
- `src/data/research/ingredients/shahi-jeera.json` (NEW)
- `src/data/research/ingredients/shallots.json` (NEW)
- `src/data/research/ingredients/spring-onion.json` (NEW)
- `src/data/research/ingredients/sugar.json` (NEW)
- `src/data/research/ingredients/tamarind-seedless-block.json` (NEW)
- `src/data/research/ingredients/tomato.json` (CHANGED)
- `src/data/research/ingredients/toor-dal.json` (CHANGED)
- `src/data/research/ingredients/turmeric-powder.json` (CHANGED)
- `src/data/research/ingredients/urad-dal-split-skinned.json` (CHANGED)
- `src/data/research/ledger.json` (CHANGED)
- `src/data/research/links.json` (NEW)
- `src/data/research/nutrients/index.ts` (NEW)
- `src/data/research/nutrients/thiamine.json` (NEW)
- `src/data/research/nutrients/vitamin-a.json` (NEW)
- `src/data/research/nutrients/vitamin-c.json` (NEW)
- `src/data/research/nutrients/vitamin-d.json` (NEW)
- `src/data/research/nutrients/vitamin-e.json` (NEW)
- `src/data/research/nutrients/vitamin-k.json` (NEW)

Samples (full content):

### `src/data/research/dishes/011-aloo-paratha.json`

```json
{
  "id": "011-aloo-paratha",
  "number": 11,
  "name": "Aloo Paratha",
  "cuisine": "North Indian (Punjabi), now an all-India home and dhaba staple, sold across Mumbai by tiffin services, Punjabi eateries and paratha specialists",
  "dietType": "veg",
  "mealType": [
    "breakfast"
  ],
  "difficulty": "Intermediate",
  "prepMin": 30,
  "cookMin": 15,
  "servings": 1,
  "ingredients": [
    {
      "ingredientId": null,
      "name": "Dough",
      "quantity": null,
      "unit": null,
      "householdMeasure": null
    },
    {
      "ingredientId": null,
      "name": "Whole wheat flour (atta)",
      "quantity": 80,
      "unit": "g",
      "householdMeasure": "⅔ cup (lightly spooned, not packed)"
    },
    {
      "ingredientId": null,
      "name": "Whole wheat flour (atta), for dusting",
      "quantity": 10,
      "unit": "g",
      "householdMeasure": "1 heaped tbsp in a small plate"
    },
    {
      "ingredientId": null,
      "name": "Water",
      "quantity": 50,
      "unit": "ml",
      "householdMeasure": "3½ tbsp (add a little at a time)"
    },
    {
      "ingredientId": "salt",
      "name": "Salt (namak), for the dough",
      "quantity": 0.5,
      "unit": "g",
      "householdMeasure": "1 small pinch"
    },
    {
      "ingredientId": null,
      "name": "Sunflower oil (or any neutral cooking oil), for the dough",
      "quantity": 2.5,
      "unit": "ml",
      "householdMeasure": "½ tsp"
    },
    {
      "ingredientId": "potato",
      "name": "Potato filling",
      "quantity": null,
      "unit": null,
      "householdMeasure": null
    },
    {
      "ingredientId": "potato",
      "name": "Potato (aloo)",
      "quantity": 160,
      "unit": "g",
      "householdMeasure": "1 large or 1½ medium"
    },
    {
      "ingredientId": "green-chilli",
      "name": "Green chilli (hari mirch)",
      "quantity": 5,
      "unit": "g",
      "householdMeasure": "1 small chilli, finely chopped"
    },
    {
      "ingredientId": "ginger",
      "name": "Ginger (adrak)",
      "quantity": 3,
      "unit": "g",
      "householdMeasure": "½ inch piece, grated (1 tsp)"
    },
    {
      "ingredientId": "coriander-leaves",
      "name": "Coriander leaves (dhania)",
      "quantity": 5,
      "unit": "g",
      "householdMeasure": "1 tbsp, finely chopped"
    },
    {
      "ingredientId": null,
      "name": "Carom seeds (ajwain)",
      "quantity": 0.5,
      "unit": "g",
      "householdMeasure": "¼ tsp"
    },
    {
      "ingredientId": null,
      "name": "Cumin powder (jeera powder), roasted",
      "quantity": 1,
      "unit": "g",
      "householdMeasure": "½ tsp"
    },
    {
      "ingredientId": "red-chilli-powder",
      "name": "Red chilli powder (lal mirch), Kashmiri or regular",
      "quantity": 0.5,
      "unit": "g",
      "householdMeasure": "¼ tsp"
    },
    {
      "ingredientId": "garam-masala",
      "name": "Garam masala",
      "quantity": 0.5,
      "unit": "g",
      "householdMeasure": "¼ tsp"
    },
    {
      "ingredientId": null,
      "name": "Dry mango powder (amchur)",
      "quantity": 1,
      "unit": "g",
      "householdMeasure": "½ tsp"
    },
    {
      "ingredientId": "salt",
      "name": "Salt (namak), for the filling",
      "quantity": 1.5,
      "unit": "g",
      "householdMeasure": "¼ tsp"
    },
    {
      "ingredientId": null,
      "name": "For cooking",
      "quantity": null,
      "unit": null,
      "householdMeasure": null
    },
    {
      "ingredientId": "ghee-cow",
      "name": "Ghee",
      "quantity": 10,
      "unit": "g",
      "householdMeasure": "2 tsp (1 tsp per paratha)"
    }
  ],
  "equipment": [
    "Pressure cooker (2–3 litre) to boil the potato",
    "Mixing bowl (parat or any wide bowl) for the dough",
    "Second bowl for the filling",
    "Grater or potato masher",
    "Rolling board and rolling pin (chakla-belan)",
    "Tawa (flat iron or non-stick griddle)",
    "Flat spatula (turner) for flipping and pressing",
    "Small spoon or silicone brush for spreading ghee",
    "Damp cloth or plate to cover the resting dough",
    "Measuring cup and spoons (a regular tea cup and teaspoons work as a stand-in)"
  ],
  "steps": [
    {
      "n": 1,
      "title": "Wash the potato",
      "text": "Rinse 160 g potato (1 large) under running water and rub off any soil.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "Clean skin, no mud in the eyes",
      "cameraCheck": "The washed potato in your hand",
      "videoShot": "The potato under the running tap."
    },
    {
      "n": 2,
      "title": "Pressure-cook the potato",
      "text": "Put the whole potato (halved if very large) in the cooker with 1 cup water. Close and cook on medium heat for 3 whistles, then switch off.",
      "timerSec": 600,
      "tip": "Do not over-boil. A watery, soggy potato makes a wet filling, which tears the paratha.",
      "visualCue": "3 whistles",
      "cameraCheck": "The closed cooker on the flame",
      "videoShot": "The cooker whistling."
    },
    {
      "n": 3,
      "title": "Measure the flour",
      "text": "While the potato cooks, put 80 g (⅔ cup) whole wheat flour into the mixing bowl.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "A small mound of flour",
      "cameraCheck": "⅔ cup atta in the bowl",
      "videoShot": "Flour falling from the cup into the bowl."
    },
    {
      "n": 4,
      "title": "Add salt and oil to the flour",
      "text": "Add a small pinch of salt and ½ tsp oil. Rub them in with your fingertips.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "The flour looks very slightly crumbly where the oil went in.",
      "cameraCheck": "The flour with oil rubbed in",
      "videoShot": "Fingers rubbing the oil into the flour."
    },
    {
      "n": 5,
      "title": "Add the first part of the water",
      "text": "Pour in about 35 ml (2½ tbsp) water and mix with your fingers.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "Shaggy lumps form, with some dry flour left in the bowl.",
      "cameraCheck": "The shaggy dough",
      "videoShot": "Water pouring in, fingers mixing."
    },
    {
      "n": 6,
      "title": "Add the rest of the water slowly",
      "text": "Add the remaining water 1 tsp at a time, only until all the flour comes together.",
      "timerSec": 60,
      "tip": "You may not need all 50 ml. Flours absorb water differently.",
      "visualCue": "One rough ball, no dry flour left",
      "cameraCheck": "The rough dough ball",
      "videoShot": "A teaspoon of water going in, then the dough gathering."
    },
    {
      "n": 7,
      "title": "Knead the dough",
      "text": "Push the dough away with the heel of your palm, fold it back, turn it a quarter and repeat.",
      "timerSec": 180,
      "tip": null,
      "visualCue": "Smooth, soft and slightly springy. A finger pressed in leaves a dent that slowly fills back. It should be softer than roti dough but not sticky.",
      "cameraCheck": "The smooth dough ball",
      "videoShot": "Hands kneading with a push-fold-turn rhythm."
    },
    {
      "n": 8,
      "title": "Rest the dough",
      "text": "Cover the bowl with a damp cloth or a plate.",
      "timerSec": 900,
      "tip": null,
      "visualCue": "After resting, the dough feels softer and more relaxed.",
      "cameraCheck": "The covered bowl",
      "videoShot": "The cloth being laid over the bowl."
    },
    {
      "n": 9,
      "title": "Release the pressure",
      "text": "Let the cooker cool until the pressure drops by itself, then open it.",
      "timerSec": 300,
      "tip": null,
      "visualCue": "No hiss when you lift the weight",
      "cameraCheck": "The open cooker with the potato",
      "videoShot": "The lid lifting and steam rising."
    },
    {
      "n": 10,
      "title": "Check the potato",
      "text": "Poke the potato with a knife.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "The knife slides through easily with no hard centre.",
      "cameraCheck": "The knife in the potato",
      "videoShot": "The knife sliding in."
    },
    {
      "n": 11,
      "title": "Cool and peel the potato",
      "text": "Move it to a plate. When cool enough to hold, peel off the skin.",
      "timerSec": 300,
      "tip": "Spread it out to cool faster. Warm filling releases steam and tears the dough.",
      "visualCue": "Peeled potato, dry on the surface, only slightly warm",
      "cameraCheck": "The peeled potato on the plate",
      "videoShot": "The skin pulling away."
    },
    {
      "n": 12,
      "title": "Chop the green chilli",
      "text": "Finely chop 1 small green chilli (5 g).",
      "timerSec": 30,
      "tip": null,
      "visualCue": "Tiny pieces, no long strips",
      "cameraCheck": "The chopped chilli on the board",
      "videoShot": "The knife chopping the chilli."
    },
    {
      "n": 13,
      "title": "Grate the ginger",
      "text": "Peel and grate a ½ inch piece of ginger (3 g).",
      "timerSec": 30,
      "tip": null,
      "visualCue": "About 1 tsp of fine, juicy ginger paste",
      "cameraCheck": "1 tsp grated ginger",
      "videoShot": "Ginger on the grater."
    },
    {
      "n": 14,
      "title": "Chop the coriander",
      "text": "Finely chop 5 g (1 tbsp) coriander leaves and pat them dry with a paper towel.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "Fine, dry green flecks",
      "cameraCheck": "1 tbsp chopped coriander",
      "videoShot": "The knife rocking through the leaves."
    },
    {
      "n": 15,
      "title": "Grate or mash the potato",
      "text": "Grate the potato into the second bowl, or mash it with a masher until there are no lumps.",
      "timerSec": 60,
      "tip": "Lumps poke through the dough when you roll. Take the extra minute here.",
      "visualCue": "Fine and smooth, no pieces bigger than a pea",
      "cameraCheck": "The mashed potato in the bowl",
      "videoShot": "The potato going through the grater."
    },
    {
      "n": 16,
      "title": "Add the spices",
      "text": "Add ¼ tsp ajwain (crush it between your palms first), ½ tsp roasted cumin powder, ¼ tsp red chilli powder, ¼ tsp garam masala, ½ tsp amchur and ¼ tsp salt.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "Little piles of coloured spice on the white potato",
      "cameraCheck": "The spices on top of the potato",
      "videoShot": "Each spice going in."
    },
    {
      "n": 17,
      "title": "Mix the filling",
      "text": "Add the chilli, ginger and coriander. Mix well with your fingers and taste.",
      "timerSec": 60,
      "tip": "It should taste a little saltier and tangier than you'd like, because the dough is bland.",
      "visualCue": "Evenly speckled filling that holds together when squeezed but does not feel wet",
      "cameraCheck": "The finished filling",
      "videoShot": "Fingers mixing, then one squeeze."
    },
    {
      "n": 18,
      "title": "Divide the filling",
      "text": "Shape the filling into 2 equal balls (about 80 g each).",
      "timerSec": 30,
      "tip": null,
      "visualCue": "2 balls, each about the size of a lime, slightly bigger than the dough balls will be",
      "cameraCheck": "The 2 filling balls",
      "videoShot": "Hands rolling the filling balls."
    },
    {
      "n": 19,
      "title": "Divide the dough",
      "text": "Knead the rested dough for 10 seconds and split it into 2 equal parts. Roll each into a smooth ball.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "2 smooth balls with no cracks, each about the size of a small lime",
      "cameraCheck": "2 dough balls next to 2 filling balls",
      "videoShot": "Dough being pinched in half and rolled."
    },
    {
      "n": 20,
      "title": "Heat the tawa",
      "text": "Put the tawa on medium heat.",
      "timerSec": 120,
      "tip": null,
      "visualCue": "A few drops of water sprinkled on it sizzle and vanish in 2–3 seconds.",
      "cameraCheck": "The tawa on the flame",
      "videoShot": "Water drops sizzling on the tawa."
    },
    {
      "n": 21,
      "title": "Roll the first dough ball into a small disc",
      "text": "Dust one dough ball with flour and roll it into a disc about 10 cm (4 inch) across, thicker in the centre than at the edges.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "An even small circle",
      "cameraCheck": "The disc on the board",
      "videoShot": "The rolling pin pressing out the disc."
    },
    {
      "n": 22,
      "title": "Stuff the disc",
      "text": "Place one filling ball in the centre. Gently pleat the edges up and around the filling, like a pouch.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "The filling is fully covered, with pleats meeting at the top.",
      "cameraCheck": "The pleated pouch",
      "videoShot": "Fingers pulling the pleats up."
    },
    {
      "n": 23,
      "title": "Seal the pouch",
      "text": "Pinch the pleats together and twist off any extra dough at the top. Press the pouch flat with your palm, sealed side down.",
      "timerSec": 20,
      "tip": "If you see a crack, pinch a scrap of dough over it before rolling.",
      "visualCue": "A flat, round patty with no filling showing",
      "cameraCheck": "The flattened patty",
      "videoShot": "The palm pressing the patty flat."
    },
    {
      "n": 24,
      "title": "Roll the paratha",
      "text": "Dust both sides with flour. Roll gently from the centre outwards, turning the paratha a quarter turn often, to about 18 cm (7 inch) across.",
      "timerSec": 60,
      "tip": "Light pressure only. If filling peeks out, dust that spot with flour and keep going, or stop at a slightly smaller size.",
      "visualCue": "An even round about 3–4 mm thick, with the filling faintly visible but not breaking through",
      "cameraCheck": "The rolled paratha next to a ruler or a 7 inch plate",
      "videoShot": "The pin rolling outwards in short strokes, the paratha turning."
    },
    {
      "n": 25,
      "title": "First side on the tawa",
      "text": "Dust off extra flour and lay the paratha on the hot tawa.",
      "timerSec": 40,
      "tip": null,
      "visualCue": "Small bubbles appear on top and the underside has light brown spots.",
      "cameraCheck": "The paratha on the tawa",
      "videoShot": "The paratha being laid down and bubbles forming."
    },
    {
      "n": 26,
      "title": "Flip it",
      "text": "Turn the paratha over with the spatula.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "The first side shows pale brown spots; the second side starts to dry.",
      "cameraCheck": "The spotted first side",
      "videoShot": "The flip."
    },
    {
      "n": 27,
      "title": "Ghee the top",
      "text": "Spread ½ tsp ghee over the top side.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "A thin shine across the whole surface",
      "cameraCheck": "The glossy paratha",
      "videoShot": "The spoon spreading ghee in circles."
    },
    {
      "n": 28,
      "title": "Flip and press",
      "text": "Flip again and press the edges and puffed areas gently with the spatula.",
      "timerSec": 30,
      "tip": null,
      "visualCue": "Sizzling, the paratha puffs in places and turns golden-brown with crisp spots.",
      "cameraCheck": "The golden side",
      "videoShot": "The spatula pressing as the paratha puffs."
    },
    {
      "n": 29,
      "title": "Ghee the second side",
      "text": "Spread the remaining ½ tsp ghee on top, flip once more and press until both sides are evenly golden.",
      "timerSec": 30,
      "tip": "If it browns before it cooks through, turn the flame down a little. A smoking-hot tawa burns the outside and leaves raw dough inside.",
      "visualCue": "Both sides golden-brown with darker crisp spots, no raw white patches, edges cooked through",
      "cameraCheck": "Both sides of the finished paratha",
      "videoShot": "The final flip, showing an evenly golden paratha."
    },
    {
      "n": 30,
      "title": "Rest the first paratha",
      "text": "Move it to a plate or a cloth-lined box.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "Steam rises from the surface.",
      "cameraCheck": "The paratha on the plate",
      "videoShot": "The paratha sliding onto the plate."
    },
    {
      "n": 31,
      "title": "Make the second paratha",
      "text": "Repeat steps 21–30 with the second dough and filling ball.",
      "timerSec": 300,
      "tip": null,
      "visualCue": "A second paratha matching the first",
      "cameraCheck": "Both parathas stacked",
      "videoShot": "The two parathas side by side."
    },
    {
      "n": 32,
      "title": "Serve",
      "text": "Cut each paratha in half or quarters and plate with curd and pickle (and butter on top, if you like).",
      "timerSec": 30,
      "tip": null,
      "visualCue": "Golden wedges showing the yellow-speckled potato layer inside",
      "cameraCheck": "The served plate",
      "videoShot": "A paratha being torn open to show the filling."
    }
  ],
  "nutritionPerServing": {
    "kcal": 545,
    "proteinG": 14.6,
    "carbsG": 94.2,
    "fatG": 15,
    "fibreG": 13
  },
  "microNutrientsEstimate": {
    "values": {
      "vitamin-a": 31.8,
      "vitamin-c": 37.1,
      "vitamin-k": 13.7
    },
    "coveragePct": 50,
    "basis": "partial estimate from ingredient quantities"
  },
  "asOrdered": null,
  "orderPrice": {
    "priceHistory": [
      {
        "date": "2026-10-06",
        "min": 130,
        "max": 190,
        "avg": 155,
        "confidence": null,
        "sourceFile": "FitPlate_Dishes_2026-10-06.md"
      }
    ],
    "currentEstimate": {
      "min": 130,
      "max": 180,
      "avg": 160
    },
    "method": "single",
    "trend": "unknown",
    "change30dPct": null,
    "lastObserved": "2026-10-06",
    "stale": false,
    "seasonal": false
  },
  "healthiness": {
    "score": 6.5,
    "restaurantScore": 4,
    "reasons": [
      "the home version uses whole wheat (about 13 g fibre per serving) and only 2 tsp ghee for 2 parathas, with no deep frying and no sugar. But it is mostly starch (about 94 g carbs from wheat plus potato), protein is modest (about 15 g), and there are almost no vegetables beyond the potato. Restaurant and dhaba parathas are often cooked with 1–2 tbsp ghee, oil or butter each, topped with a block of butter, made partly with maida, and served with salty pickle, so fat and sodium can double."
    ]
  },
  "researchRating": {
    "score": 4.6,
    "basis": "aloo paratha is one of the most-loved Indian breakfasts. It is widely described as Punjab's favourite breakfast and a comfort food, and recipe pages score very highly (4.97 from 86 votes on Hebbar's Kitchen, 4.94 from 16 on Cook with Manali, 4.89 from 42 on RecipeTin Eats, 4.75 on Manjula's Kitchen, 4.56 from 18 on Cook Click n Devour). Mumbai food guides (Homegrown, Curly Tales) list dedicated paratha spots across the city. Small deductions because it is heavy and greasy when made restaurant-style, and many home cooks report tearing and leaking filling."
  },
  "storage": "Cooked parathas keep in the fridge for up to 2 days, wrapped in foil or in an airtight box. To freeze, half-cook them (light spots on both sides, no ghee), cool, stack with butter paper between them and freeze for up to 1 month. Cook from frozen on a medium tawa with ghee, about 2 min per side. To reheat a fridge paratha, warm it on a hot tawa for 30–45 sec per side (crispier than the microwave). The raw potato filling keeps in the fridge for 1 day; the raw dough keeps for 1 day but darkens slightly.",
  "leftoverRemix": "Aloo paratha \"chaat\" wraps. Warm a leftover paratha on the tawa until crisp, spread 1 tbsp green chutney and 1 tbsp beaten curd, top with chopped onion, tomato, a pinch of chaat masala and a handful of sev, then roll it up tightly like a frankie. It makes a quick tiffin lunch.",
  "burnOff": "about 7.8 km of running (545 ÷ 70 kcal/km, for a 70 kg adult), or about 10.9 km of brisk walking (about 2 hr 10 min at 5 km/h, using about 50 kcal/km for walking) (est.). With butter, curd and pickle (about 690 kcal), about 9.9 km of running (est.).",
  "sources": [
    "Hebbar's Kitchen, Aloo Paratha (4.97 from 86 votes): https://hebbarskitchen.com/aloo-paratha-recipe-aalu-ka-paratha-aloo/",
    "Veg Recipes of India, Aloo Paratha (stuffed potato paratha): https://www.vegrecipesofindia.com/aloo-paratha-indian-bread-stuffed-with-potato-filling/",
    "Indian Healthy Recipes, Aloo Paratha: https://www.indianhealthyrecipes.com/wprm_print/aloo-paratha-recipe-potato-stuffed-paratha",
    "Cook with Manali, Aloo Paratha: https://cookwithmanali.com/aloo-paratha/comment-page-2",
    "Cook Click n Devour, Aloo Paratha and Dhaba-style Aloo Paratha (tips on dry, cool filling and medium heat): https://www.cookclickndevour.com/aloo-paratha and https://www.cookclickndevour.com/aloo-paratha-recipe-dhaba-style/",
    "RecipeTin Eats, Aloo Paratha: https://www.recipetineats.com/aloo-paratha-indian-potato-stuffed-flatbread/",
    "Manjula's Kitchen, Punjabi Aloo Paratha: https://manjulaskitchen.com/punjabi-aloo-paratha/",
    "Holy Cow Vegan, Aloo Paratha (quantities: 2 cups atta, 3 potatoes, 10 parathas): https://holycowvegan.net/wprm_print/aloo-paratha-recipe",
    "Yummy Tummy Aarthi, Aloo Paratha: https://www.yummytummyaarthi.com/wprm_print/aloo-paratha-recipe-stuffed-potato-paratha-recipe",
    "Tarla Dalal, Aloo Paratha: https://www.tarladalal.com/Aloo-Paratha-How-To-Make-Aloo-Paratha-2172r",
    "Smitha Kalluraya, Punjabi Aloo Paratha: https://smithakalluraya.com/aloo-paratha-recipe-punjabi-aloo-paratha/",
    "Spice Up The Curry, Aloo Paratha (comment threads on tearing): https://www.spiceupthecurry.com/aloo-paratha-recipe/comment-page-12/",
    "USDA FoodData Central: https://fdc.nal.usda.gov/",
    "CSIR-CFTRI / India Science & Technology, whole wheat atta composition (346 kcal, 12 g protein per 100 g): https://www.indiascienceandtechnology.gov.in/technologies/production-atta-whole-wheat-flour",
    "FatSecret / Fitia, packaged aloo paratha per-piece calories (cross-check): https://mobile.fatsecret.com/calories-nutrition/swad/aloo-paratha and https://fitia.app/calories-nutritional-information/aloo-paratha-F7pphappa0/",
    "Swiggy, Best Aloo Paratha Restaurants in Mumbai (Naivedya tiffine, Tiffin Shiffin, New Wanton Point, Nilaya By India Offline, LunchBox listings): https://www.swiggy.com/city/mumbai/aloo-paratha-dish-restaurants",
    "Swiggy, Dabba Garam Wadala: https://www.swiggy.com/city/mumbai/dabba-garam-homestyle-combo-thali-and-more--wadala-rest912255",
    "Swiggy, Ganga Cloud Kitchen Virar: https://www.swiggy.com/city/mumbai/ganga-cloud-kitchen-virar-rest1411710",
    "Swiggy, Sai Pooja Pure Veg, Parsik Nagar: https://www.swiggy.com/city/mumbai/sai-pooja-pure-veg-parsik-nagar-rest889770",
    "Swiggy, Mumma's Paratha, Nerul (dropped): https://www.swiggy.com/city/mumbai/mummas-paratha-sector-3-nerul-rest551726",
    "Zomato, Paratha's Powai: https://www.zomato.com/mumbai/parathas-powai/order",
    "Zomato, Paratha & More, Borivali West: https://www.zomato.com/mumbai/paratha-more-borivali-west/order",
    "Zomato, Best Aloo Paratha Delivery Restaurants in Mumbai (\"for one\" figures, ignored): https://www.zomato.com/mumbai/delivery/dish-aloo-paratha",
    "magicpin, Paratha Galli, Worli: https://magicpin.in/Mumbai/Worli/Restaurant/Paratha-Galli/store/2bb935",
    "magicpin, Paratha Zone, Borivali East: https://magicpin.in/Mumbai/Borivali-East/Restaurant/Paratha-Zone/store/234b6/menu/",
    "magicpin, World Famous Paratha, Malad West: https://magicpin.in/Mumbai/Malad-West/Restaurant/World-Famous-Paratha/store/631436/delivery",
    "magicpin, Tea & Paratha Center, Andheri East (dropped, combo): https://magicpin.in/Mumbai/Andheri-East/Restaurant/Tea-&-Paratha-Center/store/3b4398/menu/?img=Food-Menu&id=2",
    "magicpin, Lunchbox – Meals & Thalis, Bhandup and Dadar East/Fort (dropped, meal): https://magicpin.in/Mumbai/Bhandup/Restaurant/Lunchbox---Meals-And-Thalis/store/57bb4c and https://magicpin.in/Mumbai/Fort/Restaurant/Lunchbox---Meals-And-Thalis/store/57bb52/menu",
    "Homegrown, 9 buttery parathas across Mumbai (sentiment; Papa Pancho ₹130 mention, dropped): https://homegrown.co.in/homegrown-explore/9-mouthwatering-buttery-parathas-across-mumbai-you-should-tear-into-right-now",
    "Curly Tales, 18 places for the best parathas in Mumbai (sentiment): https://curlytales.com/best-parathas-places-in-mumbai/"
  ],
  "allergens": [
    "milk",
    "gluten"
  ],
  "dietClaims": [],
  "fasting": null,
  "dietTags": null,
  "tags": [
    "Veg",
    "Contains milk",
    "Contains gluten",
    "Breakfast",
    "North Indian",
    "Under 60 min",
    "Intermediate",
    "High fibre"
  ],
  "description": null,
  "familyId": null,
  "variants": [],
  "needsReview": [],
  "versions": [
    {
      "date": "2026-10-06",
      "file": "FitPlate_Dishes_2026-10-06.md"
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
    "Range 130.0–190.0 was wider than 30% of avg 155.0; narrowed to ±15%."
  ]
}
```

### `src/data/research/ingredients/carrot.json`

```json
{
  "id": "carrot",
  "name": "Carrot",
  "aliases": [
    "gajar"
  ],
  "category": "Vegetable",
  "standardUnit": "kg",
  "price": {
    "priceHistory": [
      {
        "date": "2026-10-05",
        "min": 65,
        "max": 70,
        "avg": 65,
        "confidence": "Low",
        "sourceFile": "FitPlate_Ingredients_2026-10-05.md"
      }
    ],
    "currentEstimate": {
      "min": 65,
      "max": 70,
      "avg": 65
    },
    "method": "single",
    "trend": "unknown",
    "change30dPct": null,
    "lastObserved": "2026-10-05",
    "stale": false,
    "seasonal": false
  },
  "per100Estimate": {
    "min": 6.5,
    "max": 7,
    "avg": 6.5
  },
  "seasonal": false,
  "nutritionPer100g": null,
  "macrosPer100Estimate": {
    "kcal": 41,
    "proteinG": 0.9,
    "carbsG": 9.6,
    "fatG": 0.2,
    "fibreG": 2.8
  },
  "storage": "unwashed, tops removed, in a perforated bag or box in the crisper drawer for 2–3 weeks.",
  "substitutes": [
    "Pumpkin (kaddu/lal bhopla)",
    "Green peas or beans",
    "Frozen mixed vegetables"
  ],
  "usedIn": [
    {
      "dishNumber": 6,
      "quantity": 20,
      "unit": "g",
      "raw": "20 g (2 tbsp, finely diced)"
    },
    {
      "dishNumber": 9,
      "quantity": 25,
      "unit": "g",
      "raw": "25 g (¼ medium, cubed, in the sambar)"
    },
    {
      "dishNumber": 10,
      "quantity": 30,
      "unit": "g",
      "raw": "30 g (¼ medium, finely diced)"
    }
  ],
  "versions": [
    {
      "date": "2026-10-05",
      "file": "FitPlate_Ingredients_2026-10-05.md"
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
  "mergeNotes": []
}
```

### `src/data/research/nutrients/vitamin-d.json`

```json
{
  "id": "vitamin-d",
  "name": "Vitamin D",
  "type": "vitamin",
  "subtype": "fat-soluble",
  "unit": "µg",
  "altUnits": [
    {
      "unit": "IU",
      "toMainUnitFactor": 0.025
    }
  ],
  "unitConversions": [],
  "targets": [
    {
      "group": "adult_male_sedentary",
      "ear": 10,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 (EAR 400 IU, RDA 600 IU)"
    },
    {
      "group": "adult_male_moderate",
      "ear": 10,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 (no activity adjustment)"
    },
    {
      "group": "adult_male_heavy",
      "ear": 10,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 (no activity adjustment)"
    },
    {
      "group": "adult_female_sedentary",
      "ear": 10,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 (EAR 400 IU, RDA 600 IU)"
    },
    {
      "group": "adult_female_moderate",
      "ear": 10,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 (no activity adjustment)"
    },
    {
      "group": "adult_female_heavy",
      "ear": 10,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 (no activity adjustment)"
    },
    {
      "group": "pregnant",
      "ear": null,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 via secondary summary (primary table not confirmed); NASEM 2011 RDA 15 µg"
    },
    {
      "group": "lactating",
      "ear": null,
      "rda": 15,
      "ai": null,
      "source": "ICMR-NIN 2020 via secondary summary (primary table not confirmed); NASEM 2011 RDA 15 µg"
    },
    {
      "group": "age_60_plus",
      "ear": null,
      "rda": null,
      "ai": null,
      "source": "Not found as separate ICMR-NIN value; NASEM 2011: RDA 15 µg to age 70, 20 µg from 71"
    }
  ],
  "appDefaultTarget": {
    "adult_male": 15,
    "adult_female": 15,
    "pregnant": 15,
    "lactating": 15,
    "age_60_plus": null
  },
  "upperLimit": {
    "value": 100,
    "unit": "µg",
    "appliesTo": "food_and_supplements",
    "source": "NASEM/IOM 2011 and EFSA 2023 (ICMR-NIN 2020 TUL value not found)"
  },
  "topFoodSources": [
    {
      "food": "Hilsa (ilish)",
      "veg": false,
      "per100g": 5.98,
      "servingG": 100,
      "servingLabel": "1 medium piece",
      "perServing": 5.98
    },
    {
      "food": "Indian oil sardine (tarli/mathi)",
      "veg": false,
      "per100g": 3.51,
      "servingG": 100,
      "servingLabel": "3-4 small fish",
      "perServing": 3.51
    },
    {
      "food": "Black pomfret (halwa)",
      "veg": false,
      "per100g": 2.94,
      "servingG": 100,
      "servingLabel": "1 medium piece",
      "perServing": 2.94
    },
    {
      "food": "Seer fish / surmai (Vanjaram)",
      "veg": false,
      "per100g": 1.64,
      "servingG": 100,
      "servingLabel": "1 steak",
      "perServing": 1.64
    },
    {
      "food": "Prawns, small",
      "veg": false,
      "per100g": 1.1,
      "servingG": 100,
      "servingLabel": "about 3/4 cup cleaned",
      "perServing": 1.1
    },
    {
      "food": "Rohu",
      "veg": false,
      "per100g": 1.01,
      "servingG": 100,
      "servingLabel": "1 piece",
      "perServing": 1.01
    },
    {
      "food": "Egg, country hen, whole, boiled",
      "veg": false,
      "per100g": 2.99,
      "servingG": 50,
      "servingLabel": "1 egg",
      "perServing": 1.5
    },
    {
      "food": "Egg, poultry, whole, boiled",
      "veg": false,
      "per100g": 0.74,
      "servingG": 50,
      "servingLabel": "1 egg",
      "perServing": 0.37
    },
    {
      "food": "Chicken liver",
      "veg": false,
      "per100g": 2.64,
      "servingG": 50,
      "servingLabel": "2-3 pieces",
      "perServing": 1.32
    },
    {
      "food": "Chicken breast, skinless",
      "veg": false,
      "per100g": 1.38,
      "servingG": 100,
      "servingLabel": "1 small breast piece",
      "perServing": 1.38
    },
    {
      "food": "Cow milk, whole (unfortified, IFCT D2 value)",
      "veg": true,
      "per100g": 1.22,
      "servingG": 200,
      "servingLabel": "1 glass (about 200 ml)",
      "perServing": 2.44
    },
    {
      "food": "Button mushroom, fresh (IFCT D2 value, low confidence)",
      "veg": true,
      "per100g": 20.54,
      "servingG": 50,
      "servingLabel": "about 1/2 cup sliced",
      "perServing": 10.27
    }
  ],
  "goodSourceDishes": [
    {
      "dishNumber": 33,
      "dishName": "Goan Fish Curry"
    },
    {
      "dishNumber": 73,
      "dishName": "Rava Fish Fry"
    },
    {
      "dishNumber": 55,
      "dishName": "Prawn Masala"
    },
    {
      "dishNumber": 2,
      "dishName": "Chicken Biryani"
    },
    {
      "dishNumber": 14,
      "dishName": "Egg Bhurji"
    },
    {
      "dishNumber": 21,
      "dishName": "Masala Omelette"
    },
    {
      "dishNumber": 38,
      "dishName": "Egg Curry"
    }
  ],
  "deficiencyRiskIndia": "high",
  "absorptionBoosters": [
    "Midday sunlight on bare skin (UVB); ICMR-NIN 2024 recommends sun exposure",
    "Eating vitamin D foods or supplements with a meal containing fat",
    "Vitamin D3 form (raises blood levels more than D2)",
    "Healthy body weight"
  ],
  "absorptionBlockers": [
    "Window glass (blocks UVB)",
    "Sunscreen, full clothing cover, shade, smog",
    "Early-morning or late-evening sun (low UVB)",
    "Darker skin pigmentation (needs longer exposure)",
    "Fat malabsorption conditions and very low-fat meals",
    "Obesity",
    "Older age (less skin synthesis)",
    "Some medicines: glucocorticoids, certain anti-seizure and anti-TB drugs, orlistat, bile-acid binders"
  ],
  "logPresets": [
    {
      "label": "Vitamin D3 400 IU",
      "amount": 10,
      "unit": "µg",
      "toMainFactor": 1,
      "factorSource": "same-unit",
      "mainAmount": 10,
      "mainAmountRange": null,
      "prescriptionDose": false
    },
    {
      "label": "Vitamin D3 600 IU",
      "amount": 15,
      "unit": "µg",
      "toMainFactor": 1,
      "factorSource": "same-unit",
      "mainAmount": 15,
      "mainAmountRange": null,
      "prescriptionDose": false
    },
    {
      "label": "Vitamin D3 1,000 IU",
      "amount": 25,
      "unit": "µg",
      "toMainFactor": 1,
      "factorSource": "same-unit",
      "mainAmount": 25,
      "mainAmountRange": null,
      "prescriptionDose": false
    },
    {
      "label": "Vitamin D3 2,000 IU",
      "amount": 50,
      "unit": "µg",
      "toMainFactor": 1,
      "factorSource": "same-unit",
      "mainAmount": 50,
      "mainAmountRange": null,
      "prescriptionDose": false
    },
    {
      "label": "Vitamin D3 60,000 IU weekly sachet/capsule",
      "amount": 1500,
      "unit": "µg",
      "toMainFactor": 1,
      "factorSource": "same-unit",
      "mainAmount": 1500,
      "mainAmountRange": null,
      "prescriptionDose": true
    },
    {
      "label": "Calcium + D3 tablet (250 IU)",
      "amount": 6.25,
      "unit": "µg",
      "toMainFactor": 1,
      "factorSource": "same-unit",
      "mainAmount": 6.25,
      "mainAmountRange": null,
      "prescriptionDose": false
    },
    {
      "label": "Calcium + D3 tablet (500 IU)",
      "amount": 12.5,
      "unit": "µg",
      "toMainFactor": 1,
      "factorSource": "same-unit",
      "mainAmount": 12.5,
      "mainAmountRange": null,
      "prescriptionDose": false
    }
  ],
  "warnings": [
    "Show a gentle notice if supplements alone average more than 100 µg (4,000 IU) per day over 7 days and are not marked as prescribed.",
    "Spread weekly doses: 60,000 IU (1,500 µg) once a week averages about 214 µg/day, above the UL; usually a short doctor-supervised course.",
    "Flag stacking when two or more vitamin D-containing products are logged on the same day.",
    "Prompt for a doctor review if a weekly 60,000 IU course runs beyond 8 weeks without a prescribed flag.",
    "Never warn on food or sunlight; sun exposure cannot cause vitamin D toxicity.",
    "IFCT 2017 plant vitamin D2 values are low confidence and are excluded from the progress ring by default.",
    "People with kidney disease, kidney stones, sarcoidosis, high calcium, or on thiazide diuretics or digoxin should seek medical advice before supplementing.",
    "General information, not medical advice."
  ],
  "conditionAdjustments": [],
  "lastResearched": "2026-10-09",
  "versions": [
    {
      "date": "2026-10-09",
      "file": "FitPlate_Nutrients_2026-10-09.md"
    }
  ],
  "mergeMethod": {
    "targets": "official (D3)",
    "upperLimit": "official safety limit (D3, lower on conflict)",
    "topFoodSources": "union; per100g official (D3)",
    "logPresets": "union by label (newest), converted with own file factors",
    "appDefaultTarget": "newest, kept only where it equals the ICMR row",
    "lists": "union",
    "warnings": "union (never dropped)",
    "text": "newest"
  },
  "mergeNotes": [],
  "needsReview": [
    "app_default_target.age_60_plus = 15 has no ICMR row to match (age_60_plus: \"Not found as separate ICMR-NIN value; NASEM 2011: RDA 15 µg to age 70, 20 µg from 71\"); set to null"
  ]
}
```

### `src/data/research/exercises/push-up.json`

```json
{
  "id": "push-up",
  "number": 2,
  "name": "Push-up (with knee and incline versions)",
  "otherNames": [
    "press-up",
    "knee push-up",
    "modified push-up",
    "incline push-up",
    "hands-elevated push-up",
    "wall push-up",
    "wall press"
  ],
  "section": "home",
  "type": "strength",
  "equipment": [],
  "noEquipmentAlternative": "Wall push-up: hands on a wall at shoulder height, feet a stride back",
  "musclesPrimary": [
    "pectoralis major",
    "anterior deltoid",
    "triceps brachii"
  ],
  "musclesSecondary": [
    "coracobrachialis",
    "serratus anterior",
    "pectoralis minor",
    "rectus abdominis",
    "obliques",
    "erector spinae",
    "quadriceps",
    "gluteus maximus",
    "rotator cuff"
  ],
  "level": "beginner",
  "impact": "low",
  "flatFriendly": true,
  "met": 3.8,
  "compendiumCode": "02022",
  "metOptions": [
    {
      "code": "02022",
      "met": 3.8,
      "activity": "MET: 3.8, under 2024 Adult Compendium code 02022: calisthenics (for example push-ups, sit-ups, pull-ups, lunges), moderate effort. If push-ups are done fast in a hard circuit with little rest, code 02"
    },
    {
      "code": "02020",
      "met": 7.5,
      "activity": "MET: 3.8, under 2024 Adult Compendium code 02022: calisthenics (for example push-ups, sit-ups, pull-ups, lunges), moderate effort. If push-ups are done fast in a hard circuit with little rest, code 02"
    }
  ],
  "prescriptions": [
    {
      "level": "beginner",
      "goal": "general_fitness",
      "sets": 2,
      "reps": "8-12 (wall, incline or knee version)",
      "timeSec": null,
      "restSec": 75,
      "tempo": "2-0-1-0",
      "perWeek": 3
    },
    {
      "level": "beginner",
      "goal": "muscle",
      "sets": 3,
      "reps": "8-12 (incline or knee version)",
      "timeSec": null,
      "restSec": 75,
      "tempo": "3-0-1-0",
      "perWeek": 3
    },
    {
      "level": "beginner",
      "goal": "strength",
      "sets": 3,
      "reps": "5-8 (lower incline)",
      "timeSec": null,
      "restSec": 120,
      "tempo": "2-1-1-0",
      "perWeek": 2
    },
    {
      "level": "beginner",
      "goal": "endurance",
      "sets": 2,
      "reps": "12-20 (easy incline)",
      "timeSec": null,
      "restSec": 50,
      "tempo": "2-0-1-0",
      "perWeek": 3
    },
    {
      "level": "intermediate",
      "goal": "fat_loss",
      "sets": 3,
      "reps": "10-15",
      "timeSec": null,
      "restSec": 50,
      "tempo": "2-0-1-0",
      "perWeek": 3
    },
    {
      "level": "intermediate",
      "goal": "muscle",
      "sets": 4,
      "reps": "8-15 (1-3 reps in reserve)",
      "timeSec": null,
      "restSec": 90,
      "tempo": "3-1-1-0",
      "perWeek": 3
    },
    {
      "level": "intermediate",
      "goal": "strength",
      "sets": 4,
      "reps": "5-8 (feet elevated)",
      "timeSec": null,
      "restSec": 150,
      "tempo": "2-1-1-0",
      "perWeek": 2
    },
    {
      "level": "intermediate",
      "goal": "endurance",
      "sets": 3,
      "reps": "15-25",
      "timeSec": null,
      "restSec": 50,
      "tempo": "1-0-1-0",
      "perWeek": 3
    },
    {
      "level": "advanced",
      "goal": "fat_loss",
      "sets": 4,
      "reps": "12-20",
      "timeSec": 40,
      "restSec": 40,
      "tempo": "2-0-1-0",
      "perWeek": 3
    },
    {
      "level": "advanced",
      "goal": "muscle",
      "sets": 4,
      "reps": "6-12 (deficit or weighted)",
      "timeSec": null,
      "restSec": 105,
      "tempo": "3-1-1-0",
      "perWeek": 3
    },
    {
      "level": "advanced",
      "goal": "strength",
      "sets": 5,
      "reps": "3-6 (archer or weighted)",
      "timeSec": null,
      "restSec": 150,
      "tempo": "2-1-X-0",
      "perWeek": 2
    },
    {
      "level": "advanced",
      "goal": "endurance",
      "sets": 3,
      "reps": "max minus 1-2",
      "timeSec": 60,
      "restSec": 60,
      "tempo": "1-0-1-0",
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
      "left_elbow",
      "right_elbow",
      "left_wrist",
      "right_wrist",
      "left_hip",
      "right_hip",
      "left_knee",
      "right_knee",
      "left_ankle",
      "right_ankle"
    ],
    "phases": [
      {
        "name": "top",
        "joint": "elbow",
        "angleDeg": ">= 150",
        "parsed": {
          "op": ">=",
          "value": 150,
          "max": null
        }
      },
      {
        "name": "down",
        "joint": "elbow",
        "angleDeg": "<= 100",
        "parsed": {
          "op": "<=",
          "value": 100,
          "max": null
        }
      },
      {
        "name": "up",
        "joint": "elbow",
        "angleDeg": ">= 150",
        "parsed": {
          "op": ">=",
          "value": 150,
          "max": null
        }
      }
    ],
    "minRepSec": 1
  },
  "formChecks": [
    {
      "joint": "hip",
      "rule": "shoulder-hip-ankle angle < 160 with hip below line",
      "message": "Hips sagging. Squeeze your glutes."
    },
    {
      "joint": "hip",
      "rule": "shoulder-hip-ankle angle < 160 with hip above line",
      "message": "Hips too high. Lower them into a plank."
    },
    {
      "joint": "elbow",
      "rule": "bottom elbow angle never <= 110",
      "message": "Go a little lower. Chest to a fist from the floor."
    },
    {
      "joint": "elbow",
      "rule": "top elbow angle never >= 150",
      "message": "Push all the way up."
    },
    {
      "joint": "neck",
      "rule": "nose well below shoulder-hip line",
      "message": "Keep your neck long. Look just ahead."
    },
    {
      "joint": "elbow",
      "rule": "front view elbow-to-torso angle > 60",
      "message": "Elbows in: make an arrow."
    },
    {
      "joint": "tempo",
      "rule": "rep duration < 1.0 s",
      "message": "Slow down. 2 seconds down."
    },
    {
      "joint": "hip",
      "rule": "knee version: knee-hip-shoulder angle < 150",
      "message": "Walk your hands forward. Knees, hips, shoulders in a line."
    }
  ],
  "safetyFlags": [
    "shoulder_pain",
    "wrist_pain",
    "elbow_pain",
    "lower_back_pain",
    "knee_pain_knee_version",
    "high_blood_pressure_avoid_breath_holding",
    "pregnancy_use_incline",
    "diastasis_recti",
    "recent_surgery"
  ],
  "progressions": [
    "full push-up",
    "feet-elevated push-up",
    "deficit or tempo push-up",
    "archer push-up",
    "weighted (backpack) push-up"
  ],
  "regressions": [
    "knee push-up",
    "low-incline push-up (stair step)",
    "high-incline push-up (counter or table)",
    "wall push-up",
    "negative push-up"
  ],
  "videoShots": [
    {
      "seconds": 8,
      "angle": "side, floor level, 2.5 m",
      "shows": "kneel, place hands, step back to plank",
      "textOverlay": "Hands just outside shoulders. Body in one straight line."
    },
    {
      "seconds": 10,
      "angle": "side, hip height, 2.5 m",
      "shows": "2 full push-ups, slow motion at bottom",
      "textOverlay": "2 seconds down, 1 up. Breathe in down, out up."
    },
    {
      "seconds": 6,
      "angle": "overhead or front, 1.5 m",
      "shows": "elbows at 45 degrees vs flared 90 degrees",
      "textOverlay": "Arrow, not T."
    },
    {
      "seconds": 10,
      "angle": "side, split screen",
      "shows": "sagging hips, piked hips, correct plank",
      "textOverlay": "Sag no, Pike no, Plank yes."
    },
    {
      "seconds": 8,
      "angle": "side, floor level, 2 m",
      "shows": "knee push-up setup and 2 reps",
      "textOverlay": "Knees to shoulders: one line."
    },
    {
      "seconds": 8,
      "angle": "side, counter height, 2.5 m",
      "shows": "incline push-up on kitchen counter, 2 reps",
      "textOverlay": "Higher surface = easier. Lower it over the weeks."
    },
    {
      "seconds": 6,
      "angle": "side, 2 m",
      "shows": "wall push-up, 2 reps",
      "textOverlay": "Start here if floor push-ups feel too hard."
    },
    {
      "seconds": 5,
      "angle": "side, floor level",
      "shows": "knees down and sit back to finish",
      "textOverlay": "Knees down first. Don't collapse."
    }
  ],
  "lastResearched": "2026-10-10",
  "setupSteps": [
    "Space: clear a strip of floor at least as long as your body. Put a mat down if the floor is hard marble or tile and your palms slip.",
    "Kneel in the middle of the mat, facing its long edge.",
    "Hand placement: put your palms flat on the floor directly below your shoulders, or slightly wider. Mayo Clinic says \"a bit wider than shoulder width\". ACE and South Tees NHS say shoulder width. FitPlate default: just outside shoulder width.",
    "Hand line: the hands should sit in line with the middle of the chest (nipple line), not up by the face (est.).",
    "Fingers: spread them and point them forward, or turn them very slightly outward if that eases the wrists or shoulders.",
    "Arms: straight, but don't hard-lock the elbows.",
    "Legs: step one foot back, then the other, so you are on your toes with your legs straight.",
    "Feet: about hip-width apart. Feet together makes it slightly harder to balance; wider feet are more stable.",
    "Body line: squeeze your glutes, lightly brace your stomach as if bracing for a poke, and make one straight line from head to heels. This is a high plank.",
    "Head: look at the floor a little ahead of your hands, so the neck stays in line with the spine.",
    "Start on hands and knees on a mat or folded towel, with your hands placed as for the full version.",
    "Walk your hands forward until a straight line runs from your knees through your hips to your shoulders. Your hips must not stay piked back over your knees.",
    "Feet: either cross your ankles and lift your feet, or leave your toes resting on the floor. ACSM's test position keeps the lower legs on the mat with the ankles pointed.",
    "Pad the knees. Mumbai flats often have hard vitrified tiles.",
    "Choose a surface that can't slide or tip: a wall, a kitchen counter, a heavy table against a wall, a solid bed frame, or a stair step. Never use a plastic chair or a stool with wheels.",
    "Choose the height. Higher means easier: in the force-plate study, hands raised about 61 cm (a low table) carried about 41% of body weight, versus about 64% on the floor.",
    "Place your hands on the edge just outside shoulder width.",
    "Walk your feet back until your body forms one straight line from head to heels, with arms straight and shoulders over the hands. Stand on the balls of your feet.",
    "Wall version: stand about a stride or arm's length from the wall, then place your hands at shoulder height and shoulder width on the wall (NHS South Tees)."
  ],
  "steps": [
    {
      "n": 1,
      "part": null,
      "title": "Set the plank",
      "action": "hold the start position from Setup, with arms straight and body straight.",
      "feel": "light tension in your stomach and glutes, and weight spread between your hands and toes.",
      "breathing": "take a normal breath in.",
      "tempo": "1–2 s to settle.",
      "visualCheck": "from the side, ears, shoulders, hips, knees and ankles sit on one straight line, with wrists under or just in front of the shoulders. From the front, hands are level and the head is centred, not dropping."
    },
    {
      "n": 2,
      "part": null,
      "title": "Set the shoulders",
      "action": "gently push the floor away so your upper back isn't sunk between your shoulder blades, and keep your shoulders away from your ears.",
      "feel": "muscles under your armpits (serratus) switch on.",
      "breathing": "normal.",
      "tempo": "1 s.",
      "visualCheck": "from the side, the upper back is flat, not dipped. From the front, the neck looks long."
    },
    {
      "n": 3,
      "part": null,
      "title": "Start lowering by bending the elbows",
      "action": "bend your elbows and let them travel back at roughly 45° from your body. Seen from above, you should look like an arrow, not a \"T\".",
      "feel": "the chest and the front of the shoulders stretch and take the load.",
      "breathing": "breathe in as you go down.",
      "tempo": "2–3 s for the whole descent (controlled; Mayo Clinic warns against dropping down).",
      "visualCheck": "from the side, the whole body lowers as one plank, without the hips dropping first. From the front, the elbows point back and slightly out, not straight out sideways."
    },
    {
      "n": 4,
      "part": null,
      "title": "Reach the bottom",
      "action": "lower until your chest is about a fist's height from the floor, or lightly touches it (for the incline version, the chest comes near the edge; for the wall version, the head comes within a few cm of the wall).",
      "feel": "a strong stretch across the chest, with the stomach still tight.",
      "breathing": "finish the inhale. Don't hold your breath for long.",
      "tempo": "pause about 0–1 s, with no bouncing.",
      "visualCheck": "from the side, upper arms are about level with the torso (elbow about 90° or less, est.) and the body is still straight. From the front, shoulders are level and not shrugged up."
    },
    {
      "n": 5,
      "part": null,
      "title": "Press up",
      "action": "push the floor away until your arms are straight again.",
      "feel": "the chest and triceps work hard. Your stomach stops the hips from lagging behind.",
      "breathing": "breathe out as you push up.",
      "tempo": "1–2 s up (smooth, not snapped).",
      "visualCheck": "from the side, shoulders and hips rise together. From the front, both arms straighten at the same speed and the body does not twist."
    },
    {
      "n": 6,
      "part": null,
      "title": "Finish the rep",
      "action": "at the top, keep pushing gently so the shoulder blades spread slightly apart, without rounding the upper back hard. Then start the next rep.",
      "feel": "arms straight and core still braced.",
      "breathing": "short reset breath.",
      "tempo": "0–1 s.",
      "visualCheck": "you are back in the same plank as step 1."
    },
    {
      "n": 7,
      "part": null,
      "title": "End the set safely",
      "action": "after the last rep, lower your knees to the mat first, then sit back on your heels. Don't collapse onto your chest. In the incline version, walk your feet in towards the surface before standing.",
      "feel": "muscles relaxing.",
      "breathing": "breathe normally.",
      "tempo": "2–3 s.",
      "visualCheck": "controlled, with no flop."
    }
  ],
  "commonMistakes": [
    {
      "title": "Sagging hips (banana back)",
      "text": "Sagging hips (banana back). This loads the lower back and turns a strength move into a back strain. Fix: squeeze your glutes, brace your stomach, or regress to an incline where the plank is easier."
    },
    {
      "title": "Hips piked high",
      "text": "Hips piked high. This cuts the range and moves the load off the chest. Fix: lower your hips until they're in line, and check sideways in a mirror or on camera."
    },
    {
      "title": "Elbows flared to 90°",
      "text": "Elbows flared to 90°. Coaching and physio sources link this to extra stress on the front of the shoulder and the inner elbow. Fix: aim for 45° (the \"arrow\"), and turn your hands very slightly outward if that helps."
    },
    {
      "title": "Half reps (only bending the elbows a little)",
      "text": "Half reps (only bending the elbows a little). The chest gets little work and progress stalls. Fix: lower to a fist's height from the floor. If you can't, raise your hands higher (an incline) rather than cutting depth."
    },
    {
      "title": "Head poking down first",
      "text": "Head poking down first. This strains the neck and fakes depth. Fix: keep your chin gently tucked so your chest arrives first."
    },
    {
      "title": "Holding your breath for the whole set",
      "text": "Holding your breath for the whole set. This raises blood pressure and makes you tire faster. Fix: breathe in on the way down and out on the way up."
    },
    {
      "title": "Hands too far forward (ahead of the head)",
      "text": "Hands too far forward (ahead of the head). This increases wrist bend and shoulder stress. Fix: keep your hands under the lower chest."
    },
    {
      "title": "Rushing",
      "text": "Rushing. Bouncing out of the bottom uses momentum and loses control. Fix: use a 2–3 s descent and a smooth 1–2 s press."
    },
    {
      "title": "Knee version with the hips sitting back",
      "text": "Knee version with the hips sitting back. This turns it into an easy \"head bob\". Fix: walk your hands out until knees, hips and shoulders line up."
    }
  ],
  "safetyNotes": [
    "Shoulder problems (impingement, rotator cuff pain, past dislocation): use a higher incline, keep the elbows near 30–45°, and limit depth to a pain-free range. Stop if pain is sharp or catches.",
    "Wrist pain (including from long hours of typing): use push-up handles or hex dumbbells to keep the wrists straight, or do push-ups on your fists on a padded mat, or use an incline to reduce load. See a physio if pain persists, or if there is swelling, numbness or tingling.",
    "Elbow pain (tennis or golfer's elbow): avoid very narrow hands, keep the reps slow, and use an incline.",
    "Lower back problems: sagging puts strain on the back. Use an incline or wall version, which makes the plank easier, and stop if back pain appears.",
    "Knee problems: for the knee version, pad well or use the incline version instead (no knee contact).",
    "High blood pressure or heart disease: breathe steadily and don't hold your breath, because breath-holding (the Valsalva manoeuvre) spikes blood pressure. Avoid sets to failure, and prefer incline versions. Get medical clearance if your BP is uncontrolled.",
    "Pregnancy: many pregnancy-exercise sources suggest moving to incline or wall push-ups as the bump grows, to reduce load on the stretched abdominal wall. Avoid bearing down, stop if you see doming or coning along the midline of the belly, and follow your doctor's advice.",
    "Diastasis recti or after childbirth: start with wall or incline versions and progress under guidance.",
    "Recent surgery (chest, shoulder, abdomen, wrist) or recent fracture: don't do this until your surgeon or physio clears you.",
    "Osteoporosis in the wrists, or past wrist fracture: use incline or handle versions, and get professional advice.",
    "Stop immediately if you notice: chest pain or pressure, unusual breathlessness, dizziness or light-headedness, sharp joint pain (shoulder, elbow, wrist), pins and needles or numbness in the arms or hands, or sudden back pain.",
    "Spotter: not needed.",
    "Home etiquette: make sure your incline surface can't slide, especially on a wet floor after mopping. Keep children and pets clear of the space under your chest."
  ],
  "sources": [
    "ExRx.net – Push-up (target, synergist and stabiliser muscles): https://exrx.net/WeightExercises/PectoralSternal/BWPushup",
    "ExRx.net – Incline Push-up: https://exrx.net/WeightExercises/PectoralSternal/BWInclinePushup",
    "ACE Exercise Library – Push-up (and kneeling variation): https://www.acefitness.org/resources/everyone/exercise-library/220/push-up/",
    "Mayo Clinic – Pushups video (modified and wall push-up cues): https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/pushups/vid-20084674",
    "Mayo Clinic Care Network – \"Know how to do a proper pushup?\": https://www.mymlc.com/health-information/articles/k/know-how-to-do-a-proper-pushup/",
    "Harvard Health – Modify your push-ups to meet your fitness level: https://www.health.harvard.edu/exercise-and-fitness/modify-your-push-ups-to-meet-your-fitness-level",
    "Harvard Health – The rise of push-ups: https://www.health.harvard.edu/blog/rise-push-ups-classic-exercise-can-motivate-get-stronger-2019021810165",
    "NHS South Tees – Combined press ups (wall and knee press-up): https://www.southtees.nhs.uk/resources/combined-press-ups/",
    "NHS RJAH OurSpace – Wall press: https://ourspace.rjah.nhs.uk/exercise/wall-press",
    "Herrmann SD et al. 2024 Adult Compendium of Physical Activities (J Sport Health Sci): https://pubmed.ncbi.nlm.nih.gov/38242596/ ; tracking guide with codes 02020/02022: https://pacompendium.com/wp-content/uploads/2025/02/4_2024_adult-compendium-tracking-guide-1-2024.pdf",
    "Ebben WP et al. Kinetic analysis of several variations of push-ups (2011), force-plate data: https://ojs.ub.uni-konstanz.de/cpa/article/view/4457 ; summary: https://breakingmuscle.com/fitness/kinetic-analysis-of-the-push-up-which-version-is-hardest",
    "Suprak DN, Dawes J, Stephenson MD. The effect of position on the percentage of body mass supported during traditional and modified push-up variants. J Strength Cond Res 2011;25:497–503: https://pubmed.ncbi.nlm.nih.gov/20179649 ; summary: https://www.cooperinstitute.org/blog/how-much-weight-is-really-lifted-during-a-push-up",
    "Kikuchi N, Nakazato K. Low-load bench press and push-up induce similar muscle hypertrophy and strength gain. J Exerc Sci Fit 2017;15(1):37–42: https://pubmed.ncbi.nlm.nih.gov/29541130/",
    "Calatayud J et al. Bench press and push-up at comparable levels of muscle activity results in similar strength gains (2015): https://roderic.uv.es/bitstreams/9b37d667-9048-4ecb-81de-33572f0f9d02/download",
    "Yang J et al. Association between push-up exercise capacity and future cardiovascular events among active adult men. JAMA Netw Open 2019;2(2):e188341 (Harvard T.H. Chan summary): https://hsph.harvard.edu/news/push-up-capacity-cardiovascular-disease-events-men",
    "ACSM Position Stand – Progression models in resistance training for healthy adults (2009): https://www.sportgeneeskunde.com/wp-content/uploads/ACSM-Position-Stand-Progression-Models-in-Resistance-Training-for-Healthy-Adults.pdf",
    "ACSM push-up test protocol (knee position description), secondary: https://exercise.trekeducation.org/2017/10/01/maximal-push-test/",
    "E3 Rehab – Push-up modifications (wrist and shoulder adjustments): https://e3rehab.com/pushupmodifications/",
    "Physitrack – Push-up, pregnancy modified (wall/incline): https://www.physitrack.com/exercise-library/how-to-perform-the-push-up-pregnancy-modified",
    "Hand width: ACE and NHS say shoulder width, Mayo says slightly wider. Chosen: just outside shoulder width.",
    "Elbow angle: most coaching sources say about 45°, while a biomechanics summary suggests 20–40°. Chosen: aim for about 45°, with anything from 20–45° acceptable, and avoid 90° flare.",
    "Load of the knee push-up: Harvard Health says 36–45% of body weight; force-plate studies say 49% (Ebben) and 54–62% (Suprak). Chosen: the measured force-plate values.",
    "Full push-up load: 64% (Ebben, peak force) vs 69–75% (Suprak, by position). Both are reported; the difference reflects method.",
    "ACSM 2026 resistance-training update: reported in the news, but its specific novice numbers were not retrieved, so the 2009 position stand figures are used. Recheck next cycle.",
    "NSCA-specific push-up technique guidance: Not found."
  ],
  "burnMinutes": null,
  "gymAccess": [],
  "suitsPreferences": [],
  "swapsByAccess": null,
  "conditionCautions": [],
  "searchTags": null,
  "tags": [
    "Home",
    "No equipment",
    "Flat-friendly",
    "Quiet",
    "Beginner",
    "Low impact",
    "Strength",
    "Chest",
    "Shoulders",
    "Arms",
    "Rep counter"
  ],
  "needsReview": [],
  "versions": [
    {
      "date": "2026-10-10",
      "file": "FitPlate_Fitness_2026-10-10.md"
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

### `src/data/research/ingredients/aliases.json`

```json
{
  "adrak": "ginger",
  "adrak-lehsun-paste": "ginger-garlic-paste",
  "aloo": "potato",
  "arhar-dal": "toor-dal",
  "asafoetida": "asafoetida",
  "basmati-chawal": "basmati-rice-everyday-grade",
  "basmati-rice-everyday-grade": "basmati-rice-everyday-grade",
  "batata": "potato",
  "bay-leaf": "bay-leaf",
  "biryani-masala": "biryani-masala",
  "black-cumin": "shahi-jeera",
  "butter-salted": "butter-salted",
  "cabbage": "cabbage",
  "caraway": "shahi-jeera",
  "caraway-as-sold-in-india": "shahi-jeera",
  "carrot": "carrot",
  "cashew-nuts-whole": "cashew-nuts-whole",
  "chana-dal": "chana-dal",
  "cheeni": "sugar",
  "chicken-curry-cut-bone-in-skinless": "chicken-curry-cut-bone-in-skinless",
  "chicken-thigh-boneless-skinless": "chicken-thigh-boneless-skinless",
  "chickpeas-dried": "chickpeas-dried",
  "cinnamon-cassia": "cinnamon-cassia",
  "cloves": "cloves",
  "compounded": "asafoetida",
  "cooking-oil-refined-sunflower-groundnut": "cooking-oil-refined-sunflower-groundnut",
  "coriander-leaves": "coriander-leaves",
  "coriander-powder": "coriander-powder",
  "cottage-cheese": "paneer",
  "cumin-seeds": "cumin-seeds",
  "curd-plain": "curd-plain",
  "curry-leaves": "curry-leaves",
  "dahi": "curd-plain",
  "dalchini": "cinnamon-cassia",
  "desi-ghee": "ghee-cow",
  "dhania": "coriander-leaves",
  "dhania-powder": "coriander-powder",
  "dhaniya": "coriander-leaves",
  "dhuli-urad-dal": "urad-dal-split-skinned",
  "doodh": "milk-toned",
  "dried-fenugreek-leaves": "dried-fenugreek-leaves",
  "dried-red-chilli-whole": "dried-red-chilli-whole",
  "drumstick": "drumstick",
  "elaichi": "green-cardamom",
  "fenugreek-seeds": "fenugreek-seeds",
  "flattened-rice-thick": "flattened-rice-thick",
  "french-beans": "french-beans",
  "fresh-cream": "fresh-cream",
  "gajar": "carrot",
  "garam-masala": "garam-masala",
  "garlic": "garlic",
  "ghee-cow": "ghee-cow",
  "ginger": "ginger",
  "ginger-garlic-paste": "ginger-garlic-paste",
  "green-capsicum": "green-capsicum",
  "green-cardamom": "green-cardamom",
  "green-chilli": "green-chilli",
  "green-peas-frozen": "green-peas-frozen",
  "haldi": "turmeric-powder",
  "hara-pyaz": "spring-onion",
  "hari-mirch": "green-chilli",
  "hing": "asafoetida",
  "idli-chawal": "idli-rice-parboiled-rice",
  "idli-rice-parboiled-rice": "idli-rice-parboiled-rice",
  "imli": "tamarind-seedless-block",
  "iodised": "salt",
  "jada-poha": "flattened-rice-thick",
  "jeera": "cumin-seeds",
  "kabuli-chana": "chickpeas-dried",
  "kaddu": "pumpkin-red-yellow",
  "kadi-patta": "curry-leaves",
  "kaju": "cashew-nuts-whole",
  "kanda": "onion",
  "kashmiri-lal-mirch": "kashmiri-red-chilli-powder",
  "kashmiri-red-chilli-powder": "kashmiri-red-chilli-powder",
  "kasuri-methi": "dried-fenugreek-leaves",
  "kesar": "saffron",
  "lahsun": "garlic",
  "lal-bhopla": "pumpkin-red-yellow",
  "lal-mirch": "red-chilli-powder",
  "laung": "cloves",
  "lemon": "lemon",
  "makhan": "butter-salted",
  "makkhan": "butter-salted",
  "malai": "fresh-cream",
  "matar": "green-peas-frozen",
  "methi-dana": "fenugreek-seeds",
  "milk-toned": "milk-toned",
  "mint-leaves": "mint-leaves",
  "moongphali": "peanuts-raw",
  "moringa": "drumstick",
  "murgh": "chicken-curry-cut-bone-in-skinless",
  "mustard-seeds": "mustard-seeds",
  "namak": "salt",
  "nimbu": "lemon",
  "onion": "onion",
  "paneer": "paneer",
  "patta-gobi": "cabbage",
  "peanuts-raw": "peanuts-raw",
  "poha": "flattened-rice-thick",
  "potato": "potato",
  "pudina": "mint-leaves",
  "pumpkin-red-yellow": "pumpkin-red-yellow",
  "pyaz": "onion",
  "rai": "mustard-seeds",
  "rava": "semolina-fine-bombay-rava",
  "red-chilli-powder": "red-chilli-powder",
  "refined-white": "sugar",
  "saffron": "saffron",
  "salt": "salt",
  "sambar-onion": "shallots",
  "saragva": "drumstick",
  "semolina-fine-bombay-rava": "semolina-fine-bombay-rava",
  "shahi-jeera": "shahi-jeera",
  "shallots": "shallots",
  "shengdana": "peanuts-raw",
  "shevga": "drumstick",
  "shimla-mirch": "green-capsicum",
  "small-onion": "shallots",
  "small-onions": "shallots",
  "sooji": "semolina-fine-bombay-rava",
  "split-bengal-gram": "chana-dal",
  "split-pigeon-pea": "toor-dal",
  "split-pigeon-peas": "toor-dal",
  "spring-onion": "spring-onion",
  "sugar": "sugar",
  "sukhi-lal-mirch": "dried-red-chilli-whole",
  "tamarind-seedless-block": "tamarind-seedless-block",
  "tamatar": "tomato",
  "tej-patta": "bay-leaf",
  "tel": "cooking-oil-refined-sunflower-groundnut",
  "tomato": "tomato",
  "toor-dal": "toor-dal",
  "turmeric-powder": "turmeric-powder",
  "ukda-chawal": "idli-rice-parboiled-rice",
  "urad-dal-split-skinned": "urad-dal-split-skinned",
  "white-urad-dal": "urad-dal-split-skinned"
}
```

### `src/data/research/links.json`

```json
{
  "schema": "fitplate.links.v1",
  "generatedFor": "Day05",
  "goodSourceDishes": {
    "thiamine": [
      {
        "dishNumber": 11,
        "dishName": "Aloo Paratha",
        "dishId": "011-aloo-paratha"
      },
      {
        "dishNumber": 5,
        "dishName": "Dal Tadka",
        "dishId": "005-dal-tadka"
      },
      {
        "dishNumber": 29,
        "dishName": "Misal Pav",
        "dishId": null
      },
      {
        "dishNumber": 8,
        "dishName": "Chole (Chana Masala)",
        "dishId": "008-chole-chana-masala"
      },
      {
        "dishNumber": 12,
        "dishName": "Rajma Chawal",
        "dishId": "012-rajma-chawal"
      },
      {
        "dishNumber": 27,
        "dishName": "Dal Makhani",
        "dishId": null
      },
      {
        "dishNumber": 16,
        "dishName": "Besan Chilla",
        "dishId": "016-besan-chilla"
      },
      {
        "dishNumber": 9,
        "dishName": "Idli with Sambar",
        "dishId": "009-idli-with-sambar"
      },
      {
        "dishNumber": 26,
        "dishName": "Moong Dal Chilla",
        "dishId": null
      },
      {
        "dishNumber": 40,
        "dishName": "Sabudana Khichdi",
        "dishId": null
      }
    ],
    "vitamin-a": [
      {
        "dishNumber": 17,
        "dishName": "Palak Paneer",
        "dishId": "017-palak-paneer"
      },
      {
        "dishNumber": 96,
        "dishName": "Gajar Halwa",
        "dishId": null
      },
      {
        "dishNumber": 13,
        "dishName": "Pav Bhaji",
        "dishId": "013-pav-bhaji"
      },
      {
        "dishNumber": 14,
        "dishName": "Egg Bhurji",
        "dishId": "014-egg-bhurji"
      },
      {
        "dishNumber": 46,
        "dishName": "Methi Thepla",
        "dishId": null
      },
      {
        "dishNumber": 9,
        "dishName": "Idli with Sambar",
        "dishId": "009-idli-with-sambar"
      },
      {
        "dishNumber": 10,
        "dishName": "Veg Fried Rice",
        "dishId": "010-veg-fried-rice"
      },
      {
        "dishNumber": 25,
        "dishName": "Veg Pulao",
        "dishId": null
      },
      {
        "dishNumber": 21,
        "dishName": "Masala Omelette",
        "dishId": null
      }
    ],
    "vitamin-c": [
      {
        "dishNumber": 32,
        "dishName": "Aloo Gobi",
        "dishId": null
      },
      {
        "dishNumber": 22,
        "dishName": "Kadai Paneer",
        "dishId": null
      },
      {
        "dishNumber": 13,
        "dishName": "Pav Bhaji",
        "dishId": "013-pav-bhaji"
      },
      {
        "dishNumber": 34,
        "dishName": "Chilli Paneer",
        "dishId": null
      },
      {
        "dishNumber": 15,
        "dishName": "Veg Hakka Noodles",
        "dishId": "015-veg-hakka-noodles"
      },
      {
        "dishNumber": 37,
        "dishName": "Bhindi Masala",
        "dishId": null
      },
      {
        "dishNumber": 10,
        "dishName": "Veg Fried Rice",
        "dishId": "010-veg-fried-rice"
      },
      {
        "dishNumber": 17,
        "dishName": "Palak Paneer",
        "dishId": "017-palak-paneer"
      }
    ],
    "vitamin-d": [
      {
        "dishNumber": 33,
        "dishName": "Goan Fish Curry",
        "dishId": null
      },
      {
        "dishNumber": 73,
        "dishName": "Rava Fish Fry",
        "dishId": null
      },
      {
        "dishNumber": 55,
        "dishName": "Prawn Masala",
        "dishId": null
      },
      {
        "dishNumber": 2,
        "dishName": "Chicken Biryani",
        "dishId": "002-chicken-biryani"
      },
      {
        "dishNumber": 14,
        "dishName": "Egg Bhurji",
        "dishId": "014-egg-bhurji"
      },
      {
        "dishNumber": 21,
        "dishName": "Masala Omelette",
        "dishId": null
      },
      {
        "dishNumber": 38,
        "dishName": "Egg Curry",
        "dishId": null
      }
    ],
    "vitamin-e": [
      {
        "dishNumber": 17,
        "dishName": "Palak Paneer",
        "dishId": "017-palak-paneer"
      },
      {
        "dishNumber": 32,
        "dishName": "Aloo Gobi",
        "dishId": null
      },
      {
        "dishNumber": 31,
        "dishName": "Indian-style Overnight Oats",
        "dishId": null
      },
      {
        "dishNumber": 14,
        "dishName": "Egg Bhurji",
        "dishId": "014-egg-bhurji"
      },
      {
        "dishNumber": 21,
        "dishName": "Masala Omelette",
        "dishId": null
      },
      {
        "dishNumber": 30,
        "dishName": "Lemon Rice",
        "dishId": null
      },
      {
        "dishNumber": 1,
        "dishName": "Poha",
        "dishId": "001-poha"
      },
      {
        "dishNumber": 10,
        "dishName": "Veg Fried Rice",
        "dishId": "010-veg-fried-rice"
      }
    ],
    "vitamin-k": [
      {
        "dishNumber": 17,
        "dishName": "Palak Paneer",
        "dishId": "017-palak-paneer"
      },
      {
        "dishNumber": 82,
        "dishName": "Methi Chicken",
        "dishId": null
      },
      {
        "dishNumber": 46,
        "dishName": "Methi Thepla",
        "dishId": null
      },
      {
        "dishNumber": 15,
        "dishName": "Veg Hakka Noodles",
        "dishId": "015-veg-hakka-noodles"
      },
      {
        "dishNumber": 13,
        "dishName": "Pav Bhaji",
        "dishId": "013-pav-bhaji"
      },
      {
        "dishNumber": 10,
        "dishName": "Veg Fried Rice",
        "dishId": "010-veg-fried-rice"
      },
      {
        "dishNumber": 14,
        "dishName": "Egg Bhurji",
        "dishId": "014-egg-bhurji"
      },
      {
        "dishNumber": 20,
        "dishName": "Vada Pav",
        "dishId": "020-vada-pav"
      },
      {
        "dishNumber": 32,
        "dishName": "Aloo Gobi",
        "dishId": null
      },
      {
        "dishNumber": 22,
        "dishName": "Kadai Paneer",
        "dishId": null
      }
    ]
  },
  "dishGoodSourceOf": {
    "011-aloo-paratha": [
      "thiamine"
    ],
    "005-dal-tadka": [
      "thiamine"
    ],
    "008-chole-chana-masala": [
      "thiamine"
    ],
    "012-rajma-chawal": [
      "thiamine"
    ],
    "016-besan-chilla": [
      "thiamine"
    ],
    "009-idli-with-sambar": [
      "thiamine",
      "vitamin-a"
    ],
    "017-palak-paneer": [
      "vitamin-a",
      "vitamin-c",
      "vitamin-e",
      "vitamin-k"
    ],
    "013-pav-bhaji": [
      "vitamin-a",
      "vitamin-c",
      "vitamin-k"
    ],
    "014-egg-bhurji": [
      "vitamin-a",
      "vitamin-d",
      "vitamin-e",
      "vitamin-k"
    ],
    "010-veg-fried-rice": [
      "vitamin-a",
      "vitamin-c",
      "vitamin-e",
      "vitamin-k"
    ],
    "015-veg-hakka-noodles": [
      "vitamin-c",
      "vitamin-k"
    ],
    "002-chicken-biryani": [
      "vitamin-d"
    ],
    "001-poha": [
      "vitamin-e"
    ],
    "020-vada-pav": [
      "vitamin-k"
    ]
  },
  "families": [],
  "drinks": [],
  "met": [
    {
      "exerciseId": "bodyweight-squat",
      "name": "Bodyweight squat",
      "met": 3.8
    },
    {
      "exerciseId": "desk-neck-shoulder-release",
      "name": "Desk neck and shoulder release",
      "met": 2.3
    },
    {
      "exerciseId": "push-up",
      "name": "Push-up (with knee and incline versions)",
      "met": 3.8
    },
    {
      "exerciseId": "surya-namaskar",
      "name": "Surya Namaskar (Sun Salutation)",
      "met": 3.5
    }
  ],
  "microTable": {
    "toor-dal": {
      "thiamine": {
        "per100": 0.45,
        "unit": "mg",
        "source": "nutrient research (thiamine food sources)"
      }
    },
    "drumstick": {
      "vitamin-a": {
        "per100": 2924,
        "unit": "µg",
        "source": "nutrient research (vitamin-a food sources)"
      },
      "vitamin-c": {
        "per100": 108,
        "unit": "mg",
        "source": "nutrient research (vitamin-c food sources)"
      },
      "vitamin-k": {
        "per100": 479,
        "unit": "µg",
        "source": "nutrient research (vitamin-k food sources)"
      }
    },
    "carrot": {
      "vitamin-a": {
        "per100": 1125,
        "unit": "µg",
        "source": "nutrient research (vitamin-a food sources)"
      }
    },
    "coriander-leaves": {
      "vitamin-a": {
        "per100": 635,
        "unit": "µg",
        "source": "nutrient research (vitamin-a food sources)"
      },
      "vitamin-k": {
        "per100": 274,
        "unit": "µg",
        "source": "nutrient research (vitamin-k food sources)"
      }
    },
    "green-capsicum": {
      "vitamin-c": {
        "per100": 123,
        "unit": "mg",
        "source": "nutrient research (vitamin-c food sources)"
      }
    },
    "potato": {
      "vitamin-c": {
        "per100": 23.2,
        "unit": "mg",
        "source": "nutrient research (vitamin-c food sources)"
      }
    },
    "tomato": {
      "vitamin-c": {
        "per100": 25.3,
        "unit": "mg",
        "source": "nutrient research (vitamin-c food sources)"
      }
    },
    "cabbage": {
      "vitamin-c": {
        "per100": 33.3,
        "unit": "mg",
        "source": "nutrient research (vitamin-c food sources)"
      },
      "vitamin-k": {
        "per100": 113,
        "unit": "µg",
        "source": "nutrient research (vitamin-k food sources)"
      }
    },
    "green-peas-frozen": {
      "vitamin-k": {
        "per100": 44,
        "unit": "µg",
        "source": "nutrient research (vitamin-k food sources)"
      }
    },
    "spring-onion": {
      "vitamin-k": {
        "per100": 44,
        "unit": "µg",
        "source": "nutrient research (vitamin-k food sources)"
      }
    }
  }
}
```

### `src/data/research/nutrients/index.ts`

```ts
// GENERATED by scripts/research/run.js. Do not edit by hand.
import type { Nutrient } from '../../../models/nutrient';

import item_thiamine from './thiamine.json';
import item_vitamin_a from './vitamin-a.json';
import item_vitamin_c from './vitamin-c.json';
import item_vitamin_d from './vitamin-d.json';
import item_vitamin_e from './vitamin-e.json';
import item_vitamin_k from './vitamin-k.json';

export const items: Nutrient[] = [
  item_thiamine as unknown as Nutrient,
  item_vitamin_a as unknown as Nutrient,
  item_vitamin_c as unknown as Nutrient,
  item_vitamin_d as unknown as Nutrient,
  item_vitamin_e as unknown as Nutrient,
  item_vitamin_k as unknown as Nutrient,
];
```


## 8. CODE FILES

| Path | NEW or CHANGED | Purpose |
|---|---|---|
| `scripts/research/run.js` | CHANGED | Four streams, caps 10/30/6/8, alias pass, nutrient and fitness builds, cross-links, links.json |
| `src/models/research.ts` | CHANGED | Dish tags, dietTags, description, familyId, variants; Ingredient usedIn; v2 nutrient fields |
| `src/models/nutrient.ts` | NEW | Nutrient, Hydration, Guidance, HealthCondition types |
| `src/models/exercise.ts` | NEW | Exercise and fitness Guidance types |
| `src/services/data/dietTags.ts` | NEW | PATCH 03/04 parsers: Diet tags, Tags line, Diet variants |
| `src/services/data/tags.ts` | NEW | Tag engine and variant families |
| `src/services/data/crossLinks.ts` | NEW | Alias map, link stats, micronutrient table, dish micros, kcal check, good-source and used-in links |
| `src/services/data/nutrientImporter.ts` | NEW | Nutrient, hydration, guidance and health-condition importer; review fix 2 nutrient rules |
| `src/services/data/exerciseImporter.ts` | NEW | Fitness importer: exercises, guides, tags, validators, burn-off minutes |
| `src/services/data/dishImporter.ts` | CHANGED | Reads diet tags, tags line, description, variants; declared allergens |
| `src/services/data/ingredientImporter.ts` | CHANGED | Used in, v2 JSON fields, profile schema filter |
| `src/services/data/buildItems.ts` | CHANGED | Dish tags and review notes; ingredient usedIn |
| `src/services/data/researchIndex.ts` | CHANGED | renderIndex for any model type |
| `src/data/research/index.ts` | CHANGED | Exports nutrients, hydration, guidance, conditions, exercises, guides, aliases, links, familyOf |
| `src/__tests__/data/tags.test.ts` | NEW | Tag engine and parser tests (23) |
| `src/__tests__/data/crossLinks.test.ts` | NEW | Cross-link tests (10) |
| `src/__tests__/data/nutrients.test.ts` | NEW | Nutrient importer tests (34) |
| `src/__tests__/data/exercises.test.ts` | NEW | Fitness importer tests (32) |
| `src/__tests__/data/researchData.test.ts` | CHANGED | Validates the new bundled folders, tags, prescription doses, links |
| `docs/DATA_MODEL.md` | CHANGED | Research layout and changelog |


### `scripts/research/run.js`

```js
#!/usr/bin/env node
/**
 * Daily data sync runner (auto-build spec section C).
 *
 *   node scripts/research/run.js --today 2026-10-15 --build Day05 [--src /mnt/project-files] [--dry-run] [--report out.json]
 *
 * 1. Parses every research file of the four streams under --src (dishes,
 *    ingredients, nutrients incl. hydration/guidance/health profiles, fitness).
 * 2. Compares item versions (item id + research date) with the ledger in
 *    src/data/research/ledger.json; anything new is backlog, oldest first.
 * 3. Takes at most the per-run caps (10 dishes, 30 ingredients) into the ledger.
 * 4. Rebuilds every ledgered item from all its versions (merge rules + price
 *    engine), validates it, and writes src/data/research/<type>/<id>.json.
 * 5. Cross-links the streams (spec F): alias map, micronutrient estimates,
 *    good-source dishes, variant families, "Used in" checks; writes
 *    ingredients/aliases.json and links.json.
 * 6. Regenerates each index.ts and prints a JSON report for the build file.
 *
 * The importers are TypeScript; a small Babel hook lets Node load them
 * directly so the app and this script share one parser.
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

require.extensions['.ts'] = function compileTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { code } = babel.transformSync(source, {
    filename,
    babelrc: false,
    configFile: false,
    presets: [require.resolve('@babel/preset-typescript')],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  module._compile(code, filename);
};

const ROOT = path.resolve(__dirname, '..', '..');
const { parseDishFile } = require(path.join(ROOT, 'src/services/data/dishImporter.ts'));
const { parseIngredientFile } = require(path.join(ROOT, 'src/services/data/ingredientImporter.ts'));
const { buildDish, buildIngredient, buildIngredientIndex, validateDish, validateIngredient } = require(path.join(ROOT, 'src/services/data/buildItems.ts'));
const { renderIndex } = require(path.join(ROOT, 'src/services/data/researchIndex.ts'));
const nutrientImporter = require(path.join(ROOT, 'src/services/data/nutrientImporter.ts'));
const exerciseImporter = require(path.join(ROOT, 'src/services/data/exerciseImporter.ts'));
const crossLinks = require(path.join(ROOT, 'src/services/data/crossLinks.ts'));
const { assignFamilies } = require(path.join(ROOT, 'src/services/data/tags.ts'));

const CAPS = { dishes: 10, ingredients: 30, nutrients: 6, fitness: 8 };
const STREAMS = {
  dishes: { dir: 'dish-research', prefix: 'FitPlate_Dishes_' },
  ingredients: { dir: 'ingredient-research', prefix: 'FitPlate_Ingredients_' },
  nutrients: { dir: 'nutrient-research', prefix: 'FitPlate_Nutrients_' },
  fitness: { dir: 'fitness-research', prefix: 'FitPlate_Fitness_' },
};

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
const flag = (name) => process.argv.includes(`--${name}`);

const today = arg('today');
const build = arg('build');
const src = arg('src', '/mnt/project-files');
const dryRun = flag('dry-run');
const reportPath = arg('report');
if (!/^\d{4}-\d{2}-\d{2}$/.test(today || '') || !build) {
  console.error('usage: run.js --today YYYY-MM-DD --build DayNN [--src DIR] [--dry-run] [--report FILE]');
  process.exit(2);
}

const DATA = path.join(ROOT, 'src/data/research');
const LEDGER = path.join(DATA, 'ledger.json');

function listFiles(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && /\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .filter((f) => f.match(/(\d{4}-\d{2}-\d{2})/)[1] <= today)
    .sort();
}

function loadLedger() {
  const empty = { schema: 'fitplate.ledger.v1', dishes: {}, ingredients: {}, nutrients: {}, fitness: {} };
  if (!fs.existsSync(LEDGER)) return empty;
  return { ...empty, ...JSON.parse(fs.readFileSync(LEDGER, 'utf8')) };
}

/**
 * Parses a whole stream; returns versions in file order and per-file stats.
 * Nutrient and fitness items are keyed `kind:id` in the ledger, since one file
 * can hold a vitamin and a guidance topic, or an exercise and a guide.
 */
function parseStream(kind) {
  const dir = path.join(src, STREAMS[kind].dir);
  const files = listFiles(dir, STREAMS[kind].prefix);
  const versions = [];
  const fileStats = [];
  const errors = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    let items;
    let errs = [];
    if (kind === 'dishes') items = parseDishFile(text, file);
    else if (kind === 'ingredients') ({ items, errors: errs } = parseIngredientFile(text, file));
    else if (kind === 'nutrients') ({ items, errors: errs } = nutrientImporter.parseNutrientFile(text, file));
    else ({ items, errors: errs } = exerciseImporter.parseFitnessFile(text, file));
    // The same item twice in one file counts once (first wins).
    const seen = new Set();
    for (const it of items) {
      const id = itemKey(kind, it);
      if (seen.has(id)) {
        errors.push(`${file}: duplicate entry for ${id}; first kept`);
        continue;
      }
      seen.add(id);
      versions.push({ ...it, ledgerId: id, date: it.date || file.match(/(\d{4}-\d{2}-\d{2})/)[1], file });
    }
    errors.push(...errs.map((e) => `${file}: ${e}`));
    fileStats.push({ file, items: seen.size });
  }
  return { versions, fileStats, errors };
}

function itemKey(kind, it) {
  if (kind === 'nutrients' || kind === 'fitness') return `${it.kind}:${it.id}`;
  return it.id;
}

const key = (v) => `${v.ledgerId}@${v.date}`;

function plan(kind, parsed, ledger) {
  const done = new Set();
  for (const [id, list] of Object.entries(ledger[kind])) for (const v of list) done.add(`${id}@${v.date}`);
  const backlog = parsed.versions.filter((v) => !done.has(key(v)));
  const take = backlog.slice(0, CAPS[kind]);
  return { backlog, take };
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

const ledger = loadLedger();
const dishes = parseStream('dishes');
const ingredients = parseStream('ingredients');
const nutrients = parseStream('nutrients');
const fitness = parseStream('fitness');
const dishPlan = plan('dishes', dishes, ledger);
const ingPlan = plan('ingredients', ingredients, ledger);
const nutPlan = plan('nutrients', nutrients, ledger);
const fitPlan = plan('fitness', fitness, ledger);

for (const [kind, p] of [['dishes', dishPlan], ['ingredients', ingPlan], ['nutrients', nutPlan], ['fitness', fitPlan]]) {
  for (const v of p.take) {
    (ledger[kind][v.ledgerId] = ledger[kind][v.ledgerId] || []).push({ date: v.date, file: v.file, build });
  }
}

// Rebuild every ledgered item from all its versions.
const versionsOf = (kind, parsed) => {
  const map = new Map();
  for (const v of parsed.versions) {
    const entries = ledger[kind][v.ledgerId];
    if (entries && entries.some((e) => e.date === v.date)) (map.get(v.ledgerId) || map.set(v.ledgerId, []).get(v.ledgerId)).push(v);
  }
  return map;
};

const report = {
  today,
  build,
  dryRun,
  caps: CAPS,
  streams: {},
  needsReview: [],
  invalid: [],
  parseErrors: [...dishes.errors, ...ingredients.errors, ...nutrients.errors, ...fitness.errors],
};

const ingVersions = versionsOf('ingredients', ingredients);
const builtIngredients = [];
for (const [id, list] of ingVersions) {
  const item = buildIngredient(list, today);
  const errs = validateIngredient(item);
  if (errs.length) report.invalid.push({ type: 'ingredient', id, errors: errs });
  else builtIngredients.push(item);
  if (item.needsReview.length) report.needsReview.push({ type: 'ingredient', id, issues: item.needsReview });
}
builtIngredients.sort((a, b) => a.id.localeCompare(b.id));

// F1: alias map. A first pass links dish lines by English name to learn their
// Indian names; the dishes are then built with the enlarged index.
const dishVersions = versionsOf('dishes', dishes);
const latestDishLines = [...dishVersions.values()].map((list) => ({ ingredients: [...list].sort((a, b) => a.date.localeCompare(b.date)).pop().ingredients }));
const aliasResult = crossLinks.buildAliasMap(builtIngredients, latestDishLines);
const index = crossLinks.indexWithAliases(builtIngredients, aliasResult.aliases);

const builtDishes = [];
for (const [id, list] of dishVersions) {
  const dish = buildDish(list, today, index);
  const errs = validateDish(dish);
  if (errs.length) report.invalid.push({ type: 'dish', id, errors: errs });
  else builtDishes.push(dish);
  if (dish.needsReview.length) report.needsReview.push({ type: 'dish', id, issues: dish.needsReview });
}
builtDishes.sort((a, b) => a.number - b.number);

// Nutrient stream: vitamins/minerals, hydration, guidance and health profiles.
const topics = { nutrient: [], hydration: [], guidance: [], condition: [] };
for (const [id, list] of versionsOf('nutrients', nutrients)) {
  const { kind, item } = nutrientImporter.buildTopic(list, today);
  const validate = { nutrient: nutrientImporter.validateNutrient, hydration: nutrientImporter.validateHydration, guidance: nutrientImporter.validateGuidance, condition: nutrientImporter.validateCondition }[kind];
  const errs = validate(item);
  if (errs.length) report.invalid.push({ type: kind, id, errors: errs });
  else topics[kind].push(item);
  if (item.needsReview && item.needsReview.length) report.needsReview.push({ type: kind, id, issues: item.needsReview });
}
// Fitness stream: exercises and guides.
const fit = { exercise: [], guidance: [] };
for (const [id, list] of versionsOf('fitness', fitness)) {
  const kind = list[0].kind;
  const item = kind === 'exercise' ? exerciseImporter.buildExercise(list, today) : exerciseImporter.buildGuidance(list, today);
  // Fitness validators only flag (rep-counter angles, MET checks); they never block an item
  // that has a name, so the library can still show it with its "needs review" notes.
  const errs = kind === 'exercise' ? exerciseImporter.validateExercise(item) : exerciseImporter.validateGuidance(item);
  if (!item.id || !item.name) report.invalid.push({ type: `fitness ${kind}`, id, errors: ['no id or name', ...errs] });
  else fit[kind].push(item);
  const issues = [...new Set([...(item.needsReview || []), ...errs])];
  if (issues.length) report.needsReview.push({ type: `fitness ${kind}`, id, issues });
}
for (const list of [...Object.values(topics), ...Object.values(fit)]) list.sort((a, b) => a.id.localeCompare(b.id));

// F2–F7 cross-links.
const nutrientLinks = topics.nutrient.map((n) => nutrientImporter.nutrientCrossLinks(n));
const micro = crossLinks.buildMicroTable(
  builtIngredients,
  nutrientLinks.map((l) => ({ id: l.id, unit: l.unit, topFoodSources: l.foodSources.map((f) => ({ food: f.food, per100g: f.per100g })) })),
  index,
);
const ingById = new Map(builtIngredients.map((i) => [i.id, i]));
const kcalChecks = [];
for (const d of builtDishes) {
  d.microNutrientsEstimate = crossLinks.dishMicros(d, micro.table);
  const fromIng = crossLinks.dishKcalFromIngredients(d, ingById);
  const own = d.nutritionPerServing.kcal;
  if (fromIng && own && fromIng.coveragePct >= 80 && Math.abs(fromIng.kcal - own) / own > 0.25) {
    kcalChecks.push({ id: d.id, dishFile: own, fromIngredients: fromIng.kcal, coveragePct: fromIng.coveragePct });
  }
}
const families = assignFamilies(builtDishes);
for (const d of builtDishes) d.familyId = families.familyOf.get(d.id) || null;
const goodSource = crossLinks.goodSourceLinks(
  topics.nutrient.map((n) => ({ id: n.id, goodSourceDishes: n.goodSourceDishes.filter((g) => g.dishNumber != null) })),
  builtDishes,
);
const stats = crossLinks.linkStats(builtDishes, builtIngredients);
const links = {
  schema: 'fitplate.links.v1',
  generatedFor: build,
  goodSourceDishes: goodSource.byNutrient,
  dishGoodSourceOf: goodSource.byDish,
  families: families.links,
  drinks: topics.hydration.map((h) => nutrientImporter.hydrationCrossLinks(h)),
  // F6: MET values for burn-off; the app scales by the profile weight (research assumes 70 kg).
  met: fit.exercise.filter((e) => e.met != null).map((e) => ({ exerciseId: e.id, name: e.name, met: e.met })),
  microTable: micro.table,
};

// Validators run over the whole parsed backlog too, so problems show before those dishes are ingested.
report.backlogReview = dishes.versions
  .filter((v) => v.needsReview.length > 0 && !dishVersions.has(v.id))
  .map((v) => ({ id: v.id, date: v.date, issues: v.needsReview }));

for (const [kind, parsed, p, built] of [
  ['dishes', dishes, dishPlan, builtDishes],
  ['ingredients', ingredients, ingPlan, builtIngredients],
  ['nutrients', nutrients, nutPlan, Object.values(topics).flat()],
  ['fitness', fitness, fitPlan, Object.values(fit).flat()],
]) {
  report.streams[kind] = {
    files: parsed.fileStats,
    versionsSeen: parsed.versions.length,
    ingestedThisRun: p.take.map(key),
    backlogBefore: p.backlog.length,
    backlogAfter: p.backlog.length - p.take.length,
    itemsInApp: built.length,
  };
}
report.links = {
  dishIngredientLines: stats.lines,
  linked: stats.linked,
  priced: stats.priced,
  unmatched: stats.unmatched,
  aliasesLearned: aliasResult.learned,
  aliasesAmbiguous: aliasResult.ambiguous,
  microFromNutrientStream: micro.fromNutrientStream,
  nutrientFoodsUnmatched: micro.unmatchedFoods,
  kcalOver25pct: kcalChecks,
  usedInMismatches: crossLinks.usedInMismatches(builtIngredients, builtDishes),
  families: families.links,
  goodSourceDishes: goodSource.byNutrient,
  drinksTables: links.drinks.length,
  met: links.met,
};
report.dishes = builtDishes.map((d) => ({
  id: d.id,
  kcal: d.nutritionPerServing.kcal,
  orderPrice: d.orderPrice && d.orderPrice.currentEstimate,
  allergens: d.allergens,
  claims: d.dietClaims,
  tags: d.tags,
  familyId: d.familyId,
  variants: d.variants.map((v) => `${v.category}: ${v.status}${v.name ? ` (${v.name})` : ''}`),
  micros: d.microNutrientsEstimate && d.microNutrientsEstimate.coveragePct,
  steps: d.steps.length,
  ingredients: d.ingredients.length,
}));
report.topics = Object.fromEntries(Object.entries(topics).map(([k, list]) => [k, list.map((t) => t.id)]));
report.fitness = Object.fromEntries(Object.entries(fit).map(([k, list]) => [k, list.map((t) => ({ id: t.id, met: t.met, tags: t.tags }))]));
report.ingredients = builtIngredients.map((i) => ({ id: i.id, unit: i.standardUnit, price: i.price && i.price.currentEstimate, trend: i.price && i.price.trend, seasonal: i.seasonal }));

if (!dryRun) {
  const strip = (item) => Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'needsReview'));
  for (const [dir, items, type, model, clean] of [
    ['dishes', builtDishes, 'Dish', 'research', (d) => d],
    // An ingredient's needsReview is report-only; the Ingredient type doesn't carry it.
    ['ingredients', builtIngredients, 'Ingredient', 'research', strip],
    ['nutrients', topics.nutrient, 'Nutrient', 'nutrient', (d) => d],
    ['hydration', topics.hydration, 'Hydration', 'nutrient', (d) => d],
    ['guidance', topics.guidance, 'Guidance', 'nutrient', (d) => d],
    ['conditions', topics.condition, 'HealthCondition', 'nutrient', (d) => d],
    ['exercises', fit.exercise, 'Exercise', 'exercise', (d) => d],
    ['fitness-guides', fit.guidance, 'Guidance', 'exercise', (d) => d],
  ]) {
    const out = path.join(DATA, dir);
    fs.mkdirSync(out, { recursive: true });
    const keep = new Set(items.map((i) => `${i.id}.json`));
    for (const f of fs.readdirSync(out)) if (f.endsWith('.json') && f !== 'aliases.json' && !keep.has(f)) fs.unlinkSync(path.join(out, f));
    for (const item of items) writeJson(path.join(out, `${item.id}.json`), clean(item));
    fs.writeFileSync(path.join(out, 'index.ts'), renderIndex(type, items.map((i) => i.id), model));
  }
  writeJson(path.join(DATA, 'ingredients', 'aliases.json'), aliasResult.aliases);
  writeJson(path.join(DATA, 'links.json'), links);
  writeJson(LEDGER, ledger);
}

const json = JSON.stringify(report, null, 2);
if (reportPath) fs.writeFileSync(reportPath, json + '\n');
else console.log(json);
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
  warnings: string[];
  lastResearched: string | null;
};

export type HealthCondition = Reviewed & HealthConditionData;
```

### `src/models/exercise.ts`

```ts
/**
 * Fitness research content (roadmap Day 5). Movement items follow the
 * "### 14. App data (JSON)" block of the fitness research spec, camelCased;
 * knowledge and plan items follow the KNOWLEDGE TEMPLATE's JSON block. A few
 * markdown-only sections (setup, steps, mistakes, safety, sources, Compendium
 * rows) are kept too because the workout player and burn-off screens need
 * them and the JSON does not carry them. null always means "not found".
 */
import type { Provenance } from './research';

export type ExerciseSection = 'home' | 'yoga_stretch' | 'gym';
export type ExerciseType = 'strength' | 'cardio' | 'mobility' | 'yoga_asana' | 'pranayama';
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseGoal = 'general_fitness' | 'fat_loss' | 'muscle' | 'strength' | 'endurance' | 'flexibility' | 'relaxation';

export const EXERCISE_SECTIONS: readonly ExerciseSection[] = ['home', 'yoga_stretch', 'gym'];
export const EXERCISE_TYPES: readonly ExerciseType[] = ['strength', 'cardio', 'mobility', 'yoga_asana', 'pranayama'];
export const EXERCISE_LEVELS: readonly ExerciseLevel[] = ['beginner', 'intermediate', 'advanced'];
export const EXERCISE_GOALS: readonly ExerciseGoal[] = ['general_fitness', 'fat_loss', 'muscle', 'strength', 'endurance', 'flexibility', 'relaxation'];

export type Prescription = {
  level: ExerciseLevel | null;
  goal: ExerciseGoal | null;
  sets: number | null;
  reps: string | null;
  timeSec: number | null;
  restSec: number | null;
  tempo: string | null;
  perWeek: number | null;
};

/** One threshold of a rep-counter phase. "between" uses value as the lower and max as the upper bound. */
export type AngleRule = { op: '>=' | '<=' | '>' | '<' | 'between'; value: number; max: number | null };

export type RepPhase = {
  name: string;
  joint: string;
  /** The research text exactly as written, e.g. "<= 100" or "165-195". */
  angleDeg: string;
  /** null when the text is not a numeric angle (ratios, "n/a", position checks). Thresholds are merged as stable estimates. */
  parsed: AngleRule | null;
};

export type RepCounter = {
  mode: 'reps' | 'hold_timer' | 'none' | null;
  cameraView: 'side' | 'front' | 'either' | null;
  landmarks: string[];
  phases: RepPhase[];
  minRepSec: number | null;
};

export type FormCheck = { joint: string; rule: string; message: string };
export type VideoShot = { seconds: number | null; angle: string; shows: string; textOverlay: string };

/** One micro-step of "### 4. Step-by-step execution". */
export type ExerciseStep = {
  n: number;
  /** Sub-heading the step sits under (e.g. "A. Front (forearm) plank"), when the research splits the steps. */
  part: string | null;
  title: string;
  action: string | null;
  feel: string | null;
  breathing: string | null;
  tempo: string | null;
  visualCheck: string | null;
};

export type CommonMistake = { title: string | null; text: string };

/** A Compendium row from "### 10. Calories": the MET options the research lists, with their codes. */
export type MetOption = { code: string | null; met: number; activity: string };

/** ADDITIONS D (12 Oct 2026). Older files lack these keys; they stay empty/null then. */
export type ConditionCaution = { condition: string; status: 'ok' | 'modify' | 'avoid' | 'ask_doctor' | null; change: string; source: string };

/** ADDITIONS E search block, camelCased. */
export type ExerciseSearchTags = {
  location: string[];
  bodyRegion: string[];
  goalTags: string[];
  intensity: string | null;
  noise: string | null;
  space: string | null;
  typicalMinutes: number | null;
  kcalPer10min70kg: number | null;
  difficulty1to5: number | null;
  cameraTrackable: boolean | null;
};

export type ExerciseData = {
  id: string;
  /** Item number in its section's research list (Home 1, Gym 5…). */
  number: number | null;
  name: string;
  otherNames: string[];
  section: ExerciseSection | null;
  type: ExerciseType | null;
  equipment: string[];
  noEquipmentAlternative: string | null;
  musclesPrimary: string[];
  musclesSecondary: string[];
  level: ExerciseLevel | null;
  impact: 'low' | 'high' | null;
  flatFriendly: boolean | null;
  /** Compendium MET used by default (official value: never averaged). */
  met: number | null;
  /** Compendium code of `met`, when section 10 names it. */
  compendiumCode: string | null;
  metOptions: MetOption[];
  prescriptions: Prescription[];
  /** Free-form in the research schema (machine settings differ per machine), so kept as the raw snake_case object. */
  cardioSettings: Record<string, unknown> | null;
  repCounter: RepCounter | null;
  formChecks: FormCheck[];
  safetyFlags: string[];
  progressions: string[];
  regressions: string[];
  videoShots: VideoShot[];
  lastResearched: string | null;
  setupSteps: string[];
  steps: ExerciseStep[];
  commonMistakes: CommonMistake[];
  /** "### 9. Safety" bullets in plain text. */
  safetyNotes: string[];
  sources: string[];
  burnMinutes: { per100kcal: Record<string, number | null>; per300kcal: Record<string, number | null> } | null;
  gymAccess: string[];
  suitsPreferences: string[];
  swapsByAccess: Record<string, string> | null;
  conditionCautions: ConditionCaution[];
  searchTags: ExerciseSearchTags | null;
};

export type Exercise = Provenance &
  ExerciseData & {
    /** Search/filter tags (SPEC-ADDENDA §9), derived only from the fields above; see exerciseTags(). */
    tags: string[];
    /** Validators' findings; listed under "needs review" in the DATA SYNC REPORT. */
    needsReview: string[];
  };

export type GuidanceRule = { if: string; then: string; source: string | null };

/** KNOWLEDGE TEMPLATE items (Gym 1–4) and the Gym 50 plan. */
export type GuidanceData = {
  id: string;
  number: number | null;
  type: 'knowledge' | 'plan';
  name: string;
  section: ExerciseSection | null;
  /** "### 1. Key takeaways". */
  keyTakeaways: string[];
  /** "### 3. Beginner mistakes and how to avoid them". */
  mistakes: string[];
  /** "### 4. How the app should use this", as plain list items. */
  appGuidance: string[];
  rules: GuidanceRule[];
  /** Plan items only: the "weeks" array as written (snake_case), adopted whole. */
  weeks: unknown[] | null;
  sources: string[];
  lastResearched: string | null;
};

export type Guidance = Provenance &
  GuidanceData & {
    tags: string[];
    needsReview: string[];
  };
```

### `src/services/data/dietTags.ts`

```ts
/**
 * Dish research PATCH 03 and 04 blocks (from the 2026-10-12 dish file on):
 * the "**Diet tags**" lines in Quick facts, the "Tags:" line and description
 * sentence under the heading, and the "**Diet variants**" block at the end of
 * the micro-steps. Pure parsers; older files without the blocks give null or [].
 *
 * These are what research SAYS. The tag engine (tags.ts) only turns a line into
 * a tag after the Day 04 allergen and fasting checks agree with the recipe.
 */
import type { AllergenId, DietLine, DietTagLines, DishVariant } from '../../models/research';
import { bullets, plain } from './markdown';

const EMPTY: DietLine = { status: null, reason: null };

function parseLine(value: string): DietLine {
  // "Yes — reason", "With changes — reason", "Not found — reason"
  const m = /^\s*(yes|no|with changes|not found)\b\s*(?:[—–:-]+\s*)?(.*)$/i.exec(value);
  if (!m) return { status: null, reason: value.trim() || null };
  const word = m[1].toLowerCase();
  const status = word === 'yes' ? 'yes' : word === 'no' ? 'no' : word === 'with changes' ? 'with-changes' : null;
  return { status, reason: m[2].trim() || null };
}

/** Research allergen words → FitPlate allergen ids (Day 04 list). */
const DECLARED: [RegExp, AllergenId][] = [
  [/\b(dairy|milk|ghee|butter|paneer|curd|cream)\b/i, 'milk'],
  [/\begg/i, 'egg'],
  [/\bgluten|wheat/i, 'gluten'],
  [/\bpeanut|groundnut/i, 'peanut'],
  [/\btree ?nuts?|cashew|almond|pistachio|walnut/i, 'treeNut'],
  [/\bsoy/i, 'soy'],
  [/\bsesame|\btil\b/i, 'sesame'],
  [/\bfish\b/i, 'fish'],
  [/\bshellfish|prawn|shrimp|crab/i, 'shellfish'],
  [/\bmustard/i, 'mustard'],
];

/** "dairy (ghee), tree nuts (cashew), gluten (only via compounded hing)" → ['milk', 'treeNut', 'gluten']. */
export function declaredAllergens(value: string): AllergenId[] {
  if (/none of the listed|^\s*none\b/i.test(value)) return [];
  const out: AllergenId[] = [];
  for (const part of value.split(/,(?![^(]*\))/)) {
    const head = part.replace(/\([^)]*\)/g, ' ');
    for (const [re, id] of DECLARED) if (re.test(head) && !out.includes(id)) out.push(id);
  }
  return out;
}

/** Reads the "**Diet tags**" block from a dish's Quick facts. Null when the file predates PATCH 03. */
export function parseDietTags(quickFacts: string): DietTagLines | null {
  const start = quickFacts.search(/\*\*Diet tags\*\*/i);
  if (start < 0) return null;
  // The block ends where the next bold heading (Fasting suitability) starts.
  const rest = quickFacts.slice(start + 'Diet tags'.length + 4);
  const end = rest.search(/\n\s*\*\*[^*\n]+\*\*\s*\n/);
  const block = end >= 0 ? rest.slice(0, end) : rest;
  const out: DietTagLines = {
    base: null,
    jain: EMPTY,
    vegan: EMPTY,
    pescatarian: EMPTY,
    sattvik: EMPTY,
    glutenFree: EMPTY,
    dairyFree: EMPTY,
    allergensDeclared: null,
  };
  let any = false;
  for (const item of bullets(block)) {
    const p = plain(item);
    const m = /^([^:]+):\s*(.*)$/.exec(p);
    if (!m) continue;
    const label = m[1].toLowerCase();
    const value = m[2].trim();
    any = true;
    if (/^base diet/.test(label)) out.base = value || null;
    else if (/^jain/.test(label)) out.jain = parseLine(value);
    else if (/^vegan/.test(label)) out.vegan = parseLine(value);
    else if (/^pescatarian/.test(label)) out.pescatarian = parseLine(value);
    else if (/onion|garlic|sattvi/.test(label)) out.sattvik = parseLine(value);
    else if (/^gluten/.test(label)) out.glutenFree = parseLine(value);
    else if (/^dairy/.test(label)) out.dairyFree = parseLine(value);
    else if (/allergen/.test(label)) out.allergensDeclared = declaredAllergens(value);
  }
  return any ? out : null;
}

/** Text of Quick facts without the Diet tags block, so its "Vegan: With changes" lines aren't read as claims. */
export function withoutDietTags(quickFacts: string): string {
  const start = quickFacts.search(/\*\*Diet tags\*\*/i);
  if (start < 0) return quickFacts;
  const rest = quickFacts.slice(start + 2);
  const end = rest.search(/\n\s*\*\*[^*\n]+\*\*\s*\n/);
  return quickFacts.slice(0, start) + (end >= 0 ? rest.slice(end) : '');
}

/**
 * The "Tags:" line and the description sentence under the dish heading (PATCH 04 A).
 * "Has variants: …" is split off; it is a list of variant categories, not tags of this recipe.
 */
export function parseTagsLine(headerText: string): { researchTags: string[]; variantCategories: string[]; description: string | null } | null {
  const lines = headerText.split('\n').map((l) => l.trim());
  const idx = lines.findIndex((l) => /^tags:/i.test(l));
  if (idx < 0) return null;
  const raw = lines[idx].replace(/^tags:\s*/i, '');
  const hv = raw.search(/has variants:/i);
  const tagPart = hv >= 0 ? raw.slice(0, hv) : raw;
  const variantPart = hv >= 0 ? raw.slice(hv).replace(/has variants:\s*/i, '') : '';
  const split = (s: string) =>
    s
      .split(/,(?![^(]*\))/)
      .map((t) => t.trim())
      .filter(Boolean);
  const next = lines.slice(idx + 1).find((l) => l.length > 0);
  const description = next && !next.startsWith('#') && !next.startsWith('|') && !next.startsWith('-') ? plain(next).trim() : null;
  return { researchTags: split(tagPart), variantCategories: split(variantPart), description };
}

/** The verdict opens the line ("Variant.", "Already fits — …", "Not appropriate — …"); anything else is detail. */
function variantStatus(text: string): DishVariant['status'] {
  const t = plain(text).trim();
  if (/^(already fits|main recipe already)/i.test(t)) return 'already-fits';
  if (/^(not appropriate|not possible)/i.test(t)) return 'not-appropriate';
  if (/^variant\b/i.test(t)) return 'variant';
  return null;
}

/**
 * The "**Diet variants**" block (PATCH 04 B). Two layouts exist: the variant
 * detail nested under its "- Jain: Variant." line, or summary lines first and
 * "**Jain variant: Name**" paragraphs after. Both give one entry per category.
 * Only the variant's identity is read; its recipe stays in the research file
 * until the variant UI (Day 6–7) needs it.
 */
export function parseVariants(stepsBody: string): DishVariant[] {
  const start = stepsBody.search(/\*\*Diet variants\*\*/i);
  if (start < 0) return [];
  const block = stepsBody.slice(start + '**Diet variants**'.length);
  const byCategory = new Map<string, DishVariant>();
  const key = (c: string) => c.toLowerCase().replace(/[^a-z]/g, '');
  // The detail heading most recently read; its "Origin:" line follows it.
  let current: DishVariant | null = null;

  for (const line of block.split('\n')) {
    // Summary line: "- Jain: Variant." / "- **Vegan:** Variant (below)." / "- Dairy-free: Already fits — …"
    const summary = /^-\s+(?:\*\*)?([A-Za-z][A-Za-z ()/-]*?)(?::\*\*|\*\*:|:)\s*(.*)$/.exec(line);
    if (summary && !/^\s/.test(line)) {
      const category = summary[1].trim();
      const status = variantStatus(summary[2]);
      if (status) {
        const reason = status === 'variant' ? null : plain(summary[2]).replace(/^(already fits|not appropriate|not possible)\s*[—–:-]*\s*/i, '').trim() || null;
        byCategory.set(key(category), { category, status, name: null, origin: null, linkedDishNumber: null, reason });
        continue;
      }
    }
    // Detail heading: "**Jain variant: Jain Ven Pongal (no ginger)**", possibly indented under its summary line.
    const head = /^\s*\*\*([^*:]+?) variant:\s*([^*]+)\*\*/i.exec(line);
    if (head) {
      const category = head[1].trim();
      const name = head[2].trim();
      const existing = [...byCategory.values()].find((v) => key(v.category) === key(category) || key(category).startsWith(key(v.category)) || key(v.category).startsWith(key(category)));
      const linked = /FitPlate dish (\d+)/i.exec(name);
      const entry: DishVariant = existing ?? { category, status: 'variant', name: null, origin: null, linkedDishNumber: null, reason: null };
      entry.name = name.replace(/\s*\(FitPlate dish \d+\)\s*/i, '').trim();
      entry.linkedDishNumber = linked ? Number(linked[1]) : null;
      entry.status = 'variant';
      byCategory.set(key(entry.category), entry);
      current = entry;
      continue;
    }
    // "- Origin: Established dish (…)" belongs to the most recent detail heading.
    const origin = /^\s*-\s*Origin:\s*(.*)$/i.exec(line);
    if (origin) {
      if (current && current.origin == null) current.origin = /fitplate-created/i.test(origin[1]) ? 'fitplate-created' : /established/i.test(origin[1]) ? 'established' : null;
    }
  }
  return [...byCategory.values()];
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
    else add(TAG.pescatarian);
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
 * Groups dishes into variant families. Research links ("Vegetarian variant:
 * Veg Fried Rice (FitPlate dish 10)") come first; otherwise dishes whose
 * names differ only by a version word share a family. A family needs at least
 * two dishes. Name matches are listed in the DATA SYNC REPORT for checking.
 */
export function assignFamilies(dishes: Pick<Dish, 'id' | 'number' | 'name' | 'variants'>[]): { familyOf: Map<string, string>; links: FamilyLink[] } {
  const byNumber = new Map(dishes.map((d) => [d.number, d]));
  const groups = new Map<string, { ids: Set<string>; how: FamilyLink['how'] }>();
  const put = (key: string, id: string, how: FamilyLink['how']) => {
    const g = groups.get(key) ?? { ids: new Set<string>(), how };
    g.ids.add(id);
    if (how === 'research-variant') g.how = how;
    groups.set(key, g);
  };
  for (const d of dishes) put(familyKey(d.name), d.id, 'name');
  for (const d of dishes) {
    for (const v of d.variants) {
      const other = v.linkedDishNumber != null ? byNumber.get(v.linkedDishNumber) : undefined;
      if (other && other.id !== d.id) {
        const key = familyKey(d.name);
        put(key, d.id, 'research-variant');
        put(key, other.id, 'research-variant');
      }
    }
  }
  const familyOf = new Map<string, string>();
  const links: FamilyLink[] = [];
  for (const [key, g] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (g.ids.size < 2 || !key) continue;
    const ids = [...g.ids].sort();
    for (const id of ids) if (!familyOf.has(id)) familyOf.set(id, key);
    links.push({ familyId: key, dishIds: ids, how: g.how });
  }
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
const NOT_A_NAME = /\b(optional|for|e|g|eg|or|and|any|about|approx|fat|chopped|sliced|diced|petals|store|bought|homemade|amul|mdh|everest|tata|catch|brand|see|step|plus|extra|to|taste)\b/;

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
import { DEFAULT_TARGET_GROUPS, TARGET_GROUPS } from '../../models/nutrient';
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

function readCondition(o: Obj, id: string, title: string, type: HealthConditionData['type'], r: Reader): HealthConditionData {
  const water = isObj(o.water_ml) ? o.water_ml : null;
  return {
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
    // Missing means "not stated", which is not the same as "safe without a doctor"; the build ORs versions.
    requiresDoctorInput: r.bool(o, 'requires_doctor_input') ?? false,
    warnings: r.strs(o, 'warnings'),
    lastResearched: r.strOrNull(o, 'last_researched'),
  };
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

  const requiresDoctorInput = versions.some((v) => v.data.requiresDoctorInput);
  if (requiresDoctorInput && !latest.data.requiresDoctorInput) {
    log.notes.push('requiresDoctorInput: an older version requires doctor input and the newest does not explain why; kept true (safety first)');
  }
  log.method.targets = 'official (D3); max as safety limit';
  log.method.limits = 'safety limit (lower on conflict)';
  log.method.lists = 'union';
  log.method.requiresDoctorInput = 'any version';

  return {
    id: latest.id,
    type: latest.data.type,
    name: newestText(versions, (v) => v.data.name) ?? latest.title,
    surveyQuestion: newestText(versions, (v) => v.data.surveyQuestion),
    targets,
    bloodMarkers: unionBy(versions.map((v) => v.data.bloodMarkers), (b: BloodMarker) => slugify(b.marker)),
    waterMl,
    sodiumMgMax: safety((d) => d.sodiumMgMax, 'sodiumMgMax'),
    dietaryCholesterolMgMax: safety((d) => d.dietaryCholesterolMgMax, 'dietaryCholesterolMgMax'),
    foodsFavour: unionList(...versions.map((v) => v.data.foodsFavour)),
    foodsLimit: unionList(...versions.map((v) => v.data.foodsLimit)),
    goodFitDishes: unionBy(versions.map((v) => v.data.goodFitDishes), dishKey),
    cautionDishes: unionBy(versions.map((v) => v.data.cautionDishes), dishKey),
    conflictsWith: unionBy(versions.map((v) => v.data.conflictsWith), (c) => `${c.profileId}|${normText(c.rule)}`),
    requiresDoctorInput,
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

### `src/services/data/exerciseImporter.ts`

```ts
/**
 * Fitness importer (roadmap Day 5). Each fitness research file has one
 * "## Home N." / "## Yoga & Stretch N." / "## Gym N." section per item, each
 * with one JSON block. The JSON's "type" routes the item: movement types
 * become exercises, "knowledge" and "plan" become guidance. The JSON is the
 * backbone; a few markdown sections (setup, steps, mistakes, safety, calories,
 * sources) are read for data the JSON does not carry.
 *
 * Validators never fix research data: they flag it as needsReview so the
 * research prompt gets fixed at the source (spec G; review 2026-10-11).
 */
import {
  EXERCISE_GOALS,
  EXERCISE_LEVELS,
  EXERCISE_SECTIONS,
  EXERCISE_TYPES,
  type AngleRule,
  type CommonMistake,
  type ConditionCaution,
  type Exercise,
  type ExerciseData,
  type ExerciseSearchTags,
  type ExerciseSection,
  type ExerciseStep,
  type FormCheck,
  type Guidance,
  type GuidanceData,
  type GuidanceRule,
  type MetOption,
  type Prescription,
  type RepCounter,
  type RepPhase,
  type VideoShot,
} from '../../models/exercise';
import { fileDate } from './dishImporter';
import { normaliseId } from './ingredientImporter';
import { plain, splitHeadings, type Section } from './markdown';
import { adoptWhole, mergeOfficial, mergeStable, unionList, type Completeness, type OfficialVersion } from './merge';

/** Per-version bookkeeping the merge needs; not part of the merged item. */
type VersionMeta = {
  date: string;
  file: string;
  /** Section 15/6 source count and "Not found" count: the completeness test for adopt-whole (D4). */
  sourcesCount: number;
  notFoundCount: number;
  /** Whether section 10 cites the Compendium for this version's own MET (D3 tie-break). */
  metCitesCompendium: boolean;
  /** Problems seen while parsing this version (e.g. missing disclaimer). */
  parseNotes: string[];
};

export type ExerciseVersion = ExerciseData & VersionMeta & { kind: 'exercise' };
export type GuidanceVersion = GuidanceData & VersionMeta & { kind: 'guidance' };
export type FitnessParse = { items: (ExerciseVersion | GuidanceVersion)[]; errors: string[] };

// ---------------------------------------------------------------- JSON field readers

type Json = Record<string, unknown>;

function isObj(v: unknown): v is Json {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}
function numOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function boolOrNull(v: unknown): boolean | null {
  return typeof v === 'boolean' ? v : null;
}
function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(str).filter((s): s is string => s !== null) : [];
}
function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null;
}
function objList(v: unknown): Json[] {
  return Array.isArray(v) ? v.filter(isObj) : [];
}

// ---------------------------------------------------------------- angles

/**
 * Parses a rep-counter threshold: ">= 160", "<= 110", "< 10", "70-110",
 * "165–195 deg". Anything else (ratios, "n/a (position check)", prose) is
 * null, because the counter must never guess what a phase means.
 */
export function parseAngle(raw: string): AngleRule | null {
  const text = raw.replace(/\(est\.?\)/gi, '').trim();
  // A number that is explicitly not an angle must not be read as one.
  if (/ratio|not degrees|%|\bcm\b|\bpx\b/i.test(text)) return null;
  const unit = '\\s*(?:°|deg(?:rees)?)?';
  const cmp = new RegExp(`^(>=|<=|>|<|≥|≤)\\s*(\\d+(?:\\.\\d+)?)${unit}\\s*(?:\\([^)]*\\))?$`, 'i').exec(text);
  if (cmp) {
    const op = cmp[1] === '≥' ? '>=' : cmp[1] === '≤' ? '<=' : (cmp[1] as AngleRule['op']);
    return { op, value: Number(cmp[2]), max: null };
  }
  const range = new RegExp(`^(\\d+(?:\\.\\d+)?)${unit}\\s*(?:[–-]|to)\\s*(\\d+(?:\\.\\d+)?)${unit}\\s*(?:\\([^)]*\\))?$`, 'i').exec(text);
  if (range) {
    const lo = Number(range[1]);
    const hi = Number(range[2]);
    return lo <= hi ? { op: 'between', value: lo, max: hi } : null;
  }
  return null;
}

// ---------------------------------------------------------------- JSON → model

function prescriptionOf(p: Json): Prescription {
  return {
    level: oneOf(p.level, EXERCISE_LEVELS),
    goal: oneOf(p.goal, EXERCISE_GOALS),
    sets: numOrNull(p.sets),
    reps: str(p.reps),
    timeSec: numOrNull(p.time_sec),
    restSec: numOrNull(p.rest_sec),
    tempo: str(p.tempo),
    perWeek: numOrNull(p.per_week),
  };
}

function repCounterOf(v: unknown): RepCounter | null {
  if (!isObj(v)) return null;
  const phases: RepPhase[] = objList(v.phases).map((p) => {
    const angleDeg = typeof p.angle_deg === 'string' ? p.angle_deg.trim() : typeof p.angle_deg === 'number' ? String(p.angle_deg) : '';
    return { name: str(p.name) ?? '', joint: str(p.joint) ?? '', angleDeg, parsed: angleDeg ? parseAngle(angleDeg) : null };
  });
  return {
    mode: oneOf(v.mode, ['reps', 'hold_timer', 'none'] as const),
    cameraView: oneOf(v.camera_view, ['side', 'front', 'either'] as const),
    landmarks: strList(v.landmarks),
    phases,
    minRepSec: numOrNull(v.min_rep_sec),
  };
}

function numRecord(v: unknown): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  if (isObj(v)) for (const [k, x] of Object.entries(v)) out[k] = numOrNull(x);
  return out;
}

function searchTagsOf(v: unknown): ExerciseSearchTags | null {
  if (!isObj(v)) return null;
  return {
    location: strList(v.location),
    bodyRegion: strList(v.body_region),
    goalTags: strList(v.goal_tags),
    intensity: str(v.intensity),
    noise: str(v.noise),
    space: str(v.space),
    typicalMinutes: numOrNull(v.typical_minutes),
    kcalPer10min70kg: numOrNull(v.kcal_per_10min_70kg),
    difficulty1to5: numOrNull(v.difficulty_1to5),
    cameraTrackable: boolOrNull(v.camera_trackable),
  };
}

// ---------------------------------------------------------------- markdown sections

/**
 * Items of a markdown list: numbered ("1. ") or bulleted ("- ") lines at
 * column 0, with indented lines appended. Plain text, bold removed.
 */
export function listItems(body: string): { head: string; sub: string[] }[] {
  const out: { head: string; sub: string[] }[] = [];
  for (const line of body.split('\n')) {
    const top = /^(?:\d+\.|[-*])\s+(.*)$/.exec(line);
    if (top) {
      out.push({ head: plain(top[1]).trim(), sub: [] });
      continue;
    }
    const nested = /^\s+(?:\d+\.|[-*])\s+(.*)$/.exec(line);
    if (nested && out.length > 0) out[out.length - 1].sub.push(plain(nested[1]).trim());
    else if (/^\s{2,}\S/.test(line) && out.length > 0) out[out.length - 1].head += ' ' + plain(line).trim();
  }
  return out;
}

function joined(item: { head: string; sub: string[] }): string {
  return [item.head, ...item.sub].join(' ').replace(/\s+/g, ' ').trim();
}

const STEP_LABELS: [keyof Pick<ExerciseStep, 'action' | 'feel' | 'breathing' | 'tempo' | 'visualCheck'>, RegExp][] = [
  ['action', /^action\s*:\s*/i],
  ['feel', /^(?:feel|what you should feel|body cue)\s*:\s*/i],
  ['breathing', /^(?:breathing|breathe|breath)(?: cue)?\s*:\s*/i],
  ['tempo', /^(?:tempo(?: or time)?|time)\s*:\s*/i],
  ['visualCheck', /^visual check\s*:\s*/i],
];

/**
 * "### 4. Step-by-step execution". The files use "1. **Title**" lines or
 * "**Step 1. Title**" lines, each followed by "Action / Feel / Breathing /
 * Tempo / Visual check" bullets, sometimes grouped under bold part headings.
 */
export function parseSteps(body: string): ExerciseStep[] {
  const steps: ExerciseStep[] = [];
  let part: string | null = null;
  let cur: ExerciseStep | null = null;
  const start = (title: string) => {
    cur = { n: steps.length + 1, part, title: title.replace(/[.:]\s*$/, '').trim(), action: null, feel: null, breathing: null, tempo: null, visualCheck: null };
    steps.push(cur);
  };
  for (const line of body.split('\n')) {
    const t = line.trim();
    const stepHeading = /^\*\*Step\s+\d+[.:]?\s*(.*?)\*\*\s*$/i.exec(t);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (stepHeading) start(plain(stepHeading[1]));
    else if (numbered) start(plain(numbered[1]).trim());
    else if (/^\*\*[^*]+\*\*\s*$/.test(t)) {
      // A bold-only line is a part heading ("**A. Front (forearm) plank**"); it also closes the step above.
      part = plain(t).replace(/[.:]\s*$/, '').trim();
      cur = null;
    } else if (bullet && cur) {
      const text = plain(bullet[1]).trim();
      const step: ExerciseStep = cur;
      for (const [key, re] of STEP_LABELS) {
        if (re.test(text)) {
          step[key] = text.replace(re, '').trim() || null;
          break;
        }
      }
    }
  }
  return steps;
}

function parseMistakes(body: string): CommonMistake[] {
  // Read raw lines (not listItems) so the bold lead-in survives as the title.
  const out: CommonMistake[] = [];
  for (const line of body.split('\n')) {
    const top = /^(?:\d+\.|[-*])\s+(.*)$/.exec(line);
    const nested = /^\s+(?:\d+\.|[-*])\s+(.*)$/.exec(line);
    if (top) {
      const bold = /^\*\*(.+?)\*\*/.exec(top[1].trim());
      out.push({ title: bold ? plain(bold[1]).replace(/[.:]\s*$/, '').trim() : null, text: plain(top[1]).trim() });
    } else if (nested && out.length > 0) {
      out[out.length - 1].text += ' ' + plain(nested[1]).trim();
    }
  }
  return out;
}

/**
 * Compendium rows in "### 10. Calories": a table with Code and MET columns,
 * or lines that pair a 5-digit code with a MET value ("02022 – …: 3.8 METs",
 * "MET: 2.3, … code 02101"). The nearest code to each MET value wins, so a
 * notes line listing several codes still pairs them correctly.
 */
export function parseMetOptions(body: string): MetOption[] {
  const out: MetOption[] = [];
  const lines = body.split('\n');
  let header: string[] | null = null;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('|')) {
      const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => plain(c).trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === '')) continue;
      if (header === null) {
        header = cells;
        continue;
      }
      const codeAt = header.findIndex((h) => /^code$/i.test(h));
      const metAt = header.findIndex((h) => /^METs?$/i.test(h));
      if (codeAt < 0 || metAt < 0) continue;
      const met = Number(cells[metAt]);
      if (!Number.isFinite(met)) continue;
      out.push({ code: /^\d{5}$/.test(cells[codeAt]) ? cells[codeAt] : null, met, activity: cells[0] });
      continue;
    }
    header = null;
    const text = plain(t).replace(/^[-*]\s+/, '');
    const metRe = /\bMET\s*:\s*(\d+(?:\.\d+)?)\b|(\d+(?:\.\d+)?)\s*METs?\b/g;
    let m: RegExpExecArray | null;
    while ((m = metRe.exec(text))) {
      const met = Number(m[1] ?? m[2]);
      const codes = [...text.matchAll(/\b(\d{5})\b/g)].map((c) => ({ code: c[1], at: c.index ?? 0 }));
      if (codes.length === 0) continue;
      const before = codes.filter((c) => c.at < m!.index).pop();
      const after = codes.find((c) => c.at > m!.index);
      // "N METs" follows its code; "MET: N" comes before it.
      const pick = m[1] !== undefined ? (after ?? before) : (before ?? after);
      if (!pick || Math.abs(pick.at - m.index) > 200) continue;
      if (!out.some((o) => o.code === pick.code && o.met === met)) out.push({ code: pick.code, met, activity: text.slice(0, 200) });
    }
  }
  return out;
}

function subsection(sections: Section[], n: number, hint: RegExp): string {
  return (sections.find((s) => hint.test(s.title)) ?? sections.find((s) => s.n === n))?.body ?? '';
}

function sourcesOf(body: string): string[] {
  return unionList(listItems(body).map(joined));
}

// ---------------------------------------------------------------- file parser

const ITEM_HEADING = /^(Home|Yoga\s*&\s*Stretch(?:ing)?|Gym)\s+(\d+)\.\s+(.+)$/i;

function sectionOfLabel(label: string): ExerciseSection {
  if (/^home/i.test(label)) return 'home';
  if (/^gym/i.test(label)) return 'gym';
  return 'yoga_stretch';
}

/** Name without the bracketed other names: "Push-up (press-up; …)" → "Push-up". */
function headingName(title: string): string {
  const i = title.indexOf(' (');
  return (i > 0 ? title.slice(0, i) : title).trim();
}

const DISCLAIMER = /not medical advice/i;

function parseExercise(j: Json, block: Section, label: string, number: number, meta: Omit<VersionMeta, 'metCitesCompendium' | 'parseNotes'>): ExerciseVersion {
  const sub = splitHeadings(block.body, 3);
  const notes: string[] = [];
  const met = numOrNull(j.met);
  const metOptions = parseMetOptions(subsection(sub, 10, /calorie/i));
  const caloriesText = subsection(sub, 10, /calorie/i);
  const kept = met === null ? undefined : metOptions.find((o) => o.met === met && o.code);
  const metCitesCompendium = kept !== undefined && /compendium/i.test(caloriesText);

  const section = oneOf(j.section, EXERCISE_SECTIONS);
  if (j.section != null && section === null) notes.push(`unknown section "${String(j.section)}"`);
  if (section !== null && section !== sectionOfLabel(label)) notes.push(`JSON section "${section}" differs from heading "${label}"`);
  const type = oneOf(j.type, EXERCISE_TYPES);
  const lastResearched = str(j.last_researched);
  if (lastResearched && lastResearched !== meta.date) notes.push(`last_researched ${lastResearched} differs from file date ${meta.date}`);
  if (!DISCLAIMER.test(block.body)) notes.push('no "General information, not medical advice" line');
  for (const p of objList(j.prescriptions)) if (p.goal != null && oneOf(p.goal, EXERCISE_GOALS) === null) notes.push(`prescription goal "${String(p.goal)}" not an allowed value`);

  const formChecks: FormCheck[] = objList(j.form_checks).map((f) => ({ joint: str(f.joint) ?? '', rule: str(f.rule) ?? '', message: str(f.message) ?? '' }));
  const videoShots: VideoShot[] = objList(j.video_shots).map((v) => ({
    seconds: numOrNull(v.seconds),
    angle: str(v.angle) ?? '',
    shows: str(v.shows) ?? '',
    textOverlay: str(v.text_overlay) ?? '',
  }));
  const cautions: ConditionCaution[] = objList(j.condition_cautions).map((c) => ({
    condition: str(c.condition) ?? '',
    status: oneOf(c.status, ['ok', 'modify', 'avoid', 'ask_doctor'] as const),
    change: str(c.change) ?? '',
    source: str(c.source) ?? '',
  }));
  const burn = isObj(j.burn_minutes) ? { per100kcal: numRecord(j.burn_minutes.per_100kcal), per300kcal: numRecord(j.burn_minutes.per_300kcal) } : null;
  const swaps = isObj(j.swaps_by_access)
    ? Object.fromEntries(Object.entries(j.swaps_by_access).filter((e): e is [string, string] => typeof e[1] === 'string'))
    : null;
  const sources = sourcesOf(subsection(sub, 15, /^sources/i));

  return {
    kind: 'exercise',
    ...meta,
    sourcesCount: sources.length,
    metCitesCompendium,
    parseNotes: notes,
    id: normaliseId(String(j.id)),
    number,
    name: str(j.name) ?? headingName(block.title.replace(ITEM_HEADING, '$3')),
    otherNames: strList(j.other_names),
    section: section ?? sectionOfLabel(label),
    type,
    equipment: strList(j.equipment),
    noEquipmentAlternative: str(j.no_equipment_alternative),
    musclesPrimary: strList(j.muscles_primary),
    musclesSecondary: strList(j.muscles_secondary),
    level: oneOf(j.level, EXERCISE_LEVELS),
    impact: oneOf(j.impact, ['low', 'high'] as const),
    flatFriendly: boolOrNull(j.flat_friendly),
    met,
    compendiumCode: kept?.code ?? null,
    metOptions,
    prescriptions: objList(j.prescriptions).map(prescriptionOf),
    cardioSettings: isObj(j.cardio_settings) ? j.cardio_settings : null,
    repCounter: repCounterOf(j.rep_counter),
    formChecks,
    safetyFlags: strList(j.safety_flags),
    progressions: strList(j.progressions),
    regressions: strList(j.regressions),
    videoShots,
    lastResearched,
    setupSteps: listItems(subsection(sub, 3, /^setup/i)).map(joined),
    steps: parseSteps(subsection(sub, 4, /step-by-step|execution/i)),
    commonMistakes: parseMistakes(subsection(sub, 6, /mistakes/i)),
    safetyNotes: listItems(subsection(sub, 9, /^safety/i)).map(joined),
    sources,
    burnMinutes: burn,
    gymAccess: strList(j.gym_access),
    suitsPreferences: strList(j.suits_preferences),
    swapsByAccess: swaps,
    conditionCautions: cautions,
    searchTags: searchTagsOf(j.search_tags),
  };
}

function parseGuidance(j: Json, block: Section, label: string, number: number, meta: Omit<VersionMeta, 'metCitesCompendium' | 'parseNotes'>): GuidanceVersion {
  const sub = splitHeadings(block.body, 3);
  const notes: string[] = [];
  const type = j.type === 'plan' ? 'plan' : 'knowledge';
  const lastResearched = str(j.last_researched);
  if (lastResearched && lastResearched !== meta.date) notes.push(`last_researched ${lastResearched} differs from file date ${meta.date}`);
  const rules: GuidanceRule[] = objList(j.rules).map((r) => ({ if: str(r.if) ?? '', then: str(r.then) ?? '', source: str(r.source) }));
  const sources = sourcesOf(subsection(sub, 6, /^sources/i));
  const titleMatch = ITEM_HEADING.exec(block.title);
  return {
    kind: 'guidance',
    ...meta,
    sourcesCount: sources.length,
    metCitesCompendium: false,
    parseNotes: notes,
    id: normaliseId(String(j.id)),
    number,
    type,
    name: str(j.name) ?? (titleMatch ? titleMatch[3].trim() : block.title),
    section: sectionOfLabel(label),
    keyTakeaways: listItems(subsection(sub, 1, /takeaways/i)).map(joined),
    mistakes: listItems(subsection(sub, 3, /mistakes/i)).map(joined),
    appGuidance: listItems(subsection(sub, 4, /app should use/i)).map(joined),
    rules,
    weeks: Array.isArray(j.weeks) ? j.weeks : null,
    sources,
    lastResearched,
  };
}

/** Parses every item in one fitness research file. Malformed or unroutable JSON is reported, never guessed. */
export function parseFitnessFile(text: string, file: string): FitnessParse {
  const date = fileDate(file);
  if (!date) throw new Error(`No date in file name: ${file}`);
  const items: (ExerciseVersion | GuidanceVersion)[] = [];
  const errors: string[] = [];

  for (const block of splitHeadings(text, 2)) {
    const heading = ITEM_HEADING.exec(block.title);
    // Summary, burn-off and sample-session sections are not items.
    if (!heading) continue;
    const where = `${file} › ${heading[1]} ${heading[2]}`;
    const jsons = [...block.body.matchAll(/```json\s*\n([\s\S]*?)\n```/g)];
    if (jsons.length === 0) {
      errors.push(`${where}: no JSON block`);
      continue;
    }
    if (jsons.length > 1) errors.push(`${where}: ${jsons.length} JSON blocks; used the first`);
    let j: unknown;
    try {
      j = JSON.parse(jsons[0][1]);
    } catch (e) {
      errors.push(`${where}: malformed JSON: ${(e as Error).message}`);
      continue;
    }
    if (!isObj(j) || typeof j.id !== 'string' || j.id.trim() === '') {
      errors.push(`${where}: JSON has no id`);
      continue;
    }
    const meta = { date, file, sourcesCount: 0, notFoundCount: (block.body.match(/not found/gi) ?? []).length };
    const number = Number(heading[2]);
    if (j.type === 'knowledge' || j.type === 'plan') items.push(parseGuidance(j, block, heading[1], number, meta));
    else if (oneOf(j.type, EXERCISE_TYPES)) items.push(parseExercise(j, block, heading[1], number, meta));
    else errors.push(`${where}: unknown JSON type "${String(j.type)}"`);
  }
  return { items, errors };
}

// ---------------------------------------------------------------- tags (SPEC-ADDENDA §9)

/**
 * Muscle groups for the "muscle group" filter, matched against PRIMARY
 * muscles only (secondary ones would put nearly every item in every group).
 * Order matters: the first group whose pattern matches a muscle wins.
 */
const MUSCLE_GROUPS: [string, RegExp][] = [
  ['Heart & lungs', /cardio|heart|lung/i],
  ['Neck', /neck|sternocleidomastoid|scalene|levator scapulae|suboccipital|upper trapezius/i],
  ['Chest', /pector/i],
  ['Shoulders', /deltoid|rotator cuff|serratus|shoulder/i],
  ['Arms', /biceps brachii|triceps|brachialis|forearm|wrist|\bbiceps\b(?! femoris)/i],
  ['Back', /latissimus|rhomboid|trapezius|erector spinae|teres|upper back/i],
  ['Core', /abdomin|oblique|quadratus lumborum|\bcore\b/i],
  ['Glutes', /glute/i],
  ['Hips', /hip flexor|iliopsoas|psoas|iliacus|tensor fasciae/i],
  ['Legs', /quadricep|hamstring|calf|calves|gastrocnemius|soleus|adductor|abductor|tibialis|rectus femoris|sartorius/i],
];

const PLACE: Record<ExerciseSection, string> = { home: 'Home', gym: 'Gym', yoga_stretch: 'Yoga & stretch' };
const TYPE_TAG: Record<string, string> = { strength: 'Strength', cardio: 'Cardio', mobility: 'Mobility', yoga_asana: 'Yoga', pranayama: 'Pranayama' };
const LOCATION_TAG: Record<string, string> = { home: 'Home', gym: 'Gym', outdoor: 'Outdoors', office_desk: 'Office desk' };

/**
 * Search tags, derived only from research fields (never guessed):
 * - Place: the research section (Home / Gym / Yoga & stretch), plus any
 *   ADDITIONS E search_tags.location (adds Outdoors / Office desk when given).
 * - "No equipment": the equipment list is empty or every entry says optional.
 * - "Flat-friendly" and "Quiet": flat_friendly is true. The template asks
 *   "Flat-friendly and quiet?" as one question, so one answer covers both;
 *   when search_tags.noise exists it decides "Quiet" instead.
 * - Level, impact ("Low impact" / "High impact") and type, as written.
 * - Muscle groups: MUSCLE_GROUPS over the primary muscles.
 * - Camera: "Rep counter" (mode reps) or "Hold timer" (mode hold_timer).
 * - Duration band from search_tags.typical_minutes, when present:
 *   "Under 10 min" / "10–20 min" / "20–30 min" / "30+ min".
 */
export function exerciseTags(e: ExerciseData): string[] {
  const tags: string[] = [];
  if (e.section) tags.push(PLACE[e.section]);
  for (const loc of e.searchTags?.location ?? []) if (LOCATION_TAG[loc]) tags.push(LOCATION_TAG[loc]);
  if (e.equipment.every((x) => /optional/i.test(x))) tags.push('No equipment');
  if (e.flatFriendly === true) tags.push('Flat-friendly');
  const quiet = e.searchTags?.noise ? e.searchTags.noise === 'quiet' : e.flatFriendly === true;
  if (quiet) tags.push('Quiet');
  if (e.level) tags.push(e.level[0].toUpperCase() + e.level.slice(1));
  if (e.impact) tags.push(e.impact === 'low' ? 'Low impact' : 'High impact');
  if (e.type) tags.push(TYPE_TAG[e.type]);
  for (const muscle of e.musclesPrimary) {
    const group = MUSCLE_GROUPS.find(([, re]) => re.test(muscle));
    if (group) tags.push(group[0]);
  }
  if (e.repCounter?.mode === 'reps') tags.push('Rep counter');
  if (e.repCounter?.mode === 'hold_timer') tags.push('Hold timer');
  const mins = e.searchTags?.typicalMinutes;
  if (mins != null) tags.push(mins < 10 ? 'Under 10 min' : mins < 20 ? '10–20 min' : mins < 30 ? '20–30 min' : '30+ min');
  return unionList(tags);
}

/** Guidance tags: its place, "Guide" or "Plan". */
export function guidanceTags(g: GuidanceData): string[] {
  return unionList([g.section ? PLACE[g.section] : null, g.type === 'plan' ? 'Plan' : 'Guide'].filter((t): t is string => t !== null));
}

// ---------------------------------------------------------------- burn-off

/**
 * Minutes of an activity needed to burn `kcal` (SPEC-ADDENDA §8 burn-off).
 * Compendium formula: kcal = MET × weight (kg) × hours, so
 * minutes = kcal ÷ (MET × kg ÷ 60). The research assumes 70 kg until the
 * profile weight exists. Throws on nonsense input instead of showing it.
 */
export function burnOffMinutes(kcal: number, met: number, weightKg = 70): number {
  if (!Number.isFinite(kcal) || kcal < 0) throw new Error(`burnOffMinutes: kcal must be ≥ 0, got ${kcal}`);
  if (!Number.isFinite(met) || met <= 0) throw new Error(`burnOffMinutes: MET must be > 0, got ${met}`);
  if (!Number.isFinite(weightKg) || weightKg <= 0) throw new Error(`burnOffMinutes: weight must be > 0, got ${weightKg}`);
  return kcal / ((met * weightKg) / 60);
}

// ---------------------------------------------------------------- validators

/** Plausible MET range: resting is 1.0; the 2024 Compendium tops out below 20 for sustainable activities. */
const MET_MIN = 1;
const MET_MAX = 20;
/** ACSM: moderate intensity ≈ 5–6 on the 0–10 scale (Borg 12–13). Review 2026-10-11. */
const ACSM_MODERATE_RPE10_MIN = 5;

function rangeOf(text: string): { lo: number; hi: number } | null {
  const m = /(\d+(?:\.\d+)?)\s*(?:[–-]\s*(\d+(?:\.\d+)?))?/.exec(text);
  if (!m) return null;
  const lo = Number(m[1]);
  return { lo, hi: m[2] ? Number(m[2]) : lo };
}

/** Every object inside the cardio settings, with the key it sits under. */
function walk(v: unknown, key: string, out: { key: string; obj: Json }[]): void {
  if (Array.isArray(v)) for (const x of v) walk(x, key, out);
  else if (isObj(v)) {
    out.push({ key, obj: v });
    for (const [k, x] of Object.entries(v)) walk(x, k, out);
  }
}

/**
 * Cardio checks that use only the item's own data:
 * - the default MET should match the Compendium row (section 10) for the
 *   beginner speed in cardio_settings, or the met_<intensity> the settings give;
 * - a "moderate" band should not be given as RPE below 5/10 (ACSM mapping).
 */
function cardioChecks(e: ExerciseData): string[] {
  const out: string[] = [];
  const cs = e.cardioSettings;
  if (!cs) return out;
  const nodes: { key: string; obj: Json }[] = [];
  walk(cs, '', nodes);

  const beginner = nodes.find((n) => n.obj.level === 'beginner')?.obj ?? (isObj(cs.beginner) ? cs.beginner : null);
  if (e.met !== null && beginner) {
    const speed = typeof beginner.speed_kmh === 'string' ? rangeOf(beginner.speed_kmh) : null;
    const mode = typeof beginner.mode === 'string' ? (/walk/i.test(beginner.mode) ? /walk/i : /run/i.test(beginner.mode) ? /run/i : null) : null;
    if (speed) {
      const mid = (speed.lo + speed.hi) / 2;
      const row = e.metOptions.find((o) => {
        const r = /(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*km\/h/i.exec(o.activity);
        return r !== null && (!mode || mode.test(o.activity)) && mid >= Number(r[1]) && mid <= Number(r[2]);
      });
      if (row && row.met !== e.met) {
        out.push(
          `MET ${e.met} does not match the beginner settings (${String(beginner.speed_kmh)} km/h): its own Compendium row ${row.code ?? ''} gives ${row.met}`.replace('  ', ' '),
        );
      }
    }
    const intensity = typeof beginner.intensity === 'string' ? beginner.intensity : typeof beginner.talk_test === 'string' && /cannot sing/i.test(beginner.talk_test) ? 'moderate' : null;
    const declared = intensity ? numOrNull(cs[`met_${intensity}`]) : null;
    if (declared !== null && declared !== e.met) out.push(`MET ${e.met} does not match the beginner intensity (${intensity}), which cardio_settings gives as ${declared}`);
  }

  for (const { key, obj } of nodes) {
    const rpe = typeof obj.rpe_0_10 === 'string' ? obj.rpe_0_10 : null;
    if (!rpe) continue;
    const moderate = key === 'moderate' || obj.intensity === 'moderate' || (typeof obj.talk_test === 'string' && /cannot sing/i.test(obj.talk_test));
    const r = rangeOf(rpe);
    if (moderate && r && r.hi < ACSM_MODERATE_RPE10_MIN) {
      out.push(`moderate intensity given as RPE ${rpe}/10; ACSM maps moderate to about 5–6/10 (Borg 12–13)`);
      break;
    }
  }
  return out;
}

/** Findings for needsReview. Flags problems in the research; never changes the data. */
export function validateExercise(e: ExerciseData): string[] {
  const out: string[] = [];
  if (!e.name) out.push('no name');
  if (!e.section) out.push('no section');
  if (!e.type) out.push('no or unknown type');
  if (e.met === null) out.push('MET missing');
  else if (e.met < MET_MIN || e.met > MET_MAX) out.push(`MET ${e.met} outside the plausible ${MET_MIN}–${MET_MAX} range`);
  if (e.prescriptions.length === 0) out.push('prescriptions missing');
  else if (e.prescriptions.every((p) => p.sets === null && p.reps === null && p.timeSec === null)) out.push('prescriptions have no sets, reps or time');
  if (e.safetyFlags.length === 0) out.push('safety flags empty');

  const rc = e.repCounter;
  if (!rc) out.push('rep_counter missing');
  else if (rc.mode !== 'none') {
    for (const p of rc.phases) {
      const label = `rep_counter phase "${p.name}" (${p.joint})`;
      if (!p.parsed) out.push(`${label}: angle "${p.angleDeg}" is not a parseable angle`);
      else if (p.parsed.value > 180 || (p.parsed.max ?? 0) > 180) out.push(`${label}: angle "${p.angleDeg}" is above 180°, which an unsigned three-point angle can't reach`);
    }
    if (rc.mode === 'reps' && rc.phases.filter((p) => p.parsed).length < 2) out.push('rep_counter counts reps but has fewer than 2 parseable phases');
  }
  for (const f of e.formChecks) {
    // Form rules are prose, so only flag explicit comparisons to angles over 180.
    for (const m of f.rule.matchAll(/(?:[<>]=?|≥|≤)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:deg\b|°)/g)) {
      const v = Number(m[1] ?? m[2]);
      if (/angle|deg|°|line/i.test(f.rule) && v > 180) {
        out.push(`form check "${f.rule}": angle ${v} is above 180°, which an unsigned three-point angle can't reach`);
        break;
      }
    }
  }
  if (e.type === 'cardio') out.push(...cardioChecks(e));
  return out;
}

export function validateGuidance(g: GuidanceData): string[] {
  const out: string[] = [];
  if (!g.name) out.push('no name');
  if (g.rules.length === 0) out.push('no rules');
  g.rules.forEach((r, i) => {
    if (!r.if || !r.then) out.push(`rule ${i + 1} is missing its "if" or "then"`);
    if (!r.source) out.push(`rule ${i + 1} has no source`);
  });
  if (g.type === 'plan' && (!g.weeks || g.weeks.length === 0)) out.push('plan has no weeks');
  return out;
}

// ---------------------------------------------------------------- merge

function sortVersions<T extends { date: string }>(all: T[]): T[] {
  // One version per research date (spec B: id + date identifies a version); the later-listed copy wins.
  const byDate = new Map<string, T>();
  for (const v of all) byDate.set(v.date, v);
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function checkSameId(versions: { id: string }[]): void {
  if (versions.length === 0) throw new Error('build: no versions');
  const ids = new Set(versions.map((v) => v.id));
  if (ids.size > 1) throw new Error(`build: versions of different items: ${[...ids].join(', ')}`);
}

/** Adopt-whole chain over versions (D4): the newest wins only if at least as complete as what is held. */
function adoptChain<V extends VersionMeta>(versions: V[], notes: string[], label: string): V {
  let held: Completeness<V> | null = null;
  for (const v of versions) {
    const r: { value: V; adopted: string; note: string | null } = adoptWhole<V>(held, { value: v, sources: v.sourcesCount, notFound: v.notFoundCount });
    if (r.note) notes.push(`${label}: ${r.note.replace('Kept the previous version', `kept ${r.value.date}`)} (${v.date} not adopted)`);
    held = { value: r.value, sources: r.value.sourcesCount, notFound: r.value.notFoundCount };
  }
  return (held as Completeness<V>).value;
}

function phaseKey(p: RepPhase): string {
  return `${p.name.toLowerCase()}|${p.joint.toLowerCase()}|${p.parsed?.op ?? ''}`;
}

/** Rep-counter thresholds are stable estimates (D2): windowed per phase, matched by name, joint and operator. */
function mergeRepCounter(adopted: RepCounter | null, versions: ExerciseVersion[], notes: string[], methods: Set<string>): RepCounter | null {
  if (!adopted) return null;
  const phases = adopted.phases.map((phase, idx) => {
    if (!phase.parsed) return phase;
    const key = phaseKey(phase);
    // The k-th phase with this key in each version (a phase name can repeat, e.g. "up" at start and end).
    const occurrence = adopted.phases.slice(0, idx).filter((p) => phaseKey(p) === key).length;
    const matches = versions
      .map((v) => ({ date: v.date, p: (v.repCounter?.phases ?? []).filter((x) => x.parsed && phaseKey(x) === key)[occurrence] }))
      .filter((m): m is { date: string; p: RepPhase } => m.p !== undefined);
    const lo = mergeStable(matches.map((m) => ({ date: m.date, value: m.p.parsed!.value })));
    const hi = phase.parsed.op === 'between' ? mergeStable(matches.map((m) => ({ date: m.date, value: m.p.parsed!.max }))) : null;
    methods.add(lo.method);
    for (const n of [...lo.notes, ...(hi?.notes ?? [])]) notes.push(`rep_counter "${phase.name}": ${n}`);
    const parsed: AngleRule = { op: phase.parsed.op, value: lo.value ?? phase.parsed.value, max: hi ? (hi.value ?? phase.parsed.max) : null };
    if (parsed.value !== phase.parsed.value || parsed.max !== phase.parsed.max) {
      notes.push(`rep_counter "${phase.name}": threshold windowed over ${matches.length} versions (text "${phase.angleDeg}" is the adopted version's)`);
    }
    return { ...phase, parsed };
  });
  const minRep = mergeStable(versions.map((v) => ({ date: v.date, value: v.repCounter?.minRepSec ?? null })));
  for (const n of minRep.notes) notes.push(`rep_counter min_rep_sec: ${n}`);
  return { ...adopted, phases, minRepSec: minRep.value ?? adopted.minRepSec };
}

function unionBy<T>(lists: T[][], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const list of lists) {
    for (const item of list) {
      const k = key(item).trim().toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

/**
 * Merges every research version of one exercise (spec D):
 * - met: official Compendium value, never averaged (mergeOfficial; a version
 *   whose section 10 cites the Compendium code wins a conflict);
 * - instructions (setup, steps, prescriptions, cardio settings, rep-counter
 *   structure, video shots): adopted whole from the newest version that is at
 *   least as complete (sources, "Not found" count);
 * - rep-counter thresholds and min_rep_sec: stable estimates, moving window;
 * - lists (other names, form checks, mistakes, progressions, regressions,
 *   sources) and safety (flags, notes, condition cautions): union, newest
 *   version's order first, nothing dropped;
 * - descriptive fields: newest version.
 */
export function buildExercise(all: ExerciseVersion[], today: string): Exercise {
  checkSameId(all);
  const versions = sortVersions(all);
  const latest = versions[versions.length - 1];
  const newestFirst = [...versions].reverse();
  const notes: string[] = [];
  const review: string[] = [];
  const mergeMethod: Record<string, string> = {};

  // MET (D3).
  let held: (OfficialVersion & { code: string | null }) | null = null;
  for (const v of versions) {
    const next = { value: v.met, citesOfficial: v.metCitesCompendium, date: v.date, code: v.compendiumCode };
    const r = mergeOfficial(held, next);
    if (r.note) notes.push(`met: ${r.note}`);
    if (r.needsReview) review.push(`met conflict between versions (${r.note ?? ''})`);
    const from: typeof next = held !== null && r.value === held.value && r.value !== next.value ? held : next;
    held = { ...from, value: r.value };
  }
  mergeMethod.met = versions.length > 1 ? 'official (D3, never averaged)' : 'single';

  // Instructions (D4).
  const adopted = adoptChain(versions, notes, 'instructions');
  mergeMethod.instructions = versions.length > 1 ? `adopt whole (${adopted.date})` : 'single';

  const methods = new Set<string>();
  const repCounter = mergeRepCounter(adopted.repCounter, versions, notes, methods);
  mergeMethod.repCounterThresholds = versions.length > 1 ? `stable (${[...methods].join(', ') || 'none'})` : 'single';

  // Safety (D6): if two versions give different statuses for one condition, keep both and ask a human.
  const cautions = unionBy(newestFirst.map((v) => v.conditionCautions), (c) => `${c.condition}|${c.status}|${c.change}`);
  const statuses = new Map<string, Set<string>>();
  for (const c of cautions) statuses.set(c.condition, (statuses.get(c.condition) ?? new Set()).add(String(c.status)));
  for (const [cond, s] of statuses) if (s.size > 1) review.push(`condition caution "${cond}" has conflicting statuses across versions: ${[...s].join(', ')}`);
  mergeMethod.lists = 'union';
  mergeMethod.safety = 'union (never dropped)';
  mergeMethod.description = 'newest';

  for (const v of versions) for (const n of v.parseNotes) notes.push(`${v.date}: ${n}`);
  // Parse problems of the newest version are still live; older ones were superseded.
  review.push(...latest.parseNotes);

  const data: ExerciseData = {
    id: latest.id,
    number: latest.number,
    name: latest.name,
    otherNames: unionList(...newestFirst.map((v) => v.otherNames)),
    section: latest.section,
    type: latest.type,
    equipment: latest.equipment,
    noEquipmentAlternative: latest.noEquipmentAlternative,
    musclesPrimary: latest.musclesPrimary,
    musclesSecondary: latest.musclesSecondary,
    level: latest.level,
    impact: latest.impact,
    flatFriendly: latest.flatFriendly,
    met: held?.value ?? null,
    compendiumCode: held?.code ?? null,
    metOptions: latest.metOptions,
    prescriptions: adopted.prescriptions,
    cardioSettings: adopted.cardioSettings,
    repCounter,
    formChecks: unionBy(newestFirst.map((v) => v.formChecks), (f) => `${f.joint}|${f.rule}`),
    safetyFlags: unionList(...newestFirst.map((v) => v.safetyFlags)),
    progressions: unionList(...newestFirst.map((v) => v.progressions)),
    regressions: unionList(...newestFirst.map((v) => v.regressions)),
    videoShots: adopted.videoShots,
    lastResearched: latest.lastResearched,
    setupSteps: adopted.setupSteps,
    steps: adopted.steps,
    commonMistakes: unionBy(newestFirst.map((v) => v.commonMistakes), (m) => m.title ?? m.text),
    safetyNotes: unionList(...newestFirst.map((v) => v.safetyNotes)),
    sources: unionList(...newestFirst.map((v) => v.sources)),
    burnMinutes: newestFirst.find((v) => v.burnMinutes)?.burnMinutes ?? null,
    gymAccess: unionList(...newestFirst.map((v) => v.gymAccess)),
    suitsPreferences: unionList(...newestFirst.map((v) => v.suitsPreferences)),
    swapsByAccess: newestFirst.find((v) => v.swapsByAccess)?.swapsByAccess ?? null,
    conditionCautions: cautions,
    searchTags: newestFirst.find((v) => v.searchTags)?.searchTags ?? null,
  };
  if (data.lastResearched && data.lastResearched > today) review.push(`last_researched ${data.lastResearched} is after the build date ${today}`);

  return {
    ...data,
    tags: exerciseTags(data),
    needsReview: unionList(review, validateExercise(data)),
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod,
    mergeNotes: notes,
  };
}

const SAFETY_RULE = /doctor|clearance|stop|never|avoid|block|pain|dizz|pregnan|surgery|spotter|safety/i;

/**
 * Merges every research version of one knowledge or plan item. Rules are an
 * instruction set, so they are adopted whole (D4) with the item's text; but a
 * safety rule (D6) the adopted version no longer has is carried over and
 * flagged, because a warning is never silently dropped.
 */
export function buildGuidance(all: GuidanceVersion[], today: string): Guidance {
  checkSameId(all);
  const versions = sortVersions(all);
  const latest = versions[versions.length - 1];
  const notes: string[] = [];
  const review: string[] = [];
  const mergeMethod: Record<string, string> = {};

  const adopted = adoptChain(versions, notes, 'rules');
  mergeMethod.rules = versions.length > 1 ? `adopt whole (${adopted.date})` : 'single';
  const ruleKey = (r: GuidanceRule) => `${r.if}|${r.then}`.trim().toLowerCase();
  const have = new Set(adopted.rules.map(ruleKey));
  const carried: GuidanceRule[] = [];
  for (const v of versions) {
    if (v === adopted) continue;
    for (const r of v.rules) {
      if (have.has(ruleKey(r)) || !SAFETY_RULE.test(`${r.if} ${r.then}`)) continue;
      have.add(ruleKey(r));
      carried.push(r);
      review.push(`safety rule from ${v.date} missing in ${adopted.date}, carried over: "${r.if}" → "${r.then}"`);
    }
  }
  mergeMethod.sources = 'union';
  for (const v of versions) for (const n of v.parseNotes) notes.push(`${v.date}: ${n}`);
  review.push(...latest.parseNotes);

  const data: GuidanceData = {
    id: latest.id,
    number: latest.number,
    type: latest.type,
    name: latest.name,
    section: latest.section,
    keyTakeaways: adopted.keyTakeaways,
    mistakes: adopted.mistakes,
    appGuidance: adopted.appGuidance,
    rules: [...adopted.rules, ...carried],
    weeks: adopted.weeks,
    sources: unionList(...[...versions].reverse().map((v) => v.sources)),
    lastResearched: latest.lastResearched,
  };
  if (data.lastResearched && data.lastResearched > today) review.push(`last_researched ${data.lastResearched} is after the build date ${today}`);

  return {
    ...data,
    tags: guidanceTags(data),
    needsReview: unionList(review, validateGuidance(data)),
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod,
    mergeNotes: notes,
  };
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
  orderPrice: { min: number; max: number; avg: number | null } | null;
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

function parseOrderPrice(body: string): DishVersion['orderPrice'] {
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
  return { min: range.min, max: range.max, avg };
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

export type IngredientVersion = {
  id: string;
  date: string;
  file: string;
  name: string;
  aliases: string[];
  category: string | null;
  standardUnit: string | null;
  price: { min: number; max: number; avg: number | null } | null;
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
    let avg = rupee(cells[4]);
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
      price: range ? { min: range.min, max: range.max, avg } : null,
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
    price = estimate;
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
  const mergeMethod: Record<string, string> = {};

  const nutrition = mergeMacros(versions.map((v) => ({ date: v.date, macros: v.nutrition })), 'nutritionPerServing', notes);
  mergeMethod.nutritionPerServing = `stable (${nutrition.method})`;

  const observations: PriceObservation[] = versions
    .filter((v) => v.orderPrice)
    .map((v) => ({ date: v.date, min: v.orderPrice!.min, max: v.orderPrice!.max, avg: v.orderPrice!.avg, confidence: null, sourceFile: v.file }));
  let orderPrice: PriceEstimate | null = null;
  if (observations.length > 0) {
    const { estimate, notes: n } = stripEngine(computePriceEstimate(observations, { today, seasonal: false, kind: 'dish' }), observations);
    orderPrice = estimate;
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
    needsReview: [...latest.needsReview],
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

### `src/services/data/researchIndex.ts`

```ts
/**
 * Renders the generated index.ts for a folder of per-item research JSON.
 * Static imports (not a directory scan) because Metro bundles only what is
 * imported; the runner rewrites the file whenever that data type changes.
 *
 * `model` is the module under src/models/ that exports `type`
 * (research for Dish/Ingredient, nutrient, exercise).
 */
export function renderIndex(type: string, ids: string[], model = 'research'): string {
  const ident = (id: string) => `item_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const sorted = [...ids];
  const lines = [
    '// GENERATED by scripts/research/run.js. Do not edit by hand.',
    `import type { ${type} } from '../../../models/${model}';`,
    '',
    ...sorted.map((id) => `import ${ident(id)} from './${id}.json';`),
    '',
    `export const items: ${type}[] = [`,
    ...sorted.map((id) => `  ${ident(id)} as unknown as ${type},`),
    '];',
    '',
  ];
  return lines.join('\n');
}
```

### `src/data/research/index.ts`

```ts
/**
 * Research content bundled with the app (generated per-item JSON; see
 * scripts/research/run.js). The app reads it only when the researchData
 * flag is on (Day 6); until then the demo dishes in src/data/dishes.ts stay.
 */
import type { Dish, Ingredient } from '../../models/research';
import type { Exercise, Guidance as FitnessGuide } from '../../models/exercise';
import type { Guidance, HealthCondition, Hydration, Nutrient } from '../../models/nutrient';
import { items as dishItems } from './dishes';
import { items as ingredientItems } from './ingredients';
import { items as nutrientItems } from './nutrients';
import { items as hydrationItems } from './hydration';
import { items as guidanceItems } from './guidance';
import { items as conditionItems } from './conditions';
import { items as exerciseItems } from './exercises';
import { items as fitnessGuideItems } from './fitness-guides';
import aliasData from './ingredients/aliases.json';
import linkData from './links.json';

export const researchDishes: readonly Dish[] = dishItems;
export const researchIngredients: readonly Ingredient[] = ingredientItems;
export const researchNutrients: readonly Nutrient[] = nutrientItems;
export const researchHydration: readonly Hydration[] = hydrationItems;
export const researchGuidance: readonly Guidance[] = guidanceItems;
export const researchConditions: readonly HealthCondition[] = conditionItems;
export const researchExercises: readonly Exercise[] = exerciseItems;
export const researchFitnessGuides: readonly FitnessGuide[] = fitnessGuideItems;

/** F1: any spelling (slug) → canonical ingredient id. */
export const ingredientAliases: Readonly<Record<string, string>> = aliasData;

/** Spec F cross-links generated by the runner (good-source dishes, families, drinks, MET, micronutrient table). */
export type ResearchLinks = {
  goodSourceDishes: Record<string, { dishNumber: number; dishName: string; dishId: string | null }[]>;
  dishGoodSourceOf: Record<string, string[]>;
  families: { familyId: string; dishIds: string[]; how: 'name' | 'research-variant' }[];
  met: { exerciseId: string; name: string; met: number }[];
  microTable: Record<string, Record<string, { per100: number; unit: string; source: string }>>;
};
export const researchLinks = linkData as unknown as ResearchLinks;

const dishById = new Map(dishItems.map((d) => [d.id, d]));
const ingredientById = new Map(ingredientItems.map((i) => [i.id, i]));

export function getDish(id: string): Dish | undefined {
  return dishById.get(id);
}

export function getIngredient(id: string): Ingredient | undefined {
  return ingredientById.get(id);
}

/** Other dishes in the same variant family (e.g. Veg and Chicken Biryani). */
export function familyOf(dish: Dish): Dish[] {
  if (!dish.familyId) return [];
  return dishItems.filter((d) => d.familyId === dish.familyId && d.id !== dish.id);
}
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
    expect(ok.tags).toEqual(expect.arrayContaining(['No onion-garlic', 'Pescatarian']));
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
import type { Nutrient } from '../../models/nutrient';

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
```

### `src/__tests__/data/exercises.test.ts`

```ts
import fs from 'fs';
import path from 'path';

import { describe, expect, it } from '@jest/globals';

import {
  buildExercise,
  buildGuidance,
  burnOffMinutes,
  exerciseTags,
  parseAngle,
  parseFitnessFile,
  parseMetOptions,
  parseSteps,
  validateExercise,
  type ExerciseVersion,
  type GuidanceVersion,
} from '../../services/data/exerciseImporter';

// Fixtures copy the shapes of the real fitness files (Home 1 squat, Gym 5 treadmill, Gym 1 knowledge).
function exerciseJson(over: Record<string, unknown> = {}): string {
  return JSON.stringify(
    {
      id: 'bodyweight-squat',
      name: 'Bodyweight squat',
      other_names: ['air squat'],
      section: 'home',
      type: 'strength',
      equipment: [],
      no_equipment_alternative: 'Already equipment-free',
      muscles_primary: ['quadriceps', 'gluteus maximus'],
      muscles_secondary: ['hamstrings'],
      level: 'beginner',
      impact: 'low',
      flat_friendly: true,
      met: 3.8,
      prescriptions: [{ level: 'beginner', goal: 'general_fitness', sets: 2, reps: '8-12', time_sec: null, rest_sec: 75, tempo: '3-1-1', per_week: 3 }],
      cardio_settings: null,
      rep_counter: {
        mode: 'reps',
        camera_view: 'side',
        landmarks: ['left_hip', 'left_knee', 'left_ankle'],
        phases: [
          { name: 'up', joint: 'knee', angle_deg: '>= 160' },
          { name: 'down', joint: 'knee', angle_deg: '<= 110' },
          { name: 'up', joint: 'knee', angle_deg: '>= 160' },
        ],
        min_rep_sec: 1,
      },
      form_checks: [{ joint: 'knee', rule: 'knee width < 80% of ankle width', message: 'Knees caving in: push them out' }],
      safety_flags: ['knee_pain_limit_depth', 'stop_on_sharp_pain'],
      progressions: ['Goblet squat'],
      regressions: ['Chair squat'],
      video_shots: [{ seconds: 8, angle: 'front', shows: 'stance', text_overlay: 'Feet just wider than hips' }],
      last_researched: '2026-10-09',
      ...over,
    },
    null,
    2,
  );
}

function exerciseBlock(json: string, opts: { disclaimer?: boolean; sources?: number } = {}): string {
  const sources = Array.from({ length: opts.sources ?? 3 }, (_, i) => `- Source ${i + 1}: https://example.org/${i}`).join('\n');
  return `## Home 1. Bodyweight squat (air squat, free squat)

### 1. Quick facts
- **Section:** Home

### 3. Setup
1. **Clear the space.** Stand on a mat.
2. **Stance width.** Heels about hip-width apart.

### 4. Step-by-step execution
1. **Start tall**
   - Action: Stand in your set-up stance.
   - Feel: Weight even across both feet.
   - Breathing: Normal breathing.
   - Tempo: Hold for 1 second.
   - Visual check: Ear, shoulder, hip and ankle in a line.
2. **Drive up**
   - Action: Push the floor away.
   - Breathing: Breathe out as you rise.

### 6. Common mistakes
1. **Knees caving in (knee valgus).**
   - Why it's a problem: stress on the inner knee.
   - Fix: Spread the floor.
2. **Heels lifting.** Sit back more.

### 9. Safety
- **Knee pain:** Use shallow squats.
- **Stop immediately if you have:** sharp pain or dizziness.
${opts.disclaimer === false ? '' : '\n*General information, not medical advice.*\n'}
### 10. Calories
- **MET:** Closest matches:
  - **02022 – Calisthenics, moderate effort: 3.8 METs.** FitPlate uses this.
  - 02020 – Calisthenics, vigorous effort: 7.5 METs.
- Calculation: kcal = MET × kg × hours.

### 14. App data (JSON)
\`\`\`json
${json}
\`\`\`

### 15. Sources
${sources}
`;
}

const KNOWLEDGE_BLOCK = `## Gym 1. Gym basics: safety, etiquette and your first visit

### 1. Key takeaways (5 bullets)
- **Screen yourself first.** Answer seven yes/no questions.
- **Carry five things.** Water, towel, shoes, lock, ID.

### 3. Beginner mistakes and how to avoid them
1. Going too heavy on day one.

### 4. How the app should use this
- Show the PAR-Q+ questions before any gym plan.

### 5. App data (JSON)
\`\`\`json
{"id": "gym-basics", "type": "knowledge", "rules": [
  {"if": "user answers yes to chest pain", "then": "block all workouts and advise a doctor", "source": "PAR-Q+"},
  {"if": "all answers are no", "then": "unlock beginner plans", "source": "PAR-Q+"}
], "last_researched": "2026-10-09"}
\`\`\`

### 6. Sources (with URLs)
1. PAR-Q+. https://eparmedx.com
`;

function fileOf(...blocks: string[]): string {
  return `Cycle 1 | Day 1 | Home 1, Yoga & Stretch 1, Gym 1–2\n\n| Item | Section |\n|---|---|\n| Squat | Home |\n\n${blocks.join('\n')}\nToday: Cycle 1, Day 1. Next up: Day 2.\n`;
}

function exerciseOf(text: string, file: string): ExerciseVersion {
  const { items, errors } = parseFitnessFile(text, file);
  expect(errors).toEqual([]);
  const ex = items.filter((i): i is ExerciseVersion => i.kind === 'exercise');
  expect(ex).toHaveLength(1);
  return ex[0];
}

describe('parseAngle', () => {
  it('reads comparisons and ranges', () => {
    expect(parseAngle('>= 160')).toEqual({ op: '>=', value: 160, max: null });
    expect(parseAngle('<= 110 (est.)')).toEqual({ op: '<=', value: 110, max: null });
    expect(parseAngle('< 10')).toEqual({ op: '<', value: 10, max: null });
    expect(parseAngle('≥ 150°')).toEqual({ op: '>=', value: 150, max: null });
    expect(parseAngle('70-110')).toEqual({ op: 'between', value: 70, max: 110 });
    expect(parseAngle('165–195')).toEqual({ op: 'between', value: 165, max: 195 });
  });

  it('refuses what is not an angle', () => {
    expect(parseAngle('>= 0.25 (ratio, not degrees)')).toBeNull();
    expect(parseAngle('n/a (position check)')).toBeNull();
    expect(parseAngle('elbow above shoulder line')).toBeNull();
    expect(parseAngle('110-70')).toBeNull();
  });
});

describe('parseFitnessFile', () => {
  it('routes exercises and knowledge items by JSON type', () => {
    const { items, errors } = parseFitnessFile(fileOf(exerciseBlock(exerciseJson()), KNOWLEDGE_BLOCK), 'FitPlate_Fitness_2026-10-09.md');
    expect(errors).toEqual([]);
    expect(items.map((i) => [i.kind, i.id])).toEqual([
      ['exercise', 'bodyweight-squat'],
      ['guidance', 'gym-basics'],
    ]);
    const g = items[1] as GuidanceVersion;
    expect(g.name).toBe('Gym basics: safety, etiquette and your first visit');
    expect(g.number).toBe(1);
    expect(g.section).toBe('gym');
    expect(g.rules).toHaveLength(2);
    expect(g.keyTakeaways[0]).toMatch(/^Screen yourself first/);
    expect(g.sources).toHaveLength(1);
  });

  it('camelCases the JSON and reads the markdown sections', () => {
    const e = exerciseOf(fileOf(exerciseBlock(exerciseJson())), 'FitPlate_Fitness_2026-10-09.md');
    expect(e.date).toBe('2026-10-09');
    expect(e.otherNames).toEqual(['air squat']);
    expect(e.flatFriendly).toBe(true);
    expect(e.prescriptions[0]).toEqual({ level: 'beginner', goal: 'general_fitness', sets: 2, reps: '8-12', timeSec: null, restSec: 75, tempo: '3-1-1', perWeek: 3 });
    expect(e.repCounter?.phases[1]).toEqual({ name: 'down', joint: 'knee', angleDeg: '<= 110', parsed: { op: '<=', value: 110, max: null } });
    expect(e.videoShots[0].textOverlay).toBe('Feet just wider than hips');
    expect(e.setupSteps).toEqual(['Clear the space. Stand on a mat.', 'Stance width. Heels about hip-width apart.']);
    expect(e.steps).toHaveLength(2);
    expect(e.steps[0]).toMatchObject({ n: 1, title: 'Start tall', action: 'Stand in your set-up stance.', breathing: 'Normal breathing.', visualCheck: 'Ear, shoulder, hip and ankle in a line.' });
    expect(e.commonMistakes.map((m) => m.title)).toEqual(['Knees caving in (knee valgus)', 'Heels lifting']);
    expect(e.safetyNotes).toHaveLength(2);
    expect(e.compendiumCode).toBe('02022');
    expect(e.metCitesCompendium).toBe(false); // the fixture's section 10 never names the Compendium
    expect(e.sources).toHaveLength(3);
    expect(e.parseNotes).toEqual([]);
  });

  it('reports malformed JSON, missing JSON and unknown types instead of guessing', () => {
    const bad = exerciseBlock('{"id": "bodyweight-squat", "type": "strength",}');
    const unknown = exerciseBlock(exerciseJson({ type: 'dance' })).replace('Home 1.', 'Home 2.');
    const none = '## Home 3. Plank\n\n### 1. Quick facts\n- Section: Home\n';
    const { items, errors } = parseFitnessFile(fileOf(bad, unknown, none), 'FitPlate_Fitness_2026-10-09.md');
    expect(items).toEqual([]);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toMatch(/Home 1: malformed JSON/);
    expect(errors[1]).toMatch(/Home 2: unknown JSON type "dance"/);
    expect(errors[2]).toMatch(/Home 3: no JSON block/);
  });

  it('notes a missing disclaimer', () => {
    const e = exerciseOf(fileOf(exerciseBlock(exerciseJson(), { disclaimer: false })), 'FitPlate_Fitness_2026-10-09.md');
    expect(e.parseNotes).toContain('no "General information, not medical advice" line');
  });

  it('throws on a file name without a date', () => {
    expect(() => parseFitnessFile('', 'fitness.md')).toThrow(/No date/);
  });
});

describe('markdown helpers', () => {
  it('pairs each MET with its nearest Compendium code', () => {
    const body = `- **MET:** 2.3, 2024 Adult Compendium, code **02101** "Stretching, mild".
- Notes: codes 17340–17367 are flat; a downhill code (17382, 3.3 METs at −3%).

| Activity (2024 Adult Compendium) | Code | MET | 60 kg |
|---|---|---|---|
| Walking, treadmill, 3.0–3.4 mph (4.8–5.5 km/h), 0% grade | 17355 | 3.8 | 38 (est.) |
`;
    expect(parseMetOptions(body).map((o) => [o.code, o.met])).toEqual([
      ['02101', 2.3],
      ['17382', 3.3],
      ['17355', 3.8],
    ]);
  });

  it('reads "**Step N.**" steps under part headings', () => {
    const steps = parseSteps(`**A. Front plank**

**Step 1. Prayer pose**
- **Action:** palms together.
- **Breath:** exhale.

**Key disagreements**
- Some schools inhale here.
`);
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({ n: 1, part: 'A. Front plank', title: 'Prayer pose', action: 'palms together.', breathing: 'exhale.' });
  });
});

describe('validateExercise', () => {
  const base = exerciseOf(fileOf(exerciseBlock(exerciseJson())), 'FitPlate_Fitness_2026-10-09.md');

  it('passes a complete item', () => {
    expect(validateExercise(base)).toEqual([]);
  });

  it('flags MET, prescriptions and safety problems', () => {
    expect(validateExercise({ ...base, met: null })).toContain('MET missing');
    expect(validateExercise({ ...base, met: 25 })).toContain('MET 25 outside the plausible 1–20 range');
    expect(validateExercise({ ...base, met: 0.5 })[0]).toMatch(/outside the plausible/);
    expect(validateExercise({ ...base, prescriptions: [] })).toContain('prescriptions missing');
    expect(validateExercise({ ...base, safetyFlags: [] })).toContain('safety flags empty');
  });

  it('flags unparseable and over-180° rep-counter angles (review 2026-10-11)', () => {
    const rc = base.repCounter!;
    const phases = [
      { name: 'hold', joint: 'shoulder-hip-ankle', angleDeg: '165-195', parsed: parseAngle('165-195') },
      { name: 'eight_limb', joint: 'hip', angleDeg: 'n/a (position check)', parsed: null },
    ];
    const out = validateExercise({ ...base, repCounter: { ...rc, mode: 'hold_timer', phases } });
    expect(out.some((s) => /"165-195" is above 180°/.test(s))).toBe(true);
    expect(out.some((s) => /"n\/a \(position check\)" is not a parseable angle/.test(s))).toBe(true);
    const fc = validateExercise({ ...base, formChecks: [{ joint: 'hip', rule: 'plank shoulder-hip-ankle line > 195 deg (piked)', message: 'Lower your hips' }] });
    expect(fc.some((s) => /angle 195 is above 180°/.test(s))).toBe(true);
  });

  it('does not flag phases when the counter is off', () => {
    const rc = base.repCounter!;
    const phases = [{ name: 'foot_contact', joint: 'ankle', angleDeg: 'ankle forward of hip', parsed: null }];
    expect(validateExercise({ ...base, repCounter: { ...rc, mode: 'none', phases } })).toEqual([]);
  });

  it('flags a cardio MET that disagrees with its own beginner settings and Compendium rows', () => {
    const treadmill = {
      ...base,
      type: 'cardio' as const,
      met: 4.8,
      metOptions: [
        { code: '17355', met: 3.8, activity: 'Walking, treadmill, 3.0–3.4 mph (4.8–5.5 km/h), 0% grade' },
        { code: '17358', met: 4.8, activity: 'Walking, treadmill, 3.5–3.9 mph (5.6–6.3 km/h), 0% grade' },
      ],
      cardioSettings: {
        intensity_bands: { moderate: { talk_test: 'can talk in sentences, cannot sing', rpe_0_10: '3-4', rpe_borg_6_20: '12-13' } },
        levels: [{ level: 'beginner', mode: 'walk', speed_kmh: '4.5-5.5', intensity: 'moderate' }],
      },
    };
    const out = validateExercise(treadmill);
    expect(out).toContain('MET 4.8 does not match the beginner settings (4.5-5.5 km/h): its own Compendium row 17355 gives 3.8');
    expect(out).toContain('moderate intensity given as RPE 3-4/10; ACSM maps moderate to about 5–6/10 (Borg 12–13)');
    // Same item with a matching MET and an ACSM-consistent RPE passes.
    const fixed = { ...treadmill, met: 3.8, cardioSettings: { ...treadmill.cardioSettings, intensity_bands: { moderate: { rpe_0_10: '5-6' } } } };
    expect(validateExercise(fixed)).toEqual([]);
  });

  it('checks met_<intensity> when the settings give one', () => {
    const elliptical = { ...base, type: 'cardio' as const, met: 9, cardioSettings: { met_moderate: 5, met_vigorous: 9, beginner: { talk_test: 'can talk, cannot sing', rpe_0_10: '5-6' } } };
    expect(validateExercise(elliptical)).toEqual(['MET 9 does not match the beginner intensity (moderate), which cardio_settings gives as 5']);
  });
});

describe('exerciseTags', () => {
  const base = exerciseOf(fileOf(exerciseBlock(exerciseJson())), 'FitPlate_Fitness_2026-10-09.md');

  it('derives place, equipment, noise, level, impact, type, muscles and camera tags', () => {
    expect(exerciseTags(base)).toEqual(['Home', 'No equipment', 'Flat-friendly', 'Quiet', 'Beginner', 'Low impact', 'Strength', 'Legs', 'Glutes', 'Rep counter']);
  });

  it('only tags what the data supports', () => {
    const tags = exerciseTags({ ...base, section: 'gym', equipment: ['Motorised treadmill'], flatFriendly: false, musclesPrimary: ['Heart and lungs (cardiorespiratory)'] });
    expect(tags).toContain('Gym');
    expect(tags).not.toContain('No equipment');
    expect(tags).not.toContain('Quiet');
    expect(tags).toContain('Heart & lungs');
    expect(exerciseTags({ ...base, equipment: ['chair (optional)'] })).toContain('No equipment');
  });

  it('uses the ADDITIONS E search block when present', () => {
    const searchTags = { location: ['home', 'outdoor'], bodyRegion: [], goalTags: [], intensity: null, noise: 'moderate', space: null, typicalMinutes: 15, kcalPer10min70kg: null, difficulty1to5: null, cameraTrackable: null };
    const tags = exerciseTags({ ...base, searchTags });
    expect(tags).toContain('Outdoors');
    expect(tags).not.toContain('Quiet');
    expect(tags).toContain('10–20 min');
  });
});

describe('buildExercise', () => {
  const v1 = exerciseOf(fileOf(exerciseBlock(exerciseJson())), 'FitPlate_Fitness_2026-10-09.md');

  it('builds a single version with provenance and tags', () => {
    const e = buildExercise([v1], '2026-10-15');
    expect(e.versions).toEqual([{ date: '2026-10-09', file: 'FitPlate_Fitness_2026-10-09.md' }]);
    expect(e.mergeMethod.met).toBe('single');
    expect(e.needsReview).toEqual([]);
    expect(e.tags).toContain('Home');
    expect(e.met).toBe(3.8);
  });

  it('never averages MET: a conflict keeps the previous value and asks for review', () => {
    const v2 = exerciseOf(
      fileOf(exerciseBlock(exerciseJson({ met: 4.2, last_researched: '2026-11-03' }))),
      'FitPlate_Fitness_2026-11-03.md',
    );
    const e = buildExercise([v2, v1], '2026-11-04');
    expect(e.met).toBe(3.8);
    expect(e.needsReview.some((s) => /met conflict/.test(s))).toBe(true);
    expect(e.versions.map((v) => v.date)).toEqual(['2026-10-09', '2026-11-03']);
  });

  it('prefers the MET whose version cites the Compendium code', () => {
    const cited = (t: string) => t.replace('- Calculation:', '- 2024 Adult Compendium. Calculation:');
    const v2 = exerciseOf(cited(fileOf(exerciseBlock(exerciseJson({ met: 7.5, last_researched: '2026-11-03' })))), 'FitPlate_Fitness_2026-11-03.md');
    expect(v2.metCitesCompendium).toBe(true);
    const e = buildExercise([v1, v2], '2026-11-04');
    expect(e.met).toBe(7.5);
    expect(e.compendiumCode).toBe('02020');
    expect(e.needsReview.some((s) => /met conflict/.test(s))).toBe(false);
  });

  it('windows rep-counter thresholds, adopts instructions whole and unions lists and safety', () => {
    const json2 = exerciseJson({
      last_researched: '2026-11-03',
      rep_counter: {
        mode: 'reps',
        camera_view: 'side',
        landmarks: ['left_knee'],
        phases: [
          { name: 'up', joint: 'knee', angle_deg: '>= 170' },
          { name: 'down', joint: 'knee', angle_deg: '<= 100' },
          { name: 'up', joint: 'knee', angle_deg: '>= 170' },
        ],
        min_rep_sec: 1.2,
      },
      safety_flags: ['knee_pain_limit_depth', 'pregnancy_use_support'],
      progressions: ['Pause squat'],
      prescriptions: [{ level: 'beginner', goal: 'strength', sets: 3, reps: '5-8', time_sec: null, rest_sec: 120, tempo: '2-1-1', per_week: 2 }],
    });
    const v2 = exerciseOf(fileOf(exerciseBlock(json2, { sources: 4 })), 'FitPlate_Fitness_2026-11-03.md');
    const e = buildExercise([v1, v2], '2026-11-04');
    // mean of the last 2 versions (D2)
    expect(e.repCounter?.phases.map((p) => p.parsed?.value)).toEqual([165, 105, 165]);
    expect(e.repCounter?.phases[1].angleDeg).toBe('<= 100');
    expect(e.repCounter?.minRepSec).toBe(1.1);
    expect(e.mergeMethod.repCounterThresholds).toBe('stable (mean-2)');
    // newest is at least as complete → adopted whole
    expect(e.prescriptions).toEqual(v2.prescriptions);
    expect(e.mergeMethod.instructions).toBe('adopt whole (2026-11-03)');
    expect(e.safetyFlags).toEqual(['knee_pain_limit_depth', 'pregnancy_use_support', 'stop_on_sharp_pain']);
    expect(e.progressions).toEqual(['Pause squat', 'Goblet squat']);
  });

  it('keeps the previous instructions when the newer version is less complete', () => {
    const json2 = exerciseJson({ last_researched: '2026-11-03', prescriptions: [{ level: 'advanced', goal: 'muscle', sets: 4, reps: '12', time_sec: null, rest_sec: 60, tempo: '', per_week: 3 }] });
    const v2 = exerciseOf(fileOf(exerciseBlock(json2, { sources: 1 })), 'FitPlate_Fitness_2026-11-03.md');
    const e = buildExercise([v1, v2], '2026-11-04');
    expect(e.prescriptions).toEqual(v1.prescriptions);
    expect(e.mergeNotes.some((n) => /fewer sources/.test(n))).toBe(true);
  });

  it('counts the same research date once and refuses mixed ids', () => {
    expect(buildExercise([v1, v1], '2026-10-15').versions).toHaveLength(1);
    const other = { ...v1, id: 'push-up' };
    expect(() => buildExercise([v1, other], '2026-10-15')).toThrow(/different items/);
  });
});

describe('buildGuidance', () => {
  const parse = (text: string, file: string) => parseFitnessFile(text, file).items[0] as GuidanceVersion;
  const g1 = parse(fileOf(KNOWLEDGE_BLOCK), 'FitPlate_Fitness_2026-10-09.md');

  it('builds a knowledge item that validates', () => {
    const g = buildGuidance([g1], '2026-10-15');
    expect(g.needsReview).toEqual([]);
    expect(g.tags).toEqual(['Gym', 'Guide']);
  });

  it('never drops a safety rule a newer version left out', () => {
    const newer = KNOWLEDGE_BLOCK.replace(/\{"if": "user answers yes to chest pain"[^}]*\},\n/, '')
      .replace('"2026-10-09"', '"2026-11-03"')
      .replace('1. PAR-Q+. https://eparmedx.com', '1. PAR-Q+. https://eparmedx.com\n2. ACSM. https://acsm.org');
    const g2 = parse(fileOf(newer), 'FitPlate_Fitness_2026-11-03.md');
    expect(g2.rules).toHaveLength(1);
    const g = buildGuidance([g1, g2], '2026-11-04');
    expect(g.rules.map((r) => r.then)).toEqual(['unlock beginner plans', 'block all workouts and advise a doctor']);
    expect(g.needsReview.some((s) => /safety rule from 2026-10-09/.test(s))).toBe(true);
    expect(g.sources).toHaveLength(2);
  });

  it('flags rules without a source', () => {
    const noSource = KNOWLEDGE_BLOCK.replace('"source": "PAR-Q+"}\n], "last', '"source": ""}\n], "last');
    const g = buildGuidance([parse(fileOf(noSource), 'FitPlate_Fitness_2026-10-09.md')], '2026-10-15');
    expect(g.needsReview).toEqual(['rule 2 has no source']);
  });
});

describe('burnOffMinutes', () => {
  it('follows kcal = MET × kg × hours', () => {
    // 300 kcal of 3.8-MET walking at 70 kg: 300 ÷ (3.8 × 70 ÷ 60) ≈ 67.7 min
    expect(burnOffMinutes(300, 3.8)).toBeCloseTo(67.67, 2);
    expect(burnOffMinutes(100, 5, 60)).toBeCloseTo(20, 5);
    // round trip: the research's "44 kcal per 10 min at 70 kg" for MET 3.8
    expect(burnOffMinutes(3.8 * 70 * (10 / 60), 3.8, 70)).toBeCloseTo(10, 5);
    expect(burnOffMinutes(0, 3.8)).toBe(0);
  });

  it('rejects nonsense input', () => {
    expect(() => burnOffMinutes(100, 0)).toThrow(/MET/);
    expect(() => burnOffMinutes(100, 3.8, -70)).toThrow(/weight/);
    expect(() => burnOffMinutes(-1, 3.8)).toThrow(/kcal/);
    expect(() => burnOffMinutes(Number.NaN, 3.8)).toThrow(/kcal/);
  });
});

// The real research files, when this machine can see them (CI cannot).
const RESEARCH_DIR = '/mnt/project-files/fitness-research';
const REAL_FILES = ['FitPlate_Fitness_2026-10-09.md', 'FitPlate_Fitness_2026-10-10.md', 'FitPlate_Fitness_2026-10-11.md'];
const haveReal = REAL_FILES.every((f) => fs.existsSync(path.join(RESEARCH_DIR, f)));

(haveReal ? describe : describe.skip)('real fitness research files', () => {
  const parsed = REAL_FILES.map((f) => parseFitnessFile(fs.readFileSync(path.join(RESEARCH_DIR, f), 'utf8'), f));
  const items = parsed.flatMap((p) => p.items);
  const exercises = items.filter((i): i is ExerciseVersion => i.kind === 'exercise').map((v) => buildExercise([v], '2026-10-15'));
  const guidance = items.filter((i): i is GuidanceVersion => i.kind === 'guidance').map((v) => buildGuidance([v], '2026-10-15'));
  const byId = (id: string) => exercises.find((e) => e.id === id)!;

  it('parses all 12 items without errors: 8 exercises and 4 knowledge items', () => {
    expect(parsed.flatMap((p) => p.errors)).toEqual([]);
    expect(exercises).toHaveLength(8);
    expect(guidance.map((g) => g.id)).toEqual(['gym-basics', 'warm-up-cool-down', 'sets-reps-rest-overload', 'starting-weight-rpe-rir']);
  });

  it('reads every exercise fully', () => {
    for (const e of exercises) {
      expect(e.met).not.toBeNull();
      expect(e.compendiumCode).toMatch(/^\d{5}$/);
      expect(e.steps.length).toBeGreaterThan(3);
      expect(e.setupSteps.length).toBeGreaterThan(2);
      expect(e.commonMistakes.length).toBeGreaterThanOrEqual(5);
      expect(e.sources.length).toBeGreaterThanOrEqual(5);
      expect(e.tags.length).toBeGreaterThan(3);
    }
    for (const g of guidance) {
      expect(g.rules.length).toBeGreaterThan(0);
      expect(g.keyTakeaways).toHaveLength(5);
    }
  });

  it('flags the open review findings without changing the data', () => {
    expect(byId('plank-and-side-plank').needsReview).toEqual(
      expect.arrayContaining([expect.stringMatching(/"165-195" is above 180°/)]),
    );
    // Plank carries the disclaimer inline in its intro paragraph, so the text check passes it.
    for (const e of exercises) expect(e.needsReview).not.toContain('no "General information, not medical advice" line');
    expect(byId('surya-namaskar').needsReview).toEqual(expect.arrayContaining([expect.stringMatching(/angle 195 is above 180°/)]));
    const treadmill = byId('treadmill');
    expect(treadmill.met).toBe(4.8);
    expect(treadmill.needsReview).toEqual(
      expect.arrayContaining([expect.stringMatching(/MET 4\.8 does not match the beginner settings.*17355 gives 3\.8/), expect.stringMatching(/RPE 3-4\/10/)]),
    );
    expect(byId('bodyweight-squat').needsReview).toEqual([]);
  });
});
```

### `src/__tests__/data/researchData.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import {
  familyOf,
  getDish,
  getIngredient,
  ingredientAliases,
  researchDishes,
  researchExercises,
  researchFitnessGuides,
  researchIngredients,
  researchLinks,
  researchNutrients,
} from '../../data/research';
import { validateDish, validateIngredient } from '../../services/data/buildItems';
import { validateGuidance } from '../../services/data/exerciseImporter';
import { validateNutrient } from '../../services/data/nutrientImporter';
import { ALLERGEN_IDS } from '../../models/research';

// Loads every bundled research JSON through the generated indexes, the same way the app will.
describe('bundled research data', () => {
  it('has dishes and ingredients', () => {
    expect(researchDishes.length).toBeGreaterThan(0);
    expect(researchIngredients.length).toBeGreaterThan(0);
  });

  it.each(researchDishes.map((d) => [d.id, d] as const))('dish %s validates', (_id, dish) => {
    expect(validateDish(dish)).toEqual([]);
    expect(dish.servings).toBe(1);
    expect(dish.versions.length).toBeGreaterThan(0);
    for (const a of dish.allergens) expect(ALLERGEN_IDS).toContain(a);
    // As-ordered and as-cooked nutrition are separate fields, never filled from each other.
    if (dish.asOrdered?.nutrition) expect(dish.asOrdered.nutrition.calories.value).not.toBe(dish.nutritionPerServing.kcal);
    const cur = dish.orderPrice?.currentEstimate;
    if (cur) expect(cur.min <= cur.avg && cur.avg <= cur.max).toBe(true);
  });

  it.each(researchIngredients.map((i) => [i.id, i] as const))('ingredient %s validates', (_id, ing) => {
    expect(validateIngredient(ing)).toEqual([]);
    expect(ing.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('every linked ingredient id exists', () => {
    for (const dish of researchDishes) {
      for (const line of dish.ingredients) if (line.ingredientId) expect(getIngredient(line.ingredientId)).toBeDefined();
    }
  });

  it('every dish has tags, and diet tags only from checked data', () => {
    for (const dish of researchDishes) {
      expect(dish.tags.length).toBeGreaterThan(0);
      if (dish.tags.includes('Gluten-free')) expect(dish.dietClaims).toContain('glutenFree');
      if (dish.tags.includes('Vegan')) expect(dish.dietClaims).toContain('vegan');
      if (dish.tags.includes('Jain')) expect(dish.fasting?.jain.status).toBe('yes');
      expect(dish.tags.filter((t) => t.startsWith('Contains ')).length).toBe(dish.allergens.length);
      for (const sibling of familyOf(dish)) expect(sibling.familyId).toBe(dish.familyId);
    }
  });

  it('nutrients validate and no prescription dose is a plain preset', () => {
    expect(researchNutrients.length).toBeGreaterThan(0);
    for (const n of researchNutrients) {
      expect(validateNutrient(n)).toEqual([]);
      const ul = n.upperLimit?.value;
      for (const p of n.logPresets) if (ul != null && p.mainAmount != null && p.mainAmount > ul) expect(p.prescriptionDose).toBe(true);
    }
  });

  it('exercises carry a MET and tags; guides validate', () => {
    for (const e of researchExercises) {
      expect(e.met).not.toBeNull();
      expect(e.tags.length).toBeGreaterThan(0);
    }
    for (const g of researchFitnessGuides) expect(validateGuidance(g)).toEqual([]);
  });

  it('aliases and links point at bundled items', () => {
    for (const id of Object.values(ingredientAliases)) expect(getIngredient(id)).toBeDefined();
    for (const list of Object.values(researchLinks.goodSourceDishes)) for (const g of list) if (g.dishId) expect(getDish(g.dishId)).toBeDefined();
    for (const id of Object.keys(researchLinks.microTable)) expect(getIngredient(id)).toBeDefined();
  });

  it('looks dishes up by id', () => {
    const first = researchDishes[0];
    expect(getDish(first.id)).toBe(first);
  });
});
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
| `users/{uid}/groceryLists/{id}` | Shopping list | — | planned (Day 9) | `ingredientId` |
| `users/{uid}/ratings/{id}` | The user's own dish rating | — | planned | `dishId` |

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
````


## 9. DEPENDENCIES

None.

## 10. HOW TO APPLY (for Sudarsan)

Run these from inside the `Fitplate` folder on your Mac.

**Option A (simplest): the code is already on the branch**
1. `git add -A && git commit -m "Before Day 05"` (skip this if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand.** Days 01 to 04 must be applied first.
1. `git add -A && git commit -m "Before Day 05"`
2. Create every NEW file from section 8 at its path, and replace every CHANGED file with the full version shown there. For the data files, run `node scripts/research/run.js --today 2026-10-15 --build Day05` with the four research folders next to the repo instead of copying them.
3. `npm test`, then `npx expo start -c`.

## 11. HOW TO TEST

**Quickest check: the live site** https://fitplateapp.netlify.app (it deploys this commit automatically). Today's work is data only, so the app should look and behave exactly as on Day 04.

**Manual checklist (web and iPhone)**
- [ ] **Nothing broke.** Guest flow, onboarding, logging a meal and water, sign-in, Profile → Your data all work as on Day 04. Web ☐ iPhone ☐
- [ ] **Cook tab still shows the demo dishes** (the research dishes appear on Day 6). Web ☐ iPhone ☐

**Automated (run in this session on 2026-10-15; real results)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems) |
| Unit tests | `npm test` | ✅ 18 suites, 362 tests passed (143 new) |
| Web bundle | `npx expo export -p web` | ✅ exported |
| Web click-through | Playwright (Chromium, 390×844) on the exported site | ✅ welcome → onboarding → Today → Cook, Track, Move, Profile → Your data; no page or console errors |
| Data sync | `node scripts/research/run.js --today 2026-10-15 --build Day05` | ✅ 10 dishes, 30 ingredients, 6 nutrients, 8 fitness items written; 0 invalid, 0 parse errors |

New tests cover: the Diet tags, Tags-line and both Diet-variants layouts; every tag rule (claims, Jain vs Jain option, sattvik and pescatarian checks, allergens, time bands, nutrition thresholds); family keys and research-linked families; the alias map (learning only from exact English-name hits, ambiguity, junk words); link stats; the micronutrient table and dish estimate with coverage; kcal from ingredients; good-source links; both "Used in" layouts and the 15% check; the nutrient importer (targets, UL, unit conversion, benfotiamine, prescription doses, ICMR default check, hydration drinks table, guidance, health conditions); the fitness importer (steps, MET options, angles, rep-counter phases, form checks, tags, burn-off minutes); and every bundled JSON loaded through the generated indexes.

## 12. KNOWN ISSUES, LIMITATIONS AND TODOs

- **The app still shows the demo dishes.** `researchData` stays OFF until Day 6 builds the Cook tab on the research data.
- **69 dish ingredient lines are unmatched**, mostly spices and flours with no ingredient research yet and oil lines worded as a choice. They link as the ingredient backlog clears; choice lines will link to the first named option on Day 8.
- **Micronutrient estimates are partial** for most dishes until ingredients get full profiles (research gap 2). Each estimate carries its weight coverage, and Day 7 shows "partial" when it is below 80%.
- **One cuisine tag is long:** Chicken Biryani's cuisine reads "Hyderabadi-style dum biryani". Day 6 will shorten cuisine tags to a known list.
- **Rep-counter phases written as ratios or positions** (two exercises) stay as text until Day 25.

## 13. USER ACTIONS ADDED TODAY

None.

Still open: the "Add vendor product links and prices to the daily ingredient research?" card in the auto-build thread (USER ACTION 4).

## 14. BUILD STATE

### Roadmap

| Day | Item | Status |
|---|---|---|
| 1 | Audit and architecture | ✅ done |
| 2 | Navigation shell | ✅ done |
| 3 | Data models and storage | ✅ done (layer + tests on Day 03; app wiring on Day 03b) |
| 4 | Research pipeline I (dishes, ingredients) | ✅ done (plus review fixes 1–3) |
| 5 | Research pipeline II (nutrients, hydration, fitness, cross-links) | ✅ done (plus tag engine and families, SPEC-ADDENDA §9; review fix 2 nutrient part) |
| 6 | Dish library (Cook tab), with search, multi-select filters, sort and diet tags (SPEC-ADDENDA §9) | ⬜ |
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
| `src/app/(tabs)/cook.tsx` | Day 2 |
| `src/app/(tabs)/track.tsx` | Day 2 |
| `src/app/(tabs)/move.tsx` | Day 2 |
| `src/app/(tabs)/me.tsx` | Day 2 |
| `src/app/(tabs)/discover.tsx` | Day 2 |
| `src/app/(tabs)/plan.tsx` | Day 2 |
| `src/app/(tabs)/progress.tsx` | Day 2 |
| `src/app/(tabs)/index.tsx` | Day 2 |
| `src/app/profile.tsx` | Day 4 |
| `src/components/ui.tsx` | Day 03b |
| `src/config/featureFlags.ts` | Day 03b |
| `src/services/activity.ts` | Day 2 |
| `src/__tests__/tabs.test.ts` | Day 2 |
| `src/__tests__/activity.test.ts` | Day 03b |
| `src/__tests__/config.test.ts` | Day 03b |
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
| `src/models/research.ts` | Day 5 |
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
| `src/services/data/dishImporter.ts` | Day 5 |
| `src/services/data/ingredientImporter.ts` | Day 5 |
| `src/services/data/allergens.ts` | Day 4 |
| `src/services/data/fasting.ts` | Day 4 |
| `src/services/data/buildItems.ts` | Day 5 |
| `src/services/data/priceTrend.ts` | Day 4 |
| `src/services/data/merge.ts` | Day 4 |
| `src/services/data/researchIndex.ts` | Day 5 |
| `src/data/research/index.ts` | Day 5 |
| `src/data/research/dishes/index.ts` | Day 5 |
| `src/data/research/ingredients/index.ts` | Day 5 |
| `src/services/storage/deleteUser.ts` | Day 4 |
| `src/app/your-data.tsx` | Day 4 |
| `src/components/ConfirmDeleteData.tsx` | Day 4 |
| `src/app/_layout.tsx` | Day 4 |
| `src/__tests__/data/priceTrend.test.ts` | Day 4 |
| `src/__tests__/data/merge.test.ts` | Day 4 |
| `src/__tests__/data/importers.test.ts` | Day 4 |
| `src/__tests__/data/researchData.test.ts` | Day 5 |
| `src/__tests__/storage/deleteUser.test.ts` | Day 4 |
| `src/models/nutrient.ts` | Day 5 |
| `src/models/exercise.ts` | Day 5 |
| `src/services/data/dietTags.ts` | Day 5 |
| `src/services/data/tags.ts` | Day 5 |
| `src/services/data/crossLinks.ts` | Day 5 |
| `src/services/data/nutrientImporter.ts` | Day 5 |
| `src/services/data/exerciseImporter.ts` | Day 5 |
| `src/__tests__/data/tags.test.ts` | Day 5 |
| `src/__tests__/data/crossLinks.test.ts` | Day 5 |
| `src/__tests__/data/nutrients.test.ts` | Day 5 |
| `src/__tests__/data/exercises.test.ts` | Day 5 |
| `src/data/research/nutrients/index.ts` | Day 5 |
| `src/data/research/hydration/index.ts` | Day 5 |
| `src/data/research/guidance/index.ts` | Day 5 |
| `src/data/research/conditions/index.ts` | Day 5 |
| `src/data/research/exercises/index.ts` | Day 5 |
| `src/data/research/fitness-guides/index.ts` | Day 5 |

### Feature flags

| Flag | Value | For |
|---|---|---|
| newTabShell | true (since Day 2) | Day 2 |
| researchData | false (dishes and ingredients since Day 4, nutrients and fitness since Day 5; turns on with the Cook tab) | Day 6 |
| cameraCheck | false | Day 12 (dev build) |
| voiceSteps | false | Day 12 |
| reminders | false | Day 17 / 33 |
| poseRepCounter | false | Day 26 (dev build) |
| paywall | false | Day 32 (everything free; open decision) |
| cloudSync | true (since Day 03b) | Firestore for signed-in users; false keeps their data on the device only |
| liteMode | true (since Day 03b) | Innovation: still backdrop instead of background videos (Reduce motion, Data Saver, 2G) |

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
| Dishes | FitPlate_Dishes_2026-10-08.md | 21–25 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-09.md | 26–30 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-04.md | 47 | Day 04 (rows 1–30), Day 05 (rows 31–47) |
| Ingredients | FitPlate_Ingredients_2026-10-05.md | 21 | Day 05 (rows 1–13); rows 14–21 backlog |
| Ingredients | FitPlate_Ingredients_2026-10-06.md | 10 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-07.md | 5 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-08.md | 7 | — (backlog) |
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
| Fitness | FitPlate_Fitness_2026-10-11.md | Home 3, Yoga 3, Gym 5, Gym 6 | — (backlog; recorded Day 03b) |
| Dishes | FitPlate_Dishes_2026-10-12.md | 41–45 (first with PATCH 03 Diet tags) | — (backlog; recorded Day 05) |
| Dishes | FitPlate_Dishes_2026-10-13.md | 46–50 (PATCH 04 tags and variants) | — (backlog; recorded Day 05) |
| Dishes | FitPlate_Dishes_2026-10-14.md | 51–55 | — (backlog; recorded Day 05) |
| Ingredients | FitPlate_Ingredients_2026-10-12.md | 2 (first v2 JSON profile) | — (backlog; recorded Day 05) |
| Fitness | FitPlate_Fitness_2026-10-15.md | arrived after the Day 05 sync | — (backlog; recorded Day 05) |

- **Machine ledger:** `src/data/research/ledger.json` lists every ingested version (item id, research date, file, build day). Nutrient and fitness keys are `kind:id` (`nutrient:vitamin-a`, `exercise:push-up`, `guidance:gym-basics`). The runner skips any version already there.
- **Backlog per stream (after Day 05):**
  - Dishes: 7 files / 35 items (21–55)
  - Ingredients: 7 files / 55 entries (8 left in 10-05, then 10-06 onwards)
  - Nutrients: 0 (no nutrient file after 10-11 visible yet)
  - Fitness: 1 file / 4 items (10-11), plus the 10-15 file
- **In the app:** 20 dishes, 60 ingredients, 6 nutrients, 4 exercises, 4 fitness guides. Every item has 1 version so far.
- **Catch-up plan:** at 10 dishes and 30 ingredients per run against about 5 new dishes and about 10 ingredient rows a day, the dish backlog clears in about 7 more runs and the ingredient backlog in about 3.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema:** all eight user collections are at version 1: `profile` (on `users/{uid}`), `mealLogs`, `waterLogs` (one document per day), `supplementLogs`, `workoutLogs`, `favourites`, `mealPlans` and `savings`. Every document has `id`, `createdAt`, `updatedAt`, `schemaVersion` and `deleted`. Day 03b added the optional `demoSample` to `Favourite`, `MealPlanDay` and `SavingEntry` (no version bump). Fields are listed in `docs/DATA_MODEL.md`.
- **Live since Day 03b:** guests on the device; signed-in users device first, then Firestore (`cloudSync` ON). The demo blob is migrated once into guest documents and kept as a backup. "Bring your data with you?" runs after sign-in. Sign-out clears the device only once everything reached the cloud.
- **Device keys:** `fitplate.docs.<owner>.<collection>.v1`, `fitplate.outbox.<owner>.v1`, `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`; the old `fitplate.state.v2` is a read-once backup.
- **Free-tier guard:** one pull per collection when the app opens for a signed-in user (no listeners yet); writes are debounced batches; water is one document per day; waiting writes are sent when the app goes to the background.
- **Rules:** owner-only (`firestore.rules`), live in the console since 2026-10-10. No top-level collection added.
- **Delete my data (Day 04, review fix 3):** deletes every document under `users/{uid}` (collections from `SCHEMAS`, batches of ≤500, profile last) and the device copy, then signs out. The Firebase Auth account is removed on Day 34.
- **Research content:** bundled JSON in `src/data/research/` since Day 4 (nutrients, hydration, guidance, conditions, exercises and fitness guides since Day 5); never in Firestore. User documents refer to it by id (`dishId`, `ingredientId`, `nutrientId`, `exerciseId`).
- **USER ACTION:** none open.

### Research gaps

1. Dishes 1–20 (files 10-04 to 10-07) have no "AS ORDERED (from delivery apps)" block, and no Diet tags, Tags line or variants (PATCH 03 and 04 start at dish 41). Their Vegan/Jain/option tags and as-ordered nutrition stay empty until each dish is re-researched.
2. Ingredients from the files dated 10-04 to 10-11 lack the full per-100 g nutrient-profile JSON (the v2 profile starts 10-12). Dish micronutrient estimates are partial until each is re-priced.
3. Spices, flours and sauces used by dishes 1–20 have no ingredient research yet: whole wheat flour (atta), carom seeds, cumin powder, dry mango powder, sambar powder, pav bhaji masala, chole masala, light soy sauce, white vinegar, black pepper, jaggery, kidney beans, cauliflower, pav. 69 dish lines wait on these.
4. 51 foods in the vitamin food-source tables have no ingredient research (e.g. goat liver, amla, amaranth leaves, chicken liver, almonds).
5. Health-condition profiles: none visible yet (nutrition research added them from 2026-10-12, but no nutrient file after 10-11 is in the folder). Needed first for the survey's health page: type 2 diabetes, high blood pressure, high cholesterol, PCOS, hypothyroidism, fatty liver, chronic kidney disease, pregnancy, anaemia, gout.
6. ICMR-NIN has no separate 60+ value for the six vitamins, and none for Vitamin E and K in pregnancy and lactation. Defaults are null; Day 16 needs a researched fallback rule.
7. Images: no dish, ingredient or exercise image exists yet (SPEC-ADDENDA §8). Placeholders will be labelled from Day 6.
8. Dish order prices come from search-result snapshots, because delivery-app pages block direct access.
9. Mustard oil and sesame oil have no ingredient price yet.
- Resolved on Day 05: "dish research has no allergen line" (PATCH 03 adds "Allergens declared", read today). Standby: "thali component nutrition" (office canteen idea, parked by Sudarsan).

### IDEAS BACKLOG (ranked by impact ÷ effort; S = 1, M = 2, L = 3)

| Rank | Idea | Type | Impact | Effort | Score | Needs | Status |
|---|---|---|---|---|---|---|---|
| 1 | Fridge rescue | NEW FEATURE | 4 | S | 4.0 | Dish library (Day 6) | approved by Sudarsan 2026-10-10; build after Day 6 |
| 2 | Allergy filter ("Contains peanut" chip + optional hide) | IMPROVE | 4 | S | 4.0 | "Contains …" tags (built Day 05) + dish library (Day 6) | new Day 04; part of Day 6 filters |
| 3 | "Make it Jain" switch on a dish | IMPROVE | 4 | S | 4.0 | Researched variants (parsed Day 05) + dish detail (Day 7) | new Day 05 |
| 4 | Vitamin source finder (good sources you can cook) | NEW FEATURE | 4 | S | 4.0 | Good-source links (built Day 05) + vitamin tracking (Day 18) | new Day 05 |
| 5 | Protein per ₹ | IMPROVE | 4 | S | 4.0 | Cost to make (Day 8) | new (supervisor review 2026-10-11) |
| 6 | Savings goal jar | NEW FEATURE | 4 | S | 4.0 | `savings` collection; fits Day 14 | new (supervisor review 2026-10-11) |
| 7 | Kettle and one-burner cooking (PG/hostel kitchen preset) | IMPROVE | 4 | S | 4.0 | Dish equipment data + kitchen profile (Day 10) | new Day 03b; build after Day 10 |
| 8 | Monsoon swap | IMPROVE | 3 | S | 3.0 | Price engine (built Day 04) and cost to make (Day 8) | approved by Sudarsan 2026-10-10; build after Day 8 |
| 9 | Late-night craving helper | NEW FEATURE | 3 | S | 3.0 | Dish library (Day 6) | new Day 03b |
| 10 | Desk-break movement card | NEW FEATURE | 3 | S | 3.0 | Exercise tags (built Day 05) + more desk-friendly items | new Day 05 |
| — | Lite mode (still backdrop on Reduce motion, Data Saver, 2G) | IMPROVE | 3 | S | 3.0 | none | **built on Day 03b** (`liteMode` flag ON) |
| 11 | Fasting mode | NEW SEGMENT | 4 | M | 2.0 | Dish fasting field (validated since Day 04) + fasting tags (Day 05) | approved by Sudarsan 2026-10-10; build once enough dishes carry it |
| 12 | Parents' plate | NEW SEGMENT | 4 | M | 2.0 | Ingredient sodium and sugar data (exists, partial) | approved by Sudarsan 2026-10-10 |
| 13 | Tomorrow's tiffin (pack dinner for lunch) | NEW FEATURE | 4 | M | 2.0 | Cook mode (Day 11–12), dish storage advice, order prices | new Day 03b |
| 14 | Batch-cook Sunday | NEW FEATURE | 4 | M | 2.0 | Linked ingredients (308 of 406 lines, Day 05) + shopping list (Day 9) | new Day 04 |
| 15 | Vitamin gap → dish nudge | IMPROVE | 4 | M | 2.0 | Nutrient data (Day 05) + vitamin tracking (Day 18); manual half is idea 4 | new (supervisor review 2026-10-11) |
| 16 | Cook-prep reminders (soak, marinate, defrost) | IMPROVE | 4 | M | 2.0 | Step timers (exist) + Reminders (Day 33) | new Day 05 (reminders innovation) |
| 17 | Price-drop nudge for your staples | IMPROVE | 3 | M | 1.5 | Price engine trend (built Day 04), 2+ price versions, Day 8 | new Day 04 |
| 18 | Filter memory per family member | IMPROVE | 3 | M | 1.5 | Tags (Day 05) + filters (Day 6) | new Day 05 |
| — | Office canteen builder | IMPROVE | 5 | M | — | New thali-component research | **STANDBY / TODO** (Sudarsan, 2026-10-10: on hold, he has bigger plans for tracking meals at the office; do not build or research) |

### TODO / STANDBY (Sudarsan's parked items; never build these until he says so)

- **Office canteen thali builder / office meal tracking** (idea 3, parked 2026-10-10). Sudarsan has bigger plans for tracking meals in office workspaces. Keep it here; new ideas about office meals should be added under this item, not built.

### USER ACTIONS (cumulative)

| # | Action | Added | Status |
|---|---|---|---|
| 1 | Create Firestore (asia-south1, Spark) and publish `firestore.rules` | Day 2 | closed: done by Sudarsan (database 2026-10-09, rules 2026-10-10) |
| 2 | Decision: research for thali components (idea 3) | Day 3 | closed: on standby by Sudarsan (2026-10-10); stays in the to-do list |
| 3 | Decision: fasting-suitability field in dish research (idea 4) | Day 3 | closed: approved (2026-10-10); dish research PROMPT_PATCH_02 adds it from dish 36 (SPEC-ADDENDA §6) |
| 4 | Decision: add per-vendor product name, price, pack size and link (Zepto, Instamart, Blinkit) to the daily ingredient research, for Day 15G1 (SPEC-ADDENDA §7) | 2026-10-10 (grocery supplement) | open: decision card posted in the auto-build thread; recommended "Add them" |

**Next up: Day 06: Dish library (Cook tab) on the research data (`researchData` ON): app-wide search, multi-select filters and sort (SPEC-ADDENDA §9) using today's tags, the allergy filter, diet tags on every card, labelled image placeholders, accurate order prices (average with range and date). The data sync continues with dishes 21–30, the next 30 ingredients, the last 4 fitness items from 10-11 and the 10-15 fitness file.**

