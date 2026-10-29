# FitPlate Build — Day 03b — 2026-10-11 (morning run)

## 1. HEADER

**Day 03b of 37 | Roadmap item: Data models and storage, part 2 (connect the app to the cloud-first storage layer, SPEC-ADDENDA §5) | Phase 0: Foundation and data pipeline | Progress: 8% of the full app (3 ÷ 37; Day 3 is now complete)**

**Status: DONE.** Day 3 is now ✅. Commit `8df1b5a` is pushed to `claude/project-thread-wchnlm`, and Netlify deploys it to https://fitplateapp.netlify.app.

- **How this run's day was determined:**
  - The newest build file is `FitPlate_Build_Day03_2026-10-10.md`.
  - Its BUILD STATE marks Day 3 🟡 partial and says "Next up: Day 03b". The remaining work can be coded.
  - So, per STEP 1.2, this run finishes it as Day 03b.
  - This is the 10:52 IST morning run. There was no build file for 2026-10-11 yet, so the run went ahead.
- **Supervisor review:** there is no `FitPlate_Review_*.md` yet. The first review is due today at 14:52 IST, so there is no FIX LIST this run. Its fixes are picked up by the first run after it appears (tonight's).
- **Context available:**
  - Code source **(a)**: branch `claude/project-thread-wchnlm` at a873e79 (Day 03).
  - Spec: `PROMPT.md` and `SPEC-ADDENDA.md` §1, §2 and §4 to §7.
  - Research files visible:
    - Dishes: 8 (2026-10-04 … 2026-10-11)
    - Ingredients: 8 (2026-10-04 … 2026-10-11)
    - Nutrients: 3 (2026-10-09 … 2026-10-11)
    - Fitness: 3 (2026-10-09 … 2026-10-11)
  - New since Day 03: one file in each stream, dated 2026-10-11.

## 2. SUMMARY

1. **Saving now works on every device.** The app saves everything through the new storage layer. When you're signed in with Google, your profile, meals, water, workouts, saved dishes, meal plan and money saved go to your own Firestore space (`users/{your id}`). Open the app on another device and the same data is there.
2. **Guests keep everything on the phone.** Anyone who used the old demo keeps their logs: the old save is moved over once, and kept as a backup.
3. **The sign-in copy prompt.** After a guest signs in, a card asks "Bring your data with you?":
   - **Copy my data** moves their own entries into the account. The demo's sample week is never copied.
   - **Start fresh** leaves them on the phone.
4. **Sign-out and the Profile tab.** Signing out sends any waiting changes, then clears the phone. If you're offline it keeps them, so nothing is lost. Profile now says where your data is saved. "Reset demo data" only shows for guests, so it can never wipe a real account.
5. **Innovation: Lite mode.** On a slow 2G connection, with Data Saver on, or with "Reduce motion" turned on, the welcome, onboarding and cook screens show a still green backdrop instead of the background videos.

## 3. DATA SYNC REPORT

- **New research files since Day 03** (recorded in the ledger, not ingested):

  | Stream | File | Items |
  |---|---|---|
  | Dishes | FitPlate_Dishes_2026-10-11.md | 36 Rava Dosa, 37 Bhindi Masala, 38 Egg Curry, 39 Veg Biryani, 40 Sabudana Khichdi |
  | Ingredients | FitPlate_Ingredients_2026-10-11.md | 3: okra, sabudana, rock salt |
  | Nutrients | FitPlate_Nutrients_2026-10-11.md | 5 Vitamin C, 6 Thiamine (B1) |
  | Fitness | FitPlate_Fitness_2026-10-11.md | Home 3 Plank and side plank, Yoga 3 Hip flexor stretch, Gym 5 Treadmill, Gym 6 Elliptical |

- **Ingested:** nothing. The importers start on Day 4 (dishes and ingredients) and Day 5 (nutrients, hydration and fitness), so the files are only recorded in the ledger.
- **Backlog remaining:**
  - Dishes: 8 files / 40 items
  - Ingredients: 8 files / 113 entries
  - Nutrients: 3 files / 6 topics
  - Fitness: 3 files / 12 items
- **Price trends, conflicts, outliers, spikes and "needs review" flags:** none, because nothing has been merged yet.
- **Unmatched ingredient names:** not checked yet (Day 5).
- **Notes for the importers:**
  - Dish 36 onwards carries the Fasting suitability block, as SPEC-ADDENDA §6 expects. Rava Dosa, for example, reads: Navratri No, Ekadashi No, Jain With changes, Ramadan Yes.
  - The first vrat dish (40, Sabudana Khichdi) and its fasting ingredients (sabudana, rock salt) arrived today. That makes Fasting mode (idea 3) more practical once Day 6 is built.
- **New research gaps:** none.

## 4. DESIGN NOTES

### Welcome screen (`/`)
- Unchanged apart from the small print, which now reads: "Free to start · No ads · Sign in to keep your data on every device". The old line said the data stays on your phone, which is no longer true for signed-in users.
- A signed-in user now stays on this screen until their data has loaded. For the first sign-in on a new device, that means the first cloud pull, waiting at most 8 seconds. Before, a returning user could land in onboarding by mistake.

### "Bring your data with you?" card (new; `src/components/GuestCopyPrompt.tsx`)
- **When it shows:**
  - The user has just signed in with Google, and the guest store on this device has entries of their own (the sample week doesn't count).
  - It shows once per account on this device.
- **Layout, top to bottom** (a centred card on a dimmed backdrop, max width 420):
  - 📲
  - **Bring your data with you?**
  - "Copy the meals, water and workouts you logged on this device into your account, so they show on every device."
  - Small grey line: "N entries on this device · the demo's sample week is not copied"
  - Buttons: **Copy my data** (green), **Start fresh** (glass)
- **While copying:** a spinner and "Copying…" replace the buttons.
- **Error:** "Couldn't copy right now. Your data is still safe on this device. Please try again." The buttons come back.
- Android's back button does nothing here, so the user always makes the choice.
- **After either answer:** the app carries on to Today, or to onboarding for a brand-new account with nothing copied.
- **Accessibility:** buttons are 52–54 px tall with labels, and the card is marked as an alert and modal.

### Profile (tab and stack screen)
- A new line under "Signed in with Google · email" shows where the data is:
  - Guest: "Saved on this device only. Sign in to keep it on every device."
  - Signed in and synced: "☁️ Synced to your account on every device."
  - Signed in but the last sync failed (amber): "Offline right now. Changes are saved on this phone and will sync when you're back online."
  - Signed in with cloud sync switched off by the flag: "Saved on this device."
- "Reset demo data" now shows for guests only. Its alert text reads "…clears your logs on this device".

### Lite mode (innovation)
- On the welcome, onboarding and cook screens, the background video is replaced by a still green-to-black gradient with the same dimming.
- It turns on with any one of: the OS "Reduce motion" setting, the browser Data Saver, or a 2G connection (the last two are web only).

### Data decisions behind the screens
- **Same-tap updates.** Every tap updates the screen at once from memory. Writes then go through the repositories one at a time and in order, so rapid taps are never lost, and the cloud gets one debounced batch.
- **Sample week for guests only.** A new guest device gets the sample week, with every entry marked `demoSample`. A real account never gets sample data.
- **The account's profile wins.** When copying, the guest's profile is used only when the account has none yet. A stale guest profile can never overwrite a real one.

## 5. INNOVATION

New ideas this run (none of them are in the IDEAS BACKLOG yet):

1. **Lite mode** · IMPROVE (low-end phones, costly data, accessibility) · Impact 3 · Effort S · **built today**
   - **Problem:** "The app keeps playing videos and eats my 1.5 GB daily data; on my old phone it stutters." This hits budget phone users, people on prepaid data, and people who get motion sickness.
   - **Solution:** a still backdrop instead of the background videos when Reduce motion, Data Saver or 2G is detected. Later it can also skip images and autoplay (Day 35 quality pass).
   - **Data:** none. **Risk:** none.
2. **Kettle and one-burner cooking** · IMPROVE (Day 10 kitchen personalisation) · Impact 4 · Effort S (after Day 10)
   - **Problem:** "My PG only allows an electric kettle and one induction plate, so most recipes are useless to me." This hits students, PG and hostel residents, and new joiners in shared flats.
   - **Solution:** a "My kitchen: kettle / one induction" preset in the profile. It filters the library to dishes whose equipment fits, and shows the one-pot alternative where the research gives one.
   - **Data:** the dish Equipment section (already researched, section 3 of each dish). No new research stream is needed.
   - **Risk:** none.
3. **Tomorrow's tiffin** · NEW FEATURE · Impact 4 · Effort M (after Day 12)
   - **Problem:** "I cook dinner but still buy a ₹180 lunch at office the next day." This hits the core Mumbai corporate user.
   - **Solution:** after finishing a dinner dish, offer "Pack some for tomorrow's lunch?". It doubles the servings in cook mode, adds a 7:30 am "pack your tiffin" nudge, and logs tomorrow's lunch with one tap. Money saved counts the avoided order.
   - **Data:** the dish "After the meal" storage advice and order prices (both researched). No new stream is needed.
   - **Risk:** food safety. The app must use the researched storage times only and say "refrigerate within 2 hours" only where the research says so.
4. **Late-night craving helper** · NEW FEATURE · Impact 3 · Effort S (after Day 6)
   - **Problem:** "At 11 pm I'm hungry and tired and end up ordering fries." This hits people working late, people on night shifts, and students.
   - **Solution:** after 10 pm, Today swaps its suggestions for light dishes under 15 minutes from the library (low kcal, high healthiness), with a gentle "Something light?" card. No guilt copy.
   - **Data:** dish time, kcal and healthiness (researched).
   - **Risk:** none. The copy stays tasty-first, never shaming.

**Built today:** idea 1, Lite mode, behind the `liteMode` flag (ON: complete and tested). The higher-ranked Fridge rescue and Monsoon swap need Day 6 and Day 8, so they don't fit the app yet.

## 6. DATABASE (SPEC-ADDENDA §5)

- **What changed today:** the app now writes every user change through the repositories. Signed-in users go to Firestore (`cloudSync` ON); guests stay on the device.
- **Schema:**
  - `Favourite`, `MealPlanDay` and `SavingEntry` gain an optional `demoSample` field. It is optional, so existing documents stay valid, no `schemaVersion` bump is needed, and there is no migration step.
  - Repositories gain `importMany`, which writes ready-made documents (used by the migration and the sample seed).
- **Migration:** on the first start, `prepareGuestDevice` runs `fromLegacyState` on the demo blob `fitplate.state.v2` into guest documents. It runs once (`fitplate.guestReady.v1`) and leaves the blob in place as a backup. The seeded ₹2,860 stays on the device as a `demo-sample-total` savings entry marked `demoSample`, so guest totals look the same, and it is never copied to an account.
- **New device keys:** `fitplate.guestReady.v1` and `fitplate.guestCopyAsked.<uid>.v1`.
- **No new collection, no rules change.**
- **Free-tier guard:**
  - Reads: one full pull per collection when the app opens for a signed-in user (about one read per document, at least one per collection). There are no listeners yet.
  - Writes: debounced batches, with water kept as one document per day. Waiting changes are also sent when the app goes to the background.
  - A heavy user stays far below the Spark limits.
- **Tests:** 24 new session tests, using the mocked Firestore only.
- **USER ACTION:** none. Firestore and the owner-only rules are already live (Sudarsan, 2026-10-09 and 2026-10-10).

## 7. DATA FILES

None today (no importer yet).

## 8. CODE FILES

| Path | NEW or CHANGED | Purpose |
|---|---|---|
| `src/services/userSession.ts` | NEW | Bridge between screens and storage: in-memory documents, toView, actions, migration, guest copy, sign-out |
| `src/lib/store.tsx` | CHANGED | StoreProvider now opens guest or signed-in user data (device + Firestore) and writes through the session |
| `src/components/GuestCopyPrompt.tsx` | NEW | "Bring your data with you?" card |
| `src/app/index.tsx` | CHANGED | Waits for the copy answer before redirecting; new small print; renders the prompt |
| `src/app/profile.tsx` | CHANGED | Where-your-data-is line; "Reset demo data" for guests only |
| `src/services/storage/repository.ts` | CHANGED | importMany for ready-made documents |
| `src/services/storage/index.ts` | CHANGED | openUserData also returns its store and kv |
| `src/services/storage/legacy.ts` | CHANGED | Seeded ₹2,860 kept as a device-only sample savings entry |
| `src/models/logs.ts` | CHANGED | Optional demoSample on Favourite, MealPlanDay, SavingEntry |
| `src/config/featureFlags.ts` | CHANGED | cloudSync ON; new liteMode flag ON |
| `src/services/liteMode.ts` | NEW | Innovation: when to use the still backdrop |
| `src/lib/useLiteMode.ts` | NEW | Hook: Reduce motion, Data Saver and 2G signals |
| `src/components/ui.tsx` | CHANGED | VideoBackground shows a still backdrop in lite mode |
| `src/__tests__/userSession.test.ts` | NEW | 24 tests: view, migration, session actions, guest copy, sign-out |
| `src/__tests__/liteMode.test.ts` | NEW | Lite mode rules |
| `src/__tests__/storage/legacy.test.ts` | CHANGED | Expects the sample savings entry |
| `src/__tests__/config.test.ts` | CHANGED | cloudSync and liteMode are now finished flags |
| `src/__tests__/activity.test.ts` | CHANGED | Stubs the Firestore adapter (ESM) like Firebase auth |
| `docs/DATA_MODEL.md` | CHANGED | Live guest/sign-in flow, blob migration, changelog |

### `src/services/userSession.ts`

```ts
import type { BaseDoc, DateKey, Doc } from '../models/common';
import type { Favourite, MealLog, MealPlanDay, SavingEntry, WaterLog, WorkoutLog } from '../models/logs';
import { DEFAULT_PROFILE, type UserProfile } from '../models/user';
import type { DayLog, Profile, Slot } from '../lib/store';
import { createLocalDocStore, ownerPrefix } from './storage/docStore';
import { COLLECTIONS, copyGuestToAccount, createRepositories, fromLegacyState, GUEST_OWNER, LEGACY_KEY, PROFILE_ID, SCHEMAS, type LegacyState, type Repositories, type UserData } from './storage';
import type { LegacyDocs } from './storage/legacy';
import type { KeyValueStore } from './storage/kv';
import { makeId } from './storage/repository';
import { createStorageService } from './storage/storageService';

/**
 * Day 03b: the bridge between the screens and the storage layer.
 * The screens still read the demo's shape (`days`, `moneySaved`, …); this
 * module keeps the user's documents in memory, derives that shape from them,
 * and sends every change through the repositories (device, plus Firestore
 * when signed in).
 */

/** The user's documents, by collection and id. Soft-deleted documents are left out. */
export type UserDocs = {
  profile: Doc<UserProfile> | null;
  mealLogs: Record<string, Doc<MealLog>>;
  waterLogs: Record<string, Doc<WaterLog>>;
  workoutLogs: Record<string, Doc<WorkoutLog>>;
  favourites: Record<string, Doc<Favourite>>;
  mealPlans: Record<string, Doc<MealPlanDay>>;
  savings: Record<string, Doc<SavingEntry>>;
};

type ListCollection = Exclude<keyof UserDocs, 'profile'>;
const LIST_COLLECTIONS: readonly ListCollection[] = ['mealLogs', 'waterLogs', 'workoutLogs', 'favourites', 'mealPlans', 'savings'];

export const EMPTY_DOCS: UserDocs = { profile: null, mealLogs: {}, waterLogs: {}, workoutLogs: {}, favourites: {}, mealPlans: {}, savings: {} };

/** Set once the guest store on this device has been migrated from the demo blob, or seeded. */
export const GUEST_READY_KEY = 'fitplate.guestReady.v1';
/** Set once a signed-in user has answered "Bring your data with you?" on this device. */
export const guestCopyAskedKey = (uid: string) => `fitplate.guestCopyAsked.${uid}.v1`;

const byId = <T extends BaseDoc>(docs: T[]): Record<string, T> => Object.fromEntries(docs.map((d) => [d.id, d]));

export const dateKeyOf = (t: number): DateKey => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function loadDocs(repos: Repositories): Promise<UserDocs> {
  const [profile, mealLogs, waterLogs, workoutLogs, favourites, mealPlans, savings] = await Promise.all([
    repos.profile.get(PROFILE_ID),
    repos.mealLogs.list(),
    repos.waterLogs.list(),
    repos.workoutLogs.list(),
    repos.favourites.list(),
    repos.mealPlans.list(),
    repos.savings.list(),
  ]);
  return {
    profile,
    mealLogs: byId(mealLogs),
    waterLogs: byId(waterLogs),
    workoutLogs: byId(workoutLogs),
    favourites: byId(favourites),
    mealPlans: byId(mealPlans),
    savings: byId(savings),
  };
}

export function profileToLegacy(p: UserProfile | null): Profile {
  const x = p ?? DEFAULT_PROFILE;
  return { name: x.name, goal: x.goal, level: x.cookingLevel, diet: x.dietType, breakfastReminder: x.breakfastReminder, onboarded: x.onboarded };
}

export function legacyProfilePatch(p: Partial<Profile>): Partial<UserProfile> {
  const out: Partial<UserProfile> = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.goal !== undefined) out.goal = p.goal;
  if (p.level !== undefined) out.cookingLevel = p.level;
  if (p.diet !== undefined) out.dietType = p.diet;
  if (p.breakfastReminder !== undefined) out.breakfastReminder = p.breakfastReminder;
  if (p.onboarded !== undefined) out.onboarded = p.onboarded;
  return out;
}

const live = <T extends BaseDoc>(r: Record<string, T>) => Object.values(r).filter((d) => !d.deleted);

/** The demo's state shape, derived from the documents. Pure. */
export function toView(docs: UserDocs): LegacyState {
  const days: Record<string, DayLog> = {};
  const day = (k: DateKey) => (days[k] ??= { meals: [], exercise: [], water: 0 });
  for (const m of live(docs.mealLogs).sort((a, b) => a.timestamp - b.timestamp)) {
    day(m.dateKey).meals.push({ name: m.name, emoji: m.emoji, kcal: m.kcal, protein: m.proteinG, fibre: m.fibreG, cooked: m.cooked, at: m.timestamp });
  }
  for (const w of live(docs.workoutLogs).sort((a, b) => a.timestamp - b.timestamp)) {
    day(w.dateKey).exercise.push({ type: w.type, minutes: w.minutes, kcal: w.kcal, at: w.timestamp });
  }
  for (const w of live(docs.waterLogs)) if (w.glasses > 0) day(w.dateKey).water = w.glasses;
  return {
    profile: profileToLegacy(docs.profile && !docs.profile.deleted ? docs.profile : null),
    days,
    moneySaved: live(docs.savings).reduce((s, e) => s + e.amountInr, 0),
    favourites: live(docs.favourites)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((f) => f.dishId),
    plan: Object.fromEntries(live(docs.mealPlans).map((p) => [p.dateKey, p.slots])),
  };
}

/** How many of these documents are the user's own (not the demo's sample week). */
export function ownDataCount(docs: UserDocs): number {
  let n = docs.profile && !docs.profile.deleted && docs.profile.onboarded ? 1 : 0;
  for (const c of LIST_COLLECTIONS) {
    n += live(docs[c] as Record<string, BaseDoc & { demoSample?: boolean }>).filter((d) => !d.demoSample).length;
  }
  return n;
}

/** The demo's sample week as documents, every one marked `demoSample` so it never reaches an account. */
export function sampleDocs(seed: LegacyState, now: number): LegacyDocs {
  const docs = fromLegacyState(seed, now);
  const mark = <T extends BaseDoc>(list: T[]) => list.map((d) => ({ ...d, demoSample: true }));
  return {
    profile: docs.profile,
    mealLogs: mark(docs.mealLogs),
    waterLogs: mark(docs.waterLogs),
    workoutLogs: mark(docs.workoutLogs),
    favourites: mark(docs.favourites),
    mealPlans: mark(docs.mealPlans),
    savings: mark(docs.savings),
  };
}

async function importDocs(repos: Repositories, docs: LegacyDocs) {
  await repos.profile.importMany([docs.profile]);
  await repos.mealLogs.importMany(docs.mealLogs);
  await repos.waterLogs.importMany(docs.waterLogs);
  await repos.workoutLogs.importMany(docs.workoutLogs);
  await repos.favourites.importMany(docs.favourites);
  await repos.mealPlans.importMany(docs.mealPlans);
  await repos.savings.importMany(docs.savings);
}

function parseLegacy(raw: string | null): LegacyState | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && v.profile && v.days ? (v as LegacyState) : null;
  } catch {
    return null;
  }
}

/**
 * First run of the new storage on this device (guest store only):
 * - an existing demo blob (`fitplate.state.v2`) becomes guest documents, so nobody loses their logs;
 * - otherwise the demo's sample week is seeded, marked as sample.
 * Runs once; the old blob is left untouched as a backup.
 */
export async function prepareGuestDevice(kv: KeyValueStore, guest: UserData, seed: () => LegacyState, now: number): Promise<'ready' | 'migrated' | 'seeded'> {
  if (await kv.getItem(GUEST_READY_KEY)) return 'ready';
  const legacy = parseLegacy(await kv.getItem(LEGACY_KEY));
  await importDocs(guest.repos, legacy ? fromLegacyState(legacy, now) : sampleDocs(seed(), now));
  await kv.setItem(GUEST_READY_KEY, String(now));
  return legacy ? 'migrated' : 'seeded';
}

const guestRepos = (kv: KeyValueStore) => createRepositories(createLocalDocStore(kv, GUEST_OWNER));

/** Number of the guest's own documents to offer to this account; 0 once the user has answered. */
export async function guestOfferCount(kv: KeyValueStore, uid: string): Promise<number> {
  if (await kv.getItem(guestCopyAskedKey(uid))) return 0;
  return ownDataCount(await loadDocs(guestRepos(kv)));
}

/** "Copy my data": copy the guest's own documents into the account, then forget them on the device. */
export async function copyGuestData(kv: KeyValueStore, account: UserData, uid: string): Promise<number> {
  const guest = createLocalDocStore(kv, GUEST_OWNER);
  let copied = await copyGuestToAccount(guest, account.store, COLLECTIONS.filter((c) => c !== 'profile'));
  // The account's own profile always wins; the guest's is used only for a brand-new account.
  const guestProfile = (await guest.getAll<Doc<UserProfile>>('profile'))[PROFILE_ID];
  if (guestProfile?.onboarded && !(await account.repos.profile.get(PROFILE_ID))) {
    await account.repos.profile.importMany([guestProfile]);
    copied += 1;
  }
  await createStorageService(kv).resetAll(ownerPrefix(GUEST_OWNER));
  await kv.setItem(guestCopyAskedKey(uid), 'copied');
  return copied;
}

/** "Start fresh": keep the guest data on the device and do not ask this account again. */
export async function skipGuestCopy(kv: KeyValueStore, uid: string): Promise<void> {
  await kv.setItem(guestCopyAskedKey(uid), 'skipped');
}

/**
 * Sign-out (SPEC-ADDENDA §5): the cloud keeps the data and this device forgets it.
 * If some changes could not reach the cloud (offline), the device copy and its
 * outbox are kept, so nothing is lost; they are sent at the next sign-in.
 * Returns the number of changes still waiting.
 */
export async function signOutDevice(data: UserData): Promise<number> {
  if (!data.cloud) return 0;
  try {
    await data.flush();
  } catch {
    // Offline: the outbox keeps the changes.
  }
  const waiting = await data.pending();
  if (waiting === 0) await data.clearDevice();
  return waiting;
}

/** Where this user's data lives, in one plain line. */
export function syncStatusLine(signedIn: boolean, cloud: boolean, syncError: boolean): string {
  if (!signedIn) return 'Saved on this device only. Sign in to keep it on every device.';
  if (!cloud) return 'Saved on this device.';
  if (syncError) return 'Offline right now. Changes are saved on this phone and will sync when you’re back online.';
  return '☁️ Synced to your account on every device.';
}

type Fields<T> = Omit<T, keyof BaseDoc>;
function fieldsOf<T extends BaseDoc>(doc: T): Fields<T> {
  const { id: _id, createdAt: _c, updatedAt: _u, schemaVersion: _s, deleted: _d, ...fields } = doc;
  return fields;
}

/**
 * One user's live session. Every action updates the in-memory documents at
 * once (so the screen changes on the same tap) and then writes through the
 * repositories, one write at a time and in order.
 */
export function createUserSession(
  data: UserData,
  initial: UserDocs,
  opts: { onChange: (docs: UserDocs) => void; onError?: (e: unknown) => void; now?: () => number },
) {
  const now = opts.now ?? Date.now;
  const { repos } = data;
  let docs = initial;
  let queue: Promise<void> = Promise.resolve();

  const set = (next: UserDocs) => {
    docs = next;
    opts.onChange(next);
  };
  const enqueue = (op: () => Promise<unknown>) => {
    queue = queue.then(op).then(
      () => undefined,
      (e) => opts.onError?.(e),
    );
  };
  const base = (id: string, collection: keyof typeof SCHEMAS, t: number): BaseDoc => ({
    id,
    createdAt: t,
    updatedAt: t,
    schemaVersion: SCHEMAS[collection].version,
    deleted: false,
  });
  const put = <C extends ListCollection>(c: C, doc: UserDocs[C][string]) => set({ ...docs, [c]: { ...docs[c], [doc.id]: doc } });
  const drop = (c: ListCollection, id: string) => {
    const { [id]: _gone, ...rest } = docs[c];
    set({ ...docs, [c]: rest });
  };

  return {
    get docs() {
      return docs;
    },
    /** Resolves when every write so far has reached the device store (and joined the cloud outbox). */
    idle: () => queue,
    /** Replace the in-memory documents, e.g. after pulling from the cloud. */
    reload(next: UserDocs) {
      set(next);
    },

    updateProfile(patch: Partial<UserProfile>) {
      const t = now();
      const current = docs.profile ?? { ...DEFAULT_PROFILE, ...base(PROFILE_ID, 'profile', t) };
      const next: Doc<UserProfile> = { ...current, ...patch, updatedAt: t };
      if (patch.onboarded && !current.onboarded && !next.onboardedOn) next.onboardedOn = dateKeyOf(t);
      set({ ...docs, profile: next });
      enqueue(() => repos.profile.upsert(PROFILE_ID, fieldsOf(next)));
    },

    addMeal(meal: Omit<MealLog, 'timestamp' | 'dateKey'>) {
      const t = now();
      const doc: Doc<MealLog> = { ...meal, timestamp: t, dateKey: dateKeyOf(t), ...base(makeId(t), 'mealLogs', t) };
      put('mealLogs', doc);
      enqueue(() => repos.mealLogs.create({ ...fieldsOf(doc), id: doc.id }));
    },

    addWorkout(w: Omit<WorkoutLog, 'timestamp' | 'dateKey'>) {
      const t = now();
      const doc: Doc<WorkoutLog> = { ...w, timestamp: t, dateKey: dateKeyOf(t), ...base(makeId(t), 'workoutLogs', t) };
      put('workoutLogs', doc);
      enqueue(() => repos.workoutLogs.create({ ...fieldsOf(doc), id: doc.id }));
    },

    /** One document per day, so rapid taps change one counter (and one debounced cloud write). */
    addWater(delta: number) {
      const t = now();
      const dateKey = dateKeyOf(t);
      const id = `water-${dateKey}`;
      const current = docs.waterLogs[id];
      const glasses = Math.max(0, (current?.glasses ?? 0) + delta);
      if (current && current.glasses === glasses) return;
      const doc: Doc<WaterLog> = { ...(current ?? base(id, 'waterLogs', t)), timestamp: t, dateKey, glasses, updatedAt: t };
      put('waterLogs', doc);
      enqueue(() => repos.waterLogs.upsert(id, { timestamp: t, dateKey, glasses }));
    },

    addSaving(amountInr: number, dishId: string | null, note: string | null = null) {
      const t = now();
      const doc: Doc<SavingEntry> = { timestamp: t, amountInr, dishId, note, ...base(makeId(t), 'savings', t) };
      put('savings', doc);
      enqueue(() => repos.savings.create({ ...fieldsOf(doc), id: doc.id }));
    },

    toggleFavourite(dishId: string) {
      if (docs.favourites[dishId]) {
        drop('favourites', dishId);
        enqueue(() => repos.favourites.remove(dishId));
        return;
      }
      put('favourites', { dishId, ...base(dishId, 'favourites', now()) });
      enqueue(() => repos.favourites.upsert(dishId, { dishId }));
    },

    setPlan(dateKey: DateKey, slot: Slot, dishId: string | null) {
      const t = now();
      const current = docs.mealPlans[dateKey];
      const slots = { ...(current?.slots ?? {}) };
      if (dishId) slots[slot] = dishId;
      else delete slots[slot];
      put('mealPlans', { ...(current ?? base(dateKey, 'mealPlans', t)), dateKey, slots, updatedAt: t });
      enqueue(() => repos.mealPlans.upsert(dateKey, { dateKey, slots }));
    },

    /** Guests only: wipe this device's guest data and load the sample week again. */
    resetToSample(seed: LegacyState) {
      const t = now();
      const sample = sampleDocs(seed, t);
      set({
        profile: sample.profile,
        mealLogs: byId(sample.mealLogs),
        waterLogs: byId(sample.waterLogs),
        workoutLogs: byId(sample.workoutLogs),
        favourites: byId(sample.favourites),
        mealPlans: byId(sample.mealPlans),
        savings: byId(sample.savings),
      });
      enqueue(async () => {
        await data.clearDevice();
        await importDocs(repos, sample);
      });
    },
  };
}

export type UserSession = ReturnType<typeof createUserSession>;
```

### `src/lib/store.tsx`

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { dishes, type Diet, type Dish } from '../data/dishes';
import { GUEST_OWNER, openUserData, type UserData } from '../services/storage';
import { createFirestoreAdapter, getDb } from '../services/storage/firestoreRemote';
import type { KeyValueStore } from '../services/storage/kv';
import {
  copyGuestData,
  createUserSession,
  EMPTY_DOCS,
  guestOfferCount,
  legacyProfilePatch,
  loadDocs,
  prepareGuestDevice,
  signOutDevice,
  skipGuestCopy,
  toView,
  type UserDocs,
  type UserSession,
} from '../services/userSession';
import { firebaseConfigured, getFirebaseAuth } from './firebase';

export type Goal = 'lose' | 'maintain' | 'gain' | 'muscle';
export type Level = 'beginner' | 'expert';
export type Slot = 'breakfast' | 'lunch' | 'dinner';

export type Profile = {
  name: string;
  goal: Goal;
  level: Level;
  diet: Diet;
  breakfastReminder: boolean;
  onboarded: boolean;
};

export type MealLog = { name: string; emoji: string; kcal: number; protein: number; fibre: number; cooked: boolean; at: number };
export type ExerciseLog = { type: string; minutes: number; kcal: number; at: number };
export type DayLog = { meals: MealLog[]; exercise: ExerciseLog[]; water: number };

export type State = {
  profile: Profile;
  days: Record<string, DayLog>;
  moneySaved: number;
  favourites: string[];
  plan: Record<string, Partial<Record<Slot, string>>>;
};

export const GOALS: Record<Goal, { label: string; emoji: string; kcal: number; protein: number; blurb: string }> = {
  lose: { label: 'Lose weight', emoji: '🔥', kcal: 1800, protein: 90, blurb: 'Tasty, lighter meals and a small daily deficit.' },
  maintain: { label: 'Eat healthier', emoji: '🥗', kcal: 2200, protein: 70, blurb: 'Better nutrition without counting every bite.' },
  gain: { label: 'Gain weight', emoji: '🍽️', kcal: 2600, protein: 90, blurb: 'Bigger, wholesome meals in a steady surplus.' },
  muscle: { label: 'Build muscle', emoji: '💪', kcal: 2400, protein: 120, blurb: 'High-protein meals to match your workouts.' },
};
export const FIBRE_TARGET = 30;
export const WATER_TARGET = 8;

// MET values; kcal = MET × 70 kg × hours.
export const EXERCISES = [
  { type: 'Walk', emoji: '🚶', met: 3.5 },
  { type: 'Run', emoji: '🏃', met: 9.8 },
  { type: 'Cycle', emoji: '🚴', met: 7.5 },
  { type: 'Yoga', emoji: '🧘', met: 3 },
  { type: 'Gym', emoji: '🏋️', met: 6 },
  { type: 'Sport', emoji: '🏸', met: 7 },
];
export const exerciseKcal = (met: number, minutes: number) => Math.round((met * 70 * minutes) / 60);

// Quick logs for days you don't cook (office canteen, ordering in).
export const QUICK_MEALS = [
  { name: 'Office canteen thali', emoji: '🍱', kcal: 650, protein: 20, fibre: 8 },
  { name: 'Sandwich', emoji: '🥪', kcal: 380, protein: 14, fibre: 4 },
  { name: 'Salad bowl', emoji: '🥗', kcal: 320, protein: 12, fibre: 9 },
  { name: 'Dosa + chutney', emoji: '🫓', kcal: 400, protein: 9, fibre: 4 },
  { name: 'Ordered biryani', emoji: '🍗', kcal: 850, protein: 30, fibre: 3 },
  { name: 'Chai + biscuits', emoji: '☕', kcal: 180, protein: 3, fibre: 1 },
];

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const emptyDay = (): DayLog => ({ meals: [], exercise: [], water: 0 });

// Sample history so the progress screens look alive in the demo. Guests get it
// on a new device, marked as sample, so it is never copied into an account.
export function sampleState(): State {
  const days: Record<string, DayLog> = {};
  const today = new Date();
  const sample = [
    { m: ['poha', 'q:Office canteen thali', 'paneer-butter-masala'], ex: ['Walk', 30], w: 7 },
    { m: ['overnight-oats', 'q:Sandwich', 'rajma-chawal'], ex: ['Yoga', 25], w: 6 },
    { m: ['q:Chai + biscuits', 'q:Office canteen thali', 'q:Ordered biryani'], ex: null, w: 4 },
    { m: ['moong-chilla', 'q:Salad bowl', 'egg-bhurji'], ex: ['Run', 20], w: 8 },
    { m: ['masala-oats', 'q:Office canteen thali', 'chicken-biryani'], ex: ['Gym', 45], w: 7 },
    { m: ['poha', 'q:Dosa + chutney', 'rajma-chawal'], ex: ['Walk', 40], w: 6 },
  ] as const;
  sample.forEach((s, i) => {
    const day = emptyDay();
    s.m.forEach((m, j) => {
      const at = addDays(today, -(6 - i)).getTime() + (8 + j * 5) * 3600_000;
      if (m.startsWith('q:')) {
        const q = QUICK_MEALS.find((x) => x.name === m.slice(2))!;
        day.meals.push({ ...q, cooked: false, at });
      } else {
        const d = dishes.find((x) => x.id === m)!;
        day.meals.push({ name: d.name, emoji: d.emoji, kcal: d.kcal, protein: d.proteinG, fibre: d.fibreG, cooked: true, at });
      }
    });
    if (s.ex) {
      const e = EXERCISES.find((x) => x.type === s.ex![0])!;
      day.exercise.push({ type: e.type, minutes: s.ex[1], kcal: exerciseKcal(e.met, s.ex[1]), at: 0 });
    }
    day.water = s.w;
    days[dayKey(addDays(today, -(6 - i)))] = day;
  });
  return {
    profile: { name: '', goal: 'lose', level: 'beginner', diet: 'non-veg', breakfastReminder: true, onboarded: false },
    days,
    moneySaved: 2860,
    favourites: ['poha', 'paneer-butter-masala'],
    plan: {},
  };
}

type User = { name: string; guest: boolean; uid?: string; email?: string; photo?: string };

type Store = State & {
  user: User | null;
  /** Sign-in state is known and this user's data has loaded. */
  ready: boolean;
  today: DayLog;
  /** Signed in and syncing to Firestore (SPEC-ADDENDA §5). */
  cloud: boolean;
  /** The last cloud sync failed (usually offline). Changes are safe on the device and retry later. */
  syncError: boolean;
  /** Guest entries on this device that a newly signed-in user can bring along (0 = nothing to ask). */
  guestOffer: number;
  copyGuestData: () => Promise<void>;
  skipGuestCopy: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => void;
  logCooked: (dish: Dish, saved: number) => void;
  logQuickMeal: (m: (typeof QUICK_MEALS)[number]) => void;
  logExercise: (type: string, minutes: number) => void;
  addWater: (n: number) => void;
  toggleFavourite: (id: string) => void;
  setPlan: (date: string, slot: Slot, dishId: string | null) => void;
  /** Guests only: restore the sample week. Signed-in accounts never get sample data. */
  resetDemo: () => void;
  streak: number;
};

const StoreContext = createContext<Store | null>(null);

// AsyncStorage matches the storage layer's key-value interface.
const kv: KeyValueStore = AsyncStorage;

// Firestore is used only when Firebase is configured and the cloudSync flag is on;
// otherwise a signed-in user's data stays on the device, as in the demo.
function cloudAdapter() {
  if (!featureFlags.cloudSync || !firebaseConfigured || !getFirebaseAuth()) return null;
  const db = getDb();
  return db ? createFirestoreAdapter(db) : null;
}

// A first sign-in on a new device waits this long for the cloud before showing what the device has.
const FIRST_SYNC_WAIT_MS = 8000;

type Active = { owner: string; data: UserData; session: UserSession };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [active, setActive] = useState<Active | null>(null);
  const [docs, setDocs] = useState<UserDocs>(EMPTY_DOCS);
  const [syncError, setSyncError] = useState(false);
  const [guestOffer, setGuestOffer] = useState(0);
  const owner = user && !user.guest && user.uid ? user.uid : GUEST_OWNER;

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(
        u
          ? { name: u.displayName?.split(' ')[0] ?? '', guest: false, uid: u.uid, email: u.email ?? undefined, photo: u.photoURL ?? undefined }
          : null,
      );
      setAuthReady(true);
    });
  }, []);

  // Open the data for whoever is using the app: the guest store, or the signed-in user's (device + cloud).
  useEffect(() => {
    if (!authReady) return;
    let alive = true;
    const signedIn = owner !== GUEST_OWNER;
    const data = openUserData({ kv, uid: signedIn ? owner : null, remote: signedIn ? cloudAdapter() : null, onSyncError: () => alive && setSyncError(true) });

    (async () => {
      if (!signedIn) await prepareGuestDevice(kv, data, sampleState, Date.now());
      const local = await loadDocs(data.repos);
      const session = createUserSession(data, local, { onChange: (d) => alive && setDocs(d), onError: () => alive && setSyncError(true) });

      const refresh = async () => {
        await session.idle();
        if (alive) session.reload(await loadDocs(data.repos));
      };
      if (data.cloud) {
        const synced = data.syncAll().then(
          () => {
            if (alive) setSyncError(false);
            return refresh();
          },
          () => {
            if (alive) setSyncError(true);
          },
        );
        // A device that already has this user's data shows it at once and syncs in the background.
        // A new device waits for the first pull (up to FIRST_SYNC_WAIT_MS) so it doesn't look empty.
        if (!local.profile) await Promise.race([synced, new Promise((r) => setTimeout(r, FIRST_SYNC_WAIT_MS))]);
      }
      const offer = signedIn ? await guestOfferCount(kv, owner) : 0;
      if (!alive) return;
      setGuestOffer(offer);
      setDocs(session.docs);
      setActive({ owner, data, session });
    })().catch(() => {
      if (alive) setSyncError(true);
    });

    return () => {
      alive = false;
    };
  }, [owner, authReady]);

  // Send waiting changes when the app goes to the background, before the OS may close it.
  useEffect(() => {
    if (!active?.data.cloud) return;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') active.data.flush().catch(() => setSyncError(true));
    });
    return () => sub.remove();
  }, [active]);

  const state = useMemo(() => toView(docs), [docs]);
  const ready = authReady && active?.owner === owner;

  const store = useMemo<Store>(() => {
    const today = state.days[dayKey()] ?? emptyDay();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = state.days[dayKey(addDays(new Date(), -i))];
      if (d?.meals.some((m) => m.cooked)) streak++;
      else if (i > 0) break;
    }
    // Before the data has loaded, writes have nowhere to go; screens are not interactive yet anyway.
    const s = ready ? active?.session : undefined;
    return {
      ...state,
      user,
      ready,
      today,
      streak,
      cloud: Boolean(ready && active?.data.cloud),
      syncError,
      guestOffer: ready ? guestOffer : 0,
      copyGuestData: async () => {
        if (!active || active.owner === GUEST_OWNER) return;
        await copyGuestData(kv, active.data, active.owner);
        await active.session.idle();
        active.session.reload(await loadDocs(active.data.repos));
        setGuestOffer(0);
      },
      skipGuestCopy: async () => {
        if (!active || active.owner === GUEST_OWNER) return;
        await skipGuestCopy(kv, active.owner);
        setGuestOffer(0);
      },
      continueAsGuest: () => setUser({ name: '', guest: true }),
      signOut: async () => {
        const auth = getFirebaseAuth();
        if (active && active.owner !== GUEST_OWNER) {
          await active.session.idle();
          await signOutDevice(active.data);
        }
        if (auth && !user?.guest) await fbSignOut(auth);
        setUser(null);
      },
      updateProfile: (p) => s?.updateProfile(legacyProfilePatch(p)),
      logCooked: (dish, saved) => {
        if (!s) return;
        s.addMeal({ name: dish.name, emoji: dish.emoji, dishId: dish.id, source: 'dish', kcal: dish.kcal, proteinG: dish.proteinG, fibreG: dish.fibreG, cooked: true });
        if (saved) s.addSaving(saved, dish.id);
      },
      logQuickMeal: (m) => s?.addMeal({ name: m.name, emoji: m.emoji, dishId: null, source: 'quick', kcal: m.kcal, proteinG: m.protein, fibreG: m.fibre, cooked: false }),
      logExercise: (type, minutes) => {
        const e = EXERCISES.find((x) => x.type === type);
        if (e) s?.addWorkout({ type, exerciseId: null, minutes, kcal: exerciseKcal(e.met, minutes) });
      },
      addWater: (n) => s?.addWater(n),
      toggleFavourite: (id) => s?.toggleFavourite(id),
      setPlan: (date, slot, dishId) => s?.setPlan(date, slot, dishId),
      resetDemo: () => {
        if (s && active?.owner === GUEST_OWNER) s.resetToSample(sampleState());
      },
    };
  }, [state, user, ready, active, syncError, guestOffer]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export const dayTotals = (d: DayLog) => ({
  kcalIn: d.meals.reduce((s, m) => s + m.kcal, 0),
  kcalOut: d.exercise.reduce((s, e) => s + e.kcal, 0),
  protein: d.meals.reduce((s, m) => s + m.protein, 0),
  fibre: d.meals.reduce((s, m) => s + m.fibre, 0),
});

