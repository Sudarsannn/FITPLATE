import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import type { IconName } from '../components/Icon';
import { featureFlags } from '../config/featureFlags';
import { researchDishes } from '../data/research';
import type { Dish as ResearchDish } from '../models/research';
import type { Doc } from '../models/common';
import { cookedDays, currentStreak } from '../services/streaks';
import { portionPatch } from '../services/meals';
import { DEFAULT_SETTINGS, type CookCompletion, type DishRating, type ShoppingList, type UserSettings } from '../models/prefs';
import { DEFAULT_SURVEY, type Survey } from '../models/survey';
import type { DietType, UserProfile } from '../models/user';
import { exerciseKcal } from '../services/fitness';
import { fitsSurvey, likedCuisine } from '../services/surveyMatch';
import { GUEST_OWNER, openUserData, type UserData } from '../services/storage';
import { createServerClock, measureClockOffset } from '../services/storage/serverClock';
import { createFirestoreAdapter, getDb } from '../services/storage/firestoreRemote';
import type { KeyValueStore } from '../services/storage/kv';
import type { RemoteAdapter } from '../services/storage/remote';
import {
  copyGuestData,
  createUserSession,
  deleteMyData,
  EMPTY_DOCS,
  guestOfferCount,
  legacyProfilePatch,
  loadDocs,
  prepareGuestDevice,
  signOutDevice,
  skipGuestCopy,
  toView,
  type UserDocs,
  type UserSession,
} from '../services/userSession';
import { firebaseConfigured, getFirebaseAuth } from './firebase';

/** The user's diet preference (the research dishes carry `dietType`). */
export type Diet = DietType;
export type Goal = 'lose' | 'maintain' | 'gain' | 'muscle';
export type Level = 'beginner' | 'expert';
export type Slot = 'breakfast' | 'lunch' | 'dinner';

export type Profile = {
  name: string;
  /** Profile survey answers (SPEC-ADDENDA §8). */
  survey: Survey;
  goal: Goal;
  level: Level;
  diet: Diet;
  breakfastReminder: boolean;
  onboarded: boolean;
};

export type MealLog = {
  id?: string;
  name: string;
  emoji: string;
  kcal: number;
  protein: number;
  fibre: number;
  cooked: boolean;
  at: number;
  dishId?: string | null;
  how?: 'cooked' | 'ordered' | 'logged';
  costInr?: number | null;
  orderInr?: number | null;
  servings?: number;
};
export type ExerciseLog = { type: string; minutes: number; kcal: number; at: number };
export type DayLog = { meals: MealLog[]; exercise: ExerciseLog[]; water: number };

export type State = {
  profile: Profile;
  days: Record<string, DayLog>;
  moneySaved: number;
  favourites: string[];
  plan: Record<string, Partial<Record<Slot, string>>>;
};

export const GOALS: Record<Goal, { label: string; icon: IconName; kcal: number; protein: number; blurb: string }> = {
  lose: { label: 'Lose weight', icon: 'trending-down-outline', kcal: 1800, protein: 90, blurb: 'Tasty, lighter meals and a small daily deficit.' },
  maintain: { label: 'Eat healthier', icon: 'nutrition-outline', kcal: 2200, protein: 70, blurb: 'Better nutrition without counting every bite.' },
  gain: { label: 'Gain weight', icon: 'trending-up-outline', kcal: 2600, protein: 90, blurb: 'Bigger, wholesome meals in a steady surplus.' },
  muscle: { label: 'Build muscle', icon: 'barbell-outline', kcal: 2400, protein: 120, blurb: 'High-protein meals to match your workouts.' },
};
export const FIBRE_TARGET = 30;
export const WATER_TARGET = 8;

export { exerciseKcal } from '../services/fitness';

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const emptyDay = (): DayLog => ({ meals: [], exercise: [], water: 0 });

// New devices start empty: no demo history (Sudarsan, 22 Oct 2026). The
// name stays because the guest-device setup and "Reset" call it.
export function sampleState(): State {
  return {
    profile: { name: '', goal: 'lose', level: 'beginner', diet: 'non-veg', breakfastReminder: true, onboarded: false, survey: DEFAULT_SURVEY },
    days: {},
    moneySaved: 0,
    favourites: [],
    plan: {},
  };
}

