import { describe, expect, it } from '@jest/globals';

import { callGemini, handleAi, slugify } from '../../../server/ai/handler';

const gem = (text: string, extra: Record<string, unknown> = {}) => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] }, ...extra }] }) });
const post = (path: string, body: unknown) => new Request(`https://x.test${path}`, { method: 'POST', body: JSON.stringify(body) });

describe('AI server handler', () => {
  it('says whether it is configured, never returning secrets', async () => {
    const res = await handleAi(new Request('https://x.test/api/ai/status'), { GEMINI_API_KEY: 'secret' });
    const body = await res.json();
    expect(body).toMatchObject({ configured: true, queue: false });
    expect(JSON.stringify(body)).not.toContain('secret');
  });

  it('answers 503 not-configured without a key', async () => {
    const res = await handleAi(post('/api/ai/research', { description: 'dal', canonicalName: 'Dal' }), {});
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('not-configured');
  });

  it('research uses Google Search grounding and returns sources', async () => {
    let sent: any;
    const fetchImpl = async (_u: string, init: any) => {
      sent = JSON.parse(init.body);
      return gem('notes', { groundingMetadata: { groundingChunks: [{ web: { uri: 'https://a.test', title: 'A' } }, { web: { uri: 'https://a.test', title: 'A' } }], webSearchQueries: ['q'] } });
    };
    const res = await handleAi(post('/api/ai/research', { description: 'dal', canonicalName: 'Dal', mode: 'new' }), { GEMINI_API_KEY: 'k' }, fetchImpl as any);
    const body = await res.json();
    expect(sent.tools).toEqual([{ google_search: {} }]);
    expect(body.sources).toEqual([{ title: 'A', url: 'https://a.test' }]);
  });

  it('plan drops a base dish that is not in the catalogue', async () => {
    const fetchImpl = async () => gem(JSON.stringify({ mode: 'variation', baseDishId: 'made-up', canonicalName: 'X', summary: '', changes: [], searchQueries: [] }));
    const res = await handleAi(post('/api/ai/plan', { description: 'x dish', catalog: [{ id: '001-poha', name: 'Poha' }] }), { GEMINI_API_KEY: 'k' }, fetchImpl as any);
    expect((await res.json()).plan).toMatchObject({ mode: 'new', baseDishId: null });
  });

  it('falls back to the next model when one is out of allowance', async () => {
    const tried: string[] = [];
    const fetchImpl = async (u: string) => {
      tried.push(u.split('/models/')[1].split(':')[0]);
      return tried.length === 1 ? ({ ok: false, status: 429, json: async () => ({}) } as any) : gem('ok');
    };
    const r = await callGemini({ env: { GEMINI_API_KEY: 'k' }, fetchImpl, system: 's', prompt: 'p', schema: undefined, search: false });
    expect(tried).toEqual(['gemini-2.5-flash', 'gemini-2.5-flash-lite']);
    expect(r.model).toBe('gemini-2.5-flash-lite');
  });

  it('reports quota when every model is exhausted', async () => {
    const fetchImpl = async () => ({ ok: false, status: 429, json: async () => ({}) }) as any;
    const res = await handleAi(post('/api/ai/research', { description: 'dal', canonicalName: 'Dal' }), { GEMINI_API_KEY: 'k' }, fetchImpl);
    expect(res.status).toBe(429);
  });

  it('queue: skips quietly with no token, and writes one file per dish with a request count', async () => {
    const dish = { name: 'Paneer Lababdar', needsMoreResearch: ['x'] };
    const none = await handleAi(post('/api/ai/submit', { dish }), { GEMINI_API_KEY: 'k' });
    expect(await none.json()).toMatchObject({ saved: false });

    const files = new Map<string, { sha: string; content: string }>();
    const put: any[] = [];
    const fetchImpl = async (u: string, init: any = {}) => {
      const url = new URL(u);
      const p = url.pathname.replace('/repos/sudarsannn/fitplate', '');
      const json = (b: unknown, status = 200) => ({ ok: status < 400, status, json: async () => b }) as any;
      if (p === '/git/ref/heads/ai-dish-queue') return json({}, 404);
      if (p === '') return json({ default_branch: 'main' });
      if (p === '/git/ref/heads/main') return json({ object: { sha: 'abc' } });
      if (p === '/git/refs') return json({}, 201);
      if (p.startsWith('/contents/')) {
        if (init.method === 'PUT') {
          const b = JSON.parse(init.body);
          put.push(b);
          files.set(p, { sha: `sha${put.length}`, content: b.content });
          return json({}, 201);
        }
        const f = files.get(p);
        return f ? json(f) : json({}, 404);
      }
      return json({}, 500);
    };
    const env = { GEMINI_API_KEY: 'k', GITHUB_TOKEN: 't' };
    const a = await (await handleAi(post('/api/ai/submit', { dish, description: 'rich gravy', mode: 'new' }), env, fetchImpl as any)).json();
    expect(a).toMatchObject({ saved: true, slug: 'paneer-lababdar', requests: 1 });
    const b = await (await handleAi(post('/api/ai/submit', { dish, description: 'dhaba style', mode: 'new' }), env, fetchImpl as any)).json();
    expect(b.requests).toBe(2);
    expect(put[1].sha).toBe('sha1');
    expect(put[1].branch).toBe('ai-dish-queue');
  });

  it('slugifies names', () => {
    expect(slugify('Paneer Lababdar (rich)!')).toBe('paneer-lababdar-rich');
  });
});
