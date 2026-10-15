import { describe, expect, it } from '@jest/globals';

import { buildDish, buildIngredient, buildIngredientIndex } from '../../services/data/buildItems';
import { parseDishFile, parseOrderPrice } from '../../services/data/dishImporter';
import { parseIngredientFile } from '../../services/data/ingredientImporter';
import { checkPrice, listingEvidence, normalisePlatforms, parseListingTable } from '../../services/data/priceChecks';

// Section-6 excerpts copied from the research files (rows and headline sentences as written; prose trimmed).

/** FitPlate_Dishes_2026-10-13.md, dish 50 Chicken Korma. */
const KORMA = `Serving used for comparison: one plate of chicken korma as listed = 1 serving.

| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Shan Chinese, Jogeshwari | magicpin | ₹150 (Chicken Korma) | Not listed, treated as 1 serving | ₹150 |
| Noor Mohammadi Hotel, Kurla | Zomato | ₹180 (Chicken Korma) | Not listed, treated as 1 serving | ₹180 |
| Mao Family Restaurant, Mahim | magicpin | ₹185 (Chicken Korma); Chicken Korma [1 Kg] ₹1,160 | Not listed (1 kg also offered) | ₹185 (1 kg ÷ 4 = about ₹290) |
| Mao Family Restaurant, Kalbadevi | magicpin | ₹210 menu price (shown discounted to ₹200); 1 kg also offered | Not listed, treated as 1 serving | ₹210 |
| Cafe Alif, Jogeshwari West | magicpin | ₹225 (Chicken Korma) | Not listed, treated as 1 serving | ₹225 |
| Afzal Restaurant, Mazgaon | magicpin | ₹240 (Chicken Korma) | Not listed, treated as 1 serving | ₹240 |
| Murgori Chicken Kebab, Lower Parel | Zomato | ₹280 (Murgh Shahi Korma) | Not listed, treated as 1 serving | ₹280 |
| Charcoal Eats – Biryani & Beyond, Oshiwara, Andheri West | Zomato | ₹399 (chicken korma, "yogurt and cashew gravy") | Not listed, treated as 1 serving | ₹399 |
| Kareem's, Powai | magicpin | ₹435 (Murg Shahi Korma) | Not listed, treated as 1 serving | ₹435 |
| Singarawala, Kandivali East | Zomato | ₹520 (chicken korma) | Not listed, treated as 1 serving | ₹520 |
| One8 Commune, Juhu | Zomato | ₹855 (old-Delhi-style chicken korma, on the bone) | Not listed | ₹855 (premium, excluded) |
| Carnivore, Airoli, **Navi Mumbai** | magicpin | ₹220 menu price (Delhi Chicken Korma; shown discounted to ₹187) | Not listed | ₹220 (outside Mumbai city) |
| Jio Foods, Kharghar, **Navi Mumbai** | Zomato | ₹149 (chicken korma gravy) | Not listed | ₹149 (outside Mumbai city) |
| Simla Dhaba, **Vasai** | Zomato | ₹230 (chicken korma) | Not listed | ₹230 (outside Mumbai city) |
| Hotel Vijaya, **Ambernath (Thane district)** | Zomato | ₹310 (Chicken Shahi Korma) | Not listed | ₹310 (outside Mumbai city) |

- **Price range (1 serving = 1 plate as listed), everyday Mumbai city restaurants: ₹180–240; median about ₹230; average about ₹280. Low confidence on portion size (no listing states a size).** The ten everyday Mumbai city prices are ₹150, ₹180, ₹185, ₹210, ₹225, ₹240, ₹280, ₹399, ₹435 and ₹520 (median ₹233, average ₹282).
- Note: menu prices only. Delivery fees, taxes and discounts are excluded. Prices vary by area and change often.

**AS ORDERED (from delivery apps)**
- **Price (1 serving = 1 plate of chicken korma as listed):** average about ₹280, median about ₹230, range ₹180–240 (everyday Mumbai city restaurants; premium excluded; low confidence on portion size).
`;

