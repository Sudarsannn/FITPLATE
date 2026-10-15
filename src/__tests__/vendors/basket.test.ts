import { describe, expect, it } from '@jest/globals';

import type { Dish } from '../../models/research';
import { buildShoppingItems, cheapestPer100, costToMake, newShoppingList, packGrams, pickProduct, preselect, toGrams, type VariantOption } from '../../services/vendors/basket';
import type { VendorProduct } from '../../services/vendors/types';

const ing = (name: string, quantity: number | null, unit: string | null, ingredientId: string | null = null) => ({ name, quantity, unit, ingredientId }) as Dish['ingredients'][number];
const dal = { id: 'dal', name: 'Dal', ingredients: [ing('Toor dal', 50, 'g', 'toor-dal'), ing('Onion', 40, 'g', 'onion'), ing('Water', 300, 'ml')] };
const sabzi = { id: 'sabzi', name: 'Sabzi', ingredients: [ing('Onion', 30, 'g', 'onion'), ing('Salt', null, null, 'salt')] };

const product = (p: Partial<VendorProduct>): VendorProduct =>
  ({ skuId: 'x', name: 'x', brand: null, packSize: null, price: 10, offerPrice: null, pricePer100: null, inStock: true, imageUrl: null, rating: null, etaMin: null, veg: null, purchaseCap: null, similar: [], ...p }) as VendorProduct;

describe('shopping list', () => {
  it('merges the same ingredient across dishes, scales servings and drops water', () => {
    const items = buildShoppingItems([
      { dish: dal, servings: 2 },
      { dish: sabzi, servings: 1 },
    ]);
    expect(items.map((i) => i.name)).toEqual(['Toor dal', 'Onion', 'Salt']);
    const onion = items.find((i) => i.key === 'onion');
    expect(onion?.quantity).toBe(110);
    expect(onion?.dishIds).toEqual(['dal', 'sabzi']);
  });

  it('starts a list with the saved brand choices', () => {
    const list = newShoppingList([{ dish: dal, servings: 1 }], { onion: 'Fresho · 1 kg' });
    expect(list.title).toBe('Dal');
    expect(list.status).toBe('open');
    expect(list.items.find((i) => i.key === 'onion')?.variant).toBe('Fresho · 1 kg');
  });
});

describe('cost to make', () => {
  it('adds priced ingredients and reports coverage', () => {
    const prices = new Map([['toor-dal', { per100Estimate: { avg: 16, min: 14, max: 18 } }]]) as Map<string, never>;
    const c = costToMake(dal, 2, prices);
    expect(c).toEqual({ inr: 16, coveragePct: 50 });
  });
  it('is null when nothing is priced', () => {
    expect(costToMake(sabzi, 1, new Map())).toBeNull();
  });
  it('converts units and pack labels', () => {
    expect(toGrams(2, 'tbsp')).toBe(30);
    expect(toGrams(1, 'pinch')).toBeNull();
    expect(packGrams('1 kg')).toBe(1000);
    expect(packGrams('200ml')).toBe(200);
    expect(packGrams('a bunch')).toBeNull();
  });
});

describe('variants', () => {
  const opt = (label: string, pricePer100: number | null) => ({ label, brand: label.split(' · ')[0], pack: '1 kg', priceInr: null, pricePer100, source: 'demo', links: { zepto: null, instamart: null, blinkit: null } }) as VariantOption;

  it('marks the best value only when two prices can be compared', () => {
    expect(cheapestPer100([opt('A', 12), opt('B', 9), opt('C', null)])).toBe(1);
    expect(cheapestPer100([opt('A', 12), opt('C', null)])).toBe(-1);
  });

  it('pre-selects the saved choice, then the usual item, then the first', () => {
    const options = [opt('Tata · 1 kg', 10), opt('Aashirvaad · 1 kg', 11)];
    expect(preselect(options, 'Aashirvaad · 1 kg')).toBe(1);
    expect(preselect(options, null, ['Aashirvaad Atta 5kg'])).toBe(1);
    expect(preselect(options, 'gone')).toBe(0);
  });

  it('picks the saved brand and pack, else the same brand, else the best value in stock', () => {
    const products = [
      product({ skuId: '1', brand: 'Tata', packSize: '500 g', pricePer100: 20 }),
      product({ skuId: '2', brand: 'Tata', packSize: '1 kg', pricePer100: 18, inStock: false }),
      product({ skuId: '3', brand: 'Other', packSize: '1 kg', pricePer100: 9 }),
    ];
    expect(pickProduct({ variant: 'Tata · 500 g' }, products)?.skuId).toBe('1');
    expect(pickProduct({ variant: 'Tata · 1 kg' }, products)?.skuId).toBe('1');
    expect(pickProduct({ variant: null }, products)?.skuId).toBe('3');
    expect(pickProduct({ variant: null }, [])).toBeNull();
  });
});
