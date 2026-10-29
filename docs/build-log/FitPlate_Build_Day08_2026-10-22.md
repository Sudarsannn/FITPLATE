# FitPlate Build — Day 08 — 2026-10-22

## 1. HEADER

**Day 08 of 37 | Roadmap item: Cost-to-make engine | Phase 1: Food (the core) | Progress: 22% of the full app (8 ÷ 37)**

**Behind schedule by 6 days (usage limit 16–21 Oct).**

**Status: DONE.** Commit `e4fce5e` (Day 08), merged with the dish-photo commit `5684521` as `ee16cba`, is pushed to `claude/project-thread-wchnlm`. Netlify deploys it to https://fitplateapp.netlify.app.

- **How this run's day was determined:** the newest build file is `FitPlate_Build_Day07_2026-10-21.md` ("Next up: Day 08"). No build file dated 2026-10-22 existed, so this morning run went ahead. The first attempt at 10:52 IST was cut off by an API error before it did anything; this is the automatic retry.
- **Supervisor review:** `FitPlate_Review_2026-10-21.md` appeared after the Day 07 run had started, so this is the first run after it. Both FIX LIST items are done (section 3a).
- **Context available:**
  - **Code source (a):** branch `claude/project-thread-wchnlm` at `6f5ebc7` (Day 07). While this run was working, another session pushed `5684521` "Dish photos: licensed photo for all 60 research dishes (#2)". It was merged in before the push (no conflicts), and every check was re-run on the merged code.
  - **Spec:** `PROMPT.md` Day 8, `SPEC-ADDENDA.md` §1, §8 and §9.
  - **Research files:** new since Day 07: dishes 10-16, 10-21 and 10-22; ingredients 10-16, 10-21 and 10-22; nutrients 10-21; fitness 10-22.

## 2. SUMMARY

1. **Cost to make, on every dish page.** A new "Cost to make" section sits under "Cost to order". It shows the cost of one serving as a range, for example "About ₹47 per serving (₹44–50)" for Egg Bhurji.
   - "Show cost per ingredient" opens a line-by-line breakdown.
   - Water reads "no cost", and a pinch reads "a pinch, too little to count".
   - Ingredients with no price read "price coming soon". When any are missing, the section says how many ingredients it covers ("Covers 15 of 22 ingredients…").
2. **Saving versus ordering, in ₹ and %.** For example: "Saves about ₹113 (71%) versus ordering". It only shows when every ingredient has a price and the order price passed its checks (review 2026-10-15 FIX 2). Otherwise the section says which of the two is missing. If cooking costs more, it says so plainly.
3. **Honest conversions.** Spoons and cups are converted at 5, 15 and 240 ml.
   - Research hasn't published densities. Where a line crosses weight and volume (for example ghee in grams, priced per litre), it is counted at 1 g per ml and marked "(est.)".
   - Pieces against a per-kg price (a bay leaf, 2 cardamom pods) need a piece weight that research hasn't given, so those read "price coming soon". Nothing is invented.
4. **New sorts in the Cook tab:** "Cheapest to cook" and "Most saved vs ordering". Only fully priced dishes take part; the rest sort last.
5. **Innovation:** "Protein per ₹" (review idea 4). It shows "₹22.1 per 10 g of protein" on fully priced dishes and adds a sort, behind the `proteinPerRupee` flag (ON).
6. **Review fix 2:** the opt-in button now reads "See ways to balance this", with a test that the label never contains "burn". The automatic burn-off text that showed after cooking was removed from two screens (step-by-step finish and the demo "done" screen), per SPEC-ADDENDA §8.
7. **Data sync:** 10 dishes (8 valid; 68 in the app), 17 ingredient versions (143 in the app), 3 nutrient items (incl. the High blood pressure profile), 4 exercises.
   - The linker now matches 1,125 of 1,282 dish lines to a priced ingredient, up from 1,070. Generic "groundnut or sunflower oil" lines link to the researched refined cooking oil.
8. **Coverage today:** 10 of 68 dishes are fully priced; 7 of them also show a saving, because they have a confirmed order price. Every other dish shows a partial cost with its "price coming soon" count.
9. **Checks:** tsc 0 errors, lint 0, Jest 33 suites and 619 tests passing, web export 16 MB. The click-through at 390×844 had no page errors.

## 3. DATA SYNC REPORT

Command: `node scripts/research/run.js --today 2026-10-22 --build Day08 --report …`. It ran once. Because the linker changed during the build, `src/data/research` was reset with `git checkout` and the same batch was re-run. `--catch-up` was not used (review 2026-10-21 FIX 1).

- **No new research files for 17–20 Oct.** All streams paused under the usage limit; this is not a failure. Dish research also wrote a 10-16 file (dishes 61–65) before it stopped.
- **Dishes:** ingested 061–070 (10 versions from 10-16 and 10-21, at the cap of 10).
  - 062 Mutton Biryani and 068 Chicken Chettinad are **invalid: no calories parsed**. They stay out of the app until a re-research gives calories.
  - In the app: **68 dishes**. Backlog after this run: 5 (dishes 71–75 from 10-22).
- **Ingredients:** 17 versions (coconut milk, instant yeast, Schezwan chutney, kewra water, rose water, cucumber, pomegranate, moong sprouts, black salt, fennel, star anise, kalpasi, green chutney, tamarind-date chutney, thin sev, ragi flour, baby potatoes).
  - In the app: **143**. Backlog: 0.
  - `fenugreek-leaves-fresh` is invalid (no price parsed).
- **Nutrients:** biotin, folate and the **High blood pressure (hypertension)** condition profile.
  - Folate's main unit "µg DFE" fails the unit validator, and so does choline's alternative unit with a 0 factor. Both are listed as invalid; their earlier versions stay.
  - In the app: 14 nutrient items, 3 of them condition profiles.
- **Fitness:** reverse lunge, hamstring stretch, stair climber and leg press. In the app: 20.
- **Cross-links:** 1,282 dish ingredient lines, 1,125 linked and priced, 72 unmatched (Day 07: 1,070 linked).
  - The new links come from three linker rules (section 4).
  - One link was corrected: "Groundnut oil (batter)" was wrongly linked to sugar before.
  - The new tamarind-date chutney file claims the alias "imli". That made "Tamarind (imli)" ambiguous; the head rule resolves it back to the seedless block.
- **Needs review:** 101 items, mostly prices backed by fewer than 3 listings or one platform. These are unchanged in kind from Day 07.
- **Backlog review (dishes 71–72, read but not ingested):** 071 Ragi Dosa drops a "glutenFree" claim, and its Jain line keeps onion and ginger. 072 Kadhi Pakora's Jain, Navratri and Ekadashi lines keep onion or grain with no skip.
- **Order-price wobble:** 033, 037 and 048 recomputed their order average again (037 Bhindi Masala flips between ₹190 and ₹200 from run to run). See KNOWN ISSUES.

### 3a. Supervisor review FIX LIST (`FitPlate_Review_2026-10-21.md`)

1. **Recover from the gap without overspending: DONE.**
   - One roadmap day this run.
   - The "Behind schedule by 6 days (usage limit 16–21 Oct)" line is at the top of this file. Day 07 had already run before the review appeared.
   - The sync report says "no new research files" for the gap.
   - No `--catch-up`.
2. **One neutral name for the opt-in burn-off button: DONE.**
   - `BALANCE_LABEL = 'See ways to balance this'` and `BALANCE_HIDE_LABEL` in `src/services/dishDetail.ts`, used by the dish page.
   - A test checks that neither label contains "burn" (`costToMake.test.ts`, "review 2026-10-21 FIX 2").
   - The fitness file's section title is not displayed anywhere.
   - Also removed: two places that showed burn-off without being asked. The research `burnOff` text at the end of the step-by-step screen (`steps/[id].tsx`, "If you want to burn it off (optional)"), and "Burn one plate off" on the demo "done" screen after cooking (`done/[id].tsx`).

Nothing skipped. The review's new idea (Week list in one basket) is added to the IDEAS BACKLOG.

## 4. DESIGN NOTES

### Cost-to-make engine (`src/services/costToMake.ts`)

- **Inputs:** each dish line's `ingredientId` (Day 5 canonical ids), quantity and unit, and that ingredient's `price.currentEstimate` and `standardUnit` (kg, l, g, piece or dozen).
- **Units:** g/kg (mass), ml/l/tsp 5/tbsp 15/cup 240 (volume), and piece/pieces/small/medium/large/leaf/leaves/dozen (count). A number with no unit is a count, which is how the dish tables write "3" eggs or "2" pav. Spoon and cup sizes are measuring-unit definitions, not content data.
- **Weight ↔ volume:** research has published no densities. The engine counts 1 g per ml (`ASSUMED_G_PER_ML`) and marks the line and the section "(est.)". When research adds a density field, it replaces the assumption per ingredient.
- **Pieces ↔ weight:** this is not converted. With no researched piece weight, the line reads "price coming soon".
- **Not counted:**
  - Water is free ("no cost").
  - A pinch with no amount is "too little to count".
  - A line with no amount, unit or measure is a section heading ("Marinade", "For the tadka") and is skipped.
