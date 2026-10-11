/**
 * Merge rules for items with more than one research version (spec section D).
 * Never blindly average: each kind of field has its own rule. Prices go
 * through the price trend engine (priceTrend.ts); everything else is here.
 * Pure, so the importers can run it at build time and tests can pin it down.
 */

export type Versioned<T> = { date: string; value: T };

export type StableMerge = {
  value: number | null;
  method: 'none' | 'single' | 'mean-2' | 'median-3';
  excludedDates: string[];
  notes: string[];
};

const OUTLIER = 0.25;
const RECIPE_QTY_CHANGE = 0.15;

/** Relative difference against a reference; any change from 0 counts as infinite. */
function relDiff(value: number, ref: number): number {
  if (ref === 0) return value === 0 ? 0 : Infinity;
  return Math.abs(value - ref) / Math.abs(ref);
}

function round1(v: number): number {
  return Math.round(v * 10) / 10 + 0;
}

function checkFinite(value: number, where: string): void {
  if (!Number.isFinite(value)) throw new Error(`merge: ${where} must be a finite number, got ${value}`);
}

/**
 * Stable research estimates (calories, macros, scores, "(est.)" densities):
 * a moving window of the newest versions so old research drops out, with
 * outlier exclusion because one bad research run shouldn't move the number.
 */
export function mergeStable(versions: Versioned<number | null>[]): StableMerge {
  const present: Versioned<number>[] = [];
  for (const v of versions) {
    if (v.value === null) continue;
    checkFinite(v.value, `value on ${v.date}`);
    present.push({ date: v.date, value: v.value });
  }
  // YYYY-MM-DD sorts correctly as text; the sort is stable for same-day versions.
  present.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  if (present.length === 0) return { value: null, method: 'none', excludedDates: [], notes: [] };
  if (present.length === 1) return { value: round1(present[0].value), method: 'single', excludedDates: [], notes: [] };

  if (present.length === 2) {
    const [older, newer] = present;
    if (relDiff(newer.value, older.value) > OUTLIER) {
      // With two versions there is no majority, so trust the newer research.
      return {
        value: round1(newer.value),
        method: 'single',
        excludedDates: [older.date],
        notes: [`Versions ${older.date} (${older.value}) and ${newer.date} (${newer.value}) differ by more than 25%; kept the newer.`],
      };
    }
    return { value: round1((older.value + newer.value) / 2), method: 'mean-2', excludedDates: [], notes: [] };
  }

  const window = present.slice(-3);
  // Median of the other two = their mean. Only the worst offender is dropped so two values always remain.
  const deviations = window.map((v, i) => {
    const others = window.filter((_, j) => j !== i);
    return relDiff(v.value, (others[0].value + others[1].value) / 2);
  });
  const worst = deviations.indexOf(Math.max(...deviations));
  if (deviations[worst] > OUTLIER) {
    const out = window[worst];
    const kept = window.filter((_, i) => i !== worst);
    return {
      value: round1((kept[0].value + kept[1].value) / 2),
      method: 'median-3',
      excludedDates: [out.date],
      notes: [`Excluded outlier ${out.value} from ${out.date}: more than 25% from the other versions.`],
    };
  }
  const sorted = window.map((v) => v.value).sort((a, b) => a - b);
  return { value: round1(sorted[1]), method: 'median-3', excludedDates: [], notes: [] };
}

export type OfficialVersion = { value: number | null; citesOfficial: boolean; date: string };

/**
 * Official reference values (ICMR-NIN, IFCT, Compendium MET) are fixed
 * published numbers, so a difference is an error somewhere: never average,
 * prefer the cited value, and ask a human when citation can't settle it.
 */
