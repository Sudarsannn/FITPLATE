import { describe, expect, it } from '@jest/globals';

import { buildDish, buildIngredientIndex } from '../../services/data/buildItems';
import { declaredAllergens, parseDietTags, parseTagsLine, parseVariants, withoutDietTags } from '../../services/data/dietTags';
import { parseDishFile } from '../../services/data/dishImporter';
import { assignFamilies, cuisineTag, dishTags, familyKey, timeBand } from '../../services/data/tags';
import type { Dish, FastingLine } from '../../models/research';

// Shapes copied from FitPlate_Dishes_2026-10-12.md (PATCH 03 and 04 blocks).
const FACTS = `- Difficulty: Beginner.
- Servings: 1.

**Diet tags**
- Base diet: Vegetarian
- Jain: With changes — skip the fresh ginger (a root)
- Vegan: With changes — use 1 tbsp groundnut oil instead of ghee
- Pescatarian: Yes — vegetarian, so it fits
- No onion / no garlic (sattvik): Yes — no onion or garlic
- Gluten-free: With changes — use a hing labelled gluten-free
- Dairy-free: With changes — ghee is the only dairy
- Contains common allergens: dairy (ghee), tree nuts (cashew), gluten (only via compounded hing)

**Fasting suitability**
- Navratri / vrat: No — rice and dal
- Ekadashi: No — rice
- Jain: With changes — skip the fresh ginger
- Ramadan sehri / iftar: Yes — mild and filling
`;

const VARIANTS_NESTED = `1. **Roast the dal.** Dry-roast it.
    - Time: 3 min

**Diet variants**
- Jain: Variant.
  **Jain variant: Jain Ven Pongal (no ginger)**
  - Origin: FitPlate-created. No established recipe was found.
  - Swaps: ginger 5 g → leave out
- Vegan: Variant.
  **Vegan variant: Vegan Ven Pongal (groundnut oil)**
  - Origin: Established dish (Holy Cow Vegan).
- Dairy-free: Already fits — main recipe already dairy-free
- Jain-style sweet: Not appropriate — a different dish
`;

const VARIANTS_AFTER = `**Diet variants**
- **Jain:** Variant (below).
- **Dairy-free:** Already fits — no milk, butter or ghee.
- **Vegetarian:** Variant (below).

**Vegetarian variant: Veg Fried Rice (FitPlate dish 10)**
- Origin: Established dish (FitPlate dish 10).
- Swaps: chicken 100 g → leave out

**Jain variant: Jain Vegetable Fried Rice**
- Origin: Established dish (Tarla Dalal).
`;

describe('PATCH 03 diet tags block', () => {
  it('reads every line with its status', () => {
    const t = parseDietTags(FACTS)!;
    expect(t.base).toBe('Vegetarian');
    expect(t.jain.status).toBe('with-changes');
    expect(t.vegan).toEqual({ status: 'with-changes', reason: 'use 1 tbsp groundnut oil instead of ghee' });
    expect(t.pescatarian.status).toBe('yes');
    expect(t.sattvik.status).toBe('yes');
    expect(t.glutenFree.status).toBe('with-changes');
    expect(t.allergensDeclared).toEqual(['milk', 'treeNut', 'gluten']);
  });

  it('stops at the Fasting suitability block', () => {
    const t = parseDietTags(FACTS)!;
    expect(t.jain.reason).toBe('skip the fresh ginger (a root)');
  });

  it('is null for files before PATCH 03', () => {
    expect(parseDietTags('- Difficulty: Beginner.\n')).toBeNull();
  });

  it('removes the block so its lines are not read as prose claims', () => {
    const rest = withoutDietTags(FACTS);
    expect(rest).not.toMatch(/Vegan: With changes/);
    expect(rest).toMatch(/Fasting suitability/);
  });

  it('maps declared allergen words to FitPlate ids', () => {
    expect(declaredAllergens('None of the listed')).toEqual([]);
    expect(declaredAllergens('egg, soy (soy sauce), gluten (soy sauce)')).toEqual(['egg', 'soy', 'gluten']);
    expect(declaredAllergens('peanut (groundnut oil), mustard')).toEqual(['peanut', 'mustard']);
  });
});

