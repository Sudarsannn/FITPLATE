/**
 * Innovation (Day 06): the dish library remembers which allergens a person
 * leaves out, on this device, so a peanut allergy doesn't have to be set again
 * every time. Kept under the owner's device prefix, so "Delete my data",
 * sign-out and "Reset demo data" clear it with everything else.
 */
import { ALLERGEN_IDS, type AllergenId } from '../models/research';
import { ownerPrefix } from './storage/docStore';
import type { KeyValueStore } from './storage/kv';

export const rememberedFiltersKey = (owner: string) => `${ownerPrefix(owner)}dishFilters.v1`;

type Saved = { version: 1; excludeAllergens: AllergenId[] };

/** Only known allergen ids survive, so an old or damaged value can't hide dishes for no reason. */
export function cleanAllergens(value: unknown): AllergenId[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is AllergenId => typeof v === 'string' && (ALLERGEN_IDS as readonly string[]).includes(v)))];
}

export async function loadExcludedAllergens(kv: KeyValueStore, owner: string): Promise<AllergenId[]> {
  try {
    const raw = await kv.getItem(rememberedFiltersKey(owner));
    if (!raw) return [];
    const saved = JSON.parse(raw) as Partial<Saved>;
    return saved.version === 1 ? cleanAllergens(saved.excludeAllergens) : [];
  } catch {
    return [];
  }
}

export async function saveExcludedAllergens(kv: KeyValueStore, owner: string, ids: readonly string[]): Promise<void> {
  const clean = cleanAllergens(ids);
  try {
    if (clean.length === 0) await kv.removeItem(rememberedFiltersKey(owner));
    else await kv.setItem(rememberedFiltersKey(owner), JSON.stringify({ version: 1, excludeAllergens: clean } satisfies Saved));
  } catch {
    // Remembering is a convenience; the filter still works for this visit.
  }
}
