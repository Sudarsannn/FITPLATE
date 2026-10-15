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
