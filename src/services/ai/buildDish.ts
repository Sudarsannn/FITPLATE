/**
 * Turns the AI's JSON into a FitPlate `Dish`, the same shape as a researched
 * dish, so the recipe page, shopping basket, cook steps and logging all work
 * unchanged. Pure functions: nothing here calls the network.
 *
 * What the AI says is checked, not trusted: allergens are re-derived from the
 * ingredient list, diet claims are checked against them, and a calorie figure
 * that does not match its own macros is replaced by the one the macros give.
 */
import { getIngredient, ingredientAliases, researchIngredients } from '../../data/research';
import type { AiDishInfo, AllergenId, Dish, DishIngredient, DishStep, DietClaim } from '../../models/research';
import { ALLERGEN_IDS } from '../../models/research';
import { checkClaims, dishAllergens, sortAllergens } from '../data/allergens';
import { dishTags } from '../data/tags';

export type RawAiDish = {
  name: string;
  description?: string | null;
  cuisine?: string | null;
  dietType: 'veg' | 'egg' | 'non-veg';
  mealType?: string[];
  difficulty?: string | null;
  prepMin?: number | null;
  cookMin?: number | null;
  batchNote?: string | null;
  ingredients: { name: string; quantity: number | null; unit: 'g' | 'ml' | 'count' | string; householdMeasure?: string | null; looksLike?: string | null }[];
  equipment?: string[];
  steps: { title?: string | null; text: string; timerSec?: number | null; tip?: string | null; watchOut?: string | null; funFact?: string | null; visualCue?: string | null; cameraCheck?: string | null; videoShot?: string | null }[];
  nutrition: { kcal: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null; fibreG?: number | null; basis?: string | null };
  healthiness?: { score?: number | null; restaurantScore?: number | null; reason?: string | null; swaps?: string[] } | null;
  rating?: { score?: number | null; basis?: string | null } | null;
  storage?: string | null;
  leftoverRemix?: string | null;
  allergens?: string[];
  jainFriendly?: boolean;
  veganFriendly?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  needsMoreResearch?: string[];
};

export class AiDishError extends Error {}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Name without the Indian name in brackets: "Cumin seeds (jeera)" becomes "cumin seeds". */
const english = (name: string) => name.replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
const wordsOf = (s: string) => new Set(slug(english(s)).split('-').filter((w) => w.length > 1));

let index: { id: string; words: Set<string> }[] | null = null;
let indexFor = 0;

/**
 * Maps an ingredient name to a researched ingredient id (so its price and
 * nutrition come from research), or null when nothing close exists. Exact
 * id, alias, then a strict word-overlap match: a wrong match would price the
 * wrong thing, so it prefers null.
 */
