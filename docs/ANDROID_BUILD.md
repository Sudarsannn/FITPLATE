# FitPlate on Android (APK, free)

Goal: install FitPlate on the Oppo A77 as a real app, using Expo's free cloud
build (EAS). Everything below can be done **from the phone's browser**. No Mac
needed. A Mac route is at the end if you prefer it.

## Cost check

- Expo account and EAS builds: **free plan**. It includes a limited number of
  Android builds per month (about 15 at the time of writing; check
  expo.dev/pricing). One build is enough to get the app on the phone.
  Free builds wait in a queue, so a build can take 15 to 60 minutes.
- Google Cloud / Firebase Android sign-in client: free.
- Nothing here needs a card. If Expo ever asks for one, stop and tell Claude.

## What Claude already did (in the repo)

- `eas.json` with a `preview` profile that makes an **APK** (installable
  directly, no Play Store), reading its settings from the Expo "preview"
  environment.
- Confirmed the Android package is `com.fitplate.app`.
- Google sign-in on Android reads `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
  (already wired). The button only appears when that value exists, so the app
  works without it ("Get started" / guest mode).
- Registered `com.fitplate.app` as an app link scheme so Google can hand the
  sign-in back to the app. Web and iPhone builds are unchanged and still build.

## What you do by hand (one step at a time)

### Step 1. Make a free Expo account

1. On the phone, open **expo.dev** and tap **Sign up**.
2. "Continue with GitHub" is easiest (it links GitHub at the same time).
3. Note your Expo **username**.

### Step 2. Create the FitPlate project on Expo

1. expo.dev > **Projects** > **Create a project**.
2. Name: `FitPlate`, slug: `fitplate` (must be exactly this).
3. Open the project. Copy the **Project ID** (a long code like
   `1a2b3c4d-....`).
4. **Send Claude the Project ID and your Expo username.** Claude adds them to
   the app config and pushes. (The build can't start until this is in.)

### Step 3. Connect the GitHub repo

1. In the project: **Project settings** > **GitHub** > **Connect**.
2. Install the Expo GitHub app on `Sudarsannn/FITPLATE` only.
3. Base directory: leave empty (the app is at the repo root).

### Step 4. Add the app settings (environment variables)

In the project: **Environment variables** > **Add variable**. For each one,
tick the **preview** environment and choose visibility **Plain text** or
**Sensitive** (not "Secret", which the app can't read).

| Name | Where to find it |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Your Mac's `.env`, or Firebase console > Project settings > Your apps > Web app |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | same place |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | same place |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | same place |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | your `.env`, or Google Cloud > APIs & Services > Credentials |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | **Skip for now**, made in Step 8 |

Optional: if you use the hosted AI dish worker, copy any other
`EXPO_PUBLIC_...` lines from your `.env` as well.

### Step 5. Make the signing key (and get the SHA-1)

1. In the project: **Credentials** > **Android** > **Add application
   identifier** > `com.fitplate.app`.
2. Under it: **Add a keystore** > **Generate new keystore**.
3. Copy the **SHA-1 fingerprint** shown for that keystore. You need it in
   Step 8. (If you skip this step, the first build makes the keystore itself and
   the SHA-1 shows up here afterwards.)

### Step 6. Start the build

1. In the project: **Builds** > **Build from GitHub** (or "New build").
2. Platform **Android**, branch `claude/project-thread-wchnlm`, profile
   **preview**.
3. Wait. The page shows the queue and the log. If it fails, copy the red error
   lines to Claude.

### Step 7. Install the APK on the Oppo

1. Open the finished build page on the Oppo and tap **Install** / download the
   `.apk`.
2. Open the downloaded file. ColorOS will ask to allow installs from your
   browser: tap **Settings** > turn on **Allow from this source** (Settings >
   Privacy / Security > Install unknown apps, if it doesn't open by itself).
3. If Oppo shows "this app may be risky" or a security scan, tap **Install
   anyway**. It is your own app, not from the Play Store, so this warning is
   normal.
4. Open FitPlate. Without Step 8 it starts with **Get started** (no Google
   sign-in); everything else works and your data stays on the phone.

Updating later: run Step 6 again and install the new APK over the old one.
Keep the same keystore (never delete it), or the update will not install.

### Step 8 (later). Turn on Google sign-in for Android

1. **Firebase console** > Project settings > **Add app** > Android.
   Package name `com.fitplate.app`, paste the **SHA-1** from Step 5, register.
   (You can skip downloading `google-services.json`; the app doesn't use it.)
2. **Google Cloud console** (same project) > APIs & Services > **Credentials**.
   Firebase usually creates an "Android client (auto created by Google
   Service)". If not: **Create credentials** > OAuth client ID > **Android**,
   package `com.fitplate.app`, same SHA-1.
3. Open that Android client > **Advanced settings** > turn on **Enable custom
   URI scheme** > Save. (Google switches this off for new Android clients;
   without it sign-in fails with "invalid request".)
4. Copy its **Client ID** (ends in `.apps.googleusercontent.com`).
5. Expo > Environment variables > add
   `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (preview) with that value. Also add
   it to your Mac's `.env` so local builds match.
6. Build again (Step 6) and install the new APK (Step 7). "Continue with
   Google" now appears.

## Mac route (same result)

Run these one at a time in the `Fitplate` folder:

```bash
sudo xcodebuild -license accept        # once; git and builds stop working until this is accepted
git pull
npm install                            # ALWAYS after a pull: new packages (e.g. expo-camera) arrive with it
npx expo config --json > /dev/null && echo CONFIG OK   # should print CONFIG OK
npm install -g eas-cli                 # free, once
eas login                              # your Expo account
eas env:push --environment preview --path .env   # copies your .env settings to Expo (else the APK starts in guest mode)
eas build -p android --profile preview # say yes to "create a project" and "generate a new Android Keystore"
eas credentials -p android             # shows the SHA-1 for Step 8
```

If `eas build` says "expo config --json exited with non-zero code", it is
almost always a missing `npm install`. Run `npx expo config --json` to see the
real error line and send it to Claude.
