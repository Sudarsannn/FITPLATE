/**
 * Dish photo candidates (dish research PROMPT_PATCH_06, SPEC-ADDENDA §10).
 *
 * Candidates come from two places in the shared folder:
 *   1. an `**Image**` block in each dish of a daily FitPlate_Dishes_*.md file
 *      (new dishes, from 16 Oct 2026), and
 *   2. dish-research/images/candidates.json (the back-fill for dishes 1–60 and
 *      any hand-picked override).
 * scripts/research/images.js verifies each candidate's licence with the source
 * site, stores an optimised copy in assets/dishes/ and records the credit.
 * This file is pure so the app's tests and the script share one parser.
 */
import { slugify } from './markdown';

export type ImageSite = 'wikimedia' | 'unsplash' | 'pexels' | 'pixabay';

export type ImageCandidate = {
  dishId: string;
  site: ImageSite | null;
  /** Commons file name (no "File:" prefix), or a direct image URL for the other sites. */
  file: string | null;
  pageUrl: string | null;
  author: string | null;
  licence: string | null;
  alternates: string[];
  /** Where the candidate came from, for the build report. */
  from: string;
};

/** Credit stored with every photo the app ships (the manifest's entries). */
export type ImageCredit = {
  title: string;
  author: string;
  licence: string;
  licenceUrl: string | null;
  pageUrl: string;
  site: ImageSite;
  /** File name in assets/dishes/. */
  file: string;
  /** The candidate this copy was made from, so a changed pick is re-fetched. */
  candidate: string;
  fetchedOn: string;
};

const SITES: [RegExp, ImageSite][] = [
  [/wikimedia|commons/i, 'wikimedia'],
  [/unsplash/i, 'unsplash'],
  [/pexels/i, 'pexels'],
  [/pixabay/i, 'pixabay'],
];

export function siteOf(text: string | null | undefined): ImageSite | null {
  if (!text) return null;
  for (const [re, site] of SITES) if (re.test(text)) return site;
  return null;
}

/**
 * Licences the app may ship: public domain, CC0, CC BY and CC BY-SA, plus the
 * Unsplash, Pexels and Pixabay site licences. NC (non-commercial) and ND
 * (no derivatives: we resize and crop) are refused, as is anything unknown.
 */
export function licenceAllowed(licence: string | null | undefined): boolean {
  if (!licence) return false;
  const l = licence.trim();
  if (/\bNC\b|non-?commercial|\bND\b|no-?deriv/i.test(l)) return false;
  return /^(cc0|public domain|pd\b|pd-|cc[ -]by(-sa)?[ -]?\d|cc[ -]by(-sa)?$|unsplash licen[cs]e|pexels licen[cs]e|pixabay (content )?licen[cs]e)/i.test(l);
}

const clean = (v: string | undefined): string | null => {
  if (v == null) return null;
  const t = v.replace(/^<|>$/g, '').replace(/^`|`$/g, '').trim();
  if (!t || /^(none|null|n\/a|not found|none found|-|—)$/i.test(t)) return null;
  return t;
};

