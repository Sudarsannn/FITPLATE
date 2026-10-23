/**
 * Day 6: the dish library's search, filter and sort settings, built on the
 * shared rules in search.ts and the tags from the tag engine (tags.ts).
 * Option lists for cuisine, meal type and difficulty come from the dishes
 * themselves, so the library grows with every import.
 */
import { featureFlags } from '../config/featureFlags';
import { getIngredient } from '../data/research';
import type { AllergenId, Dish } from '../models/research';
import { ALLERGEN_IDS } from '../models/research';
import { dishCostToMake, rupeesPer10gProtein, savingVsOrder } from './costToMake';
import { caloriesSaved } from './dishDetail';
import { ALLERGEN_LABELS } from './data/allergens';
import { cuisineTag, TAG } from './data/tags';
import type { FilterGroup, FilterOption, SearchDoc, SortOption } from './search';

export function totalMinutes(d: Pick<Dish, 'prepMin' | 'cookMin'>): number | null {
  if (d.prepMin == null && d.cookMin == null) return null;
  const t = (d.prepMin ?? 0) + (d.cookMin ?? 0);
  return t > 0 ? t : null;
}

/**
 * The order price to show, or null. Only an estimate that passed the price
 * checks (review 2026-10-15, fix 2) is a headline; the average is shown, never
 * the top of the range (SPEC-ADDENDA §8).
 */
export function headlineOrderPrice(d: Pick<Dish, 'orderPrice'>): { avg: number; min: number; max: number; observed: string | null } | null {
  const p = d.orderPrice;
  if (!p?.currentEstimate || p.confirmed === false) return null;
  return { ...p.currentEstimate, observed: p.lastObserved };
}

/**
 * Sudarsan (22 Oct 2026): always show the researched order price as a range
 * ("₹190–260 on Swiggy and Zomato"), averaged across the restaurants research
 * sampled, even when it rests on fewer listings than the headline checks
 * want. `confirmed` says whether it passed those checks, so the page can say
 * so in a note instead of hiding the price.
 */
export function orderRange(d: Pick<Dish, 'orderPrice'>): { min: number; max: number; avg: number; confirmed: boolean; listings: number | null; observed: string | null } | null {
  const p = d.orderPrice;
  if (!p?.currentEstimate) return null;
  return { ...p.currentEstimate, confirmed: p.confirmed !== false, listings: p.listingCount ?? null, observed: p.lastObserved };
}

/** "Based on 3 listings" under a price backed by fewer than 5 listings (review 2026-10-15, fix 2). */
export function orderPriceNote(d: Pick<Dish, 'orderPrice'>): string | null {
  const p = d.orderPrice;
  if (!p?.currentEstimate) return null;
  if (p.confirmed === false) return p.checkNotes?.length ? `Not shown: ${p.checkNotes[0]}` : null;
  if (p.listingCount != null && p.listingCount < 5) return `Based on ${p.listingCount} ${p.listingCount === 1 ? 'listing' : 'listings'}.`;
  return null;
}

export function dishDoc(d: Dish): SearchDoc {
  return {
    id: d.id,
    name: d.name,
    // Bracketed names in the title ("Chole (Chana Masala)") and the family ("biryani") are aliases.
    aliases: [...(d.familyId ? [d.familyId.replace(/-/g, ' ')] : []), ...(d.variants.map((v) => v.name).filter(Boolean) as string[])],
    tags: d.tags,
    extra: [...d.ingredients.map((i) => i.name), ...(d.cuisine ? [d.cuisine] : []), ...(d.description ? [d.description] : [])],
  };
}

/** Dish number order: the order research added them, a stable tie-break. */
export const byNumber = (a: Dish, b: Dish) => a.number - b.number;

const has = (d: Dish, ...tags: string[]) => tags.some((t) => d.tags.includes(t));

function unique(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
}

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIFFICULTY_ORDER = ['Beginner', 'Easy', 'Intermediate', 'Medium', 'Advanced', 'Hard'];
const ordered = (list: string[], order: string[]) =>
  [...list].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b));

