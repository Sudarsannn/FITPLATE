#!/usr/bin/env node
/**
 * The local FitPlate server (priority plan P3). Runs on Sudarsan's Mac next to
 * the web build and talks to Swiggy's official MCP servers:
 *   Instamart  https://mcp.swiggy.com/im
 *   Food       https://mcp.swiggy.com/food
 *
 *   npm run server                       # real orders OFF (default)
 *   CHECKOUT_LIVE=true npm run server    # allow "Place order" to place a REAL order
 *
 * Why a server: Swiggy's login (OAuth 2.1 + PKCE, phone number + OTP) must
 * not live in the app, and Swiggy only accepts http://localhost return
 * addresses until FitPlate is approved. Tokens stay in this process's memory
 * and are gone when it stops. Request and response bodies are never logged.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const require = createRequire(import.meta.url);
const { ALLOWED, ORDER_TOOLS, adaptArgs, errorCode, parseToolResult, safeReturnUrl } = require('./lib/tools.cjs');

const PORT = Number(process.env.FITPLATE_SERVER_PORT || 8787);
const CHECKOUT_LIVE = process.env.CHECKOUT_LIVE === 'true';
// Swiggy whitelists http://localhost and http://localhost/callback (loopback; any port per RFC 8252).
const REDIRECT_URI = process.env.SWIGGY_REDIRECT_URI || `http://localhost:${PORT}/callback`;
const SERVERS = { im: 'https://mcp.swiggy.com/im', food: 'https://mcp.swiggy.com/food' };
const HERE = path.dirname(fileURLToPath(import.meta.url));

/** One Swiggy MCP connection, with its login held in memory only. */
function createConnection(id) {
  const auth = { clientInformation: undefined, tokens: undefined, codeVerifier: undefined, authUrl: undefined, state: undefined };
  const provider = {
    get redirectUrl() {
      return REDIRECT_URI;
    },
    get clientMetadata() {
      return {
        client_name: 'FitPlate (local prototype)',
        redirect_uris: [REDIRECT_URI],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
      };
    },
    state: () => auth.state ?? '',
    clientInformation: () => auth.clientInformation,
    saveClientInformation: (info) => {
      auth.clientInformation = info;
    },
    tokens: () => auth.tokens,
    saveTokens: (t) => {
      auth.tokens = t;
    },
    redirectToAuthorization: (url) => {
      auth.authUrl = url.toString();
    },
    saveCodeVerifier: (v) => {
      auth.codeVerifier = v;
    },
    codeVerifier: () => {
      if (!auth.codeVerifier) throw new Error('No code verifier saved');
      return auth.codeVerifier;
    },
    invalidateCredentials: (scope) => {
      if (scope === 'all' || scope === 'tokens') auth.tokens = undefined;
      if (scope === 'all' || scope === 'client') auth.clientInformation = undefined;
      if (scope === 'all' || scope === 'verifier') auth.codeVerifier = undefined;
    },
  };

  let client = null;
  let tools = null; // name → inputSchema

  async function open() {
    const transport = new StreamableHTTPClientTransport(new URL(SERVERS[id]), { authProvider: provider });
    const c = new Client({ name: 'fitplate', version: '1.0.0' });
    await c.connect(transport);
    client = c;
    const listed = await c.listTools();
    tools = new Map(listed.tools.map((t) => [t.name, t.inputSchema]));
    return c;
  }

  return {
    id,
    auth,
    connected: () => Boolean(client && auth.tokens),
    /** Start the login. Resolves to the Swiggy URL to send the browser to, or null when already connected. */
    async begin(state) {
      auth.state = state;
      auth.authUrl = undefined;
      try {
        await open();
        return null;
      } catch (e) {
        if (e instanceof UnauthorizedError || auth.authUrl) return auth.authUrl ?? null;
        throw e;
      }
    },
    async finish(code) {
      const transport = new StreamableHTTPClientTransport(new URL(SERVERS[id]), { authProvider: provider });
      await transport.finishAuth(code);
      await open();
    },
    async tools() {
      if (!client) await open();
      return tools;
    },
    async call(tool, args) {
      if (!client) await open();
      const schema = tools && tools.get(tool);
      if (tools && !schema) {
        const e = new Error(`Swiggy's ${id} server has no tool called ${tool}.`);
        e.code = 'UNSUPPORTED';
        throw e;
      }
      const { args: adapted, missing } = adaptArgs(args, schema);
      if (missing.length) {
        const e = new Error(`${tool} needs ${missing.join(', ')}.`);
        e.code = 'OTHER';
        throw e;
      }
      const result = await client.callTool({ name: tool, arguments: adapted });
      const data = parseToolResult(result);
      if (result.isError) {
        const e = new Error(typeof data?.text === 'string' ? data.text.slice(0, 200) : `${tool} failed`);
        e.data = data;
        throw e;
      }
      return data;
    },
    async logout() {
      try {
        await client?.close();
      } catch {
        // ignore
      }
      client = null;
      tools = null;
      provider.invalidateCredentials('all');
    },
  };
}

const connections = { im: createConnection('im'), food: createConnection('food') };
const pendingLogins = new Map(); // state → { server, returnTo, at }

