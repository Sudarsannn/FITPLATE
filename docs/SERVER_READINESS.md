# Server Readiness Report (priority plan P2-a)

Written 16 Oct 2026 from the code on branch `claude/project-thread-wchnlm`.
The build can't log in to your Firebase console, so anything marked
"check" is what the code expects; the console is the final word.

## Which server the app uses

| Question | Answer |
|---|---|
| Backend | **Firebase** (Google): Firebase Auth + Cloud Firestore, Spark (free) plan |
| Which project | The one named in your `.env` as `EXPO_PUBLIC_FIREBASE_PROJECT_ID` (and in Netlify's environment variables) |
| Database | Firestore, `(default)` database, location `asia-south1` (created by you on 9 Oct) |
| Tied to Google sign-in? | Yes. Every user's data lives under `users/{uid}`, where `uid` is the Firebase Auth id of the Google account. The same Google account on the laptop and the iPhone gets the same `uid`, so the same data |
| Google sign-in on the web | Working (confirmed by you on 10 Oct, laptop and iPhone browser) |
| Google sign-in in the iPhone app | Wired (P1-b). Needs the iOS client ID in `.env`, see `docs/NATIVE_IPHONE_SETUP.md` |
| Swiggy tokens | Never in Firestore. They stay in memory in the local FitPlate server on your Mac (`server/`), see `docs/VENDOR_INTEGRATIONS.md` |

If "the server" you set up is something other than this Firebase project
(for example a Supabase project), tell me in the thread and I'll point the app at it.

## What lives on the server

| Data | Firestore path | Scope | Since |
|---|---|---|---|
| Profile, goals, targets | `users/{uid}` (the user document itself) | Per user | Day 3 |
| Settings: units, preferred vendor, brand per ingredient, toggles, Swiggy insights consent | `users/{uid}/settings/settings` | Per user | P2-b |
| Meals | `users/{uid}/mealLogs/{id}` | Per user, append-only | Day 3 |
| Water | `users/{uid}/waterLogs/water-YYYY-MM-DD` | Per user, one counter per day | Day 3 |
| Vitamins / supplements | `users/{uid}/supplementLogs/{id}` | Per user, append-only | Day 3 |
| Workouts | `users/{uid}/workoutLogs/{id}` | Per user, append-only | Day 3 |
| Weight | `users/{uid}/weightLogs/{id}` | Per user, append-only | P2-b |
| Shopping lists (basket in progress, ticked items, chosen brands) | `users/{uid}/shoppingLists/{id}` | Per user | P2-b |
| Money saved | `users/{uid}/savings/{id}` | Per user, append-only | Day 3 |
| Saved dishes | `users/{uid}/favourites/{dishId}` | Per user | Day 3 |
| Meal plan | `users/{uid}/mealPlans/YYYY-MM-DD` | Per user | Day 3 |
| Ratings | `users/{uid}/ratings/{dishId}` | Per user | P2-b |
| Cook completions | `users/{uid}/cookCompletions/{id}` | Per user, append-only | P2-b |
| Clock check | `users/{uid}/meta/clock` | Per user, one document | P2-b |
| Research library | `research/meta`, `research/extras`, `research/{kind}/items/{id}` | Shared, read-only | P2-c |

Stats and streaks (money saved, calories in and out, cooking streak) are
worked out from the logs above every time, so they can never drift from them.

**Not stored, ever:** Swiggy or Zepto catalogue, menu or price data; card or
UPI details; Swiggy login tokens.

## Sync rules, as built

- The server is the source of truth. Each device keeps an offline copy
  (AsyncStorage; the web build also uses Firestore's IndexedDB cache). Changes
  made offline wait in an outbox and upload when the device is back online.
- Logs only ever add entries. The app never rewrites a log; the security
  rules refuse any change to a log except a soft delete.
- Other documents: the latest change wins. Every write is stamped with the
  device clock corrected by the server's clock (`services/storage/serverClock.ts`
  measures the difference once per sign-in), so a phone running fast can't
  win every conflict.
- Guest mode stays. When a guest signs in, the app offers to copy their guest
  data into the account ("Bring your data with you?"); sample data is never copied.
- Sign-out clears the device copy once everything has uploaded; signing back in
  brings it all back from the server.

## Security rules

`firestore.rules` in the repo:

- `users/{uid}/…`: only that signed-in user can read or write. Append-only
  collections accept new entries and soft deletes only. Hard delete stays
  allowed for the owner, for "Delete my data".
- `research/…`: anyone can read, nobody can write from the app. Only the import
  script, using an admin key on your Mac, writes there.

**Check:** the rules you published on 10 Oct are the older owner-only version.
The new file adds the append-only check and the research library. Publish it
(see your checklist). Until you do, everything still works except that the app
can't read the server's research library and keeps using its bundled copy.

## What's missing (your steps)

1. Publish the new `firestore.rules` (Firebase console → Firestore Database → Rules).
2. Run the research import once (needs a service account key; steps in your checklist).
3. Add the iOS client ID for sign-in in the iPhone app (`docs/NATIVE_IPHONE_SETUP.md`).
4. Run the sync test below.

## Sync test (do this when you're back)

1. Sign in with Google on the laptop (web). Log a glass of water and tick an
   item on a shopping list.
2. Sign in with the same Google account on the iPhone app. Both changes
   should be there.
3. Log a meal on the phone. Refresh the laptop: it should appear.
4. Turn on flight mode on the phone, log something, turn flight mode off. It
   should upload (the laptop shows it after a refresh).
5. Sign out on the phone. The phone's copy clears; signing back in brings
   everything back.
