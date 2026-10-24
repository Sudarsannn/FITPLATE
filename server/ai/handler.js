/**
 * FitPlate AI dish creation: the server half.
 *
 * One handler, used by the Cloudflare Worker (worker/index.mjs). It keeps the
 * free Gemini API key off the phone and the web bundle, and it calls Google
 * through `fetchImpl` so tests can pass a fake.
 *
 *   POST /api/ai/plan      match a description against the researched dishes
 *   POST /api/ai/research  search the web (Google Search grounding) for the dish
 *   POST /api/ai/compose   write the full dish in FitPlate's research shape (JSON)
 *   POST /api/ai/submit    save the finished dish to the research queue (GitHub)
 *   GET  /api/ai/library   AI dishes not yet researched, shared with every user
 *   GET  /api/ai/status    is the key configured (no secrets returned)
 *
 * Secrets (Cloudflare dashboard, Settings, Variables and Secrets):
 *   GEMINI_API_KEY   required, free from https://aistudio.google.com/apikey
 *   GITHUB_TOKEN     optional, fine-grained token with Contents write on the repo
 *   TAVILY_API_KEY   optional, free web search (https://tavily.com); without it the AI falls back to Google Search grounding, then to its own knowledge
 * Variables (optional, normally leave unset: the newest free flash model is found automatically): GEMINI_MODEL, GEMINI_FALLBACK_MODELS, GITHUB_REPO, QUEUE_BRANCH.
 */

export const DEFAULT_MODEL = 'gemini-2.5-flash';
export const DEFAULT_FALLBACKS = 'gemini-2.5-flash-lite';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_TEXT = 6000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
  });

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};

const clip = (s, n = MAX_TEXT) => (typeof s === 'string' ? s.slice(0, n) : '');

// ----------------------------------------------------------------- Gemini

let modelCache = { at: 0, list: /** @type {string[]} */ ([]) };

/** Version number in a model name: gemini-2.5-flash gives 2.5, gemini-3-flash-preview gives 3. */
const versionOf = (name) => {
  const m = /gemini-(\d+(?:\.\d+)?)/.exec(name);
  return m ? parseFloat(m[1]) : 0;
};

/**
 * The free "flash" models this key can use, newest first, asked from Google
 * itself so a retired model never breaks the feature. Stable releases come
 * before previews, since previews have the tightest free limits. Cached for an hour per Worker instance.
 */