function log(line) {
  // Tool names and outcomes only: never bodies, addresses, phone numbers or tokens.
  console.log(`[fitplate] ${new Date().toISOString().slice(11, 19)} ${line}`);
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && safeReturnUrl(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function page(res, status, title, text) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font-family:system-ui;background:#07090A;color:#fff;padding:32px"><h2>${title}</h2><p>${text}</p></body>`);
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 100_000) throw new Error('Request too large');
  }
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.end();
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean); // api swiggy im call

  try {
    if (url.pathname === '/api/health') {
      return send(res, 200, { ok: true, checkoutLive: CHECKOUT_LIVE, connected: { im: connections.im.connected(), food: connections.food.connected() } });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state') ?? '';
      const pending = pendingLogins.get(state);
      if (!code || !pending) return page(res, 400, 'Swiggy sign-in didn’t finish', 'Go back to FitPlate and tap Connect Swiggy again.');
      pendingLogins.delete(state);
      await connections[pending.server].finish(code);
      log(`${pending.server} connected`);
      const back = pending.returnTo;
      if (back) {
        res.writeHead(302, { Location: `${back}${back.includes('?') ? '&' : '?'}swiggy=connected` });
        return res.end();
      }
      return page(res, 200, 'Swiggy connected', 'You can close this tab and go back to FitPlate.');
    }

    if (parts[0] === 'api' && parts[1] === 'swiggy' && connections[parts[2]]) {
      const conn = connections[parts[2]];
      const action = parts[3];

      if (action === 'status') return send(res, 200, { connected: conn.connected() });

      if (action === 'connect') {
        const returnTo = safeReturnUrl(url.searchParams.get('return') ?? '');
        const state = crypto.randomBytes(16).toString('hex');
        pendingLogins.set(state, { server: conn.id, returnTo, at: Date.now() });
        let authUrl;
        try {
          authUrl = await conn.begin(state);
        } catch (e) {
          pendingLogins.delete(state);
          log(`${conn.id} connect failed: ${errorCode(e)}`);
          return page(res, 502, 'Couldn’t reach Swiggy', `Swiggy's sign-in didn't start (${String(e.message || e).slice(0, 160).replace(/[<>&]/g, '')}). Check your internet connection and try again.`);
        }
        if (!authUrl) {
          pendingLogins.delete(state);
          if (returnTo) {
            res.writeHead(302, { Location: returnTo });
            return res.end();
          }
          return page(res, 200, 'Already connected', 'Swiggy is connected. Go back to FitPlate.');
        }
        res.writeHead(302, { Location: authUrl });
        return res.end();
      }

      if (action === 'logout' && req.method === 'POST') {
        await conn.logout();
        log(`${conn.id} signed out`);
        return send(res, 200, { ok: true });
      }

      if (action === 'tools') {
        const tools = await conn.tools();
        return send(res, 200, { ok: true, tools: Object.fromEntries(tools ?? []) });
      }

      if (action === 'call' && req.method === 'POST') {
        const { tool, args } = await readJson(req);
        if (!ALLOWED[conn.id].includes(tool)) return send(res, 400, { ok: false, code: 'UNSUPPORTED', message: `FitPlate doesn’t use ${tool}.` });
        if (ORDER_TOOLS.has(tool) && !CHECKOUT_LIVE) {
          log(`${conn.id}.${tool} refused (CHECKOUT_LIVE off)`);
          return send(res, 403, { ok: false, code: 'NOT_LIVE', message: 'Real orders are switched off. Start the server with CHECKOUT_LIVE=true to place one.' });
        }
        if (!conn.connected()) return send(res, 401, { ok: false, code: 'AUTH', message: 'Connect Swiggy first.' });
        const started = Date.now();
        try {
          const data = await conn.call(tool, args ?? {});
          log(`${conn.id}.${tool} ok ${Date.now() - started}ms`);
          return send(res, 200, { ok: true, data });
        } catch (e) {
          const code = e.code === 'UNSUPPORTED' ? 'UNSUPPORTED' : errorCode(e);
          log(`${conn.id}.${tool} ${code} ${Date.now() - started}ms`);
          if (code === 'AUTH') await conn.logout();
          const status = code === 'AUTH' ? 401 : code === 'RATE_LIMIT' ? 429 : code === 'SERVER' ? 502 : 400;
          return send(res, status, { ok: false, code, message: code === 'AUTH' ? 'Swiggy signed you out. Connect again.' : String(e.message || 'Swiggy request failed').slice(0, 200) });
        }
      }
    }
    send(res, 404, { ok: false, code: 'OTHER', message: 'Not found' });
  } catch (e) {
    log(`error ${errorCode(e)}`);
    send(res, 500, { ok: false, code: errorCode(e), message: 'The FitPlate server hit an error.' });
  }
});

// Forget logins that never came back.
setInterval(() => {
  const cutoff = Date.now() - 15 * 60_000;
  for (const [k, v] of pendingLogins) if (v.at < cutoff) pendingLogins.delete(k);
}, 60_000).unref();

if (process.argv.includes('--dump-tools')) {
  // npm run swiggy:tools: after connecting once, save each tool's input schema (no user data) for the builder.
  log('Connect Swiggy from the app first, then press Enter here to save the tool list.');
}

server.listen(PORT, '127.0.0.1', () => {
  log(`listening on http://localhost:${PORT}  (real orders ${CHECKOUT_LIVE ? 'ON' : 'off'})`);
  log(`Swiggy return address: ${REDIRECT_URI}`);
});

process.stdin.on('data', async () => {
  if (!process.argv.includes('--dump-tools')) return;
  const out = {};
  for (const [id, conn] of Object.entries(connections)) {
    if (!conn.connected()) continue;
    out[id] = Object.fromEntries((await conn.tools()) ?? []);
  }
  const file = path.join(HERE, '..', 'docs', 'swiggy-tools.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  log(`saved ${file}`);
});
