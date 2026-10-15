import { packGrams, per100 } from './basket';
import type { Address, BillLine, Cart, CheckoutIssue, Coupon, FoodCart, MenuDish, PastFoodOrder, PaymentMethod, PaymentStatus, PlacedOrder, Restaurant, Tracking, VendorProduct } from './types';

/**
 * Swiggy's tool results, turned into FitPlate's shapes. The tools return JSON
 * whose exact field names are only visible once a client connects, so every
 * reader here accepts the common spellings and falls back to null rather than
 * guessing a value. `npm run swiggy:tools` saves the real schemas to compare.
 */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

export function pick(o: unknown, ...keys: string[]): unknown {
  if (!isObj(o)) return undefined;
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
}
export const str = (o: unknown, ...keys: string[]): string | null => {
  const v = pick(o, ...keys);
  return typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' ? String(v) : null;
};
export const num = (o: unknown, ...keys: string[]): number | null => {
  const v = pick(o, ...keys);
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[₹,\s]/g, ''));
    return Number.isFinite(n) && v.trim() !== '' ? n : null;
  }
  if (isObj(v)) return num(v, 'value', 'amount', 'price');
  return null;
};
const bool = (o: unknown, ...keys: string[]): boolean | null => {
  const v = pick(o, ...keys);
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return /^(true|yes|veg|1)$/i.test(v) ? true : /^(false|no|non-?veg|0)$/i.test(v) ? false : null;
  if (typeof v === 'number') return v !== 0;
  return null;
};

/** The first array found under these keys, at the top or one level down (`data.items`). */
export function list(o: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(o)) return o;
  if (!isObj(o)) return [];
  for (const k of keys) if (Array.isArray(o[k])) return o[k] as unknown[];
  for (const inner of ['data', 'result', 'response']) {
    const v = o[inner];
    if (Array.isArray(v)) return v;
    if (isObj(v)) for (const k of keys) if (Array.isArray(v[k])) return v[k] as unknown[];
  }
  return [];
}

const inner = (o: unknown): unknown => (isObj(o) && isObj(o.data) ? o.data : o);




export function toProduct(raw: unknown): VendorProduct | null {
  const skuId = str(raw, 'skuId', 'sku_id', 'sku', 'spin', 'spinId', 'variationId', 'productId', 'id');
  const name = str(raw, 'name', 'displayName', 'display_name', 'productName', 'title');
  if (!skuId || !name) return null;
  const packSize = str(raw, 'packSize', 'pack_size', 'quantity', 'weight', 'size', 'unit');
  const grams = packGrams(packSize);
  const offer = num(raw, 'offerPrice', 'offer_price', 'sellingPrice', 'selling_price', 'price', 'finalPrice');
  const similarRaw = list(raw, 'similarProducts', 'similar_products', 'alternatives');
  return {
    skuId,
    name,
    brand: str(raw, 'brand', 'brandName', 'brand_name'),
    packSize,
    packGrams: grams,
    mrp: num(raw, 'mrp', 'MRP', 'maxRetailPrice'),
    offerPrice: offer,
    pricePer100: num(raw, 'pricePer100g', 'price_per_100g') ?? per100(offer, grams),
    inStock: bool(raw, 'inStock', 'in_stock', 'available', 'isAvailable') ?? !(bool(raw, 'outOfStock', 'out_of_stock') ?? false),
    imageUrl: str(raw, 'imageUrl', 'image_url', 'image', 'thumbnail'),
    rating: num(raw, 'rating', 'avgRating', 'avg_rating'),
    etaMin: num(raw, 'deliveryTime', 'delivery_time', 'etaMinutes', 'eta'),
    veg: bool(raw, 'veg', 'isVeg', 'is_veg', 'vegFlag'),
    purchaseCap: num(raw, 'purchaseCap', 'purchase_cap', 'maxQuantity', 'max_quantity'),
    similar: similarRaw.map(toProduct).filter((p): p is VendorProduct => p !== null),
  };
}

