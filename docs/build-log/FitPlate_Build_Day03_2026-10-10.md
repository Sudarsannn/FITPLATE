# FitPlate Build — Day 03 — 2026-10-10 (evening run)

## 1. HEADER

**Day 03 of 37 | Roadmap item: Data models and storage (cloud-first, SPEC-ADDENDA §5) | Phase 0: Foundation and data pipeline | Progress: 8% of the full app (3 ÷ 37)**

**Status: PARTIAL.** The data types, the storage layer and its tests are done and pushed. Connecting the app's screens to this layer is Day 03b, the next run.

- **How this run's day was determined:**
  - The newest build file is `FitPlate_Build_Day02_2026-10-10.md`. Its BUILD STATE says Day 2 is ✅ done and "Next up: Day 03", so this run is Day 03.
  - This is the first evening run (22:52 IST) under the new twice-daily schedule. It is the second build file dated 2026-10-10.
- **Supervisor review:** there is no `FitPlate_Review_*.md` yet; the first one is due 2026-10-11. No FIX LIST.
- **Context available:**
  - Code source **(a)**: branch `claude/project-thread-wchnlm` at b72c4f7 (Day 02).
  - Spec: `PROMPT.md`, including the new "TWICE-DAILY PACE, QUALITY BAR AND INNOVATION" section, plus `SPEC-ADDENDA.md` §1, §2, §4 and §5.
  - Research files visible:
    - Dishes: 7 (2026-10-04 … 2026-10-10)
    - Ingredients: 7 (2026-10-04 … 2026-10-10)
    - Nutrients: 2 (2026-10-09, 2026-10-10)
    - Fitness: 2 (2026-10-09, 2026-10-10)
  - Nothing is new since Day 02.

## 2. SUMMARY

1. Every kind of user data now has a fixed type: the profile, meal, water, supplement and workout logs, saved dishes, meal plans and savings. The dish and ingredient research data also has types; dishes keep "as ordered" nutrition separate from "home-cooked" nutrition.
2. A new storage layer can save each user's data to Firestore under `users/{their id}`, with a copy on the phone. It works offline, sends changes in small batches, retries after a lost connection or a restart, and resolves clashes between devices by "latest edit wins".
3. Guests keep their data on the device. When a guest signs in, their own logs can be copied into the account. The demo's made-up sample week and the seeded ₹2,860 are recognised and never copied.
4. 38 new automated tests run against a mocked Firestore, never the real project. They cover save, load, update, delete and migration, offline retry, two devices syncing, and sign-out.
5. Nothing on screen changes yet. Tomorrow morning's run (Day 03b) connects the app to this layer. Your Firestore setup is needed before cloud sync can go live.

## 3. DATA SYNC REPORT

- **New research files since the last run:** none. This is the evening run; the research routines ran this morning and Day 02 already recorded their files.
- **Ingested:** nothing. Importers start on Day 4 (dishes, ingredients) and Day 5 (nutrients, hydration, fitness).
- **Backlog remaining (unchanged):**
  - Dishes: 7 files / 35 items
  - Ingredients: 7 files / 110 entries
  - Nutrients: 2 files / 4 topics
  - Fitness: 2 files / 8 items
- **Price trends, conflicts, outliers, spikes, "needs review":** none (nothing merged yet).
- **Unmatched ingredient names:** not checked yet (Day 5).
- **New research gaps:** none.

## 4. DESIGN NOTES

No screens changed today. Design decisions inside the data layer:

- **Device first, then cloud.** Every save lands on the phone at once, so the app never waits on the network. It reaches Firestore within about 1.5 seconds, or as soon as the connection returns.
- **Water is one document per day** (`water-YYYY-MM-DD`). Ten taps on "+" update one counter, so ten taps make one cloud write after the debounce instead of ten separate writes. This keeps a heavy user far inside the free tier.
- **Soft delete.** Deleting marks the document `deleted: true`, so a laptop learns that the phone deleted something. On a clash the later edit or deletion wins.
- **The demo's sample week stays out of real accounts.** The sample week is made-up demo data, so it is marked as such on the device and skipped when a guest copies their data to an account.
- **Body data stays null** (age, height, weight) until the user enters it on Day 16. The app never guesses it.
- **Copy for Day 03b's sign-in prompt** (planned):
  - Title: "Bring your data with you?"
  - Body: "Copy the meals, water and workouts you logged on this device into your account, so they show on every device."
  - Buttons: **Copy my data** / **Start fresh**

## 5. INNOVATION

New ideas this run. They are user problems first, then a solution, and they are not yet in the IDEAS BACKLOG.

1. **Fridge rescue** · NEW FEATURE · Impact 4 · Effort S (after Day 6)
   - **Problem:** "Half a cabbage and two tomatoes are going bad and I have no idea what to cook with them." This hits busy professionals and PG/hostel cooks who buy groceries in bulk on quick-commerce apps.
   - **Solution:** a "What's in my fridge?" picker on the Cook tab. Tap up to 5 ingredients and see the dishes that use them, ranked by how many you already have. It reuses each dish's `leftoverRemix` text.
   - **Data:** dish ingredient lists and ingredient ids, which arrive on Days 4–5. No new research stream is needed.
   - **Risk:** none.
2. **Monsoon swap** · IMPROVE (price engine and substitutes) · Impact 3 · Effort S (after Day 8)
   - **Problem:** "Tomatoes are suddenly ₹120 a kilo and my dish now costs more than ordering." This hits budget-conscious users in the monsoon and summer spikes.
   - **Solution:** when the price engine flags an ingredient as "possible spike" or rising and it is seasonal, the dish screen offers a cheaper swap from that ingredient's `substitutes` list and shows the new cost to make.
   - **Data:** ingredient substitutes and the price trend engine (spec section E). No new research is needed.
   - **Risk:** taste and nutrition change with a swap, so the app says so.
3. **Office canteen builder** · IMPROVE (meal logging) · Impact 5 · Effort M
   - **Problem:** "I eat the office thali every day but have no idea how many calories it is, so I stop logging." This is the core target user, the tired corporate.
   - **Solution:** build a thali from parts in 3 taps, for example 2 rotis, 1 katori dal, 1 sabzi, rice (½ or 1), curd and salad. The app saves it as "my usual canteen thali" for one-tap logging every day after that.
   - **Data:** per-katori and per-roti nutrition for common thali components. This is **not in any research stream yet**, so it needs a small research addition. See USER ACTIONS: "Decision needed".
   - **Risk:** portion sizes vary, so the result is labelled an estimate.
4. **Fasting mode** · NEW SEGMENT · Impact 4 · Effort M
   - **Problem:** "During Navratri or Ekadashi half the app's dishes are useless to me, and during Ramadan I need water reminders that fit sehri and iftar." This covers people who fast for religious reasons, a very large group in India.
   - **Solution:** a fasting profile (Navratri/vrat, Ekadashi, Ramadan, Jain). It filters dishes to fast-friendly ones, suggests sabudana, kuttu and rajgira options, and moves water reminders to the eating window.
   - **Data:** dish research would need a "fasting suitability" field, and a few vrat dishes would need adding to the 100-dish list. This is a research prompt change, see USER ACTIONS: "Decision needed".
   - **Risk:** health. People with diabetes should not fast without medical advice, so a disclaimer is required.
5. **Parents' plate** · NEW SEGMENT · Impact 4 · Effort M
   - **Problem:** "My parents in Pune have BP and sugar and I worry about what they eat, but they won't use an app." This hits working adults caring for elderly parents remotely.
   - **Solution:** build a week's low-salt, low-sugar plan for someone else and share it, with its grocery list, as one WhatsApp message or printable card. The flags come from the ingredient sodium and sugar data (SPEC-ADDENDA §2).
   - **Data:** the ingredient nutrient profiles that exist from 2026-10-09 onwards. Coverage grows with re-pricing.
   - **Risk:** health. This is not medical advice, so the screen tells people to follow their doctor's diet plan and states that.

**Built today:** none. Day 03 is a large foundation day and is not finished (the app wiring moves to Day 03b), so the spec's "BUILD ONE" step is skipped this run.

## 6. DATA FILES

None today (no importer yet).

## 7. CODE FILES

| Path | NEW or CHANGED | Purpose |
|---|---|---|
| `src/models/common.ts` | NEW | BaseDoc fields every user document has |
| `src/models/user.ts` | NEW | UserProfile and its defaults |
| `src/models/logs.ts` | NEW | Meal, water, supplement and workout logs; favourites, meal plans, savings |
| `src/models/research.ts` | NEW | Dish, Ingredient and other research content types |
| `src/models/index.ts` | NEW | Re-exports |
| `src/services/storage/kv.ts` | NEW | Key-value interface (AsyncStorage shape) and an in-memory version |
| `src/services/storage/storageService.ts` | NEW | Typed versioned keys, migration hook, exportAll, resetAll |
| `src/services/storage/docStore.ts` | NEW | DocStore interface and the device store |
| `src/services/storage/remote.ts` | NEW | Cloud paths (users/{uid}/…) and the cloud DocStore |
| `src/services/storage/firestoreRemote.ts` | NEW | Real Firestore adapter (JS SDK; persistent cache on web) |
| `src/services/storage/syncedStore.ts` | NEW | Device-first store with outbox, debounce and retry |
| `src/services/storage/lww.ts` | NEW | Last-write-wins merge |
| `src/services/storage/repository.ts` | NEW | Generic repository with soft delete and migrations |
| `src/services/storage/schemas.ts` | NEW | Collections and schema versions |
| `src/services/storage/legacy.ts` | NEW | Migration from the demo blob fitplate.state.v2 |
| `src/services/storage/guest.ts` | NEW | Guest → account copy |
| `src/services/storage/index.ts` | NEW | openUserData and createRepositories |
| `src/__tests__/storage/fakes.ts` | NEW | Mocked Firestore and clock for tests |
| `src/__tests__/storage/storageService.test.ts` | NEW | Storage service tests |
| `src/__tests__/storage/repository.test.ts` | NEW | Save, load, update, delete and migration tests |
| `src/__tests__/storage/sync.test.ts` | NEW | Merge, cloud path, outbox and offline tests |
| `src/__tests__/storage/legacy.test.ts` | NEW | Demo-blob migration, guest copy and two-device tests |
| `docs/DATA_MODEL.md` | CHANGED | Fields per collection, sync, migration, changelog |

### `src/models/common.ts`

```ts
/**
 * Fields every stored user document carries (SPEC-ADDENDA §5). They make the
 * same record mergeable across devices: `updatedAt` decides conflicts
 * (last write wins) and `deleted` tells other devices about a deletion.
 */
export type BaseDoc = {
  id: string;
  /** Epoch ms when first written. */
  createdAt: number;
  /** Epoch ms of the last change. */
  updatedAt: number;
  /** Version of this document type; older documents are migrated when read. */
  schemaVersion: number;
  /** Soft delete. Deleted documents stay so other devices learn about it. */
  deleted: boolean;
};

/** Local calendar day, `YYYY-MM-DD`, the same format as `dayKey()` in the demo store. */
export type DateKey = string;

/** A document as written by a repository: its own fields plus the common ones. */
export type Doc<T> = T & BaseDoc;

/** Fields a caller supplies when creating a document (the repository fills the rest). */
export type NewDoc<T> = T & { id?: string };
```

### `src/models/user.ts`

```ts
import type { DateKey } from './common';

export type Goal = 'lose' | 'maintain' | 'gain' | 'muscle';
export type DietType = 'veg' | 'egg' | 'non-veg';
export type CookingLevel = 'beginner' | 'expert';
export type Sex = 'female' | 'male' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';

/**
 * The user's profile, stored at `users/{uid}` (one document, id "profile").
 * Body fields are null until the user enters them (Day 16 targets engine);
 * nothing is guessed.
 */
export type UserProfile = {
  name: string;
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal;
  dietType: DietType;
  cookingLevel: CookingLevel;
  equipmentOwned: string[];
  gymAccess: boolean | null;
  breakfastReminder: boolean;
  onboarded: boolean;
  /** Optional private flags (e.g. a health condition). Never shown outside the app. */
  privateFlags: Record<string, boolean>;
  /** Day the onboarding finished, when known. */
  onboardedOn: DateKey | null;
};

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  goal: 'lose',
  dietType: 'non-veg',
  cookingLevel: 'beginner',
  equipmentOwned: [],
  gymAccess: null,
  breakfastReminder: true,
  onboarded: false,
  privateFlags: {},
  onboardedOn: null,
};
```

### `src/models/logs.ts`

