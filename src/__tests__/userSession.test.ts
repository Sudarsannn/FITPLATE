import { describe, expect, it } from '@jest/globals';

import type { LegacyState } from '../services/storage';
import { LEGACY_KEY, openUserData } from '../services/storage';
import { memoryKeyValueStore } from '../services/storage/kv';
import { DEMO_SAMPLE_SAVED_INR, fromLegacyState } from '../services/storage/legacy';
import {
  copyGuestData,
  createUserSession,
  dateKeyOf,
  EMPTY_DOCS,
  guestCopyAskedKey,
  GUEST_READY_KEY,
  guestOfferCount,
  legacyProfilePatch,
  loadDocs,
  ownDataCount,
  prepareGuestDevice,
  sampleDocs,
  signOutDevice,
  skipGuestCopy,
  syncStatusLine,
  toView,
  type UserDocs,
} from '../services/userSession';
import { fakeClock, fakeFirestore } from './storage/fakes';

const sampleAt = new Date(2026, 9, 9, 8).getTime(); // whole hour, as the demo seeds it
const realAt = sampleAt + 1234;

const blob: LegacyState = {
  profile: { name: 'Asha', goal: 'muscle', level: 'expert', diet: 'veg', breakfastReminder: false, onboarded: true },
  days: {
    '2026-10-09': {
      meals: [{ name: 'Poha', emoji: '🍚', kcal: 300, protein: 8, fibre: 3, cooked: true, at: sampleAt, dishId: null }],
      exercise: [{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }],
      water: 7,
    },
    '2026-10-10': {
      meals: [{ name: 'Sandwich', emoji: '🥪', kcal: 380, protein: 14, fibre: 4, cooked: false, at: realAt, dishId: null }],
      exercise: [{ type: 'Run', minutes: 20, kcal: 200, at: realAt + 5 }],
      water: 3,
    },
  },
  moneySaved: DEMO_SAMPLE_SAVED_INR + 450,
  favourites: ['poha'],
  plan: { '2026-10-11': { dinner: 'rajma-chawal' } },
};

const seed = (): LegacyState => ({
  profile: { name: '', goal: 'lose', level: 'beginner', diet: 'non-veg', breakfastReminder: true, onboarded: false },
  days: { '2026-10-08': { meals: [{ name: 'Poha', emoji: '🍚', kcal: 300, protein: 8, fibre: 3, cooked: true, at: sampleAt }], exercise: [], water: 6 } },
  moneySaved: DEMO_SAMPLE_SAVED_INR,
  favourites: ['poha'],
  plan: {},
});

const meal = { name: 'Dal', emoji: '🍲', dishId: null, source: 'quick' as const, kcal: 200, proteinG: 9, fibreG: 4, cooked: false };

function guestSession(kv = memoryKeyValueStore(), now = fakeClock().now) {
  const data = openUserData({ kv, uid: null, remote: null });
  let latest: UserDocs = EMPTY_DOCS;
  const session = createUserSession(data, EMPTY_DOCS, { onChange: (d) => (latest = d), now });
  return { kv, data, session, view: () => toView(latest) };
}

describe('toView (documents → the screens’ shape)', () => {
  it('rebuilds the demo state from migrated documents', () => {
    const docs = fromLegacyState(blob, 1);
    const byId = <T extends { id: string }>(l: T[]) => Object.fromEntries(l.map((d) => [d.id, d]));
    const view = toView({
      ...EMPTY_DOCS,
      profile: docs.profile,
      mealLogs: byId(docs.mealLogs),
      waterLogs: byId(docs.waterLogs),
      workoutLogs: byId(docs.workoutLogs),
      favourites: byId(docs.favourites),
      mealPlans: byId(docs.mealPlans),
      savings: byId(docs.savings),
    });
    expect(view).toEqual(blob);
  });

  it('shows the default profile and empty totals when there is nothing yet', () => {
    expect(toView(EMPTY_DOCS)).toMatchObject({ days: {}, moneySaved: 0, favourites: [], plan: {}, profile: { onboarded: false, goal: 'lose' } });
  });

  it('maps the screens’ profile fields onto UserProfile', () => {
    expect(legacyProfilePatch({ level: 'expert', diet: 'egg', onboarded: true })).toEqual({ cookingLevel: 'expert', dietType: 'egg', onboarded: true });
    expect(legacyProfilePatch({})).toEqual({});
  });
});

