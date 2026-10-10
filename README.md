# FitPlate

A complete health suite that starts on your plate. This repo holds the **demo app**: an Expo (React Native) app with hard-coded dishes, so people can try the experience before the hard parts (live prices, the Swiggy/Zomato overlay, camera checks) are built.

## What's in the demo

- Login screen with a looping cooking video (or a food backdrop until a video is set), Google sign-in through Firebase, and a "Try the demo" button that works without any setup.
- Home dashboard: money saved, calories in, calories burnt, and dish search.
- 5 dishes (Poha, Masala Oats, Egg Bhurji Pav, Paneer Butter Masala, Chicken Biryani), each with a scorecard: calories, protein, time, difficulty, cost to make vs. cost to order, and a health score vs. the restaurant version.
- Servings scaling, equipment with alternatives, an offline shopping list with brands and approximate prices, and placeholder "Buy" buttons for online.
- Micro-step cooking guide with scaled measurements and timers, then a finished-dish screen with storage, leftover-remix and burn-it-off tips.

All prices and nutrition numbers in `src/data/dishes.ts` are **estimates** for the demo.

## Run it

1. Install [Node.js LTS](https://nodejs.org) and [Git](https://git-scm.com).
2. In a terminal:
   ```bash
   git clone https://github.com/Sudarsannn/FITPLATE.git
   cd FITPLATE
   npm install
   npx expo start
   ```
3. Press `w` to open it in your browser, or `a` to open it on an Android emulator or a phone connected over USB.

The "Try the demo" button works straight away. Google sign-in needs the Firebase setup below and a development build, because it doesn't run inside the plain Expo Go app.

## Turn on Google sign-in (optional)

1. Create a free Firebase project (Spark plan) and turn on **Authentication → Google**.
2. Add a **Web app** in Firebase and copy its config.
3. In Google Cloud → APIs & Services → Credentials, copy the **Web client ID** that Firebase created, and create an **Android client ID** for package `com.fitplate.app` with your SHA-1.
4. Copy `.env.example` to `.env` and fill in the values. `.env` is git-ignored.
5. Build a development build: `npx expo run:android` (needs Android Studio) or `npx eas-cli@latest build --profile development --platform android` (free Expo account).

## Project layout

- `src/app/` – screens (Expo Router: every file is a route)
- `src/data/dishes.ts` – the hard-coded demo dishes
- `src/lib/` – Firebase and session/dashboard state
- `src/components/` – shared UI
