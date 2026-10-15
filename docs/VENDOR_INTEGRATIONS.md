# Vendor integrations (priority plan P3)

What the shopping, checkout and "Cook it instead" screens talk to, and how to
switch them from sample data to the real thing on your own Mac.

## Two modes

| Mode | Where | What happens |
|---|---|---|
| **Sample** (default) | Everywhere: fitplateapp.netlify.app, friends' phones, the iPhone app | Made-up products, prices, restaurants and orders, built from FitPlate's researched prices so they look right. Every screen says "Sample mode". Nothing is ordered or paid. |
| **Live** | Only on the computer running the FitPlate server | Real Swiggy Instamart and Swiggy Food through Swiggy's official MCP servers (`mcp.swiggy.com/im`, `mcp.swiggy.com/food`), signed in with your own Swiggy account |

Live is only possible on your Mac because Swiggy currently allows sign-in
redirects to `localhost` only. Going public needs Swiggy's approval (see the end).

## Screens

- **Shopping list** (`/basket`, from a dish's "Shop ingredients"): one list for
  the chosen dishes and servings, untick what you have, pick brand and pack
  (best value per 100 g is marked; your choice is remembered per ingredient).
  "Order online" or "At the shop" (tick off as you buy).
- **Instamart checkout** (`/checkout/instamart`): address, cart with every
  line, change brand or pack, out-of-stock swaps, coupons, the full bill,
  payment method, then **Place order** on a screen that lists items, packs and
  the total. Payment happens in your UPI app or Swiggy, never in FitPlate.
- **Zepto**: no cart API, so each item opens Zepto on that product (or Zepto's
  home page when the exact link isn't known yet; the purple "Z" says which).
- **Tracking** (`/checkout/track`): ETA, and what to prep while it arrives,
  then "Continue to cooking".
- **Cook step by step** (`/steps/[id]`): one step at a time with timers; on
  finishing it logs the meal, the money saved and the cook.
- **Cook it instead** (`/order-vs-make`, Today's "Craving a takeaway?" card):
  search Swiggy Food, see order vs make side by side, then "Start cooking" or
  "Order anyway". With your permission it also reads your recent Swiggy Food
  orders to show what cooking would have saved (read on the spot, never stored).
- **Shopping & vendors** (Profile): sample/live switch, connect Swiggy, whether
  real orders are on, preferred shop, order-history permission.

## Running live on your Mac

1. In the FitPlate folder: `npm install` (once, after pulling).
2. Add to `.env` (your copy, never committed):
   ```
   EXPO_PUBLIC_FITPLATE_API_URL=http://localhost:8787
   ```
3. Terminal 1: `npm run server` (FitPlate server on `http://127.0.0.1:8787`).
4. Terminal 2: `npx expo start --web`, open `http://localhost:8081`.
5. Profile → Shopping & vendors → turn on "Use real Swiggy" → Connect
   Instamart / Swiggy Food (phone number and OTP on Swiggy's own page).

Real orders stay locked until **both** switches are on:

```
# .env (app side)
EXPO_PUBLIC_CHECKOUT_LIVE=true
# server side, when starting it
CHECKOUT_LIVE=true npm run server
```

With either off, you can build carts and see real bills but "Place order"
stays locked and the server refuses `checkout`, `place_food_order` and
`confirm_order`.

Optional: `npm run swiggy:tools` connects once and saves each tool's input
schema (no personal data) to `docs/swiggy-tools.json`, so the builder can match
argument names exactly. Until then the server adapts argument names to each
tool's schema automatically.

`SWIGGY_REDIRECT_URI` overrides the callback (default
`http://localhost:8787/callback`); `FITPLATE_SERVER_PORT` changes the port.

## What the server keeps

- Swiggy sign-in tokens: in memory only, gone when the server stops.
- Logs: tool name, outcome and duration. Never request or response bodies,
  never addresses or phone numbers.
- Nothing from Swiggy (catalogue, menu, prices, orders) goes to Firestore or
  the research library. The app keeps only your own choices (brand per
  ingredient, the list you ticked, "bought via Instamart").

## Parked

Blinkit and Zomato: hidden in the app, kept in the data model, until they offer
an official way in. No scraping.

## Before going public

1. Swiggy: apply to Swiggy's developer programme (Builders Club) for a
   production client with your own redirect URL, then move the FitPlate server
   to a host (free tiers exist; flag cost before choosing).
2. Apple: the $99/year developer programme for TestFlight and the App Store
   (not needed for testing on your own iPhone).
3. Zepto: exact product links need the ingredient research to record them
   (see "Zepto links" below) or an official Zepto API.
4. Payments stay in Swiggy / UPI apps. FitPlate never takes card or UPI
   details, so no payment licence is needed for this flow.

## Zepto links (optional research patch)

To make the purple "Z" open the exact product, add this to the ingredient
research prompt (`/mnt/project-files/ingredient-research/PROMPT.md`):

> For each ingredient, if you find it on zepto.com, record the product page URL
> of the most common pack as `Links: zepto=<url>` (also `instamart=<url>`,
> `blinkit=<url>` when found). Only URLs you actually opened; leave blank
> otherwise.

The shopping list already accepts these links. The research importer needs a
small change to read the new line, which can be done once the first files carry it.