```ts
import type { DateKey } from './common';

/**
 * Logs the user creates. Each one is a document in its own subcollection of
 * `users/{uid}` and refers to research content by id only.
 * `demoSample` marks the demo's made-up sample week, so it is never copied
 * into a real account.
 */
type LogBase = {
  /** Epoch ms of the moment logged. */
  timestamp: number;
  dateKey: DateKey;
  demoSample?: boolean;
};

export type MealSource = 'dish' | 'quick' | 'custom';

export type MealLog = LogBase & {
  name: string;
  emoji: string;
  /** Research dish id when the meal is a FitPlate dish; null for quick or custom meals. */
  dishId: string | null;
  source: MealSource;
  kcal: number;
  proteinG: number;
  fibreG: number;
  /** True when cooked at home. */
  cooked: boolean;
};

/** One document per day (id `water-YYYY-MM-DD`), so +/- taps update one counter. */
export type WaterLog = LogBase & {
  glasses: number;
};

export type SupplementLog = LogBase & {
  name: string;
  /** Research nutrient id (e.g. "vitamin-d") when known. */
  nutrientId: string | null;
  dose: number | null;
  unit: string | null;
};

export type WorkoutLog = LogBase & {
  type: string;
  /** Research exercise id once the exercise library exists (Day 21). */
  exerciseId: string | null;
  minutes: number;
  /** Estimate (MET × weight × hours). */
  kcal: number;
};

/** Saved dish (id = dishId). */
export type Favourite = { dishId: string };

/** One document per planned day (id = dateKey). */
export type MealPlanDay = {
  dateKey: DateKey;
  slots: Partial<Record<'breakfast' | 'lunch' | 'dinner', string>>;
};

/** Money saved by cooking instead of ordering. */
export type SavingEntry = {
  timestamp: number;
  amountInr: number;
  dishId: string | null;
  note: string | null;
};
```

### `src/models/research.ts`

```ts
/**
 * Research content types. These ship as bundled JSON (never in Firestore).
 * Field names follow the spec's DEFAULT ARCHITECTURE; the importers on Days 4–5
 * fill them from the research files, and null always means "not found".
 */

export type Confidence = 'High' | 'Medium' | 'Low';

export type Provenance = {
  versions: { date: string; file: string }[];
  mergeMethod: Record<string, string>;
  mergeNotes: string[];
};

/** Output of the price trend engine (spec section E). */
export type PriceEstimate = {
  priceHistory: { date: string; min: number; max: number; avg: number; confidence: Confidence | null; sourceFile: string }[];
  currentEstimate: { min: number; max: number; avg: number } | null;
  method: 'single' | 'wma' | 'latest-trend' | 'spike-blend';
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
  change30dPct: number | null;
  lastObserved: string | null;
  stale: boolean;
  seasonal: boolean;
};

export type SourcedValue = { value: number | null; source: string | null; confidence?: Confidence | null };

export type Macros = { kcal: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null; fibreG: number | null };

export type DishIngredient = { ingredientId: string | null; name: string; quantity: number | null; unit: string | null; householdMeasure: string | null };

export type Dish = Provenance & {
  id: string;
  number: number;
  name: string;
  cuisine: string | null;
  dietType: 'veg' | 'egg' | 'non-veg' | null;
  mealType: string[];
  difficulty: string | null;
  prepMin: number | null;
  cookMin: number | null;
  servings: 1;
  ingredients: DishIngredient[];
  equipment: string[];
  steps: { n: number; text: string; timerSec: number | null; tip: string | null }[];
  /** As-cooked recipe nutrition per serving. Never mixed with `asOrdered`. */
  nutritionPerServing: Macros;
  microNutrientsEstimate: { values: Record<string, number | null>; coveragePct: number; basis: string } | null;
  /** SPEC-ADDENDA §1: what restaurants publish for the delivered dish. */
  asOrdered: {
    price: PriceEstimate | null;
    nutrition: { calories: SourcedValue; protein: SourcedValue; carbs: SourcedValue; fat: SourcedValue; fibre: SourcedValue } | null;
    restaurantsSampled: number | null;
    platforms: string[];
  } | null;
  orderPrice: PriceEstimate | null;
  /** "Healthiness score" (out of 10). One of the THREE separate scores. */
  healthiness: { score: number | null; reasons: string[] } | null;
  /** "Rating" from research. One of the THREE separate scores. */
  researchRating: { score: number | null; basis: string | null } | null;
  storage: string | null;
  leftoverRemix: string | null;
  burnOff: string | null;
  sources: string[];
};

export type NutrientPer100 = {
  basis: '100g' | '100ml';
  energyKcal: SourcedValue;
  proteinG: SourcedValue;
  carbsG: SourcedValue;
  sugarsG: SourcedValue;
  fatG: SourcedValue;
  saturatedFatG: SourcedValue;
  fibreG: SourcedValue;
  sodiumMg: SourcedValue;
  ironMg: SourcedValue;
  calciumMg: SourcedValue;
  potassiumMg: SourcedValue;
  magnesiumMg: SourcedValue;
  zincMg: SourcedValue;
  vitaminCMg: SourcedValue;
  vitaminAUgRae: SourcedValue;
  folateUgDfe: SourcedValue;
};

export type Ingredient = Provenance & {
  id: string;
  name: string;
  aliases: string[];
  category: string | null;
  standardUnit: string | null;
  price: PriceEstimate | null;
  per100Estimate: { min: number; max: number; avg: number } | null;
  seasonal: boolean;
  /** SPEC-ADDENDA §2 profile; null until a research file carries it. */
  nutritionPer100g: NutrientPer100 | null;
  storage: string | null;
  substitutes: string[];
};

/**
 * Nutrient, Hydration, Guidance and Exercise items follow the JSON blocks in
 * their research files exactly; Day 5 replaces these with the full shapes.
 */
export type ResearchItem = Provenance & { id: string; name: string; [key: string]: unknown };
export type Nutrient = ResearchItem;
export type Hydration = ResearchItem;
export type Guidance = ResearchItem;
export type Exercise = ResearchItem;
```

### `src/models/index.ts`

```ts
export * from './common';
export * from './logs';
export * from './research';
export * from './user';
```

### `src/services/storage/kv.ts`

```ts
/**
 * The subset of AsyncStorage the storage layer uses. AsyncStorage itself fits
 * it, and tests pass an in-memory map, so nothing here needs a device.
 */
export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
  multiRemove(keys: readonly string[]): Promise<void>;
};

/** In-memory store for tests and for environments without AsyncStorage. */
export function memoryKeyValueStore(seed: Record<string, string> = {}): KeyValueStore & { dump(): Record<string, string> } {
  const map = new Map(Object.entries(seed));
  return {
    async getItem(k) {
      return map.has(k) ? map.get(k)! : null;
    },
    async setItem(k, v) {
      map.set(k, v);
    },
    async removeItem(k) {
      map.delete(k);
    },
    async getAllKeys() {
      return [...map.keys()];
    },
    async multiRemove(keys) {
      keys.forEach((k) => map.delete(k));
    },
    dump() {
      return Object.fromEntries(map);
    },
  };
}
```

### `src/services/storage/storageService.ts`

```ts
import type { KeyValueStore } from './kv';

/** Every key this app writes starts with this, so export and reset never touch other apps' data. */
export const KEY_PREFIX = 'fitplate.';

/**
 * A typed storage key. The stored value is wrapped as `{ version, data }`;
 * when an older version is read, `migrate` upgrades it and the result is
 * written back once.
 */
export type StorageKey<T> = {
  /** Short name; the full key is `fitplate.<name>.v<version>`. */
  name: string;
  version: number;
  fallback: () => T;
  /** Upgrade data written by an older version of this key. */
  migrate?: (data: unknown, fromVersion: number) => T;
};

type Envelope = { version: number; data: unknown };

export const fullKey = (k: { name: string; version: number }) => `${KEY_PREFIX}${k.name}.v${k.version}`;

export function createStorageService(kv: KeyValueStore) {
  async function read<T>(key: StorageKey<T>): Promise<T> {
    const raw = await kv.getItem(fullKey(key));
    if (raw !== null) {
      const env = parse(raw);
      if (env && env.version === key.version) return env.data as T;
    }
    // Look for the same name under an older version and migrate it forward.
    if (key.migrate) {
      for (let v = key.version - 1; v >= 1; v--) {
        const oldRaw = await kv.getItem(fullKey({ name: key.name, version: v }));
        const env = oldRaw === null ? null : parse(oldRaw);
        if (!env) continue;
        const upgraded = key.migrate(env.data, v);
        await write(key, upgraded);
        return upgraded;
      }
    }
    return key.fallback();
  }

  async function write<T>(key: StorageKey<T>, data: T): Promise<void> {
    const env: Envelope = { version: key.version, data };
    await kv.setItem(fullKey(key), JSON.stringify(env));
  }

  async function remove(key: { name: string; version: number }): Promise<void> {
    await kv.removeItem(fullKey(key));
  }

  async function appKeys(): Promise<string[]> {
    return (await kv.getAllKeys()).filter((k) => k.startsWith(KEY_PREFIX));
  }

  /** Everything FitPlate stored on this device, parsed, for "export my data". */
  async function exportAll(): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    for (const k of await appKeys()) {
      const raw = await kv.getItem(k);
      if (raw !== null) out[k] = parse(raw) ?? raw;
    }
    return out;
  }

  /** Delete every FitPlate key on this device (or only those starting with `prefix`). */
  async function resetAll(prefix: string = KEY_PREFIX): Promise<number> {
    const keys = (await appKeys()).filter((k) => k.startsWith(prefix));
    await kv.multiRemove(keys);
    return keys.length;
  }

  return { read, write, remove, exportAll, resetAll };
}

export type StorageService = ReturnType<typeof createStorageService>;

function parse(raw: string): Envelope | null {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && typeof v.version === 'number' && 'data' in v ? (v as Envelope) : null;
  } catch {
    return null;
  }
}
```

### `src/services/storage/docStore.ts`

```ts
import type { BaseDoc } from '../../models/common';
import type { KeyValueStore } from './kv';
import { KEY_PREFIX } from './storageService';

/**
 * Where user documents live. A collection is a flat id → document map.
 * Deleted documents are kept (soft delete), so `getAll` returns them too.
 */
export type DocStore = {
  getAll<T extends BaseDoc>(collection: string): Promise<Record<string, T>>;
  putMany<T extends BaseDoc>(collection: string, docs: T[]): Promise<void>;
};

/** Device key for one owner's collection. Owner is "guest" or a Firebase uid. */
export const docsKey = (owner: string, collection: string) => `${KEY_PREFIX}docs.${owner}.${collection}.v1`;
export const ownerPrefix = (owner: string) => `${KEY_PREFIX}docs.${owner}.`;

/**
 * AsyncStorage-backed store: the only store for guests, and the offline cache
 * for signed-in users. One key per collection keeps reads to one call.
 */
export function createLocalDocStore(kv: KeyValueStore, owner: string): DocStore {
  // Serialise writes per collection, so two quick saves never overwrite each other.
  const queues = new Map<string, Promise<void>>();

  async function getAll<T extends BaseDoc>(collection: string): Promise<Record<string, T>> {
    const raw = await kv.getItem(docsKey(owner, collection));
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, T>;
    } catch {
      return {};
    }
  }

  function putMany<T extends BaseDoc>(collection: string, docs: T[]): Promise<void> {
    const prev = queues.get(collection) ?? Promise.resolve();
    const next = prev.then(async () => {
      const all = await getAll<T>(collection);
      for (const d of docs) all[d.id] = d;
      await kv.setItem(docsKey(owner, collection), JSON.stringify(all));
    });
    queues.set(collection, next.catch(() => {}));
    return next;
  }

  return { getAll, putMany };
}
```

### `src/services/storage/remote.ts`

```ts
import type { BaseDoc } from '../../models/common';
import type { DocStore } from './docStore';

/** The profile lives on the user document itself, `users/{uid}`. */
export const PROFILE_COLLECTION = 'profile';
export const PROFILE_ID = 'profile';

/**
 * The few Firestore operations the app needs, by document path. The real
 * implementation is in firestoreRemote.ts; tests pass a fake, so they never
 * touch the real project.
 */
export type RemoteAdapter = {
  /** All documents of a collection path, or the single document at a doc path. */
  getCollection(path: string): Promise<BaseDoc[]>;
  getDoc(path: string): Promise<BaseDoc | null>;
  /** Write documents in batches (Firestore batches hold at most 500 writes). */
  setMany(writes: { path: string; data: BaseDoc }[]): Promise<void>;
};

export const userDocPath = (uid: string) => `users/${uid}`;
export const collectionPath = (uid: string, collection: string) => `users/${uid}/${collection}`;

export function docPath(uid: string, collection: string, id: string): string {
  return collection === PROFILE_COLLECTION ? userDocPath(uid) : `${collectionPath(uid, collection)}/${id}`;
}

/** A DocStore view of one signed-in user's Firestore data. */
export function createRemoteDocStore(adapter: RemoteAdapter, uid: string): DocStore {
  if (!uid) throw new Error('A signed-in user id is required for the cloud store.');
  return {
    async getAll<T extends BaseDoc>(collection: string) {
      const docs =
        collection === PROFILE_COLLECTION
          ? [await adapter.getDoc(userDocPath(uid))].filter((d): d is BaseDoc => d !== null)
          : await adapter.getCollection(collectionPath(uid, collection));
      return Object.fromEntries(docs.map((d) => [d.id, d as T]));
    },
    async putMany<T extends BaseDoc>(collection: string, docs: T[]) {
      if (docs.length === 0) return;
      await adapter.setMany(docs.map((d) => ({ path: docPath(uid, collection, d.id), data: d })));
    },
  };
}
```

