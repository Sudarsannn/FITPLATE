/**
 * Dish research PATCH 03 and 04 blocks (from the 2026-10-12 dish file on):
 * the "**Diet tags**" lines in Quick facts, the "Tags:" line and description
 * sentence under the heading, and the "**Diet variants**" block at the end of
 * the micro-steps. Pure parsers; older files without the blocks give null or [].
 *
 * These are what research SAYS. The tag engine (tags.ts) only turns a line into
 * a tag after the Day 04 allergen and fasting checks agree with the recipe.
 */
import type { AllergenId, DietLine, DietTagLines, DishVariant } from '../../models/research';
import { bullets, plain } from './markdown';

const EMPTY: DietLine = { status: null, reason: null };

function parseLine(value: string): DietLine {
  // "Yes — reason", "With changes — reason", "Not found — reason"
  const m = /^\s*(yes|no|with changes|not found)\b\s*(?:[—–:-]+\s*)?(.*)$/i.exec(value);
  if (!m) return { status: null, reason: value.trim() || null };
  const word = m[1].toLowerCase();
  const status = word === 'yes' ? 'yes' : word === 'no' ? 'no' : word === 'with changes' ? 'with-changes' : null;
  return { status, reason: m[2].trim() || null };
}

/** Research allergen words → FitPlate allergen ids (Day 04 list). */
const DECLARED: [RegExp, AllergenId][] = [
  [/\b(dairy|milk|ghee|butter|paneer|curd|cream)\b/i, 'milk'],
  [/\begg/i, 'egg'],
  [/\bgluten|wheat/i, 'gluten'],
  [/\bpeanut|groundnut/i, 'peanut'],
  [/\btree ?nuts?|cashew|almond|pistachio|walnut/i, 'treeNut'],
  [/\bsoy/i, 'soy'],
  [/\bsesame|\btil\b/i, 'sesame'],
  [/\bfish\b/i, 'fish'],
  [/\bshellfish|prawn|shrimp|crab/i, 'shellfish'],
  [/\bmustard/i, 'mustard'],
];

/** "dairy (ghee), tree nuts (cashew), gluten (only via compounded hing)" → ['milk', 'treeNut', 'gluten']. */
export function declaredAllergens(value: string): AllergenId[] {
  if (/none of the listed|^\s*none\b/i.test(value)) return [];
  const out: AllergenId[] = [];
  for (const part of value.split(/,(?![^(]*\))/)) {
    const head = part.replace(/\([^)]*\)/g, ' ');
    for (const [re, id] of DECLARED) if (re.test(head) && !out.includes(id)) out.push(id);
  }
  return out;
}

/** Reads the "**Diet tags**" block from a dish's Quick facts. Null when the file predates PATCH 03. */
export function parseDietTags(quickFacts: string): DietTagLines | null {
  const start = quickFacts.search(/\*\*Diet tags\*\*/i);
  if (start < 0) return null;
  // The block ends where the next bold heading (Fasting suitability) starts.
  const rest = quickFacts.slice(start + 'Diet tags'.length + 4);
  const end = rest.search(/\n\s*\*\*[^*\n]+\*\*\s*\n/);
  const block = end >= 0 ? rest.slice(0, end) : rest;
  const out: DietTagLines = {
    base: null,
    jain: EMPTY,
    vegan: EMPTY,
    pescatarian: EMPTY,
    sattvik: EMPTY,
    glutenFree: EMPTY,
    dairyFree: EMPTY,
    allergensDeclared: null,
  };
  let any = false;
  for (const item of bullets(block)) {
    const p = plain(item);
    const m = /^([^:]+):\s*(.*)$/.exec(p);
    if (!m) continue;
    const label = m[1].toLowerCase();
    const value = m[2].trim();
    any = true;
    if (/^base diet/.test(label)) out.base = value || null;
    else if (/^jain/.test(label)) out.jain = parseLine(value);
    else if (/^vegan/.test(label)) out.vegan = parseLine(value);
    else if (/^pescatarian/.test(label)) out.pescatarian = parseLine(value);
    else if (/onion|garlic|sattvi/.test(label)) out.sattvik = parseLine(value);
    else if (/^gluten/.test(label)) out.glutenFree = parseLine(value);
    else if (/^dairy/.test(label)) out.dairyFree = parseLine(value);
    else if (/allergen/.test(label)) out.allergensDeclared = declaredAllergens(value);
  }
  return any ? out : null;
}

/** Text of Quick facts without the Diet tags block, so its "Vegan: With changes" lines aren't read as claims. */
export function withoutDietTags(quickFacts: string): string {
  const start = quickFacts.search(/\*\*Diet tags\*\*/i);
  if (start < 0) return quickFacts;
  const rest = quickFacts.slice(start + 2);
  const end = rest.search(/\n\s*\*\*[^*\n]+\*\*\s*\n/);
  return quickFacts.slice(0, start) + (end >= 0 ? rest.slice(end) : '');
}

