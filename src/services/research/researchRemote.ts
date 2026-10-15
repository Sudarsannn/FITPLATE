import type { ResearchSnapshot } from '../../data/research';
import { compareResearchVersions } from '../data/researchVersion';
import type { KeyValueStore } from '../storage/kv';

/**
 * Priority plan P2-c: the shared, read-only research library on the server.
 * Layout (written by scripts/server/import-research.js):
 *   research/meta                      { version, counts, importedAt }
 *   research/extras                    { aliases, links }
 *   research/{kind}/items/{id}         one research item per document
 */
export const RESEARCH_KINDS = ['dishes', 'ingredients', 'nutrients', 'hydration', 'guidance', 'conditions', 'exercises', 'fitnessGuides'] as const;
export type ResearchKind = (typeof RESEARCH_KINDS)[number];

export type ResearchMeta = { version: string; counts: Partial<Record<ResearchKind, number>>; importedAt?: string };

/** What the loader needs from the server. Tests pass a fake. */
export type ResearchSource = {
  getMeta(): Promise<ResearchMeta | null>;
  getKind(kind: ResearchKind): Promise<unknown[]>;
  getExtras(): Promise<{ aliases: Record<string, string>; links: ResearchSnapshot['links'] } | null>;
};

export const RESEARCH_CACHE_KEY = 'fitplate.research.cache.v1';

export type ResearchSyncResult = 'bundle' | 'cache' | 'server' | 'offline' | 'incomplete';

/**
 * Use the newest research available: the device cache first (works offline),
 * then the server when its version is newer than what is in use. The bundled
 * copy stays in place whenever the server is unreachable or incomplete.
 */
export async function syncResearch(opts: {
  source: ResearchSource | null;
  /** Device cache (native). Null on web, where Firestore's own IndexedDB cache already keeps the reads. */
  cache: KeyValueStore | null;
  currentVersion: string;
  apply: (snap: ResearchSnapshot) => void;
}): Promise<ResearchSyncResult> {
  let inUse = opts.currentVersion;
  let result: ResearchSyncResult = 'bundle';

  if (opts.cache) {
    try {
      const raw = await opts.cache.getItem(RESEARCH_CACHE_KEY);
      const cached = raw ? (JSON.parse(raw) as ResearchSnapshot) : null;
      if (cached?.version && compareResearchVersions(cached.version, inUse) > 0) {
        opts.apply(cached);
        inUse = cached.version;
        result = 'cache';
      }
    } catch {
      // A broken cache is ignored; the next server load rewrites it.
    }
  }

  if (!opts.source) return result;
  let meta: ResearchMeta | null;
  try {
    meta = await opts.source.getMeta();
  } catch {
    return result === 'bundle' ? 'offline' : result;
  }
  if (!meta?.version || compareResearchVersions(meta.version, inUse) <= 0) return result;

  try {
    const lists = await Promise.all(RESEARCH_KINDS.map((k) => opts.source!.getKind(k)));
    const extras = await opts.source.getExtras();
    const byKind = Object.fromEntries(RESEARCH_KINDS.map((k, i) => [k, lists[i]])) as Record<ResearchKind, unknown[]>;
    // An import that stopped half-way must not replace good data.
    for (const k of RESEARCH_KINDS) {
      const expected = meta.counts[k];
      if (expected != null && byKind[k].length !== expected) return 'incomplete';
    }
    if (byKind.dishes.length === 0) return 'incomplete';
    const snap = {
      version: meta.version,
      ...byKind,
      aliases: extras?.aliases ?? {},
      links: extras?.links,
    } as unknown as ResearchSnapshot;
    opts.apply(snap);
    if (opts.cache) await opts.cache.setItem(RESEARCH_CACHE_KEY, JSON.stringify(snap)).catch(() => {});
    return 'server';
  } catch {
    return result === 'bundle' ? 'offline' : result;
  }
}