const dietAllows = (pref: Diet, dish: Diet) =>
  pref === 'non-veg' || dish === 'veg' || (pref === 'egg' && dish === 'egg');

// Tasty-first: every dish stays available, recommendations just rank what fits the goal.
export function recommend(profile: Profile) {
  const ok = dishes.filter((d) => dietAllows(profile.diet, d.diet));
  const score = (d: Dish) => {
    switch (profile.goal) {
      case 'lose':
        return d.healthScore * 40 + d.fibreG * 10 - d.kcal / 5;
      case 'muscle':
        return d.proteinG * 6 + d.healthScore * 10;
      case 'gain':
        return d.kcal / 5 + d.proteinG * 3;
      default:
        return d.healthScore * 30 + d.fibreG * 5;
    }
  };
  return [...ok].sort((a, b) => score(b) - score(a));
}

export const allowedDishes = (profile: Profile) => dishes.filter((d) => dietAllows(profile.diet, d.diet));
```

### `src/components/GuestCopyPrompt.tsx`

```tsx
import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { GradientButton } from './ui';
import { colors, type } from '../theme';

type Props = {
  /** Number of entries the guest logged on this device. The prompt shows while it is above 0. */
  count: number;
  onCopy: () => Promise<void>;
  onSkip: () => Promise<void>;
};

