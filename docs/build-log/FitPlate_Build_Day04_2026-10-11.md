# FitPlate Build — Day 04 — 2026-10-11 (evening run)

## 1. HEADER

**Day 04 of 37 | Roadmap item: Research pipeline I (dishes and ingredients) | Phase 0: Foundation and data pipeline | Progress: 11% of the full app (4 ÷ 37)**

**Status: DONE.** Commit `a593334` is pushed to `claude/project-thread-wchnlm`, and Netlify deploys it to https://fitplateapp.netlify.app.

- **How this run's day was determined:**
  - The newest build file is `FitPlate_Build_Day03b_2026-10-11.md`. Its BUILD STATE marks Day 3 ✅ and says "Next up: Day 04".
  - This is the 22:52 IST evening run. There was one build file for 2026-10-11 (Day 03b), fewer than two, so the run went ahead.
- **Supervisor review:** `FitPlate_Review_2026-10-11.md` (14:52 IST) appeared after the morning run, so this is the first run after it. Its FIX LIST (3 items) was done in full alongside Day 04; see section 3a. ROADMAP SUGGESTIONS were ignored, as the spec says.
- **Context available:**
  - Code source **(a)**: branch `claude/project-thread-wchnlm` at 8df1b5a (Day 03b).
  - Spec: `PROMPT.md` and `SPEC-ADDENDA.md` §1, §2 and §4 to §7.
  - Research files visible: Dishes 8 (2026-10-04 … 2026-10-11), Ingredients 8 (same dates), Nutrients 3 (2026-10-09 … 2026-10-11), Fitness 3 (same). No new files since Day 03b.

## 2. SUMMARY

1. **Research now flows into the app.** Two importers read the daily dish and ingredient research files and turn each dish or ingredient into its own data file inside the app. Tonight they brought in the first 10 dishes (Poha to Veg Fried Rice) and the first 30 ingredients, with prices, steps, nutrition and the three separate scores. The app keeps showing the demo dishes until Day 6 switches the Cook tab over.
2. **Prices follow the trend, not a plain average.** Every price goes through the new price trend engine. When research repeats, it weighs recent prices more, spots spikes, and says whether a price is rising or falling. Ranges wider than 30% are narrowed around the average, and never below what a source actually showed.
3. **Allergens are tagged (review fix 1).** Every dish now lists its allergens (peanut, tree nuts, milk, egg, fish, shellfish, gluten, soy, sesame, mustard), worked out from its ingredients. Hing counts as gluten unless it says gluten-free. A "gluten-free", "vegan" or "dairy-free" claim that the recipe contradicts is dropped and flagged, e.g. dish 26 Moong Dal Chilla's "gluten-free".
4. **Fasting lines are checked (review fix 2).** A Jain, Navratri or Ekadashi "yes" that the recipe contradicts is set to "not checked" and flagged, e.g. dish 39 Veg Biryani keeps ginger in a Jain version.
5. **Your data and Delete my data (review fix 3).** A new "Your data" screen, linked from the welcome screen and Profile, says in plain words what is saved, where, and how to remove it. Signed-in users get "Delete my data" in Profile: it deletes everything in their cloud space and on the phone, then signs them out.

## 3. DATA SYNC REPORT

- **New research files since Day 03b:** none. The backlog was ingested oldest first within the caps.
- **Ingested this run** (each version identified by item id + research date; ledger in `src/data/research/ledger.json`):

  | Stream | Files | Items ingested | Backlog before → after |
  |---|---|---|---|
  | Dishes | 10-04, 10-05 | 10: 1 Poha, 2 Chicken Biryani, 3 Paneer Butter Masala, 4 Masala Dosa, 5 Dal Tadka, 6 Upma, 7 Butter Chicken, 8 Chole (Chana Masala), 9 Idli with Sambar, 10 Veg Fried Rice | 40 → 30 |
  | Ingredients | 10-04 (first 30 of 47 rows) | 30: flattened-rice-thick, basmati-rice-everyday-grade, idli-rice-parboiled-rice, toor-dal, urad-dal-split-skinned, chana-dal, peanuts-raw, cashew-nuts-whole, onion, tomato, potato, green-chilli, ginger, garlic, lemon, coriander-leaves, mint-leaves, curry-leaves, chicken-curry-cut-bone-in-skinless, paneer, ginger-garlic-paste, milk-toned, curd-plain, butter-salted, fresh-cream, ghee-cow, cooking-oil-refined-sunflower-groundnut, turmeric-powder, red-chilli-powder, kashmiri-red-chilli-powder | 113 → 83 |
  | Nutrients | — | importer starts Day 5 | 6 topics |
  | Fitness | — | importer starts Day 5 | 12 items |

- **Every ingested item validated** (name, ingredients, steps, calories for dishes; name and an ordered price for ingredients). Nothing was rejected; no parse errors.
- **Parsed but not yet ingested (dry run over the whole backlog):** all 40 dishes and all 113 ingredient rows parse. The validators already flag 2 backlog dishes, which will show under "needs review" when they are ingested:
  - **026 Moong Dal Chilla (10-09):** "gluten-free" claim dropped; the recipe uses hing (counts as gluten).
  - **039 Veg Biryani (10-11):** Jain "With changes" set to not checked; the recipe keeps ginger(-garlic paste) and the line says "with hing and ginger".
  - The "vegan" mentions in 31, 34 and 40 are denials ("not vegan") or variations ("vegan if made with peanut oil"), so they are correctly not treated as claims.
- **Merges:** none yet. Every ingested item has 1 version, so the price engine used method "single" and the stable fields took that version.
- **Price notes (engine output):**
  - Dish order ranges wider than 30% of the average were narrowed around the average: Chicken Biryani ₹120–360 → **₹190–260** (avg ₹230; the research itself reports two tiers), Dal Tadka ₹140–200 → ₹150–200, Upma ₹90–140 → ₹100–130, Chole ₹230–320 → ₹240–320, Idli with Sambar ₹70–100 → **₹70–90**.
  - Idli's ±15% band rounded to ₹60–90, below the cheapest price any source showed, so the range is clamped to observed prices (₹70–90). This clamp is new tonight and applies to every item.
  - Ingredients narrowed the same way: coriander leaves, curry leaves, mint leaves, ginger (₹45–120, only 2 sources), ginger-garlic paste, lemon, urad dal.
  - Seasonal produce flagged for spike checks: onion, tomato, potato, green chilli, coriander leaves, lemon.
  - Trends: all "unknown" until a second version arrives (ingredients re-price on the 20-day cycle).
- **Order-price averages:** the importer reads the average of the narrowed range, not the "average of all N prices" of the full spread (e.g. Poha ₹130, not ₹87). Where a file gives no average for the range, the engine uses the midpoint.
- **Allergens found in the 10 dishes:** peanut 7 (mostly groundnut oil), milk 5, gluten 5 (hing in 4, soy sauce in 1), mustard 5, tree nuts 3, sesame 1, soy 1. Egg, fish and shellfish: none in these 10.
- **Needs review (ingested items):** none.
- **As-ordered:** dishes 1–10 have no "AS ORDERED" block (files 10-04 and 10-05), so `asOrdered` is null, per SPEC-ADDENDA §1.
- **Fasting:** dishes 1–10 have no Fasting suitability block, so `fasting` is null.
- **Unmatched ingredient names:** 97 of 203 dish ingredient lines link to an ingested ingredient id. The rest are spices and items not ingested yet (17 ingredients from 10-04 remain), or need the alias map (Day 5), e.g. "Groundnut oil (or any neutral cooking oil)" vs `cooking-oil-refined-sunflower-groundnut`.
- **Nutrition per 100 g:** the 30 ingredients come from the 10-04 file, which has no JSON nutrient profile, so `nutritionPer100g` stays null. Their one-line estimates are kept separately in `macrosPer100Estimate` (two ranges such as curd "carbs 3.0–4.0 g" stay null rather than guessed).

### 3a. Supervisor review FIX LIST (FitPlate_Review_2026-10-11.md)

| # | Fix | Done? | Notes |
|---|---|---|---|
| 1 | Allergen tags and unsafe diet claims | ✅ done | `allergens: AllergenId[]` on `Dish`; map in `src/services/data/allergens.ts` (hing = gluten unless "gluten-free hing"; oats flagged as a safety note); claims checked in the header line and Quick facts; "vegan if…", "not vegan" and "makes it vegan" are not claims; 22 unit tests. The "Contains: …" line on the dish card and detail comes on Day 6/7, as the review says. |
| 2 | Fasting validator (dish part) | ✅ done | Jain yes / with-changes must skip every onion, garlic, potato, carrot, beetroot, radish, fresh ginger or fresh turmeric the recipe keeps (dry ginger and turmeric powder are fine); Navratri / Ekadashi yes with grains, onion or garlic → null + needs review. Fasting flours (kuttu, samak, rajgira, sabudana) pass. Catches dish 39. |
| 2 | Fasting validator (nutrient part: benfotiamine conversion, prescription doses above the UL, ICMR default target) | ⏭ moved to Day 5 | The nutrient importer is built on Day 5; these rules go in it with their tests. |
| 3 | Privacy notice and Delete my data | ✅ done | "Your data" screen (`/your-data`), linked from the welcome small print and Profile; "Delete my data" for signed-in users with a confirm step; 9 tests against a mocked Firestore. The Firebase sign-in account itself (name, email, photo) is removed on Day 34; the screen says so. |

Also from the review: the stale "Research gaps" list is fixed (gap 6, fasting, was resolved by PROMPT_PATCH_02; gap 5, thali components, is on standby), and its three NEW ideas are in the IDEAS BACKLOG.

## 4. DESIGN NOTES

