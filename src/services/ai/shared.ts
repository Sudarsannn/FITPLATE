/**
 * The shared AI library: dishes anyone asked the AI to create that research
 * has not replaced yet. Everyone's Cook tab finds them, so nobody generates
 * the same dish twice. Cached on the device for offline use.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { aliasDish, getCustomDishes, getDish, registerCustomDish, researchDishes, removeCustomDish } from '../../data/research';
import type { Dish } from '../../models/research';
import { buildDish, type RawAiDish } from './buildDish';
import { AI_BASE_URL } from './config';

const KEY = 'fitplate.sharedAi.v1';

export type SharedEntry = {
  slug: string;
  name: string;
  mode: 'variation' | 'new';
  basedOn: { id: string; name: string } | null;
  changes: string[];
  sources: { title: string; url: string }[];
  model: string;
  requests: number;
  dish: RawAiDish;
};

type Storage = { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void> };

export const nameKey = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** The dish a shared entry becomes in the app; null when it cannot be built. */
export function dishFromShared(e: SharedEntry, number: number): Dish | null {
  try {
    return buildDish(e.dish, { id: `ai-${e.slug}`, number, request: '', mode: e.mode, basedOn: e.basedOn, changes: e.changes ?? [], sources: e.sources ?? [], model: e.model ?? '', grounded: (e as { grounded?: boolean }).grounded }).dish;
  } catch {
    return null;
  }
}

/**
 * Registers shared dishes and retires any AI dish (shared or this device's own)
 * that research has since replaced: same name as a researched dish. The old id
 * keeps opening, now as the researched dish.
 */
export function applyShared(entries: SharedEntry[]): number {
  const researched = new Map(researchDishes.filter((d) => !d.ai).map((d) => [nameKey(d.name), d]));
  let n = 0;
  entries.forEach((e, idx) => {
    const id = `ai-${e.slug}`;
    const real = researched.get(nameKey(e.name));
    if (real) {
      aliasDish(id, real.id);
      return;
    }
    if (getCustomDishes().some((d) => d.id === id)) {
      const mine = getDish(id);
      if (mine?.ai && !mine.ai.shared) mine.ai.requests = e.requests; // keep the device's own copy, show the count
      return;
    }
    const dish = dishFromShared(e, 2000 + idx);
    if (!dish) return;
    dish.ai = { ...dish.ai!, shared: true, requests: e.requests };
    registerCustomDish(dish);
    n++;
  });
  for (const d of [...getCustomDishes()]) {
    const real = researched.get(nameKey(d.name));
    if (real) {
      aliasDish(d.id, real.id);
      removeCustomDish(d.id);
    }
  }
  return n;
}

/** Loads the cached library, then refreshes it from the server. Never throws: offline just keeps the cache. */
export async function syncSharedDishes(opts: { fetchImpl?: typeof fetch; storage?: Storage } = {}): Promise<number> {
  const storage = opts.storage ?? AsyncStorage;
  const f = opts.fetchImpl ?? fetch;
  let count = 0;
  try {
    const cached = await storage.getItem(KEY);
    if (cached) count = applyShared(JSON.parse(cached));
  } catch {
    /* no cache yet */
  }
  try {
    const res = await f(`${AI_BASE_URL}/api/ai/library`);
    if (!res.ok) return count;
    const body = await res.json();
    if (Array.isArray(body?.dishes)) {
      count += applyShared(body.dishes as SharedEntry[]);
      await storage.setItem(KEY, JSON.stringify(body.dishes));
    }
  } catch {
    /* offline */
  }
  return count;
}