### `src/services/storage/firestoreRemote.ts`

```ts
import { getApp, getApps } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import type { BaseDoc } from '../../models/common';
import type { RemoteAdapter } from './remote';

// Firestore's own batch limit.
const MAX_BATCH = 500;

let db: Firestore | null = null;

/**
 * Firestore on the Firebase JS SDK (all platforms, SPEC-ADDENDA §5). The web
 * build keeps a persistent offline cache in IndexedDB; native uses the memory
 * cache, and the app's AsyncStorage copy covers offline there.
 * Returns null when Firebase is not set up (no .env keys), so callers fall
 * back to device storage.
 */
export function getDb(): Firestore | null {
  if (db) return db;
  if (!getApps().length) return null;
  db = initializeFirestore(getApp(), {
    localCache: Platform.OS === 'web' ? persistentLocalCache({ tabManager: persistentMultipleTabManager() }) : memoryLocalCache(),
    ignoreUndefinedProperties: true,
  });
  return db;
}

export function createFirestoreAdapter(firestore: Firestore): RemoteAdapter {
  return {
    async getCollection(path) {
      const snap = await getDocs(collection(firestore, path));
      return snap.docs.map((d) => d.data() as BaseDoc);
    },
    async getDoc(path) {
      const snap = await getDoc(doc(firestore, path));
      return snap.exists() ? (snap.data() as BaseDoc) : null;
    },
    async setMany(writes) {
      for (let i = 0; i < writes.length; i += MAX_BATCH) {
        const batch = writeBatch(firestore);
        for (const w of writes.slice(i, i + MAX_BATCH)) batch.set(doc(firestore, w.path), w.data);
        await batch.commit();
      }
    },
  };
}
```

### `src/services/storage/syncedStore.ts`

```ts
import type { BaseDoc } from '../../models/common';
import type { DocStore } from './docStore';
import type { KeyValueStore } from './kv';
import { mergeCollections } from './lww';
import { KEY_PREFIX } from './storageService';

type Outbox = Record<string, string[]>; // collection → ids waiting to reach the cloud

export const outboxKey = (owner: string) => `${KEY_PREFIX}outbox.${owner}.v1`;

export type SyncedDocStore = DocStore & {
  /** Push every queued write now. Resolves to the number of documents sent. */
  flush(): Promise<number>;
  /** Merge one collection with the cloud (last write wins) and update both sides. */
  pull(collection: string): Promise<void>;
  /** Documents still waiting to reach the cloud. */
  pending(): Promise<number>;
};

/**
 * Local-first store for a signed-in user. Every write lands on the device
 * first (so it works offline and shows at once), joins an outbox, and is sent
 * to Firestore in one batch after `debounceMs`. If the cloud write fails
 * (offline, rules not set up), the outbox keeps the ids and the next flush
 * retries. Batching and debouncing keep a busy day far below the Spark
 * free tier (about 20,000 writes a day).
 */
export function createSyncedDocStore(opts: {
  local: DocStore;
  remote: DocStore;
  kv: KeyValueStore;
  owner: string;
  debounceMs?: number;
  onError?: (e: unknown) => void;
}): SyncedDocStore {
  const { local, remote, kv, owner, debounceMs = 1500, onError } = opts;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let flushing: Promise<number> | null = null;
  // Outbox reads and writes run one at a time so a save and a flush never lose each other's ids.
  let outboxLock: Promise<unknown> = Promise.resolve();
  function withOutbox<R>(fn: (o: Outbox) => Promise<R> | R): Promise<R> {
    const run = outboxLock.then(async () => {
      const o = await readOutbox();
      const r = await fn(o);
      await writeOutbox(o);
      return r;
    });
    outboxLock = run.catch(() => {});
    return run;
  }

  async function readOutbox(): Promise<Outbox> {
    const raw = await kv.getItem(outboxKey(owner));
    try {
      return raw ? (JSON.parse(raw) as Outbox) : {};
    } catch {
      return {};
    }
  }

  async function writeOutbox(o: Outbox) {
    const empty = Object.values(o).every((ids) => ids.length === 0);
    if (empty) await kv.removeItem(outboxKey(owner));
    else await kv.setItem(outboxKey(owner), JSON.stringify(o));
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      flush().catch((e) => onError?.(e));
    }, debounceMs);
  }

  async function putMany<T extends BaseDoc>(collection: string, docs: T[]) {
    if (docs.length === 0) return;
    await local.putMany(collection, docs);
    await withOutbox((o) => {
      o[collection] = Array.from(new Set([...(o[collection] ?? []), ...docs.map((d) => d.id)]));
    });
    schedule();
  }

  async function doFlush(): Promise<number> {
    const o = await withOutbox((snapshot) => ({ ...snapshot }));
    let sent = 0;
    for (const [collection, ids] of Object.entries(o)) {
      if (ids.length === 0) continue;
      const all = await local.getAll(collection);
      const docs = ids.map((id) => all[id]).filter((d): d is BaseDoc => d !== undefined);
      try {
        await remote.putMany(collection, docs);
      } catch (e) {
        onError?.(e);
        continue; // keep these ids for the next try
      }
      sent += docs.length;
      // A document changed again while this batch was in flight stays queued.
      const now = await local.getAll(collection);
      const sentAt = new Map(docs.map((d) => [d.id, d.updatedAt]));
      await withOutbox((latest) => {
        latest[collection] = (latest[collection] ?? []).filter((id) => !sentAt.has(id) || now[id]?.updatedAt !== sentAt.get(id));
      });
    }
    return sent;
  }

  function flush(): Promise<number> {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // One flush at a time; a second caller waits for the running one, then runs again.
    const run = (flushing ?? Promise.resolve(0)).then(() => doFlush());
    flushing = run.finally(() => {
      if (flushing === run) flushing = null;
    });
    return run;
  }

  async function pull(collection: string) {
    const [l, r] = await Promise.all([local.getAll(collection), remote.getAll(collection)]);
    const { pushToRemote, pullToLocal } = mergeCollections(l, r);
    if (pullToLocal.length) await local.putMany(collection, pullToLocal);
    if (pushToRemote.length) await remote.putMany(collection, pushToRemote);
  }

  async function pending() {
    return Object.values(await readOutbox()).reduce((n, ids) => n + ids.length, 0);
  }

  return { getAll: local.getAll, putMany, flush, pull, pending };
}
```

### `src/services/storage/lww.ts`

```ts
import type { BaseDoc } from '../../models/common';

/**
 * Last-write-wins merge (SPEC-ADDENDA §5). The newer `updatedAt` wins; on a
 * tie the remote copy wins, because the cloud is the source of truth for a
 * signed-in user.
 */
export function pickNewer<T extends BaseDoc>(local: T | undefined, remote: T | undefined): T | undefined {
  if (!local) return remote;
  if (!remote) return local;
  return local.updatedAt > remote.updatedAt ? local : remote;
}

/** Merge two id → doc maps; returns the merged map and which side each change must go to. */
export function mergeCollections<T extends BaseDoc>(local: Record<string, T>, remote: Record<string, T>) {
  const merged: Record<string, T> = {};
  const pushToRemote: T[] = [];
  const pullToLocal: T[] = [];
  for (const id of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const winner = pickNewer(local[id], remote[id])!;
    merged[id] = winner;
    if (!sameDoc(winner, remote[id])) pushToRemote.push(winner);
    if (!sameDoc(winner, local[id])) pullToLocal.push(winner);
  }
  return { merged, pushToRemote, pullToLocal };
}

// Copies of one document match when their write stamp and content match; this
// keeps a sync from rewriting documents that are already in step.
function sameDoc(a: BaseDoc, b: BaseDoc | undefined): boolean {
  return !!b && a.updatedAt === b.updatedAt && JSON.stringify(a) === JSON.stringify(b);
}
```

### `src/services/storage/repository.ts`

