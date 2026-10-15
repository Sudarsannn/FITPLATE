# FitPlate on your iPhone (free, with your Mac)

This puts the real FitPlate app on your iPhone using Xcode and a free Apple ID.
It costs ₹0. The catch: Apple makes a free-account app stop opening after
**7 days**, and you reinstall it with one command. Your data is on the server
(Firestore), so nothing is lost when that happens.

The website (https://fitplateapp.netlify.app) keeps working exactly as before.
Both are built from the same code.

## What you need

- Your Mac, with enough free disk space for Xcode (it is a very large download).
- Your iPhone and its USB cable.
- A free Apple ID (the one you already use is fine).
- The FitPlate folder on your Mac (your "Fitplate" checkout), up to date:
  `git pull` on branch `claude/project-thread-wchnlm`, then `npm install`.

## One-time setup (about 1 to 2 hours, mostly downloading)

1. **Make room and update.** Free up disk space. If the App Store offers a macOS
   update, install it first; new Xcode versions need a recent macOS.
2. **Install Xcode** from the Mac App Store. Open it once, accept the licence, and
   let it install the extra components, including the **iOS** platform.
3. **Add your Apple ID to Xcode.** Xcode → Settings → Accounts → **+** → Apple ID.
   A "Personal Team" appears. That is your free signing identity.
4. **Prepare the iPhone.** Plug it into the Mac and tap **Trust** on the phone.
   Then on the phone: Settings → Privacy & Security → **Developer Mode** → on.
   The phone restarts; confirm when asked.
5. **Build and install.** In Terminal, inside your FitPlate folder:

   ```
   npm install
   npx expo run:ios --device
   ```

   Pick your iPhone from the list. The first build takes a while (10 to 20 minutes).
6. **If it complains about signing:** open `ios/FitPlate.xcworkspace` in Xcode →
   click **FitPlate** in the left bar → the **FitPlate** target → **Signing &
   Capabilities** → Team = your Personal Team, tick **Automatically manage
   signing**. If Xcode says the bundle ID is "not available", add this line to
   your `.env` (any unique name works) and run step 5 again:

   ```
   FITPLATE_IOS_BUNDLE_ID=com.yourname.fitplate
   ```

   If you change it, use the same ID in the Google step below.
7. **Trust yourself on the phone.** iPhone Settings → General → VPN & Device
   Management → your Apple ID → **Trust**.
8. Tap the FitPlate icon. It opens the real app.

## Day to day

- Start the code server on the Mac: `npx expo start`, then open FitPlate on the
  phone. It connects to the Mac like Expo Go did (same Wi-Fi).
- **Every 7 days** the app stops opening. Plug in and run
  `npx expo run:ios --device` again.

## Google sign-in inside the iPhone app (optional, free)

Until you do this, the iPhone app shows "Get started" (guest mode) only. The
website's Google sign-in is not affected.

1. Open https://console.cloud.google.com and pick the project your Firebase app
   uses (same name as in the Firebase console).
2. APIs & Services → **Credentials** → **Create credentials** → **OAuth client ID**.
3. Application type: **iOS**. Bundle ID: `com.sudarsannn.fitplate` (or the one you
   put in `.env` in step 6). Create.
4. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
5. Add it to your `.env` on the Mac (never paste `.env` values into chat):

   ```
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<the client ID>
   ```

6. Rebuild once: `npx expo run:ios --device`. The rebuild registers the sign-in
   return address with iOS.
7. Open FitPlate, tap **Continue with Google**, sign in with the same Google
   account as on the laptop. Your data should match (see the sync test in
   `docs/SERVER_READINESS.md`).

No change is needed in Firebase: Firebase accepts Google sign-ins from any client
ID in the same Google Cloud project.

## What the free Apple ID can't do

| | Free Apple ID (now) | Apple Developer Program (when you go public) |
|---|---|---|
| Cost | ₹0 | US$99 a year |
| App keeps working | 7 days, then reinstall | About a year per build |
| Limits | 10 app IDs at a time, 3 test devices | Normal developer limits |
| Push notifications, universal links | No | Yes |
| TestFlight / App Store | No | Yes |
| Needs a Mac | Yes | No (Expo's cloud builds can do it) |

Features that need the paid programme stay switched off in the app and are
marked "needs paid Apple account". Nothing in today's app needs them.

## Opening other apps from FitPlate

The app checks whether Zepto, Swiggy and UPI apps (GPay, PhonePe, Paytm, BHIM,
CRED) are installed before opening them, and falls back to their websites when
they aren't. The list lives in `src/config/queriedSchemes.json`; `app.config.js`
copies it into the iPhone app's settings on each build.

## Swiggy on the iPhone

Swiggy only lets FitPlate sign in from `http://localhost` (your Mac's browser)
until Swiggy approves FitPlate's return address, which is part of applying to the
Swiggy Builders Club. Until then, use the Swiggy checkout on the Mac's web build
(`npx expo start --web`), and the iPhone shows the sample mode. See
`docs/VENDOR_INTEGRATIONS.md`.
