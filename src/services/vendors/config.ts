/**
 * Vendor settings (priority plan P3). Public values only; tokens never reach
 * the app (they stay in the local FitPlate server, server/fitplate-server.mjs).
 */

/** The local FitPlate server, e.g. http://localhost:8787. Unset on Netlify, so the website uses sample mode. */
export const FITPLATE_API_URL: string | null = process.env.EXPO_PUBLIC_FITPLATE_API_URL || null;

/**
 * Real Swiggy orders are off unless this is true AND the local server was
 * started with CHECKOUT_LIVE=true. Off, the flow stops at the confirmation screen.
 */
export const CHECKOUT_LIVE: boolean = process.env.EXPO_PUBLIC_CHECKOUT_LIVE === 'true';

/** Swiggy's minimum Instamart order (PDF section 6). */
export const INSTAMART_MIN_ORDER = 99;

/** Order tracking never polls faster than this. */
export const TRACK_POLL_MS = 15_000;

/** After returning from the UPI app, at most this many payment checks, this far apart. */
export const PAYMENT_CHECKS = 5;
export const PAYMENT_CHECK_GAP_MS = 3000;

/** Vendors shown in the checkout sheet. Blinkit stays in the data model but is parked (no official access). */
export const VENDOR_VISIBLE = { instamart: true, zepto: true, blinkit: false } as const;

/**
 * Food and grocery app hook-ups are paused (Sudarsan, 22 Oct 2026) until the
 * real iPhone/Android app exists. While paused, every vendor shows as a
 * logo placeholder ("Coming with the app") and nothing calls a vendor.
 */
export const VENDORS_PAUSED = true;