export const toProducts = (raw: unknown) => list(raw, 'products', 'items', 'results', 'variations').map(toProduct).filter((p): p is VendorProduct => p !== null);

export function toAddress(raw: unknown): Address | null {
  const id = str(raw, 'id', 'addressId', 'address_id');
  if (!id) return null;
  const label = str(raw, 'label', 'annotation', 'tag', 'type', 'name') ?? 'Address';
  const line = str(raw, 'line', 'address', 'displayAddress', 'formattedAddress', 'area', 'flatNo') ?? label;
  return { id, label, line };
}
export const toAddresses = (raw: unknown) => list(raw, 'addresses', 'items').map(toAddress).filter((a): a is Address => a !== null);

function toBill(raw: unknown): BillLine[] {
  const rows = list(raw, 'bill', 'billBreakdown', 'bill_breakdown', 'charges', 'breakup');
  return rows
    .map((r) => {
      const label = str(r, 'label', 'name', 'title', 'type');
      const amount = num(r, 'amount', 'value', 'price');
      return label && amount != null ? { label, amount } : null;
    })
    .filter((b): b is BillLine => b !== null);
}

export function toIssues(raw: unknown): CheckoutIssue[] {
  const out: CheckoutIssue[] = [];
  for (const e of list(raw, 'errors', 'issues', 'messages', 'warnings')) {
    const code = (str(e, 'code', 'type', 'errorCode') ?? '').toUpperCase();
    const message = str(e, 'message', 'text', 'description') ?? code;
    if (code.includes('MIN_ORDER')) out.push({ code: 'MIN_ORDER_NOT_MET', minimum: num(e, 'minimum', 'minOrderValue') ?? 99, message });
    else if (code.includes('SERVICEABLE')) out.push({ code: 'ADDRESS_NOT_SERVICEABLE', message });
    else if (code.includes('STOCK')) out.push({ code: 'OUT_OF_STOCK', skuId: str(e, 'skuId', 'sku_id', 'id') ?? '', name: str(e, 'name') ?? 'An item', message, similar: list(e, 'similarProducts', 'similar_products').map(toProduct).filter((p): p is VendorProduct => p !== null) });
    else if (message) out.push({ code: 'OTHER', message });
  }
  return out;
}

export function toPaymentMethods(raw: unknown): PaymentMethod[] {
  return list(raw, 'paymentMethods', 'payment_methods', 'paymentOptions', 'payment_options', 'methods', 'options')
    .map((m) => {
      if (typeof m === 'string') return { id: m, kind: /upi/i.test(m) ? 'upi' : /cod|cash/i.test(m) ? 'cod' : 'other', label: m } as PaymentMethod;
      const id = str(m, 'id', 'code', 'method', 'type', 'name');
      if (!id) return null;
      const label = str(m, 'label', 'displayName', 'name', 'title') ?? id;
      const kind: PaymentMethod['kind'] = /upi/i.test(`${id} ${label}`) ? 'upi' : /cod|cash/i.test(`${id} ${label}`) ? 'cod' : 'other';
      return { id, kind, label };
    })
    .filter((m): m is PaymentMethod => m !== null);
}

