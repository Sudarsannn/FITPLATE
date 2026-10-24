import { describe, expect, it } from '@jest/globals';

import { getCustomDishes, getDish, researchDishes } from '../../data/research';
import { createDishWithAi, findKnownAiDish } from '../../services/ai/client';
import { applyShared, syncSharedDishes } from '../../services/ai/shared';
import { buildDish, kcalFromMacros, matchIngredientId, shorten, type RawAiDish } from '../../services/ai/buildDish';
import { loadAiDishes, saveAiDish, deleteAiDish } from '../../services/ai/store';

const raw: RawAiDish = {
  name: 'Paneer Lababdar',
  description: 'Rich tomato and cashew gravy with paneer.',
  cuisine: 'North Indian',
  dietType: 'veg',
  mealType: ['dinner', 'lunch', 'brunch'],
  difficulty: 'Intermediate',
  prepMin: 15,
  cookMin: 25,
  ingredients: [
    { name: 'Paneer', quantity: 100, unit: 'g', householdMeasure: '4 cubes' },
    { name: 'Onion', quantity: 80, unit: 'g' },
    { name: 'Tomato', quantity: 120, unit: 'g' },
    { name: 'Cashew nuts (kaju)', quantity: 15, unit: 'g' },
    { name: 'Butter', quantity: 10, unit: 'g' },
  ],
  equipment: ['Kadai'],
  steps: [1, 2, 3, 4, 5].map((n) => ({ title: `Step ${n}`, text: `Do thing ${n}.`, timerSec: n === 2 ? 120 : n === 3 ? 99999 : null, visualCue: 'golden' })),
  nutrition: { kcal: 900, proteinG: 18, carbsG: 14, fatG: 30, fibreG: 3 },
  healthiness: { score: 6, restaurantScore: 4, reason: 'Rich but protein-led.', swaps: ['Less butter'] },
  rating: { score: 4.4, basis: 'Internet sentiment.' },
  allergens: ['milk'],
  veganFriendly: true,
  needsMoreResearch: ['Exact cashew paste quantity'],
};

const ctx = { id: 'ai-paneer-lababdar', number: 1001, request: 'rich paneer', mode: 'new' as const, basedOn: null, changes: [], sources: [{ title: 'Site', url: 'https://example.com/a' }], model: 'm', now: '2026-10-24T10:00:00.000Z' };

describe('shorten', () => {
  it('keeps whole sentences and drops looping padding', () => {
    const junk = 'Do not soak for more than 20 minutes. Rinse gently. ' + 'clean setup. standard visual. fine finish. '.repeat(80);
    const out = shorten(junk, 300);
    expect(out).toBe('Do not soak for more than 20 minutes. Rinse gently. clean setup.');
    expect(out.length).toBeLessThanOrEqual(300);
    expect(shorten('A single very long sentence '.repeat(30), 100).length).toBeLessThanOrEqual(101);
  });
});

