/**
 * Small, pure helpers for reading the research markdown files. The research
 * routines write by hand-ish templates that drift from day to day, so every
 * helper tolerates bold markers, "about"/"~" prefixes and en dashes, and
 * returns null when a value is not there rather than guessing.
 */

export type Section = { n: number | null; title: string; body: string };

/** Splits text on headings of one level ("## " or "### "), keeping each heading's body. */
export function splitHeadings(text: string, level: 2 | 3): Section[] {
  const marker = '#'.repeat(level) + ' ';
  const out: Section[] = [];
  let current: Section | null = null;
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith(marker)) {
      if (current) out.push(current);
      const heading = line.slice(marker.length).trim();
      const m = /^(\d+)\.\s+(.*)$/.exec(heading);
      current = m ? { n: Number(m[1]), title: m[2].trim(), body: '' } : { n: null, title: heading, body: '' };
    } else if (current) {
      current.body += line + '\n';
    }
  }
  if (current) out.push(current);
  return out;
}

/** Removes markdown emphasis so label regexes don't trip on "**". */
export function plain(text: string): string {
  return text.replace(/\*\*/g, '').replace(/(^|\s)_(\S[^_]*)_/g, '$1$2');
}

/** Parses "1,180" or "4.5" to a number; null for anything else. */
export function num(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const n = Number(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Rows of every markdown table in the text, as trimmed cells; header and divider rows are dropped. */
export function tableRows(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === '')) continue;
    // A header row is the one directly above a divider row.
    const next = (lines[i + 1] ?? '').trim();
    if (/^\|\s*:?-{2,}/.test(next)) continue;
    rows.push(cells);
  }
  return rows;
}

/** Top-level bullet items ("- " at column 0), each with its indented continuation lines joined. */
export function bullets(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    if (/^- /.test(line)) out.push(line.slice(2).trim());
    else if (/^\s+- /.test(line) && out.length > 0) out[out.length - 1] += ' ' + line.trim().slice(2).trim();
  }
  return out;
}

/**
 * The value of a "Label: value" bullet, matching labels case-insensitively
 * and ignoring bold markers. Indented sub-bullets are appended.
 */
export function labelled(text: string, labels: string[]): string | null {
  for (const item of bullets(text)) {
    const p = plain(item);
    for (const label of labels) {
      const re = new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b[^:]*?:\\s*', 'i');
      const m = re.exec(p);
      if (m) {
        const value = p.slice(m[0].length).trim();
        return value.length > 0 ? value : null;
      }
    }
  }
  return null;
}

/** First duration in a phrase, in minutes: "1 hr 40 min" → 100, "about 20 min" → 20, "8–10 min" → 8. */
export function minutes(text: string | null): number | null {
  if (!text) return null;
  const hm = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b\s*(?:(\d+)\s*min)?/i.exec(text);
  const m = /(\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*min/i.exec(text);
  if (hm && (!m || hm.index <= m.index)) return Math.round(Number(hm[1]) * 60 + (hm[2] ? Number(hm[2]) : 0));
  return m ? Math.round(Number(m[1])) : null;
}

/** Step timer in seconds from "Time: 20–30 sec" or "1.5–2 min"; the lower bound, so a timer never overshoots. */
export function seconds(text: string | null): number | null {
  if (!text) return null;
  const m = /(\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(sec|s|min|minutes?|h|hr|hours?)\b/i.exec(text);
  if (!m) return null;
  const v = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith('s')) return Math.round(v);
  if (unit.startsWith('h')) return Math.round(v * 3600);
  return Math.round(v * 60);
}

/** Lower-case kebab-case id from an English name. */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Splits off the bracketed Indian names, wherever they sit:
 * "Peanuts, raw (moongphali / shengdana)" and "Peanuts (moongphali), raw" both
 * give { english: "Peanuts, raw", aliases: ["moongphali", "shengdana"] }.
 */
export function splitName(name: string): { english: string; aliases: string[] } {
  const aliases: string[] = [];
  const english = name
    .replace(/\(([^)]*)\)/g, (_, inner: string) => {
      for (const a of inner.split(/\s*[/,;]\s*|\s+or\s+/)) if (a.trim()) aliases.push(a.trim());
      return ' ';
    })
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/,$/, '');
  return { english, aliases };
}

/** First "₹A–B" range in the text. */
export function rupeeRange(text: string): { min: number; max: number } | null {
  const m = /₹\s*([\d,]+(?:\.\d+)?)\s*(?:[–-]|to)\s*₹?\s*([\d,]+(?:\.\d+)?)/.exec(text);
  if (!m) return null;
  const min = num(m[1]);
  const max = num(m[2]);
  if (min == null || max == null || min > max) return null;
  return { min, max };
}

/** First single rupee amount in the text ("about ₹130", "~₹330"). */
export function rupee(text: string): number | null {
  const m = /₹\s*([\d,]+(?:\.\d+)?)/.exec(text);
  return m ? num(m[1]) : null;
}
