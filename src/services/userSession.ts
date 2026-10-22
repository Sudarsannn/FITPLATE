import type { BaseDoc, DateKey, Doc } from '../models/common';
import type { Favourite, MealLog, MealPlanDay, SavingEntry, WaterLog, WorkoutLog } from '../models/logs';
import { DEFAULT_SETTINGS, type CookCompletion, type DishRating, type ShoppingList, type UserSettings, type WeightLog } from '../models/prefs';
import { withSurveyDefaults } from '../models/survey';
import { DEFAULT_PROFILE, type UserProfile } from '../models/user';
import type { DayLog, Profile, Slot } from '../lib/store';
import { deleteAllUserData } from './storage/deleteUser';
import { createLocalDocStore, ownerPrefix } from './storage/docStore';
import { COLLECTIONS, copyGuestToAccount, createRepositories, fromLegacyState, GUEST_OWNER, LEGACY_KEY, PROFILE_ID, SCHEMAS, type LegacyState, type Repositories, type UserData } from './storage';
import type { LegacyDocs } from './storage/legacy';
import type { KeyValueStore } from './storage/kv';
import type { RemoteAdapter } from './storage/remote';
import { makeId } from './storage/repository';
import { createStorageService } from './storage/storageService';

/**
 * Day 03b: the bridge between the screens and the storage layer.
 * The screens still read the demo's shape (`days`, `moneySaved`, …); this
 * module keeps the user's documents in memory, derives that shape from them,
 * and sends every change through the repositories (device, plus Firestore
 * when signed in).
 */

/** The user's documents, by collection and id. Soft-deleted documents are left out. */
export type UserDocs = {
  profile: Doc<UserProfile> | null;
  mealLogs: Record<string, Doc<MealLog>>;
  waterLogs: Record<string, Doc<WaterLog>>;
  workoutLogs: Record<string, Doc<WorkoutLog>>;
  favourites: Record<string, Doc<Favourite>>;
  mealPlans: Record<string, Doc<MealPlanDay>>;
  savings: Record<string, Doc<SavingEntry>>;
  // Priority plan P2-b.
  settings: Doc<UserSettings> | null;
  shoppingLists: Record<string, Doc<ShoppingList>>;
  weightLogs: Record<string, Doc<WeightLog>>;
  ratings: Record<string, Doc<DishRating>>;
  cookCompletions: Record<string, Doc<CookCompletion>>;
};

/** Id of the one settings document. */
export const SETTINGS_ID = 'settings';

type ListCollection = Exclude<keyof UserDocs, 'profile' | 'settings'>;
const LIST_COLLECTIONS: readonly ListCollection[] = [
  'mealLogs',
  'waterLogs',
  'workoutLogs',
  'favourites',
  'mealPlans',
  'savings',
  'shoppingLists',
  'weightLogs',
  'ratings',
  'cookCompletions',
];

export const EMPTY_DOCS: UserDocs = {
  profile: null,
  mealLogs: {},
  waterLogs: {},
  workoutLogs: {},
  favourites: {},
  mealPlans: {},
  savings: {},
  settings: null,
  shoppingLists: {},
  weightLogs: {},
  ratings: {},
  cookCompletions: {},
};

/** Set once the guest store on this device has been migrated from the demo blob, or seeded. */
export const GUEST_READY_KEY = 'fitplate.guestReady.v1';
/** Set once a signed-in user has answered "Bring your data with you?" on this device. */
export const guestCopyAskedKey = (uid: string) => `fitplate.guestCopyAsked.${uid}.v1`;

const byId = <T extends BaseDoc>(docs: T[]): Record<string, T> => Object.fromEntries(docs.map((d) => [d.id, d]));

export const dateKeyOf = (t: number): DateKey => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function loadDocs(repos: Repositories): Promise<UserDocs> {
  const [profile, mealLogs, waterLogs, workoutLogs, favourites, mealPlans, savings, settings, shoppingLists, weightLogs, ratings, cookCompletions] =
    await Promise.all([
      repos.profile.get(PROFILE_ID),
      repos.mealLogs.list(),
      repos.waterLogs.list(),
      repos.workoutLogs.list(),
      repos.favourites.list(),
      repos.mealPlans.list(),
      repos.savings.list(),
      repos.settings.get(SETTINGS_ID),
      repos.shoppingLists.list(),
      repos.weightLogs.list(),
      repos.ratings.list(),
      repos.cookCompletions.list(),
    ]);
  return {
    profile,
    mealLogs: byId(mealLogs),
    waterLogs: byId(waterLogs),
    workoutLogs: byId(workoutLogs),
    favourites: byId(favourites),
    mealPlans: byId(mealPlans),
    savings: byId(savings),
    settings,
    shoppingLists: byId(shoppingLists),
    weightLogs: byId(weightLogs),
    ratings: byId(ratings),
    cookCompletions: byId(cookCompletions),
  };
}

