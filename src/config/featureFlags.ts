// Feature flags for the auto-build roadmap. Every feature that is not finished,
// or that needs a native development build, ships switched OFF so the app
// always runs in Expo Go exactly as before. A flag turns ON once its day's
// "Done when" check passes; it then stays as a kill switch.
export const featureFlags = {
  /** Day 2: five-tab shell (Today, Cook, Track, Move, Profile). ON since Day 2; false restores the demo's four tabs. */
  newTabShell: true,
  /** Day 6: the Cook tab lists the research dishes (search, filters, sort). ON since Day 6; false brings back the 5 demo dishes. */
  researchData: true,
  /** Day 12: camera check step in cook mode (plan only; needs a dev build). */
  cameraCheck: false,
  /** Day 12: read steps aloud with expo-speech (a switch on the step screen). Needs the iPhone app rebuilt once for the new module. */
  voiceSteps: true,
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
  /** Innovation (Day 06): the Cook tab remembers "Leave out dishes that contain …" on this device. */
  rememberAllergens: true,
  /** Innovation (Day 07): "Jump to" chips at the top of the dish page. */
  dishJumpChips: true,
  /** Innovation (Day 08, review idea 4): "₹ per 10 g protein" on the dish page and a "Protein per ₹" sort. */
  proteinPerRupee: true,
  /** Innovation (Day 07 idea, built Day 09): "N kcal lighter than the restaurant version" on Cook cards and a matching sort, only where the restaurant published its calories. */
  calorieGapBadge: true,
  /** Innovation (Day 07 idea, built Day 10): "Why these scores?" on the dish page, from the researched reasons and rating basis. */
  scoreExplainer: true,
  /** Innovation (Day 11): "Cook again" and "Recently viewed" rows on the Cook tab. */
  recentDishes: true,
  /** Innovation (Day 11): after 9 pm Today suggests three quick, lighter dishes instead of ordering. */
  lateNightHelper: true,
  /** Innovation (Day 13): opt-in desk-break stretch card on Today, weekdays 10:00 to 18:00. */
  deskBreak: true,
  /** Priority plan P1-b: Google sign-in inside the iPhone / Android dev build. Only shows when that platform's client ID is in .env. */
  nativeGoogleSignIn: true,
  /** Priority plan P2-c: read the research library from the server when it is newer than the bundled copy. */
  serverResearch: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag, flags: Record<FeatureFlag, boolean> = featureFlags): boolean {
  return flags[flag] === true;
}