- **Range:** the sum of the line minimums to the sum of the maximums, with the average in bold. It is per serving, because every research dish is 1 serving.
- **Make-cost trend:** each line's ingredient trend is weighted by its share of the cost. It shows only when lines worth at least half the cost have a known trend, and uses the same ±5% threshold as the price engine. Today every ingredient trend is "unknown" (one price observation each), so the page says "not enough price history yet".
- **Saving versus ordering:** `order avg − make avg`, in ₹ and as a % of the order price. It needs a complete cost and a confirmed order headline. A negative saving reads "Costs about ₹X (Y%) more than ordering", never hidden.
- **Unconfirmed ingredient prices:** they are still used, because they are the research's best estimate. The section adds "N ingredient prices rest on fewer than 3 shop listings so far."
- **One engine:** the P3 shopping screens (`order-vs-make`, `basket`, `steps`) called `vendors.dishCost()`, which had its own simpler sum. `dishCost()` now delegates to the new engine with the same return shape, so every screen shows the same number.

### Linker (`linkIngredient`, `src/services/data/buildItems.ts`)

Three new rules, each a match rather than a guess:
1. **Whole-line exact id:** "Chicken (curry cut, bone-in, skinless)" slugifies to the ingredient id `chicken-curry-cut-bone-in-skinless`.
2. **Neutral cooking oil:** a line that says "oil" and names no other fat (mustard, sesame, gingelly, til, coconut, olive, ghee, butter, chilli) links to `cooking-oil-refined-sunflower-groundnut`. That is the one item the ingredient research prices as "Cooking oil, refined sunflower / groundnut". "Mustard oil … or any cooking oil" keeps mustard oil, and "Oil or ghee" stays unmatched.
3. **Name head plus alias:** when an alias is shared ("imli"), the line still links if exactly one ingredient is named plainly that word before its comma ("Tamarind, seedless block") and that same ingredient claims the alias. A bare "Chicken" with no alias stays unmatched.

Allergens are unaffected: they still read the line's own name, so "Groundnut oil" stays "Contains peanut".

### Dish page

The section reads in this order:
1. "About ₹X per serving (₹min–max)".
2. The coverage line (only if partial).
3. The saving line, or why it is not shown yet.
4. "₹ per 10 g of protein" (flag).
5. The trend line.
6. The (est.) note, if any.
7. The unconfirmed-price note.
8. The "Show cost per ingredient" toggle.
9. The footnote "For 1 serving, from researched shop prices. Cooking gas isn't included."

The old "Cost to make arrives in the next update" line is gone. The "Price" jump chip lands on both cost sections.

## 5. INNOVATION

**New ideas (3+):**
1. **"Finish the price" nudge for research.** The dish page knows exactly which lines say "price coming soon". A weekly list of the most-blocking missing items could go to ingredient research: bay leaf, green cardamom and cloves as piece weights, and lemon juice per lemon. Today 15 dishes are missing a bay-leaf price, and 20 dishes are blocked only by whole spices, chillies or lemon counted in pieces. Impact 4, effort S.
2. **Cost per plate for the family.** A toggle on the cost section for 2 or 4 plates, before Day 9's full scaler. It reuses the engine × servings. Impact 3, effort S (Day 9 will cover it fully).
3. **"Cooking costs more" honesty badge.** On the few dishes where cooking costs more than ordering (vada pav is close: ₹74 to make versus ₹60 to order), show it plainly and suggest the batch version from research. That builds trust in the savings figures. Impact 3, effort S.
4. **Price-per-protein filter for gym users.** The Gym survey answers could make "Protein per ₹" the default sort for people who chose muscle gain. This is Day 31 curation; the sort is built today. Impact 4, effort S.

**Health-condition research:** the new High blood pressure (hypertension) profile is bundled (`conditions/hypertension.json`). It still needs dish sodium per serving to drive the Doctor's limits filter (backlog 16). Ingredient profiles carry sodium per 100 g from 10-12, so Day 18 can compute it with the same engine shape as cost (amount × per-100).

**Reminders and survey curation:** a "prices updated" reminder belongs in Reminders (Day 33): "Tomato prices fell 12% this week; 4 of your saved dishes got cheaper". It needs 2+ price observations per ingredient. In the survey (Day 31), the budget question ("about how much do you spend on one meal?") could set the default sort to "Cheapest to cook".

**Built today (flagged):** `proteinPerRupee` (ON). "₹X per 10 g of protein" on fully priced dishes, and a "Protein per ₹" sort. It uses only complete costs, so a missing item can't make a dish look cheaper than it is.

## 6. DATABASE (SPEC-ADDENDA §5)

No schema change and no new reads or writes. Cost to make is computed on the device from bundled research. Later, `savings` entries (Day 14) will store the make cost and saving that were shown at cook time (`makeCostInr`, `savedInr`), so history doesn't change when prices update. This is planned for Day 14 and noted in BUILD STATE.

## 7. DATA FILES

All under `src/data/research/` (generated by the runner; 85 files changed in the Day 08 commit):
- New dishes `061-appam-with-veg-stew`, `063-shahi-paneer`, `064-schezwan-noodles`, `065-puri-bhaji`, `066-sprouts-chaat`, `067-mix-veg-curry`, `069-paneer-bhurji`, `070-egg-fried-rice`.
- 15 new ingredient JSONs, plus updated `aliases.json`. New `nutrients/biotin.json`, `conditions/hypertension.json`, and exercises `reverse-lunge`, `hamstring-stretch`, `stair-climber`, `leg-press`.
- 44 existing dish JSONs relinked (oil, chicken curry cut, tamarind, green chutney), with recomputed micronutrient estimates. `links.json` and `ledger.json` updated.

## 8. CODE FILES

All on branch `claude/project-thread-wchnlm` (commit `e4fce5e`). New files in full; edits as diffs against Day 07 (`6f5ebc7`).

### `src/services/costToMake.ts` (new)

