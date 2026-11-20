/**
 * Day 32: free vs paid scaffold. NO payments are wired and none are planned by this file.
 *
 * OPEN DECISION FOR SUDARSAN: which features (if any) become paid. Until he decides, every feature is 'free'.
 * To lock a feature, change its entry below to 'plus'; people on the free plan then see an upgrade card in its place,
 * and the Settings screen offers a "Preview Plus" switch so the locked version can be tried without any payment.
 */
export type Plan = 'free' | 'plus';
export type Tier = 'free' | 'plus';

export type GatedFeature = 'charts' | 'prices' | 'recommendations' | 'aiDishes' | 'cameraWorkout' | 'insights';

export const FEATURE_TIERS: Record<GatedFeature, Tier> = {
  charts: 'free',
  prices: 'free',
  recommendations: 'free',
  aiDishes: 'free',
  cameraWorkout: 'free',
  insights: 'free',
};

/** Plain names and one-line promises for the Upgrade screen (placeholder copy; to be written with the real offer). */
export const FEATURE_INFO: Record<GatedFeature, { name: string; blurb: string }> = {
  charts: { name: 'Charts and streaks', blurb: 'Week, month and 3-month charts of what you eat, drink and do.' },
  prices: { name: 'Ingredient price trends', blurb: 'See which ingredients are cheaper or dearer than usual.' },
  recommendations: { name: 'What should I eat?', blurb: 'Tasty picks that fit the rest of your day, plus a workout.' },
  aiDishes: { name: 'Create your own dish', blurb: 'Describe any dish and get a full recipe and cooking steps.' },
  cameraWorkout: { name: 'Camera workout mode', blurb: 'Count reps and record clips of your form.' },
  insights: { name: 'Weekly nutrition insights', blurb: 'Your vitamin and mineral gaps, with tasty ways to close them.' },
};

export const ALL_GATED = Object.keys(FEATURE_TIERS) as GatedFeature[];

/** True when the plan may use the feature. A feature is open to everyone unless its tier is 'plus'. */
export function entitled(feature: GatedFeature, plan: Plan, tiers: Record<GatedFeature, Tier> = FEATURE_TIERS): boolean {
  return tiers[feature] !== 'plus' || plan === 'plus';
}

export const lockedFeatures = (plan: Plan, tiers: Record<GatedFeature, Tier> = FEATURE_TIERS): GatedFeature[] => ALL_GATED.filter((f) => !entitled(f, plan, tiers));
export const hasPaidFeatures = (tiers: Record<GatedFeature, Tier> = FEATURE_TIERS): boolean => ALL_GATED.some((f) => tiers[f] === 'plus');

/** The device-only switch that stands in for a purchase until payments exist. */
export const PLUS_PREVIEW_TOGGLE = 'plusPreview';
export const planFromToggles = (toggles: Record<string, boolean> | undefined): Plan => (toggles?.[PLUS_PREVIEW_TOGGLE] ? 'plus' : 'free');
