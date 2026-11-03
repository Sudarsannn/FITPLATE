import { describe, expect, it, jest } from '@jest/globals';

import type { ShoppingItem } from '../models/prefs';
import { ADAPTERS, pushCart, searchFallbackUrl, type CartPushAdapter } from '../services/vendors/cartPush';
import { buildCheckoutPlan } from '../services/vendors/checkoutPlan';
import { featureFlags } from '../config/featureFlags';

const item = (o: Partial<ShoppingItem>): ShoppingItem => ({ key: 'k', ingredientId: null, name: 'Tomato', quantity: 300, unit: 'g', dishIds: [], included: true, checked: false, ...o }) as ShoppingItem;
const plan = buildCheckoutPlan({ items: [item({ key: 'a' }), item({ key: 'b', name: 'Salt', included: false })] }, 'zepto');
const on = { vendorCheckout: true };

describe('buildCheckoutPlan', () => {
  it('keeps only ticked items and counts unpriced ones instead of guessing', () => {
    expect(plan.lines.map((l) => l.name)).toEqual(['Tomato']);
    expect(plan.unpriced + plan.lines.filter((l) => l.priceInr != null).length).toBe(1);
    expect(plan.estimatedTotalInr).toBe(plan.lines.reduce((s, l) => s + (l.priceInr ?? 0), 0));
  });
});

describe('pushCart', () => {
  it('ships OFF', () => expect(featureFlags.vendorCheckout).toBe(false));
  it('refuses while the flag is off, before confirming, or when empty', async () => {
    expect((await pushCart(plan, true, ADAPTERS, { vendorCheckout: false })).ok).toBe(false);
    expect(await pushCart(plan, false, ADAPTERS, on)).toMatchObject({ reason: 'not-confirmed' });
    expect(await pushCart({ ...plan, lines: [] }, true, ADAPTERS, on)).toMatchObject({ reason: 'empty' });
  });
  it('makes no vendor call with the placeholder adapters', async () => {
    expect(await pushCart(plan, true, ADAPTERS, on)).toMatchObject({ ok: false, reason: 'not-configured' });
  });
  it('opens the cart a configured adapter returns, and reports a failure kindly', async () => {
    const good: CartPushAdapter = { vendor: 'zepto', configured: true, push: jest.fn(async () => ({ cartUrl: 'https://www.zepto.com/cart' })) };
    expect(await pushCart(plan, true, { ...ADAPTERS, zepto: good }, on)).toEqual({ ok: true, openUrl: 'https://www.zepto.com/cart' });
    const bad: CartPushAdapter = { ...good, push: async () => { throw new Error('x'); } };
    expect(await pushCart(plan, true, { ...ADAPTERS, zepto: bad }, on)).toMatchObject({ reason: 'failed' });
  });
  it('falls back to a search link for the first item', () => {
    expect(searchFallbackUrl(plan)).toContain('zepto.com/search');
    expect(searchFallbackUrl({ ...plan, lines: [] })).toBeNull();
  });
});
