import type { Dish } from '../../models/research';
import { matchDish } from './match';
import { hash, SAMPLE_ADDRESS } from './sampleData';
import type { FoodCart, MenuDish, PastFoodOrder, PaymentMethod, PlacedOrder, Restaurant, SwiggyFoodApi, Tracking } from './types';

const RESTAURANTS = ['Sample Dhaba', 'Bombay Bites (sample)', 'Udupi Corner (sample)', 'Spice Route (sample)'];
const PAYMENTS: PaymentMethod[] = [
  { id: 'upi', kind: 'upi', label: 'UPI (GPay, PhonePe, Paytm…)' },
  { id: 'cod', kind: 'cod', label: 'Cash on delivery' },
];

/**
 * Sample mode for Swiggy Food: made-up restaurants and prices around the
 * researched order price, so "Cook it instead" can be tried on the website.
 */
export function createSampleFood(opts: { dishes: () => readonly Dish[]; now?: () => number }): SwiggyFoodApi {
  const now = opts.now ?? Date.now;
  const menuCache = new Map<string, MenuDish>();
  let cart: { restaurantId: string; items: { itemId: string; quantity: number }[] } | null = null;
  const orders = new Map<string, number>();

  function itemsFor(query: string, vegOnly: boolean): MenuDish[] {
    const q = query.trim();
    if (!q) return [];
    const ds = opts.dishes();
    const direct = matchDish(q, ds, vegOnly ? true : null)?.dish;
    const hits = direct ? [direct] : ds.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
    const names = hits.length ? hits.map((d) => ({ name: d.name, veg: d.dietType === 'veg', base: d.orderPrice?.currentEstimate?.avg ?? null })) : [{ name: `${titleCase(q)} (chef's special)`, veg: !vegOnly ? hash(q) % 2 === 0 : true, base: null }];
    const out: MenuDish[] = [];
    for (const n of names) {
      if (vegOnly && !n.veg) continue;
      const h = hash(n.name);
      for (let i = 0; i < 3; i++) {
        const rIdx = (h + i) % RESTAURANTS.length;
        const base = n.base ?? 180 + (h % 160);
        const price = Math.round((base * (0.85 + ((h >> (i * 4)) % 40) / 100)) / 5) * 5;
        const item: MenuDish = {
          itemId: `sample-${(h + i).toString(36)}`,
          name: i === 1 ? `${n.name} (restaurant style)` : n.name,
          restaurantId: `sample-r${rIdx}`,
          restaurantName: RESTAURANTS[rIdx],
          price,
          veg: n.veg,
          rating: Math.round((3.9 + ((h >> (i + 3)) % 10) / 10) * 10) / 10,
          ratingCount: 120 + (h % 900),
          imageUrl: null,
          sizes: ['Regular', 'Large'],
          addons: ['Extra butter', 'Raita'],
          bestseller: i === 0,
        };
        menuCache.set(item.itemId, item);
        out.push(item);
      }
    }
    return out;
  }

  function bill(): FoodCart {
    const lines = (cart?.items ?? []).map((i) => {
      const m = menuCache.get(i.itemId);
      return { itemId: i.itemId, name: m?.name ?? 'Item', quantity: i.quantity, price: m?.price ?? null };
    });
    const itemTotal = lines.reduce((s, l) => s + (l.price ?? 0) * l.quantity, 0);
    const rows = [
      { label: 'Item total', amount: itemTotal },
      { label: 'Delivery fee', amount: itemTotal ? 39 : 0 },
      { label: 'Packaging', amount: itemTotal ? 20 : 0 },
      { label: 'Platform fee', amount: itemTotal ? 10 : 0 },
      { label: 'GST and charges', amount: Math.round(itemTotal * 0.05) },
    ];
    const restaurantName = cart ? (RESTAURANTS[Number(cart.restaurantId.replace('sample-r', ''))] ?? 'Restaurant') : 'Restaurant';
    return { restaurantName, lines, bill: rows, toPay: rows.reduce((s, r) => s + r.amount, 0) };
  }

  return {
    mode: 'sample',
    status: async () => ({ connected: true }),
    connectUrl: () => null,
    getAddresses: async () => [SAMPLE_ADDRESS],
    searchMenu: async (query, _a, vegOnly) => itemsFor(query, vegOnly),
    searchRestaurants: async (): Promise<Restaurant[]> => RESTAURANTS.map((name, i) => ({ id: `sample-r${i}`, name, open: true, etaMin: 25 + i * 6, rating: 4.1 })),
    getRestaurantMenu: async (restaurantId) =>
      opts
        .dishes()
        .slice(0, 12)
        .flatMap((d) => itemsFor(d.name, false))
        .filter((m) => m.restaurantId === restaurantId),
    updateFoodCart: async (_a, restaurantId, items) => {
      cart = { restaurantId, items: items.filter((i) => i.quantity > 0) };
      return bill();
    },
    getFoodCart: async () => bill(),
    flushFoodCart: async () => {
      cart = null;
    },
    getPaymentOptions: async () => PAYMENTS,
    placeFoodOrder: async (_a, method): Promise<PlacedOrder> => {
      const orderId = `SAMPLE-F${(now() % 1e8).toString(36).toUpperCase()}`;
      orders.set(orderId, now());
      const toPay = bill().toPay;
      return { orderId, status: method === 'cod' ? 'placed' : 'pending-payment', paymentUrl: method === 'upi' ? 'sample://upi' : null, toPay };
    },
    checkPaymentStatus: async () => 'success',
    confirmOrder: async () => {
      cart = null;
    },
    trackFoodOrder: async (orderId): Promise<Tracking> => {
      const start = orders.get(orderId) ?? now();
      const eta = Math.max(0, 32 - Math.floor((now() - start) / 60_000));
      return { orderId, status: eta === 0 ? 'Delivered' : 'Being prepared', etaMin: eta, delivered: eta === 0 };
    },
    getFoodOrders: async (): Promise<PastFoodOrder[]> => {
      const day = 86_400_000;
      const t = now();
      const pick = (slug: string) => opts.dishes().find((d) => d.id.endsWith(slug))?.name ?? slug;
      return [
        { orderId: 'SAMPLE-H1', placedAt: t - 3 * day, items: [pick('butter-chicken')], toPay: 412 },
        { orderId: 'SAMPLE-H2', placedAt: t - 9 * day, items: [pick('butter-chicken'), 'Butter Naan'], toPay: 468 },
        { orderId: 'SAMPLE-H3', placedAt: t - 16 * day, items: [pick('butter-chicken')], toPay: 398 },
        { orderId: 'SAMPLE-H4', placedAt: t - 12 * day, items: [pick('masala-dosa')], toPay: 189 },
      ];
    },
  };
}

function titleCase(s: string) {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