const title = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const DIET_OPTIONS: FilterOption<Dish>[] = [
  { id: 'veg', label: 'Veg', test: (d) => d.dietType === 'veg' },
  { id: 'egg', label: 'Egg', test: (d) => d.dietType === 'egg' },
  { id: 'non-veg', label: 'Non-veg', test: (d) => d.dietType === 'non-veg' },
  // "Option" tags mean research found a version (a variant or "with changes"); the card says so.
  { id: 'jain', label: 'Jain', test: (d) => has(d, TAG.jain, TAG.jainOption) },
  { id: 'vegan', label: 'Vegan', test: (d) => has(d, TAG.vegan, TAG.veganOption) },
  { id: 'gluten-free', label: 'Gluten-free', test: (d) => has(d, TAG.glutenFree, TAG.glutenFreeOption) },
  { id: 'dairy-free', label: 'Dairy-free', test: (d) => has(d, TAG.dairyFree, TAG.dairyFreeOption) },
  { id: 'no-onion-garlic', label: 'No onion-garlic', test: (d) => has(d, TAG.sattvik) },
  // Vegetarian and egg dishes fit a pescatarian diet too; fish dishes carry the tag.
  { id: 'pescatarian', label: 'Pescatarian', test: (d) => d.dietType === 'veg' || d.dietType === 'egg' || has(d, TAG.pescatarian) },
  { id: 'fasting', label: 'Fasting', test: (d) => has(d, TAG.navratri, TAG.ekadashi, TAG.fastingFriendly) },
];

export const TIME_OPTIONS: FilterOption<Dish>[] = [15, 30, 60].map((m) => ({
  id: `under-${m}`,
  label: `Under ${m} min`,
  test: (d: Dish) => {
    const t = totalMinutes(d);
    return t != null && t <= m;
  },
}));

export const NUTRITION_OPTIONS: FilterOption<Dish>[] = [
  { id: 'high-protein', label: TAG.highProtein, test: (d) => has(d, TAG.highProtein) },
  { id: 'high-fibre', label: TAG.highFibre, test: (d) => has(d, TAG.highFibre) },
  { id: 'low-calorie', label: TAG.lowCalorie, test: (d) => has(d, TAG.lowCalorie) },
];

export const CALORIE_OPTIONS: FilterOption<Dish>[] = [
  { id: 'kcal-400', label: 'Under 400 kcal', test: (d) => d.nutritionPerServing.kcal != null && d.nutritionPerServing.kcal < 400 },
  { id: 'kcal-400-600', label: '400–600 kcal', test: (d) => d.nutritionPerServing.kcal != null && d.nutritionPerServing.kcal >= 400 && d.nutritionPerServing.kcal <= 600 },
  { id: 'kcal-600', label: 'Over 600 kcal', test: (d) => d.nutritionPerServing.kcal != null && d.nutritionPerServing.kcal > 600 },
];

/** The filter sheet's groups, in display order. Lists without any option in the data are left out. */
export function dishFilterGroups(dishes: readonly Dish[]): FilterGroup<Dish>[] {
  const meals = ordered(unique(dishes.flatMap((d) => d.mealType.map(title))), MEAL_ORDER);
  const cuisines = unique(dishes.map((d) => cuisineTag(d.cuisine)));
  const levels = ordered(unique(dishes.map((d) => d.difficulty)), DIFFICULTY_ORDER);
  const allergens = ALLERGEN_IDS.filter((a) => dishes.some((d) => d.allergens.includes(a)));
  const groups: FilterGroup<Dish>[] = [
    { id: 'diet', label: 'Diet', mode: 'any', options: DIET_OPTIONS },
    {
      id: 'allergen',
      label: 'Leave out dishes that contain',
      mode: 'exclude',
      options: allergens.map((a: AllergenId) => ({ id: a, label: ALLERGEN_LABELS[a], test: (d: Dish) => d.allergens.includes(a) })),
    },
    { id: 'meal', label: 'Meal', mode: 'any', options: meals.map((m) => ({ id: m.toLowerCase(), label: m, test: (d: Dish) => d.mealType.some((x) => title(x) === m) })) },
    { id: 'time', label: 'Time', mode: 'any', options: TIME_OPTIONS },
    { id: 'level', label: 'Difficulty', mode: 'any', options: levels.map((l) => ({ id: l.toLowerCase(), label: l, test: (d: Dish) => d.difficulty === l })) },
    { id: 'nutrition', label: 'Nutrition', mode: 'any', options: NUTRITION_OPTIONS },
    { id: 'kcal', label: 'Calories per serving', mode: 'any', options: CALORIE_OPTIONS },
    { id: 'cuisine', label: 'Cuisine', mode: 'any', options: cuisines.map((c) => ({ id: c.toLowerCase(), label: c, test: (d: Dish) => cuisineTag(d.cuisine) === c })) },
  ];
  return groups.filter((g) => g.options.length > 0);
}