### "Your data" screen (new, `/your-data`)
- Header "Your data" with a back button; intro "What FitPlate keeps about you, where it lives, and how to remove it. In plain words."
- **What we save:** a card listing profile, meals, water, workouts, favourites, meal plans and savings, each with an emoji and one plain line.
- **Where it's saved:**
  - Signed in: your own private space in Google Firebase (Cloud Firestore); India region (Mumbai, asia-south1); private to your account (Firebase access rules let only your account read or change it in the app, and FitPlate's owner can see stored data in the Firebase console to run the service); a copy stays on the phone for offline use.
  - Guest: only on this device; we ask before copying anything into an account later.
- **What is not personal:** dishes, prices and nutrition facts are research content bundled with the app, the same for everyone.
- **How to remove it:** Profile → Delete my data (signed in), or Reset demo data / clearing the app (guest).
- Footer: "General information about how this app handles your data, not legal advice."
- Welcome screen: a "Your data" link on its own line under the small print (88×44 tap area).

### Profile
- A "Your data" row for everyone.
- Signed in with cloud on: an outlined red **Delete my data** button. It opens a modal: 🗑️ **Delete all your FitPlate data?** "This permanently deletes your profile, meal, water and workout logs, saved dishes, meal plans and savings, from the cloud and from this device. It can't be undone. You'll be signed out afterwards." Buttons: **Delete everything** (red) and **Cancel**. While working: spinner and "Deleting…". If the cloud can't be reached: "Couldn't reach the cloud. Nothing was deleted. Check your connection and try again." On success the app returns to the welcome screen.

### Data decisions behind the importers
- **The research files stay the source of truth.** Every run rebuilds each ingested item from all its versions, so the bundled JSON can always be regenerated: `npm run research:sync -- --today YYYY-MM-DD --build DayNN`.
- **Null means not found.** Nothing is estimated: a missing average stays null (the engine uses the range midpoint and says so), a range like "3.0–4.0 g" stays null.
- **Allergens lean safe.** "Groundnut / sunflower oil" counts as peanut; compounded hing as gluten. The list means "detected", never "allergen-free", and the app will always add "Check labels if you have an allergy".
- **Validators never rewrite research text.** A contradicted fasting line keeps its reason; only the status becomes null ("not checked").

## 5. INNOVATION

New ideas this run:

1. **Allergy filter** · IMPROVE (Day 6 dish library) · Impact 4 · Effort S
   - **Problem:** "My son is allergic to peanuts and half of these recipes use groundnut oil without saying so." This hits families with a peanut, milk or gluten allergy, and anyone avoiding gluten.
   - **Solution:** in the profile, tick allergies; the dish library shows a small "Contains peanut" chip, and an optional "hide dishes with my allergens" switch (off by default). Never claims a dish is safe.
   - **Data:** the new `allergens` field (built tonight). No new research.
   - **Risk:** false safety. The copy must say "detected from the recipe; check labels".
2. **Batch-cook Sunday** · NEW FEATURE · Impact 4 · Effort M (after Day 9)
   - **Problem:** "I want to cook for the week on Sunday but planning three dishes, one shopping trip and the order to cook them takes me an hour."
   - **Solution:** pick 2–3 dishes; FitPlate merges their shopping lists (shared onions, tomatoes, ginger-garlic paste counted once) and suggests a cook order that reuses the hot pan and the pressure cooker, with each dish's researched storage time.
   - **Data:** dish ingredients linked to canonical ingredient ids (started tonight), equipment and storage (researched).
   - **Risk:** food safety; storage times come only from the research.
3. **Price-drop nudge for your staples** · IMPROVE · Impact 3 · Effort M (after Day 8, once prices have 2+ versions)
   - **Problem:** "Tomatoes went from ₹40 to ₹100 and I only noticed at the shop."
   - **Solution:** when the price engine marks an ingredient you often cook with as falling (or a spike has passed), Today shows "Tomatoes are back to about ₹40/kg: a good week for Chole". Spikes show the Monsoon swap instead.
   - **Data:** the price engine's trend and spike flags (built tonight), meal logs.
   - **Risk:** stale prices; only shown when `stale` is false.

From the supervisor review (added to the backlog, not built): Protein per ₹, Vitamin gap → dish nudge, Savings goal jar.

**Built today:** none. The run went into the review's three fixes alongside Day 04, and the top ideas need the dish library (Day 6) or cost to make (Day 8) first.

## 6. DATABASE (SPEC-ADDENDA §5)

- **What changed today:** "Delete my data" (review fix 3). For a signed-in user it sends any waiting changes, lists every collection in `SCHEMAS` from the server (so it fails fast when offline), deletes all their documents in batches of up to 500, deletes `users/{uid}` last (so a dropped connection leaves the profile and the user can retry), clears the device copy and the "bring your data" answer, then signs out. Each cloud step times out after 20 s.
- **Adapter:** `RemoteAdapter` gained `deleteMany(paths)` and an optional `getCollection(path, { fromServer })`.
- **Schema:** no user collection changed; no `schemaVersion` bump; no rules change.
- **Research content:** the bundled research JSON started tonight (10 dishes, 30 ingredients). It is never written to Firestore; user documents refer to it by id only.
- **Free-tier guard:** a delete costs one read per document plus one delete per document, once. Normal use is unchanged.
- **Tests:** 9 new delete tests against the mocked Firestore (two users, empty user, 1,205 documents → 4 batches, offline, timeout, device-only no-op).
- **Not covered by the delete (said on the screen):** the Firebase sign-in account itself (Day 34), and subcollections not listed in `SCHEMAS` (there are none today).
- **USER ACTION:** none.

## 7. DATA FILES

Generated by `scripts/research/run.js`; rebuild them any time from the research files. 40 JSON files plus the ledger and two generated indexes:

- `src/data/research/dishes/001-poha.json` (NEW)
- `src/data/research/dishes/002-chicken-biryani.json` (NEW)
- `src/data/research/dishes/003-paneer-butter-masala.json` (NEW)
- `src/data/research/dishes/004-masala-dosa.json` (NEW)
- `src/data/research/dishes/005-dal-tadka.json` (NEW)
- `src/data/research/dishes/006-upma.json` (NEW)
- `src/data/research/dishes/007-butter-chicken.json` (NEW)
- `src/data/research/dishes/008-chole-chana-masala.json` (NEW)
- `src/data/research/dishes/009-idli-with-sambar.json` (NEW)
- `src/data/research/dishes/010-veg-fried-rice.json` (NEW)
- `src/data/research/ingredients/basmati-rice-everyday-grade.json` (NEW)
- `src/data/research/ingredients/butter-salted.json` (NEW)
- `src/data/research/ingredients/cashew-nuts-whole.json` (NEW)
- `src/data/research/ingredients/chana-dal.json` (NEW)
- `src/data/research/ingredients/chicken-curry-cut-bone-in-skinless.json` (NEW)
- `src/data/research/ingredients/cooking-oil-refined-sunflower-groundnut.json` (NEW)
- `src/data/research/ingredients/coriander-leaves.json` (NEW)
- `src/data/research/ingredients/curd-plain.json` (NEW)
- `src/data/research/ingredients/curry-leaves.json` (NEW)
- `src/data/research/ingredients/flattened-rice-thick.json` (NEW)
- `src/data/research/ingredients/fresh-cream.json` (NEW)
- `src/data/research/ingredients/garlic.json` (NEW)
- `src/data/research/ingredients/ghee-cow.json` (NEW)
- `src/data/research/ingredients/ginger-garlic-paste.json` (NEW)
- `src/data/research/ingredients/ginger.json` (NEW)
- `src/data/research/ingredients/green-chilli.json` (NEW)
- `src/data/research/ingredients/idli-rice-parboiled-rice.json` (NEW)
- `src/data/research/ingredients/kashmiri-red-chilli-powder.json` (NEW)
- `src/data/research/ingredients/lemon.json` (NEW)
- `src/data/research/ingredients/milk-toned.json` (NEW)
- `src/data/research/ingredients/mint-leaves.json` (NEW)
- `src/data/research/ingredients/onion.json` (NEW)
- `src/data/research/ingredients/paneer.json` (NEW)
- `src/data/research/ingredients/peanuts-raw.json` (NEW)
- `src/data/research/ingredients/potato.json` (NEW)
- `src/data/research/ingredients/red-chilli-powder.json` (NEW)
- `src/data/research/ingredients/tomato.json` (NEW)
- `src/data/research/ingredients/toor-dal.json` (NEW)
- `src/data/research/ingredients/turmeric-powder.json` (NEW)
- `src/data/research/ingredients/urad-dal-split-skinned.json` (NEW)
- `src/data/research/ledger.json` (NEW)

Samples in full:

### `src/data/research/dishes/001-poha.json`

```json
{
  "id": "001-poha",
  "number": 1,
  "name": "Poha",
  "cuisine": "Maharashtrian (Mumbai-style kanda poha), also eaten across Madhya Pradesh and Gujarat",
  "dietType": "veg",
  "mealType": [
    "breakfast"
  ],
  "difficulty": "Beginner",
  "prepMin": 10,
  "cookMin": 8,
  "servings": 1,
  "ingredients": [
    {
      "ingredientId": "flattened-rice-thick",
      "name": "Flattened rice, thick (poha)",
      "quantity": 60,
      "unit": "g",
      "householdMeasure": "¾ cup"
    },
    {
      "ingredientId": null,
      "name": "Groundnut oil (or any neutral cooking oil)",
      "quantity": 10,
      "unit": "ml",
      "householdMeasure": "2 tsp"
    },
    {
      "ingredientId": "peanuts-raw",
      "name": "Peanuts (moongphali), raw",
      "quantity": 10,
      "unit": "g",
      "householdMeasure": "1 tbsp"
    },
    {
      "ingredientId": null,
      "name": "Mustard seeds (rai)",
      "quantity": 1,
      "unit": "g",
      "householdMeasure": "¼ tsp"
    },
    {
      "ingredientId": null,
      "name": "Cumin seeds (jeera)",
      "quantity": 0.5,
      "unit": "g",
      "householdMeasure": "⅛ tsp (optional)"
    },
    {
      "ingredientId": "curry-leaves",
      "name": "Curry leaves (kadi patta)",
      "quantity": 1,
      "unit": "g",
      "householdMeasure": "6–8 leaves (1 small sprig)"
    },
    {
      "ingredientId": "green-chilli",
      "name": "Green chilli (hari mirch)",
      "quantity": 5,
      "unit": "g",
      "householdMeasure": "1 small chilli"
    },
    {
      "ingredientId": "onion",
      "name": "Onion (kanda/pyaz)",
      "quantity": 60,
      "unit": "g",
      "householdMeasure": "½ medium onion, finely chopped (about ⅓ cup)"
    },
    {
      "ingredientId": "turmeric-powder",
      "name": "Turmeric powder (haldi)",
      "quantity": 0.5,
      "unit": "g",
      "householdMeasure": "⅛ tsp"
    },
    {
      "ingredientId": null,
      "name": "Salt (namak)",
      "quantity": 1.5,
      "unit": "g",
      "householdMeasure": "¼ tsp (scant)"
    },
    {
      "ingredientId": null,
      "name": "Sugar (cheeni)",
      "quantity": 2,
      "unit": "g",
      "householdMeasure": "½ tsp"
    },
    {
      "ingredientId": "lemon",
      "name": "Lemon (nimbu) juice",
      "quantity": 5,
      "unit": "ml",
      "householdMeasure": "1 tsp (from about ¼ lemon)"
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
      "name": "Water",
      "quantity": 1,
      "unit": "cup",
      "householdMeasure": null
    }
  ],
  "equipment": [
    "Kadai or wide frying pan with a lid",
    "Colander or large sieve",
    "Mixing bowl",
    "Chopping board and knife",
    "Spatula (flat steel or wooden)",
    "Measuring spoons and a measuring cup (a regular tea cup and teaspoons work as a stand-in)",
    "Lemon squeezer (optional)"
  ],
  "steps": [
    {
      "n": 1,
      "title": "Measure the poha",
      "text": "Put 60 g (¾ cup) thick poha into the colander.",
      "timerSec": 30,
      "tip": "Pick out any husk or small stones you see.",
      "visualCue": "Flakes are whole and not broken into dust.",
      "cameraCheck": "The colander with ¾ cup of dry poha",
      "videoShot": "The poha pouring from the cup into the colander."
    },
    {
      "n": 2,
      "title": "Rinse the poha",
      "text": "Hold the colander under running tap water and gently turn the flakes with your fingers so all of them get wet.",
      "timerSec": 20,
      "tip": "Do not soak the poha in a bowl of water. That is the main reason poha turns mushy.",
      "visualCue": "Every flake looks wet and a shade brighter. The water running off is mostly clear.",
      "cameraCheck": "The wet poha in the colander",
      "videoShot": "Water running over the poha while fingers turn it."
    },
    {
      "n": 3,
      "title": "Drain the poha",
      "text": "Shake the colander 2–3 times and leave it over a bowl to drain.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "No water is dripping out any more.",
      "cameraCheck": "The colander resting over the bowl",
      "videoShot": "The colander being shaken and set down."
    },
    {
      "n": 4,
      "title": "Season and rest the poha",
      "text": "Sprinkle 1.5 g (¼ tsp) salt, 2 g (½ tsp) sugar and 0.5 g (⅛ tsp) turmeric over the damp poha. Toss gently with your fingertips, then leave it to rest.",
      "timerSec": 30,
      "tip": "Adding the turmeric now, not in the pan, gives an even colour without stirring the poha too much later.",
      "visualCue": "The flakes turn an even pale yellow.",
      "cameraCheck": "The yellow poha in the colander",
      "videoShot": "The spices sprinkling over the poha, then a gentle toss."
    },
    {
      "n": 5,
      "title": "Chop the onion",
      "text": "Finely chop 60 g (½ medium) onion.",
      "timerSec": 120,
      "tip": null,
      "visualCue": "Small, even pieces about the size of a grain of rice or a lentil.",
      "cameraCheck": "⅓ cup of chopped onion on the board",
      "videoShot": "The knife chopping the onion into small dice."
    },
    {
      "n": 6,
      "title": "Chop the chilli",
      "text": "Slit 1 green chilli (5 g) and cut it into small pieces.",
      "timerSec": 30,
      "tip": "Want it less hot? Remove the seeds first.",
      "visualCue": "Thin rings or small bits",
      "cameraCheck": "The chopped chilli on the board",
      "videoShot": "The knife cutting the chilli."
    },
    {
      "n": 7,
      "title": "Prepare the herbs",
      "text": "Wash 6–8 curry leaves and pat them dry. Chop 5 g (1 tbsp) coriander leaves.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "The curry leaves are dry, so they won't splutter.",
      "cameraCheck": "The curry leaves and chopped coriander side by side",
      "videoShot": "The coriander being chopped."
    },
    {
      "n": 8,
      "title": "Cut the lemon",
      "text": "Cut ¼ of a lemon and keep it ready.",
      "timerSec": 15,
      "tip": null,
      "visualCue": "A juicy wedge",
      "cameraCheck": "The lemon wedge",
      "videoShot": "The knife cutting the lemon wedge."
    },
    {
      "n": 9,
      "title": "Heat the oil",
      "text": "Put the kadai on medium heat and add 10 ml (2 tsp) oil.",
      "timerSec": 60,
      "tip": null,
      "visualCue": "The oil shimmers and flows easily when you tilt the pan.",
      "cameraCheck": "The kadai with oil",
      "videoShot": "The oil swirling in the pan."
    },
    {
      "n": 10,
      "title": "Fry the peanuts",
      "text": "Add 10 g (1 tbsp) peanuts and stir.",
      "timerSec": 90,
      "tip": "Take them out with a spoon and set aside if you want them extra crunchy. Otherwise leave them in.",
      "visualCue": "The skins darken a little, the peanuts smell nutty and turn crunchy.",
      "cameraCheck": "Golden peanuts in the pan",
      "videoShot": "The peanuts being stirred in the oil."
    },
    {
      "n": 11,
      "title": "Add the mustard seeds",
      "text": "Add 1 g (¼ tsp) mustard seeds.",
      "timerSec": 20,
      "tip": null,
      "visualCue": "The seeds crackle and pop.",
      "cameraCheck": "Popping seeds in the pan",
      "videoShot": "The mustard seeds spluttering."
    },
    {
      "n": 12,
      "title": "Add the cumin",
      "text": "Add 0.5 g (⅛ tsp) cumin seeds (optional).",
      "timerSec": 10,
      "tip": null,
      "visualCue": "The cumin sizzles and darkens slightly.",
      "cameraCheck": "The pan",
      "videoShot": "The cumin sizzling."
    },
    {
      "n": 13,
      "title": "Add the curry leaves and chilli",
      "text": "Add the curry leaves and green chilli.",
      "timerSec": 20,
      "tip": "Stand back. Wet leaves splutter hard.",
      "visualCue": "A loud splutter, then the leaves turn crisp and glossy.",
      "cameraCheck": "The leaves and chilli in the oil",
      "videoShot": "The leaves hitting the oil."
    },
    {
      "n": 14,
      "title": "Sauté the onion",
      "text": "Add the chopped onion and stir.",
      "timerSec": 120,
      "tip": null,
      "visualCue": "The onion turns soft and translucent, not brown.",
      "cameraCheck": "The soft onions in the pan",
      "videoShot": "The onions being stirred."
    },
    {
      "n": 15,
      "title": "Check the poha",
      "text": "Press a flake between your fingers.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "It squashes easily but holds its shape and is not pasty. If it still feels hard, sprinkle 1 tbsp water over it and wait 2 min.",
      "cameraCheck": "A flake pressed between your fingers",
      "videoShot": "Fingers pressing a flake."
    },
    {
      "n": 16,
      "title": "Add the poha",
      "text": "Turn the heat to low and add the rested poha to the pan.",
      "timerSec": 10,
      "tip": null,
      "visualCue": "A yellow pile sitting over the onions",
      "cameraCheck": "The pan with the poha added",
      "videoShot": "The poha sliding into the pan."
    },
    {
      "n": 17,
      "title": "Mix the poha",
      "text": "Fold gently from the bottom with the spatula until the onions and peanuts spread through it.",
      "timerSec": 60,
      "tip": "Lift and fold. Do not press or mash.",
      "visualCue": "Even yellow colour with no white patches. The flakes are still separate.",
      "cameraCheck": "The mixed poha",
      "videoShot": "The spatula gently folding the poha."
    },
    {
      "n": 18,
      "title": "Steam the poha",
      "text": "Cover with the lid and cook on low heat.",
      "timerSec": 120,
      "tip": null,
      "visualCue": "Steam on the inside of the lid, and the poha looks soft and fluffy when you open it.",
      "cameraCheck": "The covered pan",
      "videoShot": "The lid going on, then coming off to show steam."
    },
    {
      "n": 19,
      "title": "Add the lemon",
      "text": "Switch off the heat. Squeeze 5 ml (1 tsp) lemon juice over the poha.",
      "timerSec": 15,
      "tip": "Add lemon only after the heat is off. Cooked lemon turns bitter.",
      "visualCue": "The juice is spread over the top.",
      "cameraCheck": "The lemon being squeezed over the pan",
      "videoShot": "Lemon juice dripping over the poha."
    },
    {
      "n": 20,
      "title": "Add the coriander",
      "text": "Scatter the chopped coriander over the poha and give it one last gentle fold.",
      "timerSec": 20,
      "tip": null,
      "visualCue": "Bright green flecks over yellow poha",
      "cameraCheck": "The finished poha in the pan",
      "videoShot": "The coriander falling onto the poha, then one fold."
    },
    {
      "n": 21,
      "title": "Plate the poha",
      "text": "Spoon it onto a plate.",
      "timerSec": 20,
      "tip": null,
      "visualCue": "Fluffy, separate, yellow flakes with green herbs and brown peanuts",
      "cameraCheck": "The served plate",
      "videoShot": "A slow pan across the finished plate."
    }
  ],
  "nutritionPerServing": {
    "kcal": 390,
    "proteinG": 7.9,
    "carbsG": 57.6,
    "fatG": 15.2,
    "fibreG": 3.2
  },
  "microNutrientsEstimate": null,
  "asOrdered": null,
  "orderPrice": {
    "priceHistory": [
      {
        "date": "2026-10-04",
        "min": 120,
        "max": 150,
        "avg": 130,
        "confidence": null,
        "sourceFile": "FitPlate_Dishes_2026-10-04.md"
      }
    ],
    "currentEstimate": {
      "min": 120,
      "max": 150,
      "avg": 130
    },
    "method": "single",
    "trend": "unknown",
    "change30dPct": null,
    "lastObserved": "2026-10-04",
    "stale": false,
    "seasonal": false
  },
  "healthiness": {
    "score": 7,
    "restaurantScore": 5.5,
    "reasons": [
      "the home version uses only 2 tsp oil, no deep frying and very little sugar. It gets some protein and healthy fat from the peanuts and vegetables from the onion and herbs. It is still mostly refined carbohydrate with modest protein (about 8 g) and fibre (about 3 g). Restaurant versions usually use more oil, more sugar and a sev topping, which is deep-fried, so they are less healthy."
    ]
  },
  "researchRating": {
    "score": 4.5,
    "basis": "poha is one of India's most-loved everyday breakfasts. It is described as a \"must\" in eateries and a staple across Mumbai, and recipe pages get very high scores (for example, Indian Healthy Recipes: 5 stars from 301 votes; Cubes N Juliennes: 4.87 from 15 votes). Points are deducted because many people see it as plain, everyday food, and its texture often goes wrong (mushy or dry), a common complaint."
  },
  "storage": "Can go in the fridge for up to 1 day in an airtight box (it dries out and hardens after that). Freezing is not recommended because the flakes go crumbly. To reheat, sprinkle 1–2 tsp water, cover, and heat on low in a pan for 2–3 min, or microwave covered for 45–60 sec. Add fresh lemon after reheating.",
  "leftoverRemix": "Poha cutlets. Mash the leftover poha with 1 boiled potato, 1 tbsp besan and a pinch of chaat masala. Shape into small patties and shallow-fry on a tawa with 1 tsp oil until crisp, about 3 min per side. Serve with green chutney.",
  "burnOff": "about 5.6 km of running (390 ÷ 70 kcal/km, for a 70 kg adult), or about 7.8 km of brisk walking (about 1 hr 35 min at 5 km/h, using about 50 kcal/km for walking) (est.).",
  "sources": [
    "Veg Recipes of India, Poha (Kanda Poha): https://www.vegrecipesofindia.com/kanda-poha-or-onion-poha/",
    "Spice Up The Curry, Kanda Batata Poha: https://www.spiceupthecurry.com/kanda-batata-poha-recipe/",
    "Sanjeev Kapoor, Kanda Poha: https://www.sanjeevkapoor.com/Recipe/Kanda-Poha--Sk-Khazana.html",
    "Chitra's Food Book, Kanda Poha: https://chitrasfoodbook.com/kanda-poha-recipe-maharashtrian-onion/",
    "Ranveer Brar, Kanda Poha: https://ranveerbrar.com/recipes/kanda-poha/",
    "Tarla Dalal, Kanda Poha: https://tarladalal.com/Poha-33444r",
    "Fun Food Frolic, Mumbai Style Kanda Poha: https://www.funfoodfrolic.com/mumbai-style-kanda-poha/",
    "Indian Healthy Recipes, Poha: https://www.indianhealthyrecipes.com/poha-recipe-kanda-batata-poha/",
    "Instacuppa, \"why your poha goes mushy\" (rinse and rest times): https://instacuppastore.com/blogs/main-page/poha-recipe-kanda-poha-in-15-minutes-and-why-yours-goes-mushy",
    "Archana's Kitchen, Maharashtrian Kanda Poha: https://www.archanaskitchen.com/recipe/maharashtrian-kanda-poha",
    "Cubes N Juliennes, Kanda Poha: https://www.cubesnjuliennes.com/kanda-poha-recipe-red-rice-poha-recipe/",
    "Organic Mandya, poha nutrition (IFCT 2017 values cited): https://organicmandya.com/blogs/news/poha-calories-plain-cooked-indori-complete-nutrition-reference",
    "USDA FoodData Central: https://fdc.nal.usda.gov/",
    "Swiggy, Raju Ki Chai Wadala: https://www.swiggy.com/city/mumbai/raju-ki-chai-wadala-rest1099488",
    "Swiggy, Khichdi Bar Sakinaka Powai: https://www.swiggy.com/city/mumbai/khichdi-bar-sakinaka-powai-rest1121954",
    "Swiggy, Satvik Pure Veg Kharghar: https://www.swiggy.com/city/mumbai/satvik-pure-veg-kharghar-rest1374508",
    "Swiggy, Gavran Special Chulivarchi Puneri Matki Misal Thane West (dropped): https://www.swiggy.com/city/mumbai/gavran-special-chulivarchi-puneri-matki-misal-thane-west-rest338265",
    "Zomato, Homely And Healthy Appetite, Manpada, Thane West: https://www.zomato.com/cs/mumbai/homely-and-healthy-appetite-manpada-thane-west-thane/order",
    "Zomato, Sayli Kitchen, Chembur: https://www.zomato.com/mumbai/sayli-kitchen-1-chembur/order",
    "magicpin, Balaji Cafe, Matunga West: https://magicpin.in/Mumbai/Matunga-West/Restaurant/Balaji-Cafe/store/398942/menu/",
    "District, Poha House Malad West (dropped): https://www.district.in/dining/mumbai/2-delicious-poha-house-malad-west",
    "Cocoon on limetray (dropped): https://cocoon.limetray.com/menu/category/100629/snacks",
    "Finely Chopped, Maharashtrian breakfast at Aaswad (sentiment): https://finelychopped.net/after-the-dance-of-democracy-maharashtrian-breakfast-at-aswad-mumbai/"
  ],
  "allergens": [
    "peanut",
    "mustard"
  ],
  "dietClaims": [],
  "fasting": null,
  "needsReview": [],
  "versions": [
    {
      "date": "2026-10-04",
      "file": "FitPlate_Dishes_2026-10-04.md"
    }
  ],
  "mergeMethod": {
    "nutritionPerServing": "stable (single)",
    "orderPrice": "price engine (single)",
    "ingredients": "newest",
    "steps": "newest",
    "healthiness": "newest",
    "researchRating": "newest",
    "sources": "union"
  },
  "mergeNotes": []
}
```

### `src/data/research/ingredients/onion.json`

```json
{
  "id": "onion",
  "name": "Onion",
  "aliases": [
    "kanda",
    "pyaz"
  ],
  "category": "Vegetable",
  "standardUnit": "kg",
  "price": {
    "priceHistory": [
      {
        "date": "2026-10-04",
        "min": 45,
        "max": 60,
        "avg": 55,
        "confidence": "Medium",
        "sourceFile": "FitPlate_Ingredients_2026-10-04.md"
      }
    ],
    "currentEstimate": {
      "min": 45,
      "max": 60,
      "avg": 55
    },
    "method": "single",
    "trend": "unknown",
    "change30dPct": null,
    "lastObserved": "2026-10-04",
    "stale": false,
    "seasonal": true
  },
  "per100Estimate": {
    "min": 4.5,
    "max": 6,
    "avg": 5.5
  },
  "seasonal": true,
  "nutritionPer100g": null,
  "macrosPer100Estimate": {
    "kcal": 40,
    "proteinG": 1.1,
    "carbsG": 9.3,
    "fatG": 0.1,
    "fibreG": 1.7
  },
  "storage": "Whole: room temperature in a basket or mesh bag, away from potatoes and sunlight, for 3–4 weeks. Cut: airtight box in the fridge for 5–7 days. Chopped onion can be frozen for about 3 months (for cooking only).",
  "substitutes": [
    "Shallots (small/sambar onion)",
    "Spring onion (white part)",
    "Ready fried onions (birista)"
  ],
  "versions": [
    {
      "date": "2026-10-04",
      "file": "FitPlate_Ingredients_2026-10-04.md"
    }
  ],
  "mergeMethod": {
    "price": "price engine (single)",
    "macrosPer100Estimate": "stable (single)",
    "aliases": "union",
    "substitutes": "union",
    "storage": "newest"
  },
  "mergeNotes": []
}
```

### `src/data/research/ledger.json`

```json
{
  "schema": "fitplate.ledger.v1",
  "dishes": {
    "001-poha": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Dishes_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "002-chicken-biryani": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Dishes_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "003-paneer-butter-masala": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Dishes_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "004-masala-dosa": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Dishes_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "005-dal-tadka": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Dishes_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "006-upma": [
      {
        "date": "2026-10-05",
        "file": "FitPlate_Dishes_2026-10-05.md",
        "build": "Day04"
      }
    ],
    "007-butter-chicken": [
      {
        "date": "2026-10-05",
        "file": "FitPlate_Dishes_2026-10-05.md",
        "build": "Day04"
      }
    ],
    "008-chole-chana-masala": [
      {
        "date": "2026-10-05",
        "file": "FitPlate_Dishes_2026-10-05.md",
        "build": "Day04"
      }
    ],
    "009-idli-with-sambar": [
      {
        "date": "2026-10-05",
        "file": "FitPlate_Dishes_2026-10-05.md",
        "build": "Day04"
      }
    ],
    "010-veg-fried-rice": [
      {
        "date": "2026-10-05",
        "file": "FitPlate_Dishes_2026-10-05.md",
        "build": "Day04"
      }
    ]
  },
  "ingredients": {
    "flattened-rice-thick": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "basmati-rice-everyday-grade": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "idli-rice-parboiled-rice": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "toor-dal": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "urad-dal-split-skinned": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "chana-dal": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "peanuts-raw": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "cashew-nuts-whole": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "onion": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "tomato": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "potato": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "green-chilli": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "ginger": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "garlic": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "lemon": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "coriander-leaves": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "mint-leaves": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "curry-leaves": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "chicken-curry-cut-bone-in-skinless": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "paneer": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "ginger-garlic-paste": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "milk-toned": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "curd-plain": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "butter-salted": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "fresh-cream": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "ghee-cow": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "cooking-oil-refined-sunflower-groundnut": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "turmeric-powder": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "red-chilli-powder": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ],
    "kashmiri-red-chilli-powder": [
      {
        "date": "2026-10-04",
        "file": "FitPlate_Ingredients_2026-10-04.md",
        "build": "Day04"
      }
    ]
  }
}
```


## 8. CODE FILES

| Path | NEW or CHANGED | Purpose |
|---|---|---|
| `scripts/research/run.js` | NEW | Data sync runner: ledger, caps, rebuild, index generation, JSON report |
| `src/services/data/markdown.ts` | NEW | Pure helpers for reading the research markdown |
| `src/services/data/dishImporter.ts` | NEW | Dish importer (all sections, AS ORDERED, fasting, allergens, claims) |
| `src/services/data/ingredientImporter.ts` | NEW | Ingredient importer (summary table, sections, JSON nutrient profile) |
| `src/services/data/allergens.ts` | NEW | Review fix 1: ingredient → allergen map and claim check |
| `src/services/data/fasting.ts` | NEW | Review fix 2: fasting parser and validator |
| `src/services/data/buildItems.ts` | NEW | Versions → Dish / Ingredient: merge rules, price engine, linking, validation |
| `src/services/data/priceTrend.ts` | NEW | Price trend engine (spec section E) |
| `src/services/data/merge.ts` | NEW | Merge rules (spec section D) |
| `src/services/data/researchIndex.ts` | NEW | Renders the generated index.ts files |
| `src/data/research/index.ts` | NEW | Research data entry point (researchDishes, researchIngredients, getDish, getIngredient) |
| `src/data/research/dishes/index.ts` | NEW (generated) | Static imports of every dish JSON |
| `src/data/research/ingredients/index.ts` | NEW (generated) | Static imports of every ingredient JSON |
| `src/models/research.ts` | CHANGED | allergens, dietClaims, fasting, needsReview, step details, restaurantScore, macrosPer100Estimate |
| `src/services/storage/deleteUser.ts` | NEW | Review fix 3: delete every document under users/{uid} |
| `src/services/storage/remote.ts` | CHANGED | RemoteAdapter.deleteMany and getCollection fromServer |
| `src/services/storage/firestoreRemote.ts` | CHANGED | Batched deletes; server reads |
| `src/services/userSession.ts` | CHANGED | deleteMyData (flush, delete cloud, clear device) |
| `src/lib/store.tsx` | CHANGED | deleteMyData store action; shared sign-out tail |
| `src/app/your-data.tsx` | NEW | "Your data" screen |
| `src/components/ConfirmDeleteData.tsx` | NEW | Delete confirmation modal |
| `src/app/_layout.tsx` | CHANGED | your-data route |
| `src/app/index.tsx` | CHANGED | "Your data" link on the welcome screen |
| `src/app/profile.tsx` | CHANGED | "Your data" row and Delete my data |
| `src/__tests__/data/priceTrend.test.ts` | NEW | Price engine tests (21) |
| `src/__tests__/data/merge.test.ts` | NEW | Merge rule tests (23) |
| `src/__tests__/data/importers.test.ts` | NEW | Importer, allergen, fasting and build tests |
| `src/__tests__/data/researchData.test.ts` | NEW | Loads and validates every bundled JSON |
| `src/__tests__/storage/deleteUser.test.ts` | NEW | Delete my data tests (9) |
| `src/__tests__/storage/fakes.ts` | CHANGED | Fake deleteMany with batch counts |
| `package.json` | CHANGED | research:sync script |
| `docs/DATA_MODEL.md` | CHANGED | Research files layout; delete; changelog |


### `scripts/research/run.js`

```js
#!/usr/bin/env node
/**
 * Daily data sync runner (auto-build spec section C).
 *
 *   node scripts/research/run.js --today 2026-10-11 --build Day04 [--src /mnt/project-files] [--dry-run] [--report out.json]
 *
 * 1. Parses every dish and ingredient research file under --src.
 * 2. Compares item versions (item id + research date) with the ledger in
 *    src/data/research/ledger.json; anything new is backlog, oldest first.
 * 3. Takes at most the per-run caps (10 dishes, 30 ingredients) into the ledger.
 * 4. Rebuilds every ledgered item from all its versions (merge rules + price
 *    engine), validates it, and writes src/data/research/<type>/<id>.json.
 * 5. Regenerates each index.ts and prints a JSON report for the build file.
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

const CAPS = { dishes: 10, ingredients: 30 };

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
  if (!fs.existsSync(LEDGER)) return { schema: 'fitplate.ledger.v1', dishes: {}, ingredients: {} };
  return JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
}

/** Parses a whole stream; returns versions in file order and per-file stats. */
function parseStream(kind) {
  const dir = path.join(src, kind === 'dishes' ? 'dish-research' : 'ingredient-research');
  const files = listFiles(dir, kind === 'dishes' ? 'FitPlate_Dishes_' : 'FitPlate_Ingredients_');
  const versions = [];
  const fileStats = [];
  const errors = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    if (kind === 'dishes') {
      const items = parseDishFile(text, file);
      versions.push(...items);
      fileStats.push({ file, items: items.length });
    } else {
      const { items, errors: errs } = parseIngredientFile(text, file);
      // The same ingredient twice in one file counts once (first row wins).
      const seen = new Set();
      for (const it of items) {
        if (seen.has(it.id)) {
          errors.push(`${file}: duplicate row for ${it.id}; first kept`);
          continue;
        }
        seen.add(it.id);
        versions.push(it);
      }
      errors.push(...errs.map((e) => `${file}: ${e}`));
      fileStats.push({ file, items: seen.size });
    }
  }
  return { versions, fileStats, errors };
}

const key = (v) => `${v.id}@${v.date}`;

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
const dishPlan = plan('dishes', dishes, ledger);
const ingPlan = plan('ingredients', ingredients, ledger);

for (const [kind, p] of [['dishes', dishPlan], ['ingredients', ingPlan]]) {
  for (const v of p.take) {
    (ledger[kind][v.id] = ledger[kind][v.id] || []).push({ date: v.date, file: v.file, build });
  }
}

// Rebuild every ledgered item from all its versions.
const versionsOf = (kind, parsed) => {
  const map = new Map();
  for (const v of parsed.versions) {
    const entries = ledger[kind][v.id];
    if (entries && entries.some((e) => e.date === v.date)) (map.get(v.id) || map.set(v.id, []).get(v.id)).push(v);
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
  parseErrors: [...dishes.errors, ...ingredients.errors],
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
const index = buildIngredientIndex(builtIngredients);

const dishVersions = versionsOf('dishes', dishes);
const builtDishes = [];
for (const [id, list] of dishVersions) {
  const dish = buildDish(list, today, index);
  const errs = validateDish(dish);
  if (errs.length) report.invalid.push({ type: 'dish', id, errors: errs });
  else builtDishes.push(dish);
  if (dish.needsReview.length) report.needsReview.push({ type: 'dish', id, issues: dish.needsReview });
}
builtDishes.sort((a, b) => a.number - b.number);

// Validators run over the whole parsed backlog too, so problems show before those dishes are ingested.
report.backlogReview = dishes.versions
  .filter((v) => v.needsReview.length > 0 && !dishVersions.has(v.id))
  .map((v) => ({ id: v.id, date: v.date, issues: v.needsReview }));

for (const [kind, parsed, p, built] of [
  ['dishes', dishes, dishPlan, builtDishes],
  ['ingredients', ingredients, ingPlan, builtIngredients],
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
  dishIngredientLines: builtDishes.reduce((n, d) => n + d.ingredients.length, 0),
  linked: builtDishes.reduce((n, d) => n + d.ingredients.filter((i) => i.ingredientId).length, 0),
};
report.dishes = builtDishes.map((d) => ({
  id: d.id,
  kcal: d.nutritionPerServing.kcal,
  orderPrice: d.orderPrice && d.orderPrice.currentEstimate,
  allergens: d.allergens,
  claims: d.dietClaims,
  steps: d.steps.length,
  ingredients: d.ingredients.length,
}));
report.ingredients = builtIngredients.map((i) => ({ id: i.id, unit: i.standardUnit, price: i.price && i.price.currentEstimate, trend: i.price && i.price.trend, seasonal: i.seasonal }));

if (!dryRun) {
  for (const [dir, items, nameOf, type] of [
    ['dishes', builtDishes, (d) => d.id, 'Dish'],
    ['ingredients', builtIngredients, (i) => i.id, 'Ingredient'],
  ]) {
    const out = path.join(DATA, dir);
    fs.mkdirSync(out, { recursive: true });
    const keep = new Set(items.map((i) => `${nameOf(i)}.json`));
    for (const f of fs.readdirSync(out)) if (f.endsWith('.json') && !keep.has(f)) fs.unlinkSync(path.join(out, f));
    for (const item of items) {
      // An ingredient's needsReview is report-only; the Ingredient type doesn't carry it.
      const data = type === 'Ingredient' ? Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'needsReview')) : item;
      writeJson(path.join(out, `${nameOf(item)}.json`), data);
    }
    fs.writeFileSync(path.join(out, 'index.ts'), renderIndex(type, items.map(nameOf)));
  }
  writeJson(LEDGER, ledger);
}

const json = JSON.stringify(report, null, 2);
if (reportPath) fs.writeFileSync(reportPath, json + '\n');
else console.log(json);
```

### `src/services/data/markdown.ts`

```ts
/**
 * Small, pure helpers for reading the research markdown files. The research
 * routines write by hand-ish templates that drift from day to day, so every
 * helper tolerates bold markers, "about"/"~" prefixes and en dashes, and
 * returns null when a value is not there rather than guessing.
 */

export type Section = { n: number | null; title: string; body: string };

/** Splits text on headings of one level ("## " or "### "), keeping each heading's body. */
export function splitHeadings(text: string, level: 2 | 3): Section[] {
  const marker = '#'.repeat(level) + ' ';
  const out: Section[] = [];
  let current: Section | null = null;
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith(marker)) {
      if (current) out.push(current);
      const heading = line.slice(marker.length).trim();
      const m = /^(\d+)\.\s+(.*)$/.exec(heading);
      current = m ? { n: Number(m[1]), title: m[2].trim(), body: '' } : { n: null, title: heading, body: '' };
    } else if (current) {
      current.body += line + '\n';
    }
  }
  if (current) out.push(current);
  return out;
}

/** Removes markdown emphasis so label regexes don't trip on "**". */
export function plain(text: string): string {
  return text.replace(/\*\*/g, '').replace(/(^|\s)_(\S[^_]*)_/g, '$1$2');
}

/** Parses "1,180" or "4.5" to a number; null for anything else. */
export function num(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const n = Number(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Rows of every markdown table in the text, as trimmed cells; header and divider rows are dropped. */
export function tableRows(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === '')) continue;
    // A header row is the one directly above a divider row.
    const next = (lines[i + 1] ?? '').trim();
    if (/^\|\s*:?-{2,}/.test(next)) continue;
    rows.push(cells);
  }
  return rows;
}

/** Top-level bullet items ("- " at column 0), each with its indented continuation lines joined. */
export function bullets(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    if (/^- /.test(line)) out.push(line.slice(2).trim());
    else if (/^\s+- /.test(line) && out.length > 0) out[out.length - 1] += ' ' + line.trim().slice(2).trim();
  }
  return out;
}

/**
 * The value of a "Label: value" bullet, matching labels case-insensitively
 * and ignoring bold markers. Indented sub-bullets are appended.
 */
export function labelled(text: string, labels: string[]): string | null {
  for (const item of bullets(text)) {
    const p = plain(item);
    for (const label of labels) {
      const re = new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b[^:]*?:\\s*', 'i');
      const m = re.exec(p);
      if (m) {
        const value = p.slice(m[0].length).trim();
        return value.length > 0 ? value : null;
      }
    }
  }
  return null;
}

/** First duration in a phrase, in minutes: "1 hr 40 min" → 100, "about 20 min" → 20, "8–10 min" → 8. */
export function minutes(text: string | null): number | null {
  if (!text) return null;
  const hm = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b\s*(?:(\d+)\s*min)?/i.exec(text);
  const m = /(\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*min/i.exec(text);
  if (hm && (!m || hm.index <= m.index)) return Math.round(Number(hm[1]) * 60 + (hm[2] ? Number(hm[2]) : 0));
  return m ? Math.round(Number(m[1])) : null;
}

/** Step timer in seconds from "Time: 20–30 sec" or "1.5–2 min"; the lower bound, so a timer never overshoots. */
export function seconds(text: string | null): number | null {
  if (!text) return null;
  const m = /(\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(sec|s|min|minutes?|h|hr|hours?)\b/i.exec(text);
  if (!m) return null;
  const v = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith('s')) return Math.round(v);
  if (unit.startsWith('h')) return Math.round(v * 3600);
  return Math.round(v * 60);
}

/** Lower-case kebab-case id from an English name. */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Splits off the bracketed Indian names, wherever they sit:
 * "Peanuts, raw (moongphali / shengdana)" and "Peanuts (moongphali), raw" both
 * give { english: "Peanuts, raw", aliases: ["moongphali", "shengdana"] }.
 */
export function splitName(name: string): { english: string; aliases: string[] } {
  const aliases: string[] = [];
  const english = name
    .replace(/\(([^)]*)\)/g, (_, inner: string) => {
      for (const a of inner.split(/\s*[/,;]\s*|\s+or\s+/)) if (a.trim()) aliases.push(a.trim());
      return ' ';
    })
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/,$/, '');
  return { english, aliases };
}

/** First "₹A–B" range in the text. */
export function rupeeRange(text: string): { min: number; max: number } | null {
  const m = /₹\s*([\d,]+(?:\.\d+)?)\s*(?:[–-]|to)\s*₹?\s*([\d,]+(?:\.\d+)?)/.exec(text);
  if (!m) return null;
  const min = num(m[1]);
  const max = num(m[2]);
  if (min == null || max == null || min > max) return null;
  return { min, max };
}

/** First single rupee amount in the text ("about ₹130", "~₹330"). */
export function rupee(text: string): number | null {
  const m = /₹\s*([\d,]+(?:\.\d+)?)/.exec(text);
  return m ? num(m[1]) : null;
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
import { checkClaims, dishAllergens, allergenNotes, findClaims } from './allergens';
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
 * "**Total: about 390 kcal | Protein 7.9 g | …**", "- Calories: about 660 kcal", or "| Calories | ~540 kcal |".
 * The per-ingredient table comes after the totals, so the first match wins.
 */
export function parseNutrition(body: string): Macros {
  const text = plain(body);
  const kcal = /(?:Total:\s*(?:about|~|≈)?\s*|Calories\s*(?:\(kcal\))?\s*[:|]\s*(?:about|~|≈)?\s*)([\d,]+(?:\.\d+)?)\s*kcal/i.exec(text);
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
  const header = parseHeader(block.body.split(/^### /m)[0]);
  const facts = section(sections, 1, /quick facts/i);
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
  const allergens = dishAllergens(ingredients);
  const allergenSafety = [...new Set(ingredients.flatMap((i) => allergenNotes(i)))];
  notes.push(...allergenSafety);

  // Claims live in the header line ("Veg (naturally vegan and gluten-free)") and in Quick facts.
  const claimLines = [header.diet, ...bullets(facts).map(plain).filter((b) => !/^(navratri|ekadashi|jain|ramadan)/i.test(b))];
  const claims = checkClaims(findClaims(claimLines), allergens, header.dietType);
  for (const d of claims.dropped) needsReview.push(`dropped "${d.claim}" claim: recipe has ${d.because.join(', ')}`);

  const fastingCheck = validateFasting(parseFasting(facts), ingredients.map((i) => i.name));
  needsReview.push(...fastingCheck.issues);

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
    steps: parseSteps(section(sections, 4, /micro-steps|steps/i)),
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
  notes: string[];
};

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
];

type JsonBlock = { id?: string; name?: string; nutrition?: Record<string, unknown> | null };

/** Every fitplate.ingredient.v1 JSON block in the file. Malformed blocks are skipped and reported. */
export function parseJsonBlocks(text: string): { blocks: JsonBlock[]; errors: string[] } {
  const blocks: JsonBlock[] = [];
  const errors: string[] = [];
  const re = /```json\s*\n([\s\S]*?)\n```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    try {
      const parsed = JSON.parse(m[1]) as JsonBlock & { schema?: string };
      if (parsed.schema === 'fitplate.ingredient.v1') blocks.push(parsed);
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
      notes,
    });
  }
  return { items, errors };
}
```

### `src/services/data/allergens.ts`

```ts
/**
 * Ingredient → allergen map (supervisor review 2026-10-11, FIX 1).
 *
 * Research files have no allergen field, so the dish importer derives one
 * from each ingredient's canonical id and its written name. The rules lean
 * safe: when an ingredient often contains an allergen (compounded hing has
 * wheat flour, soy sauce has wheat), it is tagged. An empty list means
 * "none detected", never "allergen-free"; the app always adds
 * "Check labels if you have an allergy".
 */
import type { AllergenId, DietClaim } from '../../models/research';

type Rule = { allergen: AllergenId; match: RegExp; unless?: RegExp; note?: string };

const RULES: Rule[] = [
  { allergen: 'peanut', match: /\b(peanuts?|groundnuts?|moong ?phali|mungfali|shengdana)\b/i },
  {
    allergen: 'treeNut',
    match: /\b(cashews?|kaju|almonds?|badam|pistachios?|pista|walnuts?|akhrot|hazelnuts?|pecans?|macadamia|pine nuts?|chironji|charoli)\b/i,
  },
  {
    allergen: 'milk',
    match: /\b(milk|curd|dahi|yog(h)?urt|paneer|ghee|butter|cream|malai|cheese|kho(y)?a|mawa|chaas|lassi|whey|condensed|rabri)\b/i,
    unless: /\b(coconut milk|coconut cream|almond milk|soy(a)? milk|oat milk|peanut butter|cocoa butter)\b/i,
  },
  { allergen: 'egg', match: /\b(eggs?|anda|ande)\b/i, unless: /\beggplant\b/i },
  {
    allergen: 'fish',
    match: /\b(fish|machh?(li|i)|rohu|katla|pomfret|surmai|bangda|mackerel|salmon|tuna|sardines?|anchov(y|ies)|hilsa|basa|bombil|tilapia|seer)\b/i,
  },
  { allergen: 'shellfish', match: /\b(prawns?|shrimps?|jhinga|kolambi|crabs?|lobsters?|clams?|mussels?|oysters?|squid|scallops?)\b/i },
  {
    allergen: 'gluten',
    match:
      /\b(wheat|atta|maida|semolina|sooji|suji|rava|rawa|dalia|barley|jau|rye|seitan|bread|pav|bun|naan|roti|chapati|kulcha|noodles|pasta|spaghetti|macaroni|vermicelli|seviyan|breadcrumbs?|malt|soy sauce)\b/i,
    unless: /\b(rice rava|idli rava|rice suji|rice noodles|gluten[- ]free)\b/i,
  },
  // Compounded hing is cut with wheat (sometimes rice) flour; only an explicit gluten-free hing is clear.
  { allergen: 'gluten', match: /\b(hing|asafoetida)\b/i, unless: /gluten[- ]free/i, note: 'hing: compounded hing usually contains wheat flour' },
  // Oats are often processed alongside wheat; flagged as a safety note.
  { allergen: 'gluten', match: /\boats?\b/i, unless: /gluten[- ]free/i, note: 'oats: often cross-contaminated with wheat' },
  { allergen: 'soy', match: /\b(soy|soya|tofu|edamame)\b/i },
  { allergen: 'sesame', match: /\b(sesame|til|gingelly|tahini)\b/i },
  { allergen: 'mustard', match: /\b(mustard|rai|sarson|kasundi)\b/i },
];

/** Allergens for one ingredient, from its canonical id and/or its written name. */
export function allergensOf(ingredient: { ingredientId?: string | null; name: string }): AllergenId[] {
  const text = `${ingredient.name} ${(ingredient.ingredientId ?? '').replace(/[-_]/g, ' ')}`;
  const found = new Set<AllergenId>();
  for (const rule of RULES) {
    if (rule.match.test(text) && !(rule.unless && rule.unless.test(text))) found.add(rule.allergen);
  }
  return sortAllergens([...found]);
}

/** Safety notes behind a tag (e.g. why hing counts as gluten). */
export function allergenNotes(ingredient: { ingredientId?: string | null; name: string }): string[] {
  const text = `${ingredient.name} ${(ingredient.ingredientId ?? '').replace(/[-_]/g, ' ')}`;
  return RULES.filter((r) => r.note && r.match.test(text) && !(r.unless && r.unless.test(text))).map((r) => r.note as string);
}

const ORDER: AllergenId[] = ['peanut', 'treeNut', 'milk', 'egg', 'fish', 'shellfish', 'gluten', 'soy', 'sesame', 'mustard'];

export function sortAllergens(list: AllergenId[]): AllergenId[] {
  return ORDER.filter((a) => list.includes(a));
}

/** Union of every ingredient's allergens. */
export function dishAllergens(ingredients: { ingredientId?: string | null; name: string }[]): AllergenId[] {
  const all = new Set<AllergenId>();
  for (const ing of ingredients) for (const a of allergensOf(ing)) all.add(a);
  return sortAllergens([...all]);
}

const CLAIM_PATTERNS: Record<DietClaim, RegExp> = {
  vegan: /\bvegan\b/i,
  glutenFree: /\bgluten[- ]free\b/i,
  dairyFree: /\b(dairy[- ]free|milk[- ]free)\b/i,
};

/** The allergens each claim rules out. */
const CLAIM_CONFLICTS: Record<DietClaim, AllergenId[]> = {
  vegan: ['milk', 'egg', 'fish', 'shellfish'],
  glutenFree: ['gluten'],
  dairyFree: ['milk'],
};

/**
 * Claims found in the given lines, minus "vegan if …"/"can be made vegan"
 * conditionals, which describe a variation rather than the recipe.
 */
export function findClaims(lines: string[]): DietClaim[] {
  const found: DietClaim[] = [];
  for (const line of lines) {
    const CLAIM = '(vegan|gluten[- ]free|dairy[- ]free)';
    const text = line
      // "vegan if made with oil", "can be made vegan", "makes the dish vegan": a variation, not the recipe.
      .replace(new RegExp(`\\b${CLAIM}\\s+(if|when|with)\\b[^|;.)]*`, 'gi'), '')
      .replace(new RegExp(`\\b(can|could) be (made )?${CLAIM}\\b`, 'gi'), '')
      .replace(new RegExp(`\\bmakes? (the dish |it |this )?${CLAIM}\\b`, 'gi'), '')
      // "not vegan", "non-vegan": a denial, not a claim.
      .replace(new RegExp(`\\b(not|non-?|never)\\s*${CLAIM}\\b`, 'gi'), '');
    for (const claim of Object.keys(CLAIM_PATTERNS) as DietClaim[]) {
      if (CLAIM_PATTERNS[claim].test(text) && !found.includes(claim)) found.push(claim);
    }
  }
  return found;
}

/** Splits claims into those the dish's allergens allow and those they contradict. */
export function checkClaims(
  claims: DietClaim[],
  allergens: AllergenId[],
  dietType: 'veg' | 'egg' | 'non-veg' | null,
): { kept: DietClaim[]; dropped: { claim: DietClaim; because: AllergenId[] | ['non-veg'] }[] } {
  const kept: DietClaim[] = [];
  const dropped: { claim: DietClaim; because: AllergenId[] | ['non-veg'] }[] = [];
  for (const claim of claims) {
    const hits = CLAIM_CONFLICTS[claim].filter((a) => allergens.includes(a));
    if (hits.length > 0) dropped.push({ claim, because: hits });
    else if (claim === 'vegan' && dietType !== null && dietType !== 'veg') dropped.push({ claim, because: ['non-veg'] });
    else kept.push(claim);
  }
  return { kept, dropped };
}

export const ALLERGEN_LABELS: Record<AllergenId, string> = {
  peanut: 'Peanut',
  treeNut: 'Tree nuts',
  milk: 'Milk',
  egg: 'Egg',
  fish: 'Fish',
  shellfish: 'Shellfish',
  gluten: 'Gluten',
  soy: 'Soy',
  sesame: 'Sesame',
  mustard: 'Mustard',
};
```

