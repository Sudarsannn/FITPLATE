/** Day 22: the extra sections of the exercise detail screen, as plain functions over the research fields. */
import type { ConditionCaution, Exercise, ExerciseGoal, Prescription } from '../models/exercise';
import { doseLabel } from './fitness';

export const GOAL_LABEL: Record<ExerciseGoal, string> = {
  general_fitness: 'General fitness',
  fat_loss: 'Fat loss',
  muscle: 'Build muscle',
  strength: 'Strength',
  endurance: 'Endurance',
  flexibility: 'Flexibility',
  relaxation: 'Relaxation',
};

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'];

export type PlanRow = { key: string; level: string; goal: string; dose: string; perWeek: number | null; tempo: string | null };

/** Every researched prescription, easiest level first, with the dose written out. Rows with no dose are dropped. */
export function planRows(e: Pick<Exercise, 'prescriptions'>): PlanRow[] {
  return e.prescriptions
    .map((p: Prescription, i) => ({ p, i, dose: doseLabel(p) }))
    .filter((r): r is { p: Prescription; i: number; dose: string } => r.dose !== null)
    .sort((a, b) => LEVEL_ORDER.indexOf(a.p.level ?? 'zz') - LEVEL_ORDER.indexOf(b.p.level ?? 'zz') || a.i - b.i)
    .map(({ p, i, dose }) => ({
      key: `${p.level ?? 'any'}-${p.goal ?? 'any'}-${i}`,
      level: p.level ? p.level.charAt(0).toUpperCase() + p.level.slice(1) : 'Any level',
      goal: p.goal ? GOAL_LABEL[p.goal] : 'Any goal',
      dose,
      perWeek: p.perWeek,
      tempo: p.tempo,
    }));
}

/** Form checkpoints in plain words: the coaching message first, the joint it watches as a label. */
export function checkpointRows(e: Pick<Exercise, 'formChecks'>): { joint: string; message: string }[] {
  return e.formChecks.filter((f) => f.message).map((f) => ({ joint: f.joint.replace(/_/g, ' '), message: f.message }));
}

const CAUTION_LABEL: Record<NonNullable<ConditionCaution['status']>, string> = {
  ok: 'Fine',
  modify: 'Change it',
  avoid: 'Skip it',
  ask_doctor: 'Ask your doctor',
};
export const cautionLabel = (c: ConditionCaution) => (c.status ? CAUTION_LABEL[c.status] : 'Ask your doctor');

/** Skip and ask-your-doctor first, so the serious ones are read first. */
export function cautionRows(e: Pick<Exercise, 'conditionCautions'>): ConditionCaution[] {
  const rank = (c: ConditionCaution) => ['avoid', 'ask_doctor', 'modify', 'ok'].indexOf(c.status ?? 'ask_doctor');
  return [...e.conditionCautions].sort((a, b) => rank(a) - rank(b));
}

/** The "film yourself" shot list: each researched video shot as a numbered line with its length and angle. */
export function shotList(e: Pick<Exercise, 'videoShots'>): { n: number; seconds: number | null; angle: string; shows: string; overlay: string }[] {
  return e.videoShots.map((v, i) => ({ n: i + 1, seconds: v.seconds, angle: v.angle, shows: v.shows, overlay: v.textOverlay }));
}

export const FILM_TIPS = [
  'Prop your phone against something steady, about waist height.',
  'Good light on you, not behind you. Wear clothes that show your joints.',
  'Keep your whole body in the frame, head to feet.',
  'Film in short clips. Watch them back at half speed to spot form slips.',
];
