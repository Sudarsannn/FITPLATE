import type { Ingredient } from '../models/research';

/**
 * Day 29: the numbers behind the Charts and Prices views on the Track tab. Everything is pure and reads
 * only what the person logged (day logs) or what the research recorded (ingredient price history), so a
 * chart never shows a made-up point. Days with nothing logged are gaps, not zeros, so a quiet week does
 * not drag an average down or look like a failure.
 */
export type Period = 'week' | 'month' | 'quarter';

export const PERIODS: { key: Period; label: string; days: number; bucketDays: number }[] = [
  { key: 'week', label: 'Week', days: 7, bucketDays: 1 },
  { key: 'month', label: 'Month', days: 30, bucketDays: 1 },
  { key: 'quarter', label: '3 months', days: 91, bucketDays: 7 },
];

export type DayLike = {
  meals: { kcal: number; protein: number; fibre?: number; cooked?: boolean; how?: 'cooked' | 'ordered' | 'logged'; costInr?: number | null; orderInr?: number | null }[];
  exercise: { minutes: number; kcal: number }[];
  water: number;
};

export type Bucket = {
  /** Date keys in the bucket, oldest first. */
  keys: string[];
  /** Short axis label: weekday letter, day of month or "d Mon" for weekly buckets. */
  label: string;
  /** Days with at least one meal logged. */
  loggedDays: number;
  /** Per-day averages over days that have data; null when none did. */
  kcalIn: number | null;
  kcalOut: number | null;
  protein: number | null;
  water: number | null;
  /** Totals across the bucket. */
  workoutMin: number;
  savedInr: number;
};

const pad = (n: number) => String(n).padStart(2, '0');
export const keyOfDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The dates of a period ending today, oldest first. `back` shifts the window back by whole periods (0 = this one, 1 = the one before). */
export function periodKeys(period: Period, now: Date, back = 0): string[] {
  const p = PERIODS.find((x) => x.key === period)!;
  const total = p.days === 91 ? 91 : p.days;
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - total * back);
  return Array.from({ length: total }, (_, i) => keyOfDate(new Date(end.getFullYear(), end.getMonth(), end.getDate() - (total - 1 - i))));
}

const parse = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

function labelFor(keys: string[], period: Period, i: number, n: number): string {
  const first = parse(keys[0]);
  if (period === 'week') return LETTERS[first.getDay()];
  if (period === 'month') {
    // Label about every fifth day so the axis stays readable.
    return i === n - 1 || i % 5 === 0 ? String(first.getDate()) : '';
  }
  return i % 3 === 0 || i === n - 1 ? `${first.getDate()} ${MONTHS[first.getMonth()]}` : '';
}

const avg = (xs: number[]): number | null => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

/** Money saved by cooking on one day: order price minus make price for cooked meals that carry both. */
export function daySaved(d: DayLike | undefined): number {
  if (!d) return 0;
  let s = 0;
  for (const m of d.meals) {
    const cooked = m.how ? m.how === 'cooked' : m.cooked;
    if (cooked && m.costInr != null && m.orderInr != null) s += Math.round(m.orderInr - m.costInr);
  }
  return s;
}

export function buildBuckets(days: Record<string, DayLike | undefined>, period: Period, now: Date, back = 0): Bucket[] {
  const p = PERIODS.find((x) => x.key === period)!;
  const keys = periodKeys(period, now, back);
  const groups: string[][] = [];
  // Weekly buckets are aligned to the end so the newest bucket is always a full week.
  for (let i = 0; i < keys.length; i += p.bucketDays) groups.push(keys.slice(i, i + p.bucketDays));
  return groups.map((g, i) => {
    const logs = g.map((k) => days[k]).filter((d): d is DayLike => !!d);
    const eaten = logs.filter((d) => d.meals.length > 0);
    const moved = logs.filter((d) => d.exercise.length > 0 || d.meals.length > 0);
    return {
      keys: g,
      label: labelFor(g, period, i, groups.length),
      loggedDays: eaten.length,
      kcalIn: avg(eaten.map((d) => d.meals.reduce((s, m) => s + m.kcal, 0))),
      kcalOut: avg(moved.map((d) => d.exercise.reduce((s, e) => s + e.kcal, 0))),
      protein: avg(eaten.map((d) => d.meals.reduce((s, m) => s + m.protein, 0))),
      water: avg(logs.filter((d) => d.water > 0).map((d) => d.water)),
      workoutMin: logs.reduce((s, d) => s + d.exercise.reduce((t, e) => t + e.minutes, 0), 0),
      savedInr: g.reduce((s, k) => s + daySaved(days[k]), 0),
    };
  });
}

export type Metric = 'kcalIn' | 'kcalOut' | 'protein' | 'water' | 'workoutMin' | 'savedInr';

export type SeriesStats = {
  /** Mean of the buckets that have data (per-day average for daily metrics). */
  average: number | null;
  total: number;
  best: { index: number; value: number } | null;
  withData: number;
};