### `src/services/data/fasting.ts`

```ts
/**
 * Fasting suitability (SPEC-ADDENDA §7) parsing and validation.
 *
 * Review 2026-10-11 FIX 2: a "Jain: With changes" line can contradict its own
 * recipe (dish 39 keeps ginger-garlic paste). The validator never rewrites a
 * reason; when a line claims a dish fits a fast but the recipe still has an
 * ingredient that fast excludes, and the reason doesn't say to skip it, the
 * status becomes null ("not checked") and the dish is flagged for review.
 */
import type { FastingLine, FastingStatus, FastingSuitability } from '../../models/research';
import { bullets, plain } from './markdown';

const EMPTY: FastingLine = { status: null, reason: null };

function statusOf(raw: string): FastingStatus {
  const s = raw.trim().toLowerCase();
  if (s.startsWith('with change')) return 'with-changes';
  if (s.startsWith('yes')) return 'yes';
  if (s.startsWith('no')) return 'no';
  return null;
}

function parseLine(value: string): FastingLine {
  // "Yes — reason", "With changes - reason", "No: reason"
  const m = /^\s*(yes|no|with changes)\b\s*(?:[—–:-]+\s*)?(.*)$/i.exec(value);
  if (!m) return { status: null, reason: value.trim() || null };
  return { status: statusOf(m[1]), reason: m[2].trim() || null };
}

/** Reads the "Fasting suitability" block from a dish's Quick facts. Null when the block is missing. */
export function parseFasting(quickFacts: string): FastingSuitability | null {
  const idx = quickFacts.search(/fasting suitability/i);
  if (idx < 0) return null;
  const block = quickFacts.slice(idx);
  const out: FastingSuitability = { navratri: EMPTY, ekadashi: EMPTY, jain: EMPTY, ramadan: EMPTY };
  let any = false;
  for (const item of bullets(block)) {
    const p = plain(item);
    const m = /^([^:]+):\s*(.*)$/.exec(p);
    if (!m) continue;
    const label = m[1].toLowerCase();
    const line = parseLine(m[2]);
    if (/navratri|vrat/.test(label)) out.navratri = line;
    else if (/ekadashi/.test(label)) out.ekadashi = line;
    else if (/jain/.test(label)) out.jain = line;
    else if (/ramadan|sehri|iftar|roza/.test(label)) out.ramadan = line;
    else continue;
    any = true;
  }
  return any ? out : null;
}

type Excluded = { term: string; match: RegExp; unless?: RegExp; skipWords: RegExp };

/** Root vegetables and bulbs Jain practice excludes. Dry ginger (sonth) and turmeric powder are fine. */
const JAIN_EXCLUDED: Excluded[] = [
  { term: 'onion', match: /\b(onions?|kanda|pyaz|spring onion|shallots?)\b/i, skipWords: /\bonions?\b/i },
  { term: 'garlic', match: /\b(garlic|lahsun|lehsun)\b/i, skipWords: /\bgarlic\b/i },
  { term: 'potato', match: /\b(potato(es)?|aloo|batata)\b/i, unless: /\bsweet potato/i, skipWords: /\bpotato(es)?\b/i },
  { term: 'carrot', match: /\b(carrots?|gajar)\b/i, skipWords: /\bcarrots?\b/i },
  { term: 'beetroot', match: /\b(beetroot|beet|chukandar)\b/i, skipWords: /\bbeet(root)?\b/i },
  { term: 'radish', match: /\b(radish|mooli|muli)\b/i, skipWords: /\bradish\b/i },
  { term: 'fresh ginger', match: /\b(ginger|adrak)\b/i, unless: /\b(dry ginger|ginger powder|sonth|saunth)\b/i, skipWords: /\bginger\b/i },
  { term: 'fresh turmeric root', match: /\b(fresh turmeric|turmeric root|kachi haldi)\b/i, skipWords: /\bturmeric\b/i },
];

/** Grains, onion and garlic: the common Navratri / Ekadashi rule set. Fasting flours (kuttu, singhara, rajgira, samak) are fine. */
const VRAT_EXCLUDED: Excluded[] = [
  {
    term: 'grain',
    match: /\b(rice|chawal|wheat|atta|maida|semolina|sooji|suji|rava|rawa|poha|besan|dal|corn|maize|oats|barley|bread|pav|noodles|vermicelli)\b/i,
    unless: /\b(samak|samvat|barnyard|kuttu|buckwheat|singhara|rajgira|amaranth|sabudana|sago|vrat)\b/i,
    skipWords: /\b(rice|grains?|wheat|flour|semolina|rava|poha|besan|dal)\b/i,
  },
  { term: 'onion', match: /\b(onions?|kanda|pyaz|spring onion|shallots?)\b/i, skipWords: /\bonions?\b/i },
  { term: 'garlic', match: /\b(garlic|lahsun|lehsun)\b/i, skipWords: /\bgarlic\b/i },
];

/** The parts of a reason that tell the cook to leave something out. */
function skipClauses(reason: string): string {
  const clauses = reason.split(/[;.—]|\bbut\b|\buse\b|\badd\b|\bwith\b/i);
  return clauses.filter((c) => /\b(skip|omit|leave out|leave off|drop|without|remove|replace|swap|no)\b/i.test(c)).join(' | ');
}

function conflicts(rules: Excluded[], ingredientNames: string[], reason: string | null, needSkip: boolean): string[] {
  const skips = needSkip && reason ? skipClauses(reason) : '';
  const hits: string[] = [];
  for (const rule of rules) {
    const present = ingredientNames.some((n) => rule.match.test(n) && !(rule.unless && rule.unless.test(n)));
    if (!present) continue;
    if (needSkip && rule.skipWords.test(skips)) continue;
    hits.push(rule.term);
  }
  return hits;
}

export type FastingCheck = { fasting: FastingSuitability | null; issues: string[] };

/**
 * Applies the FIX 2 rules. Jain "yes" / "with changes" must skip every
 * excluded ingredient the recipe still has; Navratri / Ekadashi "yes" must
 * have none of them at all (a "with changes" line already tells the cook to
 * adapt, so only its skip list is checked).
 */
export function validateFasting(fasting: FastingSuitability | null, ingredientNames: string[]): FastingCheck {
  if (!fasting) return { fasting, issues: [] };
  const out: FastingSuitability = { ...fasting };
  const issues: string[] = [];

  const jain = fasting.jain;
  if (jain.status === 'yes' || jain.status === 'with-changes') {
    const hits = conflicts(JAIN_EXCLUDED, ingredientNames, jain.reason, true);
    if (hits.length > 0) {
      out.jain = { status: null, reason: jain.reason };
      issues.push(`Jain "${jain.status}" but the recipe keeps ${hits.join(', ')} and the line doesn't say to skip ${hits.length > 1 ? 'them' : 'it'}`);
    }
  }

  for (const key of ['navratri', 'ekadashi'] as const) {
    const line = fasting[key];
    if (line.status !== 'yes' && line.status !== 'with-changes') continue;
    const hits = conflicts(VRAT_EXCLUDED, ingredientNames, line.reason, line.status === 'with-changes');
    if (hits.length > 0) {
      out[key] = { status: null, reason: line.reason };
      const name = key === 'navratri' ? 'Navratri' : 'Ekadashi';
      issues.push(`${name} "${line.status}" but the recipe has ${hits.join(', ')}${line.status === 'with-changes' ? ' with no skip' : ''}`);
    }
  }
  return { fasting: out, issues };
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

  return {
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
    needsReview: latest.needsReview,
    versions: versions.map((v) => ({ date: v.date, file: v.file })),
    mergeMethod,
    mergeNotes: notes,
  };
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

