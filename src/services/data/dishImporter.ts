/**
 * Dish importer (roadmap Day 4). Parses one daily dish research file into
 * per-dish records. Pure: it takes the markdown text and returns data, so
 * it runs the same in Jest and in scripts/research/run.js.
 *
 * Null always means "not found in the file"; nothing is estimated here.
 */
import type { DietClaim, Dish, DishIngredient, DishStep, Macros } from '../../models/research';
import { checkClaims, dishAllergens, allergenNotes, findClaims, sortAllergens } from './allergens';
import { parseDietTags, parseTagsLine, parseVariants, withoutDietTags } from './dietTags';
import { parseFasting, validateFasting } from './fasting';
import { bullets, labelled, minutes, num, plain, rupee, rupeeRange, seconds, slugify, splitHeadings, tableRows, type Section } from './markdown';
import { listingEvidence, parseListingTable, type ListingEvidence } from './priceChecks';

/** One dish as written in one research file, before merging with other versions. */
export type DishVersion = {
  id: string;
  number: number;
  date: string;
  file: string;
  name: string;
  cuisine: string | null;
  dietType: Dish['dietType'];
  mealType: string[];
  difficulty: string | null;
  prepMin: number | null;
  cookMin: number | null;
  totalMin: number | null;
  servingsWritten: number | null;
  ingredients: DishIngredient[];
  equipment: string[];
  steps: DishStep[];
  nutrition: Macros;
  /** Order price for 1 serving as written; feeds the price trend engine. */
  orderPrice: OrderPriceVersion | null;
  /** "AS ORDERED" block (dish files from 2026-10-08). Null when the block is missing. */
  asOrdered: Dish['asOrdered'];
  healthiness: Dish['healthiness'];
  researchRating: Dish['researchRating'];
  storage: string | null;
  leftoverRemix: string | null;
  burnOff: string | null;
  sources: string[];
  allergens: Dish['allergens'];
  dietClaims: DietClaim[];
  fasting: Dish['fasting'];
  dietTags: Dish['dietTags'];
  /** PATCH 04 "Tags:" line as written (kept for the report; the app's tags come from tags.ts). */
  researchTags: string[];
  description: string | null;
  variants: Dish['variants'];
  needsReview: string[];
  notes: string[];
};

/**
 * One researched order price. `avg` is what the price engine uses (null when
 * the file's average lies outside its own range); `statedAvg` and `median`
 * are the headline figures as written, kept for the FIX 2 checks.
 */
export type OrderPriceVersion = ListingEvidence & {
  min: number;
  max: number;
  avg: number | null;
  statedAvg: number | null;
  median: number | null;
};

/** Research rounds dish prices to ₹10, so a ₹209.64 listing backs a ₹210 floor. */
const DISH_PRICE_TOLERANCE = 5;

export function dishId(number: number, name: string): string {
  return `${String(number).padStart(3, '0')}-${slugify(name)}`;
}

function section(sections: Section[], n: number, titleHint: RegExp): string {
  return (sections.find((s) => titleHint.test(s.title)) ?? sections.find((s) => s.n === n))?.body ?? '';
}

function dietOf(raw: string): Dish['dietType'] {
  const s = raw.toLowerCase();
  if (/non[- ]?veg/.test(s)) return 'non-veg';
  if (/\begg/.test(s)) return 'egg';
  if (/\bveg/.test(s)) return 'veg';
  return null;
}

/** "Maharashtrian (…) | Veg | Breakfast (also an evening snack)" */
function parseHeader(body: string): { cuisine: string | null; diet: string; dietType: Dish['dietType']; mealType: string[] } {
  const line = body.split('\n').find((l) => l.includes('|') && !l.trim().startsWith('|')) ?? '';
  const parts = line.split('|').map((p) => p.trim());
  const dietIdx = parts.findIndex((p) => dietOf(p) !== null);
  const cuisine = parts[0] && dietIdx !== 0 ? parts[0] : null;
  const diet = dietIdx >= 0 ? parts[dietIdx] : '';
  const mealRaw = dietIdx >= 0 ? parts.slice(dietIdx + 1).join(' ') : '';
  const mealType = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink']
    .filter((m) => new RegExp(`\\b${m}`, 'i').test(mealRaw.replace(/\([^)]*\)/g, '')));
  return { cuisine, diet, dietType: dietIdx >= 0 ? dietOf(parts[dietIdx]) : null, mealType };
}