describe('prepareGuestDevice', () => {
  it('moves the demo blob into guest documents once and keeps the blob as a backup', async () => {
    const kv = memoryKeyValueStore({ [LEGACY_KEY]: JSON.stringify(blob) });
    const data = openUserData({ kv, uid: null, remote: null });
    expect(await prepareGuestDevice(kv, data, seed, 5)).toBe('migrated');
    expect(await prepareGuestDevice(kv, data, seed, 6)).toBe('ready');
    expect(toView(await loadDocs(data.repos))).toEqual(blob);
    expect(await kv.getItem(LEGACY_KEY)).not.toBeNull();
  });

  it('seeds the sample week on a new device, all of it marked as sample', async () => {
    const kv = memoryKeyValueStore();
    const data = openUserData({ kv, uid: null, remote: null });
    expect(await prepareGuestDevice(kv, data, seed, 5)).toBe('seeded');
    const docs = await loadDocs(data.repos);
    expect(toView(docs).moneySaved).toBe(DEMO_SAMPLE_SAVED_INR);
    expect(ownDataCount(docs)).toBe(0);
    expect(await kv.getItem(GUEST_READY_KEY)).toBe('5');
  });

  it('ignores a corrupt blob and seeds instead', async () => {
    const kv = memoryKeyValueStore({ [LEGACY_KEY]: '{not json' });
    expect(await prepareGuestDevice(kv, openUserData({ kv, uid: null, remote: null }), seed, 5)).toBe('seeded');
  });
});