```ts
import type { BaseDoc, Doc, NewDoc } from '../../models/common';
import type { DocStore } from './docStore';

/** How one document type is versioned. `migrations[n]` upgrades a version-n document to n + 1. */
export type DocSchema = {
  collection: string;
  version: number;
  migrations: Record<number, (doc: Record<string, unknown>) => Record<string, unknown>>;
};

export type RepoDeps = {
  now?: () => number;
  newId?: () => string;
};

let counter = 0;
/** Unique enough for one user's documents: time + counter + randomness. */
export function makeId(now: number = Date.now()): string {
  counter = (counter + 1) % 1_000_000;
  return `${now.toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Upgrade a stored document to the schema's current version. Returns it unchanged when current. */
export function migrateDoc<T extends BaseDoc>(schema: DocSchema, stored: BaseDoc): T {
  let doc = stored as unknown as Record<string, unknown>;
  let v = typeof doc.schemaVersion === 'number' ? doc.schemaVersion : 1;
  while (v < schema.version) {
    const step = schema.migrations[v];
    if (!step) throw new Error(`${schema.collection}: no migration from version ${v}`);
    doc = { ...step(doc), schemaVersion: v + 1 };
    v += 1;
  }
  return doc as unknown as T;
}

/**
 * Typed access to one collection of user documents. Writes go through the
 * given DocStore (device, cloud, or both). Reads skip soft-deleted documents
 * and migrate older ones, saving the upgraded copy once.
 */
export function createRepository<T extends object>(store: DocStore, schema: DocSchema, deps: RepoDeps = {}) {
  const now = deps.now ?? Date.now;
  const newId = deps.newId ?? (() => makeId(now()));
  type D = Doc<T>;

  async function loadAll(): Promise<Record<string, D>> {
    const all = await store.getAll<BaseDoc>(schema.collection);
    const out: Record<string, D> = {};
    const upgraded: D[] = [];
    for (const [id, stored] of Object.entries(all)) {
      const doc = migrateDoc<D>(schema, stored);
      if (doc.schemaVersion !== stored.schemaVersion) upgraded.push(doc);
      out[id] = doc;
    }
    if (upgraded.length) await store.putMany(schema.collection, upgraded);
    return out;
  }

  async function create(data: NewDoc<T>): Promise<D> {
    const t = now();
    const { id, ...rest } = data as NewDoc<T> & { id?: string };
    const doc = { ...rest, id: id ?? newId(), createdAt: t, updatedAt: t, schemaVersion: schema.version, deleted: false } as unknown as D;
    await store.putMany(schema.collection, [doc]);
    return doc;
  }

  async function get(id: string): Promise<D | null> {
    const doc = (await loadAll())[id];
    return doc && !doc.deleted ? doc : null;
  }

  async function list(filter?: (doc: D) => boolean): Promise<D[]> {
    return Object.values(await loadAll())
      .filter((d) => !d.deleted && (!filter || filter(d)))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async function update(id: string, patch: Partial<T>): Promise<D | null> {
    const current = await get(id);
    if (!current) return null;
    const doc = { ...current, ...patch, id, updatedAt: Math.max(now(), current.updatedAt + 1) } as D;
    await store.putMany(schema.collection, [doc]);
    return doc;
  }

  /** Create the document with this id, or update it if it already exists. */
  async function upsert(id: string, data: T): Promise<D> {
    return (await update(id, data as Partial<T>)) ?? create({ ...data, id } as NewDoc<T>);
  }

  /** Soft delete: the document stays with `deleted: true` so other devices learn about it. */
  async function remove(id: string): Promise<boolean> {
    const current = await get(id);
    if (!current) return false;
    await store.putMany(schema.collection, [{ ...current, deleted: true, updatedAt: Math.max(now(), current.updatedAt + 1) }]);
    return true;
  }

  return { collection: schema.collection, create, get, list, update, upsert, remove };
}

export type Repository<T extends object> = ReturnType<typeof createRepository<T>>;
```

### `src/services/storage/schemas.ts`

```ts
import type { DocSchema } from './repository';

/**
 * Every user collection and its current schema version. Bump `version` and
 * add a migration whenever a document type changes; never rename or delete a
 * field users already have data in (SPEC-ADDENDA §5). Keep docs/DATA_MODEL.md
 * in step with this file.
 */
export const SCHEMAS = {
  profile: { collection: 'profile', version: 1, migrations: {} },
  mealLogs: { collection: 'mealLogs', version: 1, migrations: {} },
  waterLogs: { collection: 'waterLogs', version: 1, migrations: {} },
  supplementLogs: { collection: 'supplementLogs', version: 1, migrations: {} },
  workoutLogs: { collection: 'workoutLogs', version: 1, migrations: {} },
  favourites: { collection: 'favourites', version: 1, migrations: {} },
  mealPlans: { collection: 'mealPlans', version: 1, migrations: {} },
  savings: { collection: 'savings', version: 1, migrations: {} },
} satisfies Record<string, DocSchema>;

export type CollectionName = keyof typeof SCHEMAS;
export const COLLECTIONS = Object.keys(SCHEMAS) as CollectionName[];
```

### `src/services/storage/legacy.ts`

```ts
import type { BaseDoc, Doc } from '../../models/common';
import type { Favourite, MealLog, MealPlanDay, SavingEntry, WaterLog, WorkoutLog } from '../../models/logs';
import { DEFAULT_PROFILE, type UserProfile } from '../../models/user';
import type { DayLog, Profile } from '../../lib/store';
import { PROFILE_ID } from './remote';
import { SCHEMAS } from './schemas';

/** The demo's single blob, saved under AsyncStorage key `fitplate.state.v2`. */
export const LEGACY_KEY = 'fitplate.state.v2';

export type LegacyState = {
  profile: Profile;
  days: Record<string, DayLog>;
  moneySaved: number;
  favourites: string[];
  plan: Record<string, Partial<Record<'breakfast' | 'lunch' | 'dinner', string>>>;
};

/** The demo seeds this much "saved by cooking" with its sample week. */
export const DEMO_SAMPLE_SAVED_INR = 2860;

export type LegacyDocs = {
  profile: Doc<UserProfile>;
  mealLogs: Doc<MealLog>[];
  waterLogs: Doc<WaterLog>[];
  workoutLogs: Doc<WorkoutLog>[];
  favourites: Doc<Favourite>[];
  mealPlans: Doc<MealPlanDay>[];
  savings: Doc<SavingEntry>[];
};

/**
 * Sample entries are seeded at whole hours (meals) or at 0 (workouts); real
 * taps use Date.now(), which almost never lands on an exact minute. This is
 * how the made-up sample week is told apart from the user's own logs.
 */
export const isSampleMealTime = (at: number) => at % 60_000 === 0;
export const isSampleWorkoutTime = (at: number) => at === 0;

/**
 * Turn the demo blob into versioned documents with stable ids, so running it
 * twice gives the same documents. Pure: no storage access.
 */
export function fromLegacyState(state: LegacyState, now: number): LegacyDocs {
  const base = (id: string, collection: keyof typeof SCHEMAS, createdAt = now): BaseDoc => ({
    id,
    createdAt,
    updatedAt: now,
    schemaVersion: SCHEMAS[collection].version,
    deleted: false,
  });
  const p = state.profile;
  const profile: Doc<UserProfile> = {
    ...DEFAULT_PROFILE,
    name: p.name ?? '',
    goal: p.goal ?? DEFAULT_PROFILE.goal,
    dietType: p.diet ?? DEFAULT_PROFILE.dietType,
    cookingLevel: p.level ?? DEFAULT_PROFILE.cookingLevel,
    breakfastReminder: p.breakfastReminder ?? DEFAULT_PROFILE.breakfastReminder,
    onboarded: p.onboarded ?? false,
    ...base(PROFILE_ID, 'profile'),
  };

  const mealLogs: Doc<MealLog>[] = [];
  const waterLogs: Doc<WaterLog>[] = [];
  const workoutLogs: Doc<WorkoutLog>[] = [];
  let sampleSeen = false;
  for (const [dateKey, day] of Object.entries(state.days ?? {})) {
    let realActivity = false;
    (day.meals ?? []).forEach((m, i) => {
      const demoSample = isSampleMealTime(m.at);
      sampleSeen ||= demoSample;
      realActivity ||= !demoSample;
      mealLogs.push({
        ...base(`meal-${dateKey}-${m.at}-${i}`, 'mealLogs', m.at || now),
        timestamp: m.at,
        dateKey,
        name: m.name,
        emoji: m.emoji,
        // The demo log keeps no dish id; Day 13 meal logging records it.
        dishId: null,
        source: m.cooked ? 'dish' : 'quick',
        kcal: m.kcal,
        proteinG: m.protein,
        fibreG: m.fibre,
        cooked: m.cooked,
        ...(demoSample ? { demoSample } : {}),
      });
    });
    (day.exercise ?? []).forEach((e, i) => {
      const demoSample = isSampleWorkoutTime(e.at);
      sampleSeen ||= demoSample;
      realActivity ||= !demoSample;
      workoutLogs.push({
        ...base(`workout-${dateKey}-${e.at}-${i}`, 'workoutLogs', e.at || now),
        timestamp: e.at,
        dateKey,
        type: e.type,
        exerciseId: null,
        minutes: e.minutes,
        kcal: e.kcal,
        ...(demoSample ? { demoSample } : {}),
      });
    });
    if (day.water > 0) {
      // Water has no timestamp; a day is sample when every other entry that day is.
      const demoSample = !realActivity && (day.meals ?? []).length + (day.exercise ?? []).length > 0;
      waterLogs.push({
        ...base(`water-${dateKey}`, 'waterLogs'),
        timestamp: now,
        dateKey,
        glasses: day.water,
        ...(demoSample ? { demoSample } : {}),
      });
    }
  }

  const favourites = (state.favourites ?? []).map((dishId) => ({ ...base(dishId, 'favourites'), dishId }));
  const mealPlans = Object.entries(state.plan ?? {}).map(([dateKey, slots]) => ({ ...base(dateKey, 'mealPlans'), dateKey, slots }));

  // The demo keeps one running total; the seeded sample amount is not the user's money.
  const real = sampleSeen ? Math.max(0, state.moneySaved - DEMO_SAMPLE_SAVED_INR) : state.moneySaved;
  const savings: Doc<SavingEntry>[] =
    real > 0 ? [{ ...base('legacy-total', 'savings'), timestamp: now, amountInr: real, dishId: null, note: 'Carried over from the demo total' }] : [];

  return { profile, mealLogs, waterLogs, workoutLogs, favourites, mealPlans, savings };
}
```

### `src/services/storage/guest.ts`

```ts
import type { BaseDoc } from '../../models/common';
import type { DocStore } from './docStore';
import { mergeCollections } from './lww';
import { COLLECTIONS } from './schemas';

/**
 * One-tap "copy my device data into my account" after a guest signs in
 * (SPEC-ADDENDA §5). Demo sample entries are never copied. Where both sides
 * have a document, the newer one wins. Returns how many documents were copied.
 */
export async function copyGuestToAccount(guest: DocStore, account: DocStore, collections: readonly string[] = COLLECTIONS): Promise<number> {
  let copied = 0;
  for (const c of collections) {
    const mine = Object.fromEntries(
      Object.entries(await guest.getAll<BaseDoc & { demoSample?: boolean }>(c)).filter(([, d]) => !d.demoSample),
    );
    const theirs = await account.getAll<BaseDoc>(c);
    const { pushToRemote } = mergeCollections(mine, theirs);
    if (pushToRemote.length) await account.putMany(c, pushToRemote);
    copied += pushToRemote.length;
  }
  return copied;
}
```

### `src/services/storage/index.ts`

```ts
import type { Favourite, MealLog, MealPlanDay, SavingEntry, SupplementLog, WaterLog, WorkoutLog } from '../../models/logs';
import type { UserProfile } from '../../models/user';
import { createLocalDocStore, ownerPrefix, type DocStore } from './docStore';
import type { KeyValueStore } from './kv';
import { createRemoteDocStore, PROFILE_ID, type RemoteAdapter } from './remote';
import { createRepository, type RepoDeps } from './repository';
import { SCHEMAS } from './schemas';
import { createStorageService } from './storageService';
import { createSyncedDocStore, outboxKey, type SyncedDocStore } from './syncedStore';

export { copyGuestToAccount } from './guest';
export { fromLegacyState, LEGACY_KEY, type LegacyState } from './legacy';
export { PROFILE_ID } from './remote';
export { COLLECTIONS, SCHEMAS } from './schemas';

export const GUEST_OWNER = 'guest';

/** All repositories for one user, over one DocStore. */
export function createRepositories(store: DocStore, deps: RepoDeps = {}) {
  return {
    profile: createRepository<UserProfile>(store, SCHEMAS.profile, deps),
    mealLogs: createRepository<MealLog>(store, SCHEMAS.mealLogs, deps),
    waterLogs: createRepository<WaterLog>(store, SCHEMAS.waterLogs, deps),
    supplementLogs: createRepository<SupplementLog>(store, SCHEMAS.supplementLogs, deps),
    workoutLogs: createRepository<WorkoutLog>(store, SCHEMAS.workoutLogs, deps),
    favourites: createRepository<Favourite>(store, SCHEMAS.favourites, deps),
    mealPlans: createRepository<MealPlanDay>(store, SCHEMAS.mealPlans, deps),
    savings: createRepository<SavingEntry>(store, SCHEMAS.savings, deps),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

/**
 * The user data layer for whoever is using the app.
 * - Guest (no uid, or no cloud): device storage only.
 * - Signed in with the cloud available: device first, synced to `users/{uid}` in Firestore.
 */
export function openUserData(opts: { kv: KeyValueStore; uid: string | null; remote: RemoteAdapter | null; deps?: RepoDeps; onSyncError?: (e: unknown) => void }) {
  const owner = opts.uid ?? GUEST_OWNER;
  const local = createLocalDocStore(opts.kv, owner);
  const synced: SyncedDocStore | null =
    opts.uid && opts.remote
      ? createSyncedDocStore({ local, remote: createRemoteDocStore(opts.remote, opts.uid), kv: opts.kv, owner, onError: opts.onSyncError })
      : null;
  const store = synced ?? local;
  const storage = createStorageService(opts.kv);

  return {
    owner,
    cloud: synced !== null,
    repos: createRepositories(store, opts.deps),
    /** Merge every collection with the cloud. No-op for guests. */
    async syncAll() {
      if (!synced) return;
      await synced.flush();
      for (const c of Object.values(SCHEMAS)) await synced.pull(c.collection);
    },
    flush: () => synced?.flush() ?? Promise.resolve(0),
    pending: () => synced?.pending() ?? Promise.resolve(0),
    exportAll: storage.exportAll,
    /** Sign-out: the cloud keeps the data; this device forgets it. */
    async clearDevice() {
      await storage.resetAll(ownerPrefix(owner));
      await opts.kv.removeItem(outboxKey(owner));
    },
    profileId: PROFILE_ID,
  };
}

export type UserData = ReturnType<typeof openUserData>;
```

### `src/__tests__/storage/fakes.ts`

```ts
import type { BaseDoc } from '../../models/common';
import type { RemoteAdapter } from '../../services/storage/remote';

/**
 * A mocked Firestore: documents by path, in memory. Tests never touch the
 * real project. `offline = true` makes every call fail like a lost network.
 */
export function fakeFirestore() {
  const docs = new Map<string, BaseDoc>();
  const state = { offline: false, batches: 0, writes: 0 };
  const check = () => {
    if (state.offline) throw new Error('unavailable: offline');
  };
  const adapter: RemoteAdapter = {
    async getCollection(path) {
      check();
      const prefix = `${path}/`;
      return [...docs.entries()].filter(([p]) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/')).map(([, d]) => d);
    },
    async getDoc(path) {
      check();
      return docs.get(path) ?? null;
    },
    async setMany(writes) {
      check();
      state.batches += 1;
      state.writes += writes.length;
      for (const w of writes) docs.set(w.path, structuredClone(w.data));
    },
  };
  return { adapter, docs, state };
}

/** A clock the test moves by hand. */
export function fakeClock(start = 1_760_000_000_000) {
  let t = start;
  return { now: () => t, tick: (ms = 1000) => (t += ms) };
}
```

### `src/__tests__/storage/storageService.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { memoryKeyValueStore } from '../../services/storage/kv';
import { createStorageService, fullKey, type StorageKey } from '../../services/storage/storageService';

type Settings = { units: 'metric'; glassesTarget: number };

const v2: StorageKey<Settings> = {
  name: 'settings',
  version: 2,
  fallback: () => ({ units: 'metric', glassesTarget: 8 }),
  migrate: (data, from) => {
    const old = data as { target?: number };
    expect(from).toBe(1);
    return { units: 'metric', glassesTarget: old.target ?? 8 };
  },
};

describe('storage service', () => {
  it('returns the fallback when nothing is stored', async () => {
    const s = createStorageService(memoryKeyValueStore());
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 8 });
  });

  it('writes a versioned envelope and reads it back', async () => {
    const kv = memoryKeyValueStore();
    const s = createStorageService(kv);
    await s.write(v2, { units: 'metric', glassesTarget: 10 });
    expect(JSON.parse(kv.dump()['fitplate.settings.v2'])).toEqual({ version: 2, data: { units: 'metric', glassesTarget: 10 } });
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 10 });
  });

  it('migrates an older version forward and saves the upgraded copy', async () => {
    const kv = memoryKeyValueStore({ [fullKey({ name: 'settings', version: 1 })]: JSON.stringify({ version: 1, data: { target: 12 } }) });
    const s = createStorageService(kv);
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 12 });
    expect(kv.dump()['fitplate.settings.v2']).toBeDefined();
  });

  it('ignores corrupt values instead of crashing', async () => {
    const s = createStorageService(memoryKeyValueStore({ 'fitplate.settings.v2': '{not json' }));
    expect(await s.read(v2)).toEqual({ units: 'metric', glassesTarget: 8 });
  });

  it('exports and resets only FitPlate keys', async () => {
    const kv = memoryKeyValueStore({ 'other.app': 'x', 'fitplate.a.v1': JSON.stringify({ version: 1, data: 1 }), 'fitplate.b.v1': 'raw' });
    const s = createStorageService(kv);
    expect(Object.keys(await s.exportAll()).sort()).toEqual(['fitplate.a.v1', 'fitplate.b.v1']);
    expect(await s.resetAll()).toBe(2);
    expect(kv.dump()).toEqual({ 'other.app': 'x' });
  });
});
```

### `src/__tests__/storage/repository.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import type { Doc } from '../../models/common';
import type { MealLog } from '../../models/logs';
import { createLocalDocStore } from '../../services/storage/docStore';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { createRepository, migrateDoc, type DocSchema } from '../../services/storage/repository';
import { SCHEMAS } from '../../services/storage/schemas';
import { fakeClock } from './fakes';