export function toCart(raw: unknown): Cart {
  const r = inner(raw);
  const lines = list(r, 'items', 'cartItems', 'cart_items', 'lines').map((l) => {
    const p = toProduct(l);
    return {
      skuId: p?.skuId ?? str(l, 'skuId', 'id') ?? '',
      name: p?.name ?? str(l, 'name') ?? 'Item',
      quantity: num(l, 'quantity', 'qty', 'count') ?? 1,
      price: p?.offerPrice ?? num(l, 'price', 'total'),
      inStock: p?.inStock ?? true,
      similar: p?.similar ?? [],
    };
  });
  const bill = toBill(r);
  const toPay = num(r, 'toPay', 'to_pay', 'grandTotal', 'grand_total', 'total', 'totalAmount', 'amountToPay');
  const issues = toIssues(r);
  for (const l of lines) if (!l.inStock && !issues.some((i) => i.code === 'OUT_OF_STOCK' && i.skuId === l.skuId)) issues.push({ code: 'OUT_OF_STOCK', skuId: l.skuId, name: l.name, message: `${l.name} is out of stock.`, similar: l.similar });
  return { lines, bill, toPay, appliedCoupon: str(r, 'appliedCoupon', 'applied_coupon', 'couponCode'), paymentMethods: toPaymentMethods(r), issues };
}

export const toCoupons = (raw: unknown): Coupon[] =>
  list(raw, 'coupons', 'offers', 'items')
    .map((c) => {
      const code = str(c, 'code', 'couponCode', 'coupon_code');
      return code ? { code, description: str(c, 'description', 'title', 'text') ?? code, saving: num(c, 'saving', 'discount', 'discountAmount'), applicable: bool(c, 'applicable', 'isApplicable', 'valid') ?? true } : null;
    })
    .filter((c): c is Coupon => c !== null);

/** A UPI intent (upi://…) or a payment page, wherever the result puts it. */
export function findPaymentUrl(raw: unknown, depth = 0): string | null {
  if (depth > 4) return null;
  if (typeof raw === 'string') return /^(upi:|https?:\/\/|[a-z]+:\/\/pay)/i.test(raw) && /upi|pay/i.test(raw) ? raw : null;
  if (Array.isArray(raw)) {
    for (const v of raw) {
      const u = findPaymentUrl(v, depth + 1);
      if (u) return u;
    }
    return null;
  }
  if (isObj(raw)) {
    for (const k of ['paymentUrl', 'payment_url', 'upiIntent', 'upi_intent', 'intentUrl', 'deeplink', 'deepLink', 'paymentLink', 'payment_link', 'url']) {
      const v = raw[k];
      if (typeof v === 'string' && v) return v;
    }
    for (const v of Object.values(raw)) {
      const u = findPaymentUrl(v, depth + 1);
      if (u) return u;
    }
  }
  return null;
}

export function toPlacedOrder(raw: unknown): PlacedOrder {
  const r = inner(raw);
  const orderId = str(r, 'orderId', 'order_id', 'id') ?? '';
  const status = (str(r, 'status', 'orderStatus', 'paymentStatus') ?? '').toLowerCase();
  const paymentUrl = findPaymentUrl(r);
  return { orderId, status: paymentUrl || /pending/.test(status) ? 'pending-payment' : 'placed', paymentUrl, toPay: num(r, 'toPay', 'to_pay', 'amount', 'total') };
}

export function toPaymentStatus(raw: unknown): PaymentStatus {
  const s = (str(inner(raw), 'status', 'paymentStatus', 'payment_status', 'state') ?? '').toLowerCase();
  if (/success|paid|complete|captured/.test(s)) return 'success';
  if (/fail|declin|cancel|expired/.test(s)) return 'failed';
  return 'pending';
}

export function toTracking(raw: unknown, orderId: string): Tracking {
  const r = inner(raw);
  const status = str(r, 'status', 'orderStatus', 'deliveryStatus', 'message') ?? 'In progress';
  return { orderId, status, etaMin: num(r, 'etaMinutes', 'eta', 'deliveryTime', 'minutesLeft', 'sla'), delivered: /deliver(ed)?$|completed/i.test(status) };
}

