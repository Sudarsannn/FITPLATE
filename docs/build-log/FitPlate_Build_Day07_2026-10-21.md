# FitPlate Build — Day 07 — 2026-10-21

## 1. HEADER

**Day 07 of 37 | Roadmap item: Dish detail screen | Phase 1: Food (the core) | Progress: 19% of the full app (7 ÷ 37)**

**Status: DONE.** Commit `6f5ebc7` is pushed to `claude/project-thread-wchnlm`, and Netlify deploys it to https://fitplateapp.netlify.app.

- **How this run's day was determined:**
  - The newest build file is `FitPlate_Build_Day06_2026-10-15.md` ("Next up: Day 07"). No `FitPlate_Build_Day*_2026-10-21.md` existed, so the run went ahead.
  - The scheduled runs of 16 to 20 Oct never ran: the account hit its usage limit on 16 Oct, and it reset about 5 days later. This run (21 Oct) is the first since then. Missed days are not made up; the roadmap moves one day per run.
- **Supervisor review:** the newest is still `FitPlate_Review_2026-10-15.md`. Its 3 fixes were done on Day 06, and no new review has appeared since (the review routine was rate-limited too). Nothing carried over.
- **Context available:**
  - **Code source (a):** branch `claude/project-thread-wchnlm` at `cadd7ef`. Since Day 06, four on-demand commits landed there from another session on 15 Oct:
    - `90a9539` P1: iPhone dev build and native Google sign-in.
    - `ee42864` P2: server readiness, synced settings, lists, weight, ratings and cooks, and the research library on Firestore.
    - `dd66f47` P3: shopping list, Instamart checkout, Zepto links, Cook it instead.
    - `cadd7ef`: all 60 research dishes in the Cook tab, and the dish photo pipeline.
  - Day 07 is built on top of them. Their dependencies (`expo-dev-client` and others) needed a local `npm install` before the web export would run. Netlify installs them on its own.
  - **Spec:** `PROMPT.md` (Day 7) and `SPEC-ADDENDA.md` §1 (as-ordered beside as-cooked), §8 (opt-in burn-off) and §9.
  - **Research files:** no new research files exist in any stream since 15 Oct, because the research routines were also rate-limited.

## 2. SUMMARY

1. **Every dish now has a full detail page.** Tap any of the 60 dishes in the Cook tab to see:
   - quick facts (prep, cook and total time, difficulty, cuisine, serves);
   - the three scores, each on its own row: Healthiness score, Rating, and FitPlate Score ("Coming after launch");
   - nutrition, vitamins and minerals;
   - cost to order with a trend arrow;
   - other versions, ingredients and equipment;
   - storage and a leftover idea;
   - sources, folded away;
   - "Based on N research updates, last updated [date]".
2. **Restaurant vs home-cooked, side by side.** Where restaurants publish nutrition, a second column shows it, labelled "As ordered (published by the restaurant)", next to "Home-cooked (FitPlate recipe)". The two are never mixed, and values that restaurants don't publish say "Not published".
   - 9 dishes have published values, including Veg Biryani, Veg Pulao, Curd Rice and Tandoori Chicken.
   - The page also says how many kcal cooking it at home saves, when that is a saving. Veg Biryani, for example, saves about 92 kcal.
3. **Burn-off only when you ask.** Nothing about burning calories shows by default, per Sudarsan's 11 Oct input.
   - A "How could I burn this?" link opens up to 5 ways, quickest first, with minutes for one serving: stationary bike, rowing, elliptical, treadmill, squats and others.
   - The minutes come from the research's Compendium MET values, at the user's logged weight, or 70 kg until one is logged.
   - It ends with "See workouts" (Move tab) and an exercise-safety line, and the wording is never shaming.
4. **Vitamins and minerals.** The page shows the partial estimate from the ingredients, with its coverage % ("partial estimate"). It also lists what research says the dish is a good source of, for example niacin and vitamin B6 for Mutton Rogan Josh.
5. **Small extra:** "Jump to" chips (Nutrition, Vitamins, Price, Ingredients, Storage, Sources) at the top of the long page. They sit behind the `dishJumpChips` flag, which is ON.
6. **Data sync:** nothing new to ingest. Every stream's backlog is 0, because the on-demand run of 15 Oct caught up all 60 dishes. One order price was recomputed: Bhindi Masala's average is now ₹190 instead of ₹200.

## 3. DATA SYNC REPORT

- **Command:** `node scripts/research/run.js --today 2026-10-21 --build Day07` (run once).
- **New research files since Day 06:** none in any stream. The newest files are dishes 10-15, ingredients 10-15, nutrients 10-15 and fitness 10-15. The dish, ingredient, nutrient and fitness routines show no files for 16 to 21 Oct, probably because of the same usage limit.
- **Ingested this run:** nothing (every backlog is 0).

  | Stream | In the app | Backlog after |
  |---|---|---|
  | Dishes | 60 | 0 |
  | Ingredients | 128 | 0 |
  | Nutrients (topics + conditions) | 12 | 0 |
  | Fitness | 16 | 0 |

- **Changes from the re-run:**
  - `037-bhindi-masala.json`: the current order average was recomputed from 200 to 190 (range ₹170–220, unchanged).
  - `links.json`: `generatedFor` was relabelled. No link content changed.
- **Ingredient research FYI (15 Oct, from the ingredient thread):**
  - `mustard_oil` and `sesame_oil` are priced and already bundled (`mustard-oil-kachi-ghani`, `sesame-oil-gingelly-til-oil-everyday-grade`), and dish 018 links to mustard oil.
  - Rows marked "zero by composition" keep their real 0. This was checked in the bundled JSON for both oils.
  - Three ranges were rechecked in already-ingested files: chicken leg, marathi moggu and white sesame. The ledger is keyed `id@date`, so an edited file is not re-read. These three keep their first-ingested values until a newer dated version arrives (see Research gaps).
- **Validation:** 0 invalid, 0 parse errors.

### 3a. Supervisor review FIX LIST

