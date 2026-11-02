import type { VendorListing } from '../../models/research';
import { instamartSearchUrl, zeptoSearchUrl } from './openApp';

/**
 * Day 15G1: per-vendor price comparison for one ingredient, built only from listings the
 * research actually saw (search snippets, not live feeds). Blinkit stays hidden until the
 * `vendorBlinkit` flag is on. A vendor with no sighting says so; nothing is invented.
 */
export type VendorKey = 'zepto' | 'instamart' | 'blinkit';
export type VendorRow = {
  vendor: VendorKey;
  name: string;
  /** Cheapest sighted pack, or null when none was seen. */
  cheapest: VendorListing | null;
  priceLabel: string;
  seenLabel: string | null;
  url: string | null;
};

const NAME: Record<VendorKey, string> = { zepto: 'Zepto', instamart: 'Instamart', blinkit: 'Blinkit' };

const fmtDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
};

export const priceLabel = (l: VendorListing) =>
  `${l.priceMinInr === l.priceMaxInr ? `₹${l.priceMinInr}` : `₹${l.priceMinInr} to ₹${l.priceMaxInr}`}${l.pack ? ` for ${l.pack}` : ''}`;

export function vendorRows(listings: VendorListing[] | undefined, query: string, showBlinkit: boolean): VendorRow[] {
  const vendors: VendorKey[] = showBlinkit ? ['zepto', 'instamart', 'blinkit'] : ['zepto', 'instamart'];
  return vendors.map((vendor) => {
    const mine = (listings ?? []).filter((l) => l.vendor === vendor);
    const cheapest = mine.reduce<VendorListing | null>((b, l) => (!b || l.priceMinInr < b.priceMinInr ? l : b), null);
    const url = vendor === 'zepto' ? zeptoSearchUrl(query) : vendor === 'instamart' ? instamartSearchUrl(query) : null;
    return {
      vendor,
      name: NAME[vendor],
      cheapest,
      priceLabel: cheapest ? priceLabel(cheapest) : 'no listing seen',
      seenLabel: cheapest ? `seen ${fmtDate(cheapest.observedOn)}, not live` : null,
      url,
    };
  });
}

/** The vendor with the lowest sighted price, only when at least two vendors have one. */
export function cheapestVendor(rows: VendorRow[]): VendorKey | null {
  const priced = rows.filter((r) => r.cheapest);
  if (priced.length < 2) return null;
  return priced.reduce((b, r) => (r.cheapest!.priceMinInr < b.cheapest!.priceMinInr ? r : b)).vendor;
}