```ts
/**
 * Day 8: the cost-to-make engine. Works out what one serving of a research
 * dish costs to cook from each ingredient's current_estimate (spec section E)
 * and the canonical ingredient ids linked on Day 5.
 *
 * Rules (PROMPT.md Day 8):
 *   - Units: g, kg, ml, l, pieces, tsp, tbsp, cup. Spoon and cup sizes are
 *     measuring definitions (5 / 15 / 240 ml), not research data.
 *   - Weight ↔ volume needs a density. Research has published none yet, so a
 *     crossing is costed at 1 g per ml and the line is marked "(est.)".
 *   - Pieces ↔ weight needs a piece weight research hasn't given, so those
 *     lines read "price coming soon", like unmatched ingredients.
 *   - The result is a RANGE (sum of the minimums to sum of the maximums).
 *   - Saving versus ordering, in ₹ and %, only when every ingredient is
 *     priced and the order price passed its checks (review 2026-10-15 FIX 2).
 * Pure functions, so every rule is unit-tested.
 */
import type { Dish, DishIngredient, Ingredient } from '../models/research';

type UnitKind = 'mass' | 'volume' | 'count';

/** Unit → kind and size in its base (g, ml or 1 piece). */
const UNITS: Record<string, { kind: UnitKind; base: number }> = {
  g: { kind: 'mass', base: 1 },
  gm: { kind: 'mass', base: 1 },
  gram: { kind: 'mass', base: 1 },
  grams: { kind: 'mass', base: 1 },
  kg: { kind: 'mass', base: 1000 },
  ml: { kind: 'volume', base: 1 },
  l: { kind: 'volume', base: 1000 },
  litre: { kind: 'volume', base: 1000 },
  liter: { kind: 'volume', base: 1000 },
  tsp: { kind: 'volume', base: 5 },
  tbsp: { kind: 'volume', base: 15 },
  cup: { kind: 'volume', base: 240 },
  cups: { kind: 'volume', base: 240 },
  piece: { kind: 'count', base: 1 },
  pieces: { kind: 'count', base: 1 },
  pc: { kind: 'count', base: 1 },
  pcs: { kind: 'count', base: 1 },
  small: { kind: 'count', base: 1 },
  medium: { kind: 'count', base: 1 },
  large: { kind: 'count', base: 1 },
  leaf: { kind: 'count', base: 1 },
  leaves: { kind: 'count', base: 1 },
  dozen: { kind: 'count', base: 12 },
};

/** Grams per ml when research gives no density; always shown as "(est.)". */
export const ASSUMED_G_PER_ML = 1;

export type Amount = { kind: UnitKind; amount: number };

/**
 * A quantity in its base unit. A number with no unit is a count ("3" eggs,
 * "2" pav), which is how the dish tables write whole items.
 */
export function toBase(quantity: number | null, unit: string | null): Amount | null {
  if (quantity == null || !(quantity >= 0)) return null;
  if (!unit || !unit.trim()) return { kind: 'count', amount: quantity };
  const u = UNITS[unit.trim().toLowerCase()];
  return u ? { kind: u.kind, amount: quantity * u.base } : null;
}

/**
 * How many price units a dish amount is, e.g. 180 g of an ingredient priced
 * per kg is 0.18. `estimated` when weight and volume had to be crossed.
 */
export function inPriceUnits(amount: Amount, priceUnit: string | null): { units: number; estimated: boolean } | null {
  const p = priceUnit ? UNITS[priceUnit.trim().toLowerCase()] : undefined;
  if (!p) return null;
  if (amount.kind === p.kind) return { units: amount.amount / p.base, estimated: false };
  if (amount.kind === 'count' || p.kind === 'count') return null;
  const grams = amount.kind === 'mass' ? amount.amount : amount.amount * ASSUMED_G_PER_ML;
  const inPriceKind = p.kind === 'mass' ? grams : grams / ASSUMED_G_PER_ML;
  return { units: inPriceKind / p.base, estimated: true };
}

export type CostStatus = 'priced' | 'estimated' | 'free' | 'pinch' | 'coming-soon';

export type CostLine = {
  name: string;
  ingredientId: string | null;
  status: CostStatus;
  /** ₹ for this line, unrounded; null unless priced or estimated. */
  min: number | null;
  max: number | null;
  avg: number | null;
  /** Shown beside the line: "(est.) 1 g per ml", "price coming soon", "no cost". */
  note: string | null;
  /** The ingredient's price passed the listing checks. */
  confirmed: boolean;
};

const WATER = /^(warm |cold |hot |ice cubes \+ cold )?water\b/i;
const PINCH = /\bpinch\b/i;

type PricedIngredient = Pick<Ingredient, 'id' | 'standardUnit' | 'price'>;

/** One ingredient line's cost, or why there isn't one. Section headings (no amount at all) return null. */
export function lineCost(line: DishIngredient, ingredient: PricedIngredient | undefined): CostLine | null {
  const base = { name: line.name, ingredientId: line.ingredientId, min: null, max: null, avg: null, confirmed: false };
  if (line.quantity == null && !line.unit && !line.householdMeasure) return null;
  if (!line.ingredientId && WATER.test(line.name.trim())) return { ...base, status: 'free', note: 'no cost' };
  if (line.quantity == null && PINCH.test(line.householdMeasure ?? '')) return { ...base, status: 'pinch', note: 'a pinch, too little to count' };
  const est = ingredient?.price?.currentEstimate;
  if (!ingredient || !est) return { ...base, status: 'coming-soon', note: 'price coming soon' };
  const amount = toBase(line.quantity, line.unit);
  const units = amount ? inPriceUnits(amount, ingredient.standardUnit) : null;
  if (!units) return { ...base, status: 'coming-soon', note: 'price coming soon' };
  return {
    ...base,
    status: units.estimated ? 'estimated' : 'priced',
    min: est.min * units.units,
    max: est.max * units.units,
    avg: est.avg * units.units,
    note: units.estimated ? `(est.) counted at ${ASSUMED_G_PER_ML} g per ml` : null,
    confirmed: ingredient.price?.confirmed !== false,
  };
}

export type MakeTrend = { trend: 'rising' | 'falling' | 'stable'; change30dPct: number | null };

export type DishCost = {
  lines: CostLine[];
  /** ₹ per serving, rounded; sums of the priced and estimated lines. */
  min: number;
  max: number;
  avg: number;
  /** Lines that count toward completeness (not free water, pinches or headings). */
  countedLines: number;
  pricedLines: number;
  missing: string[];
  /** Every counted line has a price. */
  complete: boolean;
  /** Some line crossed weight and volume. */
  estimated: boolean;
  /** Priced lines whose ingredient price isn't confirmed by 3 listings yet. */
  unconfirmed: number;
  trend: MakeTrend | null;
};

/** Same threshold as the price trend engine (spec section E). */
const TREND_PCT = 5;

/**
 * The make-cost trend: each priced line's ingredient trend weighted by its
 * share of the cost. Null until lines worth at least half the cost have a
 * known trend, so one rising spice can't move the whole dish.
 */
export function makeTrend(lines: { avg: number | null; ingredient: PricedIngredient | undefined }[]): MakeTrend | null {
  let total = 0;
  let known = 0;
  let weighted = 0;
  let withPct = 0;
  for (const l of lines) {
    if (l.avg == null || l.avg <= 0) continue;
    total += l.avg;
    const p = l.ingredient?.price;
    if (!p || p.trend === 'unknown') continue;
    known += l.avg;
    if (p.change30dPct != null) {
      weighted += p.change30dPct * l.avg;
      withPct += l.avg;
    }
  }
  if (total === 0 || known / total < 0.5) return null;
  const pct = withPct > 0 ? Math.round((weighted / withPct) * 10) / 10 : null;
  const trend = pct == null || Math.abs(pct) < TREND_PCT ? 'stable' : pct > 0 ? 'rising' : 'falling';
  return { trend, change30dPct: pct };
}

/** Cost to make one serving. Null when not a single line could be priced. */
export function dishCostToMake(dish: Pick<Dish, 'ingredients'>, ingredients: (id: string) => PricedIngredient | undefined): DishCost | null {
  const rows = dish.ingredients
    .map((line) => {
      const ingredient = line.ingredientId ? ingredients(line.ingredientId) : undefined;
      return { cost: lineCost(line, ingredient), ingredient };
    })
    .filter((r): r is { cost: CostLine; ingredient: PricedIngredient | undefined } => r.cost != null);
  const lines = rows.map((r) => r.cost);
  const priced = lines.filter((l) => l.status === 'priced' || l.status === 'estimated');
  if (priced.length === 0) return null;
  const counted = lines.filter((l) => l.status !== 'free' && l.status !== 'pinch');
  const missing = lines.filter((l) => l.status === 'coming-soon').map((l) => l.name);
  const sum = (k: 'min' | 'max' | 'avg') => priced.reduce((s, l) => s + (l[k] ?? 0), 0);
  return {
    lines,
    min: Math.round(sum('min')),
    max: Math.round(sum('max')),
    avg: Math.round(sum('avg')),
    countedLines: counted.length,
    pricedLines: priced.length,
    missing,
    complete: missing.length === 0,
    estimated: priced.some((l) => l.status === 'estimated'),
    unconfirmed: priced.filter((l) => !l.confirmed).length,
    trend: makeTrend(rows.map((r) => ({ avg: r.cost.avg, ingredient: r.ingredient }))),
  };
}

export type Saving = { rupees: number; pct: number };

/**
 * Saving versus ordering, from the averages: ₹ and % of the order price.
 * Negative when cooking costs more. Null unless the cost is complete and the
 * order price is a confirmed headline.
 */
export function savingVsOrder(cost: DishCost | null, order: { avg: number } | null): Saving | null {
  if (!cost?.complete || !order || order.avg <= 0) return null;
  const rupees = order.avg - cost.avg;
  return { rupees, pct: Math.round((rupees / order.avg) * 100) };
}

/** "₹42" or "under ₹1" for a line. */
export function rupees(v: number | null): string {
  if (v == null) return '';
  return v < 1 ? 'under ₹1' : `₹${Math.round(v)}`;
}

/** "₹38–46" (or one figure when the range is flat). */
export function rangeLabel(c: Pick<DishCost, 'min' | 'max'>): string {
  return c.min === c.max ? `₹${c.min}` : `₹${c.min}–${c.max}`;
}

/**
 * Innovation (Day 08, review idea 4): rupees per 10 g of protein from the
 * home-cooked recipe. Only for complete costs, so a missing item can't make a
 * dish look cheaper than it is.
 */
export function rupeesPer10gProtein(cost: DishCost | null, proteinG: number | null): number | null {
  if (!cost?.complete || proteinG == null || proteinG < 1) return null;
  return Math.round((cost.avg / proteinG) * 10 * 10) / 10;
}
```

### `src/__tests__/services/costToMake.test.ts` (new)

