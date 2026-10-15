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
