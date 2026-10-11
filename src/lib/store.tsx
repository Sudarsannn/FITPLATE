import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { dishes, type Diet, type Dish } from '../data/dishes';
import { GUEST_OWNER, openUserData, type UserData } from '../services/storage';
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

export type Goal = 'lose' | 'maintain' | 'gain' | 'muscle';
export type Level = 'beginner' | 'expert';
export type Slot = 'breakfast' | 'lunch' | 'dinner';

export type Profile = {
  name: string;
  goal: Goal;
  level: Level;
  diet: Diet;
  breakfastReminder: boolean;
  onboarded: boolean;
};

export type MealLog = { name: string; emoji: string; kcal: number; protein: number; fibre: number; cooked: boolean; at: number };
export type ExerciseLog = { type: string; minutes: number; kcal: number; at: number };
export type DayLog = { meals: MealLog[]; exercise: ExerciseLog[]; water: number };

export type State = {
  profile: Profile;
  days: Record<string, DayLog>;
  moneySaved: number;
  favourites: string[];
  plan: Record<string, Partial<Record<Slot, string>>>;
};

export const GOALS: Record<Goal, { label: string; emoji: string; kcal: number; protein: number; blurb: string }> = {
  lose: { label: 'Lose weight', emoji: '🔥', kcal: 1800, protein: 90, blurb: 'Tasty, lighter meals and a small daily deficit.' },
  maintain: { label: 'Eat healthier', emoji: '🥗', kcal: 2200, protein: 70, blurb: 'Better nutrition without counting every bite.' },
  gain: { label: 'Gain weight', emoji: '🍽️', kcal: 2600, protein: 90, blurb: 'Bigger, wholesome meals in a steady surplus.' },
  muscle: { label: 'Build muscle', emoji: '💪', kcal: 2400, protein: 120, blurb: 'High-protein meals to match your workouts.' },
};
export const FIBRE_TARGET = 30;
export const WATER_TARGET = 8;

// MET values; kcal = MET × 70 kg × hours.
export const EXERCISES = [
  { type: 'Walk', emoji: '🚶', met: 3.5 },
  { type: 'Run', emoji: '🏃', met: 9.8 },
  { type: 'Cycle', emoji: '🚴', met: 7.5 },
  { type: 'Yoga', emoji: '🧘', met: 3 },
  { type: 'Gym', emoji: '🏋️', met: 6 },
  { type: 'Sport', emoji: '🏸', met: 7 },
];
export const exerciseKcal = (met: number, minutes: number) => Math.round((met * 70 * minutes) / 60);

// Quick logs for days you don't cook (office canteen, ordering in).
export const QUICK_MEALS = [
  { name: 'Office canteen thali', emoji: '🍱', kcal: 650, protein: 20, fibre: 8 },
  { name: 'Sandwich', emoji: '🥪', kcal: 380, protein: 14, fibre: 4 },
  { name: 'Salad bowl', emoji: '🥗', kcal: 320, protein: 12, fibre: 9 },
  { name: 'Dosa + chutney', emoji: '🫓', kcal: 400, protein: 9, fibre: 4 },
  { name: 'Ordered biryani', emoji: '🍗', kcal: 850, protein: 30, fibre: 3 },
  { name: 'Chai + biscuits', emoji: '☕', kcal: 180, protein: 3, fibre: 1 },
];

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const emptyDay = (): DayLog => ({ meals: [], exercise: [], water: 0 });

