import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

import type { ResearchSnapshot } from '../data/research';
import { BUNDLED_RESEARCH_VERSION, researchDishes } from '../data/research';
import { compareResearchVersions, researchVersion } from '../services/data/researchVersion';
import { RESEARCH_CACHE_KEY, RESEARCH_KINDS, syncResearch, type ResearchSource } from '../services/research/researchRemote';
import { APPEND_ONLY } from '../services/storage/schemas';
import { memoryKeyValueStore } from '../services/storage/kv';

const dish = (id: string) => ({ id, name: id });

function source(version: string, dishes = [dish('a'), dish('b')], counts?: Record<string, number>): ResearchSource & { kindsRead: number } {
  const s = {
    kindsRead: 0,
    getMeta: async () => ({ version, counts: counts ?? { dishes: dishes.length } }),
    getKind: async (k: string) => {
      s.kindsRead += 1;
      return k === 'dishes' ? dishes : [];
    },
    getExtras: async () => ({ aliases: { x: 'y' }, links: {} as ResearchSnapshot['links'] }),
  };
  return s;
}

describe('research version', () => {
  it('names the bundle by its newest research date and entry count', () => {
    expect(researchVersion({ schema: 'x', dishes: { a: [{ date: '2026-10-04' }], b: [{ date: '2026-10-09' }, { date: '2026-10-05' }] } })).toBe('2026-10-09#3');
    expect(BUNDLED_RESEARCH_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}#\d+$/);
  });

  it('orders versions by date, then by count', () => {
    expect(compareResearchVersions('2026-10-15#10', '2026-10-14#99')).toBeGreaterThan(0);
    expect(compareResearchVersions('2026-10-15#10', '2026-10-15#12')).toBeLessThan(0);
    expect(compareResearchVersions('2026-10-15#10', '2026-10-15#10')).toBe(0);
  });
});

describe('syncResearch', () => {
  it('keeps the bundle when the server is not newer', async () => {
    const applied: ResearchSnapshot[] = [];
    const src = source('2026-10-01#1');
    expect(await syncResearch({ source: src, cache: null, currentVersion: '2026-10-15#5', apply: (s) => applied.push(s) })).toBe('bundle');
    expect(applied).toHaveLength(0);
    expect(src.kindsRead).toBe(0);
  });

  it('uses a newer server library and caches it on the device', async () => {
    const kv = memoryKeyValueStore();
    const applied: ResearchSnapshot[] = [];
    expect(await syncResearch({ source: source('2026-10-20#9'), cache: kv, currentVersion: '2026-10-15#5', apply: (s) => applied.push(s) })).toBe('server');
    expect(applied[0].version).toBe('2026-10-20#9');
    expect(applied[0].dishes).toHaveLength(2);
    expect(JSON.parse((await kv.getItem(RESEARCH_CACHE_KEY))!).version).toBe('2026-10-20#9');
  });

  it('applies the device cache offline', async () => {
    const kv = memoryKeyValueStore();
    await kv.setItem(RESEARCH_CACHE_KEY, JSON.stringify({ version: '2026-10-20#9', dishes: [dish('c')] }));
    const applied: ResearchSnapshot[] = [];
    const offline: ResearchSource = { getMeta: async () => Promise.reject(new Error('offline')), getKind: async () => [], getExtras: async () => null };
    expect(await syncResearch({ source: offline, cache: kv, currentVersion: '2026-10-15#5', apply: (s) => applied.push(s) })).toBe('cache');
    expect(applied[0].dishes[0].id).toBe('c');
  });

  it('never applies a half-finished import', async () => {
    const applied: ResearchSnapshot[] = [];
    const src = source('2026-10-20#9', [dish('a')], { dishes: 30 });
    expect(await syncResearch({ source: src, cache: null, currentVersion: '2026-10-15#5', apply: (s) => applied.push(s) })).toBe('incomplete');
    expect(applied).toHaveLength(0);
  });

  it('reads every research kind', async () => {
    const src = source('2026-10-20#9');
    await syncResearch({ source: src, cache: null, currentVersion: '2026-10-15#5', apply: () => {} });
    expect(src.kindsRead).toBe(RESEARCH_KINDS.length);
  });

  it('reports offline when nothing could be read', async () => {
    expect(await syncResearch({ source: null, cache: null, currentVersion: 'x', apply: () => {} })).toBe('bundle');
    const down: ResearchSource = { getMeta: async () => Promise.reject(new Error('down')), getKind: async () => [], getExtras: async () => null };
    expect(await syncResearch({ source: down, cache: null, currentVersion: 'x', apply: () => {} })).toBe('offline');
  });
});

describe('server copy of the bundle', () => {
  it('ships research dishes to import', () => {
    expect(researchDishes.length).toBeGreaterThan(0);
  });

  it('keeps the Firestore append-only list in step with the app', () => {
    const rules = fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8');
    const m = rules.match(/collection in \[([^\]]+)\]/);
    const listed = m ? m[1].split(',').map((x) => x.trim().replace(/'/g, '')) : [];
    expect([...listed].sort()).toEqual([...APPEND_ONLY].sort());
  });
});