describe('createUserSession', () => {
  it('shows a logged meal on the same tap and saves it to the device', async () => {
    const { data, session, view } = guestSession();
    session.addMeal(meal);
    const k = dateKeyOf(fakeClock().now());
    expect(view().days[k].meals).toEqual([expect.objectContaining({ name: 'Dal', kcal: 200, protein: 9 })]);
    await session.idle();
    expect(toView(await loadDocs(data.repos)).days[k].meals).toHaveLength(1);
  });

  it('keeps every rapid water tap and never goes below zero', async () => {
    const { data, session, view } = guestSession();
    session.addWater(1);
    session.addWater(1);
    session.addWater(1);
    session.addWater(-1);
    const k = dateKeyOf(fakeClock().now());
    expect(view().days[k].water).toBe(2);
    session.addWater(-5);
    expect(view().days[k]?.water ?? 0).toBe(0);
    await session.idle();
    const stored = await data.repos.waterLogs.list();
    expect(stored).toEqual([expect.objectContaining({ id: `water-${k}`, glasses: 0 })]);
  });

  it('sends water taps to the cloud as one batch', async () => {
    const fs = fakeFirestore();
    const data = openUserData({ kv: memoryKeyValueStore(), uid: 'u1', remote: fs.adapter });
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {} });
    for (let i = 0; i < 5; i++) session.addWater(1);
    await session.idle();
    await data.flush();
    expect(fs.state.batches).toBe(1);
    expect([...fs.docs.values()]).toEqual([expect.objectContaining({ glasses: 5 })]);
  });

  it('toggles a favourite on and off with a soft delete', async () => {
    const { data, session, view } = guestSession();
    session.toggleFavourite('poha');
    expect(view().favourites).toEqual(['poha']);
    session.toggleFavourite('poha');
    expect(view().favourites).toEqual([]);
    await session.idle();
    expect(await data.repos.favourites.list()).toEqual([]);
    expect((await data.store.getAll('favourites')).poha).toMatchObject({ deleted: true });
    session.toggleFavourite('poha');
    await session.idle();
    expect((await data.repos.favourites.list()).map((f) => f.dishId)).toEqual(['poha']);
  });

  it('sets and clears meal-plan slots', async () => {
    const { data, session, view } = guestSession();
    session.setPlan('2026-10-12', 'lunch', 'poha');
    session.setPlan('2026-10-12', 'dinner', 'rajma-chawal');
    session.setPlan('2026-10-12', 'lunch', null);
    expect(view().plan).toEqual({ '2026-10-12': { dinner: 'rajma-chawal' } });
    await session.idle();
    expect(toView(await loadDocs(data.repos)).plan).toEqual({ '2026-10-12': { dinner: 'rajma-chawal' } });
  });

  it('saves profile changes in order and records the onboarding day', async () => {
    const { data, session, view } = guestSession();
    session.updateProfile({ name: 'Asha' });
    session.updateProfile({ onboarded: true, goal: 'muscle' });
    expect(view().profile).toMatchObject({ name: 'Asha', goal: 'muscle', onboarded: true });
    await session.idle();
    expect(await data.repos.profile.get('profile')).toMatchObject({ name: 'Asha', goal: 'muscle', onboarded: true, onboardedOn: dateKeyOf(fakeClock().now()) });
  });

  it('adds savings and workouts to the totals', async () => {
    const { session, view } = guestSession();
    session.addSaving(120, 'poha');
    session.addWorkout({ type: 'Walk', exerciseId: null, minutes: 30, kcal: 120 });
    expect(view().moneySaved).toBe(120);
    expect(Object.values(view().days)[0].exercise).toEqual([expect.objectContaining({ type: 'Walk', minutes: 30 })]);
  });

  it('resets a guest to the sample week', async () => {
    const { data, session, view } = guestSession();
    session.addMeal(meal);
    session.resetToSample(seed());
    expect(view().moneySaved).toBe(DEMO_SAMPLE_SAVED_INR);
    await session.idle();
    const docs = await loadDocs(data.repos);
    expect(ownDataCount(docs)).toBe(0);
    expect(Object.values(docs.mealLogs).map((m) => m.name)).toEqual(['Poha']);
  });

  it('reports a failed write instead of throwing, and keeps going', async () => {
    const kv = memoryKeyValueStore();
    const broken = { ...kv, setItem: async () => Promise.reject(new Error('disk full')) };
    const data = openUserData({ kv: broken, uid: null, remote: null });
    const errors: unknown[] = [];
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {}, onError: (e) => errors.push(e) });
    session.addMeal(meal);
    session.addWater(1);
    await session.idle();
    expect(errors).toHaveLength(2);
  });
});

describe('guest → account ("Bring your data with you?")', () => {
  async function guestWithOwnMeal() {
    const kv = memoryKeyValueStore();
    const guest = openUserData({ kv, uid: null, remote: null });
    await prepareGuestDevice(kv, guest, seed, 1);
    const session = createUserSession(guest, await loadDocs(guest.repos), { onChange: () => {} });
    session.addMeal(meal);
    await session.idle();
    return kv;
  }

  it('offers nothing when the device only has the sample week', async () => {
    const kv = memoryKeyValueStore();
    await prepareGuestDevice(kv, openUserData({ kv, uid: null, remote: null }), seed, 1);
    expect(await guestOfferCount(kv, 'u1')).toBe(0);
  });

  it('copies only the guest’s own entries to the cloud, then forgets them on the device', async () => {
    const kv = await guestWithOwnMeal();
    expect(await guestOfferCount(kv, 'u1')).toBe(1);
    const fs = fakeFirestore();
    const account = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    expect(await copyGuestData(kv, account, 'u1')).toBe(1);
    await account.flush();
    expect([...fs.docs.values()]).toEqual([expect.objectContaining({ name: 'Dal' })]);
    expect(Object.keys(kv.dump()).some((k) => k.startsWith('fitplate.docs.guest.'))).toBe(false);
    expect(await guestOfferCount(kv, 'u1')).toBe(0);
    // The guest store is not re-seeded or re-migrated afterwards.
    expect(await prepareGuestDevice(kv, openUserData({ kv, uid: null, remote: null }), seed, 2)).toBe('ready');
  });

  it('"Start fresh" keeps the guest data and stops asking this account', async () => {
    const kv = await guestWithOwnMeal();
    await skipGuestCopy(kv, 'u1');
    expect(await guestOfferCount(kv, 'u1')).toBe(0);
    expect(await kv.getItem(guestCopyAskedKey('u1'))).toBe('skipped');
    expect(await guestOfferCount(kv, 'u2')).toBe(1);
    expect(ownDataCount(await loadDocs(openUserData({ kv, uid: null, remote: null }).repos))).toBe(1);
  });
});

