import { handleAi } from '../server/ai/handler.js';

/**
 * Cloudflare Worker entry. Only /api/* reaches this code (see wrangler.jsonc
 * run_worker_first); everything else is the static web export.
 */
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/ai/')) return handleAi(request, env);
    if (pathname.startsWith('/api/')) return new Response(JSON.stringify({ error: 'not-found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    return env.ASSETS.fetch(request);
  },
};