/**
 * Shown once after a guest signs in with Google (SPEC-ADDENDA §5): one tap
 * copies what they logged on this device into their account.
 */
export function GuestCopyPrompt({ count, onCopy, onSkip }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    setFailed(false);
    try {
      await fn();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    // Android's back button must not decide for the user, so it does nothing here.
    <Modal visible={count > 0} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={styles.emoji}>📲</Text>
          <Text style={styles.title}>Bring your data with you?</Text>
          <Text style={styles.body}>
            Copy the meals, water and workouts you logged on this device into your account, so they show on every device.
          </Text>
          <Text style={styles.count}>
            {count === 1 ? '1 entry' : `${count} entries`} on this device · the demo’s sample week is not copied
          </Text>
          {failed ? <Text style={styles.error}>Couldn’t copy right now. Your data is still safe on this device. Please try again.</Text> : null}
          {busy ? (
            <View style={styles.busy} accessibilityLabel="Copying your data">
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.busyText}>Copying…</Text>
            </View>
          ) : (
            <View style={styles.buttons}>
              <GradientButton title="Copy my data" onPress={run(onCopy)} />
              <GradientButton title="Start fresh" variant="glass" onPress={run(onSkip)} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  emoji: { fontSize: 34, marginBottom: 8 },
  title: { ...type.h1, color: colors.text },
  body: { ...type.body, color: colors.muted, marginTop: 8 },
  count: { ...type.small, color: colors.faint, marginTop: 10 },
  error: { ...type.small, color: colors.bad, marginTop: 10 },
  buttons: { gap: 10, marginTop: 20 },
  busy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 112, marginTop: 20 },
  busyText: { ...type.body, color: colors.text },
});
```

### `src/app/index.tsx`

```tsx
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import GoogleSignInButton from '../components/GoogleSignInButton';
import { GuestCopyPrompt } from '../components/GuestCopyPrompt';
import { GradientButton, VideoBackground } from '../components/ui';
import { firebaseConfigured } from '../lib/firebase';
import { useStore } from '../lib/store';
import { colors, type } from '../theme';

