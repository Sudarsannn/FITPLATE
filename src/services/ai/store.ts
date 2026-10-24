import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCustomDishes, registerCustomDish, removeCustomDish, researchDishes } from '../../data/research';
import type { Dish } from '../../models/research';

const nameKey = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '');
const KEY = 'fitplate.aiDishes.v1';

type Storage = { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void> };

/** Puts the dishes the AI created on this device back into the app. Safe to call more than once. */
export async function loadAiDishes(storage: Storage = AsyncStorage): Promise<number> {
  try {
    const raw = await storage.getItem(KEY);
    const list: Dish[] = raw ? JSON.parse(raw) : [];
    // Once daily research has produced the real dish, it replaces the user's AI draft of the same name.
    const researched = new Set(researchDishes.filter((d) => !d.ai).map((d) => nameKey(d.name)));
    for (const d of list) if (d && typeof d.id === 'string' && d.ai && !researched.has(nameKey(d.name))) registerCustomDish(d);
    return list.length;
  } catch {
    return 0;
  }
}

async function persist(storage: Storage) {
  try {
    await storage.setItem(KEY, JSON.stringify(getCustomDishes()));
  } catch {
    /* the dish stays for this session even if the device refuses to store it */
  }
}

export async function saveAiDish(dish: Dish, storage: Storage = AsyncStorage): Promise<void> {
  registerCustomDish(dish);
  await persist(storage);
}

export async function deleteAiDish(id: string, storage: Storage = AsyncStorage): Promise<void> {
  removeCustomDish(id);
  await persist(storage);
}