export async function discoverModels(env, fetchImpl) {
  if (modelCache.list.length && Date.now() - modelCache.at < 3_600_000) return modelCache.list;
  try {
    const res = await fetchImpl(`${GEMINI}?pageSize=200`, { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.models ?? [])
      .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
      .map((m) => String(m.name).replace(/^models\//, ''))
      .filter((n) => /^gemini-[\d.]+-flash(-\d+)?$|^gemini-[\d.]+-flash-(preview|latest)/.test(n) || /^gemini-[\d.]+-flash$/.test(n))
      .filter((n) => !/(image|tts|live|audio|thinking|exp|lite|8b|robotics|computer)/.test(n))
      .sort((a, b) => Number(/preview/.test(a)) - Number(/preview/.test(b)) || versionOf(b) - versionOf(a) || a.localeCompare(b)); // stable first: previews have the tightest free limits
    // A lite model is the last resort when nothing else is left.
    const lite = (data.models ?? [])
      .map((m) => String(m.name).replace(/^models\//, ''))
      .filter((n) => /^gemini-[\d.]+-flash-lite$/.test(n) && (data.models.find((m) => m.name === `models/${n}`)?.supportedGenerationMethods ?? []).includes('generateContent'))
      .sort((a, b) => versionOf(b) - versionOf(a));
    modelCache = { at: Date.now(), list: [...list, ...lite] };
  } catch {
    return [];
  }
  return modelCache.list;
}

/** One Gemini call, with a model fallback chain and one retry on overload. Returns { text, sources, queries, model }. */
export async function callGemini({ env, fetchImpl, system, prompt, schema, search, temperature = 0.4 }) {
  const key = env.GEMINI_API_KEY;
  if (!key) throw new AiError(503, 'not-configured', 'The AI key is not set up on the server yet.');
  const pinned = env.GEMINI_MODEL
    ? [env.GEMINI_MODEL, ...String(env.GEMINI_FALLBACK_MODELS ?? '').split(',').map((m) => m.trim()).filter(Boolean)]
    : [];
  const discovered = pinned.length ? [] : await discoverModels(env, fetchImpl);
  const models = [...pinned, ...discovered, ...(pinned.length || discovered.length ? [] : [DEFAULT_MODEL, ...DEFAULT_FALLBACKS.split(',')])].slice(0, 5);
  let last = null;
  let first = null;
  for (const model of [...new Set(models)]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const body = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: 16000, ...(schema ? { responseMimeType: 'application/json', responseSchema: schema } : {}) },
        ...(search ? { tools: [{ google_search: {} }] } : {}),
      };
      let res;
      try {
        res = await fetchImpl(`${GEMINI}/${model}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
      } catch (e) {
        last = new AiError(502, 'network', 'Could not reach the AI service.');
        continue;
      }
      if (res.status === 429) {
        let why = '';
        try {
          why = String((await res.json())?.error?.message ?? '').replace(/\s+/g, ' ').slice(0, 220);
        } catch {
          /* no body */
        }
        last = new AiError(429, 'quota', `The free AI allowance is used up for now (${model}${why ? `: ${why}` : ''}). Try again later.`);
        first = first ?? last;
        break; // next model has its own allowance
      }
      if (res.status === 503 || res.status === 500) {
        last = new AiError(503, 'overloaded', 'The AI service is busy. Try again in a minute.');
        continue;
      }
      if (!res.ok) {
        let why = '';
        try {
          why = String((await res.json())?.error?.message ?? '').slice(0, 200);
        } catch {
          /* no body */
        }
        const e = res.status === 404 ? new AiError(502, 'model', `Model ${model} is not available${why ? `: ${why}` : '.'}`) : new AiError(502, 'upstream', `The AI service answered ${res.status} for ${model}${why ? `: ${why}` : '.'}`);
        first = first ?? e;
        last = e;
        break;
      }
      const data = await res.json();
      const cand = data?.candidates?.[0];
      const text = (cand?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
      if (!text) {
        last = new AiError(502, 'empty', 'The AI returned nothing. Try again.');
        continue;
      }
      const gm = cand?.groundingMetadata;
      const sources = (gm?.groundingChunks ?? []).map((c) => c.web).filter(Boolean).map((w) => ({ title: String(w.title ?? w.uri), url: String(w.uri) }));
      const seen = new Set();
      const uniq = sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
      return { text, sources: uniq, queries: gm?.webSearchQueries ?? [], model };
    }
  }
  // The first failure is the real one: later models only fail because the first did.
  throw (first ?? last) ?? new AiError(502, 'upstream', 'The AI service is unavailable.');
}

export class AiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Tries each usable model with a tiny request (and one with Google Search) and reports what Google says. For diagnosing from /api/ai/status?check=1&test=1. */
export async function probe(env, fetchImpl) {
  const out = [];
  const models = (env.GEMINI_MODEL ? [env.GEMINI_MODEL] : await discoverModels(env, fetchImpl)).slice(0, 12);
  for (const model of models) {
    for (const search of [false, true]) {
      const body = { contents: [{ role: 'user', parts: [{ text: 'Reply with the word OK.' }] }], generationConfig: { maxOutputTokens: 20 }, ...(search ? { tools: [{ google_search: {} }] } : {}) };
      try {
        const res = await fetchImpl(`${GEMINI}/${model}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY }, body: JSON.stringify(body) });
        let why = '';
        if (!res.ok) {
          try {
            why = String((await res.json())?.error?.message ?? '').replace(/\s+/g, ' ').slice(0, 200);
          } catch {
            /* no body */
          }
        }
        out.push({ model, search, status: res.status, why });
      } catch {
        out.push({ model, search, status: 0, why: 'network' });
      }
    }
  }
  return out;
}

// ----------------------------------------------------------------- prompts

const SYSTEM_BASE = `You are the research engine for FitPlate, an India-first app that helps busy people cook at home instead of ordering from Swiggy or Zomato.
You follow FitPlate's dish research protocol: everything is for ONE serving, standard ingredient names with the Indian name in brackets where common (for example "Cumin seeds (jeera)"), realistic for a beginner in a home kitchen in India, written in your own words, never copying recipe text.
Never invent a source, a rating or a nutrition number. Mark estimates as estimates. Say "not found" instead of guessing.`;

