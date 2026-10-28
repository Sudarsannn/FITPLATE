import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cook tab shortcuts (Day 11 innovation, flag `recentDishes`): dishes you opened
 * lately, kept on this device, and dishes you cooked, from the meal log.
 */
const KEY = 'fitplate.recentDishes';
export const MAX_RECENT = 10;

/** Newest first, no repeats, capped. */
export function pushRecent(list: readonly string[], id: string, max = MAX_RECENT): string[] {
  return [id, ...list.filter((x) => x !== id)].slice(0, max);
}

type Meal = { cooked: boolean; dishId?: string | null; at: number };

/** Dish ids you cooked, most recent first, each once. */
export function cookAgainIds(days: Record<string, { meals: Meal[] }>, max = MAX_RECENT): string[] {
  const cooked = Object.values(days)
    .flatMap((d) => d?.meals ?? [])
    .filter((m) => m.cooked && m.dishId)
    .sort((a, b) => b.at - a.at);
  const out: string[] = [];
  for (const m of cooked) if (!out.includes(m.dishId!)) out.push(m.dishId!);
  return out.slice(0, max);
}

export async function loadRecent(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function recordViewed(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(pushRecent(await loadRecent(), id)));
  } catch {
    // A convenience only.
  }
}