There is no new review since `FitPlate_Review_2026-10-15.md`, and all 3 of its fixes were done on Day 06. Nothing is carried over.

## 4. DESIGN NOTES

### Dish page (`/recipe/[id]`)

The page runs top to bottom in this order:

1. **Header:**
   - the photo with its credit, where a verified photo exists, otherwise the labelled placeholder;
   - name and facts line;
   - diet and allergen chips, then the description and the allergen label line.
2. **Actions:** "Cook it step by step" (primary), with "Shop" and "Order vs make" side by side. They were moved up from the bottom of the page.
3. **Jump to** chips, which scroll sideways.
4. **Quick facts:** Prep, Cook, Total, Difficulty, Cuisine, "Serves 1 (scale it when you cook)". A missing value reads "Coming soon".
5. **Scores:** three separate rows with their exact labels.
   - **Healthiness score** "7/10", plus "Restaurant version: 5/10" and the first research reason.
   - **Rating** "★ 4.3", with "FitPlate's research of what people say online, not user or restaurant ratings."
   - **FitPlate Score** "Coming after launch".
6. **Nutrition per serving:** a table with the column "Home-cooked (FitPlate recipe)".
   - A second column, "As ordered (published by the restaurant)", appears only when a restaurant published at least one value. Missing ordered values read "Not published".
   - The calories-saved line shows only when both calorie values exist and ordering is higher.
   - Otherwise the page says "Restaurant nutrition: not published for this dish yet."
7. **Vitamins and minerals:** "Partial estimate from the ingredients (N% of the recipe covered)", then a grid of values with units (mg or µg), then the good-source line.
8. **Cost to order:**
   - "About ₹X (usually ₹min–max)" with ↑/↓/→ when the trend is known, and "Prices updated [date]".
   - The "Based on N listings" or "Not shown: …" note, or "Order price not confirmed yet."
   - "Cost to make arrives in the next update" (Day 8).
9. **Other versions** (family links and variants), **Ingredients** (1 serving) and **Equipment**. In the equipment list, a bracketed note (often the alternative) is shown in muted text.
10. **Storage and leftovers:** "Keeping it" and "Leftover idea", or "Coming soon".
11. **Balance it out:** a "How could I burn this?" toggle, closed by default. It is described under SUMMARY item 3.
12. **Sources:** "Show N sources" opens tappable source links.
13. **Footer:** "Based on N research updates, last updated D." and "General information, not medical advice."

The research's own `burnOff` text ("about 6 km of running…") is no longer shown anywhere. The computed, opt-in list replaces it, per SPEC-ADDENDA §8.

Accessibility:
- Every fact, score and table row has a combined screen-reader label.
- Toggles say what they do ("Show 34 sources", "Hide ways to burn this").
- All touch targets are 44 pt or more.

## 5. INNOVATION

New ideas this run:

1. **"Why this score?" explainer** · IMPROVE (dish page) · Impact 3 · Effort S
   - **Problem:** "7/10, but why not 9?"
   - **Solution:** tap the Healthiness score to see all of the research's reasons, as plus and minus points, not just the first one.
   - **Data:** `healthiness.reasons` (already bundled).
   - **Risk:** long text. Show it in a sheet.
2. **Restaurant-calorie gap badge** · IMPROVE (Cook cards) · Impact 4 · Effort S
   - **Problem:** "Which dishes are much lighter when I make them myself?"
   - **Solution:** a small "−90 kcal vs restaurant" chip on cards, and a sort option "Biggest calorie saving vs ordering".
   - **Data:** `asOrdered.nutrition` (9 dishes so far) and `nutritionPerServing`. Only when both exist.
   - **Risk:** few dishes have it until research publishes more. The chip is hidden otherwise.
3. **Leftover chain** · NEW FEATURE · Impact 3 · Effort M
   - **Problem:** "I always waste the last bowl."
   - **Solution:** when a dish's leftover idea names another FitPlate dish or a staple (rice, roti), suggest it for the next day's plan, with the leftover marked as "already cooked".
   - **Data:** `leftoverRemix` text plus the Plan tab.
   - **Risk:** text matching. Only exact dish names link.
4. **Storage reminder** · IMPROVE (Reminders, Day 33) · Impact 3 · Effort S
   - **Problem:** "Was this curry from Monday?"
   - **Solution:** after "Log this meal" with leftovers, an optional reminder at the research's own fridge limit (e.g. "Goan fish curry: eat by Thursday"). It is never automatic.
   - **Data:** `storage` text (days stated by research).
   - **Risk:** parsing days from prose. Only explicit "up to N days" phrases are used.

**Health-condition research (SPEC-ADDENDA §8):**
- Two condition profiles are now bundled: **type 2 diabetes** and **prediabetes**. They came from the on-demand catch-up on 15 Oct and use the Day 06 "ask your doctor" defaults.
- Still needed for the survey's health page: high blood pressure, high cholesterol, PCOS, hypothyroidism, fatty liver, chronic kidney disease, pregnancy, anaemia and gout.
- Idea: the dish page's carbs and fibre rows could carry a neutral "for diabetes, see your plan" note for users who pick diabetes in the survey (Day 31). The note would show only the researched limits, never a FitPlate number.

**Reminders (innovation):** the storage reminder above (idea 4), and a "soak tonight" reminder from dishes whose steps need overnight soaking (carried from Day 06).

**Survey-driven curation (innovation):** the Gym section answers (home or gym, equipment) should filter the "How could I burn this?" list. For example, someone without gym access sees the home options (squats, Surya Namaskar, push-ups) first. The data is already in the exercise files (`setting`/equipment). For Day 31 and Day 27.

**Built today:** the "Jump to" chips (`dishJumpChips` ON). The calories-saved line is part of the roadmap item (SPEC-ADDENDA §1).

## 6. DATABASE (SPEC-ADDENDA §5)