type User = { name: string; guest: boolean; uid?: string; email?: string; photo?: string };

type Store = State & {
  user: User | null;
  /** Sign-in state is known and this user's data has loaded. */
  ready: boolean;
  today: DayLog;
  /** Signed in and syncing to Firestore (SPEC-ADDENDA §5). */
  cloud: boolean;
  /** The last cloud sync failed (usually offline). Changes are safe on the device and retry later. */
  syncError: boolean;
  /** Guest entries on this device that a newly signed-in user can bring along (0 = nothing to ask). */
  guestOffer: number;
  copyGuestData: () => Promise<void>;
  skipGuestCopy: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  /**
   * Signed in with the cloud on: permanently deletes everything saved under
   * `users/{uid}` in Firestore, clears this device's copy, then signs out.
   * Throws (and changes nothing) when the cloud can't be reached. No-op otherwise.
   */
  deleteMyData: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => void;
  /** One serving of a research dish, eaten (not necessarily cooked here). `ordered` marks a takeaway, with what it cost. */
  logDish: (dish: ResearchDish, how?: 'logged' | 'ordered', orderInr?: number | null, servings?: number) => void;
  /** Day 13: change the portion of a logged meal (its numbers scale with it). */
  setMealServings: (id: string, servings: number) => void;
  /** Day 13: delete a logged meal. */
  deleteMeal: (id: string) => void;
  /** A meal that isn't a FitPlate dish, with the user's own numbers. */
  logCustomMeal: (m: { name: string; kcal: number; protein: number; fibre: number }) => void;
  /** A research exercise for some minutes; kcal from its Compendium MET and the user's weight. */
  logWorkout: (exercise: { id: string; name: string; met: number }, minutes: number) => void;
  addWater: (n: number) => void;
  toggleFavourite: (id: string) => void;
  setPlan: (date: string, slot: Slot, dishId: string | null) => void;
  /** Guests only: restore the sample week. Signed-in accounts never get sample data. */
  resetDemo: () => void;
  streak: number;
  // Priority plan P2-b: synced per-user data beyond the logs.
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  /** Remember the brand / pack picked for an ingredient (null forgets it). */
  chooseBrand: (ingredientKey: string, variant: string | null) => void;
  /** Shopping lists that are not finished, newest first. */
  shoppingLists: Doc<ShoppingList>[];
  /** Create (no id) or replace a shopping list; returns its id. */
  saveShoppingList: (list: ShoppingList, id?: string) => string;
  removeShoppingList: (id: string) => void;
  addWeight: (kg: number) => void;
  /** Newest logged weight, else the profile's; null when neither exists (burn-off then assumes 70 kg). */
  bodyWeightKg: number | null;
  /** From the profile; picks the ICMR-NIN target group for the nutrient bars (null = not given). */
  sex: 'male' | 'female' | null;
  setSex: (sex: 'male' | 'female') => void;
  /** Age, height, weight and activity from the profile (null = not given). */
  body: Pick<UserProfile, 'age' | 'heightCm' | 'weightKg' | 'activityLevel'>;
  /** Kitchen equipment from the survey (UserProfile.equipmentOwned). */
  equipmentOwned: string[];
  setEquipmentOwned: (list: string[]) => void;
  updateBody: (patch: Partial<Pick<UserProfile, 'age' | 'sex' | 'heightCm' | 'weightKg' | 'activityLevel'>>) => void;
  ratings: Record<string, DishRating['stars']>;
  rateDish: (dishId: string, stars: DishRating['stars'], note?: string | null) => void;
  logCookCompletion: (c: Omit<CookCompletion, 'timestamp' | 'dateKey'>) => void;
  /**
   * A research dish was cooked: logs one serving as a meal, the money saved
   * against ordering (only when both prices are known), and the cook itself.
   */
  logResearchCook: (
    dish: { id: string; name: string; kcal: number | null; proteinG: number | null; fibreG: number | null },
    servings: number,
    costInr: number | null,
    orderPriceInr: number | null,
    boughtVia: CookCompletion['boughtVia'],
  ) => void;
};