export const DISH_SORTS: SortOption<Dish>[] = [
  { id: 'quickest', label: 'Quickest', value: totalMinutes, direction: 'asc' },
  { id: 'lowest-kcal', label: 'Lowest calories', value: (d) => d.nutritionPerServing.kcal, direction: 'asc' },
  { id: 'highest-protein', label: 'Highest protein', value: (d) => d.nutritionPerServing.proteinG, direction: 'desc' },
  { id: 'highest-fibre', label: 'Highest fibre', value: (d) => d.nutritionPerServing.fibreG, direction: 'desc' },
  { id: 'healthiness', label: 'Healthiness score', value: (d) => d.healthiness?.score ?? null, direction: 'desc' },
  { id: 'rating', label: 'Rating', value: (d) => d.researchRating?.score ?? null, direction: 'desc' },
  { id: 'fewest-ingredients', label: 'Fewest ingredients', value: (d) => (d.ingredients.length ? d.ingredients.length : null), direction: 'asc' },
  { id: 'order-price', label: 'Cheapest to order', value: (d) => orderRange(d)?.avg ?? null, direction: 'asc' },
  // Day 8: only dishes whose every ingredient is priced take part; the rest sort last.
  { id: 'make-cost', label: 'Cheapest to cook', value: (d) => completeMakeCost(d), direction: 'asc' },
  { id: 'most-saved', label: 'Most saved vs ordering', value: (d) => savingVsOrder(makeCost(d), orderRange(d))?.rupees ?? null, direction: 'desc' },
  ...(featureFlags.proteinPerRupee
    ? [{ id: 'protein-per-rupee', label: 'Protein per ₹', value: (d: Dish) => rupeesPer10gProtein(makeCost(d), d.nutritionPerServing.proteinG), direction: 'asc' as const }]
    : []),
  ...(featureFlags.calorieGapBadge ? [{ id: 'kcal-saved', label: 'Most kcal saved vs restaurant', value: (d: Dish) => caloriesSaved(d), direction: 'desc' as const }] : []),
];

/** Day 8: cost to make one serving from the bundled ingredient prices. */
export const makeCost = (d: Pick<Dish, 'ingredients'>) => dishCostToMake(d, getIngredient);

function completeMakeCost(d: Dish): number | null {
  const c = makeCost(d);
  return c?.complete ? c.avg : null;
}

/** Sorts named in SPEC-ADDENDA §9 that need data from a later day; shown greyed out with the reason. */
export const COMING_SORTS: { label: string; when: string }[] = [
  { label: 'Lowest sodium', when: 'dish sodium data' },
];

/** The few chips a card has room for: diet first, then "option" tags, then allergens. */
export function cardChips(d: Dish, max = 3): string[] {
  const diet = [TAG.veg, TAG.egg, TAG.nonVeg, TAG.vegan, TAG.jain, TAG.jainOption, TAG.veganOption, TAG.glutenFree, TAG.dairyFree, TAG.pescatarian, TAG.sattvik] as string[];
  const chips = d.tags.filter((t) => diet.includes(t));
  const allergens = d.tags.filter((t) => t.startsWith('Contains '));
  return [...chips, ...allergens].slice(0, max);
}
