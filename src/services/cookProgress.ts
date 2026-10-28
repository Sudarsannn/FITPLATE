import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Where a guided cook was left (Day 11): the step and the ingredient ticks, per
 * dish and number of servings, so a call, a locked phone or a closed tab does
 * not lose the place. Kept on this device only, and ignored after 12 hours.
 */
export type CookProgress = { step: number; have: Record<string, boolean>; at: number };

export const RESUME_WINDOW_MS = 12 * 60 * 60 * 1000;

const key = (dishId: string, servings: number) => `fitplate.cook.${dishId}.${servings}`;

/** A saved place is worth offering only if it is recent and past the overview. */
export function usableProgress(p: CookProgress | null, steps: number, now: number): CookProgress | null {
  if (!p || p.step < 0 || p.step >= steps || now - p.at > RESUME_WINDOW_MS) return null;
  return p;
}

export async function loadCookProgress(dishId: string, servings: number): Promise<CookProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(key(dishId, servings));
    if (!raw) return null;
    const p = JSON.parse(raw) as CookProgress;
    return typeof p.step === 'number' && typeof p.at === 'number' ? { step: p.step, have: p.have ?? {}, at: p.at } : null;
  } catch {
    return null;
  }
}

export async function saveCookProgress(dishId: string, servings: number, p: Omit<CookProgress, 'at'>, now: number): Promise<void> {
  try {
    await AsyncStorage.setItem(key(dishId, servings), JSON.stringify({ ...p, at: now }));
  } catch {
    // Resume is a convenience; never block cooking on it.
  }
}

export async function clearCookProgress(dishId: string, servings: number): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(dishId, servings));
  } catch {
    // ignore
  }
}