/** FitPlate_Dishes_2026-10-15.md, dish 60 Aloo Matar. */
const ALOO_MATAR = `| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Geeta Bhavan, Kalbadevi | Swiggy | ₹135 (dated) | "Aloo Mattar", described as dry-style; portion not listed | ₹135 (outlet shown not accepting orders: expired food safety licence) |
| Greens Restaurant, Linkway Estate, Malad West | Swiggy | ₹275 (dated) | "Aloo Mattar", light gravy, "serves 2" | ₹137.50 (₹275 ÷ 2; outlet shown not delivering) |
| New Kathiyawadi Dhaba, **Mira Road** (Thane district) | Swiggy | ₹209.64 (dated) | "Aloo Matar", portion not listed | ₹209.64 (outside Mumbai city) |
| Pet Pooja Point (Swiggy tags the same outlet as Bhoiwada and East Kalyan; area unclear) | Swiggy | ₹240 (dated) | "Aloo Mutter", portion not listed | ₹240 |
| Ruchi Veg Restaurant, Goregaon East | Swiggy | ₹250 (dated) | "Aloo Mattar", creamy, mildly spiced tomato gravy; portion not listed | ₹250 (outlet shown closed) |
| Harish Kitchen, Majiwada, **Thane** | Swiggy | ₹269 (dated) | "Aloo Mattar", potato-and-pea curry; portion not listed | ₹269 (outside Mumbai city; outlet shown closed) |
| Navaratna Veg Restaurant, Vashi, **Navi Mumbai** | Swiggy | ₹385 (dated) | "Aloo Matar", portion not listed | ₹385 (outside Mumbai city) |
| K Bhagat Tarachand, Borivali West | Swiggy | ₹419 (dated) | "Jain Alu Mutter", portion not listed | ₹419 (Jain variant, not the standard dish; excluded from the range, used in the Jain variant) |

- **Price range (1 serving): ₹210–270; median about ₹240; average about ₹230.** Seven everyday listings (excluding the Jain ₹419 listing): ₹135, ₹137.50, ₹209.64, ₹240, ₹250, ₹269 and ₹385 (median ₹240; average ₹232.31, rounded to ₹230).
`;

/** FitPlate_Dishes_2026-10-15.md, dish 59 Chicken Kathi Roll: a range that passes every check. */
const KATHI_ROLL = `| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Rollzilla, Kandivali West | magicpin | ₹210 (Reshmi Chicken Tikka Roll) | 1 roll | ₹210 |
| Rolling Fresh (Mumbai listing; outlet area not shown) | Swiggy | ₹219 (Chicken Seekh Kathi Roll) | 1 roll | ₹219 |
| Hangla's, Powai (Kolkata-style roll chain) | magicpin | ₹225 (Chicken Roll) | 1 roll | ₹225 |
| RollsKing (Mumbai listing; outlet area not shown) | Swiggy | ₹247 (Classic Chicken Egg Roll) | 1 roll | ₹247 |
| Jatt Rolls (Mumbai listing; outlet area not shown) | Swiggy | ₹279 (Ultimate Chicken Kathi Roll) | 1 roll | ₹279 |
| Unnamed restaurant (Mumbai roll listing) | Swiggy | ₹339 (Chicken Tikka Kathi Roll); ₹369 (Malai Chicken Tikka Kathi Roll) | 1 roll | Not used: restaurant and area not visible in the snippet |
| Ayub's, Kala Ghoda / Fort | The Quint article (not a platform) | ₹230–250 (rolls) | 1 roll | Context only (dated; article date not shown) |

- **Price range (1 serving = 1 roll), everyday Mumbai restaurants: ₹210–280; median ₹225; average about ₹236.** Five everyday Mumbai prices across two platforms: ₹210, ₹219, ₹225, ₹247, ₹279 (₹279 rounds to ₹280).
`;

/** FitPlate_Dishes_2026-10-15.md, dish 57 Tomato Rice: two usable listings. */
const TOMATO_RICE = `| Restaurant | Platform | Menu price | Portion as listed | Price for 1 serving |
|---|---|---|---|---|
| Just Rice, Oshiwara / Adarsh Nagar, Andheri West | Dunzo | ₹119 ("Tomato Rice") | Not listed, treated as 1 serving | ₹119 (dated: Dunzo snapshot, undated) |
| Madras Curd Rice Company, Manpada, Thane West | Zomato (order page) | ₹225 ("Tomato Rice") | Not listed, treated as 1 serving | ₹225 (Thane) |
| Madras Curd Rice Company, Marol (Andheri East) | magicpin | ₹221 shown with an offer price of ₹99 (page dated Feb 2026) | Not listed | Not used (₹221 appears to be the struck-through price and ₹99 a discount) |
| Madras Curd Rice Company, Lower Parel | magicpin | ₹221 shown with an offer price of ₹99; "served with coconut chutney and papad churi", made with chana dal | Not listed | Not used (same reason) |
| Udupi Tiffins, Mulund West | magicpin | ₹144 ("Tomato Rice Tiffin", with raita and sheera) | Tiffin combo | ₹144 (combo, excluded) |
| Just Rice, Andheri Lokhandwala and Just Rice, Powai | Zomato (order pages) | Tomato Rice listed; price not shown in the snippet | – | Not found |
- **Price range (1 serving): ₹120–220 (low confidence).** Only two usable everyday prices (₹119 and ₹225), rounded to the nearest ₹10 without rounding up (₹225 → ₹220).
`;