### `src/services/data/priceTrend.ts`

```ts
/**
 * Price trend engine (spec section E). Prices drift with inflation, seasons
 * and monsoon spikes, so a plain average of research versions would lag and
 * mislead. Each research version is one observation; this turns them into a
 * time-weighted estimate with trend and spike detection. Pure, so it can be
 * unit-tested with synthetic series and run by the importers at build time.
 */
import type { Confidence, PriceEstimate } from '../../models/research';

export type PriceObservation = {
  /** YYYY-MM-DD */
  date: string;
  min: number;
  max: number;
  avg: number | null;
  confidence: Confidence | null;
  sourceFile: string;
  /** Old-format or converted observation (e.g. a 2-serving dish file scaled to 1) → quality 0.5. */
  lowQuality?: boolean;
};

export type PriceFlag = 'possible-spike' | 'narrowed' | 'stale';

export type PriceEngineResult = PriceEstimate & { flags: PriceFlag[]; notes: string[] };

export type PriceEngineOptions = {
  /** YYYY-MM-DD; ages and staleness are measured from here so builds are reproducible. */
  today: string;
  seasonal: boolean;
  kind: 'ingredient' | 'dish';
};

/**
 * Canonical ingredient ids the spec names as spike-prone seasonal produce.
 * Exported rather than applied here: callers own the id → seasonal decision.
 */
export const SEASONAL_PRODUCE: ReadonlySet<string> = new Set([
  'onion',
  'tomato',
  'potato',
  'green-chilli',
  'coriander-leaves',
  'lemon',
]);

const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_LIFE_DAYS = 30;
const TREND_WINDOW = 5;
const TREND_THRESHOLD_PCT = 5;
const SPIKE_THRESHOLD = 0.35;
const MAX_SPREAD = 0.3;
const NARROW_TO = 0.15;
const STALE_DAYS = 45;

type Range = { min: number; max: number; avg: number };
type Point = Range & { day: number; quality: number };
type Trend = PriceEstimate['trend'];
type Core = { estimate: Range; method: PriceEstimate['method']; trend: Trend; slopePct: number | null; spike: boolean };

function parseDay(date: string, field: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`priceTrend: ${field} must be YYYY-MM-DD, got "${date}"`);
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(ms)) throw new Error(`priceTrend: ${field} is not a real date: "${date}"`);
  return Math.round(ms / DAY_MS);
}

function checkPrice(value: number, field: string, date: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`priceTrend: ${field} on ${date} must be a finite number ≥ 0, got ${value}`);
}

function wma(points: Point[], today: number): Range {
  let sw = 0;
  let min = 0;
  let max = 0;
  let avg = 0;
  for (const p of points) {
    // Future-dated observations count as "today" rather than gaining extra weight.
    const age = Math.max(0, today - p.day);
    const w = p.quality * 0.5 ** (age / HALF_LIFE_DAYS);
    sw += w;
    min += w * p.min;
    max += w * p.max;
    avg += w * p.avg;
  }
  return { min: min / sw, max: max / sw, avg: avg / sw };
}

/** Least-squares slope of avg per day; 0 when all points share one date (no time axis to fit). */
function slopePerDay(points: Point[]): number {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.day, 0) / n;
  const my = points.reduce((s, p) => s + p.avg, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.day - mx) * (p.avg - my);
    den += (p.day - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/** The unrounded engine; recursion on the series minus its latest point gives the "previous estimate" for spike checks. */
function core(points: Point[], today: number): Core {
  const smoothed = wma(points, today);
  const latest = points[points.length - 1];

  let trend: Trend = 'unknown';
  let slopePct: number | null = null;
  if (points.length >= 3) {
    const recent = points.slice(-TREND_WINDOW);
    slopePct = smoothed.avg === 0 ? 0 : ((slopePerDay(recent) * HALF_LIFE_DAYS) / smoothed.avg) * 100;
    const [a, b, c] = points.slice(-3).map((p) => p.avg);
    if (slopePct >= TREND_THRESHOLD_PCT && b > a && c > b) trend = 'rising';
    else if (slopePct <= -TREND_THRESHOLD_PCT && b < a && c < b) trend = 'falling';
    else trend = 'stable';
  }

  if (trend === 'rising' || trend === 'falling') {
    // A moving average lags a real trend; the latest observation is the best guide, and we never extrapolate past it.
    return { estimate: { min: latest.min, max: latest.max, avg: latest.avg }, method: 'latest-trend', trend, slopePct, spike: false };
  }
  if (points.length === 1) return { estimate: smoothed, method: 'single', trend, slopePct, spike: false };

  const prev = core(points.slice(0, -1), today).estimate;
  const jump = prev.avg === 0 ? (latest.avg === 0 ? 0 : Infinity) : Math.abs(latest.avg - prev.avg) / prev.avg;
  if (jump > SPIKE_THRESHOLD) {
    // Unconfirmed jump: meet it halfway until the next observation confirms or reverses it.
    const half = (k: keyof Range) => (prev[k] + latest[k]) / 2;
    return { estimate: { min: half('min'), max: half('max'), avg: half('avg') }, method: 'spike-blend', trend, slopePct, spike: true };
  }
  return { estimate: smoothed, method: 'wma', trend, slopePct, spike: false };
}

function roundStep(kind: PriceEngineOptions['kind'], avg: number): number {
  if (kind === 'dish') return 10;
  return avg < 100 ? 1 : 5;
}

export function computePriceEstimate(observations: PriceObservation[], opts: PriceEngineOptions): PriceEngineResult {
  if (observations.length === 0) throw new Error('priceTrend: no observations');
  const today = parseDay(opts.today, 'today');
  const notes: string[] = [];
  const flags: PriceFlag[] = [];

  const seen = new Set<string>();
  const unique: (PriceObservation & { avg: number; day: number })[] = [];
  for (const o of observations) {
    const day = parseDay(o.date, 'date');
    checkPrice(o.min, 'min', o.date);
    checkPrice(o.max, 'max', o.date);
    if (o.avg !== null) checkPrice(o.avg, 'avg', o.date);
    if (o.min > o.max) throw new Error(`priceTrend: min ${o.min} > max ${o.max} on ${o.date} (${o.sourceFile})`);
    // The same file re-imported must not count twice.
    const key = `${o.date}|${o.sourceFile}`;
    if (seen.has(key)) {
      notes.push(`Ignored duplicate observation ${o.date} from ${o.sourceFile}.`);
      continue;
    }
    seen.add(key);
    unique.push({ ...o, avg: o.avg ?? (o.min + o.max) / 2, day });
  }
  // Array.prototype.sort is stable, so same-date observations keep their input order.
  unique.sort((a, b) => a.day - b.day);

  const points: Point[] = unique.map((o) => ({
    day: o.day,
    min: o.min,
    max: o.max,
    avg: o.avg,
    quality: o.confidence === 'Low' || o.lowQuality ? 0.5 : 1,
  }));
  const result = core(points, today);

  const latest = unique[unique.length - 1];
  if (result.spike) {
    flags.push('possible-spike');
    notes.push(`Possible spike: latest avg ${latest.avg} (${latest.date}) moved more than 35% from the previous estimate; using the halfway point.`);
  }

  let { min, max, avg } = result.estimate;
  min = Math.min(min, avg);
  max = Math.max(max, avg);
  if (max - min > MAX_SPREAD * avg) {
    notes.push(`Range ${min.toFixed(1)}–${max.toFixed(1)} was wider than 30% of avg ${avg.toFixed(1)}; narrowed to ±15%.`);
    flags.push('narrowed');
    min = avg * (1 - NARROW_TO);
    max = avg * (1 + NARROW_TO);
  }
  const step = roundStep(opts.kind, avg);
  const round = (v: number) => Math.round(v / step) * step;

  const stale = today - latest.day > STALE_DAYS;
  if (stale) {
    flags.push('stale');
    notes.push(`Latest observation ${latest.date} is more than ${STALE_DAYS} days old.`);
  }

  return {
    priceHistory: unique.map((o) => ({ date: o.date, min: o.min, max: o.max, avg: o.avg, confidence: o.confidence, sourceFile: o.sourceFile })),
    currentEstimate: { min: round(min), max: round(max), avg: round(avg) },
    method: result.method,
    trend: result.trend,
    // `+ 0` turns -0 into 0 so JSON output stays clean.
    change30dPct: result.slopePct === null ? null : Math.round(result.slopePct * 10) / 10 + 0,
    lastObserved: latest.date,
    stale,
    seasonal: opts.seasonal,
    flags,
    notes,
  };
}
```

### `src/services/data/merge.ts`

```ts
/**
 * Merge rules for items with more than one research version (spec section D).
 * Never blindly average: each kind of field has its own rule. Prices go
 * through the price trend engine (priceTrend.ts); everything else is here.
 * Pure, so the importers can run it at build time and tests can pin it down.
 */

export type Versioned<T> = { date: string; value: T };

export type StableMerge = {
  value: number | null;
  method: 'none' | 'single' | 'mean-2' | 'median-3';
  excludedDates: string[];
  notes: string[];
};

const OUTLIER = 0.25;
const RECIPE_QTY_CHANGE = 0.15;

/** Relative difference against a reference; any change from 0 counts as infinite. */
function relDiff(value: number, ref: number): number {
  if (ref === 0) return value === 0 ? 0 : Infinity;
  return Math.abs(value - ref) / Math.abs(ref);
}

function round1(v: number): number {
  return Math.round(v * 10) / 10 + 0;
}

function checkFinite(value: number, where: string): void {
  if (!Number.isFinite(value)) throw new Error(`merge: ${where} must be a finite number, got ${value}`);
}

/**
 * Stable research estimates (calories, macros, scores, "(est.)" densities):
 * a moving window of the newest versions so old research drops out, with
 * outlier exclusion because one bad research run shouldn't move the number.
 */
export function mergeStable(versions: Versioned<number | null>[]): StableMerge {
  const present: Versioned<number>[] = [];
  for (const v of versions) {
    if (v.value === null) continue;
    checkFinite(v.value, `value on ${v.date}`);
    present.push({ date: v.date, value: v.value });
  }
  // YYYY-MM-DD sorts correctly as text; the sort is stable for same-day versions.
  present.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  if (present.length === 0) return { value: null, method: 'none', excludedDates: [], notes: [] };
  if (present.length === 1) return { value: round1(present[0].value), method: 'single', excludedDates: [], notes: [] };

  if (present.length === 2) {
    const [older, newer] = present;
    if (relDiff(newer.value, older.value) > OUTLIER) {
      // With two versions there is no majority, so trust the newer research.
      return {
        value: round1(newer.value),
        method: 'single',
        excludedDates: [older.date],
        notes: [`Versions ${older.date} (${older.value}) and ${newer.date} (${newer.value}) differ by more than 25%; kept the newer.`],
      };
    }
    return { value: round1((older.value + newer.value) / 2), method: 'mean-2', excludedDates: [], notes: [] };
  }

  const window = present.slice(-3);
  // Median of the other two = their mean. Only the worst offender is dropped so two values always remain.
  const deviations = window.map((v, i) => {
    const others = window.filter((_, j) => j !== i);
    return relDiff(v.value, (others[0].value + others[1].value) / 2);
  });
  const worst = deviations.indexOf(Math.max(...deviations));
  if (deviations[worst] > OUTLIER) {
    const out = window[worst];
    const kept = window.filter((_, i) => i !== worst);
    return {
      value: round1((kept[0].value + kept[1].value) / 2),
      method: 'median-3',
      excludedDates: [out.date],
      notes: [`Excluded outlier ${out.value} from ${out.date}: more than 25% from the other versions.`],
    };
  }
  const sorted = window.map((v) => v.value).sort((a, b) => a - b);
  return { value: round1(sorted[1]), method: 'median-3', excludedDates: [], notes: [] };
}

export type OfficialVersion = { value: number | null; citesOfficial: boolean; date: string };

/**
 * Official reference values (ICMR-NIN, IFCT, Compendium MET) are fixed
 * published numbers, so a difference is an error somewhere: never average,
 * prefer the cited value, and ask a human when citation can't settle it.
 */
export function mergeOfficial(
  prev: OfficialVersion | null,
  next: OfficialVersion,
  opts: { safetyLimit?: boolean } = {},
): { value: number | null; needsReview: boolean; note: string | null } {
  if (prev?.value != null) checkFinite(prev.value, `previous value (${prev.date})`);
  if (next.value !== null) checkFinite(next.value, `next value (${next.date})`);

  if (prev === null || prev.value === null) return { value: next.value, needsReview: false, note: null };
  if (next.value === null) return { value: prev.value, needsReview: false, note: null };
  if (prev.value === next.value) return { value: prev.value, needsReview: false, note: null };

  const conflict = `${prev.date}: ${prev.value} vs ${next.date}: ${next.value}`;
  if (opts.safetyLimit) {
    // For upper limits and safety thresholds, the lower value is the safer one to show while a human checks.
    return { value: Math.min(prev.value, next.value), needsReview: true, note: `Safety limit conflict (${conflict}); kept the lower value.` };
  }
  if (next.citesOfficial && !prev.citesOfficial) {
    return { value: next.value, needsReview: false, note: `Conflict (${conflict}); kept ${next.date}, which cites the official table.` };
  }
  if (prev.citesOfficial && !next.citesOfficial) {
    return { value: prev.value, needsReview: false, note: `Conflict (${conflict}); kept ${prev.date}, which cites the official table.` };
  }
  const why = prev.citesOfficial ? 'both cite the official table' : 'neither cites the official table';
  return { value: prev.value, needsReview: true, note: `Conflict (${conflict}); ${why}, kept the previous value.` };
}

/** Lists (sources, aliases, tips, warnings): union, trimmed, deduplicated case-insensitively, first spelling and order win. */
export function unionList(...lists: (readonly string[] | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    if (!list) continue;
    for (const raw of list) {
      const item = raw.trim();
      const key = item.toLowerCase();
      if (item === '' || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export type Completeness<T> = { value: T; sources: number; notFound: number };

function checkCount(n: number, where: string): void {
  if (!Number.isInteger(n) || n < 0) throw new Error(`merge: ${where} must be a whole number ≥ 0, got ${n}`);
}

/**
 * Recipes and instructions are adopted whole, never mixed step by step,
 * because steps from different versions don't fit together.
 */
export function adoptWhole<T>(
  prev: Completeness<T> | null,
  next: Completeness<T>,
): { value: T; adopted: 'next' | 'prev'; note: string | null } {
  checkCount(next.sources, 'next.sources');
  checkCount(next.notFound, 'next.notFound');
  if (prev === null) return { value: next.value, adopted: 'next', note: null };
  checkCount(prev.sources, 'prev.sources');
  checkCount(prev.notFound, 'prev.notFound');

  const reasons: string[] = [];
  if (next.sources < prev.sources) reasons.push(`fewer sources (${next.sources} < ${prev.sources})`);
  if (next.notFound > prev.notFound) reasons.push(`more "Not found" fields (${next.notFound} > ${prev.notFound})`);
  if (reasons.length === 0) return { value: next.value, adopted: 'next', note: null };
  return { value: prev.value, adopted: 'prev', note: `Kept the previous version: the newer one has ${reasons.join(' and ')}.` };
}

export type RecipeLine = { ingredientId: string | null; name: string; quantity: number | null };

function recipeTotals(lines: RecipeLine[]): Map<string, number | null> {
  const totals = new Map<string, number | null>();
  for (const line of lines) {
    const key = line.ingredientId ?? line.name.trim().toLowerCase();
    if (key === '') throw new Error('merge: recipe line has neither an ingredientId nor a name');
    if (line.quantity !== null) checkFinite(line.quantity, `quantity of ${key}`);
    // The same ingredient listed twice (e.g. oil for tempering and frying) is compared as one total.
    const prev = totals.get(key);
    const sum = prev === undefined ? line.quantity : prev === null || line.quantity === null ? null : prev + line.quantity;
    totals.set(key, sum);
  }
  return totals;
}

/**
 * Whether a recipe changed enough to reset the calorie/macro/healthiness
 * window: an ingredient added or removed, or a quantity moved by more than 15%.
 */
export function recipeChangedMaterially(a: RecipeLine[], b: RecipeLine[]): boolean {
  const ta = recipeTotals(a);
  const tb = recipeTotals(b);
  if (ta.size !== tb.size) return true;
  for (const [key, qa] of ta) {
    if (!tb.has(key)) return true;
    const qb = tb.get(key) ?? null;
    // An unknown quantity is missing research, not evidence the recipe changed.
    if (qa === null || qb === null) continue;
    if (relDiff(qb, qa) > RECIPE_QTY_CHANGE) return true;
  }
  return false;
}
```

### `src/services/data/researchIndex.ts`

```ts
/**
 * Renders the generated index.ts for a folder of per-item research JSON.
 * Static imports (not a directory scan) because Metro bundles only what is
 * imported; the runner rewrites the file whenever that data type changes.
 */
export function renderIndex(type: 'Dish' | 'Ingredient', ids: string[]): string {
  const ident = (id: string) => `item_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const sorted = [...ids];
  const lines = [
    '// GENERATED by scripts/research/run.js. Do not edit by hand.',
    `import type { ${type} } from '../../../models/research';`,
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
import { items as dishItems } from './dishes';
import { items as ingredientItems } from './ingredients';

export const researchDishes: readonly Dish[] = dishItems;
export const researchIngredients: readonly Ingredient[] = ingredientItems;

const dishById = new Map(dishItems.map((d) => [d.id, d]));
const ingredientById = new Map(ingredientItems.map((i) => [i.id, i]));

export function getDish(id: string): Dish | undefined {
  return dishById.get(id);
}

export function getIngredient(id: string): Ingredient | undefined {
  return ingredientById.get(id);
}
```

### `src/data/research/dishes/index.ts`

```ts
// GENERATED by scripts/research/run.js. Do not edit by hand.
import type { Dish } from '../../../models/research';

import item_001_poha from './001-poha.json';
import item_002_chicken_biryani from './002-chicken-biryani.json';
import item_003_paneer_butter_masala from './003-paneer-butter-masala.json';
import item_004_masala_dosa from './004-masala-dosa.json';
import item_005_dal_tadka from './005-dal-tadka.json';
import item_006_upma from './006-upma.json';
import item_007_butter_chicken from './007-butter-chicken.json';
import item_008_chole_chana_masala from './008-chole-chana-masala.json';
import item_009_idli_with_sambar from './009-idli-with-sambar.json';
import item_010_veg_fried_rice from './010-veg-fried-rice.json';

export const items: Dish[] = [
  item_001_poha as unknown as Dish,
  item_002_chicken_biryani as unknown as Dish,
  item_003_paneer_butter_masala as unknown as Dish,
  item_004_masala_dosa as unknown as Dish,
  item_005_dal_tadka as unknown as Dish,
  item_006_upma as unknown as Dish,
  item_007_butter_chicken as unknown as Dish,
  item_008_chole_chana_masala as unknown as Dish,
  item_009_idli_with_sambar as unknown as Dish,
  item_010_veg_fried_rice as unknown as Dish,
];
```

### `src/data/research/ingredients/index.ts`

```ts
// GENERATED by scripts/research/run.js. Do not edit by hand.
import type { Ingredient } from '../../../models/research';

import item_basmati_rice_everyday_grade from './basmati-rice-everyday-grade.json';
import item_butter_salted from './butter-salted.json';
import item_cashew_nuts_whole from './cashew-nuts-whole.json';
import item_chana_dal from './chana-dal.json';
import item_chicken_curry_cut_bone_in_skinless from './chicken-curry-cut-bone-in-skinless.json';
import item_cooking_oil_refined_sunflower_groundnut from './cooking-oil-refined-sunflower-groundnut.json';
import item_coriander_leaves from './coriander-leaves.json';
import item_curd_plain from './curd-plain.json';
import item_curry_leaves from './curry-leaves.json';
import item_flattened_rice_thick from './flattened-rice-thick.json';
import item_fresh_cream from './fresh-cream.json';
import item_garlic from './garlic.json';
import item_ghee_cow from './ghee-cow.json';
import item_ginger from './ginger.json';
import item_ginger_garlic_paste from './ginger-garlic-paste.json';
import item_green_chilli from './green-chilli.json';
import item_idli_rice_parboiled_rice from './idli-rice-parboiled-rice.json';
import item_kashmiri_red_chilli_powder from './kashmiri-red-chilli-powder.json';
import item_lemon from './lemon.json';
import item_milk_toned from './milk-toned.json';
import item_mint_leaves from './mint-leaves.json';
import item_onion from './onion.json';
import item_paneer from './paneer.json';
import item_peanuts_raw from './peanuts-raw.json';
import item_potato from './potato.json';
import item_red_chilli_powder from './red-chilli-powder.json';
import item_tomato from './tomato.json';
import item_toor_dal from './toor-dal.json';
import item_turmeric_powder from './turmeric-powder.json';
import item_urad_dal_split_skinned from './urad-dal-split-skinned.json';

export const items: Ingredient[] = [
  item_basmati_rice_everyday_grade as unknown as Ingredient,
  item_butter_salted as unknown as Ingredient,
  item_cashew_nuts_whole as unknown as Ingredient,
  item_chana_dal as unknown as Ingredient,
  item_chicken_curry_cut_bone_in_skinless as unknown as Ingredient,
  item_cooking_oil_refined_sunflower_groundnut as unknown as Ingredient,
  item_coriander_leaves as unknown as Ingredient,
  item_curd_plain as unknown as Ingredient,
  item_curry_leaves as unknown as Ingredient,
  item_flattened_rice_thick as unknown as Ingredient,
  item_fresh_cream as unknown as Ingredient,
  item_garlic as unknown as Ingredient,
  item_ghee_cow as unknown as Ingredient,
  item_ginger as unknown as Ingredient,
  item_ginger_garlic_paste as unknown as Ingredient,
  item_green_chilli as unknown as Ingredient,
  item_idli_rice_parboiled_rice as unknown as Ingredient,
  item_kashmiri_red_chilli_powder as unknown as Ingredient,
  item_lemon as unknown as Ingredient,
  item_milk_toned as unknown as Ingredient,
  item_mint_leaves as unknown as Ingredient,
  item_onion as unknown as Ingredient,
  item_paneer as unknown as Ingredient,
  item_peanuts_raw as unknown as Ingredient,
  item_potato as unknown as Ingredient,
  item_red_chilli_powder as unknown as Ingredient,
  item_tomato as unknown as Ingredient,
  item_toor_dal as unknown as Ingredient,
  item_turmeric_powder as unknown as Ingredient,
  item_urad_dal_split_skinned as unknown as Ingredient,
];
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
};

/**
 * Nutrient, Hydration, Guidance and Exercise items follow the JSON blocks in
 * their research files exactly; Day 5 replaces these with the full shapes.
 */
export type ResearchItem = Provenance & { id: string; name: string; [key: string]: unknown };
export type Nutrient = ResearchItem;
export type Hydration = ResearchItem;
export type Guidance = ResearchItem;
export type Exercise = ResearchItem;
```

### `src/services/storage/deleteUser.ts`

```ts
import { collectionPath, docPath, PROFILE_COLLECTION, userDocPath, type RemoteAdapter } from './remote';
import { SCHEMAS } from './schemas';

/**
 * "Delete my data": hard-deletes everything FitPlate saved in the cloud for
 * one user, that is every document of every collection in SCHEMAS under
 * `users/{uid}`, then the user document itself (which holds the profile).
 * Deletes go out in batches of at most 500 (the adapter splits them).
 *
 * The user document goes last, so if the network drops half-way the profile
 * is still there and the user can simply try again. Any failure (offline,
 * rules) is thrown to the caller, which then changes nothing on the device.
 * Returns the number of deletes sent (the user document included).
 */
