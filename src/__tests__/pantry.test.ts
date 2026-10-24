import { describe, expect, it } from '@jest/globals';

import type { ShoppingItem } from '../models/prefs';
import { addBought, coverage, onlyMissing, setAmount } from '../services/pantry';

const item = (key: string, quantity: number | null, unit: string | null): ShoppingItem => ({ key, ingredientId: key, name: key, quantity, unit, dishIds: [], included: true, checked: false, variant: null });

describe('pantry', () => {
  it('adds what was bought and folds kg into g', () => {
    const p = addBought({}, [item('rice', 1, 'kg')]);
    expect(p.rice).toMatchObject({ quantity: 1000, unit: 'g' });
    expect(addBought(p, [item('rice', 500, 'g')]).rice.quantity).toBe(1500);
  });

  it('works out have, need and what is missing', () => {
    const p = addBought({}, [item('rice', 200, 'g')]);
    expect(coverage(p, item('rice', 150, 'g'))).toMatchObject({ status: 'enough', missing: 0 });
    expect(coverage(p, item('rice', 500, 'g'))).toMatchObject({ status: 'some', missing: 300 });
    expect(coverage(p, item('dal', 100, 'g'))).toMatchObject({ status: 'none', missing: 100 });
  });

  it('does not compare different units', () => {
    const p = addBought({}, [item('ghee', 2, 'tbsp')]);
    expect(coverage(p, item('ghee', 100, 'g')).status).toBe('none');
  });

  it('only-missing unticks covered lines and shrinks partial ones', () => {
    const p = setAmount(addBought({}, [item('rice', 200, 'g'), item('dal', 50, 'g')]), 'dal', 50);
    const out = onlyMissing([item('rice', 150, 'g'), item('dal', 120, 'g'), item('oil', 30, 'ml')], p);
    expect(out[0].included).toBe(false);
    expect(out[1].quantity).toBe(70);
    expect(out[2].included).toBe(true);
  });
});