const googleReady =
  firebaseConfigured &&
  Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

const WORDS = ['Cook it.', 'Track it.', 'Burn it.'];

function RotatingWord() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1600 }),
        withTiming(-1, { duration: 450 }),
        withTiming(-1, { duration: 1600 }),
        withTiming(-2, { duration: 450 }),
        withTiming(-2, { duration: 1600 }),
        withTiming(0, { duration: 450 }),
      ),
      -1,
    );
  }, [y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * 44 }] }));
  return (
    <View style={{ height: 44, overflow: 'hidden' }}>
      <Animated.View style={anim}>
        {WORDS.map((w, i) => (
          <Text key={w} style={[styles.word, { color: [colors.accent2, colors.warm, colors.blue][i] }]}>
            {w}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

export default function Welcome() {
  const { user, ready, profile, continueAsGuest, guestOffer, copyGuestData, skipGuestCopy } = useStore();
  // A newly signed-in user first answers "Bring your data with you?", then moves on.
  if (ready && user && guestOffer === 0) return <Redirect href={profile.onboarded ? '/(tabs)' : '/onboarding'} />;

  return (
    <View style={styles.root}>
      {/* Swap assets/videos/login.mp4 for real cooking footage; keep it short, muted and loopable. */}
      <VideoBackground source={require('../../assets/videos/login.mp4')} dim={0.15} />
      <SafeAreaView style={styles.content}>
        <Animated.View entering={FadeIn.duration(900)}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🍽️  FITPLATE</Text>
          </View>
        </Animated.View>

        <View>
          <Animated.Text entering={FadeInDown.delay(150).duration(700)} style={styles.title}>
            Your health{'\n'}starts on your plate.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(350).duration(700)} style={{ marginTop: 10 }}>
            <RotatingWord />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(500).duration(700)} style={styles.pitch}>
            See what a dish costs to make before you tap order. Then cook it, one tiny step at a time.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(700).duration(700)} style={{ gap: 12, marginTop: 28 }}>
            {googleReady ? <GoogleSignInButton /> : null}
            <GradientButton
              title={googleReady ? 'Try it without signing in' : 'Get started'}
              variant={googleReady ? 'glass' : 'primary'}
              onPress={continueAsGuest}
            />
            <Text style={styles.fine}>Free to start · No ads · Sign in to keep your data on every device</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
      <GuestCopyPrompt count={ready && user ? guestOffer : 0} onCopy={copyGuestData} onSkip={skipGuestCopy} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'space-between', padding: 24 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: { ...type.label, color: colors.text },
  title: { ...type.hero, fontSize: 40, lineHeight: 44, color: colors.text },
  word: { fontSize: 34, lineHeight: 44, fontWeight: '900', letterSpacing: -0.8 },
  pitch: { color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 23, marginTop: 14 },
  fine: { ...type.small, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4 },
});
```

### `src/app/profile.tsx`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import type { Diet } from '../data/dishes';
import { setReminders } from '../lib/reminders';
import { GOALS, useStore, type Goal, type Level } from '../lib/store';
import { syncStatusLine } from '../services/userSession';
import { colors, type } from '../theme';

// `asTab` is set by the Profile tab of the new shell: no back button, and room
// at the bottom for the floating tab bar.
export function ProfileScreen({ asTab = false }: { asTab?: boolean }) {
  const { profile, updateProfile, signOut, resetDemo, user, favourites, cloud, syncError } = useStore();
  return (
    <SafeAreaView edges={asTab ? ['top'] : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        {asTab ? (
          <View style={{ width: 40 }} />
        ) : (
          <PressableScale onPress={() => router.back()} style={styles.back} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </PressableScale>
        )}
        <Text style={[type.h2, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: asTab ? 150 : 60 }}>
        <FadeIn i={0}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <View style={styles.avatar}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} referrerPolicy="no-referrer" style={{ width: 78, height: 78, borderRadius: 39 }} />
              ) : (
                <Text style={{ color: colors.text, fontSize: 34, fontWeight: '900' }}>{(profile.name || 'F')[0].toUpperCase()}</Text>
              )}
            </View>
            <Text style={[type.h1, { color: colors.text, marginTop: 10 }]}>{profile.name || 'Guest'}</Text>
            <Text style={{ color: colors.muted }}>
              {user?.guest ? 'Demo mode · not signed in' : user?.email ? `Signed in with Google · ${user.email}` : 'Signed in with Google'}
            </Text>
            <Text style={[type.small, styles.sync, { color: cloud && syncError ? colors.warn : colors.muted }]} accessibilityRole="text">
              {syncStatusLine(Boolean(user && !user.guest), cloud, syncError)}
            </Text>
          </View>
        </FadeIn>

        <FadeIn i={1}>
          <Glass>
            <Text style={styles.label}>Goal</Text>
            <View style={styles.chips}>
              {(Object.keys(GOALS) as Goal[]).map((g) => (
                <Chip key={g} label={`${GOALS[g].emoji} ${GOALS[g].label}`} active={profile.goal === g} onPress={() => updateProfile({ goal: g })} />
              ))}
            </View>
            <Text style={[type.small, { color: colors.muted, marginTop: 8 }]}>
              Target {GOALS[profile.goal].kcal} kcal and {GOALS[profile.goal].protein} g protein a day.
            </Text>
            <Text style={[styles.label, { marginTop: 18 }]}>Diet</Text>
            <View style={styles.chips}>
              {([['veg', '🥦 Veg'], ['egg', '🥚 Egg'], ['non-veg', '🍗 Non-veg']] as [Diet, string][]).map(([d, l]) => (
                <Chip key={d} label={l} active={profile.diet === d} onPress={() => updateProfile({ diet: d })} />
              ))}
            </View>
            <Text style={[styles.label, { marginTop: 18 }]}>Cooking level</Text>
            <View style={styles.chips}>
              {([['beginner', '🌱 Beginner'], ['expert', '👨‍🍳 Expert']] as [Level, string][]).map(([d, l]) => (
                <Chip key={d} label={l} active={profile.level === d} onPress={() => updateProfile({ level: d })} />
              ))}
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Glass style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 26 }}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>Breakfast & batch-cook nudges</Text>
              <Text style={[type.small, { color: colors.muted }]}>9 pm prep reminder, Sunday batch-cook reminder</Text>
            </View>
            <Switch
              value={profile.breakfastReminder}
              onValueChange={(v) => {
                updateProfile({ breakfastReminder: v });
                setReminders(v).catch(() => {});
              }}
              trackColor={{ true: colors.accent, false: '#333' }}
              thumbColor="#fff"
            />
          </Glass>
        </FadeIn>

        <FadeIn i={3}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>❤️ {favourites.length} saved dishes</Text>
            <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>Find them under {featureFlags.newTabShell ? 'Cook' : 'Discover'} → Saved.</Text>
          </Glass>
        </FadeIn>

        <View style={{ gap: 10, marginTop: 24 }}>
          {/* Only guests can restore the sample week; a real account never gets sample data. */}
          {user?.guest ? (
            <GradientButton
              title="Reset demo data"
              variant="glass"
              onPress={() =>
                Alert.alert('Reset demo data?', 'This restores the sample week and clears your logs on this device.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: resetDemo },
                ])
              }
            />
          ) : null}
          <GradientButton
            title="Sign out"
            variant="glass"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        </View>
        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          FitPlate demo · nutrition and prices are estimates, not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Profile() {
  return <ProfileScreen />;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.accent },
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  sync: { marginTop: 6, textAlign: 'center', paddingHorizontal: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
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

  /** Write documents that already carry their common fields (migration, demo seed), as they are. */
  async function importMany(docs: D[]): Promise<void> {
    await store.putMany(schema.collection, docs);
  }

  return { collection: schema.collection, create, get, list, update, upsert, remove, importMany };
}

export type Repository<T extends object> = ReturnType<typeof createRepository<T>>;
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
    /** The store the repositories write to (device, or device + cloud). */
    store,
    kv: opts.kv,
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
  // The seeded amount stays on this device as a sample entry (so the demo's
  // totals look the same) and is never copied into an account.
  const sampleSaved = sampleSeen ? Math.min(state.moneySaved, DEMO_SAMPLE_SAVED_INR) : 0;
  const real = state.moneySaved - sampleSaved;
  const savings: Doc<SavingEntry>[] = [];
  if (real > 0) savings.push({ ...base('legacy-total', 'savings'), timestamp: now, amountInr: real, dishId: null, note: 'Carried over from the demo total' });
  if (sampleSaved > 0) {
    savings.push({ ...base('demo-sample-total', 'savings'), timestamp: now, amountInr: sampleSaved, dishId: null, note: 'Demo sample week', demoSample: true });
  }

  return { profile, mealLogs, waterLogs, workoutLogs, favourites, mealPlans, savings };
}
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
export type Favourite = { dishId: string; demoSample?: boolean };

/** One document per planned day (id = dateKey). */
export type MealPlanDay = {
  dateKey: DateKey;
  slots: Partial<Record<'breakfast' | 'lunch' | 'dinner', string>>;
  demoSample?: boolean;
};

/** Money saved by cooking instead of ordering. */
export type SavingEntry = {
  timestamp: number;
  amountInr: number;
  dishId: string | null;
  note: string | null;
  demoSample?: boolean;
};
```

### `src/config/featureFlags.ts`

```ts
// Feature flags for the auto-build roadmap. Every feature that is not finished,
// or that needs a native development build, ships switched OFF so the app
// always runs in Expo Go exactly as before. A flag turns ON once its day's
// "Done when" check passes; it then stays as a kill switch.
export const featureFlags = {
  /** Day 2: five-tab shell (Today, Cook, Track, Move, Profile). ON since Day 2; false restores the demo's four tabs. */
  newTabShell: true,
  /** Day 4–5: load dishes, ingredients, nutrients and exercises from research JSON. */
  researchData: false,
  /** Day 12: camera check step in cook mode (plan only; needs a dev build). */
  cameraCheck: false,
  /** Day 12: read steps aloud with expo-speech. */
  voiceSteps: false,
  /** Day 17 / 33: local reminders through expo-notifications. */
  reminders: false,
  /** Day 26: live pose-based rep counting (needs a dev build). */
  poseRepCounter: false,
  /** Day 32: free vs paid locks. Everything is free until Sudarsan decides. */
  paywall: false,
  /** Day 03b: Firestore as the store for signed-in users (SPEC-ADDENDA §5). ON since Day 03b; false keeps a signed-in user's data on the device only. */
  cloudSync: true,
  /** Innovation (Day 03b): still backdrop instead of background videos with Reduce motion, Data Saver or 2G. */
  liteMode: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag, flags: Record<FeatureFlag, boolean> = featureFlags): boolean {
  return flags[flag] === true;
}
```

### `src/services/liteMode.ts`

```ts
/**
 * Lite mode (innovation idea, built Day 03b): low-end phones, costly mobile
 * data and people who turn on "Reduce motion" get a still background instead
 * of the looping background videos. Pure, so it can be tested.
 */
export type LiteSignals = {
  /** The OS "Reduce motion" accessibility setting. */
  reduceMotion: boolean;
  /** Browser "Data Saver" (navigator.connection.saveData), web only. */
  saveData?: boolean;
  /** navigator.connection.effectiveType, web only: 'slow-2g' | '2g' | '3g' | '4g'. */
  effectiveType?: string;
};

const SLOW_NETWORKS = new Set(['slow-2g', '2g']);

export function shouldUseLite(s: LiteSignals): boolean {
  return s.reduceMotion || s.saveData === true || (s.effectiveType !== undefined && SLOW_NETWORKS.has(s.effectiveType));
}
```

### `src/lib/useLiteMode.ts`

```ts
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { shouldUseLite } from '../services/liteMode';

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function webConnection(): NetworkInformation {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return {};
  return (navigator as Navigator & { connection?: NetworkInformation }).connection ?? {};
}

/** True when background videos should be replaced by a still backdrop. */
export function useLiteMode(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (!featureFlags.liteMode) return;
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduceMotion(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  if (!featureFlags.liteMode) return false;
  const c = webConnection();
  return shouldUseLite({ reduceMotion, saveData: c.saveData, effectiveType: c.effectiveType });
}
```

### `src/components/ui.tsx`

```tsx
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import { tap } from '../lib/haptics';
import { useLiteMode } from '../lib/useLiteMode';
import { colors, gradients, radius, type } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Springy press feedback used by every tappable surface. */
export function PressableScale({
  children,
  onPress,
  style,
  disabled,
  haptic = true,
  scaleTo = 0.96,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  haptic?: boolean;
  scaleTo?: number;
  /** Screen-reader label for icon-only buttons. */
  accessibilityLabel?: string;
}) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => s.set(withSpring(scaleTo, { damping: 18, stiffness: 400 }))}
      onPressOut={() => s.set(withSpring(1, { damping: 14, stiffness: 300 }))}
      onPress={() => {
        if (haptic) tap();
        onPress?.();
      }}
      style={[anim, style, disabled && { opacity: 0.5 }]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'warm' | 'glass';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <View style={styles.btnInner}>
      {icon}
      <Text style={[styles.btnText, { color: variant === 'glass' ? colors.text : '#06210F' }]}>{title}</Text>
    </View>
  );
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={[styles.btn, style]} accessibilityLabel={title}>
      {variant === 'glass' ? (
        <View style={[styles.btnFill, styles.glassBtn]}>{content}</View>
      ) : (
        <LinearGradient
          colors={variant === 'warm' ? gradients.warm : gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnFill}
        >
          {content}
        </LinearGradient>
      )}
    </PressableScale>
  );
}

/** Frosted card. Real blur on iOS/web, tinted glass on Android. */
export function Glass({ children, style, intensity = 30 }: { children: ReactNode; style?: StyleProp<ViewStyle>; intensity?: number }) {
  return (
    <View style={[styles.glass, style]}>
      {Platform.OS !== 'android' ? (
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient colors={gradients.card} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

/** Staggered entrance for lists and sections. */
export function FadeIn({ children, i = 0, style }: { children: ReactNode; i?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.delay(60 + i * 70).duration(520).springify().damping(18)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Animated progress ring. */
export function Ring({
  size = 120,
  stroke = 12,
  progress,
  colorsFrom = '#B4F461',
  colorsTo = '#16A34A',
  children,
}: {
  size?: number;
  stroke?: number;
  progress: number;
  colorsFrom?: string;
  colorsTo?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [progress, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colorsFrom} />
            <Stop offset="1" stopColor={colorsTo} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}

/** Animated bar used for progress and nutrients. */
export function Bar({ progress, color = colors.accent, height = 8 }: { progress: number; color?: string; height?: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, w]);
  const anim = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, anim]} />
    </View>
  );
}

/** Number that counts up when it changes. */
export function CountUp({ value, prefix = '', style, duration = 1000 }: { value: number; prefix?: string; style?: StyleProp<any>; duration?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = Date.now();
    const a = from.current;
    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(a + (value - a) * e));
      if (t < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <Text style={style}>
      {prefix}
      {shown.toLocaleString('en-IN')}
    </Text>
  );
}

/** Gradient tile with the dish emoji, used wherever a photo would go. */
export function DishArt({
  emoji,
  palette,
  size = 72,
  rounded = radius.md,
  style,
}: {
  emoji: string;
  palette: readonly [string, string];
  size?: number | '100%';
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const n = typeof size === 'number' ? size : 220;
  return (
    <LinearGradient
      colors={[palette[0], palette[1]]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[{ width: size, height: size === '100%' ? undefined : size, borderRadius: rounded, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}
    >
      <View style={[styles.artGlow, { width: n * 0.9, height: n * 0.9, borderRadius: n }]} />
      <Text style={{ fontSize: n * 0.5 }}>{emoji}</Text>
    </LinearGradient>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <PressableScale onPress={onPress} style={[styles.chip, active && styles.chipOn]} scaleTo={0.92}>
      <Text style={[styles.chipText, active && { color: '#06210F' }]}>{label}</Text>
    </PressableScale>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={[type.h2, { color: colors.text }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Stat({ label, value, hint, color = colors.text }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>{label}</Text>
      {hint ? <Text style={[type.small, { color: colors.accent }]}>{hint}</Text> : null}
    </View>
  );
}

/** Muted, looping, cover-fit background video. */
// Lite mode (reduce motion, data saver, 2G) shows a still backdrop instead of the video.
export function VideoBackground({ source, dim = 0.35 }: { source: number; dim?: number }) {
  const lite = useLiteMode();
  if (lite) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={['#123524', colors.bg]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />
      </View>
    );
  }
  return <VideoLayer source={source} dim={dim} />;
}

function VideoLayer({ source, dim }: { source: number; dim: number }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />
    </View>
  );
}

/** Soft breathing glow, used behind heroes. */
export function Glow({ color = colors.accent, size = 260, style }: { color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(0.35);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.7, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  const core = size * 0.35;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: core,
          height: core,
          borderRadius: core,
          backgroundColor: color,
          boxShadow: `0px 0px ${Math.round(size * 0.5)}px ${Math.round(size * 0.3)}px ${color}`,
        },
        anim,
        style,
      ]}
    />
  );
}

export const styles = StyleSheet.create({
  btn: { borderRadius: radius.pill, overflow: 'hidden' },
  btnFill: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: radius.pill },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: colors.border },
  glass: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: 'rgba(20,26,23,0.55)' },
  card: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: colors.cardSolid },
  artGlow: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.22)', top: '-25%', left: '-20%' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 },
});
```

### `src/__tests__/userSession.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import type { LegacyState } from '../services/storage';
import { LEGACY_KEY, openUserData } from '../services/storage';
import { memoryKeyValueStore } from '../services/storage/kv';
import { DEMO_SAMPLE_SAVED_INR, fromLegacyState } from '../services/storage/legacy';
import {
  copyGuestData,
  createUserSession,
  dateKeyOf,
  EMPTY_DOCS,
  guestCopyAskedKey,
  GUEST_READY_KEY,
  guestOfferCount,
  legacyProfilePatch,
  loadDocs,
  ownDataCount,
  prepareGuestDevice,
  sampleDocs,
  signOutDevice,
  skipGuestCopy,
  syncStatusLine,
  toView,
  type UserDocs,
} from '../services/userSession';
import { fakeClock, fakeFirestore } from './storage/fakes';

const sampleAt = new Date(2026, 9, 9, 8).getTime(); // whole hour, as the demo seeds it
const realAt = sampleAt + 1234;

const blob: LegacyState = {
  profile: { name: 'Asha', goal: 'muscle', level: 'expert', diet: 'veg', breakfastReminder: false, onboarded: true },
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

const seed = (): LegacyState => ({
  profile: { name: '', goal: 'lose', level: 'beginner', diet: 'non-veg', breakfastReminder: true, onboarded: false },
  days: { '2026-10-08': { meals: [{ name: 'Poha', emoji: '🍚', kcal: 300, protein: 8, fibre: 3, cooked: true, at: sampleAt }], exercise: [], water: 6 } },
  moneySaved: DEMO_SAMPLE_SAVED_INR,
  favourites: ['poha'],
  plan: {},
});

const meal = { name: 'Dal', emoji: '🍲', dishId: null, source: 'quick' as const, kcal: 200, proteinG: 9, fibreG: 4, cooked: false };

function guestSession(kv = memoryKeyValueStore(), now = fakeClock().now) {
  const data = openUserData({ kv, uid: null, remote: null });
  let latest: UserDocs = EMPTY_DOCS;
  const session = createUserSession(data, EMPTY_DOCS, { onChange: (d) => (latest = d), now });
  return { kv, data, session, view: () => toView(latest) };
}

describe('toView (documents → the screens’ shape)', () => {
  it('rebuilds the demo state from migrated documents', () => {
    const docs = fromLegacyState(blob, 1);
    const byId = <T extends { id: string }>(l: T[]) => Object.fromEntries(l.map((d) => [d.id, d]));
    const view = toView({
      profile: docs.profile,
      mealLogs: byId(docs.mealLogs),
      waterLogs: byId(docs.waterLogs),
      workoutLogs: byId(docs.workoutLogs),
      favourites: byId(docs.favourites),
      mealPlans: byId(docs.mealPlans),
      savings: byId(docs.savings),
    });
    expect(view).toEqual(blob);
  });

  it('shows the default profile and empty totals when there is nothing yet', () => {
    expect(toView(EMPTY_DOCS)).toMatchObject({ days: {}, moneySaved: 0, favourites: [], plan: {}, profile: { onboarded: false, goal: 'lose' } });
  });

  it('maps the screens’ profile fields onto UserProfile', () => {
    expect(legacyProfilePatch({ level: 'expert', diet: 'egg', onboarded: true })).toEqual({ cookingLevel: 'expert', dietType: 'egg', onboarded: true });
    expect(legacyProfilePatch({})).toEqual({});
  });
});

describe('prepareGuestDevice', () => {
  it('moves the demo blob into guest documents once and keeps the blob as a backup', async () => {
    const kv = memoryKeyValueStore({ [LEGACY_KEY]: JSON.stringify(blob) });
    const data = openUserData({ kv, uid: null, remote: null });
    expect(await prepareGuestDevice(kv, data, seed, 5)).toBe('migrated');
    expect(await prepareGuestDevice(kv, data, seed, 6)).toBe('ready');
    expect(toView(await loadDocs(data.repos))).toEqual(blob);
    expect(await kv.getItem(LEGACY_KEY)).not.toBeNull();
  });

  it('seeds the sample week on a new device, all of it marked as sample', async () => {
    const kv = memoryKeyValueStore();
    const data = openUserData({ kv, uid: null, remote: null });
    expect(await prepareGuestDevice(kv, data, seed, 5)).toBe('seeded');
    const docs = await loadDocs(data.repos);
    expect(toView(docs).moneySaved).toBe(DEMO_SAMPLE_SAVED_INR);
    expect(ownDataCount(docs)).toBe(0);
    expect(await kv.getItem(GUEST_READY_KEY)).toBe('5');
  });

  it('ignores a corrupt blob and seeds instead', async () => {
    const kv = memoryKeyValueStore({ [LEGACY_KEY]: '{not json' });
    expect(await prepareGuestDevice(kv, openUserData({ kv, uid: null, remote: null }), seed, 5)).toBe('seeded');
  });
});

describe('createUserSession', () => {
  it('shows a logged meal on the same tap and saves it to the device', async () => {
    const { data, session, view } = guestSession();
    session.addMeal(meal);
    const k = dateKeyOf(fakeClock().now());
    expect(view().days[k].meals).toEqual([expect.objectContaining({ name: 'Dal', kcal: 200, protein: 9 })]);
    await session.idle();
    expect(toView(await loadDocs(data.repos)).days[k].meals).toHaveLength(1);
  });

  it('keeps every rapid water tap and never goes below zero', async () => {
    const { data, session, view } = guestSession();
    session.addWater(1);
    session.addWater(1);
    session.addWater(1);
    session.addWater(-1);
    const k = dateKeyOf(fakeClock().now());
    expect(view().days[k].water).toBe(2);
    session.addWater(-5);
    expect(view().days[k]?.water ?? 0).toBe(0);
    await session.idle();
    const stored = await data.repos.waterLogs.list();
    expect(stored).toEqual([expect.objectContaining({ id: `water-${k}`, glasses: 0 })]);
  });

  it('sends water taps to the cloud as one batch', async () => {
    const fs = fakeFirestore();
    const data = openUserData({ kv: memoryKeyValueStore(), uid: 'u1', remote: fs.adapter });
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {} });
    for (let i = 0; i < 5; i++) session.addWater(1);
    await session.idle();
    await data.flush();
    expect(fs.state.batches).toBe(1);
    expect([...fs.docs.values()]).toEqual([expect.objectContaining({ glasses: 5 })]);
  });

  it('toggles a favourite on and off with a soft delete', async () => {
    const { data, session, view } = guestSession();
    session.toggleFavourite('poha');
    expect(view().favourites).toEqual(['poha']);
    session.toggleFavourite('poha');
    expect(view().favourites).toEqual([]);
    await session.idle();
    expect(await data.repos.favourites.list()).toEqual([]);
    expect((await data.store.getAll('favourites')).poha).toMatchObject({ deleted: true });
    session.toggleFavourite('poha');
    await session.idle();
    expect((await data.repos.favourites.list()).map((f) => f.dishId)).toEqual(['poha']);
  });

  it('sets and clears meal-plan slots', async () => {
    const { data, session, view } = guestSession();
    session.setPlan('2026-10-12', 'lunch', 'poha');
    session.setPlan('2026-10-12', 'dinner', 'rajma-chawal');
    session.setPlan('2026-10-12', 'lunch', null);
    expect(view().plan).toEqual({ '2026-10-12': { dinner: 'rajma-chawal' } });
    await session.idle();
    expect(toView(await loadDocs(data.repos)).plan).toEqual({ '2026-10-12': { dinner: 'rajma-chawal' } });
  });

  it('saves profile changes in order and records the onboarding day', async () => {
    const { data, session, view } = guestSession();
    session.updateProfile({ name: 'Asha' });
    session.updateProfile({ onboarded: true, goal: 'muscle' });
    expect(view().profile).toMatchObject({ name: 'Asha', goal: 'muscle', onboarded: true });
    await session.idle();
    expect(await data.repos.profile.get('profile')).toMatchObject({ name: 'Asha', goal: 'muscle', onboarded: true, onboardedOn: dateKeyOf(fakeClock().now()) });
  });

  it('adds savings and workouts to the totals', async () => {
    const { session, view } = guestSession();
    session.addSaving(120, 'poha');
    session.addWorkout({ type: 'Walk', exerciseId: null, minutes: 30, kcal: 120 });
    expect(view().moneySaved).toBe(120);
    expect(Object.values(view().days)[0].exercise).toEqual([expect.objectContaining({ type: 'Walk', minutes: 30 })]);
  });

  it('resets a guest to the sample week', async () => {
    const { data, session, view } = guestSession();
    session.addMeal(meal);
    session.resetToSample(seed());
    expect(view().moneySaved).toBe(DEMO_SAMPLE_SAVED_INR);
    await session.idle();
    const docs = await loadDocs(data.repos);
    expect(ownDataCount(docs)).toBe(0);
    expect(Object.values(docs.mealLogs).map((m) => m.name)).toEqual(['Poha']);
  });

  it('reports a failed write instead of throwing, and keeps going', async () => {
    const kv = memoryKeyValueStore();
    const broken = { ...kv, setItem: async () => Promise.reject(new Error('disk full')) };
    const data = openUserData({ kv: broken, uid: null, remote: null });
    const errors: unknown[] = [];
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {}, onError: (e) => errors.push(e) });
    session.addMeal(meal);
    session.addWater(1);
    await session.idle();
    expect(errors).toHaveLength(2);
  });
});