describe('PATCH 04 tags line and variants', () => {
  it('splits research tags, variant categories and the description', () => {
    const head = `South Indian | Vegetarian | Breakfast
Tags: Vegetarian, Sattvik, Breakfast, South Indian (Tamil Nadu, Kerala), Has variants: Jain, Vegan, Lower-GI (millet)
A vegetarian, sattvik Tamil breakfast; Jain and vegan versions below.
`;
    const t = parseTagsLine(head)!;
    expect(t.researchTags).toEqual(['Vegetarian', 'Sattvik', 'Breakfast', 'South Indian (Tamil Nadu, Kerala)']);
    expect(t.variantCategories).toEqual(['Jain', 'Vegan', 'Lower-GI (millet)']);
    expect(t.description).toMatch(/^A vegetarian, sattvik/);
    expect(parseTagsLine('Maharashtrian | Veg | Breakfast\n')).toBeNull();
  });

  it('reads nested variants with names and origins', () => {
    const v = parseVariants(VARIANTS_NESTED);
    expect(v.map((x) => [x.category, x.status, x.origin])).toEqual([
      ['Jain', 'variant', 'fitplate-created'],
      ['Vegan', 'variant', 'established'],
      ['Dairy-free', 'already-fits', null],
      ['Jain-style sweet', 'not-appropriate', null],
    ]);
    expect(v[0].name).toBe('Jain Ven Pongal (no ginger)');
    expect(v[2].reason).toBe('main recipe already dairy-free');
  });

  it('reads summary-first variants and links to another FitPlate dish', () => {
    const v = parseVariants(VARIANTS_AFTER);
    const veg = v.find((x) => x.category === 'Vegetarian')!;
    expect(veg).toMatchObject({ status: 'variant', name: 'Veg Fried Rice', linkedDishNumber: 10, origin: 'established' });
    expect(v.find((x) => x.category === 'Jain')).toMatchObject({ name: 'Jain Vegetable Fried Rice', origin: 'established' });
    // "- Origin:" and "- Swaps:" lines at the left margin are detail, not categories.
    expect(v.map((x) => x.category).sort()).toEqual(['Dairy-free', 'Jain', 'Vegetarian']);
  });

  it('is empty when the block is missing', () => {
    expect(parseVariants('1. **Cook.** Cook it.')).toEqual([]);
  });
});

const NO: FastingLine = { status: 'no', reason: null };
const YES: FastingLine = { status: 'yes', reason: null };

function base(over: Partial<Dish> = {}): Parameters<typeof dishTags>[0] {
  return {
    dietType: 'veg',
    dietClaims: [],
    fasting: null,
    allergens: [],
    mealType: ['breakfast'],
    cuisine: 'Maharashtrian (Mumbai)',
    difficulty: 'Beginner',
    prepMin: 10,
    cookMin: 10,
    nutritionPerServing: { kcal: 390, proteinG: 8, carbsG: 60, fatG: 12, fibreG: 3 },
    dietTags: null,
    variants: [],
    ingredients: [],
    ...over,
  };
}

describe('tag engine', () => {
  it('tags diet, meal, cuisine, time and difficulty', () => {
    expect(dishTags(base()).tags).toEqual(['Veg', 'Breakfast', 'Maharashtrian', 'Under 30 min', 'Beginner']);
  });

  it('shows Vegan / Gluten-free only from kept claims, never from "nothing detected"', () => {
    expect(dishTags(base()).tags).not.toContain('Gluten-free');
    const t = dishTags(base({ dietClaims: ['vegan', 'glutenFree'] })).tags;
    expect(t).toContain('Vegan');
    expect(t).toContain('Gluten-free');
  });

  it('gives Jain only for a validated yes, and Jain option for with-changes or a variant', () => {
    const fasting = { navratri: NO, ekadashi: NO, ramadan: NO, jain: YES };
    expect(dishTags(base({ fasting })).tags).toContain('Jain');
    expect(dishTags(base({ fasting: { ...fasting, jain: { status: 'with-changes', reason: 'skip onion' } } })).tags).toContain('Jain option');
    // A Jain line the validator nulled gives nothing unless research has a Jain variant.
    expect(dishTags(base({ fasting: { ...fasting, jain: { status: null, reason: 'x' } } })).tags.filter((t) => t.startsWith('Jain'))).toEqual([]);
    const variant = { category: 'Jain', status: 'variant' as const, name: 'Jain Pav Bhaji', origin: 'established' as const, linkedDishNumber: null, reason: null };
    expect(dishTags(base({ variants: [variant] })).tags).toContain('Jain option');
  });

  it('marks fasting dishes', () => {
    const t = dishTags(base({ fasting: { navratri: YES, ekadashi: YES, jain: NO, ramadan: NO } })).tags;
    expect(t).toEqual(expect.arrayContaining(['Navratri / vrat', 'Ekadashi', 'Fasting-friendly']));
  });

  it('adds Contains chips from allergens', () => {
    expect(dishTags(base({ allergens: ['peanut', 'treeNut'] })).tags).toEqual(expect.arrayContaining(['Contains peanut', 'Contains tree nuts']));
  });

  it('uses the research thresholds for nutrition tags', () => {
    const t = dishTags(base({ nutritionPerServing: { kcal: 300, proteinG: 15, carbsG: 20, fatG: 5, fibreG: 6 } })).tags;
    expect(t).toEqual(expect.arrayContaining(['High protein', 'High fibre', 'Low calorie']));
    const u = dishTags(base({ nutritionPerServing: { kcal: 301, proteinG: 14.9, carbsG: 20, fatG: 5, fibreG: 5.9 } })).tags;
    expect(u).not.toEqual(expect.arrayContaining(['High protein']));
    expect(u).not.toContain('High fibre');
    expect(u).not.toContain('Low calorie');
  });

  it('checks researched sattvik and pescatarian lines against the recipe', () => {
    const lines = { base: 'Vegetarian', jain: NO, vegan: NO, glutenFree: NO, dairyFree: NO, allergensDeclared: null, sattvik: YES, pescatarian: YES };
    const ok = dishTags(base({ dietTags: lines, ingredients: [{ ingredientId: null, name: 'Rice', quantity: 50, unit: 'g', householdMeasure: null }] }));
    expect(ok.tags).toEqual(expect.arrayContaining(['No onion-garlic', 'Pescatarian']));
    const bad = dishTags(
      base({
        dietTags: lines,
        ingredients: [
          { ingredientId: null, name: 'Onion (kanda)', quantity: 30, unit: 'g', householdMeasure: null },
          { ingredientId: null, name: 'Chicken, curry cut', quantity: 100, unit: 'g', householdMeasure: null },
        ],
      }),
    );
    expect(bad.tags).not.toContain('No onion-garlic');
    expect(bad.tags).not.toContain('Pescatarian');
    expect(bad.review).toHaveLength(2);
  });

  it('time bands and cuisine', () => {
    expect(timeBand(5, 10)).toBe('Under 15 min');
    expect(timeBand(20, 25)).toBe('Under 60 min');
    expect(timeBand(30, 60)).toBeNull();
    expect(timeBand(null, null)).toBeNull();
    expect(cuisineTag('South Indian (Tamil Nadu; also Udupi)')).toBe('South Indian');
    expect(cuisineTag(null)).toBeNull();
  });
});