export const PLAN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    mode: { type: 'STRING', enum: ['existing', 'variation', 'new'] },
    baseDishId: { type: 'STRING', nullable: true },
    canonicalName: { type: 'STRING' },
    summary: { type: 'STRING' },
    changes: { type: 'ARRAY', items: { type: 'STRING' } },
    searchQueries: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['mode', 'canonicalName', 'summary', 'changes', 'searchQueries'],
};

export function planPrompt({ description, name, catalog, diet }) {
  const lines = catalog.map((d) => `${d.id} | ${d.name} | ${d.cuisine ?? ''} | ${d.dietType ?? ''}${d.family ? ` | family ${d.family}` : ''}`).join('\n');
  return `A user wants a dish that is not on their Cook list.
Name they typed: ${name || '(none)'}
Description: ${description}
${diet ? `Their diet: ${diet}\n` : ''}
FitPlate's researched dishes (id | name | cuisine | diet):
${lines}

Decide:
- "existing": the request is really one of the researched dishes (same dish, different spelling or menu name). Set baseDishId.
- "variation": a researched dish can be modified to make it (swap a main ingredient, make it Jain or vegan, change spice level, change the cooking method). Set baseDishId and list the changes.
- "new": no researched dish is close enough. baseDishId null.
Give canonicalName as the dish's usual English name with the spelling corrected (the user may have mistyped it, for example "Cheicken" is "Chicken"); keep real regional names such as Dindigul or Seeraga Samba. summary is one sentence. changes lists each modification (empty for existing and new). searchQueries has 2 to 4 web search queries that would find authentic recipes and nutrition facts for it.`;
}