export async function deleteAllUserData(adapter: RemoteAdapter, uid: string): Promise<number> {
  if (!uid) throw new Error('A signed-in user id is required to delete cloud data.');
  const paths: string[] = [];
  for (const { collection } of Object.values(SCHEMAS)) {
    if (collection === PROFILE_COLLECTION) continue;
    // From the server: offline this throws at once, before anything is deleted.
    const docs = await adapter.getCollection(collectionPath(uid, collection), { fromServer: true });
    for (const d of docs) paths.push(docPath(uid, collection, d.id));
  }
  if (paths.length) await adapter.deleteMany(paths);
  await adapter.deleteMany([userDocPath(uid)]);
  return paths.length + 1;
}
```

### `src/services/storage/remote.ts`

```ts
import type { BaseDoc } from '../../models/common';
import type { DocStore } from './docStore';

/** The profile lives on the user document itself, `users/{uid}`. */
export const PROFILE_COLLECTION = 'profile';
export const PROFILE_ID = 'profile';

/**
 * The few Firestore operations the app needs, by document path. The real
 * implementation is in firestoreRemote.ts; tests pass a fake, so they never
 * touch the real project.
 */
export type RemoteAdapter = {
  /**
   * All documents of a collection path. `fromServer` skips the offline cache
   * and fails when the cloud can't be reached (used before deleting).
   */
  getCollection(path: string, opts?: { fromServer?: boolean }): Promise<BaseDoc[]>;
  getDoc(path: string): Promise<BaseDoc | null>;
  /** Write documents in batches (Firestore batches hold at most 500 writes). */
  setMany(writes: { path: string; data: BaseDoc }[]): Promise<void>;
  /** Hard-delete documents by path, in batches of at most 500. */
  deleteMany(paths: string[]): Promise<void>;
};

export const userDocPath = (uid: string) => `users/${uid}`;
export const collectionPath = (uid: string, collection: string) => `users/${uid}/${collection}`;

export function docPath(uid: string, collection: string, id: string): string {
  return collection === PROFILE_COLLECTION ? userDocPath(uid) : `${collectionPath(uid, collection)}/${id}`;
}

/** A DocStore view of one signed-in user's Firestore data. */
export function createRemoteDocStore(adapter: RemoteAdapter, uid: string): DocStore {
  if (!uid) throw new Error('A signed-in user id is required for the cloud store.');
  return {
    async getAll<T extends BaseDoc>(collection: string) {
      const docs =
        collection === PROFILE_COLLECTION
          ? [await adapter.getDoc(userDocPath(uid))].filter((d): d is BaseDoc => d !== null)
          : await adapter.getCollection(collectionPath(uid, collection));
      return Object.fromEntries(docs.map((d) => [d.id, d as T]));
    },
    async putMany<T extends BaseDoc>(collection: string, docs: T[]) {
      if (docs.length === 0) return;
      await adapter.setMany(docs.map((d) => ({ path: docPath(uid, collection, d.id), data: d })));
    },
  };
}
```

### `src/services/storage/firestoreRemote.ts`

```ts
import { getApp, getApps } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import type { BaseDoc } from '../../models/common';
import type { RemoteAdapter } from './remote';

// Firestore's own batch limit.
const MAX_BATCH = 500;

let db: Firestore | null = null;

/**
 * Firestore on the Firebase JS SDK (all platforms, SPEC-ADDENDA §5). The web
 * build keeps a persistent offline cache in IndexedDB; native uses the memory
 * cache, and the app's AsyncStorage copy covers offline there.
 * Returns null when Firebase is not set up (no .env keys), so callers fall
 * back to device storage.
 */
export function getDb(): Firestore | null {
  if (db) return db;
  if (!getApps().length) return null;
  db = initializeFirestore(getApp(), {
    localCache: Platform.OS === 'web' ? persistentLocalCache({ tabManager: persistentMultipleTabManager() }) : memoryLocalCache(),
    ignoreUndefinedProperties: true,
  });
  return db;
}

export function createFirestoreAdapter(firestore: Firestore): RemoteAdapter {
  return {
    async getCollection(path, opts) {
      const ref = collection(firestore, path);
      // From the server only when asked: offline, getDocs would quietly answer from the cache.
      const snap = await (opts?.fromServer ? getDocsFromServer(ref) : getDocs(ref));
      return snap.docs.map((d) => d.data() as BaseDoc);
    },
    async getDoc(path) {
      const snap = await getDoc(doc(firestore, path));
      return snap.exists() ? (snap.data() as BaseDoc) : null;
    },
    async setMany(writes) {
      for (let i = 0; i < writes.length; i += MAX_BATCH) {
        const batch = writeBatch(firestore);
        for (const w of writes.slice(i, i + MAX_BATCH)) batch.set(doc(firestore, w.path), w.data);
        await batch.commit();
      }
    },
    async deleteMany(paths) {
      for (let i = 0; i < paths.length; i += MAX_BATCH) {
        const batch = writeBatch(firestore);
        for (const p of paths.slice(i, i + MAX_BATCH)) batch.delete(doc(firestore, p));
        await batch.commit();
      }
    },
  };
}
```

### `src/services/userSession.ts`

```ts
import type { BaseDoc, DateKey, Doc } from '../models/common';
import type { Favourite, MealLog, MealPlanDay, SavingEntry, WaterLog, WorkoutLog } from '../models/logs';
import { DEFAULT_PROFILE, type UserProfile } from '../models/user';
import type { DayLog, Profile, Slot } from '../lib/store';
import { deleteAllUserData } from './storage/deleteUser';
import { createLocalDocStore, ownerPrefix } from './storage/docStore';
import { COLLECTIONS, copyGuestToAccount, createRepositories, fromLegacyState, GUEST_OWNER, LEGACY_KEY, PROFILE_ID, SCHEMAS, type LegacyState, type Repositories, type UserData } from './storage';
import type { LegacyDocs } from './storage/legacy';
import type { KeyValueStore } from './storage/kv';
import type { RemoteAdapter } from './storage/remote';
import { makeId } from './storage/repository';
import { createStorageService } from './storage/storageService';

/**
 * Day 03b: the bridge between the screens and the storage layer.
 * The screens still read the demo's shape (`days`, `moneySaved`, …); this
 * module keeps the user's documents in memory, derives that shape from them,
 * and sends every change through the repositories (device, plus Firestore
 * when signed in).
 */

/** The user's documents, by collection and id. Soft-deleted documents are left out. */
export type UserDocs = {
  profile: Doc<UserProfile> | null;
  mealLogs: Record<string, Doc<MealLog>>;
  waterLogs: Record<string, Doc<WaterLog>>;
  workoutLogs: Record<string, Doc<WorkoutLog>>;
  favourites: Record<string, Doc<Favourite>>;
  mealPlans: Record<string, Doc<MealPlanDay>>;
  savings: Record<string, Doc<SavingEntry>>;
};

type ListCollection = Exclude<keyof UserDocs, 'profile'>;
const LIST_COLLECTIONS: readonly ListCollection[] = ['mealLogs', 'waterLogs', 'workoutLogs', 'favourites', 'mealPlans', 'savings'];

export const EMPTY_DOCS: UserDocs = { profile: null, mealLogs: {}, waterLogs: {}, workoutLogs: {}, favourites: {}, mealPlans: {}, savings: {} };

/** Set once the guest store on this device has been migrated from the demo blob, or seeded. */
export const GUEST_READY_KEY = 'fitplate.guestReady.v1';
/** Set once a signed-in user has answered "Bring your data with you?" on this device. */
export const guestCopyAskedKey = (uid: string) => `fitplate.guestCopyAsked.${uid}.v1`;

const byId = <T extends BaseDoc>(docs: T[]): Record<string, T> => Object.fromEntries(docs.map((d) => [d.id, d]));

export const dateKeyOf = (t: number): DateKey => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function loadDocs(repos: Repositories): Promise<UserDocs> {
  const [profile, mealLogs, waterLogs, workoutLogs, favourites, mealPlans, savings] = await Promise.all([
    repos.profile.get(PROFILE_ID),
    repos.mealLogs.list(),
    repos.waterLogs.list(),
    repos.workoutLogs.list(),
    repos.favourites.list(),
    repos.mealPlans.list(),
    repos.savings.list(),
  ]);
  return {
    profile,
    mealLogs: byId(mealLogs),
    waterLogs: byId(waterLogs),
    workoutLogs: byId(workoutLogs),
    favourites: byId(favourites),
    mealPlans: byId(mealPlans),
    savings: byId(savings),
  };
}

export function profileToLegacy(p: UserProfile | null): Profile {
  const x = p ?? DEFAULT_PROFILE;
  return { name: x.name, goal: x.goal, level: x.cookingLevel, diet: x.dietType, breakfastReminder: x.breakfastReminder, onboarded: x.onboarded };
}

export function legacyProfilePatch(p: Partial<Profile>): Partial<UserProfile> {
  const out: Partial<UserProfile> = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.goal !== undefined) out.goal = p.goal;
  if (p.level !== undefined) out.cookingLevel = p.level;
  if (p.diet !== undefined) out.dietType = p.diet;
  if (p.breakfastReminder !== undefined) out.breakfastReminder = p.breakfastReminder;
  if (p.onboarded !== undefined) out.onboarded = p.onboarded;
  return out;
}

const live = <T extends BaseDoc>(r: Record<string, T>) => Object.values(r).filter((d) => !d.deleted);

/** The demo's state shape, derived from the documents. Pure. */
export function toView(docs: UserDocs): LegacyState {
  const days: Record<string, DayLog> = {};
  const day = (k: DateKey) => (days[k] ??= { meals: [], exercise: [], water: 0 });
  for (const m of live(docs.mealLogs).sort((a, b) => a.timestamp - b.timestamp)) {
    day(m.dateKey).meals.push({ name: m.name, emoji: m.emoji, kcal: m.kcal, protein: m.proteinG, fibre: m.fibreG, cooked: m.cooked, at: m.timestamp });
  }
  for (const w of live(docs.workoutLogs).sort((a, b) => a.timestamp - b.timestamp)) {
    day(w.dateKey).exercise.push({ type: w.type, minutes: w.minutes, kcal: w.kcal, at: w.timestamp });
  }
  for (const w of live(docs.waterLogs)) if (w.glasses > 0) day(w.dateKey).water = w.glasses;
  return {
    profile: profileToLegacy(docs.profile && !docs.profile.deleted ? docs.profile : null),
    days,
    moneySaved: live(docs.savings).reduce((s, e) => s + e.amountInr, 0),
    favourites: live(docs.favourites)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((f) => f.dishId),
    plan: Object.fromEntries(live(docs.mealPlans).map((p) => [p.dateKey, p.slots])),
  };
}

/** How many of these documents are the user's own (not the demo's sample week). */
export function ownDataCount(docs: UserDocs): number {
  let n = docs.profile && !docs.profile.deleted && docs.profile.onboarded ? 1 : 0;
  for (const c of LIST_COLLECTIONS) {
    n += live(docs[c] as Record<string, BaseDoc & { demoSample?: boolean }>).filter((d) => !d.demoSample).length;
  }
  return n;
}

/** The demo's sample week as documents, every one marked `demoSample` so it never reaches an account. */
export function sampleDocs(seed: LegacyState, now: number): LegacyDocs {
  const docs = fromLegacyState(seed, now);
  const mark = <T extends BaseDoc>(list: T[]) => list.map((d) => ({ ...d, demoSample: true }));
  return {
    profile: docs.profile,
    mealLogs: mark(docs.mealLogs),
    waterLogs: mark(docs.waterLogs),
    workoutLogs: mark(docs.workoutLogs),
    favourites: mark(docs.favourites),
    mealPlans: mark(docs.mealPlans),
    savings: mark(docs.savings),
  };
}

async function importDocs(repos: Repositories, docs: LegacyDocs) {
  await repos.profile.importMany([docs.profile]);
  await repos.mealLogs.importMany(docs.mealLogs);
  await repos.waterLogs.importMany(docs.waterLogs);
  await repos.workoutLogs.importMany(docs.workoutLogs);
  await repos.favourites.importMany(docs.favourites);
  await repos.mealPlans.importMany(docs.mealPlans);
  await repos.savings.importMany(docs.savings);
}

function parseLegacy(raw: string | null): LegacyState | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && v.profile && v.days ? (v as LegacyState) : null;
  } catch {
    return null;
  }
}

/**
 * First run of the new storage on this device (guest store only):
 * - an existing demo blob (`fitplate.state.v2`) becomes guest documents, so nobody loses their logs;
 * - otherwise the demo's sample week is seeded, marked as sample.
 * Runs once; the old blob is left untouched as a backup.
 */
export async function prepareGuestDevice(kv: KeyValueStore, guest: UserData, seed: () => LegacyState, now: number): Promise<'ready' | 'migrated' | 'seeded'> {
  if (await kv.getItem(GUEST_READY_KEY)) return 'ready';
  const legacy = parseLegacy(await kv.getItem(LEGACY_KEY));
  await importDocs(guest.repos, legacy ? fromLegacyState(legacy, now) : sampleDocs(seed(), now));
  await kv.setItem(GUEST_READY_KEY, String(now));
  return legacy ? 'migrated' : 'seeded';
}

const guestRepos = (kv: KeyValueStore) => createRepositories(createLocalDocStore(kv, GUEST_OWNER));

/** Number of the guest's own documents to offer to this account; 0 once the user has answered. */
export async function guestOfferCount(kv: KeyValueStore, uid: string): Promise<number> {
  if (await kv.getItem(guestCopyAskedKey(uid))) return 0;
  return ownDataCount(await loadDocs(guestRepos(kv)));
}

/** "Copy my data": copy the guest's own documents into the account, then forget them on the device. */
export async function copyGuestData(kv: KeyValueStore, account: UserData, uid: string): Promise<number> {
  const guest = createLocalDocStore(kv, GUEST_OWNER);
  let copied = await copyGuestToAccount(guest, account.store, COLLECTIONS.filter((c) => c !== 'profile'));
  // The account's own profile always wins; the guest's is used only for a brand-new account.
  const guestProfile = (await guest.getAll<Doc<UserProfile>>('profile'))[PROFILE_ID];
  if (guestProfile?.onboarded && !(await account.repos.profile.get(PROFILE_ID))) {
    await account.repos.profile.importMany([guestProfile]);
    copied += 1;
  }
  await createStorageService(kv).resetAll(ownerPrefix(GUEST_OWNER));
  await kv.setItem(guestCopyAskedKey(uid), 'copied');
  return copied;
}

/** "Start fresh": keep the guest data on the device and do not ask this account again. */
export async function skipGuestCopy(kv: KeyValueStore, uid: string): Promise<void> {
  await kv.setItem(guestCopyAskedKey(uid), 'skipped');
}

/**
 * Sign-out (SPEC-ADDENDA §5): the cloud keeps the data and this device forgets it.
 * If some changes could not reach the cloud (offline), the device copy and its
 * outbox are kept, so nothing is lost; they are sent at the next sign-in.
 * Returns the number of changes still waiting.
 */
export async function signOutDevice(data: UserData): Promise<number> {
  if (!data.cloud) return 0;
  try {
    await data.flush();
  } catch {
    // Offline: the outbox keeps the changes.
  }
  const waiting = await data.pending();
  if (waiting === 0) await data.clearDevice();
  return waiting;
}

const DELETE_TIMEOUT_MS = 20_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('unavailable: the cloud did not answer in time')), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

/**
 * "Delete my data" (signed in, cloud on): hard-deletes everything under
 * `users/{uid}` in Firestore, then forgets this account on the device (its
 * documents, its outbox so nothing re-uploads, and the "bring your data"
 * answer). Waiting changes are sent first so no debounced write can land
 * after the delete. If the cloud can't be reached this throws before
 * anything on the device changes. Signing out is left to the caller.
 */
export async function deleteMyData(
  data: UserData,
  remote: RemoteAdapter,
  uid: string,
  kv: KeyValueStore,
  opts: { timeoutMs?: number } = {},
): Promise<number> {
  if (!data.cloud || !uid) return 0;
  // Firestore writes wait silently while offline, so give up after a while instead of spinning forever.
  const timeoutMs = opts.timeoutMs ?? DELETE_TIMEOUT_MS;
  // Sends the outbox and cancels the debounce timer. A failed send is retried by
  // the next flush; if the cloud is unreachable, the delete below throws too.
  await withTimeout(data.flush(), timeoutMs);
  const deleted = await withTimeout(deleteAllUserData(remote, uid), timeoutMs);
  await data.clearDevice();
  await kv.removeItem(guestCopyAskedKey(uid));
  return deleted;
}

/** Where this user's data lives, in one plain line. */
export function syncStatusLine(signedIn: boolean, cloud: boolean, syncError: boolean): string {
  if (!signedIn) return 'Saved on this device only. Sign in to keep it on every device.';
  if (!cloud) return 'Saved on this device.';
  if (syncError) return 'Offline right now. Changes are saved on this phone and will sync when you’re back online.';
  return '☁️ Synced to your account on every device.';
}

type Fields<T> = Omit<T, keyof BaseDoc>;
function fieldsOf<T extends BaseDoc>(doc: T): Fields<T> {
  const { id: _id, createdAt: _c, updatedAt: _u, schemaVersion: _s, deleted: _d, ...fields } = doc;
  return fields;
}

/**
 * One user's live session. Every action updates the in-memory documents at
 * once (so the screen changes on the same tap) and then writes through the
 * repositories, one write at a time and in order.
 */
export function createUserSession(
  data: UserData,
  initial: UserDocs,
  opts: { onChange: (docs: UserDocs) => void; onError?: (e: unknown) => void; now?: () => number },
) {
  const now = opts.now ?? Date.now;
  const { repos } = data;
  let docs = initial;
  let queue: Promise<void> = Promise.resolve();

  const set = (next: UserDocs) => {
    docs = next;
    opts.onChange(next);
  };
  const enqueue = (op: () => Promise<unknown>) => {
    queue = queue.then(op).then(
      () => undefined,
      (e) => opts.onError?.(e),
    );
  };
  const base = (id: string, collection: keyof typeof SCHEMAS, t: number): BaseDoc => ({
    id,
    createdAt: t,
    updatedAt: t,
    schemaVersion: SCHEMAS[collection].version,
    deleted: false,
  });
  const put = <C extends ListCollection>(c: C, doc: UserDocs[C][string]) => set({ ...docs, [c]: { ...docs[c], [doc.id]: doc } });
  const drop = (c: ListCollection, id: string) => {
    const { [id]: _gone, ...rest } = docs[c];
    set({ ...docs, [c]: rest });
  };

  return {
    get docs() {
      return docs;
    },
    /** Resolves when every write so far has reached the device store (and joined the cloud outbox). */
    idle: () => queue,
    /** Replace the in-memory documents, e.g. after pulling from the cloud. */
    reload(next: UserDocs) {
      set(next);
    },

    updateProfile(patch: Partial<UserProfile>) {
      const t = now();
      const current = docs.profile ?? { ...DEFAULT_PROFILE, ...base(PROFILE_ID, 'profile', t) };
      const next: Doc<UserProfile> = { ...current, ...patch, updatedAt: t };
      if (patch.onboarded && !current.onboarded && !next.onboardedOn) next.onboardedOn = dateKeyOf(t);
      set({ ...docs, profile: next });
      enqueue(() => repos.profile.upsert(PROFILE_ID, fieldsOf(next)));
    },

    addMeal(meal: Omit<MealLog, 'timestamp' | 'dateKey'>) {
      const t = now();
      const doc: Doc<MealLog> = { ...meal, timestamp: t, dateKey: dateKeyOf(t), ...base(makeId(t), 'mealLogs', t) };
      put('mealLogs', doc);
      enqueue(() => repos.mealLogs.create({ ...fieldsOf(doc), id: doc.id }));
    },

    addWorkout(w: Omit<WorkoutLog, 'timestamp' | 'dateKey'>) {
      const t = now();
      const doc: Doc<WorkoutLog> = { ...w, timestamp: t, dateKey: dateKeyOf(t), ...base(makeId(t), 'workoutLogs', t) };
      put('workoutLogs', doc);
      enqueue(() => repos.workoutLogs.create({ ...fieldsOf(doc), id: doc.id }));
    },

    /** One document per day, so rapid taps change one counter (and one debounced cloud write). */
    addWater(delta: number) {
      const t = now();
      const dateKey = dateKeyOf(t);
      const id = `water-${dateKey}`;
      const current = docs.waterLogs[id];
      const glasses = Math.max(0, (current?.glasses ?? 0) + delta);
      if (current && current.glasses === glasses) return;
      const doc: Doc<WaterLog> = { ...(current ?? base(id, 'waterLogs', t)), timestamp: t, dateKey, glasses, updatedAt: t };
      put('waterLogs', doc);
      enqueue(() => repos.waterLogs.upsert(id, { timestamp: t, dateKey, glasses }));
    },

    addSaving(amountInr: number, dishId: string | null, note: string | null = null) {
      const t = now();
      const doc: Doc<SavingEntry> = { timestamp: t, amountInr, dishId, note, ...base(makeId(t), 'savings', t) };
      put('savings', doc);
      enqueue(() => repos.savings.create({ ...fieldsOf(doc), id: doc.id }));
    },

    toggleFavourite(dishId: string) {
      if (docs.favourites[dishId]) {
        drop('favourites', dishId);
        enqueue(() => repos.favourites.remove(dishId));
        return;
      }
      put('favourites', { dishId, ...base(dishId, 'favourites', now()) });
      enqueue(() => repos.favourites.upsert(dishId, { dishId }));
    },

    setPlan(dateKey: DateKey, slot: Slot, dishId: string | null) {
      const t = now();
      const current = docs.mealPlans[dateKey];
      const slots = { ...(current?.slots ?? {}) };
      if (dishId) slots[slot] = dishId;
      else delete slots[slot];
      put('mealPlans', { ...(current ?? base(dateKey, 'mealPlans', t)), dateKey, slots, updatedAt: t });
      enqueue(() => repos.mealPlans.upsert(dateKey, { dateKey, slots }));
    },

    /** Guests only: wipe this device's guest data and load the sample week again. */
    resetToSample(seed: LegacyState) {
      const t = now();
      const sample = sampleDocs(seed, t);
      set({
        profile: sample.profile,
        mealLogs: byId(sample.mealLogs),
        waterLogs: byId(sample.waterLogs),
        workoutLogs: byId(sample.workoutLogs),
        favourites: byId(sample.favourites),
        mealPlans: byId(sample.mealPlans),
        savings: byId(sample.savings),
      });
      enqueue(async () => {
        await data.clearDevice();
        await importDocs(repos, sample);
      });
    },
  };
}