/**
 * The "Tags:" line and the description sentence under the dish heading (PATCH 04 A).
 * "Has variants: …" is split off; it is a list of variant categories, not tags of this recipe.
 */
export function parseTagsLine(headerText: string): { researchTags: string[]; variantCategories: string[]; description: string | null } | null {
  const lines = headerText.split('\n').map((l) => l.trim());
  const idx = lines.findIndex((l) => /^tags:/i.test(l));
  if (idx < 0) return null;
  const raw = lines[idx].replace(/^tags:\s*/i, '');
  const hv = raw.search(/has variants:/i);
  const tagPart = hv >= 0 ? raw.slice(0, hv) : raw;
  const variantPart = hv >= 0 ? raw.slice(hv).replace(/has variants:\s*/i, '') : '';
  const split = (s: string) =>
    s
      .split(/,(?![^(]*\))/)
      .map((t) => t.trim())
      .filter(Boolean);
  const next = lines.slice(idx + 1).find((l) => l.length > 0);
  const description = next && !next.startsWith('#') && !next.startsWith('|') && !next.startsWith('-') ? plain(next).trim() : null;
  return { researchTags: split(tagPart), variantCategories: split(variantPart), description };
}

/** The verdict opens the line ("Variant.", "Already fits — …", "Not appropriate — …"); anything else is detail. */
function variantStatus(text: string): DishVariant['status'] {
  const t = plain(text).trim();
  if (/^(already fits|main recipe already)/i.test(t)) return 'already-fits';
  if (/^(not appropriate|not possible)/i.test(t)) return 'not-appropriate';
  if (/^variant\b/i.test(t)) return 'variant';
  return null;
}

/**
 * The "**Diet variants**" block (PATCH 04 B). Two layouts exist: the variant
 * detail nested under its "- Jain: Variant." line, or summary lines first and
 * "**Jain variant: Name**" paragraphs after. Both give one entry per category.
 * Only the variant's identity is read; its recipe stays in the research file
 * until the variant UI (Day 6–7) needs it.
 */
export function parseVariants(stepsBody: string): DishVariant[] {
  const start = stepsBody.search(/\*\*Diet variants\*\*/i);
  if (start < 0) return [];
  const block = stepsBody.slice(start + '**Diet variants**'.length);
  const byCategory = new Map<string, DishVariant>();
  const key = (c: string) => c.toLowerCase().replace(/[^a-z]/g, '');
  // The detail heading most recently read; its "Origin:" line follows it.
  let current: DishVariant | null = null;

  for (const line of block.split('\n')) {
    // Summary line: "- Jain: Variant." / "- **Vegan:** Variant (below)." / "- Dairy-free: Already fits — …"
    const summary = /^-\s+(?:\*\*)?([A-Za-z][A-Za-z ()/-]*?)(?::\*\*|\*\*:|:)\s*(.*)$/.exec(line);
    if (summary && !/^\s/.test(line)) {
      const category = summary[1].trim();
      const status = variantStatus(summary[2]);
      if (status) {
        const reason = status === 'variant' ? null : plain(summary[2]).replace(/^(already fits|not appropriate|not possible)\s*[—–:-]*\s*/i, '').trim() || null;
        byCategory.set(key(category), { category, status, name: null, origin: null, linkedDishNumber: null, reason });
        continue;
      }
    }
    // Detail heading: "**Jain variant: Jain Ven Pongal (no ginger)**", possibly indented under its summary line.
    const head = /^\s*\*\*([^*:]+?) variant:\s*([^*]+)\*\*/i.exec(line);
    if (head) {
      const category = head[1].trim();
      const name = head[2].trim();
      const existing = [...byCategory.values()].find((v) => key(v.category) === key(category) || key(category).startsWith(key(v.category)) || key(v.category).startsWith(key(category)));
      const linked = /FitPlate dish (\d+)/i.exec(name);
      const entry: DishVariant = existing ?? { category, status: 'variant', name: null, origin: null, linkedDishNumber: null, reason: null };
      entry.name = name.replace(/\s*\(FitPlate dish \d+\)\s*/i, '').trim();
      entry.linkedDishNumber = linked ? Number(linked[1]) : null;
      entry.status = 'variant';
      byCategory.set(key(entry.category), entry);
      current = entry;
      continue;
    }
    // "- Origin: Established dish (…)" belongs to the most recent detail heading.
    const origin = /^\s*-\s*Origin:\s*(.*)$/i.exec(line);
    if (origin) {
      if (current && current.origin == null) current.origin = /fitplate-created/i.test(origin[1]) ? 'fitplate-created' : /established/i.test(origin[1]) ? 'established' : null;
    }
  }
  return [...byCategory.values()];
}