- **Firestore:** no change, with no new collection, no rules change and no `schemaVersion` bump.
- **Reads:** the store now exposes `bodyWeightKg`, which is the newest non-deleted `weightLogs` entry, otherwise `profile.weightKg`, otherwise null. It is computed from documents already loaded, so it adds no reads.
- **Device:** no new keys.
- **Content model:** unchanged. The dish page reads existing fields (`microNutrientsEstimate`, `asOrdered`, `storage`, `leftoverRemix`, `sources`, `versions`) and `links.json` (`met`, `dishGoodSourceOf`).
- **USER ACTION:** none.

## 7. DATA FILES

Only `src/data/research/dishes/037-bhindi-masala.json` (order average 200 → 190) and `src/data/research/links.json` (label only) changed. Both are produced by the sync command in section 3; run it instead of copying them.

## 8. CODE FILES

NEW: `src/services/dishDetail.ts`, `src/__tests__/services/dishDetail.test.ts`.
CHANGED (full content below): `src/app/recipe/[id].tsx`, `src/config/featureFlags.ts`.
CHANGED (minimal edits, shown as diffs because the files are long): `src/lib/store.tsx`, `src/__tests__/config.test.ts`.

### `src/services/dishDetail.ts`

```tsx
/**
 * Day 7: what the dish detail screen shows, worked out from a research dish.
 * Pure functions so every rule (labels, "Coming soon", the opt-in burn-off
 * maths) is unit-tested; the screen only lays the results out.
 */
import type { Dish, PriceEstimate, SourcedValue } from '../models/research';
import { PROFILE_TO_NUTRIENT } from './data/crossLinks';

/** The research assumes a 70 kg adult; used until the user logs a weight. */
export const DEFAULT_WEIGHT_KG = 70;

/** Small arrow next to a price range (spec section E): ↑ rising, ↓ falling. */
export function trendArrow(trend: PriceEstimate['trend'] | undefined): { arrow: string; label: string } | null {
  if (trend === 'rising') return { arrow: '↑', label: 'Prices rising' };
  if (trend === 'falling') return { arrow: '↓', label: 'Prices falling' };
  if (trend === 'stable') return { arrow: '→', label: 'Prices steady' };
  return null;
}

/** "1 Oct 2026" style, independent of the device locale so tests are stable. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function shortDate(iso: string | null | undefined): string | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** "Based on 2 research updates, last updated 10 Oct 2026." */
export function researchUpdatesLine(d: Pick<Dish, 'versions'>): string {
  const n = d.versions.length;
  if (n === 0) return 'Research update details coming soon.';
  const last = [...d.versions].map((v) => v.date).sort().at(-1);
  return `Based on ${n} research ${n === 1 ? 'update' : 'updates'}, last updated ${shortDate(last) ?? last}.`;
}

export type QuickFact = { label: string; value: string };

/** Quick facts; a missing value reads "Coming soon" (spec: missing data shows "Coming soon"). */
export function quickFacts(d: Dish): QuickFact[] {
  const mins = (m: number | null) => (m != null ? `${m} min` : 'Coming soon');
  const total = d.prepMin != null || d.cookMin != null ? (d.prepMin ?? 0) + (d.cookMin ?? 0) : null;
  return [
    { label: 'Prep', value: mins(d.prepMin) },
    { label: 'Cook', value: mins(d.cookMin) },
    { label: 'Total', value: mins(total) },
    { label: 'Difficulty', value: d.difficulty ?? 'Coming soon' },
    { label: 'Cuisine', value: d.cuisine ?? 'Coming soon' },
    { label: 'Serves', value: '1 (scale it when you cook)' },
  ];
}

// ---------------------------------------------------------------- nutrition

type MacroKey = 'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fibreG';
const MACRO_ROWS: { key: MacroKey; ordered: 'calories' | 'protein' | 'carbs' | 'fat' | 'fibre'; label: string; unit: string }[] = [
  { key: 'kcal', ordered: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'proteinG', ordered: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbsG', ordered: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fatG', ordered: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fibreG', ordered: 'fibre', label: 'Fibre', unit: 'g' },
];

const fmt = (v: number, unit: string) => `${unit === 'kcal' ? Math.round(v) : Math.round(v * 10) / 10} ${unit}`;

export type NutritionRow = {
  label: string;
  /** Home-cooked (FitPlate recipe) value, or "Coming soon". */
  cooked: string;
  /** As ordered (published by the restaurant), "Not published", or null when the dish has no as-ordered research. */
  ordered: string | null;
  orderedSource: string | null;
};

/**
 * SPEC-ADDENDA §1: as-ordered sits NEXT TO as-cooked, never merged. Ordered
 * values the research marked "Not found" read "Not published" and are never
 * estimated.
 */
export function nutritionRows(d: Dish): NutritionRow[] {
  const ordered = d.asOrdered?.nutrition ?? null;
  return MACRO_ROWS.map((r) => {
    const cooked = d.nutritionPerServing[r.key];
    const o: SourcedValue | null = ordered ? ordered[r.ordered] : null;
    return {
      label: r.label,
      cooked: cooked != null ? fmt(cooked, r.unit) : 'Coming soon',
      ordered: ordered ? (o?.value != null ? fmt(o.value, r.unit) : 'Not published') : null,
      orderedSource: o?.value != null ? o.source : null,
    };
  });
}

/** Whether any restaurant published a value we can show beside the recipe. */
export function hasPublishedOrdered(d: Dish): boolean {
  const n = d.asOrdered?.nutrition;
  return !!n && Object.values(n).some((v) => v.value != null);
}

/** Calories saved by cooking = as-ordered − as-cooked, only when both exist and it is a saving. */
export function caloriesSaved(d: Dish): number | null {
  const ordered = d.asOrdered?.nutrition?.calories.value;
  const cooked = d.nutritionPerServing.kcal;
  if (ordered == null || cooked == null) return null;
  const saved = Math.round(ordered - cooked);
  return saved > 0 ? saved : null;
}

// ---------------------------------------------------------------- micronutrients

const UNIT_BY_ID: Record<string, string> = Object.fromEntries(Object.values(PROFILE_TO_NUTRIENT).map((v) => [v!.id, v!.unit]));

/** "vitamin-a" → "Vitamin A". */
export function nutrientLabel(id: string): string {
  return id
    .split('-')
    .map((w) => (w.length === 1 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

export type MicroRow = { id: string; label: string; value: string };

/** The partial vitamin and mineral estimate, largest coverage first by name; nulls are left out. */
export function microRows(d: Dish): { rows: MicroRow[]; coveragePct: number } | null {
  const m = d.microNutrientsEstimate;
  if (!m) return null;
  const rows = Object.entries(m.values)
    .filter((e): e is [string, number] => e[1] != null)
    .map(([id, v]) => {
      const unit = UNIT_BY_ID[id] ?? '';
      const value = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
      return { id, label: nutrientLabel(id), value: `${value}${unit ? ` ${unit}` : ''}` };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
  return rows.length ? { rows, coveragePct: m.coveragePct } : null;
}

// ---------------------------------------------------------------- equipment

/**
 * Splits "Kadai, about 20 cm (a wide pan lets the fish sit in one layer)" into
 * the item and its note; research writes alternatives in that bracket or after
 * "or", so both stay visible.
 */
export function splitEquipment(text: string): { item: string; note: string | null } {
  const open = text.indexOf(' (');
  if (open > 0 && text.endsWith(')')) return { item: text.slice(0, open), note: text.slice(open + 2, -1) };
  return { item: text, note: null };
}

// ---------------------------------------------------------------- burn-off (opt-in)

export type MetEntry = { exerciseId: string; name: string; met: number };
export type BurnWay = { exerciseId: string; name: string; minutes: number };

/**
 * SPEC-ADDENDA §8: only shown after the user taps "How could I burn this?".
 * Minutes = kcal ÷ (MET × kg) × 60, using the research's Compendium METs.
 * Light stretches (MET under 3) are left out: they would need hours and read
 * as a punishment, which the tasty-first rule forbids.
 */
export function burnWays(kcal: number | null, weightKg: number | null, mets: readonly MetEntry[], max = 5): BurnWay[] {
  if (kcal == null || kcal <= 0) return [];
  const kg = weightKg && weightKg > 0 ? weightKg : DEFAULT_WEIGHT_KG;
  return mets
    .filter((m) => m.met >= 3)
    .map((m) => ({ exerciseId: m.exerciseId, name: m.name, minutes: Math.round((kcal / (m.met * kg)) * 60) }))
    .sort((a, b) => a.minutes - b.minutes || a.name.localeCompare(b.name))
    .slice(0, max);
}

/** "1 h 20 min" / "45 min". */
export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// ---------------------------------------------------------------- sources

/** "Ranveer Brar, Goan Fish Curry: https://…" → label + link (link null when the line has no URL). */
export function splitSource(line: string): { label: string; url: string | null } {
  const m = line.match(/https?:\/\/\S+/);
  if (!m) return { label: line, url: null };
  const url = m[0].replace(/[).,;]+$/, '');
  const label = line.slice(0, m.index).replace(/[:\s–-]+$/, '').trim();
  return { label: label || url, url };
}
```