export type UserSession = ReturnType<typeof createUserSession>;
```

### `src/lib/store.tsx`

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { dishes, type Diet, type Dish } from '../data/dishes';
import { GUEST_OWNER, openUserData, type UserData } from '../services/storage';
import { createFirestoreAdapter, getDb } from '../services/storage/firestoreRemote';
import type { KeyValueStore } from '../services/storage/kv';
import type { RemoteAdapter } from '../services/storage/remote';
import {
  copyGuestData,
  createUserSession,
  deleteMyData,
  EMPTY_DOCS,
  guestOfferCount,
  legacyProfilePatch,
  loadDocs,
  prepareGuestDevice,
  signOutDevice,
  skipGuestCopy,
  toView,
  type UserDocs,
  type UserSession,
} from '../services/userSession';
import { firebaseConfigured, getFirebaseAuth } from './firebase';

export type Goal = 'lose' | 'maintain' | 'gain' | 'muscle';
export type Level = 'beginner' | 'expert';
export type Slot = 'breakfast' | 'lunch' | 'dinner';

export type Profile = {
  name: string;
  goal: Goal;
  level: Level;
  diet: Diet;
  breakfastReminder: boolean;
  onboarded: boolean;
};

export type MealLog = { name: string; emoji: string; kcal: number; protein: number; fibre: number; cooked: boolean; at: number };
export type ExerciseLog = { type: string; minutes: number; kcal: number; at: number };
export type DayLog = { meals: MealLog[]; exercise: ExerciseLog[]; water: number };

export type State = {
  profile: Profile;
  days: Record<string, DayLog>;
  moneySaved: number;
  favourites: string[];
  plan: Record<string, Partial<Record<Slot, string>>>;
};

export const GOALS: Record<Goal, { label: string; emoji: string; kcal: number; protein: number; blurb: string }> = {
  lose: { label: 'Lose weight', emoji: '🔥', kcal: 1800, protein: 90, blurb: 'Tasty, lighter meals and a small daily deficit.' },
  maintain: { label: 'Eat healthier', emoji: '🥗', kcal: 2200, protein: 70, blurb: 'Better nutrition without counting every bite.' },
  gain: { label: 'Gain weight', emoji: '🍽️', kcal: 2600, protein: 90, blurb: 'Bigger, wholesome meals in a steady surplus.' },
  muscle: { label: 'Build muscle', emoji: '💪', kcal: 2400, protein: 120, blurb: 'High-protein meals to match your workouts.' },
};
export const FIBRE_TARGET = 30;
export const WATER_TARGET = 8;

// MET values; kcal = MET × 70 kg × hours.
export const EXERCISES = [
  { type: 'Walk', emoji: '🚶', met: 3.5 },
  { type: 'Run', emoji: '🏃', met: 9.8 },
  { type: 'Cycle', emoji: '🚴', met: 7.5 },
  { type: 'Yoga', emoji: '🧘', met: 3 },
  { type: 'Gym', emoji: '🏋️', met: 6 },
  { type: 'Sport', emoji: '🏸', met: 7 },
];
export const exerciseKcal = (met: number, minutes: number) => Math.round((met * 70 * minutes) / 60);

// Quick logs for days you don't cook (office canteen, ordering in).
export const QUICK_MEALS = [
  { name: 'Office canteen thali', emoji: '🍱', kcal: 650, protein: 20, fibre: 8 },
  { name: 'Sandwich', emoji: '🥪', kcal: 380, protein: 14, fibre: 4 },
  { name: 'Salad bowl', emoji: '🥗', kcal: 320, protein: 12, fibre: 9 },
  { name: 'Dosa + chutney', emoji: '🫓', kcal: 400, protein: 9, fibre: 4 },
  { name: 'Ordered biryani', emoji: '🍗', kcal: 850, protein: 30, fibre: 3 },
  { name: 'Chai + biscuits', emoji: '☕', kcal: 180, protein: 3, fibre: 1 },
];

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const emptyDay = (): DayLog => ({ meals: [], exercise: [], water: 0 });

// Sample history so the progress screens look alive in the demo. Guests get it
// on a new device, marked as sample, so it is never copied into an account.
export function sampleState(): State {
  const days: Record<string, DayLog> = {};
  const today = new Date();
  const sample = [
    { m: ['poha', 'q:Office canteen thali', 'paneer-butter-masala'], ex: ['Walk', 30], w: 7 },
    { m: ['overnight-oats', 'q:Sandwich', 'rajma-chawal'], ex: ['Yoga', 25], w: 6 },
    { m: ['q:Chai + biscuits', 'q:Office canteen thali', 'q:Ordered biryani'], ex: null, w: 4 },
    { m: ['moong-chilla', 'q:Salad bowl', 'egg-bhurji'], ex: ['Run', 20], w: 8 },
    { m: ['masala-oats', 'q:Office canteen thali', 'chicken-biryani'], ex: ['Gym', 45], w: 7 },
    { m: ['poha', 'q:Dosa + chutney', 'rajma-chawal'], ex: ['Walk', 40], w: 6 },
  ] as const;
  sample.forEach((s, i) => {
    const day = emptyDay();
    s.m.forEach((m, j) => {
      const at = addDays(today, -(6 - i)).getTime() + (8 + j * 5) * 3600_000;
      if (m.startsWith('q:')) {
        const q = QUICK_MEALS.find((x) => x.name === m.slice(2))!;
        day.meals.push({ ...q, cooked: false, at });
      } else {
        const d = dishes.find((x) => x.id === m)!;
        day.meals.push({ name: d.name, emoji: d.emoji, kcal: d.kcal, protein: d.proteinG, fibre: d.fibreG, cooked: true, at });
      }
    });
    if (s.ex) {
      const e = EXERCISES.find((x) => x.type === s.ex![0])!;
      day.exercise.push({ type: e.type, minutes: s.ex[1], kcal: exerciseKcal(e.met, s.ex[1]), at: 0 });
    }
    day.water = s.w;
    days[dayKey(addDays(today, -(6 - i)))] = day;
  });
  return {
    profile: { name: '', goal: 'lose', level: 'beginner', diet: 'non-veg', breakfastReminder: true, onboarded: false },
    days,
    moneySaved: 2860,
    favourites: ['poha', 'paneer-butter-masala'],
    plan: {},
  };
}

type User = { name: string; guest: boolean; uid?: string; email?: string; photo?: string };

type Store = State & {
  user: User | null;
  /** Sign-in state is known and this user's data has loaded. */
  ready: boolean;
  today: DayLog;
  /** Signed in and syncing to Firestore (SPEC-ADDENDA §5). */
  cloud: boolean;
  /** The last cloud sync failed (usually offline). Changes are safe on the device and retry later. */
  syncError: boolean;
  /** Guest entries on this device that a newly signed-in user can bring along (0 = nothing to ask). */
  guestOffer: number;
  copyGuestData: () => Promise<void>;
  skipGuestCopy: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  /**
   * Signed in with the cloud on: permanently deletes everything saved under
   * `users/{uid}` in Firestore, clears this device's copy, then signs out.
   * Throws (and changes nothing) when the cloud can't be reached. No-op otherwise.
   */
  deleteMyData: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => void;
  logCooked: (dish: Dish, saved: number) => void;
  logQuickMeal: (m: (typeof QUICK_MEALS)[number]) => void;
  logExercise: (type: string, minutes: number) => void;
  addWater: (n: number) => void;
  toggleFavourite: (id: string) => void;
  setPlan: (date: string, slot: Slot, dishId: string | null) => void;
  /** Guests only: restore the sample week. Signed-in accounts never get sample data. */
  resetDemo: () => void;
  streak: number;
};

const StoreContext = createContext<Store | null>(null);

// AsyncStorage matches the storage layer's key-value interface.
const kv: KeyValueStore = AsyncStorage;

// Firestore is used only when Firebase is configured and the cloudSync flag is on;
// otherwise a signed-in user's data stays on the device, as in the demo.
function cloudAdapter() {
  if (!featureFlags.cloudSync || !firebaseConfigured || !getFirebaseAuth()) return null;
  const db = getDb();
  return db ? createFirestoreAdapter(db) : null;
}

// A first sign-in on a new device waits this long for the cloud before showing what the device has.
const FIRST_SYNC_WAIT_MS = 8000;

type Active = {
  owner: string;
  data: UserData;
  session: UserSession;
  remote: RemoteAdapter | null;
  /** The start-up merge with the cloud (it may still be running in the background). */
  firstSync: Promise<unknown>;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [active, setActive] = useState<Active | null>(null);
  const [docs, setDocs] = useState<UserDocs>(EMPTY_DOCS);
  const [syncError, setSyncError] = useState(false);
  const [guestOffer, setGuestOffer] = useState(0);
  const owner = user && !user.guest && user.uid ? user.uid : GUEST_OWNER;

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(
        u
          ? { name: u.displayName?.split(' ')[0] ?? '', guest: false, uid: u.uid, email: u.email ?? undefined, photo: u.photoURL ?? undefined }
          : null,
      );
      setAuthReady(true);
    });
  }, []);

  // Open the data for whoever is using the app: the guest store, or the signed-in user's (device + cloud).
  useEffect(() => {
    if (!authReady) return;
    let alive = true;
    const signedIn = owner !== GUEST_OWNER;
    const remote = signedIn ? cloudAdapter() : null;
    const data = openUserData({ kv, uid: signedIn ? owner : null, remote, onSyncError: () => alive && setSyncError(true) });

    (async () => {
      if (!signedIn) await prepareGuestDevice(kv, data, sampleState, Date.now());
      const local = await loadDocs(data.repos);
      const session = createUserSession(data, local, { onChange: (d) => alive && setDocs(d), onError: () => alive && setSyncError(true) });

      const refresh = async () => {
        await session.idle();
        if (alive) session.reload(await loadDocs(data.repos));
      };
      let firstSync: Promise<unknown> = Promise.resolve();
      if (data.cloud) {
        const synced = data.syncAll().then(
          () => {
            if (alive) setSyncError(false);
            return refresh();
          },
          () => {
            if (alive) setSyncError(true);
          },
        );
        // A device that already has this user's data shows it at once and syncs in the background.
        // A new device waits for the first pull (up to FIRST_SYNC_WAIT_MS) so it doesn't look empty.
        firstSync = synced;
        if (!local.profile) await Promise.race([synced, new Promise((r) => setTimeout(r, FIRST_SYNC_WAIT_MS))]);
      }
      const offer = signedIn ? await guestOfferCount(kv, owner) : 0;
      if (!alive) return;
      setGuestOffer(offer);
      setDocs(session.docs);
      setActive({ owner, data, session, remote, firstSync });
    })().catch(() => {
      if (alive) setSyncError(true);
    });

    return () => {
      alive = false;
    };
  }, [owner, authReady]);

  // Send waiting changes when the app goes to the background, before the OS may close it.
  useEffect(() => {
    if (!active?.data.cloud) return;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') active.data.flush().catch(() => setSyncError(true));
    });
    return () => sub.remove();
  }, [active]);

  const state = useMemo(() => toView(docs), [docs]);
  const ready = authReady && active?.owner === owner;

  const store = useMemo<Store>(() => {
    const today = state.days[dayKey()] ?? emptyDay();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = state.days[dayKey(addDays(new Date(), -i))];
      if (d?.meals.some((m) => m.cooked)) streak++;
      else if (i > 0) break;
    }
    // Before the data has loaded, writes have nowhere to go; screens are not interactive yet anyway.
    const s = ready ? active?.session : undefined;
    // The last step of every sign-out: leave Firebase Auth and go back to the welcome screen.
    const endAuth = async () => {
      const auth = getFirebaseAuth();
      if (auth && !user?.guest) await fbSignOut(auth);
      setUser(null);
    };
    return {
      ...state,
      user,
      ready,
      today,
      streak,
      cloud: Boolean(ready && active?.data.cloud),
      syncError,
      guestOffer: ready ? guestOffer : 0,
      copyGuestData: async () => {
        if (!active || active.owner === GUEST_OWNER) return;
        await copyGuestData(kv, active.data, active.owner);
        await active.session.idle();
        active.session.reload(await loadDocs(active.data.repos));
        setGuestOffer(0);
      },
      skipGuestCopy: async () => {
        if (!active || active.owner === GUEST_OWNER) return;
        await skipGuestCopy(kv, active.owner);
        setGuestOffer(0);
      },
      continueAsGuest: () => setUser({ name: '', guest: true }),
      signOut: async () => {
        if (active && active.owner !== GUEST_OWNER) {
          await active.session.idle();
          await signOutDevice(active.data);
        }
        await endAuth();
      },
      deleteMyData: async () => {
        if (!ready || !active || active.owner === GUEST_OWNER || !active.data.cloud || !active.remote) return;
        // Let the start-up merge finish first, so it can't push documents back after the delete.
        // (Offline it may never finish; the delete below then fails on its own.)
        await Promise.race([active.firstSync.catch(() => {}), new Promise((r) => setTimeout(r, FIRST_SYNC_WAIT_MS))]);
        await active.session.idle();
        await deleteMyData(active.data, active.remote, active.owner, kv);
        // The data is gone, so sign out without the usual flush.
        await endAuth();
      },
      updateProfile: (p) => s?.updateProfile(legacyProfilePatch(p)),
      logCooked: (dish, saved) => {
        if (!s) return;
        s.addMeal({ name: dish.name, emoji: dish.emoji, dishId: dish.id, source: 'dish', kcal: dish.kcal, proteinG: dish.proteinG, fibreG: dish.fibreG, cooked: true });
        if (saved) s.addSaving(saved, dish.id);
      },
      logQuickMeal: (m) => s?.addMeal({ name: m.name, emoji: m.emoji, dishId: null, source: 'quick', kcal: m.kcal, proteinG: m.protein, fibreG: m.fibre, cooked: false }),
      logExercise: (type, minutes) => {
        const e = EXERCISES.find((x) => x.type === type);
        if (e) s?.addWorkout({ type, exerciseId: null, minutes, kcal: exerciseKcal(e.met, minutes) });
      },
      addWater: (n) => s?.addWater(n),
      toggleFavourite: (id) => s?.toggleFavourite(id),
      setPlan: (date, slot, dishId) => s?.setPlan(date, slot, dishId),
      resetDemo: () => {
        if (s && active?.owner === GUEST_OWNER) s.resetToSample(sampleState());
      },
    };
  }, [state, user, ready, active, syncError, guestOffer]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export const dayTotals = (d: DayLog) => ({
  kcalIn: d.meals.reduce((s, m) => s + m.kcal, 0),
  kcalOut: d.exercise.reduce((s, e) => s + e.kcal, 0),
  protein: d.meals.reduce((s, m) => s + m.protein, 0),
  fibre: d.meals.reduce((s, m) => s + m.fibre, 0),
});

const dietAllows = (pref: Diet, dish: Diet) =>
  pref === 'non-veg' || dish === 'veg' || (pref === 'egg' && dish === 'egg');

// Tasty-first: every dish stays available, recommendations just rank what fits the goal.
export function recommend(profile: Profile) {
  const ok = dishes.filter((d) => dietAllows(profile.diet, d.diet));
  const score = (d: Dish) => {
    switch (profile.goal) {
      case 'lose':
        return d.healthScore * 40 + d.fibreG * 10 - d.kcal / 5;
      case 'muscle':
        return d.proteinG * 6 + d.healthScore * 10;
      case 'gain':
        return d.kcal / 5 + d.proteinG * 3;
      default:
        return d.healthScore * 30 + d.fibreG * 5;
    }
  };
  return [...ok].sort((a, b) => score(b) - score(a));
}

export const allowedDishes = (profile: Profile) => dishes.filter((d) => dietAllows(profile.diet, d.diet));
```

### `src/app/your-data.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeIn, Glass, PressableScale } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, type } from '../theme';

const SAVED: [string, string, string][] = [
  ['👤', 'Your profile', 'Name, goal, diet, cooking level and reminder setting.'],
  ['🍛', 'Meals', 'What you ate or cooked, with its calories, protein and fibre.'],
  ['💧', 'Water', 'Glasses of water per day.'],
  ['🏃', 'Workouts', 'Type of exercise, minutes and calories burned.'],
  ['❤️', 'Favourites', 'Dishes you saved.'],
  ['🗓️', 'Meal plans', 'Dishes you planned for each day.'],
  ['💰', 'Savings', 'Money saved by cooking instead of ordering.'],
];

function Section({ i, title, children }: { i: number; title: string; children: ReactNode }) {
  return (
    <FadeIn i={i}>
      <Glass style={{ marginTop: 14 }}>
        <Text style={styles.label} accessibilityRole="header">
          {title}
        </Text>
        {children}
      </Glass>
    </FadeIn>
  );
}

function Point({ children }: { children: ReactNode }) {
  return (
    <View style={styles.point}>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function YourData() {
  const { user } = useStore();
  const signedIn = Boolean(user && !user.guest);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        <PressableScale onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.back} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text style={[type.h2, { color: colors.text }]} accessibilityRole="header">
          Your data
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeIn i={0}>
          <Text style={styles.intro}>What FitPlate keeps about you, where it lives, and how to remove it. In plain words.</Text>
        </FadeIn>

        <Section i={1} title="What we save">
          <Text style={[styles.body, { marginBottom: 10 }]}>Only what you enter or tap in the app:</Text>
          {SAVED.map(([emoji, name, what]) => (
            <View key={name} style={styles.row}>
              <Text style={styles.emoji}>{emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{name}</Text>
                <Text style={styles.small}>{what}</Text>
              </View>
            </View>
          ))}
          {signedIn ? (
            <Text style={[styles.small, { marginTop: 6 }]}>
              Signing in with Google also shares your name, email and photo with FitPlate. Firebase sign-in keeps them with your account.
            </Text>
          ) : null}
        </Section>

        <Section i={2} title="Where it’s saved">
          {signedIn ? (
            <>
              <Point>In your own private space in Google Firebase (Cloud Firestore), so it’s there on every device you sign in on.</Point>
              <Point>Stored in Google’s India region (Mumbai, asia-south1).</Point>
              <Point>Private to your account: Firebase access rules let only your signed-in account read or change it in the app. FitPlate’s owner can see stored data in the Firebase console to run the service.</Point>
              <Point>A copy stays on this device so the app works offline.</Point>
            </>
          ) : (
            <>
              <Point>Only on this device. Nothing is sent to the cloud while you use FitPlate without signing in.</Point>
              <Point>If you sign in later, we ask before copying anything into your account.</Point>
            </>
          )}
        </Section>

        <Section i={3} title="What is not personal">
          <Text style={styles.body}>
            Dishes, recipes, prices, nutrition facts and exercise info are the same for everyone. They ship inside the app and never include
            anything about you.
          </Text>
        </Section>

        <Section i={4} title="Your choices">
          <Point>
            <Text style={styles.strong}>Sign out</Text> removes your data from this device. Your account keeps it in the cloud.
          </Point>
          <Point>
            <Text style={styles.strong}>Delete my data</Text> (in Profile, when signed in) permanently removes everything we saved for your
            account, from the cloud and this device.
          </Point>
          <Point>Deleting your whole account and downloading a copy of your data are coming soon.</Point>
        </Section>

        <Text style={styles.foot}>General information about how this app handles your data, not legal advice.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 18, paddingBottom: 60, width: '100%', maxWidth: 640, alignSelf: 'center' },
  intro: { ...type.body, color: colors.muted },
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  body: { ...type.body, color: colors.text, flexShrink: 1 },
  small: { ...type.small, color: colors.muted },
  strong: { fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 7 },
  emoji: { fontSize: 20, width: 26, textAlign: 'center' },
  rowTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  point: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dot: { ...type.body, color: colors.accent },
  foot: { ...type.small, color: colors.faint, textAlign: 'center', marginTop: 20 },
});
```

### `src/components/ConfirmDeleteData.tsx`

```tsx
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { tap } from '../lib/haptics';
import { colors, type } from '../theme';
import { GradientButton } from './ui';

type Props = {
  visible: boolean;
  /** Deletes everything; rejects when the cloud can't be reached. */
  onConfirm: () => Promise<void>;
  /** Called after a successful delete. */
  onDone: () => void;
  onCancel: () => void;
};

/**
 * The "Delete my data" confirmation. An in-app Modal rather than Alert.alert,
 * which does nothing on web.
 */
