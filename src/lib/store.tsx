import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { dishes, type Diet, type Dish } from '../data/dishes';
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

type State = {
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

// Sample history so the progress screens look alive in the demo.
function sampleState(): State {
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

const KEY = 'fitplate.state.v2';

type User = { name: string; guest: boolean; email?: string; photo?: string };

type Store = State & {
  user: User | null;
  ready: boolean;
  today: DayLog;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => void;
  logCooked: (dish: Dish, saved: number) => void;
  logQuickMeal: (m: (typeof QUICK_MEALS)[number]) => void;
  logExercise: (type: string, minutes: number) => void;
  addWater: (n: number) => void;
  toggleFavourite: (id: string) => void;
  setPlan: (date: string, slot: Slot, dishId: string | null) => void;
  resetDemo: () => void;
  streak: number;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(sampleState);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!firebaseConfigured);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
      });
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(
        u
          ? { name: u.displayName?.split(' ')[0] ?? '', guest: false, email: u.email ?? undefined, photo: u.photoURL ?? undefined }
          : null,
      );
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const updateToday = useCallback((fn: (d: DayLog) => DayLog) => {
    setState((s) => {
      const k = dayKey();
      return { ...s, days: { ...s.days, [k]: fn(s.days[k] ?? emptyDay()) } };
    });
  }, []);

  const store = useMemo<Store>(() => {
    const today = state.days[dayKey()] ?? emptyDay();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = state.days[dayKey(addDays(new Date(), -i))];
      if (d?.meals.some((m) => m.cooked)) streak++;
      else if (i > 0) break;
    }
    return {
      ...state,
      user,
      ready,
      today,
      streak,
      continueAsGuest: () => setUser({ name: '', guest: true }),
      signOut: async () => {
        const auth = getFirebaseAuth();
        if (auth && !user?.guest) await fbSignOut(auth);
        setUser(null);
      },
      updateProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
      logCooked: (dish, saved) => {
        setState((s) => ({ ...s, moneySaved: s.moneySaved + saved }));
        updateToday((d) => ({
          ...d,
          meals: [
            ...d.meals,
            { name: dish.name, emoji: dish.emoji, kcal: dish.kcal, protein: dish.proteinG, fibre: dish.fibreG, cooked: true, at: Date.now() },
          ],
        }));
      },
      logQuickMeal: (m) => updateToday((d) => ({ ...d, meals: [...d.meals, { ...m, cooked: false, at: Date.now() }] })),
      logExercise: (type, minutes) => {
        const e = EXERCISES.find((x) => x.type === type)!;
        updateToday((d) => ({
          ...d,
          exercise: [...d.exercise, { type, minutes, kcal: exerciseKcal(e.met, minutes), at: Date.now() }],
        }));
      },
      addWater: (n) => updateToday((d) => ({ ...d, water: Math.max(0, d.water + n) })),
      toggleFavourite: (id) =>
        setState((s) => ({
          ...s,
          favourites: s.favourites.includes(id) ? s.favourites.filter((f) => f !== id) : [...s.favourites, id],
        })),
      setPlan: (date, slot, dishId) =>
        setState((s) => {
          const day = { ...(s.plan[date] ?? {}) };
          if (dishId) day[slot] = dishId;
          else delete day[slot];
          return { ...s, plan: { ...s.plan, [date]: day } };
        }),
      resetDemo: () => setState(sampleState()),
    };
  }, [state, user, ready, updateToday]);

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
