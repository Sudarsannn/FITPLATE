import type { Exercise } from '../models/exercise';
import type { Dish } from '../models/research';
import type { Budget, Survey } from '../models/survey';
import type { DietType } from '../models/user';
import { totalMinutes } from './dishLibrary';
import { worksWithKitchen } from './kitchen';
import { fitOrder, type Concern } from './moveSafety';
import { routineFits, routineKcal, routineMinutes, scheduledOn, PREBUILT_ROUTINES, exerciseById, type PrebuiltRoutine } from './routines';
import { fitsSurvey, likedCuisine } from './surveyMatch';
import type { Routine } from '../models/routine';

/**
 * Day 30: "What should I eat?" and "What should I do today?". Tasty-first: a dish's research rating
 * carries the most weight, then it has to fit what is left of the day (calories, protein), the goal,
 * the vitamins and minerals the person has been low on, time, budget, cooking level and kitchen.
 * Every pick comes with plain reasons that are true of that dish, never filler. Pure, so Jest can run it
 * across test profiles.
 */
export type Slot = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export const SLOT_LABEL: Record<Slot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };

/** Breakfast to 11, lunch to 4 pm, a snack to 6 pm, dinner after. */
export function slotFor(hour: number): Slot {
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 18) return 'snack';
  return 'dinner';
}

export const BUDGET_CAP: Record<Budget, number | null> = { 'under-100': 100, '100-200': 200, '200-350': 350, '350-plus': null };
export const MAX_PICKS = 5;

export type Gap = { id: string; name: string; target: number };

export type MealInput = {
  dishes: readonly Dish[];
  hour: number;
  slot?: Slot;
  goal: 'lose' | 'maintain' | 'gain' | 'muscle';
  /** Daily targets, and what is eaten so far today. Null kcal target means "do not steer by calories" (a doctor sets it). */
  kcalTarget: number | null;
  proteinTarget: number;
  eatenKcal: number;
  eatenProtein: number;
  mealsLoggedToday: number;
  diet: DietType;
  survey: Pick<Survey, 'allergies' | 'cuisines' | 'mealsPerDay' | 'budgetPerMeal'>;
  level: 'beginner' | 'expert';
  equipmentOwned: readonly string[];
  maxMinutes?: number | null;
  /** Overrides the survey budget. `null` means any. */
  budget?: Budget | null;
  gaps: readonly Gap[];
  /** Dish ids cooked in the last few days. */
  recentIds?: readonly string[];
  costOf: (d: Dish) => number | null;
  /** Day 31: dishes you can already mostly make from your kitchen inventory (id to what you have and still need). */
  pantry?: ReadonlyMap<string, { have: string[]; missing: string[] }>;
};

export type MealPick = { dish: Dish; score: number; minutes: number | null; costInr: number | null; reasons: string[] };

/**
 * Safety net for research slips (Day 30 found dishes 005, 008 and 012 carrying 54 g protein from one research
 * version). A single serving over 45 g, or one whose protein would be over 60 percent of its calories, is treated
 * as unknown here, so a bad number can never push a dish to the top. The data itself is reported to research.
 */
export function plausibleProtein(protein: number | null, kcal: number | null): number | null {
  if (protein == null || kcal == null || kcal <= 0) return null;
  return protein > 45 || protein * 4 > kcal * 0.6 ? null : protein;
}

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

export function mealsLeft(mealsPerDay: number | null, logged: number): number {
  return Math.max(1, (mealsPerDay ?? 3) - logged);
}

/** What one more meal should roughly be: what is left of the day split over the meals still to come. */
export function mealShare(target: number, eaten: number, left: number): number {
  return Math.max(0, target - eaten) / left;
}

