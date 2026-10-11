/**
 * Price trend engine (spec section E). Prices drift with inflation, seasons
 * and monsoon spikes, so a plain average of research versions would lag and
 * mislead. Each research version is one observation; this turns them into a
 * time-weighted estimate with trend and spike detection. Pure, so it can be
 * unit-tested with synthetic series and run by the importers at build time.
 */
import type { Confidence, PriceEstimate } from '../../models/research';

export type PriceObservation = {
  /** YYYY-MM-DD */
  date: string;
  min: number;
  max: number;
  avg: number | null;
  confidence: Confidence | null;
  sourceFile: string;
  /** Old-format or converted observation (e.g. a 2-serving dish file scaled to 1) → quality 0.5. */
  lowQuality?: boolean;
};

export type PriceFlag = 'possible-spike' | 'narrowed' | 'stale';

export type PriceEngineResult = PriceEstimate & { flags: PriceFlag[]; notes: string[] };

export type PriceEngineOptions = {
  /** YYYY-MM-DD; ages and staleness are measured from here so builds are reproducible. */
  today: string;
  seasonal: boolean;
  kind: 'ingredient' | 'dish';
};

/**
 * Canonical ingredient ids the spec names as spike-prone seasonal produce.
 * Exported rather than applied here: callers own the id → seasonal decision.
 */
export const SEASONAL_PRODUCE: ReadonlySet<string> = new Set([
  'onion',
  'tomato',
  'potato',
  'green-chilli',
  'coriander-leaves',
  'lemon',
]);

const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_LIFE_DAYS = 30;
const TREND_WINDOW = 5;
const TREND_THRESHOLD_PCT = 5;
const SPIKE_THRESHOLD = 0.35;
const MAX_SPREAD = 0.3;
const NARROW_TO = 0.15;
const STALE_DAYS = 45;

type Range = { min: number; max: number; avg: number };
type Point = Range & { day: number; quality: number };
type Trend = PriceEstimate['trend'];
type Core = { estimate: Range; method: PriceEstimate['method']; trend: Trend; slopePct: number | null; spike: boolean };

function parseDay(date: string, field: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`priceTrend: ${field} must be YYYY-MM-DD, got "${date}"`);
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(ms)) throw new Error(`priceTrend: ${field} is not a real date: "${date}"`);
  return Math.round(ms / DAY_MS);
}

function checkPrice(value: number, field: string, date: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`priceTrend: ${field} on ${date} must be a finite number ≥ 0, got ${value}`);
}

function wma(points: Point[], today: number): Range {
  let sw = 0;
  let min = 0;
  let max = 0;
  let avg = 0;
  for (const p of points) {
    // Future-dated observations count as "today" rather than gaining extra weight.
    const age = Math.max(0, today - p.day);
    const w = p.quality * 0.5 ** (age / HALF_LIFE_DAYS);
    sw += w;
    min += w * p.min;
    max += w * p.max;
    avg += w * p.avg;
  }
  return { min: min / sw, max: max / sw, avg: avg / sw };
}