```ts
import { describe, expect, it } from '@jest/globals';

import { getIngredient, researchDishes } from '../../data/research';
import type { DishIngredient, Ingredient, PriceEstimate } from '../../models/research';
import {
  dishCostToMake,
  inPriceUnits,
  lineCost,
  makeTrend,
  rangeLabel,
  rupees,
  rupeesPer10gProtein,
  savingVsOrder,
  toBase,
} from '../../services/costToMake';
import { BALANCE_HIDE_LABEL, BALANCE_LABEL } from '../../services/dishDetail';
import { DISH_SORTS, headlineOrderPrice, makeCost } from '../../services/dishLibrary';

const price = (min: number, max: number, extra: Partial<PriceEstimate> = {}): PriceEstimate => ({
  priceHistory: [],
  currentEstimate: { min, max, avg: (min + max) / 2 },
  method: 'single',
  trend: 'unknown',
  change30dPct: null,
  lastObserved: '2026-10-04',
  stale: false,
  seasonal: false,
  confirmed: true,
  ...extra,
});
type Priced = Pick<Ingredient, 'id' | 'standardUnit' | 'price'>;
const ing = (id: string, unit: string, p: PriceEstimate | null): Priced => ({ id, standardUnit: unit, price: p });
const line = (name: string, ingredientId: string | null, quantity: number | null, unit: string | null, householdMeasure: string | null = null): DishIngredient => ({
  name,
  ingredientId,
  quantity,
  unit,
  householdMeasure,
});

const DB: Record<string, Priced> = {
  rice: ing('rice', 'kg', price(90, 120)),
  oil: ing('oil', 'l', price(175, 195)),
  ghee: ing('ghee', 'l', price(600, 700)),
  egg: ing('egg', 'dozen', price(84, 96)),
  pav: ing('pav', 'piece', price(5, 6)),
  chilli: ing('chilli', 'kg', price(80, 120)),
  saffron: ing('saffron', 'g', price(300, 400)),
  unpriced: ing('unpriced', 'kg', null),
};
const find = (id: string) => DB[id];

describe('unit conversion', () => {
  it('reads every spec unit into grams, ml or pieces', () => {
    expect(toBase(1, 'kg')).toEqual({ kind: 'mass', amount: 1000 });
    expect(toBase(250, 'g')).toEqual({ kind: 'mass', amount: 250 });
    expect(toBase(1, 'l')).toEqual({ kind: 'volume', amount: 1000 });
    expect(toBase(2, 'tsp')).toEqual({ kind: 'volume', amount: 10 });
    expect(toBase(1, 'tbsp')).toEqual({ kind: 'volume', amount: 15 });
    expect(toBase(0.5, 'cup')).toEqual({ kind: 'volume', amount: 120 });
    expect(toBase(3, 'pieces')).toEqual({ kind: 'count', amount: 3 });
    expect(toBase(3, null)).toEqual({ kind: 'count', amount: 3 });
    expect(toBase(1, 'handful')).toBeNull();
    expect(toBase(null, 'g')).toBeNull();
  });

  it('converts to the price unit, and marks weight ↔ volume as an estimate', () => {
    expect(inPriceUnits({ kind: 'mass', amount: 180 }, 'kg')).toEqual({ units: 0.18, estimated: false });
    expect(inPriceUnits({ kind: 'count', amount: 3 }, 'dozen')).toEqual({ units: 0.25, estimated: false });
    expect(inPriceUnits({ kind: 'mass', amount: 10 }, 'l')).toEqual({ units: 0.01, estimated: true });
    expect(inPriceUnits({ kind: 'volume', amount: 15 }, 'kg')).toEqual({ units: 0.015, estimated: true });
    // Pieces ↔ weight needs a piece weight research hasn't given.
    expect(inPriceUnits({ kind: 'count', amount: 2 }, 'kg')).toBeNull();
    expect(inPriceUnits({ kind: 'mass', amount: 70 }, 'piece')).toBeNull();
    expect(inPriceUnits({ kind: 'mass', amount: 70 }, null)).toBeNull();
  });
});

describe('line cost', () => {
  it('prices a matched ingredient as a range', () => {
    const c = lineCost(line('Basmati rice', 'rice', 100, 'g'), DB.rice);
    expect(c).toMatchObject({ status: 'priced', min: 9, max: 12, avg: 10.5, note: null, confirmed: true });
  });

  it('marks an unmatched or unpriced ingredient "price coming soon"', () => {
    expect(lineCost(line('Soy sauce', null, 10, 'ml'), undefined)).toMatchObject({ status: 'coming-soon', note: 'price coming soon', avg: null });
    expect(lineCost(line('Thing', 'unpriced', 10, 'g'), DB.unpriced)?.status).toBe('coming-soon');
    expect(lineCost(line('Green chilli', 'chilli', 1, null, '1 piece'), DB.chilli)?.status).toBe('coming-soon');
  });

  it('labels a weight-for-volume line (est.)', () => {
    const c = lineCost(line('Ghee', 'ghee', 10, 'g'), DB.ghee);
    expect(c?.status).toBe('estimated');
    expect(c?.note).toMatch(/^\(est\.\)/);
    expect(c?.avg).toBeCloseTo(6.5);
  });

  it('treats water as free, a pinch as too little to count, and bare headings as nothing', () => {
    expect(lineCost(line('Water, for soaking', null, 200, 'ml'), undefined)).toMatchObject({ status: 'free', note: 'no cost' });
    expect(lineCost(line('Asafoetida (hing)', 'chilli', null, null, 'a pinch'), DB.chilli)?.status).toBe('pinch');
    expect(lineCost(line('Marinade', null, null, null), undefined)).toBeNull();
  });

  it('carries an unconfirmed ingredient price through as unconfirmed', () => {
    const shaky = ing('shaky', 'kg', price(10, 20, { confirmed: false }));
    expect(lineCost(line('Shaky', 'shaky', 100, 'g'), shaky)?.confirmed).toBe(false);
  });
});

describe('dish cost to make', () => {
  const full = {
    ingredients: [
      line('Basmati rice', 'rice', 100, 'g'),
      line('Sunflower oil', 'oil', 10, 'ml'),
      line('Egg (anda)', 'egg', 3, null, '3 eggs'),
      line('Pav', 'pav', 2, null, '2 pav'),
      line('Water', null, 250, 'ml'),
      line('For the tadka', null, null, null),
    ],
  };

  it('sums a per-serving range and knows when it is complete', () => {
    const c = dishCostToMake(full, find);
    // rice 9–12, oil 1.75–1.95, eggs 21–24, pav 10–12
    expect(c).toMatchObject({ min: 42, max: 50, avg: 46, pricedLines: 4, countedLines: 4, complete: true, estimated: false, unconfirmed: 0, missing: [] });
    expect(c?.lines).toHaveLength(5);
    expect(rangeLabel(c!)).toBe('₹42–50');
  });

  it('is partial when an ingredient has no price, and lists it', () => {
    const c = dishCostToMake({ ingredients: [...full.ingredients, line('Soy sauce', null, 10, 'ml')] }, find);
    expect(c?.complete).toBe(false);
    expect(c?.missing).toEqual(['Soy sauce']);
    expect(c?.countedLines).toBe(5);
  });

  it('returns null when nothing can be priced', () => {
    expect(dishCostToMake({ ingredients: [line('Soy sauce', null, 10, 'ml')] }, find)).toBeNull();
    expect(dishCostToMake({ ingredients: [] }, find)).toBeNull();
  });

  it('gives a make-cost trend only when most of the cost has a known trend', () => {
    const rising = ing('r', 'kg', price(100, 100, { trend: 'rising', change30dPct: 12 }));
    const flat = ing('f', 'kg', price(100, 100, { trend: 'stable', change30dPct: 1 }));
    const unknown = ing('u', 'kg', price(100, 100));
    expect(makeTrend([{ avg: 30, ingredient: rising }, { avg: 10, ingredient: flat }])).toEqual({ trend: 'rising', change30dPct: 9.3 });
    expect(makeTrend([{ avg: 10, ingredient: rising }, { avg: 30, ingredient: unknown }])).toBeNull();
    expect(makeTrend([{ avg: 10, ingredient: flat }])).toEqual({ trend: 'stable', change30dPct: 1 });
    expect(makeTrend([])).toBeNull();
  });
});

describe('saving versus ordering', () => {
  const c = dishCostToMake({ ingredients: [line('Rice', 'rice', 400, 'g')] }, find)!;

  it('gives ₹ and % only for a complete cost and a confirmed order price', () => {
    expect(savingVsOrder(c, { avg: 120 })).toEqual({ rupees: 78, pct: 65 });
    expect(savingVsOrder(c, { avg: 30 })).toEqual({ rupees: -12, pct: -40 });
    expect(savingVsOrder(c, null)).toBeNull();
    expect(savingVsOrder({ ...c, complete: false }, { avg: 120 })).toBeNull();
    expect(savingVsOrder(null, { avg: 120 })).toBeNull();
  });

  it('works out ₹ per 10 g protein for complete costs only', () => {
    expect(rupeesPer10gProtein(c, 12)).toBe(35);
    expect(rupeesPer10gProtein({ ...c, complete: false }, 12)).toBeNull();
    expect(rupeesPer10gProtein(c, null)).toBeNull();
    expect(rupeesPer10gProtein(c, 0.5)).toBeNull();
  });

  it('formats small line costs', () => {
    expect(rupees(0.4)).toBe('under ₹1');
    expect(rupees(12.6)).toBe('₹13');
    expect(rupees(null)).toBe('');
  });
});

describe('bundled dishes (Day 8 done-when)', () => {
  it('costs every dish without throwing, and shows cost and saving for fully priced dishes', () => {
    let complete = 0;
    let withSaving = 0;
    for (const d of researchDishes) {
      const c = dishCostToMake(d, getIngredient);
      if (!c) continue;
      expect(c.min).toBeLessThanOrEqual(c.avg);
      expect(c.avg).toBeLessThanOrEqual(c.max);
      if (c.complete) complete += 1;
      if (savingVsOrder(c, headlineOrderPrice(d))) withSaving += 1;
    }
    expect(complete).toBeGreaterThan(0);
    expect(withSaving).toBeGreaterThan(0);
  });

  it('sorts by cheapest to cook with partial costs last', () => {
    const sort = DISH_SORTS.find((s) => s.id === 'make-cost')!;
    const partial = researchDishes.find((d) => makeCost(d) && !makeCost(d)!.complete)!;
    expect(sort.value(partial)).toBeNull();
    expect(DISH_SORTS.some((s) => s.id === 'most-saved')).toBe(true);
    expect(DISH_SORTS.some((s) => s.id === 'protein-per-rupee')).toBe(true);
  });
});

describe('review 2026-10-21 FIX 2', () => {
  it('keeps the opt-in balance button neutral', () => {
    expect(BALANCE_LABEL).not.toMatch(/burn/i);
    expect(BALANCE_HIDE_LABEL).not.toMatch(/burn/i);
  });
});
```

