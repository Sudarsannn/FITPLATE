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