describe('guest → account ("Bring your data with you?")', () => {
  async function guestWithOwnMeal() {
    const kv = memoryKeyValueStore();
    const guest = openUserData({ kv, uid: null, remote: null });
    await prepareGuestDevice(kv, guest, seed, 1);
    const session = createUserSession(guest, await loadDocs(guest.repos), { onChange: () => {} });
    session.addMeal(meal);
    await session.idle();
    return kv;
  }

  it('offers nothing when the device only has the sample week', async () => {
    const kv = memoryKeyValueStore();
    await prepareGuestDevice(kv, openUserData({ kv, uid: null, remote: null }), seed, 1);
    expect(await guestOfferCount(kv, 'u1')).toBe(0);
  });

  it('copies only the guest’s own entries to the cloud, then forgets them on the device', async () => {
    const kv = await guestWithOwnMeal();
    expect(await guestOfferCount(kv, 'u1')).toBe(1);
    const fs = fakeFirestore();
    const account = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    expect(await copyGuestData(kv, account, 'u1')).toBe(1);
    await account.flush();
    expect([...fs.docs.values()]).toEqual([expect.objectContaining({ name: 'Dal' })]);
    expect(Object.keys(kv.dump()).some((k) => k.startsWith('fitplate.docs.guest.'))).toBe(false);
    expect(await guestOfferCount(kv, 'u1')).toBe(0);
    // The guest store is not re-seeded or re-migrated afterwards.
    expect(await prepareGuestDevice(kv, openUserData({ kv, uid: null, remote: null }), seed, 2)).toBe('ready');
  });

  it('"Start fresh" keeps the guest data and stops asking this account', async () => {
    const kv = await guestWithOwnMeal();
    await skipGuestCopy(kv, 'u1');
    expect(await guestOfferCount(kv, 'u1')).toBe(0);
    expect(await kv.getItem(guestCopyAskedKey('u1'))).toBe('skipped');
    expect(await guestOfferCount(kv, 'u2')).toBe(1);
    expect(ownDataCount(await loadDocs(openUserData({ kv, uid: null, remote: null }).repos))).toBe(1);
  });
});

