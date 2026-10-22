/**
 * Day 7: what the dish detail screen shows, worked out from a research dish.
 * Pure functions so every rule (labels, "Coming soon", the opt-in burn-off
 * maths) is unit-tested; the screen only lays the results out.
 */
import type { Dish, PriceEstimate, SourcedValue } from '../models/research';
import { PROFILE_TO_NUTRIENT } from './data/crossLinks';

/** The research assumes a 70 kg adult; used until the user logs a weight. */
export const DEFAULT_WEIGHT_KG = 70;

/** Small arrow next to a price range (spec section E): ↑ rising, ↓ falling. */
export function trendArrow(trend: PriceEstimate['trend'] | undefined): { arrow: string; label: string } | null {
  if (trend === 'rising') return { arrow: '↑', label: 'Prices rising' };
  if (trend === 'falling') return { arrow: '↓', label: 'Prices falling' };
  if (trend === 'stable') return { arrow: '→', label: 'Prices steady' };
  return null;
}

/** "1 Oct 2026" style, independent of the device locale so tests are stable. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function shortDate(iso: string | null | undefined): string | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** "Based on 2 research updates, last updated 10 Oct 2026." */
export function researchUpdatesLine(d: Pick<Dish, 'versions'>): string {
  const n = d.versions.length;
  if (n === 0) return 'Research update details coming soon.';
  const last = [...d.versions].map((v) => v.date).sort().at(-1);
  return `Based on ${n} research ${n === 1 ? 'update' : 'updates'}, last updated ${shortDate(last) ?? last}.`;
}

export type QuickFact = { label: string; value: string };

/** Quick facts; a missing value reads "Coming soon" (spec: missing data shows "Coming soon"). */
export function quickFacts(d: Dish): QuickFact[] {
  const mins = (m: number | null) => (m != null ? `${m} min` : 'Coming soon');
  const total = d.prepMin != null || d.cookMin != null ? (d.prepMin ?? 0) + (d.cookMin ?? 0) : null;
  return [
    { label: 'Prep', value: mins(d.prepMin) },
    { label: 'Cook', value: mins(d.cookMin) },
    { label: 'Total', value: mins(total) },
    { label: 'Difficulty', value: d.difficulty ?? 'Coming soon' },
    { label: 'Cuisine', value: d.cuisine ?? 'Coming soon' },
    { label: 'Serves', value: '1 (scale it when you cook)' },
  ];
}

// ---------------------------------------------------------------- nutrition

