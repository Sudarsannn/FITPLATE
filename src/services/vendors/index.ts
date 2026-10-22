import { getIngredient, researchDishes, researchIngredients } from '../../data/research';
import type { Dish } from '../../models/research';
import { dishCostToMake } from '../costToMake';
import { normaliseName } from './basket';
import { FITPLATE_API_URL } from './config';
import { createLiveFood, createLiveInstamart } from './liveSwiggy';
import { createSampleFood } from './sampleFood';
import { createSampleInstamart } from './sampleInstamart';
import type { InstamartApi, SwiggyFoodApi } from './types';

export type VendorMode = 'sample' | 'live';

/** Live Swiggy is possible only where the local FitPlate server is set up (Sudarsan's Mac). */
export const liveAvailable = () => Boolean(FITPLATE_API_URL);

/** The user's chosen mode, falling back to sample wherever live isn't possible. */
export const vendorMode = (wantsLive: boolean | undefined): VendorMode => (wantsLive && liveAvailable() ? 'live' : 'sample');


/** Researched price per 100 g for a product query, so sample prices look like real ones. */
function priceHint(query: string): number | null {
  const q = normaliseName(query);
  const hit = researchIngredients.find((i) => normaliseName(i.name) === q || normaliseName(i.name).includes(q) || q.includes(normaliseName(i.name)));
  return hit?.per100Estimate?.avg ?? (getIngredient(q)?.per100Estimate?.avg ?? null);
}

let sampleIm: InstamartApi | null = null;
let liveIm: InstamartApi | null = null;
let sampleFood: SwiggyFoodApi | null = null;
let liveFood: SwiggyFoodApi | null = null;

export function instamart(mode: VendorMode): InstamartApi {
  if (mode === 'live') return (liveIm ??= createLiveInstamart());
  return (sampleIm ??= createSampleInstamart({ priceHint }));
}

export function swiggyFood(mode: VendorMode): SwiggyFoodApi {
  if (mode === 'live') return (liveFood ??= createLiveFood());
  return (sampleFood ??= createSampleFood({ dishes: () => researchDishes }));
}

/**
 * Cost to make one dish for these servings, from researched ingredient prices.
 * Day 8: uses the cost-to-make engine (services/costToMake.ts); coverage is
 * the share of counted ingredient lines that have a price.
 */
export function dishCost(dish: Dish, servings = 1): { inr: number; coveragePct: number } | null {
  const c = dishCostToMake(dish, getIngredient);
  if (!c) return null;
  return { inr: Math.max(1, Math.round(c.avg * servings)), coveragePct: Math.round((c.pricedLines / Math.max(1, c.countedLines)) * 100) };
}

export * from './types';
