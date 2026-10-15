import type { DateKey } from './common';

/**
 * Priority plan P2 (5.2): the per-user data that was not synced before.
 * Everything here lives under `users/{uid}/…` like the logs, keyed to the
 * Google account's uid. Vendor catalogue, menu or price data is never stored
 * (Swiggy data rules); only FitPlate's own ids and the user's own choices.
 */

export type VendorId = 'instamart' | 'zepto' | 'blinkit';

/** One document, id "settings". */
export type UserSettings = {
  units: 'metric';
  /** Vendor the checkout sheet opens on first. Blinkit stays in the model but is hidden (parked). */
  preferredVendor: VendorId | null;
  /**
   * The brand / pack the user picked per ingredient, by FitPlate ingredient key
   * (research id, or the normalised name). The value is FitPlate's own variant
   * label ("Amul · 200 g"), never a vendor SKU or price.
   */
  brandChoice: Record<string, string>;
  /** User-facing switches (e.g. "showSampleBanner"). */
  featureToggles: Record<string, boolean>;
  /** P3c: the user agreed that FitPlate may read their Swiggy Food order history for insights. */
  swiggyOrderInsights: boolean;
};

export const DEFAULT_SETTINGS: UserSettings = {
  units: 'metric',
  preferredVendor: null,
  brandChoice: {},
  featureToggles: {},
  swiggyOrderInsights: false,
};

export type ShoppingItem = {
  /** Stable key: research ingredient id, or `name:<normalised name>`. */
  key: string;
  ingredientId: string | null;
  name: string;
  /** Total across the list's dishes, null when a dish gives no amount. */
  quantity: number | null;
  unit: string | null;
  /** Which dishes need it. */
  dishIds: string[];
  /** The whole-ingredient checkbox: buy it or not. */
  included: boolean;
  /** Ticked off at the shop or when it arrived. */
  checked: boolean;
  /** Chosen variant label (see UserSettings.brandChoice). */
  variant: string | null;
};

export type ShoppingStatus = 'open' | 'ordered' | 'done';

/** A basket in progress, so it can be started on the laptop and finished on the phone. */
export type ShoppingList = {
  title: string;
  dishIds: string[];
  /** Servings per dish id. */
  servings: Record<string, number>;
  items: ShoppingItem[];
  status: ShoppingStatus;
  /** Where it was bought: a vendor, or "self" for the plain "Continue". */
  boughtVia: VendorId | 'self' | null;
  orderedAt: number | null;
};

/** Append-only weight entry. */
export type WeightLog = {
  timestamp: number;
  dateKey: DateKey;
  kg: number;
  demoSample?: boolean;
};

/** The user's own rating of a dish (id = dishId). Feeds the post-launch FitPlate Score. */
export type DishRating = {
  dishId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  note: string | null;
};

/** Append-only: one finished cook. */
export type CookCompletion = {
  timestamp: number;
  dateKey: DateKey;
  dishId: string;
  servings: number;
  /** FitPlate's estimate of what it cost to make, when known. */
  costInr: number | null;
  /** What ordering would have cost (research estimate or the live bill the user saw), when known. */
  orderPriceInr: number | null;
  /** How the ingredients were bought. */
  boughtVia: VendorId | 'self' | null;
  demoSample?: boolean;
};