describe('signOutDevice', () => {
  it('clears this device once everything reached the cloud', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {} });
    session.addMeal(meal);
    await session.idle();
    expect(await signOutDevice(data)).toBe(0);
    expect(Object.keys(kv.dump())).toEqual([]);
    expect(fs.docs.size).toBe(1);
  });

  it('keeps the device copy when offline, and sends it at the next sign-in', async () => {
    const kv = memoryKeyValueStore();
    const fs = fakeFirestore();
    const data = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    const session = createUserSession(data, EMPTY_DOCS, { onChange: () => {} });
    session.addMeal(meal);
    await session.idle();
    fs.state.offline = true;
    expect(await signOutDevice(data)).toBe(1);
    fs.state.offline = false;
    const again = openUserData({ kv, uid: 'u1', remote: fs.adapter });
    await again.syncAll();
    expect([...fs.docs.values()]).toEqual([expect.objectContaining({ name: 'Dal' })]);
  });

  it('never clears a signed-in user whose data is device-only', async () => {
    const kv = memoryKeyValueStore();
    const data = openUserData({ kv, uid: 'u1', remote: null });
    await data.repos.mealLogs.create({ ...meal, timestamp: 1, dateKey: '2026-10-10' });
    expect(await signOutDevice(data)).toBe(0);
    expect(await data.repos.mealLogs.list()).toHaveLength(1);
  });
});

describe('sampleDocs', () => {
  it('marks every sample entry, but not the profile', () => {
    const s = sampleDocs(seed(), 1);
    expect([...s.mealLogs, ...s.waterLogs, ...s.favourites, ...s.savings].every((d) => d.demoSample)).toBe(true);
    expect(s.profile).not.toHaveProperty('demoSample');
  });
});