export function mergeOfficial(
  prev: OfficialVersion | null,
  next: OfficialVersion,
  opts: { safetyLimit?: boolean } = {},
): { value: number | null; needsReview: boolean; note: string | null } {
  if (prev?.value != null) checkFinite(prev.value, `previous value (${prev.date})`);
  if (next.value !== null) checkFinite(next.value, `next value (${next.date})`);

  if (prev === null || prev.value === null) return { value: next.value, needsReview: false, note: null };
  if (next.value === null) return { value: prev.value, needsReview: false, note: null };
  if (prev.value === next.value) return { value: prev.value, needsReview: false, note: null };

  const conflict = `${prev.date}: ${prev.value} vs ${next.date}: ${next.value}`;
  if (opts.safetyLimit) {
    // For upper limits and safety thresholds, the lower value is the safer one to show while a human checks.
    return { value: Math.min(prev.value, next.value), needsReview: true, note: `Safety limit conflict (${conflict}); kept the lower value.` };
  }
  if (next.citesOfficial && !prev.citesOfficial) {
    return { value: next.value, needsReview: false, note: `Conflict (${conflict}); kept ${next.date}, which cites the official table.` };
  }
  if (prev.citesOfficial && !next.citesOfficial) {
    return { value: prev.value, needsReview: false, note: `Conflict (${conflict}); kept ${prev.date}, which cites the official table.` };
  }
  const why = prev.citesOfficial ? 'both cite the official table' : 'neither cites the official table';
  return { value: prev.value, needsReview: true, note: `Conflict (${conflict}); ${why}, kept the previous value.` };
}

/** Lists (sources, aliases, tips, warnings): union, trimmed, deduplicated case-insensitively, first spelling and order win. */
export function unionList(...lists: (readonly string[] | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    if (!list) continue;
    for (const raw of list) {
      const item = raw.trim();
      const key = item.toLowerCase();
      if (item === '' || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export type Completeness<T> = { value: T; sources: number; notFound: number };

function checkCount(n: number, where: string): void {
  if (!Number.isInteger(n) || n < 0) throw new Error(`merge: ${where} must be a whole number ≥ 0, got ${n}`);
}

/**
 * Recipes and instructions are adopted whole, never mixed step by step,
 * because steps from different versions don't fit together.
 */
export function adoptWhole<T>(
  prev: Completeness<T> | null,
  next: Completeness<T>,
): { value: T; adopted: 'next' | 'prev'; note: string | null } {
  checkCount(next.sources, 'next.sources');
  checkCount(next.notFound, 'next.notFound');
  if (prev === null) return { value: next.value, adopted: 'next', note: null };
  checkCount(prev.sources, 'prev.sources');
  checkCount(prev.notFound, 'prev.notFound');

  const reasons: string[] = [];
  if (next.sources < prev.sources) reasons.push(`fewer sources (${next.sources} < ${prev.sources})`);
  if (next.notFound > prev.notFound) reasons.push(`more "Not found" fields (${next.notFound} > ${prev.notFound})`);
  if (reasons.length === 0) return { value: next.value, adopted: 'next', note: null };
  return { value: prev.value, adopted: 'prev', note: `Kept the previous version: the newer one has ${reasons.join(' and ')}.` };
}

export type RecipeLine = { ingredientId: string | null; name: string; quantity: number | null };

function recipeTotals(lines: RecipeLine[]): Map<string, number | null> {
  const totals = new Map<string, number | null>();
  for (const line of lines) {
    const key = line.ingredientId ?? line.name.trim().toLowerCase();
    if (key === '') throw new Error('merge: recipe line has neither an ingredientId nor a name');
    if (line.quantity !== null) checkFinite(line.quantity, `quantity of ${key}`);
    // The same ingredient listed twice (e.g. oil for tempering and frying) is compared as one total.
    const prev = totals.get(key);
    const sum = prev === undefined ? line.quantity : prev === null || line.quantity === null ? null : prev + line.quantity;
    totals.set(key, sum);
  }
  return totals;
}

/**
 * Whether a recipe changed enough to reset the calorie/macro/healthiness
 * window: an ingredient added or removed, or a quantity moved by more than 15%.
 */
export function recipeChangedMaterially(a: RecipeLine[], b: RecipeLine[]): boolean {
  const ta = recipeTotals(a);
  const tb = recipeTotals(b);
  if (ta.size !== tb.size) return true;
  for (const [key, qa] of ta) {
    if (!tb.has(key)) return true;
    const qb = tb.get(key) ?? null;
    // An unknown quantity is missing research, not evidence the recipe changed.
    if (qa === null || qb === null) continue;
    if (relDiff(qb, qa) > RECIPE_QTY_CHANGE) return true;
  }
  return false;
}