describe('buildDish', () => {
  it('makes a researched-shape dish and checks what the AI said', () => {
    const { dish, notes } = buildDish(raw, ctx);
    expect(dish.servings).toBe(1);
    expect(dish.orderPrice).toBeNull();
    expect(dish.ai?.needsMoreResearch).toEqual(['Exact cashew paste quantity']);
    expect(dish.mealType).toEqual(['dinner', 'lunch']); // unknown meal type dropped
    expect(dish.allergens).toEqual(expect.arrayContaining(['milk', 'treeNut']));
    expect(dish.dietClaims).not.toContain('vegan'); // paneer, butter and cashews contradict it
    expect(dish.nutritionPerServing.kcal).toBe(kcalFromMacros(18, 14, 30)); // 398, not the 900 claimed
    expect(notes.join(' ')).toMatch(/Calories corrected/);
    expect(dish.steps[1].timerSec).toBe(120);
    expect(dish.steps[2].timerSec).toBeNull(); // absurd timer dropped
    expect(dish.tags[0]).toBe('AI created');
  });

  it('works out vitamins and minerals from the researched ingredients that matched', () => {
    const { dish } = buildDish({ ...raw, ingredients: [...raw.ingredients, { name: 'Onion', quantity: 100, unit: 'g' }] }, ctx);
    const matched = dish.ingredients.filter((i) => i.ingredientId && i.unit === 'g');
    if (matched.length) {
      expect(dish.microNutrientsEstimate).not.toBeNull();
      expect(dish.microNutrientsEstimate!.coveragePct).toBeLessThanOrEqual(100);
    } else {
      expect(dish.microNutrientsEstimate).toBeNull();
    }
  });

  it('refuses a dish that is too thin to cook from', () => {
    expect(() => buildDish({ ...raw, steps: raw.steps.slice(0, 2) }, ctx)).toThrow(/too few steps/);
    expect(() => buildDish({ ...raw, ingredients: raw.ingredients.slice(0, 1) }, ctx)).toThrow(/too few ingredients/);
  });

  it('links an ingredient to research only on a close match', () => {
    const id = matchIngredientId('Onion');
    if (id) expect(id).toMatch(/onion/);
    expect(matchIngredientId('Unobtainium dust')).toBeNull();
  });
});

describe('custom dish registry', () => {
  it('registers, persists, reloads and deletes', async () => {
    const mem = new Map<string, string>();
    const storage = { getItem: async (k: string) => mem.get(k) ?? null, setItem: async (k: string, v: string) => void mem.set(k, v) };
    const { dish } = buildDish(raw, ctx);
    await saveAiDish(dish, storage);
    expect(getDish(dish.id)?.name).toBe('Paneer Lababdar');
    expect(researchDishes.some((d) => d.id === dish.id)).toBe(true);
    await deleteAiDish(dish.id, storage);
    expect(getDish(dish.id)).toBeUndefined();
    expect(getCustomDishes()).toHaveLength(0);
    await saveAiDish(dish, storage);
    await deleteAiDish(dish.id, { ...storage, setItem: async () => {} });
    expect(await loadAiDishes(storage)).toBe(1);
    expect(getDish(dish.id)).toBeDefined();
    await deleteAiDish(dish.id, storage);
  });
});