// Sample history so the progress screens look alive in the demo. Guests get it
// on a new device, marked as sample, so it is never copied into an account.
export function sampleState(): State {
  const days: Record<string, DayLog> = {};
  const today = new Date();
  const sample = [
    { m: ['poha', 'q:Office canteen thali', 'paneer-butter-masala'], ex: ['Walk', 30], w: 7 },
    { m: ['overnight-oats', 'q:Sandwich', 'rajma-chawal'], ex: ['Yoga', 25], w: 6 },
    { m: ['q:Chai + biscuits', 'q:Office canteen thali', 'q:Ordered biryani'], ex: null, w: 4 },
    { m: ['moong-chilla', 'q:Salad bowl', 'egg-bhurji'], ex: ['Run', 20], w: 8 },
    { m: ['masala-oats', 'q:Office canteen thali', 'chicken-biryani'], ex: ['Gym', 45], w: 7 },
    { m: ['poha', 'q:Dosa + chutney', 'rajma-chawal'], ex: ['Walk', 40], w: 6 },
  ] as const;
  sample.forEach((s, i) => {
    const day = emptyDay();
    s.m.forEach((m, j) => {
      const at = addDays(today, -(6 - i)).getTime() + (8 + j * 5) * 3600_000;
      if (m.startsWith('q:')) {
        const q = QUICK_MEALS.find((x) => x.name === m.slice(2))!;
        day.meals.push({ ...q, cooked: false, at });
      } else {
        const d = dishes.find((x) => x.id === m)!;
        day.meals.push({ name: d.name, emoji: d.emoji, kcal: d.kcal, protein: d.proteinG, fibre: d.fibreG, cooked: true, at });
      }
    });
    if (s.ex) {
      const e = EXERCISES.find((x) => x.type === s.ex![0])!;
      day.exercise.push({ type: e.type, minutes: s.ex[1], kcal: exerciseKcal(e.met, s.ex[1]), at: 0 });
    }
    day.water = s.w;
    days[dayKey(addDays(today, -(6 - i)))] = day;
  });
  return {
    profile: { name: '', goal: 'lose', level: 'beginner', diet: 'non-veg', breakfastReminder: true, onboarded: false },
    days,
    moneySaved: 2860,
    favourites: ['poha', 'paneer-butter-masala'],
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
  logCooked: (dish: Dish, saved: number) => void;
  logQuickMeal: (m: (typeof QUICK_MEALS)[number]) => void;
  logExercise: (type: string, minutes: number) => void;
  addWater: (n: number) => void;
  toggleFavourite: (id: string) => void;
  setPlan: (date: string, slot: Slot, dishId: string | null) => void;
  /** Guests only: restore the sample week. Signed-in accounts never get sample data. */
  resetDemo: () => void;
  streak: number;
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
    const data = openUserData({ kv, uid: signedIn ? owner : null, remote, onSyncError: () => alive && setSyncError(true) });

    (async () => {
      if (!signedIn) await prepareGuestDevice(kv, data, sampleState, Date.now());
      const local = await loadDocs(data.repos);
      const session = createUserSession(data, local, { onChange: (d) => alive && setDocs(d), onError: () => alive && setSyncError(true) });

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
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = state.days[dayKey(addDays(new Date(), -i))];
      if (d?.meals.some((m) => m.cooked)) streak++;
      else if (i > 0) break;
    }
    // Before the data has loaded, writes have nowhere to go; screens are not interactive yet anyway.
    const s = ready ? active?.session : undefined;
    // The last step of every sign-out: leave Firebase Auth and go back to the welcome screen.
    const endAuth = async () => {
      const auth = getFirebaseAuth();
      if (auth && !user?.guest) await fbSignOut(auth);
      setUser(null);
    };
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
      logCooked: (dish, saved) => {
        if (!s) return;
        s.addMeal({ name: dish.name, emoji: dish.emoji, dishId: dish.id, source: 'dish', kcal: dish.kcal, proteinG: dish.proteinG, fibreG: dish.fibreG, cooked: true });
        if (saved) s.addSaving(saved, dish.id);
      },
      logQuickMeal: (m) => s?.addMeal({ name: m.name, emoji: m.emoji, dishId: null, source: 'quick', kcal: m.kcal, proteinG: m.protein, fibreG: m.fibre, cooked: false }),
      logExercise: (type, minutes) => {
        const e = EXERCISES.find((x) => x.type === type);
        if (e) s?.addWorkout({ type, exerciseId: null, minutes, kcal: exerciseKcal(e.met, minutes) });
      },
      addWater: (n) => s?.addWater(n),
      toggleFavourite: (id) => s?.toggleFavourite(id),
      setPlan: (date, slot, dishId) => s?.setPlan(date, slot, dishId),
      resetDemo: () => {
        if (s && active?.owner === GUEST_OWNER) s.resetToSample(sampleState());
      },
    };
  }, [state, user, ready, active, syncError, guestOffer]);

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

const dietAllows = (pref: Diet, dish: Diet) =>
  pref === 'non-veg' || dish === 'veg' || (pref === 'egg' && dish === 'egg');

// Tasty-first: every dish stays available, recommendations just rank what fits the goal.
export function recommend(profile: Profile) {
  const ok = dishes.filter((d) => dietAllows(profile.diet, d.diet));
  const score = (d: Dish) => {
    switch (profile.goal) {
      case 'lose':
        return d.healthScore * 40 + d.fibreG * 10 - d.kcal / 5;
      case 'muscle':
        return d.proteinG * 6 + d.healthScore * 10;
      case 'gain':
        return d.kcal / 5 + d.proteinG * 3;
      default:
        return d.healthScore * 30 + d.fibreG * 5;
    }
  };
  return [...ok].sort((a, b) => score(b) - score(a));
}

export const allowedDishes = (profile: Profile) => dishes.filter((d) => dietAllows(profile.diet, d.diet));
