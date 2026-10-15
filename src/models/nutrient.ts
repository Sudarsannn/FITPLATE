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
