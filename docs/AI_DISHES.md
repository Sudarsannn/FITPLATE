# AI dishes (Create your own dish)

Cook tab, top card: "Create your own dish with AI". The user names and describes a dish. FitPlate then:

1. **Matches** it against every researched dish. Same dish: opens it. A modification (Jain, vegan, swap the main ingredient, spice level): starts from that dish. Otherwise: new.
2. **Researches online**: with a Tavily key it searches the web (2 to 3 queries, up to 10 real recipe and nutrition pages) and writes from what those pages say, citing them. Without a key it tries Google Search grounding (not free on every key), then falls back to the AI's own knowledge and marks the dish "not checked against web sources yet".
3. **Writes** the full dish in the same shape as a researched dish (ingredients per serving, micro-steps with timers and visual cues, nutrition, healthiness, rating, storage, leftovers, allergens). The app checks it: allergens are re-derived from the ingredients, diet claims are checked against them, calories are checked against the macros.
4. **Saves** it on the device (works like any dish: cook, shop, steps, log; no order price and no Order button) and **queues** it in the repo for the daily dish research.

The Analyse my Swiggy Checkout page has the same button for cart items with no recipe.

## Shared library and replacement

- Every AI dish is shared: `GET /api/ai/library` returns the queue's dishes that research has not replaced (cached 10 minutes), and every app lists them in Cook on start-up (cached on the device for offline). Before calling the AI, creation looks for the same dish by name there, so nobody generates it twice.
- They log like any dish ("cooked by you", My Meals, Today totals); AI dishes have no order price, so no money-saved figure.
- When the daily research ships a researched dish with the same name, the app shows that one and drops the AI draft. The old AI dish id keeps opening (as the researched dish), so logs, favourites and plans survive. The research must keep the queue entry's exact name (PATCH_07).
- The shared list is capped at 200 dishes, most requested first.

## Which AI

Google Gemini through the Gemini API free tier (no card, no expiry, rate limits only). The server asks Google which models the key can use and picks the newest stable Flash model, then falls back to older ones (and a Flash-Lite last) when one is retired or out of allowance, so a retired model never breaks it. `https://<your-address>/api/ai/status?check=1` lists them. To force one, set the Worker variable `GEMINI_MODEL` (and optionally `GEMINI_FALLBACK_MODELS`, comma separated). Free-tier requests can be used by Google to improve its products; FitPlate only sends the dish text and the researched dish names, never names, emails or health data.

If the free allowance runs out the screen says so and the rest of the app is unaffected.

## One-time setup (Sudarsan)

1. Get a key: https://aistudio.google.com/apikey (sign in with Google, Create API key, free).
2. Cloudflare dashboard, Workers & Pages, `fitplate`, Settings, Variables and Secrets, Add: type **Secret**, name `GEMINI_API_KEY`, value the key. Deploy.
3. Research queue (so Claude can pick the dishes up): GitHub, Settings, Developer settings, Fine-grained tokens, repository `FITPLATE` only, permission **Contents: Read and write**, no expiry (or a year). Add it in Cloudflare as Secret `GITHUB_TOKEN`. Optional variables: `GITHUB_REPO` (default `sudarsannn/fitplate`), `QUEUE_BRANCH` (default `ai-dish-queue`).
3b. Web search (recommended): sign up free at https://tavily.com (no card, about 1,000 searches a month; a dish uses 2 to 3), copy the API key (starts `tvly-`), add it in Cloudflare as Secret `TAVILY_API_KEY`, Deploy. `/api/ai/status` then shows `"web":true`.
4. Cloudflare, Settings, Build, turn off "Builds for non-production branches" so queue commits do not start builds.
5. The phone app talks to `https://fitplate.sudarsanmohanchander.workers.dev` by default. To use another address put `EXPO_PUBLIC_FITPLATE_AI_URL=...` in `.env` and rebuild.

Check it: open `https://fitplate.sudarsanmohanchander.workers.dev/api/ai/status`. It shows `"configured": true` when the key is set and `"queue": true` when the token is set.

## Where things are

- `server/ai/handler.js` the server logic (prompts, Gemini calls, queue writer). `worker/index.js` is the Cloudflare entry; `wrangler.jsonc` sends only `/api/*` to it.
- `src/services/ai/` the app side: `client.ts` (steps and progress), `buildDish.ts` (checks and conversion), `store.ts` (device storage).
- Research queue: branch `ai-dish-queue`, `queue/<slug>.json`; `node scripts/research/ai-queue.js list`. Daily research instructions: `/mnt/project-files/dish-research/PROMPT_PATCH_07_ai-requested-dishes.md`.

## Limits to know

- Anyone with the app address can call the AI endpoints. The key stays secret and the free tier has no bill, so the worst case is the allowance running out. If that happens, add a check (Firebase sign-in token) in `worker/index.js`.
- Your own AI dishes are stored on the device and are also in the shared library (if the research queue is switched on), so a reinstall gets them back.
- It is a first draft. The recipe page says so, lists what the AI could not confirm, and the daily research verifies it.

## Minimise, notify and richer AI dishes (24 Oct 2026)
- The wait screen has a Minimise button: the screen shrinks to a floating bar above the tab bar showing the dish, time so far and a rough time left. Tap it to expand, or to open the dish when it is ready. State lives in `src/services/ai/job.ts`, the bar is `src/components/AiJobBar.tsx`.
- "Notify me when it's done" sends a local notification (or a browser one on the web) only if the app is in the background when the dish finishes. The request itself runs while the app is open or briefly backgrounded; a phone may pause it if the app is closed.
- Vitamins and minerals for AI dishes are now worked out from the researched per-100 g data of matched ingredients (partial coverage is shown). Ingredients with no researched match are listed in the queue entry as `unmatchedIngredients`; ingredient research PATCH_05 adds up to 5 a run.
