import type { VendorListing } from '../../models/research';
import { normalisePlatforms } from './priceChecks';
import { plain } from './markdown';

/**
 * Day 15G1: the quick-commerce listings an ingredient file's price table names
 * (Zepto, Swiggy Instamart, Blinkit), kept per vendor so the shopping list can show
 * what each vendor was seen charging. These come from search-result snippets, not live
 * vendor feeds, so the app always shows them with their date. Only plain rows count:
 * context, dropped and out-of-stock rows, other cities and rows without a pack price are skipped.
 */
const VENDOR_OF: Record<string, VendorListing['vendor']> = { Zepto: 'zepto', 'Swiggy Instamart': 'instamart', Blinkit: 'blinkit' };

const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const RUPEE = /₹\s*([\d,]+(?:\.\d+)?)(?:\s*(?:[–-]|to)\s*₹?\s*([\d,]+(?:\.\d+)?))?/;
const SKIP = /\b(dropped|excluded|not used|trimmed|context only|not counted|reference|cross-check|combo|suspect)\b|out of stock|sold out|unavailable|not accepting|not delivering|\bclosed\b|outside (?:the )?mumbai city/i;

export function parseVendorListings(priceBody: string, observedOn: string): VendorListing[] {
  const lines = priceBody.split('\n');
  const start = lines.findIndex((l) => /^\|\s*source\s*\|/i.test(l.trim()));
  if (start < 0) return [];
  const head = cells(lines[start]).map((c) => c.toLowerCase());
  const packCol = head.findIndex((c) => /pack size/.test(c));
  const priceCol = head.findIndex((c) => /pack price/.test(c));
  if (priceCol < 0) return [];
  const out: VendorListing[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const c = cells(line);
    if (c.every((x) => /^:?-{2,}:?$/.test(x) || x === '')) continue;
    const source = c[0] ?? '';
    if (/^\*/.test(source) || SKIP.test(plain(c.join(' ')))) continue;
    const m = RUPEE.exec(plain(c[priceCol] ?? ''));
    if (!m) continue;
    const a = Number(m[1].replace(/,/g, ''));
    const b = m[2] ? Number(m[2].replace(/,/g, '')) : a;
    const head0 = plain(source).split(/:|,/)[0];
    const vendor = normalisePlatforms(head0).map((p) => VENDOR_OF[p]).find(Boolean);
    if (!vendor || !(a > 0)) continue;
    // "Swiggy Instamart (Mumbai page), Gokul toned milk (page data updated 6 Jun 2026)" → "Gokul toned milk"
    const product = plain(source).replace(/\([^)]*\)/g, ' ').split(',').slice(1).join(',').replace(/\s+/g, ' ').trim() || null;
    out.push({ vendor, product, pack: packCol >= 0 ? plain(c[packCol] ?? '').trim() || null : null, priceMinInr: Math.min(a, b), priceMaxInr: Math.max(a, b), observedOn });
  }
  return out;
}

/** The newest sighting of each vendor's product across versions, oldest sightings dropped. Cheapest first per vendor. */
export function mergeVendorListings(all: VendorListing[][]): VendorListing[] {
  const byKey = new Map<string, VendorListing>();
  for (const list of all)
    for (const l of list) {
      const k = `${l.vendor}|${(l.product ?? '').toLowerCase()}|${(l.pack ?? '').toLowerCase()}`;
      const have = byKey.get(k);
      if (!have || have.observedOn <= l.observedOn) byKey.set(k, l);
    }
  return [...byKey.values()].sort((x, y) => x.vendor.localeCompare(y.vendor) || x.priceMinInr - y.priceMinInr);
}