export function researchPrompt({ description, canonicalName, mode, base, changes }) {
  return `Research this dish on the web as FitPlate's research engine and write research notes.
Dish: ${canonicalName}
User's description: ${description}
Mode: ${mode}
${base ? `Start from FitPlate's researched dish "${base.name}". Its ingredients (1 serving): ${base.ingredients}\nIts method in short: ${base.steps}\nChanges to make: ${(changes ?? []).join('; ') || 'none'}\nCheck online that the modified recipe is authentic and workable (what to change in quantities, timings and technique).\n` : 'There is no researched dish to start from. Build the recipe from several independent online sources and choose what most reliable sources agree on; note the key disagreements.\n'}
Use at least 3 independent sources. Write the notes as plain text with these parts:
1. Quick facts: cuisine or region, veg/egg/non-veg, meal type, difficulty with a reason, prep and cook minutes, smallest practical batch if one serving is impractical.
2. Ingredients for 1 serving with quantity in g or ml (count for whole items), household measure, what unfamiliar items look like.
3. Equipment with an alternative for anything not everyone owns.
4. Micro-steps: one small action each, with exact measure, time, visual cue (exactly what the user should see, smell or hear when it is going right), what to watch out for (the usual mistake and how to tell), a beginner tip where useful, and a true fun fact only where a source gives one.
5. Nutrition per serving (kcal, protein, carbs, fat, fibre) from IFCT 2017 or USDA data, and which basis you used.
6. Healthiness (home version and typical restaurant version, out of 10) with reasons and three healthier swaps.
7. Internet-sentiment rating out of 5 with a one-line reason (not restaurant ratings).
8. Storage and reheating, a leftover remix, and allergens.
9. Where sources disagree and what you chose.`;
}

const STR = { type: 'STRING' };
const NUM = { type: 'NUMBER', nullable: true };
const ALLERGENS = ['peanut', 'treeNut', 'milk', 'egg', 'fish', 'shellfish', 'gluten', 'soy', 'sesame', 'mustard'];

export const COMPOSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: STR,
    description: STR,
    cuisine: STR,
    dietType: { type: 'STRING', enum: ['veg', 'egg', 'non-veg'] },
    mealType: { type: 'ARRAY', items: { type: 'STRING', enum: ['breakfast', 'lunch', 'dinner', 'snack'] } },
    difficulty: { type: 'STRING', enum: ['Beginner', 'Intermediate', 'Advanced'] },
    prepMin: NUM,
    cookMin: NUM,
    batchNote: { type: 'STRING', nullable: true },
    ingredients: {
      type: 'ARRAY',
      minItems: 3,
      items: {
        type: 'OBJECT',
        properties: { name: STR, quantity: NUM, unit: { type: 'STRING', enum: ['g', 'ml', 'count'] }, householdMeasure: { type: 'STRING', nullable: true }, looksLike: { type: 'STRING', nullable: true } },
        required: ['name', 'quantity', 'unit'],
      },
    },
    equipment: { type: 'ARRAY', items: STR },
    steps: {
      type: 'ARRAY',
      minItems: 8,
      items: {
        type: 'OBJECT',
        properties: { title: STR, text: STR, timerSec: { type: 'INTEGER', nullable: true }, tip: { type: 'STRING', nullable: true }, watchOut: { type: 'STRING', nullable: true }, funFact: { type: 'STRING', nullable: true }, visualCue: { type: 'STRING', nullable: true }, cameraCheck: { type: 'STRING', nullable: true }, videoShot: { type: 'STRING', nullable: true } },
        required: ['title', 'text'],
      },
    },
    nutrition: { type: 'OBJECT', properties: { kcal: NUM, proteinG: NUM, carbsG: NUM, fatG: NUM, fibreG: NUM, basis: STR }, required: ['kcal', 'proteinG', 'carbsG', 'fatG'] },
    healthiness: { type: 'OBJECT', properties: { score: NUM, restaurantScore: NUM, reason: STR, swaps: { type: 'ARRAY', items: STR } }, required: ['score', 'reason'] },
    rating: { type: 'OBJECT', properties: { score: NUM, basis: STR }, required: ['basis'] },
    storage: { type: 'STRING', nullable: true },
    leftoverRemix: { type: 'STRING', nullable: true },
    allergens: { type: 'ARRAY', items: { type: 'STRING', enum: ALLERGENS } },
    jainFriendly: { type: 'BOOLEAN' },
    veganFriendly: { type: 'BOOLEAN' },
    glutenFree: { type: 'BOOLEAN' },
    dairyFree: { type: 'BOOLEAN' },
    needsMoreResearch: { type: 'ARRAY', items: STR },
  },
  required: ['name', 'description', 'cuisine', 'dietType', 'mealType', 'difficulty', 'ingredients', 'equipment', 'steps', 'nutrition', 'healthiness', 'rating', 'allergens', 'needsMoreResearch'],
};

export function composePrompt({ canonicalName, description, notes, base, changes }) {
  return `Turn these research notes into the final FitPlate dish record as JSON.
Dish: ${canonicalName}
User's description: ${description}
${base ? `Based on FitPlate's researched dish "${base.name}" with these changes: ${(changes ?? []).join('; ') || 'none'}.\n` : ''}
Rules:
- Everything per 1 serving. Ingredient quantities in g or ml, or count for whole items. Use standard names with the Indian name in brackets where common.
- name is the dish's usual name with any spelling mistake from the user's request corrected.
- Steps: 8 to 30 micro-steps, one small action each. title is a short lead-in (for example "Rinse the poha"), text is the instruction with the exact measure. timerSec only for a step that really waits. visualCue, cameraCheck and videoShot for every step. visualCue says exactly what the user should SEE, smell or hear when the step is going right (colour, texture, size of bubbles, sound). watchOut says what most often goes wrong in that step and how the user can tell it is going wrong, in one or two sentences, for every step. funFact only where the research notes contain a true fact about that step or ingredient; otherwise null, never invent one.
- Every step field (title, tip, watchOut, funFact, visualCue, cameraCheck, videoShot) is ONE short sentence, at most 30 words, and never repeats words or phrases. text is at most 3 sentences.
- nutrition is per serving and the kcal must roughly equal 4 x protein + 4 x carbs + 9 x fat.
- healthiness.score and restaurantScore are out of 10. rating.score is out of 5 and rating.basis must say it comes from general internet sentiment, never restaurant ratings.
- allergens uses only the allowed ids and lists every one the ingredients contain.
- needsMoreResearch lists anything the notes could not confirm (a nutrition value, an authentic quantity, a technique). Empty if nothing.
- Never invent numbers the notes do not support; use null where unknown.

RESEARCH NOTES:
${clip(notes, 24000)}`;
}

// ----------------------------------------------------------------- handlers

async function readBody(request) {
  let raw;
  try {
    raw = await request.text();
  } catch {
    throw new AiError(400, 'bad-request', 'Could not read the request.');
  }
  if (raw.length > 120_000) throw new AiError(413, 'too-large', 'The request is too large.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new AiError(400, 'bad-request', 'The request is not valid JSON.');
  }
}

function needText(v, label, min = 2) {
  const s = clip(typeof v === 'string' ? v.trim() : '', 600);
  if (s.length < min) throw new AiError(400, 'bad-request', `${label} is missing.`);
  return s;
}

function parseModelJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
    throw new AiError(502, 'bad-output', 'The AI answered in a shape FitPlate could not read. Try again.');
  }
}

export async function plan(body, ctx) {
  const description = needText(body.description, 'The description');
  const catalog = (Array.isArray(body.catalog) ? body.catalog : []).slice(0, 300).map((d) => ({ id: clip(String(d.id), 80), name: clip(String(d.name), 80), cuisine: d.cuisine ? clip(String(d.cuisine), 60) : null, dietType: d.dietType ?? null, family: d.family ? clip(String(d.family), 40) : null }));
  const r = await callGemini({ ...ctx, system: SYSTEM_BASE, prompt: planPrompt({ description, name: clip(body.name ?? '', 80), catalog, diet: clip(body.diet ?? '', 80) }), schema: PLAN_SCHEMA, temperature: 0.2 });
  const out = parseModelJson(r.text);
  if (out.mode !== 'new' && out.baseDishId && !catalog.some((d) => d.id === out.baseDishId)) {
    out.baseDishId = null;
    if (out.mode === 'existing') out.mode = 'new';
    if (out.mode === 'variation') out.mode = 'new';
  }
  if (out.mode !== 'new' && !out.baseDishId) out.mode = 'new';
  return { plan: out, model: r.model };
}

/**
 * Real web search through Tavily's free tier (about 1,000 searches a month, no card):
 * a few queries, deduplicated pages, each with its text. The AI then writes the notes from these pages
 * instead of from memory. Returns [] when no key is set or the search fails.
 */
export async function webSearch(env, fetchImpl, queries) {
  if (!env.TAVILY_API_KEY) return [];
  const seen = new Set();
  const results = [];
  for (const q of queries.slice(0, 3)) {
    try {
      const res = await fetchImpl('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${env.TAVILY_API_KEY}` },
        body: JSON.stringify({ query: q, search_depth: 'basic', max_results: 5, include_raw_content: true, include_answer: false }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const r of data.results ?? []) {
        if (!r.url || seen.has(r.url)) continue;
        seen.add(r.url);
        results.push({ title: String(r.title ?? r.url).slice(0, 120), url: String(r.url), text: String(r.raw_content || r.content || '').replace(/\s+/g, ' ').slice(0, 2500) });
      }
    } catch {
      /* try the next query */
    }
  }
  return results.slice(0, 10);
}