describe('copying a profile', () => {
  it('uses the guest profile for a new account but never overwrites an existing one', async () => {
    const kv = memoryKeyValueStore();
    const guest = openUserData({ kv, uid: null, remote: null });
    const g = createUserSession(guest, EMPTY_DOCS, { onChange: () => {} });
    g.updateProfile({ name: 'Guest name', onboarded: true });
    await g.idle();

    const fresh = openUserData({ kv, uid: 'new', remote: null });
    expect(await copyGuestData(kv, fresh, 'new')).toBe(1);
    expect(await fresh.repos.profile.get('profile')).toMatchObject({ name: 'Guest name' });

    const kv2 = memoryKeyValueStore();
    const guest2 = createUserSession(openUserData({ kv: kv2, uid: null, remote: null }), EMPTY_DOCS, { onChange: () => {}, now: () => 9e12 });
    guest2.updateProfile({ name: 'Newer guest', onboarded: true });
    await guest2.idle();
    const existing = openUserData({ kv: kv2, uid: 'old', remote: null });
    await existing.repos.profile.upsert('profile', { ...(await fresh.repos.profile.get('profile'))!, name: 'Account name' });
    await copyGuestData(kv2, existing, 'old');
    expect(await existing.repos.profile.get('profile')).toMatchObject({ name: 'Account name' });
  });
});

describe('syncStatusLine', () => {
  it('tells guests, device-only, synced and offline users where their data is', () => {
    expect(syncStatusLine(false, false, false)).toMatch(/this device only/);
    expect(syncStatusLine(true, false, false)).toBe('Saved on this device.');
    expect(syncStatusLine(true, true, false)).toMatch(/Synced to your account/);
    expect(syncStatusLine(true, true, true)).toMatch(/will sync when you’re back online/);
  });
});
```

### `src/__tests__/liteMode.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { shouldUseLite } from '../services/liteMode';

