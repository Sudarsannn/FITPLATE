import { describe, expect, it } from '@jest/globals';

import { allergensOf, checkClaims, dishAllergens, findClaims } from '../../services/data/allergens';
import { buildDish, buildIngredient, buildIngredientIndex, linkIngredient, NEUTRAL_OIL_ID, validateDish } from '../../services/data/buildItems';
import { parseDishFile, parseNutrition } from '../../services/data/dishImporter';
import { parseFasting, validateFasting } from '../../services/data/fasting';
import { normaliseId, parseIngredientFile } from '../../services/data/ingredientImporter';
import { minutes, rupeeRange, seconds, splitName, tableRows } from '../../services/data/markdown';
import { renderIndex } from '../../services/data/researchIndex';
import type { AllergenId } from '../../models/research';

// Fixtures copy the shapes of the real research files (dish 1 / 2 / 3 formats, dish 26 / 39 problems).
const DISH_FILE = `Cycle 1 | Dishes 1–2

# FitPlate daily dish research

## 1. Poha
Maharashtrian | Veg (naturally vegan and gluten-free) | Breakfast (also an evening snack)

### 1. Quick facts
- Difficulty: Beginner. One pan.
- Prep time: 10 min (chopping) / Cook time: 8–10 min / Total time: about 20 min
- Servings: 1.

**Fasting suitability**
- Navratri / vrat: No — poha is rice.
- Ekadashi: No — rice.
- Jain: With changes — skip the onion; use more peanuts.
- Ramadan sehri / iftar: Yes — light and filling.

### 2. Ingredients (1 serving)
| Ingredient (standard name) | Quantity for 1 serving | Household measure | What it looks like | Pantry staple? |
|---|---|---|---|---|
| Flattened rice, thick (poha) | 60 g | ¾ cup | Flakes | Y |
| Peanuts (moongphali), raw | 10 g | 1 tbsp | – | Y |
| Onion (kanda/pyaz) | 60 g | ½ medium onion | – | Y |
| Asafoetida (hing) | 0.1 g | a pinch | – | Y |

### 3. Equipment
- Kadai or wide frying pan with a lid. No lid? Use a plate.
- Colander

### 4. Micro-steps
1. **Rinse the poha.** Hold the colander under running water.
   - Time: 20–30 sec (no longer)
   - Visual cue: Every flake looks wet.
   - Camera check: The wet poha
   - Video shot: Water running over the poha.
   - Beginner tip: Do **not** soak it.
2. **Fry the peanuts.** Add the peanuts.
   - Time: 1.5–2 min

### 5. Calories and nutrition (1 serving)
**Total: about 390 kcal | Protein 7.9 g | Carbs 57.6 g | Fat 15.2 g | Fibre 3.2 g (all est.)**

| Ingredient | Qty | kcal | Protein (g) | Carbs (g) | Fat (g) | Fibre (g) | Basis |
|---|---|---|---|---|---|---|---|
| Poha | 60 g | 207.6 | 3.96 | 46.38 | 0.72 | 0.72 | IFCT |

### 6. Cost to order (1 serving)
- **Price range (1 serving): ₹120–150.** All 6 typical prices span ₹35–150 (average ₹87), which is more than 30%: two groups.
- **Average (1 serving): about ₹130** for the main group.

### 7. Healthiness score (out of 10)
- **Home-cooked: 7/10 | Typical restaurant: 5.5/10 (est.)**
- Reason: little oil, no deep frying.

### 8. Rating (based on our research)
- **Rating: 4.5 / 5**
- Reason: one of India's most-loved breakfasts.

### 10. After the meal
- **Storage:** Fridge for up to 1 day.
- **Leftover remix: Poha cutlets.** Mash and fry.
- **Burn it off (about 390 kcal):** about 5.6 km of running.

### 12. Sources
- Veg Recipes of India, Poha: https://www.vegrecipesofindia.com/kanda-poha-or-onion-poha/
- Not a link

---

## 2. Veg Biryani
Mughlai | Veg | Lunch / dinner

### 1. Quick facts
- Difficulty: Intermediate.
- Prep time / Cook time / Total time: 20 min / 1 hr 10 min / 1 hr 30 min
- Servings: 1

**Fasting suitability**
- Navratri / vrat: Yes — fine.
- Ekadashi: No — rice.
- Jain: With changes — skip onion, garlic, fried onions, potato and carrot; use cauliflower and peas, with hing and ginger for flavour.
- Ramadan sehri / iftar: Yes — filling.

### 2. Ingredients (1 serving)
| Ingredient | Quantity | Household measure |
|---|---|---|
| Basmati rice | 75 g | ⅓ cup |
| Ginger-garlic paste | 5 g | 1 tsp |
| Curd (dahi) | 50 g | 3 tbsp |

### 4. Micro-steps
1. **Soak the rice.** Rinse and soak.
   - Time: 20 min

### 5. Calories and nutrition (1 serving)
| Nutrient | Amount (est.) |
|---|---|
| Calories | ~540 kcal (est.) |
| Protein | ~12 g (est.) |
| Carbohydrates | ~80 g (est.) |
| Fat | ~18 g (est.) |
| Fibre | ~6 g (est.) |

### 6. Cost to order (1 serving)
- **Price range (1 serving): ₹200–₹260. Average: ~₹230.**

### 7. Healthiness score (out of 10)
- **Home-cooked version: 6/10 (est.)**
`;