### Edits: `buildItems.ts`, `dishLibrary.ts`, `dishDetail.ts`, `vendors/index.ts`, `featureFlags.ts`, `recipe/[id].tsx`, `steps/[id].tsx`, `done/[id].tsx`, `config.test.ts`, `importers.test.ts`

```diff
diff --git a/src/__tests__/config.test.ts b/src/__tests__/config.test.ts
index 1b46059..c68dde9 100644
--- a/src/__tests__/config.test.ts
+++ b/src/__tests__/config.test.ts
@@ -6,7 +6,7 @@ import { brand, colors, spacing } from '../config/theme';
 describe('feature flags', () => {
   it('ships every unfinished feature switched off', () => {
     // Finished features stay listed here so turning one on is always a deliberate test change.
-    const finished: FeatureFlag[] = ['newTabShell', 'cloudSync', 'liteMode', 'researchData', 'rememberAllergens', 'dishJumpChips', 'nativeGoogleSignIn', 'serverResearch'];
+    const finished: FeatureFlag[] = ['newTabShell', 'cloudSync', 'liteMode', 'researchData', 'rememberAllergens', 'dishJumpChips', 'proteinPerRupee', 'nativeGoogleSignIn', 'serverResearch'];
     for (const flag of Object.keys(featureFlags) as FeatureFlag[]) {
       expect(isEnabled(flag)).toBe(finished.includes(flag));
     }
diff --git a/src/__tests__/data/importers.test.ts b/src/__tests__/data/importers.test.ts
index 14f2a66..ea3568e 100644
--- a/src/__tests__/data/importers.test.ts
+++ b/src/__tests__/data/importers.test.ts
@@ -1,7 +1,7 @@
 import { describe, expect, it } from '@jest/globals';
 
 import { allergensOf, checkClaims, dishAllergens, findClaims } from '../../services/data/allergens';
-import { buildDish, buildIngredient, buildIngredientIndex, linkIngredient, validateDish } from '../../services/data/buildItems';
+import { buildDish, buildIngredient, buildIngredientIndex, linkIngredient, NEUTRAL_OIL_ID, validateDish } from '../../services/data/buildItems';
 import { parseDishFile, parseNutrition } from '../../services/data/dishImporter';
 import { parseFasting, validateFasting } from '../../services/data/fasting';
 import { normaliseId, parseIngredientFile } from '../../services/data/ingredientImporter';
@@ -378,6 +378,27 @@ describe('building dishes', () => {
     expect(linkIngredient('Saffron', index)).toBeNull();
   });
 
+  it('Day 8: links whole-name ids, neutral cooking oil and a unique name head, but not other fats', () => {
+    const small = buildIngredientIndex([
+      { id: 'chicken-curry-cut-bone-in-skinless', name: 'Chicken, curry cut, bone-in, skinless', aliases: [] },
+      { id: 'chicken-thigh-boneless', name: 'Chicken thigh, boneless', aliases: [] },
+      { id: NEUTRAL_OIL_ID, name: 'Cooking oil, refined sunflower / groundnut', aliases: ['tel'] },
+      { id: 'mustard-oil', name: 'Mustard oil', aliases: [] },
+      { id: 'tamarind-seedless-block', name: 'Tamarind, seedless block', aliases: ['imli'] },
+      { id: 'tamarind-date-chutney', name: 'Tamarind-date chutney, ready-made', aliases: ['imli'] },
+      { id: 'sugar', name: 'Sugar', aliases: [] },
+    ]);
+    expect(linkIngredient('Chicken (curry cut, bone-in, skinless)', small)).toBe('chicken-curry-cut-bone-in-skinless');
+    expect(linkIngredient('Groundnut oil (or any neutral cooking oil)', small)).toBe(NEUTRAL_OIL_ID);
+    expect(linkIngredient('Vegetable oil (for searing)', small)).toBe(NEUTRAL_OIL_ID);
+    expect(linkIngredient('Mustard oil (sarson ka tel), or any cooking oil', small)).toBe('mustard-oil');
+    expect(linkIngredient('Oil or ghee for roasting', small)).toBeNull();
+    expect(linkIngredient('Boiled potato', small)).toBeNull();
+    // "imli" is claimed by two items, but only one is plainly "Tamarind" before its comma.
+    expect(linkIngredient('Tamarind (imli)', small)).toBe('tamarind-seedless-block');
+    expect(linkIngredient('Chicken', small)).toBeNull();
+  });
+
   it('produces a valid Dish with an order price estimate', () => {
     const dish = buildDish([poha], '2026-10-11', index);
     expect(validateDish(dish)).toEqual([]);
diff --git a/src/app/done/[id].tsx b/src/app/done/[id].tsx
index 9dcd4ce..1c53eca 100644
--- a/src/app/done/[id].tsx
+++ b/src/app/done/[id].tsx
@@ -7,7 +7,7 @@ import { SafeAreaView } from 'react-native-safe-area-context';
 import { CountUp, DishArt, FadeIn, Glass, GradientButton, PressableScale } from '../../components/ui';
 import { costToMake, costToOrder, getDish } from '../../data/dishes';
 import { select } from '../../lib/haptics';
-import { EXERCISES, useStore } from '../../lib/store';
+import { useStore } from '../../lib/store';
 import { colors, type } from '../../theme';
 
 const { width: W, height: H } = Dimensions.get('window');
@@ -81,18 +81,6 @@ export default function DoneScreen() {
           </FadeIn>
 
           <FadeIn i={3}>
-            <Text style={styles.h}>Burn one plate off</Text>
-            <View style={{ flexDirection: 'row', gap: 10 }}>
-              {EXERCISES.filter((e) => ['Run', 'Walk', 'Cycle', 'Yoga'].includes(e.type)).map((e) => (
-                <View key={e.type} style={styles.burn}>
-                  <Text style={{ fontSize: 22 }}>{e.emoji}</Text>
-                  <Text style={{ color: colors.warm, fontWeight: '900', fontSize: 16 }}>{Math.round((dish.kcal / (e.met * 70)) * 60)}m</Text>
-                </View>
-              ))}
-            </View>
-          </FadeIn>
-
-          <FadeIn i={4}>
             <Text style={styles.h}>How did it turn out?</Text>
             <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
               {[1, 2, 3, 4, 5].map((n) => (
@@ -114,7 +102,7 @@ export default function DoneScreen() {
             {stars ? <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 8 }}>Thanks! Ratings help us recommend better dishes.</Text> : null}
           </FadeIn>
 
-          <FadeIn i={5}>
+          <FadeIn i={4}>
             {[
               ['🍽️ Eating it', dish.finish.eat],
               ['🧊 Storing leftovers', dish.finish.store],
@@ -146,5 +134,4 @@ const styles = StyleSheet.create({
   big: { color: colors.warn, fontSize: 30, fontWeight: '900', letterSpacing: -1 },
   small: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
   h: { ...type.h2, color: colors.text, marginTop: 26, marginBottom: 12 },
-  burn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
 });
diff --git a/src/app/recipe/[id].tsx b/src/app/recipe/[id].tsx
index 5224de5..df9c514 100644
--- a/src/app/recipe/[id].tsx
+++ b/src/app/recipe/[id].tsx
@@ -11,7 +11,10 @@ import { featureFlags } from '../../config/featureFlags';
 import { familyOf, getDish, researchLinks } from '../../data/research';
 import { useStore } from '../../lib/store';
 import type { Dish } from '../../models/research';
+import { rangeLabel, rupees, rupeesPer10gProtein, savingVsOrder, type DishCost } from '../../services/costToMake';
 import {
+  BALANCE_HIDE_LABEL,
+  BALANCE_LABEL,
   burnWays,
   caloriesSaved,
   DEFAULT_WEIGHT_KG,
@@ -27,7 +30,7 @@ import {
   splitSource,
   trendArrow,
 } from '../../services/dishDetail';
-import { headlineOrderPrice, orderPriceNote } from '../../services/dishLibrary';
+import { headlineOrderPrice, makeCost, orderPriceNote } from '../../services/dishLibrary';
 import { colors, radius, type } from '../../theme';
 
 /**
@@ -132,6 +135,7 @@ function DishBody({ dish }: { dish: Dish }) {
       </View>
       <View onLayout={(e) => record('price', e)}>
         <OrderSection dish={dish} />
+        <MakeSection dish={dish} />
       </View>
 
       {variants.length || family.length ? (
@@ -303,11 +307,87 @@ function OrderSection({ dish }: { dish: Dish }) {
       )}
       {price?.observed ? <Text style={styles.note}>Prices updated {shortDate(price.observed)}.</Text> : null}
       {note ? <Text style={styles.note}>{note}</Text> : null}
-      <Text style={styles.note}>Cost to make arrives in the next update.</Text>
     </Section>
   );
 }
 
+/**
+ * Day 8: cost to make one serving, as a range, from the researched
+ * ingredient prices, and the saving versus ordering once every ingredient is
+ * priced and the order price is confirmed.
+ */
+function MakeSection({ dish }: { dish: Dish }) {
+  const [open, setOpen] = useState(false);
+  const cost = makeCost(dish);
+  const saving = savingVsOrder(cost, headlineOrderPrice(dish));
+  const perProtein = featureFlags.proteinPerRupee ? rupeesPer10gProtein(cost, dish.nutritionPerServing.proteinG) : null;
+  if (!cost) {
+    return (
+      <Section title="Cost to make">
+        <Text style={styles.body}>Coming soon</Text>
+      </Section>
+    );
+  }
+  const trend = cost.trend ? trendArrow(cost.trend.trend) : null;
+  return (
+    <Section title="Cost to make">
+      <Text style={styles.body} accessibilityLabel={`About ${cost.avg} rupees per serving, usually ${cost.min} to ${cost.max}${trend ? `, ${trend.label}` : ''}`}>
+        About <Text style={styles.strong}>₹{cost.avg}</Text> per serving ({rangeLabel(cost)}){' '}
+        {trend ? <Text style={{ color: trend.arrow === '↑' ? colors.warn : colors.accent }}>{trend.arrow}</Text> : null}
+      </Text>
+      {cost.complete ? null : (
+        <Text style={styles.note}>
+          Covers {cost.pricedLines} of {cost.countedLines} ingredients. {cost.missing.length} {cost.missing.length === 1 ? 'price is' : 'prices are'} coming soon, so the full cost is a little higher.
+        </Text>
+      )}
+      <SavingLine cost={cost} saving={saving} />
+      {perProtein != null ? <Text style={styles.body}>₹{perProtein} per 10 g of protein</Text> : null}
+      <Text style={styles.note}>{trend ? `${trend.label} for its ingredients over the last month${cost.trend?.change30dPct != null ? ` (${cost.trend.change30dPct > 0 ? '+' : ''}${cost.trend.change30dPct}%)` : ''}.` : 'Ingredient price trend: not enough price history yet.'}</Text>
+      {cost.estimated ? <Text style={styles.note}>(est.) Some amounts were converted between weight and volume at 1 g per ml, because research hasn&apos;t published densities yet.</Text> : null}
+      {cost.unconfirmed ? (
+        <Text style={styles.note}>
+          {cost.unconfirmed} {cost.unconfirmed === 1 ? 'ingredient price rests' : 'ingredient prices rest'} on fewer than 3 shop listings so far.
+        </Text>
+      ) : null}
+      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={open ? 'Hide cost per ingredient' : 'Show cost per ingredient'}>
+        <Text style={styles.linkText}>{open ? 'Hide cost per ingredient' : 'Show cost per ingredient'}</Text>
+        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
+      </PressableScale>
+      {open
+        ? cost.lines.map((l, k) => (
+            <View key={`${k}-${l.name}`} style={styles.burnRow}>
+              <Text style={[styles.body, { flex: 1 }]}>{l.name}</Text>
+              <Text style={l.avg != null ? styles.strong : styles.muted}>
+                {l.avg != null ? rupees(l.avg) : l.note}
+                {l.status === 'estimated' ? ' (est.)' : ''}
+              </Text>
+            </View>
+          ))
+        : null}
+      <Text style={styles.note}>For 1 serving, from researched shop prices. Cooking gas isn&apos;t included.</Text>
+    </Section>
+  );
+}
+
+function SavingLine({ cost, saving }: { cost: DishCost; saving: { rupees: number; pct: number } | null }) {
+  if (!saving) {
+    return <Text style={styles.note}>{cost.complete ? 'Saving versus ordering shows once the order price is confirmed.' : 'Saving versus ordering shows once every ingredient has a price.'}</Text>;
+  }
+  if (saving.rupees > 0) {
+    return (
+      <Text style={[styles.body, { color: colors.accent }]}>
+        Saves about <Text style={styles.strong}>₹{saving.rupees}</Text> ({saving.pct}%) versus ordering
+      </Text>
+    );
+  }
+  if (saving.rupees === 0) return <Text style={styles.body}>About the same as ordering</Text>;
+  return (
+    <Text style={styles.body}>
+      Costs about ₹{-saving.rupees} ({-saving.pct}%) more than ordering
+    </Text>
+  );
+}
+
 function EquipmentSection({ dish }: { dish: Dish }) {
   return (
     <Section title="Equipment">
@@ -339,8 +419,8 @@ function BurnSection({ dish }: { dish: Dish }) {
   const ways = open ? burnWays(kcal, bodyWeightKg, researchLinks.met) : [];
   return (
     <Section title="Balance it out">
-      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={open ? "Hide ways to burn this" : "How could I burn this?"}>
-        <Text style={styles.linkText}>How could I burn this?</Text>
+      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98} accessibilityLabel={open ? BALANCE_HIDE_LABEL : BALANCE_LABEL}>
+        <Text style={styles.linkText}>{open ? BALANCE_HIDE_LABEL : BALANCE_LABEL}</Text>
         <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
       </PressableScale>
       {open ? (
diff --git a/src/app/steps/[id].tsx b/src/app/steps/[id].tsx
index 898345c..64d4746 100644
--- a/src/app/steps/[id].tsx
+++ b/src/app/steps/[id].tsx
@@ -161,11 +161,6 @@ function Finished({ dish, servings }: { dish: Dish; servings: number }) {
             <Text style={k.body}>{dish.leftoverRemix}</Text>
           </Section>
         ) : null}
-        {dish.burnOff ? (
-          <Section title="If you want to burn it off (optional)">
-            <Text style={k.body}>{dish.burnOff}</Text>
-          </Section>
-        ) : null}
         <GradientButton title="Back to Today" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 18 }} />
       </ScrollView>
     </SafeAreaView>
diff --git a/src/config/featureFlags.ts b/src/config/featureFlags.ts
index 6610203..b440581 100644
--- a/src/config/featureFlags.ts
+++ b/src/config/featureFlags.ts
@@ -25,6 +25,8 @@ export const featureFlags = {
   rememberAllergens: true,
   /** Innovation (Day 07): "Jump to" chips at the top of the dish page. */
   dishJumpChips: true,
+  /** Innovation (Day 08, review idea 4): "₹ per 10 g protein" on the dish page and a "Protein per ₹" sort. */
+  proteinPerRupee: true,
   /** Priority plan P1-b: Google sign-in inside the iPhone / Android dev build. Only shows when that platform's client ID is in .env. */
   nativeGoogleSignIn: true,
   /** Priority plan P2-c: read the research library from the server when it is newer than the bundled copy. */
diff --git a/src/services/data/buildItems.ts b/src/services/data/buildItems.ts
index 448fd5c..d8a187d 100644
--- a/src/services/data/buildItems.ts
+++ b/src/services/data/buildItems.ts
@@ -68,7 +68,14 @@ function mergeMacros(versions: { date: string; macros: Macros | null }[], label:
 // ---------------------------------------------------------------- ingredients
 
 /** Lookup from any spelling (English name, alias) to a canonical ingredient id. */
-export type IngredientIndex = { byKey: Map<string, string>; ids: string[] };
+export type IngredientIndex = {
+  byKey: Map<string, string>;
+  ids: string[];
+  /** Day 8: the part of each name before its first comma ("Tamarind, seedless block" → tamarind); '' when two items share it. */
+  heads?: Map<string, string>;
+  /** Day 8: every item that claims an alias, kept even when the alias is shared. */
+  claims?: Map<string, Set<string>>;
+};
 
 export function buildIngredientIndex(items: { id: string; name: string; aliases: string[] }[]): IngredientIndex {
   const byKey = new Map<string, string>();
@@ -82,7 +89,17 @@ export function buildIngredientIndex(items: { id: string; name: string; aliases:
       else if (!byKey.has(key)) byKey.set(key, item.id);
     }
   }
-  return { byKey, ids: items.map((i) => i.id) };
+  const heads = new Map<string, string>();
+  const claims = new Map<string, Set<string>>();
+  for (const item of items) {
+    const head = slugify(item.name.split(',')[0]);
+    heads.set(head, heads.has(head) && heads.get(head) !== item.id ? '' : item.id);
+    for (const alias of item.aliases) {
+      const key = slugify(alias);
+      claims.set(key, (claims.get(key) ?? new Set<string>()).add(item.id));
+    }
+  }
+  return { byKey, ids: items.map((i) => i.id), heads, claims };
 }
 
 /**
@@ -90,7 +107,19 @@ export function buildIngredientIndex(items: { id: string; name: string; aliases:
  * English name, then a bracketed alias, then a whole-word prefix ("lemon
  * juice" → lemon). Unmatched lines stay null; Day 5 adds the full alias map.
  */
+export const NEUTRAL_OIL_ID = 'cooking-oil-refined-sunflower-groundnut';
+const NEUTRAL_OIL_LINE = /\boil\b/i;
+const OTHER_FAT = /\b(mustard|sesame|gingelly|til|coconut|olive|ghee|butter|chilli|chili)\b/i;
+
 export function linkIngredient(name: string, index: IngredientIndex): string | null {
+  // Day 8: the whole line, brackets included, can be an ingredient's exact id
+  // ("Chicken (curry cut, bone-in, skinless)"); that is a match, not a guess.
+  const whole = slugify(name);
+  if (index.ids.includes(whole)) return whole;
+  // Day 8: "Groundnut oil (or any neutral cooking oil)", "Vegetable oil" and
+  // the like are what the ingredient research prices as one item, refined
+  // sunflower / groundnut oil. Lines naming a different fat keep their own link.
+  if (NEUTRAL_OIL_LINE.test(name) && !OTHER_FAT.test(name) && index.ids.includes(NEUTRAL_OIL_ID)) return NEUTRAL_OIL_ID;
   const { english, aliases } = splitName(name);
   const key = slugify(english);
   const direct = index.byKey.get(key);
@@ -99,6 +128,10 @@ export function linkIngredient(name: string, index: IngredientIndex): string | n
     const hit = index.byKey.get(slugify(alias));
     if (hit) return hit;
   }
+  // "Tamarind (imli)": "imli" is shared, but only "Tamarind, seedless block"
+  // is plain "Tamarind" before its comma AND claims "imli". Both must agree.
+  const head = index.heads?.get(key);
+  if (head && aliases.some((a) => index.claims?.get(slugify(a))?.has(head))) return head;
   const prefixes = index.ids.filter((id) => key.startsWith(id + '-')).sort((a, b) => b.length - a.length);
   if (prefixes.length > 0) return prefixes[0];
   const longer = index.ids.filter((id) => id.startsWith(key + '-'));
diff --git a/src/services/dishDetail.ts b/src/services/dishDetail.ts
index 64d78ab..46d133d 100644
--- a/src/services/dishDetail.ts
+++ b/src/services/dishDetail.ts
@@ -149,11 +149,18 @@ export function splitEquipment(text: string): { item: string; note: string | nul
 
 // ---------------------------------------------------------------- burn-off (opt-in)
 
+/**
+ * Review 2026-10-21 FIX 2: one neutral name for the opt-in button, from
+ * SPEC-ADDENDA §8. Never the fitness file's "Check how to burn these calories".
+ */
+export const BALANCE_LABEL = 'See ways to balance this';
+export const BALANCE_HIDE_LABEL = 'Hide ways to balance this';
+
 export type MetEntry = { exerciseId: string; name: string; met: number };
 export type BurnWay = { exerciseId: string; name: string; minutes: number };
 
 /**
- * SPEC-ADDENDA §8: only shown after the user taps "How could I burn this?".
+ * SPEC-ADDENDA §8: only shown after the user taps BALANCE_LABEL.
  * Minutes = kcal ÷ (MET × kg) × 60, using the research's Compendium METs.
  * Light stretches (MET under 3) are left out: they would need hours and read
  * as a punishment, which the tasty-first rule forbids.
diff --git a/src/services/dishLibrary.ts b/src/services/dishLibrary.ts
index 928e4eb..bf6f5dd 100644
--- a/src/services/dishLibrary.ts
+++ b/src/services/dishLibrary.ts
@@ -4,8 +4,11 @@
  * Option lists for cuisine, meal type and difficulty come from the dishes
  * themselves, so the library grows with every import.
  */
+import { featureFlags } from '../config/featureFlags';
+import { getIngredient } from '../data/research';
 import type { AllergenId, Dish } from '../models/research';
 import { ALLERGEN_IDS } from '../models/research';
+import { dishCostToMake, rupeesPer10gProtein, savingVsOrder } from './costToMake';
 import { ALLERGEN_LABELS } from './data/allergens';
 import { cuisineTag, TAG } from './data/tags';
 import type { FilterGroup, FilterOption, SearchDoc, SortOption } from './search';
@@ -132,13 +135,24 @@ export const DISH_SORTS: SortOption<Dish>[] = [
   { id: 'rating', label: 'Rating', value: (d) => d.researchRating?.score ?? null, direction: 'desc' },
   { id: 'fewest-ingredients', label: 'Fewest ingredients', value: (d) => (d.ingredients.length ? d.ingredients.length : null), direction: 'asc' },
   { id: 'order-price', label: 'Cheapest to order', value: (d) => headlineOrderPrice(d)?.avg ?? null, direction: 'asc' },
+  // Day 8: only dishes whose every ingredient is priced take part; the rest sort last.
+  { id: 'make-cost', label: 'Cheapest to cook', value: (d) => completeMakeCost(d), direction: 'asc' },
+  { id: 'most-saved', label: 'Most saved vs ordering', value: (d) => savingVsOrder(makeCost(d), headlineOrderPrice(d))?.rupees ?? null, direction: 'desc' },
+  ...(featureFlags.proteinPerRupee
+    ? [{ id: 'protein-per-rupee', label: 'Protein per ₹', value: (d: Dish) => rupeesPer10gProtein(makeCost(d), d.nutritionPerServing.proteinG), direction: 'asc' as const }]
+    : []),
 ];
 
+/** Day 8: cost to make one serving from the bundled ingredient prices. */
+export const makeCost = (d: Pick<Dish, 'ingredients'>) => dishCostToMake(d, getIngredient);
+
+function completeMakeCost(d: Dish): number | null {
+  const c = makeCost(d);
+  return c?.complete ? c.avg : null;
+}
+
 /** Sorts named in SPEC-ADDENDA §9 that need data from a later day; shown greyed out with the reason. */
 export const COMING_SORTS: { label: string; when: string }[] = [
-  { label: 'Cheapest to cook', when: 'cost to make' },
-  { label: 'Most saved vs ordering', when: 'cost to make' },
-  { label: 'Protein per ₹', when: 'cost to make' },
   { label: 'Lowest sodium', when: 'dish sodium data' },
 ];
 
diff --git a/src/services/vendors/index.ts b/src/services/vendors/index.ts
index 113c237..5f31a27 100644
--- a/src/services/vendors/index.ts
+++ b/src/services/vendors/index.ts
@@ -1,6 +1,7 @@
 import { getIngredient, researchDishes, researchIngredients } from '../../data/research';
 import type { Dish } from '../../models/research';
-import { costToMake, normaliseName } from './basket';
+import { dishCostToMake } from '../costToMake';
+import { normaliseName } from './basket';
 import { FITPLATE_API_URL } from './config';
 import { createLiveFood, createLiveInstamart } from './liveSwiggy';
 import { createSampleFood } from './sampleFood';
@@ -15,7 +16,6 @@ export const liveAvailable = () => Boolean(FITPLATE_API_URL);
 /** The user's chosen mode, falling back to sample wherever live isn't possible. */
 export const vendorMode = (wantsLive: boolean | undefined): VendorMode => (wantsLive && liveAvailable() ? 'live' : 'sample');
 
-const ingredientMap = () => new Map(researchIngredients.map((i) => [i.id, i]));
 
 /** Researched price per 100 g for a product query, so sample prices look like real ones. */
 function priceHint(query: string): number | null {
@@ -39,9 +39,15 @@ export function swiggyFood(mode: VendorMode): SwiggyFoodApi {
   return (sampleFood ??= createSampleFood({ dishes: () => researchDishes }));
 }
 
-/** Cost to make one dish for these servings, from researched ingredient prices. */
-export function dishCost(dish: Dish, servings = 1) {
-  return costToMake(dish, servings, ingredientMap());
+/**
+ * Cost to make one dish for these servings, from researched ingredient prices.
+ * Day 8: uses the cost-to-make engine (services/costToMake.ts); coverage is
+ * the share of counted ingredient lines that have a price.
+ */
+export function dishCost(dish: Dish, servings = 1): { inr: number; coveragePct: number } | null {
+  const c = dishCostToMake(dish, getIngredient);
+  if (!c) return null;
+  return { inr: Math.max(1, Math.round(c.avg * servings)), coveragePct: Math.round((c.pricedLines / Math.max(1, c.countedLines)) * 100) };
 }
 
 export * from './types';
```

