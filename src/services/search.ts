/**
 * Shared search, filter and sort rules (SPEC-ADDENDA §9). Pure functions, so
 * every library (dishes on Day 6, nutrients on Day 18, exercises on Day 21, the
 * Track tab on Day 29) ranks and filters the same way.
 *
 * - Text search matches names, aliases (Indian names), tags and ingredients,
 *   and tolerates small spelling slips ("brhiyani" → biryani).
 * - Filters are groups of multi-select chips. Inside a group any chip may
 *   match ("Breakfast" or "Lunch"); across groups every group must match.
 *   An "exclude" group (allergens) drops items that have any chosen chip.
 */

/** What the search engine reads from an item. Each library builds one per item. */
export type SearchDoc = {
  id: string;
  name: string;
  /** Other names, e.g. "kanda" for onion or "Chana Masala" for Chole. */
  aliases?: string[];
  tags?: string[];
  /** Ingredient names, muscle groups or anything else worth matching weakly. */
  extra?: string[];
};

/** Lower-case, strip accents and punctuation, collapse spaces. */
export function normalise(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function words(text: string): string[] {
  const n = normalise(text);
  return n ? n.split(' ') : [];
}

/**
 * Optimal string alignment distance (Levenshtein plus swapping two neighbours),
 * stopped early once it is clearly above `max`.
 */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) rows.push([i]);
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, rows[i - 2][j - 2] + 1);
      rows[i][j] = v;
      best = Math.min(best, v);
    }
    if (best > max) return max + 1;
  }
  return rows[a.length][b.length];
}

/** How many slips a typed word may have: none for short words, more for long ones. */
export function allowedSlips(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 5) return 1;
  return 2;
}

/**
 * A rough sound-alike form for Indian dish and ingredient names, which are
 * spelt many ways in English: "h" after a consonant is dropped (brhiyani,
 * dhal), "ee"/"oo" become "i"/"u" (paneer → panir), doubled letters collapse,
 * and "w" becomes "v" (kawa → kava).
 */
export function soundAlike(word: string): string {
  return word
    .replace(/([bcdgjkprt])h/g, '$1')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/w/g, 'v')
    .replace(/(.)\1+/g, '$1');
}

/** 1 exact, 0.85 prefix, 0.6 inside the word, 0.5 within the allowed slips, else 0. */
export function wordMatch(query: string, target: string): number {
  if (target === query) return 1;
  if (target.startsWith(query)) return 0.85;
  if (query.length >= 3 && target.includes(query)) return 0.6;
  const slips = allowedSlips(query);
  if (slips > 0) {
    if (editDistance(query, target, slips) <= slips) return 0.5;
    if (editDistance(soundAlike(query), soundAlike(target), slips) <= slips) return 0.5;
  }
  return 0;
}

function bestWord(query: string, targetWords: string[]): number {
  let best = 0;
  for (const t of targetWords) {
    const s = wordMatch(query, t);
    if (s > best) best = s;
    if (best === 1) break;
  }
  return best;
}

/** Weights: a hit on the name counts most, then aliases, tags, the rest. */
const FIELD_WEIGHT = { name: 10, aliases: 8, tags: 5, extra: 3 } as const;

/**
 * Relevance of one item for a query; 0 means "not a match". Every query word
 * must match somewhere, so "paneer rice" doesn't return every rice dish.
 */
export function scoreDoc(doc: SearchDoc, query: string): number {
  const q = words(query);
  if (q.length === 0) return 1;
  const fields = {
    name: words(doc.name),
    aliases: (doc.aliases ?? []).flatMap(words),
    tags: (doc.tags ?? []).flatMap(words),
    extra: (doc.extra ?? []).flatMap(words),
  };
  let total = 0;
  for (const w of q) {
    let best = 0;
    for (const key of Object.keys(FIELD_WEIGHT) as (keyof typeof FIELD_WEIGHT)[]) {
      const s = bestWord(w, fields[key]) * FIELD_WEIGHT[key];
      if (s > best) best = s;
    }
    if (best === 0) return 0;
    total += best;
  }
  // The whole query as a phrase at the start of the name ranks first.
  if (normalise(doc.name).startsWith(normalise(query))) total += 5;
  return total;
}