### `src/__tests__/services/dishDetail.test.ts`

```tsx
import { describe, expect, it } from '@jest/globals';

import { getDish, researchDishes, researchLinks } from '../../data/research';
import type { Dish } from '../../models/research';
import {
  burnWays,
  caloriesSaved,
  DEFAULT_WEIGHT_KG,
  durationLabel,
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

const base = getDish('001-poha') as Dish;
const withOrdered = (calories: number | null, protein: number | null = null): Dish => ({
  ...base,
  asOrdered: {
    price: null,
    nutrition: {
      calories: { value: calories, source: calories != null ? 'Swiggy menu' : null },
      protein: { value: protein, source: protein != null ? 'Zomato menu' : null },
      carbs: { value: null, source: null },
      fat: { value: null, source: null },
      fibre: { value: null, source: null },
    },
    restaurantsSampled: 5,
    platforms: ['Swiggy'],
  },
});

describe('dish detail helpers', () => {
  it('maps price trends to arrows and leaves unknown blank', () => {
    expect(trendArrow('rising')?.arrow).toBe('↑');
    expect(trendArrow('falling')?.arrow).toBe('↓');
    expect(trendArrow('stable')?.arrow).toBe('→');
    expect(trendArrow('unknown')).toBeNull();
    expect(trendArrow(undefined)).toBeNull();
  });

  it('formats dates and the research-updates line', () => {
    expect(shortDate('2026-10-04')).toBe('4 Oct 2026');
    expect(shortDate(null)).toBeNull();
    const d = { versions: [{ date: '2026-10-10', file: 'b' }, { date: '2026-10-04', file: 'a' }] };
    expect(researchUpdatesLine(d)).toBe('Based on 2 research updates, last updated 10 Oct 2026.');
    expect(researchUpdatesLine({ versions: [{ date: '2026-10-04', file: 'a' }] })).toBe('Based on 1 research update, last updated 4 Oct 2026.');
    expect(researchUpdatesLine({ versions: [] })).toMatch(/coming soon/i);
  });

  it('shows "Coming soon" for missing quick facts', () => {
    const facts = quickFacts({ ...base, prepMin: null, cookMin: null, difficulty: null, cuisine: null });
    expect(facts.filter((f) => f.value === 'Coming soon').map((f) => f.label)).toEqual(['Prep', 'Cook', 'Total', 'Difficulty', 'Cuisine']);
    expect(quickFacts({ ...base, prepMin: 10, cookMin: 15 }).find((f) => f.label === 'Total')?.value).toBe('25 min');
  });

  it('keeps as-ordered beside as-cooked and never fills one from the other', () => {
    const rows = nutritionRows(withOrdered(650));
    expect(rows[0]).toMatchObject({ label: 'Calories', ordered: '650 kcal', orderedSource: 'Swiggy menu' });
    expect(rows[1].ordered).toBe('Not published');
    expect(rows[1].cooked).not.toBe('Not published');
    // No as-ordered research at all: the column is hidden, not "Not published".
    expect(nutritionRows({ ...base, asOrdered: null }).every((r) => r.ordered === null)).toBe(true);
    expect(hasPublishedOrdered(withOrdered(null))).toBe(false);
    expect(hasPublishedOrdered(withOrdered(650))).toBe(true);
  });

  it('counts calories saved only when both values exist and ordering is higher', () => {
    const cooked = base.nutritionPerServing.kcal as number;
    expect(caloriesSaved(withOrdered(cooked + 200))).toBe(200);
    expect(caloriesSaved(withOrdered(cooked - 50))).toBeNull();
    expect(caloriesSaved(withOrdered(null))).toBeNull();
    expect(caloriesSaved({ ...withOrdered(700), nutritionPerServing: { ...base.nutritionPerServing, kcal: null } })).toBeNull();
  });

  it('lists the partial micronutrient estimate with units', () => {
    const m = microRows({ ...base, microNutrientsEstimate: { values: { iron: 2.345, 'vitamin-a': 58.5, potassium: 824.2, zinc: null }, coveragePct: 41, basis: 'x' } });
    expect(m?.coveragePct).toBe(41);
    expect(m?.rows.map((r) => `${r.label}: ${r.value}`)).toEqual(['Iron: 2.3 mg', 'Potassium: 824 mg', 'Vitamin A: 58.5 µg']);
    expect(microRows({ ...base, microNutrientsEstimate: null })).toBeNull();
    expect(nutrientLabel('vitamin-b6')).toBe('Vitamin B6');
  });

  it('splits equipment notes and source links', () => {
    expect(splitEquipment('Kadai, about 20 cm (a wide pan works too)')).toEqual({ item: 'Kadai, about 20 cm', note: 'a wide pan works too' });
    expect(splitEquipment('Chopping board and knife')).toEqual({ item: 'Chopping board and knife', note: null });
    expect(splitSource('Ranveer Brar, Goan Fish Curry: https://ranveerbrar.com/recipes/goan-fish-curry/')).toEqual({
      label: 'Ranveer Brar, Goan Fish Curry',
      url: 'https://ranveerbrar.com/recipes/goan-fish-curry/',
    });
    expect(splitSource('IFCT 2017 table')).toEqual({ label: 'IFCT 2017 table', url: null });
  });

  it('works out burn-off minutes from MET and weight, quickest first, without light stretches', () => {
    const mets = [
      { exerciseId: 'treadmill', name: 'Treadmill', met: 4.8 },
      { exerciseId: 'bike', name: 'Bike', met: 5.8 },
      { exerciseId: 'stretch', name: 'Stretch', met: 2.3 },
    ];
    const ways = burnWays(420, null, mets);
    // 420 kcal ÷ (5.8 × 70) × 60 ≈ 62 min; treadmill ≈ 75 min.
    expect(ways).toEqual([
      { exerciseId: 'bike', name: 'Bike', minutes: 62 },
      { exerciseId: 'treadmill', name: 'Treadmill', minutes: 75 },
    ]);
    expect(burnWays(420, 2 * DEFAULT_WEIGHT_KG, mets)[0].minutes).toBe(31);
    expect(burnWays(null, 70, mets)).toEqual([]);
    expect(durationLabel(45)).toBe('45 min');
    expect(durationLabel(80)).toBe('1 h 20 min');
    expect(durationLabel(120)).toBe('2 h');
  });

  it('renders every bundled dish without throwing', () => {
    for (const d of researchDishes) {
      expect(nutritionRows(d)).toHaveLength(5);
      expect(quickFacts(d).length).toBeGreaterThan(0);
      expect(researchUpdatesLine(d)).toMatch(/research update/);
      microRows(d);
      burnWays(d.nutritionPerServing.kcal, null, researchLinks.met);
      d.sources.forEach(splitSource);
      d.equipment.forEach(splitEquipment);
    }
  });
});
```