/** Least-squares slope of avg per day; 0 when all points share one date (no time axis to fit). */
function slopePerDay(points: Point[]): number {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.day, 0) / n;
  const my = points.reduce((s, p) => s + p.avg, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.day - mx) * (p.avg - my);
    den += (p.day - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/** The unrounded engine; recursion on the series minus its latest point gives the "previous estimate" for spike checks. */
function core(points: Point[], today: number): Core {
  const smoothed = wma(points, today);
  const latest = points[points.length - 1];

  let trend: Trend = 'unknown';
  let slopePct: number | null = null;
  if (points.length >= 3) {
    const recent = points.slice(-TREND_WINDOW);
    slopePct = smoothed.avg === 0 ? 0 : ((slopePerDay(recent) * HALF_LIFE_DAYS) / smoothed.avg) * 100;
    const [a, b, c] = points.slice(-3).map((p) => p.avg);
    if (slopePct >= TREND_THRESHOLD_PCT && b > a && c > b) trend = 'rising';
    else if (slopePct <= -TREND_THRESHOLD_PCT && b < a && c < b) trend = 'falling';
    else trend = 'stable';
  }

  if (trend === 'rising' || trend === 'falling') {
    // A moving average lags a real trend; the latest observation is the best guide, and we never extrapolate past it.
    return { estimate: { min: latest.min, max: latest.max, avg: latest.avg }, method: 'latest-trend', trend, slopePct, spike: false };
  }
  if (points.length === 1) return { estimate: smoothed, method: 'single', trend, slopePct, spike: false };

  const prev = core(points.slice(0, -1), today).estimate;
  const jump = prev.avg === 0 ? (latest.avg === 0 ? 0 : Infinity) : Math.abs(latest.avg - prev.avg) / prev.avg;
  if (jump > SPIKE_THRESHOLD) {
    // Unconfirmed jump: meet it halfway until the next observation confirms or reverses it.
    const half = (k: keyof Range) => (prev[k] + latest[k]) / 2;
    return { estimate: { min: half('min'), max: half('max'), avg: half('avg') }, method: 'spike-blend', trend, slopePct, spike: true };
  }
  return { estimate: smoothed, method: 'wma', trend, slopePct, spike: false };
}

function roundStep(kind: PriceEngineOptions['kind'], avg: number): number {
  if (kind === 'dish') return 10;
  return avg < 100 ? 1 : 5;
}

export function computePriceEstimate(observations: PriceObservation[], opts: PriceEngineOptions): PriceEngineResult {
  if (observations.length === 0) throw new Error('priceTrend: no observations');
  const today = parseDay(opts.today, 'today');
  const notes: string[] = [];
  const flags: PriceFlag[] = [];

  const seen = new Set<string>();
  const unique: (PriceObservation & { avg: number; day: number })[] = [];
  for (const o of observations) {
    const day = parseDay(o.date, 'date');
    checkPrice(o.min, 'min', o.date);
    checkPrice(o.max, 'max', o.date);
    if (o.avg !== null) checkPrice(o.avg, 'avg', o.date);
    if (o.min > o.max) throw new Error(`priceTrend: min ${o.min} > max ${o.max} on ${o.date} (${o.sourceFile})`);
    // The same file re-imported must not count twice.
    const key = `${o.date}|${o.sourceFile}`;
    if (seen.has(key)) {
      notes.push(`Ignored duplicate observation ${o.date} from ${o.sourceFile}.`);
      continue;
    }
    seen.add(key);
    unique.push({ ...o, avg: o.avg ?? (o.min + o.max) / 2, day });
  }
  // Array.prototype.sort is stable, so same-date observations keep their input order.
  unique.sort((a, b) => a.day - b.day);

  const points: Point[] = unique.map((o) => ({
    day: o.day,
    min: o.min,
    max: o.max,
    avg: o.avg,
    quality: o.confidence === 'Low' || o.lowQuality ? 0.5 : 1,
  }));
  const result = core(points, today);

  const latest = unique[unique.length - 1];
  if (result.spike) {
    flags.push('possible-spike');
    notes.push(`Possible spike: latest avg ${latest.avg} (${latest.date}) moved more than 35% from the previous estimate; using the halfway point.`);
  }

  let { min, max, avg } = result.estimate;
  min = Math.min(min, avg);
  max = Math.max(max, avg);
  if (max - min > MAX_SPREAD * avg) {
    notes.push(`Range ${min.toFixed(1)}–${max.toFixed(1)} was wider than 30% of avg ${avg.toFixed(1)}; narrowed to ±15%.`);
    flags.push('narrowed');
    min = avg * (1 - NARROW_TO);
    max = avg * (1 + NARROW_TO);
  }
  const step = roundStep(opts.kind, avg);
  const round = (v: number) => Math.round(v / step) * step;

  const stale = today - latest.day > STALE_DAYS;
  if (stale) {
    flags.push('stale');
    notes.push(`Latest observation ${latest.date} is more than ${STALE_DAYS} days old.`);
  }

  return {
    priceHistory: unique.map((o) => ({ date: o.date, min: o.min, max: o.max, avg: o.avg, confidence: o.confidence, sourceFile: o.sourceFile })),
    currentEstimate: { min: round(min), max: round(max), avg: round(avg) },
    method: result.method,
    trend: result.trend,
    // `+ 0` turns -0 into 0 so JSON output stays clean.
    change30dPct: result.slopePct === null ? null : Math.round(result.slopePct * 10) / 10 + 0,
    lastObserved: latest.date,
    stale,
    seasonal: opts.seasonal,
    flags,
    notes,
  };
}
