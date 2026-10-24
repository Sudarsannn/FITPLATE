import { describe, expect, it } from '@jest/globals';

import { researchDishes } from '../../data/research';
import { equipmentNeeds, kitchenGaps, showBeginnerTips, worksWithKitchen } from '../../services/kitchen';

const dish = (...equipment: string[]) => ({ equipment });

describe('kitchen needs', () => {
  it('needs an item only when the research gives no way round it', () => {
    const d = dish('Pressure cooker, 1.5–3 L', 'Kadai or heavy-bottomed pan (about 20 cm)', 'Kitchen thermometer (optional)', 'No mixer needed', 'Chopping board and knife');
    expect(equipmentNeeds(d).map((n) => [n.appliance, n.required])).toEqual([
      ['Pressure cooker', true],
      ['Kadai', false],
    ]);
  });

  it('keeps the research alternative in its own words', () => {
    const [kadai] = equipmentNeeds(dish('Kadai or heavy-bottomed pan (about 20 cm)'));
    expect(kadai.alternative).toBe('heavy-bottomed pan');
    const [mixer] = equipmentNeeds(dish('Mixer-grinder with a wet/chutney jar (or a wet grinder)'));
    expect(mixer.required).toBe(false);
    expect(mixer.alternative).toBe('a wet grinder');
    expect(equipmentNeeds(dish('Small heavy kadai (about 18 cm), for deep-frying'))[0]).toMatchObject({ required: true, alternative: null });
  });

  it('works with my kitchen: unknown until the kitchen is set, then checks needed items', () => {
    const biryani = dish('Pressure cooker, 2–3 litre', 'Mixer-grinder with small chutney jar');
    expect(worksWithKitchen(biryani, [])).toBeNull();
    expect(worksWithKitchen(biryani, ['Pressure cooker'])).toBe(false);
    expect(worksWithKitchen(biryani, ['Pressure cooker', 'Blender'])).toBe(true);
    expect(worksWithKitchen(dish('Kadai or wide frying pan with a lid'), ['Induction'])).toBe(true);
  });

  it('lists each missing item once, and nothing when the kitchen is not set', () => {
    const d = dish('Pressure cooker for the potato', 'Pressure cooker, 2–3 litre', 'Tawa (flat iron or non-stick griddle)');
    expect(kitchenGaps(d, []).length).toBe(0);
    expect(kitchenGaps(d, ['Kadai']).map((g) => g.appliance)).toEqual(['Pressure cooker', 'Tawa']);
  });

  it('changing the kitchen changes which researched dishes fit (Day 10 done-when)', () => {
    const fits = (owned: string[]) => researchDishes.filter((x) => worksWithKitchen(x, owned)).length;
    const basic = fits(['Kadai']);
    const full = fits(['Pressure cooker', 'Kadai', 'Tawa', 'Non-stick pan', 'Mixer-grinder', 'Oven / OTG', 'Air fryer', 'Microwave']);
    expect(full).toBe(researchDishes.length);
    expect(basic).toBeLessThan(full);
    expect(basic).toBeGreaterThan(0);
  });
});

describe('beginner tips', () => {
  it('follows the cooking level until the person flips the switch', () => {
    expect(showBeginnerTips('beginner', {})).toBe(true);
    expect(showBeginnerTips('expert', {})).toBe(false);
    expect(showBeginnerTips('beginner', { beginnerTips: false })).toBe(false);
    expect(showBeginnerTips('expert', { beginnerTips: true })).toBe(true);
  });
});