export function recommendMeals(i: MealInput, max = MAX_PICKS): { slot: Slot; picks: MealPick[]; notes: string[] } {
  const slot = i.slot ?? slotFor(i.hour);
  const late = i.hour >= 21 || i.hour < 2;
  const left = mealsLeft(i.survey.mealsPerDay, i.mealsLoggedToday);
  const kcalShare = i.kcalTarget != null ? mealShare(i.kcalTarget, i.eatenKcal, left) : null;
  const proteinShare = mealShare(i.proteinTarget, i.eatenProtein, left);
  const cap = i.budget === undefined ? (i.survey.budgetPerMeal ? BUDGET_CAP[i.survey.budgetPerMeal] : null) : i.budget ? BUDGET_CAP[i.budget] : null;
  const recent = new Set(i.recentIds ?? []);
  const notes: string[] = [];
  if (i.kcalTarget != null && i.eatenKcal >= i.kcalTarget) notes.push('You have reached your calorie goal for today. These are lighter picks for if you are still hungry.');

  const picks: MealPick[] = [];
  for (const d of i.dishes) {
    if (!d.mealType.includes(slot)) continue;
    if (!fitsSurvey(i.diet, i.survey, d)) continue;
    const minutes = totalMinutes(d);
    if (i.maxMinutes != null && (minutes == null || minutes > i.maxMinutes)) continue;
    if (i.level === 'beginner' && d.difficulty && d.difficulty !== 'Beginner') continue;
    if (worksWithKitchen(d, i.equipmentOwned) === false) continue;
    const kcal = d.nutritionPerServing.kcal;
    const protein = plausibleProtein(d.nutritionPerServing.proteinG, d.nutritionPerServing.kcal);
    if (kcal == null) continue;
    if (late && kcal >= 450) continue;
    const costInr = i.costOf(d);
    if (cap != null && costInr != null && costInr > cap) continue;
    const over = i.kcalTarget != null && i.eatenKcal >= i.kcalTarget;
    if (over && kcal > 300) continue;

    const reasons: string[] = [];
    let score = 0;
    const rating = d.researchRating?.score ?? null;
    if (rating != null) {
      score += rating * 3;
      if (rating >= 8) reasons.push(`Rated ${rating} out of 10 in our research`);
    }
    const health = d.healthiness?.score ?? null;
    if (health != null) score += health;

    if (kcalShare != null && kcalShare > 0) {
      const gap = Math.abs(kcal - kcalShare) / kcalShare;
      score -= Math.min(gap, 1.5) * 4;
      if (gap <= 0.25) reasons.push(`Fits the ${fmt(Math.max(0, i.kcalTarget! - i.eatenKcal))} kcal you have left today`);
    }
    if (protein != null && proteinShare > 0) {
      const ratio = Math.min(protein / proteinShare, 1.5);
      score += ratio * (i.goal === 'muscle' ? 4 : 2);
      if (protein >= proteinShare * 0.8 && i.eatenProtein < i.proteinTarget) reasons.push(`${fmt(protein)} g protein, towards the ${fmt(Math.max(0, i.proteinTarget - i.eatenProtein))} g still to go`);
    }
    if (kcalShare != null && i.goal === 'lose' && kcal <= kcalShare) score += 1.5;
    if (i.goal === 'gain' && kcalShare != null && kcal >= kcalShare * 0.9) score += 1.5;

    let gapHits = 0;
    for (const g of i.gaps) {
      const v = d.microNutrientsEstimate?.values[g.id];
      if (v != null && g.target > 0 && v / g.target >= 0.15 && gapHits < 2) {
        gapHits++;
        score += 1.5;
        reasons.push(`Good for ${g.name.toLowerCase()}, which you have been low on`);
      }
    }
    if (likedCuisine(i.survey.cuisines, d)) {
      score += 1;
      reasons.push('A cuisine you picked');
    }
    if (minutes != null && minutes <= 20) {
      score += slot === 'breakfast' || late ? 1.5 : 0.5;
      reasons.push(`Ready in ${minutes} minutes`);
    }
    if (costInr != null && cap != null) reasons.push(`About ₹${fmt(costInr)} to make, within your ₹${cap} budget`);
    else if (costInr != null && reasons.length < 4) reasons.push(`About ₹${fmt(costInr)} to make`);
    if (i.level === 'beginner' && d.difficulty === 'Beginner') reasons.push('Beginner friendly');
    if (worksWithKitchen(d, i.equipmentOwned) === true) reasons.push('Works with the kitchen you have');
    const stock = i.pantry?.get(d.id);
    if (stock && stock.missing.length <= 2) {
      score += 1 + Math.min(stock.have.length, 4) * 0.5 - stock.missing.length * 0.5;
      reasons.unshift(stock.missing.length === 0 ? `You have everything for it: ${stock.have.slice(0, 3).join(', ')}` : `You already have ${stock.have.length} of its ${stock.have.length + stock.missing.length} main ingredients, only ${stock.missing.join(' and ')} to buy`);
    }
    if (recent.has(d.id)) score -= 3;
    picks.push({ dish: d, score, minutes, costInr, reasons: reasons.slice(0, 5) });
  }
  picks.sort((a, b) => b.score - a.score || a.dish.number - b.dish.number);
  return { slot, picks: picks.slice(0, max), notes };
}

/* ------------------------------- workout ------------------------------- */

