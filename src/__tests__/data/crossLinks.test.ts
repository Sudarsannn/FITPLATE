import { describe, expect, it } from '@jest/globals';

import {
  buildAliasMap,
  buildMicroTable,
  dishKcalFromIngredients,
  dishMicros,
  goodSourceLinks,
  indexWithAliases,
  linkStats,
  usedInMismatches,
} from '../../services/data/crossLinks';
import { linkIngredient } from '../../services/data/buildItems';
import { parseUsedIn } from '../../services/data/ingredientImporter';
import type { DishIngredient, NutrientPer100, SourcedValue } from '../../models/research';

const line = (name: string, quantity: number | null, unit: string | null, ingredientId: string | null = null): DishIngredient => ({ ingredientId, name, quantity, unit, householdMeasure: null });

const sv = (value: number | null): SourcedValue => ({ value, source: value == null ? null : 'IFCT 2017', confidence: value == null ? null : 'High' });
function profile(over: Partial<Record<keyof Omit<NutrientPer100, 'basis'>, number>>): NutrientPer100 {
  const keys = ['energyKcal', 'proteinG', 'carbsG', 'sugarsG', 'fatG', 'saturatedFatG', 'fibreG', 'sodiumMg', 'ironMg', 'calciumMg', 'potassiumMg', 'magnesiumMg', 'zincMg', 'vitaminCMg', 'vitaminAUgRae', 'folateUgDfe', 'waterG', 'cholesterolMg', 'transFatG', 'mufaG', 'pufaG', 'omega3G', 'addedSugarsG', 'phosphorusMg', 'seleniumUg', 'copperMg', 'manganeseMg', 'iodineUg', 'vitaminDUg', 'vitaminEMg', 'vitaminKUg', 'thiaminMg', 'riboflavinMg', 'niacinMg', 'vitaminB6Mg', 'vitaminB12Ug'] as const;
  const out = { basis: '100g' } as NutrientPer100;
  for (const k of keys) out[k] = sv(over[k] ?? null);
  return out;
}

const INGREDIENTS = [
  { id: 'cumin-seeds', name: 'Cumin seeds', aliases: [] as string[] },
  { id: 'spinach', name: 'Spinach', aliases: ['palak'] },
  { id: 'chawal-a', name: 'Rice A', aliases: ['chawal'] },
  { id: 'chawal-b', name: 'Rice B', aliases: ['chawal'] },
];

describe('F1 alias map', () => {
  it('learns Indian names from dish lines that link by English name', () => {
    const { aliases, learned, ambiguous } = buildAliasMap(INGREDIENTS, [{ ingredients: [line('Cumin seeds (jeera)', 1, 'g')] }]);
    expect(aliases.jeera).toBe('cumin-seeds');
    expect(aliases.palak).toBe('spinach');
    expect(learned).toEqual([{ alias: 'jeera', id: 'cumin-seeds' }]);
    expect(ambiguous).toEqual(['chawal (chawal-a, chawal-b)']);
    expect(aliases.chawal).toBeUndefined();
  });

  it('never learns from a line that only matched by prefix or alias', () => {
    const { learned } = buildAliasMap(INGREDIENTS, [{ ingredients: [line('Palak leaves (saag)', 100, 'g')] }]);
    expect(learned).toEqual([]);
  });

  it('the learned aliases link new lines', () => {
    const { aliases } = buildAliasMap(INGREDIENTS, [{ ingredients: [line('Cumin seeds (jeera)', 1, 'g')] }]);
    const index = indexWithAliases(INGREDIENTS, aliases);
    expect(linkIngredient('Jeera', index)).toBe('cumin-seeds');
    expect(linkIngredient('Unknown spice', index)).toBeNull();
  });

  it('counts linked and priced lines and lists the rest', () => {
    const s = linkStats(
      [{ id: '001-x', ingredients: [line('Spinach', 100, 'g', 'spinach'), line('Cumin', 1, 'g', 'cumin-seeds'), line('Mystery', 5, 'g')] }],
      [{ id: 'spinach', price: { currentEstimate: { min: 1, max: 2, avg: 1.5 } } as never }, { id: 'cumin-seeds', price: null }],
    );
    expect(s).toMatchObject({ lines: 3, linked: 2, priced: 1, unmatched: [{ dishId: '001-x', name: 'Mystery' }] });
  });
});

