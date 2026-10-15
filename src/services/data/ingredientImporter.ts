/**
 * Ingredient importer (roadmap Day 4). Every ingredient file opens with a
 * summary table (one row per ingredient), followed by a "## Name" section
 * per ingredient; files from 2026-10-08 also carry a JSON block per
 * ingredient (schema fitplate.ingredient.v1) with the full nutrient profile.
 * The summary row is the backbone; the sections and JSON add detail.
 */
import type { Confidence, Macros, NutrientPer100, SourcedValue } from '../../models/research';
import { fileDate } from './dishImporter';
import { bullets, labelled, num, plain, rupee, rupeeRange, slugify, splitHeadings, splitName, tableRows } from './markdown';
import { listingEvidence, parseListingTable, type ListingEvidence } from './priceChecks';

export type IngredientVersion = {
  id: string;
  date: string;
  file: string;
  name: string;
  aliases: string[];
  category: string | null;
  standardUnit: string | null;
  /**
   * Summary-row price. `avg` feeds the price engine (null when outside the
   * range); `statedAvg` is the average as written and the listing fields come
   * from the section's price table (review 2026-10-15 FIX 2).
   */
  price: (ListingEvidence & { min: number; max: number; avg: number | null; statedAvg: number | null; median: number | null }) | null;
  per100: { min: number; max: number } | null;
  sourcesChecked: number | null;
  confidence: Confidence | null;
  storage: string | null;
  substitutes: string[];
  macrosPer100: Macros | null;
  nutritionPer100g: NutrientPer100 | null;
  usedIn: UsedIn[];
  notes: string[];
};

/** One "Used in" line: "- 6 Upma: 20 g (2 tbsp, finely diced)" or "- Dish 1, Poha: 60 g (thick)". */
export type UsedIn = { dishNumber: number; quantity: number | null; unit: string | null; raw: string };

