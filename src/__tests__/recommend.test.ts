import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../data/research';
import { makeCost } from '../services/dishLibrary';
import { plausibleProtein, recommendMeals, recommendWorkout, slotFor, mealShare, mealsLeft, type MealInput, type WorkoutInput } from '../services/recommend';

const base = (over: Partial<MealInput> = {}): MealInput => ({
  dishes: researchDishes,
  hour: 13,
  goal: 'maintain',
  kcalTarget: 2000,
  proteinTarget: 70,
  eatenKcal: 0,
  eatenProtein: 0,
  mealsLoggedToday: 0,
  diet: 'non-veg',
  survey: { allergies: [], cuisines: [], mealsPerDay: 3, budgetPerMeal: null },
  level: 'expert',
  equipmentOwned: [],
  gaps: [],
  costOf: (d) => makeCost(d)?.avg ?? null,
  ...over,
});

describe('slots and shares', () => {
  it('maps the hour to a meal slot', () => {
    expect([8, 13, 17, 20].map(slotFor)).toEqual(['breakfast', 'lunch', 'snack', 'dinner']);
  });
  it('splits what is left over the meals still to come', () => {
    expect(mealShare(2000, 500, 3)).toBe(500);
    expect(mealShare(2000, 2500, 1)).toBe(0);
    expect(mealsLeft(3, 5)).toBe(1);
    expect(mealsLeft(null, 1)).toBe(2);
  });
});

describe('pantry first', () => {
  it('lifts a dish you can nearly make and says what is left to buy', () => {
    const plain = recommendMeals(base({ hour: 20 }), 100).picks;
    const target = plain[plain.length - 1].dish;
    const r = recommendMeals(base({ hour: 20, pantry: new Map([[target.id, { have: ['onion', 'tomato', 'paneer'], missing: ['cream'] }]]) }), 100).picks;
    const pick = r.find((p) => p.dish.id === target.id)!;
    expect(r.indexOf(pick)).toBeLessThan(plain.length - 1);
    expect(pick.reasons[0]).toMatch(/already have 3 of its 4 main ingredients, only cream to buy/);
  });
  it('says so when nothing is missing, and ignores dishes missing more than two', () => {
    const d = recommendMeals(base({ hour: 20 }), 3).picks[0].dish;
    const all = recommendMeals(base({ hour: 20, pantry: new Map([[d.id, { have: ['a', 'b'], missing: [] }]]) }), 100).picks.find((p) => p.dish.id === d.id)!;
    expect(all.reasons[0]).toMatch(/You have everything/);
    const far = recommendMeals(base({ hour: 20, pantry: new Map([[d.id, { have: ['a', 'b'], missing: ['x', 'y', 'z'] }]]) }), 100).picks.find((p) => p.dish.id === d.id)!;
    expect(far.reasons.some((x) => /already have|everything/.test(x))).toBe(false);
  });
});

describe('protein safety net', () => {
  it('ignores a serving with an impossible protein number', () => {
    expect(plausibleProtein(54, 540)).toBeNull();
    expect(plausibleProtein(54, 305)).toBeNull();
    expect(plausibleProtein(30, 150)).toBeNull();
    expect(plausibleProtein(28, 450)).toBe(28);
    expect(plausibleProtein(null, 450)).toBeNull();
  });
  it('never claims 54 g of protein for a dish in the library', () => {
    const r = recommendMeals(base({ hour: 13 }), 100);
    expect(r.picks.some((p) => p.reasons.some((x) => /^54 g protein/.test(x)))).toBe(false);
  });
});

