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