const INGREDIENT_FILE = `Based on: FitPlate_Dishes_2026-10-04.md

# FitPlate ingredient price library

## Summary

| Ingredient | Category | Standard unit | Price range (Mumbai) | Average | Per 100 g/ml (range) | Sources checked | Confidence (High/Medium/Low) |
|---|---|---|---|---|---|---|---|
| Onion (kanda/pyaz) | Vegetable | per kg | ₹45–60/kg | ₹55/kg | ₹4.5–6.0 | 3 | Medium |
| Lemon (nimbu) | Fruit (citrus) | per piece (and per kg) | ₹4–6 per lemon (≈₹96/kg) | ₹5 per lemon | ≈₹9.6 | 2 | Low |
| Mutton (goat meat), bone-in curry cut | Meat/seafood | per kg | ₹885–945/kg | ₹915/kg | ₹88.5–94.5 | 2 | Low |

## Onion (kanda / pyaz)

### 1. Basics
- **Category:** Vegetable

### 4. Storage
- Whole: room temperature in a basket for 3–4 weeks.

### 5. Substitutes
- **Shallots (small/sambar onion):** same flavour.
- Spring onion: milder.

### 6. Nutrition per 100 g (est.)
- About 40 kcal, 1.1 g protein, 9.3 g carbs, 0.1 g fat, 1.7 g fibre (USDA FDC).

## Mutton (goat meat), bone-in curry cut

\`\`\`json
{
  "schema": "fitplate.ingredient.v1",
  "id": "mutton_curry_cut",
  "name": "Mutton (goat meat), bone-in curry cut",
  "nutrition": {
    "basis": "per_100g",
    "energy_kcal": 109,
    "protein_g": 20.6,
    "carbohydrate_g": null,
    "iron_mg": 2.8,
    "source": "USDA FDC",
    "source_ref": "FDC 175303",
    "confidence": "Medium"
  }
}
\`\`\`
`;

describe('markdown helpers', () => {
  it('reads durations and timers', () => {
    expect(minutes('about 1 hr 40 min (incl. marination)')).toBe(100);
    expect(minutes('8–10 min')).toBe(8);
    expect(minutes('no time here')).toBeNull();
    expect(seconds('20–30 sec (no longer)')).toBe(20);
    expect(seconds('1.5–2 min')).toBe(90);
  });

  it('splits Indian names out of the English name wherever they sit', () => {
    expect(splitName('Peanuts (moongphali), raw')).toEqual({ english: 'Peanuts, raw', aliases: ['moongphali'] });
    expect(splitName('Onion (kanda/pyaz)')).toEqual({ english: 'Onion', aliases: ['kanda', 'pyaz'] });
  });

  it('parses rupee ranges with commas and an optional second ₹', () => {
    expect(rupeeRange('₹1,030–1,180/kg')).toEqual({ min: 1030, max: 1180 });
    expect(rupeeRange('₹280–₹380')).toEqual({ min: 280, max: 380 });
    expect(rupeeRange('₹380–₹280')).toBeNull();
  });

  it('drops header and divider rows from tables', () => {
    expect(tableRows('| A | B |\n|---|---|\n| 1 | 2 |')).toEqual([['1', '2']]);
  });
});

