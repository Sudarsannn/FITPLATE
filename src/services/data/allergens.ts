/**
 * Ingredient → allergen map (supervisor review 2026-10-11, FIX 1).
 *
 * Research files have no allergen field, so the dish importer derives one
 * from each ingredient's canonical id and its written name. The rules lean
 * safe: when an ingredient often contains an allergen (compounded hing has
 * wheat flour, soy sauce has wheat), it is tagged. An empty list means
 * "none detected", never "allergen-free"; the app always adds
 * "Check labels if you have an allergy".
 */
import type { AllergenId, DietClaim } from '../../models/research';

type Rule = { allergen: AllergenId; match: RegExp; unless?: RegExp; note?: string };

const RULES: Rule[] = [
  { allergen: 'peanut', match: /\b(peanuts?|groundnuts?|moong ?phali|mungfali|shengdana)\b/i },
  {
    allergen: 'treeNut',
    match: /\b(cashews?|kaju|almonds?|badam|pistachios?|pista|walnuts?|akhrot|hazelnuts?|pecans?|macadamia|pine nuts?|chironji|charoli)\b/i,
  },
  {
    allergen: 'milk',
    match: /\b(milk|curd|dahi|yog(h)?urt|paneer|ghee|butter|cream|malai|cheese|kho(y)?a|mawa|chaas|lassi|whey|condensed|rabri)\b/i,
    unless: /\b(coconut milk|coconut cream|almond milk|soy(a)? milk|oat milk|peanut butter|cocoa butter)\b/i,
  },
  { allergen: 'egg', match: /\b(eggs?|anda|ande)\b/i, unless: /\beggplant\b/i },
  {
    allergen: 'fish',
    match: /\b(fish|machh?(li|i)|rohu|katla|pomfret|surmai|bangda|mackerel|salmon|tuna|sardines?|anchov(y|ies)|hilsa|basa|bombil|tilapia|seer)\b/i,
  },
  { allergen: 'shellfish', match: /\b(prawns?|shrimps?|jhinga|kolambi|crabs?|lobsters?|clams?|mussels?|oysters?|squid|scallops?)\b/i },
  {
    allergen: 'gluten',
    match:
      /\b(wheat|atta|maida|semolina|sooji|suji|rava|rawa|dalia|barley|jau|rye|seitan|bread|pav|bun|naan|roti|chapati|kulcha|noodles|pasta|spaghetti|macaroni|vermicelli|seviyan|breadcrumbs?|malt|soy sauce)\b/i,
    unless: /\b(rice rava|idli rava|rice suji|rice noodles|gluten[- ]free)\b/i,
  },
  // Compounded hing is cut with wheat (sometimes rice) flour; only an explicit gluten-free hing is clear.
  { allergen: 'gluten', match: /\b(hing|asafoetida)\b/i, unless: /gluten[- ]free/i, note: 'hing: compounded hing usually contains wheat flour' },
  // Oats are often processed alongside wheat; flagged as a safety note.
  { allergen: 'gluten', match: /\boats?\b/i, unless: /gluten[- ]free/i, note: 'oats: often cross-contaminated with wheat' },
  { allergen: 'soy', match: /\b(soy|soya|tofu|edamame)\b/i },
  { allergen: 'sesame', match: /\b(sesame|til|gingelly|tahini)\b/i },
  { allergen: 'mustard', match: /\b(mustard|rai|sarson|kasundi)\b/i },
];

/** Allergens for one ingredient, from its canonical id and/or its written name. */
export function allergensOf(ingredient: { ingredientId?: string | null; name: string }): AllergenId[] {
  const text = `${ingredient.name} ${(ingredient.ingredientId ?? '').replace(/[-_]/g, ' ')}`;
  const found = new Set<AllergenId>();
  for (const rule of RULES) {
    if (rule.match.test(text) && !(rule.unless && rule.unless.test(text))) found.add(rule.allergen);
  }
  return sortAllergens([...found]);
}

