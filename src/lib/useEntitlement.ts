import { entitled, planFromToggles, type GatedFeature } from '../config/entitlements';
import { useStore } from './store';

/** Whether this person may use a feature right now (flag tiers plus the preview switch). */
export function useEntitled(feature: GatedFeature): boolean {
  const { settings } = useStore();
  return entitled(feature, planFromToggles(settings.featureToggles));
}