export function webBlock(results) {
  return `\n\nWEB RESULTS (real pages found just now; base the recipe and numbers on what these pages agree on, say where they disagree, and use only these as sources):\n${results.map((r, n) => `[${n + 1}] ${r.title} (${r.url})\n${r.text}`).join('\n\n')}`;
}

export async function research(body, ctx) {
  const description = needText(body.description, 'The description');
  const canonicalName = needText(body.canonicalName, 'The dish name');
  const base = body.base && typeof body.base === 'object' ? { name: clip(String(body.base.name), 80), ingredients: clip(String(body.base.ingredients), 2500), steps: clip(String(body.base.steps), 3500) } : null;
  const args = { description, canonicalName, mode: body.mode === 'variation' ? 'variation' : 'new', base, changes: (Array.isArray(body.changes) ? body.changes : []).slice(0, 12).map((c) => clip(String(c), 200)) };
  const queries = (Array.isArray(body.searchQueries) ? body.searchQueries : []).map((q) => clip(String(q), 120)).filter(Boolean);
  const web = await webSearch(ctx.env, ctx.fetchImpl, queries.length ? queries : [`${canonicalName} recipe`, `${canonicalName} nutrition per serving`]);
  if (web.length >= 2) {
    const r = await callGemini({ ...ctx, system: SYSTEM_BASE, prompt: researchPrompt(args) + webBlock(web), search: false, temperature: 0.3 });
    return { notes: r.text, sources: web.map((w) => ({ title: w.title, url: w.url })), queries, model: r.model, grounded: true, via: 'web-search' };
  }
  try {
    const r = await callGemini({ ...ctx, system: SYSTEM_BASE, prompt: researchPrompt(args), search: true, temperature: 0.3 });
    return { notes: r.text, sources: r.sources.slice(0, 20), queries: r.queries.slice(0, 8), model: r.model, grounded: true };
  } catch (e) {
    // Google Search grounding is not part of the free allowance for every key or model. The dish is still
    // written from the model's own knowledge, and marked as not yet checked online so research verifies it.
    if (!(e instanceof AiError) || !['quota', 'upstream', 'model'].includes(e.code)) throw e;
    const r = await callGemini({ ...ctx, system: SYSTEM_BASE, prompt: `${researchPrompt(args)}\n\nYou cannot browse the web right now. Write the notes from what you reliably know, say clearly where you are unsure, and do not cite sources you cannot be certain exist.`, search: false, temperature: 0.3 });
    return { notes: r.text, sources: [], queries: [], model: r.model, grounded: false };
  }
}