export function seriesStats(buckets: Bucket[], metric: Metric): SeriesStats {
  const vals = buckets.map((b) => b[metric]);
  const present = vals.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v != null && (metric === 'workoutMin' || metric === 'savedInr' ? x.v !== 0 : true));
  const total = vals.reduce<number>((s, v) => s + (v ?? 0), 0);
  const best = present.length ? present.reduce((a, b) => (b.v > a.v ? b : a)) : null;
  return {
    average: present.length ? present.reduce((s, x) => s + x.v, 0) / present.length : null,
    total,
    best: best ? { index: best.i, value: best.v } : null,
    withData: present.length,
  };
}

/** Change of the average against the period before, as a whole percent. Null when either side has no data or the earlier average is zero. */
export function changePct(now: number | null, before: number | null): number | null {
  if (now == null || before == null || before === 0) return null;
  return Math.round(((now - before) / before) * 100);
}

/** Share of the day's range 0 to 1 for drawing a bar; nothing logged draws nothing. */
export const barFraction = (v: number | null, max: number) => (v == null || max <= 0 ? 0 : Math.min(1, v / max));

/**
 * Micronutrient coverage for one bucket: the mean over researched goal nutrients of min(share of target, 1),
 * as a whole percent. Null when no counted day had a dish with a micronutrient estimate.
 */
export function coveragePct(rows: { fraction: number }[]): number | null {
  if (rows.length === 0) return null;
  return Math.round((rows.reduce((s, r) => s + Math.min(1, r.fraction), 0) / rows.length) * 100);
}

/* ------------------------------ streaks ------------------------------ */

const shift = (k: string, n: number) => {
  const d = parse(k);
  return keyOfDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};

/** Run of days counting back from today that satisfy `test`; today may still be open, so it counts from yesterday then. */
export function runLength(days: Record<string, DayLike | undefined>, todayKey: string, test: (d: DayLike) => boolean): number {
  const ok = (k: string) => {
    const d = days[k];
    return !!d && test(d);
  };
  let k = ok(todayKey) ? todayKey : shift(todayKey, -1);
  let n = 0;
  while (ok(k) && n < 3660) {
    n++;
    k = shift(k, -1);
  }
  return n;
}

export type StreakRow = { id: 'cook' | 'water' | 'move' | 'log'; label: string; days: number };

/** Four streaks in one place. The water streak is null (hidden) when the person's conditions mean no water target is shown. */
export function streakRows(days: Record<string, DayLike | undefined>, todayKey: string, waterTarget: number | null): StreakRow[] {
  const rows: StreakRow[] = [
    { id: 'cook', label: 'Cooked at home', days: runLength(days, todayKey, (d) => d.meals.some((m) => (m.how ? m.how === 'cooked' : m.cooked))) },
    { id: 'log', label: 'Logged meals', days: runLength(days, todayKey, (d) => d.meals.length > 0) },
    { id: 'move', label: 'Moved', days: runLength(days, todayKey, (d) => d.exercise.length > 0) },
  ];
  if (waterTarget != null) rows.push({ id: 'water', label: 'Water goal met', days: runLength(days, todayKey, (d) => d.water >= waterTarget) });
  return rows;
}

/* --------------------------- plain-words notes --------------------------- */

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * A few honest sentences about the period, only where the data supports them. Never guilt, never a claim
 * from a single day of data.
 */
export function notes(buckets: Bucket[], previous: Bucket[], period: Period, goalProtein: number): string[] {
  const out: string[] = [];
  const prot = seriesStats(buckets, 'protein');
  const protBefore = seriesStats(previous, 'protein');
  if (prot.best && prot.withData >= 2 && period !== 'quarter') {
    const b = buckets[prot.best.index];
    const day = WEEKDAY[parse(b.keys[0]).getDay()];
    out.push(`Your highest protein day was ${day}, at ${Math.round(prot.best.value)} g.`);
  }
  const ch = prot.withData >= 3 && protBefore.withData >= 3 ? changePct(prot.average, protBefore.average) : null;
  if (ch != null && Math.abs(ch) >= 5) {
    out.push(`Average protein is ${ch > 0 ? 'up' : 'down'} ${Math.abs(ch)} percent on the period before.`);
  }
  const daysOnGoal = buckets.filter((b) => b.protein != null && b.protein >= goalProtein * 0.9).length;
  if (period !== 'quarter' && prot.withData >= 3) out.push(`You reached about your protein goal on ${daysOnGoal} of ${prot.withData} logged days.`);
  const move = seriesStats(buckets, 'workoutMin');
  if (move.total > 0) out.push(`${Math.round(move.total)} minutes of movement logged, across ${move.withData} ${period === 'quarter' ? 'weeks' : 'days'}.`);
  const saved = seriesStats(buckets, 'savedInr');
  if (saved.total > 0) out.push(`Cooking at home saved about ₹${Math.round(saved.total).toLocaleString('en-IN')} against ordering.`);
  return out;
}

/* ------------------------------- prices ------------------------------- */

export type PricePoint = { date: string; avg: number; min: number; max: number };
export type Verdict = 'cheaper' | 'dearer' | 'usual' | 'one-reading';