const meal = (over: Partial<MealLog> = {}): MealLog => ({
  timestamp: 1,
  dateKey: '2026-10-10',
  name: 'Poha',
  emoji: '🍚',
  dishId: 'poha',
  source: 'dish',
  kcal: 300,
  proteinG: 8,
  fibreG: 3,
  cooked: true,
  ...over,
});

function setup() {
  const kv = memoryKeyValueStore();
  const clock = fakeClock();
  let n = 0;
  const store = createLocalDocStore(kv, 'guest');
  const repo = createRepository<MealLog>(store, SCHEMAS.mealLogs, { now: clock.now, newId: () => `id${++n}` });
  return { kv, clock, store, repo };
}

describe('repository', () => {
  it('saves and loads a document with the common fields', async () => {
    const { repo, clock } = setup();
    const saved = await repo.create(meal());
    expect(saved).toMatchObject({ id: 'id1', createdAt: clock.now(), updatedAt: clock.now(), schemaVersion: 1, deleted: false, name: 'Poha' });
    expect(await repo.get('id1')).toEqual(saved);
  });

  it('keeps a caller-chosen id', async () => {
    const { repo } = setup();
    expect((await repo.create({ ...meal(), id: 'water-2026-10-10' })).id).toBe('water-2026-10-10');
  });

  it('updates fields and moves updatedAt forward', async () => {
    const { repo, clock } = setup();
    const saved = await repo.create(meal());
    clock.tick(5000);
    const updated = await repo.update(saved.id, { kcal: 350 });
    expect(updated?.kcal).toBe(350);
    expect(updated!.updatedAt).toBeGreaterThan(saved.updatedAt);
    expect(updated!.createdAt).toBe(saved.createdAt);
  });

  it('updatedAt always increases, even if the clock has not moved', async () => {
    const { repo } = setup();
    const saved = await repo.create(meal());
    const updated = await repo.update(saved.id, { kcal: 1 });
    expect(updated!.updatedAt).toBe(saved.updatedAt + 1);
  });

  it('soft deletes: hidden from reads but kept for other devices', async () => {
    const { repo, store } = setup();
    const saved = await repo.create(meal());
    expect(await repo.remove(saved.id)).toBe(true);
    expect(await repo.get(saved.id)).toBeNull();
    expect(await repo.list()).toEqual([]);
    expect((await store.getAll<Doc<MealLog>>('mealLogs'))[saved.id].deleted).toBe(true);
    expect(await repo.remove(saved.id)).toBe(false);
    expect(await repo.update(saved.id, { kcal: 1 })).toBeNull();
  });

  it('lists with a filter, oldest first', async () => {
    const { repo, clock } = setup();
    await repo.create(meal({ dateKey: '2026-10-09' }));
    clock.tick();
    await repo.create(meal({ dateKey: '2026-10-10', name: 'Upma' }));
    clock.tick();
    await repo.create(meal({ dateKey: '2026-10-10', name: 'Dal' }));
    expect((await repo.list((d) => d.dateKey === '2026-10-10')).map((d) => d.name)).toEqual(['Upma', 'Dal']);
  });

  it('upsert creates once, then updates the same document', async () => {
    const { repo } = setup();
    await repo.upsert('m1', meal());
    await repo.upsert('m1', meal({ kcal: 999 }));
    const all = await repo.list();
    expect(all).toHaveLength(1);
    expect(all[0].kcal).toBe(999);
  });

  it('migrates older documents when read and saves the upgraded copy', async () => {
    const { store, clock } = setup();
    const v2: DocSchema = {
      collection: 'mealLogs',
      version: 2,
      migrations: { 1: (d) => ({ ...d, source: d.cooked ? 'dish' : 'quick' }) },
    };
    await store.putMany('mealLogs', [{ id: 'old', createdAt: 1, updatedAt: 1, schemaVersion: 1, deleted: false, cooked: false } as never]);
    const repo = createRepository<MealLog>(store, v2, { now: clock.now });
    expect(await repo.get('old')).toMatchObject({ schemaVersion: 2, source: 'quick' });
    expect((await store.getAll<Doc<MealLog>>('mealLogs')).old).toMatchObject({ schemaVersion: 2 });
  });

  it('refuses to guess when a migration step is missing', () => {
    const schema: DocSchema = { collection: 'x', version: 3, migrations: { 1: (d) => d } };
    expect(() => migrateDoc(schema, { id: 'a', createdAt: 0, updatedAt: 0, schemaVersion: 1, deleted: false })).toThrow('no migration from version 2');
  });

  it('two quick saves to the device never overwrite each other', async () => {
    const { repo } = setup();
    await Promise.all([repo.create(meal({ name: 'A' })), repo.create(meal({ name: 'B' }))]);
    expect((await repo.list()).map((d) => d.name).sort()).toEqual(['A', 'B']);
  });
});
```

### `src/__tests__/storage/sync.test.ts`

```ts
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { BaseDoc } from '../../models/common';
import { createLocalDocStore } from '../../services/storage/docStore';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { mergeCollections, pickNewer } from '../../services/storage/lww';
import { createRemoteDocStore, docPath } from '../../services/storage/remote';
import { createSyncedDocStore } from '../../services/storage/syncedStore';
import { fakeFirestore } from './fakes';

const doc = (id: string, updatedAt: number, extra: Record<string, unknown> = {}): BaseDoc & Record<string, unknown> => ({
  id,
  createdAt: 1,
  updatedAt,
  schemaVersion: 1,
  deleted: false,
  ...extra,
});

function setup() {
  const kv = memoryKeyValueStore();
  const fs = fakeFirestore();
  const local = createLocalDocStore(kv, 'u1');
  const remote = createRemoteDocStore(fs.adapter, 'u1');
  const errors: unknown[] = [];
  const store = createSyncedDocStore({ local, remote, kv, owner: 'u1', debounceMs: 1000, onError: (e) => errors.push(e) });
  return { kv, fs, local, remote, store, errors };
}

describe('last write wins', () => {
  it('keeps the newer copy, and the cloud copy on a tie', () => {
    const a = doc('x', 5);
    const b = doc('x', 9);
    expect(pickNewer(a, b)).toBe(b);
    expect(pickNewer(b, a)).toBe(b);
    const tieLocal = doc('x', 7, { v: 'local' });
    const tieRemote = doc('x', 7, { v: 'remote' });
    expect(pickNewer(tieLocal, tieRemote)).toBe(tieRemote);
    expect(pickNewer(undefined, a)).toBe(a);
  });

  it('says which side each merged document must go to, and skips identical ones', () => {
    const same = doc('same', 3);
    const { merged, pushToRemote, pullToLocal } = mergeCollections(
      { onlyLocal: doc('onlyLocal', 1), newerLocal: doc('newerLocal', 9), same },
      { onlyRemote: doc('onlyRemote', 1), newerLocal: doc('newerLocal', 2), same: { ...same } },
    );
    expect(Object.keys(merged).sort()).toEqual(['newerLocal', 'onlyLocal', 'onlyRemote', 'same']);
    expect(pushToRemote.map((d) => d.id).sort()).toEqual(['newerLocal', 'onlyLocal']);
    expect(pullToLocal.map((d) => d.id)).toEqual(['onlyRemote']);
  });

  it('a deletion on one device wins over an older edit on another', () => {
    const { merged } = mergeCollections({ m: doc('m', 5, { kcal: 1 }) }, { m: doc('m', 8, { deleted: true }) });
    expect(merged.m.deleted).toBe(true);
  });
});

describe('cloud paths', () => {
  it('maps the profile to users/{uid} and other collections under it', () => {
    expect(docPath('u1', 'profile', 'profile')).toBe('users/u1');
    expect(docPath('u1', 'mealLogs', 'abc')).toBe('users/u1/mealLogs/abc');
  });

  it('needs a user id', () => {
    expect(() => createRemoteDocStore(fakeFirestore().adapter, '')).toThrow();
  });

  it('reads the profile document and a subcollection', async () => {
    const fs = fakeFirestore();
    const remote = createRemoteDocStore(fs.adapter, 'u1');
    await remote.putMany('profile', [doc('profile', 1, { name: 'S' })]);
    await remote.putMany('mealLogs', [doc('a', 1), doc('b', 1)]);
    expect(Object.keys(await remote.getAll('profile'))).toEqual(['profile']);
    expect(Object.keys(await remote.getAll('mealLogs')).sort()).toEqual(['a', 'b']);
    expect(await remote.getAll('waterLogs')).toEqual({});
  });
});

describe('synced store (device first, then cloud)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves on the device at once and batches cloud writes after the debounce', async () => {
    const { store, fs } = setup();
    await store.putMany('waterLogs', [doc('water-1', 1, { glasses: 1 })]);
    await store.putMany('waterLogs', [doc('water-1', 2, { glasses: 2 })]);
    await store.putMany('waterLogs', [doc('water-1', 3, { glasses: 3 })]);
    expect(await store.getAll('waterLogs')).toMatchObject({ 'water-1': { glasses: 3 } });
    expect(fs.state.writes).toBe(0);
    expect(await store.pending()).toBe(1);
    expect(await store.flush()).toBe(1);
    expect(fs.state.batches).toBe(1);
    expect(fs.docs.get('users/u1/waterLogs/water-1')).toMatchObject({ glasses: 3 });
    expect(await store.pending()).toBe(0);
  });

  it('keeps writes queued while offline and sends them when back online', async () => {
    const { store, fs, errors } = setup();
    fs.state.offline = true;
    await store.putMany('mealLogs', [doc('m1', 1)]);
    expect(await store.flush()).toBe(0);
    expect(errors).toHaveLength(1);
    expect(await store.pending()).toBe(1);
    fs.state.offline = false;
    expect(await store.flush()).toBe(1);
    expect(fs.docs.has('users/u1/mealLogs/m1')).toBe(true);
  });

  it('the outbox survives an app restart (it is stored on the device)', async () => {
    const { kv, fs, local, remote } = setup();
    fs.state.offline = true;
    const first = createSyncedDocStore({ local, remote, kv, owner: 'u1', onError: () => {} });
    await first.putMany('mealLogs', [doc('m1', 1)]);
    await first.flush();
    fs.state.offline = false;
    const afterRestart = createSyncedDocStore({ local, remote, kv, owner: 'u1' });
    expect(await afterRestart.pending()).toBe(1);
    expect(await afterRestart.flush()).toBe(1);
  });

  it('pull brings cloud changes down and pushes newer device changes up', async () => {
    const { store, fs, local } = setup();
    await local.putMany('mealLogs', [doc('fromPhone', 9)]);
    fs.docs.set('users/u1/mealLogs/fromLaptop', doc('fromLaptop', 5));
    await store.pull('mealLogs');
    expect(Object.keys(await store.getAll('mealLogs')).sort()).toEqual(['fromLaptop', 'fromPhone']);
    expect(fs.docs.has('users/u1/mealLogs/fromPhone')).toBe(true);
  });

  it('the debounce timer flushes on its own', async () => {
    const { store, fs } = setup();
    await store.putMany('mealLogs', [doc('m1', 1)]);
    await jest.advanceTimersByTimeAsync(1000);
    expect(fs.docs.has('users/u1/mealLogs/m1')).toBe(true);
  });
});
```

### `src/__tests__/storage/legacy.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { createLocalDocStore } from '../../services/storage/docStore';
import { copyGuestToAccount } from '../../services/storage/guest';
import { memoryKeyValueStore } from '../../services/storage/kv';
import { DEMO_SAMPLE_SAVED_INR, fromLegacyState, type LegacyState } from '../../services/storage/legacy';
import { createRemoteDocStore } from '../../services/storage/remote';
import { createRepositories, openUserData } from '../../services/storage';
import { fakeClock, fakeFirestore } from './fakes';

const NOW = 1_760_000_000_000;
const sampleAt = new Date(2026, 9, 9, 8).getTime(); // whole hour, as the demo seeds it
const realAt = sampleAt + 1234; // a real tap