describe('dish importer', () => {
  const [poha, biryani] = parseDishFile(DISH_FILE, 'FitPlate_Dishes_2026-10-04.md');

  it('reads header, quick facts, steps and the three scores', () => {
    expect(poha.id).toBe('001-poha');
    expect(poha.date).toBe('2026-10-04');
    expect(poha.dietType).toBe('veg');
    expect(poha.mealType).toEqual(['breakfast']);
    expect([poha.prepMin, poha.cookMin, poha.totalMin]).toEqual([10, 8, 20]);
    expect(poha.difficulty).toBe('Beginner');
    expect(poha.steps).toHaveLength(2);
    expect(poha.steps[0]).toMatchObject({ n: 1, title: 'Rinse the poha', timerSec: 20, tip: 'Do not soak it.', visualCue: 'Every flake looks wet.' });
    expect(poha.healthiness).toEqual({ score: 7, restaurantScore: 5.5, reasons: ['little oil, no deep frying.'] });
    expect(poha.researchRating?.score).toBe(4.5);
    expect(poha.equipment).toEqual(['Kadai or wide frying pan with a lid', 'Colander']);
    expect(poha.sources).toEqual(['Veg Recipes of India, Poha: https://www.vegrecipesofindia.com/kanda-poha-or-onion-poha/']);
    expect(poha.leftoverRemix).toBe('Poha cutlets. Mash and fry.');
    expect(biryani.prepMin).toBe(20);
    expect(biryani.cookMin).toBe(70);
  });

  it('takes the average of the range, not of the full spread', () => {
    expect(poha.orderPrice).toMatchObject({ min: 120, max: 150, avg: 130 });
    expect(biryani.orderPrice).toMatchObject({ min: 200, max: 260, avg: 230 });
  });

  it('reads all three nutrition formats', () => {
    expect(poha.nutrition).toEqual({ kcal: 390, proteinG: 7.9, carbsG: 57.6, fatG: 15.2, fibreG: 3.2 });
    expect(biryani.nutrition).toEqual({ kcal: 540, proteinG: 12, carbsG: 80, fatG: 18, fibreG: 6 });
    expect(parseNutrition('- Calories: about 660 kcal (est.)\n- Protein: about 38 g (est.)\n- Carbs: about 74 g\n- Fat: about 23 g\n- Fibre: about 5 g')).toEqual({
      kcal: 660,
      proteinG: 38,
      carbsG: 74,
      fatG: 23,
      fibreG: 5,
    });
  });

  it('has no as-ordered block or fasting data unless the file has one', () => {
    expect(poha.asOrdered).toBeNull();
    expect(poha.fasting?.ramadan).toEqual({ status: 'yes', reason: 'light and filling.' });
  });

  it('FIX 1: tags allergens and drops a gluten-free claim the recipe contradicts (dish 26 case)', () => {
    expect(poha.allergens).toEqual(['peanut', 'gluten']);
    expect(poha.dietClaims).toEqual(['vegan']);
    expect(poha.needsReview).toContain('dropped "glutenFree" claim: recipe has gluten');
    expect(poha.notes).toContain('hing: compounded hing usually contains wheat flour');
  });

  it('FIX 2: nulls a Jain line that keeps ginger and a Navratri "yes" with rice and garlic (dish 39 case)', () => {
    expect(biryani.fasting?.jain.status).toBeNull();
    expect(biryani.fasting?.jain.reason).toContain('skip onion');
    expect(biryani.fasting?.navratri.status).toBeNull();
    expect(biryani.needsReview.join(' | ')).toMatch(/Jain "with-changes" but the recipe keeps fresh ginger/);
    expect(biryani.needsReview.join(' | ')).toMatch(/Navratri "yes" but the recipe has grain, garlic/);
    expect(biryani.fasting?.ekadashi.status).toBe('no');
    // Poha's Jain line skips the onion it uses, so it stands.
    expect(poha.fasting?.jain.status).toBe('with-changes');
  });
});