describe('signOutDevice', () => {
  it('clears this device once everything reached the cloud', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {} });
    session.addMeal(meal);
    await session.idle();
    expect(await signOutDevice(data)).toBe(0);
    expect(Object.keys(kv.dump())).toEqual([]);
    expect(fs.docs.size).toBe(1);
  });

  it('keeps the device copy when offline, and sends it at the next sign-in', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {} });
    session.addMeal(meal);
    await session.idle();
    fs.state.offline = true;
    expect(await signOutDevice(data)).toBe(1);
    fs.state.offline = false;
    const again = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    await again.syncAll();
    expect([...fs.docs.values()]).toEqual([expect.objectContaining({ name: 'Dal' })]);
  });

  it('never clears a signed-in user whose data is device-only', async () => {
    const kv = memoryKeyValueStore();
    const data = openUserData({ kv, uid: 'u1', remote: null });
    await data.repos.mealLogs.create({ ...meal, timestamp: 1, dateKey: '2026-10-10' });
    expect(await signOutDevice(data)).toBe(0);
    expect(await data.repos.mealLogs.list()).toHaveLength(1);
  });
});

describe('sampleDocs', () => {
  it('marks every sample entry, but not the profile', () => {
    const s = sampleDocs(seed(), 1);
    expect([...s.mealLogs, ...s.waterLogs, ...s.favourites, ...s.savings].every((d) => d.demoSample)).toBe(true);
    expect(s.profile).not.toHaveProperty('demoSample');
  });
});

describe('copying a profile', () => {
  it('uses the guest profile for a new account but never overwrites an existing one', async () => {
    const kv = memoryKeyValueStore();
    const guest = openUserData({ kv, uid: null, remote: null });
    const g = createUserSession(guest, EMPTY_DOCS, { onChange: () => {} });
    g.updateProfile({ name: 'Guest name', onboarded: true });
    await g.idle();

    const fresh = openUserData({ kv, uid: 'new', remote: null });
    expect(await copyGuestData(kv, fresh, 'new')).toBe(1);
    expect(await fresh.repos.profile.get('profile')).toMatchObject({ name: 'Guest name' });

    const kv2 = memoryKeyValueStore();
    const guest2 = createUserSession(openUserData({ kv: kv2, uid: null, remote: null }), EMPTY_DOCS, { onChange: () => {}, now: () => 9e12 });
    guest2.updateProfile({ name: 'Newer guest', onboarded: true });
    await guest2.idle();
    const existing = openUserData({ kv: kv2, uid: 'old', remote: null });
    await existing.repos.profile.upsert('profile', { ...(await fresh.repos.profile.get('profile'))!, name: 'Account name' });
    await copyGuestData(kv2, existing, 'old');
    expect(await existing.repos.profile.get('profile')).toMatchObject({ name: 'Account name' });
  });
});

describe('syncStatusLine', () => {
  it('tells guests, device-only, synced and offline users where their data is', () => {
    expect(syncStatusLine(false, false, false)).toMatch(/this device only/);
    expect(syncStatusLine(true, false, false)).toBe('Saved on this device.');
    expect(syncStatusLine(true, true, false)).toMatch(/Synced to your account/);
    expect(syncStatusLine(true, true, true)).toMatch(/will sync when you’re back online/);
  });
});