describe('F3 micronutrient table and dish estimate', () => {
  const ings = [
    { id: 'spinach', nutritionPer100g: profile({ ironMg: 2.7, vitaminAUgRae: 469, energyKcal: 23 }) },
    { id: 'cumin-seeds', nutritionPer100g: null },
  ];
  const index = indexWithAliases(INGREDIENTS, {});

  it('prefers the ingredient profile and fills gaps from nutrient food sources', () => {
    const { table, fromNutrientStream, unmatchedFoods } = buildMicroTable(
      ings,
      [
        { id: 'vitamin-a', unit: 'µg', topFoodSources: [{ food: 'Spinach (palak)', per100g: 434 }, { food: 'Goat liver', per100g: 15655 }] },
        { id: 'vitamin-c', unit: 'mg', topFoodSources: [{ food: 'Spinach', per100g: 28 }, { food: 'Amla', per100g: null }] },
      ],
      index,
    );
    expect(table.spinach.iron).toMatchObject({ per100: 2.7, unit: 'mg' });
    expect(table.spinach['vitamin-a'].per100).toBe(469); // the profile wins over the food-source table
    expect(table.spinach['vitamin-c']).toMatchObject({ per100: 28, source: 'nutrient research (vitamin-c food sources)' });
    expect(fromNutrientStream).toBe(1);
    expect(unmatchedFoods).toEqual(['Goat liver']);
  });

  it('scales by grams and reports weight coverage', () => {
    const { table } = buildMicroTable(ings, [], index);
    const est = dishMicros({ ingredients: [line('Spinach', 200, 'g', 'spinach'), line('Paneer', 200, 'g', 'paneer'), line('Salt', 1, 'tsp')] }, table)!;
    expect(est.values.iron).toBe(5.4);
    expect(est.coveragePct).toBe(50);
    expect(est.basis).toMatch(/partial/);
    expect(dishMicros({ ingredients: [line('Paneer', 100, 'g', 'paneer')] }, table)).toBeNull();
  });

  it('computes kcal from ingredients for the 25% comparison', () => {
    const map = new Map(ings.map((i) => [i.id, i]));
    expect(dishKcalFromIngredients({ ingredients: [line('Spinach', 0.2, 'kg', 'spinach')] }, map)).toEqual({ kcal: 46, coveragePct: 100 });
    expect(dishKcalFromIngredients({ ingredients: [line('Cumin', 1, 'g', 'cumin-seeds')] }, map)).toBeNull();
  });
});

describe('F4 good-source dishes and F7 used-in check', () => {
  it('links nutrient good-source dishes to bundled dish ids both ways', () => {
    const { byNutrient, byDish } = goodSourceLinks(
      [{ id: 'vitamin-a', goodSourceDishes: [{ dishNumber: 9, dishName: 'Idli with Sambar' }, { dishNumber: 96, dishName: 'Gajar Halwa' }] }],
      [{ id: '009-idli-with-sambar', number: 9 }],
    );
    expect(byNutrient['vitamin-a']).toEqual([
      { dishNumber: 9, dishName: 'Idli with Sambar', dishId: '009-idli-with-sambar' },
      { dishNumber: 96, dishName: 'Gajar Halwa', dishId: null },
    ]);
    expect(byDish).toEqual({ '009-idli-with-sambar': ['vitamin-a'] });
  });

  it('parses both "Used in" layouts', () => {
    expect(parseUsedIn('- 6 Upma: 20 g (2 tbsp, finely diced)\n- Dish 1, Poha: 60 g (thick)\n- 4 Masala Dosa: a pinch\n')).toEqual([
      { dishNumber: 6, quantity: 20, unit: 'g', raw: '20 g (2 tbsp, finely diced)' },
      { dishNumber: 1, quantity: 60, unit: 'g', raw: '60 g (thick)' },
      { dishNumber: 4, quantity: null, unit: null, raw: 'a pinch' },
    ]);
  });

  it('flags quantities more than 15% apart', () => {
    const dishes = [{ number: 6, ingredients: [line('Carrot', 20, 'g', 'carrot')] }, { number: 9, ingredients: [line('Carrot', 25, 'g', 'carrot')] }];
    const out = usedInMismatches(
      [{ id: 'carrot', usedIn: [{ dishNumber: 6, quantity: 22, unit: 'g', raw: '' }, { dishNumber: 9, quantity: 40, unit: 'g', raw: '' }, { dishNumber: 99, quantity: 10, unit: 'g', raw: '' }] }],
      dishes,
    );
    expect(out).toEqual([{ ingredientId: 'carrot', dishNumber: 9, ingredientFile: '40 g', dishTable: '25 g' }]);
  });
});