describe('allergen map', () => {
  it.each<[string, AllergenId[]]>([
    ['Peanuts (moongphali), raw', ['peanut']],
    ['Cashew nuts (kaju)', ['treeNut']],
    ['Ghee', ['milk']],
    ['Coconut milk', []],
    ['Egg, whole', ['egg']],
    ['Eggplant (baingan)', []],
    ['Prawns (kolambi)', ['shellfish']],
    ['Surmai (seer fish)', ['fish']],
    ['Asafoetida (hing, compounded)', ['gluten']],
    ['Gluten-free hing', []],
    ['Rolled oats', ['gluten']],
    ['Semolina (rava/sooji)', ['gluten']],
    ['Idli rava', []],
    ['Soy sauce', ['gluten', 'soy']],
    ['Sesame oil (gingelly)', ['sesame']],
    ['Mustard seeds (rai)', ['mustard']],
    ['Lentils (masoor)', []],
    ['Curd (dahi)', ['milk']],
  ])('%s → %j', (name, expected) => {
    expect(allergensOf({ name })).toEqual(expected);
  });

  it('also reads the canonical id', () => {
    expect(allergensOf({ ingredientId: 'peanuts-raw', name: 'Shengdana' })).toEqual(['peanut']);
  });

  it('unions a dish and keeps a fixed order', () => {
    expect(dishAllergens([{ name: 'Mustard seeds' }, { name: 'Paneer' }, { name: 'Peanuts' }])).toEqual(['peanut', 'milk', 'mustard']);
  });

  it('ignores conditional and negated claims', () => {
    expect(findClaims(['Veg (vegan if made with peanut oil instead of ghee)'])).toEqual([]);
    expect(findClaims(['Veg (contains dairy; not vegan)'])).toEqual([]);
    expect(findClaims(['Groundnut oil makes the dish vegan.'])).toEqual([]);
    expect(findClaims(['Veg (naturally vegan and gluten-free)'])).toEqual(['vegan', 'glutenFree']);
  });

  it('drops vegan for milk and for non-veg dishes', () => {
    expect(checkClaims(['vegan', 'dairyFree'], ['milk'], 'veg').kept).toEqual([]);
    expect(checkClaims(['vegan'], [], 'non-veg').dropped).toEqual([{ claim: 'vegan', because: ['non-veg'] }]);
    expect(checkClaims(['glutenFree'], ['milk'], 'veg').kept).toEqual(['glutenFree']);
  });
});

describe('fasting', () => {
  it('returns null when the block is missing', () => {
    expect(parseFasting('- Difficulty: Beginner')).toBeNull();
  });

  it('accepts dry ginger and a skip that names every excluded ingredient', () => {
    const f = parseFasting('**Fasting suitability**\n- Jain: With changes — skip the onion and fresh ginger (root vegetables) and use dry ginger powder (sonth)');
    const check = validateFasting(f, ['Onion', 'Ginger, fresh', 'Dry ginger powder (sonth)']);
    expect(check.issues).toEqual([]);
    expect(check.fasting?.jain.status).toBe('with-changes');
  });

  it('flags a Navratri "with changes" line that never says to skip the rice', () => {
    const f = parseFasting('**Fasting suitability**\n- Navratri / vrat: With changes — use sendha namak.');
    const check = validateFasting(f, ['Basmati rice', 'Tomato']);
    expect(check.fasting?.navratri.status).toBeNull();
  });

  it('lets fasting flours through', () => {
    const f = parseFasting('**Fasting suitability**\n- Navratri / vrat: Yes — standard upvas food.');
    expect(validateFasting(f, ['Sabudana (sago pearls)', 'Samak rice (vrat ke chawal)', 'Peanuts']).issues).toEqual([]);
  });
});

describe('ingredient importer', () => {
  const { items, errors } = parseIngredientFile(INGREDIENT_FILE, 'FitPlate_Ingredients_2026-10-08.md');
  const onion = items.find((i) => i.id === 'onion')!;
  const lemon = items.find((i) => i.id === 'lemon')!;
  const mutton = items.find((i) => i.id === 'mutton-bone-in-curry-cut')!;

  it('reads the summary row and the detail section', () => {
    expect(errors).toEqual([]);
    expect(onion).toMatchObject({ name: 'Onion', aliases: ['kanda', 'pyaz'], standardUnit: 'kg', price: { min: 45, max: 60, avg: 55 }, confidence: 'Medium', sourcesChecked: 3 });
    expect(onion.storage).toBe('Whole: room temperature in a basket for 3–4 weeks.');
    expect(onion.substitutes).toEqual(['Shallots (small/sambar onion)', 'Spring onion']);
    expect(onion.macrosPer100).toEqual({ kcal: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1, fibreG: 1.7 });
    expect(onion.nutritionPer100g).toBeNull();
  });

  it('handles per-piece units', () => {
    expect(lemon.standardUnit).toBe('piece');
    expect(lemon.price).toMatchObject({ min: 4, max: 6, avg: 5 });
  });

  it('reads the JSON nutrient profile; missing values stay null, never estimated', () => {
    expect(normaliseId('mutton_curry_cut')).toBe('mutton-curry-cut');
    expect(mutton.nutritionPer100g?.energyKcal).toEqual({ value: 109, source: 'USDA FDC: FDC 175303', confidence: 'Medium' });
    expect(mutton.nutritionPer100g?.carbsG).toEqual({ value: null, source: null, confidence: null });
    expect(mutton.nutritionPer100g?.basis).toBe('100g');
  });

  it('builds one ingredient from two versions through the price engine', () => {
    const later = { ...onion, date: '2026-10-24', file: 'FitPlate_Ingredients_2026-10-24.md', price: { ...onion.price!, min: 60, max: 75, avg: 68, statedAvg: 68 }, substitutes: ['Leeks'] };
    const built = buildIngredient([later, onion], '2026-10-25');
    expect(built.versions.map((v) => v.date)).toEqual(['2026-10-08', '2026-10-24']);
    expect(built.price?.priceHistory).toHaveLength(2);
    expect(built.price?.lastObserved).toBe('2026-10-24');
    expect(built.price?.method).not.toBe('single');
    expect(built.seasonal).toBe(true);
    expect(built.substitutes).toEqual(['Shallots (small/sambar onion)', 'Spring onion', 'Leeks']);
    expect(built.per100Estimate?.avg).toBeCloseTo((built.price?.currentEstimate?.avg ?? 0) / 10, 5);
  });
});

