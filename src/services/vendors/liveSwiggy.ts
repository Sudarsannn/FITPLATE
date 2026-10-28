import { FITPLATE_API_KEY, FITPLATE_API_URL } from './config';
import * as N from './normalize';
import { VendorError, type InstamartApi, type SwiggyFoodApi, type VendorErrorCode } from './types';

/**
 * Live Swiggy, through the local FitPlate server (server/fitplate-server.mjs),
 * which holds the Swiggy login and talks to Swiggy's official MCP servers.
 * Tokens never reach the app. Request and response bodies are never logged.
 */
type Server = 'im' | 'food';

const keyHeader = (): Record<string, string> => (FITPLATE_API_KEY ? { 'X-FitPlate-Key': FITPLATE_API_KEY } : {});

/** True when the server is hosted off this computer, so login is by pasting the return address. */
export const hostedLogin = (): boolean => Boolean(FITPLATE_API_KEY);

export async function callSwiggy(server: Server, tool: string, args: Record<string, unknown> = {}, base = FITPLATE_API_URL, fetcher: typeof fetch = fetch): Promise<unknown> {
  if (!base) throw new VendorError('OFFLINE', 'The FitPlate server is not set up on this device.');
  let res: Response;
  try {
    res = await fetcher(`${base}/api/swiggy/${server}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...keyHeader() },
      body: JSON.stringify({ tool, args }),
    });
  } catch {
    throw new VendorError('OFFLINE', 'Can’t reach the FitPlate server on this computer. Is `npm run server` running?');
  }
  let body: { ok?: boolean; data?: unknown; code?: VendorErrorCode; message?: string } = {};
  try {
    body = await res.json();
  } catch {
    // fall through to the status code
  }
  if (res.ok && body.ok) return body.data;
  const code: VendorErrorCode = body.code ?? (res.status === 401 ? 'AUTH' : res.status === 429 ? 'RATE_LIMIT' : res.status >= 500 ? 'SERVER' : 'OTHER');
  throw new VendorError(code, body.message ?? `Swiggy ${tool} failed (${res.status}).`);
}

async function status(server: Server, base = FITPLATE_API_URL): Promise<{ connected: boolean }> {
  if (!base) return { connected: false };
  try {
    const r = await fetch(`${base}/api/swiggy/${server}/status`, { headers: keyHeader() });
    const j = await r.json();
    return { connected: Boolean(j.connected) };
  } catch {
    throw new VendorError('OFFLINE', 'Can’t reach the FitPlate server on this computer. Is `npm run server` running?');
  }
}

const connectUrl = (server: Server, returnTo: string) => (FITPLATE_API_URL ? `${FITPLATE_API_URL}/api/swiggy/${server}/connect?return=${encodeURIComponent(returnTo)}` : null);

/** Hosted login step 1: the Swiggy sign-in address to open. `connected: true` means no sign-in is needed. */
export async function hostedAuthUrl(server: Server, base = FITPLATE_API_URL, fetcher: typeof fetch = fetch): Promise<{ connected: boolean; authUrl: string | null }> {
  if (!base) throw new VendorError('OFFLINE', 'The FitPlate server is not set up on this device.');
  let res: Response;
  try {
    res = await fetcher(`${base}/api/swiggy/${server}/auth-url`, { headers: keyHeader() });
  } catch {
    throw new VendorError('OFFLINE', 'Can’t reach the FitPlate server.');
  }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new VendorError(res.status === 401 ? 'AUTH' : 'SERVER', j.message ?? 'Couldn’t start the Swiggy sign-in.');
  return { connected: Boolean(j.connected), authUrl: j.authUrl ?? null };
}

/** Hosted login step 2: send back the address Swiggy redirected to (or just the code). */
export async function hostedFinish(server: Server, text: string, base = FITPLATE_API_URL, fetcher: typeof fetch = fetch): Promise<void> {
  if (!base) throw new VendorError('OFFLINE', 'The FitPlate server is not set up on this device.');
  let res: Response;
  try {
    res = await fetcher(`${base}/api/swiggy/${server}/finish`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...keyHeader() }, body: JSON.stringify({ text }) });
  } catch {
    throw new VendorError('OFFLINE', 'Can’t reach the FitPlate server.');
  }
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new VendorError(j.code ?? 'OTHER', j.message ?? 'Swiggy didn’t accept that.');
}

/** Is the local FitPlate server running? */
export async function serverHealth(base = FITPLATE_API_URL): Promise<{ running: boolean; checkoutLive: boolean }> {
  if (!base) return { running: false, checkoutLive: false };
  try {
    const r = await fetch(`${base}/api/health`);
    const j = await r.json();
    return { running: Boolean(j.ok), checkoutLive: Boolean(j.checkoutLive) };
  } catch {
    return { running: false, checkoutLive: false };
  }
}

export function createLiveInstamart(): InstamartApi {
  const call = (tool: string, args: Record<string, unknown> = {}) => callSwiggy('im', tool, args);
  return {
    mode: 'live',
    status: () => status('im'),
    connectUrl: (returnTo) => connectUrl('im', returnTo),
    disconnect: async () => {
      if (FITPLATE_API_URL) await fetch(`${FITPLATE_API_URL}/api/swiggy/im/logout`, { method: 'POST', headers: keyHeader() }).catch(() => {});
    },
    getAddresses: async () => N.toAddresses(await call('get_addresses')),
    createAddress: async (text) => {
      const a = N.toAddress((await call('create_address', { address: text })) as unknown) ?? N.toAddresses(await call('get_addresses')).slice(-1)[0];
      if (!a) throw new VendorError('OTHER', 'Swiggy didn’t accept that address.');
      return a;
    },
    searchProducts: async (query, addressId) => N.toProducts(await call('search_products', { query, addressId })),
    yourGoToItems: async (addressId) => N.toProducts(await call('your_go_to_items', { addressId })),
    updateCart: async (addressId, items) => N.toCart(await call('update_cart', { addressId, items })),
    getCart: async (addressId) => N.toCart(await call('get_cart', { addressId })),
    clearCart: async () => {
      await call('clear_cart');
    },
    listCoupons: async (addressId) => N.toCoupons(await call('list_coupons', { addressId })),
    applyCoupon: async (addressId, code) => N.toCart(await call('apply_coupon', { addressId, couponCode: code })),
    getPaymentOptions: async (addressId) => N.toPaymentMethods(await call('get_payment_options', { addressId })),
    checkout: async (addressId, paymentMethodId) => N.toPlacedOrder(await call('checkout', { addressId, paymentMethod: paymentMethodId })),
    checkPaymentStatus: async (orderId) => N.toPaymentStatus(await call('check_payment_status', { orderId })),
    confirmOrder: async (orderId) => {
      await call('confirm_order', { orderId });
    },
    trackOrder: async (orderId) => N.toTracking(await call('track_order', { orderId }), orderId),
    getOrders: async () => N.toOrders(await call('get_orders')),
  };
}

export function createLiveFood(): SwiggyFoodApi {
  const call = (tool: string, args: Record<string, unknown> = {}) => callSwiggy('food', tool, args);
  return {
    mode: 'live',
    status: () => status('food'),
    connectUrl: (returnTo) => connectUrl('food', returnTo),
    getAddresses: async () => N.toAddresses(await call('get_addresses')),
    searchMenu: async (query, addressId, vegOnly) => N.toMenu(await call('search_menu', { query, addressId, vegFilter: vegOnly })),
    searchRestaurants: async (query, addressId) => N.toRestaurants(await call('search_restaurants', { query, addressId })),
    getRestaurantMenu: async (restaurantId, addressId) => N.toMenu(await call('get_restaurant_menu', { restaurantId, addressId }), { id: restaurantId, name: null }),
    updateFoodCart: async (addressId, restaurantId, items) => N.toFoodCart(await call('update_food_cart', { addressId, restaurantId, items })),
    getFoodCart: async (addressId) => N.toFoodCart(await call('get_food_cart', { addressId })),
    flushFoodCart: async () => {
      await call('flush_food_cart');
    },
    getPaymentOptions: async (addressId) => N.toPaymentMethods(await call('get_payment_options', { addressId })),
    placeFoodOrder: async (addressId, paymentMethodId) => N.toPlacedOrder(await call('place_food_order', { addressId, paymentMethod: paymentMethodId })),
    checkPaymentStatus: async (orderId) => N.toPaymentStatus(await call('check_payment_status', { orderId })),
    confirmOrder: async (orderId) => {
      await call('confirm_order', { orderId });
    },
    trackFoodOrder: async (orderId) => N.toTracking(await call('track_food_order', { orderId }), orderId),
    getFoodOrders: async () => N.toPastFoodOrders(await call('get_food_orders')),
  };
}