export function profileToLegacy(p: UserProfile | null): Profile {
  const x = p ?? DEFAULT_PROFILE;
  return { name: x.name, goal: x.goal, level: x.cookingLevel, diet: x.dietType, breakfastReminder: x.breakfastReminder, onboarded: x.onboarded, survey: withSurveyDefaults(x.survey) };
}

export function legacyProfilePatch(p: Partial<Profile>): Partial<UserProfile> {
  const out: Partial<UserProfile> = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.goal !== undefined) out.goal = p.goal;
  if (p.level !== undefined) out.cookingLevel = p.level;
  if (p.diet !== undefined) out.dietType = p.diet;
  if (p.breakfastReminder !== undefined) out.breakfastReminder = p.breakfastReminder;
  if (p.onboarded !== undefined) out.onboarded = p.onboarded;
  if (p.survey !== undefined) out.survey = p.survey;
  return out;
}

const live = <T extends BaseDoc>(r: Record<string, T>) => Object.values(r).filter((d) => !d.deleted);

/** The demo's state shape, derived from the documents. Pure. */
export function toView(docs: UserDocs): LegacyState {
  const days: Record<string, DayLog> = {};
  const day = (k: DateKey) => (days[k] ??= { meals: [], exercise: [], water: 0 });
  for (const m of live(docs.mealLogs).sort((a, b) => a.timestamp - b.timestamp)) {
    day(m.dateKey).meals.push({ name: m.name, emoji: m.emoji, kcal: m.kcal, protein: m.proteinG, fibre: m.fibreG, cooked: m.cooked, at: m.timestamp, dishId: m.dishId });
  }
  for (const w of live(docs.workoutLogs).sort((a, b) => a.timestamp - b.timestamp)) {
    day(w.dateKey).exercise.push({ type: w.type, minutes: w.minutes, kcal: w.kcal, at: w.timestamp });
  }
  for (const w of live(docs.waterLogs)) if (w.glasses > 0) day(w.dateKey).water = w.glasses;
  return {
    profile: profileToLegacy(docs.profile && !docs.profile.deleted ? docs.profile : null),
    days,
    moneySaved: live(docs.savings).reduce((s, e) => s + e.amountInr, 0),
    favourites: live(docs.favourites)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((f) => f.dishId),
    plan: Object.fromEntries(live(docs.mealPlans).map((p) => [p.dateKey, p.slots])),
  };
}

/** How many of these documents are the user's own (not the demo's sample week). */
export function ownDataCount(docs: UserDocs): number {
  let n = docs.profile && !docs.profile.deleted && docs.profile.onboarded ? 1 : 0;
  if (docs.settings && !docs.settings.deleted && Object.keys(docs.settings.brandChoice ?? {}).length) n += 1;
  for (const c of LIST_COLLECTIONS) {
    n += live(docs[c] as Record<string, BaseDoc & { demoSample?: boolean }>).filter((d) => !d.demoSample).length;
  }
  return n;
}

/** The demo's sample week as documents, every one marked `demoSample` so it never reaches an account. */
export function sampleDocs(seed: LegacyState, now: number): LegacyDocs {
  const docs = fromLegacyState(seed, now);
  const mark = <T extends BaseDoc>(list: T[]) => list.map((d) => ({ ...d, demoSample: true }));
  return {
    profile: docs.profile,
    mealLogs: mark(docs.mealLogs),
    waterLogs: mark(docs.waterLogs),
    workoutLogs: mark(docs.workoutLogs),
    favourites: mark(docs.favourites),
    mealPlans: mark(docs.mealPlans),
    savings: mark(docs.savings),
  };
}

async function importDocs(repos: Repositories, docs: LegacyDocs) {
  await repos.profile.importMany([docs.profile]);
  await repos.mealLogs.importMany(docs.mealLogs);
  await repos.waterLogs.importMany(docs.waterLogs);
  await repos.workoutLogs.importMany(docs.workoutLogs);
  await repos.favourites.importMany(docs.favourites);
  await repos.mealPlans.importMany(docs.mealPlans);
  await repos.savings.importMany(docs.savings);
}

function parseLegacy(raw: string | null): LegacyState | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && v.profile && v.days ? (v as LegacyState) : null;
  } catch {
    return null;
  }
}

