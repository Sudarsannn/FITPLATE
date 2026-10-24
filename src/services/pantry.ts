/**
 * The ingredient inventory: what is in the kitchen right now, kept by the same
 * key as shopping-list items (research ingredient id, or the normalised name).
 * Amounts are folded to a base unit (g, ml) like the shopping list; anything in
 * another unit (spoons, "small") is kept as typed and only matches the same unit.
 * Pure, so Jest can test it. Stored in settings.pantry.
 */
import type { PantryItem, ShoppingItem } from '../models/prefs';
import { baseAmount, ingredientKey } from './vendors/basket';

export type Pantry = Record<string, PantryItem>;

const norm = (u: string | null | undefined) => u?.trim().toLowerCase() || null;

/** Adds the quantity to the item (same unit), or starts it. */
export function addAmount(pantry: Pantry, key: string, meta: { name: string; ingredientId: string | null }, quantity: number | null, unit: string | null, now = Date.now()): Pantry {
  const base = quantity != null ? baseAmount(quantity, unit) : { quantity: null as number | null, unit: norm(unit) };
  const have = pantry[key];
  const sameUnit = have && (have.unit ?? null) === (base.unit ?? null);
  const total = quantity == null ? (have?.quantity ?? null) : sameUnit && have.quantity != null ? have.quantity + (base.quantity ?? 0) : (base.quantity ?? 0);
  return { ...pantry, [key]: { name: have?.name ?? meta.name, ingredientId: have?.ingredientId ?? meta.ingredientId, quantity: total, unit: sameUnit || !have ? base.unit : have.unit ?? base.unit, updatedAt: now } };
}

/** The shopping list's items go into the inventory (what was bought). */
export function addBought(pantry: Pantry, items: Pick<ShoppingItem, 'key' | 'name' | 'ingredientId' | 'quantity' | 'unit' | 'more'>[], now = Date.now()): Pantry {
  let next = pantry;
  for (const i of items) {
    next = addAmount(next, i.key, i, i.quantity, i.unit, now);
    for (const m of i.more ?? []) next = addAmount(next, i.key, i, m.quantity, m.unit, now);
  }
  return next;
}

/** The user typed a new amount for an item. */
export function setAmount(pantry: Pantry, key: string, quantity: number | null, now = Date.now()): Pantry {
  const have = pantry[key];
  if (!have) return pantry;
  return { ...pantry, [key]: { ...have, quantity, updatedAt: now } };
}

export function removeItem(pantry: Pantry, key: string): Pantry {
  const { [key]: _gone, ...rest } = pantry;
  return rest;
}

/** How much of this item is already in the kitchen, in the item's own unit; null when the units differ. */
export function haveFor(pantry: Pantry, key: string, unit: string | null): number | null {
  const have = pantry[key];
  if (!have || have.quantity == null) return null;
  const want = norm(unit);
  return (have.unit ?? null) === (want ?? null) ? have.quantity : null;
}

export type Coverage = { have: number | null; need: number | null; missing: number | null; status: 'enough' | 'some' | 'none' | 'unknown' };

/** Have against need for one line (the line's main amount only). */
export function coverage(pantry: Pantry, item: Pick<ShoppingItem, 'key' | 'quantity' | 'unit'>): Coverage {
  const need = item.quantity;
  const have = haveFor(pantry, item.key, item.unit);
  if (need == null) return { have, need, missing: null, status: pantry[item.key] ? 'enough' : 'unknown' };
  if (have == null) return { have: null, need, missing: need, status: 'none' };
  const missing = Math.max(0, Math.round((need - have) * 10) / 10);
  return { have, need, missing, status: missing === 0 ? 'enough' : have > 0 ? 'some' : 'none' };
}

/** "Only buy what I'm missing": lines already covered are unticked, partly covered ones shrink to the shortfall. */
export function onlyMissing<T extends ShoppingItem>(items: T[], pantry: Pantry): T[] {
  return items.map((i) => {
    const c = coverage(pantry, i);
    if (c.status === 'enough' && i.quantity != null) return { ...i, included: false };
    if (c.status === 'some' && c.missing != null) return { ...i, quantity: c.missing, more: i.more };
    return i;
  });
}

/** Display line for the dish page and the shopping list. */
export function haveLabel(c: Coverage, unit: string | null): string | null {
  if (c.have == null) return null;
  const u = unit ? ` ${unit}` : '';
  return c.status === 'enough' ? `You have enough (${c.have}${u})` : `You have ${c.have}${u}`;
}

/** Have against need for one recipe line scaled to the servings. */
export function lineCoverage(pantry: Pantry, line: { ingredientId: string | null; name: string; quantity: number | null; unit: string | null }, servings: number): Coverage {
  const key = ingredientKey(line.ingredientId, line.name);
  const a = line.quantity != null ? baseAmount(line.quantity * servings, line.unit) : null;
  return coverage(pantry, { key, quantity: a?.quantity ?? null, unit: a?.unit ?? null });
}

export const keyFor = ingredientKey;
