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
  /** What can go wrong in this step and how to tell. Researched dishes carry it from 24 Oct 2026 (patch 08); older steps show their tip. */
  watchOut?: string | null;
  /** One true, sourced fact about this step or ingredient, where research found one. */
  funFact?: string | null;
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
  /**
   * Set only on dishes the AI created on a user's request (23-24 Oct 2026). They are a first
   * draft: cook-only, no order price, and queued for the daily dish research to verify.
   */
  ai?: AiDishInfo;
};

export type AiDishInfo = {
  createdAt: string;
  /** What the user typed. */
  request: string;
  mode: 'variation' | 'new';
  basedOn: { id: string; name: string } | null;
  changes: string[];
  /** Web pages the AI read while researching. */
  sources: { title: string; url: string }[];
  /** What the AI could not confirm; the daily research checks these. */
  needsMoreResearch: string[];
  model: string;
  /** False when the AI wrote it from its own knowledge because web search was not available. */
  grounded?: boolean;
  /** Someone else asked for this dish first; it came from the shared library, not this device. */
  shared?: boolean;
  /** How many people have asked for it. */
  requests?: number;
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
  /** Research "What it looks like", "How to pick" and "Shelf life" (Day 9); absent in files before the sync that added them. */
  looksLike?: string | null;
  howToPick?: string | null;
  shelfLife?: string | null;
  substitutes: string[];
  /** Spec F7: dishes the ingredient file says use it, with the quantity it gives (newest version). */
  usedIn: { dishNumber: number; quantity: number | null; unit: string | null; raw: string }[];
};

/**
 * Nutrient, Hydration, Guidance (nutrition) and HealthCondition types live in
 * ./nutrient; Exercise and fitness Guidance in ./exercise (Day 5). Import them
 * from those modules: both have a `Guidance` type, so neither is re-exported here.
 */