/** Keeps whole sentences up to max characters; the model sometimes loops and pads a field. */
export function tidyText(v, max, maxSentences = 3) {
  if (typeof v !== 'string') return v;
  const t = v.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  let out = '';
  let n = 0;
  const seen = new Set();
  for (const sentence of t.split(/(?<=[.!?])\s+/)) {
    const k = sentence.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (n >= maxSentences || (out + ' ' + sentence).trim().length > max) break;
    out = (out + ' ' + sentence).trim();
    n++;
  }
  if (out) return out;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 20)).replace(/[,;:\s]+$/, '') + '.';
}

const STEP_MAX = { title: 80, text: 600, tip: 260, watchOut: 300, funFact: 260, visualCue: 260, cameraCheck: 200, videoShot: 200 };

function tidyComposed(out) {
  if (out && Array.isArray(out.steps)) {
    out.steps = out.steps.map((st) => Object.fromEntries(Object.entries(st).map(([k, v]) => [k, STEP_MAX[k] ? tidyText(v, STEP_MAX[k], k === 'text' ? 6 : 3) : v])));
  }
  return out;
}

export async function compose(body, ctx) {
  const canonicalName = needText(body.canonicalName, 'The dish name');
  const description = needText(body.description, 'The description');
  const notes = needText(body.notes, 'The research notes', 50);
  const base = body.base && typeof body.base === 'object' ? { name: clip(String(body.base.name), 80) } : null;
  const changes = (Array.isArray(body.changes) ? body.changes : []).slice(0, 12).map((c) => clip(String(c), 200));
  // The model sometimes returns a thin recipe; ask again once, saying what was missing, before giving up.
  let extra = '';
  let out = null;
  let model = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await callGemini({ ...ctx, system: SYSTEM_BASE, prompt: composePrompt({ canonicalName, description, notes, base, changes }) + extra, schema: COMPOSE_SCHEMA, temperature: attempt ? 0.5 : 0.2 });
    model = r.model;
    out = tidyComposed(parseModelJson(r.text));
    const nSteps = Array.isArray(out?.steps) ? out.steps.length : 0;
    const nIng = Array.isArray(out?.ingredients) ? out.ingredients.length : 0;
    if (nSteps >= 4 && nIng >= 3) break;
    extra = `\n\nYOUR LAST ANSWER WAS TOO THIN (${nIng} ingredients, ${nSteps} steps). Write at least 6 ingredients and at least 8 micro-steps, even if the notes are short: fill gaps from standard technique for this dish and list them in needsMoreResearch.`;
  }
  return { dish: out, model };
}

// ----------------------------------------------------------------- research queue

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'dish';

const b64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
};
const unb64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

/**
 * Save an AI-made dish to the research queue: one JSON file per dish on a
 * separate branch of the repo (never the deploy branch), so the daily dish
 * research can pick it up. Asking again for the same dish only raises its count.
 */
