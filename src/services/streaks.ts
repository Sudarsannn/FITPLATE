/**
 * Home-cooking streaks. A day counts when at least one meal logged that day was cooked at home.
 * The current streak counts back from today, but today may still be empty (the day isn't over):
 * it then counts back from yesterday. Pure, so Jest can test it.
 */
export type CookedDays = ReadonlySet<string>;

const pad = (n: number) => String(n).padStart(2, '0');
export const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const shift = (key: string, n: number) => {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return keyOf(t.getFullYear(), t.getMonth(), t.getDate());
};

export function cookedDays(days: Record<string, { meals: { cooked: boolean }[] }>): Set<string> {
  const out = new Set<string>();
  for (const [k, d] of Object.entries(days)) if (d?.meals?.some((m) => m.cooked)) out.add(k);
  return out;
}

export function currentStreak(cooked: CookedDays, todayKey: string): number {
  let k = cooked.has(todayKey) ? todayKey : shift(todayKey, -1);
  let n = 0;
  while (cooked.has(k) && n < 3660) {
    n++;
    k = shift(k, -1);
  }
  return n;
}

export function longestStreak(cooked: CookedDays): number {
  let best = 0;
  for (const k of cooked) {
    if (cooked.has(shift(k, -1))) continue; // not the start of a run
    let n = 0;
    let c = k;
    while (cooked.has(c)) {
      n++;
      c = shift(c, 1);
    }
    best = Math.max(best, n);
  }
  return best;
}

/** True when this cooked day has a cooked neighbour, i.e. it is part of a streak of two or more. */
export const inStreak = (cooked: CookedDays, key: string) => cooked.has(key) && (cooked.has(shift(key, -1)) || cooked.has(shift(key, 1)));

export type Cell = { key: string; day: number; state: 'streak' | 'cooked' | 'none'; today: boolean; future: boolean } | null;

/** The month as weeks (Sunday first). Cells outside the month are null. */
export function monthGrid(year: number, month: number, cooked: CookedDays, todayKey: string): Cell[][] {
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= count; d++) {
    const key = keyOf(year, month, d);
    cells.push({ key, day: d, state: inStreak(cooked, key) ? 'streak' : cooked.has(key) ? 'cooked' : 'none', today: key === todayKey, future: key > todayKey });
  }
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

export const MONTHS_BACK = 6;