export type WorkoutInput = {
  survey: Pick<Survey, 'trainWhere' | 'sessionMin' | 'experience' | 'workoutTypes'>;
  concerns: Concern[];
  /** The person's conditions need a doctor to set limits: only gentle routines are offered. */
  needsDoctor: boolean;
  hour: number;
  /** 0 = Sunday. */
  weekday: number;
  minutesToday: number;
  /** Minutes of movement on each of the last 2 days (yesterday first). */
  recentMinutes?: readonly number[];
  ownRoutines?: { id: string; routine: Routine }[];
};

export type WorkoutPick = { id: string; name: string; blurb: string | null; minutes: number; kcal: number | null; own: boolean; reasons: string[] };

const GENTLE = new Set(['desk-break', 'morning-yoga']);

export function recommendWorkout(i: WorkoutInput, weightKg: number | null): { pick: WorkoutPick | null; rest: boolean; notes: string[] } {
  const notes: string[] = [];
  const own = (i.ownRoutines ?? []).map((r) => ({ id: r.id, name: r.routine.name, blurb: null as string | null, items: r.routine.items, days: r.routine.days, own: true }));
  const pre = PREBUILT_ROUTINES.map((r: PrebuiltRoutine) => ({ id: r.id, name: r.name, blurb: r.blurb as string | null, items: r.items, days: r.days, own: false }));
  const all = [...own, ...pre];
  const sessionMin = i.survey.sessionMin ?? 20;
  const where: string[] = i.survey.trainWhere.length ? [...i.survey.trainWhere] : ['home'];
  const late = i.hour >= 21 || i.hour < 5;

  const usable = all.filter((r) => {
    if (!r.items.length) return false;
    if (i.needsDoctor && !GENTLE.has(r.id) && !r.own) return false;
    const fits = routineFits(r, i.concerns);
    // Anything the research says to avoid, or that needs a doctor or has no research for the person's answers, stays out.
    return fits.every((f) => fitOrder(f.fit.fit) === 0 || f.fit.fit === 'modify');
  });
  if (i.needsDoctor) notes.push("Your conditions need your doctor's advice on exercise, so only gentle options are shown. Ask first.");
  if (!usable.length) return { pick: null, rest: false, notes: [...notes, 'Nothing in the library is researched as safe for your answers yet. Please ask your doctor or a trainer.'] };

  const movedEnough = i.minutesToday >= sessionMin;
  const recentHard = (i.recentMinutes ?? []).slice(0, 2).every((m) => m >= sessionMin);

  const scored = usable.map((r) => {
    const reasons: string[] = [];
    const minutes = routineMinutes(r);
    const kinds = r.items.map((it) => exerciseById(it.exerciseId)).filter((e): e is Exercise => !!e);
    const place = (e: Exercise) => (e.section === 'gym' ? 'gym' : 'home');
    const gym = kinds.filter((e) => place(e) === 'gym').length > kinds.length / 2;
    let score = 0;
    if (gym ? where.includes('gym') : where.includes('home') || where.includes('outdoors')) {
      score += 3;
      reasons.push(gym ? 'Uses the gym you said you train at' : 'Needs no gym');
    } else score -= 4;
    if (minutes <= sessionMin + 5) {
      score += 2;
      reasons.push(`About ${minutes} minutes, within your ${sessionMin} minute session`);
    } else score -= Math.min(4, (minutes - sessionMin) / 5);
    if (i.survey.experience === 'new' && gym) score -= 2;
    const yoga = kinds.length > 0 && kinds.every((e) => e.section === 'yoga_stretch');
    if (yoga && (late || recentHard || movedEnough)) {
      score += 3;
      reasons.push(late ? 'Gentle and calm for the evening' : 'An easier day after recent effort');
    }
    if (!yoga && (late || movedEnough)) score -= 3;
    if (!yoga && recentHard) score -= 1.5;
    if (i.survey.workoutTypes.includes('Yoga and stretching') && yoga) score += 1;
    const sched = scheduledOn(i.weekday, i.ownRoutines ?? []).some((s) => s.id === r.id);
    if (sched) {
      score += 4;
      reasons.push('On your plan for today');
    }
    if (r.own) score += 0.5;
    return { r, score, minutes, reasons };
  });
  scored.sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id));
  const best = scored[0];
  if (movedEnough) notes.push(`You have already moved ${i.minutesToday} minutes today. A gentle stretch is the only extra suggestion.`);
  return {
    pick: {
      id: best.r.id,
      name: best.r.name,
      blurb: best.r.blurb,
      minutes: best.minutes,
      kcal: weightKg ? routineKcal(best.r, weightKg) : null,
      own: best.r.own,
      reasons: best.reasons.slice(0, 4),
    },
    rest: movedEnough,
    notes,
  };
}
