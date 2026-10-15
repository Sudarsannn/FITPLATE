import { INSTAMART_MIN_ORDER } from './config';
import { packGrams, per100 } from './basket';
import { hash, SAMPLE_ADDRESS, sampleBrandsFor } from './sampleData';
import type { Address, Cart, CheckoutIssue, Coupon, InstamartApi, PaymentMethod, PaymentStatus, PlacedOrder, Tracking, VendorProduct } from './types';
import { VendorError } from './types';

/**
 * Sample mode for Swiggy Instamart: the same calls as the real tools, answered
 * with made-up products and prices, so friends and family can walk the whole
 * checkout on the website. No network, no real order, no payment.
 */
export function createSampleInstamart(opts: { priceHint?: (query: string) => number | null; now?: () => number } = {}): InstamartApi {
  const now = opts.now ?? Date.now;
  const catalogue = new Map<string, VendorProduct>();
  let cart: { skuId: string; quantity: number }[] = [];
  let coupon: string | null = null;
  const addresses: Address[] = [SAMPLE_ADDRESS];
  const orders = new Map<string, { placedAt: number; method: string; paid: boolean; confirmedAt: number | null; toPay: number }>();

  function productsFor(query: string): VendorProduct[] {
    const { brands, packs } = sampleBrandsFor(query);
    const h = hash(query.toLowerCase());
    const basePer100 = opts.priceHint?.(query) ?? 8 + (h % 40);
    const list = brands.map((brand, i) => {
      const pack = packs[(h + i) % packs.length];
      const grams = packGrams(pack);
      const factor = 0.85 + ((h >> (i * 3)) % 40) / 100; // brands differ by up to ±20%
      const price = grams ? Math.max(10, Math.round((basePer100 * factor * grams) / 100)) : 20 + ((h >> i) % 60);
      const mrp = Math.round(price * 1.12);
      const p: VendorProduct = {
        skuId: `sample-${(h + i).toString(36)}`,
        name: `${brand} ${titleCase(query)}`,
        brand,
        packSize: pack,
        packGrams: grams,
        mrp,
        offerPrice: price,
        pricePer100: per100(price, grams),
        inStock: !(i === 2 && h % 4 === 0), // now and then one is out of stock, to show swaps
        imageUrl: null,
        rating: Math.round((3.8 + ((h >> (i + 5)) % 12) / 10) * 10) / 10,
        etaMin: 9 + (h % 8),
        veg: !/chicken|mutton|egg|fish/i.test(query),
        purchaseCap: 6,
        similar: [],
      };
      catalogue.set(p.skuId, p);
      return p;
    });
    for (const p of list) if (!p.inStock) p.similar = list.filter((x) => x.inStock && x.skuId !== p.skuId);
    return list;
  }

  function buildCart(): Cart {
    const lines = cart
      .map((c) => {
        const p = catalogue.get(c.skuId);
        return p ? { skuId: p.skuId, name: `${p.name}${p.packSize ? `, ${p.packSize}` : ''}`, quantity: c.quantity, price: p.offerPrice, inStock: p.inStock, similar: p.similar } : null;
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
    const itemTotal = lines.filter((l) => l.inStock).reduce((s, l) => s + (l.price ?? 0) * l.quantity, 0);
    const issues: CheckoutIssue[] = [];
    if (itemTotal < INSTAMART_MIN_ORDER) issues.push({ code: 'MIN_ORDER_NOT_MET', minimum: INSTAMART_MIN_ORDER, message: `Add ₹${INSTAMART_MIN_ORDER - itemTotal} more: Instamart's minimum order is ₹${INSTAMART_MIN_ORDER}.` });
    for (const l of lines) if (!l.inStock) issues.push({ code: 'OUT_OF_STOCK', skuId: l.skuId, name: l.name, message: `${l.name} is out of stock.`, similar: l.similar });
    const delivery = itemTotal >= 199 ? 0 : 25;
    const discount = coupon === 'FITPLATE50' && itemTotal >= 299 ? 50 : 0;
    const bill = [
      { label: 'Item total', amount: itemTotal },
      { label: delivery ? 'Delivery fee' : 'Delivery fee (free above ₹199)', amount: delivery },
      { label: 'Handling fee', amount: 9 },
      ...(discount ? [{ label: `Coupon ${coupon}`, amount: -discount }] : []),
    ];
    return { lines, bill, toPay: bill.reduce((s, b) => s + b.amount, 0), appliedCoupon: discount ? coupon : null, paymentMethods: PAYMENTS, issues };
  }

  const PAYMENTS: PaymentMethod[] = [
    { id: 'upi', kind: 'upi', label: 'UPI (GPay, PhonePe, Paytm…)' },
    { id: 'cod', kind: 'cod', label: 'Cash on delivery' },
  ];

  return {
    mode: 'sample',
    status: async () => ({ connected: true }),
    connectUrl: () => null,
    disconnect: async () => {},
    getAddresses: async () => addresses,
    createAddress: async (text) => {
      const a = { id: `sample-${addresses.length}`, label: 'New (sample)', line: text };
      addresses.push(a);
      return a;
    },
    searchProducts: async (query) => productsFor(query),
    yourGoToItems: async () => [],
    updateCart: async (_addressId, items) => {
      cart = items.filter((i) => i.quantity > 0);
      return buildCart();
    },
    getCart: async () => buildCart(),
    clearCart: async () => {
      cart = [];
      coupon = null;
    },
    listCoupons: async () => {
      const total = buildCart().bill[0].amount;
      const c: Coupon = { code: 'FITPLATE50', description: '₹50 off orders above ₹299 (sample coupon)', saving: 50, applicable: total >= 299 };
      return [c];
    },
    applyCoupon: async (_a, code) => {
      coupon = code;
      return buildCart();
    },
    getPaymentOptions: async () => PAYMENTS,
    checkout: async (_a, method): Promise<PlacedOrder> => {
      const c = buildCart();
      if (c.issues.some((i) => i.code === 'MIN_ORDER_NOT_MET' || i.code === 'ADDRESS_NOT_SERVICEABLE')) throw new VendorError('OTHER', c.issues[0].message);
      const orderId = `SAMPLE-${(now() % 1e8).toString(36).toUpperCase()}`;
      orders.set(orderId, { placedAt: now(), method, paid: method === 'cod', confirmedAt: method === 'cod' ? now() : null, toPay: c.toPay ?? 0 });
      return { orderId, status: method === 'cod' ? 'placed' : 'pending-payment', paymentUrl: method === 'upi' ? 'sample://upi' : null, toPay: c.toPay };
    },
    checkPaymentStatus: async (orderId): Promise<PaymentStatus> => {
      const o = orders.get(orderId);
      if (!o) return 'failed';
      o.paid = true;
      return 'success';
    },
    confirmOrder: async (orderId) => {
      const o = orders.get(orderId);
      if (o) o.confirmedAt = o.confirmedAt ?? now();
      cart = [];
      coupon = null;
    },
    trackOrder: async (orderId): Promise<Tracking> => {
      const o = orders.get(orderId);
      const start = o?.confirmedAt ?? now();
      const eta = Math.max(0, 12 - Math.floor((now() - start) / 60_000));
      return { orderId, status: eta === 0 ? 'Delivered' : eta > 9 ? 'Packing your order' : 'On the way', etaMin: eta, delivered: eta === 0 };
    },
    getOrders: async () => [...orders.entries()].map(([orderId, o]) => ({ orderId, placedAt: o.placedAt, toPay: o.toPay })),
  };
}

function titleCase(s: string) {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