export type PriceRow = {
  id: string;
  name: string;
  unit: string;
  points: PricePoint[];
  latest: number;
  first: number;
  /** Change from the first to the latest research date, whole percent. Null with a single reading. */
  changePct: number | null;
  /** Latest against this ingredient's own average of earlier readings. */
  verdict: Verdict;
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
  stale: boolean;
  seasonal: boolean;
};

const UNIT_LABEL: Record<string, string> = { kg: 'kg', l: 'litre', g: 'g', piece: 'piece', dozen: 'dozen' };
export const priceUnit = (u: string | null) => `₹ per ${(u && UNIT_LABEL[u]) || u || 'unit'}`;

/** Within 8 percent of the ingredient's own earlier average counts as usual. */
const USUAL_BAND = 0.08;

export function priceRow(i: Pick<Ingredient, 'id' | 'name' | 'standardUnit' | 'price' | 'seasonal'>): PriceRow | null {
  const hist = i.price?.priceHistory ?? [];
  const points = hist
    .filter((h) => Number.isFinite(h.avg) && h.avg > 0)
    .map((h) => ({ date: h.date, avg: h.avg, min: h.min, max: h.max }))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length === 0) return null;
  const latest = points[points.length - 1].avg;
  const first = points[0].avg;
  const earlier = points.slice(0, -1);
  const mean = earlier.length ? earlier.reduce((s, p) => s + p.avg, 0) / earlier.length : null;
  let verdict: Verdict = 'one-reading';
  if (mean != null) verdict = latest <= mean * (1 - USUAL_BAND) ? 'cheaper' : latest >= mean * (1 + USUAL_BAND) ? 'dearer' : 'usual';
  return {
    id: i.id,
    name: i.name,
    unit: priceUnit(i.standardUnit),
    points,
    latest,
    first,
    changePct: points.length > 1 && first > 0 ? Math.round(((latest - first) / first) * 100) : null,
    verdict,
    trend: i.price?.trend ?? 'unknown',
    stale: i.price?.stale ?? false,
    seasonal: i.seasonal,
  };
}

export type PriceSort = 'biggest-change' | 'cheaper-first' | 'dearer-first' | 'name';
export type PriceFilter = 'all' | 'cheaper' | 'dearer' | 'usual';

export const VERDICT_TEXT: Record<Verdict, string> = {
  cheaper: 'Cheaper than usual',
  dearer: 'Dearer than usual',
  usual: 'About usual',
  'one-reading': 'One reading so far',
};

export function priceRows(
  items: readonly Pick<Ingredient, 'id' | 'name' | 'aliases' | 'standardUnit' | 'price' | 'seasonal'>[],
  opts: { query?: string; filter?: PriceFilter; sort?: PriceSort; trendsOnly?: boolean } = {},
): PriceRow[] {
  const q = (opts.query ?? '').trim().toLowerCase();
  const aliasOf = new Map(items.map((i) => [i.id, i.aliases ?? []]));
  let rows = items.map(priceRow).filter((r): r is PriceRow => r !== null);
  if (opts.trendsOnly ?? true) rows = rows.filter((r) => r.points.length >= 2);
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q) || (aliasOf.get(r.id) ?? []).some((a) => a.toLowerCase().includes(q)));
  const f = opts.filter ?? 'all';
  if (f !== 'all') rows = rows.filter((r) => r.verdict === f);
  const sort = opts.sort ?? 'biggest-change';
  const abs = (r: PriceRow) => Math.abs(r.changePct ?? 0);
  return [...rows].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'cheaper-first') return (a.changePct ?? 0) - (b.changePct ?? 0) || a.name.localeCompare(b.name);
    if (sort === 'dearer-first') return (b.changePct ?? 0) - (a.changePct ?? 0) || a.name.localeCompare(b.name);
    return abs(b) - abs(a) || a.name.localeCompare(b.name);
  });
}

export type PriceSummary = { withTrend: number; cheaper: number; dearer: number; oneReading: number; biggestDrop: PriceRow | null; biggestRise: PriceRow | null };

export function priceSummary(items: readonly Pick<Ingredient, 'id' | 'name' | 'standardUnit' | 'price' | 'seasonal'>[]): PriceSummary {
  const all = items.map(priceRow).filter((r): r is PriceRow => r !== null);
  const trend = all.filter((r) => r.points.length >= 2);
  const drops = trend.filter((r) => (r.changePct ?? 0) < 0).sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0));
  const rises = trend.filter((r) => (r.changePct ?? 0) > 0).sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
  return {
    withTrend: trend.length,
    cheaper: trend.filter((r) => r.verdict === 'cheaper').length,
    dearer: trend.filter((r) => r.verdict === 'dearer').length,
    oneReading: all.length - trend.length,
    biggestDrop: drops[0] ?? null,
    biggestRise: rises[0] ?? null,
  };
}

export const PRICE_NOTE = 'Prices are research estimates for an average Indian city, taken on the dates shown. They are not live shop prices and can differ where you live.';