export function ConfirmDeleteData({ visible, onConfirm, onDone, onCancel }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await onConfirm();
      setBusy(false);
      onDone();
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  const cancel = () => {
    if (busy) return;
    setFailed(false); // the next opening starts clean
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancel}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={styles.emoji}>🗑️</Text>
          <Text style={styles.title}>Delete all your FitPlate data?</Text>
          <Text style={styles.body}>
            This permanently deletes your profile, meal, water and workout logs, saved dishes, meal plans and savings, from the cloud and from
            this device. It can’t be undone. You’ll be signed out afterwards.
          </Text>
          {failed ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              Couldn’t reach the cloud. Nothing was deleted. Check your connection and try again.
            </Text>
          ) : null}
          {busy ? (
            <View style={styles.busy} accessibilityLabel="Deleting your data">
              <ActivityIndicator color={colors.bad} />
              <Text style={styles.busyText}>Deleting…</Text>
            </View>
          ) : (
            <View style={styles.buttons}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete everything"
                onPress={() => {
                  tap();
                  confirm();
                }}
                style={({ pressed }) => [styles.danger, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.dangerText}>Delete everything</Text>
              </Pressable>
              <GradientButton title="Cancel" variant="glass" onPress={cancel} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  emoji: { fontSize: 34, marginBottom: 8 },
  title: { ...type.h1, color: colors.text },
  body: { ...type.body, color: colors.muted, marginTop: 8 },
  error: { ...type.small, color: colors.bad, marginTop: 12 },
  buttons: { gap: 10, marginTop: 20 },
  danger: {
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: colors.bad,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dangerText: { color: '#2A0606', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  busy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 118, marginTop: 20 },
  busyText: { ...type.body, color: colors.text },
});
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

### `src/app/index.tsx`

```tsx
import { Link, Redirect } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import GoogleSignInButton from '../components/GoogleSignInButton';
import { GuestCopyPrompt } from '../components/GuestCopyPrompt';
import { GradientButton, VideoBackground } from '../components/ui';
import { firebaseConfigured } from '../lib/firebase';
import { useStore } from '../lib/store';
import { colors, type } from '../theme';

const googleReady =
  firebaseConfigured &&
  Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

const WORDS = ['Cook it.', 'Track it.', 'Burn it.'];

function RotatingWord() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1600 }),
        withTiming(-1, { duration: 450 }),
        withTiming(-1, { duration: 1600 }),
        withTiming(-2, { duration: 450 }),
        withTiming(-2, { duration: 1600 }),
        withTiming(0, { duration: 450 }),
      ),
      -1,
    );
  }, [y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * 44 }] }));
  return (
    <View style={{ height: 44, overflow: 'hidden' }}>
      <Animated.View style={anim}>
        {WORDS.map((w, i) => (
          <Text key={w} style={[styles.word, { color: [colors.accent2, colors.warm, colors.blue][i] }]}>
            {w}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

export default function Welcome() {
  const { user, ready, profile, continueAsGuest, guestOffer, copyGuestData, skipGuestCopy } = useStore();
  // A newly signed-in user first answers "Bring your data with you?", then moves on.
  if (ready && user && guestOffer === 0) return <Redirect href={profile.onboarded ? '/(tabs)' : '/onboarding'} />;

  return (
    <View style={styles.root}>
      {/* Swap assets/videos/login.mp4 for real cooking footage; keep it short, muted and loopable. */}
      <VideoBackground source={require('../../assets/videos/login.mp4')} dim={0.15} />
      <SafeAreaView style={styles.content}>
        <Animated.View entering={FadeIn.duration(900)}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🍽️  FITPLATE</Text>
          </View>
        </Animated.View>

        <View>
          <Animated.Text entering={FadeInDown.delay(150).duration(700)} style={styles.title}>
            Your health{'\n'}starts on your plate.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(350).duration(700)} style={{ marginTop: 10 }}>
            <RotatingWord />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(500).duration(700)} style={styles.pitch}>
            See what a dish costs to make before you tap order. Then cook it, one tiny step at a time.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(700).duration(700)} style={{ gap: 12, marginTop: 28 }}>
            {googleReady ? <GoogleSignInButton /> : null}
            <GradientButton
              title={googleReady ? 'Try it without signing in' : 'Get started'}
              variant={googleReady ? 'glass' : 'primary'}
              onPress={continueAsGuest}
            />
            <View>
              <Text style={styles.fine}>Free to start · No ads · Sign in to keep your data on every device</Text>
              {/* Its own pressable so the tap area is at least 44 pt high, though the text is small. */}
              <Link href="/your-data" asChild>
                <Pressable accessibilityRole="link" accessibilityLabel="Your data: what we save and where" hitSlop={4} style={styles.linkHit}>
                  <Text style={styles.link}>Your data</Text>
                </Pressable>
              </Link>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
      <GuestCopyPrompt count={ready && user ? guestOffer : 0} onCopy={copyGuestData} onSkip={skipGuestCopy} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'space-between', padding: 24 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: { ...type.label, color: colors.text },
  title: { ...type.hero, fontSize: 40, lineHeight: 44, color: colors.text },
  word: { fontSize: 34, lineHeight: 44, fontWeight: '900', letterSpacing: -0.8 },
  pitch: { color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 23, marginTop: 14 },
  fine: { ...type.small, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4 },
  linkHit: { alignSelf: 'center', minHeight: 44, minWidth: 88, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', marginTop: -6, marginBottom: -12 },
  link: { ...type.small, color: 'rgba(255,255,255,0.85)', fontWeight: '700', textDecorationLine: 'underline' },
});
```

### `src/app/profile.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDeleteData } from '../components/ConfirmDeleteData';
import { Chip, FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import type { Diet } from '../data/dishes';
import { setReminders } from '../lib/reminders';
import { GOALS, useStore, type Goal, type Level } from '../lib/store';
import { syncStatusLine } from '../services/userSession';
import { colors, type } from '../theme';

// `asTab` is set by the Profile tab of the new shell: no back button, and room
// at the bottom for the floating tab bar.
export function ProfileScreen({ asTab = false }: { asTab?: boolean }) {
  const { profile, updateProfile, signOut, deleteMyData, resetDemo, user, favourites, cloud, syncError } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canDelete = Boolean(user && !user.guest && cloud);
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
            <Text style={[type.small, styles.sync, { color: cloud && syncError ? colors.warn : colors.muted }]} accessibilityRole="text">
              {syncStatusLine(Boolean(user && !user.guest), cloud, syncError)}
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

        <FadeIn i={4}>
          <PressableScale onPress={() => router.push('/your-data')} accessibilityLabel="Your data: what we save and where" style={{ marginTop: 14 }}>
            <Glass style={styles.linkRow}>
              <Text style={{ fontSize: 24 }}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>Your data</Text>
                <Text style={[type.small, { color: colors.muted }]}>What we save, where it lives, and your choices</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Glass>
          </PressableScale>
        </FadeIn>

        <View style={{ gap: 10, marginTop: 24 }}>
          {/* Only guests can restore the sample week; a real account never gets sample data. */}
          {user?.guest ? (
            <GradientButton
              title="Reset demo data"
              variant="glass"
              onPress={() =>
                Alert.alert('Reset demo data?', 'This restores the sample week and clears your logs on this device.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: resetDemo },
                ])
              }
            />
          ) : null}
          <GradientButton
            title="Sign out"
            variant="glass"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
          {canDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete my data"
              accessibilityHint="Permanently deletes everything FitPlate saved for your account"
              onPress={() => setConfirmDelete(true)}
              style={({ pressed }) => [styles.danger, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.bad} />
              <Text style={styles.dangerText}>Delete my data</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          FitPlate demo · nutrition and prices are estimates, not medical advice.
        </Text>
      </ScrollView>
      <ConfirmDeleteData
        visible={confirmDelete}
        onConfirm={deleteMyData}
        onCancel={() => setConfirmDelete(false)}
        onDone={() => {
          setConfirmDelete(false);
          router.replace('/');
        }}
      />
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
  sync: { marginTop: 6, textAlign: 'center', paddingHorizontal: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.45)',
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  dangerText: { color: colors.bad, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
```

### `src/__tests__/data/priceTrend.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { computePriceEstimate, SEASONAL_PRODUCE, type PriceObservation } from '../../services/data/priceTrend';

const TODAY = '2026-10-01';
const ING = { today: TODAY, seasonal: false, kind: 'ingredient' } as const;
const DISH = { today: TODAY, seasonal: false, kind: 'dish' } as const;

function daysAgo(n: number): string {
  return new Date(Date.parse(`${TODAY}T00:00:00Z`) - n * 86400000).toISOString().slice(0, 10);
}

/** One synthetic observation `ago` days before TODAY, with a ±10 range around avg. */
function obs(ago: number, avg: number, extra: Partial<PriceObservation> = {}): PriceObservation {
  return { date: daysAgo(ago), min: avg - 10, max: avg + 10, avg, confidence: 'High', sourceFile: `r-${ago}.md`, ...extra };
}

describe('computePriceEstimate', () => {
  it('flat series → stable WMA', () => {
    const r = computePriceEstimate([120, 90, 60, 30, 0].map((d) => obs(d, 100)), ING);
    expect(r.trend).toBe('stable');
    expect(r.method).toBe('wma');
    expect(r.currentEstimate).toEqual({ min: 90, max: 110, avg: 100 });
    expect(r.change30dPct).toBe(0);
    expect(r.flags).toEqual([]);
    expect(r.stale).toBe(false);
  });

  it('steady rise → rising, uses the latest observation without extrapolating', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 110), obs(60, 120), obs(30, 130), obs(0, 140)], ING);
    expect(r.trend).toBe('rising');
    expect(r.method).toBe('latest-trend');
    expect(r.currentEstimate).toEqual({ min: 130, max: 150, avg: 140 });
    // Slope 10/30d relative to WMA 131.6.
    expect(r.change30dPct).toBe(7.6);
  });

  it('steady fall → falling, latest observation', () => {
    const r = computePriceEstimate([obs(120, 140), obs(90, 130), obs(60, 120), obs(30, 110), obs(0, 100)], ING);
    expect(r.trend).toBe('falling');
    expect(r.method).toBe('latest-trend');
    expect(r.currentEstimate).toEqual({ min: 90, max: 110, avg: 100 });
    expect(r.change30dPct).toBe(-9.2);
  });

  it('a gentle rise below 5%/30d stays stable', () => {
    const r = computePriceEstimate([obs(90, 100), obs(60, 101), obs(30, 102), obs(0, 103)], ING);
    expect(r.trend).toBe('stable');
    expect(r.method).toBe('wma');
  });

  it('single spike → spike-blend halfway between previous estimate and latest', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 100), obs(60, 100), obs(30, 100), obs(0, 200)], ING);
    expect(r.trend).toBe('stable');
    expect(r.method).toBe('spike-blend');
    expect(r.flags).toContain('possible-spike');
    expect(r.currentEstimate).toEqual({ min: 140, max: 160, avg: 150 });
    expect(r.notes.join(' ')).toMatch(/spike/i);
  });

  it('a jump with only two observations is still treated as a spike', () => {
    const r = computePriceEstimate([obs(30, 50), obs(0, 80)], ING);
    expect(r.trend).toBe('unknown');
    expect(r.method).toBe('spike-blend');
    expect(r.currentEstimate?.avg).toBe(65);
  });

  it('spike then confirmation at the same level → no longer a spike, estimate moves to the new level', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 100), obs(60, 100), obs(30, 200), obs(0, 200)], ING);
    expect(r.method).not.toBe('spike-blend');
    expect(r.flags).not.toContain('possible-spike');
    expect(r.currentEstimate!.avg).toBeGreaterThan(150);
  });

  it('spike then a higher confirmation → rising, latest observation', () => {
    const r = computePriceEstimate([obs(120, 100), obs(90, 100), obs(60, 100), obs(30, 150), obs(0, 170)], ING);
    expect(r.trend).toBe('rising');
    expect(r.method).toBe('latest-trend');
    expect(r.currentEstimate!.avg).toBe(170);
  });

  it('irregular spacing: weights follow real ages measured from today', () => {
    // 90 days apart → the older point has 1/8 the weight, whatever the absolute dates.
    const recent = computePriceEstimate([obs(90, 50), obs(0, 60)], ING);
    const older = computePriceEstimate([obs(120, 50), obs(30, 60)], ING);
    expect(recent.method).toBe('wma');
    expect(recent.currentEstimate!.avg).toBe(59); // (50×0.125 + 60) / 1.125 = 58.9
    expect(older.currentEstimate!.avg).toBe(59);
  });

  it('irregular spacing: the trend slope uses real dates, not positions', () => {
    // Same values, but packed into 2 days → a much steeper slope per 30 days.
    const spread = computePriceEstimate([obs(90, 100), obs(60, 102), obs(30, 104)], { ...ING, today: daysAgo(30) });
    const packed = computePriceEstimate([obs(2, 100), obs(1, 102), obs(0, 104)], ING);
    expect(spread.trend).toBe('stable');
    expect(packed.trend).toBe('rising');
    expect(packed.change30dPct!).toBeGreaterThan(spread.change30dPct!);
  });

  it('low-confidence and old-format points weigh half', () => {
    const normal = computePriceEstimate([obs(0, 50, { sourceFile: 'a.md' }), obs(0, 60, { sourceFile: 'b.md' })], ING);
    const lowConf = computePriceEstimate([obs(0, 50, { sourceFile: 'a.md' }), obs(0, 60, { sourceFile: 'b.md', confidence: 'Low' })], ING);
    const oldFmt = computePriceEstimate([obs(0, 50, { sourceFile: 'a.md' }), obs(0, 60, { sourceFile: 'b.md', lowQuality: true })], ING);
    expect(normal.currentEstimate!.avg).toBe(55);
    expect(lowConf.currentEstimate!.avg).toBe(53); // (50 + 60×0.5) / 1.5 = 53.3
    expect(oldFmt.currentEstimate!.avg).toBe(53);
  });

  it('a single observation → method single, trend unknown, avg defaults to the midpoint', () => {
    const r = computePriceEstimate([{ date: TODAY, min: 40, max: 50, avg: null, confidence: null, sourceFile: 'one.md' }], ING);
    expect(r.method).toBe('single');
    expect(r.trend).toBe('unknown');
    expect(r.change30dPct).toBeNull();
    expect(r.currentEstimate).toEqual({ min: 40, max: 50, avg: 45 });
    expect(r.priceHistory).toEqual([{ date: TODAY, min: 40, max: 50, avg: 45, confidence: null, sourceFile: 'one.md' }]);
    expect(r.lastObserved).toBe(TODAY);
  });

  it('sorts history by date and reports the latest date', () => {
    const r = computePriceEstimate([obs(0, 100), obs(60, 100), obs(30, 100)], ING);
    expect(r.priceHistory.map((p) => p.date)).toEqual([daysAgo(60), daysAgo(30), TODAY]);
    expect(r.lastObserved).toBe(TODAY);
  });

  it('marks stale only when the latest observation is more than 45 days old', () => {
    const stale = computePriceEstimate([obs(46, 100)], ING);
    expect(stale.stale).toBe(true);
    expect(stale.flags).toContain('stale');
    const fresh = computePriceEstimate([obs(45, 100)], ING);
    expect(fresh.stale).toBe(false);
    expect(fresh.flags).not.toContain('stale');
  });

  it('narrows a range wider than 30% of avg to ±15%', () => {
    const r = computePriceEstimate([obs(0, 100, { min: 50, max: 150 })], ING);
    expect(r.currentEstimate).toEqual({ min: 85, max: 115, avg: 100 });
    expect(r.flags).toContain('narrowed');
    expect(r.notes.join(' ')).toMatch(/narrowed/);
  });

  it('keeps min ≤ avg ≤ max', () => {
    const r = computePriceEstimate([obs(0, 90, { min: 80, max: 88 })], ING);
    expect(r.currentEstimate).toEqual({ min: 80, max: 90, avg: 90 });
    expect(r.flags).toEqual([]);
  });

  it('rounds ingredients to ₹1 under ₹100 and ₹5 otherwise; dishes to ₹10', () => {
    expect(computePriceEstimate([obs(0, 42.4, { min: 40.2, max: 44.6 })], ING).currentEstimate).toEqual({ min: 40, max: 45, avg: 42 });
    expect(computePriceEstimate([obs(0, 123, { min: 112, max: 131 })], ING).currentEstimate).toEqual({ min: 110, max: 130, avg: 125 });
    expect(computePriceEstimate([obs(0, 184, { min: 166, max: 202 })], DISH).currentEstimate).toEqual({ min: 170, max: 200, avg: 180 });
  });

  it('ignores duplicate observations (same date and source file) but keeps other sources on the same date', () => {
    const r = computePriceEstimate([obs(0, 100), obs(0, 100)], ING);
    expect(r.priceHistory).toHaveLength(1);
    expect(r.method).toBe('single');
    expect(r.notes.join(' ')).toMatch(/duplicate/i);
    const two = computePriceEstimate([obs(0, 100), obs(0, 100, { sourceFile: 'other.md' })], ING);
    expect(two.priceHistory).toHaveLength(2);
  });

  it('passes seasonal through and exports the seasonal produce ids', () => {
    expect(computePriceEstimate([obs(0, 40)], { ...ING, seasonal: true }).seasonal).toBe(true);
    expect(computePriceEstimate([obs(0, 40)], ING).seasonal).toBe(false);
    for (const id of ['onion', 'tomato', 'potato', 'green-chilli', 'coriander-leaves', 'lemon']) {
      expect(SEASONAL_PRODUCE.has(id)).toBe(true);
    }
    expect(SEASONAL_PRODUCE.has('rice')).toBe(false);
  });

  it('throws on bad input', () => {
    expect(() => computePriceEstimate([], ING)).toThrow(/no observations/);
    expect(() => computePriceEstimate([obs(0, 100, { min: NaN })], ING)).toThrow(/finite/);
    expect(() => computePriceEstimate([obs(0, 100, { avg: Infinity })], ING)).toThrow(/finite/);
    expect(() => computePriceEstimate([obs(0, 100, { max: -1, min: -5 })], ING)).toThrow(/finite/);
    expect(() => computePriceEstimate([obs(0, 100, { min: 120, max: 110 })], ING)).toThrow(/min/);
    expect(() => computePriceEstimate([obs(0, 100, { date: '01/10/2026' })], ING)).toThrow(/YYYY-MM-DD/);
    expect(() => computePriceEstimate([obs(0, 100, { date: '2026-13-45' })], ING)).toThrow(/date/);
    expect(() => computePriceEstimate([obs(0, 100)], { ...ING, today: 'today' })).toThrow(/today/);
  });
});
```

### `src/__tests__/data/merge.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { adoptWhole, mergeOfficial, mergeStable, recipeChangedMaterially, unionList } from '../../services/data/merge';

describe('mergeStable', () => {
  it('returns none when every version is null or there are none', () => {
    expect(mergeStable([])).toEqual({ value: null, method: 'none', excludedDates: [], notes: [] });
    expect(mergeStable([{ date: '2026-01-01', value: null }]).method).toBe('none');
  });

  it('uses a single value as is, rounded to 1 decimal', () => {
    expect(mergeStable([{ date: '2026-01-01', value: 312.46 }, { date: '2026-02-01', value: null }])).toEqual({
      value: 312.5,
      method: 'single',
      excludedDates: [],
      notes: [],
    });
  });

  it('averages two close versions', () => {
    const r = mergeStable([{ date: '2026-01-01', value: 300 }, { date: '2026-02-01', value: 330 }]);
    expect(r).toEqual({ value: 315, method: 'mean-2', excludedDates: [], notes: [] });
  });

  it('keeps the newer of two versions that differ by more than 25%', () => {
    const r = mergeStable([{ date: '2026-02-01', value: 500 }, { date: '2026-01-01', value: 300 }]);
    expect(r.value).toBe(500);
    expect(r.excludedDates).toEqual(['2026-01-01']);
    expect(r.notes).toHaveLength(1);
  });

  it('takes the median of the last 3 and drops older versions', () => {
    const r = mergeStable([
      { date: '2025-01-01', value: 900 },
      { date: '2026-01-01', value: 300 },
      { date: '2026-03-01', value: 320 },
      { date: '2026-02-01', value: 310 },
    ]);
    expect(r).toEqual({ value: 310, method: 'median-3', excludedDates: [], notes: [] });
  });

  it('excludes an outlier more than 25% from the median of the others and notes it', () => {
    const r = mergeStable([
      { date: '2026-01-01', value: 300 },
      { date: '2026-02-01', value: 600 },
      { date: '2026-03-01', value: 310 },
    ]);
    expect(r.value).toBe(305);
    expect(r.method).toBe('median-3');
    expect(r.excludedDates).toEqual(['2026-02-01']);
    expect(r.notes[0]).toMatch(/outlier/i);
  });

  it('handles zero values without dividing by zero', () => {
    expect(mergeStable([{ date: '2026-01-01', value: 0 }, { date: '2026-02-01', value: 0 }]).value).toBe(0);
    expect(mergeStable([{ date: '2026-01-01', value: 0 }, { date: '2026-02-01', value: 2 }]).value).toBe(2);
  });

  it('throws on non-finite values', () => {
    expect(() => mergeStable([{ date: '2026-01-01', value: NaN }])).toThrow(/finite/);
    expect(() => mergeStable([{ date: '2026-01-01', value: Infinity }])).toThrow(/finite/);
  });
});

describe('mergeOfficial', () => {
  const v = (value: number | null, citesOfficial: boolean, date = '2026-02-01') => ({ value, citesOfficial, date });

  it('keeps equal values and takes the non-null side', () => {
    expect(mergeOfficial(v(40, true, '2026-01-01'), v(40, false))).toEqual({ value: 40, needsReview: false, note: null });
    expect(mergeOfficial(null, v(40, false))).toEqual({ value: 40, needsReview: false, note: null });
    expect(mergeOfficial(v(null, true, '2026-01-01'), v(40, false)).value).toBe(40);
    expect(mergeOfficial(v(40, false, '2026-01-01'), v(null, true)).value).toBe(40);
    expect(mergeOfficial(null, v(null, false)).value).toBeNull();
  });

  it('keeps the version that cites the official table, never an average', () => {
    const newerCites = mergeOfficial(v(40, false, '2026-01-01'), v(46, true));
    expect(newerCites).toMatchObject({ value: 46, needsReview: false });
    expect(newerCites.note).toMatch(/official/);
    expect(mergeOfficial(v(40, true, '2026-01-01'), v(46, false))).toMatchObject({ value: 40, needsReview: false });
  });

  it('keeps the previous value and flags review when citation cannot settle it', () => {
    expect(mergeOfficial(v(40, true, '2026-01-01'), v(46, true))).toMatchObject({ value: 40, needsReview: true });
    expect(mergeOfficial(v(40, false, '2026-01-01'), v(46, false))).toMatchObject({ value: 40, needsReview: true });
  });

  it('keeps the lower value for safety limits and still flags review', () => {
    expect(mergeOfficial(v(45, true, '2026-01-01'), v(40, false), { safetyLimit: true })).toMatchObject({ value: 40, needsReview: true });
    expect(mergeOfficial(v(40, false, '2026-01-01'), v(45, true), { safetyLimit: true })).toMatchObject({ value: 40, needsReview: true });
  });

  it('throws on non-finite values', () => {
    expect(() => mergeOfficial(v(NaN, true), v(40, true))).toThrow(/finite/);
    expect(() => mergeOfficial(null, v(Infinity, true))).toThrow(/finite/);
  });
});

describe('unionList', () => {
  it('unions, trims and dedupes case-insensitively, keeping the first spelling and order', () => {
    expect(unionList(['IFCT 2017', ' Swiggy '], ['ifct 2017', 'Zomato', 'swiggy'], ['BigBasket'])).toEqual([
      'IFCT 2017',
      'Swiggy',
      'Zomato',
      'BigBasket',
    ]);
  });

  it('skips null/undefined lists and blank items', () => {
    expect(unionList(null, undefined, ['', '  ', 'a'])).toEqual(['a']);
    expect(unionList()).toEqual([]);
  });
});

describe('adoptWhole', () => {
  const prev = { value: 'v1', sources: 3, notFound: 1 };

  it('adopts the newest when there is no previous version', () => {
    expect(adoptWhole(null, { value: 'v2', sources: 0, notFound: 5 })).toEqual({ value: 'v2', adopted: 'next', note: null });
  });

  it('adopts the newest when at least as complete', () => {
    expect(adoptWhole(prev, { value: 'v2', sources: 3, notFound: 1 })).toEqual({ value: 'v2', adopted: 'next', note: null });
    expect(adoptWhole(prev, { value: 'v2', sources: 5, notFound: 0 }).adopted).toBe('next');
  });

  it('keeps the previous version with a note when the newest is less complete', () => {
    const fewer = adoptWhole(prev, { value: 'v2', sources: 2, notFound: 1 });
    expect(fewer).toMatchObject({ value: 'v1', adopted: 'prev' });
    expect(fewer.note).toMatch(/fewer sources/);
    const both = adoptWhole(prev, { value: 'v2', sources: 2, notFound: 3 });
    expect(both.note).toMatch(/fewer sources.*Not found/);
  });

  it('throws on invalid counts', () => {
    expect(() => adoptWhole(prev, { value: 'v2', sources: -1, notFound: 0 })).toThrow(/sources/);
    expect(() => adoptWhole({ ...prev, notFound: 1.5 }, { value: 'v2', sources: 1, notFound: 0 })).toThrow(/notFound/);
  });
});