const StoreContext = createContext<Store | null>(null);

// AsyncStorage matches the storage layer's key-value interface.
const kv: KeyValueStore = AsyncStorage;

// Firestore is used only when Firebase is configured and the cloudSync flag is on;
// otherwise a signed-in user's data stays on the device, as in the demo.
function cloudAdapter() {
  if (!featureFlags.cloudSync || !firebaseConfigured || !getFirebaseAuth()) return null;
  const db = getDb();
  return db ? createFirestoreAdapter(db) : null;
}

// "Latest change wins, using the server's clock" (P2): every write is stamped with this clock.
const clock = createServerClock();

// A first sign-in on a new device waits this long for the cloud before showing what the device has.
const FIRST_SYNC_WAIT_MS = 8000;

type Active = {
  owner: string;
  data: UserData;
  session: UserSession;
  remote: RemoteAdapter | null;
  /** The start-up merge with the cloud (it may still be running in the background). */
  firstSync: Promise<unknown>;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [active, setActive] = useState<Active | null>(null);
  const [docs, setDocs] = useState<UserDocs>(EMPTY_DOCS);
  const [syncError, setSyncError] = useState(false);
  const [guestOffer, setGuestOffer] = useState(0);
  const owner = user && !user.guest && user.uid ? user.uid : GUEST_OWNER;

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(
        u
          ? { name: u.displayName?.split(' ')[0] ?? '', guest: false, uid: u.uid, email: u.email ?? undefined, photo: u.photoURL ?? undefined }
          : null,
      );
      setAuthReady(true);
    });
  }, []);

  // Open the data for whoever is using the app: the guest store, or the signed-in user's (device + cloud).
  useEffect(() => {
    if (!authReady) return;
    let alive = true;
    const signedIn = owner !== GUEST_OWNER;
    const remote = signedIn ? cloudAdapter() : null;
    const data = openUserData({ kv, uid: signedIn ? owner : null, remote, deps: { now: clock.now }, onSyncError: () => alive && setSyncError(true) });
    // Measure the server clock in the background; writes before it lands use the device clock.
    if (signedIn && remote) measureClockOffset(remote, owner).then((ms) => ms !== null && clock.setOffset(ms));

    (async () => {
      if (!signedIn) await prepareGuestDevice(kv, data, sampleState, Date.now());
      const local = await loadDocs(data.repos);
      const session = createUserSession(data, local, { onChange: (d) => alive && setDocs(d), onError: () => alive && setSyncError(true), now: clock.now });

      const refresh = async () => {
        await session.idle();
        if (alive) session.reload(await loadDocs(data.repos));
      };
      let firstSync: Promise<unknown> = Promise.resolve();
      if (data.cloud) {
        const synced = data.syncAll().then(
          () => {
            if (alive) setSyncError(false);
            return refresh();
          },
          () => {
            if (alive) setSyncError(true);
          },
        );
        // A device that already has this user's data shows it at once and syncs in the background.
        // A new device waits for the first pull (up to FIRST_SYNC_WAIT_MS) so it doesn't look empty.
        firstSync = synced;
        if (!local.profile) await Promise.race([synced, new Promise((r) => setTimeout(r, FIRST_SYNC_WAIT_MS))]);
      }
      const offer = signedIn ? await guestOfferCount(kv, owner) : 0;
      if (!alive) return;
      setGuestOffer(offer);
      setDocs(session.docs);
      setActive({ owner, data, session, remote, firstSync });
    })().catch(() => {
      if (alive) setSyncError(true);
    });

    return () => {
      alive = false;
    };
  }, [owner, authReady]);

  // Send waiting changes when the app goes to the background, before the OS may close it.
  useEffect(() => {
    if (!active?.data.cloud) return;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') active.data.flush().catch(() => setSyncError(true));
    });
    return () => sub.remove();
  }, [active]);

  const state = useMemo(() => toView(docs), [docs]);
  const ready = authReady && active?.owner === owner;

  const store = useMemo<Store>(() => {
    const today = state.days[dayKey()] ?? emptyDay();
    const streak = currentStreak(cookedDays(state.days), dayKey());
    // Before the data has loaded, writes have nowhere to go; screens are not interactive yet anyway.
    const s = ready ? active?.session : undefined;
    // The last step of every sign-out: leave Firebase Auth and go back to the welcome screen.
    const endAuth = async () => {
      const auth = getFirebaseAuth();
      if (auth && !user?.guest) await fbSignOut(auth);
      setUser(null);
    };
    const bodyWeight =
      Object.values(docs.weightLogs)
        .filter((w) => !w.deleted)
        .sort((a, b) => b.timestamp - a.timestamp)[0]?.kg ??
      (docs.profile && !docs.profile.deleted ? docs.profile.weightKg : null);
    return {
      ...state,
      user,
      ready,
      today,
      streak,
      cloud: Boolean(ready && active?.data.cloud),
      syncError,
      guestOffer: ready ? guestOffer : 0,
      copyGuestData: async () => {
        if (!active || active.owner === GUEST_OWNER) return;
        await copyGuestData(kv, active.data, active.owner);
        await active.session.idle();
        active.session.reload(await loadDocs(active.data.repos));
        setGuestOffer(0);
      },
      skipGuestCopy: async () => {
        if (!active || active.owner === GUEST_OWNER) return;
        await skipGuestCopy(kv, active.owner);
        setGuestOffer(0);
      },
      continueAsGuest: () => setUser({ name: '', guest: true }),
      signOut: async () => {
        if (active && active.owner !== GUEST_OWNER) {
          await active.session.idle();
          await signOutDevice(active.data);
        }
        await endAuth();
      },
      deleteMyData: async () => {
        if (!ready || !active || active.owner === GUEST_OWNER || !active.data.cloud || !active.remote) return;
        // Let the start-up merge finish first, so it can't push documents back after the delete.
        // (Offline it may never finish; the delete below then fails on its own.)
        await Promise.race([active.firstSync.catch(() => {}), new Promise((r) => setTimeout(r, FIRST_SYNC_WAIT_MS))]);
        await active.session.idle();
        await deleteMyData(active.data, active.remote, active.owner, kv);
        // The data is gone, so sign out without the usual flush.
        await endAuth();
      },
      updateProfile: (p) => s?.updateProfile(legacyProfilePatch(p)),
      logDish: (dish, how = 'logged', orderInr = null, servings = 1) => {
        const n = dish.nutritionPerServing;
        s?.addMeal({ name: dish.name, emoji: '', dishId: dish.id, source: 'dish', kcal: Math.round((n.kcal ?? 0) * servings), proteinG: Math.round((n.proteinG ?? 0) * servings), fibreG: Math.round((n.fibreG ?? 0) * servings), cooked: false, how, servings, ...(orderInr != null ? { orderInr: Math.round(orderInr * servings) } : {}) });
      },
      setMealServings: (id, servings) => {
        const m = s?.docs.mealLogs[id];
        if (s && m) s.updateMeal(id, portionPatch(m, servings));
      },
      deleteMeal: (id) => s?.removeMeal(id),
      logCustomMeal: (m) => s?.addMeal({ name: m.name, emoji: '', dishId: null, source: 'custom', kcal: Math.round(m.kcal), proteinG: Math.round(m.protein), fibreG: Math.round(m.fibre), cooked: false }),
      logWorkout: (e, minutes) => s?.addWorkout({ type: e.name, exerciseId: e.id, minutes, kcal: exerciseKcal(e.met, minutes, bodyWeight) }),
      addWater: (n) => s?.addWater(n),
      toggleFavourite: (id) => s?.toggleFavourite(id),
      setPlan: (date, slot, dishId) => s?.setPlan(date, slot, dishId),
      resetDemo: () => {
        if (s && active?.owner === GUEST_OWNER) s.resetToSample(sampleState());
      },
      settings: { ...DEFAULT_SETTINGS, ...(docs.settings && !docs.settings.deleted ? docs.settings : {}) },
      updateSettings: (patch) => s?.updateSettings(patch),
      chooseBrand: (key, variant) => s?.chooseBrand(key, variant),
      shoppingLists: Object.values(docs.shoppingLists)
        .filter((l) => !l.deleted && l.status !== 'done')
        .sort((a, b) => b.updatedAt - a.updatedAt),
      saveShoppingList: (list, id) => s?.saveShoppingList(list, id) ?? id ?? '',
      removeShoppingList: (id) => s?.removeShoppingList(id),
      addWeight: (kg) => s?.addWeight(kg),
      bodyWeightKg: bodyWeight,
      setSex: (sex) => s?.updateProfile({ sex }),
      body: {
        age: docs.profile && !docs.profile.deleted ? docs.profile.age : null,
        heightCm: docs.profile && !docs.profile.deleted ? docs.profile.heightCm : null,
        weightKg: docs.profile && !docs.profile.deleted ? docs.profile.weightKg : null,
        activityLevel: docs.profile && !docs.profile.deleted ? docs.profile.activityLevel : null,
      },
      updateBody: (patch) => s?.updateProfile(patch),
      equipmentOwned: docs.profile && !docs.profile.deleted ? (docs.profile.equipmentOwned ?? []) : [],
      setEquipmentOwned: (equipmentOwned) => s?.updateProfile({ equipmentOwned }),
      sex: docs.profile && !docs.profile.deleted && (docs.profile.sex === 'male' || docs.profile.sex === 'female') ? docs.profile.sex : null,
      ratings: Object.fromEntries(Object.values(docs.ratings).filter((r) => !r.deleted).map((r) => [r.dishId, r.stars])),
      rateDish: (dishId, stars, note = null) => s?.rateDish(dishId, stars, note),
      logCookCompletion: (c) => s?.addCookCompletion(c),
      logResearchCook: (dish, servings, costInr, orderPriceInr, boughtVia) => {
        if (!s) return;
        s.addMeal({ name: dish.name, emoji: '', dishId: dish.id, source: 'dish', kcal: Math.round(dish.kcal ?? 0), proteinG: Math.round(dish.proteinG ?? 0), fibreG: Math.round(dish.fibreG ?? 0), cooked: true, how: 'cooked', servings, costInr: costInr ?? null, orderInr: orderPriceInr ?? null });
        const saved = costInr != null && orderPriceInr != null ? Math.round(orderPriceInr - costInr) : 0;
        if (saved > 0) s.addSaving(saved, dish.id, `Cooked ${dish.name} for ${servings} instead of ordering`);
        s.addCookCompletion({ dishId: dish.id, servings, costInr, orderPriceInr, boughtVia });
      },
    };
  }, [state, docs, user, ready, active, syncError, guestOffer]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export const dayTotals = (d: DayLog) => ({
  kcalIn: d.meals.reduce((s, m) => s + m.kcal, 0),
  kcalOut: d.exercise.reduce((s, e) => s + e.kcal, 0),
  protein: d.meals.reduce((s, m) => s + m.protein, 0),
  fibre: d.meals.reduce((s, m) => s + m.fibre, 0),
});


// Tasty-first: every research dish stays available; recommendations just rank what fits the goal.
export function recommend(profile: Profile): ResearchDish[] {
  const ok = allowedDishes(profile);
  const score = (d: ResearchDish) => {
    const n = d.nutritionPerServing;
    const health = d.healthiness?.score ?? 5;
    const kcal = n.kcal ?? 500;
    const protein = n.proteinG ?? 0;
    const fibre = n.fibreG ?? 0;
    switch (profile.goal) {
      case 'lose':
        return health * 40 + fibre * 10 - kcal / 5;
      case 'muscle':
        return protein * 6 + health * 10;
      case 'gain':
        return kcal / 5 + protein * 3;
      default:
        return health * 30 + fibre * 5;
    }
  };
  // Liked cuisines get a nudge up, never a filter.
  const liked = (d: ResearchDish) => (likedCuisine(profile.survey.cuisines, d) ? 40 : 0);
  return [...ok].sort((a, b) => score(b) + liked(b) - (score(a) + liked(a)));
}

export const allowedDishes = (profile: Profile): ResearchDish[] => researchDishes.filter((d) => fitsSurvey(profile.diet, profile.survey, d));