// ------------------------------------------------------------------ filters

export type FilterOption<T> = { id: string; label: string; test: (item: T) => boolean };

export type FilterGroup<T> = {
  id: string;
  label: string;
  /** "any": keep items matching any chosen chip. "exclude": drop items matching any chosen chip. */
  mode: 'any' | 'exclude';
  options: FilterOption<T>[];
};

/** Chosen chip ids per group id. Missing or empty means the group is off. */
export type Selection = Record<string, string[]>;

export function activeCount(selection: Selection): number {
  return Object.values(selection).reduce((n, ids) => n + ids.length, 0);
}

export function toggle(selection: Selection, groupId: string, optionId: string): Selection {
  const current = selection[groupId] ?? [];
  const next = current.includes(optionId) ? current.filter((x) => x !== optionId) : [...current, optionId];
  return { ...selection, [groupId]: next };
}

export function passesFilters<T>(item: T, groups: FilterGroup<T>[], selection: Selection): boolean {
  for (const g of groups) {
    const chosen = selection[g.id] ?? [];
    if (chosen.length === 0) continue;
    const options = g.options.filter((o) => chosen.includes(o.id));
    const hit = options.some((o) => o.test(item));
    if (g.mode === 'any' && !hit) return false;
    if (g.mode === 'exclude' && hit) return false;
  }
  return true;
}

/** How many items each chip would leave, given the other groups' choices (shown on the chips). */
export function optionCounts<T>(items: readonly T[], groups: FilterGroup<T>[], selection: Selection): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const g of groups) {
    const others = { ...selection, [g.id]: [] };
    const base = items.filter((i) => passesFilters(i, groups, others));
    for (const o of g.options) {
      const key = `${g.id}:${o.id}`;
      counts[key] = g.mode === 'any' ? base.filter(o.test).length : base.filter((i) => !o.test(i)).length;
    }
  }
  return counts;
}

// ------------------------------------------------------------------ sort

export type SortOption<T> = {
  id: string;
  label: string;
  /** Number to sort by; null sorts last whatever the direction. */
  value: (item: T) => number | null;
  direction: 'asc' | 'desc';
};

export function sortItems<T>(items: readonly T[], sort: SortOption<T>, tieBreak: (a: T, b: T) => number): T[] {
  return [...items].sort((a, b) => {
    const va = sort.value(a);
    const vb = sort.value(b);
    if (va == null && vb == null) return tieBreak(a, b);
    if (va == null) return 1;
    if (vb == null) return -1;
    if (va !== vb) return sort.direction === 'asc' ? va - vb : vb - va;
    return tieBreak(a, b);
  });
}

// ------------------------------------------------------------------ all together

export type SearchResult<T> = { item: T; score: number };

/**
 * Search, then filter, then sort. With a query and the "relevance" sort,
 * the best text matches come first; otherwise the chosen sort decides.
 */
export function runSearch<T>(
  items: readonly T[],
  opts: {
    toDoc: (item: T) => SearchDoc;
    query: string;
    groups: FilterGroup<T>[];
    selection: Selection;
    sort: SortOption<T> | 'relevance';
    tieBreak: (a: T, b: T) => number;
  },
): SearchResult<T>[] {
  const scored: SearchResult<T>[] = [];
  for (const item of items) {
    if (!passesFilters(item, opts.groups, opts.selection)) continue;
    const score = scoreDoc(opts.toDoc(item), opts.query);
    if (score > 0) scored.push({ item, score });
  }
  if (opts.sort === 'relevance') {
    return scored.sort((a, b) => b.score - a.score || opts.tieBreak(a.item, b.item));
  }
  const order = sortItems(
    scored.map((s) => s.item),
    opts.sort,
    opts.tieBreak,
  );
  const byItem = new Map(scored.map((s) => [s.item, s.score]));
  return order.map((item) => ({ item, score: byItem.get(item) ?? 0 }));
}
