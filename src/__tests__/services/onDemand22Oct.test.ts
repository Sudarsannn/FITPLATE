import { describe, expect, it } from '@jest/globals';

import { getDish, researchDishes, researchExercises, researchNutrients } from '../../data/research';
import type { Dish } from '../../models/research';
import { measureHint } from '../../services/costToMake';
import { amountLabel, band, dayMacros, dayMicros, shortName } from '../../services/dayNutrition';
import { orderRange } from '../../services/dishLibrary';
import { bySection, doseLabel, exerciseKcal, kcalPer10, musclesLine, suggestedMinutes } from '../../services/fitness';

describe('dayNutrition', () => {
  it('bands fractions red under 50%, amber to 89%, green from 90%', () => {
    expect(band(0.2)).toBe('low');
    expect(band(0.5)).toBe('getting-there');
    expect(band(0.89)).toBe('getting-there');
    expect(band(0.9)).toBe('on-track');
    expect(band(1.4)).toBe('on-track');
  });

  it('adds carbs and fat only from research dishes, kcal and protein from every meal', () => {
    const dish = researchDishes.find((d) => d.nutritionPerServing.carbsG != null && d.nutritionPerServing.fatG != null)!;
    const m = dayMacros(
      [
        { dishId: dish.id, kcal: 300, protein: 10, fibre: 2 },
        { dishId: null, kcal: 200, protein: 5, fibre: 1 },
      ],
      getDish,
    );
    expect(m.kcal).toBe(500);
    expect(m.protein).toBe(15);
    expect(m.carbs).toBe(Math.round(dish.nutritionPerServing.carbsG!));
    expect(m.fat).toBe(Math.round(dish.nutritionPerServing.fatG!));
    expect(dayMacros([{ dishId: null, kcal: 1, protein: 1, fibre: 1 }], getDish).carbs).toBeNull();
  });

  it('sums micronutrients against researched targets, vitamins first, minerals without targets kept', () => {
    const dish = researchDishes.find((d) => d.microNutrientsEstimate?.values['vitamin-c'] != null && d.microNutrientsEstimate?.values.iron != null)!;
    const meals = [
      { dishId: dish.id, kcal: 0, protein: 0, fibre: 0 },
      { dishId: dish.id, kcal: 0, protein: 0, fibre: 0 },
    ];
    const bars = dayMicros(meals, getDish, researchNutrients, 'adult_female');
    const c = bars.find((b) => b.id === 'vitamin-c')!;
    expect(c.amount).toBeCloseTo(dish.microNutrientsEstimate!.values['vitamin-c']! * 2);
    expect(c.target).toBe(researchNutrients.find((n) => n.id === 'vitamin-c')!.appDefaultTarget!.adult_female);
    expect(c.kind).toBe('vitamin');
    const iron = bars.find((b) => b.id === 'iron')!;
    expect(iron.kind).toBe('mineral');
    expect(bars.findIndex((b) => b.kind === 'mineral')).toBeGreaterThan(bars.findIndex((b) => b.kind === 'vitamin'));
    expect(bars.some((b) => b.id === 'cholesterol')).toBe(false);
  });

  it('shortens nutrient names and formats amounts', () => {
    expect(shortName('Vitamin B12 (cobalamin; methylcobalamin)')).toBe('Vitamin B12');
    expect(shortName('Biotin (Vitamin B7)')).toBe('Biotin (B7)');
    expect(amountLabel(123.4, 'mg')).toBe('123 mg');
    expect(amountLabel(1.234, 'µg')).toBe('1.23 µg');
  });
});

describe('measureHint', () => {
  it('reads "about N g" for kg prices and counts for piece prices', () => {
    expect(measureHint(['2 tbsp (about 30 g)'], 'kg')).toEqual({ kind: 'mass', amount: 30 });
    expect(measureHint(['about 20–30 g'], 'kg')).toEqual({ kind: 'mass', amount: 25 });
    expect(measureHint(['juice from about ½ lemon'], 'piece')).toEqual({ kind: 'count', amount: 0.5 });
    expect(measureHint(['a handful'], 'kg')).toBeNull();
  });
});

describe('orderRange', () => {
  it('shows the researched range even when not confirmed, and says so', () => {
    const base = researchDishes.find((d) => d.orderPrice?.currentEstimate)!;
    const unconfirmed: Pick<Dish, 'orderPrice'> = { orderPrice: { ...base.orderPrice!, confirmed: false } };
    const r = orderRange(unconfirmed)!;
    expect(r.min).toBe(base.orderPrice!.currentEstimate!.min);
    expect(r.confirmed).toBe(false);
    expect(orderRange({ orderPrice: null })).toBeNull();
  });
});

describe('fitness helpers', () => {
  it('estimates kcal from MET and weight, 70 kg by default', () => {
    expect(exerciseKcal(3.5, 60)).toBe(245);
    expect(exerciseKcal(3.5, 60, 60)).toBe(210);
    expect(kcalPer10({ met: 6 }, 70)).toBe(70);
    expect(kcalPer10({ met: null }, 70)).toBeNull();
  });

  it('groups every research exercise into a section', () => {
    const groups = bySection(researchExercises);
    expect(groups.home.length + groups.yoga_stretch.length + groups.gym.length).toBe(researchExercises.filter((e) => e.section).length);
  });

  it('writes short dose lines from prescriptions', () => {
    expect(doseLabel({ level: 'beginner', goal: null, sets: 2, reps: '8-12 (wall, incline or knee version)', timeSec: null, restSec: 75, tempo: null, perWeek: 3 })).toBe('2 × 8-12 · rest 1 min 15 s');
    expect(doseLabel({ level: null, goal: null, sets: 1, reps: null, timeSec: 900, restSec: null, tempo: null, perWeek: null })).toBe('15 min');
    expect(doseLabel(null)).toBeNull();
    expect(suggestedMinutes({ searchTags: null, prescriptions: [] })).toBe(10);
    expect(musclesLine({ musclesPrimary: ['quadriceps (rectus femoris)', 'gluteus maximus', 'hamstrings'] })).toBe('Quadriceps, Gluteus maximus');
  });
});