/** Safety notes behind a tag (e.g. why hing counts as gluten). */
export function allergenNotes(ingredient: { ingredientId?: string | null; name: string }): string[] {
  const text = `${ingredient.name} ${(ingredient.ingredientId ?? '').replace(/[-_]/g, ' ')}`;
  return RULES.filter((r) => r.note && r.match.test(text) && !(r.unless && r.unless.test(text))).map((r) => r.note as string);
}

const ORDER: AllergenId[] = ['peanut', 'treeNut', 'milk', 'egg', 'fish', 'shellfish', 'gluten', 'soy', 'sesame', 'mustard'];

export function sortAllergens(list: AllergenId[]): AllergenId[] {
  return ORDER.filter((a) => list.includes(a));
}

/** Union of every ingredient's allergens. */
export function dishAllergens(ingredients: { ingredientId?: string | null; name: string }[]): AllergenId[] {
  const all = new Set<AllergenId>();
  for (const ing of ingredients) for (const a of allergensOf(ing)) all.add(a);
  return sortAllergens([...all]);
}

const CLAIM_PATTERNS: Record<DietClaim, RegExp> = {
  vegan: /\bvegan\b/i,
  glutenFree: /\bgluten[- ]free\b/i,
  dairyFree: /\b(dairy[- ]free|milk[- ]free)\b/i,
};

/** The allergens each claim rules out. */
const CLAIM_CONFLICTS: Record<DietClaim, AllergenId[]> = {
  vegan: ['milk', 'egg', 'fish', 'shellfish'],
  glutenFree: ['gluten'],
  dairyFree: ['milk'],
};

/**
 * Claims found in the given lines, minus "vegan if …"/"can be made vegan"
 * conditionals, which describe a variation rather than the recipe.
 */
export function findClaims(lines: string[]): DietClaim[] {
  const found: DietClaim[] = [];
  for (const line of lines) {
    const CLAIM = '(vegan|gluten[- ]free|dairy[- ]free)';
    const text = line
      // "vegan if made with oil", "can be made vegan", "makes the dish vegan": a variation, not the recipe.
      .replace(new RegExp(`\\b${CLAIM}\\s+(if|when|with)\\b[^|;.)]*`, 'gi'), '')
      .replace(new RegExp(`\\b(can|could) be (made )?${CLAIM}\\b`, 'gi'), '')
      .replace(new RegExp(`\\bmakes? (the dish |it |this )?${CLAIM}\\b`, 'gi'), '')
      // "not vegan", "non-vegan": a denial, not a claim.
      .replace(new RegExp(`\\b(not|non-?|never)\\s*${CLAIM}\\b`, 'gi'), '');
    for (const claim of Object.keys(CLAIM_PATTERNS) as DietClaim[]) {
      if (CLAIM_PATTERNS[claim].test(text) && !found.includes(claim)) found.push(claim);
    }
  }
  return found;
}

/** Splits claims into those the dish's allergens allow and those they contradict. */
export function checkClaims(
  claims: DietClaim[],
  allergens: AllergenId[],
  dietType: 'veg' | 'egg' | 'non-veg' | null,
): { kept: DietClaim[]; dropped: { claim: DietClaim; because: AllergenId[] | ['non-veg'] }[] } {
  const kept: DietClaim[] = [];
  const dropped: { claim: DietClaim; because: AllergenId[] | ['non-veg'] }[] = [];
  for (const claim of claims) {
    const hits = CLAIM_CONFLICTS[claim].filter((a) => allergens.includes(a));
    if (hits.length > 0) dropped.push({ claim, because: hits });
    else if (claim === 'vegan' && dietType !== null && dietType !== 'veg') dropped.push({ claim, because: ['non-veg'] });
    else kept.push(claim);
  }
  return { kept, dropped };
}

export const ALLERGEN_LABELS: Record<AllergenId, string> = {
  peanut: 'Peanut',
  treeNut: 'Tree nuts',
  milk: 'Milk',
  egg: 'Egg',
  fish: 'Fish',
  shellfish: 'Shellfish',
  gluten: 'Gluten',
  soy: 'Soy',
  sesame: 'Sesame',
  mustard: 'Mustard',
};
