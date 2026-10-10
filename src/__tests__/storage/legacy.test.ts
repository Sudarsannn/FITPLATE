import { describe, expect, it } from '@jest/globals';

import { createLocalDocStore } from '../../services/storage/docStore';
import { copyGuestToAccount } from '../../services/storage/guest';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { DEMO_SAMPLE_SAVED_INR, fromLegacyState, type LegacyState } from '../../services/storage/legacy';
import { createRemoteDocStore } from '../../services/storage/remote';
import { createRepositories, openUserData } from '../../services/storage';
import { fakeClock, fakeFirestore } from './fakes';

const NOW = 1_760_000_000_000;
const sampleAt = new Date(2026, 9, 9, 8).getTime(); // whole hour, as the demo seeds it
const realAt = sampleAt + 1234; // a real tap

const state: LegacyState = {
  profile: { name: 'Sudarsan', goal: 'muscle', level: 'expert', diet: 'veg', breakfastReminder: false, onboarded: true },
  days: {
    '2026-10-09': {
      meals: [{ name: 'Poha', emoji: '🍚', kcal: 300, protein: 8, fibre: 3, cooked: true, at: sampleAt }],
      exercise: [{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }],
      water: 7,
    },
    '2026-10-10': {
      meals: [{ name: 'Sandwich', emoji: '🥪', kcal: 380, protein: 14, fibre: 4, cooked: false, at: realAt }],
      exercise: [{ type: 'Run', minutes: 20, kcal: 200, at: realAt + 5 }],
      water: 3,
    },
  },
  moneySaved: DEMO_SAMPLE_SAVED_INR + 450,
  favourites: ['poha'],
  plan: { '2026-10-11': { dinner: 'rajma-chawal' } },
};

describe('migration from the demo blob (fitplate.state.v2)', () => {
  const out = fromLegacyState(state, NOW);

  it('maps the profile onto the new UserProfile with nulls for unknown body data', () => {
    expect(out.profile).toMatchObject({ id: 'profile', name: 'Sudarsan', goal: 'muscle', dietType: 'veg', cookingLevel: 'expert', breakfastReminder: false, onboarded: true, weightKg: null, schemaVersion: 1 });
  });

  it('marks the made-up sample week and keeps real logs unmarked', () => {
    expect(out.mealLogs.find((m) => m.dateKey === '2026-10-09')?.demoSample).toBe(true);
    expect(out.mealLogs.find((m) => m.dateKey === '2026-10-10')?.demoSample).toBeUndefined();
    expect(out.workoutLogs.find((w) => w.dateKey === '2026-10-09')?.demoSample).toBe(true);
    expect(out.waterLogs.find((w) => w.dateKey === '2026-10-09')?.demoSample).toBe(true);
    expect(out.waterLogs.find((w) => w.dateKey === '2026-10-10')).toMatchObject({ id: 'water-2026-10-10', glasses: 3 });
  });

  it('does not count the seeded ₹2,860 as the user’s savings', () => {
    expect(out.savings).toEqual([expect.objectContaining({ id: 'legacy-total', amountInr: 450 })]);
  });

  it('carries favourites and the meal plan', () => {
    expect(out.favourites.map((f) => f.dishId)).toEqual(['poha']);
    expect(out.mealPlans[0]).toMatchObject({ id: '2026-10-11', slots: { dinner: 'rajma-chawal' } });
  });

  it('gives the same ids every run, so running it twice never duplicates', () => {
    const again = fromLegacyState(state, NOW + 999);
    expect(again.mealLogs.map((m) => m.id)).toEqual(out.mealLogs.map((m) => m.id));
  });

  it('keeps savings when there is no sample week', () => {
    const clean = fromLegacyState({ ...state, days: {}, moneySaved: 300 }, NOW);
    expect(clean.savings[0].amountInr).toBe(300);
  });
});

describe('guest to account copy', () => {
  it('copies real guest data to the cloud and never the demo sample', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const guest = createLocalDocStore(kv, 'guest');
    const out = fromLegacyState(state, NOW);
    await guest.putMany('mealLogs', out.mealLogs);
    await guest.putMany('profile', [out.profile]);
    const account = createRemoteDocStore(fs.adapter, 'u1');
    const copied = await copyGuestToAccount(guest, account);
    expect(copied).toBe(2);
    expect(fs.docs.has('users/u1')).toBe(true);
    expect([...fs.docs.keys()].filter((k) => k.includes('mealLogs'))).toHaveLength(1);
  });

  it('does not overwrite newer cloud data', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const guest = createLocalDocStore(kv, 'guest');
    const account = createRemoteDocStore(fs.adapter, 'u1');
    await guest.putMany('profile', [{ ...fromLegacyState(state, NOW).profile, updatedAt: 1 }]);
    await account.putMany('profile', [{ ...fromLegacyState(state, NOW).profile, name: 'Cloud name', updatedAt: 5 }]);
    expect(await copyGuestToAccount(guest, account, ['profile'])).toBe(0);
    expect(fs.docs.get('users/u1')).toMatchObject({ name: 'Cloud name' });
  });
});

describe('openUserData', () => {
  it('guests use the device only', async () => {
    const data = openUserData({ kv: memoryKeyValueStore(), uid: null, remote: null });
    expect(data.cloud).toBe(false);
    expect(data.owner).toBe('guest');
    await data.repos.mealLogs.create({ timestamp: 1, dateKey: '2026-10-10', name: 'Dal', emoji: '🍲', dishId: null, source: 'custom', kcal: 200, proteinG: 9, fibreG: 4, cooked: true });
    expect(await data.pending()).toBe(0);
  });

  it('signed-in users sync to users/{uid}, and sign-out clears only this device', async () => {
    const kv = memoryKeyValueStore({ 'fitplate.docs.guest.mealLogs.v1': '{}' });
    const fs = fakeFirestore();
    const clock = fakeClock();
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter, deps: { now: clock.now } });
    expect(data.cloud).toBe(true);
    await data.repos.profile.upsert('profile', { ...fromLegacyState(state, NOW).profile });
    await data.syncAll();
    expect(fs.docs.get('users/u1')).toMatchObject({ name: 'Sudarsan' });
    await data.clearDevice();
    expect(Object.keys(kv.dump())).toEqual(['fitplate.docs.guest.mealLogs.v1']);
    expect(fs.docs.has('users/u1')).toBe(true);
  });

  it('a second device sees the first device’s data after a sync', async () => {
    const fs = fakeFirestore();
    const phone = openUserData({ kv: memoryKeyValueStore(), uid: 'u1', remote: fs.adapter });
    await phone.repos.favourites.upsert('poha', { dishId: 'poha' });
    await phone.flush();
    const laptop = openUserData({ kv: memoryKeyValueStore(), uid: 'u1', remote: fs.adapter });
    await laptop.syncAll();
    expect((await laptop.repos.favourites.list()).map((f) => f.dishId)).toEqual(['poha']);
  });

  it('builds one repository per collection', () => {
    const repos = createRepositories(createLocalDocStore(memoryKeyValueStore(), 'guest'));
    expect(Object.keys(repos).sort()).toEqual(['favourites', 'mealLogs', 'mealPlans', 'profile', 'savings', 'supplementLogs', 'waterLogs', 'workoutLogs']);
  });
});
