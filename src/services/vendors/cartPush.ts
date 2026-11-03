import { featureFlags } from '../../config/featureFlags';
import { instamartSearchUrl, zeptoSearchUrl } from './openApp';
import type { CheckoutPlan, CheckoutVendor } from './checkoutPlan';

/**
 * Day 15G2: the cart-push seam, written against the vendors' OFFICIAL integrations only.
 * Nothing here calls a vendor. The adapters are placeholders: they report "not configured" until
 * Sudarsan has an official partner or API agreement and credentials (USER ACTION). Payment never
 * happens inside FitPlate. The `vendorCheckout` flag stays OFF.
 */
export type CartPushResult =
  | { ok: true; openUrl: string }
  | { ok: false; reason: 'flag-off' | 'not-confirmed' | 'not-configured' | 'empty' | 'failed'; message: string };

export type CartPushAdapter = {
  vendor: CheckoutVendor;
  /** True only when official credentials are present in the server config (never in the app bundle). */
  configured: boolean;
  /** TODO(official-integration): send the plan's lines to the vendor cart and return the cart URL. */
  push: (plan: CheckoutPlan) => Promise<{ cartUrl: string }>;
};

const placeholder = (vendor: CheckoutVendor): CartPushAdapter => ({
  vendor,
  configured: false,
  push: async () => {
    throw new Error(`${vendor}: official cart integration not set up yet`);
  },
});

export const ADAPTERS: Record<CheckoutVendor, CartPushAdapter> = { zepto: placeholder('zepto'), instamart: placeholder('instamart') };

/** Fallback when no official integration exists: open the vendor's search for the first item, and the user adds the rest. */
export const searchFallbackUrl = (plan: CheckoutPlan): string | null => {
  const first = plan.lines[0]?.name;
  if (!first) return null;
  return plan.vendor === 'zepto' ? zeptoSearchUrl(first) : instamartSearchUrl(first);
};

export async function pushCart(plan: CheckoutPlan, confirmed: boolean, adapters: Record<CheckoutVendor, CartPushAdapter> = ADAPTERS, flags: { vendorCheckout: boolean } = featureFlags): Promise<CartPushResult> {
  if (!flags.vendorCheckout) return { ok: false, reason: 'flag-off', message: 'Checkout through grocery apps is not switched on yet.' };
  if (!confirmed) return { ok: false, reason: 'not-confirmed', message: 'Confirm the items first.' };
  if (!plan.lines.length) return { ok: false, reason: 'empty', message: 'Nothing is ticked to buy.' };
  const adapter = adapters[plan.vendor];
  if (!adapter.configured) return { ok: false, reason: 'not-configured', message: 'This app is not connected to FitPlate yet.' };
  try {
    return { ok: true, openUrl: (await adapter.push(plan)).cartUrl };
  } catch {
    return { ok: false, reason: 'failed', message: 'Could not send the items. Try again, or add them in the app yourself.' };
  }
}
