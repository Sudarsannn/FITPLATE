import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getFirebaseAuth } from './firebase';

export type Stats = { moneySaved: number; kcalIn: number; kcalBurnt: number; mealsCooked: number };
type User = { name: string; guest: boolean };

// Sample numbers so the dashboard doesn't look empty in the demo.
const SAMPLE_STATS: Stats = { moneySaved: 1240, kcalIn: 1450, kcalBurnt: 320, mealsCooked: 4 };
const STATS_KEY = 'fitplate.stats.v1';

type Session = {
  user: User | null;
  ready: boolean;
  stats: Stats;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  logMeal: (saved: number, kcal: number) => void;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<Stats>(SAMPLE_STATS);

  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY)
      .then((raw) => raw && setStats(JSON.parse(raw)))
      .catch(() => {});
    const auth = getFirebaseAuth();
    if (!auth) {
      setReady(true);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u ? { name: u.displayName?.split(' ')[0] ?? 'there', guest: false } : null);
      setReady(true);
    });
  }, []);

  const save = (next: Stats) => {
    setStats(next);
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(next)).catch(() => {});
  };

  const value: Session = {
    user,
    ready,
    stats,
    continueAsGuest: () => setUser({ name: 'there', guest: true }),
    signOut: async () => {
      const auth = getFirebaseAuth();
      if (auth && !user?.guest) await fbSignOut(auth);
      setUser(null);
    },
    logMeal: (saved, kcal) =>
      save({
        moneySaved: stats.moneySaved + saved,
        kcalIn: stats.kcalIn + kcal,
        kcalBurnt: stats.kcalBurnt,
        mealsCooked: stats.mealsCooked + 1,
      }),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