describe('parseOrderPrice: listing evidence and headline figures', () => {
  it('dish 50: keeps the stated average (₹280) and median (₹230) and counts only Mumbai-city rows in the range', () => {
    const p = parseOrderPrice(KORMA);
    expect(p).toMatchObject({ min: 180, max: 240, statedAvg: 280, median: 230 });
    // The engine average stays null: ₹280 belongs to the full spread, not the range.
    expect(p?.avg).toBeNull();
    // ₹180, ₹185, ₹210, ₹225, ₹240; the out-of-city ₹220 and ₹230 do not back a "Mumbai city" range.
    expect(p?.listingCount).toBe(5);
    expect(p?.platforms).toEqual(['magicpin', 'Zomato']);
    expect(p?.outOfStock).toBe(false);
  });

  it('dish 60: Swiggy only, 4 listings in ₹210–270 (₹209.64 rounds in), one of them shown closed', () => {
    const p = parseOrderPrice(ALOO_MATAR);
    expect(p).toMatchObject({ min: 210, max: 270, statedAvg: 230, median: 240, listingCount: 4, platforms: ['Swiggy'], outOfStock: true });
  });

  it('leaves dropped, "not used" and "context only" rows out', () => {
    const rows = parseListingTable(KATHI_ROLL, 'dish');
    expect(rows).toHaveLength(7);
    expect(rows?.filter((r) => r.excluded).map((r) => r.source)).toEqual(['Unnamed restaurant (Mumbai roll listing)', "Ayub's, Kala Ghoda / Fort"]);
    expect(listingEvidence(rows, { min: 210, max: 280 }, 5)).toEqual({ listingCount: 5, platforms: ['magicpin', 'Swiggy'], outOfStock: false });
  });

  it('gives a null count when there is no listing table, rather than guessing', () => {
    const p = parseOrderPrice('- **Price range (1 serving): ₹120–150.**\n- Average (1 serving): about ₹130\n');
    expect(p).toMatchObject({ min: 120, max: 150, avg: 130, statedAvg: 130, listingCount: null, platforms: [], outOfStock: false });
    expect(checkPrice({ ...p!, avg: p!.statedAvg }).confirmed).toBe(true);
  });

  it('reads platform names, ignoring remarks in brackets', () => {
    expect(normalisePlatforms('Zomato and magicpin (same price)')).toEqual(['Zomato', 'magicpin']);
    expect(normalisePlatforms("Restaurant's own website (says it delivers via Swiggy and Zomato; app price not seen)")).toEqual(["Restaurant's own website"]);
    expect(normalisePlatforms('Swiggy (Mumbai dish page)')).toEqual(['Swiggy']);
  });
});

describe('checkPrice: one test per rule', () => {
  const korma = parseOrderPrice(KORMA)!;
  const alooMatar = parseOrderPrice(ALOO_MATAR)!;

  it('rule 1: dish 50 average ₹280 outside ₹180–240 → not confirmed', () => {
    const c = checkPrice({ ...korma, avg: korma.statedAvg });
    expect(c.confirmed).toBe(false);
    expect(c.checkNotes).toEqual(['average ₹280 lies outside the range ₹180–₹240']);
  });

  it('rule 1: a median outside the range is flagged too (synthetic median; no research file has one yet)', () => {
    const c = checkPrice({ ...korma, avg: null, median: 250 });
    expect(c.checkNotes).toEqual(['median ₹250 lies outside the range ₹180–₹240']);
  });

  it('rule 2: dish 60 rests on 1 platform (Swiggy) → not confirmed', () => {
    const c = checkPrice({ ...alooMatar, avg: alooMatar.statedAvg, outOfStock: false });
    expect(c).toMatchObject({ confirmed: false, listingCount: 4, platforms: ['Swiggy'] });
    expect(c.checkNotes).toEqual(['only 1 platform (Swiggy) backs the range']);
  });

  it('rule 2: dish 57 rests on 2 listings → not confirmed', () => {
    const p = parseOrderPrice(TOMATO_RICE)!;
    expect(p).toMatchObject({ listingCount: 2, platforms: ['Dunzo', 'Zomato'] });
    expect(checkPrice({ ...p, avg: p.statedAvg }).checkNotes).toEqual(['only 2 listings back the range (need 3)']);
  });

  it('rule 3: dish 60 uses a listing shown closed → not confirmed', () => {
    const c = checkPrice({ ...alooMatar, avg: alooMatar.statedAvg, platforms: ['Swiggy', 'Zomato'] });
    expect(c.checkNotes).toEqual(['a listing used for the range is marked out of stock, closed or not taking orders']);
  });

  it('passes dish 59: 5 listings on 2 platforms, average ₹236 and median ₹225 inside ₹210–280', () => {
    const p = parseOrderPrice(KATHI_ROLL)!;
    expect(p).toMatchObject({ statedAvg: 236, median: 225 });
    expect(checkPrice({ ...p, avg: p.statedAvg })).toEqual({ listingCount: 5, platforms: ['magicpin', 'Swiggy'], outOfStock: false, confirmed: true, checkNotes: [] });
  });
});