export async function submit(body, ctx) {
  const { env, fetchImpl } = ctx;
  const token = env.GITHUB_TOKEN;
  if (!token) return { saved: false, reason: 'queue-not-configured' };
  const repo = env.GITHUB_REPO || 'sudarsannn/fitplate';
  const branch = env.QUEUE_BRANCH || 'ai-dish-queue';
  const dish = body.dish;
  if (!dish || typeof dish !== 'object' || typeof dish.name !== 'string') throw new AiError(400, 'bad-request', 'There is no dish to save.');
  const slug = slugify(dish.name);
  const path = `queue/${slug}.json`;
  const gh = (p, init = {}) => fetchImpl(`https://api.github.com/repos/${repo}${p}`, { ...init, headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'x-github-api-version': '2022-11-28', 'user-agent': 'fitplate-ai-queue', 'content-type': 'application/json', ...(init.headers ?? {}) } });

  // Branch: create from the default branch the first time.
  let ref = await gh(`/git/ref/heads/${branch}`);
  if (ref.status === 404) {
    const info = await (await gh('')).json();
    const head = await (await gh(`/git/ref/heads/${info.default_branch}`)).json();
    const made = await gh('/git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: head.object.sha }) });
    if (!made.ok && made.status !== 422) throw new AiError(502, 'queue', 'Could not create the queue branch.');
  } else if (!ref.ok) {
    throw new AiError(502, 'queue', `GitHub answered ${ref.status}.`);
  }

  const now = new Date().toISOString();
  const entryFresh = {
    slug,
    name: dish.name,
    status: 'pending-research',
    mode: body.mode === 'variation' ? 'variation' : 'new',
    basedOn: body.basedOn ? { id: clip(String(body.basedOn.id), 80), name: clip(String(body.basedOn.name), 80) } : null,
    changes: (Array.isArray(body.changes) ? body.changes : []).slice(0, 12).map((c) => clip(String(c), 200)),
    requests: 1,
    firstRequestedAt: now,
    lastRequestedAt: now,
    userWords: [clip(String(body.description ?? ''), 600)],
    unmatchedIngredients: (Array.isArray(body.unmatchedIngredients) ? body.unmatchedIngredients : []).slice(0, 30).map((c) => clip(String(c), 80)),
    needsMoreResearch: Array.isArray(dish.needsMoreResearch) ? dish.needsMoreResearch.slice(0, 12).map((c) => clip(String(c), 200)) : [],
    sources: (Array.isArray(body.sources) ? body.sources : []).slice(0, 20),
    model: clip(String(body.model ?? ''), 60),
    grounded: body.grounded !== false,
    note: 'Created by FitPlate AI from the user request. Not yet researched by the daily dish research. The dish below is a first draft, not verified.',
    dish,
  };

  const existing = await gh(`/contents/${path}?ref=${branch}`);
  let content = entryFresh;
  let sha;
  if (existing.ok) {
    const file = await existing.json();
    sha = file.sha;
    try {
      const old = JSON.parse(unb64(file.content));
      content = { ...old, requests: (old.requests ?? 1) + 1, lastRequestedAt: now, unmatchedIngredients: [...new Set([...(old.unmatchedIngredients ?? []), ...entryFresh.unmatchedIngredients])].slice(0, 30), userWords: [...new Set([...(old.userWords ?? []), ...entryFresh.userWords])].slice(0, 20) };
    } catch {
      content = entryFresh;
    }
  } else if (existing.status !== 404) {
    throw new AiError(502, 'queue', `GitHub answered ${existing.status}.`);
  }
  const put = await gh(`/contents/${path}`, { method: 'PUT', body: JSON.stringify({ message: `AI dish queue: ${dish.name}${sha ? ' (requested again)' : ''}`, content: b64(JSON.stringify(content, null, 2) + '\n'), branch, ...(sha ? { sha } : {}) }) });
  if (!put.ok) throw new AiError(502, 'queue', `Could not save to the queue (${put.status}).`);
  return { saved: true, slug, requests: content.requests };
}

// ----------------------------------------------------------------- shared library

/**
 * Every AI dish not yet replaced by researched content, for the app to offer
 * to everyone so nobody regenerates a dish somebody already asked for. One
 * GraphQL call reads all queue files at once. Cached for 10 minutes.
 */