/** "60 g", "10 ml (about 9 g)", "1 small chilli", "About 1 cup …" */
function parseQuantity(raw: string): { quantity: number | null; unit: string | null } {
  const m = /^(?:about\s+|~\s*)?(\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(g|kg|ml|l|litre|liter|tsp|tbsp|cup|cups|pinch|piece|pieces|pcs|no\.?|clove|cloves|leaves|sprig|small|medium|large)?\b/i.exec(raw.trim());
  if (!m) return { quantity: null, unit: null };
  const unit = m[2] ? m[2].toLowerCase().replace(/^litre$|^liter$/, 'l').replace(/^cups$/, 'cup') : null;
  return { quantity: Number(m[1]), unit };
}

function parseIngredients(body: string): DishIngredient[] {
  const out: DishIngredient[] = [];
  for (const cells of tableRows(body)) {
    if (cells.length < 2) continue;
    const name = plain(cells[0]).trim();
    if (!name || /^total$/i.test(name)) continue;
    const { quantity, unit } = parseQuantity(plain(cells[1]));
    const household = cells[2] ? plain(cells[2]).trim() : '';
    out.push({ ingredientId: null, name, quantity, unit, householdMeasure: household && household !== '–' && household !== '-' ? household : null });
  }
  return out;
}

function parseEquipment(body: string): string[] {
  return bullets(body).map((b) => {
    const p = plain(b);
    // Keep the item itself; "No colander? Use …" alternatives stay in the full text below the first sentence.
    const first = p.split(/\.\s+(?=[A-Z])/)[0];
    return first.replace(/\.$/, '').trim();
  });
}

function parseSteps(body: string): DishStep[] {
  const steps: DishStep[] = [];
  let current: DishStep | null = null;
  for (const line of body.split('\n')) {
    const head = /^(\d+)\.\s+(.*)$/.exec(line);
    if (head) {
      if (current) steps.push(current);
      const rest = head[2].trim();
      const titled = /^\*\*(.+?)\*\*\s*(.*)$/.exec(rest);
      const title = titled ? titled[1].replace(/[.:]$/, '').trim() : null;
      current = { n: Number(head[1]), title, text: plain(titled ? titled[2] : rest).trim() || (title ?? ''), timerSec: null, tip: null, visualCue: null, cameraCheck: null, videoShot: null };
      continue;
    }
    const sub = /^\s+-\s+(.*)$/.exec(line);
    if (!sub || !current) continue;
    const item = plain(sub[1]);
    const kv = /^([^:]+):\s*(.*)$/.exec(item);
    if (!kv) continue;
    const key = kv[1].toLowerCase();
    const value = kv[2].trim();
    if (key.startsWith('time')) current.timerSec = seconds(value);
    else if (key.startsWith('visual cue')) current.visualCue = value;
    else if (key.startsWith('camera check')) current.cameraCheck = value;
    else if (key.startsWith('video shot')) current.videoShot = value;
    else if (key.includes('tip')) current.tip = value;
  }
  if (current) steps.push(current);
  return steps;
}

/**
 * Section 5 totals, written three ways across days:
 * "**Total: about 390 kcal | Protein 7.9 g | …**" (also "Total (2 chillas, no chutney): …"),
 * "- Calories: about 660 kcal", or "| Calories | ~540 kcal |".
 * The per-ingredient table comes after the totals, so the first match wins.
 */
export function parseNutrition(body: string): Macros {
  const text = plain(body);
  const kcal = /(?:Total(?:\s*\((?:[^()]|\([^()]*\))*\))?:\s*(?:about|~|≈)?\s*|Calories\s*(?:\(kcal\))?\s*[:|]\s*(?:about|~|≈)?\s*)([\d,]+(?:\.\d+)?)\s*kcal/i.exec(text);
  const grams = (label: string) => {
    const m = new RegExp(`\\b(?:${label})\\b[^0-9\\n|]*\\|?\\s*(?:about|~|≈)?\\s*(\\d+(?:\\.\\d+)?)\\s*g\\b`, 'i').exec(text);
    return m ? num(m[1]) : null;
  };
  return {
    kcal: kcal ? num(kcal[1]) : null,
    proteinG: grams('Protein'),
    carbsG: grams('Carbs|Carbohydrates?'),
    fatG: grams('Fat'),
    fibreG: grams('Fibre|Fiber'),
  };
}

const AMOUNT = '₹\\s*([\\d,]+(?:\\.\\d+)?)';

/** "average about ₹280" / "median ₹225" in one phrase; "average of all …" describes the full spread, not the range. */
function statedFigure(text: string, label: 'average' | 'median'): number | null {
  const m = new RegExp(`\\b${label}\\b(?! of all)[^₹\\n.;]{0,15}${AMOUNT}`, 'i').exec(text);
  return m ? num(m[1]) : null;
}

/**
 * The headline average and median the research gives for its range, as
 * written (not filtered): the range sentence itself ("₹180–240; median about
 * ₹230; average about ₹280."), then an "Average:" / "Median:" label, then the
 * AS ORDERED price line when it repeats the same range.
 */
function headlineFigures(text: string, rangeLine: string, range: { min: number; max: number }): { avg: number | null; median: number | null } {
  const fromRange = rangeLine.slice(rangeLine.search(/price range/i));
  const headline = fromRange.split(/(?<=\.)\s+(?=[A-Z])/)[0];
  const lines = text.split('\n');
  const label = (name: string) => {
    const inLine = new RegExp(`(?:^|\\.\\s+)${name}\\b[^:.]{0,30}:\\s*(?:about|~|≈)?\\s*${AMOUNT}`, 'i').exec(fromRange);
    if (inLine) return num(inLine[1]);
    const own = lines.find((l) => new RegExp(`^\\s*-?\\s*${name}\\b[^:]*:`, 'i').test(l) && !/average of all/i.test(l));
    return own ? rupee(own) : null;
  };
  const asOrdered = lines.find((l) => /^\s*-?\s*price\b[^:]*:/i.test(l) && !/price range/i.test(l) && /average|median/i.test(l) && (() => {
    const r = rupeeRange(l.slice(l.search(/range/i)));
    return r != null && r.min === range.min && r.max === range.max;
  })());
  return {
    avg: statedFigure(headline, 'average') ?? label('average') ?? (asOrdered ? statedFigure(asOrdered, 'average') : null),
    median: statedFigure(headline, 'median') ?? label('median') ?? (asOrdered ? statedFigure(asOrdered, 'median') : null),
  };
}

export function parseOrderPrice(body: string): OrderPriceVersion | null {
  const text = plain(body);
  const rangeLine = text.split('\n').find((l) => /price range/i.test(l));
  if (!rangeLine) return null;
  const range = rupeeRange(rangeLine.slice(rangeLine.search(/price range/i)));
  if (!range) return null;
  // "- Average (1 serving): about ₹130" on its own line, or "… Average: ~₹330." after the range.
  // "Average of all N prices" lines describe the full spread before narrowing, so they don't count.
  const avgLine = text.split('\n').find((l) => /^\s*-?\s*average\b[^:]*:/i.test(l) && !/average of all/i.test(l));
  let avg = avgLine ? rupee(avgLine) : null;
  if (avg == null) {
    // Otherwise the last "average about ₹N" in the range explanation that sits inside the range.
    const mentions = [...rangeLine.matchAll(/average[^₹\n]{0,15}₹\s*([\d,]+)/gi)].map((m) => num(m[1]));
    avg = mentions.filter((v): v is number => v != null && v >= range.min && v <= range.max).pop() ?? null;
  }
  // An average outside the narrowed range belongs to the full spread, not the range.
  if (avg != null && (avg < range.min || avg > range.max)) avg = null;
  const stated = headlineFigures(text, rangeLine, range);
  return {
    min: range.min,
    max: range.max,
    avg,
    statedAvg: stated.avg,
    median: stated.median,
    // "Price range (1 serving), everyday Mumbai city restaurants: ₹180–240" leaves out-of-city rows out.
    ...listingEvidence(parseListingTable(body, 'dish'), range, DISH_PRICE_TOLERANCE, { cityOnly: /mumbai city/i.test(rangeLine.split('₹')[0]) }),
  };
}

function parseAsOrdered(body: string): Dish['asOrdered'] {
  const idx = body.search(/AS ORDERED/);
  if (idx < 0) return null;
  const block = plain(body.slice(idx));
  const value = (label: string) => {
    const line = block.split('\n').find((l) => new RegExp(`^\\s*[-|]?\\s*${label}\\b`, 'i').test(l));
    if (!line || /not found/i.test(line)) return { value: null, source: null };
    const m = /(\d+(?:\.\d+)?)\s*(kcal|g)\b/i.exec(line);
    const src = /(?:source|from)[:\s]+([^|]+?)\s*(?:\||$)/i.exec(line);
    return { value: m ? Number(m[1]) : null, source: m && src ? src[1].trim() : null };
  };
  const sampled = /(\d+)\s+restaurants?/i.exec(block);
  const platforms = ['Swiggy', 'Zomato', 'magicpin'].filter((p) => new RegExp(p, 'i').test(block));
  return {
    price: null,
    nutrition: { calories: value('Calories'), protein: value('Protein'), carbs: value('Carbs|Carbohydrates?'), fat: value('Fat'), fibre: value('Fibre|Fiber') },
    restaurantsSampled: sampled ? Number(sampled[1]) : null,
    platforms,
  };
}

function parseHealth(body: string): Dish['healthiness'] {
  const text = plain(body);
  const home = /Home(?:[- ]cooked)?(?: version)?:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i.exec(text);
  const rest = /restaurant(?: version)?:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i.exec(text);
  const reason = labelled(body, ['Reason', 'Why']);
  if (!home && !rest && !reason) return null;
  return { score: home ? Number(home[1]) : null, restaurantScore: rest ? Number(rest[1]) : null, reasons: reason ? [reason] : [] };
}

function parseRating(body: string): Dish['researchRating'] {
  const text = plain(body);
  const m = /Rating:\s*(\d+(?:\.\d+)?)\s*\/\s*5/i.exec(text);
  const basis = labelled(body, ['Reason']);
  if (!m && !basis) return null;
  return { score: m ? Number(m[1]) : null, basis };
}

function parseSources(body: string): string[] {
  return bullets(body)
    .map((b) => plain(b).trim())
    .filter((b) => /https?:\/\//.test(b));
}

/** Parses one dish block ("## N. Name" and its sections). */
export function parseDish(block: Section, meta: { date: string; file: string }): DishVersion | null {
  if (block.n == null) return null;
  const name = plain(block.title).trim();
  const sections = splitHeadings(block.body, 3);
  const headerText = block.body.split(/^### /m)[0];
  const header = parseHeader(headerText);
  const tagsLine = parseTagsLine(headerText);
  const facts = section(sections, 1, /quick facts/i);
  const dietTags = parseDietTags(facts);
  const notes: string[] = [];
  const needsReview: string[] = [];

  const prepRaw = labelled(facts, ['Prep time / Cook time / Total time']);
  let prepMin: number | null;
  let cookMin: number | null;
  let totalMin: number | null;
  if (prepRaw) {
    const parts = prepRaw.split('/');
    [prepMin, cookMin, totalMin] = [minutes(parts[0] ?? null), minutes(parts[1] ?? null), minutes(parts[2] ?? null)];
  } else {
    prepMin = minutes(labelled(facts, ['Prep time']));
    const prepLine = labelled(facts, ['Prep time']) ?? '';
    cookMin = minutes(labelled(facts, ['Cook time']) ?? (/cook time:\s*([^/]+)/i.exec(prepLine)?.[1] ?? null));
    totalMin = minutes(labelled(facts, ['Total time']) ?? (/total time:\s*([^/]+)/i.exec(prepLine)?.[1] ?? null));
  }
  const servingsLine = labelled(facts, ['Servings']);
  const servingsWritten = servingsLine ? num(/^(\d+)/.exec(servingsLine)?.[1]) : null;
  if (servingsWritten != null && servingsWritten !== 1) notes.push(`file says ${servingsWritten} servings; not converted`);

  const difficultyRaw = labelled(facts, ['Difficulty']);
  const difficulty = difficultyRaw ? (/^(beginner|easy|intermediate|medium|advanced|hard)/i.exec(difficultyRaw)?.[1] ?? null) : null;

  const ingredients = parseIngredients(section(sections, 2, /^ingredients/i));
  const derived = dishAllergens(ingredients);
  // Safety first: an allergen the research declares is kept even if the ingredient names don't show it.
  const declared = dietTags?.allergensDeclared ?? [];
  const extra = declared.filter((a) => !derived.includes(a));
  if (extra.length > 0) notes.push(`research declares ${extra.join(', ')} not detected from ingredient names; added`);
  const allergens = sortAllergens([...derived, ...extra]);
  const allergenSafety = [...new Set(ingredients.flatMap((i) => allergenNotes(i)))];
  notes.push(...allergenSafety);

  // Claims live in the header line ("Veg (naturally vegan and gluten-free)"), in Quick facts, and
  // (from PATCH 03) as "Yes" lines in the Diet tags block, which is read structurally, not as prose.
  const claimLines = [header.diet, ...bullets(withoutDietTags(facts)).map(plain).filter((b) => !/^(navratri|ekadashi|jain|ramadan)/i.test(b))];
  const found = findClaims(claimLines);
  if (dietTags) {
    for (const [key, claim] of [['vegan', 'vegan'], ['glutenFree', 'glutenFree'], ['dairyFree', 'dairyFree']] as const) {
      if (dietTags[key].status === 'yes' && !found.includes(claim)) found.push(claim);
    }
  }
  const claims = checkClaims(found, allergens, header.dietType);
  for (const d of claims.dropped) needsReview.push(`dropped "${d.claim}" claim: recipe has ${d.because.join(', ')}`);

  const fastingCheck = validateFasting(parseFasting(facts), ingredients.map((i) => i.name));
  needsReview.push(...fastingCheck.issues);

  const stepsBody = section(sections, 4, /micro-steps|steps/i);
  const order = section(sections, 6, /cost to order/i);
  const after = section(sections, 10, /after the meal/i);

  return {
    id: dishId(block.n, name),
    number: block.n,
    date: meta.date,
    file: meta.file,
    name,
    cuisine: header.cuisine,
    dietType: header.dietType,
    mealType: header.mealType,
    difficulty: difficulty ? difficulty[0].toUpperCase() + difficulty.slice(1).toLowerCase() : null,
    prepMin,
    cookMin,
    totalMin,
    servingsWritten,
    ingredients,
    equipment: parseEquipment(section(sections, 3, /^equipment/i)),
    steps: parseSteps(stepsBody.split(/\*\*Diet variants\*\*/i)[0]),
    nutrition: parseNutrition(section(sections, 5, /calories and nutrition/i)),
    orderPrice: parseOrderPrice(order),
    asOrdered: parseAsOrdered(order),
    healthiness: parseHealth(section(sections, 7, /healthiness/i)),
    researchRating: parseRating(section(sections, 8, /^rating/i)),
    storage: labelled(after, ['Storage']),
    leftoverRemix: labelled(after, ['Leftover remix']),
    burnOff: labelled(after, ['Burn it off']),
    sources: parseSources(section(sections, 12, /^sources/i)),
    allergens,
    dietClaims: claims.kept,
    fasting: fastingCheck.fasting,
    dietTags,
    researchTags: tagsLine?.researchTags ?? [],
    description: tagsLine?.description ?? null,
    variants: parseVariants(stepsBody),
    needsReview,
    notes,
  };
}

/** Date from "FitPlate_Dishes_2026-10-04.md". */
export function fileDate(file: string): string | null {
  return /(\d{4}-\d{2}-\d{2})/.exec(file)?.[1] ?? null;
}

/** Parses every dish in one dish research file. */
export function parseDishFile(text: string, file: string): DishVersion[] {
  const date = fileDate(file);
  if (!date) throw new Error(`No date in file name: ${file}`);
  return splitHeadings(text, 2)
    .map((block) => parseDish(block, { date, file }))
    .filter((d): d is DishVersion => d !== null);
}