describe('building dishes', () => {
  const [poha] = parseDishFile(DISH_FILE, 'FitPlate_Dishes_2026-10-04.md');
  const { items } = parseIngredientFile(INGREDIENT_FILE, 'FitPlate_Ingredients_2026-10-08.md');
  const index = buildIngredientIndex(items.map((i) => buildIngredient([i], '2026-10-11')));

  it('links dish lines to canonical ingredient ids, leaving unknowns null', () => {
    expect(linkIngredient('Onion (kanda/pyaz)', index)).toBe('onion');
    expect(linkIngredient('Lemon (nimbu) juice', index)).toBe('lemon');
    expect(linkIngredient('Pyaz', index)).toBe('onion');
    expect(linkIngredient('Saffron', index)).toBeNull();
  });

  it('Day 8: links whole-name ids, neutral cooking oil and a unique name head, but not other fats', () => {
    const small = buildIngredientIndex([
      { id: 'chicken-curry-cut-bone-in-skinless', name: 'Chicken, curry cut, bone-in, skinless', aliases: [] },
      { id: 'chicken-thigh-boneless', name: 'Chicken thigh, boneless', aliases: [] },
      { id: NEUTRAL_OIL_ID, name: 'Cooking oil, refined sunflower / groundnut', aliases: ['tel'] },
      { id: 'mustard-oil', name: 'Mustard oil', aliases: [] },
      { id: 'tamarind-seedless-block', name: 'Tamarind, seedless block', aliases: ['imli'] },
      { id: 'tamarind-date-chutney', name: 'Tamarind-date chutney, ready-made', aliases: ['imli'] },
      { id: 'sugar', name: 'Sugar', aliases: [] },
    ]);
    expect(linkIngredient('Chicken (curry cut, bone-in, skinless)', small)).toBe('chicken-curry-cut-bone-in-skinless');
    expect(linkIngredient('Groundnut oil (or any neutral cooking oil)', small)).toBe(NEUTRAL_OIL_ID);
    expect(linkIngredient('Vegetable oil (for searing)', small)).toBe(NEUTRAL_OIL_ID);
    expect(linkIngredient('Mustard oil (sarson ka tel), or any cooking oil', small)).toBe('mustard-oil');
    expect(linkIngredient('Oil or ghee for roasting', small)).toBeNull();
    expect(linkIngredient('Boiled potato', small)).toBeNull();
    // "imli" is claimed by two items, but only one is plainly "Tamarind" before its comma.
    expect(linkIngredient('Tamarind (imli)', small)).toBe('tamarind-seedless-block');
    expect(linkIngredient('Chicken', small)).toBeNull();
  });

  it('produces a valid Dish with an order price estimate', () => {
    const dish = buildDish([poha], '2026-10-11', index);
    expect(validateDish(dish)).toEqual([]);
    expect(dish.servings).toBe(1);
    expect(dish.orderPrice?.currentEstimate).toEqual({ min: 120, max: 150, avg: 130 });
    expect(dish.ingredients.find((i) => i.name.startsWith('Onion'))?.ingredientId).toBe('onion');
    expect(dish.microNutrientsEstimate).toBeNull();
  });
});

describe('generated index', () => {
  it('imports each item statically', () => {
    const out = renderIndex('Dish', ['001-poha']);
    expect(out).toContain("import item_001_poha from './001-poha.json';");
    expect(out).toContain('item_001_poha as unknown as Dish,');
  });
});