export function matchIngredientId(name: string): string | null {
  const direct = slug(english(name));
  const viaAlias = ingredientAliases[direct] ?? direct;
  if (getIngredient(viaAlias)) return viaAlias;
  if (!index || indexFor !== researchIngredients.length) {
    index = researchIngredients.map((i) => ({ id: i.id, words: wordsOf([i.name, ...i.aliases][0]) }));
    indexFor = researchIngredients.length;
  }
  const want = wordsOf(name);
  if (!want.size) return null;
  let best: { id: string; score: number } | null = null;
  const consider = (id: string, words: Set<string>) => {
    let both = 0;
    want.forEach((w) => words.has(w) && both++);
    const score = both / new Set([...want, ...words]).size;
    if (both > 0 && score > (best?.score ?? 0)) best = { id, score };
  };
  for (const e of index) consider(e.id, e.words);
  for (const i of researchIngredients) for (const a of i.aliases) consider(i.id, wordsOf(a));
  const hit = best as { id: string; score: number } | null;
  return hit && hit.score >= 0.6 ? hit.id : null;
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

/** Slug id for an AI dish, unique against the dishes already known. */
export function aiDishId(name: string, taken: (id: string) => boolean): string {
  const base = `ai-${slug(name) || 'dish'}`.slice(0, 60);
  if (!taken(base)) return base;
  for (let n = 2; n < 100; n++) if (!taken(`${base}-${n}`)) return `${base}-${n}`;
  return `${base}-${Date.now()}`;
}

/** Throws AiDishError with a plain reason when the AI's dish is too thin to cook from. */
export function validateRaw(raw: RawAiDish): void {
  if (!str(raw?.name)) throw new AiDishError('The AI did not name the dish.');
  if (!Array.isArray(raw.ingredients) || raw.ingredients.length < 3) throw new AiDishError('The AI gave too few ingredients. Try again with a bit more detail.');
  if (!Array.isArray(raw.steps) || raw.steps.length < 4) throw new AiDishError('The AI gave too few steps. Try again with a bit more detail.');
  if (raw.ingredients.some((i) => !str(i.name))) throw new AiDishError('An ingredient had no name.');
}

/** Energy from the macros (4, 4 and 9 kcal a gram). */
export const kcalFromMacros = (p: number, c: number, f: number) => Math.round(p * 4 + c * 4 + f * 9);

export function buildDish(
  raw: RawAiDish,
  ctx: { id: string; number: number; request: string; mode: 'variation' | 'new'; basedOn: { id: string; name: string } | null; changes: string[]; sources: { title: string; url: string }[]; model: string; grounded?: boolean; now?: string },
): { dish: Dish; notes: string[] } {
  validateRaw(raw);
  const notes: string[] = [];
  const now = ctx.now ?? new Date().toISOString();

  const ingredients: DishIngredient[] = raw.ingredients.map((i) => {
    const unit = i.unit === 'g' || i.unit === 'ml' ? i.unit : null; // 'count' lines keep quantity with no unit, like researched eggs
    return { ingredientId: matchIngredientId(i.name), name: i.name.trim(), quantity: num(i.quantity), unit, householdMeasure: str(i.householdMeasure) ?? (unit === null && num(i.quantity) != null ? `${num(i.quantity)}` : null) };
  });

  const steps: DishStep[] = raw.steps.map((s, n) => ({
    n: n + 1,
    title: str(s.title),
    text: s.text.trim(),
    timerSec: typeof s.timerSec === 'number' && s.timerSec > 0 && s.timerSec <= 7200 ? Math.round(s.timerSec) : null,
    tip: str(s.tip),
    watchOut: str(s.watchOut),
    funFact: str(s.funFact),
    visualCue: str(s.visualCue),
    cameraCheck: str(s.cameraCheck),
    videoShot: str(s.videoShot),
  }));

  // Allergens come from the ingredients; the AI's list can only add to them.
  const fromAi = (raw.allergens ?? []).filter((a): a is AllergenId => (ALLERGEN_IDS as readonly string[]).includes(a));
  const allergens = sortAllergens([...new Set([...dishAllergens(ingredients), ...fromAi])]);
  const claims: DietClaim[] = [];
  if (raw.veganFriendly) claims.push('vegan');
  if (raw.glutenFree) claims.push('glutenFree');
  if (raw.dairyFree) claims.push('dairyFree');
  const { kept, dropped } = checkClaims(claims, allergens, raw.dietType ?? null);
  dropped.forEach((d) => notes.push(`Dropped the "${d.claim}" claim: the ingredients contain ${d.because.join(', ')}.`));

  const n = raw.nutrition;
  const p = num(n.proteinG);
  const c = num(n.carbsG);
  const f = num(n.fatG);
  let kcal = num(n.kcal);
  if (p != null && c != null && f != null) {
    const fromMacros = kcalFromMacros(p, c, f);
    if (kcal == null || Math.abs(kcal - fromMacros) > Math.max(40, fromMacros * 0.2)) {
      if (kcal != null) notes.push(`Calories corrected from ${Math.round(kcal)} to ${fromMacros} to match the protein, carbs and fat.`);
      kcal = fromMacros;
    }
  }

  const dietType = raw.dietType === 'veg' || raw.dietType === 'egg' || raw.dietType === 'non-veg' ? raw.dietType : null;
  const mealType = (raw.mealType ?? []).filter((m) => ['breakfast', 'lunch', 'dinner', 'snack'].includes(m));
  const score = (v: unknown) => (typeof v === 'number' && v >= 0 && v <= 10 ? Math.round(v * 10) / 10 : null);
  const swaps = (raw.healthiness?.swaps ?? []).filter(Boolean).slice(0, 3);
  const reasons = [str(raw.healthiness?.reason), swaps.length ? `Healthier swaps: ${swaps.join('; ')}.` : null].filter((x): x is string => !!x);
  const ratingScore = typeof raw.rating?.score === 'number' && raw.rating.score >= 0 && raw.rating.score <= 5 ? Math.round(raw.rating.score * 10) / 10 : null;

  const info: AiDishInfo = {
    createdAt: now,
    request: ctx.request,
    mode: ctx.mode,
    basedOn: ctx.basedOn,
    changes: ctx.changes,
    sources: ctx.sources.slice(0, 20),
    needsMoreResearch: [...(ctx.grounded === false ? ['Not checked against web sources yet'] : []), ...(raw.needsMoreResearch ?? []).filter(Boolean)].slice(0, 12),
    model: ctx.model,
    grounded: ctx.grounded !== false,
  };

  const base: Omit<Dish, 'tags' | 'needsReview'> = {
    id: ctx.id,
    number: ctx.number,
    name: raw.name.trim(),
    cuisine: str(raw.cuisine),
    dietType,
    mealType,
    difficulty: str(raw.difficulty),
    prepMin: num(raw.prepMin),
    cookMin: num(raw.cookMin),
    servings: 1,
    ingredients,
    equipment: (raw.equipment ?? []).filter(Boolean),
    steps,
    nutritionPerServing: { kcal, proteinG: p, carbsG: c, fatG: f, fibreG: num(n.fibreG) },
    microNutrientsEstimate: null,
    asOrdered: null,
    orderPrice: null,
    healthiness: raw.healthiness ? { score: score(raw.healthiness.score), restaurantScore: score(raw.healthiness.restaurantScore), reasons } : null,
    researchRating: raw.rating ? { score: ratingScore, basis: str(raw.rating.basis) } : null,
    storage: str(raw.storage),
    leftoverRemix: str(raw.leftoverRemix),
    burnOff: kcal != null ? `about ${(kcal / 70).toFixed(1)} km of running (${Math.round(kcal)} ÷ 70 kcal/km, for a 70 kg adult) (est.).` : null,
    sources: ctx.sources.map((s) => `${s.title}: ${s.url}`),
    allergens,
    dietClaims: kept,
    fasting: null,
    dietTags: null,
    description: str(raw.description) ?? str(raw.batchNote),
    familyId: null,
    variants: [],
    versions: [{ date: now.slice(0, 10), file: 'ai-created' }],
    mergeMethod: {},
    mergeNotes: ['Created by FitPlate AI from a user request; not yet verified by the daily dish research.'],
    ai: info,
  };
  const t = dishTags({ ...base });
  const dish: Dish = { ...base, tags: ['AI created', ...t.tags], needsReview: [...t.review, ...notes] };
  return { dish, notes };
}
