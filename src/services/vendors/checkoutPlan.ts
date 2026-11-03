import { getIngredient } from '../../data/research';
import type { ShoppingItem, ShoppingList } from '../../models/prefs';
import { itemAmountLabel, offlineVariants, type VariantOption } from './basket';

/**
 * Day 15G2: what the mandatory confirmation screen shows before any cart push (SPEC-ADDENDA §7).
 * Pure functions, so every number on that screen is testable. Totals use only prices FitPlate knows
 * and say how many it does not; they are estimates, never a bill.
 */
export type CheckoutVendor = 'zepto' | 'instamart';

export type CheckoutLine = {
  key: string;
  name: string;
  amount: string;
  /** The chosen brand and pack, or null when the choice is "any brand". */
  variant: string | null;
  priceInr: number | null;
};

export type CheckoutPlan = {
  vendor: CheckoutVendor;
  lines: CheckoutLine[];
  estimatedTotalInr: number;
  /** Lines whose price FitPlate does not know; the total leaves them out. */
  unpriced: number;
};

export const VENDOR_NAMES: Record<CheckoutVendor, string> = { zepto: 'Zepto', instamart: 'Swiggy Instamart' };

function chosenOption(item: ShoppingItem): VariantOption | undefined {
  const options = offlineVariants(item, item.ingredientId ? getIngredient(item.ingredientId) : undefined);
  return options.find((o) => o.label === item.variant) ?? options[0];
}

export function buildCheckoutPlan(list: Pick<ShoppingList, 'items'>, vendor: CheckoutVendor): CheckoutPlan {
  const lines = list.items
    .filter((i) => i.included)
    .map<CheckoutLine>((i) => {
      const o = chosenOption(i);
      return { key: i.key, name: i.name, amount: itemAmountLabel(i), variant: i.variant ?? o?.label ?? null, priceInr: o?.priceInr ?? null };
    });
  const priced = lines.filter((l) => l.priceInr != null);
  return { vendor, lines, estimatedTotalInr: priced.reduce((s, l) => s + (l.priceInr ?? 0), 0), unpriced: lines.length - priced.length };
}