describe('meal suggestions', () => {
  it('returns up to five dishes for the slot, each with reasons', () => {
    const r = recommendMeals(base({ hour: 8 }));
    expect(r.slot).toBe('breakfast');
    expect(r.picks.length).toBeGreaterThan(0);
    expect(r.picks.length).toBeLessThanOrEqual(5);
    for (const p of r.picks) {
      expect(p.dish.mealType).toContain('breakfast');
      expect(p.reasons.length).toBeGreaterThan(0);
    }
  });
  it('respects diet: a vegetarian never gets a non-veg dish', () => {
    const r = recommendMeals(base({ diet: 'veg', hour: 20 }), 40);
    expect(r.picks.length).toBeGreaterThan(0);
    expect(r.picks.every((p) => p.dish.dietType === 'veg')).toBe(true);
  });
  it('respects allergies', () => {
    const r = recommendMeals(base({ hour: 20, survey: { allergies: ['milk'], cuisines: [], mealsPerDay: 3, budgetPerMeal: null } }), 60);
    expect(researchDishes.some((d) => d.mealType.includes('dinner') && d.allergens.includes('milk'))).toBe(true);
    expect(r.picks.length).toBeGreaterThan(0);
    expect(r.picks.every((p) => !p.dish.allergens.includes('milk'))).toBe(true);
  });
  it('keeps to the time limit and the budget', () => {
    const quick = recommendMeals(base({ hour: 20, maxMinutes: 20 }), 60);
    expect(quick.picks.every((p) => p.minutes != null && p.minutes <= 20)).toBe(true);
    const cheap = recommendMeals(base({ hour: 20, budget: 'under-100' }), 60);
    expect(cheap.picks.every((p) => p.costInr == null || p.costInr <= 100)).toBe(true);
  });
  it('a beginner only sees beginner dishes', () => {
    const r = recommendMeals(base({ hour: 20, level: 'beginner' }), 60);
    expect(r.picks.every((p) => !p.dish.difficulty || p.dish.difficulty === 'Beginner')).toBe(true);
  });
  it('changes with the goal: muscle gets more protein than weight loss', () => {
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const m = recommendMeals(base({ hour: 20, goal: 'muscle', proteinTarget: 120 }), 5).picks.map((p) => p.dish.nutritionPerServing.proteinG ?? 0);
    const l = recommendMeals(base({ hour: 20, goal: 'lose', kcalTarget: 1500 }), 5).picks.map((p) => p.dish.nutritionPerServing.kcal ?? 0);
    const g = recommendMeals(base({ hour: 20, goal: 'gain', kcalTarget: 3000 }), 5).picks.map((p) => p.dish.nutritionPerServing.kcal ?? 0);
    expect(avg(m)).toBeGreaterThan(15);
    expect(avg(l)).toBeLessThan(avg(g));
  });
  it('changes with what is left of the day', () => {
    const fresh = recommendMeals(base({ hour: 20, mealsLoggedToday: 2, eatenKcal: 600 }), 3).picks.map((p) => p.dish.nutritionPerServing.kcal ?? 0);
    const spent = recommendMeals(base({ hour: 20, mealsLoggedToday: 2, eatenKcal: 1700 }), 3).picks.map((p) => p.dish.nutritionPerServing.kcal ?? 0);
    expect(Math.max(...spent)).toBeLessThanOrEqual(Math.max(...fresh));
  });
  it('late at night only suggests lighter dishes', () => {
    const r = recommendMeals(base({ hour: 22, slot: 'dinner' }), 40);
    expect(r.picks.every((p) => (p.dish.nutritionPerServing.kcal ?? 0) < 450)).toBe(true);
  });
  it('past the calorie goal only offers small things and says so', () => {
    const r = recommendMeals(base({ hour: 16, eatenKcal: 2100 }), 40);
    expect(r.notes.join(' ')).toMatch(/reached your calorie goal/);
    expect(r.picks.every((p) => (p.dish.nutritionPerServing.kcal ?? 0) <= 300)).toBe(true);
  });
  it('does not steer by calories when none is set', () => {
    const r = recommendMeals(base({ hour: 20, kcalTarget: null }));
    expect(r.picks.length).toBeGreaterThan(0);
    expect(r.picks.some((p) => p.reasons.some((x) => /kcal you have left/.test(x)))).toBe(false);
  });
  it('a nutrient gap lifts a dish that is rich in it and says why', () => {
    const rich = researchDishes.filter((d) => d.mealType.includes('lunch') && (d.microNutrientsEstimate?.values.iron ?? 0) > 0);
    expect(rich.length).toBeGreaterThan(0);
    const r = recommendMeals(base({ gaps: [{ id: 'iron', name: 'Iron', target: 17 }] }), 40);
    expect(r.picks.some((p) => p.reasons.some((x) => /iron/i.test(x)))).toBe(true);
  });
  it('a dish cooked recently drops down the list', () => {
    const first = recommendMeals(base({ hour: 20 }), 5).picks[0].dish.id;
    const after = recommendMeals(base({ hour: 20, recentIds: [first] }), 5).picks.map((p) => p.dish.id);
    expect(after[0]).not.toBe(first);
  });
});

const work = (over: Partial<WorkoutInput> = {}): WorkoutInput => ({
  survey: { trainWhere: ['home'], sessionMin: 20, experience: 'some', workoutTypes: [] },
  concerns: [],
  needsDoctor: false,
  hour: 18,
  weekday: 2,
  minutesToday: 0,
  ...over,
});

describe('workout suggestion', () => {
  it('suggests a no-gym routine for someone who trains at home', () => {
    const r = recommendWorkout(work(), 70);
    expect(r.pick).not.toBeNull();
    expect(['gym-a', 'gym-b', 'gym-c']).not.toContain(r.pick!.id);
    expect(r.pick!.reasons.length).toBeGreaterThan(0);
  });
  it('suggests a gym routine on its scheduled day for a gym person', () => {
    const r = recommendWorkout(work({ survey: { trainWhere: ['gym'], sessionMin: 45, experience: 'regular', workoutTypes: [] }, weekday: 1 }), 70);
    expect(r.pick!.id).toBe('gym-a');
    expect(r.pick!.reasons.join(' ')).toMatch(/On your plan/);
  });
  it('late evening gets a gentle routine', () => {
    expect(['desk-break', 'morning-yoga']).toContain(recommendWorkout(work({ hour: 22 }), 70).pick!.id);
  });
  it('after enough movement today, suggests rest or a stretch', () => {
    const r = recommendWorkout(work({ minutesToday: 40 }), 70);
    expect(r.rest).toBe(true);
    expect(['desk-break', 'morning-yoga']).toContain(r.pick!.id);
  });
  it('people whose conditions need a doctor only see gentle options, with a note', () => {
    const r = recommendWorkout(work({ needsDoctor: true }), 70);
    expect(['desk-break', 'morning-yoga']).toContain(r.pick!.id);
    expect(r.notes.join(' ')).toMatch(/doctor/);
  });
  it('a pick with an avoid for the person is never offered', () => {
    const concerns = [{ condition: 'x', label: 'x' }];
    const r = recommendWorkout(work({ concerns }), 70);
    // No research is tied to condition "x", so every move is unknown and nothing is offered.
    expect(r.pick).toBeNull();
    expect(r.notes.join(' ')).toMatch(/ask your doctor/i);
  });
});
