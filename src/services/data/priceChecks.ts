/**
 * Order-price checks (review 2026-10-15 FIX 2). A researched price range is
 * only shown as a headline when the research's own numbers agree with it:
 *
 *   1. the stated average and median lie inside [min, max];
 *   2. at least 3 distinct listings, on more than 1 platform, back the range;
 *   3. no listing used for the range is marked out of stock (or, for a dish,
 *      as a closed / not-delivering outlet).
 *
 * Anything else is "not confirmed" with the reasons, which also go to the
 * DATA SYNC REPORT's needs-review list. Pure, so it runs in Jest and in the
 * sync runner alike. Nothing here estimates a number: a count that cannot be
 * read from the file stays null.
 */
import type { PriceCheck } from '../../models/research';
import { num, plain } from './markdown';

export const MIN_LISTINGS = 3;
export const MIN_PLATFORMS = 2;

/** One row of a section-6 (dish) or "Price" (ingredient) listing table. */
export type ListingRow = {
  /** Restaurant (dish) or source (ingredient) cell, as written. */
  source: string;
  /** Normalised platform names ("Zomato and magicpin" → both). */
  platforms: string[];
  /**
   * Price for 1 serving (dish: the first amount in the last cell) or per
   * standard unit (ingredient: every amount in the last cell, since one cell
   * may give "₹96/kg, about ₹4–6 per lemon"). A written range stays a range;
   * empty when the row shows no price.
   */
  prices: { min: number; max: number }[];
  /** The research marks the row as dropped, excluded, trimmed, reference or context only. */
  excluded: boolean;
  /** The research marks the listing as out of stock, sold out, closed or not taking orders. */
  outOfStock: boolean;
  /** The row says the outlet is outside Mumbai city (Thane, Navi Mumbai, …). */
  outsideCity: boolean;
};

/** What the listing table says about one researched range. */
export type ListingEvidence = { listingCount: number | null; platforms: string[]; outOfStock: boolean };

/** Inputs of the check: the range as written plus what backs it. */
export type PriceCheckInput = ListingEvidence & { min: number; max: number; avg: number | null; median: number | null };

const KNOWN_PLATFORMS: [RegExp, string][] = [
  [/swiggy instamart|instamart/i, 'Swiggy Instamart'],
  [/swiggy/i, 'Swiggy'],
  [/zomato/i, 'Zomato'],
  [/magicpin/i, 'magicpin'],
  [/bigbasket/i, 'BigBasket'],
  [/blinkit/i, 'Blinkit'],
  [/zepto/i, 'Zepto'],
  [/jiomart/i, 'JioMart'],
  [/amazon/i, 'Amazon'],
  [/flipkart/i, 'Flipkart'],
  [/dunzo/i, 'Dunzo'],
  [/storeking/i, 'StoreKing'],
  [/oneindia/i, 'OneIndia'],
  [/justdial/i, 'Justdial'],
];

const EXCLUDED = /\b(dropped|excluded|not used|trimmed|context only|not counted|reference|cross-check|combo)\b/i;
const OUT_OF_STOCK = /out of stock|sold out|unavailable|not accepting orders|not delivering|\bclosed\b|listing inactive/i;
const PRICE = /₹\s*([\d,]+(?:\.\d+)?)(?:\s*(?:[–-]|to)\s*₹?\s*([\d,]+(?:\.\d+)?))?/g;

