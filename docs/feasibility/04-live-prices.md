# 4. Live price data: scraping vs partnerships

**Today:** daily ingredient price research (a research routine reads public listings and writes estimates with min, average, max and dates). The Prices view and the cost-to-make engine use that. Everything is labelled an estimate. **Live** means the price in the shop right now.

## Routes
| Route | Accuracy | Legal and policy risk | Effort |
|---|---|---|---|
| **Keep the research routine** | Good for trends, a few days old | Low (public information, summarised) | Done |
| **Official partner API** (for example Swiggy's Builders Club and its official Instamart MCP, which already works on the Mac) | Real prices for the person's address | Low; this is the permitted route | Application and approval; Swiggy currently says third-party apps are not permitted yet, so use is localhost-only |
| **Government or open price data** (for example the Agmarknet daily market prices for produce) | Wholesale market prices, not shop prices | Low | Medium; free, useful for the seasonal swing already shown |
| **Scraping quick-commerce apps** (Blinkit, Zepto, Instamart) | Real-time | **High:** terms of service usually forbid it; blocks, legal letters and account bans are possible; also hits the privacy of the person's login if done on their phone | High and fragile (apps change; need addresses and logins) |
| **Price aggregator vendors** | Varies | Depends on their licence | Paid |

Previous decision (kept): unofficial Swiggy and Blinkit wrappers were declined.

## How it would plug in
The price engine already stores `price.priceHistory` per ingredient and `vendorListings` (87 sightings across 50 ingredients), and shows "stale" labels. A live source would just add new dated readings with a `source` label and a shorter staleness limit; the Prices view, trend rows and vendor compare box would pick them up unchanged. A partner API would be called by the hosted server, never from the app, with caching.

## Recommendation
1. Keep the research routine as the base layer (no change).
2. Add free government market data for produce as a second, clearly labelled source (the next best accuracy gain at no legal risk).
3. Apply to the Swiggy Builders Club; use the official route only.
4. Do not scrape.

## Decisions for Sudarsan
- Apply to Swiggy Builders Club, yes or no (still undecided)?
- Add the government market data source?
- Confirm: no scraping, including for personal use on his own phone.
