import { describe, expect, it } from '@jest/globals';

import type { Dish } from '../../models/research';
import { orderInsights } from '../../services/vendors/insights';
import { matchDish } from '../../services/vendors/match';
import { prepTimeline } from '../../services/vendors/prep';
import { swiggySearchUrl, zeptoTarget } from '../../services/vendors/openApp';

const dish = (id: string, name: string, dietType: string) => ({ id, name, dietType }) as unknown as Dish;
const dishes = [dish('01-butter-chicken', 'Butter Chicken', 'non-veg'), dish('02-paneer-butter-masala', 'Paneer Butter Masala', 'veg'), dish('03-masala-dosa', 'Masala Dosa', 'veg')];

describe('matchDish', () => {
  it('matches exact names, ignoring case and brackets', () => {
    expect(matchDish('BUTTER CHICKEN (Half)', dishes)?.dish.id).toBe('01-butter-chicken');
  });
  it('matches by shared words', () => {
    const m = matchDish('Paneer Butter Masala Kulcha', dishes);
    expect(m?.dish.id).toBe('02-paneer-butter-masala');
    expect(m?.how).toBe('words');
  });
  it('skips non-veg recipes for a veg menu item and returns null when nothing fits', () => {
    expect(matchDish('Butter Chicken', dishes, true)).toBeNull();
    expect(matchDish('Chocolate shake', dishes)).toBeNull();
  });
});

describe('orderInsights', () => {
  const now = Date.UTC(2026, 9, 15);
  const orders = [
    { orderId: 'a', placedAt: now - 86_400_000, items: ['Butter Chicken', 'Garlic Naan'], toPay: 600 },
    { orderId: 'b', placedAt: now - 2 * 86_400_000, items: ['Butter Chicken'], toPay: 350 },
    { orderId: 'c', placedAt: now - 60 * 86_400_000, items: ['Butter Chicken'], toPay: 999 },
  ];
  it('counts recent orders per recipe and works out the saving', () => {
    const [top, ...rest] = orderInsights(orders, dishes, () => 120, now);
    expect(rest).toHaveLength(0);
    expect(top.dish.id).toBe('01-butter-chicken');
    expect(top.times).toBe(2);
    expect(top.spent).toBe(650);
    expect(top.couldSave).toBe(410);
  });
});

describe('small helpers', () => {
  it('lays out prep against the delivery ETA', () => {
    expect(prepTimeline(10, ['Pan'])[0]).toMatchObject({ now: true, text: expect.stringContaining('Pan') });
    expect(prepTimeline(0, []).at(-1)?.now).toBe(true);
  });
  it('only deep-links real Zepto product pages', () => {
    expect(zeptoTarget('https://www.zepto.com/pn/atta/pvid/1')).toEqual({ url: 'https://www.zepto.com/pn/atta/pvid/1', exact: true });
    expect(zeptoTarget('https://evil.example/zepto.com/')).toMatchObject({ exact: false });
    expect(zeptoTarget(null).exact).toBe(false);
  });
});

describe('swiggySearchUrl', () => {
  it('opens Swiggy search for the dish, encoded', () => {
    expect(swiggySearchUrl(' Dal Tadka ')).toBe('https://www.swiggy.com/search?query=Dal%20Tadka');
  });
});