export async function library(ctx, cacheStore) {
  const { env, fetchImpl } = ctx;
  if (!env.GITHUB_TOKEN) return { dishes: [], reason: 'queue-not-configured' };
  const cacheKey = new Request('https://fitplate.internal/ai-library');
  const hit = cacheStore ? await cacheStore.match(cacheKey) : null;
  if (hit) return hit.json();
  const repo = env.GITHUB_REPO || 'sudarsannn/fitplate';
  const [owner, name] = repo.split('/');
  const branch = env.QUEUE_BRANCH || 'ai-dish-queue';
  const res = await fetchImpl('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, 'content-type': 'application/json', 'user-agent': 'fitplate-ai-queue' },
    body: JSON.stringify({ query: `query($o:String!,$n:String!,$e:String!){repository(owner:$o,name:$n){object(expression:$e){... on Tree{entries{name object{... on Blob{text}}}}}}}`, variables: { o: owner, n: name, e: `${branch}:queue` } }),
  });
  if (!res.ok) throw new AiError(502, 'queue', `GitHub answered ${res.status}.`);
  const data = await res.json();
  const entries = data?.data?.repository?.object?.entries ?? [];
  const dishes = [];
  for (const e of entries) {
    if (!/\.json$/.test(e.name) || !e.object?.text) continue;
    try {
      const q = JSON.parse(e.object.text);
      if (q.status === 'researched' || !q.dish?.name) continue;
      dishes.push({ slug: q.slug, name: q.name, mode: q.mode, basedOn: q.basedOn ?? null, changes: q.changes ?? [], sources: q.sources ?? [], model: q.model ?? '', grounded: q.grounded !== false, requests: q.requests ?? 1, firstRequestedAt: q.firstRequestedAt, dish: q.dish });
    } catch {
      /* skip a damaged file */
    }
  }
  dishes.sort((a, b) => (b.requests ?? 1) - (a.requests ?? 1)).splice(200);
  const body = { dishes };
  if (cacheStore) await cacheStore.put(cacheKey, new Response(JSON.stringify(body), { headers: { 'cache-control': 'max-age=600', 'content-type': 'application/json' } }));
  return body;
}

// ----------------------------------------------------------------- router

/** Route one request. `env` carries the secrets; `fetchImpl` defaults to global fetch. */
export async function handleAi(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const route = url.pathname.replace(/\/+$/, '');
  try {
    if (route === '/api/ai/status' && request.method === 'GET') {
      const out = { ok: true, configured: Boolean(env.GEMINI_API_KEY), queue: Boolean(env.GITHUB_TOKEN), web: Boolean(env.TAVILY_API_KEY), model: env.GEMINI_MODEL || 'auto' };
      // ?check=1 asks Google which free models this key can use right now.
      if (url.searchParams.get('check') && env.GEMINI_API_KEY) out.available = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : await discoverModels(env, fetchImpl);
      if (url.searchParams.get('test') && env.GEMINI_API_KEY) out.probe = await probe(env, fetchImpl);
      return json(out);
    }
    const ctx = { env, fetchImpl };
    if (route === '/api/ai/library' && request.method === 'GET') {
      const store = typeof caches !== 'undefined' && caches.default ? caches.default : null;
      return json({ ok: true, ...(await library(ctx, store)) });
    }
    if (request.method !== 'POST') return json({ error: 'not-found', message: 'Not found.' }, 404);
    if (route === '/api/ai/plan') return json({ ok: true, ...(await plan(await readBody(request), ctx)) });
    if (route === '/api/ai/research') return json({ ok: true, ...(await research(await readBody(request), ctx)) });
    if (route === '/api/ai/compose') return json({ ok: true, ...(await compose(await readBody(request), ctx)) });
    if (route === '/api/ai/submit') return json({ ok: true, ...(await submit(await readBody(request), ctx)) });
    return json({ error: 'not-found', message: 'Not found.' }, 404);
  } catch (e) {
    if (e instanceof AiError) return json({ ok: false, error: e.code, message: e.message }, e.status);
    return json({ ok: false, error: 'server', message: 'Something went wrong on the server.' }, 500);
  }
}