const state: LegacyState = {
  profile: { name: 'Sudarsan', goal: 'muscle', level: 'expert', diet: 'veg', breakfastReminder: false, onboarded: true },
  days: {
    '2026-10-09': {
      meals: [{ name: 'Poha', emoji: '🍚', kcal: 300, protein: 8, fibre: 3, cooked: true, at: sampleAt }],
      exercise: [{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }],
      water: 7,
    },
    '2026-10-10': {
      meals: [{ name: 'Sandwich', emoji: '🥪', kcal: 380, protein: 14, fibre: 4, cooked: false, at: realAt }],
      exercise: [{ type: 'Run', minutes: 20, kcal: 200, at: realAt + 5 }],
      water: 3,
    },
  },
  moneySaved: DEMO_SAMPLE_SAVED_INR + 450,
  favourites: ['poha'],
  plan: { '2026-10-11': { dinner: 'rajma-chawal' } },
};

describe('migration from the demo blob (fitplate.state.v2)', () => {
  const out = fromLegacyState(state, NOW);

  it('maps the profile onto the new UserProfile with nulls for unknown body data', () => {
    expect(out.profile).toMatchObject({ id: 'profile', name: 'Sudarsan', goal: 'muscle', dietType: 'veg', cookingLevel: 'expert', breakfastReminder: false, onboarded: true, weightKg: null, schemaVersion: 1 });
  });

  it('marks the made-up sample week and keeps real logs unmarked', () => {
    expect(out.mealLogs.find((m) => m.dateKey === '2026-10-09')?.demoSample).toBe(true);
    expect(out.mealLogs.find((m) => m.dateKey === '2026-10-10')?.demoSample).toBeUndefined();
    expect(out.workoutLogs.find((w) => w.dateKey === '2026-10-09')?.demoSample).toBe(true);
    expect(out.waterLogs.find((w) => w.dateKey === '2026-10-09')?.demoSample).toBe(true);
    expect(out.waterLogs.find((w) => w.dateKey === '2026-10-10')).toMatchObject({ id: 'water-2026-10-10', glasses: 3 });
  });

  it('does not count the seeded ₹2,860 as the user’s savings', () => {
    expect(out.savings).toEqual([expect.objectContaining({ id: 'legacy-total', amountInr: 450 })]);
  });

  it('carries favourites and the meal plan', () => {
    expect(out.favourites.map((f) => f.dishId)).toEqual(['poha']);
    expect(out.mealPlans[0]).toMatchObject({ id: '2026-10-11', slots: { dinner: 'rajma-chawal' } });
  });

  it('gives the same ids every run, so running it twice never duplicates', () => {
    const again = fromLegacyState(state, NOW + 999);
    expect(again.mealLogs.map((m) => m.id)).toEqual(out.mealLogs.map((m) => m.id));
  });

  it('keeps savings when there is no sample week', () => {
    const clean = fromLegacyState({ ...state, days: {}, moneySaved: 300 }, NOW);
    expect(clean.savings[0].amountInr).toBe(300);
  });
});

describe('guest to account copy', () => {
  it('copies real guest data to the cloud and never the demo sample', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const guest = createLocalDocStore(kv, 'guest');
    const out = fromLegacyState(state, NOW);
    await guest.putMany('mealLogs', out.mealLogs);
    await guest.putMany('profile', [out.profile]);
    const account = createRemoteDocStore(fs.adapter, 'u1');
    const copied = await copyGuestToAccount(guest, account);
    expect(copied).toBe(2);
    expect(fs.docs.has('users/u1')).toBe(true);
    expect([...fs.docs.keys()].filter((k) => k.includes('mealLogs'))).toHaveLength(1);
  });

  it('does not overwrite newer cloud data', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const guest = createLocalDocStore(kv, 'guest');
    const account = createRemoteDocStore(fs.adapter, 'u1');
    await guest.putMany('profile', [{ ...fromLegacyState(state, NOW).profile, updatedAt: 1 }]);
    await account.putMany('profile', [{ ...fromLegacyState(state, NOW).profile, name: 'Cloud name', updatedAt: 5 }]);
    expect(await copyGuestToAccount(guest, account, ['profile'])).toBe(0);
    expect(fs.docs.get('users/u1')).toMatchObject({ name: 'Cloud name' });
  });
});