describe('shouldUseLite', () => {
  it('keeps videos on a normal connection without Reduce motion', () => {
    expect(shouldUseLite({ reduceMotion: false })).toBe(false);
    expect(shouldUseLite({ reduceMotion: false, saveData: false, effectiveType: '4g' })).toBe(false);
    expect(shouldUseLite({ reduceMotion: false, effectiveType: '3g' })).toBe(false);
  });

  it('switches to lite for Reduce motion, Data Saver or 2G', () => {
    expect(shouldUseLite({ reduceMotion: true })).toBe(true);
    expect(shouldUseLite({ reduceMotion: false, saveData: true })).toBe(true);
    expect(shouldUseLite({ reduceMotion: false, effectiveType: '2g' })).toBe(true);
    expect(shouldUseLite({ reduceMotion: false, effectiveType: 'slow-2g' })).toBe(true);
  });

  it('ignores unknown network labels', () => {
    expect(shouldUseLite({ reduceMotion: false, effectiveType: 'wifi' })).toBe(false);
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
    expect(out.savings).toEqual([
      expect.objectContaining({ id: 'legacy-total', amountInr: 450 }),
      expect.objectContaining({ id: 'demo-sample-total', amountInr: DEMO_SAMPLE_SAVED_INR, demoSample: true }),
    ]);
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

### `src/__tests__/config.test.ts`

```ts
import { describe, expect, it } from '@jest/globals';

import { featureFlags, isEnabled, type FeatureFlag } from '../config/featureFlags';
import { brand, colors, spacing } from '../config/theme';

describe('feature flags', () => {
  it('ships every unfinished feature switched off', () => {
    // Finished features stay listed here so turning one on is always a deliberate test change.
    const finished: FeatureFlag[] = ['newTabShell', 'cloudSync', 'liteMode'];
    for (const flag of Object.keys(featureFlags) as FeatureFlag[]) {
      expect(isEnabled(flag)).toBe(finished.includes(flag));
    }
  });

  it('reads an overridden flag set', () => {
    const flags = { ...featureFlags, voiceSteps: true, cloudSync: false };
    expect(isEnabled('voiceSteps', flags)).toBe(true);
    expect(isEnabled('cloudSync', flags)).toBe(false);
  });
});

describe('theme tokens', () => {
  it('uses FitPlate green as the brand primary', () => {
    expect(brand.primary).toBe('#1E8A5A');
    expect(colors.primary).toBe(brand.primary);
  });

  it('keeps the demo palette available to new screens', () => {
    expect(colors.bg).toBe('#07090A');
    expect(colors.accent).toBe('#3DDC84');
  });

  it('has an increasing spacing scale', () => {
    const values = Object.values(spacing);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});
```

### `src/__tests__/activity.test.ts`

```ts
import { describe, expect, it, jest } from '@jest/globals';

import { addDays, dayKey, type DayLog } from '../lib/store';
import { lastSevenDaysActivity } from '../services/activity';

// The store module also sets up Firebase sign-in, which Jest cannot load (ESM).
// These tests only need its date helpers, so Firebase is stubbed out. Jest
// hoists these calls above the imports.
jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn(), signOut: jest.fn() }));
jest.mock('../lib/firebase', () => ({ firebaseConfigured: false, getFirebaseAuth: () => null }));
jest.mock('../services/storage/firestoreRemote', () => ({ getDb: () => null, createFirestoreAdapter: jest.fn() }));

const now = new Date(2026, 9, 10, 12, 0);
const day = (exercise: DayLog['exercise']): DayLog => ({ meals: [], exercise, water: 0 });

describe('lastSevenDaysActivity', () => {
  it('returns zeros when nothing is logged', () => {
    expect(lastSevenDaysActivity({}, now)).toEqual({ sessions: 0, minutes: 0, kcal: 0, activeDays: 0 });
  });

  it('sums workouts from today and the six days before', () => {
    const days = {
      [dayKey(now)]: day([{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }]),
      [dayKey(addDays(now, -6))]: day([
        { type: 'Yoga', minutes: 20, kcal: 60, at: 0 },
        { type: 'Run', minutes: 15, kcal: 150, at: 0 },
      ]),
    };
    expect(lastSevenDaysActivity(days, now)).toEqual({ sessions: 3, minutes: 65, kcal: 330, activeDays: 2 });
  });

  it('ignores workouts older than seven days and days with no workout', () => {
    const days = {
      [dayKey(addDays(now, -7))]: day([{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }]),
      [dayKey(addDays(now, -1))]: day([]),
    };
    expect(lastSevenDaysActivity(days, now)).toEqual({ sessions: 0, minutes: 0, kcal: 0, activeDays: 0 });
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

## 2. The demo blob (read once since Day 03b)

Until Day 03b everything sat in one JSON blob in AsyncStorage under the key `fitplate.state.v2`. Since Day 03b the app no longer writes it. On the first start of the new version, `prepareGuestDevice` (`src/services/userSession.ts`) turns the blob into guest documents once (`fromLegacyState`), sets `fitplate.guestReady.v1`, and leaves the blob in place as a backup. Its fields were:

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

## 4. Guests and sign-in (live since Day 03b, `src/lib/store.tsx` + `src/services/userSession.ts`)

- **Guests:** data stays in AsyncStorage on the device, under owner `guest` (`fitplate.docs.guest.<collection>.v1`). A new device gets the demo's sample week, with every entry marked `demoSample: true` (profile excepted). "Reset demo data" (guests only) restores it.
- **Signed in (`cloudSync` ON):** owner = the Firebase uid. Device first (`fitplate.docs.<uid>.…`), then Firestore `users/{uid}/…` through the outbox. On start the app pulls and merges every collection once (last write wins). A device with no copy of this user yet waits up to 8 s for that first pull, so a returning user doesn't land in onboarding. Waiting changes are also sent when the app goes to the background.
- **Guest signs in with Google:** if the guest has their own entries (not the sample week), the welcome screen asks "Bring your data with you?". **Copy my data** copies them into the account (the account's own profile always wins; the guest profile is used only when the account has none), then removes the guest copy from the device. **Start fresh** keeps the guest data on the device. Either answer is remembered per account in `fitplate.guestCopyAsked.<uid>.v1`.
- **Sign-out:** pending changes are sent first. If everything reached the cloud, this device's copy of the account is cleared; if not (offline), the copy and its outbox stay so nothing is lost, and they are sent at the next sign-in.
- **Screens:** they still read the demo's shape (`days`, `moneySaved`, `favourites`, `plan`, `profile`). `toView()` derives it from the documents in memory; each action updates memory on the same tap and writes through the repositories in order.

## 5. Changelog

- 2026-10-10 (Day 2): file created. Documents the demo blob (`fitplate.state.v2`) and the planned Firestore layout. Added `firestore.rules`. No schema code yet and no data changes; the navigation shell stores nothing new.
- 2026-10-10 (Day 3): all user collections defined at version 1, with types in `src/models/`, the device store, the synced store with outbox, last-write-wins merge, the Firestore adapter, the demo-blob migration and the guest → account copy. Tests use a mocked Firestore. The app does not use this layer yet; Day 03b connects it.
- 2026-10-11 (Day 03b): the app now uses the storage layer. Demo blob migrated once into guest documents; guests on the device, signed-in users device + Firestore (`cloudSync` ON). Added `demoSample?` to `Favourite`, `MealPlanDay` and `SavingEntry` (optional field, so no `schemaVersion` bump; older documents simply lack it). The demo's seeded ₹2,860 now stays on the device as a `demo-sample-total` savings entry marked `demoSample`, never copied. Repositories gained `importMany` (write ready-made documents, for migration and the sample seed). New device keys: `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`. No new collection, no rules change.
````

## 9. DEPENDENCIES

None.

## 10. HOW TO APPLY (for Sudarsan)

Run these from inside the `Fitplate` folder on your Mac.

**Option A (simplest): the code is already on the branch**
1. `git add -A && git commit -m "Before Day 03b"` (skip this if `git status` is clean)
2. `git fetch origin && git checkout claude/project-thread-wchnlm && git pull`
3. `npm install`
4. `npx expo start -c`

**Option B (fallback): apply by hand.** Days 01, 02 and 03 must be applied first.
1. `git add -A && git commit -m "Before Day 03b"`
2. Create every NEW file from section 8 at its path, and replace every CHANGED file with the full version shown there.
3. `npm test`, then `npx expo start -c`.

## 11. HOW TO TEST

**Quickest check: the live site** https://fitplateapp.netlify.app (it deploys this commit automatically).

**Manual checklist (web and iPhone)**
- [ ] **Guest saves survive a reload.** Tap Get started, then log a meal and a glass of water. Reload the page or restart Expo Go, then tap Get started again. You should go straight to Today with the meal and the water still there. Web ☐ iPhone ☐
- [ ] **Old demo users keep their data.** If you used the demo on this device before, your name, logs and "saved by cooking" total are still there after updating. Web ☐ iPhone ☐
- [ ] **Copy prompt.** As a guest, log something, then go to Profile → Sign out → Continue with Google. "Bring your data with you?" appears.
  - Copy my data → your entries show on Today.
  - On a second device (for example the iPhone), sign in with the same Google account → the same entries show. Web ☐ iPhone ☐
- [ ] **Cloud copy is real.** In the Firebase console → Firestore, `users/<your id>` holds your profile, with subcollections `mealLogs`, `waterLogs` and so on. ☐
- [ ] **Profile status.** Signed in, Profile shows "☁️ Synced to your account on every device", and "Reset demo data" is not shown. As a guest it shows "Saved on this device only…" plus the reset button. Web ☐ iPhone ☐
- [ ] **Sign-out clears the device.** Sign out → Get started as a guest → you see the guest data, not your account's. Sign in again → your account's data is back. Web ☐ iPhone ☐
- [ ] **Lite mode.** Turn on iPhone Settings → Accessibility → Motion → Reduce Motion. The welcome screen shows a still green backdrop instead of the video. iPhone ☐

**Automated (run in this session on 2026-10-11; real results)**

| Check | Command | Result |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ pass (0 errors) |
| Lint | `npx expo lint` | ✅ pass (0 problems) |
| Unit tests | `npm test` | ✅ 9 suites, 80 tests passed (27 new) |
| Web bundle | `npx expo export -p web` | ✅ exported (Firestore is now in the main bundle) |
| Web click-through | Playwright (Chromium, 390×844) on the exported site | ✅ see below; no page errors |

Click-through results:
- **Guest on a fresh device.** Welcome → onboarding → Today. Logged a Sandwich, +1 and +2 water. Today showed Eaten 380 and Water 3 of 8. Device storage had `fitplate.docs.guest.*` with `water-2026-10-11` = 3 glasses.
- **After a reload.** Get started went straight to Today with the same numbers (onboarding remembered). The Profile line and the Track sample week looked right in the screenshots.
- **Old demo blob.** A browser seeded with a `fitplate.state.v2` blob (Asha, a salad today, 4 water, ₹3,310) opened straight onto Today with all of it. The blob was kept as a backup.
- **Copy prompt.** Screenshot from a temporary local build that forced the card on; this build was not pushed. Layout, wrapping and button sizes (52–54 px) checked at 390 px.
- **Lite mode.** With `prefers-reduced-motion: reduce`, the welcome page has 0 `<video>` elements and the still backdrop; normally it has 1.
- **Not clicked through here:** real Google sign-in and Firestore. This session has no Firebase keys, which is correct. That path is covered by the 24 session tests against a mocked Firestore and by the live-site checks above.

The new tests cover:
- the documents ↔ screen shape round trip;
- the one-time blob migration, sample seeding, and a corrupt blob;
- a meal appearing on the same tap and being saved;
- five rapid water taps becoming one cloud batch, and never going below 0;
- favourite on, off and on again (soft delete), plan slots, profile order and onboarding day, savings and workouts;
- guest reset, and failed writes being reported, not thrown;
- copying only the guest's own entries, the account's profile winning, and "Start fresh";
- sign-out online (device cleared), offline (kept, then sent at the next sign-in), and device-only users never being cleared;
- the Profile status line and the lite-mode rules.

## 12. KNOWN ISSUES, LIMITATIONS AND TODOs

- **Changes from another device show after reopening the app.** The app pulls from the cloud when it opens, and there are no live listeners yet. Day 34 (cloud sync hardening) adds one listener per screen and date-range queries.
- **The amber "Offline right now…" line clears on the next app start**, not the moment the connection returns.
- **Signing out while offline keeps that account's copy on the device**, so nothing is lost, until the next sign-in sends it. Another person using the same phone as a guest doesn't see it (it's stored under the account's id), but it is still on the device.
- **The first app open after this update** migrates the old demo save into the guest store. A user who was signed in on the old version gets the copy prompt once. Copy brings their old logs into their account; the demo's sample week stays behind.

## 13. USER ACTIONS ADDED TODAY

None. Firestore and its rules are already in place.

Still open from yesterday: the "Add vendor product links and prices to the daily ingredient research?" card in the auto-build thread (SPEC-ADDENDA §7). It needs your tap whenever you're back.

## 14. BUILD STATE

### Roadmap

| Day | Item | Status |
|---|---|---|
| 1 | Audit and architecture | ✅ done |
| 2 | Navigation shell | ✅ done |
| 3 | Data models and storage | ✅ done (layer + tests on Day 03; app wiring on Day 03b) |
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
3. **Storage (Day 3), now cloud-first per SPEC-ADDENDA §5:** typed repositories backed by Firestore (`users/{uid}/…`) for signed-in users and AsyncStorage for guests and as the offline cache; last-write-wins on `updatedAt`; every document has `id`, `createdAt`, `updatedAt`, `schemaVersion`, `deleted`. Built on Day 3 in `src/services/storage/` (see `docs/DATA_MODEL.md`): `storageService` (typed keys, envelopes, migration hook, exportAll, resetAll), `LocalDocStore` (one AsyncStorage key per owner and collection), `RemoteDocStore` over a `RemoteAdapter` (`firestoreRemote.ts` is the real Firestore one), `SyncedDocStore` (device first, outbox, 1.5 s debounced batches), `createRepository` (create/get/list/update/upsert/soft remove, read-time migrations), `fromLegacyState` and `copyGuestToAccount`. `openUserData({ kv, uid, remote })` is the single entry point. Rules in `firestore.rules`. **Since Day 03b the app runs on it:** `src/lib/store.tsx` (`StoreProvider`) opens the guest store or the signed-in user's store (device + Firestore when `cloudSync` is on), and `src/services/userSession.ts` keeps the documents in memory, derives the screens' demo shape with `toView()`, and writes each action through the repositories in order. It also holds the one-time blob migration (`prepareGuestDevice`), the "Bring your data with you?" copy (`copyGuestData` / `skipGuestCopy`) and sign-out (`signOutDevice`). New screens should read documents from the session rather than the demo shape once their day replaces a demo screen. The original plan, kept for reference: `src/services/storage/` wraps AsyncStorage with typed keys (`fitplate.<name>.v<N>`), versioned envelopes `{ version, data }`, a migration hook, `exportAll()` and `resetAll()`. Repositories: `mealLogs`, `waterLogs`, `supplementLogs`, `workoutLogs`, `profile`. A one-time migration reads `fitplate.state.v2` so demo users keep their data. The React context stays as the in-memory cache and calls the repositories.
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
| `src/app/profile.tsx` | Day 03b |
| `src/components/ui.tsx` | Day 03b |
| `src/config/featureFlags.ts` | Day 03b |
| `src/services/activity.ts` | Day 2 |
| `src/__tests__/tabs.test.ts` | Day 2 |
| `src/__tests__/activity.test.ts` | Day 03b |
| `src/__tests__/config.test.ts` | Day 03b |
| `jest.config.js` | Day 2 |
| `firestore.rules` | Day 2 |
| `docs/DATA_MODEL.md` | Day 03b |
| `public/index.html`, `public/manifest.json`, `public/*.png`, `assets/icon.png`, `assets/favicon.png` (app icon) | merged from demo-app on 2026-10-10 (5c97126), not by the build |
| `.env.example` (Google photo and email) | merged from demo-app on 2026-10-09 (c8a2449), not by the build |
| `src/lib/store.tsx` | Day 03b |
| `src/app/index.tsx` | Day 03b |
| `src/models/common.ts` | Day 3 |
| `src/models/user.ts` | Day 3 |
| `src/models/logs.ts` | Day 03b |
| `src/models/research.ts` | Day 3 |
| `src/models/index.ts` | Day 3 |
| `src/services/storage/kv.ts` | Day 3 |
| `src/services/storage/storageService.ts` | Day 3 |
| `src/services/storage/docStore.ts` | Day 3 |
| `src/services/storage/remote.ts` | Day 3 |
| `src/services/storage/firestoreRemote.ts` | Day 3 |
| `src/services/storage/syncedStore.ts` | Day 3 |
| `src/services/storage/lww.ts` | Day 3 |
| `src/services/storage/repository.ts` | Day 03b |
| `src/services/storage/schemas.ts` | Day 3 |
| `src/services/storage/legacy.ts` | Day 03b |
| `src/services/storage/guest.ts` | Day 3 |
| `src/services/storage/index.ts` | Day 03b |
| `src/__tests__/storage/fakes.ts` | Day 3 |
| `src/__tests__/storage/storageService.test.ts` | Day 3 |
| `src/__tests__/storage/repository.test.ts` | Day 3 |
| `src/__tests__/storage/sync.test.ts` | Day 3 |
| `src/__tests__/storage/legacy.test.ts` | Day 03b |
| `src/services/userSession.ts` | Day 03b |
| `src/components/GuestCopyPrompt.tsx` | Day 03b |
| `src/services/liteMode.ts` | Day 03b |
| `src/lib/useLiteMode.ts` | Day 03b |
| `src/__tests__/userSession.test.ts` | Day 03b |
| `src/__tests__/liteMode.test.ts` | Day 03b |

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
| cloudSync | true (since Day 03b) | Firestore for signed-in users; false keeps their data on the device only |
| liteMode | true (since Day 03b) | Innovation: still backdrop instead of background videos (Reduce motion, Data Saver, 2G) |

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
| Dishes | FitPlate_Dishes_2026-10-11.md | 36–40 (Rava Dosa, Bhindi Masala, Egg Curry, Veg Biryani, Sabudana Khichdi; first with Fasting suitability) | — (backlog; recorded Day 03b) |
| Ingredients | FitPlate_Ingredients_2026-10-11.md | 3 (okra, sabudana, rock salt) | — (backlog; recorded Day 03b) |
| Nutrients | FitPlate_Nutrients_2026-10-11.md | 5 Vitamin C, 6 Thiamine (B1) | — (backlog; recorded Day 03b) |
| Fitness | FitPlate_Fitness_2026-10-11.md | Home 3, Yoga 3, Gym 5, Gym 6 | — (backlog; recorded Day 03b) |

- **Backlog per stream:**
  - Dishes: 8 files / 40 items
  - Ingredients: 8 files / 113 entries
  - Nutrients: 3 files / 6 topics
  - Fitness: 3 files / 12 items
- **Per-item versions:** every item still has 1 version, and nothing has been merged or output yet.
- **Catch-up plan:** from Day 4, at 10 dishes and 30 ingredients per run, two runs a day against about 5 new dishes a day, the dish backlog (about 45 by Day 4) clears in about 5 runs. The ingredient backlog (about 116) clears in about 4 runs.

### DATABASE (daily duty, SPEC-ADDENDA §5)

- **Schema:** all eight user collections are at version 1: `profile` (on `users/{uid}`), `mealLogs`, `waterLogs` (one document per day), `supplementLogs`, `workoutLogs`, `favourites`, `mealPlans` and `savings`. Every document has `id`, `createdAt`, `updatedAt`, `schemaVersion` and `deleted`. Day 03b added the optional `demoSample` to `Favourite`, `MealPlanDay` and `SavingEntry` (no version bump). Fields are listed in `docs/DATA_MODEL.md`.
- **Live since Day 03b:** guests on the device; signed-in users device first, then Firestore (`cloudSync` ON). The demo blob is migrated once into guest documents and kept as a backup. "Bring your data with you?" runs after sign-in. Sign-out clears the device only once everything reached the cloud.
- **Device keys:** `fitplate.docs.<owner>.<collection>.v1`, `fitplate.outbox.<owner>.v1`, `fitplate.guestReady.v1`, `fitplate.guestCopyAsked.<uid>.v1`; the old `fitplate.state.v2` is a read-once backup.
- **Free-tier guard:** one pull per collection when the app opens for a signed-in user (no listeners yet); writes are debounced batches; water is one document per day; waiting writes are sent when the app goes to the background.
- **Rules:** owner-only (`firestore.rules`), live in the console since 2026-10-10. No top-level collection added.
- **USER ACTION:** none open.

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
| 2 | Kettle and one-burner cooking (PG/hostel kitchen preset) | IMPROVE | 4 | S | 4.0 | Dish equipment data + kitchen profile (Day 10) | new Day 03b; build after Day 10 |
| 3 | Monsoon swap | IMPROVE | 3 | S | 3.0 | Price engine and cost to make (Day 8) | approved by Sudarsan 2026-10-10; build after Day 8 |
| 4 | Late-night craving helper | NEW FEATURE | 3 | S | 3.0 | Dish library (Day 6) | new Day 03b |
| — | Lite mode (still backdrop on Reduce motion, Data Saver, 2G) | IMPROVE | 3 | S | 3.0 | none | **built on Day 03b** (`liteMode` flag ON) |
| 5 | Fasting mode | NEW SEGMENT | 4 | M | 2.0 | Dish fasting field | approved by Sudarsan 2026-10-10; the block arrives from dish 36 (first file 2026-10-11, incl. Sabudana Khichdi); build once enough dishes carry it |
| 6 | Parents' plate | NEW SEGMENT | 4 | M | 2.0 | Ingredient sodium and sugar data (exists, partial) | approved by Sudarsan 2026-10-10 |
| 7 | Tomorrow's tiffin (pack dinner for lunch) | NEW FEATURE | 4 | M | 2.0 | Cook mode (Day 11–12), dish storage advice, order prices | new Day 03b |
| — | Office canteen builder | IMPROVE | 5 | M | — | New thali-component research | **STANDBY / TODO** (Sudarsan, 2026-10-10: on hold, he has bigger plans for tracking meals at the office; do not build or research) |

### TODO / STANDBY (Sudarsan's parked items; never build these until he says so)

- **Office canteen thali builder / office meal tracking** (idea 3, parked 2026-10-10). Sudarsan has bigger plans for tracking meals in office workspaces. Keep it here; new ideas about office meals should be added under this item, not built.

### USER ACTIONS (cumulative)

| # | Action | Added | Status |
|---|---|---|---|
| 1 | Create Firestore (asia-south1, Spark) and publish `firestore.rules` | Day 2 | closed: done by Sudarsan (database 2026-10-09, rules 2026-10-10) |
| 2 | Decision: research for thali components (idea 3) | Day 3 | closed: on standby by Sudarsan (2026-10-10); stays in the to-do list |
| 3 | Decision: fasting-suitability field in dish research (idea 4) | Day 3 | closed: approved (2026-10-10); dish research PROMPT_PATCH_02 adds it from dish 36 (SPEC-ADDENDA §6) |
| 4 | Decision: add per-vendor product name, price, pack size and link (Zepto, Instamart, Blinkit) to the daily ingredient research, for Day 15G1 (SPEC-ADDENDA §7) | 2026-10-10 (grocery supplement) | open: decision card posted in the auto-build thread; recommended "Add them" |

**Next up: Day 04: Research pipeline I (dishes and ingredients): per-item JSON, dish and ingredient importers (with `asOrdered` and `fasting`), merge rules and the price trend engine with its full tests, then ingest the backlog within the caps. Tonight's run also does the first supervisor review's FIX LIST if it appears at 14:52 IST.**