/**
 * First run of the new storage on this device (guest store only):
 * - an existing demo blob (`fitplate.state.v2`) becomes guest documents, so nobody loses their logs;
 * - otherwise the demo's sample week is seeded, marked as sample.
 * Runs once; the old blob is left untouched as a backup.
 */
export async function prepareGuestDevice(kv: KeyValueStore, guest: UserData, seed: () => LegacyState, now: number): Promise<'ready' | 'migrated' | 'seeded'> {
  if (await kv.getItem(GUEST_READY_KEY)) return 'ready';
  const legacy = parseLegacy(await kv.getItem(LEGACY_KEY));
  await importDocs(guest.repos, legacy ? fromLegacyState(legacy, now) : sampleDocs(seed(), now));
  await kv.setItem(GUEST_READY_KEY, String(now));
  return legacy ? 'migrated' : 'seeded';
}

const guestRepos = (kv: KeyValueStore) => createRepositories(createLocalDocStore(kv, GUEST_OWNER));

/** Number of the guest's own documents to offer to this account; 0 once the user has answered. */
export async function guestOfferCount(kv: KeyValueStore, uid: string): Promise<number> {
  if (await kv.getItem(guestCopyAskedKey(uid))) return 0;
  return ownDataCount(await loadDocs(guestRepos(kv)));
}

/** "Copy my data": copy the guest's own documents into the account, then forget them on the device. */
export async function copyGuestData(kv: KeyValueStore, account: UserData, uid: string): Promise<number> {
  const guest = createLocalDocStore(kv, GUEST_OWNER);
  let copied = await copyGuestToAccount(guest, account.store, COLLECTIONS.filter((c) => c !== 'profile'));
  // The account's own profile always wins; the guest's is used only for a brand-new account.
  const guestProfile = (await guest.getAll<Doc<UserProfile>>('profile'))[PROFILE_ID];
  if (guestProfile?.onboarded && !(await account.repos.profile.get(PROFILE_ID))) {
    await account.repos.profile.importMany([guestProfile]);
    copied += 1;
  }
  await createStorageService(kv).resetAll(ownerPrefix(GUEST_OWNER));
  await kv.setItem(guestCopyAskedKey(uid), 'copied');
  return copied;
}

/** "Start fresh": keep the guest data on the device and do not ask this account again. */
export async function skipGuestCopy(kv: KeyValueStore, uid: string): Promise<void> {
  await kv.setItem(guestCopyAskedKey(uid), 'skipped');
}

/**
 * Sign-out (SPEC-ADDENDA §5): the cloud keeps the data and this device forgets it.
 * If some changes could not reach the cloud (offline), the device copy and its
 * outbox are kept, so nothing is lost; they are sent at the next sign-in.
 * Returns the number of changes still waiting.
 */
export async function signOutDevice(data: UserData): Promise<number> {
  if (!data.cloud) return 0;
  try {
    await data.flush();
  } catch {
    // Offline: the outbox keeps the changes.
  }
  const waiting = await data.pending();
  if (waiting === 0) await data.clearDevice();
  return waiting;
}

const DELETE_TIMEOUT_MS = 20_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('unavailable: the cloud did not answer in time')), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

/**
 * "Delete my data" (signed in, cloud on): hard-deletes everything under
 * `users/{uid}` in Firestore, then forgets this account on the device (its
 * documents, its outbox so nothing re-uploads, and the "bring your data"
 * answer). Waiting changes are sent first so no debounced write can land
 * after the delete. If the cloud can't be reached this throws before
 * anything on the device changes. Signing out is left to the caller.
 */
export async function deleteMyData(
  data: UserData,
  remote: RemoteAdapter,
  uid: string,
  kv: KeyValueStore,
  opts: { timeoutMs?: number } = {},
): Promise<number> {
  if (!data.cloud || !uid) return 0;
  // Firestore writes wait silently while offline, so give up after a while instead of spinning forever.
  const timeoutMs = opts.timeoutMs ?? DELETE_TIMEOUT_MS;
  // Sends the outbox and cancels the debounce timer. A failed send is retried by
  // the next flush; if the cloud is unreachable, the delete below throws too.
  await withTimeout(data.flush(), timeoutMs);
  const deleted = await withTimeout(deleteAllUserData(remote, uid), timeoutMs);
  await data.clearDevice();
  await kv.removeItem(guestCopyAskedKey(uid));
  return deleted;
}