describe('createDishWithAi', () => {
  const reply = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body }) as unknown as Response;

  it('plans, researches, composes, saves and queues', async () => {
    const calls: string[] = [];
    const phases: string[] = [];
    const base = researchDishes.find((d) => d.name === 'Paneer Butter Masala')!;
    const fetchImpl = (async (url: string) => {
      const path = new URL(url).pathname;
      calls.push(path);
      if (path.endsWith('/plan')) return reply({ ok: true, plan: { mode: 'variation', baseDishId: base.id, canonicalName: 'Paneer Lababdar', summary: 's', changes: ['Add cashew paste'], searchQueries: [] } });
      if (path.endsWith('/research')) return reply({ ok: true, notes: 'notes', sources: [{ title: 'Site', url: 'https://example.com/a' }], model: 'm' });
      if (path.endsWith('/compose')) return reply({ ok: true, dish: raw, model: 'm' });
      return reply({ ok: true, saved: true });
    }) as unknown as typeof fetch;
    const saved: string[] = [];
    const r = await createDishWithAi({ name: 'Paneer lababdar', description: 'rich gravy' }, { fetchImpl, onPhase: (p) => phases.push(p), saveImpl: async (d) => void saved.push(d.id) });
    expect(calls).toEqual(['/api/ai/plan', '/api/ai/research', '/api/ai/compose', '/api/ai/submit']);
    expect(phases).toEqual(['matching', 'researching', 'writing', 'saving']);
    expect(r.kind).toBe('created');
    if (r.kind === 'created') {
      expect(r.queued).toBe(true);
      expect(r.dish.ai?.basedOn?.name).toBe('Paneer Butter Masala');
    }
    expect(saved).toHaveLength(1);
  });

  it('opens an existing dish without any research', async () => {
    const base = researchDishes[0];
    const calls: string[] = [];
    const fetchImpl = (async (url: string) => {
      calls.push(url);
      return reply({ ok: true, plan: { mode: 'existing', baseDishId: base.id, canonicalName: base.name, summary: '', changes: [], searchQueries: [] } });
    }) as unknown as typeof fetch;
    const r = await createDishWithAi({ name: base.name, description: base.name }, { fetchImpl });
    expect(r).toEqual({ kind: 'existing', dish: base });
    expect(calls).toHaveLength(1);
  });

  it('explains an unconfigured or exhausted server in plain words', async () => {
    const fetchImpl = (async () => reply({ ok: false, error: 'quota', message: 'x' }, 429)) as unknown as typeof fetch;
    await expect(createDishWithAi({ name: 'Anything', description: 'anything at all' }, { fetchImpl })).rejects.toThrow(/allowance/);
  });

  it('still succeeds when the research queue is unreachable', async () => {
    const fetchImpl = (async (url: string) => {
      const path = new URL(url).pathname;
      if (path.endsWith('/plan')) return reply({ ok: true, plan: { mode: 'new', baseDishId: null, canonicalName: 'Test Dish', summary: '', changes: [], searchQueries: [] } });
      if (path.endsWith('/research')) return reply({ ok: true, notes: 'n', sources: [], model: 'm' });
      if (path.endsWith('/compose')) return reply({ ok: true, dish: raw, model: 'm' });
      throw new Error('offline');
    }) as unknown as typeof fetch;
    const r = await createDishWithAi({ name: 'Test dish', description: 'test' }, { fetchImpl, saveImpl: async () => {} });
    expect(r.kind === 'created' && r.queued).toBe(false);
  });
});

describe('shared AI library', () => {
  // imported late so the registry state from the tests above is what it sees
  it('lists shared dishes for everyone, skips known ones and retires replaced ones', async () => {
    const entry = { slug: 'paneer-lababdar', name: 'Paneer Lababdar', mode: 'new' as const, basedOn: null, changes: [], sources: [], model: 'm', requests: 3, dish: raw };
    expect(applyShared([entry])).toBe(1);
    const d = getDish('ai-paneer-lababdar')!;
    expect(d.ai?.shared).toBe(true);
    expect(d.ai?.requests).toBe(3);
    expect(applyShared([entry])).toBe(0); // already there
    expect(findKnownAiDish('paneer lababdar')?.id).toBe('ai-paneer-lababdar');
    expect(findKnownAiDish('zzz unknown dish')).toBeNull();

    // a researched dish with the same name replaces it, and the old id still opens
    const real = researchDishes.find((x) => !x.ai)!;
    applyShared([{ ...entry, slug: 'poha-copy', name: real.name }]);
    expect(getDish('ai-poha-copy')?.id).toBe(real.id);

    // sync caches the server's list and survives being offline
    const mem = new Map<string, string>();
    const storage = { getItem: async (k: string) => mem.get(k) ?? null, setItem: async (k: string, v: string) => void mem.set(k, v) };
    const ok = (async () => ({ ok: true, json: async () => ({ dishes: [{ ...entry, slug: 'other-dish', name: 'Other Dish' }] }) })) as unknown as typeof fetch;
    expect(await syncSharedDishes({ fetchImpl: ok, storage })).toBe(1);
    expect(mem.get('fitplate.sharedAi.v1')).toContain('other-dish');
    const offline = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    await expect(syncSharedDishes({ fetchImpl: offline, storage })).resolves.toBeGreaterThanOrEqual(0);
  });

  it('creation returns an existing shared dish without calling the AI', async () => {
    const fetchImpl = (async () => { throw new Error('should not be called'); }) as unknown as typeof fetch;
    const r = await createDishWithAi({ name: 'Paneer Lababdar', description: 'again' }, { fetchImpl });
    expect(r.kind).toBe('existing');
  });
});
