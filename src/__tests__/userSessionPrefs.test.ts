import { describe, expect, it } from '@jest/globals';

import type { ShoppingList } from '../models/prefs';
import { openUserData } from '../services/storage';
import { memoryKeyValueStore } from '../services/storage/kv';
import { copyGuestData, createUserSession, EMPTY_DOCS, loadDocs, SETTINGS_ID, type UserDocs } from '../services/userSession';
import { fakeClock, fakeFirestore } from './storage/fakes';

const list: ShoppingList = {
  title: 'Poha',
  dishIds: ['001-poha'],
  servings: { '001-poha': 2 },
  items: [{ key: 'poha', ingredientId: 'poha', name: 'Poha', quantity: 120, unit: 'g', dishIds: ['001-poha'], included: true, checked: false, variant: null }],
  status: 'open',
  boughtVia: null,
  orderedAt: null,
};

function session(now = fakeClock().now) {
  const kv = memoryKeyValueStore();
  const data = openUserData({ kv, uid: null, remote: null });
  let latest: UserDocs = EMPTY_DOCS;
  const s = createUserSession(data, EMPTY_DOCS, { onChange: (d) => (latest = d), now });
  return { kv, data, s, latest: () => latest };
}

describe('priority plan P2-b: settings, lists, weight, ratings, cooks', () => {
  it('keeps settings as one document and remembers brands', async () => {
    const { data, s, latest } = session();
    s.updateSettings({ preferredVendor: 'instamart' });
    s.chooseBrand('paneer', 'Amul · 200 g');
    expect(latest().settings?.preferredVendor).toBe('instamart');
    expect(latest().settings?.brandChoice).toEqual({ paneer: 'Amul · 200 g' });
    await s.idle();
    const stored = await loadDocs(data.repos);
    expect(stored.settings?.id).toBe(SETTINGS_ID);
    expect(stored.settings?.brandChoice).toEqual({ paneer: 'Amul · 200 g' });
    s.chooseBrand('paneer', null);
    expect(latest().settings?.brandChoice).toEqual({});
  });

  it('saves, replaces and removes shopping lists', async () => {
    const { data, s, latest } = session();
    const id = s.saveShoppingList(list);
    s.saveShoppingList({ ...list, items: [{ ...list.items[0], checked: true }] }, id);
    expect(latest().shoppingLists[id].items[0].checked).toBe(true);
    await s.idle();
    expect((await loadDocs(data.repos)).shoppingLists[id].items[0].checked).toBe(true);
    s.removeShoppingList(id);
    await s.idle();
    expect((await loadDocs(data.repos)).shoppingLists[id]).toBeUndefined();
  });

  it('adds weight, ratings and cook completions', async () => {
    const { data, s } = session();
    s.addWeight(72.5);
    s.rateDish('001-poha', 4);
    s.rateDish('001-poha', 5, 'perfect');
    s.addCookCompletion({ dishId: '001-poha', servings: 2, costInr: 60, orderPriceInr: 180, boughtVia: 'self' });
    await s.idle();
    const d = await loadDocs(data.repos);
    expect(Object.values(d.weightLogs).map((w) => w.kg)).toEqual([72.5]);
    expect(d.ratings['001-poha']).toMatchObject({ stars: 5, note: 'perfect' });
    expect(Object.values(d.cookCompletions)[0]).toMatchObject({ dishId: '001-poha', servings: 2, boughtVia: 'self' });
  });

  it('syncs the new collections to the cloud and copies guest lists into an account', async () => {
    const kv = memoryKeyValueStore();
    const guest = openUserData({ kv, uid: null, remote: null });
    const g = createUserSession(guest, EMPTY_DOCS, { onChange: () => {} });
    g.saveShoppingList(list);
    g.chooseBrand('poha', 'Generic · 500 g');
    await g.idle();

    const fs = fakeFirestore();
    const account = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    await copyGuestData(kv, account, 'u1');
    await account.flush();
    const paths = [...fs.docs.keys()];
    expect(paths.some((p) => p.startsWith('users/u1/shoppingLists/'))).toBe(true);
    expect(paths).toContain('users/u1/settings/settings');
  });
});