## 9. DEPENDENCIES

None added.

## 10. HOW TO APPLY (for Sudarsan)

**Simplest:** `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`, then `npm install` (the dish-photo commit and the earlier on-demand work added packages), then `npx expo start --web`. The live site at https://fitplateapp.netlify.app already has it.

**Fallback, file by file:**
1. Create `src/services/costToMake.ts` and `src/__tests__/services/costToMake.test.ts` from section 8.
2. Apply the diff in section 8 to the other files.
3. Re-run `node scripts/research/run.js --today 2026-10-22 --build Day08` once to regenerate `src/data/research` with the new linker.

## 11. HOW TO TEST

Real results from this run, on the merged code (`ee16cba`):
- `npx tsc --noEmit`: 0 errors.
- `npx expo lint`: 0 problems. One `react/no-unescaped-entities` error appeared on the first try and was fixed.
- `npx jest`: 33 suites, **619 tests passed** (Day 07: 576). The new tests cover:
  - every unit conversion;
  - the (est.) crossing;
  - "price coming soon" for unmatched, unpriced and piece-vs-kg lines;
  - free water, pinches and headings;
  - the range sums;
  - partial versus complete costs;
  - the trend weighting;
  - saving in ₹ and % (positive and negative, and hidden when incomplete or the order price is unconfirmed);
  - ₹ per 10 g protein;
  - all 68 bundled dishes;
  - the new sorts;
  - the neutral label;
  - the three linker rules.
