/**
 * Create-your-own-dish with AI: the phone/web half.
 *
 * Order of work (each step is one request to the FitPlate server, which holds
 * the free Gemini key; the app never sees it):
 *   1. plan      look through every researched dish: is this one of them, a
 *                modification of one, or new?
 *   2. research  search the web for the dish (modification checks, or a full
 *                recipe from several sources)
 *   3. compose   write the full dish in FitPlate's research shape
 *   4. save      keep it on this device and add it to the research queue so
 *                the daily dish research verifies it
 */
import { getDish, getCustomDishes, researchDishes } from '../../data/research';
import type { Dish } from '../../models/research';
import { matchDish } from '../vendors/match';
import { aiDishId, AiDishError, buildDish, type RawAiDish } from './buildDish';
import { saveAiDish } from './store';

import { AI_BASE_URL } from './config';
export { AI_BASE_URL };

export type AiPhase = 'matching' | 'researching' | 'writing' | 'saving';
export const PHASES: { id: AiPhase; label: string; detail: string }[] = [
  { id: 'matching', label: 'Checking FitPlate’s researched dishes', detail: 'Looking for a dish this could be built from' },
  { id: 'researching', label: 'Researching online', detail: 'Reading recipes and nutrition sources' },
  { id: 'writing', label: 'Writing your recipe', detail: 'Ingredients, micro-steps, nutrition and health score' },
  { id: 'saving', label: 'Getting it ready', detail: 'Checking the numbers and saving' },
];

export class AiRequestError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

export type CreateInput = { name: string; description: string; diet?: string };
export type CreateResult = { kind: 'existing'; dish: Dish } | { kind: 'created'; dish: Dish; queued: boolean };

type Fetch = typeof fetch;

async function post<T>(path: string, body: unknown, fetchImpl: Fetch, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetchImpl(`${AI_BASE_URL}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    throw new AiRequestError('Couldn’t reach FitPlate’s server. Check your connection and try again.', 'network');
  }
  let data: { ok?: boolean; message?: string; error?: string } & Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new AiRequestError('The server answered in a way the app couldn’t read.', 'bad-response');
  }
  if (!res.ok || data.ok === false) {
    const code = String(data.error ?? res.status);
    const friendly: Record<string, string> = {
      'not-configured': 'AI dishes are not switched on yet. The server needs its free AI key (see docs/AI_DISHES.md).',
      quota: 'The free AI allowance is used up for now. Try again later today.',
      overloaded: 'The AI service is busy. Try again in a minute.',
    };
    throw new AiRequestError(friendly[code] ?? String(data.message ?? 'Something went wrong. Try again.'), code);
  }
  return data as T;
}

/** What the plan step sees of each researched dish. */
export function catalogOf(dishes: readonly Dish[]) {
  return dishes.map((d) => ({ id: d.id, name: d.name, cuisine: d.cuisine, dietType: d.dietType, family: d.familyId }));
}

/** A short text version of a researched dish for the AI to start from. */
export function baseSummary(d: Dish) {
  return {
    name: d.name,
    ingredients: d.ingredients.map((i) => `${i.name} ${i.quantity ?? ''}${i.unit ?? ''}`.trim()).join('; '),
    steps: d.steps.map((s) => `${s.n}. ${s.title ?? s.text.slice(0, 60)}`).join(' '),
  };
}

type PlanOut = { mode: 'existing' | 'variation' | 'new'; baseDishId: string | null; canonicalName: string; summary: string; changes: string[]; searchQueries: string[] };

/** An AI dish (this device's or the shared library's) that is the same dish by name, or null. */
export function findKnownAiDish(query: string): Dish | null {
  const q = query.trim();
  if (q.length < 3) return null;
  const m = matchDish(q, getCustomDishes());
  return m && m.score >= 0.75 ? m.dish : null;
}

export async function createDishWithAi(input: CreateInput, opts: { onPhase?: (p: AiPhase) => void; fetchImpl?: Fetch; signal?: AbortSignal; saveImpl?: typeof saveAiDish } = {}): Promise<CreateResult> {
  const f = opts.fetchImpl ?? fetch;
  const on = opts.onPhase ?? (() => {});
  const name = input.name.trim();
  const description = (input.description.trim() || name).slice(0, 600);
  if (name.length < 2 && description.length < 6) throw new AiRequestError('Tell us a little about the dish first.', 'bad-request');

  on('matching');
  // Somebody may already have asked for this dish: the shared library is free and instant.
  const known = findKnownAiDish(name || description);
  if (known) return { kind: 'existing', dish: known };
  const { plan } = await post<{ plan: PlanOut }>('/api/ai/plan', { name, description, diet: input.diet, catalog: catalogOf(researchDishes.concat(getCustomDishes().filter((d) => !researchDishes.includes(d)))) }, f, opts.signal);
  const base = plan.baseDishId ? getDish(plan.baseDishId) ?? null : null;
  if (plan.mode === 'existing' && base) return { kind: 'existing', dish: base };

  const mode: 'variation' | 'new' = plan.mode === 'variation' && base ? 'variation' : 'new';
  const basedOn = mode === 'variation' && base ? { id: base.id, name: base.name } : null;

  on('researching');
  const res = await post<{ notes: string; sources: { title: string; url: string }[]; model: string; grounded?: boolean }>(
    '/api/ai/research',
    { description, canonicalName: plan.canonicalName, mode, base: base && mode === 'variation' ? baseSummary(base) : null, changes: plan.changes, searchQueries: plan.searchQueries },
    f,
    opts.signal,
  );

  on('writing');
  const comp = await post<{ dish: RawAiDish; model: string }>('/api/ai/compose', { description, canonicalName: plan.canonicalName, notes: res.notes, base: basedOn, changes: plan.changes }, f, opts.signal);

  on('saving');
  const all = [...researchDishes, ...getCustomDishes()];
  const id = aiDishId(comp.dish.name ?? plan.canonicalName, (x) => all.some((d) => d.id === x));
  let dish: Dish;
  try {
    dish = buildDish(comp.dish, { id, number: 1000 + getCustomDishes().length + 1, request: description, mode, basedOn, changes: plan.changes, sources: res.sources, model: comp.model, grounded: res.grounded }).dish;
  } catch (e) {
    if (e instanceof AiDishError) throw new AiRequestError(e.message, 'bad-output');
    throw e;
  }
  await (opts.saveImpl ?? saveAiDish)(dish);

  // Tell the research queue. The dish is already usable, so a failure here is not the user's problem.
  let queued = false;
  try {
    const q = await post<{ saved: boolean }>('/api/ai/submit', { dish: { ...comp.dish, name: dish.name }, unmatchedIngredients: dish.ingredients.filter((i) => !i.ingredientId).map((i) => i.name), description, mode, basedOn, changes: plan.changes, sources: res.sources, model: comp.model, grounded: res.grounded !== false }, f, opts.signal);
    queued = q.saved === true;
  } catch {
    queued = false;
  }
  return { kind: 'created', dish, queued };
}