/** "Swiggy (Mumbai dish page)" → ["Swiggy"]; "Zomato and magicpin" → ["Zomato", "magicpin"]; unknown names kept as written. */
export function normalisePlatforms(cell: string): string[] {
  // Brackets hold remarks ("own website (says it delivers via Swiggy and Zomato)"), not the platform.
  const text = plain(cell).replace(/^\*[^*]*\*\s*/, '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const found: string[] = [];
  let rest = text;
  for (const [re, name] of KNOWN_PLATFORMS) {
    if (re.test(rest)) {
      found.push(name);
      rest = rest.replace(re, ' ');
    }
  }
  if (found.length > 0) return found;
  const own = text.replace(/\*/g, '').trim();
  return own ? [own] : [];
}

function pricesOf(cell: string): ListingRow['prices'] {
  const out: ListingRow['prices'] = [];
  for (const m of plain(cell).matchAll(PRICE)) {
    const a = num(m[1]);
    const b = m[2] ? num(m[2]) : a;
    if (a != null && b != null) out.push({ min: Math.min(a, b), max: Math.max(a, b) });
  }
  return out;
}

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

/**
 * Rows of the first listing table in `body` (dish section 6: the table with a
 * "Platform" column; ingredient "Price" section: the table whose first column
 * is "Source"). The last column is the per-serving / per-unit price. Null
 * when there is no such table.
 */
export function parseListingTable(body: string, kind: 'dish' | 'ingredient'): ListingRow[] | null {
  const lines = body.split('\n');
  const isHeader = (l: string) => (kind === 'dish' ? /\|\s*platform\s*\|/i.test(l) : /^\|\s*source\s*\|/i.test(l.trim()));
  const start = lines.findIndex((l) => l.trim().startsWith('|') && isHeader(l));
  if (start < 0) return null;
  const head = cells(lines[start]).map((c) => c.toLowerCase());
  const platformCol = kind === 'dish' ? head.findIndex((c) => c === 'platform') : -1;
  const rows: ListingRow[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const c = cells(line);
    if (c.every((x) => /^:?-{2,}:?$/.test(x) || x === '')) continue;
    const last = c[c.length - 1] ?? '';
    const source = c[0] ?? '';
    const platformCell = platformCol >= 0 ? (c[platformCol] ?? '') : source.split(/:|\s[–-]\s|,/)[0];
    const marked = kind === 'dish' ? last : `${source} ${last}`;
    const prices = /^not found\b/i.test(plain(last).trim()) ? [] : pricesOf(last);
    rows.push({
      source: plain(source).trim(),
      platforms: normalisePlatforms(platformCell),
      prices: kind === 'dish' ? prices.slice(0, 1) : prices,
      excluded: EXCLUDED.test(plain(marked)) || /^\*/.test(source),
      outOfStock: OUT_OF_STOCK.test(plain(c.join(' '))),
      outsideCity: /outside (?:the )?mumbai city/i.test(plain(c.join(' '))),
    });
  }
  return rows;
}

/**
 * Listings backing a range: rows the research kept whose price falls inside
 * [min − tolerance, max + tolerance] (the research rounds, e.g. ₹209.64 → ₹210).
 * When the range is stated for "Mumbai city" only, rows marked outside the
 * city do not back it. Rows are distinct by source and platform.
 * Null count when the table could not be read.
 */
export function listingEvidence(
  rows: ListingRow[] | null,
  range: { min: number; max: number },
  tolerance: number,
  opts: { cityOnly?: boolean } = {},
): ListingEvidence {
  if (!rows) return { listingCount: null, platforms: [], outOfStock: false };
  const priced = rows.filter((r) => r.prices.length > 0);
  if (priced.length === 0) return { listingCount: null, platforms: [], outOfStock: false };
  const inRange = (p: { min: number; max: number }) => p.max >= range.min - tolerance && p.min <= range.max + tolerance;
  const used = priced.filter((r) => !r.excluded && !(opts.cityOnly && r.outsideCity) && r.prices.some(inRange));
  const keys = new Set(used.map((r) => `${r.source.toLowerCase()}|${r.platforms.join('+')}`));
  const platforms = [...new Set(used.flatMap((r) => r.platforms))].sort((a, b) => a.localeCompare(b));
  return { listingCount: keys.size, platforms, outOfStock: used.some((r) => r.outOfStock) };
}

const rs = (v: number) => `₹${Number.isInteger(v) ? v : v.toFixed(2)}`;

/** The three FIX 2 rules. `confirmed` is true only when no rule fires. */
export function checkPrice(input: PriceCheckInput): PriceCheck {
  const notes: string[] = [];
  const { min, max } = input;
  const range = `${rs(min)}–${rs(max)}`;
  if (input.avg != null && (input.avg < min || input.avg > max)) notes.push(`average ${rs(input.avg)} lies outside the range ${range}`);
  if (input.median != null && (input.median < min || input.median > max)) notes.push(`median ${rs(input.median)} lies outside the range ${range}`);
  if (input.listingCount != null && input.listingCount < MIN_LISTINGS) {
    notes.push(`only ${input.listingCount} ${input.listingCount === 1 ? 'listing backs' : 'listings back'} the range (need ${MIN_LISTINGS})`);
  }
  if (input.platforms.length === 1) notes.push(`only 1 platform (${input.platforms[0]}) backs the range`);
  if (input.outOfStock) notes.push('a listing used for the range is marked out of stock, closed or not taking orders');
  return { listingCount: input.listingCount, platforms: input.platforms, outOfStock: input.outOfStock, confirmed: notes.length === 0, checkNotes: notes };
}