describe('price checks reach the built records', () => {
  const dishFile = (n: number, name: string, section6: string) =>
    `## ${n}. ${name}\nNorth Indian | Veg | Lunch\n\n### 2. Ingredients (1 serving)\n| Ingredient | Quantity | Household |\n|---|---|---|\n| Potato (aloo) | 150 g | 1 medium |\n\n### 6. Cost to order (1 serving)\n${section6}\n`;

  it('dish 60: stores listingCount, platforms and confirmed: false, and lists the reasons for review', () => {
    const [v] = parseDishFile(dishFile(60, 'Aloo Matar', ALOO_MATAR), 'FitPlate_Dishes_2026-10-15.md');
    const dish = buildDish([v], '2026-10-15', buildIngredientIndex([]));
    expect(dish.orderPrice).toMatchObject({ listingCount: 4, platforms: ['Swiggy'], outOfStock: true, confirmed: false });
    expect(dish.orderPrice?.currentEstimate).not.toBeNull();
    expect(dish.needsReview).toEqual(
      expect.arrayContaining([
        'price not confirmed (2026-10-15): only 1 platform (Swiggy) backs the range',
        'price not confirmed (2026-10-15): a listing used for the range is marked out of stock, closed or not taking orders',
      ]),
    );
  });

  it('dish 59: a confirmed price adds nothing to needs-review', () => {
    const [v] = parseDishFile(dishFile(59, 'Chicken Kathi Roll', KATHI_ROLL), 'FitPlate_Dishes_2026-10-15.md');
    const dish = buildDish([v], '2026-10-15', buildIngredientIndex([]));
    expect(dish.orderPrice).toMatchObject({ confirmed: true, checkNotes: [] });
    expect(dish.needsReview.filter((n) => n.startsWith('price not confirmed'))).toEqual([]);
  });

  it('ingredient: chicken leg (2026-10-12) rests on 2 BigBasket listings, one out of stock', () => {
    const file = [
      '## Summary',
      '| Ingredient | Category | Standard unit | Price range | Average | Per 100 g | Sources checked | Confidence |',
      '|---|---|---|---|---|---|---|---|',
      '| Chicken leg, skinless, bone-in (murgh ki tangri / leg piece) | Meat/seafood | per kg | ₹460–530 | ₹495 | ₹46.0–53.0 | 9 | Low |',
      '',
      '## Chicken leg, skinless, bone-in (murgh ki tangri / leg piece)',
      '### 2. Price (Mumbai)',
      '| Source | Pack size | Pack price | Price per standard unit |',
      '|---|---|---|---|',
      '| BigBasket, Chicken Leg Without Skin, 3–4 pcs (marked out of stock in the snapshot; date not shown) | 450 g | ₹239 | ₹531/kg |',
      '| BigBasket, fresho Chicken Thigh Without Skin (bone-in not stated; date not shown) | 900 g | ₹415 | ₹461/kg |',
      '| *Reference (with skin, not used for range):* BigBasket, Chicken Leg With Skin, 3–4 pcs | 450 g | ₹199 | ₹442/kg |',
      '| *Reference (different cut):* Amazon, "Elicious" Fresh Chicken Curry Cut Skinless, via price-history.in | 500 g | ₹130 (MRP ₹175) | ₹260/kg |',
      '| *Dropped (premium):* BigBasket, FreshToHome Premium Chicken Drumsticks Skinless | 280 g | ₹350 | about ₹1,250/kg |',
      '',
      '- **Range:** ₹460–530/kg. **Average:** ₹495/kg (midpoint of ₹461 and ₹531, rounded to the nearest ₹5).',
    ].join('\n');
    const [v] = parseIngredientFile(file, 'FitPlate_Ingredients_2026-10-12.md').items;
    expect(v.price).toMatchObject({ min: 460, max: 530, avg: 495, listingCount: 2, platforms: ['BigBasket'], outOfStock: true });
    const built = buildIngredient([v], '2026-10-15');
    expect(built.price).toMatchObject({ confirmed: false, listingCount: 2, platforms: ['BigBasket'] });
    expect(built.price?.checkNotes).toEqual([
      'only 2 listings back the range (need 3)',
      'only 1 platform (BigBasket) backs the range',
      'a listing used for the range is marked out of stock, closed or not taking orders',
    ]);
    expect(built.needsReview).toHaveLength(3);
  });
});
