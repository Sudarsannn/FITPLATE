/**
 * Vendor shapes FitPlate works with (priority plan P3, PDF sections 6 to 9).
 * The live data comes from Swiggy's official MCP tools through the local
 * FitPlate server; sample mode fills the same shapes with made-up data.
 * None of this is ever written to Firestore or the research library: it lives
 * only for the user's current task (Swiggy data rules).
 */

/** One product at the user's address (Instamart `search_products`). */
export type VendorProduct = {
  /** SKU id the cart takes. */
  skuId: string;
  name: string;
  brand: string | null;
  /** "500 g", "1 l", "6 pcs". */
  packSize: string | null;
  /** Pack size in grams or millilitres when it can be read from packSize. */
  packGrams: number | null;
  mrp: number | null;
  offerPrice: number | null;
  /** Price per 100 g / 100 ml, from the vendor or worked out from the pack. */
  pricePer100: number | null;
  inStock: boolean;
  imageUrl: string | null;
  rating: number | null;
  /** Delivery time in minutes, when shown. */
  etaMin: number | null;
  veg: boolean | null;
  purchaseCap: number | null;
  /** Swaps offered when out of stock. */
  similar: VendorProduct[];
};

export type Address = {
  id: string;
  /** "Home", "Work". */
  label: string;
  /** One line for the picker. Shown to the user only; never stored by FitPlate. */
  line: string;
};

export type CartLine = { skuId: string; name: string; quantity: number; price: number | null; inStock: boolean; similar: VendorProduct[] };

export type BillLine = { label: string; amount: number };

export type Cart = {
  lines: CartLine[];
  /** Item total, delivery, handling, taxes, discounts (negative), … */
  bill: BillLine[];
  toPay: number | null;
  appliedCoupon: string | null;
  paymentMethods: PaymentMethod[];
  /** Problems the vendor reported (see CheckoutIssue). */
  issues: CheckoutIssue[];
};

export type Coupon = { code: string; description: string; saving: number | null; applicable: boolean };

export type PaymentMethod = { id: string; kind: 'upi' | 'cod' | 'other'; label: string };

export type CheckoutIssue =
  | { code: 'MIN_ORDER_NOT_MET'; minimum: number; message: string }
  | { code: 'ADDRESS_NOT_SERVICEABLE'; message: string }
  | { code: 'OUT_OF_STOCK'; skuId: string; name: string; message: string; similar: VendorProduct[] }
  | { code: 'OTHER'; message: string };

/** What `checkout` returns. UPI orders start as pending payment. */
export type PlacedOrder = {
  orderId: string;
  status: 'pending-payment' | 'placed';
  /** UPI intent or payment page to open in the user's UPI app. */
  paymentUrl: string | null;
  toPay: number | null;
};

export type PaymentStatus = 'pending' | 'success' | 'failed';

export type Tracking = {
  orderId: string;
  status: string;
  etaMin: number | null;
  delivered: boolean;
};

/** Error codes the vendor clients throw; the screens show each one plainly. */
export type VendorErrorCode =
  | 'AUTH' // 401: connect Swiggy again
  | 'RATE_LIMIT' // 429: back off
  | 'SERVER' // 5xx: never retry checkout after this without checking orders first
  | 'NOT_LIVE' // CHECKOUT_LIVE is off
  | 'OFFLINE' // local FitPlate server not running
  | 'UNSUPPORTED'
  | 'OTHER';

export class VendorError extends Error {
  constructor(
    public code: VendorErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'VendorError';
  }
}

/** Swiggy Instamart (PDF 9.1). Sample and live clients both implement it. */
export type InstamartApi = {
  readonly mode: 'sample' | 'live';
  status(): Promise<{ connected: boolean }>;
  /** Live: the URL that starts "Connect Swiggy" (phone number + OTP in the browser). */
  connectUrl(returnTo: string): string | null;
  disconnect(): Promise<void>;
  getAddresses(): Promise<Address[]>;
  createAddress(text: string): Promise<Address>;
  searchProducts(query: string, addressId: string): Promise<VendorProduct[]>;
  yourGoToItems(addressId: string): Promise<VendorProduct[]>;
  /** Replaces the whole cart, so always send the full list. */
  updateCart(addressId: string, items: { skuId: string; quantity: number }[]): Promise<Cart>;
  getCart(addressId: string): Promise<Cart>;
  clearCart(): Promise<void>;
  listCoupons(addressId: string): Promise<Coupon[]>;
  applyCoupon(addressId: string, code: string): Promise<Cart>;
  getPaymentOptions(addressId: string): Promise<PaymentMethod[]>;
  /** Places a REAL order in live mode. Only after the explicit "Place order" tap. */
  checkout(addressId: string, paymentMethodId: string): Promise<PlacedOrder>;
  checkPaymentStatus(orderId: string): Promise<PaymentStatus>;
  confirmOrder(orderId: string): Promise<void>;
  trackOrder(orderId: string): Promise<Tracking>;
  /** Recent orders, for the "did it go through?" check after a server error. */
  getOrders(): Promise<{ orderId: string; placedAt: number | null; toPay: number | null }[]>;
};

/** A dish on Swiggy Food (`search_menu`). */
export type MenuDish = {
  itemId: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  price: number | null;
  veg: boolean | null;
  rating: number | null;
  ratingCount: number | null;
  imageUrl: string | null;
  sizes: string[];
  addons: string[];
  bestseller: boolean;
};

export type Restaurant = { id: string; name: string; open: boolean; etaMin: number | null; rating: number | null };

export type FoodCart = { restaurantName: string; lines: { itemId: string; name: string; quantity: number; price: number | null }[]; bill: BillLine[]; toPay: number | null };

export type PastFoodOrder = { orderId: string; placedAt: number | null; items: string[]; toPay: number | null };

/** Swiggy Food (PDF 9.2). */
export type SwiggyFoodApi = {
  readonly mode: 'sample' | 'live';
  status(): Promise<{ connected: boolean }>;
  connectUrl(returnTo: string): string | null;
  getAddresses(): Promise<Address[]>;
  searchMenu(query: string, addressId: string, vegOnly: boolean): Promise<MenuDish[]>;
  searchRestaurants(query: string, addressId: string): Promise<Restaurant[]>;
  getRestaurantMenu(restaurantId: string, addressId: string): Promise<MenuDish[]>;
  /** One-restaurant cart; returns the full bill (delivery and taxes included). */
  updateFoodCart(addressId: string, restaurantId: string, items: { itemId: string; quantity: number }[]): Promise<FoodCart>;
  getFoodCart(addressId: string): Promise<FoodCart>;
  flushFoodCart(): Promise<void>;
  getPaymentOptions(addressId: string): Promise<PaymentMethod[]>;
  placeFoodOrder(addressId: string, paymentMethodId: string): Promise<PlacedOrder>;
  checkPaymentStatus(orderId: string): Promise<PaymentStatus>;
  confirmOrder(orderId: string): Promise<void>;
  trackFoodOrder(orderId: string): Promise<Tracking>;
  /** Only with the user's consent (settings.swiggyOrderInsights). */
  getFoodOrders(): Promise<PastFoodOrder[]>;
};
