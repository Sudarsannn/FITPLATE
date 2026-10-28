import type { ExerciseData } from '../models/exercise';
import type { Survey } from '../models/survey';

/**
 * Which moves suit the user's injuries and health conditions, using only the
 * fitness research's per-move `conditionCautions` (no rule invented here).
 * Where a move has no research rule for one of the user's answers the result
 * is 'unknown' and the screen asks the user instead of guessing.
 */
export type Fit = 'ok' | 'modify' | 'ask_doctor' | 'avoid' | 'unknown';

/** Survey "go easy on" answers -> research condition ids. Neck, wrists and ankles have no research condition yet. */
const LIMIT_TO_CONDITION: Record<string, string[]> = {
  Knees: ['knee_pain'],
  'Lower back': ['lower_back_pain'],
  Shoulders: ['shoulder_problems'],
  'Pregnancy or after birth': ['pregnancy', 'postpartum'],
};

/** Survey health-condition ids (dish research) -> exercise research condition ids. */
const HEALTH_TO_CONDITION: Record<string, string> = {
  hypertension: 'hypertension',
  'type-2-diabetes': 'type2_diabetes',
  'high-ldl-cholesterol': 'high_cholesterol',
  'high-triglycerides': 'high_cholesterol',
};

export type Concern = { condition: string; label: string };

const LABEL: Record<string, string> = {
  knee_pain: 'knee problem',
  lower_back_pain: 'lower back problem',
  shoulder_problems: 'shoulder problem',
  pregnancy: 'pregnancy',
  postpartum: 'after birth',
  hypertension: 'high blood pressure',
  type2_diabetes: 'type 2 diabetes',
  high_cholesterol: 'high cholesterol',
};

/** Conditions the user told us about, plus the answers we have no research condition for (so we ask). */
export function userConcerns(survey: Pick<Survey, 'limits' | 'healthIssues'>): { concerns: Concern[]; unresearched: string[] } {
  const ids = new Set<string>();
  const unresearched: string[] = [];
  for (const l of survey.limits) {
    if (l === 'None') continue;
    const m = LIMIT_TO_CONDITION[l];
    if (m) m.forEach((c) => ids.add(c));
    else unresearched.push(l.toLowerCase());
  }
  for (const h of survey.healthIssues) {
    const c = HEALTH_TO_CONDITION[h];
    if (c) ids.add(c);
  }
  return { concerns: [...ids].map((condition) => ({ condition, label: LABEL[condition] ?? condition })), unresearched };
}

const RANK: Record<Fit, number> = { ok: 0, modify: 1, ask_doctor: 2, unknown: 3, avoid: 4 };

export type MoveFit = { fit: Fit; notes: { label: string; status: Fit; change: string }[] };

/** The worst research status across the user's concerns; 'unknown' if a concern has no rule for this move. */
export function moveFit(e: Pick<ExerciseData, 'conditionCautions'>, concerns: Concern[]): MoveFit {
  if (!concerns.length) return { fit: 'ok', notes: [] };
  let worst: Fit = 'ok';
  const notes: MoveFit['notes'] = [];
  for (const c of concerns) {
    const hit = e.conditionCautions.find((x) => x.condition === c.condition && x.status);
    const status = (hit?.status ?? 'unknown') as Fit;
    if (RANK[status] > RANK[worst]) worst = status;
    if (hit && status !== 'ok') notes.push({ label: c.label, status, change: hit.change });
  }
  return { fit: worst, notes };
}

/** Hide 'avoid', keep research-backed picks first, move unknown and ask-your-doctor ones to the end. */
export function fitOrder(f: Fit): number {
  return RANK[f];
}
