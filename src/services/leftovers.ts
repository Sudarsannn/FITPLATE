import type { Dish } from '../models/research';
import type { Leftover } from '../models/prefs';

/**
 * Day 14: storage reminders. After cooking, "Put the leftovers away" records the
 * dish with a use-by date taken from the dish's own researched storage note
 * (the fridge days it names; 2 days when it names none). Today then shows what
 * to use up, with the researched remix idea. Pure, so Jest can test it.
 */
const DAY = 86_400_000;

/** Fridge days from the storage note: the shorter end of "2-3 days", looked for in a "fridge" sentence first. Whole-day, 1 to 7. */
export function fridgeDays(storage: string | null | undefined): number {
  if (!storage) return 2;
  const re = /(\d+)(?:\s*(?:-|–|to)\s*(\d+))?\s*days?/gi;
  const found: { n: number; near: boolean }[] = [];
  for (let m = re.exec(storage); m; m = re.exec(storage)) {
    const from = Math.max(storage.lastIndexOf('.', m.index), storage.lastIndexOf(';', m.index), storage.lastIndexOf('\n', m.index)) + 1;
    const to = storage.slice(m.index).search(/[.;\n]/);
    const clause = storage.slice(from, to < 0 ? undefined : m.index + to);
    found.push({ n: Number(m[1]), near: /fridge|refrigerat/i.test(clause) });
  }
  const pick = found.find((f) => f.near) ?? found[0];
  if (!pick) return /same day|eat (it )?fresh|best (eaten )?fresh/i.test(storage) ? 1 : 2;
  return Math.min(7, Math.max(1, pick.n));
}

const startOfDay = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export function addLeftover(list: Leftover[], dish: Pick<Dish, 'id' | 'name' | 'storage' | 'leftoverRemix'>, now = Date.now()): Leftover[] {
  const next: Leftover = { dishId: dish.id, name: dish.name, storedAt: now, useByDays: fridgeDays(dish.storage), remix: dish.leftoverRemix ?? null };
  return [next, ...list.filter((l) => l.dishId !== dish.id)];
}

export const removeLeftover = (list: Leftover[], dishId: string): Leftover[] => list.filter((l) => l.dishId !== dishId);

export type LeftoverStatus = Leftover & { daysLeft: number; state: 'ok' | 'today' | 'past' };

/** Days left counted in calendar days: 0 is "use today", below 0 is past its date. Items more than 2 days past are dropped. Soonest first. */
export function leftoverStatus(list: Leftover[], now = Date.now()): LeftoverStatus[] {
  return list
    .map((l) => {
      const daysLeft = Math.round((startOfDay(l.storedAt) + l.useByDays * DAY - startOfDay(now)) / DAY);
      return { ...l, daysLeft, state: daysLeft < 0 ? ('past' as const) : daysLeft === 0 ? ('today' as const) : ('ok' as const) };
    })
    .filter((l) => l.daysLeft >= -2)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}