export const toOrders = (raw: unknown) =>
  list(raw, 'orders', 'items')
    .map((o) => {
      const orderId = str(o, 'orderId', 'order_id', 'id');
      if (!orderId) return null;
      const t = pick(o, 'placedAt', 'orderTime', 'order_time', 'createdAt');
      return { orderId, placedAt: typeof t === 'number' ? t : typeof t === 'string' ? Date.parse(t) || null : null, toPay: num(o, 'toPay', 'total', 'amount', 'orderTotal') };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);

export function toMenuDish(raw: unknown, restaurant?: { id: string | null; name: string | null }): MenuDish | null {
  const itemId = str(raw, 'itemId', 'item_id', 'id');
  const name = str(raw, 'name', 'itemName', 'item_name', 'dishName');
  if (!itemId || !name) return null;
  const sizes = list(raw, 'sizes', 'variants', 'variations').map((v) => (typeof v === 'string' ? v : str(v, 'name', 'label'))).filter((s): s is string => !!s);
  const addons = list(raw, 'addons', 'addOns', 'add_ons').map((v) => (typeof v === 'string' ? v : str(v, 'name', 'label'))).filter((s): s is string => !!s);
  const rest = pick(raw, 'restaurant');
  return {
    itemId,
    name,
    restaurantId: str(raw, 'restaurantId', 'restaurant_id') ?? str(rest, 'id') ?? restaurant?.id ?? '',
    restaurantName: str(raw, 'restaurantName', 'restaurant_name') ?? str(rest, 'name') ?? restaurant?.name ?? 'Restaurant',
    price: num(raw, 'price', 'finalPrice', 'defaultPrice'),
    veg: bool(raw, 'veg', 'isVeg', 'is_veg', 'vegClassifier'),
    rating: num(raw, 'rating', 'avgRating'),
    ratingCount: num(raw, 'ratingCount', 'rating_count', 'ratingsCount'),
    imageUrl: str(raw, 'imageUrl', 'image_url', 'image'),
    sizes,
    addons,
    bestseller: bool(raw, 'bestseller', 'isBestseller', 'is_bestseller') ?? false,
  };
}
export const toMenu = (raw: unknown, restaurant?: { id: string | null; name: string | null }) =>
  list(raw, 'dishes', 'items', 'menu', 'results').map((d) => toMenuDish(d, restaurant)).filter((d): d is MenuDish => d !== null);

export const toRestaurants = (raw: unknown): Restaurant[] =>
  list(raw, 'restaurants', 'items', 'results')
    .map((r) => {
      const id = str(r, 'id', 'restaurantId', 'restaurant_id');
      const name = str(r, 'name', 'restaurantName');
      return id && name ? { id, name, open: bool(r, 'open', 'isOpen', 'is_open') ?? true, etaMin: num(r, 'deliveryTime', 'eta', 'sla'), rating: num(r, 'rating', 'avgRating') } : null;
    })
    .filter((r): r is Restaurant => r !== null);

export function toFoodCart(raw: unknown): FoodCart {
  const r = inner(raw);
  const c = toCart(r);
  return { restaurantName: str(r, 'restaurantName', 'restaurant_name') ?? str(pick(r, 'restaurant'), 'name') ?? 'Restaurant', lines: c.lines.map((l) => ({ itemId: l.skuId, name: l.name, quantity: l.quantity, price: l.price })), bill: c.bill, toPay: c.toPay };
}

export const toPastFoodOrders = (raw: unknown): PastFoodOrder[] =>
  list(raw, 'orders', 'items')
    .map((o) => {
      const orderId = str(o, 'orderId', 'order_id', 'id');
      if (!orderId) return null;
      const t = pick(o, 'placedAt', 'orderTime', 'order_time', 'createdAt');
      const items = list(o, 'items', 'dishes', 'orderItems').map((i) => (typeof i === 'string' ? i : str(i, 'name', 'itemName'))).filter((s): s is string => !!s);
      return { orderId, placedAt: typeof t === 'number' ? t : typeof t === 'string' ? Date.parse(t) || null : null, items, toPay: num(o, 'toPay', 'total', 'amount', 'orderTotal') };
    })
    .filter((o): o is PastFoodOrder => o !== null);