- `npx expo export -p web`: success, `dist/` is 16 MB (the 60 dish photos add about 4 MB).
- **Playwright click-through** (headless Chromium, 390×844, `serve -s dist`), with 0 page errors:
  - **Egg Bhurji:** "About ₹47 per serving (₹44–50)", "Saves about ₹113 (71%) versus ordering" and "₹22.1 per 10 g of protein". The breakdown opens and closes. "See ways to balance this" opens to "Hide ways to balance this".
  - **Chicken Biryani:** "About ₹86 per serving (₹77–95)", "Covers 15 of 22 ingredients", "Saving versus ordering shows once every ingredient has a price", and the (est.) note (ghee).
  - **Vada Pav:** "About ₹74 per serving (₹70–80)", "Covers 30 of 32 ingredients".
  - No page shows the old "Cost to make arrives" line or the word "burn" in the balance button.
  - **Cook tab:** 68 dishes. The sort sheet lists "Cheapest to cook", "Most saved vs ordering" and "Protein per ₹". "Most saved" puts Veg Hakka Noodles (₹145) first, then Aloo Paratha (₹141). The greyed note now lists only "dish sodium data".
- **To try it yourself:** open any dish from the Cook tab, scroll to "Cost to make", and tap "Show cost per ingredient". Then sort the Cook tab by "Most saved vs ordering".

