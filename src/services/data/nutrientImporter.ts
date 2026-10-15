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