/** Spec F7: the ingredient file's own "Used in" list, cross-checked against dish tables by the runner. */
export function parseUsedIn(body: string): UsedIn[] {
  const out: UsedIn[] = [];
  for (const b of bullets(body)) {
    const p = plain(b).trim();
    const m = /^(?:dish\s+)?(\d+)[,.]?\s+[^:]+:\s*(.*)$/i.exec(p);
    if (!m) continue;
    const q = /^(?:about\s+|~\s*)?(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\b/i.exec(m[2].trim());
    out.push({ dishNumber: Number(m[1]), quantity: q ? Number(q[1]) : null, unit: q ? q[2].toLowerCase() : null, raw: m[2].trim() });
  }
  return out;
}

/**
 * Research rounds ingredient prices to ₹1–₹5 (₹461 → ₹460) and large per-kg
 * prices more coarsely (₹1,396 → ₹1,400), so a listing backs the range when it
 * sits within this much of either end.
 */
function ingredientPriceTolerance(max: number): number {
  return Math.max(Math.min(2.5, 0.05 * max), 0.02 * max);
}

/** Canonical id: kebab-case of the English name, without the Indian names in brackets. */
export function ingredientId(name: string): string {
  return slugify(splitName(name).english);
}

function confidenceOf(raw: string | null | undefined): Confidence | null {
  const m = /\b(high|medium|low)\b/i.exec(raw ?? '');
  return m ? ((m[1][0].toUpperCase() + m[1].slice(1).toLowerCase()) as Confidence) : null;
}

/** "per kg (≈₹0.5 per small chilli)" → "kg" */
function unitOf(raw: string): string | null {
  const m = /per\s+(kg|g|litre|liter|l|ml|piece|dozen|bunch|pack|lemon|egg)\b/i.exec(raw);
  if (!m) return null;
  const u = m[1].toLowerCase();
  if (u === 'litre' || u === 'liter') return 'l';
  if (u === 'lemon' || u === 'egg') return 'piece';
  return u;
}

function parseSummary(text: string): { name: string; cells: string[] }[] {
  const summary = splitHeadings(text, 2).find((s) => /^summary/i.test(s.title));
  if (!summary) return [];
  return tableRows(summary.body)
    .filter((cells) => cells.length >= 8)
    .map((cells) => ({ name: plain(cells[0]).trim(), cells }));
}

/** Section 6 one-liner: "About 346 kcal | Protein 6.6 g | Carbs 77 g | Fat 1.2 g | Fibre 2 g". */
function parseMacros(body: string): Macros | null {
  const text = plain(body);
  const kcal = /(\d+(?:\.\d+)?)\s*kcal/i.exec(text);
  const g = (label: string) => {
    // "Protein 6.6 g" or "1.1 g protein"
    const after = new RegExp(`\\b(?:${label})\\b\\s*:?\\s*(?:about|~)?\\s*(\\d+(?:\\.\\d+)?)\\s*g\\b`, 'i').exec(text);
    const before = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*g\\s+(?:${label})\\b`, 'i').exec(text);
    const m = after ?? before;
    return m ? Number(m[1]) : null;
  };
  const out: Macros = { kcal: kcal ? Number(kcal[1]) : null, proteinG: g('Protein'), carbsG: g('Carbs|Carbohydrates?'), fatG: g('Fat'), fibreG: g('Fibre|Fiber') };
  return Object.values(out).some((v) => v != null) ? out : null;
}

const JSON_FIELDS: [keyof Omit<NutrientPer100, 'basis'>, string][] = [
  ['energyKcal', 'energy_kcal'],
  ['proteinG', 'protein_g'],
  ['carbsG', 'carbohydrate_g'],
  ['sugarsG', 'sugars_g'],
  ['fatG', 'fat_g'],
  ['saturatedFatG', 'saturated_fat_g'],
  ['fibreG', 'fibre_g'],
  ['sodiumMg', 'sodium_mg'],
  ['ironMg', 'iron_mg'],
  ['calciumMg', 'calcium_mg'],
  ['potassiumMg', 'potassium_mg'],
  ['magnesiumMg', 'magnesium_mg'],
  ['zincMg', 'zinc_mg'],
  ['vitaminCMg', 'vitamin_c_mg'],
  ['vitaminAUgRae', 'vitamin_a_ug_rae'],
  ['folateUgDfe', 'folate_ug_dfe'],
  // fitplate.ingredient.v2 (ingredient PATCH_02, files from 2026-10-12); null in v1 blocks.
  ['waterG', 'water_g'],
  ['cholesterolMg', 'cholesterol_mg'],
  ['transFatG', 'trans_fat_g'],
  ['mufaG', 'mufa_g'],
  ['pufaG', 'pufa_g'],
  ['omega3G', 'omega3_g'],
  ['addedSugarsG', 'added_sugars_g'],
  ['phosphorusMg', 'phosphorus_mg'],
  ['seleniumUg', 'selenium_ug'],
  ['copperMg', 'copper_mg'],
  ['manganeseMg', 'manganese_mg'],
  ['iodineUg', 'iodine_ug'],
  ['vitaminDUg', 'vitamin_d_ug'],
  ['vitaminEMg', 'vitamin_e_mg'],
  ['vitaminKUg', 'vitamin_k_ug'],
  ['thiaminMg', 'thiamin_mg'],
  ['riboflavinMg', 'riboflavin_mg'],
  ['niacinMg', 'niacin_mg'],
  ['vitaminB6Mg', 'vitamin_b6_mg'],
  ['vitaminB12Ug', 'vitamin_b12_ug'],
];

/** Ingredient profile schemas; other blocks (e.g. fitplate.ingredient_facts.v1, PATCH_03) are not profiles. */
const PROFILE_SCHEMAS = new Set(['fitplate.ingredient.v1', 'fitplate.ingredient.v2']);

type JsonBlock = { id?: string; name?: string; nutrition?: Record<string, unknown> | null };

/** Every fitplate.ingredient.v1 / v2 JSON block in the file. Malformed blocks are skipped and reported. */
export function parseJsonBlocks(text: string): { blocks: JsonBlock[]; errors: string[] } {
  const blocks: JsonBlock[] = [];
  const errors: string[] = [];
  const re = /```json\s*\n([\s\S]*?)\n```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    try {
      const parsed = JSON.parse(m[1]) as JsonBlock & { schema?: string };
      if (parsed.schema && PROFILE_SCHEMAS.has(parsed.schema)) blocks.push(parsed);
    } catch (e) {
      errors.push(`JSON block at offset ${m.index}: ${(e as Error).message}`);
    }
  }
  return { blocks, errors };
}

/** Maps a JSON nutrition block to NutrientPer100. "Not found" stays null; nothing is estimated. */
export function nutritionFromJson(n: Record<string, unknown> | null | undefined): NutrientPer100 | null {
  if (!n) return null;
  const source = typeof n.source === 'string' ? n.source : null;
  const ref = typeof n.source_ref === 'string' ? n.source_ref : null;
  const confidence = confidenceOf(typeof n.confidence === 'string' ? n.confidence : null);
  const value = (key: string): SourcedValue => {
    const v = n[key];
    const ok = typeof v === 'number' && Number.isFinite(v);
    return { value: ok ? v : null, source: ok ? [source, ref].filter(Boolean).join(': ') || null : null, confidence: ok ? confidence : null };
  };
  const basis = typeof n.basis === 'string' && /ml/i.test(n.basis) ? '100ml' : '100g';
  const out = { basis } as NutrientPer100;
  for (const [field, key] of JSON_FIELDS) out[field] = value(key);
  return out;
}

/** Normalises a JSON id ("green_chilli") to the app's kebab-case ids. */
export function normaliseId(raw: string): string {
  return slugify(raw.replace(/_/g, '-'));
}

/** Parses every ingredient in one ingredient research file. */
export function parseIngredientFile(text: string, file: string): { items: IngredientVersion[]; errors: string[] } {
  const date = fileDate(file);
  if (!date) throw new Error(`No date in file name: ${file}`);
  const sections = splitHeadings(text, 2).filter((s) => !/^summary/i.test(s.title));
  const { blocks, errors } = parseJsonBlocks(text);
  const items: IngredientVersion[] = [];

  for (const { name, cells } of parseSummary(text)) {
    const { english, aliases } = splitName(name);
    const id = ingredientId(name);
    const notes: string[] = [];
    // Section heading may spell the name slightly differently: match on the English part.
    const sec = sections.find((s) => slugify(splitName(plain(s.title)).english) === id);
    const sub = sec ? splitHeadings(sec.body, 3) : [];
    const body = (n: number, hint: RegExp) => (sub.find((s) => hint.test(s.title)) ?? sub.find((s) => s.n === n))?.body ?? '';
    if (!sec) notes.push('no detail section found');

    const range = rupeeRange(cells[3]);
    const statedAvg = rupee(cells[4]);
    let avg = statedAvg;
    if (range && avg != null && (avg < range.min || avg > range.max)) {
      notes.push(`average ₹${avg} outside range; ignored`);
      avg = null;
    }
    const per100 = /₹/.test(cells[5]) ? (rupeeRange(cells[5]) ?? (rupee(cells[5]) != null ? { min: rupee(cells[5]) as number, max: rupee(cells[5]) as number } : null)) : null;

    const sectionAliases = sec ? splitName(plain(sec.title)).aliases : [];
    const json = blocks.find((b) => (b.id && normaliseId(b.id) === id) || (b.name && ingredientId(b.name) === id));
    const substitutes = bullets(body(5, /substitutes/i))
      // "**Shallots (small/sambar onion):** same flavour…" or "Ghee: same richness…"
      .map((b) => /^\*\*(.+?)[:.]?\*\*/.exec(b)?.[1]?.replace(/:$/, '').trim() ?? /^([^:]{2,60}):/.exec(plain(b))?.[1]?.trim() ?? null)
      .filter((s): s is string => !!s);
    const storageBody = body(4, /storage/i);

    items.push({
      id,
      date,
      file,
      name: english,
      aliases: [...new Set([...aliases, ...sectionAliases])],
      category: plain(cells[1]).trim() || null,
      standardUnit: unitOf(cells[2]),
      price: range
        ? {
            min: range.min,
            max: range.max,
            avg,
            statedAvg,
            median: null,
            ...listingEvidence(parseListingTable(body(2, /price/i), 'ingredient'), range, ingredientPriceTolerance(range.max)),
          }
        : null,
      per100: per100 && per100.min <= per100.max ? per100 : null,
      sourcesChecked: num(/(\d+)/.exec(cells[6])?.[1]),
      confidence: confidenceOf(cells[7]),
      storage: storageBody ? (labelled(storageBody, ['Storage', 'Fridge', 'Pantry']) ?? (bullets(storageBody).map(plain).join(' ') || null)) : null,
      substitutes,
      macrosPer100: parseMacros(body(6, /nutrition/i)),
      nutritionPer100g: json ? nutritionFromJson(json.nutrition ?? null) : null,
      usedIn: parseUsedIn(body(7, /used in/i)),
      notes,
    });
  }
  return { items, errors };
}