## 12. KNOWN ISSUES, LIMITATIONS AND TODOs

1. **Most dishes are partial (58 of 68).** The biggest blockers are whole spices and lemon counted in pieces against per-kg prices. That needs researched piece weights (Research gap 15).
2. **Weight ↔ volume uses 1 g per ml**, marked "(est.)" (ghee, a few liquids). It needs researched densities (Research gap 16).
3. **Make-cost trend is blank everywhere:** each ingredient has one price observation, so trends are "unknown". It fills in as research re-prices items.
4. **Order average wobble:** dishes 033, 037 and 048 change their order average between runs of the sync (037: ₹190 ↔ ₹200). This points to an order-dependent step in the dish price merge. To fix on Day 15 (integration); it doesn't affect the confirmed headline rule.
5. **Demo dish page** (`/dish/[id]`, only from the old Discover demo cards) still shows "Burn one plate off" by default. The research dish pages don't. It goes when the demo screens are retired; noted for Day 15.

## 13. USER ACTIONS ADDED TODAY

None.

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
| proteinPerRupee | true (since Day 8) | Innovation: "₹ per 10 g of protein" on the dish page and a "Protein per ₹" sort |

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
| — | no research files dated 2026-10-17 to 2026-10-20 (usage limit) | — | — |
| Dishes | FitPlate_Dishes_2026-10-16.md | 61–65 (062 Mutton Biryani invalid: no calories) | Day 08 |
| Dishes | FitPlate_Dishes_2026-10-21.md | 66–70 (068 Chicken Chettinad invalid: no calories) | Day 08 |
| Dishes | FitPlate_Dishes_2026-10-22.md | 71–75 | — (backlog; 71–72 pre-checked, see Day 08 report) |
| Ingredients | FitPlate_Ingredients_2026-10-16.md | 5 | Day 08 |
| Ingredients | FitPlate_Ingredients_2026-10-21.md | 10 (fenugreek leaves invalid: no price) | Day 08 |
| Ingredients | FitPlate_Ingredients_2026-10-22.md | 2 (ragi flour, baby potatoes) | Day 08 |
| Nutrients | FitPlate_Nutrients_2026-10-21.md | Biotin, Folate (invalid unit), High blood pressure profile | Day 08 |
| Fitness | FitPlate_Fitness_2026-10-22.md | reverse lunge, hamstring stretch, stair climber, leg press | Day 08 |

- **Machine ledger:** `src/data/research/ledger.json` lists every ingested version (item id, research date, file, build day). Nutrient and fitness keys are `kind:id`. The runner skips any version already there; **each run of the script ingests one capped batch, so run it once per build.**
- **Backlog per stream (after Day 08):** dishes 5 (71–75), ingredients 0, nutrients 0, fitness 0.
- **In the app:** 68 dishes, 143 ingredients, 14 nutrient items (incl. 3 condition profiles), 20 fitness items. Dish lines linked and priced: 1,125 of 1,282.

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
- **Cost to make (Day 08):** computed on the device from bundled research; nothing stored. Planned for Day 14: `savings` entries store the make cost and saving shown at cook time (`makeCostInr`, `savedInr`), so history doesn't move when prices update.
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
| 1 | Fridge rescue | NEW FEATURE | 4 | S | 4.0 | Dish ingredient links (474 of 575 lines) + library (Day 6) | approved by Sudarsan 2026-10-10; ready to build |
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

**Next up: Day 09: Servings scaler and shopping list (servings 1–8 updating quantities and the cost-to-make range from the Day 08 engine; ingredient checklist with "what it looks like" and pantry-staple tags; offline merged shopping list with an estimated total, tick-off, saved on the device and shared as text; checklist shape with an include box and one variant per ingredient per SPEC-ADDENDA §7). Data sync continues with dishes 71–75 and any new research files.**