type MacroKey = 'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fibreG';
const MACRO_ROWS: { key: MacroKey; ordered: 'calories' | 'protein' | 'carbs' | 'fat' | 'fibre'; label: string; unit: string }[] = [
  { key: 'kcal', ordered: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'proteinG', ordered: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbsG', ordered: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fatG', ordered: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fibreG', ordered: 'fibre', label: 'Fibre', unit: 'g' },
];

const fmt = (v: number, unit: string) => `${unit === 'kcal' ? Math.round(v) : Math.round(v * 10) / 10} ${unit}`;

export type NutritionRow = {
  label: string;
  /** Home-cooked (FitPlate recipe) value, or "Coming soon". */
  cooked: string;
  /** As ordered (published by the restaurant), "Not published", or null when the dish has no as-ordered research. */
  ordered: string | null;
  orderedSource: string | null;
};

/**
 * SPEC-ADDENDA §1: as-ordered sits NEXT TO as-cooked, never merged. Ordered
 * values the research marked "Not found" read "Not published" and are never
 * estimated.
 */
export function nutritionRows(d: Dish): NutritionRow[] {
  const ordered = d.asOrdered?.nutrition ?? null;
  return MACRO_ROWS.map((r) => {
    const cooked = d.nutritionPerServing[r.key];
    const o: SourcedValue | null = ordered ? ordered[r.ordered] : null;
    return {
      label: r.label,
      cooked: cooked != null ? fmt(cooked, r.unit) : 'Coming soon',
      ordered: ordered ? (o?.value != null ? fmt(o.value, r.unit) : 'Not published') : null,
      orderedSource: o?.value != null ? o.source : null,
    };
  });
}

/** Whether any restaurant published a value we can show beside the recipe. */
export function hasPublishedOrdered(d: Dish): boolean {
  const n = d.asOrdered?.nutrition;
  return !!n && Object.values(n).some((v) => v.value != null);
}

/** Calories saved by cooking = as-ordered − as-cooked, only when both exist and it is a saving. */
export function caloriesSaved(d: Dish): number | null {
  const ordered = d.asOrdered?.nutrition?.calories.value;
  const cooked = d.nutritionPerServing.kcal;
  if (ordered == null || cooked == null) return null;
  const saved = Math.round(ordered - cooked);
  return saved > 0 ? saved : null;
}

// ---------------------------------------------------------------- micronutrients

const UNIT_BY_ID: Record<string, string> = Object.fromEntries(Object.values(PROFILE_TO_NUTRIENT).map((v) => [v!.id, v!.unit]));

/** "vitamin-a" → "Vitamin A". */
export function nutrientLabel(id: string): string {
  return id
    .split('-')
    .map((w) => (w.length === 1 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

export type MicroRow = { id: string; label: string; value: string };

/** The partial vitamin and mineral estimate, largest coverage first by name; nulls are left out. */
export function microRows(d: Dish): { rows: MicroRow[]; coveragePct: number } | null {
  const m = d.microNutrientsEstimate;
  if (!m) return null;
  const rows = Object.entries(m.values)
    .filter((e): e is [string, number] => e[1] != null)
    .map(([id, v]) => {
      const unit = UNIT_BY_ID[id] ?? '';
      const value = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
      return { id, label: nutrientLabel(id), value: `${value}${unit ? ` ${unit}` : ''}` };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
  return rows.length ? { rows, coveragePct: m.coveragePct } : null;
}

// ---------------------------------------------------------------- equipment

/**
 * Splits "Kadai, about 20 cm (a wide pan lets the fish sit in one layer)" into
 * the item and its note; research writes alternatives in that bracket or after
 * "or", so both stay visible.
 */
export function splitEquipment(text: string): { item: string; note: string | null } {
  const open = text.indexOf(' (');
  if (open > 0 && text.endsWith(')')) return { item: text.slice(0, open), note: text.slice(open + 2, -1) };
  return { item: text, note: null };
}

// ---------------------------------------------------------------- burn-off (opt-in)

/**
 * Review 2026-10-21 FIX 2: one neutral name for the opt-in button, from
 * SPEC-ADDENDA §8. Never the fitness file's "Check how to burn these calories".
 */
export const BALANCE_LABEL = 'See ways to balance this';
export const BALANCE_HIDE_LABEL = 'Hide ways to balance this';

export type MetEntry = { exerciseId: string; name: string; met: number };
export type BurnWay = { exerciseId: string; name: string; minutes: number };

/**
 * SPEC-ADDENDA §8: only shown after the user taps BALANCE_LABEL.
 * Minutes = kcal ÷ (MET × kg) × 60, using the research's Compendium METs.
 * Light stretches (MET under 3) are left out: they would need hours and read
 * as a punishment, which the tasty-first rule forbids.
 */
export function burnWays(kcal: number | null, weightKg: number | null, mets: readonly MetEntry[], max = 5): BurnWay[] {
  if (kcal == null || kcal <= 0) return [];
  const kg = weightKg && weightKg > 0 ? weightKg : DEFAULT_WEIGHT_KG;
  return mets
    .filter((m) => m.met >= 3)
    .map((m) => ({ exerciseId: m.exerciseId, name: m.name, minutes: Math.round((kcal / (m.met * kg)) * 60) }))
    .sort((a, b) => a.minutes - b.minutes || a.name.localeCompare(b.name))
    .slice(0, max);
}

/** "1 h 20 min" / "45 min". */
export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// ---------------------------------------------------------------- sources

/** "Ranveer Brar, Goan Fish Curry: https://…" → label + link (link null when the line has no URL). */
export function splitSource(line: string): { label: string; url: string | null } {
  const m = line.match(/https?:\/\/\S+/);
  if (!m) return { label: line, url: null };
  const url = m[0].replace(/[).,;]+$/, '');
  const label = line.slice(0, m.index).replace(/[:\s–-]+$/, '').trim();
  return { label: label || url, url };
}