/** Commons file name from "File:X.jpg", a /wiki/File: URL or a bare name. */
export function commonsFileName(v: string | null): string | null {
  if (!v) return null;
  let t = v.trim();
  const m = t.match(/\/wiki\/File:([^?#]+)/i);
  if (m) t = decodeURIComponent(m[1]);
  t = t.replace(/^File:/i, '').replace(/_/g, ' ').trim();
  return /\.(jpe?g|png|webp|gif|tiff?)$/i.test(t) ? t : null;
}

/**
 * Reads the `**Image**` block of one dish (PROMPT_PATCH_06): bullet lines
 * "- Source:", "- File:", "- Page:", "- Author:", "- Licence:", "- Alternates:".
 */
export function parseImageBlock(dishBody: string, dishId: string, from: string): ImageCandidate | null {
  const start = dishBody.search(/^[ \t]*\*\*Image( candidate)?\*\*/im);
  if (start < 0) return null;
  const lines = dishBody.slice(start).split('\n').slice(1);
  const fields: Record<string, string> = {};
  for (const line of lines) {
    if (!line.trim()) {
      if (Object.keys(fields).length) break;
      continue;
    }
    const m = line.match(/^\s*[-*]\s*([A-Za-z ]+?)\s*:\s*(.*)$/);
    if (!m) break;
    fields[m[1].toLowerCase()] = m[2];
  }
  const source = clean(fields.source);
  const site = siteOf(source) ?? siteOf(fields.page) ?? siteOf(fields.file);
  if (!site) return { dishId, site: null, file: null, pageUrl: null, author: null, licence: null, alternates: [], from };
  const rawFile = clean(fields.file);
  const pageUrl = clean(fields.page);
  return {
    dishId,
    site,
    file: site === 'wikimedia' ? commonsFileName(rawFile) ?? commonsFileName(pageUrl) : rawFile,
    pageUrl,
    author: clean(fields.author),
    licence: clean(fields.licence ?? fields.license),
    alternates: (clean(fields.alternates) ?? '')
      .split(/[;,]\s*(?=https?:|File:)/)
      .map((s) => s.trim())
      .filter(Boolean),
    from,
  };
}

/** Every `**Image**` block in one daily dish file, keyed like the importer ("001-poha"). */
export function parseImageCandidatesFromFile(text: string, file: string): ImageCandidate[] {
  const out: ImageCandidate[] = [];
  const parts = text.split(/^## /m).slice(1);
  for (const part of parts) {
    const head = part.split('\n')[0];
    const m = head.match(/^(\d+)\.\s+(.+?)\s*$/);
    if (!m) continue;
    const id = `${m[1].padStart(3, '0')}-${slugify(m[2])}`;
    const c = parseImageBlock(part, id, file);
    if (c) out.push(c);
  }
  return out;
}

type CandidateJson = {
  dishId: string;
  status?: string;
  source?: string | null;
  fileName?: string | null;
  imageUrl?: string | null;
  pageUrl?: string | null;
  author?: string | null;
  licence?: string | null;
  alternates?: ({ fileName?: string | null; pageUrl?: string | null } | string)[];
};

/** Entries of dish-research/images/candidates.json. */
export function parseCandidatesJson(data: unknown, from: string): ImageCandidate[] {
  const list = Array.isArray(data) ? data : Array.isArray((data as { candidates?: unknown })?.candidates) ? (data as { candidates: unknown[] }).candidates : [];
  return (list as CandidateJson[])
    .filter((c) => c && typeof c.dishId === 'string')
    .map((c) => {
      const site = c.status === 'none' ? null : siteOf(c.source) ?? siteOf(c.pageUrl);
      return {
        dishId: c.dishId,
        site,
        file: site === 'wikimedia' ? commonsFileName(c.fileName ?? null) ?? commonsFileName(c.pageUrl ?? null) : c.imageUrl ?? null,
        pageUrl: c.pageUrl ?? null,
        author: c.author ?? null,
        licence: c.licence ?? null,
        alternates: (c.alternates ?? [])
          .map((a) => (typeof a === 'string' ? a : a.pageUrl ?? (a.fileName ? `File:${a.fileName}` : '')))
          .filter(Boolean),
        from,
      };
    });
}

/**
 * One candidate per dish: a dish file's own block wins over the shared JSON
 * (it is newer research), unless the block found nothing and the JSON did.
 */
export function pickCandidates(fromFiles: ImageCandidate[], fromJson: ImageCandidate[]): Map<string, ImageCandidate> {
  const map = new Map<string, ImageCandidate>();
  for (const c of fromJson) map.set(c.dishId, c);
  for (const c of fromFiles) {
    const prev = map.get(c.dishId);
    if (c.site || !prev?.site) map.set(c.dishId, c);
  }
  return map;
}

/** Stable key of a candidate, stored with the credit so a changed pick is re-fetched. */
export function candidateKey(c: Pick<ImageCandidate, 'site' | 'file'>): string {
  return `${c.site}:${c.file}`;
}

/** "Photo: Jane Doe, CC BY-SA 4.0, via Wikimedia Commons" */
export function creditLine(c: Pick<ImageCredit, 'author' | 'licence' | 'site'>): string {
  const via = { wikimedia: 'Wikimedia Commons', unsplash: 'Unsplash', pexels: 'Pexels', pixabay: 'Pixabay' }[c.site];
  return `Photo: ${c.author}, ${c.licence}, via ${via}`;
}
