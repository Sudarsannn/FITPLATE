import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../../data/research';
import { createSampleFood } from '../../services/vendors/sampleFood';
import { createSampleInstamart } from '../../services/vendors/sampleInstamart';

describe('sample Instamart', () => {
  it('walks search, cart, coupon and UPI checkout without anything real', async () => {
    const im = createSampleInstamart({ priceHint: () => 12 });
    expect(im.mode).toBe('sample');
    expect(im.connectUrl('http://localhost')).toBeNull();
    const [addr] = await im.getAddresses();
    const products = (await im.searchProducts('atta', addr.id)).filter((p) => p.inStock);
    expect(products.length).toBeGreaterThan(0);
    const cart = await im.updateCart(addr.id, [{ skuId: products[0].skuId, quantity: 30 }]);
    expect(cart.toPay).toBeGreaterThan(0);
    const upi = (await im.getPaymentOptions(addr.id)).find((m) => m.kind === 'upi');
    expect(upi).toBeDefined();
    const order = await im.checkout(addr.id, upi!.id);
    expect(order.paymentUrl).toBe('sample://upi');
    expect(await im.checkPaymentStatus(order.orderId)).toBe('success');
  });
});

describe('sample Swiggy Food', () => {
  it('finds menu dishes that FitPlate has recipes for', async () => {
    const food = createSampleFood({ dishes: () => researchDishes });
    const [addr] = await food.getAddresses();
    const menu = await food.searchMenu(researchDishes[0].name, addr.id, false);
    expect(menu.length).toBeGreaterThan(0);
  });
});
