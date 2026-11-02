import type { Dish } from '../models/research';
import { totalMinutes } from './dishLibrary';

/**
 * Day 15 innovation (flag `plainSearch`): type it the way you would say it, e.g. "15 min no onion veg".
 * Only clear phrases are lifted out of the text (a time limit, a diet word, "no/without X"); everything
 * else stays as the ordinary search words. Nothing is guessed: no phrase, no change.
 */
export type PlainQuery = {
  rest: string;
  maxMinutes: number | null;
  diet: 'veg' | 'non-veg' | 'egg' | null;
  exclude: string[];
  /** Short labels for what was understood, shown under the search box. */
  understood: string[];
};

const WORD = "[a-z][a-z'-]*";

export function parsePlainQuery(raw: string): PlainQuery {
  let q = ` ${raw.toLowerCase().trim()} `;
  const understood: string[] = [];
  let maxMinutes: number | null = null;
  let diet: PlainQuery['diet'] = null;
  const exclude: string[] = [];

  const time = /\b(?:under|within|in|less than|below|<)?\s*(\d{1,3})\s*(?:min(?:ute)?s?|mins)\b/.exec(q);
  if (time) {
    maxMinutes = Number(time[1]);
    understood.push(`Under ${maxMinutes} min`);
    q = q.replace(time[0], ' ');
  }
  const non = /\b(non[- ]?veg(?:etarian)?)\b/.exec(q);
  if (non) {
    diet = 'non-veg';
    understood.push('Non-veg');
    q = q.replace(non[0], ' ');
  } else {
    const veg = /\b(veg(?:etarian)?|eggetarian)\b/.exec(q);
    if (veg) {
      diet = veg[1].startsWith('egg') ? 'egg' : 'veg';
      understood.push(diet === 'egg' ? 'Egg' : 'Veg');
      q = q.replace(veg[0], ' ');
    }
  }
  const no = new RegExp(`\\b(?:no|without)\\s+(${WORD}(?:\\s*(?:,|and|&|no)\\s*${WORD})*)`, 'g');
  q = q.replace(no, (_m, list: string) => {
    for (const w of list.split(/\s*(?:,|and|&|no)\s*/).filter(Boolean)) {
      exclude.push(w);
      understood.push(`No ${w}`);
    }
    return ' ';
  });
  return { rest: q.replace(/\s+/g, ' ').trim(), maxMinutes, diet, exclude, understood };
}

const hasWord = (text: string, w: string) => new RegExp(`\\b${w.replace(/[^a-z-]/g, '')}s?\\b`, 'i').test(text);

/** Keep the dishes that pass what was understood. The plain words left over still go through the normal search. */
export function passesPlain(d: Dish, p: PlainQuery): boolean {
  if (p.maxMinutes != null) {
    const t = totalMinutes(d);
    if (t == null || t > p.maxMinutes) return false;
  }
  if (p.diet && d.dietType !== p.diet) return false;
  return !p.exclude.some((w) => d.ingredients.some((i) => hasWord(i.name, w)));
}