/** Where this user's data lives, in one plain line. */
export function syncStatusLine(signedIn: boolean, cloud: boolean, syncError: boolean): string {
  if (!signedIn) return 'Saved on this device only. Sign in to keep it on every device.';
  if (!cloud) return 'Saved on this device.';
  if (syncError) return 'Offline right now. Changes are saved on this phone and will sync when you’re back online.';
  return '☁️ Synced to your account on every device.';
}

type Fields<T> = Omit<T, keyof BaseDoc>;
function fieldsOf<T extends BaseDoc>(doc: T): Fields<T> {
  const { id: _id, createdAt: _c, updatedAt: _u, schemaVersion: _s, deleted: _d, ...fields } = doc;
  return fields;
}

/**
 * One user's live session. Every action updates the in-memory documents at
 * once (so the screen changes on the same tap) and then writes through the
 * repositories, one write at a time and in order.
 */
export function createUserSession(
  data: UserData,
  initial: UserDocs,
  opts: { onChange: (docs: UserDocs) => void; onError?: (e: unknown) => void; now?: () => number },
) {
  const now = opts.now ?? Date.now;
  const { repos } = data;
  let docs = initial;
  let queue: Promise<void> = Promise.resolve();

  const set = (next: UserDocs) => {
    docs = next;
    opts.onChange(next);
  };
  const enqueue = (op: () => Promise<unknown>) => {
    queue = queue.then(op).then(
      () => undefined,
      (e) => opts.onError?.(e),
    );
  };
  const base = (id: string, collection: keyof typeof SCHEMAS, t: number): BaseDoc => ({
    id,
    createdAt: t,
    updatedAt: t,
    schemaVersion: SCHEMAS[collection].version,
    deleted: false,
  });
  const put = <C extends ListCollection>(c: C, doc: UserDocs[C][string]) => set({ ...docs, [c]: { ...docs[c], [doc.id]: doc } });
  const drop = (c: ListCollection, id: string) => {
    const { [id]: _gone, ...rest } = docs[c];
    set({ ...docs, [c]: rest });
  };

  return {
    get docs() {
      return docs;
    },
    /** Resolves when every write so far has reached the device store (and joined the cloud outbox). */
    idle: () => queue,
    /** Replace the in-memory documents, e.g. after pulling from the cloud. */
    reload(next: UserDocs) {
      set(next);
    },

    updateProfile(patch: Partial<UserProfile>) {
      const t = now();
      const current = docs.profile ?? { ...DEFAULT_PROFILE, ...base(PROFILE_ID, 'profile', t) };
      const next: Doc<UserProfile> = { ...current, ...patch, updatedAt: t };
      if (patch.onboarded && !current.onboarded && !next.onboardedOn) next.onboardedOn = dateKeyOf(t);
      set({ ...docs, profile: next });
      enqueue(() => repos.profile.upsert(PROFILE_ID, fieldsOf(next)));
    },

    addMeal(meal: Omit<MealLog, 'timestamp' | 'dateKey'>) {
      const t = now();
      const doc: Doc<MealLog> = { ...meal, timestamp: t, dateKey: dateKeyOf(t), ...base(makeId(t), 'mealLogs', t) };
      put('mealLogs', doc);
      enqueue(() => repos.mealLogs.create({ ...fieldsOf(doc), id: doc.id }));
    },

    addWorkout(w: Omit<WorkoutLog, 'timestamp' | 'dateKey'>) {
      const t = now();
      const doc: Doc<WorkoutLog> = { ...w, timestamp: t, dateKey: dateKeyOf(t), ...base(makeId(t), 'workoutLogs', t) };
      put('workoutLogs', doc);
      enqueue(() => repos.workoutLogs.create({ ...fieldsOf(doc), id: doc.id }));
    },

    /** One document per day, so rapid taps change one counter (and one debounced cloud write). */
    addWater(delta: number) {
      const t = now();
      const dateKey = dateKeyOf(t);
      const id = `water-${dateKey}`;
      const current = docs.waterLogs[id];
      const glasses = Math.max(0, (current?.glasses ?? 0) + delta);
      if (current && current.glasses === glasses) return;
      const doc: Doc<WaterLog> = { ...(current ?? base(id, 'waterLogs', t)), timestamp: t, dateKey, glasses, updatedAt: t };
      put('waterLogs', doc);
      enqueue(() => repos.waterLogs.upsert(id, { timestamp: t, dateKey, glasses }));
    },

    addSaving(amountInr: number, dishId: string | null, note: string | null = null) {
      const t = now();
      const doc: Doc<SavingEntry> = { timestamp: t, amountInr, dishId, note, ...base(makeId(t), 'savings', t) };
      put('savings', doc);
      enqueue(() => repos.savings.create({ ...fieldsOf(doc), id: doc.id }));
    },

    toggleFavourite(dishId: string) {
      if (docs.favourites[dishId]) {
        drop('favourites', dishId);
        enqueue(() => repos.favourites.remove(dishId));
        return;
      }
      put('favourites', { dishId, ...base(dishId, 'favourites', now()) });
      enqueue(() => repos.favourites.upsert(dishId, { dishId }));
    },

    setPlan(dateKey: DateKey, slot: Slot, dishId: string | null) {
      const t = now();
      const current = docs.mealPlans[dateKey];
      const slots = { ...(current?.slots ?? {}) };
      if (dishId) slots[slot] = dishId;
      else delete slots[slot];
      put('mealPlans', { ...(current ?? base(dateKey, 'mealPlans', t)), dateKey, slots, updatedAt: t });
      enqueue(() => repos.mealPlans.upsert(dateKey, { dateKey, slots }));
    },

    /** P2-b: settings (one document). Patch fields are merged into the current settings. */
    updateSettings(patch: Partial<UserSettings>) {
      const t = now();
      const current = docs.settings ?? { ...DEFAULT_SETTINGS, ...base(SETTINGS_ID, 'settings', t) };
      const next: Doc<UserSettings> = { ...current, ...patch, updatedAt: Math.max(t, current.updatedAt + 1) };
      set({ ...docs, settings: next });
      enqueue(() => repos.settings.upsert(SETTINGS_ID, fieldsOf(next)));
    },

    /** Remember the brand / pack picked for an ingredient, so it is pre-selected next time. */
    chooseBrand(ingredientKey: string, variant: string | null) {
      const brandChoice = { ...(docs.settings?.brandChoice ?? {}) };
      if (variant) brandChoice[ingredientKey] = variant;
      else delete brandChoice[ingredientKey];
      this.updateSettings({ brandChoice });
    },

    /** Create or replace a shopping list (whole document, latest change wins). Returns its id. */
    saveShoppingList(list: ShoppingList, id?: string): string {
      const t = now();
      const listId = id ?? makeId(t);
      const current = docs.shoppingLists[listId];
      const doc: Doc<ShoppingList> = { ...(current ?? base(listId, 'shoppingLists', t)), ...list, updatedAt: current ? Math.max(t, current.updatedAt + 1) : t };
      put('shoppingLists', doc);
      enqueue(() => repos.shoppingLists.upsert(listId, list));
      return listId;
    },

    removeShoppingList(id: string) {
      if (!docs.shoppingLists[id]) return;
      drop('shoppingLists', id);
      enqueue(() => repos.shoppingLists.remove(id));
    },

    addWeight(kg: number) {
      const t = now();
      const doc: Doc<WeightLog> = { timestamp: t, dateKey: dateKeyOf(t), kg, ...base(makeId(t), 'weightLogs', t) };
      put('weightLogs', doc);
      enqueue(() => repos.weightLogs.create({ ...fieldsOf(doc), id: doc.id }));
    },

    rateDish(dishId: string, stars: DishRating['stars'], note: string | null = null) {
      const t = now();
      const current = docs.ratings[dishId];
      put('ratings', { ...(current ?? base(dishId, 'ratings', t)), dishId, stars, note, updatedAt: current ? Math.max(t, current.updatedAt + 1) : t });
      enqueue(() => repos.ratings.upsert(dishId, { dishId, stars, note }));
    },

    addCookCompletion(c: Omit<CookCompletion, 'timestamp' | 'dateKey'>) {
      const t = now();
      const doc: Doc<CookCompletion> = { ...c, timestamp: t, dateKey: dateKeyOf(t), ...base(makeId(t), 'cookCompletions', t) };
      put('cookCompletions', doc);
      enqueue(() => repos.cookCompletions.create({ ...fieldsOf(doc), id: doc.id }));
    },

    /** Guests only: wipe this device's guest data and load the sample week again. */
    resetToSample(seed: LegacyState) {
      const t = now();
      const sample = sampleDocs(seed, t);
      set({
        ...EMPTY_DOCS,
        profile: sample.profile,
        mealLogs: byId(sample.mealLogs),
        waterLogs: byId(sample.waterLogs),
        workoutLogs: byId(sample.workoutLogs),
        favourites: byId(sample.favourites),
        mealPlans: byId(sample.mealPlans),
        savings: byId(sample.savings),
      });
      enqueue(async () => {
        await data.clearDevice();
        await importDocs(repos, sample);
      });
    },
  };
}

export type UserSession = ReturnType<typeof createUserSession>;
