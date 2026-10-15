import type { Dish } from '../../models/research';
import { matchDish } from './match';
import type { PastFoodOrder } from './types';

export type OrderInsight = { dish: Dish; times: number; spent: number; costToMakeEach: number | null; couldSave: number | null };

/**
 * P3c (with the user's permission): "You ordered butter chicken 3 times this
 * month. Cooking it would have saved about ₹X." Works on the order history
 * the app just read; nothing from it is stored.
 */
export function orderInsights(orders: PastFoodOrder[], dishes: readonly Dish[], cost: (d: Dish) => number | null, now: number, days = 30): OrderInsight[] {
  const since = now - days * 86_400_000;
  const byDish = new Map<string, OrderInsight>();
  for (const o of orders) {
    if (o.placedAt != null && o.placedAt < since) continue;
    const share = o.toPay != null && o.items.length ? o.toPay / o.items.length : 0;
    for (const item of o.items) {
      const m = matchDish(item, dishes);
      if (!m) continue;
      const cur = byDish.get(m.dish.id) ?? { dish: m.dish, times: 0, spent: 0, costToMakeEach: cost(m.dish), couldSave: null };
      cur.times += 1;
      cur.spent += share;
      byDish.set(m.dish.id, cur);
    }
  }
  return [...byDish.values()]
    .map((i) => ({ ...i, spent: Math.round(i.spent), couldSave: i.costToMakeEach != null ? Math.max(0, Math.round(i.spent - i.costToMakeEach * i.times)) : null }))
    .sort((a, b) => b.times - a.times || b.spent - a.spent);
}