describe('recipeChangedMaterially', () => {
  const base = [
    { ingredientId: 'rice', name: 'Rice', quantity: 100 },
    { ingredientId: null, name: 'Curry Leaves', quantity: 5 },
  ];

  it('is false for the same recipe, including name spelling and small quantity changes', () => {
    expect(recipeChangedMaterially(base, base)).toBe(false);
    expect(
      recipeChangedMaterially(base, [
        { ingredientId: 'rice', name: 'Raw rice', quantity: 115 },
        { ingredientId: null, name: ' curry leaves ', quantity: 5 },
      ]),
    ).toBe(false);
  });

  it('is true when an ingredient is added or removed', () => {
    expect(recipeChangedMaterially(base, [...base, { ingredientId: 'ghee', name: 'Ghee', quantity: 5 }])).toBe(true);
    expect(recipeChangedMaterially(base, base.slice(0, 1))).toBe(true);
    expect(recipeChangedMaterially(base, [base[0], { ingredientId: 'ghee', name: 'Ghee', quantity: 5 }])).toBe(true);
  });

  it('is true when a quantity changes by more than 15%', () => {
    expect(recipeChangedMaterially(base, [{ ...base[0], quantity: 116 }, base[1]])).toBe(true);
    expect(recipeChangedMaterially(base, [{ ...base[0], quantity: 84 }, base[1]])).toBe(true);
  });

  it('sums repeated ingredients and ignores unknown quantities', () => {
    const split = [
      { ingredientId: 'rice', name: 'Rice', quantity: 60 },
      { ingredientId: 'rice', name: 'Rice', quantity: 40 },
      base[1],
    ];
    expect(recipeChangedMaterially(base, split)).toBe(false);
    expect(recipeChangedMaterially(base, [{ ...base[0], quantity: null }, base[1]])).toBe(false);
  });

  it('throws on bad lines', () => {
    expect(() => recipeChangedMaterially([{ ingredientId: null, name: '  ', quantity: 1 }], base)).toThrow(/ingredientId/);
    expect(() => recipeChangedMaterially([{ ...base[0], quantity: NaN }], base)).toThrow(/finite/);
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
    expect(poha.orderPrice).toEqual({ min: 120, max: 150, avg: 130 });
    expect(biryani.orderPrice).toEqual({ min: 200, max: 260, avg: 230 });
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
    expect(lemon.price).toEqual({ min: 4, max: 6, avg: 5 });
  });

  it('reads the JSON nutrient profile; missing values stay null, never estimated', () => {
    expect(normaliseId('mutton_curry_cut')).toBe('mutton-curry-cut');
    expect(mutton.nutritionPer100g?.energyKcal).toEqual({ value: 109, source: 'USDA FDC: FDC 175303', confidence: 'Medium' });
    expect(mutton.nutritionPer100g?.carbsG).toEqual({ value: null, source: null, confidence: null });
    expect(mutton.nutritionPer100g?.basis).toBe('100g');
  });

  it('builds one ingredient from two versions through the price engine', () => {
    const later = { ...onion, date: '2026-10-24', file: 'FitPlate_Ingredients_2026-10-24.md', price: { min: 60, max: 75, avg: 68 }, substitutes: ['Leeks'] };
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

### `src/__tests__/data/researchData.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { getDish, getIngredient, researchDishes, researchIngredients } from '../../data/research';
import { validateDish, validateIngredient } from '../../services/data/buildItems';
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

  it('looks dishes up by id', () => {
    const first = researchDishes[0];
    expect(getDish(first.id)).toBe(first);
  });
});
```

### `src/__tests__/storage/deleteUser.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import type { BaseDoc } from '../../models/common';
import { openUserData } from '../../services/storage';
import { deleteAllUserData } from '../../services/storage/deleteUser';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { createRemoteDocStore } from '../../services/storage/remote';
import { COLLECTIONS } from '../../services/storage/schemas';
import { deleteMyData, guestCopyAskedKey } from '../../services/userSession';
import { fakeFirestore } from './fakes';

const doc = (id: string, extra: Record<string, unknown> = {}): BaseDoc & Record<string, unknown> => ({
  id,
  createdAt: 1,
  updatedAt: 1,
  schemaVersion: 1,
  deleted: false,
  ...extra,
});

/** Puts a profile and two documents in every other collection for this uid. */
async function seed(fs: ReturnType<typeof fakeFirestore>, uid: string) {
  const remote = createRemoteDocStore(fs.adapter, uid);
  for (const c of COLLECTIONS) {
    await remote.putMany(c, c === 'profile' ? [doc('profile', { name: uid })] : [doc(`${c}-a`), doc(`${c}-b`)]);
  }
}

const pathsOf = (fs: ReturnType<typeof fakeFirestore>, uid: string) =>
  [...fs.docs.keys()].filter((p) => p === `users/${uid}` || p.startsWith(`users/${uid}/`));

describe('deleteAllUserData (mocked Firestore)', () => {
  it('deletes the profile and every subcollection document of that user only', async () => {
    const fs = fakeFirestore();
    await seed(fs, 'u1');
    await seed(fs, 'u2');
    // Seeding covers every collection in SCHEMAS: the profile plus two docs in each of the others.
    expect(pathsOf(fs, 'u1')).toHaveLength(1 + (COLLECTIONS.length - 1) * 2);
    const u2Before = new Map([...fs.docs].filter(([p]) => p.startsWith('users/u2')));

    const sent = await deleteAllUserData(fs.adapter, 'u1');

    expect(sent).toBe(1 + (COLLECTIONS.length - 1) * 2);
    expect(pathsOf(fs, 'u1')).toEqual([]);
    expect(new Map([...fs.docs].filter(([p]) => p.startsWith('users/u2')))).toEqual(u2Before);
    expect(pathsOf(fs, 'u2')).toHaveLength(u2Before.size);
  });

  it('works when the user has no data at all', async () => {
    const fs = fakeFirestore();
    await seed(fs, 'u2');
    await deleteAllUserData(fs.adapter, 'u1');
    expect(pathsOf(fs, 'u2')).toHaveLength(1 + (COLLECTIONS.length - 1) * 2);
  });

  it('sends more than 500 deletes in batches of at most 500', async () => {
    const fs = fakeFirestore();
    const remote = createRemoteDocStore(fs.adapter, 'u1');
    await remote.putMany('profile', [doc('profile')]);
    await remote.putMany('mealLogs', Array.from({ length: 1203 }, (_, i) => doc(`m${i}`)));
    await remote.putMany('waterLogs', [doc('w1')]);

    await deleteAllUserData(fs.adapter, 'u1');

    expect(pathsOf(fs, 'u1')).toEqual([]);
    expect(fs.state.deletes).toBe(1203 + 1 + 1);
    // 1204 subcollection docs → 3 batches (500 + 500 + 204), then the user document.
    expect(fs.state.deleteBatches).toBe(4);
  });

  it('throws when offline and deletes nothing', async () => {
    const fs = fakeFirestore();
    await seed(fs, 'u1');
    const before = new Map(fs.docs);
    fs.state.offline = true;
    await expect(deleteAllUserData(fs.adapter, 'u1')).rejects.toThrow('offline');
    expect(fs.docs).toEqual(before);
    expect(fs.state.deleteBatches).toBe(0);
  });

  it('needs a user id', async () => {
    await expect(deleteAllUserData(fakeFirestore().adapter, '')).rejects.toThrow();
  });
});

describe('deleteMyData (cloud and device)', () => {
  async function signedIn() {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    let t = 1_760_000_000_000;
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter, deps: { now: () => (t += 1000) } });
    await data.repos.profile.upsert('profile', { name: 'Asha' } as never);
    await data.repos.mealLogs.create({ name: 'Poha' } as never);
    await data.repos.waterLogs.upsert('water-2026-10-11', { glasses: 3 } as never);
    await data.flush();
    // Another user's cloud data and this device's guest data must survive.
    await seed(fs, 'u2');
    await kv.setItem('fitplate.docs.guest.mealLogs.v1', '{"keep":true}');
    await kv.setItem(guestCopyAskedKey('u1'), 'skipped');
    return { kv, fs, data };
  }

  it('deletes the cloud copy, then forgets the account on this device', async () => {
    const { kv, fs, data } = await signedIn();
    // A change still waiting in the outbox is sent first, then deleted with the rest.
    await data.repos.mealLogs.create({ name: 'Dosa' } as never);
    expect(await data.pending()).toBe(1);

    await deleteMyData(data, fs.adapter, 'u1', kv);

    expect(pathsOf(fs, 'u1')).toEqual([]);
    expect(pathsOf(fs, 'u2').length).toBeGreaterThan(0);
    const keys = Object.keys(kv.dump());
    expect(keys.filter((k) => k.includes('u1'))).toEqual([]);
    expect(await data.pending()).toBe(0);
    expect(kv.dump()['fitplate.docs.guest.mealLogs.v1']).toBe('{"keep":true}');
  });

  it('offline: throws and changes nothing on the device or in the cloud', async () => {
    const { kv, fs, data } = await signedIn();
    const device = kv.dump();
    const cloud = new Map(fs.docs);
    fs.state.offline = true;

    await expect(deleteMyData(data, fs.adapter, 'u1', kv)).rejects.toThrow();

    expect(kv.dump()).toEqual(device);
    expect(fs.docs).toEqual(cloud);
  });

  it('gives up with an error when the cloud never answers', async () => {
    const { kv, fs, data } = await signedIn();
    const device = kv.dump();
    const hanging = { ...fs.adapter, getCollection: () => new Promise<BaseDoc[]>(() => {}) };
    await expect(deleteMyData(data, hanging, 'u1', kv, { timeoutMs: 20 })).rejects.toThrow('unavailable');
    expect(kv.dump()).toEqual(device);
  });

  it('does nothing for a device-only store', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    await seed(fs, 'u1');
    const data = openUserData({ kv, uid: null, remote: null });
    expect(await deleteMyData(data, fs.adapter, 'u1', kv)).toBe(0);
    expect(pathsOf(fs, 'u1').length).toBeGreaterThan(0);
  });
});
```

### `src/__tests__/storage/fakes.ts`

```ts
import type { BaseDoc } from '../../models/common';
import type { RemoteAdapter } from '../../services/storage/remote';

/**
 * A mocked Firestore: documents by path, in memory. Tests never touch the
 * real project. `offline = true` makes every call fail like a lost network.
 */
export function fakeFirestore() {
  const docs = new Map<string, BaseDoc>();
  const state = { offline: false, batches: 0, writes: 0, deleteBatches: 0, deletes: 0 };
  const check = () => {
    if (state.offline) throw new Error('unavailable: offline');
  };
  const adapter: RemoteAdapter = {
    async getCollection(path) {
      check();
      const prefix = `${path}/`;
      return [...docs.entries()].filter(([p]) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/')).map(([, d]) => d);
    },
    async getDoc(path) {
      check();
      return docs.get(path) ?? null;
    },
    async setMany(writes) {
      check();
      state.batches += 1;
      state.writes += writes.length;
      for (const w of writes) docs.set(w.path, structuredClone(w.data));
    },
    async deleteMany(paths) {
      check();
      // Like the real adapter: one commit per 500 deletes.
      for (let i = 0; i < paths.length; i += 500) {
        const chunk = paths.slice(i, i + 500);
        state.deleteBatches += 1;
        state.deletes += chunk.length;
        for (const p of chunk) docs.delete(p);
      }
    },
  };
  return { adapter, docs, state };
}

/** A clock the test moves by hand. */
export function fakeClock(start = 1_760_000_000_000) {
  let t = start;
  return { now: () => t, tick: (ms = 1000) => (t += ms) };
}
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
    "test": "jest",
    "research:sync": "node scripts/research/run.js"
  },
  "private": true
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

Research files layout (from Day 4): `src/data/research/dishes/NNN-slug.json` (dish id = 3-digit number + slug, e.g. `001-poha`), `src/data/research/ingredients/<id>.json` (kebab-case English name without the bracketed Indian names, e.g. `peanuts-raw`), a generated `index.ts` per folder, and `ledger.json` (every ingested version as item id + research date + build day). `npm run research:sync -- --today YYYY-MM-DD --build DayNN` rebuilds them from the research files.

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
````


## 9. DEPENDENCIES

None. The runner uses `@babel/core`, `@babel/preset-typescript` and `@babel/plugin-transform-modules-commonjs`, which are already installed with Expo.

## 10. HOW TO APPLY (for Sudarsan)

Run these from inside the `Fitplate` folder on your Mac.

**Option A (simplest): the code is already on the branch**
1. `git add -A && git commit -m "Before Day 04"` (skip this if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand.** Days 01 to 03b must be applied first.
1. `git add -A && git commit -m "Before Day 04"`
2. Create every NEW file from sections 7 and 8 at its path, and replace every CHANGED file with the full version shown there. For the 40 data files, run `npm run research:sync -- --today 2026-10-11 --build Day04 --src <folder with dish-research and ingredient-research>` instead of copying them.
3. `npm test`, then `npx expo start -c`.

## 11. HOW TO TEST

**Quickest check: the live site** https://fitplateapp.netlify.app (it deploys this commit automatically).

**Manual checklist (web and iPhone)**
- [ ] **Your data from the welcome screen.** Tap "Your data" under the small print. The screen explains what is saved and where; Back returns to the welcome screen. Web ☐ iPhone ☐
- [ ] **Your data from Profile.** Profile → Your data opens the same screen. Web ☐ iPhone ☐
- [ ] **Delete my data (use a test Google account, not your main one).** Sign in, log a meal, then Profile → Delete my data → Delete everything. You land on the welcome screen. In the Firebase console → Firestore, `users/<that id>` and its subcollections are gone. Sign in again: onboarding starts fresh. Web ☐ iPhone ☐
- [ ] **Delete while offline.** Turn on airplane mode, try Delete my data: "Couldn't reach the cloud. Nothing was deleted." Your data is still there. iPhone ☐
- [ ] **Everything else as before.** Guest flow, logging and sign-in behave as on Day 03b. Web ☐ iPhone ☐

**Automated (run in this session on 2026-10-11; real results)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems) |
| Unit tests | `npm test` | ✅ 14 suites, 219 tests passed (139 new) |
| Web bundle | `npx expo export -p web` | ✅ exported (9.0 MB `dist`) |
| Web click-through | Playwright (Chromium, 390×844) on the exported site | ✅ see below; no page or console errors |
| Data sync | `node scripts/research/run.js --today 2026-10-11 --build Day04` | ✅ 10 dishes + 30 ingredients written, 0 invalid, 0 parse errors |

Click-through results:
- Fresh guest: welcome → onboarding → Today; logged a Sandwich and 3 glasses of water (Eaten 380, Water 3 of 8); reload kept everything; Profile, Track and Cook opened.
- Profile → Your data opened `/your-data` with all four sections (screenshot checked at 390 px; nothing clipped).
- Welcome → Your data and Back, and the delete modal layout, were also checked by the fix-3 worker's own click-through (modal screenshot from a temporary local build that forced it on; not pushed).
- **Not clicked through here:** a real delete against Firebase. This session has no Firebase keys, which is correct; the delete path is covered by the 9 tests with a mocked Firestore and by the manual check above.

New tests cover: the price trend engine (all E.10 cases: flat, rise, fall, single spike, confirmed spike, irregular spacing, low confidence, single point, stale, narrowing, rounding); every merge rule; markdown helpers; all three dish nutrition formats; the average-of-range rule; steps with timers, cues and tips; 18 allergen map cases; claim negation; Jain, Navratri and fasting-flour rules; the ingredient summary, sections and JSON profile; two-version ingredient builds; ingredient linking; every bundled JSON loaded through the generated index and validated; the delete flow.

## 12. KNOWN ISSUES, LIMITATIONS AND TODOs

- **The app still shows the demo dishes.** The research data is bundled and tested but `researchData` stays OFF until Day 6 builds the Cook tab on it.
- **About half of the dish ingredient lines aren't linked to an ingredient id yet** (97 of 203). Day 5 adds the alias map and the rest of the ingredient backlog.
- **The "AS ORDERED" parser is written but untested on real files:** dishes 21+ (10-08 onwards) carry the block and will be ingested in the next two runs; their output will be checked then.
- **Allergen detection reads ingredient names.** A packaged item (e.g. a masala blend) can contain allergens its name doesn't show. The UI line "Check labels if you have an allergy" covers this from Day 6.
- **Delete my data leaves the Firebase sign-in account** (name, email, photo) until Day 34. If the connection drops in the middle of the final commit, Firestore may still finish the deletes later even though the message said nothing was deleted (rare).

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
| 5 | Research pipeline II (nutrients, hydration, fitness, cross-links) | ⬜ |
| 6 | Dish library (Cook tab) | ⬜ |
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
| `docs/DATA_MODEL.md` | Day 4 |
| `public/index.html`, `public/manifest.json`, `public/*.png`, `assets/icon.png`, `assets/favicon.png` (app icon) | merged from demo-app on 2026-10-10 (5c97126), not by the build |
| `.env.example` (Google photo and email) | merged from demo-app on 2026-10-09 (c8a2449), not by the build |
| `src/lib/store.tsx` | Day 4 |
| `src/app/index.tsx` | Day 4 |
| `src/models/common.ts` | Day 3 |
| `src/models/user.ts` | Day 3 |
| `src/models/logs.ts` | Day 03b |
| `src/models/research.ts` | Day 4 |
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
| `scripts/research/run.js` | Day 4 |
| `src/services/data/markdown.ts` | Day 4 |
| `src/services/data/dishImporter.ts` | Day 4 |
| `src/services/data/ingredientImporter.ts` | Day 4 |
| `src/services/data/allergens.ts` | Day 4 |
| `src/services/data/fasting.ts` | Day 4 |
| `src/services/data/buildItems.ts` | Day 4 |
| `src/services/data/priceTrend.ts` | Day 4 |
| `src/services/data/merge.ts` | Day 4 |
| `src/services/data/researchIndex.ts` | Day 4 |
| `src/data/research/index.ts` | Day 4 |
| `src/data/research/dishes/index.ts` | Day 4 |
| `src/data/research/ingredients/index.ts` | Day 4 |
| `src/services/storage/deleteUser.ts` | Day 4 |
| `src/app/your-data.tsx` | Day 4 |
| `src/components/ConfirmDeleteData.tsx` | Day 4 |
| `src/app/_layout.tsx` | Day 4 |
| `src/__tests__/data/priceTrend.test.ts` | Day 4 |
| `src/__tests__/data/merge.test.ts` | Day 4 |
| `src/__tests__/data/importers.test.ts` | Day 4 |
| `src/__tests__/data/researchData.test.ts` | Day 4 |
| `src/__tests__/storage/deleteUser.test.ts` | Day 4 |

### Feature flags

| Flag | Value | For |
|---|---|---|
| newTabShell | true (since Day 2) | Day 2 |
| researchData | false (data bundled since Day 4; turns on with the Cook tab) | Day 6 |
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
| Dishes | FitPlate_Dishes_2026-10-06.md | 11–15 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-07.md | 16–20 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-08.md | 21–25 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-09.md | 26–30 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-04.md | 47 | Day 04 (rows 1–30); rows 31–47 backlog |
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
| Dishes | FitPlate_Dishes_2026-10-11.md | 36–40 (Rava Dosa, Bhindi Masala, Egg Curry, Veg Biryani, Sabudana Khichdi; first with Fasting suitability) | — (backlog; recorded Day 03b) |
| Ingredients | FitPlate_Ingredients_2026-10-11.md | 3 (okra, sabudana, rock salt) | — (backlog; recorded Day 03b) |
| Nutrients | FitPlate_Nutrients_2026-10-11.md | 5 Vitamin C, 6 Thiamine (B1) | — (backlog; recorded Day 03b) |
| Fitness | FitPlate_Fitness_2026-10-11.md | Home 3, Yoga 3, Gym 5, Gym 6 | — (backlog; recorded Day 03b) |

- **Machine ledger:** `src/data/research/ledger.json` lists every ingested version (item id, research date, file, build day). The runner skips any version already there, so nothing is ingested twice.
- **Backlog per stream (after Day 04):**
  - Dishes: 6 files / 30 items (11–40)
  - Ingredients: 8 files / 83 entries (17 left in 10-04, then 10-05 onwards)
  - Nutrients: 3 files / 6 topics (importer Day 5)
  - Fitness: 3 files / 12 items (importer Day 5)
- **Per-item versions:** all 40 ingested items have 1 version (dates 2026-10-04 / 2026-10-05), last merged and output on Day 04.
- **Catch-up plan:** at 10 dishes and 30 ingredients per run against about 5 new dishes and about 10 ingredient rows a day, the dish backlog clears in about 4 more runs and the ingredient backlog in about 4.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema:** all eight user collections are at version 1: `profile` (on `users/{uid}`), `mealLogs`, `waterLogs` (one document per day), `supplementLogs`, `workoutLogs`, `favourites`, `mealPlans` and `savings`. Every document has `id`, `createdAt`, `updatedAt`, `schemaVersion` and `deleted`. Day 03b added the optional `demoSample` to `Favourite`, `MealPlanDay` and `SavingEntry` (no version bump). Fields are listed in `docs/DATA_MODEL.md`.
- **Live since Day 03b:** guests on the device; signed-in users device first, then Firestore (`cloudSync` ON). The demo blob is migrated once into guest documents and kept as a backup. "Bring your data with you?" runs after sign-in. Sign-out clears the device only once everything reached the cloud.
- **Device keys:** `fitplate.docs.<owner>.<collection>.v1`, `fitplate.outbox.<owner>.v1`, `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`; the old `fitplate.state.v2` is a read-once backup.
- **Free-tier guard:** one pull per collection when the app opens for a signed-in user (no listeners yet); writes are debounced batches; water is one document per day; waiting writes are sent when the app goes to the background.
- **Rules:** owner-only (`firestore.rules`), live in the console since 2026-10-10. No top-level collection added.
- **Delete my data (Day 04, review fix 3):** deletes every document under `users/{uid}` (collections from `SCHEMAS`, batches of ≤500, profile last) and the device copy, then signs out. The Firebase Auth account is removed on Day 34.
- **Research content:** bundled JSON in `src/data/research/` since Day 4; never in Firestore.
- **USER ACTION:** none open.

### Research gaps

1. Dishes 1–20 (files 10-04 to 10-07) have no "AS ORDERED (from delivery apps)" block. Their as-ordered nutrition stays null until each dish is re-researched.
2. Ingredients from the files dated 10-04 to 10-07 (83 entries) lack the full per-100 g nutrient-profile JSON. `nutritionPer100g` stays null until each is re-priced; their one-line estimates are kept in `macrosPer100Estimate`.
3. Nutrient topics 7–42 and later fitness items have not been researched yet (expected).
4. Dish order prices come from search-result snapshots, because delivery-app pages block direct access. Confidence should reflect that.
5. NEW (review): dish research has no allergen line; the app derives allergens from ingredient names (review prompt edit 1 for Sudarsan).
6. NEW (review): mustard oil and sesame oil have no ingredient price yet.
- Resolved: "no fasting-suitability field" (PROMPT_PATCH_02, from dish 36). Moved to standby: "thali component nutrition" (office canteen idea, parked by Sudarsan).

### IDEAS BACKLOG (ranked by impact ÷ effort; S = 1, M = 2, L = 3)

| Rank | Idea | Type | Impact | Effort | Score | Needs | Status |
|---|---|---|---|---|---|---|---|
| 1 | Fridge rescue | NEW FEATURE | 4 | S | 4.0 | Dish library (Day 6) | approved by Sudarsan 2026-10-10; build after Day 6 |
| 2 | Allergy filter ("Contains peanut" chip + optional hide) | IMPROVE | 4 | S | 4.0 | `allergens` (built Day 04) + dish library (Day 6) | new Day 04 |
| 3 | Protein per ₹ | IMPROVE | 4 | S | 4.0 | Cost to make (Day 8) | new (supervisor review 2026-10-11) |
| 4 | Savings goal jar | NEW FEATURE | 4 | S | 4.0 | `savings` collection; fits Day 14 | new (supervisor review 2026-10-11) |
| 5 | Kettle and one-burner cooking (PG/hostel kitchen preset) | IMPROVE | 4 | S | 4.0 | Dish equipment data + kitchen profile (Day 10) | new Day 03b; build after Day 10 |
| 6 | Monsoon swap | IMPROVE | 3 | S | 3.0 | Price engine (built Day 04) and cost to make (Day 8) | approved by Sudarsan 2026-10-10; build after Day 8 |
| 7 | Late-night craving helper | NEW FEATURE | 3 | S | 3.0 | Dish library (Day 6) | new Day 03b |
| — | Lite mode (still backdrop on Reduce motion, Data Saver, 2G) | IMPROVE | 3 | S | 3.0 | none | **built on Day 03b** (`liteMode` flag ON) |
| 8 | Fasting mode | NEW SEGMENT | 4 | M | 2.0 | Dish fasting field (validated since Day 04) | approved by Sudarsan 2026-10-10; build once enough dishes carry it |
| 9 | Parents' plate | NEW SEGMENT | 4 | M | 2.0 | Ingredient sodium and sugar data (exists, partial) | approved by Sudarsan 2026-10-10 |
| 10 | Tomorrow's tiffin (pack dinner for lunch) | NEW FEATURE | 4 | M | 2.0 | Cook mode (Day 11–12), dish storage advice, order prices | new Day 03b |
| 11 | Batch-cook Sunday | NEW FEATURE | 4 | M | 2.0 | Linked ingredients (started Day 04) + shopping list (Day 9) | new Day 04 |
| 12 | Vitamin gap → dish nudge | IMPROVE | 4 | M | 2.0 | Nutrient importer (Day 5) + vitamin tracking (Day 18) | new (supervisor review 2026-10-11) |
| 13 | Price-drop nudge for your staples | IMPROVE | 3 | M | 1.5 | Price engine trend (built Day 04), 2+ price versions, Day 8 | new Day 04 |
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

**Next up: Day 05: Research pipeline II (nutrients, hydration, guidance, fitness importers; cross-links and the alias map; validators and the data quality report), including review fix 2's nutrient rules (benfotiamine conversion, prescription doses above the UL, ICMR default targets). The data sync continues with dishes 11–20 and the next 30 ingredients.**