describe('openUserData', () => {
  it('guests use the device only', async () => {
    const data = openUserData({ kv: memoryKeyValueStore(), uid: null, remote: null });
    expect(data.cloud).toBe(false);
    expect(data.owner).toBe('guest');
    await data.repos.mealLogs.create({ timestamp: 1, dateKey: '2026-10-10', name: 'Dal', emoji: '🍲', dishId: null, source: 'custom', kcal: 200, proteinG: 9, fibreG: 4, cooked: true });
    expect(await data.pending()).toBe(0);
  });

  it('signed-in users sync to users/{uid}, and sign-out clears only this device', async () => {
    const kv = memoryKeyValueStore({ 'fitplate.docs.guest.mealLogs.v1': '{}' });
    const fs = fakeFirestore();
    const clock = fakeClock();
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter, deps: { now: clock.now } });
    expect(data.cloud).toBe(true);
    await data.repos.profile.upsert('profile', { ...fromLegacyState(state, NOW).profile });
    await data.syncAll();
    expect(fs.docs.get('users/u1')).toMatchObject({ name: 'Sudarsan' });
    await data.clearDevice();
    expect(Object.keys(kv.dump())).toEqual(['fitplate.docs.guest.mealLogs.v1']);
    expect(fs.docs.has('users/u1')).toBe(true);
  });

  it('a second device sees the first device’s data after a sync', async () => {
    const fs = fakeFirestore();
    const phone = openUserData({ kv: memoryKeyValueStore(), uid: 'u1', remote: fs.adapter });
    await phone.repos.favourites.upsert('poha', { dishId: 'poha' });
    await phone.flush();
    const laptop = openUserData({ kv: memoryKeyValueStore(), uid: 'u1', remote: fs.adapter });
    await laptop.syncAll();
    expect((await laptop.repos.favourites.list()).map((f) => f.dishId)).toEqual(['poha']);
  });

  it('builds one repository per collection', () => {
    const repos = createRepositories(createLocalDocStore(memoryKeyValueStore(), 'guest'));
    expect(Object.keys(repos).sort()).toEqual(['favourites', 'mealLogs', 'mealPlans', 'profile', 'savings', 'supplementLogs', 'waterLogs', 'workoutLogs']);
  });
});
```

### `docs/DATA_MODEL.md`

````markdown
# FitPlate data model

This file is the single description of every piece of data FitPlate stores. The daily auto-build updates it on every build day (SPEC-ADDENDA §5) and adds a changelog line at the bottom.

## 1. Where data lives

| Kind | Store | Shared across devices? |
|---|---|---|
| Research content (dishes, ingredients, nutrients, hydration, guidance, exercises) | Bundled JSON in the app (`src/data/research/…`, from Day 4) | Yes. Every device gets the same files with each deploy. |
| Signed-in user's own data (profile, logs, plans, favourites …) | Cloud Firestore, `users/{uid}/…` (from Day 3) | Yes. That is the point of the cloud store. |
| Offline copy of the signed-in user's data | Firestore's local cache (web: persistent cache) plus AsyncStorage | No (one device) |
| Guest data (not signed in) | AsyncStorage only | No (one device) |

Research content is never copied into Firestore. User documents refer to it by id only (`dishId`, `ingredientId`, `nutrientId`, `exerciseId`).

## 2. Today's storage (demo, until Day 3)

Everything sits in one JSON blob in AsyncStorage under the key `fitplate.state.v2` (`src/lib/store.tsx`). Day 3 migrates it into the repositories below and keeps reading it once, so nobody loses data.

| Field | Type | Meaning |
|---|---|---|
| `profile.name` | string | First name shown on Today |
| `profile.goal` | `'lose' \| 'maintain' \| 'gain' \| 'muscle'` | Picks the daily kcal and protein target (`GOALS`) |
| `profile.level` | `'beginner' \| 'expert'` | Cooking level |
| `profile.diet` | `'veg' \| 'egg' \| 'non-veg'` | Filters dishes |
| `profile.breakfastReminder` | boolean | 9 pm prep and Sunday batch-cook reminders |
| `profile.onboarded` | boolean | Onboarding finished |
| `days[YYYY-MM-DD].meals[]` | `{ name, emoji, kcal, protein, fibre, cooked, at }` | Meals eaten that day; `cooked` = made at home; `at` = epoch ms |
| `days[YYYY-MM-DD].exercise[]` | `{ type, minutes, kcal, at }` | Workouts; kcal from MET × 70 kg × hours (estimate) |
| `days[YYYY-MM-DD].water` | number | Glasses of water |
| `moneySaved` | number (₹) | Running total saved by cooking instead of ordering |
| `favourites` | string[] | Demo dish ids |
| `plan[YYYY-MM-DD][slot]` | demo dish id | Meal plan; slot = breakfast, lunch or dinner |

## 3. Cloud layout (Firestore, from Day 3)

Database: Firestore, default database, location `asia-south1`, Spark (free) plan.

### Fields every document has

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Same as the document id |
| `createdAt` | number (epoch ms) | When it was first written |
| `updatedAt` | number (epoch ms) | Last change; conflicts resolve last-write-wins on this |
| `schemaVersion` | number | Version of this document type; older documents are migrated when read |
| `deleted` | boolean | Soft delete, so other devices learn about deletions |

### Collections

Types live in `src/models/`; versions and migrations in `src/services/storage/schemas.ts`. On the device each collection is one AsyncStorage key, `fitplate.docs.<owner>.<collection>.v1` (owner = `guest` or the Firebase uid), holding an id → document map.

| Path | Holds | Version | Since | Links to research ids |
|---|---|---|---|---|
| `users/{uid}` | Profile (`UserProfile`), document id `profile` | 1 | Day 3 | — |
| `users/{uid}/mealLogs/{id}` | One meal eaten | 1 | Day 3 | `dishId` |
| `users/{uid}/waterLogs/water-YYYY-MM-DD` | Glasses of water for one day (one document per day) | 1 | Day 3 | — |
| `users/{uid}/supplementLogs/{id}` | Supplement taken | 1 | Day 3 | `nutrientId` |
| `users/{uid}/workoutLogs/{id}` | One workout | 1 | Day 3 | `exerciseId` |
| `users/{uid}/favourites/{dishId}` | Saved dish | 1 | Day 3 | `dishId` |
| `users/{uid}/mealPlans/YYYY-MM-DD` | Planned dishes for one day | 1 | Day 3 | `dishId` |
| `users/{uid}/savings/{id}` | Money saved by cooking | 1 | Day 3 | `dishId` |
| `users/{uid}/groceryLists/{id}` | Shopping list | — | planned (Day 9) | `ingredientId` |
| `users/{uid}/ratings/{id}` | The user's own dish rating | — | planned | `dishId` |

### Fields per collection

- **profile** (`UserProfile`): `name` string · `age` number|null · `sex` 'female'|'male'|'other'|null · `heightCm` number|null · `weightKg` number|null · `activityLevel` 'sedentary'|'light'|'moderate'|'active'|'very-active'|null · `goal` 'lose'|'maintain'|'gain'|'muscle' · `dietType` 'veg'|'egg'|'non-veg' · `cookingLevel` 'beginner'|'expert' · `equipmentOwned` string[] · `gymAccess` boolean|null · `breakfastReminder` boolean · `onboarded` boolean · `privateFlags` map of booleans · `onboardedOn` YYYY-MM-DD|null. Body fields stay null until the user enters them; nothing is guessed.
- **Every log** has `timestamp` (epoch ms), `dateKey` (YYYY-MM-DD, local day) and optional `demoSample` (true only for the demo's made-up sample week; never copied to an account).
- **mealLogs**: `name`, `emoji`, `dishId` (null for quick/custom), `source` 'dish'|'quick'|'custom', `kcal`, `proteinG`, `fibreG`, `cooked` (made at home).
- **waterLogs**: `glasses`.
- **supplementLogs**: `name`, `nutrientId`|null, `dose`|null, `unit`|null.
- **workoutLogs**: `type`, `exerciseId`|null, `minutes`, `kcal` (estimate).
- **favourites**: `dishId`.
- **mealPlans**: `dateKey`, `slots` { breakfast?, lunch?, dinner? } → dish ids.
- **savings**: `timestamp`, `amountInr`, `dishId`|null, `note`|null.

### How sync works (`src/services/storage/`)

- Guests: `LocalDocStore` only.
- Signed in: `SyncedDocStore`. Writes land on the device first, their ids join an outbox (`fitplate.outbox.<uid>.v1`), and after 1.5 s of quiet they go to Firestore in one batch. Failed sends stay in the outbox and retry on the next flush, including after an app restart.
- `pull(collection)` merges device and cloud, last write wins on `updatedAt` (cloud wins a tie), and writes each side only what changed.
- Reads migrate old documents to the current `schemaVersion` and save the upgraded copy once.
- Firestore (`firestoreRemote.ts`): web uses the persistent IndexedDB cache; native uses the memory cache plus the AsyncStorage copy.

### Migration from the demo blob

`fromLegacyState()` turns `fitplate.state.v2` into documents with stable ids (running it twice never duplicates). The demo's sample week is marked `demoSample: true` (meals seeded at whole minutes, workouts at time 0, water on days with only sample entries), and the seeded ₹2,860 is not counted as savings.

A collection is created only on the day a feature first needs it; this table then gets its full field list.

### Security rules

Kept in `firestore.rules` at the repo root. Only the signed-in owner can read or write anything under `users/{their uid}`. New subcollections under `users/{uid}` need no rule change. A new top-level collection would need a new rule and a USER ACTION in that day's build file.

### Free-tier guard

Spark allows about 20,000 writes and 50,000 reads a day. Writes are batched and debounced (for example the water +/- buttons), each screen uses one listener, and the app never writes in a loop on start-up.

## 4. Guests and sign-in

- Guests: data stays in AsyncStorage on the device.
- Guest signs in with Google: the app offers to copy the device data into the account (one tap), then uses the cloud copy.
- Sign-out: the cloud data stays; the device cache is cleared.

## 5. Changelog

- 2026-10-10 (Day 2): file created. Documents the demo blob (`fitplate.state.v2`) and the planned Firestore layout. Added `firestore.rules`. No schema code yet and no data changes; the navigation shell stores nothing new.
- 2026-10-10 (Day 3): all user collections defined at version 1, with types in `src/models/`, the device store, the synced store with outbox, last-write-wins merge, the Firestore adapter, the demo-blob migration and the guest → account copy. Tests use a mocked Firestore. The app does not use this layer yet; Day 03b connects it.
````

## 8. DEPENDENCIES

None. Firestore ships inside the `firebase` package that is already installed (12.19.0).

## 9. HOW TO APPLY (for Sudarsan)

Run these from inside the `FITPLATE` folder on your Mac.

**Option A (simplest): the code is already on the branch**
1. `git add -A && git commit -m "Before Day 03"` (skip this if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand.** Days 01 and 02 must be applied first.
1. `git add -A && git commit -m "Before Day 03"`
2. Create every NEW file from section 7 at its path (`src/models/`, `src/services/storage/`, `src/__tests__/storage/`).
3. Replace `docs/DATA_MODEL.md` with the version in section 7.
4. `npm test`, then `npx expo start -c`.

## 10. HOW TO TEST

**Quickest check: the live site** https://fitplateapp.netlify.app. It should look and behave exactly as after Day 02, because today's work has no screens.

**Manual checklist (web and iPhone)**
- [ ] Onboarding, all five tabs, the + quick-log sheet and the Track switcher work as before. Web ☐ iPhone ☐
- [ ] Logging a meal, water or a workout still updates Today. Web ☐ iPhone ☐

**Automated (run in this session on 2026-10-10; real results)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems) |
| Unit tests | `npm test` | ✅ 7 suites, 53 tests passed (38 new) |
| Web bundle | `npx expo export -p web` | ✅ exported. Also checked with the Firestore adapter imported, to prove it bundles for web before Day 03b uses it. |
| Web click-through | Playwright (Chromium, 390×844) on the exported site | ✅ onboarding → all 5 tabs, avatar → Profile, + → quick log, old links open; no page errors |

The new tests cover:
- save, load, update (updatedAt always moves forward), soft delete, list and filter, upsert, and migration on read (including refusing a missing migration step);
- a corrupt stored value, and two saves at the same moment;
- last-write-wins, including ties and deletion versus edit;
- cloud paths (`users/{uid}`, `users/{uid}/<collection>/<id>`);
- debounced batching (three water taps make one cloud write), an offline outbox that survives a restart, and pull and merge;
- demo-blob migration (sample week marked, ₹2,860 not counted, stable ids), guest copy (sample skipped, newer cloud data kept), a second device seeing the first device's data, and sign-out clearing only this device.

## 11. KNOWN ISSUES, LIMITATIONS AND TODOs

- **INCOMPLETE (Day 03b):** the screens still use the demo store (`src/lib/store.tsx`, one AsyncStorage blob). Day 03b will:
  1. Run `fromLegacyState` once into the device repositories.
  2. Make the store read and write through `openUserData`, so it uses the device for guests and device plus Firestore when signed in.
  3. Show the "Bring your data with you?" prompt after sign-in, using `copyGuestToAccount`.
  4. Clear the device on sign-out.
  5. Turn on `cloudSync` once you confirm Firestore and its rules exist (see USER ACTIONS).
- On iPhone and Android, Firestore uses its memory cache. Offline safety comes from the app's own device copy and outbox. On the web, Firestore's IndexedDB cache is also on.
- Firestore reads are full-collection for now. That is fine at demo scale; Day 34 (cloud sync hardening) adds date-range queries and one listener per screen.
- Telling sample entries from real ones uses timestamps: sample meals sit on whole minutes. A real tap has about a 1 in 60,000 chance of landing on a whole minute; the only effect is that it would not be copied to the account.
- Research types for nutrients, hydration, guidance and exercises are loose for now; Day 5 sets their exact shapes from the JSON blocks.

## 12. USER ACTIONS ADDED TODAY

1. **Decision needed: research for the Office canteen builder (idea 3).**
   - **Why:** per-portion nutrition for thali parts (roti, katori dal, sabzi, rice, curd) is not in any research stream, and the app must not invent it.
   - **Options:** (a) add about 15 common thali components to the dish research list, or (b) a small one-off research task.
   - **When:** any time; the idea waits in the backlog.
   - **Time:** a one-line reply.
2. **Decision needed: a fasting field in the dish research (idea 4).**
   - **Why:** to filter fast-friendly dishes, the dish research would need a "fasting suitability" line, and a few vrat dishes would need adding.
   - **When:** any time.
   - **Time:** a one-line reply.

Still open from Day 2: **create Firestore and publish `firestore.rules`.** This is needed before Day 03b can turn cloud sync on. The steps are in the Day 02 file, section 11.

## 13. BUILD STATE

### Roadmap

| Day | Item | Status |
|---|---|---|
| 1 | Audit and architecture | ✅ done |
| 2 | Navigation shell | ✅ done |
| 3 | Data models and storage | 🟡 partial (layer + tests done; app wiring is Day 03b) |
| 4 | Research pipeline I (dishes, ingredients) | ⬜ |
| 5 | Research pipeline II (nutrients, hydration, fitness, cross-links) | ⬜ |
| 6 | Dish library (Cook tab) | ⬜ |
| 7 | Dish detail screen | ⬜ |
| 8 | Cost-to-make engine | ⬜ |
| 9 | Servings scaler and shopping list (checklist with include box and one variant per ingredient, per SPEC-ADDENDA §7) | ⬜ |
| 10 | Cooking level and kitchen personalisation | ⬜ |
| 11 | Guided cook mode (core) | ⬜ |
| 12 | Cook mode extras | ⬜ |
| 13 | Meal logging and a real Today screen | ⬜ |
| 14 | After the meal and savings dashboard | ⬜ |
| 15 | INTEGRATION #1 | ⬜ |
| 15G1 | Grocery: vendor price comparison + logo-tap deep links (SPEC-ADDENDA §7) | ⬜ |
| 15G2 | Grocery: basket checkout scaffolding for Zepto and Instamart, confirm step, flags OFF (SPEC-ADDENDA §7) | ⬜ |
| 16 | Profile and targets engine | ⬜ |
| 17 | Water tracker | ⬜ |
| 18 | Vitamin and mineral tracking | ⬜ |
| 19 | Nutrition insights | ⬜ |
| 20 | INTEGRATION #2 | ⬜ |
| 21 | Exercise library (Move tab) | ⬜ |
| 22 | Exercise detail | ⬜ |
| 23 | Routines | ⬜ |
| 24 | Workout player | ⬜ |
| 25 | Rep-counter and form-check engine | ⬜ |
| 26 | Camera workout mode | ⬜ |
| 27 | Burn and balance | ⬜ |
| 28 | INTEGRATION #3 | ⬜ |
| 29 | Track tab dashboard | ⬜ |
| 30 | Recommendations | ⬜ |
| 31 | Onboarding and personalisation upgrade | ⬜ |
| 32 | Free vs paid scaffold and settings | ⬜ |
| 33 | Reminders and habits | ⬜ |
| 34 | Cloud sync hardening (per SPEC-ADDENDA §5) | ⬜ |
| 35 | Quality pass | ⬜ |
| 36 | Feasibility documents | ⬜ |
| 37 | Final integration and handover | ⬜ |

### Baseline audit (demo-app @ 5f62d71)

- **Stack:** Expo SDK 57 (`expo ~57.0.26`), React Native 0.86.3, React 19.2.3, TypeScript ~6.0 (strict), Expo Router ~57 with typed routes, Reanimated 4, ESLint 9 (`eslint-config-expo` flat config). There are no `ios/` or `android/` folders (Continuous Native Generation).
- **Folders:** `src/app/` (routes only), `src/components/` (`ui.tsx` shared UI, `DishCard`, `GoogleSignInButton`), `src/data/dishes.ts` (5 demo dishes), `src/lib/` (`store.tsx`, `firebase.ts`, `haptics.ts`, `reminders.ts`), `src/theme.ts`, `assets/` (icons, `videos/login.mp4`).
- **Navigation (Expo Router):** root `Stack` in `src/app/_layout.tsx` → `index` (welcome/login), `onboarding`, `(tabs)`, `dish/[id]`, `cook/[id]`, `done/[id]`, `shop/[id]`, `profile`, `grocery`, `log` (form sheet). `(tabs)/_layout.tsx` is a custom floating blurred tab bar with the tabs **Today** (`index`), **Discover**, **Plan** and **Progress**, plus a centre "+" button that opens `/log`.
- **Auth flow:** `src/lib/firebase.ts` turns Firebase on only when `EXPO_PUBLIC_FIREBASE_API_KEY`, `_PROJECT_ID` and `_APP_ID` exist. The Google button shows only if a Google client ID is also set. Otherwise "Get started" runs `continueAsGuest`. `index.tsx` redirects a signed-in or guest user to `/onboarding` or `/(tabs)`.
- **State:** a single React context (`StoreProvider` / `useStore`) holding the profile, day logs (meals, exercise, water), money saved, favourites and the meal plan. It is saved as one JSON blob in AsyncStorage under `fitplate.state.v2` and seeded with sample history for the demo. Helpers in the store: `GOALS` targets, `EXERCISES` METs (70 kg), `QUICK_MEALS`, `dayTotals`, `recommend`, `allowedDishes`.
- **Styling:** `StyleSheet.create` plus tokens from `src/theme.ts` (dark palette, gradients, radius, type). `expo-blur`, `expo-linear-gradient` and Reanimated are used for motion. Haptics go through `src/lib/haptics.ts`.
- **Already installed and usable later:** AsyncStorage, `expo-notifications`, `expo-keep-awake`, `expo-haptics`, `expo-video`, `react-native-svg`, `@expo/vector-icons`.

### ARCHITECTURE (final; all later days follow this)

1. **Conventions:** TypeScript strict; Expo Router; every file in `src/app/` is a route, and non-route code lives outside it. `StyleSheet.create` with tokens. Functional components and hooks. Named exports for logic, default exports for route screens. Two-space indent, single quotes (as in the repo). Comments explain *why*.
2. **Navigation map (built on Day 2):** the custom floating tab bar is driven by `src/config/tabs.ts`. Tabs: **Today** (`(tabs)/index`), **Cook** (`(tabs)/cook`: shows the demo dish browser until Day 6), **Track** (`(tabs)/track`: Progress / Meal plan switcher until Day 29), **Move** (`(tabs)/move`: placeholder until Day 21) and **Profile** (`(tabs)/me`). The Profile tab file is `me`, not `profile`, because `/profile` is already a stack screen and two routes cannot share a URL. The "+" quick-log button sits at the right end of the bar. `discover`, `plan` and `progress` stay registered with `href: null`, so old links still open. `featureFlags.newTabShell` is ON; false restores the demo's four tabs. Links that depend on the shell use `dishLibraryHref()` and `profileHref()`. The stack routes (`dish/[id]`, `cook/[id]`, `done/[id]`, `shop/[id]`, `profile`, `grocery`, `log`) are unchanged.
3. **Storage (Day 3), now cloud-first per SPEC-ADDENDA §5:** typed repositories backed by Firestore (`users/{uid}/…`) for signed-in users and AsyncStorage for guests and as the offline cache; last-write-wins on `updatedAt`; every document has `id`, `createdAt`, `updatedAt`, `schemaVersion`, `deleted`. Built on Day 3 in `src/services/storage/` (see `docs/DATA_MODEL.md`): `storageService` (typed keys, envelopes, migration hook, exportAll, resetAll), `LocalDocStore` (one AsyncStorage key per owner and collection), `RemoteDocStore` over a `RemoteAdapter` (`firestoreRemote.ts` is the real Firestore one), `SyncedDocStore` (device first, outbox, 1.5 s debounced batches), `createRepository` (create/get/list/update/upsert/soft remove, read-time migrations), `fromLegacyState` and `copyGuestToAccount`. `openUserData({ kv, uid, remote })` is the single entry point. Rules in `firestore.rules`. The original plan, kept for reference: `src/services/storage/` wraps AsyncStorage with typed keys (`fitplate.<name>.v<N>`), versioned envelopes `{ version, data }`, a migration hook, `exportAll()` and `resetAll()`. Repositories: `mealLogs`, `waterLogs`, `supplementLogs`, `workoutLogs`, `profile`. A one-time migration reads `fitplate.state.v2` so demo users keep their data. The React context stays as the in-memory cache and calls the repositories.
4. **Data folder layout (Day 4–5):** `src/data/research/dishes/<NNN>-<slug>.json`, `ingredients/<id>.json` plus `aliases.json`, `nutrients/<id>.json`, `hydration/<id>.json`, `guidance/<id>.json`, `exercises/<id>.json`. Each folder has a generated `index.ts` of static `require`s. The demo `src/data/dishes.ts` stays separate until the research dishes replace it on the Cook tab. Importers, merge rules, the price engine, cross-links and validators go in `src/services/data/`, written as plain TS functions so Jest can test them. The import itself is run by the build session with a Node script (`scripts/research/`) that writes the JSON files; the app only reads bundled JSON.
5. **Theme tokens:** `src/config/theme.ts` (`brand.primary` #1E8A5A, `colors`, `spacing`, `radius`, `typography`, `touchTarget` 44). Dark theme stays, as decided in section 4.
6. **Types (built on Day 3):** `src/models/` (`common`, `user`, `logs`, `research`) holds `Dish`, `Ingredient`, `Nutrient`, `Hydration`, `Guidance`, `Exercise`, `MealLog`, `WaterLog`, `SupplementLog`, `WorkoutLog` and `UserProfile`, with the field names from the spec's DEFAULT ARCHITECTURE, plus `Dish.asOrdered` and full `Ingredient.nutritionPer100g` with per-field `source` and `confidence` (SPEC-ADDENDA). The demo's own `Profile`/`MealLog` types in `store.tsx` are mapped to these by the Day 3 migration.
7. **Feature flags:** `src/config/featureFlags.ts`, a typed `as const` object plus `isEnabled()`. Unfinished or dev-build-only features stay `false` until their "Done when" check passes.
8. **Testing:** Jest 29 with the `jest-expo` preset (`jest.config.js`). Tests live in `src/**/__tests__/*.test.ts(x)` and import `describe`/`it`/`expect` from `@jest/globals` (TypeScript 6 does not pick up global jest types automatically). `npm test`. Every logic module gets tests. Jest maps `@react-native-async-storage/async-storage` to its bundled mock; tests that import `src/lib/store.tsx` stub `firebase/auth` and `../lib/firebase` with `jest.mock` (Firebase ships ESM that Jest cannot load). Before every push the checks are `npx tsc --noEmit`, `npx expo lint`, `npm test` and `npx expo export --platform web`.

### Code files touched since the baseline

| Path | Last changed |
|---|---|
| `src/config/theme.ts` | Day 1 |
| `package.json` | Day 1 |
| `package-lock.json` | Day 1 |
| `src/config/tabs.ts` | Day 2 |
| `src/app/(tabs)/_layout.tsx` | Day 2 |
| `src/app/(tabs)/cook.tsx` | Day 2 |
| `src/app/(tabs)/track.tsx` | Day 2 |
| `src/app/(tabs)/move.tsx` | Day 2 |
| `src/app/(tabs)/me.tsx` | Day 2 |
| `src/app/(tabs)/discover.tsx` | Day 2 |
| `src/app/(tabs)/plan.tsx` | Day 2 |
| `src/app/(tabs)/progress.tsx` | Day 2 |
| `src/app/(tabs)/index.tsx` | Day 2 |
| `src/app/profile.tsx` | Day 2 |
| `src/components/ui.tsx` | Day 2 |
| `src/config/featureFlags.ts` | Day 2 |
| `src/services/activity.ts` | Day 2 |
| `src/__tests__/tabs.test.ts` | Day 2 |
| `src/__tests__/activity.test.ts` | Day 2 |
| `src/__tests__/config.test.ts` | Day 2 |
| `jest.config.js` | Day 2 |
| `firestore.rules` | Day 2 |
| `docs/DATA_MODEL.md` | Day 3 |
| `public/index.html`, `public/manifest.json`, `public/*.png`, `assets/icon.png`, `assets/favicon.png` (app icon) | merged from demo-app on 2026-10-10 (5c97126), not by the build |
| `src/lib/store.tsx`, `src/app/index.tsx`, `.env.example` (Google photo and email) | merged from demo-app on 2026-10-09 (c8a2449), not by the build |
| `src/models/common.ts` | Day 3 |
| `src/models/user.ts` | Day 3 |
| `src/models/logs.ts` | Day 3 |
| `src/models/research.ts` | Day 3 |
| `src/models/index.ts` | Day 3 |
| `src/services/storage/kv.ts` | Day 3 |
| `src/services/storage/storageService.ts` | Day 3 |
| `src/services/storage/docStore.ts` | Day 3 |
| `src/services/storage/remote.ts` | Day 3 |
| `src/services/storage/firestoreRemote.ts` | Day 3 |
| `src/services/storage/syncedStore.ts` | Day 3 |
| `src/services/storage/lww.ts` | Day 3 |
| `src/services/storage/repository.ts` | Day 3 |
| `src/services/storage/schemas.ts` | Day 3 |
| `src/services/storage/legacy.ts` | Day 3 |
| `src/services/storage/guest.ts` | Day 3 |
| `src/services/storage/index.ts` | Day 3 |
| `src/__tests__/storage/fakes.ts` | Day 3 |
| `src/__tests__/storage/storageService.test.ts` | Day 3 |
| `src/__tests__/storage/repository.test.ts` | Day 3 |
| `src/__tests__/storage/sync.test.ts` | Day 3 |
| `src/__tests__/storage/legacy.test.ts` | Day 3 |

### Feature flags

| Flag | Value | For |
|---|---|---|
| newTabShell | true (since Day 2) | Day 2 |
| researchData | false | Day 4–6 |
| cameraCheck | false | Day 12 (dev build) |
| voiceSteps | false | Day 12 |
| reminders | false | Day 17 / 33 |
| poseRepCounter | false | Day 26 (dev build) |
| paywall | false | Day 32 (everything free; open decision) |
| cloudSync | false | Day 03b turns it on once Firestore and its rules exist |

### Dependencies added so far

| Package | Version | Type | Day |
|---|---|---|---|
| jest | ^29.7.0 | dev | 1 |
| jest-expo | ~57.0.5 | dev | 1 |
| @jest/globals | ^29.7.0 | dev | 1 |

### RESEARCH LEDGER

| Stream | File | Items | Ingested on build day |
|---|---|---|---|
| Dishes | FitPlate_Dishes_2026-10-04.md | 1–5 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-05.md | 6–10 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-06.md | 11–15 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-07.md | 16–20 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-08.md | 21–25 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-09.md | 26–30 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-04.md | 47 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-05.md | 21 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-06.md | 10 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-07.md | 5 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-08.md | 7 | — (backlog) |
| Ingredients | FitPlate_Ingredients_2026-10-09.md | 7 | — (backlog) |
| Nutrients | FitPlate_Nutrients_2026-10-09.md | 1 Vitamin A, 2 Vitamin D | — (backlog) |
| Fitness | FitPlate_Fitness_2026-10-09.md | Home 1, Yoga 1, Gym 1, Gym 2 | — (backlog) |
| Dishes | FitPlate_Dishes_2026-10-10.md | 31–35 | — (backlog; recorded Day 2) |
| Ingredients | FitPlate_Ingredients_2026-10-10.md | 13 | — (backlog; recorded Day 2) |
| Nutrients | FitPlate_Nutrients_2026-10-10.md | 3 Vitamin E, 4 Vitamin K | — (backlog; recorded Day 2) |
| Fitness | FitPlate_Fitness_2026-10-10.md | Home 2, Yoga 2, Gym 3, Gym 4 | — (backlog; recorded Day 2) |

- **Backlog per stream:**
  - Dishes: 7 files / 35 items
  - Ingredients: 7 files / 110 entries
  - Nutrients: 2 files / 4 topics
  - Fitness: 2 files / 8 items
- **Per-item versions:** every item still has 1 version, and nothing has been merged or output yet.
- **Catch-up plan:** from Day 4, at 10 dishes and 30 ingredients a day, the dish backlog shrinks by about 5 a day. The ingredient backlog (about 136 entries by Day 4, +13 a day at the current pace) clears in roughly 8 runs.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema today:** all eight user collections are defined at version 1: `profile` (on `users/{uid}`), `mealLogs`, `waterLogs` (one document per day), `supplementLogs`, `workoutLogs`, `favourites`, `mealPlans` and `savings`. Each has `id`, `createdAt`, `updatedAt`, `schemaVersion` and `deleted`. The fields are listed in `docs/DATA_MODEL.md`.
- **Migration:** `fromLegacyState` moves the demo blob `fitplate.state.v2` into these documents with stable ids, marks the sample week `demoSample: true`, and removes the seeded ₹2,860 from savings. Read-time migrations (`schemaVersion` chain) are in place for future version bumps.
- **Tests:** 38 new tests, using a mocked Firestore only.
- **Free-tier guard:** writes are device-first, then 1.5 s debounced batches of at most 500; water is one document per day.
- **Rules:** unchanged (owner-only, `firestore.rules`). No new top-level collection.
- **USER ACTION:** create Firestore and publish the rules (open since Day 2).

### Research gaps

1. Dishes 1–20 (files 10-04 to 10-07) have no "AS ORDERED (from delivery apps)" block. Their as-ordered nutrition stays null until each dish is re-researched.
2. Ingredients from the files dated 10-04 to 10-08 (90 entries) lack the full per-100 g nutrient-profile JSON. They stay null until each ingredient is re-priced.
3. Nutrient topics 5–42 and later fitness items have not been researched yet (expected).
4. Dish order prices from 10-10 come from search-result snapshots, because delivery-app pages block direct access. Confidence should reflect that.
5. NEW: no research covers per-portion nutrition of office canteen thali components (needed by idea 3).
6. NEW: dish research has no fasting-suitability field (needed by idea 4).

### IDEAS BACKLOG (ranked by impact ÷ effort; S = 1, M = 2, L = 3)

| Rank | Idea | Type | Impact | Effort | Score | Needs | Status |
|---|---|---|---|---|---|---|---|
| 1 | Fridge rescue | NEW FEATURE | 4 | S | 4.0 | Dish library (Day 6) | approved by Sudarsan 2026-10-10; build after Day 6 |
| 2 | Monsoon swap | IMPROVE | 3 | S | 3.0 | Price engine and cost to make (Day 8) | approved by Sudarsan 2026-10-10; build after Day 8 |
| — | Office canteen builder | IMPROVE | 5 | M | — | New thali-component research | **STANDBY / TODO** (Sudarsan, 2026-10-10: on hold, he has bigger plans for tracking meals at the office; do not build or research) |
| 3 | Fasting mode | NEW SEGMENT | 4 | M | 2.0 | Dish fasting field | approved by Sudarsan 2026-10-10; dish research adds the Fasting suitability block from dish 36 (SPEC-ADDENDA §6); build once enough dishes carry it |
| 4 | Parents' plate | NEW SEGMENT | 4 | M | 2.0 | Ingredient sodium and sugar data (exists, partial) | approved by Sudarsan 2026-10-10 |

### TODO / STANDBY (Sudarsan's parked items; never build these until he says so)

- **Office canteen thali builder / office meal tracking** (idea 3, parked 2026-10-10). Sudarsan has bigger plans for tracking meals in office workspaces. Keep it here; new ideas about office meals should be added under this item, not built.

### USER ACTIONS (cumulative)

| # | Action | Added | Status |
|---|---|---|---|
| 1 | Create Firestore (asia-south1, Spark) and publish `firestore.rules` | Day 2 | closed: done by Sudarsan (database 2026-10-09, rules 2026-10-10) |
| 2 | Decision: research for thali components (idea 3) | Day 3 | closed: on standby by Sudarsan (2026-10-10); stays in the to-do list |
| 3 | Decision: fasting-suitability field in dish research (idea 4) | Day 3 | closed: approved (2026-10-10); dish research PROMPT_PATCH_02 adds it from dish 36 (SPEC-ADDENDA §6) |

**Next up: Day 03b: connect the app to the storage layer (migrate the demo blob, guest/device + signed-in/cloud, sign-in copy prompt, sign-out clear), then Day 04: Research pipeline I (dishes, ingredients).**