### `src/app/recipe/[id].tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishImageSlot, PhotoCredit, SelectChip, TagChip, dishPhoto } from '../../components/dishes/parts';
import { factsLine } from '../../components/dishes/ResearchDishCard';
import { GradientButton, PressableScale } from '../../components/ui';
import { featureFlags } from '../../config/featureFlags';
import { familyOf, getDish, researchLinks } from '../../data/research';
import { useStore } from '../../lib/store';
import type { Dish } from '../../models/research';
import {
  burnWays,
  caloriesSaved,
  DEFAULT_WEIGHT_KG,
  durationLabel,
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
import { headlineOrderPrice, orderPriceNote } from '../../services/dishLibrary';
import { colors, radius, type } from '../../theme';

/**
 * Day 7: the full dish detail for a research dish. Every section renders for
 * every dish; anything research hasn't covered reads "Coming soon". The three
 * scores stay separate with their exact labels, and burn-off is opt-in
 * (SPEC-ADDENDA §8), never shown on its own.
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
  const family = familyOf(dish);
  const dietTags = dish.tags.filter((t) => !t.startsWith('Contains '));
  const allergenTags = dish.tags.filter((t) => t.startsWith('Contains '));
  const variants = dish.variants.filter((v) => v.status === 'variant' || v.status === 'not-appropriate');
  const photo = dishPhoto(dish.id);
  // Innovation (Day 07): "Jump to" chips; each anchor records its y on layout.
  const scrollRef = useRef<ScrollView>(null);
  const anchors = useRef<Partial<Record<JumpId, number>>>({});
  const record = useCallback((jump: JumpId, e: LayoutChangeEvent) => {
    anchors.current[jump] = e.nativeEvent.layout.y;
  }, []);
  const jumpTo = (jump: JumpId) => {
    const y = anchors.current[jump];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center' }}>
        <DishImageSlot dish={dish} size={photo ? 240 : 150} />
        {photo ? <PhotoCredit credit={photo.credit} /> : null}
        {photo ? (
          <Text style={styles.allCredits} onPress={() => router.push('/photo-credits')} accessibilityRole="link">
            All photo credits
          </Text>
        ) : null}
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

      {/* Priority plan P3: shop, cook step by step, or compare with ordering. */}
      <View style={{ gap: 10, marginTop: 16 }}>
        <GradientButton title="👩‍🍳 Cook it step by step" onPress={() => router.push({ pathname: '/steps/[id]', params: { id: dish.id, servings: '2' } })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <GradientButton title="🛒 Shop" variant="glass" onPress={() => router.push({ pathname: '/basket', params: { dishes: dish.id, servings: '2' } })} />
          </View>
          <View style={{ flex: 1 }}>
            <GradientButton title="⚖️ Order vs make" variant="glass" onPress={() => router.push({ pathname: '/order-vs-make', params: { q: dish.name } })} />
          </View>
        </View>
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
      <View onLayout={(e) => record('price', e)}>
        <OrderSection dish={dish} />
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
      <Section title={`Ingredients (1 serving, ${dish.ingredients.length})`}>
        {dish.ingredients.length ? (
          dish.ingredients.map((i, k) => (
            <Text key={`${i.name}-${k}`} style={styles.body}>
              • {i.name}
              {i.quantity != null ? <Text style={styles.muted}>{`  ${i.quantity}${i.unit ? ` ${i.unit}` : ''}`}</Text> : i.householdMeasure ? <Text style={styles.muted}>{`  ${i.householdMeasure}`}</Text> : null}
            </Text>
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

      <BurnSection dish={dish} />
      <View onLayout={(e) => record('sources', e)}>
        <SourcesSection dish={dish} />
      </View>

      <Text style={[styles.note, { marginTop: 18, textAlign: 'center' }]}>{researchUpdatesLine(dish)}</Text>
      <Text style={[styles.note, { textAlign: 'center' }]}>General information, not medical advice.</Text>
    </ScrollView>
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

function OrderSection({ dish }: { dish: Dish }) {
  const price = headlineOrderPrice(dish);
  const trend = trendArrow(dish.orderPrice?.trend);
  const note = orderPriceNote(dish);
  return (
    <Section title="Cost to order">
      {price ? (
        <Text style={styles.body} accessibilityLabel={`About ${price.avg} rupees, usually ${price.min} to ${price.max}${trend ? `, ${trend.label}` : ''}`}>
          About <Text style={styles.strong}>₹{price.avg}</Text> (usually ₹{price.min}–{price.max}){' '}
          {trend ? <Text style={{ color: trend.arrow === '↑' ? colors.warn : colors.accent }}>{trend.arrow}</Text> : null}
        </Text>
      ) : (
        <Text style={styles.body}>Order price not confirmed yet.</Text>
      )}
      {price?.observed ? <Text style={styles.note}>Prices updated {shortDate(price.observed)}.</Text> : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
      <Text style={styles.note}>Cost to make arrives in the next update.</Text>
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
function BurnSection({ dish }: { dish: Dish }) {
  const [open, setOpen] = useState(false);
  const { bodyWeightKg } = useStore();
  const kcal = dish.nutritionPerServing.kcal;
  const ways = open ? burnWays(kcal, bodyWeightKg, researchLinks.met) : [];
  return (
    <Section title="Balance it out">
      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={open ? "Hide ways to burn this" : "How could I burn this?"}>
        <Text style={styles.linkText}>How could I burn this?</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
      </PressableScale>
      {open ? (
        ways.length ? (
          <>
            {ways.map((w) => (
              <View key={w.exerciseId} style={styles.burnRow}>
                <Text style={styles.body}>{w.name}</Text>
                <Text style={styles.strong}>{durationLabel(w.minutes)}</Text>
              </View>
            ))}
            <Text style={styles.note}>
              For one serving ({Math.round(kcal ?? 0)} kcal) at {bodyWeightKg ?? DEFAULT_WEIGHT_KG} kg
              {bodyWeightKg ? '' : ' (the research average; your own weight is used once you log it)'}. Estimates from Compendium MET values. Food is fuel; this is just for curiosity.
            </Text>
            <PressableScale onPress={() => router.push('/move')} style={styles.link} scaleTo={0.98} accessibilityLabel="See workouts in the Move tab">
              <Text style={styles.linkText}>See workouts</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableScale>
            <Text style={styles.note}>Check with a doctor before starting new exercise.</Text>
          </>
        ) : (
          <Text style={styles.body}>Coming soon</Text>
        )
      ) : null}
    </Section>
  );
}

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
  top: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 4 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  scroll: { padding: 18, paddingBottom: 60 },
  muted: { color: colors.muted, fontSize: 13 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 4 },
  subhead: { color: colors.text, fontSize: 13, fontWeight: '700' },
  strong: { fontWeight: '800', color: colors.text },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  section: { marginTop: 16, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fact: { minWidth: 90, flexGrow: 1 },
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
```

### `src/config/featureFlags.ts`

```tsx
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
  /** Innovation (Day 07): "Jump to" chips at the top of the dish page. */
  dishJumpChips: true,
  /** Priority plan P1-b: Google sign-in inside the iPhone / Android dev build. Only shows when that platform's client ID is in .env. */
  nativeGoogleSignIn: true,
  /** Priority plan P2-c: read the research library from the server when it is newer than the bundled copy. */
  serverResearch: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag, flags: Record<FeatureFlag, boolean> = featureFlags): boolean {
  return flags[flag] === true;
}
```

### Edits: `src/lib/store.tsx` and `src/__tests__/config.test.ts`

```diff
diff --git a/src/__tests__/config.test.ts b/src/__tests__/config.test.ts
index 9235293..1b46059 100644
--- a/src/__tests__/config.test.ts
+++ b/src/__tests__/config.test.ts
@@ -6,7 +6,7 @@ import { brand, colors, spacing } from '../config/theme';
 describe('feature flags', () => {
   it('ships every unfinished feature switched off', () => {
     // Finished features stay listed here so turning one on is always a deliberate test change.
-    const finished: FeatureFlag[] = ['newTabShell', 'cloudSync', 'liteMode', 'researchData', 'rememberAllergens', 'nativeGoogleSignIn', 'serverResearch'];
+    const finished: FeatureFlag[] = ['newTabShell', 'cloudSync', 'liteMode', 'researchData', 'rememberAllergens', 'dishJumpChips', 'nativeGoogleSignIn', 'serverResearch'];
     for (const flag of Object.keys(featureFlags) as FeatureFlag[]) {
       expect(isEnabled(flag)).toBe(finished.includes(flag));
     }
diff --git a/src/lib/store.tsx b/src/lib/store.tsx
index e632ac3..3d7325d 100644
--- a/src/lib/store.tsx
+++ b/src/lib/store.tsx
@@ -175,6 +175,8 @@ type Store = State & {
   saveShoppingList: (list: ShoppingList, id?: string) => string;
   removeShoppingList: (id: string) => void;
   addWeight: (kg: number) => void;
+  /** Newest logged weight, else the profile's; null when neither exists (burn-off then assumes 70 kg). */
+  bodyWeightKg: number | null;
   ratings: Record<string, DishRating['stars']>;
   rateDish: (dishId: string, stars: DishRating['stars'], note?: string | null) => void;
   logCookCompletion: (c: Omit<CookCompletion, 'timestamp' | 'dateKey'>) => void;
@@ -383,6 +385,11 @@ export function StoreProvider({ children }: { children: ReactNode }) {
       saveShoppingList: (list, id) => s?.saveShoppingList(list, id) ?? id ?? '',
       removeShoppingList: (id) => s?.removeShoppingList(id),
       addWeight: (kg) => s?.addWeight(kg),
+      bodyWeightKg:
+        Object.values(docs.weightLogs)
+          .filter((w) => !w.deleted)
+          .sort((a, b) => b.timestamp - a.timestamp)[0]?.kg ??
+        (docs.profile && !docs.profile.deleted ? docs.profile.weightKg : null),
       ratings: Object.fromEntries(Object.values(docs.ratings).filter((r) => !r.deleted).map((r) => [r.dishId, r.stars])),
       rateDish: (dishId, stars, note = null) => s?.rateDish(dishId, stars, note),
       logCookCompletion: (c) => s?.addCookCompletion(c),
```

## 9. DEPENDENCIES

None added today. The on-demand commits of 15 Oct added packages (e.g. `expo-dev-client`), so run `npm install` after pulling.

## 10. HOW TO APPLY (for Sudarsan)

Run these from inside the `Fitplate` folder on your Mac.

**Option A (simplest): the code is already on the branch**
1. `git add -A && git commit -m "Before Day 07"` (skip this if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand.** Days 01 to 06 and the 15 Oct on-demand commits must be in place first.
1. `git add -A && git commit -m "Before Day 07"`
2. Create the two NEW files from section 8, replace the two CHANGED files with the versions shown, and apply the two small diffs.
3. Run `node scripts/research/run.js --today 2026-10-21 --build Day07` once for the data files.
4. `npm test`, then `npx expo start -c`.

## 11. HOW TO TEST

**Quickest check: the live site** https://fitplateapp.netlify.app (it deploys this commit automatically).

**Manual checklist (web and iPhone)**
- [ ] **Open a dish:** Cook tab → tap Chicken Biryani. Check that the page shows Quick facts, Scores (three separate rows, FitPlate Score "Coming after launch"), Nutrition, Vitamins and minerals, Cost to order, Ingredients, Equipment, Storage and leftovers, Balance it out and Sources. Web ☐ iPhone ☐
- [ ] **Restaurant column:** open Veg Biryani. You should see two columns, "Home-cooked" 595 kcal and "As ordered" 687 kcal, with Fibre "Not published" and "saves about 92 kcal". Open Poha: there is one column, and the page says "Restaurant nutrition: not published for this dish yet." Web ☐ iPhone ☐
- [ ] **Burn-off is opt-in:** on first view, no exercise names show. Tap "How could I burn this?" to see up to 5 ways with minutes, the 70 kg note and "See workouts". Tap again to hide them. Web ☐ iPhone ☐
- [ ] **Jump to:** tap "Storage". The page scrolls to Storage and leftovers. Web ☐ iPhone ☐
- [ ] **Sources:** "Show N sources" opens a list of links, and tapping one opens the website. Web ☐ iPhone ☐
- [ ] **Everything else as before** (Cook list and filters, Today, Track, Move, Profile, shopping, sign-in). Web ☐ iPhone ☐

**Automated (run in this session on 2026-10-21; real results)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems; one `react-hooks/refs` finding on the first jump-chip version was fixed) |
| Unit tests | `npx jest` | ✅ 32 suites, 576 tests passed (9 new in `dishDetail.test.ts`) |
| Web bundle | `npx expo export -p web` | ✅ exported (12 MB `dist`), after `npm install` for the 15 Oct dependencies |
| Web click-through | Playwright (Chromium, 390×844) on the exported site | ✅ see below; no page errors |
| Data sync | `node scripts/research/run.js --today 2026-10-21 --build Day07` | ✅ 0 new items, 0 invalid, 0 parse errors |

Click-through results:
- **Pages opened:** Goan Fish Curry, Poha, Bhindi Masala and Veg Biryani. Every section rendered on each.
- **Burn-off:** hidden on first view; the ways list appeared after tapping "How could I burn this?".
- **Sources:** opened on tap, with 34, 23 and 19 links on the first three dishes.
- **Veg Biryani:** showed the "As ordered (published by the restaurant)" column, "Not published" for fibre and "saves about 92 kcal". Goan Fish Curry correctly showed no ordered column.
- **Jump to "Storage":** scrolled from 0 to 3026 px.
- **Navigation:** the Cook tab showed 60 dishes, and tapping Chicken Biryani opened `/recipe/002-chicken-biryani`. Today, Track, Move and Profile opened.
- **Screenshots:** checked at 390 px; nothing clipped. The ordered-column header wraps onto two lines by design.

The new tests cover:
- trend arrows and dates;
- the research-updates line, and "Coming soon" quick facts;
- as-ordered kept beside as-cooked: "Not published", the column hidden with no research, never filled from the recipe;
- calories saved only when it is a saving;
- micronutrient rows and units;
- equipment notes and source links;
- burn-off minutes from MET and weight: quickest first, light stretches left out, the 70 kg default;
- every bundled dish going through every helper.

## 12. KNOWN ISSUES, LIMITATIONS AND TODOs

- **No price trend arrows yet:** every dish has one price observation, so the trend is "unknown" and no arrow shows. Arrows appear once dishes are re-researched.
- **Cost to make and the saving vs ordering** wait for Day 8. The page says so.
- **The burn-off list uses the 12 researched exercises**, with light stretches (MET under 3) left out. Walking and running aren't in the fitness research yet, so they can't be offered. Weight logging has no screen yet, so the list uses 70 kg for now (`bodyWeightKg` is ready for it).
- **Edited research files aren't re-read:** the ledger is keyed `id@date`, so the 15 Oct price rechecks of chicken leg, marathi moggu and white sesame aren't in the app. Re-reading changed files is a candidate for Day 15 (Integration #1), which re-runs every merge from the raw files.
- **Research paused 16–21 Oct:** no new research files exist (usage limit). The pipeline picks them up when the routines resume.
- **Carried from Day 06:** "split pigeon pea" no longer links to toor dal; the counts on the "Leave out" chips can read oddly; dish 49 has no order range.

## 13. USER ACTIONS ADDED TODAY

None.

Still open:
- **USER ACTION 4:** a decision on adding vendor product links and prices to the ingredient research.
- **From the 15 Oct review:** a real "Delete my data" test with a spare Google account.

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
| nativeGoogleSignIn | true (on-demand P1) | Google sign-in in the iPhone/Android dev build |
| serverResearch | true (on-demand P2) | research library read from the server when newer |
| dishJumpChips | true (since Day 7) | Innovation: "Jump to" chips on the dish page |

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
| All streams | backlog files above (dishes 31–60, remaining ingredients, nutrients 10-12 to 10-15 incl. type 2 diabetes and prediabetes) | — | OnDemand-2026-10-16 (catch-up run with caps lifted, 15 Oct) |
| — | no research files dated 2026-10-16 to 2026-10-21 | — | Day 07: nothing new |

- **Machine ledger:** `src/data/research/ledger.json` lists every ingested version (item id, research date, file, build day). Nutrient and fitness keys are `kind:id`. The runner skips any version already there; **each run of the script ingests one capped batch, so run it once per build.**
- **Backlog per stream (after Day 07):** dishes 0, ingredients 0, nutrients 0, fitness 0.
- **In the app:** 60 dishes, 128 ingredients, 12 nutrient items (incl. 2 condition profiles), 16 fitness items.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema:** all eight user collections are at version 1: `profile` (on `users/{uid}`), `mealLogs`, `waterLogs` (one document per day), `supplementLogs`, `workoutLogs`, `favourites`, `mealPlans` and `savings`. Every document has `id`, `createdAt`, `updatedAt`, `schemaVersion` and `deleted`. Day 03b added the optional `demoSample` to `Favourite`, `MealPlanDay` and `SavingEntry` (no version bump). Fields are listed in `docs/DATA_MODEL.md`.
- **Live since Day 03b:** guests on the device; signed-in users device first, then Firestore (`cloudSync` ON). The demo blob is migrated once into guest documents and kept as a backup. "Bring your data with you?" runs after sign-in. Sign-out clears the device only once everything reached the cloud.
- **Device keys:** `fitplate.docs.<owner>.<collection>.v1`, `fitplate.outbox.<owner>.v1`, `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`; the old `fitplate.state.v2` is a read-once backup.
- **Free-tier guard:** one pull per collection when the app opens for a signed-in user (no listeners yet); writes are debounced batches; water is one document per day; waiting writes are sent when the app goes to the background.
- **Rules:** owner-only (`firestore.rules`), live in the console since 2026-10-10. No top-level collection added.
- **Delete my data (Day 04, review fix 3):** deletes every document under `users/{uid}` (collections from `SCHEMAS`, batches of ≤500, profile last) and the device copy, then signs out. The Firebase Auth account is removed on Day 34.
- **Research content:** bundled JSON in `src/data/research/` since Day 4 (nutrients, hydration, guidance, conditions, exercises and fitness guides since Day 5); never in Firestore. User documents refer to it by id (`dishId`, `ingredientId`, `nutrientId`, `exerciseId`).
- **Device key (Day 06):** `fitplate.docs.<owner>.dishFilters.v1` holds the remembered allergen exclusions; under the owner prefix, so sign-out, Delete my data and Reset clear it.
- **Body weight (Day 07):** the store exposes `bodyWeightKg` (newest `weightLogs` entry, else `profile.weightKg`); read-only, no new reads.
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
| 8a | Restaurant-calorie gap badge and sort | IMPROVE | 4 | S | 4.0 | asOrdered nutrition (9 dishes) | new Day 07 |
| 8b | "Why this score?" explainer | IMPROVE | 3 | S | 3.0 | healthiness.reasons | new Day 07 |
| 8c | Storage reminder (eat-by from the research's fridge limit) | IMPROVE | 3 | S | 3.0 | storage text + Reminders (Day 33) | new Day 07 |
| 8d | Leftover chain (tomorrow's plan from the leftover idea) | NEW FEATURE | 3 | M | 1.5 | leftoverRemix + Plan tab | new Day 07 |
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

**Next up: Day 08: Cost-to-make engine (each ingredient's current estimate via canonical ids; unit conversion g/kg/ml/l/pieces/tsp/tbsp/cup with research densities, else "(est.)"; per-serving cost range and make-cost trend; saving vs ordering in ₹ and %, from confirmed order prices only; "price coming soon" for unmatched lines; tests). It fills the "Cost to make arrives in the next update" line on the dish page. Data sync continues with any new research files.**