describe('variant families', () => {
  it('keys names that differ only by a version word', () => {
    expect(familyKey('Chicken Biryani')).toBe('biryani');
    expect(familyKey('Veg Biryani')).toBe('biryani');
    expect(familyKey('Jain Veg Biryani')).toBe('biryani');
    expect(familyKey('Masala Dosa')).not.toBe(familyKey('Rava Dosa'));
  });

  it('needs two dishes and uses research links', () => {
    const v = (n: number) => ({ category: 'Vegetarian', status: 'variant' as const, name: 'x', origin: null, linkedDishNumber: n, reason: null });
    const { familyOf, links } = assignFamilies([
      { id: '002-chicken-biryani', number: 2, name: 'Chicken Biryani', variants: [] },
      { id: '039-veg-biryani', number: 39, name: 'Veg Biryani', variants: [] },
      { id: '001-poha', number: 1, name: 'Poha', variants: [] },
      { id: '043-chicken-fried-rice', number: 43, name: 'Chicken Fried Rice', variants: [v(10)] },
      { id: '010-veg-fried-rice', number: 10, name: 'Veg Fried Rice', variants: [] },
    ]);
    expect(familyOf.get('039-veg-biryani')).toBe('biryani');
    expect(familyOf.has('001-poha')).toBe(false);
    expect(links.find((l) => l.familyId === 'fried-rice')).toMatchObject({ how: 'research-variant', dishIds: ['010-veg-fried-rice', '043-chicken-fried-rice'] });
  });
});

describe('dish importer with PATCH 03/04 blocks', () => {
  const FILE = `## 41. Pongal
South Indian | Vegetarian, Sattvik | Breakfast
Tags: Vegetarian, Sattvik, Breakfast, Has variants: Jain
A vegetarian, sattvik breakfast; a Jain version below.

### 1. Quick facts
${FACTS}
### 2. Ingredients (1 serving)
| Ingredient (standard name) | Quantity for 1 serving | Household measure |
|---|---|---|
| Raw rice | 50 g | ¼ cup |
| Ghee | 13 g | 1 tbsp |
| Ginger (adrak) | 5 g | 1 cm |
| Cashews (kaju) | 8 g | 6 |

### 3. Equipment
- Pressure cooker.

### 4. Micro-steps
${VARIANTS_NESTED}
### 5. Calories and nutrition (1 serving)
**Total: about 435 kcal | Protein 11.9 g | Carbs 55.5 g | Fat 17.4 g | Fibre 4.7 g**
`;
  const [v] = parseDishFile(FILE, 'FitPlate_Dishes_2026-10-12.md');

  it('keeps steps apart from the variants block', () => {
    expect(v.steps).toHaveLength(1);
    expect(v.variants).toHaveLength(4);
  });

  it('adds research-declared allergens the names miss (hing gluten)', () => {
    expect(v.allergens).toEqual(expect.arrayContaining(['milk', 'treeNut', 'gluten']));
  });

  it('does not read "Vegan: With changes" as a vegan claim', () => {
    expect(v.dietClaims).not.toContain('vegan');
  });

  it('builds a tagged dish', () => {
    const d = buildDish([v], '2026-10-15', buildIngredientIndex([]));
    expect(d.description).toMatch(/^A vegetarian/);
    expect(d.familyId).toBeNull();
    expect(d.tags).toEqual(expect.arrayContaining(['Veg', 'Jain option', 'Vegan option', 'No onion-garlic', 'Contains milk', 'Breakfast']));
    expect(d.tags).not.toContain('Gluten-free');
  });
});
