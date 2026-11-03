import { describe, expect, it } from '@jest/globals';

import { getIngredient } from '../data/research';
import { mergeVendorListings, parseVendorListings } from '../services/data/vendorListings';
import { cheapestVendor, vendorRows } from '../services/vendors/vendorCompare';

const TABLE = `| Source | Pack size | Pack price | Price per standard unit |
|---|---|---|---|
| Zepto, Amul Taaza toned fresh milk (category page; date not shown) | 500 ml pouch | ₹28 | ₹56/L |
| Swiggy Instamart (Mumbai page), Gokul toned milk | 1 L | ₹60-62 | ₹61/L |
| Blinkit, Nandini milk | 500 ml | ₹26 | ₹52/L |
| BigBasket, Amul milk | 1 L | ₹58 | ₹58/L |
| Zepto, Mother Dairy (dropped, out of stock) | 1 L | ₹70 | ₹70/L |
| Zepto, Heritage | 1 L | | |
`;

describe('parseVendorListings', () => {
  const rows = parseVendorListings(TABLE, '2026-10-30');
  it('keeps only quick-commerce rows with a pack price', () => {
    expect(rows.map((r) => r.vendor)).toEqual(['zepto', 'instamart', 'blinkit']);
  });
  it('reads product, pack and a price range', () => {
    expect(rows[1]).toMatchObject({ product: 'Gokul toned milk', pack: '1 L', priceMinInr: 60, priceMaxInr: 62, observedOn: '2026-10-30' });
  });
  it('returns nothing without a price table', () => {
    expect(parseVendorListings('no table', '2026-10-30')).toEqual([]);
  });
});

describe('mergeVendorListings', () => {
  it('keeps the newest sighting of the same product and pack', () => {
    const a = parseVendorListings(TABLE, '2026-10-30');
    const b = parseVendorListings(TABLE.replace('₹28', '₹30'), '2026-11-01');
    const m = mergeVendorListings([a, b]);
    expect(m.filter((l) => l.vendor === 'zepto')).toHaveLength(1);
    expect(m.find((l) => l.vendor === 'zepto')?.priceMinInr).toBe(30);
  });
});

describe('vendorRows', () => {
  const ls = parseVendorListings(TABLE, '2026-10-30');
  it('hides Blinkit unless asked, and links Zepto and Instamart searches', () => {
    const r = vendorRows(ls, 'milk', false);
    expect(r.map((x) => x.vendor)).toEqual(['zepto', 'instamart']);
    expect(r[0].url).toContain('zepto.com/search');
    expect(r[1].url).toContain('instamart/search');
  });
  it('says so when a vendor has no listing and never invents a price', () => {
    const r = vendorRows([], 'milk', true);
    expect(r.every((x) => x.priceLabel === 'no listing seen' && x.seenLabel === null)).toBe(true);
    expect(r.find((x) => x.vendor === 'blinkit')?.url).toBeNull();
  });
  it('labels sightings as not live and names the lowest only with two vendors', () => {
    const r = vendorRows(ls, 'milk', false);
    expect(r[0].seenLabel).toMatch(/not live/);
    expect(cheapestVendor(r)).toBe('zepto');
    expect(cheapestVendor(vendorRows(ls.slice(0, 1), 'milk', false))).toBeNull();
  });
});

describe('bundled ingredient data', () => {
  it('carries vendor sightings for at least some ingredients', () => {
    const milk = getIngredient('milk');
    expect(Array.isArray(milk?.vendorListings ?? [])).toBe(true);
  });
});

describe('stale sightings', () => {
  const l = [{ vendor: 'zepto' as const, product: null, pack: '1 L', priceMinInr: 60, priceMaxInr: 60, observedOn: '2026-10-01' }];
  it('flags a sighting older than 14 days, but not without a clock or when fresh', () => {
    const day = Date.UTC(2026, 10, 3);
    expect(vendorRows(l, 'milk', false, day)[0].seenLabel).toMatch(/over 14 days old/);
    expect(vendorRows(l, 'milk', false, Date.UTC(2026, 9, 10))[0].seenLabel).not.toMatch(/old/);
    expect(vendorRows(l, 'milk', false)[0].seenLabel).not.toMatch(/old/);
  });
});
